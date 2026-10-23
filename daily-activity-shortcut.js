"use strict";
// Daily Activity floating shortcut — isolated from inspection/offline logic.
(() => {
  const style = document.createElement("style");
  style.textContent = `.inspection-shortcut{position:fixed;right:34px;bottom:28px;width:72px;height:72px;border:0;border-radius:50%;background:rgba(255,152,0,.72);box-shadow:0 8px 22px rgba(0,0,0,.2);display:flex;align-items:center;justify-content:center;cursor:grab;z-index:1500;user-select:none;touch-action:none;backdrop-filter:blur(4px)}.inspection-shortcut:hover{background:rgba(255,152,0,.88)}.inspection-shortcut:active{cursor:grabbing}.inspection-shortcut span{color:#fff;font-size:46px;font-weight:300;line-height:1;pointer-events:none}@media(max-width:480px){.inspection-shortcut{width:60px;height:60px;right:18px;bottom:20px}.inspection-shortcut span{font-size:40px}}`;
  document.head.appendChild(style);
  function init() {
    const el = document.getElementById("inspectionShortcut");
    if (!el) return;
    const key = "hexaInspectionButtonPosition";
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    function place(x,y) {
      el.style.left = clamp(x,0,Math.max(0,innerWidth-el.offsetWidth))+"px";
      el.style.top = clamp(y,0,Math.max(0,innerHeight-el.offsetHeight))+"px";
      el.style.right="auto";el.style.bottom="auto";
    }
    try { const p=JSON.parse(localStorage.getItem(key)||"null");if(p&&Number.isFinite(p.left)&&Number.isFinite(p.top))place(p.left,p.top); } catch (_) {}
    let down=null, moved=false, suppress=false;
    el.addEventListener("pointerdown",e=>{
      if(e.button!==0)return;
      down={id:e.pointerId,x:e.clientX,y:e.clientY,left:el.getBoundingClientRect().left,top:el.getBoundingClientRect().top};
      moved=false;el.setPointerCapture(e.pointerId);
    });
    el.addEventListener("pointermove",e=>{
      if(!down||e.pointerId!==down.id)return;
      const dx=e.clientX-down.x,dy=e.clientY-down.y;
      if(Math.hypot(dx,dy)>6)moved=true;
      if(moved)place(down.left+dx,down.top+dy);
    });
    function finish(e){
      if(!down||e.pointerId!==down.id)return;
      if(moved){const r=el.getBoundingClientRect();try{localStorage.setItem(key,JSON.stringify({left:r.left,top:r.top}));}catch(_){}suppress=true;}
      down=null;
    }
    el.addEventListener("pointerup",finish);el.addEventListener("pointercancel",finish);
    el.addEventListener("click",e=>{if(suppress){e.preventDefault();suppress=false;return;}window.location.href="/start-inspection";});
    window.addEventListener("resize",()=>{if(el.style.left){const r=el.getBoundingClientRect();place(r.left,r.top);}});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
