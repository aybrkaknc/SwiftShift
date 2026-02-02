(function(){const b={processText(e){if(!e)return null;const t=e.trim();return t.length===0?null:t},getSelection(){const e=window.getSelection();return e?this.processText(e.toString()):null}},E={processVideoUrl(e,t){try{const n=new URL(e);if((n.hostname.includes("youtube.com")||n.hostname.includes("youtu.be"))&&t&&t>0){const r=Math.floor(t);n.searchParams.set("t",r.toString()+"s")}return n.toString()}catch{return e}},isImageUrl(e){return/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(e)}};chrome.runtime.onMessage.addListener((e,t,n)=>{if(e.type==="CAPTURE_CONTENT")return M().then(r=>{n(r)}),!0;if(e.type==="START_REGION_CAPTURE")return T(e.targetId,e.threadId,e.targetName),n({success:!0}),!0});async function M(){const e=b.getSelection();if(e)return{text:e};let t=window.location.href;const n=document.title,r=document.querySelector("video");return r&&(t=E.processVideoUrl(t,r.currentTime)),{text:`${n}
${t}`,isPage:!0}}function T(e,t,n){const r=document.getElementById("swiftshift-region-overlay");r&&r.remove();const i=document.createElement("div");i.id="swiftshift-region-overlay",i.style.cssText=`
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.3);
        cursor: crosshair;
        z-index: 2147483647;
    `;const o=document.createElement("div");o.style.cssText=`
        position: fixed;
        border: 2px dashed #F4AB25;
        background: rgba(244, 171, 37, 0.1);
        pointer-events: none;
        display: none;
    `,i.appendChild(o);const f=document.createElement("div");f.style.cssText=`
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #1a1a1a;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-family: system-ui, sans-serif;
        font-size: 14px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        border: 1px solid rgba(255,255,255,0.1);
    `,f.textContent="✂️ Yakalamak istediğiniz alanı seçin (ESC ile iptal)",i.appendChild(f);let c=0,a=0,u=!1;const x=s=>{u=!0,c=s.clientX,a=s.clientY,o.style.display="block",o.style.left=`${c}px`,o.style.top=`${a}px`,o.style.width="0",o.style.height="0"},v=s=>{if(!u)return;const l=s.clientX,d=s.clientY,m=Math.min(c,l),g=Math.min(a,d),p=Math.abs(l-c),h=Math.abs(d-a);o.style.left=`${m}px`,o.style.top=`${g}px`,o.style.width=`${p}px`,o.style.height=`${h}px`},w=async s=>{if(!u)return;u=!1;const l=s.clientX,d=s.clientY,m=Math.min(c,l),g=Math.min(a,d),p=Math.abs(l-c),h=Math.abs(d-a);i.remove(),!(p<10||h<10)&&chrome.runtime.sendMessage({type:"REGION_CAPTURE_SELECTED",targetId:e,threadId:t,targetName:n,region:{left:m,top:g,width:p,height:h},devicePixelRatio:window.devicePixelRatio||1,pageTitle:document.title,pageUrl:window.location.href})},y=s=>{s.key==="Escape"&&(i.remove(),document.removeEventListener("keydown",y))};i.addEventListener("mousedown",x),i.addEventListener("mousemove",v),i.addEventListener("mouseup",w),document.addEventListener("keydown",y),document.body.appendChild(i)}
})()
