(function(){
  /* [autonomous 2026-06-23] FEATURE HUB — now renders through the UNIVERSAL window (openWindow {k:'features'}),
     same design, NOT its own #mb-hubwin overlay thrown on the page. Plan badges + ladder ride /api/funnel/plans. */
  function esc(x){return String(x==null?'':x).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  var ROLE='client', PLANS=[];
  var FEATURES=[
    {k:'journey', name:'My Journey', desc:'Your path: connect -> repair -> funded', icon:'&#9678;', plan:'Free', open:function(){if(window.openWindow)window.openWindow({k:'journey',label:'My Journey'});}},
    {k:'credit', name:'Credit Repair', desc:'Connect SmartCredit, dispute, raise your score', icon:'&#9650;', plan:'Free', open:function(){if(window.openWindow)window.openWindow({k:'credit_repair',label:'Credit Repair'});}},
    {k:'funding', name:'Business Funding', desc:'Get matched and funded', icon:'$', plan:'Business Builder', open:function(){if(window.openWindow)window.openWindow({k:'funding',label:'Business Funding'});}},
    {k:'store', name:'Store', desc:'Plans & business services à la carte', icon:'&#128722;', plan:'Free', open:function(){if(window.openWindow)window.openWindow({k:'store',label:'Store'});}},
    {k:'music', name:'Your Song & Studio', desc:'Your Memelli song; full DAW for owners', icon:'&#9835;', plan:'Membership', open:function(){if(window.openWindow)window.openWindow({k:'music',label:'Music'});}},
    {k:'tv', name:'Memelli TV', desc:'Live channels and shows', icon:'&#9654;', plan:'Membership', open:function(){if(window.openWindow)window.openWindow({k:'tv',label:'Live TV'});}},
    {k:'coaching', name:'Coaching', desc:'1-on-1 + business frameworks', icon:'&#9670;', plan:'Growth', open:function(){var a=document.getElementById('ask');if(a){a.value='Start my coaching';var s=document.getElementById('sendb');if(s)s.click();}}},
    {k:'crm', name:'CRM', desc:'Clients & sales', icon:'&#9638;', plan:'Owner', role:'admin', open:function(){if(window.openWindow)window.openWindow({k:'crm',label:'CRM'});}}
  ];
  function planLadder(){return '<div style="margin-top:8px">'+PLANS.map(function(p){return '<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-top:1px solid rgba(255,255,255,.08)"><div><div style="font-weight:700;font-size:13px">'+esc(p.name)+'</div><div style="font-size:11px;color:#7e8cad">'+esc((p.unlocks||[]).join(' &middot; '))+'</div></div><div style="font-weight:800;color:#ffd479">'+esc(p.price)+'<span style="font-size:10px;color:#7e8cad">/'+esc(p.per||'mo')+'</span></div></div>';}).join('')+'</div>';}
  function card(f){var locked=(f.role==='admin'&&!/^(ceo|admin|owner)$/i.test(ROLE));return '<div class="mb-fcard" data-k="'+f.k+'" style="position:relative;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:15px;cursor:pointer;transition:border-color .15s">'+(locked?'<div style="position:absolute;top:10px;right:12px;font-size:11px">&#128274;</div>':'')+'<div style="font-size:22px;margin-bottom:7px">'+f.icon+'</div><div style="font-weight:800;font-size:14px">'+esc(f.name)+'</div><div style="font-size:11.5px;color:#9fb0d0;margin:4px 0 9px;line-height:1.35">'+esc(f.desc)+'</div><div style="display:inline-block;font-size:10px;font-weight:700;letter-spacing:.04em;color:'+(f.plan==='Free'?'#5fff9f':'#ffd479')+';background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:8px;padding:3px 8px">'+esc(f.plan)+'</div></div>';}
  function renderInto(bd){
    var feats=FEATURES.filter(function(f){return !(f.role==='admin'&&!/^(ceo|admin|owner)$/i.test(ROLE));});
    var grid='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;margin:14px 0">'+feats.map(card).join('')+'</div>';
    var head='<div style="font-weight:800;font-size:19px;margin-bottom:6px">Features</div>';
    var sub='<div style="font-size:12.5px;color:#9fb0d0;margin-bottom:6px">Every feature, wrapped in your Memelli membership. <span id="mb-hubplans" style="color:#ffd479;cursor:pointer;text-decoration:underline">See all plans</span></div>';
    bd.innerHTML=head+sub+grid;
    Array.prototype.forEach.call(bd.querySelectorAll('.mb-fcard'),function(el){el.onclick=function(){var k=el.getAttribute('data-k');var f=FEATURES.filter(function(x){return x.k===k;})[0];if(!f)return;if(f.role==='admin'&&!/^(ceo|admin|owner)$/i.test(ROLE)){showPlans(bd);return;}try{f.open();}catch(e){}};el.onmouseenter=function(){el.style.borderColor='rgba(196,30,58,.6)';};el.onmouseleave=function(){el.style.borderColor='rgba(255,255,255,.1)';};});
    var pl=bd.querySelector('#mb-hubplans');if(pl)pl.onclick=function(){showPlans(bd);};
  }
  function showPlans(bd){ bd.innerHTML='<div style="font-weight:800;font-size:19px;margin-bottom:6px">Membership &mdash; every feature, one flow</div><div style="font-size:12.5px;color:#9fb0d0;margin-bottom:4px">Pick the tier that unlocks the features you want.</div>'+planLadder(); }
  window.__winRender=window.__winRender||{};
  window.__winRender.features=function(bd,st){
    bd.innerHTML='<div style="opacity:.7;padding:20px">Loading features…</div>';
    Promise.all([
      fetch('/api/song/view',{credentials:'include'}).then(function(r){return r.json();}).catch(function(){return{};}),
      fetch('/api/funnel/plans',{credentials:'include'}).then(function(r){return r.json();}).catch(function(){return{};})
    ]).then(function(a){ ROLE=String((a[0]&&a[0].listening_as)||'client'); PLANS=(a[1]&&a[1].ladder)||[]; renderInto(bd); });
  };
  window.mbOpenHub=function(){ if(window.openWindow)window.openWindow({k:'features',label:'Features'}); };
  function addTab(){if(document.getElementById('mb-hubtab'))return;var t=document.createElement('div');t.id='mb-hubtab';t.textContent='FEATURES';t.style.cssText='position:fixed;right:0;top:18%;transform:translateY(-50%);writing-mode:vertical-rl;background:linear-gradient(135deg,#c41e3a,#ff5f6d);color:#fff;font-weight:800;font-size:11px;letter-spacing:.14em;padding:16px 7px;border-radius:10px 0 0 10px;cursor:pointer;z-index:25;box-shadow:0 6px 22px rgba(0,0,0,.4)';t.onclick=function(){ if(window.openWindow)window.openWindow({k:'features',label:'Features'}); };document.body.appendChild(t);}
  var t=setInterval(function(){if(document.body){clearInterval(t);addTab();}},500);
})();
