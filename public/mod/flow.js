/* [verify_lane 2026-06-23] FLOWS = the ordered list of windows the bar/spawn open in sequence (Mel).
   The EDITOR IS ITS OWN WINDOW (openWindow {k:'flows'}) - same universal shell/design as every other window,
   opened from the MENU. NOT a floating button thrown on the page. On a window's complete -> __flowNext opens the
   next. The order is a saved variable (localStorage + rail window_settings['__floworder']) so you AND the deepinfra set it. */
(function(){
  var KEY='memelli_floworder';
  var DEF=['signup','smartcredit','decision','credit_repair','funding'];
  function load(){ try{ var s=JSON.parse(localStorage.getItem(KEY)||'null'); return (s&&s.length)?s:DEF.slice(); }catch(e){ return DEF.slice(); } }
  function save(o){ try{ localStorage.setItem(KEY,JSON.stringify(o)); }catch(e){} try{ fetch('/api/win/settings',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({window_id:'__floworder',settings:{order:o}})}).catch(function(){}); }catch(e){} }
  window.__floworder=load();
  window.__flowNext=function(cur){ var o=window.__floworder||DEF; var i=o.indexOf(cur); var nx=(i>=0&&i<o.length-1)?o[i+1]:null; if(nx&&window.openWindow){ try{ window.openWindow({k:nx,label:nx.replace(/_/g,' ').replace(/\b\w/g,function(c){return c.toUpperCase();})}); }catch(e){} } return nx; };

  /* ---- the FLOWS editor renders INTO the universal window shell (openWindow {k:'flows'}) ---- */
  window.__winRender=window.__winRender||{};
  window.__winRender.flows=function(bd,st){
    var o=window.__floworder; var dragFrom=null;
    function draw(){
      bd.innerHTML='<div style="max-width:520px;margin:0 auto;width:100%"><div style="font-weight:800;font-size:16px;margin-bottom:4px">Flow order</div><div style="font-size:12.5px;color:#9fb0d0;margin-bottom:16px">Drag to reorder. Each window opens the next on complete.</div><div id="flw_list"></div></div>';
      var L=bd.querySelector('#flw_list');
      o.forEach(function(k,i){
        var r=document.createElement('div'); r.draggable=true; r.setAttribute('data-idx',i);
        r.style.cssText='display:flex;align-items:center;gap:10px;padding:11px 13px;margin-bottom:8px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);border-radius:11px;cursor:grab;user-select:none';
        r.innerHTML='<span style="opacity:.5;font-size:15px">⠿</span><span style="font-weight:600;flex:1">'+(i+1)+'. '+k.replace(/_/g,' ')+'</span>';
        r.addEventListener('dragstart',function(e){ dragFrom=i; r.style.opacity='0.35'; try{ e.dataTransfer.effectAllowed='move'; e.dataTransfer.setData('text/plain',String(i)); }catch(_e){} });
        r.addEventListener('dragend',function(){ dragFrom=null; r.style.opacity='1'; r.style.borderColor='rgba(255,255,255,0.12)'; });
        r.addEventListener('dragover',function(e){ e.preventDefault(); try{e.dataTransfer.dropEffect='move';}catch(_e){} r.style.borderColor='#5fa8ff'; });
        r.addEventListener('dragleave',function(){ r.style.borderColor='rgba(255,255,255,0.12)'; });
        r.addEventListener('drop',function(e){ e.preventDefault(); var from=(dragFrom!=null)?dragFrom:(+e.dataTransfer.getData('text/plain')); var to=i; if(from!=null && from!==to){ var m=o.splice(from,1)[0]; o.splice(to,0,m); save(o); draw(); } else { r.style.borderColor='rgba(255,255,255,0.12)'; } });
        L.appendChild(r);
      });
    }
    draw();
  };
})();
