/* [verify-lane 2026-06-26 Mel] CONTROL PANEL — the owner's power surface, IN THE PRODUCT.
   Three live stores Mel edits himself (no terminal, no AI middleman):
     - Spawn Rules     -> rail_code_patterns   (the rules every code-generator obeys)
     - Brain Behavior  -> brain_persona_config  (length/tone/greeting/CTA/holiday)
     - Knowledge       -> deepinfra_knowledge         (what the brain knows / is taught)
   Backend = ceo-gated POST /api/admin_stores {store, op:'list'|'save'|'delete', ...}.
   This window IS Mel programming the system directly. North star: he never needs the terminal. */
(function(){
  var API='/api/admin_stores';
  function call(body){
    return fetch(API,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},
      body:JSON.stringify(body)}).then(function(r){ return r.json().catch(function(){return {ok:false,error:'bad response'};}); })
      .catch(function(){ return {ok:false,error:'unreachable'}; });
  }
  function el(tag,css,txt){ var e=document.createElement(tag); if(css)e.style.cssText=css; if(txt!=null)e.textContent=txt; return e; }
  var STORES=[['rules','Spawn Rules','the rules every code-generator obeys'],
              ['persona','Brain Behavior','how Memelli talks: length, tone, greeting, holiday'],
              ['knowledge','Knowledge','what the brain knows and is taught']];

  window.__winRender['control']=function(bd,st){
    bd.innerHTML=''; bd.style.color='#eee'; bd.style.background='rgba(10,12,18,0.96)';
    var wrap=el('div','padding:16px 18px;font:13px Inter,system-ui,sans-serif');
    bd.appendChild(wrap);
    if(!window.__isAdmin){
      wrap.appendChild(el('div','opacity:.8;font:600 14px Inter','Owner sign-in required — this is your control panel.'));
      return;
    }
    var head=el('div','display:flex;align-items:center;justify-content:space-between;margin-bottom:12px');
    head.appendChild(el('div','font:800 16px Inter','Control — program your system'));
    var status=el('span','font:600 11px Inter;opacity:.6',''); head.appendChild(status);
    wrap.appendChild(head);

    // tab bar
    var tabbar=el('div','display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap');
    var body=el('div',''); wrap.appendChild(tabbar); wrap.appendChild(body);
    var cur='rules';
    STORES.forEach(function(s){
      var b=el('button',null,s[1]); b.type='button';
      b.style.cssText='cursor:pointer;border:1px solid rgba(255,255,255,0.2);border-radius:9px;padding:7px 12px;font:700 12px Inter;background:rgba(255,255,255,0.06);color:#fff';
      b.dataset.k=s[0];
      b.onclick=function(){ cur=s[0]; paintTabs(); load(); };
      tabbar.appendChild(b);
    });
    function paintTabs(){ Array.prototype.forEach.call(tabbar.children,function(b){
      var on=b.dataset.k===cur; b.style.background=on?'#c41e3a':'rgba(255,255,255,0.06)'; b.style.borderColor=on?'#c41e3a':'rgba(255,255,255,0.2)'; }); }

    function field(label,val,multiline){
      var box=el('div','margin-bottom:9px');
      box.appendChild(el('div','font:600 11px Inter;color:#9fb0d0;margin-bottom:4px',label));
      var inp= multiline? el('textarea','width:100%;min-height:120px;box-sizing:border-box;background:#0a0c12;color:#eee;border:1px solid rgba(255,255,255,0.18);border-radius:8px;padding:9px;font:13px ui-monospace,monospace;resize:vertical')
                        : el('input','width:100%;box-sizing:border-box;background:#0a0c12;color:#eee;border:1px solid rgba(255,255,255,0.18);border-radius:8px;padding:9px;font:13px Inter');
      inp.value=val||''; box.appendChild(inp); box.__inp=inp; return box;
    }

    function editor(item){
      var pane=el('div','margin-top:8px;padding:12px;border:1px solid rgba(255,255,255,0.14);border-radius:10px;background:rgba(255,255,255,0.03)');
      var saveBtn=el('button',null,'Save'); saveBtn.type='button';
      saveBtn.style.cssText='cursor:pointer;border:none;border-radius:8px;padding:8px 16px;font:700 12px Inter;background:#3ecf6a;color:#06210f;margin-right:8px';
      var delBtn=el('button',null,'Delete'); delBtn.type='button';
      delBtn.style.cssText='cursor:pointer;border:1px solid #ff5f57;border-radius:8px;padding:8px 14px;font:700 12px Inter;background:transparent;color:#ff8a84';
      var fields={};
      if(cur==='rules'){
        fields.sig=field('Rule name (pattern_signature)', item?item.pattern_signature:''); pane.appendChild(fields.sig);
        fields.conf=field('Confidence', item?item.confidence:'0.99'); pane.appendChild(fields.conf);
        fields.text=field('Rule text (the constraint generators obey)', item?item.code_template:'', true); pane.appendChild(fields.text);
        saveBtn.onclick=function(){ doSave({store:'rules',op:'save',signature:fields.sig.__inp.value.trim(),confidence:fields.conf.__inp.value.trim()||'0.99',text:fields.text.__inp.value}); };
        delBtn.onclick=function(){ if(item) doSave({store:'rules',op:'delete',key:item.pattern_signature}); };
      } else if(cur==='persona'){
        fields.key=field('Setting (key)', item?item.key:''); pane.appendChild(fields.key);
        fields.label=field('Label', item?item.label:''); pane.appendChild(fields.label);
        fields.val=field('Value', item?item.value:'', true); pane.appendChild(fields.val);
        saveBtn.onclick=function(){ doSave({store:'persona',op:'save',key:fields.key.__inp.value.trim(),label:fields.label.__inp.value,value:fields.val.__inp.value}); };
        delBtn.onclick=function(){ if(item) doSave({store:'persona',op:'delete',key:item.key}); };
      } else {
        fields.topic=field('Topic', item?item.topic:''); pane.appendChild(fields.topic);
        fields.owner=field('Owner role (ceo = owner-only)', item?item.owner_role:'ceo'); pane.appendChild(fields.owner);
        fields.depth=field('Depth', item?item.depth:'core'); pane.appendChild(fields.depth);
        fields.content=field('Knowledge (what the brain learns)', item?(item.content||item.preview):'', true); pane.appendChild(fields.content);
        saveBtn.onclick=function(){ doSave({store:'knowledge',op:'save',topic:fields.topic.__inp.value.trim(),owner_role:fields.owner.__inp.value.trim()||'ceo',depth:fields.depth.__inp.value.trim()||'core',content:fields.content.__inp.value}); };
        delBtn.onclick=function(){ if(item) doSave({store:'knowledge',op:'delete',key:item.topic}); };
      }
      var row=el('div','margin-top:6px'); row.appendChild(saveBtn); if(item)row.appendChild(delBtn); pane.appendChild(row);
      return pane;
    }

    function doSave(payload){
      status.textContent='saving…';
      call(payload).then(function(j){
        if(j&&j.ok){ status.textContent=(j.saved?'saved '+j.saved:(j.deleted?'deleted '+j.deleted:'done')); load(); }
        else { status.textContent='ERROR: '+((j&&j.error)||'failed'); }
      });
    }

    function load(){
      body.innerHTML=''; status.textContent='loading…';
      var hint=STORES.filter(function(s){return s[0]===cur;})[0];
      body.appendChild(el('div','font:600 11px Inter;color:#9fb0d0;margin-bottom:10px', hint?hint[2]:''));
      body.appendChild(editor(null)); // add-new editor on top
      var listWrap=el('div','margin-top:14px'); body.appendChild(listWrap);
      call({store:cur,op:'list'}).then(function(j){
        if(!j||!j.ok){ status.textContent='ERROR: '+((j&&j.error)||'failed'); return; }
        var items=j.items||[]; status.textContent=items.length+' item'+(items.length===1?'':'s');
        items.forEach(function(it){
          var label = cur==='rules'? it.pattern_signature : (cur==='persona'? (it.key+'  =  '+(it.value||'').slice(0,60)) : it.topic);
          var card=el('div','border:1px solid rgba(255,255,255,0.1);border-radius:9px;margin-bottom:7px;background:rgba(255,255,255,0.02)');
          var bar=el('div','display:flex;justify-content:space-between;align-items:center;cursor:pointer;padding:9px 11px');
          bar.appendChild(el('div','font:700 12px Inter',label));
          var prev=el('div','font:11px Inter;opacity:.55;max-width:55%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap',
                       (it.code_template||it.preview||it.content||it.label||''));
          bar.appendChild(prev);
          var open=false, ed=null;
          bar.onclick=function(){ open=!open; if(open){ ed=editor(it); card.appendChild(ed);} else if(ed){ card.removeChild(ed); ed=null; } };
          card.appendChild(bar); listWrap.appendChild(card);
        });
      });
    }
    paintTabs(); load();
  };

  // make it openable + register so the command bar / launcher can reach it (admin only)
  window.__openControl=function(){ if(window.openWindow) window.openWindow({k:'control',label:'Control'}); };
  try{
    window.__CAPS=window.__CAPS||{}; window.__CAPS.windows=window.__CAPS.windows||[];
    if(window.__CAPS.windows.indexOf('control')<0) window.__CAPS.windows.push('control');
  }catch(e){}
  // floating admin launcher tab (only for the owner)
  function mountLauncher(){
    try{
      if(!window.__isAdmin) return;
      if(document.getElementById('control-launch')) return;
      var t=document.createElement('div'); t.id='control-launch'; t.textContent='CONTROL';
      t.style.cssText='position:fixed;right:0;top:42%;z-index:40;background:#c41e3a;color:#fff;font:800 11px Inter,sans-serif;padding:9px 7px;writing-mode:vertical-rl;border-radius:8px 0 0 8px;cursor:pointer;letter-spacing:1px;box-shadow:-2px 2px 12px rgba(0,0,0,0.4)';
      t.onclick=window.__openControl; document.body.appendChild(t);
    }catch(e){}
  }
  if(document.readyState!=='loading') setTimeout(mountLauncher,1200); else document.addEventListener('DOMContentLoaded',function(){ setTimeout(mountLauncher,1200); });
  // re-check after login flips __isAdmin
  setInterval(mountLauncher,2500);
})();
