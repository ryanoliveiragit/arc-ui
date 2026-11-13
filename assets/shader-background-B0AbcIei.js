import{D as e,k as t,v as n}from"./index-Cj2C1ZSw.js";import{t as r}from"./arrow-right-3bWTYZce.js";import{t as i}from"./pause-CX_ImTwM.js";import{t as a}from"./play-DeeCEbyx.js";import{n as o}from"./react-DP3wSEn3.js";import{t as s}from"./segmented-control-_k0VLWG3.js";import{t as c}from"./button-CpU3tP5D.js";var l=t(e(),1),u={root:`_root_1eqbn_2`,canvas:`_canvas_1eqbn_3`,content:`_content_1eqbn_5`},d=n(),f=`
attribute vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
`,p=`
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
`,m=42;function h(e){let t=document.createElement(`canvas`).getContext(`2d`,{willReadFrequently:!0});if(!t)return null;let n=document.createElement(`span`);n.style.cssText=`position:absolute;visibility:hidden;pointer-events:none`,e.appendChild(n);let r=e=>{n.style.color=`var(${e})`,t.clearRect(0,0,1,1),t.fillStyle=getComputedStyle(n).color,t.fillRect(0,0,1,1);let[r=0,i=0,a=0]=t.getImageData(0,0,1,1).data;return[r/255,i/255,a/255]},i={base:r(`--background`),soft:r(`--surface-muted`),tint:r(`--accent`)};return n.remove(),i}function g(e,t,n){let r=e.createShader(t);return r?(e.shaderSource(r,n),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS)?r:(e.deleteShader(r),null)):null}function _({speed:e=1,scale:t=1,intensity:n=.7,paused:r=!1,quality:i=.75,children:a,className:s,...c}){let _=(0,l.useRef)(null),v=(0,l.useRef)(null),y=!!o(),[b,x]=(0,l.useState)(`pending`),[S,C]=(0,l.useState)(0),w=(0,l.useRef)({speed:e,scale:t,intensity:n,paused:r,reduced:y,quality:i});w.current={speed:e,scale:t,intensity:n,paused:r,reduced:y,quality:i};let T=(0,l.useRef)(null);return(0,l.useEffect)(()=>{let e=_.current,t=v.current;if(!e||!t)return;let n=t.getContext(`webgl`,{alpha:!1,antialias:!1,depth:!1,stencil:!1,powerPreference:`low-power`}),r=n?g(n,n.VERTEX_SHADER,f):null,i=n?g(n,n.FRAGMENT_SHADER,p):null,a=n?n.createProgram():null;if(!n||!r||!i||!a||(n.attachShader(a,r),n.attachShader(a,i),n.linkProgram(a),!n.getProgramParameter(a,n.LINK_STATUS))){x(`flat`);return}n.useProgram(a);let o=n.createBuffer();n.bindBuffer(n.ARRAY_BUFFER,o),n.bufferData(n.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),n.STATIC_DRAW);let s=n.getAttribLocation(a,`a_position`);n.enableVertexAttribArray(s),n.vertexAttribPointer(s,2,n.FLOAT,!1,0,0);let c=e=>n.getUniformLocation(a,e),l={resolution:c(`u_resolution`),time:c(`u_time`),scale:c(`u_scale`),intensity:c(`u_intensity`),base:c(`u_base`),soft:c(`u_soft`),tint:c(`u_tint`)},u=h(e),d=0,y=0,b=m,S=!0,E=!1,D=!1,O=()=>{if(E||!u)return;let e=w.current;n.viewport(0,0,t.width,t.height),n.uniform2f(l.resolution,t.width,t.height),n.uniform1f(l.time,b),n.uniform1f(l.scale,Math.max(e.scale,.05)),n.uniform1f(l.intensity,Math.min(Math.max(e.intensity,0),1)),n.uniform3fv(l.base,u.base),n.uniform3fv(l.soft,u.soft),n.uniform3fv(l.tint,u.tint),n.drawArrays(n.TRIANGLES,0,3),D||(D=!0,x(`ready`))},k=()=>S&&!E&&!w.current.paused&&!w.current.reduced&&w.current.speed!==0&&document.visibilityState===`visible`,A=e=>{d=0;let t=y?Math.min((e-y)/1e3,.1):0;y=e,b+=t*w.current.speed,O(),k()&&(d=requestAnimationFrame(A))},j=()=>{k()?d||=(y=0,requestAnimationFrame(A)):(d&&cancelAnimationFrame(d),d=0,O())},M=()=>{let n=Math.min(window.devicePixelRatio||1,2)*Math.min(Math.max(w.current.quality,.25),1),r=Math.max(1,Math.round(e.clientWidth*n)),i=Math.max(1,Math.round(e.clientHeight*n));(t.width!==r||t.height!==i)&&(t.width=r,t.height=i),d||O()},N=()=>{u=h(e)??u,d||O()},P=new ResizeObserver(M);P.observe(e);let F=new IntersectionObserver(e=>{let t=e[e.length-1];t&&(S=t.isIntersecting,j())});F.observe(e);let I=new MutationObserver(N);I.observe(document.documentElement,{attributes:!0,attributeFilter:[`data-theme`,`data-accent`,`class`,`style`]});let L=window.matchMedia(`(prefers-color-scheme: dark)`);L.addEventListener(`change`,N),document.addEventListener(`visibilitychange`,j);let R=e=>{e.preventDefault(),E=!0,d&&cancelAnimationFrame(d),d=0,x(`flat`)},z=()=>C(e=>e+1);return t.addEventListener(`webglcontextlost`,R),t.addEventListener(`webglcontextrestored`,z),T.current={sync:j,resize:M},M(),j(),()=>{T.current=null,d&&cancelAnimationFrame(d),P.disconnect(),F.disconnect(),I.disconnect(),L.removeEventListener(`change`,N),document.removeEventListener(`visibilitychange`,j),t.removeEventListener(`webglcontextlost`,R),t.removeEventListener(`webglcontextrestored`,z),n.deleteBuffer(o),n.deleteProgram(a),n.deleteShader(r),n.deleteShader(i)}},[S]),(0,l.useEffect)(()=>{T.current?.sync()},[r,y,e,t,n]),(0,l.useEffect)(()=>{T.current?.resize()},[i]),(0,d.jsxs)(`div`,{...c,ref:_,className:[u.root,s].filter(Boolean).join(` `),"data-state":b,children:[(0,d.jsx)(`canvas`,{ref:v,className:u.canvas,"aria-hidden":`true`}),a==null?null:(0,d.jsx)(`div`,{className:u.content,children:a})]})}var v={hero:`_hero_1ho47_1`,copy:`_copy_1ho47_2`,kicker:`_kicker_1ho47_3`,title:`_title_1ho47_4`,lead:`_lead_1ho47_5`,actions:`_actions_1ho47_6`},y={layout:`fill`,height:480},b=[{value:`calm`,label:`Calm`},{value:`flow`,label:`Flow`},{value:`rush`,label:`Rush`}],x={calm:.45,flow:1,rush:2.6};function S(){let[e,t]=(0,l.useState)(`flow`),[n,o]=(0,l.useState)(!1);return(0,d.jsx)(_,{className:v.hero,speed:x[e]??1,paused:n,children:(0,d.jsxs)(`div`,{className:v.copy,children:[(0,d.jsx)(`p`,{className:v.kicker,children:`Tidewater Cloud`}),(0,d.jsx)(`h2`,{className:v.title,children:`Deploys that stay out of your way`}),(0,d.jsx)(`p`,{className:v.lead,children:`Push a branch and get a preview in seconds. The background is a live shader tinted with your accent color.`}),(0,d.jsxs)(`div`,{className:v.actions,children:[(0,d.jsxs)(c,{children:[`Start a project`,(0,d.jsx)(r,{size:16,"aria-hidden":`true`})]}),(0,d.jsxs)(c,{variant:`secondary`,onClick:()=>o(e=>!e),"aria-pressed":n,children:[n?(0,d.jsx)(a,{size:16,"aria-hidden":`true`}):(0,d.jsx)(i,{size:16,"aria-hidden":`true`}),n?`Resume`:`Pause`]})]}),(0,d.jsx)(s,{label:`Flow speed`,options:b,value:e,onValueChange:t})]})})}export{S as default,y as stage};