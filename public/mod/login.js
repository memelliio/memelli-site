/* [bar_mel 2026-06-20] AUTH ONLY — clean. The #dr drawer is DELETED (not hidden).
   Right-side vertical tabs are the auth flow: Sign Up / Sign In open the ONE universal
   shell (scene.js openWindow signup form); when signed in they become Sign Out. */
(function(){
  /* [bar_mel 2026-06-20] Sign up -> signup form; Sign in -> LOGIN form (was wrongly opening signup for both) */
  function openAuth(mode){ if(window.openWindow){ window.openWindow({k:'signup',label:(mode==='login'?'Sign In':'Sign Up'),mode:mode}); } }

  var sutab=document.getElementById('sutab'),
      sitab=document.getElementById('sitab'),
      livetab=document.getElementById('livetab');

  if(sutab){ sutab.textContent='Sign up'; sutab.addEventListener('click',function(){ openAuth('signup'); }); }
  if(sitab){ sitab.textContent='Sign in'; sitab.addEventListener('click',function(){ openAuth('login'); }); }
  /* [bar_mel 2026-06-20] admin-only Master Controls tab (right edge); shown only when signed in */
  var mctab=document.getElementById('mctab');
  if(!mctab){ mctab=document.createElement('div'); mctab.id='mctab'; mctab.className='signtab'; mctab.textContent='Background'; mctab.style.cssText='top:26%;display:none'; document.body.appendChild(mctab); }
  mctab.addEventListener('click',function(){ if(window.openWindow) window.openWindow({k:'look',label:'Master Background Controls'}); });

  /* [verify_lane 2026-06-23] SAVE button, TOP-RIGHT, admin only (Mel) - saves the whole-page layout + current background settings to the rail via the existing save (__saveLookRail -> /api/win/settings + /api/render_uniforms/set) + __savePref. */
  function __mbTopbar(){ var h=document.getElementById('mb-topbar'); if(!h){ h=document.createElement('div'); h.id='mb-topbar'; h.style.cssText='position:fixed;top:12px;right:14px;z-index:63;display:flex;flex-direction:row-reverse;gap:8px;align-items:center'; document.body.appendChild(h);} return h; }
  var savebtn=document.getElementById('mb-savebtn');
  if(!savebtn){ savebtn=document.createElement('div'); savebtn.id='mb-savebtn'; savebtn.textContent='Save'; savebtn.style.cssText='display:none;cursor:pointer;background:linear-gradient(135deg,#9fe9bd,#5fa8ff);color:#06140d;font:700 13px Inter,system-ui,-apple-system,sans-serif;padding:8px 18px;border-radius:10px;box-shadow:0 6px 22px rgba(0,0,0,.42)'; __mbTopbar().appendChild(savebtn);
    /* [2026-06-25 Mel] SAVE is now a VIEW menu: save the current global setting as Admin / Client / Co-branded Partner, and LOAD any saved view. */
    savebtn.addEventListener('click',function(e){ e.stopPropagation();
      var ex=document.getElementById('mb-viewmenu'); if(ex){ ex.remove(); return; }
      var m=document.createElement('div'); m.id='mb-viewmenu'; m.style.cssText='position:fixed;top:52px;right:14px;z-index:64;width:236px;background:rgba(14,16,22,0.98);border:1px solid rgba(255,255,255,0.18);border-radius:12px;padding:13px;box-shadow:0 16px 44px rgba(0,0,0,0.55);font:13px Inter,system-ui,sans-serif;color:#fff'; m.onclick=function(ev){ev.stopPropagation();};
      var msg=document.createElement('div');
      function hd(t){ var d=document.createElement('div'); d.textContent=t; d.style.cssText='font:700 10px Inter,system-ui;letter-spacing:.08em;text-transform:uppercase;color:#9fb0d0;margin:2px 0 7px'; m.appendChild(d); }
      function row(label,on,fn){ var bb=document.createElement('div'); bb.textContent=label; bb.style.cssText='cursor:pointer;padding:8px 11px;border-radius:9px;margin-bottom:6px;font:700 12px Inter,system-ui;background:'+(on?'rgba(95,168,255,.16)':'rgba(255,255,255,.05)')+';border:1px solid '+(on?'#5fa8ff':'rgba(255,255,255,.14)')+';color:'+(on?'#fff':'rgba(255,255,255,.5)'); bb.onmousedown=function(ev){ev.stopPropagation();}; bb.onclick=fn; m.appendChild(bb); }
      function flash(t){ msg.textContent=t; setTimeout(function(){ var mm=document.getElementById('mb-viewmenu'); if(mm)mm.remove(); },900); }
      var VIEWS=window.__VIEWS||[{k:'admin',label:'Admin'},{k:'client',label:'Client'},{k:'partner',label:'Co-branded Partner'}];
      hd('Save current global setting as');
      VIEWS.forEach(function(v){ row('Save '+v.label, true, function(){ if(window.__saveView)window.__saveView(v.k); flash(v.label+' view saved ✓'); }); });
      hd('Load a saved view');
      VIEWS.forEach(function(v){ var has=window.__hasView&&window.__hasView(v.k); row('Load '+v.label+(has?'':' (none)'), !!has, function(){ if(has&&window.__loadView){ window.__loadView(v.k); flash(v.label+' view loaded ✓'); } }); });
      msg.style.cssText='min-height:14px;margin-top:4px;font:700 11px Inter,system-ui;color:#9be59b;text-align:center'; m.appendChild(msg);
      document.body.appendChild(m);
      setTimeout(function(){ document.addEventListener('click',function cl(){ var mm=document.getElementById('mb-viewmenu'); if(mm)mm.remove(); document.removeEventListener('click',cl); }); },60);
    });
  }

  /* [verify_lane 2026-06-23] Layer 2 (text) editing belongs in the MASTER SETTINGS as a layer (Mel) - removed my standalone Layer-2 button. The builder does NOT choose the words or the values; the text content + its settings come from the user/deepinfra. */

  /* auth state: logged in -> hide Sign up/Sign in, show Sign out (livetab); click = logout */
  /* [bar_mel 2026-06-20] ADMIN GATE: the Master Controls tab (mctab) shows ONLY for admin/owner. Customers get the auth tabs only — no editing UI. */
  function setAuth(on,isAdmin){
    if(sutab) sutab.style.display=on?'none':'';
    if(sitab) sitab.style.display=on?'none':'';
    if(livetab){ livetab.style.display=on?'':'none'; livetab.textContent='Sign out'; livetab.style.top='64%'; }
    if(mctab) mctab.style.display=(on&&isAdmin)?'':'none';
    if(savebtn) savebtn.style.display=(on&&isAdmin)?'':'none';
    /* [verify_lane 2026-06-23] ADMIN: Master Controls AUTO-MINIMIZE to the TOP-LEFT (Mel - "auto minimize top left corner") - open the look window then immediately click its minimize (yellow) dot so it parks as a chip in mw-taskbar (top:0;left:0), not a full panel. */
    if(on&&isAdmin&&!window.__mcAuto){ window.__mcAuto=true; setTimeout(function(){ try{ if(window.openWindow){ window.openWindow({k:'look',label:'Master Background Controls'}); var sh=document.getElementById('mw-shell'); if(sh){ var ds=sh.querySelectorAll('span'); for(var i=0;i<ds.length;i++){ if(String(ds[i].style.background||'').indexOf('245, 196, 81')>=0){ ds[i].click(); break; } } } } }catch(e){} },700); }
  }
  function check(){
    fetch('/api/auth/whoami',{credentials:'include'})
      .then(function(r){return r.json();})
      .then(function(j){ var u=j&&j.ok&&j.user; var role=u&&u.role; setAuth(!!u, role==='admin'||role==='owner'||role==='ceo'); })
      .catch(function(){ setAuth(false,false); });
  }
  if(livetab){ livetab.addEventListener('click',function(){
    fetch('/api/auth/logout',{method:'POST',credentials:'include'}).catch(function(){})
      .then(function(){ try{localStorage.removeItem('memelli_token');}catch(e){} location.reload(); });
  }); }

  /* #bar mac traffic lights: green=full screen, yellow=minimize(exit fs), red=close the shell */
  var bar=document.getElementById('bar');
  if(bar){
    var d1=bar.querySelector('.dot1'), d2=bar.querySelector('.dot2'), d3=bar.querySelector('.dot3');
    function fsOn(){ var el=document.documentElement; if(el.requestFullscreen)el.requestFullscreen(); else if(el.webkitRequestFullscreen)el.webkitRequestFullscreen(); }
    function fsOff(){ if(document.fullscreenElement){ if(document.exitFullscreen)document.exitFullscreen(); else if(document.webkitExitFullscreen)document.webkitExitFullscreen(); } }
    if(d3){ d3.title='Full screen'; d3.addEventListener('click',function(){ if(!document.fullscreenElement) fsOn(); else fsOff(); }); }
    if(d2){ d2.title='Minimize'; d2.addEventListener('click',fsOff); }
    if(d1){ d1.title='Close'; d1.addEventListener('click',function(){ fsOff(); var sh=document.getElementById('mw-shell'); if(sh) sh.style.display='none'; }); }
  }

  check();
})();
