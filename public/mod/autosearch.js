(function(){
  if(window.__autosearchInit)return; window.__autosearchInit=true;
  // [autosearch 2026-06-24] dynamic search palette over the window catalog -> replaces the hardcoded
  // slide-out. Type intent -> match keywords -> openWindow the right window (reuses the singleton).
  // Ctrl/Cmd+K or the search button. Role-gated (admin items hidden for clients). New module.
  var CAT=[
    {k:'journey',label:'My Journey',kw:'journey credit progress steps path',role:0},
    {k:'credit_repair',label:'Credit Repair',kw:'credit repair disputes fix bureau tri-merge derogatory',role:0},
    {k:'smartcredit',label:'Check SmartCredit',kw:'smartcredit pull credit connect trial report',role:0},
    {k:'decision',label:'Funding Decision',kw:'decision funding approve qualify denied',role:0},
    {k:'prequal',label:'Pre-qualified',kw:'prequalified pre qualified offers',role:0},
    {k:'funding',label:'Funding',kw:'funding offers lenders money capital',role:0},
    {k:'store',label:'Store',kw:'store plans products buy pricing services cart tradeline',role:0},
    {k:'features',label:'Plans & Features',kw:'features membership plans tiers',role:0},
    {k:'music',label:'Music',kw:'music song studio play',role:0},
    {k:'tv',label:'TV',kw:'tv channels watch live',role:0},
    {k:'dialpad',label:'Business Phone',kw:'phone call text dialpad business sms',role:0},
    {k:'crm',label:'CRM',kw:'crm clients customers roster process disputes admin',role:1},
    {k:'analytics',label:'Analytics',kw:'analytics stats machine live counts admin',role:1},
    {k:'look',label:'Master Background Controls',kw:'master background controls design wall color tint morph glow words text settings edit screen layer',role:1},
    {k:'admin_catalog',label:'Catalog',kw:'catalog prices edit plans reseller products',role:1},
    {k:'studio',label:'Studio',kw:'studio daw generate video voiceover',role:1},
    {k:'flows',label:'Flows',kw:'flows order journey windows',role:1}
  ];
  function isAdmin(){ return /^(admin|owner|ceo)$/i.test(String((window.__listenAs||(window.__me&&window.__me.role))||'')); }
  var overlay,input,list;
  function build(){
    overlay=document.createElement('div'); overlay.id='mb-search'; overlay.style.cssText='position:fixed;inset:0;z-index:80;display:none;background:rgba(0,0,0,.5)';
    var box=document.createElement('div'); box.style.cssText='position:absolute;top:13%;left:50%;transform:translateX(-50%);width:min(560px,92vw);background:rgba(14,14,20,.96);border:1px solid rgba(255,255,255,.14);border-radius:16px;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,.6)';
    input=document.createElement('input'); input.placeholder='Search anything - windows, settings, design...'; input.style.cssText='width:100%;box-sizing:border-box;background:transparent;border:0;border-bottom:1px solid rgba(255,255,255,.1);color:#fff;font:16px Inter,system-ui;padding:16px 18px;outline:none';
    list=document.createElement('div'); list.style.cssText='max-height:54vh;overflow:auto;padding:6px';
    box.appendChild(input); box.appendChild(list); overlay.appendChild(box); document.body.appendChild(overlay);
    overlay.addEventListener('click',function(e){ if(e.target===overlay) close(); });
    input.addEventListener('input',render); input.addEventListener('keydown',function(e){ if(e.key==='Escape')close(); if(e.key==='Enter'){var f=list.querySelector('[data-k]'); if(f)f.click();} });
  }
  function render(){
    var q=(input.value||'').toLowerCase().trim(); var adm=isAdmin();
    var items=CAT.filter(function(c){ if(c.role&&!adm)return false; if(!q)return true; var hay=(c.label+' '+c.kw).toLowerCase(); return q.split(' ').every(function(w){return hay.indexOf(w)>=0;}); });
    list.innerHTML='';
    items.forEach(function(c){ var row=document.createElement('div'); row.setAttribute('data-k',c.k); row.style.cssText='display:flex;justify-content:space-between;align-items:center;padding:11px 14px;border-radius:10px;cursor:pointer;color:#fff;font:14px Inter,system-ui';
      row.innerHTML='<span style="font-weight:600">'+c.label+'</span>'+(c.role?'<span style="font-size:11px;color:#9fe9bd">admin</span>':'');
      row.onmouseenter=function(){row.style.background='rgba(196,30,58,.22)';}; row.onmouseleave=function(){row.style.background='transparent';};
      row.onclick=function(){ if(window.openWindow)window.openWindow({k:c.k,label:c.label}); close(); };
      list.appendChild(row); });
    if(!items.length) list.innerHTML='<div style="padding:16px;color:#9aa">No match.</div>';
  }
  function open(){ if(!overlay)build(); overlay.style.display='block'; input.value=''; render(); setTimeout(function(){try{input.focus();}catch(e){}},30); }
  function close(){ if(overlay)overlay.style.display='none'; }
  window.__openSearch=open;
  window.addEventListener('keydown',function(e){ if((e.ctrlKey||e.metaKey)&&(e.key==='k'||e.key==='K')){e.preventDefault();open();} });
  var t=setInterval(function(){ if(!document.body)return; clearInterval(t);
    if(document.getElementById('mb-srchbtn'))return; var b=document.createElement('div'); b.id='mb-srchbtn'; b.textContent='Search'; b.title='Search (Ctrl+K)'; b.style.cssText='padding:7px 14px;border-radius:18px;background:rgba(196,30,58,.85);color:#fff;cursor:pointer;font:700 12px Inter,system-ui;letter-spacing:.04em'; b.onclick=open; var h=document.getElementById('mb-topbar'); if(!h){ h=document.createElement('div'); h.id='mb-topbar'; h.style.cssText='position:fixed;top:12px;right:14px;z-index:63;display:flex;flex-direction:row-reverse;gap:8px;align-items:center'; document.body.appendChild(h);} h.appendChild(b);
  },400);
})();
