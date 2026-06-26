/* [bar_mel 2026-06-23] LIVE ANALYTICS ON THE SCREEN — the owner's whole-machine panel inside the ONE universal window (openWindow k:analytics -> __winRender.analytics). Reads the live rail (/api/live_analysis) on a poll; NO local data, NO mock. Admin/owner only. Same design language as the other windows (glass tiles, red accents). */
(function(){window.__winRender=window.__winRender||{};
window.__winRender["analytics"]=function(bd,st){
  var adm=window.__isAdmin||(window.__me&&/^(ceo|admin|owner)$/i.test(String(window.__me.role||"")));
  bd.innerHTML="";bd.style.display="block";bd.style.overflow="auto";
  if(!adm){bd.innerHTML='<div style="opacity:.7;padding:24px;font:600 14px Inter,system-ui">Live analytics is owner-only.</div>';return;}
  var RED="#d61e2e";
  var wrap=document.createElement("div");wrap.style.cssText="color:#eef2ff;font:500 13px Inter,system-ui,-apple-system,sans-serif;padding:4px 2px";
  var head=document.createElement("div");head.style.cssText="display:flex;align-items:center;justify-content:space-between;margin:2px 0 12px";
  head.innerHTML='<span style="font:800 16px Inter,system-ui;letter-spacing:.01em">Live machine</span><span id="anf-ts" style="font:600 10px Inter;letter-spacing:.06em;text-transform:uppercase;color:#9fb0c8">connecting…</span>';
  var grid=document.createElement("div");grid.style.cssText="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px";
  var seatsWrap=document.createElement("div");seatsWrap.style.cssText="margin-top:16px";
  var seatsTtl=document.createElement("div");seatsTtl.style.cssText="font:700 12px Inter;color:#9fb0c8;letter-spacing:.05em;text-transform:uppercase;margin-bottom:7px";seatsTtl.textContent="Live seats";
  var seatsBody=document.createElement("div");
  var scrTtl=document.createElement("div");scrTtl.style.cssText="font:700 12px Inter;color:#9fb0c8;letter-spacing:.05em;text-transform:uppercase;margin:16px 0 7px";scrTtl.textContent="This screen (live)";
  var scrGrid=document.createElement("div");scrGrid.style.cssText="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px";
  wrap.appendChild(head);wrap.appendChild(grid);wrap.appendChild(scrTtl);wrap.appendChild(scrGrid);wrap.appendChild(seatsWrap);seatsWrap.appendChild(seatsTtl);seatsWrap.appendChild(seatsBody);bd.appendChild(wrap);
  function tile(label,val,accent){var d=document.createElement("div");d.style.cssText="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);border-radius:14px;padding:13px 14px";d.innerHTML='<div style="font:800 22px Inter,system-ui;color:'+(accent||"#fff")+'">'+val+'</div><div style="font:600 10px Inter;letter-spacing:.07em;text-transform:uppercase;color:#9fb0c8;margin-top:3px">'+label+'</div>';return d;}
  function num(n){n=Number(n);if(!isFinite(n))return "—";if(n>=1e6)return (n/1e6).toFixed(2)+"M";if(n>=1e3)return (n/1e3).toFixed(1)+"k";return String(n);}
  /* [2026-06-25 Mel] REAL on-screen analytics, computed live client-side */
  var __fps=0,__frames=0,__fpsT=0; (function fl(ts){ if(!document.body.contains(bd))return; if(!__fpsT)__fpsT=ts; __frames++; if(ts-__fpsT>=1000){__fps=Math.round(__frames*1000/(ts-__fpsT));__frames=0;__fpsT=ts;} requestAnimationFrame(fl); })(performance.now());
  function loadScreen(){ scrGrid.innerHTML="";
    var wins=document.querySelectorAll(".mw-dockitem").length; var sh=document.getElementById("mw-shell"); var active=(sh&&sh.style.display!=="none"&&sh.__ttl)?sh.__ttl.textContent:"—";
    scrGrid.appendChild(tile("Windows open",num(wins),RED));
    scrGrid.appendChild(tile("Active window",active||"—"));
    scrGrid.appendChild(tile("Viewport",window.innerWidth+"×"+window.innerHeight));
    scrGrid.appendChild(tile("FPS",__fps||"—",(__fps&&__fps<30)?"#f5c451":"#9be59b"));
    try{ if(performance&&performance.memory){ scrGrid.appendChild(tile("JS heap",num(performance.memory.usedJSHeapSize))); } }catch(e){}
  }
  function load(){fetch("/api/live_analysis",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:"{}"}).then(function(r){return r.json();}).then(function(j){
    var c=(j&&j.counts)||{};grid.innerHTML="";
    grid.appendChild(tile("Spawn nodes",num(c.spawn_nodes),RED));
    grid.appendChild(tile("Customers",num(c.customers)));
    grid.appendChild(tile("Wallets",num(c.wallets)));
    grid.appendChild(tile("deepinfra queue",num(c.deepinfra_queue)));
    grid.appendChild(tile("Pending",num(c.deepinfra_queue_pending)));
    grid.appendChild(tile("Room msgs",num(c.room_msgs)));
    grid.appendChild(tile("Live seats 2m",num(j&&j.live_seats_2m)));
    grid.appendChild(tile("Broken handles",num(j&&j.broken_handle_nodes),(j&&j.broken_handle_nodes)>0?"#ff6a6a":"#9be59b"));
    var seats=(j&&j.seats)||[];
    seatsBody.innerHTML=seats.length?seats.map(function(s){var age=Number(s.age_s||0);var dot=age<120?"#3ecf6a":(age<1800?"#f5c451":"#6b7280");return '<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.06)"><span style="width:8px;height:8px;border-radius:50%;background:'+dot+'"></span><span style="flex:1;color:#cdd6e6;font-size:12px">'+String(s.author||"?").replace(/[<>&]/g,"")+'</span><span style="color:#8a96ab;font:600 11px Inter">'+(age<120?"now":(age<3600?Math.round(age/60)+"m":Math.round(age/3600)+"h"))+'</span></div>';}).join(""):'<div style="opacity:.5;padding:10px 0">no live seats</div>';
    var ps=(j&&j.problem_set)||{};var prob=[];if(ps.spawn_nodes_empty)prob.push("spawn empty");if(ps.deepinfra_queue_backlog)prob.push("queue backlog");if(ps.seats_dark)prob.push("seats dark");
    var ts=document.getElementById("anf-ts");if(ts)ts.textContent=(prob.length?("⚠ "+prob.join(" · ")):"healthy")+" · live";
  }).catch(function(){var ts=document.getElementById("anf-ts");if(ts)ts.textContent="rail unreachable";});}
  load();loadScreen();var t=setInterval(load,10000);var t2=setInterval(loadScreen,1500);
  try{var mo=new MutationObserver(function(){if(!document.body.contains(bd)){clearInterval(t);clearInterval(t2);mo.disconnect();}});mo.observe(document.body,{childList:true,subtree:true});}catch(e){}
};
})();
