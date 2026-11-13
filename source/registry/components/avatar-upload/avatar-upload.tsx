"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { DragEvent as ReactDragEvent, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { Camera, Check, CircleAlert, Minus, Plus } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import styles from "./avatar-upload.module.css";

/** Reasons a chosen file can be rejected before it reaches the uploader. */
export type AvatarUploadErrorCode = "type" | "size" | "decode" | "upload";

export interface AvatarUploadError {
  code: AvatarUploadErrorCode;
  /** The message the component is showing, so a host can mirror it elsewhere. */
  message: string;
}

export interface AvatarUploadHandle {
  /** Opens the native file picker. */
  open(): void;
  /** Validates and takes a file the same way a picked one is treated (type, size, decode). */
  selectFile(file: File): void;
}

export interface AvatarUploadProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onError" | "onUpload" | "onChange"> {
  /** The person's name; its initials stand in when there is no photo. */
  name: string;
  /** Current photo. Omit (or pass null) to start with initials. */
  src?: string | null;
  /**
   * Uploads the cropped result (PNG stays PNG, everything else exports as JPEG). Resolving with a URL makes it the new
   * photo; resolving void uses the exported image itself. Rejecting lands on the retry state, aborting via `signal`
   * cancels silently back to the previous photo.
   */
  onUpload?: (
    image: Blob,
    options: { report: (progress: number) => void; signal: AbortSignal; original: File },
  ) => Promise<string | void>;
  /** Removes the photo. Without it, the Remove action is hidden. */
  onRemove?: () => void;
  /** Reports a failure along with the message the component shows. */
  onError?: (error: AvatarUploadError) => void;
  /** Accepted media types. Default: PNG, JPEG and WebP. */
  accept?: readonly string[];
  /** Maximum file size in bytes. Default: 5 MB (5,000,000). */
  maxSize?: number;
  /** Idle avatar diameter in px. Default: 88. */
  size?: number;
  /** Square pixel size of the exported crop. Default: 512. */
  outputSize?: number;
  /** Heading beside the avatar. Default: "Profile photo". */
  label?: string;
  /** Quiet hint under the heading. Default: "PNG, JPG or WebP, up to 5 MB". */
  hint?: string;
  /** Ignores the picker, drops and the actions. */
  disabled?: boolean;
}

interface Pending {
  file: File;
  /** Object URL kept alive for the crop preview; revoked when the candidate is cleared. */
  url: string;
  img: HTMLImageElement;
  width: number;
  height: number;
}

interface Message {
  tone: "hint" | "error" | "success";
  text: string;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const readBytes = (value: number, max = 1000 * 1024 * 1024) => {
  const buffer = new ArrayBuffer(Math.min(value, max));
  const view = new DataView(buffer);
  let seed = 0x9e3779b9;
  for (let i = 0; i < value; i += 512) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    view.setUint32(i, seed, true);
  }
  return buffer;
};

/** Upper-cased extension, or the mime subtype when the file has none, for the error sentence. */
const typeLabel = (file: File) => {
  const dot = file.name.lastIndexOf(".");
  const ext = dot > -1 && dot < file.name.length - 1 ? file.name.slice(dot + 1) : "";
  if (ext) return ext.toUpperCase();
  const sub = file.type.split("/")[1];
  return sub ? sub.replace(/[-_]/g, " ").toUpperCase() : "THE FILE";
};

/** Decimal megabytes with one digit, "12.4", "5". */
const megabytes = (bytes: number) => {
  const rounded = Math.round((bytes / 1e6) * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
};

/**
 * Click or drop a photo onto the avatar to crop it in place with drag, pinch and zoom. It uploads through a progress
 * ring and settles, with clear errors and retry.
 *
 * Phases: idle -> crop -> uploading -> (idle with the new photo | failed with retry/discard). A removed avatar shows
 * its initials. The crop drags with a rubber band past its bounds, zooms toward the pointer, and exports a circular
 * 512 px image (PNG for PNG input, JPEG q92 otherwise).
 */
export const AvatarUpload = forwardRef<AvatarUploadHandle, AvatarUploadProps>(function AvatarUpload(props, ref) {
  const {
    name,
    src,
    onUpload,
    onRemove,
    onError,
    accept = ["image/png", "image/jpeg", "image/webp"],
    maxSize = 5 * 1e6,
    size = 88,
    outputSize = 512,
    label = "Profile photo",
    hint = "PNG, JPG or WebP, up to 5 MB",
    disabled,
    ...rest
  } = props;

  const reduced = useReducedMotion() ?? false;
  const titleId = useId();

  const [photo, setPhoto] = useState<string | null>(src ?? null);
  const [removed, setRemoved] = useState(src == null);
  const [phase, setPhase] = useState<"idle" | "crop" | "uploading" | "failed">("idle");
  const [message, setMessage] = useState<Message | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [failAt, setFailAt] = useState(0);
  const [settling, setSettling] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [dragOver, setDragOver] = useState(false);
  const [announce, setAnnounce] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const hitRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const pendingRef = useRef<Pending | null>(null);
  const cropOutRef = useRef<{ blob: Blob; file: File } | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const ownedUrlsRef = useRef<Set<string>>(new Set());
  const settleTimerRef = useRef<number | null>(null);

  /** Crop circle diameter when the adjustment is open (a bit above double the idle size, like the reference). */
  const circle = size * 2 + 8;
  /** Square backdrop box behind the crop circle. */
  const stageBox = circle + 64;

  const photoUrlRef = useRef(photo);
  photoUrlRef.current = photo;
  const progressRef = useRef<number | null>(null);
  progressRef.current = progress;
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;

  useEffect(() => {
    setPhoto(src ?? null);
    if (src != null) setRemoved(false);
  }, [src]);

  useEffect(() => {
    const owned = ownedUrlsRef.current;
    const settleTimer = settleTimerRef;
    return () => {
      owned.forEach(url => URL.revokeObjectURL(url));
      owned.clear();
      if (pendingRef.current) URL.revokeObjectURL(pendingRef.current.url);
      if (settleTimer.current != null) window.clearTimeout(settleTimer.current);
    };
  }, []);

  // The crop opens as one unit: the avatar circle grows over the square backdrop.
  const circlePx = useMotionValue(size);
  const boxPx = useMotionValue(size);
  const cropOpen = phase === "crop";
  useEffect(() => {
    const options = reduced ? { duration: 0 } : motionTokens.spring.smooth;
    const controls = [
      animate(circlePx, cropOpen ? circle : size, options),
      animate(boxPx, cropOpen ? stageBox : size, options),
    ];
    return () => controls.forEach(control => control.stop());
  }, [cropOpen, circle, stageBox, size, reduced, circlePx, boxPx]);

  // Row height: idle follows whatever the side content measures; the open crop pins it to the stage box, so the
  // growing backdrop never gets clipped. A ResizeObserver catches the idle height even mid-animation.
  const rowPx = useMotionValue(size);
  const [idleH, setIdleH] = useState<number | null>(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry || phaseRef.current === "crop") return;
      const h = Math.round(entry.target.getBoundingClientRect().height);
      if (h > 0) setIdleH(previous => (previous === h ? previous : h));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const rowGoal = cropOpen ? stageBox : idleH ?? size;
  useEffect(() => {
    const controls = reduced ? animate(rowPx, rowGoal, { duration: 0 }) : animate(rowPx, rowGoal, motionTokens.spring.smooth);
    return () => controls.stop();
  }, [rowGoal, reduced, rowPx]);

  // Crop transform state: offsets are motion values so drags stay smooth; zoom is state for the label and inputs.
  const ox = useMotionValue(0);
  const oy = useMotionValue(0);
  const oz = useMotionValue(1);
  useEffect(() => { oz.set(zoom); }, [zoom, oz]);
  const imgTransform = useTransform([ox, oy, oz], (latest: readonly number[]) => {
    const x = latest[0] ?? 0;
    const y = latest[1] ?? 0;
    const z = latest[2] ?? 1;
    return `translate(-50%, -50%) translate(${x.toFixed(3)}%, ${y.toFixed(3)}%) scale(${z.toFixed(4)})`;
  });
  const raw = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchBase = useRef<number | null>(null);

  /** How far the image center may travel (in % of the circle) before it would uncover the crop. */
  const bounds = useCallback((z: number) => {
    const p = pendingRef.current;
    if (!p || p.width === 0 || p.height === 0) return { mx: 0, my: 0 };
    const cover = Math.max(circle / p.width, circle / p.height);
    return {
      mx: Math.max(0, ((p.width * cover * z - circle) / 2 / circle) * 100),
      my: Math.max(0, ((p.height * cover * z - circle) / 2 / circle) * 100),
    };
  }, [circle]);

  /** Rubber band: past the bound the movement keeps going at 35%, so the photo feels elastic. */
  const bend = (value: number, limit: number) =>
    Math.abs(value) <= limit ? value : Math.sign(value) * (limit + (Math.abs(value) - limit) * 0.35);

  const applyOffset = useCallback((x: number, y: number) => {
    ox.set(x);
    oy.set(y);
  }, [ox, oy]);

  const settleOffset = useCallback(() => {
    const { mx, my } = bounds(oz.get());
    raw.current.x = clamp(raw.current.x, -mx, mx);
    raw.current.y = clamp(raw.current.y, -my, my);
    if (reduced) {
      applyOffset(raw.current.x, raw.current.y);
      return;
    }
    animate(ox, raw.current.x, motionTokens.spring.snappy);
    animate(oy, raw.current.y, motionTokens.spring.snappy);
  }, [bounds, reduced, applyOffset, ox, oy, oz]);

  const applyZoom = useCallback((next: number, center: { x: number; y: number } = { x: 0, y: 0 }) => {
    const z0 = zoom;
    const z1 = clamp(next, 1, 4);
    if (z1 === z0) return;
    const k = z1 / z0;
    // Keep the world point under `center` stationary while the zoom scales.
    const px = (ox.get() / 100) * circle;
    const py = (oy.get() / 100) * circle;
    let nx = center.x * (1 - k) + px * k;
    let ny = center.y * (1 - k) + py * k;
    const b = bounds(z1);
    nx = clamp(nx, -b.mx, b.mx) * circle / 100;
    ny = clamp(ny, -b.my, b.my) * circle / 100;
    raw.current.x = (nx * 100) / circle;
    raw.current.y = (ny * 100) / circle;
    applyOffset(raw.current.x, raw.current.y);
    setZoom(z1);
  }, [zoom, circle, bounds, applyOffset, ox, oy]);

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join("");

  const show = useCallback((next: Message | null) => setMessage(next), []);

  const clearPending = useCallback(() => {
    const p = pendingRef.current;
    if (p) {
      URL.revokeObjectURL(p.url);
      pendingRef.current = null;
    }
    cropOutRef.current = null;
    controllerRef.current = null;
    dragging.current = false;
    pointers.current.clear();
    pinchBase.current = null;
    raw.current = { x: 0, y: 0 };
    ox.set(0);
    oy.set(0);
    setZoom(1);
  }, [ox, oy]);

  const ownerOf = (url: string) => {
    ownedUrlsRef.current.add(url);
    return url;
  };

  const fail = useCallback((code: AvatarUploadErrorCode, msg: string) => {
    show({ tone: "error", text: msg });
    onError?.({ code, message: msg });
    setAnnounce(msg);
  }, [onError, show]);

  const beginCrop = useCallback((pending: Pending) => {
    clearPending();
    pendingRef.current = pending;
    setProgress(null);
    setPhase("crop");
    setAnnounce("Adjust photo");
  }, [clearPending]);

  const selectFile = useCallback((file: File | undefined | null) => {
    if (!file || disabled) return;
    if (phase === "crop" || phase === "uploading") return;
    if (!accept.some(type => (type.endsWith("/*") ? file.type.startsWith(type.slice(0, -1)) : file.type === type))) {
      fail("type", `${typeLabel(file)} files aren\u2019t supported. Choose a PNG, JPG or WebP.`);
      return;
    }
    if (file.size > maxSize) {
      fail("size", `That photo is ${megabytes(file.size)} MB. Choose one up to ${megabytes(maxSize)} MB.`);
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth === 0 || img.naturalHeight === 0) {
        URL.revokeObjectURL(url);
        fail("decode", "That image couldn\u2019t be opened. Try another file.");
        return;
      }
      beginCrop({ file, url, img, width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      fail("decode", "That image couldn\u2019t be opened. Try another file.");
    };
    img.src = url;
  }, [accept, disabled, fail, maxSize, phase, beginCrop]);

  const exportCrop = useCallback(async (): Promise<Blob> => {
    const p = pendingRef.current;
    if (!p) throw new Error("crop");
    const z = oz.get();
    const offX = (ox.get() / 100) * circle;
    const offY = (oy.get() / 100) * circle;
    const canvas = document.createElement("canvas");
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");
    const half = outputSize / 2;
    const cover = Math.max(circle / p.width, circle / p.height);
    const dw = p.width * cover;
    const dh = p.height * cover;
    ctx.save();
    ctx.beginPath();
    ctx.arc(half, half, half, 0, Math.PI * 2);
    ctx.clip();
    if (p.file.type !== "image/png") {
      // Flatten transparent corners onto the muted backdrop instead of black.
      const rootStyles = getComputedStyle(document.documentElement);
      const backdrop = rootStyles.getPropertyValue("--surface-muted").trim() || "#fff";
      ctx.fillStyle = backdrop;
      ctx.fillRect(0, 0, outputSize, outputSize);
    }
    const f = outputSize / circle;
    const center = (circle / 2) * f;
    ctx.translate(center + offX * f, center + offY * f);
    ctx.scale(z * f, z * f);
    ctx.translate(-center, -center);
    ctx.drawImage(p.img, (circle - dw) / 2, (circle - dh) / 2, dw, dh);
    ctx.restore();
    const mime = p.file.type === "image/png" ? "image/png" : "image/jpeg";
    return new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(out => (out ? resolve(out) : reject(new Error("encode"))), mime, 0.92),
    );
  }, [circle, outputSize, ox, oy, oz]);

  const runUpload = useCallback(async (item: { blob: Blob; file: File }, signal: AbortSignal) => {
    setPhase("uploading");
    setProgress(null);
    setAnnounce("Uploading photo");
    try {
      const done = await (onUpload
        ? onUpload(item.blob, {
            report: p => setProgress(clamp(Number.isFinite(p) ? p : 0, 0, 1)),
            signal,
            original: item.file,
          })
        : new Promise<void>((resolve, reject) => {
            const started = performance.now();
            const tick = window.setInterval(() => {
              const t = (performance.now() - started) / 1200;
              setProgress(clamp(t, 0, 1));
              if (t >= 1) {
                window.clearInterval(tick);
                resolve();
              }
            }, 60);
            signal.addEventListener("abort", () => {
              window.clearInterval(tick);
              reject(new DOMException("Aborted", "AbortError"));
            }, { once: true });
          }));
      let next = photoUrlRef.current;
      if (typeof done === "string") next = done;
      else {
        next = URL.createObjectURL(item.blob);
        ownerOf(next);
      }
      if (pendingRef.current) {
        URL.revokeObjectURL(pendingRef.current.url);
        pendingRef.current = null;
      }
      cropOutRef.current = null;
      setPhoto(next);
      setRemoved(false);
      show({ tone: "success", text: "Photo updated" });
      setProgress(null);
      setPhase("idle");
      setAnnounce("Photo updated");
      if (!reduced) {
        setSettling(true);
        settleTimerRef.current = window.setTimeout(() => setSettling(false), 700);
      }
    } catch (error) {
      if (signal.aborted) {
        if (pendingRef.current) {
          URL.revokeObjectURL(pendingRef.current.url);
          pendingRef.current = null;
        }
        cropOutRef.current = null;
        setProgress(null);
        setPhase("idle");
        show(removed ? { tone: "hint", text: "Photo removed" } : { tone: "hint", text: hint });
        setAnnounce("Upload canceled");
        return;
      }
      setFailAt(progressRef.current ?? 0);
      setProgress(null);
      setPhase("failed");
      const text = "Upload failed. Your previous photo is unchanged.";
      show({ tone: "error", text });
      onError?.({ code: "upload", message: text });
      setAnnounce(text);
      void error;
    }
  }, [onUpload, reduced, removed, hint, show, onError]);

  const open = useCallback(() => {
    if (disabled) return;
    fileRef.current?.click();
  }, [disabled]);

  useImperativeHandle(ref, () => ({ open, selectFile }), [open, selectFile]);

  const cancelCrop = useCallback(() => {
    if (pendingRef.current) {
      URL.revokeObjectURL(pendingRef.current.url);
      pendingRef.current = null;
    }
    raw.current = { x: 0, y: 0 };
    ox.set(0);
    oy.set(0);
    setZoom(1);
    setProgress(null);
    setPhase("idle");
    show(removed ? { tone: "hint", text: "Photo removed" } : { tone: "hint", text: hint });
  }, [hint, removed, show, ox, oy]);

  const cancelUpload = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  const remove = useCallback(() => {
    if (!onRemove) return;
    onRemove();
    setPhoto(null);
    setRemoved(true);
    show({ tone: "hint", text: "Photo removed" });
    setAnnounce("Photo removed");
  }, [onRemove, show]);

  const saveCrop = useCallback(async () => {
    if (phase !== "crop") return;
    const p = pendingRef.current;
    if (!p) return;
    let out: Blob;
    try {
      out = await exportCrop();
    } catch {
      fail("decode", "That image couldn\u2019t be opened. Try another file.");
      return;
    }
    cropOutRef.current = { blob: out, file: p.file };
    const controller = new AbortController();
    controllerRef.current = controller;
    void runUpload({ blob: out, file: p.file }, controller.signal);
  }, [exportCrop, fail, phase, runUpload]);

  const retry = useCallback(() => {
    // Reuses the exported crop: the person keeps the framing they chose.
    const out = cropOutRef.current;
    if (!out || phase !== "failed") return;
    const controller = new AbortController();
    controllerRef.current = controller;
    void runUpload(out, controller.signal);
  }, [phase, runUpload]);

  const discard = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    if (pendingRef.current) {
      URL.revokeObjectURL(pendingRef.current.url);
      pendingRef.current = null;
    }
    cropOutRef.current = null;
    setProgress(null);
    setPhase("idle");
    show(removed ? { tone: "hint", text: "Photo removed" } : { tone: "hint", text: hint });
  }, [hint, removed, show]);

  // Focus follows the phase: into the crop area on open, back to the trigger on the way out.
  const previous = useRef(phase);
  useEffect(() => {
    const was = previous.current;
    previous.current = phase;
    if (phase === "crop") {
      const id = requestAnimationFrame(() => rootRef.current?.querySelector<HTMLElement>("[data-crop-area]")?.focus());
      return () => cancelAnimationFrame(id);
    }
    if (was === "crop" && !disabled) {
      requestAnimationFrame(() => hitRef.current?.focus());
    }
  }, [phase, disabled]);

  // Wheel zoom needs a non-passive listener so the page never scrolls under the crop.
  useEffect(() => {
    const el = stageRef.current;
    if (!cropOpen || !el) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = el.getBoundingClientRect();
      const center = {
        x: event.clientX - rect.left - rect.width / 2,
        y: event.clientY - rect.top - rect.height / 2,
      };
      applyZoom(zoomRef.current * Math.exp(-event.deltaY * 0.002), center);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [cropOpen, applyZoom]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (phase !== "crop") return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 1) {
      dragging.current = true;
      pinchBase.current = null;
    } else if (pointers.current.size === 2) {
      dragging.current = false;
      const [a, b] = [...pointers.current.values()];
      if (a && b) pinchBase.current = Math.hypot(a.x - b.x, a.y - b.y);
    }
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (phase !== "crop" || !pointers.current.has(event.pointerId)) return;
    const point = { x: event.clientX, y: event.clientY };
    const prev = pointers.current.get(event.pointerId);
    pointers.current.set(event.pointerId, point);
    if (pointers.current.size === 1 && dragging.current && prev) {
      const b = bounds(zoom);
      raw.current.x += (point.x - prev.x) / circle * 100;
      raw.current.y += (point.y - prev.y) / circle * 100;
      applyOffset(bend(raw.current.x, b.mx), bend(raw.current.y, b.my));
    } else if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      if (!a || !b) return;
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const rect = event.currentTarget.getBoundingClientRect();
      const center = { x: mid.x - rect.left - rect.width / 2, y: mid.y - rect.top - rect.height / 2 };
      if (pinchBase.current != null && dist > 0) {
        applyZoom(zoom * (dist / pinchBase.current), center);
        raw.current.x += (mid.x - (prev?.x ?? mid.x)) / circle * 100;
        raw.current.y += (mid.y - (prev?.y ?? mid.y)) / circle * 100;
        const nb = bounds(zoomRef.current);
        raw.current.x = clamp(raw.current.x, -nb.mx, nb.mx);
        raw.current.y = clamp(raw.current.y, -nb.my, nb.my);
        applyOffset(raw.current.x, raw.current.y);
      }
      pinchBase.current = dist;
    }
  };

  const onPointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.delete(event.pointerId);
    if (pointers.current.size === 0) {
      dragging.current = false;
      if (phase === "crop") settleOffset();
    } else if (pointers.current.size === 1) {
      dragging.current = true;
      pinchBase.current = null;
    }
  };

  const onCircleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (phase !== "crop") return;
    const step = event.shiftKey ? 10 : 2;
    const b = bounds(zoom);
    const handled = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "+", "=", "-", "_", "0", "Enter", "Escape"];
    if (!handled.includes(event.key)) return;
    event.preventDefault();
    switch (event.key) {
      case "ArrowLeft": raw.current.x = clamp(raw.current.x - step, -b.mx, b.mx); break;
      case "ArrowRight": raw.current.x = clamp(raw.current.x + step, -b.mx, b.mx); break;
      case "ArrowUp": raw.current.y = clamp(raw.current.y - step, -b.my, b.my); break;
      case "ArrowDown": raw.current.y = clamp(raw.current.y + step, -b.my, b.my); break;
      case "+": case "=": applyZoom(zoom + 0.25); return;
      case "-": case "_": applyZoom(zoom - 0.25); return;
      case "0":
        raw.current = { x: 0, y: 0 };
        setZoom(1);
        break;
      case "Enter":
        settleOffset();
        void saveCrop();
        return;
      case "Escape":
        cancelCrop();
        return;
      default:
        return;
    }
    applyOffset(raw.current.x, raw.current.y);
  };

  const onDragOver = (event: ReactDragEvent<HTMLDivElement>) => {
    if (phase !== "idle" || disabled) return;
    if (!event.dataTransfer.types.includes("Files")) return;
    event.preventDefault();
    setDragOver(true);
  };

  const onDrop = (event: ReactDragEvent<HTMLDivElement>) => {
    if (phase !== "idle" || disabled) return;
    event.preventDefault();
    setDragOver(false);
    selectFile(event.dataTransfer.files?.[0]);
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    selectFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const busy = phase === "uploading";
  const failed = phase === "failed";
  const hasPhoto = photo != null;
  const idleMessage: Message = message ?? (removed ? { tone: "hint", text: "Photo removed" } : { tone: "hint", text: hint });
  const mainMessage: Message = busy
    ? { tone: "hint", text: `Uploading ${Math.round((progress ?? 0) * 100)}%` }
    : failed
      ? { tone: "error", text: "Upload failed. Your previous photo is unchanged." }
      : idleMessage;

  const ringState = failed
    ? "failed"
    : busy
      ? (progress == null ? "spinning" : "progress")
      : settling
        ? "settled"
        : null;
  const ringProgress = failed ? failAt : progress ?? 0;

  const fade = reduced
    ? undefined
    : {
        initial: { opacity: 0, filter: "blur(4px)", y: 3 },
        animate: { opacity: 1, filter: "blur(0px)", y: 0 },
        exit: { opacity: 0, filter: "blur(4px)", y: 0 },
        transition: { duration: motionTokens.duration.standard, ease: motionTokens.ease.enter },
      };

  return (
    <div
      {...rest}
      ref={rootRef}
      className={styles.root}
      role="group"
      aria-labelledby={titleId}
      data-phase={phase}
    >
      <input
        ref={fileRef}
        className={styles.file}
        type="file"
        accept={accept.join(",")}
        tabIndex={-1}
        aria-hidden="true"
        disabled={disabled}
        onChange={onFileChange}
      />
      <motion.div className={styles.autoHeight} style={{ height: rowPx }}>
        <div ref={wrapRef} className={styles.layoutWrap}>
          <div className={styles.layout} data-mode={phase === "crop" ? "crop" : "idle"}>
            <motion.div
              ref={stageRef}
              className={`${styles.stage}${dragOver ? ` ${styles.dragging}` : ""}`}
              style={{ width: boxPx, height: boxPx }}
              onDragOver={onDragOver}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
            >
              <motion.div
                className={styles.backdrop}
                aria-hidden="true"
                animate={{ opacity: cropOpen ? 1 : 0 }}
                transition={reduced ? { duration: 0 } : { duration: motionTokens.duration.standard, ease: motionTokens.ease.enter }}
              />
              <motion.div
                className={styles.circle}
                style={{ width: circlePx, height: circlePx }}
                data-crop-area={cropOpen || undefined}
                tabIndex={cropOpen ? 0 : -1}
                role={cropOpen ? "group" : undefined}
                aria-roledescription={cropOpen ? "crop area" : undefined}
                aria-label={cropOpen
                  ? `Crop area, zoom ${Math.round(zoom * 100)}%. Drag or use the arrow keys to move the photo, plus and minus to zoom, Enter to save, Escape to cancel.`
                  : undefined}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerEnd}
                onPointerCancel={onPointerEnd}
                onKeyDown={onCircleKeyDown}
              >
                {cropOpen && pendingRef.current ? (
                  <>
                    <motion.img className={styles.ghost} src={pendingRef.current.url} alt="" draggable={false} style={{ transform: imgTransform }} />
                    <div className={styles.clip}>
                      <motion.img className={styles.cropImage} src={pendingRef.current.url} alt="" draggable={false} style={{ transform: imgTransform }} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.clip}>
                      {hasPhoto ? (
                        <img className={styles.photo} src={photo} alt="" draggable={false} />
                      ) : (
                        <span className={styles.initials} aria-hidden="true">{initials}</span>
                      )}
                    </div>
                    {!busy && !failed && (
                      <button
                        ref={hitRef}
                        type="button"
                        className={styles.hit}
                        aria-label={hasPhoto ? "Change profile photo" : "Upload profile photo"}
                        disabled={disabled}
                        onClick={open}
                      >
                        <span className={styles.hitIcon} aria-hidden="true">
                          <Camera size={20} strokeWidth={1.75} />
                        </span>
                      </button>
                    )}
                  </>
                )}
                {ringState && (
                  <svg className={styles.ring} data-state={ringState} viewBox="0 0 100 100" aria-hidden="true">
                    <circle className={styles.ringTrack} cx="50" cy="50" r="49" pathLength={1} />
                    <circle
                      className={styles.ringValue}
                      cx="50"
                      cy="50"
                      r="49"
                      pathLength={1}
                      strokeDasharray={ringState === "progress" || ringState === "failed" ? `${ringProgress.toFixed(6)} 1` : undefined}
                      strokeDashoffset={0}
                    />
                  </svg>
                )}
              </motion.div>
            </motion.div>

            <div className={styles.side}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={phase} className={styles.sideContent} {...fade}>
                  {phase === "crop" ? (
                    <>
                      <p id={titleId} className={styles.title}>Adjust photo</p>
                      <p className={styles.hint}>Drag to reposition. Scroll or pinch to zoom.</p>
                      <div className={styles.zoom}>
                        <button
                          type="button"
                          className={styles.zoomButton}
                          aria-label="Zoom out"
                          disabled={zoom <= 1.001}
                          onClick={() => applyZoom(zoom - 0.25)}
                        >
                          <Minus size={16} strokeWidth={1.75} aria-hidden="true" />
                        </button>
                        <input
                          className={styles.range}
                          type="range"
                          min={1}
                          max={4}
                          step={0.01}
                          value={zoom}
                          aria-label="Zoom"
                          aria-valuetext={`${Math.round(zoom * 100)}%`}
                          style={{ "--fill": `${(((zoom - 1) / 3) * 100).toFixed(1)}%` } as React.CSSProperties}
                          onChange={event => applyZoom(Number(event.target.value))}
                        />
                        <button
                          type="button"
                          className={styles.zoomButton}
                          aria-label="Zoom in"
                          disabled={zoom >= 3.999}
                          onClick={() => applyZoom(zoom + 0.25)}
                        >
                          <Plus size={16} strokeWidth={1.75} aria-hidden="true" />
                        </button>
                      </div>
                      <div className={styles.actions}>
                        <button type="button" className={styles.solid} onClick={saveCrop}>Save photo</button>
                        <button type="button" className={styles.ghostButton} onClick={cancelCrop}>Cancel</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p id={titleId} className={styles.title}>{label}</p>
                      <div className={styles.message} aria-live="polite">
                        <p className={styles.messageText} data-tone={mainMessage.tone}>
                          {mainMessage.tone === "error" ? (
                            <CircleAlert size={14} strokeWidth={1.75} aria-hidden="true" />
                          ) : mainMessage.tone === "success" ? (
                            <Check size={14} strokeWidth={2} aria-hidden="true" />
                          ) : null}
                          <span>{mainMessage.text}</span>
                        </p>
                      </div>
                      <div className={styles.actions}>
                        {busy ? (
                          <button type="button" className={styles.outline} onClick={cancelUpload}>Cancel upload</button>
                        ) : failed ? (
                          <>
                            <button type="button" className={styles.tryAgain} onClick={retry}>Try again</button>
                            <button type="button" className={styles.ghostButton} onClick={discard}>Discard</button>
                          </>
                        ) : (
                          <>
                            <button type="button" className={styles.outline} disabled={disabled} onClick={open}>
                              <span className={styles.stack}>
                                <span className={styles.sizer} aria-hidden="true">Upload photo</span>
                                <span className={styles.sizer} aria-hidden="true">Replace photo</span>
                                <span>{hasPhoto ? "Replace photo" : "Upload photo"}</span>
                              </span>
                            </button>
                            {!busy && !failed && onRemove && (
                              <motion.button
                                type="button"
                                className={styles.ghostButton}
                                {...(fade ? { initial: fade.initial, exit: fade.exit, transition: fade.transition } : undefined)}
                                onClick={remove}
                              >
                                Remove
                              </motion.button>
                            )}
                          </>
                        )}
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
      <span className={styles.srOnly} role="status" aria-live="polite">{announce}</span>
    </div>
  );
});

export default AvatarUpload;

// Kept for demo helpers that want to build oversized files without pulling a dependency.
export { readBytes };
