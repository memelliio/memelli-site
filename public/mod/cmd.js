/* [2026-06-25 Mel] CEO COMMAND LAYER — text-to-action. The context bar KNOWS the whole system (every window + every master-background/word/look setting we built this session) and the CEO executes by talking: "make the wall blue", "scatter it", "open the CRM top-left", "the words should say WELCOME", "save this as the client view", "skin this window".
   - CEO-gated: only runs when window.__isAdmin (listening_as==='ceo'). Clients fall through to the normal bar/brain.
   - Persists exactly like Master Background Controls: applies live + saves the pref + OWNS the keys (window.__adminSet) so it survives reload + publishes to the customer view.
   - window.__CAPS = the capability map the bar advertises to itself + the brain (mapping the system to the context). */
(function(){
  if(window.__cmdOn) return; window.__cmdOn=true;

  /* ---- THE CAPABILITY MAP (what the system can do — the context) ---- */
  var WINDOWS=[
    {k:'look',label:'Master Background Controls',admin:1,kw:'master background controls wall design color tint morph settings'},
    {k:'crm',label:'CRM',admin:1,kw:'crm clients customers roster sales'},
    {k:'creditreview',label:'Credit Review',admin:1,kw:'credit review report disputes file bureau client'},
    {k:'analytics',label:'Analytics',admin:1,kw:'analytics stats live machine'},
    {k:'admin_catalog',label:'Catalog',admin:1,kw:'catalog prices plans products reseller'},
    {k:'studio',label:'Studio',admin:1,kw:'studio daw music production'},
    {k:'flows',label:'Flow Order',admin:1,kw:'flows order journey sequence'},
    {k:'chats',label:'Team wire',admin:1,kw:'chats wire team seats messages'},
    {k:'journey',label:'Your Journey',admin:0,kw:'journey credit report progress steps path'},
    {k:'credit_repair',label:'Credit Repair',admin:0,kw:'credit repair report disputes fix bureau trimerge'},
    {k:'smartcredit',label:'SmartCredit',admin:0,kw:'smartcredit pull connect trial report'},
    {k:'store',label:'Store',admin:0,kw:'store plans buy checkout membership'},
    {k:'music',label:'Music',admin:0,kw:'music song listen play'},
    {k:'tv',label:'TV',admin:0,kw:'tv channels stream watch'},
    {k:'dialpad',label:'Business Phone',admin:0,kw:'phone dial call sms text'},
    {k:'features',label:'Features',admin:0,kw:'features hub tools'}
  ];
  /* look keys -> [min,max] ranges (for numeric parsing + sanity) */
  var WALLKEYS={speed:[0,4],spin:[0,4],morph:[0,1],density:[0.05,1],size:[0.1,3],scale:[0.1,3],glow:[0,2],bright:[0,3],brightness:[0,3],sat:[0,3],saturation:[0,3],contrast:[0.5,2],warmth:[0,1],vignette:[0,1],flash:[0,1],flow:[0,1],opacity:[0,1],tintamt:[0,1]};
  var KEYALIAS={spin:'speed',brightness:'bright',saturation:'sat',scale:'size'};
  var COLORS={red:'#e8213a',crimson:'#c41e3a',blue:'#1a8cff',navy:'#1530a0',green:'#22c55e',lime:'#84e35a',purple:'#7a3df0',violet:'#7a3df0',pink:'#ff5fa2',magenta:'#ff2ec4',orange:'#ff7a1a',gold:'#ffc24a',yellow:'#ffe24a',white:'#ffffff',black:'#0a0c12',cyan:'#22d3ee',teal:'#14b8a6',gray:'#9aa3b2',grey:'#9aa3b2',silver:'#cdd6e6'};

  window.__CAPS={ windows:WINDOWS, wallKeys:Object.keys(WALLKEYS), colors:Object.keys(COLORS), views:(window.__VIEWS||[{k:'admin'},{k:'client'},{k:'partner'}]).map(function(v){return v.k;}),
    actions:['open window','set background color','set word color','say a word','scatter / solidify the wall','set a wall property (speed,morph,glow,brightness,saturation,density,size,contrast,warmth,vignette,flow,opacity)','save/load a named view (admin/client/partner)','skin a window with an AI image','play a background video source'] };

  /* ---- PERSIST like Master Background Controls (apply + save + OWN the keys + publish) ---- */
  window.__commitLook=function(delta){ if(!delta)return; try{
    if(window.__applyPref)window.__applyPref(delta);
    var id=window.__activeSource||'memelli_crown_01';
    var cur=Object.assign({}, (window.__prefFor&&window.__prefFor(id))||{}, delta);
    if(window.__savePref)window.__savePref(id,cur);
    window.__adminSet=window.__adminSet||{}; for(var k in delta){ if(delta.hasOwnProperty(k))window.__adminSet[k]=1; }
    try{ localStorage.setItem('memelli_adminset',JSON.stringify(window.__adminSet)); }catch(_a){}
    var c=delta.color||delta.color1||delta.tint; if(c){ window.__look=window.__look||{}; window.__look.color=c; try{ localStorage.setItem('memelli_look',JSON.stringify(window.__look)); }catch(_l){} }
    try{ fetch('/api/customer/view',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({source:id,look:cur,view:'customer'})}).catch(function(){}); }catch(_p){}
  }catch(e){} };

  /* [2026-06-25 Mel] __renderPanel — the brain RENDERS ITS OWN window: a title + clickable rows, each row's .action drives the system through __drive (so the rendered data is live/clickable, not a dead tab). This is "the brain controls the working system". */
  function __renderPanel(bd,r){ try{ bd.innerHTML=''; r=r||{}; var w=document.createElement('div'); w.style.cssText='padding:18px 18px 22px;color:#eef2ff;font:14px/1.5 Inter,system-ui,sans-serif';
    if(r.title){ var h=document.createElement('div'); h.textContent=r.title; h.style.cssText='font:800 20px Inter,system-ui;letter-spacing:.01em;margin-bottom:4px'; w.appendChild(h); }
    if(r.sub){ var sb=document.createElement('div'); sb.textContent=r.sub; sb.style.cssText='font:600 12px Inter;color:rgba(255,255,255,.6);margin-bottom:14px'; w.appendChild(sb); }
    (r.items||[]).forEach(function(it){ if(!it)return; var row=document.createElement('div'); var click=!!(it.action||it.open); row.style.cssText='padding:11px 13px;margin-bottom:8px;border-radius:11px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12)'+(click?';cursor:pointer':'');
      var lbl=document.createElement('div'); lbl.textContent=it.label||it.title||''; lbl.style.cssText='font:700 13px Inter'; row.appendChild(lbl);
      if(it.sub||it.value){ var s2=document.createElement('div'); s2.textContent=it.sub||it.value; s2.style.cssText='font:500 11px Inter;color:rgba(255,255,255,.55);margin-top:2px'; row.appendChild(s2); }
      if(click){ row.onclick=function(){ try{ if(it.action&&window.__drive)window.__drive(it.action); else if(it.open&&window.openWindow)window.openWindow({k:it.open,label:it.label||it.open}); }catch(e){} }; row.onmouseenter=function(){row.style.borderColor='#c41e3a';}; row.onmouseleave=function(){row.style.borderColor='rgba(255,255,255,.12)';}; }
      w.appendChild(row); });
    if(r.html){ var hh=document.createElement('div'); hh.style.cssText='margin-top:8px'; hh.innerHTML=String(r.html); w.appendChild(hh); }
    bd.appendChild(w); }catch(e){ try{bd.textContent=(r&&r.title)||'Memelli';}catch(_){} } }
  /* [2026-06-25 Mel] __drive(action) — THE ONE EXECUTOR (the brain's hands). Takes an action object in __CAPS vocabulary and runs it through the real setters. BOTH callers use it: the regex fast-path (__execCommand) AND the brain's response (j.action from the LLM). One executor, two callers, no drift — the foundation. Every future capability = one __CAPS entry + a branch here. */
  window.__drive=function(action){ if(!action||typeof action!=='object')return false; var did=false;
    try{ var look=action.wall||action.look; if(look&&typeof look==='object'){ window.__commitLook(look); did=true; } }catch(_w){}
    try{ var win=action.window||action.win; if(win&&window.__winAction){ window.__winAction(Array.isArray(win)?win:[win]); did=true; } }catch(_n){}
    try{ if(action.source&&window.__setSource){ window.__setSource(action.source); did=true; } }catch(_s){}
    try{ var say=action.say; if(say){ var t=(typeof say==='string')?say:(say.text||''); if(t){ if(window.__text&&window.__text.render)window.__text.render(t,''); var dl={text:t,textShow:true}; if(say.textColor)dl.textColor=say.textColor; window.__commitLook(dl); did=true; } } }catch(_t){}
    try{ var view=action.view; if(view){ var op=(typeof view==='object'&&view.op)||'load'; var nm=(typeof view==='string')?view:(view.name||''); if(op==='save'&&window.__saveView){window.__saveView(nm);did=true;} else if(window.__loadView){window.__loadView(nm);did=true;} } }catch(_v){}
    try{ if(action.skin&&window.__skinWall){ var sh=document.getElementById('mw-shell'); window.__skinWall((typeof action.skin==='string'?action.skin:undefined),function(){},(sh&&sh.style.display!=='none')?sh:null); did=true; } }catch(_sk){}
    try{ var pnl=action.render||action.panel; if(pnl&&typeof pnl==='object'&&window.openWindow){ window.__aiPanel=pnl; window.__winRender=window.__winRender||{}; window.__winRender['ai_panel']=function(bd){ try{__renderPanel(bd,window.__aiPanel);}catch(e){} }; window.openWindow({k:'ai_panel',label:(pnl.title||'Memelli')}); did=true; } }catch(_pn){}
    return did; };
  function colorFrom(x){ var hx=x.match(/#([0-9a-f]{6}|[0-9a-f]{3})\b/i); if(hx)return '#'+hx[1]; for(var name in COLORS){ if(new RegExp('\\b'+name+'\\b').test(x))return COLORS[name]; } return null; }
  function windowFrom(x){ var best=null,hits=0; WINDOWS.forEach(function(w){ var h=0; (w.kw+' '+w.label.toLowerCase()).split(' ').forEach(function(t){ if(t.length>2&&x.indexOf(t)>=0)h++; }); if(h>hits){hits=h;best=w;} }); return hits>0?best:null; }
  function clamp(v,r){ return Math.max(r[0],Math.min(r[1],v)); }
  function posFrom(x){ if(/top[\s-]?left/.test(x))return 'topleft'; if(/top[\s-]?right/.test(x))return 'topright'; if(/bottom[\s-]?left/.test(x))return 'bottomleft'; if(/bottom[\s-]?right/.test(x))return 'bottomright'; if(/\bcenter|centre|middle\b/.test(x))return 'center'; if(/\bleft\b/.test(x))return 'left'; if(/\bright\b/.test(x))return 'right'; if(/\btop\b/.test(x))return 'top'; if(/\bbottom\b/.test(x))return 'bottom'; return null; }

  /* ---- THE PARSER: text -> action. Returns a reply string if handled, else null (falls through to the brain). ---- */
  window.__execCommand=function(text,force){
    if(!window.__isAdmin && !force) return null;             // CEO only — unless force (clear drive-intent before __isAdmin resolves; per-window admin checks below still hold)
    var raw=String(text||'').trim(); var x=raw.toLowerCase(); if(!x) return null;

    /* SAVE / LOAD a named view */
    var mv=x.match(/\b(save|load|switch to|use)\b/);
    if(mv && /\b(admin|client|partner|co-?brand)/.test(x)){
      var name=/admin/.test(x)?'admin':(/client/.test(x)?'client':'partner');
      if(/\bsave\b/.test(x)){ if(window.__saveView)window.__saveView(name); return 'Saved the current setup as the '+name+' view.'; }
      if(window.__hasView&&window.__hasView(name)){ window.__loadView(name); return 'Loaded the '+name+' view.'; }
      return 'No '+name+' view saved yet — say "save this as the '+name+' view" first.';
    }

    /* SAY a word on the screen */
    var sw=raw.match(/\b(?:say|write|display|the words?(?:\s+should)?\s+(?:say|read|be))\b[:\s]+["“']?(.+?)["”']?\s*$/i);
    if(sw){ var word=sw[1].trim(); if(window.__text&&window.__text.render)window.__text.render(word,''); window.__commitLook({text:word,textShow:true}); return 'The screen now says "'+word+'".'; }

    var col=colorFrom(x);
    /* WORD / TEXT color */
    if(col && /\b(word|words|text|letter|letters|title|font)\b/.test(x)){ if(window.__text&&window.__text.setColor)window.__text.setColor(col); window.__commitLook({textColor:col}); return 'Words set to '+col+'.'; }
    /* WALL / BACKGROUND color (default target for a bare color command) */
    if(col && /\b(wall|background|backdrop|scene|screen|particles?|color|colour|make it|everything)\b/.test(x)){ window.__commitLook({color1:col,tint:col,tintamt:0,color:col}); return 'Background set to '+col+'.'; }

    /* SCATTER / SOLIDIFY */
    if(/\bscatter|dissolve|explode\b/.test(x)){ window.__commitLook({morph:0}); return 'Scattered the wall.'; }
    if(/\b(solid|solidify|crystalli[sz]e|gather|form up|reform|come together)\b/.test(x)){ window.__commitLook({morph:1}); return 'Wall is solid.'; }

    /* NUMERIC wall property: "set speed to 2", "glow 1.5", "morph .7" */
    var numM=x.match(/(-?\d+(?:\.\d+)?)/);
    for(var pk in WALLKEYS){ if(new RegExp('\\b'+pk+'\\b').test(x)){ var key=KEYALIAS[pk]||pk; if(numM){ var d={}; d[key]=clamp(parseFloat(numM[1]),WALLKEYS[pk]); window.__commitLook(d); return 'Set '+key+' to '+d[key]+'.'; }
      /* qualitative */ if(/\b(more|up|higher|increase|faster|brighter)\b/.test(x)){ var d2={}; d2[key]=clamp((WALLKEYS[pk][1]),WALLKEYS[pk]); window.__commitLook(d2); return 'Turned '+key+' up.'; }
      if(/\b(less|down|lower|decrease|slower|darker)\b/.test(x)){ var d3={}; d3[key]=WALLKEYS[pk][0]; window.__commitLook(d3); return 'Turned '+key+' down.'; } } }

    /* SKIN a window with an AI image */
    if(/\bskin\b/.test(x) && window.__skinWall){ var sh=document.getElementById('mw-shell'); var tgt=(sh&&sh.style.display!=='none')?sh:null; var prompt=raw.replace(/\b(skin|this|the|window|with)\b/ig,'').trim(); window.__skinWall(prompt||undefined,function(){}, tgt); return 'Generating a skin'+(tgt?' for this window':'')+'…'; }

    /* OPEN / position a window */
    if(/\b(open|show|launch|pull up|bring up|go to|take me to)\b/.test(x)){ var w=windowFrom(x); if(w){ if(w.admin&&!window.__isAdmin)return null; var acts=[{do:'open',k:w.k,label:w.label}]; var pos=posFrom(x); if(pos)acts.push({do:'move',pos:pos}); if(window.__winAction)window.__winAction(acts); else if(window.openWindow)window.openWindow({k:w.k,label:w.label}); return 'Opened '+w.label+(pos?(' ('+pos+')'):'')+'.'; } }

    /* MOVE / SIZE the current window (no window name) */
    var pos2=posFrom(x); if(pos2 && /\b(move|put|place|center|centre|send)\b/.test(x) && window.__winAction){ window.__winAction([{do:'move',pos:pos2}]); return 'Moved the window '+pos2+'.'; }
    if(/\b(maximi[sz]e|full ?screen|biggest)\b/.test(x) && window.__winAction){ window.__winAction([{do:'maximize'}]); return 'Maximized.'; }
    if(/\b(minimi[sz]e|park it)\b/.test(x) && window.__winAction){ window.__winAction([{do:'minimize'}]); return 'Minimized.'; }
    if(/\b(close it|close that|close the window)\b/.test(x) && window.__winAction){ window.__winAction([{do:'close'}]); return 'Closed.'; }

    return null;                                              // not a command -> let the brain answer
  };

  /* ---- TEACH THE deepinfra (the system grows itself from the CEO + the front-end) ----
     The deepinfra has a semantic memory (api_deepinfra_recall / api_deepinfra_learn, pgvector + Qwen3-Embedding). `deepinfra_learn` is OWNER-LOCKED — so this only writes when Mel is logged in as the owner (credentials:'include' carries his CEO session; the builder key cannot). This feeds the deepinfra the front-end's executable surface + the CEO's execution patterns so the brain LEARNS what it can do and how Mel works. */
  window.__teachdeepinfra=function(topic,content){ if(!window.__isAdmin||!content)return; try{ fetch('/api/deepinfra_learn',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({topic:topic,content:content,text:content,kind:'frontend',author:'Mel (CEO)'})}).catch(function(){}); }catch(e){} };
  /* teach the capability map ONCE per session so the deepinfra knows what the front-end bar can execute */
  try{ setTimeout(function(){ if(window.__isAdmin&&window.__CAPS){ var caps=window.__CAPS; var c='FRONT-END EXECUTABLE SURFACE — the CEO context bar runs these live via window.__execCommand. WINDOWS: '+caps.windows.map(function(w){return w.k;}).join(', ')+'. WALL look-keys: '+caps.wallKeys.join(', ')+'. COLORS: '+caps.colors.join(', ')+'. NAMED VIEWS: '+caps.views.join(', ')+'. ACTIONS: '+caps.actions.join('; ')+'. The CEO (Mel) talks to the bar in natural language — map his intent to these and return the action so the front end executes it.'; window.__teachdeepinfra('frontend_capabilities', c); } },4000); }catch(_t){}
})();
