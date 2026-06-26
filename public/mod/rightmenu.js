(function(){
  /* [COMPOSER - DESIGN FRONTEND v3 2026-06-21] THE ONE RIGHT DRAWER - the single nav. ALL scattered tabs (auth + features) are hidden; everything lives in this slide-out: auth (Sign up/in/out) at the TOP, then Features/Journey/Music/TV/Studio/CRM/Controls. Each opens the SAME universal window. The handle shows "SIGN UP" when logged out (CTA never disappears), "MENU" when signed in. No stacked tabs - one drawer. Role/auth via the listener authority (/api/song/view: who + listening_as). */
  if(document.getElementById('mb-menu'))return;
  var GLASS='background:rgba(18,20,28,0.5);-webkit-backdrop-filter:blur(7px);backdrop-filter:blur(7px);';
  /* hide EVERY scattered edge tab + the dock column - the drawer is the only nav now */
  var st=document.createElement('style'); st.textContent='#sutab,#sitab,#livetab,#mctab,#studiotab,#musictab,#tvtab,#mb-hubtab,#mb-journeytab,#mb-crmtab,#mw-tabcol{display:none!important}'; document.head.appendChild(st);
  var handle=document.createElement('div'); handle.id='mb-menuhandle'; handle.title='Menu';
  handle.style.cssText='position:fixed;right:0;top:50%;transform:translateY(-50%);z-index:40;writing-mode:vertical-rl;background:linear-gradient(135deg,#c41e3a,#ff5f6d);color:#fff;font-weight:800;font-size:11px;letter-spacing:.18em;padding:20px 9px;border-radius:12px 0 0 12px;cursor:pointer;box-shadow:0 6px 22px rgba(0,0,0,.45);transition:opacity .2s';
  handle.textContent='MENU';
  var panel=document.createElement('div'); panel.id='mb-menu';
  panel.style.cssText='position:fixed;right:0;top:0;height:100vh;width:264px;max-width:84vw;z-index:41;transform:translateX(100%);transition:transform .25s ease;display:flex;flex-direction:column;color:#eef2ff;font-family:Inter,system-ui,sans-serif;border-left:1px solid rgba(255,255,255,0.14);box-shadow:-14px 0 50px rgba(0,0,0,0.45);'+GLASS;
  document.body.appendChild(handle); document.body.appendChild(panel);
  var open=false; function toggle(v){ open=(v==null)?!open:v; panel.style.transform=open?'translateX(0)':'translateX(100%)'; handle.style.opacity=open?'0':'1'; }
  handle.addEventListener('click',function(){ toggle(true); load(); });
  function go(k,label){ if(window.openWindow){ window.openWindow({k:k,label:label}); } }
  function row(label,sub,fn,accent){ var d=document.createElement('div'); d.style.cssText='padding:12px 18px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.07);display:flex;flex-direction:column;gap:2px'; d.onmouseenter=function(){d.style.background='rgba(255,255,255,0.06)';}; d.onmouseleave=function(){d.style.background='';}; d.innerHTML='<div style="font-weight:700;font-size:13.5px;color:'+(accent||'#fff')+'">'+label+'</div>'+(sub?'<div style="font-size:11px;color:#9fb0d0">'+sub+'</div>':''); d.onclick=function(){ toggle(false); try{fn();}catch(e){} }; return d; }
  window.__winRender=window.__winRender||{};
  window.__winRender.features=function(bd,stt){
    var admin=/^(admin|owner|ceo)$/i.test(String((window.__listenAs)||''));
    var items=[['Credit Repair','Connect, dispute, raise your score','journey'],['Your Song & Studio','Your Memelli song','music'],['Memelli TV','Live channels','tv'],['Coaching','1-on-1 + business','coaching']];
    if(admin){ items.push(['Studio (DAW)','Full studio','studio']); items.push(['CRM','Clients & sales','crm']); }
    bd.innerHTML='<div style="max-width:760px;margin:0 auto;width:100%;padding:6px 4px"><div style="font-weight:800;font-size:18px;margin-bottom:4px">Features</div><div style="font-size:12.5px;color:#9fb0d0;margin-bottom:16px">Every feature, one membership - wrapped in your Memelli flow.</div><div id="mb-fgrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px"></div></div>';
    var g=bd.querySelector('#mb-fgrid');
    items.forEach(function(it){ var c=document.createElement('div'); c.style.cssText='background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);border-radius:14px;padding:15px;cursor:pointer'; c.onmouseenter=function(){c.style.borderColor='rgba(196,30,58,.6)';}; c.onmouseleave=function(){c.style.borderColor='rgba(255,255,255,0.12)';}; c.innerHTML='<div style="font-weight:800;font-size:14px">'+it[0]+'</div><div style="font-size:11.5px;color:#9fb0d0;margin-top:5px;line-height:1.35">'+it[1]+'</div>'; c.onclick=function(){ go(it[2], it[0]); }; g.appendChild(c); });
  };
  window.__winRender.crm=function(bd,stt){
    function esc(x){return String(x==null?'':x).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
    function money(c){return '$'+((Number(c)||0)/100).toFixed(2);}
    var W={list:null,detail:null,rows:null,cs:[],sel:null};
    bd.innerHTML='<div style="opacity:.7;padding:20px">Loading CRM...</div>';
    function frame(){
      bd.innerHTML='<div style="display:flex;flex-direction:column;height:100%;width:100%;box-sizing:border-box;color:#fff;font:13px Inter">'
        +'<div style="flex:0 0 auto;padding:2px 2px 12px"><div style="font:800 19px Inter">CRM - Clients &amp; Sales</div><div id="crmsum" style="font:600 11px Inter;color:#9fb0d0;text-transform:uppercase;letter-spacing:.05em;margin-top:2px"></div></div>'
        +'<div style="flex:1;min-height:0;display:flex;gap:14px">'
        +'<div style="flex:0 0 320px;display:flex;flex-direction:column;min-height:0;border:1px solid rgba(255,255,255,.12);border-radius:12px;background:rgba(255,255,255,.03)">'
          +'<input id="crmq" placeholder="Search clients..." style="margin:10px;box-sizing:border-box;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.22);border-radius:9px;padding:9px 11px;color:#fff;outline:none">'
          +'<div id="crmrows" style="flex:1;min-height:0;overflow-y:auto;padding:0 6px 8px"></div>'
        +'</div>'
        +'<div id="crmdetail" style="flex:1;min-width:0;overflow-y:auto;border:1px solid rgba(255,255,255,.12);border-radius:12px;background:rgba(255,255,255,.03);padding:18px"><div style="opacity:.5;font:600 13px Inter;display:flex;height:100%;align-items:center;justify-content:center">Select a client to see their full record</div></div>'
        +'</div></div>';
      W.rows=bd.querySelector('#crmrows'); W.detail=bd.querySelector('#crmdetail'); W.sum=bd.querySelector('#crmsum');
      var q=bd.querySelector('#crmq'); q.oninput=function(){paintList(q.value);};
    }
    function paintList(qq){ W.rows.innerHTML=''; W.cs.filter(function(c){return !qq||JSON.stringify(c).toLowerCase().indexOf(qq.toLowerCase())>=0;}).forEach(function(c){ var r=document.createElement('div'); var on=(W.sel===(c.id||c.email)); r.style.cssText='cursor:pointer;padding:9px 10px;border-radius:9px;margin-bottom:4px;border:1px solid '+(on?'#c41e3a':'transparent')+';background:'+(on?'rgba(196,30,58,.18)':'transparent'); r.onmouseover=function(){if(!on)r.style.background='rgba(255,255,255,.05)';}; r.onmouseout=function(){if(!on)r.style.background='transparent';}; r.innerHTML='<div style="font:600 13px Inter;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(c.name||c.email||'client')+'</div><div style="font:500 11px Inter;color:#9fb0d0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(c.email||'')+' - '+esc(c.pipeline_stage||'')+'</div>'; r.onclick=function(){ W.sel=(c.id||c.email); paintList(q_val()); showDetail(c.id||c.email); }; W.rows.appendChild(r); }); if(!W.rows.children.length)W.rows.innerHTML='<div style="opacity:.6;padding:10px;font-size:12px">No matches.</div>'; }
    function q_val(){ var q=bd.querySelector('#crmq'); return q?q.value:''; }
    function sect(title,inner){ return '<div style="margin-bottom:16px"><div style="font:700 12px Inter;text-transform:uppercase;letter-spacing:.06em;color:#9fb0d0;margin-bottom:7px">'+title+'</div>'+inner+'</div>'; }
    function kv(o){ var ks=Object.keys(o||{}); if(!ks.length)return '<div style="opacity:.45;font-size:12px">none</div>'; return '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px">'+ks.map(function(k){return '<div style="background:rgba(255,255,255,.05);border-radius:8px;padding:8px 10px"><div style="font:600 10px Inter;color:#9fb0d0;text-transform:uppercase">'+esc(k)+'</div><div style="font:600 13px Inter">'+esc(o[k])+'</div></div>';}).join('')+'</div>'; }
    function rowsList(arr,cols){ if(!arr||!arr.length)return '<div style="opacity:.45;font-size:12px">none</div>'; return '<div style="display:flex;flex-direction:column;gap:6px">'+arr.map(function(x){ return '<div style="background:rgba(255,255,255,.05);border-radius:8px;padding:8px 10px;display:flex;gap:14px;flex-wrap:wrap">'+cols.map(function(c){return '<span style="font:600 12px Inter"><span style="color:#9fb0d0">'+esc(c)+':</span> '+esc(c==='cents'?money(x[c]):x[c])+'</span>';}).join('')+'</div>'; }).join('')+'</div>'; }
    function showDetail(id){ W.detail.innerHTML='<div style="opacity:.6;padding:6px">Loading...</div>';
      fetch('/api/admin_crm?customer_id='+encodeURIComponent(id),{credentials:'include'}).then(function(r){return r.json();}).then(function(j){ var c=j.client||j.customer||j;
        var nm=(c.contact&&(c.contact.name||c.contact.email))||c.name||c.email||id;
        var h='<div style="font:800 18px Inter;margin-bottom:14px">'+esc(nm)+'</div>';
        h+=sect('Contact',kv(c.contact)); h+=sect('Account',kv(c.account));
        h+=sect('Credit profiles',rowsList(c.credit_profiles,['score','band','bureau']));
        h+=sect('Disputes',rowsList(c.disputes,['item','status','round']));
        h+=sect('Funding',rowsList(c.funding,['amount','status','lender']));
        h+=sect('Orders',rowsList(c.orders,['cents','status','created_at']));
        h+=sect('Subscriptions',rowsList(c.subscriptions,['plan','status']));
        W.detail.innerHTML=h;
      }).catch(function(){ W.detail.innerHTML='<div style="opacity:.7;padding:6px">Could not load client.</div>'; });
    }
    fetch('/api/admin_crm',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:'{}'}).then(function(r){return r.json();}).then(function(j){
      if(!j||!j.ok){ bd.innerHTML='<div style="opacity:.8;padding:20px">The CRM is admin only - sign in as admin.</div>'; return; }
      frame(); W.cs=j.clients||[]; var sm=j.summary||{}; W.sum.textContent=W.cs.length+' clients - '+(sm.disputes||0)+' disputes - '+(sm.active_subs||0)+' subs - '+(sm.funding_apps||0)+' funding'; paintList('');
    }).catch(function(){ bd.innerHTML='<div style="opacity:.8;padding:20px">Could not load CRM.</div>'; });
  };
  function render(signedIn, role){
    var admin=/^(admin|owner|ceo)$/i.test(role);
    panel.innerHTML='';
    var hd=document.createElement('div'); hd.style.cssText='padding:18px 18px 12px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.12)';
    hd.innerHTML='<div><div style="font-weight:800;font-size:15px">Menu</div><div style="font-size:11px;color:#9fb0d0">'+(signedIn?('Signed in'+(role?(' Â· '+role):'')):'Welcome - create your account')+'</div></div>';
    var x=document.createElement('div'); x.textContent='Ã—'; x.style.cssText='cursor:pointer;font-size:22px;opacity:.6'; x.onclick=function(){toggle(false);}; hd.appendChild(x);
    panel.appendChild(hd);
    var auth=document.createElement('div'); auth.style.cssText='border-bottom:1px solid rgba(255,255,255,0.12)';
    if(signedIn){ auth.appendChild(row('Sign out','End your session',function(){ fetch('/api/auth/logout',{method:'POST',credentials:'include'}).catch(function(){}).then(function(){ try{localStorage.removeItem('memelli_token');}catch(e){} location.reload(); }); },'#ff9db0')); }
    else { auth.appendChild(row('Sign up','Create your free account',function(){ go('signup','Sign Up'); },'#5fff9f')); auth.appendChild(row('Sign in','Welcome back',function(){ if(window.openWindow)window.openWindow({k:'signup',label:'Sign In',mode:'login'}); })); }
    panel.appendChild(auth);
    var nav=document.createElement('div'); nav.style.cssText='overflow:auto;flex:1';
    nav.appendChild(row('Features','Everything in your membership',function(){ go('features','Features'); }));
    nav.appendChild(row('Store','Plans & services à la carte',function(){ go('store','Store'); }));
    nav.appendChild(row('Journey','Your credit journey',function(){ go('journey','My Credit Journey'); }));
    nav.appendChild(row('Music','Your song & studio',function(){ go('music','Music'); }));
    nav.appendChild(row('TV','Live channels',function(){ go('tv','Live TV'); }));
    if(admin){ nav.appendChild(row('Studio','The DAW',function(){ go('studio','Studio'); },'#9fe9bd')); nav.appendChild(row('CRM','Clients & sales',function(){ go('crm','CRM'); },'#9fe9bd')); nav.appendChild(row('Credit Review','Review & file client disputes',function(){ go('creditreview','Credit Review'); },'#9fe9bd')); nav.appendChild(row('Catalog','Edit prices, plans & reseller',function(){ go('admin_catalog','Catalog Editor'); },'#9fe9bd')); nav.appendChild(row('Flows','Order the journey windows',function(){ go('flows','Flow Order'); },'#9fe9bd')); nav.appendChild(row('Master Background Controls','Tune the background screen',function(){ go('look','Master Background Controls'); },'#9fe9bd')); }
    panel.appendChild(nav);
    /* always-present escape hatch so you can NEVER be trapped (switch account) */
    var foot=document.createElement('div'); foot.style.cssText='border-top:1px solid rgba(255,255,255,0.12);padding:11px 18px;font-size:12px;color:#9fb0d0;cursor:pointer'; foot.textContent=signedIn?'Sign out / switch account':'Sign out (reset session)';
    foot.onclick=function(){ toggle(false); fetch('/api/auth/logout',{method:'POST',credentials:'include'}).catch(function(){}).then(function(){ try{localStorage.removeItem('memelli_token');}catch(e){} location.reload(); }); };
    panel.appendChild(foot);
  }
  function jget(u){ return fetch(u,{credentials:'include'}).then(function(r){return r.json();}).catch(function(){return {};}); }
  function load(){ Promise.all([jget('/api/auth/whoami'),jget('/api/song/view')]).then(function(a){ var w=a[0]||{}; var who=w.user||w.whoami||w; var signedIn=!!((w.ok&&who&&(who.id||who.email))||(a[1]&&a[1].who)); window.__listenAs=String((a[1]&&a[1].listening_as)||''); render(signedIn, window.__listenAs); }); }
  load();
  document.addEventListener('click',function(e){ if(open && !panel.contains(e.target) && e.target!==handle){ toggle(false); } });
})();
