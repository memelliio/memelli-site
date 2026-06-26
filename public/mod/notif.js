(function(){
  /* [bar_mel 2026-06-23] SITE NOTIFICATIONS (the main one). A small bell (logged-in only) with an
     unread badge + dropdown list, reading the customer's real client_notifications via the additive
     session-scoped endpoint /api/customer_notifications. Marks read on open. Vanilla; no collisions. */
  function hasSession(){ return document.cookie.indexOf('mio_sess=')>=0; }
  var open=false;
  function el(tag,css,html){ var e=document.createElement(tag); if(css)e.style.cssText=css; if(html!=null)e.innerHTML=html; return e; }
  function init(){
    if(!hasSession()) return;
    if(document.getElementById('mb-notif-bell')) return;
    var bell=el('div','position:fixed;top:14px;right:16px;z-index:40;width:38px;height:38px;border-radius:50%;background:rgba(16,16,24,.6);border:1px solid rgba(255,255,255,.14);display:grid;place-items:center;cursor:pointer;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)','<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>');
    bell.id='mb-notif-bell';
    var badge=el('div','position:absolute;top:-4px;right:-4px;min-width:17px;height:17px;border-radius:9px;background:#e11d2a;color:#fff;font:700 10px Inter,system-ui;display:none;align-items:center;justify-content:center;padding:0 4px','0');
    badge.id='mb-notif-badge'; bell.appendChild(badge);
    var panel=el('div','position:fixed;top:60px;right:16px;z-index:41;width:320px;max-width:86vw;max-height:62vh;overflow:auto;background:rgba(14,14,22,.96);border:1px solid rgba(255,255,255,.14);border-radius:14px;padding:10px;display:none;-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);box-shadow:0 20px 60px rgba(0,0,0,.5)');
    panel.id='mb-notif-panel'; panel.innerHTML='<div style="opacity:.6;padding:14px;font:13px Inter,system-ui">Loading…</div>';
    document.body.appendChild(bell); document.body.appendChild(panel);
    bell.onclick=function(e){ e.stopPropagation(); open=!open; panel.style.display=open?'block':'none'; if(open)load(true); };
    document.addEventListener('click',function(){ if(open){ open=false; panel.style.display='none'; } });
    panel.onclick=function(e){ e.stopPropagation(); };
    load(false);
    setInterval(function(){ if(!open)load(false); }, 60000);
  }
  function load(markRead){
    fetch('/api/customer_notifications',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(markRead?{action:'mark_read'}:{})}).then(function(r){return r.json();}).then(function(d){
      var badge=document.getElementById('mb-notif-badge'), panel=document.getElementById('mb-notif-panel');
      var ns=(d&&d.notifications)||[]; var unread=markRead?0:((d&&d.unread)||0);
      if(badge){ if(unread>0){ badge.textContent=unread>9?'9+':String(unread); badge.style.display='flex'; } else { badge.style.display='none'; } }
      if(panel){ if(!ns.length){ panel.innerHTML='<div style="opacity:.6;padding:14px;font:13px Inter,system-ui">No notifications yet.</div>'; }
        else { panel.innerHTML='<div style="font:800 12px Inter,system-ui;color:#e11d2a;text-transform:uppercase;letter-spacing:.06em;padding:6px 8px 10px">Notifications</div>'+ns.map(function(n){ var b=n.body||{}; if(typeof b==='string'){ try{ b=JSON.parse(b); }catch(e){ b={title:b}; } } var title=(b.title||n.template||'Update'); var lines=Object.keys(b).filter(function(k){return k!=='title';}).map(function(k){return k+': '+b[k];}).join(' · '); return '<div style="border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:10px 12px;margin-bottom:8px;background:rgba(0,0,0,.3);font-family:Inter,system-ui"><div style="font-weight:700;font-size:13px;color:#fff">'+String(title).replace(/[<>]/g,'')+'</div>'+(lines?('<div style="font-size:12px;color:#9fb0d0;margin-top:3px">'+String(lines).replace(/[<>]/g,'')+'</div>'):'')+'</div>'; }).join(''); } }
    }).catch(function(){});
  }
  var t=setInterval(function(){ if(document.body){ clearInterval(t); init(); } },600);
})();
