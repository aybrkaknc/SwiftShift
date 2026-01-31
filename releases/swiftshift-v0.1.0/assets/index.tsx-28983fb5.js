import{c as u,r as d,j as t,C as p,a as h,b as f,R as x}from"./circle-check-9b79b332.js";/**
 * @license lucide-react v0.474.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]],b=u("Info",g);/**
 * @license lucide-react v0.474.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],w=u("X",y),j=()=>{const[s,r]=d.useState([]);d.useEffect(()=>{const e=(o,a,c)=>{o.type==="TOAST_NOTIFICATION"&&(n(o.status,o.message,o.subtext),c({received:!0}))};return chrome.runtime.onMessage.addListener(e),()=>chrome.runtime.onMessage.removeListener(e)},[]);const n=(e,o,a)=>{const c=Date.now().toString();r(m=>[...m,{id:c,type:e,message:o,subtext:a}]),setTimeout(()=>{i(c)},4e3)},i=e=>{r(o=>o.filter(a=>a.id!==e))};return s.length===0?null:t.jsxs("div",{className:"fixed bottom-8 right-8 z-[2147483647] flex flex-col gap-4 pointer-events-none font-sans",children:[s.map(e=>t.jsxs("div",{className:"pointer-events-auto animate-spring-in relative overflow-hidden w-[380px] rounded-xl bg-[#0B1121]/90 backdrop-blur-xl shadow-2xl border border-white/10 ring-1 ring-white/5",children:[t.jsxs("div",{className:"flex items-center justify-between p-4 gap-4",children:[t.jsxs("div",{className:"flex items-center gap-3",children:[t.jsxs("div",{className:`relative flex items-center justify-center shrink-0 w-8 h-8 rounded-full ${e.type==="success"?"bg-success/20 text-success":e.type==="error"?"bg-danger/20 text-danger":"bg-primary/20 text-primary"}`,children:[e.type==="success"&&t.jsx(p,{size:20}),e.type==="error"&&t.jsx(h,{size:20}),e.type==="info"&&t.jsx(b,{size:20}),t.jsx("div",{className:`absolute inset-0 rounded-full blur-sm animate-pulse ${e.type==="success"?"bg-success/20":e.type==="error"?"bg-danger/20":"bg-primary/20"}`})]}),t.jsxs("div",{className:"flex flex-col justify-center",children:[t.jsx("p",{className:"text-white text-[15px] font-medium leading-tight",children:e.message}),e.subtext&&t.jsx("p",{className:"text-white/50 text-xs font-normal",children:e.subtext})]})]}),t.jsx("button",{onClick:()=>i(e.id),className:"text-white/20 hover:text-white/60 transition-colors rounded-full",children:t.jsx(w,{size:16})})]}),t.jsx("div",{className:"absolute bottom-0 left-0 right-0 h-[2px] w-full bg-white/5",children:t.jsx("div",{className:`h-full animate-progress ${e.type==="success"?"bg-success shadow-[0_0_10px_rgba(13,242,89,0.5)]":e.type==="error"?"bg-danger shadow-[0_0_10px_rgba(239,68,68,0.5)]":"bg-primary shadow-[0_0_10px_rgba(244,171,37,0.5)]"}`})})]},e.id)),t.jsx("style",{children:`
        @keyframes springSlideIn {
            0% { transform: translateX(100%) scale(0.9); opacity: 0; }
            60% { transform: translateX(-5%) scale(1.02); opacity: 1; }
            80% { transform: translateX(2%) scale(0.98); }
            100% { transform: translateX(0) scale(1); }
        }
        .animate-spring-in {
            animation: springSlideIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        @keyframes progressShrink {
            from { width: 100%; }
            to { width: 0%; }
        }
        .animate-progress {
            animation: progressShrink 4000ms linear forwards;
        }
      `})]})},v={processText(s){if(!s)return null;const r=s.trim();return r.length===0?null:r},getSelection(){const s=window.getSelection();return s?this.processText(s.toString()):null}},S={processVideoUrl(s,r){try{const n=new URL(s);if((n.hostname.includes("youtube.com")||n.hostname.includes("youtu.be"))&&r&&r>0){const i=Math.floor(r);n.searchParams.set("t",i.toString()+"s")}return n.toString()}catch{return s}},isImageUrl(s){return/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(s)}};console.log("SwiftShift Content Script Loading...");const l=document.createElement("div");l.id="swiftshift-root";document.body.appendChild(l);const N=l.attachShadow({mode:"open"}),_=f.createRoot(N);_.render(t.jsx(x.StrictMode,{children:t.jsx(j,{})}));chrome.runtime.onMessage.addListener((s,r,n)=>{if(s.type==="CAPTURE_CONTENT")return k().then(i=>{n(i)}),!0});async function k(){const s=v.getSelection();if(s)return{text:s};let r=window.location.href;const n=document.title,i=document.querySelector("video");return i&&(r=S.processVideoUrl(r,i.currentTime)),{text:`${n}
${r}`,isPage:!0}}
