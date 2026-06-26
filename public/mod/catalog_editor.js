(function(){
  /* [autonomous 2026-06-23] ADMIN CATALOG EDITOR = its OWN universal window (openWindow {k:'admin_catalog'}),
     admin-gated, same design. Edits live: Membership Plans, Products & Services, Storefront Offerings, and the
     Cobranded Reseller — saves to the rail via owner-gated /api/admin_catalog (mio_sess role ceo/admin).
     Prices shown in dollars, saved as cents (reseller base_price_monthly is dollars). Nothing invented. */
  function esc(x){return String(x==null?'':x).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  var BTN='style="background:linear-gradient(135deg,#c41e3a,#ff5f6d);border:0;color:#fff;font-weight:800;border-radius:9px;padding:8px 14px;cursor:pointer;font-family:inherit;font-size:12px"';
  var PIN='style="width:108px;box-sizing:border-box;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.18);border-radius:9px;color:#fff;padding:8px;font-size:13px;text-align:right"';

  function rowEl(kind,id,name,sub,priceDollars,priceField,active,activeOK){
    var r=document.createElement('div');
    r.style.cssText='display:flex;align-items:center;gap:10px;padding:10px 0;border-top:1px solid rgba(255,255,255,.08)';
    r.innerHTML='<div style="flex:1;min-width:0"><div style="font-weight:700;font-size:13.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(name)+'</div>'
      +(sub?'<div style="font-size:11px;color:#7e8cad">'+esc(sub)+'</div>':'')+'</div>'
      +'<div style="display:flex;align-items:center;gap:8px">'
      +'<span style="color:#9fb0d0;font-size:13px">$</span><input class="cat_price" type="number" step="0.01" value="'+esc(priceDollars)+'" '+PIN+'>'
      +(activeOK?'<label style="display:flex;align-items:center;gap:4px;font-size:11px;color:#9fb0d0;cursor:pointer"><input class="cat_active" type="checkbox" '+(active?'checked':'')+' style="accent-color:#c41e3a">live</label>':'')
      +'<button class="cat_save" '+BTN+'>Save</button></div>';
    var priceIn=r.querySelector('.cat_price'), saveB=r.querySelector('.cat_save'), actIn=r.querySelector('.cat_active');
    function save(field,value){ saveB.disabled=true; saveB.textContent='…';
      fetch('/api/admin_catalog',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:kind,id:id,field:field,value:value})})
        .then(function(x){return x.json();}).then(function(j){ saveB.disabled=false; if(j&&j.ok){ saveB.textContent='Saved ✓'; saveB.style.background='rgba(95,255,159,.4)'; setTimeout(function(){saveB.textContent='Save';saveB.style.background='';saveB.setAttribute('style',BTN.replace('style="',''));},1200);} else { saveB.textContent='Err'; } })
        .catch(function(){ saveB.disabled=false; saveB.textContent='Err'; }); }
    saveB.onclick=function(){ var d=parseFloat(priceIn.value)||0; var v=(priceField==='base_price_monthly')? d : Math.round(d*100); save(priceField,v); };
    if(actIn)actIn.onchange=function(){ save('active',actIn.checked); };
    return r;
  }

  function section(title){ var h=document.createElement('div'); h.textContent=title; h.style.cssText='font-weight:800;color:#e11d2a;font-size:12px;letter-spacing:.05em;text-transform:uppercase;margin:18px 0 2px'; return h; }

  window.__winRender=window.__winRender||{};
  window.__winRender.admin_catalog=function(bd,st){
    bd.innerHTML='<div style="opacity:.7;padding:20px">Loading catalog…</div>';
    fetch('/api/admin_catalog',{credentials:'include'}).then(function(r){return r.json();}).then(function(j){
      if(!j||!j.ok){ bd.innerHTML='<div style="padding:20px;color:#ffd479">Admin only — sign in as owner to edit the catalog.</div>'; return; }
      bd.innerHTML='';
      var w=document.createElement('div'); w.style.cssText='max-width:680px;margin:0 auto;width:100%;color:#fff;font:13px/1.5 Inter,system-ui,sans-serif;padding:18px 16px 22px';
      var head=document.createElement('div'); head.innerHTML='<div style="font-weight:800;font-size:19px">Catalog Editor</div><div style="font-size:12px;color:#9fb0d0;margin-bottom:4px">Edit prices live — plans, services, offerings, and the cobranded reseller. Saves to the rail.</div>';
      w.appendChild(head);
      // Plans
      w.appendChild(section('Membership Plans'));
      (j.plans||[]).forEach(function(p){ w.appendChild(rowEl('plan',p.plan_name,p.plan_name,(p.billing_cycle||'')+(p.disputes_included!=null?(' · '+p.disputes_included+' disputes'):''),(Number(p.price_cents)/100).toFixed(2),'price_cents',p.active,true)); });
      // Products & services
      w.appendChild(section('Products & Services'));
      (j.products||[]).forEach(function(p){ w.appendChild(rowEl('product',p.id,p.name,p.category,(Number(p.price_cents)/100).toFixed(2),'price_cents',(p.status==='active'),false)); });
      // Offerings
      w.appendChild(section('Storefront Offerings'));
      (j.offerings||[]).forEach(function(o){ w.appendChild(rowEl('offering',o.id,o.name,o.billing,(Number(o.price_cents)/100).toFixed(2),'price_cents',o.active,true)); });
      // Cobranded reseller (base_price_monthly is dollars)
      w.appendChild(section('Cobranded Reseller'));
      (j.reseller||[]).forEach(function(t){ var d=t.base_price_monthly!=null?Number(t.base_price_monthly).toFixed(2):'0.00'; w.appendChild(rowEl('reseller',t.tier_kind,t.tier_kind.replace(/_/g,' '),'monthly spend = credit toward clients/services',d,'base_price_monthly',false,false)); });
      bd.appendChild(w);
    }).catch(function(){ bd.innerHTML='<div style="padding:20px;color:#ff5f6d">Could not load the catalog.</div>'; });
  };
})();
