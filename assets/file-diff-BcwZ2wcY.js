import{D as e,k as t,v as n}from"./index-srcergeS.js";import{n as r,t as i}from"./react-CsJyYffv.js";import{t as a}from"./chevron-down-DDnG0UVW.js";import{t as o}from"./file-code-MVrq_2fB.js";import{t as s}from"./createLucideIcon-B5tGJsOP.js";import{t as c}from"./AnimatePresence-CwgpUUut.js";import{t as l}from"./motion-tokens-ey_cgeqd.js";import{t as u}from"./segmented-control-B9CupPSx.js";import{a as d,t as f}from"./_kit-CRsdZUVN.js";var p={name:`fold-vertical`,size:24,node:[[`path`,{d:`M12 22v-6`,key:`6o8u61`}],[`path`,{d:`M12 8V2`,key:`1wkif3`}],[`path`,{d:`M4 12H2`,key:`rhcxmi`}],[`path`,{d:`M10 12H8`,key:`s88cx1`}],[`path`,{d:`M16 12h-2`,key:`10asgb`}],[`path`,{d:`M22 12h-2`,key:`14jgyd`}],[`path`,{d:`m15 19-3-3-3 3`,key:`e37ymu`}],[`path`,{d:`m15 5-3 3-3-3`,key:`19d6lf`}]]};p.node;var m=s(p),h={name:`unfold-vertical`,size:24,node:[[`path`,{d:`M12 22v-6`,key:`6o8u61`}],[`path`,{d:`M12 8V2`,key:`1wkif3`}],[`path`,{d:`M4 12H2`,key:`rhcxmi`}],[`path`,{d:`M10 12H8`,key:`s88cx1`}],[`path`,{d:`M16 12h-2`,key:`10asgb`}],[`path`,{d:`M22 12h-2`,key:`14jgyd`}],[`path`,{d:`m15 19-3 3-3-3`,key:`11eu04`}],[`path`,{d:`m15 5-3-3-3 3`,key:`itvq4r`}]]};h.node;var g=s(h),_=t(e(),1),v={root:`_root_1i870_1`,header:`_header_1i870_3`,fileIcon:`_fileIcon_1i870_5`,names:`_names_1i870_6`,path:`_path_1i870_8`,directory:`_directory_1i870_9`,basename:`_basename_1i870_10`,previous:`_previous_1i870_11`,status:`_status_1i870_12`,stats:`_stats_1i870_14`,added:`_added_1i870_15`,removed:`_removed_1i870_16`,blocks:`_blocks_1i870_17`,block:`_block_1i870_17`,"block-in":`_block-in_1i870_1`,iconButton:`_iconButton_1i870_23`,chevron:`_chevron_1i870_26`,collapse:`_collapse_1i870_31`,scroller:`_scroller_1i870_32`,lines:`_lines_1i870_33`,row:`_row_1i870_36`,"row-in":`_row-in_1i870_1`,gutter:`_gutter_1i870_39`,no:`_no_1i870_40`,sign:`_sign_1i870_42`,code:`_code_1i870_45`,mark:`_mark_1i870_47`,fold:`_fold_1i870_51`,foldLabel:`_foldLabel_1i870_53`,foldRange:`_foldRange_1i870_54`,unfolded:`_unfolded_1i870_56`,empty:`_empty_1i870_57`,srOnly:`_srOnly_1i870_58`},y=n(),b=32,x=24,S=e=>e===``?[]:e.replace(/\r\n?/g,`
`).replace(/\n$/,``).split(`
`);function C(e,t){let n=0;for(;n<e.length&&n<t.length&&e[n]===t[n];)n++;let r=0;for(;r<e.length-n&&r<t.length-n&&e[e.length-1-r]===t[t.length-1-r];)r++;let i=e.slice(n,e.length-r),a=t.slice(n,t.length-r),o=a.length+1,s=new Uint32Array((i.length+1)*o);for(let e=i.length-1;e>=0;e--)for(let t=a.length-1;t>=0;t--)s[e*o+t]=i[e]===a[t]?s[(e+1)*o+t+1]+1:Math.max(s[(e+1)*o+t],s[e*o+t+1]);let c=[],l=1,u=1,d=e=>c.push({type:`same`,text:e,oldNo:l++,newNo:u++});for(let t=0;t<n;t++)d(e[t]);let f=0,p=0;for(;f<i.length||p<a.length;)f<i.length&&p<a.length&&i[f]===a[p]?(d(i[f]),f++,p++):f<i.length&&(p>=a.length||s[(f+1)*o+p]>=s[f*o+p+1])?(c.push({type:`remove`,text:i[f],oldNo:l++}),f++):(c.push({type:`add`,text:a[p],newNo:u++}),p++);for(let t=e.length-r;t<e.length;t++)d(e[t]);return c}function w(e){let t=e.map(e=>({...e})),n=0;for(;n<t.length;){if(t[n].type!==`remove`){n++;continue}let e=n;for(;e<t.length&&t[e].type===`remove`;)e++;let r=e;for(;r<t.length&&t[r].type===`add`;)r++;if(e-n===r-e)for(let r=0;r<e-n;r++){let i=t[n+r],a=t[e+r],o=0;for(;o<i.text.length&&o<a.text.length&&i.text[o]===a.text[o];)o++;let s=0;for(;s<i.text.length-o&&s<a.text.length-o&&i.text[i.text.length-1-s]===a.text[a.text.length-1-s];)s++;let c=o+s;c<Math.max(i.text.length,a.text.length)*.4||(i.text.length-c>0&&(i.mark=[o,i.text.length-s]),a.text.length-c>0&&(a.mark=[o,a.text.length-s]))}n=r}return t}function T(e,t){let n=[],r=[],i=()=>{r.length&&(n.push({kind:`lines`,key:`l${n.length}`,lines:r}),r=[])},a=0;for(;a<e.length;){if(e[a].type!==`same`){r.push(e[a]),a++;continue}let o=a;for(;o<e.length&&e[o].type===`same`;)o++;let s=e.slice(a,o),c=a===0?0:t,l=o===e.length?0:t;s.length-c-l>=2?(r.push(...s.slice(0,c)),i(),n.push({kind:`fold`,key:`f${s[c].oldNo}`,lines:s.slice(c,s.length-l)}),r.push(...s.slice(s.length-l))):r.push(...s),a=o}return i(),n}function E({line:e,index:t}){let{text:n,mark:r}=e;return(0,y.jsxs)(`div`,{className:v.row,"data-type":e.type,style:{"--i":Math.min(t,x)},children:[(0,y.jsxs)(`span`,{className:v.gutter,"aria-hidden":`true`,children:[(0,y.jsx)(`span`,{className:v.no,children:e.oldNo??``}),(0,y.jsx)(`span`,{className:v.no,children:e.newNo??``}),(0,y.jsx)(`span`,{className:v.sign,children:e.type===`add`?`+`:e.type===`remove`?`−`:``})]}),e.type===`same`?null:(0,y.jsx)(`span`,{className:v.srOnly,children:e.type===`add`?`Added: `:`Removed: `}),(0,y.jsx)(`code`,{className:v.code,children:r?(0,y.jsxs)(y.Fragment,{children:[n.slice(0,r[0]),(0,y.jsx)(`span`,{className:v.mark,children:n.slice(r[0],r[1])}),n.slice(r[1])]}):n||` `})]})}function D({lines:e,focus:t,reduceMotion:n}){let r=(0,_.useRef)(null);return(0,_.useEffect)(()=>{t&&r.current?.focus({preventScroll:!0})},[t]),(0,y.jsx)(i.div,{ref:r,className:v.unfolded,tabIndex:-1,initial:!n&&{height:b,opacity:.4},animate:{height:`auto`,opacity:1},exit:n?{opacity:0,transition:{duration:0}}:{height:b,opacity:0,transition:{...l.spring.snappy}},transition:l.spring.smooth,children:e.map((e,t)=>(0,y.jsx)(E,{line:e,index:t},`${e.oldNo}`))})}function O({filename:e,previousFilename:t,before:n,after:s,context:u=3,maxHeight:d,open:f,defaultOpen:p=!0,onOpenChange:h,className:b}){let x=r()??!1,O=(0,_.useId)(),[k,A]=(0,_.useState)(p),j=f??k,[M,N]=(0,_.useState)(()=>new Set),P=(0,_.useRef)(null),F=(0,_.useMemo)(()=>w(C(S(n),S(s))),[n,s]),I=(0,_.useMemo)(()=>T(F,Math.max(0,u)),[F,u]),L=F.filter(e=>e.type===`add`).length,R=F.filter(e=>e.type===`remove`).length,z=I.filter(e=>e.kind===`fold`),B=z.length>0&&z.every(e=>M.has(e.key));(0,_.useEffect)(()=>{N(new Set),P.current=null},[n,s]);let V=t?`Renamed`:n===``&&s!==``?`New file`:s===``&&n!==``?`Deleted`:null,H=e.lastIndexOf(`/`),U=H>=0?e.slice(0,H+1):``,W=H>=0?e.slice(H+1):e,G=L+R,K=G===0?0:Math.max(+(L>0),Math.min(R>0?4:5,Math.round(L/G*5))),q=G===0?0:5-K,J=()=>{let e=!j;f===void 0&&A(e),h?.(e)},Y=e=>{P.current=e,N(t=>new Set(t).add(e))},X=()=>{P.current=null,N(B?new Set:new Set(z.map(e=>e.key)))},Z=0;return(0,y.jsxs)(`section`,{className:[v.root,b].filter(Boolean).join(` `),"aria-label":`Changes to ${e}`,"data-open":j,children:[(0,y.jsxs)(`header`,{className:v.header,children:[(0,y.jsx)(o,{className:v.fileIcon,size:16,"aria-hidden":`true`}),(0,y.jsxs)(`div`,{className:v.names,children:[(0,y.jsxs)(`span`,{className:v.path,title:e,children:[(0,y.jsx)(`span`,{className:v.directory,children:U}),(0,y.jsx)(`span`,{className:v.basename,children:W})]}),t?(0,y.jsxs)(`span`,{className:v.previous,children:[`from `,t]}):null]}),V?(0,y.jsx)(`span`,{className:v.status,children:V}):null,(0,y.jsxs)(`div`,{className:v.stats,children:[(0,y.jsxs)(`span`,{className:v.added,"aria-label":`${L} ${L===1?`addition`:`additions`}`,children:[`+`,L]}),(0,y.jsxs)(`span`,{className:v.removed,"aria-label":`${R} ${R===1?`removal`:`removals`}`,children:[`−`,R]}),(0,y.jsx)(`span`,{className:v.blocks,"aria-hidden":`true`,children:Array.from({length:5},(e,t)=>(0,y.jsx)(`span`,{className:v.block,"data-kind":t<K?`add`:t<K+q?`remove`:`none`,style:{"--i":t}},t))})]}),z.length?(0,y.jsx)(`button`,{type:`button`,className:v.iconButton,onClick:X,disabled:!j,"aria-pressed":B,"aria-label":B?`Fold unchanged lines`:`Show all unchanged lines`,title:B?`Fold unchanged lines`:`Show all unchanged lines`,children:B?(0,y.jsx)(m,{size:16,"aria-hidden":`true`}):(0,y.jsx)(g,{size:16,"aria-hidden":`true`})}):null,(0,y.jsx)(`button`,{type:`button`,className:v.iconButton,onClick:J,"aria-expanded":j,"aria-controls":O,"aria-label":j?`Collapse file`:`Expand file`,children:(0,y.jsx)(a,{className:v.chevron,size:16,"aria-hidden":`true`})})]}),(0,y.jsx)(i.div,{id:O,className:v.collapse,initial:!1,animate:{height:j?`auto`:0,opacity:+!!j},transition:x?{duration:0}:l.spring.smooth,inert:!j,children:(0,y.jsx)(`div`,{className:v.scroller,style:{maxHeight:d},tabIndex:0,role:`group`,"aria-label":`Diff of ${e}, ${L} added and ${R} removed`,children:(0,y.jsxs)(`div`,{className:v.lines,children:[F.length===0||G===0?(0,y.jsx)(`p`,{className:v.empty,children:F.length===0?`Empty file`:`No changes`}):null,G>0&&I.map(e=>{if(e.kind===`lines`){let t=Z;return Z+=e.lines.length,e.lines.map((e,n)=>(0,y.jsx)(E,{line:e,index:t+n},`${e.type}-${e.oldNo??``}-${e.newNo??``}`))}Z+=1;let t=e.lines.length;return(0,y.jsx)(c,{initial:!1,mode:`wait`,children:M.has(e.key)?(0,y.jsx)(D,{lines:e.lines,focus:P.current===e.key,reduceMotion:x},`lines`):(0,y.jsx)(i.button,{type:`button`,className:v.fold,onClick:()=>Y(e.key),"aria-expanded":!1,initial:{opacity:0},animate:{opacity:1},exit:{opacity:0,transition:{duration:x?0:.08}},transition:{duration:x?0:l.duration.fast},children:(0,y.jsxs)(`span`,{className:v.foldLabel,children:[(0,y.jsx)(g,{size:14,"aria-hidden":`true`}),t,` unchanged lines`,(0,y.jsxs)(`span`,{className:v.foldRange,children:[e.lines[0].newNo,`–`,e.lines[t-1].newNo]})]})},`fold`)},e.key)})]})})})]})}var k={height:600},A={modified:{filename:`src/server/rate-limit.ts`,before:`import { redis } from "./redis";
import { logger } from "./logger";

const WINDOW_SECONDS = 60;
const MAX_REQUESTS = 100;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

function keyFor(userId: string) {
  return \`rate:\${userId}\`;
}

/** Usage is tracked per user, in fixed one minute windows. */
export async function currentUsage(userId: string) {
  const raw = await redis.get(keyFor(userId));
  return raw ? Number(raw) : 0;
}

export async function checkRateLimit(userId: string): Promise<RateLimitResult> {
  const key = keyFor(userId);
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, WINDOW_SECONDS);
  }
  if (count > MAX_REQUESTS) {
    logger.warn("rate limit hit", { userId });
    return { allowed: false, remaining: 0 };
  }
  return { allowed: true, remaining: MAX_REQUESTS - count };
}

export async function resetRateLimit(userId: string) {
  await redis.del(keyFor(userId));
}

export async function resetMany(userIds: string[]) {
  if (userIds.length === 0) return;
  await redis.del(...userIds.map(keyFor));
  logger.info("rate limits cleared", { count: userIds.length });
}
`,after:`import { redis } from "./redis";
import { logger } from "./logger";
import type { Plan } from "./billing";

const WINDOW_SECONDS = 60;
const LIMITS: Record<Plan, number> = { free: 60, pro: 600, team: 3000 };

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter?: number;
}

function keyFor(userId: string) {
  return \`rate:\${userId}\`;
}

/** Usage is tracked per user, in fixed one minute windows. */
export async function currentUsage(userId: string) {
  const raw = await redis.get(keyFor(userId));
  return raw ? Number(raw) : 0;
}

export async function checkRateLimit(userId: string, plan: Plan = "free"): Promise<RateLimitResult> {
  const key = keyFor(userId);
  const limit = LIMITS[plan];
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, WINDOW_SECONDS);
  }
  if (count > limit) {
    const retryAfter = await redis.ttl(key);
    logger.warn("rate limit hit", { userId, plan });
    return { allowed: false, remaining: 0, retryAfter };
  }
  return { allowed: true, remaining: limit - count };
}

export async function resetRateLimit(userId: string) {
  await redis.del(keyFor(userId));
}

export async function resetMany(userIds: string[]) {
  if (userIds.length === 0) return;
  await redis.del(...userIds.map(keyFor));
  logger.info("rate limits cleared", { count: userIds.length });
}
`},added:{filename:`src/server/rate-limit.test.ts`,before:``,after:`import { describe, expect, it } from "vitest";
import { checkRateLimit, resetRateLimit } from "./rate-limit";

describe("checkRateLimit", () => {
  it("uses the limit of the plan", async () => {
    await resetRateLimit("user_1");
    const result = await checkRateLimit("user_1", "pro");
    expect(result.remaining).toBe(599);
  });
});
`}};function j(){let[e,t]=(0,_.useState)(`modified`);return(0,y.jsxs)(d,{width:680,gap:3,children:[(0,y.jsx)(`div`,{style:{alignSelf:`flex-start`},children:(0,y.jsx)(u,{label:`File`,value:e,onValueChange:e=>t(e),options:[{value:`modified`,label:`Modified file`},{value:`added`,label:`New file`}]})}),(0,y.jsx)(O,{...A[e],maxHeight:428},e),(0,y.jsx)(f,{children:`Open a folded range to read the unchanged lines around a change. The header button shows or folds them all.`})]})}export{j as default,k as stage};