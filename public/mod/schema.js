/* [bar_mel 2026-06-22] MINIMUM-SCHEMA RENDERER — the hot-swap seam.
   The shell stays thin + permanent; the actual UI lives as rows in
   control_store.ui_view_schemas that the SPAWN writes. This module plugs into
   the shell's EXISTING window registry (window.__winRender) so opening a window
   by its view_key renders whatever schema the rail currently holds, bound live
   to the customer's _CUSTCTX. Change a row -> the UI changes. No redeploy.
   THE TABLE IS THE PROGRAM. */
(function(){
  // localhost dev: call the rail DIRECTLY (cross-origin; the nodes send CORS * + handle OPTIONS) to
  // bypass the Next dev-proxy HTTP/1.1 connection starvation caused by scene.js's long-lived video
  // stream — that starvation is what hung POST /api/hydrate past the timeout. Production (served from
  // the rail) is same-origin, so RAIL='' and nothing changes.
  var RAIL=(location.hostname==='localhost'||location.hostname==='127.0.0.1')?'https://memelli-bar-control.up.railway.app':'';
  // --- data-path resolver: handles OBJECT fields (customer_demographics.name)
  //     AND ARRAY indices (active_disputes.0.bureau). Grounded to the real
  //     _CUSTCTX shape: demographics/business = objects; funding/disputes = arrays.
  function resolvePath(obj, path){
    if(!path) return '';
    var v = path.split('.').reduce(function(acc, seg){
      if(acc==null) return undefined;
      return acc[seg];
    }, obj);
    return (v==null) ? '' : v;
  }

  // --- VISIBLE wall animation: ramp __scene.setMorph over time so the particles
  //     actually MOVE (scatter->gather) when a view opens. setMorph sets instantly,
  //     so we step it across frames here to make the motion eye-visible. ---
  function animateMorph(from, to, ms){
    /* [2026-06-25 Mel] NO-OP — window content NEVER drives the master-background wall (that re-scattered the already-formed wall = "the morph double-loading"). The master background is owned ONLY by Master Background Controls. */
    return;
    try{ var S=window.__scene; if(!S||!S.setMorph) return;
      var t0=null, dur=ms||700;
      function step(ts){ if(t0===null)t0=ts; var k=Math.min(1,(ts-t0)/dur);
        var e=k<0.5?2*k*k:1-Math.pow(-2*k+2,2)/2; // easeInOutQuad
        S.setMorph(from+(to-from)*e); if(k<1) requestAnimationFrame(step); else { if(to>=0.98 && S.play) {} } }
      requestAnimationFrame(step);
    }catch(e){}
  }

  // --- one glass card / input / textarea / button, built from a component spec ---
  function buildComponent(spec, ctx){
    var bound = resolvePath(ctx, spec.source_path||'');
    var el = document.createElement('div');
    if(spec.type==='DATA_CARD'){
      var urgent = spec.variant==='urgency';
      el.style.cssText='padding:14px 16px;border-radius:12px;background:rgba(255,255,255,0.035);border:1px solid '+(urgent?'rgba(251,191,36,0.32)':'rgba(255,255,255,0.10)')+';box-shadow:0 4px 18px rgba(0,0,0,0.22)';
      var lab=document.createElement('div');
      lab.textContent=spec.label||'';
      lab.style.cssText='font:700 10px Inter,system-ui;letter-spacing:.10em;text-transform:uppercase;color:'+(urgent?'rgba(251,191,36,0.85)':'rgba(255,255,255,0.42)')+';margin-bottom:5px';
      var val=document.createElement('div');
      val.textContent=(bound!=='' ? String(bound) : '—');
      val.style.cssText='font:'+(urgent?'800 34px':'700 21px')+' Inter,system-ui;color:'+(urgent?'#fbbf24':'#fff')+';letter-spacing:-0.01em'+(urgent?';text-shadow:0 0 14px rgba(251,191,36,0.35)':'');
      el.appendChild(lab); el.appendChild(val);
    } else if(spec.type==='TEXT_INPUT' || spec.type==='TEXT_AREA'){
      el.style.cssText='display:flex;flex-direction:column';
      var l2=document.createElement('label');
      l2.textContent=spec.label||'';
      l2.style.cssText='font:700 10px Inter,system-ui;letter-spacing:.10em;text-transform:uppercase;color:rgba(255,255,255,0.42);margin-bottom:7px';
      var inp=document.createElement(spec.type==='TEXT_AREA'?'textarea':'input');
      if(spec.type==='TEXT_AREA'){ inp.rows=5; } else { inp.type='text'; inp.value=(bound!=='' ? String(bound):''); }
      inp.name=spec.name||'field'; inp.setAttribute('data-field', spec.name||'field');
      if(spec.placeholder) inp.placeholder=spec.placeholder;
      inp.style.cssText='width:100%;box-sizing:border-box;padding:12px 13px;border-radius:11px;background:rgba(2,6,23,0.45);border:1px solid rgba(255,255,255,0.12);color:#fff;font:400 14px Inter,system-ui;outline:none;resize:none'+(spec.type==='TEXT_AREA'?';min-height:120px':'');
      // focus -> VISIBLE scatter/dissolve via the REAL window.__scene methods
      inp.addEventListener('focus',function(){ try{ var S=window.__scene; if(S){ S.setDensity(0.4); } animateMorph(S?S.morph:1,0,400); inp.style.borderColor='rgba(59,130,246,0.55)'; }catch(e){} });
      inp.addEventListener('blur', function(){ try{ var S=window.__scene; if(S){ S.setDensity(1); } animateMorph(0,1,500); inp.style.borderColor='rgba(255,255,255,0.12)'; }catch(e){} });
      el.appendChild(l2); el.appendChild(inp);
    } else if(spec.type==='SUBMIT_BUTTON'){
      el.style.cssText='display:flex;justify-content:flex-end;margin-top:auto;padding-top:8px';
      var btn=document.createElement('button');
      btn.type='button'; btn.textContent=spec.text||'Submit';
      btn.setAttribute('data-submit','1');
      btn.style.cssText='padding:11px 22px;border:1px solid rgba(96,165,250,0.45);border-radius:11px;background:linear-gradient(180deg,#2563eb,#1d4ed8);color:#fff;font:700 13px Inter,system-ui;letter-spacing:.03em;cursor:pointer;box-shadow:0 8px 22px rgba(37,99,235,0.30)';
      el.appendChild(btn);
    }
    return el;
  }

  // --- identity: pass the mio_sess TOKEN VALUE in the body (the hydrator reads
  //     b.mio_sess -> app_sessions.token, NOT the cookie header) so the logged-in
  //     customer resolves natively with no proxy cookie-forwarding. customer_id is
  //     only sent if it's a FULL uuid (length>=32) — a truncated key is what caused
  //     the blank cards, so we never send one. ---
  function getCookie(n){ try{ var m=document.cookie.match('(?:^|; )'+n+'=([^;]*)'); return m?decodeURIComponent(m[1]):null; }catch(e){ return null; } }
  function identity(){
    var id={};
    var sess=getCookie('mio_sess'); if(sess) id.mio_sess=sess;
    try{ var cid=localStorage.getItem('memelli_customer_id'); if(cid && cid.length>=32) id.customer_id=cid; }catch(e){}
    return id;
  }
  // --- hydrate the live customer context (real fields, real customer). Uses fetchJSON
  //     (hoisted) so it CANNOT hang — 8s AbortController timeout, then falls back to {}. ---
  function hydrate(){
    return fetchJSON(RAIL+'/api/hydrate/customer/context',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(identity())},8000)
      .then(function(j){ return (j&&j._CUSTCTX)||{}; })
      .catch(function(){ return {}; });
  }

  // --- robust fetch: AbortController timeout so the render can NEVER hang on "Loading" ---
  function fetchJSON(url, opts, ms){
    opts=opts||{};
    try{ if(typeof AbortController!=='undefined'){ var ctrl=new AbortController(); opts.signal=ctrl.signal; setTimeout(function(){ try{ctrl.abort();}catch(e){} }, ms||8000); } }catch(e){}
    return fetch(url, opts).then(function(r){ return r.json(); });
  }

  // --- THE generic renderer: signature (bd, st) matches the shell's __winRender contract ---
  function renderSchemaView(bd, st){
    var key = st && st.k;
    bd.innerHTML='<div style="padding:24px;color:rgba(255,255,255,0.55);font:500 13px Inter,system-ui">Loading…</div>';
    // VISIBLE: scatter the wall the instant the view starts opening
    animateMorph((window.__scene&&window.__scene.morph)||1, 0, 350);
    Promise.all([
      fetchJSON(RAIL+'/api/view/schema?key='+encodeURIComponent(key), {}, 8000).catch(function(){return null;}),
      hydrate()
    ]).then(function(res){
      var schemaRow = res[0] && res[0].ok && res[0].view;
      var ctx = res[1] || {};
      if(!schemaRow){ bd.innerHTML='<div style="padding:24px;color:#f87171;font:500 13px Inter,system-ui">Could not load view "'+key+'" — schema fetch failed or timed out.</div>'; return; }
      renderLayout(bd, schemaRow, ctx);
      // VISIBLE: gather the particles as the populated view appears
      animateMorph(0, 1, 800);
    }).catch(function(err){
      bd.innerHTML='<div style="padding:24px;color:#f87171;font:500 13px Inter,system-ui">Render error: '+String(err&&err.message||err)+'</div>';
    });
  }

  // --- layout dispatcher: master_detail (35/65 glass split) or default single column ---
  function renderLayout(bd, schemaRow, ctx){
    var comps = schemaRow.components||[]; var title=schemaRow.title||'';
    bd.innerHTML='';
    if(schemaRow.layout_style==='master_detail'){
      var grid=document.createElement('div');
      grid.style.cssText='display:flex;width:100%;max-width:1000px;margin:0 auto;min-height:430px;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.12);background:rgba(8,10,20,0.34);box-shadow:0 24px 60px rgba(0,0,0,0.45)';
      var master=document.createElement('div');
      master.style.cssText='flex:0 0 35%;padding:22px;display:flex;flex-direction:column;gap:15px;background:rgba(2,6,23,0.30);border-right:1px solid rgba(255,255,255,0.09)';
      var mh=document.createElement('div'); mh.textContent='Client Profile'; mh.style.cssText='font:700 10px Inter,system-ui;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,0.40);margin-bottom:2px'; master.appendChild(mh);
      var detail=document.createElement('div');
      detail.style.cssText='flex:1 1 65%;padding:24px;display:flex;flex-direction:column;gap:16px';
      var dh=document.createElement('div'); dh.textContent=title; dh.style.cssText='font:200 25px Inter,system-ui;color:#fff;letter-spacing:.01em;margin:0 0 2px'; detail.appendChild(dh);
      comps.forEach(function(c){ ((c.pane==='master')?master:detail).appendChild(buildComponent(c, ctx)); });
      grid.appendChild(master); grid.appendChild(detail); bd.appendChild(grid);
    } else {
      var wrap=document.createElement('div'); wrap.style.cssText='padding:22px 22px 26px;max-width:560px;margin:0 auto';
      var h=document.createElement('div'); h.textContent=title; h.style.cssText='font:300 26px Inter,system-ui;color:#fff;margin:0 0 18px'; wrap.appendChild(h);
      comps.forEach(function(c){ wrap.appendChild(buildComponent(c, ctx)); });
      bd.appendChild(wrap);
    }
    // THE WALL BECOMES THE CONTENT (hybrid): crystallize the hero identity as particle-text on
    // #scene-text (name big, business as the real subtitle), and TWEEN the main wall scatter->solid.
    // NOT play() — play() snaps morph=1 with no animation once the page is >3.2s old (bug #3).
    try{
      var _nm=resolvePath(ctx,'customer_demographics.name'), _bz=resolvePath(ctx,'business_profile.entity_name');
      /* [2026-06-25 Mel] schema NO LONGER writes the MASTER word layer (window.__text) — it overrode your programmed word AND re-crystallized it ("the words re-morphing" double). The master word is owned ONLY by Master Background Controls; the name still shows in this window's own HUD. */ if(false && _nm && window.__text && window.__text.render){ window.__text.render(String(_nm), _bz?String(_bz):''); }
      animateMorph(0, 1, 2600);
    }catch(e){}
    // submit -> /api/bar/action -> re-hydrate -> re-render with fresh _CUSTCTX (with a gather animation)
    var sb=bd.querySelector('[data-submit]'); var vk=schemaRow.view_key;
    if(sb){ sb.addEventListener('click',function(){
      var fields={}; bd.querySelectorAll('[data-field]').forEach(function(i){ fields[i.getAttribute('data-field')]=i.value; });
      var ident=identity(); var orig=sb.textContent;
      sb.textContent='…'; sb.disabled=true;
      fetchJSON(RAIL+'/api/bar/action?view_key='+encodeURIComponent(vk), {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.assign({view_key:vk,payload:fields},ident))}, 9000)
        .then(function(j){ if(j&&j._CUSTCTX){ animateMorph(0,1,600); renderLayout(bd, schemaRow, j._CUSTCTX); } else { sb.textContent='Saved'; setTimeout(function(){sb.textContent=orig;sb.disabled=false;},1400); } })
        .catch(function(){ sb.textContent='Retry'; sb.disabled=false; });
    }); }
  }

  // --- register every rail view_key into the EXISTING shell registry so
  //     openWindow({k:view_key}) just works. This IS the hot-swap: new row -> openable. ---
  function registerAll(){
    window.__winRender = window.__winRender || {};
    fetch(RAIL+'/api/view/schema')
      .then(function(r){return r.json();})
      .then(function(j){ (j&&j.views||[]).forEach(function(row){ window.__winRender[row.view_key]=renderSchemaView; }); })
      .catch(function(){});
  }
  // ============================================================================
  // PATTERN B (LOCKED): Hybrid Hero + HUD. The HERO metric crystallizes out of the
  // particle wall (#scene-text); the crisp top-left HUD plate (NO blur) holds the
  // profile fields. Dynamic, not a loop. All bindings = real nested _CUSTCTX.
  // ============================================================================
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function heroMetric(ctx){
    var d=resolvePath(ctx,'active_disputes.0.days_to_deadline');
    if(d!=='' && d!=null) return String(d)+' DAYS REMAINING';
    var r=resolvePath(ctx,'active_disputes.0.current_round');
    return (r!==''&&r!=null) ? ('ROUND '+r+' ACTIVE') : 'ACTIVE ROUND';
  }
  function renderHeroHud(schemaRow, ctx, opts){
    opts=opts||{}; var loading=!!opts.loading;
    var name   = loading ? 'Synchronizing…' : (resolvePath(ctx,'customer_demographics.name')||'Active Profile');
    var biz    = loading ? '—' : (resolvePath(ctx,'business_profile.entity_name')||'Individual Track');
    var bureau = loading ? '—' : (resolvePath(ctx,'active_disputes.0.bureau')||'Pipeline');
    // HERO particle-text: loading -> CONNECTING; loaded -> the live metric (real subtitle, never a slug)
    /* [2026-06-25 Mel] schema does NOT drive the MASTER word layer here either (CONNECTING / metric) — that was the second re-crystallize. The hero metric belongs in this window's HUD, not the master word owned by Master Background Controls. */
    try{ if(false && window.__text&&window.__text.render){
      if(loading){ window.__text.render('CONNECTING','Establishing secure profile…'); }
      else { window.__text.render(heroMetric(ctx), 'Tracking Bureau: '+bureau); }
    } }catch(e){}
    // motion: scatter the wall WHILE waiting; crystallize (0->1 over 3s) when real data lands
    // (NOT play() — it snaps after 3.2s, bug #3)
    if(loading){ animateMorph((window.__scene&&window.__scene.morph)||1, 0, 400); }
    else { animateMorph(0,1,3000); }
    // HUD: crisp, unblurred, top-left corner plate over the live wall
    var hud=document.getElementById('memelli-glass-hud');
    if(!hud){ hud=document.createElement('div'); hud.id='memelli-glass-hud'; document.body.appendChild(hud); }
    hud.style.cssText='position:fixed;top:24px;left:24px;width:300px;padding:18px 20px;background:rgba(10,15,30,0.25);border:1px solid rgba(255,255,255,0.08);border-radius:12px;color:#fff;font-family:Inter,system-ui,sans-serif;box-shadow:0 12px 32px rgba(0,0,0,0.4);z-index:40';
    hud.innerHTML=''
      +'<div style="display:flex;align-items:center;margin-bottom:13px">'
      +'<div style="width:12px;height:12px;background:#fff;margin-right:9px;clip-path:polygon(50% 0%,100% 100%,0% 100%)"></div>'
      +'<div style="font:500 15px Inter,system-ui;letter-spacing:.3px">'+esc(name)+'</div></div>'
      +'<div style="border-top:1px solid rgba(255,255,255,0.07);margin-bottom:13px"></div>'
      +'<div style="font:700 9px Inter,system-ui;letter-spacing:.10em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:3px">Business Entity</div>'
      +'<div style="font:700 13px Inter,system-ui;margin-bottom:11px">'+esc(biz)+'</div>'
      +'<div style="font:700 9px Inter,system-ui;letter-spacing:.10em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:3px">Dispute Route</div>'
      +'<div style="font:700 13px Inter,system-ui;color:#10b981">Active Bureau: '+esc(bureau)+'</div>';
  }
  window.renderHeroHud = renderHeroHud;
  // SOLUTION B: paint instantly (stage 1, no blank) -> async data flight (stage 2, rail-direct) ->
  // crystallize the REAL metric when _CUSTCTX lands (stage 3). No master-detail window, correct routes.
  window.openHeroView = function(key){
    renderHeroHud({view_key:key}, {}, {loading:true});            // STAGE 1 — 0ms paint, immediate motion
    Promise.all([                                                 // STAGE 2 — background fetch (rail-direct)
      fetchJSON(RAIL+'/api/view/schema?key='+encodeURIComponent(key),{},8000).catch(function(){return null;}),
      hydrate()
    ]).then(function(res){                                        // STAGE 3 — real data + crystallize
      var schemaRow=(res[0]&&res[0].ok&&res[0].view)||{view_key:key}; renderHeroHud(schemaRow, res[1]||{});
    });
  };

  // public opener + the generic handler, exposed for the bar/deepinfra to call
  window.__renderSchemaView = renderSchemaView;
  window.openSchemaView = function(key,label){ window.__winRender=window.__winRender||{}; window.__winRender[key]=renderSchemaView; if(window.openWindow) window.openWindow({k:key,label:label||key}); };
  if(document.readyState!=='loading') registerAll(); else document.addEventListener('DOMContentLoaded', registerAll);
})();
