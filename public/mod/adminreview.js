(function(){
  /* [DESIGNER 2026-06-24] ADMIN CREDIT REVIEW — the admin gets to the SAME process as the client, to
     review + work FOR the client. Reuses the working rail endpoints (client_bureau_view /
     client_decision by customer_id). The admin does NOT auto-file (that is Mel's job): he reviews the
     report, sees the client's BUREAU LOGINS (credential_read, decrypted) to log in and file himself,
     then clicks File which TEXTS THE CLIENT that their disputes are filed (file_notify -> SMS). */
  function esc(x){ return String(x==null?'':x).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function money(v){ return (v!=null&&Number(v))?('$'+Number(v).toLocaleString()):'$0'; }
  function fmtd(x){ return x?String(x).slice(0,10):'—'; }
  function dl(lbl,val){ return '<div class=detl><b>'+esc(lbl)+'</b><span>'+esc(val==null||val===''?'—':val)+'</span></div>'; }
  window.__arToggle=function(td){ try{ var tr=td.parentNode; var det=tr.nextSibling; while(det&&det.nodeType!==1)det=det.nextSibling; if(det&&det.className==='ardetrow'){ var sh=det.style.display==='none'; det.style.display=sh?'':'none'; td.innerHTML=(sh?'&#9662; ':'&#9656; ')+td.textContent.replace(/^[▸▾]\s*/,''); } }catch(e){} };
  var BUREAUS=['Experian','TransUnion','Equifax'];
  var LOGINS=[['smartcredit','SmartCredit'],['experian','Experian'],['equifax','Equifax'],['transunion','TransUnion']];
  var BTN='style="margin-top:8px;background:linear-gradient(135deg,#c41e3a,#ff5f6d);border:0;color:#fff;font-weight:800;border-radius:11px;padding:12px 22px;cursor:pointer;font-family:inherit"';
  var CSS='<style>.arwrap{display:flex;gap:14px;height:100%;width:100%;box-sizing:border-box;color:#fff;font:13px Inter,system-ui}'
    +'.arlist{flex:0 0 290px;display:flex;flex-direction:column;min-height:0;border:1px solid rgba(255,255,255,.12);border-radius:12px;background:rgba(255,255,255,.03)}'
    +'.arq{margin:10px;box-sizing:border-box;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.22);border-radius:9px;padding:9px 11px;color:#fff;outline:none}'
    +'.arrows{flex:1;min-height:0;overflow-y:auto;padding:0 6px 8px}'
    +'.arrow{cursor:pointer;padding:9px 10px;border-radius:9px;margin-bottom:4px;border:1px solid transparent}'
    +'.arrow:hover{background:rgba(255,255,255,.05)}.arrow.on{border-color:#c41e3a;background:rgba(196,30,58,.18)}'
    +'.ardetail{flex:1;min-width:0;overflow-y:auto;border:1px solid rgba(255,255,255,.12);border-radius:12px;background:rgba(255,255,255,.03);padding:18px}'
    +'.trimerge{width:100%;border-collapse:collapse;font-size:12.5px;table-layout:fixed}'
    +'.trimerge th{position:sticky;top:0;z-index:2;background:rgba(12,14,22,.96);text-align:left;padding:8px 10px;font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:#e11d2a;border-bottom:1px solid rgba(255,255,255,.14)}'
    +'.trimerge td{padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.07);vertical-align:top;color:#dfe6f5}'
    +'.trimerge td.acct{font-weight:700;color:#fff}.trimerge td.der{color:#ff6d7a;font-weight:700}.trimerge td.na{color:#566}'
    +'.trimerge .bal{color:#9fb0d0;font-size:11px}.trimerge input{accent-color:#e11d2a;width:16px;height:16px}'
    +'.arseclbl{font:700 12px Inter;text-transform:uppercase;letter-spacing:.06em;color:#9fb0d0;margin:16px 0 8px}'
    +'.arcredgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:10px}'
    +'.arcred{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:11px 12px}'
    +'.arcredh{font:800 13px Inter;color:#fff;margin-bottom:6px}.arcredh.miss{color:#8a97b5}'
    +'.arcredkv{font:12px Inter;color:#9fb0d0;margin:2px 0}.arcredkv b{color:#dfe6f5;font-weight:700;word-break:break-all}'
    +'.arcredmuted{font:12px Inter;color:#7e8cad;font-style:italic}'
    +'.armuted{font-size:12.5px;color:#9fb0d0;line-height:1.5;margin-bottom:12px}'
    +'.trimerge td.acct{cursor:pointer}'
    +'.detwrap{display:flex;gap:14px;flex-wrap:wrap;padding:8px 4px 12px}.detcol{min-width:150px;flex:1 1 150px}'
    +'.detb{font-weight:800;color:#e11d2a;font-size:10.5px;letter-spacing:.05em;text-transform:uppercase;margin-bottom:5px}'
    +'.detl{display:flex;justify-content:space-between;gap:10px;font-size:11px;padding:2px 0;color:#dfe6f5}.detl b{color:#8a97b5;font-weight:600}'
    +'.ardoc{transition:border-color .15s,background .15s}.ardoc:hover{border-color:#ff5f6d !important;background:rgba(196,30,58,.09) !important}</style>';

  function decisionBanner(d){
    var dec=(d&&d.decision)||{}; var tier=dec.decision_tier||''; var score=d&&d.min_score;
    var approve=(tier==='APPROVE'); var color=approve?'#5fff9f':(tier==='DECLINE'?'#ff6d7a':'#ffd479');
    var head=approve?'Qualifies for funding now':(tier==='DECLINE'?'Credit repair first':'Borderline — repair first');
    var scores=(d&&d.scores)||{}; var sc=BUREAUS.map(function(b){ return scores[b]?(b+' '+scores[b].score):null; }).filter(Boolean).join('  ·  ');
    return '<div style="border:1px solid '+color+';border-radius:14px;padding:14px 16px;background:rgba(0,0,0,.3);margin-bottom:14px">'
      +'<div style="font-size:11px;color:#9fb0d0;text-transform:uppercase;letter-spacing:.06em">Funding Decision'+(score?(' · min score '+score):'')+'</div>'
      +'<div style="font-weight:800;font-size:18px;color:'+color+';margin:5px 0">'+esc(head)+'</div>'
      +'<div style="font-size:12.5px;color:#cdd6ea;line-height:1.45">'+esc(dec.recommendation||'')+'</div>'
      +(sc?('<div style="font-size:12px;color:#9fb0d0;margin-top:6px">'+esc(sc)+'</div>'):'')+'</div>';
  }

  // ---- HORIZONTAL grouping: merge the SAME account across bureaus into one row.
  // The rail keys each tradeline by account_key (e.g. ACCT|1574) which is IDENTICAL across bureaus for
  // the same account, even when the bureaus spell the creditor differently (BANK OF AMERICA vs BK OF AMER).
  function tailOf(ak){ var p=String(ak||'').split('|'); return p.length>1?p[p.length-1]:''; }
  function compatCred(a,b){ var A=String(a||'').toUpperCase().replace(/[^A-Z]/g,''), B=String(b||'').toUpperCase().replace(/[^A-Z]/g,''); if(!A||!B)return true; if(A===B)return true; if(A.indexOf(B)>=0||B.indexOf(A)>=0)return true; return A.slice(0,3)===B.slice(0,3); }
  function groupAccounts(accounts){
    var groups=[];
    (accounts||[]).forEach(function(a){
      var key=a.account_key||''; var g=null, dup=false;
      if(key){ for(var i=0;i<groups.length;i++){ var G=groups[i]; if(G.account_key!==key) continue;
        var ex=G.bureaus[a.bureau];
        if(!ex){ g=G; break; }                                  // same account, this bureau free -> merge horizontally
        if(compatCred(ex.creditor_canon, a.creditor_canon)){ dup=true; break; } // same account already in this bureau -> exact duplicate, drop it
        /* else different creditor sharing this key+bureau = collision -> keep scanning / new group */ } }
      if(dup) return;
      if(!g){ g={ account_key:key, creditor_canon:a.creditor_canon||key, last4:tailOf(key), bureaus:{} }; groups.push(g); }
      g.bureaus[a.bureau]=a;
      if(String(a.creditor_canon||'').length>String(g.creditor_canon||'').length) g.creditor_canon=a.creditor_canon;
    });
    return groups;
  }
  function reportTable(d, detail){
    detail=detail||{};
    var accounts=d.accounts||[];
    if(d.status==='need_login') return '<div style="color:#ffd479">No session for this client.</div>';
    /* [2026-06-24 Mel] use the ONE shared matcher (window.__memTrimerge) — same accounts the client sees, merged across bureaus by the real factors. */
    /* [2026-06-25] LIVE tri-merge from api_client_bureau_view: matcher on flat accounts -> server-grouped clusters (reporting_on / missing_from / balance_mismatch) -> flat one-row-per-account fallback. */
    var groups=accounts.length?(window.__memTrimerge?window.__memTrimerge(accounts,detail):[]):[];
    if(!groups.length&&d.grouped&&d.grouped.length){ groups=d.grouped.map(function(g){ g.bureaus=g.bureaus||{}; return g; }); }
    if(!groups.length&&accounts.length){ groups=accounts.map(function(a){ var g={account_key:a.account_key||'',creditor_canon:a.creditor_canon||a.account_key||'',bureaus:{}}; g.bureaus[a.bureau]=a; return g; }); }
    if(!groups.length) return '<div style="color:#ffd479">No report yet — this client has not connected SmartCredit / pulled their file.</div>';
    var pulled={}; accounts.forEach(function(a){ pulled[a.bureau]=true; });
    var PB=BUREAUS.filter(function(b){return pulled[b];}); if(!PB.length)PB=BUREAUS.slice();
    function dt(g,b){ var ga=g.bureaus[b]; return ga&&detail[ga.account_key]&&detail[ga.account_key][b]; }
    function l4(g,b){ var a=dt(g,b); var ga=g.bureaus[b]; return (a&&a.acct_last4)||(ga?tailOf(ga.account_key):''); }
    var head='<tr><th style="width:24%">Account</th>'+PB.map(function(b){return '<th>'+b+'</th>';}).join('')+'<th style="width:22%">Decision</th><th style="width:56px">Dispute</th></tr>';
    var rows=groups.map(function(g){ var bur=g.bureaus||{};
      var cells=PB.map(function(b){ var a=bur[b]; if(!a)return '<td class=na>&mdash;<br><span class=bal>not reporting</span></td>'; var ln=l4(g,b); return '<td'+(a.derogatory?' class=der':'')+'><span class=bal>'+(ln?('#&bull;&bull;'+esc(ln)):'&mdash;')+'</span><br>'+esc(a.status||'')+'<br><span class=bal>'+money(a.balance)+'</span></td>'; }).join('');
      /* read the LIVE cluster fields straight from api_client_bureau_view (reporting_on / missing_from / balance_mismatch); derive from the merged bureaus when the server didn't supply them. */
      var present=(g.reporting_on&&g.reporting_on.length)?PB.filter(function(b){return g.reporting_on.indexOf(b)>=0;}):PB.filter(function(b){return bur[b];}); var missing=(g.missing_from&&g.missing_from.length)?PB.filter(function(b){return g.missing_from.indexOf(b)>=0;}):PB.filter(function(b){return !bur[b];});
      var derog=present.some(function(b){return bur[b]&&bur[b].derogatory;}); var bals=present.map(function(b){return (bur[b]&&Number(bur[b].balance))||0;}); var mismatch=(g.balance_mismatch!=null)?!!g.balance_mismatch:(bals.length>1 && (Math.max.apply(null,bals)!==Math.min.apply(null,bals)));
      var stats=present.map(function(b){return bur[b]&&String(bur[b].status||'').toLowerCase();}).filter(Boolean); var statusMismatch=stats.length>1 && stats.some(function(s){return s!==stats[0];});
      var flags=[]; if(derog)flags.push('Derogatory'); if(mismatch)flags.push('Balance mismatch'); if(statusMismatch)flags.push('Status mismatch'); if(missing.length && present.length)flags.push('Only on '+present.join(' & '));
      var decision=flags.length?('<span style="color:#ff9d5f;font-weight:700">'+esc(flags.join(' · '))+'</span>'):'<span style="color:#7e8cad">&mdash;</span>';
      var disputable=derog||mismatch||statusMismatch||(missing.length&&present.length);
      var chk=disputable?'<td style="text-align:center"><input type=checkbox class=ar_pick data-item="'+esc(g.creditor_canon||g.account_key)+'" data-key="'+esc(g.account_key)+'"></td>':'<td class=na style="text-align:center">&mdash;</td>';
      var dcols=PB.map(function(b){ var a=dt(g,b); if(!a)return ''; return '<div class=detcol><div class=detb>'+b+'</div>'+dl('Acct #',a.acct_last4?('••••'+a.acct_last4):'—')+dl('Type',a.account_type)+dl('Opened',fmtd(a.opened))+dl('High bal',money(a.high_balance))+dl('Limit',money(a.credit_limit))+dl('Balance',money(a.balance))+dl('Past due',money(a.past_due))+dl('Status',a.pay_status||a.status)+'</div>'; }).join('');
      if(!dcols)dcols='<div class=detcol style="color:#7e8cad">No extra detail pulled for this account.</div>';
      return '<tr><td class=acct onclick="window.__arToggle&&window.__arToggle(this)">&#9656; '+esc(g.creditor_canon||g.account_key)+(g.last4?(' <span style="color:#7e8cad;font-weight:400;font-size:11px">••'+esc(g.last4)+'</span>'):'')+'</td>'+cells+'<td style="font-size:12px">'+decision+'</td>'+chk+'</tr><tr class=ardetrow style="display:none"><td colspan="'+(PB.length+3)+'"><div class=detwrap>'+dcols+'</div></td></tr>'; }).join('');
    var disp=groups.filter(function(g){var bur=g.bureaus||{};var p=(g.reporting_on&&g.reporting_on.length)?PB.filter(function(b){return g.reporting_on.indexOf(b)>=0;}):PB.filter(function(b){return bur[b];});var m=(g.missing_from&&g.missing_from.length)?PB.filter(function(b){return g.missing_from.indexOf(b)>=0;}):PB.filter(function(b){return !bur[b];});return p.some(function(b){return bur[b]&&bur[b].derogatory;})||(m.length&&p.length);}).length;
    return '<div class=armuted>One row per account across the bureaus pulled (<b>'+esc(PB.join(', '))+'</b>). <b>'+groups.length+'</b> accounts · <b>'+disp+'</b> flagged. Click an account to open its detail; check the boxes to pick what to dispute.</div>'
      +'<table class=trimerge>'+head+rows+'</table>';
  }

  function credCards(creds){
    var by={}; (creds||[]).forEach(function(c){ by[c.service]=c; });
    return '<div class=arcredgrid>'+LOGINS.map(function(L){ var svc=L[0], nm=L[1]; var c=by[svc];
      if(!c) return '<div class=arcred><div class="arcredh miss">'+nm+'</div><div class=arcredmuted>not provided yet</div></div>';
      var ex=''; if(c.extra&&typeof c.extra==='object'){ ex=Object.keys(c.extra).map(function(k){return '<div class=arcredkv>'+esc(k.replace(/_/g,' '))+' <b>'+esc(c.extra[k])+'</b></div>';}).join(''); }
      return '<div class=arcred><div class=arcredh>'+nm+(c.connected?' <span style="color:#5fff9f;font-size:10px">●</span>':'')+'</div><div class=arcredkv>user <b>'+esc(c.username||'—')+'</b></div><div class=arcredkv>pass <b>'+esc(c.password||'—')+'</b></div>'+ex+'</div>'; }).join('')+'</div>';
  }

  function showClient(bd, c){
    var det=bd.querySelector('#ardetail'); if(!det)return;
    var cid=c.id||c.customer_id||null, email=c.email||null;
    det.innerHTML='<div style="opacity:.6;padding:8px">Loading '+esc(c.name||email||cid)+'’s file…</div>';
    var body=JSON.stringify({customer_id:cid, email:email});
    Promise.all([
      fetch('/api/client_bureau_view',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:body}).then(function(r){return r.json();}).catch(function(){return {};}),
      fetch('/api/client_decision',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:body}).then(function(r){return r.json();}).catch(function(){return {};}),
      fetch('/api/credit_repair_credential_read',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:body}).then(function(r){return r.json();}).catch(function(){return {};}),
      fetch('/api/client_account_detail',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:body}).then(function(r){return r.json();}).catch(function(){return {};}),
      fetch('/api/admin_crm?customer_id='+encodeURIComponent(cid||''),{credentials:'include'}).then(function(r){return r.json();}).catch(function(){return {};})
    ]).then(function(R){
      var bv=R[0]||{}, dec=R[1]||{}, cr=R[2]||{}; var __detail=(R[3]&&R[3].detail)||{};
      /* [2026-06-25 Mel] PREFILL from the CRM record — never re-collect what we already have. */
      var __cu=(R[4]&&(R[4].client||R[4].customer||R[4]))||{}; var __demo=__cu.contact||__cu.demographics||__cu;
      function __dv(){ for(var i=0;i<arguments.length;i++){ var k=arguments[i]; if(__demo[k]!=null&&__demo[k]!=='')return __demo[k]; } return ''; }
      var __csz=(function(){ var ct=__dv('city'),stt=__dv('state','st'),zp=__dv('zip','postal','postal_code','zipcode'); var s=(ct||'')+(stt?(', '+stt):'')+(zp?(' '+zp):''); return s.replace(/^,\s*/,'').trim(); })();
      /* [2026-06-24 Mel] ADMIN-AS-REVIEWER CONTEXT: when admin opens a client's file, tell the bar/deepinfra WHICH client is open + their state, so the spawn talks about THIS client (reviewing_customer_id), not the admin's own file. Mirrors window.__clientState set by journey.js for the client's own view. */
      try{ var __ac=(bv.accounts||[]),__sn={},__neg=0; __ac.forEach(function(a){ if(a&&a.derogatory){ var k=(a.creditor_canon||'')+'|'+(a.account_key||''); if(!__sn[k]){__sn[k]=1;__neg++;} } }); var __dn=(dec&&dec.decision)||{}; window.__clientState={mode:'admin_review',reviewing_customer_id:cid,reviewing_email:email,reviewing_name:(c.name||email||cid),step:'credit_review',has_file:!!__ac.length,negatives:__neg,decision_tier:__dn.decision_tier||null,min_score:dec.min_score||null}; }catch(e){}
      /* [2026-06-24 Mel] ADMIN WALKS THE SAME PROCESS AS THE CLIENT — a stepped flow, not one dumped screen:
         Select items -> Verify personal info -> Upload documents -> Bureau logins -> Generate & file. */
      var STEPS=['Select items','Verify info','Documents','Bureau logins','Generate letters','File & notify'];
      var W={ step:0, info:{ name:(c.name||email||__dv('name','full_name')||''), email:email||__dv('email')||'', addr:__dv('address','street','address1','addr')||'', csz:__csz||'', dob:__dv('dob','date_of_birth','birthdate','birth_date')||'', ssn:__dv('ssn','social','ssn_full')||'' }, picks:{}, docs:{}, creds:{}, submitted:{} };
      /* [2026-06-24 Mel] PERSIST the in-progress work per client so a refresh/reopen lands you exactly where you were. */
      try{ var __sv=JSON.parse(localStorage.getItem('mio_arwiz_'+cid)||'null'); if(__sv){ if(typeof __sv.step==='number')W.step=__sv.step; if(__sv.picks)W.picks=__sv.picks; if(__sv.info)for(var __k in __sv.info){ if(__sv.info[__k])W.info[__k]=__sv.info[__k]; } if(__sv.creds)W.creds=__sv.creds; if(__sv.submitted)W.submitted=__sv.submitted; } }catch(e){}
      function arAction(body){ return fetch('/api/admin_crm_action',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).then(function(r){return r.json();}).catch(function(){return {ok:false};}); }
      function saveWizard(){ try{ localStorage.setItem('mio_arwiz_'+cid, JSON.stringify({step:W.step,picks:W.picks,info:W.info,creds:W.creds,submitted:W.submitted})); }catch(e){} }
      function flashSaved(){ var s=det.querySelector('#ar_status'); if(s){ s.textContent='Saved ✓'; s.style.color='#5fff9f'; clearTimeout(s.__t); s.__t=setTimeout(function(){ s.textContent='Auto-saving'; s.style.color='#7e8cad'; },1400); } }
      function stepbar(){ return '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">'+STEPS.map(function(s,i){ var on=(i<W.step), cur=(i===W.step); return '<div onclick="window.__arGo&&window.__arGo('+i+')" style="cursor:pointer;display:flex;align-items:center;gap:6px;padding:5px 9px;border-radius:8px;font:700 11px Inter;border:1px solid '+(cur?'#ff5f6d':(on?'rgba(61,220,132,.4)':'rgba(255,255,255,.1)'))+';background:'+(cur?'rgba(196,30,58,.16)':(on?'rgba(61,220,132,.10)':'rgba(255,255,255,.04)'))+'"><span style="width:17px;height:17px;border-radius:50%;display:grid;place-items:center;font-size:10px;font-weight:800;'+(on?'background:linear-gradient(135deg,#3ddc84,#16a34a);color:#fff;box-shadow:0 2px 7px rgba(34,197,94,.5)':(cur?'background:#ff5f6d;color:#0b0b0f':'background:rgba(255,255,255,.18);color:#0b0b0f'))+'">'+(on?'✓':(i+1))+'</span>'+esc(s)+'</div>'; }).join('')+'</div>'; }
      function fld(lbl,key,ph){ return '<label style="display:block;margin-bottom:10px"><div style="font:600 11.5px Inter;color:#9fb0d0;margin-bottom:4px">'+esc(lbl)+'</div><input data-k="'+key+'" class=ar_if value="'+esc(W.info[key]||'')+'" placeholder="'+esc(ph||'')+'" style="width:100%;box-sizing:border-box;background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.15);border-radius:10px;color:#fff;padding:11px;font:14px Inter"></label>'; }
      function docslot(lbl,key){ var f=W.docs&&W.docs[key]; var nm=f&&f.name;
        var badge=nm?'<span style="flex:0 0 40px;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#3ddc84,#16a34a);box-shadow:0 5px 16px rgba(34,197,94,.5),inset 0 1px 0 rgba(255,255,255,.35);color:#fff"><svg width=21 height=21 viewBox="0 0 24 24" fill=none stroke=currentColor stroke-width=3 stroke-linecap=round stroke-linejoin=round><polyline points="20 6 9 17 4 12"></polyline></svg></span>':'<span style="flex:0 0 40px;width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:rgba(196,30,58,.16);color:#ff8a96"><svg width=18 height=18 viewBox="0 0 24 24" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><path d="M12 16V4"></path><path d="M7 9l5-5 5 5"></path><path d="M5 20h14"></path></svg></span>';
        return '<label class=ardoc style="display:flex;align-items:center;gap:12px;margin-bottom:10px;padding:13px 15px;border:1px solid '+(nm?'rgba(61,220,132,.45)':'rgba(255,255,255,.14)')+';border-radius:13px;background:rgba(255,255,255,.04);cursor:pointer">'
          +badge
          +'<span style="flex:1;min-width:0"><span style="display:block;font:700 13px Inter;color:#fff">'+esc(lbl)+'</span><span class=ar_docmsg style="display:block;font:12px Inter;color:'+(nm?'#5fff9f':'#9fb0d0')+';overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+(nm?('✓ '+esc(nm)):'PDF or JPEG')+'</span></span>'
          +'<span style="flex:0 0 auto;font:700 12px Inter;color:'+(nm?'#9fb0d0':'#ff8a96')+'">'+(nm?'Replace':'Upload')+'</span>'
          +'<input data-doc="'+key+'" class=ar_doc type=file accept=".pdf,.jpg,.jpeg,image/jpeg,application/pdf" style="position:absolute;width:1px;height:1px;opacity:0"></label>'; }
      function cf(lbl,k,val){ return '<label style="display:block;margin-bottom:7px"><div style="font:600 11px Inter;color:#9fb0d0;margin-bottom:3px">'+esc(lbl)+'</div><input data-cf="'+k+'" value="'+esc(val||'')+'" style="width:100%;box-sizing:border-box;background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.15);border-radius:9px;color:#fff;padding:9px;font:13px Inter"></label>'; }
      var __ctab=0;
      /* [2026-06-24 Mel] bureau logins as HORIZONTAL tabs — one bureau at a time, no scrolling. Captures each bureau into W.creds on tab-switch/blur. */
      function credTabs(){ var box=det.querySelector('#ar_creds'); if(!box)return;
        var by={}; ((cr&&cr.credentials)||[]).forEach(function(x){ by[String(x.service||'').toLowerCase()]=x; });
        var defs=[['smartcredit','SmartCredit'],['experian','Experian'],['equifax','Equifax'],['transunion','TransUnion']];
        function done(svc){ var wc=(W.creds&&W.creds[svc])||{}; var x=by[svc]||{}; return !!((wc.username||x.username)&&(wc.password||x.password)); }
        function fieldOf(svc){ var x=by[svc]||{}; var ex=(x.extra&&typeof x.extra==='object')?x.extra:{}; var wc=(W.creds&&W.creds[svc])||{};
          function v(k,exk){ return (wc[k]!=null?wc[k]:(k==='username'?(x.username||''):(k==='password'?(x.password||''):(ex[exk]||'')))); }
          var h='<div class=arcredbox data-svc="'+svc+'">'+cf('Email (username)','u',v('username'))+cf('Password','p',v('password'));
          if(svc==='experian'){ h+=cf('Security question','sq',v('security_question','security_question'))+cf('Security answer','sa',v('security_answer','security_answer'))+cf('Security PIN','pin',v('security_pin','security_pin')); }
          return h+'</div>'; }
        var svc=defs[__ctab][0];
        var tabs='<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">'+defs.map(function(p,i){ var dn=done(p[0]); var bgc=dn?'linear-gradient(135deg,#3ddc84,#16a34a)':(i===__ctab?'linear-gradient(135deg,#c41e3a,#ff5f6d)':'rgba(255,255,255,.06)'); return '<button class="ar_ctab" data-i="'+i+'" style="flex:1;min-width:90px;background:'+bgc+';border:1px solid '+(dn?'transparent':(i===__ctab?'#ff5f6d':'rgba(255,255,255,.15)'))+';color:#fff;font:700 12px Inter;border-radius:10px;padding:9px 10px;cursor:pointer'+(dn?';box-shadow:0 3px 10px rgba(34,197,94,.35)':'')+'">'+esc(p[1])+(dn?' ✓':'')+'</button>'; }).join('')+'</div>';
        box.innerHTML=tabs+fieldOf(svc)+'<div id="ar_credmsg" style="font:12px Inter;color:#9fb0d0;margin-top:6px;min-height:14px"></div>';
        Array.prototype.forEach.call(box.querySelectorAll('.ar_ctab'),function(btn){ btn.onclick=function(){ collectCreds(); __ctab=+btn.getAttribute('data-i'); credTabs(); }; });
        Array.prototype.forEach.call(box.querySelectorAll('[data-cf]'),function(i){ i.onblur=function(){ collectCreds(); saveWizard(); flashSaved(); }; }); }
      function collectCreds(){ W.creds=W.creds||{}; Array.prototype.forEach.call(det.querySelectorAll('.arcredbox'),function(bx){ var svc=bx.getAttribute('data-svc'); var d={}; Array.prototype.forEach.call(bx.querySelectorAll('[data-cf]'),function(i){ d[i.getAttribute('data-cf')]=i.value; }); var o={username:d.u||'',password:d.p||''}; if(svc==='experian'){ o.security_question=d.sq||''; o.security_answer=d.sa||''; o.security_pin=d.pin||''; } W.creds[svc]=o; }); }
      function saveCreds(){ collectCreds(); var msg=det.querySelector('#ar_credmsg'); if(msg){msg.style.color='#9fb0d0';msg.textContent='Saving…';}
        var BMAP={experian:'Experian',equifax:'Equifax',transunion:'TransUnion'}; var jobs=[], errs=[];
        Object.keys(W.creds).forEach(function(svc){ var o=W.creds[svc]||{}; var bu=BMAP[svc]; if(!bu) return; /* SmartCredit isn't a dispute-bureau login — kept locally */ if(o.username||o.password){ var body={action:'save_bureau_login',customer_id:cid,bureau:bu,username:o.username||'',password:o.password||''}; if(svc==='experian'){ body.security_question=o.security_question||''; body.security_answer=o.security_answer||''; body.security_pin=o.security_pin||''; } jobs.push(arAction(body).then(function(j){ var ok=j&&(j.ok||(j.result&&j.result.ok)); if(!ok)errs.push(bu+': '+((j&&(j.error||(j.result&&j.result.error)))||'failed')); return j; })); } });
        saveWizard(); if(!jobs.length){ if(msg){msg.style.color='#ffd479';msg.textContent='Enter a username/password for Experian, Equifax or TransUnion first.';} return; }
        Promise.all(jobs).then(function(){ if(msg){ if(!errs.length){ msg.style.color='#5fff9f'; msg.textContent='Bureau logins saved to the file ✓'; } else { msg.style.color='#ffd479'; msg.textContent='Server: '+errs[0]; } } }); }
      /* [2026-06-24 Mel] UPLOAD docs to the DB so the client is READY TO FILE (bureaus require ID + SSN proof + address proof as enclosures). dl->id, ss->ssn, util->utility = the enclosure slots the backend package check looks for. */
      function fileToData(f){ return new Promise(function(res){ try{ var r=new FileReader(); r.onload=function(){res(r.result);}; r.onerror=function(){res(null);}; r.readAsDataURL(f); }catch(e){res(null);} }); }
      function arPost(url,body){ return fetch(url,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).then(function(r){return r.json();}).catch(function(){return {ok:false}; }); }
      function saveDocs(){ var msg=det.querySelector('#ar_docsmsg'); var map={dl:'id',ss:'ssn',util:'utility'}; W.docs=W.docs||{};
        var ks=Object.keys(W.docs).filter(function(k){return W.docs[k];}); if(!ks.length){ if(msg){msg.style.color='#ffd479';msg.textContent='Attach at least one document first.';} return; }
        if(msg){msg.style.color='#9fb0d0';msg.textContent='Uploading '+ks.length+' document(s)…';}
        Promise.all(ks.map(function(k){ var f=W.docs[k]; return fileToData(f).then(function(data){ if(!data)return {ok:false,error:'read failed'}; var t=map[k]||k; var b64=(String(data).split(',')[1]||''); return arPost('/api/credit_repair_document_upload',{customer_id:cid,type:t,doc_type:t,kind:t,filename:f.name,name:f.name,data:data,base64:b64,content:b64,mime:f.type||''}); }); })).then(function(rs){ var ok=rs.length&&rs.every(function(j){return j&&j.ok;}); if(msg){ msg.style.color=ok?'#5fff9f':'#ffd479'; msg.textContent=ok?'Documents uploaded to the client'+String.fromCharCode(8217)+'s file ✓':((rs.map(function(j){return j&&j.error;}).filter(Boolean)[0])||'Upload failed — confirm admin login.'); } saveWizard(); }); }
      function bodyFor(s){
        if(s===0) return '<div class=armuted>Review the 3-bureau report and check the items to dispute — nothing is filed unless you choose it.</div>'+decisionBanner(dec)+'<div id=ar_report>'+reportTable(bv,__detail)+'</div>';
        if(s===1) return '<div class=armuted>Verify the client’s personal information — this fills the dispute letters. They signed a contract, so capture the full Social Security number.</div>'+fld('Full legal name','name','First Last')+fld('Street address','addr','123 Main St')+fld('City, State ZIP','csz','City, ST 00000')+fld('Date of birth','dob','MM/DD/YYYY')+fld('Social Security number','ssn','000-00-0000');
        if(s===2) return '<div class=armuted>Upload the client’s verification documents — PDF or JPEG. Driver’s license + a proof of address (utility bill) verify identity across all three bureaus.</div>'+docslot('Driver’s license','dl')+docslot('Social Security card','ss')+docslot('Utility bill (proof of address)','util')+'<div id="ar_docsmsg" style="font:12px Inter;color:#9fb0d0;margin-top:4px;min-height:15px"></div>';
        if(s===3) return '<div class=armuted>Enter the client’s bureau logins — pick a bureau, fill username (email) + password. Experian also needs the security question, answer, and PIN.</div><div id="ar_creds"></div>';
        if(s===4) return '<div class=armuted>One strong letter per bureau, built from the checked items + the verified info. Generate each, then download the package (letter + the client’s documents) as a PDF to upload through the bureau login.</div><div id="ar_letters"></div>';
        var __by={}; ((cr&&cr.credentials)||[]).forEach(function(x){ __by[String(x.service||'').toLowerCase()]=x; });
        var __rows=[['experian','Experian'],['equifax','Equifax'],['transunion','TransUnion']].map(function(p){ var svc=p[0],nmb=p[1]; var wc=(W.creds&&W.creds[svc])||{}; var user=wc.username||(__by[svc]&&__by[svc].username)||''; var sub=!!(W.submitted&&W.submitted[svc]);
          return '<div class=arsubrow data-svc="'+svc+'" style="display:flex;align-items:center;gap:11px;padding:11px 13px;margin-bottom:8px;border:1px solid '+(sub?'rgba(61,220,132,.45)':'rgba(255,255,255,.14)')+';border-radius:12px;background:rgba(255,255,255,.03)"><div style="flex:1;min-width:0"><div style="font:800 13px Inter;color:#fff">'+nmb+'</div><div style="font:12px Inter;color:#9fb0d0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+(user?esc(user):'no login on file')+'</div></div><button class=ar_sub style="flex:0 0 auto;display:flex;align-items:center;gap:6px;background:'+(sub?'linear-gradient(135deg,#3ddc84,#16a34a)':'rgba(255,255,255,.06)')+';border:1px solid '+(sub?'transparent':'rgba(255,255,255,.2)')+';color:'+(sub?'#fff':'#cdd6ea')+';font:700 12px Inter;border-radius:9px;padding:9px 14px;cursor:pointer;'+(sub?'box-shadow:0 4px 12px rgba(34,197,94,.4)':'')+'">'+(sub?'<svg width=14 height=14 viewBox="0 0 24 24" fill=none stroke=currentColor stroke-width=3 stroke-linecap=round stroke-linejoin=round><polyline points="20 6 9 17 4 12"></polyline></svg> Submitted':'Mark submitted')+'</button></div>';
        }).join('');
        return '<div class=armuted>Upload each bureau’s package through its login, then mark it submitted. When they’re in, text the client.</div>'+__rows+'<div style="margin-top:14px;border-top:1px solid rgba(255,255,255,.1);padding-top:12px"><button id="ar_file" '+BTN+'>Text client &mdash; disputes filed</button><div id="ar_res" style="font-size:12.5px;color:#5fff9f;margin-top:10px;min-height:15px"></div></div>';
      }
      function nav(){ return '<div style="display:flex;gap:10px;margin-top:16px;border-top:1px solid rgba(255,255,255,.1);padding-top:12px">'+(W.step>0?'<button id="ar_back" style="background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);color:#fff;font-weight:700;border-radius:11px;padding:11px 20px;cursor:pointer;font-family:inherit">Back</button>':'')+(W.step<STEPS.length-1?'<button id="ar_next" style="background:linear-gradient(135deg,#c41e3a,#ff5f6d);border:0;color:#fff;font-weight:800;border-radius:11px;padding:12px 22px;cursor:pointer;font-family:inherit">Next: '+esc(STEPS[W.step+1])+'</button>':'')+'</div>'; }
      function saveStep(){ if(W.step===0){ var box=det.querySelector('#ar_report'); if(box){ W.picks={}; Array.prototype.forEach.call(box.querySelectorAll('.ar_pick:checked'),function(x){ W.picks[x.getAttribute('data-item')]=true; }); } } if(W.step===1){ Array.prototype.forEach.call(det.querySelectorAll('.ar_if'),function(i){ W.info[i.getAttribute('data-k')]=i.value; }); } if(W.step===3){ collectCreds(); } saveWizard(); }
      function renderStep(){
        det.innerHTML='<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:14px"><div style="min-width:0"><div style="font:800 18px Inter">'+esc(c.name||email||cid)+'</div><div style="font:500 12px Inter;color:#9fb0d0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(email||'')+'</div></div><span id="ar_status" style="flex:0 0 auto;align-self:center;font:600 11px Inter;color:#7e8cad">Auto-saving</span></div>'+stepbar()+bodyFor(W.step)+nav();
        if(W.step===0){ var box=det.querySelector('#ar_report'); if(box){ Array.prototype.forEach.call(box.querySelectorAll('.ar_pick'),function(x){ if(W.picks[x.getAttribute('data-item')])x.checked=true; x.onchange=function(){ saveStep(); flashSaved(); }; }); } }
        function commit(from){ saveStep(); if(from===2)saveDocs(); else if(from===3)saveCreds(); flashSaved(); }
        var nx=det.querySelector('#ar_next'); if(nx)nx.onclick=function(){ var from=W.step; commit(from); W.step=Math.min(STEPS.length-1,W.step+1); renderStep(); };
        var bk=det.querySelector('#ar_back'); if(bk)bk.onclick=function(){ saveStep(); W.step=Math.max(0,W.step-1); renderStep(); };
        /* inline save: every form field commits locally on blur (no Save buttons) */
        Array.prototype.forEach.call(det.querySelectorAll('.ar_if,[data-cf]'),function(i){ i.onblur=function(){ saveStep(); flashSaved(); }; });
        if(W.step===2){ Array.prototype.forEach.call(det.querySelectorAll('.ar_doc'),function(fi){ fi.onchange=function(){ var k=fi.getAttribute('data-doc'); W.docs=W.docs||{}; W.docs[k]=(fi.files&&fi.files[0])||null; renderStep(); saveDocs(); }; }); }
        if(W.step===3){ credTabs(); }
        if(W.step===4){ renderGenerate(det, bv, __detail, W, cid); }
        if(W.step===5){ Array.prototype.forEach.call(det.querySelectorAll('.arsubrow'),function(row){ var svc=row.getAttribute('data-svc'); var sb=row.querySelector('.ar_sub'); if(sb)sb.onclick=function(){ W.submitted=W.submitted||{}; W.submitted[svc]=!W.submitted[svc]; saveWizard(); renderStep(); }; }); var fb=det.querySelector('#ar_file'); if(fb)fb.onclick=function(){ notifyFiled(det, cid, email, (W.info.name||'').split(' ')[0]); }; }
      }
      window.__arGo=function(i){ saveStep(); W.step=Math.max(0,Math.min(STEPS.length-1,i)); renderStep(); };
      renderStep();
    }).catch(function(){ det.innerHTML='<div style="color:#ff5f6d">Could not load this client’s file.</div>'; });
  }

  function notifyFiled(det, cid, email, first){
    var res=det.querySelector('#ar_res');
    if(!window.confirm('Text '+(first||'this client')+' that their disputes have been filed with the bureaus?')) return;
    res.style.color='#9fb0d0'; res.textContent='Texting the client…';
    var fb=det.querySelector('#ar_file'); if(fb)fb.disabled=true;
    fetch('/api/credit_repair_file_notify',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({customer_id:cid, email:email})})
      .then(function(r){ if(r.status===401||r.status===403){ res.style.color='#ffd479'; res.textContent='Admin sign-in required.'; return null; } return r.json(); })
      .then(function(j){ if(fb)fb.disabled=false; if(!j)return;
        if(j.ok){ res.style.color='#5fff9f'; res.textContent='Client texted at '+(j.to||'')+' — disputes filed.'; }
        else { res.style.color='#ffd479'; res.textContent=(j.error||'Could not text the client.'); }
      }).catch(function(){ if(fb)fb.disabled=false; res.style.color='#ff5f6d'; res.textContent='Network error.'; });
  }

  // ===== DISPUTE LETTER GENERATION (front-end, client-scoped, no DB writes) =====
  var BUREAU_ADDR={
    Equifax:'Equifax Information Services LLC\nP.O. Box 740256\nAtlanta, GA 30374',
    Experian:'Experian\nDispute Department\nP.O. Box 4500\nAllen, TX 75013',
    TransUnion:'TransUnion LLC — Consumer Dispute Center\nP.O. Box 2000\nChester, PA 19016'
  };
  var LEGAL_BODY=[
'====================================================================',
'SPECIFIC LEGAL GROUNDS AND DEMANDS (each applies to every item above)',
'====================================================================',
'',
'1. REASONABLE REINVESTIGATION — FCRA § 611, 15 U.S.C. § 1681i(a)(1)(A). Upon receipt of this dispute you must conduct a REASONABLE reinvestigation, FREE OF CHARGE, within 30 days (45 only if I submit additional information during the 30-day period), and review and consider ALL relevant information I submit.',
'',
'2. NOTICE TO FURNISHER — FCRA § 611(a)(2), 15 U.S.C. § 1681i(a)(2). Within 5 business days you must provide notice of the dispute, including all relevant information I submit, to the furnisher of each disputed item.',
'',
'3. MAXIMUM POSSIBLE ACCURACY — FCRA § 1681e(b). You must follow reasonable procedures to assure maximum possible accuracy. Information that is misleading even if technically accurate fails this standard.',
'',
'4. DELETE OR MODIFY — FCRA § 611(a)(5)(A), 15 U.S.C. § 1681i(a)(5)(A). Any information found inaccurate, incomplete, OR that cannot be verified must be PROMPTLY DELETED or modified. A bare "verified" response without the documentation demanded below is not a lawful basis to retain the item.',
'',
'5. NO REINSERTION — FCRA § 611(a)(5)(B), 15 U.S.C. § 1681i(a)(5)(B). Once deleted, an item may NOT be reinserted unless the furnisher certifies it is complete and accurate; if you reinsert any deleted item you must notify me IN WRITING within 5 business days, with the furnisher’s certification, business name, address, and telephone number.',
'',
'6. METHOD OF VERIFICATION — FCRA § 611(a)(6)-(7), 15 U.S.C. § 1681i(a)(6)-(7). If you claim to "verify" any item, I demand within 15 days a description of your reinvestigation: the BUSINESS NAME, ADDRESS, and TELEPHONE NUMBER of each furnisher contacted, the documents reviewed, and the procedure used. Parroting the furnisher’s computerized data through e-OSCAR without reviewing source documents is NOT reasonable.',
'',
'7. CONSUMER DISCLOSURE — FCRA § 609, 15 U.S.C. § 1681g. Disclose all information in my file and the sources for each disputed item.',
'',
'8. OBSOLETE INFORMATION — FCRA § 605, 15 U.S.C. § 1681c. Remove any item beyond the permitted reporting periods.',
'',
'9. FURNISHER ACCURACY — FCRA § 623, 15 U.S.C. § 1681s-2. Furnishers must report complete and accurate information and investigate disputes; reporting information known or reasonably believed to be inaccurate is prohibited.',
'',
'10. DEBT VALIDATION (collections/charge-offs) — FDCPA § 809, 15 U.S.C. § 1692g. I demand: (a) proof the debt exists and the amount is correct; (b) the ORIGINAL signed agreement bearing my signature; (c) the COMPLETE chain of title/assignment from the original creditor; (d) the identity of the original creditor; (e) account-level documentation for every figure reported. Absent this, the item is unverified and must be deleted.',
'',
'11. RESERVATION OF RIGHTS — UCC § 1-308 and § 1-103. All rights reserved without prejudice. Produce the original signed instrument and full assignment/transfer chain for any account claimed valid.',
'',
'12. METRO 2 COMPLIANCE. Verify each item at the field level: Account Status Code, Payment Rating, Date of First Delinquency (must not be re-aged), and Compliance Condition Code. Any field not verifiable exactly as reported requires deletion.',
'',
'====================================================================',
'CONTROLLING AND PERSUASIVE AUTHORITY',
'====================================================================',
'- Cushman v. Trans Union Corp., 115 F.3d 220 (3d Cir. 1997) — no "parroting"; a reasonable reinvestigation is required.',
'- Dennis v. BEH-1, LLC, 520 F.3d 1066 (9th Cir. 2009) — technically accurate but misleading reporting violates § 1681e(b).',
'- Hinkle v. Midland Credit Mgmt., Inc., 827 F.3d 1295 (11th Cir. 2016) — verifying an assigned/collection debt requires documentation and a complete chain of title.',
'- Saunders v. Branch Banking & Trust Co., 526 F.3d 142 (4th Cir. 2008) — furnishers are liable for inaccurate or misleading reporting.',
'',
'====================================================================',
'DEADLINE, ESCALATION, AND LIABILITY',
'====================================================================',
'This is a single, complete dispute across all applicable items — NOT a successive or frivolous re-dispute. Complete your reinvestigation within 30 days and send written results, including the method of verification and the identity of any furnisher contacted, to my address above. Delete every item you cannot verify in full, exactly as reported.',
'',
'If any item is returned "verified" without the documentation and method of verification demanded above, or is not deleted, I will file complaints with the Consumer Financial Protection Bureau (CFPB) and the Federal Trade Commission (FTC) and pursue all remedies available to me.',
'',
'Willful noncompliance subjects you to liability under FCRA § 616, 15 U.S.C. § 1681n, for actual or statutory damages of $100 to $1,000 per violation, plus punitive damages, costs, and reasonable attorney’s fees. Negligent noncompliance subjects you to liability under FCRA § 617, 15 U.S.C. § 1681o, for actual damages, costs, and attorney’s fees.'
  ].join('\n');

  function disputeLetterText(bureau, info, items){
    info=info||{}; var nm=info.name||'[CLIENT NAME]';
    var L=[];
    var today=''; try{ today=new Date().toLocaleDateString('en-US'); }catch(e){}
    L.push(today||'[DATE]','');
    L.push(nm, info.addr||'[STREET ADDRESS]', info.csz||'[CITY, STATE ZIP]', 'Date of Birth: '+(info.dob||'[MM/DD/YYYY]')+'      SSN: '+(info.ssn||'[SSN]'),'');
    L.push(BUREAU_ADDR[bureau]||bureau,'');
    /* [2026-06-24 Mel] no certified mail — disputes are uploaded through the bureau login portal */
    L.push('RE: Formal Dispute, Demand for Reasonable Reinvestigation, Method of Verification, and Deletion — Notice of Rights and Liability Under the FCRA, FDCPA, and UCC');
    L.push('    Consumer: '+nm,'');
    L.push('To the '+bureau+' Dispute Department,','');
    L.push('I, '+nm+', am the consumer to whom the following information relates. I formally dispute each item identified below as INACCURATE, INCOMPLETE, UNVERIFIABLE, and/or not reported with maximum possible accuracy. This is my written notice of dispute under the Fair Credit Reporting Act (FCRA), 15 U.S.C. § 1681 et seq. All rights are reserved, without prejudice, under UCC § 1-308, with reference to the supplementary general principles of law preserved by UCC § 1-103.','');
    L.push('I am NOT requesting a "soft" or automated review. I am demanding a full, reasonable reinvestigation and the documentation described below.','');
    L.push('====================================================================','DISPUTED ITEMS','====================================================================','');
    items.forEach(function(it,i){ L.push('ITEM '+(i+1)+' — '+it.name); if(it.reason)L.push('   '+it.reason); L.push(''); });
    L.push(LEGAL_BODY,'');
    L.push('Sincerely,','','','_______________________________________',nm,'','Enclosures: copy of government-issued photo ID; proof of current address','');
    return L.join('\n');
  }
  function dlFile(name, text){ try{ var b=new Blob([text],{type:'text/plain;charset=utf-8'}); var u=URL.createObjectURL(b); var a=document.createElement('a'); a.href=u; a.download=name; document.body.appendChild(a); a.click(); setTimeout(function(){URL.revokeObjectURL(u);a.remove();},150); }catch(e){} }
  /* [2026-06-24 Mel] download the dispute as a PDF PACKAGE = the letter + the client's documents (ID/SSN/utility), to upload through the bureau login. */
  function __fdata(f){ return new Promise(function(res){ try{ var r=new FileReader(); r.onload=function(){res(r.result);}; r.onerror=function(){res(null);}; r.readAsDataURL(f); }catch(e){res(null);} }); }
  function __idims(d){ return new Promise(function(res){ try{ var im=new Image(); im.onload=function(){res({w:im.naturalWidth,h:im.naturalHeight});}; im.onerror=function(){res(null);}; im.src=d; }catch(e){res(null);} }); }
  function downloadPackage(safe, L, W){
    var JS=(window.jspdf&&window.jspdf.jsPDF)||window.jsPDF;
    if(!JS){ dlFile(safe+'_'+L.bureau+'_dispute.txt', L.text); return; }   /* fallback if the PDF lib didn't load */
    var docs=(W&&W.docs)||{}; var jobs=[];
    [['dl','Driver’s license'],['ss','Social Security card'],['util','Utility bill']].forEach(function(p){ var f=docs[p[0]]; if(f&&/image\//.test(f.type||'')) jobs.push(__fdata(f).then(function(d){ return d?__idims(d).then(function(dm){return {label:p[1],data:d,dim:dm};}):null; })); });
    Promise.all(jobs).then(function(imgs){
      try{ var doc=new JS({unit:'pt',format:'letter'}); var pw=doc.internal.pageSize.getWidth(), ph=doc.internal.pageSize.getHeight(), m=54, cwd=pw-m*2, y=m, lh=12.5;
        doc.setFont('courier','normal'); doc.setFontSize(9.5);
        doc.splitTextToSize(L.text, cwd).forEach(function(ln){ if(y>ph-m){ doc.addPage(); y=m; } doc.text(ln, m, y); y+=lh; });
        imgs.filter(Boolean).forEach(function(im){ if(!im.data)return; try{ doc.addPage(); doc.setFont('helvetica','bold'); doc.setFontSize(12); doc.text(im.label, m, m); var fmt=/^data:image\/png/i.test(im.data)?'PNG':'JPEG'; var maxW=cwd, maxH=ph-m*2-24, iw=maxW, ih=maxW; if(im.dim&&im.dim.w&&im.dim.h){ var rr=im.dim.h/im.dim.w; ih=maxW*rr; if(ih>maxH){ ih=maxH; iw=maxH/rr; } } doc.addImage(im.data, fmt, m, m+14, iw, ih); }catch(e){} });
        doc.save(safe+'_'+L.bureau+'_package.pdf');
      }catch(e){ dlFile(safe+'_'+L.bureau+'_dispute.txt', L.text); }
    });
  }

  // build per-bureau letters from the CURRENTLY CHECKED items in this client's own report
  function buildLetters(bv, detail, W){
    var accounts=bv.accounts||[]; var groups=accounts.length?(window.__memTrimerge?window.__memTrimerge(accounts,detail||{}):[]):(bv.grouped||[]);
    var checked=(W&&W.picks)||{};
    var perBureau={Experian:[],TransUnion:[],Equifax:[]};
    groups.forEach(function(g){ var key=g.creditor_canon||g.account_key; if(!checked[key]) return;
      BUREAUS.forEach(function(b){ var a=g.bureaus&&g.bureaus[b]; if(!a) return;
        var reason = a.derogatory ? ('Reported as "'+(a.status||'derogatory')+'", balance '+money(a.balance)+' — disputed as inaccurate and unverifiable. Verify in full (incl. FDCPA § 1692g validation + chain of title for any collection/charge-off) or delete.')
                                   : ('Disputed as inaccurate and unverifiable as reported (balance '+money(a.balance)+'). Verify exactly as reported or delete.');
        perBureau[b].push({name:(g.creditor_canon||g.account_key)+(g.last4?(' (acct ending '+g.last4+')'):''), reason:reason});
      });
    });
    var out=[]; BUREAUS.forEach(function(b){ if(perBureau[b].length) out.push({bureau:b, count:perBureau[b].length, text:disputeLetterText(b, (W&&W.info)||{}, perBureau[b])}); });
    return out;
  }
  /* [2026-06-25 Mel] read body.text whether the stored body is a JSON OBJECT or a JSON STRING. */
  function letterText(body){
    if(body==null) return '';
    if(typeof body==='string'){ try{ var o=JSON.parse(body); return (o&&typeof o==='object'&&o.text!=null)?String(o.text):body; }catch(e){ return body; } }
    if(typeof body==='object'){ return body.text!=null?String(body.text):JSON.stringify(body,null,2); }
    return String(body);
  }
  /* [2026-06-25 Mel] open a printable window with the FULL prose (Print -> Save as PDF works too). */
  function printLetter(text, bureau){ try{ var w=window.open('','_blank'); if(!w)return; w.document.write('<title>'+esc((bureau||'')+' dispute letter')+'</title><pre style="white-space:pre-wrap;word-break:break-word;font:12px/1.55 Courier,monospace;padding:30px;color:#111">'+esc(text)+'</pre>'); w.document.close(); w.focus(); setTimeout(function(){ try{w.print();}catch(e){} },350); }catch(e){} }

  /* [2026-06-25 Mel] SAVED CONSOLIDATED LETTERS — the one-strong-per-bureau letters stored on the
     client's file (control_store.credit_repair_letters, letter_type=consolidated_per_bureau). The old
     UI only built letters client-side from the checked items and never showed these. Strictly scoped
     to the selected client by customer_id via /api/dispute_letters (server-bridged, admin-gated). */
  function loadSavedLetters(det, cid, W){
    var sb=det.querySelector('#ar_saved'); if(!sb) return;
    var head='<div class=arseclbl>Saved consolidated letters</div>';
    if(!cid){ sb.innerHTML=head+'<div style="color:#9fb0d0;font:12.5px Inter">No client id for this file.</div>'; return; }
    sb.innerHTML=head+'<div style="color:#9fb0d0;font:12.5px Inter;padding:2px 0">Loading saved letters…</div>';
    fetch('/api/dispute_letters',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({customer_id:cid})})
      .then(function(r){return r.json();}).catch(function(){return {ok:false,error:'network error'};})
      .then(function(j){ renderSaved(sb, j, W, cid); });
  }
  function renderSaved(sb, j, W, cid){
    var head='<div class=arseclbl>Saved consolidated letters</div>';
    if(!j||j.ok===false){ sb.innerHTML=head+'<div style="color:#ffd479;font:12.5px Inter">'+esc((j&&j.error)||'Could not load saved letters — admin sign-in required.')+'</div>'; return; }
    var rows=(j.rows||[]).filter(function(r){ return String(r.letter_type||'')==='consolidated_per_bureau' && String(r.customer_id||cid)===String(cid); });
    if(!rows.length){ sb.innerHTML=head+'<div style="color:#9fb0d0;font:12.5px Inter">No consolidated letters saved for this client yet.</div>'; return; }
    var ord={Experian:0,TransUnion:1,Equifax:2}; rows.sort(function(a,b){ return (ord[a.bureau]==null?9:ord[a.bureau])-(ord[b.bureau]==null?9:ord[b.bureau]); });
    var safe=(((W&&W.info&&W.info.name)||'client')).replace(/[^A-Za-z0-9]+/g,'_'); var active=0;
    function paint(){ var row=rows[active]; var text=letterText(row.body); var cnt=row.item_count||'';
      var tabs='<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">'+rows.map(function(x,i){ var on=(i===active); return '<button class="ar_stab" data-i="'+i+'" style="flex:1;min-width:110px;background:'+(on?'linear-gradient(135deg,#c41e3a,#ff5f6d)':'rgba(255,255,255,.06)')+';border:1px solid '+(on?'#ff5f6d':'rgba(255,255,255,.15)')+';color:#fff;font:700 12px Inter;border-radius:10px;padding:10px 12px;cursor:pointer">'+esc(x.bureau||'Bureau')+(x.item_count?(' &middot; '+esc(x.item_count)):'')+'</button>'; }).join('')+'</div>';
      var pane='<div style="border:1px solid rgba(255,255,255,.12);border-radius:10px;background:rgba(0,0,0,.25)"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:9px 12px;border-bottom:1px solid rgba(255,255,255,.08)"><div style="font:800 13px Inter">'+esc(row.bureau||'')+(cnt?(' &mdash; '+esc(cnt)+' item(s)'):'')+'</div><div style="display:flex;gap:8px"><button id="ar_sdl" style="background:linear-gradient(135deg,#c41e3a,#ff5f6d);border:0;color:#fff;font-weight:800;border-radius:8px;padding:7px 14px;cursor:pointer;font-family:inherit;font-size:12px">Download package (PDF)</button><button id="ar_sprint" style="background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.2);color:#fff;font-weight:700;border-radius:8px;padding:7px 14px;cursor:pointer;font-family:inherit;font-size:12px">Print</button></div></div><pre style="margin:0;padding:12px;white-space:pre-wrap;word-break:break-word;font:12.5px/1.5 Inter,system-ui,sans-serif;color:#dfe6f5;max-height:360px;overflow:auto">'+esc(text)+'</pre></div>';
      sb.innerHTML=head+'<div class=armuted>The one-strong-per-bureau letters saved to this client'+String.fromCharCode(8217)+'s file. Full prose below &mdash; download as a PDF package (letter + the client'+String.fromCharCode(8217)+'s documents) or print.</div>'+tabs+pane;
      Array.prototype.forEach.call(sb.querySelectorAll('.ar_stab'),function(btn){ btn.onclick=function(){ active=+btn.getAttribute('data-i'); paint(); }; });
      var d=sb.querySelector('#ar_sdl'); if(d)d.onclick=function(){ downloadPackage(safe, {bureau:row.bureau, text:letterText(row.body), count:row.item_count}, W); };
      var p=sb.querySelector('#ar_sprint'); if(p)p.onclick=function(){ printLetter(letterText(row.body), row.bureau); };
    }
    paint();
  }

  function renderGenerate(det, bv, detail, W, cid){
    var box=det.querySelector('#ar_letters'); if(!box) return;
    box.innerHTML='<div id="ar_saved"></div><div style="height:14px"></div><div class=arseclbl>Build from checked items</div><div id="ar_gen"></div>';
    loadSavedLetters(det, cid, W);
    var genBox=det.querySelector('#ar_gen'); if(!genBox) return;
    var letters=buildLetters(bv, detail, W);
    if(!letters.length){ genBox.innerHTML='<div style="color:#ffd479;font-size:12.5px">No items checked — go back to “Select items” and check at least one.</div>'; return; }
    var safe=(((W&&W.info&&W.info.name)||'client')).replace(/[^A-Za-z0-9]+/g,'_'); var active=0, gen={};
    /* [2026-06-24 Mel] HORIZONTAL bureau tabs — one GENERATE per bureau. Click a tab, generate that bureau's letter, preview + download. */
    function paint(){ var L=letters[active];
      var tabs='<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">'+letters.map(function(x,i){ var dn=gen[x.bureau]; var bgc=dn?'linear-gradient(135deg,#3ddc84,#16a34a)':(i===active?'linear-gradient(135deg,#c41e3a,#ff5f6d)':'rgba(255,255,255,.06)'); return '<button class="ar_ltab" data-i="'+i+'" style="flex:1;min-width:110px;background:'+bgc+';border:1px solid '+(dn?'transparent':(i===active?'#ff5f6d':'rgba(255,255,255,.15)'))+';color:#fff;font:700 12px Inter;border-radius:10px;padding:10px 12px;cursor:pointer'+(dn?';box-shadow:0 3px 10px rgba(34,197,94,.35)':'')+'">'+esc(x.bureau)+' &middot; '+x.count+(dn?' ✓':'')+'</button>'; }).join('')+'</div>';
      var pane;
      if(!gen[L.bureau]) pane='<div style="border:1px dashed rgba(255,255,255,.2);border-radius:10px;padding:22px 14px;text-align:center"><div style="color:#9fb0d0;font:12.5px Inter;margin-bottom:12px">'+esc(L.bureau)+' &mdash; '+L.count+' disputed item(s) ready.</div><button id="ar_gen1" '+BTN+'>Generate '+esc(L.bureau)+' letter</button></div>';
      else pane='<div style="border:1px solid rgba(255,255,255,.12);border-radius:10px;background:rgba(0,0,0,.25)"><div style="display:flex;justify-content:space-between;align-items:center;padding:9px 12px;border-bottom:1px solid rgba(255,255,255,.08)"><div style="font:800 13px Inter">'+esc(L.bureau)+' &mdash; '+L.count+' item(s)</div><button id="ar_dlone" style="background:linear-gradient(135deg,#c41e3a,#ff5f6d);border:0;color:#fff;font-weight:800;border-radius:8px;padding:7px 14px;cursor:pointer;font-family:inherit;font-size:12px">Download package (PDF)</button></div><pre style="margin:0;padding:12px;white-space:pre-wrap;word-break:break-word;font:12.5px/1.5 Inter,system-ui,sans-serif;color:#dfe6f5;max-height:300px;overflow:auto">'+esc(L.text)+'</pre></div>';
      genBox.innerHTML=tabs+pane;
      Array.prototype.forEach.call(genBox.querySelectorAll('.ar_ltab'),function(btn){ btn.onclick=function(){ active=+btn.getAttribute('data-i'); paint(); }; });
      var g1=genBox.querySelector('#ar_gen1'); if(g1)g1.onclick=function(){ gen[L.bureau]=true; paint(); };
      var d1=genBox.querySelector('#ar_dlone'); if(d1)d1.onclick=function(){ downloadPackage(safe, L, W); };
    }
    paint();
  }

  /* [2026-06-24 Mel] hide seeded/throwaway test accounts so REAL clients surface. Toggle shows all. */
  function isTestClient(c){ var e=String((c&&c.email)||'').toLowerCase(), n=String((c&&c.name)||'').toLowerCase(); if(!e) return true;
    var lp=e.split('@')[0]||'', dom=e.split('@')[1]||'';
    if(/(example\.com|memelli\.test|memelli-test|memellitest|throwaway)/.test(dom)||dom==='test.com'||/\.test$|\.local$/.test(dom)) return true;
    if(/^(test|probe|verify|e2e|diag|gate|lane|finish|exec|flow|journey|signup|wire|sstest|cookie|trace|owner|root|cust|plant|rail|design|session|bar-verify|vg2|vtest|throwaway|paid160|paidcust|deleteme)/.test(lp)) return true;
    if(/(\+178\d{6,}|_178\d{6,}|178\d{8,})/.test(e)) return true;
    if(/\b(test|verify|probe|e2e)\b/.test(n)) return true;
    return false; }
  window.__winRender=window.__winRender||{};
  window.__winRender.creditreview=function(bd, st){
    bd.innerHTML='<div style="opacity:.7;padding:20px">Loading clients…</div>';
    fetch('/api/admin_crm',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:'{}'}).then(function(r){return r.json();}).then(function(j){
      if(!j||!j.ok){ bd.innerHTML='<div style="opacity:.85;padding:20px">Credit Review is admin only — sign in as admin.</div>'; return; }
      var cs=j.clients||[];
      bd.innerHTML=CSS+'<div class=arwrap>'
        +'<div class=arlist><input class=arq placeholder="Search clients…"><div class=artoggle style="font:12px Inter;color:#9fb0d0;padding:2px 10px 9px;cursor:pointer"></div><div class=arrows></div></div>'
        +'<div id=ardetail class=ardetail><div style="opacity:.5;display:flex;height:100%;align-items:center;justify-content:center">Select a client to review their report, see their bureau logins, and file</div></div>'
        +'</div>';
      var rowsEl=bd.querySelector('.arrows'), q=bd.querySelector('.arq'), tog=bd.querySelector('.artoggle'); var sel=null, showTests=false;
      var nTest=cs.filter(isTestClient).length;
      function paint(filter){ rowsEl.innerHTML='';
        tog.innerHTML=showTests?('Showing all '+cs.length+' &middot; <b style="color:#ff8a96">hide test accounts</b>'):(nTest+' test account'+(nTest===1?'':'s')+' hidden &middot; <b style="color:#ff8a96">show all</b>');
        cs.filter(function(c){ if(!showTests&&isTestClient(c)) return false; return !filter||JSON.stringify(c).toLowerCase().indexOf(filter.toLowerCase())>=0; }).forEach(function(c){
          var id=c.id||c.email; var r=document.createElement('div'); r.className='arrow'+(sel===id?' on':'');
          r.innerHTML='<div style="font:600 13px Inter;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(c.name||c.email||'client')+'</div><div style="font:500 11px Inter;color:#9fb0d0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(c.email||'')+(c.pipeline_stage?(' &middot; '+esc(c.pipeline_stage)):'')+'</div>';
          r.onclick=function(){ sel=id; try{localStorage.setItem('mio_arlast',JSON.stringify(c));}catch(_e){} paint(q.value); showClient(bd, c); }; rowsEl.appendChild(r);
        }); if(!rowsEl.children.length)rowsEl.innerHTML='<div style="opacity:.6;padding:10px;font-size:12px">No matches.</div>'; }
      tog.onclick=function(){ showTests=!showTests; paint(q.value); };
      q.oninput=function(){ paint(q.value); }; paint('');
      /* [2026-06-24 Mel] reopen straight to the last client you were working — no hunting back to it */
      try{ var __last=JSON.parse(localStorage.getItem('mio_arlast')||'null'); if(__last&&(__last.id||__last.email)){ var __lid=__last.id||__last.email; var __m=cs.filter(function(c){return (c.id||c.email)===__lid;})[0]; if(__m){ sel=__lid; paint(q.value); showClient(bd,__m); } } }catch(e){}
    }).catch(function(){ bd.innerHTML='<div style="opacity:.85;padding:20px">Could not load Credit Review.</div>'; });
  };
})();
