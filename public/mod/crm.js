(function(){
  /* [autonomous 2026-06-23] ADMIN CRM - universal window (openWindow {k:'crm'}), real functions:
     create a customer directly + process a client's credit repair (scan / generate disputes / submit).
     Reads roster from /api/admin_crm; writes through /api/admin_crm_action (one lane). Same design. */
  function esc(x){ return String(x==null?'':x).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  var IN='style="width:100%;box-sizing:border-box;margin-bottom:8px;background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.15);border-radius:10px;color:#fff;padding:10px;font-size:14px"';
  var BTN='style="background:linear-gradient(135deg,#c41e3a,#ff5f6d);border:0;color:#fff;font-weight:800;border-radius:10px;padding:9px 16px;cursor:pointer;font-family:inherit;font-size:12.5px"';
  var GBTN='style="background:rgba(95,255,159,.14);border:1px solid rgba(95,255,159,.4);color:#bff5d2;font-weight:700;border-radius:9px;padding:7px 12px;cursor:pointer;font-family:inherit;font-size:12px;margin:3px 4px 0 0"';

  function action(body){ return fetch('/api/admin_crm_action',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).then(function(r){return r.json();}); }

  function roster(bd){
    bd.innerHTML='<div style="opacity:.7;padding:20px">Loading clients…</div>';
    fetch('/api/admin_crm',{credentials:'include'}).then(function(r){return r.json();}).then(function(j){
      if(!j||j.ok===false){ bd.innerHTML='<div style="padding:20px;color:#ffd479">Admin only.</div>'; return; }
      var list=j.clients||j.roster||j.rows||j.customers||[];
      var h='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><div style="font-weight:800;font-size:19px">CRM &mdash; Clients</div><button id="crm_new" '+BTN+'>+ New Customer</button></div>';
      h+='<input id="crm_q" placeholder="Search name or email…" '+IN+'>';
      h+='<div id="crm_list"></div>';
      bd.innerHTML=h;
      var L=bd.querySelector('#crm_list');
      function paint(q){ L.innerHTML=list.filter(function(c){ return !q||JSON.stringify(c).toLowerCase().indexOf(q.toLowerCase())>=0; }).map(function(c){
        var name=esc(c.name||c.full_name||c.email||'client'); var em=esc(c.email||''); var stage=esc(c.pipeline_stage||c.subscription_tier||'');
        return '<div class="crm_row" data-id="'+esc(c.id||c.customer_id||c.email)+'" style="cursor:pointer;padding:11px 12px;border-radius:10px;margin-bottom:6px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04)"><div style="font-weight:700;font-size:13.5px">'+name+'</div><div style="font-size:11.5px;color:#9fb0d0">'+em+(stage?(' &middot; '+stage):'')+'</div></div>';
      }).join('')||'<div style="color:#7e8cad;padding:10px">No clients.</div>';
        Array.prototype.forEach.call(L.querySelectorAll('.crm_row'),function(el){ el.onclick=function(){ client(bd, el.getAttribute('data-id')); }; }); }
      paint('');
      var q=bd.querySelector('#crm_q'); if(q)q.oninput=function(){ paint(q.value); };
      var nb=bd.querySelector('#crm_new'); if(nb)nb.onclick=function(){ createForm(bd); };
    }).catch(function(){ bd.innerHTML='<div style="padding:20px;color:#ff5f6d">Could not load CRM.</div>'; });
  }

  function createForm(bd){
    bd.innerHTML='<a href="#" id="crm_back" style="color:#6ea8fe;font-size:13px;text-decoration:none">&larr; Clients</a>'
      +'<div style="font-weight:800;font-size:18px;margin:8px 0 12px">New Customer</div>'
      +'<input id="nc_name" placeholder="Full name" '+IN+'><input id="nc_email" type="email" placeholder="Email" '+IN+'><input id="nc_phone" placeholder="Phone" '+IN+'><input id="nc_biz" placeholder="Business name (optional)" '+IN+'>'
      +'<button id="nc_go" '+BTN+'>Create customer</button><div id="nc_msg" style="font-size:12.5px;color:#9fb0d0;margin-top:10px;min-height:15px"></div>';
    bd.querySelector('#crm_back').onclick=function(e){ e.preventDefault(); roster(bd); };
    bd.querySelector('#nc_go').onclick=function(){ var m=bd.querySelector('#nc_msg'); m.style.color='#9fb0d0'; m.textContent='Creating…';
      action({action:'create_customer',name:(bd.querySelector('#nc_name')||{}).value,email:(bd.querySelector('#nc_email')||{}).value,phone:(bd.querySelector('#nc_phone')||{}).value,business_name:(bd.querySelector('#nc_biz')||{}).value})
        .then(function(j){ if(j&&j.ok){ m.style.color='#5fff9f'; m.textContent='Created'+(j.temp_password?(' - temp password '+j.temp_password):'')+'. Opening…'; setTimeout(function(){ client(bd, j.customer_id); },900); } else { m.style.color='#ff6d7a'; m.textContent=(j&&j.error)||'Could not create.'; } })
        .catch(function(){ m.style.color='#ff6d7a'; m.textContent='Error.'; }); };
  }

  function client(bd, id){
    bd.innerHTML='<div style="opacity:.7;padding:20px">Loading client…</div>';
    fetch('/api/admin_crm?customer_id='+encodeURIComponent(id),{credentials:'include'}).then(function(r){return r.json();}).then(function(j){
      var c=j.client||j.customer||j||{}; var demo=c.contact||c.demographics||c;
      var disputes=c.disputes||c.credit_disputes||[];
      var h='<a href="#" id="crm_back" style="color:#6ea8fe;font-size:13px;text-decoration:none">&larr; Clients</a>';
      h+='<div style="font-weight:800;font-size:19px;margin:8px 0 2px">'+esc(demo.name||demo.full_name||demo.email||'Client')+'</div>';
      h+='<div style="font-size:12px;color:#9fb0d0;margin-bottom:12px">'+esc(demo.email||'')+(demo.phone?(' &middot; '+esc(demo.phone)):'')+(demo.credit_score?(' &middot; score '+esc(demo.credit_score)):'')+'</div>';
      h+='<div style="font-weight:800;color:#e11d2a;font-size:12px;text-transform:uppercase;letter-spacing:.05em;margin:6px 0">Process credit repair (admin runs it for them)</div>';
      h+='<div style="margin-bottom:6px"><button class="crm_proc" data-step="scan" '+GBTN+'>Scan report</button><button class="crm_proc" data-step="generate_disputes" '+GBTN+'>Generate disputes</button><button class="crm_proc" data-step="submit" '+GBTN+'>Submit / file</button></div>';
      h+='<div id="crm_pmsg" style="font-size:12.5px;color:#9fb0d0;min-height:16px;margin:6px 0 12px"></div>';
      h+='<div style="font-weight:800;color:#e11d2a;font-size:12px;text-transform:uppercase;letter-spacing:.05em;margin:6px 0">Disputes ('+disputes.length+')</div>';
      h+='<div id="crm_disp">'+(disputes.length?disputes.map(function(d){return '<div style="font-size:12.5px;padding:6px 0;border-top:1px solid rgba(255,255,255,.07)"><b>'+esc(d.bureau||'')+'</b> &middot; '+esc(d.item_disputed||d.item||'')+' <span style="color:#9fb0d0">'+esc(d.status||'')+(d.current_round?(' r'+d.current_round):'')+'</span></div>';}).join(''):'<div style="color:#7e8cad;font-size:12px">No disputes yet — run Generate disputes.</div>')+'</div>';
      // Bureau logins (Experian/Equifax/TransUnion) so we can log in and submit per bureau
      h+='<div style="font-weight:800;color:#e11d2a;font-size:12px;text-transform:uppercase;letter-spacing:.05em;margin:16px 0 6px">Bureau logins (to submit per bureau)</div>';
      ['Experian','Equifax','TransUnion'].forEach(function(bu){ h+='<div class="crm_bl" data-bureau="'+bu+'" style="display:flex;gap:6px;align-items:center;margin-bottom:6px"><span style="width:78px;font-size:12px;color:#9fb0d0">'+bu+'</span><input class="bl_u" placeholder="username" style="flex:1;background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.15);border-radius:8px;color:#fff;padding:7px;font-size:12px"><input class="bl_p" type="password" placeholder="password" style="flex:1;background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.15);border-radius:8px;color:#fff;padding:7px;font-size:12px"><button class="bl_save" '+GBTN+'>Save</button><button class="bl_code" '+GBTN+' title="Text the client for the '+bu+' login code">Request code</button></div>'; });
      // Per-bureau submission packages (letter + ID + SSN + utility)
      h+='<div style="font-weight:800;color:#e11d2a;font-size:12px;text-transform:uppercase;letter-spacing:.05em;margin:16px 0 6px">Submission packages <button id="crm_pkg" '+GBTN+'>Build packages</button></div><div id="crm_pkgbox" style="font-size:12.5px;color:#9fb0d0"></div>';
      bd.innerHTML=h;
      Array.prototype.forEach.call(bd.querySelectorAll('.crm_bl'),function(row){ var bu=row.getAttribute('data-bureau'); row.querySelector('.bl_save').onclick=function(){ var btn=row.querySelector('.bl_save'); btn.disabled=true; btn.textContent='…';
        action({action:'save_bureau_login',customer_id:id,bureau:bu,username:row.querySelector('.bl_u').value,password:row.querySelector('.bl_p').value}).then(function(j){ btn.disabled=false; btn.textContent=(j&&j.ok)?'Saved ✓':'Err'; setTimeout(function(){btn.textContent='Save';},1200); }).catch(function(){ btn.disabled=false; btn.textContent='Err'; }); };
        row.querySelector('.bl_code').onclick=function(){ var cb=row.querySelector('.bl_code'); cb.disabled=true; cb.textContent='Texting…';
          action({action:'request_bureau_code',customer_id:id,bureau:bu}).then(function(j){ cb.disabled=false; cb.textContent=(j&&j.ok)?'Code requested ✓':'Err'; setTimeout(function(){cb.textContent='Request code';},2000); }).catch(function(){ cb.disabled=false; cb.textContent='Err'; }); }; });
      var pkgB=bd.querySelector('#crm_pkg'); if(pkgB)pkgB.onclick=function(){ var box=bd.querySelector('#crm_pkgbox'); box.textContent='Building…';
        action({action:'package',customer_id:id}).then(function(j){ var pk=(j&&j.packages)||[]; if(!pk.length){ box.textContent='No packages.'; return; }
          box.innerHTML=pk.map(function(x){ var e=x.enclosures||{}; var chk=function(o){return o&&o.present?'<span style="color:#5fff9f">✓</span>':'<span style="color:#ff6d7a">✗</span>';}; return '<div style="border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:10px 12px;margin-bottom:7px"><div style="font-weight:700;color:#fff">'+esc(x.bureau)+' &middot; '+x.letter_count+' letter(s) '+(x.package_ready?'<span style="color:#5fff9f">READY</span>':'<span style="color:#ffd479">incomplete</span>')+'</div><div style="margin-top:3px">letters '+chk({present:x.letter_count>0})+' &nbsp; ID '+chk(e.id)+' &nbsp; SSN '+chk(e.ssn)+' &nbsp; utility '+chk(e.utility)+' &nbsp; login '+(x.login_on_file?'<span style="color:#5fff9f">✓</span>':'<span style="color:#ff6d7a">✗</span>')+'</div><div style="margin-top:4px"><a href="'+esc(x.submit_url)+'" target="_blank" style="color:#6ea8fe">Open '+esc(x.bureau)+' portal &rarr;</a></div></div>'; }).join(''); }).catch(function(){ box.textContent='Could not build.'; }); };
      bd.querySelector('#crm_back').onclick=function(e){ e.preventDefault(); roster(bd); };
      Array.prototype.forEach.call(bd.querySelectorAll('.crm_proc'),function(btn){ btn.onclick=function(){ var step=btn.getAttribute('data-step'); var m=bd.querySelector('#crm_pmsg'); m.style.color='#9fb0d0'; m.textContent='Running '+step.replace(/_/g,' ')+'…'; btn.disabled=true;
        action({action:'process',customer_id:id,step:step}).then(function(j){ btn.disabled=false; if(j&&j.ok){ var cnt=(j.result&&(j.result.count!=null))?(' ('+j.result.count+' items)'):''; m.style.color='#5fff9f'; m.textContent=step.replace(/_/g,' ')+' done'+cnt+'.'; setTimeout(function(){ client(bd,id); },1100); } else { m.style.color='#ff6d7a'; m.textContent=(j&&(j.error||(j.result&&j.result.error)))||'Step failed.'; } }).catch(function(){ btn.disabled=false; m.style.color='#ff6d7a'; m.textContent='Error.'; }); }; });
    }).catch(function(){ bd.innerHTML='<div style="padding:20px;color:#ff5f6d">Could not load client.</div>'; });
  }

  window.__winRender=window.__winRender||{};
  window.__winRender.crm=function(bd,st){ roster(bd); };
  window.mbOpenCRM=function(){ if(window.openWindow)window.openWindow({k:'crm',label:'CRM'}); };
})();
