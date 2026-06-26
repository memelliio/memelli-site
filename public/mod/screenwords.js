 (function(){
  /* [COMPOSER - DESIGN FRONTEND 2026-06-21 v4] SCREEN WORDS - the display, TIMED TO REAL DATA. Reads the timing AUTHORITY /api/song/lyrics (cleaned lines[] + normalized timings[] + bpm) and tracks the LIVE homesong audio position so each line ADVANCES with the real song (moves with the main lyrics). Fallback: if audio is blocked/paused, advance on the bpm beat so words still move. Clean 1080p-aligned overlay, upper third. Defers to songshell when the owner plays music. */
  /* [2026-06-25 Mel] This is the SONG-LYRICS overlay only. The bar's CONVERSATION lives on the master-controlled text layer (window.__text / #scene-text) — controlled by the ONE Master Controls on the particle wall. No settings here. */
  var lines=[], timings=[], box=null, idx=-1, bpm=142, t0=null;
  function mk(){ if(box) return box; box=document.createElement('div'); box.id='mb-screenwords';
    box.style.cssText='position:fixed;left:50%;top:20%;transform:translateX(-50%);z-index:7;width:min(1180px,88vw);text-align:center;pointer-events:none;font-family:Inter,system-ui,-apple-system,sans-serif;font-weight:800;font-size:clamp(22px,3.6vw,50px);line-height:1.12;letter-spacing:.005em;color:#fff;text-shadow:0 2px 26px rgba(0,0,0,.92),0 0 60px rgba(0,0,0,.75);opacity:0;transition:opacity .55s ease';
    document.body.appendChild(box); return box; }
  function show(i){ if(i===idx) return; idx=i; var b=mk(); b.textContent=lines[i]||''; b.style.opacity=lines[i]?'0.95':'0'; }
  function load(){ try{ fetch('/api/song/lyrics').then(function(r){return r.json();}).then(function(j){ if(j&&j.lines&&j.lines.length){ lines=j.lines.map(function(l){return String(l||'').trim();}).filter(function(l){return l && l.charAt(0)!=='[';}); if(j.timings&&j.timings.length) timings=j.timings; if(j.bpm) bpm=j.bpm; } }).catch(function(){}); }catch(e){} }
  function lineAt(pos){ // pos 0..1 -> line index via the timing authority
    if(timings.length>=lines.length && lines.length){ var n=Math.min(timings.length,lines.length); var hit=0; for(var i=0;i<n;i++){ if(timings[i]<=pos) hit=i; else break; } return hit; }
    return lines.length?Math.floor(pos*lines.length)%lines.length:0;
  }
  function tick(){ try{
    if(window.__musicOn){ if(box) box.style.opacity='0'; return; } // owner song UI owns the wall
    if(!lines.length) return;
    var a=document.getElementById('homesong'); var pos;
    if(a && a.duration>0 && !a.paused && a.currentTime>0){ pos=(a.currentTime % a.duration)/a.duration; } // REAL audio position
    else { if(t0===null) t0=Date.now(); var perLine=(60/bpm)*4; var span=Math.max(1,lines.length)*perLine; pos=((Date.now()-t0)/1000 % span)/span; } // bpm fallback
    show(lineAt(pos));
  }catch(e){} }
  var w=setInterval(function(){ if(document.body){ clearInterval(w); load(); setInterval(load,60000); setInterval(tick,250); } },400);
})();
