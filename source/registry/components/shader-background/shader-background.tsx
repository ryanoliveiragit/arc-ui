"use client";

import { useEffect, useRef, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import styles from "./shader-background.module.css";

/**
 * An animated backdrop: a slow, flowing noise field drawn on a WebGL canvas and tinted with the accent color. It reads its colors
 * from the design tokens (and follows theme and accent changes), stops drawing while it is off screen or the tab is hidden,
 * holds one still frame under reduced motion, and leaves a flat surface when WebGL is not available.
 */
export interface ShaderBackgroundProps extends HTMLAttributes<HTMLDivElement> {
  /** Flow speed multiplier. 1 is a calm drift; 0 freezes the field. */
  speed?: number;
  /** Zoom of the noise field. Larger values show finer, busier detail. */
  scale?: number;
  /** How strongly the accent tints the field, from 0 (barely there) to 1. */
  intensity?: number;
  /** Holds the current frame. The field resumes from the same place. */
  paused?: boolean;
  /** Render resolution as a fraction of the display pixels, from 0.25 to 1. The field is soft, so a lower value costs less and rarely shows. */
  quality?: number;
  /** Content shown above the field. */
  children?: ReactNode;
  /** Extra class for the root element. */
  className?: string;
}

const VERTEX = `
attribute vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
`;

/**
 * Value noise summed over five octaves, then warped twice by itself. The warp is what makes the field look like slow liquid
 * instead of clouds. The result picks between the page background, a soft neutral and the accent.
 */
const FRAGMENT = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_scale;
uniform float u_intensity;
uniform vec3 u_base;
uniform vec3 u_soft;
uniform vec3 u_tint;

float hash(vec2 p) {
  p = fract(p * vec2(127.31, 311.73));
  p += dot(p, p + 34.17);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 cell = floor(p);
  vec2 f = fract(p);
  vec2 s = f * f * (3.0 - 2.0 * f);
  float a = hash(cell);
  float b = hash(cell + vec2(1.0, 0.0));
  float c = hash(cell + vec2(0.0, 1.0));
  float d = hash(cell + vec2(1.0, 1.0));
  return mix(mix(a, b, s.x), mix(c, d, s.x), s.y);
}

float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  mat2 turn = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    sum += amp * noise(p);
    p = turn * p;
    amp *= 0.5;
  }
  return sum;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  vec2 p = uv * 1.35 * u_scale;
  float t = u_time * 0.05;

  vec2 first = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t));
  vec2 second = vec2(fbm(p + 3.2 * first + vec2(1.7, 9.2) + 1.4 * t), fbm(p + 3.2 * first + vec2(8.3, 2.8) - 1.1 * t));
  float field = fbm(p + 2.6 * second);

  // Broad pools of the soft neutral, with the accent gathering where the warped field peaks.
  float pool = smoothstep(0.15, 0.95, length(second));
  float glow = smoothstep(0.42, 0.82, field);
  // A thin bright seam along one contour of the field gives the flow an edge to follow.
  float seam = pow(1.0 - abs(2.0 * smoothstep(0.3, 0.7, field) - 1.0), 6.0);

  vec3 color = mix(u_base, u_soft, pool * 0.85);
  color = mix(color, u_tint, clamp((glow * 0.62 + seam * 0.5) * u_intensity, 0.0, 1.0));
  // A whisper of grain hides banding in the long ramps. It uses its own irregular hash, so no pattern shows at pixel scale.
  float grain = fract(sin(dot(gl_FragCoord.xy + fract(u_time) * 17.0, vec2(12.9898, 78.233))) * 43758.5453);
  color += (grain - 0.5) * 0.008;
  gl_FragColor = vec4(color, 1.0);
}
`;

type Rgb = [number, number, number];
interface Palette { base: Rgb; soft: Rgb; tint: Rgb; }

/** Under reduced motion the field holds this moment, which shows a balanced frame. */
const STILL_TIME = 42;

/** Resolves color tokens on the element into 0 to 1 RGB. A 2D canvas does the parsing, so any CSS color syntax works. */
function readPalette(element: HTMLElement): Palette | null {
  const context = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!context) return null;
  const probe = document.createElement("span");
  probe.style.cssText = "position:absolute;visibility:hidden;pointer-events:none";
  element.appendChild(probe);
  const resolve = (token: string): Rgb => {
    probe.style.color = `var(${token})`;
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = getComputedStyle(probe).color;
    context.fillRect(0, 0, 1, 1);
    const [r = 0, g = 0, b = 0] = context.getImageData(0, 0, 1, 1).data;
    return [r / 255, g / 255, b / 255];
  };
  const palette: Palette = { base: resolve("--background"), soft: resolve("--surface-muted"), tint: resolve("--accent") };
  probe.remove();
  return palette;
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
}

export function ShaderBackground({ speed = 1, scale = 1, intensity = 0.7, paused = false, quality = 0.75, children, className, ...props }: ShaderBackgroundProps) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduced = !!useReducedMotion();
  /** "flat" means WebGL is missing or failed, so only the CSS surface shows. */
  const [state, setState] = useState<"pending" | "ready" | "flat">("pending");
  /** Bumped when a lost WebGL context comes back, to build everything again. */
  const [epoch, setEpoch] = useState(0);
  // Live settings sit in a ref, so changing a prop never rebuilds the GL program.
  const settings = useRef({ speed, scale, intensity, paused, reduced, quality });
  settings.current = { speed, scale, intensity, paused, reduced, quality };
  const controls = useRef<{ sync: () => void; resize: () => void } | null>(null);

  useEffect(() => {
    const host = root.current, surface = canvas.current;
    if (!host || !surface) return;
    const gl = surface.getContext("webgl", { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power" });
    const vertex = gl ? compile(gl, gl.VERTEX_SHADER, VERTEX) : null;
    const fragment = gl ? compile(gl, gl.FRAGMENT_SHADER, FRAGMENT) : null;
    const program = gl ? gl.createProgram() : null;
    if (!gl || !vertex || !fragment || !program) { setState("flat"); return; }
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { setState("flat"); return; }
    gl.useProgram(program);
    // One triangle that covers the whole clip space.
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const uniform = (name: string) => gl.getUniformLocation(program, name);
    const locations = { resolution: uniform("u_resolution"), time: uniform("u_time"), scale: uniform("u_scale"), intensity: uniform("u_intensity"), base: uniform("u_base"), soft: uniform("u_soft"), tint: uniform("u_tint") };

    let palette = readPalette(host);
    let frame = 0, last = 0, time = STILL_TIME, visible = true, lost = false, painted = false;

    const draw = () => {
      if (lost || !palette) return;
      const current = settings.current;
      gl.viewport(0, 0, surface.width, surface.height);
      gl.uniform2f(locations.resolution, surface.width, surface.height);
      gl.uniform1f(locations.time, time);
      gl.uniform1f(locations.scale, Math.max(current.scale, 0.05));
      gl.uniform1f(locations.intensity, Math.min(Math.max(current.intensity, 0), 1));
      gl.uniform3fv(locations.base, palette.base);
      gl.uniform3fv(locations.soft, palette.soft);
      gl.uniform3fv(locations.tint, palette.tint);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!painted) { painted = true; setState("ready"); }
    };
    const running = () => visible && !lost && !settings.current.paused && !settings.current.reduced && settings.current.speed !== 0 && document.visibilityState === "visible";
    const tick = (now: number) => {
      frame = 0;
      // A long gap (a background tab, a debugger) must not make the field jump.
      const delta = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      time += delta * settings.current.speed;
      draw();
      if (running()) frame = requestAnimationFrame(tick);
    };
    /** Starts or stops the loop to match visibility, props and the motion preference. A stopped field still redraws once. */
    const sync = () => {
      if (running()) { if (!frame) { last = 0; frame = requestAnimationFrame(tick); } return; }
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      draw();
    };
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2) * Math.min(Math.max(settings.current.quality, 0.25), 1);
      const width = Math.max(1, Math.round(host.clientWidth * ratio)), height = Math.max(1, Math.round(host.clientHeight * ratio));
      if (surface.width !== width || surface.height !== height) { surface.width = width; surface.height = height; }
      if (!frame) draw();
    };
    const repaint = () => { palette = readPalette(host) ?? palette; if (!frame) draw(); };

    const sizeObserver = new ResizeObserver(resize);
    sizeObserver.observe(host);
    const viewObserver = new IntersectionObserver(entries => { const entry = entries[entries.length - 1]; if (!entry) return; visible = entry.isIntersecting; sync(); });
    viewObserver.observe(host);
    // Theme and accent live on <html> as attributes; a change there means new colors.
    const themeObserver = new MutationObserver(repaint);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-accent", "class", "style"] });
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    scheme.addEventListener("change", repaint);
    document.addEventListener("visibilitychange", sync);
    const onLost = (event: Event) => { event.preventDefault(); lost = true; if (frame) cancelAnimationFrame(frame); frame = 0; setState("flat"); };
    const onRestored = () => setEpoch(value => value + 1);
    surface.addEventListener("webglcontextlost", onLost);
    surface.addEventListener("webglcontextrestored", onRestored);

    controls.current = { sync, resize };
    resize();
    sync();

    return () => {
      controls.current = null;
      if (frame) cancelAnimationFrame(frame);
      sizeObserver.disconnect();
      viewObserver.disconnect();
      themeObserver.disconnect();
      scheme.removeEventListener("change", repaint);
      document.removeEventListener("visibilitychange", sync);
      surface.removeEventListener("webglcontextlost", onLost);
      surface.removeEventListener("webglcontextrestored", onRestored);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    };
  }, [epoch]);

  // Props that start, stop or restyle the field apply to the running loop without a rebuild.
  useEffect(() => { controls.current?.sync(); }, [paused, reduced, speed, scale, intensity]);
  useEffect(() => { controls.current?.resize(); }, [quality]);

  return (
    <div {...props} ref={root} className={[styles.root, className].filter(Boolean).join(" ")} data-state={state}>
      <canvas ref={canvas} className={styles.canvas} aria-hidden="true" />
      {children === undefined || children === null ? null : <div className={styles.content}>{children}</div>}
    </div>
  );
}

export default ShaderBackground;
