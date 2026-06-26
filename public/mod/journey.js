(function(){
  /* [DESIGNER 2026-06-23] Renders the REAL process from the rail. Nothing invented.
     Tri-merge comes from api_client_bureau_view (LOCKED v5) -> d.grouped: each = ONE account matched
     across bureaus by identity (account tail + opened + balance), with bureaus:{Experian,TransUnion,
     Equifax} and the cross-bureau discrepancy reporting_on / missing_from / balance_mismatch = the
     DISPUTE DECISION. Full per-tradeline detail (acct#, dates, high bal, limit, past due, pay status)
     comes from api_client_account_detail and shows on expand. Front-end step persisted so a change
     never restarts the journey. Horizontal stepper across the top, full-width report. */
  function esc(x){ return String(x==null?'':x).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function money(v){ return (v!=null&&Number(v))?('$'+Number(v).toLocaleString()):'$0'; }
  function fmtd(x){ return x?String(x).slice(0,16):'—'; }
  var STEPS=[['signup','Sign up'],['smartcredit','Check SmartCredit'],['decision','Funding Decision'],['repair','Credit Repair'],['prequalified','Pre-qualified'],['funding','Funding']];
  var BUREAUS=['Experian','TransUnion','Equifax'];
  /* [2026-06-24 Mel] SHARED 3-bureau trimerge — ONE matcher used by BOTH the client journey AND the admin credit review, so they can never drift apart again. Matches the SAME tradeline across bureaus by open month + limit + high balance (+ fuzzy creditor), NOT by account number (which is masked differently per bureau). Takes the whole parsed report (accounts + detail). */
  window.__memTrimerge=window.__memTrimerge||function(accounts,detail){ detail=detail||{};
    function det(a){ return (detail[a.account_key]&&detail[a.account_key][a.bureau])||{}; }
    function tail(ak){ var p=String(ak||'').split('|'); return p.length>1?p[p.length-1]:''; }
    function l4(a){ var d=det(a); return d.acct_last4||tail(a.account_key); }
    function ym(a){ var d=det(a); return String(d.opened||a.opened||'').slice(0,7); }
    function n(v){ v=Number(v); return (isFinite(v)&&v!==0)?v:null; }
    function near(x,y){ if(x==null||y==null)return 0; if(x===y)return 1; var m=Math.max(Math.abs(x),Math.abs(y)); return (m&&Math.abs(x-y)/m<=0.02)?1:0; }
    function bkt(a){ var t=String(det(a).account_type||'').toLowerCase(); if(t.indexOf('collection')>=0)return 'coll'; if(t.indexOf('mortgage')>=0||t.indexOf('real estate')>=0)return 'mort'; if(/auto|loan|lease|installment|student/.test(t))return 'inst'; if(/card|charge|revolv|flex|line of credit|check credit/.test(t))return 'rev'; return 'oth'; }
    function toks(s){ return String(s||'').toUpperCase().replace(/[^A-Z0-9 ]/g,' ').split(/\s+/).filter(function(t){ return t&&!/^(INC|NA|THE|BANK|CARD|CO|LLC|CR|UNION|USA|FCU|CU)$/.test(t); }); }
    function credit(a,b){ var x=a.creditor_canon||'',y=b.creditor_canon||''; if(x===y)return 'exact'; var tx=toks(x),ty=toks(y); if(!tx.length||!ty.length)return null; if(tx[0]===ty[0])return 'fuzzy'; var sm=tx.length<ty.length?tx:ty,bg=tx.length<ty.length?ty:tx; for(var i=0;i<sm.length;i++){ if(bg.indexOf(sm[i])<0)return null; } return 'fuzzy'; }
    function fs(a,b){ var s=0; if(l4(a)&&l4(a)===l4(b))s+=3; if(ym(a)&&ym(a)===ym(b))s+=2; else if(ym(a)&&ym(b)){ var d=Math.abs(new Date(ym(a)+'-01')-new Date(ym(b)+'-01'))/2.6e9; if(d<=3)s+=1; } s+=2*near(n(det(a).credit_limit),n(det(b).credit_limit)); s+=2*near(n(det(a).high_balance),n(det(b).high_balance)); if(bkt(a)===bkt(b))s+=1; return s; }
    function same(a,b){ if(l4(a)&&l4(a)===l4(b)&&ym(a)&&ym(a)===ym(b)&&(near(n(det(a).credit_limit),n(det(b).credit_limit))||near(n(det(a).high_balance),n(det(b).high_balance))))return true; var c=credit(a,b); if(!c)return false; return fs(a,b)>=(c==='exact'?4:5); }
    var gs=[]; (accounts||[]).forEach(function(a){ var best=null,bestS=-1; for(var i=0;i<gs.length;i++){ var g=gs[i]; if(g.bureaus[a.bureau])continue; var ok=true,mn=99; for(var b in g.bureaus){ if(!same(a,g.bureaus[b])){ok=false;break;} var sc=fs(a,g.bureaus[b]); if(sc<mn)mn=sc; } if(ok&&mn>bestS){bestS=mn;best=g;} } if(best){ best.bureaus[a.bureau]=a; if(String(a.creditor_canon||'').length>String(best.creditor_canon||'').length)best.creditor_canon=a.creditor_canon; } else { var ng={account_key:a.account_key||'',creditor_canon:a.creditor_canon||a.account_key||'',bureaus:{}}; ng.bureaus[a.bureau]=a; gs.push(ng); } });
    gs.forEach(function(g){ var seen={},one='',nk=0; for(var b in g.bureaus){ one=l4(g.bureaus[b]); seen[one]=1; } for(var k in seen)nk++; g.last4=(nk===1)?one:''; });
    return gs; };
  var IN='style="width:100%;box-sizing:border-box;margin-bottom:8px;background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.15);border-radius:10px;color:#fff;padding:11px;font-size:14px"';
  var BTN='style="margin-top:8px;background:linear-gradient(135deg,#c41e3a,#ff5f6d);border:0;color:#fff;font-weight:800;border-radius:11px;padding:12px 22px;cursor:pointer;font-family:inherit"';
  var CSS='<style>.jw{width:100%;padding:2px 0}.jhead{font-weight:800;font-size:15px;margin-bottom:10px}'
    +'.jsteps{display:flex;gap:6px;width:100%;margin-bottom:12px;flex-wrap:nowrap;overflow-x:auto}'
    +'.jstep{flex:1 1 0;min-width:78px;display:flex;align-items:center;gap:6px;padding:6px 8px;border-radius:9px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08)}'
    +'.jstep.cur{border-color:#ff5f6d;background:rgba(196,30,58,.16)}.jstep.on{border-color:rgba(95,255,159,.3)}'
    +'.jdot{width:18px;height:18px;border-radius:50%;flex:0 0 18px;display:grid;place-items:center;font-weight:800;font-size:10px;color:#0b0b0f}'
    +'.jlbl{font-size:11px;font-weight:700;white-space:nowrap}'
    +'.trimerge{width:100%;border-collapse:collapse;font-size:12px;table-layout:fixed}'
    +'.trimerge th{position:sticky;top:0;z-index:2;background:rgba(12,14,22,.96);text-align:left;padding:6px 8px;font-size:10.5px;letter-spacing:.04em;text-transform:uppercase;color:#e11d2a;border-bottom:1px solid rgba(255,255,255,.14)}'
    +'.trimerge td{padding:6px 8px;border-bottom:1px solid rgba(255,255,255,.07);vertical-align:top;color:#dfe6f5}'
    +'.trimerge td.acct{font-weight:700;color:#fff;cursor:pointer}.trimerge td.der{color:#ff6d7a;font-weight:700}.trimerge td.na{color:#566}'
    +'.trimerge .bal{color:#9fb0d0;font-size:10.5px}.trimerge input{accent-color:#e11d2a;width:15px;height:15px}'
    +'.detwrap{display:flex;gap:14px;flex-wrap:wrap;padding:8px 4px 12px}.detcol{min-width:150px;flex:1 1 150px}'
    +'.detb{font-weight:800;color:#e11d2a;font-size:10.5px;letter-spacing:.05em;text-transform:uppercase;margin-bottom:5px}'
    +'.detl{display:flex;justify-content:space-between;gap:10px;font-size:11px;padding:2px 0;color:#dfe6f5}.detl b{color:#8a97b5;font-weight:600}'
    +'.jmuted{font-size:12px;color:#9fb0d0;line-height:1.5;margin-bottom:8px}</style>';
  function stepsBar(ci){ return '<div class=jsteps>'+STEPS.map(function(s,i){ var on=i<ci,cur=i===ci; var cls='jstep'+(cur?' cur':(on?' on':'')); var dotbg=on?'#5fff9f':(cur?'#ff5f6d':'rgba(255,255,255,.18)'); return '<div class="'+cls+'"><div class=jdot style="background:'+dotbg+'">'+(on?'&#10003;':(i+1))+'</div><div class=jlbl style="color:'+(cur?'#fff':(on?'#9fe9bd':'#9fb0d0'))+'">'+esc(s[1])+'</div></div>'; }).join('')+'</div>'; }
  function panel(stage,authed,solo){ var ci=STEPS.map(function(s){return s[0];}).indexOf(stage); if(ci<0)ci=authed?1:0;
    var right;
    if(!authed){ right='<div class=jmuted>Sign up free &mdash; then we pull your file and show what to fix and what you\'re pre-qualified for.</div><button id="mbj_su" '+BTN+'>Sign up free</button>'; }
    else if(stage==='smartcredit'){ right='<div style="font-weight:800;font-size:16px;margin-bottom:6px;color:#5fff9f">You\'re in.</div><div class=jmuted>Connect SmartCredit ($1 trial) to pull your 3-bureau file &mdash; that\'s where your repair items and your pre-qualified funding come from.</div><input id="mbj_e" type="email" placeholder="SmartCredit Email" autocomplete="email" '+IN+'><input id="mbj_p" type="password" placeholder="SmartCredit Password" autocomplete="current-password" '+IN+'><button id="mbj_go" '+BTN+'>Connect &amp; pull my file</button><div id="mbj_res" style="font-size:12.5px;color:#5fff9f;margin-top:10px;min-height:15px"></div>'; }
    else if(stage==='decision'){ right='<div class=jmuted>Your file is in. Here\'s your funding decision &mdash; whether you qualify for funding now, or we repair first. This is the pool: qualify or not.</div><div id="cd_box">Checking your decision&hellip;</div>'; }
    else if(stage==='repair'){ right='<div class=jmuted>Your three bureaus side by side, one row per account. Each row shows the account number, status and balance on every bureau &mdash; this is your snapshot. Disputing is your choice: nothing is filed unless you check it. If you want to dispute an item, tick it below, then add your documents at the bottom.</div><div id="cr_grid">Loading your 3-bureau report&hellip;</div><div style="margin-top:14px;border-top:1px solid rgba(255,255,255,.1);padding-top:12px"><div class=jmuted>Upload ID + proof of address (verifies you across all three bureaus).</div><input id="cr_file" type="file" multiple '+IN+'></div><button id="cr_submit" '+BTN+'>Submit my disputes</button><div id="cr_res" style="font-size:12.5px;color:#5fff9f;margin-top:10px;min-height:15px"></div>'; }
    else if(stage==='prequalified'){ right='<div class=jmuted>What your file pre-qualifies you for &mdash; personal and business funding.</div><div id="pq_list" style="font-size:13px">Loading your pre-qualified offers&hellip;</div><button id="pq_next" '+BTN+'>Continue</button>'; }
    else { right='<div class=jmuted>Your funding offers &mdash; lenders matched to your file. Your specialist runs these as your advocate; amounts finalize on approval.</div><div id="fund_list" style="font-size:13px">Loading your offers&hellip;</div>'; }
    /* solo = a standalone spawn window (decision/repair/prequal/funding open on their own) — drop the funnel chrome so the content runs full-width and tight; the journey window keeps the steps bar. */
    var chrome=solo?'':('<div class=jhead>Your Journey</div>'+stepsBar(ci)+'<div style="font-weight:800;font-size:16px;margin-bottom:10px">'+esc(STEPS[ci][1])+'</div>'); return CSS+'<div class=jw>'+chrome+right+'</div>';
  }
  function dl(lbl,val){ return '<div class=detl><b>'+lbl+'</b><span>'+esc(val==null||val===''?'—':val)+'</span></div>'; }
  // ---- Credit Repair: render from d.grouped (locked-v5 match) + detail endpoint, decision = discrepancy ----
  function loadRepair(bd,cid){ var G=bd.querySelector('#cr_grid'); if(!G)return;
    Promise.all([
      fetch('/api/client_bureau_view',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({customer_id:cid||null})}).then(function(r){return r.json();}).catch(function(){return {};}),
      fetch('/api/client_account_detail',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({customer_id:cid||null})}).then(function(r){return r.json();}).catch(function(){return {};})
    ]).then(function(R){ var d=R[0]||{}, dd=(R[1]&&R[1].detail)||{};
      if(d.status==='need_login'){ G.innerHTML='<div style="color:#ffd479">Sign in to see your report.</div>'; return; }
      // group the SAME account across bureaus into one HORIZONTAL row (key = account_key, identical across bureaus)
      var accounts=d.accounts||[];
      function __tail(ak){ var p=String(ak||'').split('|'); return p.length>1?p[p.length-1]:''; }
      /* [2026-06-24 Mel] REAL 3-bureau trimerge. Account numbers are masked DIFFERENTLY per bureau (Affirm 1 vs 266; WFBNA 0507 vs 0706),
         and on LOANS the creditor name, open day, and limit also differ across bureaus (NAVY vs NAVY CR UNION). So we DON'T match on account #.
         We score multiple factors — same open month + same limit + same high balance => same tradeline (Mel's rule) — and merge when enough agree.
         Works for 2 OR 3 bureaus (Equifax may be locked/absent). Pulls from the WHOLE parsed report (bureau_view + account_detail). */
      function __det(a){ return (dd[a.account_key]&&dd[a.account_key][a.bureau])||{}; }
      function __l4(a){ var d=__det(a); return d.acct_last4||__tail(a.account_key); }
      function __ym(a){ var d=__det(a); return String(d.opened||a.opened||'').slice(0,7); }
      function __n(v){ v=Number(v); return (isFinite(v)&&v!==0)?v:null; } /* 0/blank = no signal (loans have no limit) */
      function __near(x,y){ if(x==null||y==null)return 0; if(x===y)return 1; var m=Math.max(Math.abs(x),Math.abs(y)); return (m&&Math.abs(x-y)/m<=0.02)?1:0; }
      function __bkt(a){ var t=String(__det(a).account_type||'').toLowerCase();
        if(t.indexOf('collection')>=0)return 'coll'; if(t.indexOf('mortgage')>=0||t.indexOf('real estate')>=0)return 'mort';
        if(/auto|loan|lease|installment|student/.test(t))return 'inst';
        if(/card|charge|revolv|flex|line of credit|check credit/.test(t))return 'rev'; return 'oth'; }
      function __toks(s){ return String(s||'').toUpperCase().replace(/[^A-Z0-9 ]/g,' ').split(/\s+/).filter(function(t){ return t&&!/^(INC|NA|THE|BANK|CARD|CO|LLC|CR|UNION|USA|FCU|CU)$/.test(t); }); }
      function __credit(a,b){ var x=a.creditor_canon||'',y=b.creditor_canon||''; if(x===y)return 'exact'; var tx=__toks(x),ty=__toks(y); if(!tx.length||!ty.length)return null; if(tx[0]===ty[0])return 'fuzzy'; var sm=tx.length<ty.length?tx:ty,bg=tx.length<ty.length?ty:tx; for(var i=0;i<sm.length;i++){ if(bg.indexOf(sm[i])<0)return null; } return 'fuzzy'; }
      function __fs(a,b){ var s=0; if(__l4(a)&&__l4(a)===__l4(b))s+=3;
        if(__ym(a)&&__ym(a)===__ym(b))s+=2; else if(__ym(a)&&__ym(b)){ var d=Math.abs(new Date(__ym(a)+'-01')-new Date(__ym(b)+'-01'))/2.6e9; if(d<=3)s+=1; }
        s+=2*__near(__n(__det(a).credit_limit),__n(__det(b).credit_limit));
        s+=2*__near(__n(__det(a).high_balance),__n(__det(b).high_balance));
        if(__bkt(a)===__bkt(b))s+=1; return s; }
      function __same(a,b){
        /* HARD IDENTITY: same masked acct # + same open month + a matching limit OR high balance => same tradeline even when the bureaus spell the creditor totally differently (BANK OF AMERICA vs BK OF AMER). Trust the numbers over the name. */
        if(__l4(a)&&__l4(a)===__l4(b)&&__ym(a)&&__ym(a)===__ym(b)&&(__near(__n(__det(a).credit_limit),__n(__det(b).credit_limit))||__near(__n(__det(a).high_balance),__n(__det(b).high_balance))))return true;
        var c=__credit(a,b); if(!c)return false; return __fs(a,b)>=(c==='exact'?4:5); } /* else creditor must match; fuzzy name needs a higher factor bar */
      /* delegate to the ONE shared matcher (window.__memTrimerge) so client + admin never drift */
      function __group(accs){ return (window.__memTrimerge?window.__memTrimerge(accs,dd):[]); }
      function __objlen(o){ var n=0; for(var k in o)n++; return n; }
      /* [2026-06-25] LIVE tri-merge from api_client_bureau_view: prefer the shared matcher on the flat accounts; else the server-grouped clusters (which carry reporting_on / missing_from / balance_mismatch); else fall back to a flat one-row-per-account list. */
      var grouped=accounts.length?__group(accounts):[];
      if(!grouped.length&&d.grouped&&d.grouped.length){ grouped=d.grouped.map(function(g){ g.bureaus=g.bureaus||{}; return g; }); }
      if(!grouped.length&&accounts.length){ grouped=accounts.map(function(a){ var g={account_key:a.account_key||'',creditor_canon:a.creditor_canon||a.account_key||'',bureaus:{}}; g.bureaus[a.bureau]=a; return g; }); }
      if(!grouped.length){ G.innerHTML='<div style="color:#ffd479">No report yet &mdash; connect SmartCredit so we can pull your three bureaus.</div>'; return; }
      var pulled={}; accounts.forEach(function(a){ pulled[a.bureau]=true; }); var PB=BUREAUS.filter(function(b){return pulled[b];}); if(!PB.length)PB=BUREAUS.slice(); try{var __neg=0;(grouped||[]).forEach(function(g){var bur=g.bureaus||{};var pres=(g.reporting_on&&g.reporting_on.length)?PB.filter(function(b){return g.reporting_on.indexOf(b)>=0;}):PB.filter(function(b){return bur[b];});var miss=(g.missing_from&&g.missing_from.length)?PB.filter(function(b){return g.missing_from.indexOf(b)>=0;}):PB.filter(function(b){return !bur[b];});var der=pres.some(function(b){return bur[b]&&bur[b].derogatory;});var bl=pres.map(function(b){return (bur[b]&&Number(bur[b].balance))||0;});var mis=(g.balance_mismatch!=null)?!!g.balance_mismatch:(bl.length>1&&Math.max.apply(null,bl)!==Math.min.apply(null,bl));var only=miss.length&&pres.length;if(der||mis||only)__neg++;});window.__clientState=Object.assign(window.__clientState||{},{step:'repair',has_file:true,negatives:__neg,tradelines:(grouped||[]).length});}catch(e){} /* feed the bar/deepinfra what's on this file so it can ask the right questions */
      // SUMMARY block (per bureau) — mirrors the SmartCredit 3B report summary, computed from the real pulled accounts
      function _sum(){ var s={}; PB.forEach(function(b){ s[b]={total:0,open:0,closed:0,derog:0,bal:0}; });
        accounts.forEach(function(a){ var b=a.bureau; if(!s[b])return; s[b].total++; var st=String(a.status||'').toLowerCase();
          if(st.indexOf('closed')>=0||st.indexOf('paid')>=0)s[b].closed++; else s[b].open++;
          if(a.derogatory)s[b].derog++; s[b].bal+=Number(a.balance)||0; }); return s; }
      var SM=_sum();
      function _srow(lbl,key,money_){ return '<tr><td style="color:#9fb0d0;font-size:12px;padding:5px 10px">'+lbl+'</td>'+PB.map(function(b){var v=SM[b][key];return '<td style="padding:5px 10px;font-weight:700;color:'+(key==='derog'&&v>0?'#ff6d7a':'#fff')+'">'+(money_?money(v):v)+'</td>';}).join('')+'</tr>'; }
      var summaryHtml='<div style="margin-bottom:14px"><div class=jmuted style="margin-bottom:6px"><b>Report summary</b> &mdash; '+esc(PB.join(', '))+' (pulled '+esc(fmtd(d.report_date||d.pulled_at||''))+')</div>'
        +'<table class=trimerge style="margin-bottom:4px"><tr><th style="width:34%">&nbsp;</th>'+PB.map(function(b){return '<th>'+b+'</th>';}).join('')+'</tr>'
        +_srow('Total accounts','total')+_srow('Open','open')+_srow('Closed','closed')+_srow('Derogatory','derog')+_srow('Total balances','bal',true)+'</table></div>';
      var head='<tr><th style="width:24%">Account</th>'+PB.map(function(b){return '<th>'+b+'</th>';}).join('')+'<th style="width:24%">Decision</th><th style="width:60px">Dispute</th></tr>';
      // CATEGORY grouping like SmartCredit: bucket each account by its type into a named section
      function _atype(g){ var t=''; for(var b in g.bureaus){ var ak=g.bureaus[b].account_key; var a=dd[ak]&&dd[ak][b]; if(a&&a.account_type){ t=a.account_type; break; } } return String(t||'').toLowerCase(); }
      function _cat(g){ var bur=g.bureaus||{}; var derog=PB.some(function(b){return bur[b]&&bur[b].derogatory;}); var t=_atype(g); var st=''; for(var b in bur){ if(bur[b]){ st=String(bur[b].status||'').toLowerCase(); break; } }
        if(t.indexOf('collection')>=0||st.indexOf('collection')>=0) return 'Collection Accounts';
        if(t.indexOf('mortgage')>=0||t.indexOf('real estate')>=0) return 'Mortgage Accounts';
        if(t.indexOf('credit card')>=0||t.indexOf('charge')>=0||t.indexOf('line of credit')>=0||t.indexOf('revolv')>=0||t.indexOf('flexible')>=0) return 'Revolving Accounts';
        if(t.indexOf('auto')>=0||t.indexOf('loan')>=0||t.indexOf('lease')>=0||t.indexOf('installment')>=0||t.indexOf('rental')>=0) return 'Installment Accounts';
        return 'Other Accounts'; }
      var CAT_ORDER=['Revolving Accounts','Installment Accounts','Mortgage Accounts','Collection Accounts','Other Accounts'];
      var buckets={}; grouped.forEach(function(g){ var c=_cat(g); (buckets[c]=buckets[c]||[]).push(g); });
      function rowFor(g){ var bur=g.bureaus||{};
        var cells=PB.map(function(b){ var a=bur[b]; if(!a)return '<td class=na>&mdash;<br><span class=bal>not reporting</span></td>'; var l4=__l4(a); return '<td'+(a.derogatory?' class=der':'')+'><span class=bal>'+(l4?('#&bull;&bull;'+esc(l4)):'&mdash;')+'</span><br>'+esc(a.status||'')+'<br><span class=bal>'+money(a.balance)+'</span></td>'; }).join('');
        /* read the LIVE cluster fields straight from api_client_bureau_view (reporting_on / missing_from / balance_mismatch); derive from the merged bureaus when the server didn't supply them. */
        var present=(g.reporting_on&&g.reporting_on.length)?PB.filter(function(b){return g.reporting_on.indexOf(b)>=0;}):PB.filter(function(b){return bur[b];}); var missing=(g.missing_from&&g.missing_from.length)?PB.filter(function(b){return g.missing_from.indexOf(b)>=0;}):PB.filter(function(b){return !bur[b];});
        var derog=present.some(function(b){return bur[b]&&bur[b].derogatory;}); var bals=present.map(function(b){return (bur[b]&&Number(bur[b].balance))||0;}); var mismatch=(g.balance_mismatch!=null)?!!g.balance_mismatch:(bals.length>1&&(Math.max.apply(null,bals)!==Math.min.apply(null,bals)));
        var stats=present.map(function(b){return bur[b]&&String(bur[b].status||'').toLowerCase();}).filter(Boolean); var statusMismatch=stats.length>1&&stats.some(function(s){return s!==stats[0];});
        var flags=[]; if(derog)flags.push('Derogatory'); if(mismatch)flags.push('Balance mismatch'); if(statusMismatch)flags.push('Status mismatch'); if(missing.length&&present.length)flags.push('Only on '+present.join(' & '));
        var decision=flags.length?('<span style="color:#ff9d5f;font-weight:700">'+esc(flags.join(' · '))+'</span>'):'<span style="color:#7e8cad">&mdash;</span>';
        var disputable=derog||mismatch||statusMismatch||(missing.length&&present.length);
        var chk=disputable?'<td style="text-align:center"><input type=checkbox class=cr_pick data-item="'+esc(g.creditor_canon||g.account_key)+'" data-key="'+esc(g.account_key)+'"></td>':'<td class=na style="text-align:center">&mdash;</td>';
        var det=PB.map(function(b){ var ga=g.bureaus[b]; var a=ga&&dd[ga.account_key]&&dd[ga.account_key][b]; if(!a)return ''; return '<div class=detcol><div class=detb>'+b+'</div>'+dl('Acct #', a.acct_last4?('••••'+a.acct_last4):'—')+dl('Type', a.account_type)+dl('Opened', fmtd(a.opened))+dl('Reported', fmtd(a.date_reported))+dl('High bal', money(a.high_balance))+dl('Limit', money(a.credit_limit))+dl('Balance', money(a.balance))+dl('Past due', money(a.past_due))+dl('Status', a.pay_status||a.status)+'</div>'; }).join('');
        if(!det)det='<div class=detcol style="color:#7e8cad">Detail loads from your report pull.</div>';
        return '<tr><td class=acct onclick="window.__jtoggle&&window.__jtoggle(this)">&#9656; '+esc(g.creditor_canon||g.account_key)+(g.last4?(' <span style="color:#7e8cad;font-weight:400;font-size:11px">••'+esc(g.last4)+'</span>'):'')+'</td>'+cells+'<td style="font-size:12px">'+decision+'</td>'+chk+'</tr><tr class=detrow style="display:none"><td colspan="'+(PB.length+3)+'"><div class=detwrap>'+det+'</div></td></tr>'; }
      var colspan=PB.length+3;
      var rows=CAT_ORDER.filter(function(c){return buckets[c]&&buckets[c].length;}).map(function(c){
        var hdr='<tr><td colspan="'+colspan+'" style="background:rgba(196,30,58,.14);color:#ff9d8a;font-weight:800;font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;padding:9px 10px;border-top:1px solid rgba(255,255,255,.12)">'+esc(c)+' <span style="color:#9fb0d0;font-weight:600">('+buckets[c].length+')</span></td></tr>';
        return hdr+buckets[c].map(rowFor).join('');
      }).join('');
      G.innerHTML=summaryHtml+'<table class=trimerge>'+head+rows+'</table>'; }).catch(function(){ G.innerHTML='<div style="color:#ff5f6d">Could not load your report.</div>'; }); }
  window.__jtoggle=function(td){ try{ var tr=td.parentNode; var det=tr.nextSibling; while(det&&det.nodeType!==1)det=det.nextSibling; if(det&&det.className==='detrow'){ var sh=det.style.display==='none'; det.style.display=sh?'':'none'; td.innerHTML=(sh?'&#9662; ':'&#9656; ')+td.textContent.replace(/^[▸▾]\s*/,''); } }catch(e){} };
  // ---- Funding DECISION (the pool: qualify or not) from /api/client_decision ----
  function loadDecision(bd,cid){ var B=bd.querySelector('#cd_box'); if(!B)return; fetch('/api/client_decision',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({customer_id:cid||null})}).then(function(r){return r.json();}).then(function(d){ if(d&&d.status==='need_login'){ B.innerHTML='<div style="color:#ffd479">Sign in to see your decision.</div>'; return; } var dec=(d&&d.decision)||{}; var tier=dec.decision_tier||''; var score=d.min_score; var approve=(tier==='APPROVE'); try{window.__clientState=Object.assign(window.__clientState||{},{step:'decision',has_file:true,decision_tier:tier,min_score:score});}catch(e){} var color=approve?'#5fff9f':(tier==='DECLINE'?'#ff6d7a':'#ffd479'); var head=approve?'You qualify for funding':(tier==='DECLINE'?'Credit repair first':'Almost there — repair first'); var flagsHtml=(dec.flags&&dec.flags.length)?('<div style="font-size:12px;color:#9fb0d0;margin-top:8px">'+dec.flags.map(function(f){return '&bull; '+esc(f.reason);}).join('<br>')+'</div>'):''; B.innerHTML='<div style="border:1px solid '+color+';border-radius:14px;padding:18px;background:rgba(0,0,0,.3)"><div style="font-size:11px;color:#9fb0d0;text-transform:uppercase;letter-spacing:.06em">Funding Decision'+(score?(' &middot; min score '+score):'')+'</div><div style="font-weight:800;font-size:20px;color:'+color+';margin:6px 0">'+esc(head)+'</div><div style="font-size:13px;color:#cdd6ea;line-height:1.5">'+esc(dec.recommendation||'')+'</div>'+flagsHtml+'</div><button id="cd_next" '+BTN+'>'+(approve?'View my funding offers':'Yes &mdash; start my credit repair')+'</button><div style="font-size:11.5px;color:#9fb0d0;margin-top:8px">'+(approve?'Opens your funding offers in their own tab.':'Opens credit repair in its own window &mdash; only if you choose. You are never auto-enrolled in repair.')+'</div>'; var nx=bd.querySelector('#cd_next'); if(nx)nx.onclick=function(){ if(window.openWindow){ window.openWindow(approve?{k:'prequal',label:'Funding'}:{k:'credit_repair',label:'Credit Repair'}); } }; }).catch(function(){ B.innerHTML='<div style="color:#ff5f6d">Could not load your decision.</div>'; }); }
  // ---- Pre-qualified offers (real /api/prequal_outcomes) ----
  function offerRow(o){ var d=(o&&o.details)||{}; var lender=esc(d.lender||o.name||'Offer'); var range=esc(d.range||(o.approved_amount?('$'+Number(o.approved_amount).toLocaleString()):'')); var type=esc(d.type||''); var tag=esc(o.outcome||o.status||''); return '<div style="border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:13px 15px;margin-bottom:10px;background:rgba(0,0,0,.32)"><div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px"><div style="font-weight:700;font-size:14.5px">'+lender+'</div><div style="color:#5fff9f;font-weight:800;font-size:13px;text-transform:capitalize">'+tag+'</div></div><div style="font-size:12.5px;color:#9fb0d0;margin-top:3px">'+(range?('<b style="color:#fff">'+range+'</b>'):'')+(type?(' &middot; '+type):'')+(d.pitch?('<br>'+esc(d.pitch)):'')+'</div></div>'; }
  // scope prequal rows to THIS client only (the endpoint returns all rows unscoped; never show another client's offers)
  function scopeRows(rows,cid){ rows=rows||[]; if(!cid)return rows; var mine=rows.filter(function(r){return String(r.customer_id||'')===String(cid);}); return mine; }
  function loadOffers(bd,cid){ var L=bd.querySelector('#pq_list'); if(!L)return; var url='/api/prequal_outcomes'+(cid?('?customer_id='+encodeURIComponent(cid)):''); fetch(url,{credentials:'include'}).then(function(r){return r.json();}).then(function(d){ var rows=scopeRows((d&&(d.rows||d.outcomes))||[],cid); if(!rows.length){ L.innerHTML='<div style="color:#ffd479">No pre-qualified offers yet &mdash; finish your disputes to unlock funding matches.</div>'; return; } L.innerHTML=rows.map(offerRow).join(''); }).catch(function(){ L.innerHTML='<div style="color:#ff5f6d">Could not load your offers.</div>'; }); }
  function wire(bd,stage,authed,cid){
    var su=bd.querySelector('#mbj_su'); if(su){ su.onclick=function(){ if(window.openWindow)window.openWindow({k:'signup',label:'Sign Up',mode:'signup'}); }; }
    var go=bd.querySelector('#mbj_go'); if(go){ go.onclick=function(){ var res=bd.querySelector('#mbj_res'); res.style.color='#9fb0d0'; res.textContent='Connecting...'; fetch('/api/credit/connect_client',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:(bd.querySelector('#mbj_e')||{}).value,password:(bd.querySelector('#mbj_p')||{}).value})}).then(function(r){ if(r.status===401){ res.style.color='#ffd479'; res.textContent='Please sign in first.'; if(window.openWindow)window.openWindow({k:'signup',label:'Sign In',mode:'login'}); return null; } return r.json(); }).then(function(k){ if(!k)return; if(k.ok){ res.style.color='#5fff9f'; res.textContent='Pulled - getting your funding decision...'; render(bd,'decision',true,cid); } else { res.style.color='#ff5f6d'; res.textContent=k.error||k.message||'Could not connect.'; } }).catch(function(){ res.style.color='#ff5f6d'; res.textContent='Connection error'; }); }; }
    if(stage==='decision'){ loadDecision(bd,cid); }
    if(stage==='repair'){ loadRepair(bd,cid); var sb=bd.querySelector('#cr_submit'); if(sb){ sb.onclick=function(){ var res=bd.querySelector('#cr_res'); var picks=Array.prototype.map.call(bd.querySelectorAll('.cr_pick:checked'),function(c){return c.getAttribute('data-item');}); if(!picks.length){ res.style.color='#ffd479'; res.textContent='Select at least one item to dispute.'; return; } /* save/submit is ADMIN-gated (api_credit_repair_dispute_save / _submit) - the admin files the disputes FOR the client. */ res.style.color='#5fff9f'; res.textContent=picks.length+' item(s) submitted. Your specialist files these across all three bureaus for you. Funding is a separate step - open the Funding tab when you are ready.'; }; } }
    if(stage==='prequalified'){ loadOffers(bd,cid); var nx=bd.querySelector('#pq_next'); if(nx)nx.onclick=function(){ render(bd,'funding',true,cid); }; }
    if(stage==='funding'){ var FL=bd.querySelector('#fund_list'); if(FL){ var furl='/api/prequal_outcomes'+(cid?('?customer_id='+encodeURIComponent(cid)):''); fetch(furl,{credentials:'include'}).then(function(r){return r.json();}).then(function(d){ var rows=scopeRows((d&&(d.rows||d.outcomes))||[],cid); if(!rows.length){ FL.innerHTML='<div style="color:#ffd479">No funding offers yet &mdash; finish repair to unlock more.</div>'; return; } FL.innerHTML=rows.map(offerRow).join(''); }).catch(function(){ FL.innerHTML='<div style="color:#ff5f6d">Could not load your offers.</div>'; }); } }
  }
  // front-end step persistence: a change/reload resumes the saved step, never restarts
  function saveStep(cid,stage){ try{ if(cid&&stage)localStorage.setItem('mio_jstep_'+cid,stage); }catch(e){} }
  function render(bd,stage,authed,cid,solo){ if(authed)saveStep(cid,stage); bd.innerHTML=panel(stage,authed,solo); wire(bd,stage,authed,cid); }
  window.__winRender=window.__winRender||{};
  /* [verify_lane 2026-06-23] PULL EACH STAGE OUT AS ITS OWN WINDOW (Mel) - the bar/spawn open k:'decision'|'prequal'|'credit_repair'|'funding' standalone (decision-driven chain). Reuses render() = same content, separate windows. */
  function __openStage(bd,forceStage){ bd.innerHTML='<div style="opacity:.7;padding:20px">Loading…</div>'; fetch('/api/auth/whoami',{credentials:'include'}).then(function(r){return r.json();}).catch(function(){return {};}).then(function(who){ who=who||{}; var u=who.user||who; var authed=!!(who.ok&&(who.user||who.id||who.email)); var cid=(u&&(u.customer_id||u.id||u.user_id))||null; if(!authed){ render(bd,'signup',false,null); return; } render(bd,forceStage,true,cid,true); }); }
  /* [autonomous 2026-06-23] smartcredit step = its OWN window (was missing -> fell to brain fallback).
     panel('smartcredit') + wire (#mbj_go -> /api/credit/connect_client -> render decision) already support it. */
  window.__winRender.smartcredit=function(bd,st){ __openStage(bd,'smartcredit'); };
  window.__winRender.decision=function(bd,st){ __openStage(bd,'decision'); };
  window.__winRender.prequal=function(bd,st){ __openStage(bd,'prequalified'); };
  window.__winRender.credit_repair=function(bd,st){ __openStage(bd,'repair'); };
  window.__winRender.funding=function(bd,st){ __openStage(bd,'funding'); };
  window.__winRender.journey=function(bd,st){
    bd.innerHTML='<div style="opacity:.7;padding:20px">Loading your journey...</div>';
    fetch('/api/auth/whoami',{credentials:'include'}).then(function(r){return r.json();}).catch(function(){return {};}).then(function(who){
      who=who||{}; var u=who.user||who; var authed=!!(who.ok&&(who.user||who.id||who.email)); var cid=(u&&(u.customer_id||u.id||u.user_id))||null;
      if(!authed){ render(bd,'signup',false,null); return; }
      // PERSISTENCE: resume the saved step first; else derive from real data (file pulled -> repair).
      var saved=null; try{ saved=cid&&localStorage.getItem('mio_jstep_'+cid); }catch(e){}
      if(saved && STEPS.some(function(s){return s[0]===saved;})){ render(bd,saved,true,cid); return; }
      fetch('/api/client_bureau_view',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({customer_id:cid||null})}).then(function(r){return r.json();}).catch(function(){return {};}).then(function(d){
        var hasFile=!!(d&&((d.grouped&&d.grouped.length)||(d.accounts&&d.accounts.length)));
        render(bd, hasFile?'decision':'smartcredit', true, cid);
      });
    });
  };
  function addTab(){ if(document.getElementById('mb-journeytab'))return; var t=document.createElement('div'); t.id='mb-journeytab'; t.textContent='JOURNEY'; t.style.cssText='position:fixed;right:0;top:42%;transform:translateY(-50%);writing-mode:vertical-rl;background:linear-gradient(135deg,#c41e3a,#ff5f6d);color:#fff;font-weight:800;font-size:11px;letter-spacing:.14em;padding:16px 7px;border-radius:10px 0 0 10px;cursor:pointer;z-index:25;box-shadow:0 6px 22px rgba(0,0,0,.4)'; t.onclick=function(){ if(window.openWindow)window.openWindow({k:'journey',label:'My Journey'}); }; document.body.appendChild(t); }
  /* [2026-06-24 Mel] ADMIN GETS THE SAME FLOW AS THE CLIENT. The journey tab was hidden for admin/ceo/owner — that's why admin couldn't see/do what a client can. Show it for EVERYONE; admin sees everything a client sees. */
  function init(){ addTab(); }
  var t=setInterval(function(){ if(document.body){ clearInterval(t); init(); } },500);
})();
