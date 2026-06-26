(function(){
  /* [bar_mel 2026-06-23] BUSINESS PHONE dialpad (logged-in business owner). Real service: shows the
     business line, a keypad, CALL (click-to-call via /api/business_call — Twilio rings the owner then
     bridges to the dialed number), and TEXT (/api/business_sms from the business line), with recent
     message history (/api/business_phone). Vanilla; opens in the universal window via a PHONE tab. */
  function esc(x){return String(x==null?'':x).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  var BTN='style="background:linear-gradient(135deg,#c41e3a,#ff5f6d);border:0;color:#fff;font-weight:800;border-radius:11px;padding:12px;cursor:pointer;font-family:inherit"';
  function post(path,body){ return fetch(path,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(body||{})}).then(function(r){return r.json();}); }
  function load(bd){ post('/api/business_phone',{}).then(function(d){ var L=bd.querySelector('#dp_line'); if(L)L.innerHTML=(d.status==='need_login')?'Sign in to use your business line.':('Your line: <b style="color:#fff">'+esc(d.line||'—')+'</b>'+(d.dedicated?'':' <span style=opacity:.6>(shared line until you provision your own number)</span>')); var log=bd.querySelector('#dp_log'); if(log){ var msgs=(d.messages||[]).slice(0,8); log.innerHTML=msgs.length?msgs.map(function(m){ var out=(String(m.direction||'').indexOf('out')>=0); return '<div style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06)"><span style="color:'+(out?'#5fff9f':'#7cc7f2')+'">'+esc(out?('to '+(m.to_number||'')):('from '+(m.from_number||'')))+'</span> <span style="color:#cdd6ea">'+esc((m.message_body||'').slice(0,64))+'</span></div>'; }).join(''):'No messages yet.'; } }).catch(function(){}); }
  function render(bd){
    bd.innerHTML='<div style="width:100%;max-width:420px;margin:0 auto;font-family:Inter,system-ui">'
     +'<div style="font-weight:800;font-size:18px;margin-bottom:4px">Business Phone</div>'
     +'<div id="dp_line" style="font-size:12.5px;color:#9fb0d0;margin-bottom:14px">Loading your line&hellip;</div>'
     +'<input id="dp_num" placeholder="Enter a number" style="width:100%;box-sizing:border-box;text-align:center;font-size:22px;letter-spacing:1px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.15);border-radius:12px;color:#fff;padding:12px;margin-bottom:10px">'
     +'<div id="dp_pad" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px"></div>'
     +'<div style="display:flex;gap:8px;margin-bottom:10px"><button id="dp_call" '+BTN+' style="flex:1;background:linear-gradient(135deg,#16a34a,#22c55e)">Call</button><button id="dp_text" '+BTN+' style="flex:1">Text</button></div>'
     +'<textarea id="dp_body" placeholder="Text message&hellip;" style="width:100%;box-sizing:border-box;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.15);border-radius:10px;color:#fff;padding:10px;font-size:13px;min-height:48px;margin-bottom:6px;display:none"></textarea>'
     +'<div id="dp_res" style="font-size:12.5px;color:#5fff9f;min-height:16px;margin-bottom:10px"></div>'
     +'<div style="font-weight:700;font-size:13px;margin:8px 0 6px">Recent</div><div id="dp_log" style="font-size:12px;color:#9fb0d0">&hellip;</div></div>';
    var num=bd.querySelector('#dp_num'), pad=bd.querySelector('#dp_pad'), res=bd.querySelector('#dp_res'), bodyEl=bd.querySelector('#dp_body');
    ['1','2','3','4','5','6','7','8','9','*','0','#'].forEach(function(k){ var btn=document.createElement('button'); btn.textContent=k; btn.style.cssText='background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);color:#fff;font-size:20px;font-weight:700;border-radius:12px;padding:14px;cursor:pointer'; btn.onclick=function(){ num.value=(num.value||'')+k; }; pad.appendChild(btn); });
    bd.querySelector('#dp_call').onclick=function(){ var to=(num.value||'').trim(); if(!to){ res.style.color='#ffd479'; res.textContent='Enter a number to call.'; return; } res.style.color='#9fb0d0'; res.textContent='Ringing your phone to connect you to '+to+'…'; post('/api/business_call',{to:to}).then(function(k){ res.style.color=k.ok?'#5fff9f':'#ff5f6d'; res.textContent=k.ok?('Answer your phone — we\'re connecting you to '+to+'.'):(k.error||'Call failed.'); }).catch(function(){ res.style.color='#ff5f6d'; res.textContent='Call error.'; }); };
    bd.querySelector('#dp_text').onclick=function(){ if(bodyEl.style.display==='none'){ bodyEl.style.display='block'; bodyEl.focus(); return; } var to=(num.value||'').trim(), body=(bodyEl.value||'').trim(); if(!to||!body){ res.style.color='#ffd479'; res.textContent='Enter a number and a message.'; return; } res.style.color='#9fb0d0'; res.textContent='Sending…'; post('/api/business_sms',{to:to,body:body}).then(function(k){ res.style.color=k.ok?'#5fff9f':'#ff5f6d'; res.textContent=k.ok?'Text sent.':(k.error||(k.result&&k.result.error)||'Send failed.'); if(k.ok)bodyEl.value=''; load(bd); }).catch(function(){ res.style.color='#ff5f6d'; res.textContent='Send error.'; }); };
    load(bd);
  }
  window.__winRender=window.__winRender||{};
  window.__winRender.dialpad=function(bd){ render(bd); };
  function addTab(){ if(document.getElementById('mb-phonetab'))return; if(document.cookie.indexOf('mio_sess=')<0)return; var t=document.createElement('div'); t.id='mb-phonetab'; t.textContent='PHONE'; t.style.cssText='position:fixed;right:0;top:55%;transform:translateY(-50%);writing-mode:vertical-rl;background:linear-gradient(135deg,#16a34a,#22c55e);color:#fff;font-weight:800;font-size:11px;letter-spacing:.14em;padding:14px 7px;border-radius:10px 0 0 10px;cursor:pointer;z-index:25;box-shadow:0 6px 22px rgba(0,0,0,.4)'; t.onclick=function(){ if(window.openWindow)window.openWindow({k:'dialpad',label:'Business Phone'}); }; document.body.appendChild(t); }
  var t=setInterval(function(){ if(document.body){ clearInterval(t); addTab(); } },700);
})();
