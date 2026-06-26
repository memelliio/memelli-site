/* [2026-06-25 Mel] VIDEO STUDIO — refactored. The video-MAKING is at the TOP (CREATE tab, default).
   Tabbed glass window inside the ONE universal window (openWindow k:videostudio -> __winRender.videostudio).
   Tabs pinned at top (always visible, never scroll to find the primary action); only the panel body scrolls.
   CREATE  = the maker: pick character -> describe scenario -> Write Episode (/api/video_writer) ->
             editable script preview -> Render Video (/api/video_pipeline / video_studio render) -> inline <video>.
   EPISODES = gallery of made episodes (existing list, /api/video_studio list_episodes), videos live on their own tab.
   LIBRARY  = scene/character asset thumbnails (existing list_scenes grid).
   Role-aware: admin/owner sees everything + Create; a non-admin client gets a simple "coming soon" (no marketing internals).
   Same design language as analytics.js / adminreview.js: glass tiles, red accents, white text. Vanilla JS, esc()-guarded, if(el) checks. */
(function(){
  window.__winRender = window.__winRender || {};
  var RED='#e11d2a';
  var CHARACTERS=[{v:'soft_pull_bear',label:'Soft Pull Bear'},{v:'maria',label:'Maria'}];

  function esc(x){ return String(x==null?'':x).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function isImg(u){ return /^https?:\/\//i.test(String(u||'')); }
  function api(body){ return fetch('/api/video_studio',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(body||{})}).then(function(r){return r.json();}).catch(function(){return {ok:false,error:'network'};}); }
  function post(url,body){ return fetch(url,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(body||{})}).then(function(r){return r.json();}).catch(function(){return {ok:false,error:'network'};}); }

  var CSS='<style>'
    +'.vs-wrap{color:#eef2ff;font:500 13px Inter,system-ui,-apple-system,sans-serif}'
    /* sticky top: header + tabs stay pinned while the window body scrolls under them. -16/-18 margins cover the window content padding so the bg reaches the edges */
    +'.vs-top{position:sticky;top:0;z-index:6;margin:-16px -18px 14px;padding:14px 18px 0;background:rgba(10,12,18,.97);box-shadow:0 8px 14px -8px rgba(0,0,0,.6)}'
    +'.vs-h{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:0 0 10px}'
    +'.vs-h h1{font:800 19px Inter,system-ui;margin:0;letter-spacing:.01em}'
    +'.vs-h .vs-ts{font:600 10px Inter;letter-spacing:.06em;text-transform:uppercase;color:#9fb0c8}'
    +'.vs-tabs{display:flex;gap:6px;border-bottom:1px solid rgba(255,255,255,.12)}'
    +'.vs-tab{cursor:pointer;border:0;background:transparent;color:#9fb0c8;font:800 12px Inter;letter-spacing:.04em;text-transform:uppercase;padding:9px 16px;border-radius:10px 10px 0 0;border-bottom:2px solid transparent;margin-bottom:-1px}'
    +'.vs-tab:hover{color:#fff}'
    +'.vs-tab.on{color:#fff;background:rgba(255,255,255,.06);border-bottom:2px solid '+RED+'}'
    +'.vs-panel{display:none}.vs-panel.on{display:block}'
    +'.vs-sec{font:700 12px Inter;color:#9fb0c8;letter-spacing:.05em;text-transform:uppercase;margin:18px 0 9px;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:6px}'
    /* CREATE */
    +'.vs-make{background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.13);border-radius:16px;padding:16px 16px 18px}'
    +'.vs-make h2{font:800 16px Inter;margin:0 0 3px;color:#fff}'
    +'.vs-make .vs-sub{font:600 12px Inter;color:#9fb0d0;margin:0 0 14px}'
    +'.vs-make label{display:block;font:700 11px Inter;color:#9fb0d0;letter-spacing:.04em;text-transform:uppercase;margin:0 0 6px}'
    +'.vs-seg{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}'
    +'.vs-seg button{cursor:pointer;border:1px solid rgba(255,255,255,.18);background:rgba(0,0,0,.25);color:#cdd6ea;font:700 12px Inter;border-radius:10px;padding:8px 16px}'
    +'.vs-seg button.on{background:linear-gradient(135deg,#c41e3a,#ff5f6d);border-color:transparent;color:#fff}'
    +'.vs-make textarea,.vs-make input{width:100%;box-sizing:border-box;background:rgba(0,0,0,.32);border:1px solid rgba(255,255,255,.16);border-radius:12px;color:#fff;padding:12px;font:13px/1.5 Inter}'
    +'.vs-make textarea#vs-scenario{min-height:84px;resize:vertical}'
    +'.vs-cta{cursor:pointer;border:0;color:#fff;font:800 14px Inter;border-radius:12px;padding:14px 22px;background:linear-gradient(135deg,#c41e3a,#ff5f6d);width:100%;margin-top:14px;box-shadow:0 6px 20px rgba(196,30,58,.35)}'
    +'.vs-cta.alt{background:linear-gradient(135deg,#7a3df0,#c41e3a)}'
    +'.vs-cta[disabled]{opacity:.55;cursor:default;box-shadow:none}'
    +'.vs-status{font:600 12px Inter;color:#9fb0d0;min-height:16px;margin-top:10px;display:flex;align-items:center;gap:9px}'
    +'.vs-status.err{color:#ffb27a}.vs-status.ok{color:#9be59b}'
    +'.vs-spin{width:15px;height:15px;border:2px solid rgba(255,255,255,.25);border-top-color:#fff;border-radius:50%;animation:vs-rot .8s linear infinite;flex:0 0 auto}'
    +'@keyframes vs-rot{to{transform:rotate(360deg)}}'
    +'.vs-preview{margin-top:16px;border-top:1px solid rgba(255,255,255,.1);padding-top:14px;display:none}'
    +'.vs-preview.on{display:block}'
    +'.vs-preview .vs-pl{font:700 11px Inter;color:#9fb0d0;letter-spacing:.04em;text-transform:uppercase;margin:12px 0 6px}'
    +'.vs-preview .vs-pl:first-child{margin-top:0}'
    +'.vs-preview input,.vs-preview textarea{width:100%;box-sizing:border-box;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.14);border-radius:10px;color:#fff;padding:10px;font:13px/1.5 Inter}'
    +'.vs-preview textarea{resize:vertical}.vs-preview #vs-pv-script{min-height:120px;font:12.5px/1.55 ui-monospace,Menlo,Consolas,monospace}'
    +'.vs-make video{width:100%;border-radius:12px;background:#000;display:block;margin-top:14px;max-height:300px}'
    /* EPISODES */
    +'.vs-eps{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px}'
    +'.vs-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:13px 14px;display:flex;flex-direction:column;gap:8px}'
    +'.vs-card .vs-no{font:800 11px Inter;color:'+RED+';letter-spacing:.08em;text-transform:uppercase}'
    +'.vs-card .vs-ttl{font:800 15px Inter;color:#fff;line-height:1.25}'
    +'.vs-card .vs-scene{font:600 12px Inter;color:#9fb0d0}'
    +'.vs-card .vs-tag{font:italic 600 12.5px Inter;color:#ffd479}'
    +'.vs-card video{width:100%;border-radius:10px;background:#000;display:block;max-height:230px}'
    +'.vs-badge{display:inline-flex;align-items:center;gap:6px;align-self:flex-start;font:700 11px Inter;color:#ffb27a;background:rgba(255,120,40,.12);border:1px solid rgba(255,140,60,.35);border-radius:8px;padding:5px 9px}'
    +'.vs-meta{font:600 11px Inter;color:#8a96ab}'
    +'.vs-script{max-height:88px;overflow:auto;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.1);border-radius:9px;padding:8px 10px;font:12px/1.45 ui-monospace,Menlo,Consolas,monospace;color:#cdd6ea;white-space:pre-wrap}'
    +'.vs-btn{cursor:pointer;border:0;color:#fff;font:800 12px Inter;border-radius:10px;padding:10px 16px;background:linear-gradient(135deg,#c41e3a,#ff5f6d);align-self:flex-start}'
    +'.vs-btn[disabled]{opacity:.55;cursor:default}'
    +'.vs-rmsg{font:600 11.5px Inter;color:#9fb0d0;min-height:14px}'
    /* LIBRARY */
    +'.vs-scenes{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:11px}'
    +'.vs-thumb{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12);border-radius:12px;overflow:hidden;display:flex;flex-direction:column}'
    +'.vs-thumb .vs-imgwrap{aspect-ratio:1/1;background:rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;overflow:hidden}'
    +'.vs-thumb img{width:100%;height:100%;object-fit:cover;display:block}'
    +'.vs-thumb .vs-ph{font:700 11px Inter;color:#6b7689;text-align:center;padding:8px}'
    +'.vs-thumb .vs-cap{padding:8px 10px}'
    +'.vs-thumb .vs-cap b{display:block;font:700 12px Inter;color:#fff;text-transform:capitalize}'
    +'.vs-thumb .vs-cap span{display:block;font:600 11px Inter;color:#9fb0d0;margin-top:2px}'
    +'.vs-chip{display:inline-block;font:700 9.5px Inter;letter-spacing:.05em;text-transform:uppercase;color:#9be59b;border:1px solid rgba(155,229,155,.35);border-radius:6px;padding:1px 6px;margin-bottom:4px}'
    +'.vs-empty{opacity:.6;padding:18px;font:600 13px Inter}'
    +'</style>';

  function episodeCard(ep){
    var hasVid = !!ep.video_url;
    var player = hasVid
      ? '<video controls preload="metadata" src="'+esc(ep.video_url)+'"></video>'
      : '<span class="vs-badge">&#9679; Not rendered yet</span>';
    var renderBtn = hasVid ? '' : '<button class="vs-btn vs-render" data-ep="'+esc(ep.episode_no)+'">Render with Kling</button><div class="vs-rmsg" data-rmsg="'+esc(ep.episode_no)+'"></div>';
    return '<div class="vs-card" data-card="'+esc(ep.episode_no)+'">'
      +'<div class="vs-no">Episode '+esc(ep.episode_no)+'</div>'
      +'<div class="vs-ttl">'+esc(ep.title||'Untitled')+'</div>'
      +(ep.scene?'<div class="vs-scene">'+esc(ep.scene)+'</div>':'')
      +(ep.tagline?'<div class="vs-tag">&ldquo;'+esc(ep.tagline)+'&rdquo;</div>':'')
      +'<div class="vs-meta">'+esc(ep.characters||'')+(ep.voices?(' &middot; '+esc(ep.voices)):'')+'</div>'
      +player
      +(ep.full_prompt?'<div class="vs-script">'+esc(ep.full_prompt)+'</div>':'')
      +renderBtn
      +'</div>';
  }

  function sceneThumb(a){
    var nm=String(a.scene||a.character||'asset').replace(/_/g,' ');
    var img = isImg(a.fal_url)
      ? '<img loading="lazy" src="'+esc(a.fal_url)+'" alt="'+esc(nm)+'" onerror="this.parentNode.innerHTML=&quot;<div class=vs-ph>local file<br>(not hosted)</div>&quot;">'
      : '<div class="vs-ph">local file<br>(not hosted)</div>';
    return '<div class="vs-thumb">'
      +'<div class="vs-imgwrap">'+img+'</div>'
      +'<div class="vs-cap"><span class="vs-chip">'+esc(a.asset_type||'asset')+'</span><b>'+esc(nm)+'</b><span>'+esc(a.character||'')+(a.outfit?(' &middot; '+esc(a.outfit)):'')+'</span></div>'
      +'</div>';
  }

  window.__winRender['videostudio']=function(bd,st){
    if(!bd) return;
    var adm = window.__isAdmin || (window.__me && /^(ceo|admin|owner)$/i.test(String(window.__me.role||'')));
    bd.innerHTML=''; bd.style.display='block'; bd.style.overflow='visible';

    // ---- CLIENT (non-admin): no marketing internals, just a friendly placeholder ----
    if(!adm){
      bd.style.display='block'; bd.style.overflow='auto';
      bd.innerHTML=CSS+'<div class="vs-wrap" style="height:auto"><div class="vs-h"><h1>Videos</h1></div>'
        +'<div class="vs-empty" style="text-align:center;padding:48px 24px">'
        +'<div style="font:800 16px Inter;color:#fff;margin-bottom:8px">Your videos are coming soon</div>'
        +'Personalized clips for your journey will appear here. Nothing to show yet.'
        +'</div></div>';
      return;
    }

    // ---- ADMIN: full tabbed studio ----
    var charOpts=CHARACTERS.map(function(c){return '<button data-char="'+esc(c.v)+'"'+(c.v==='soft_pull_bear'?' class="on"':'')+'>'+esc(c.label)+'</button>';}).join('');
    var wrap=document.createElement('div'); wrap.className='vs-wrap';
    wrap.innerHTML=CSS
      +'<div class="vs-top">'
        +'<div class="vs-h"><h1>Video Studio</h1><span class="vs-ts" id="vs-ts"></span></div>'
        +'<div class="vs-tabs">'
          +'<button class="vs-tab on" data-tab="create">Create</button>'
          +'<button class="vs-tab" data-tab="episodes">Episodes</button>'
          +'<button class="vs-tab" data-tab="library">Library</button>'
        +'</div>'
      +'</div>'
      +'<div>'
        // ----- CREATE PANEL (default, TOP) -----
        +'<div class="vs-panel on" data-panel="create">'
          +'<div class="vs-make">'
            +'<h2>Make a video</h2>'
            +'<div class="vs-sub">Describe an idea, let the AI write the script, then render it.</div>'
            +'<label>Character</label>'
            +'<div class="vs-seg" id="vs-seg">'+charOpts+'</div>'
            +'<label>Scenario</label>'
            +'<textarea id="vs-scenario" placeholder="Describe the idea — e.g. \'Soft Pull at a car dealership\' — the AI writes the script."></textarea>'
            +'<button class="vs-cta" id="vs-write">Write Episode</button>'
            +'<div class="vs-status" id="vs-wstat"></div>'
            // editable preview
            +'<div class="vs-preview" id="vs-preview">'
              +'<div class="vs-pl">Title</div><input id="vs-pv-title" placeholder="Episode title">'
              +'<div class="vs-pl">Image prompt</div><textarea id="vs-pv-image" rows="3" placeholder="Visual / scene prompt"></textarea>'
              +'<div class="vs-pl">Voice script</div><textarea id="vs-pv-script" placeholder="@[voice] lines…"></textarea>'
              +'<button class="vs-cta alt" id="vs-render">Render Video</button>'
              +'<div class="vs-status" id="vs-rstat"></div>'
              +'<div id="vs-rvideo"></div>'
            +'</div>'
          +'</div>'
        +'</div>'
        // ----- EPISODES PANEL -----
        +'<div class="vs-panel" data-panel="episodes">'
          +'<div class="vs-eps" id="vs-eps"><div class="vs-empty">Loading episodes&hellip;</div></div>'
        +'</div>'
        // ----- LIBRARY PANEL -----
        +'<div class="vs-panel" data-panel="library">'
          +'<div class="vs-scenes" id="vs-scenes"><div class="vs-empty">Loading scenes&hellip;</div></div>'
        +'</div>'
      +'</div>';
    bd.appendChild(wrap);

    // ---- tab switching (tabs stay pinned; only .vs-body scrolls) ----
    var tabs=wrap.querySelectorAll('.vs-tab');
    var panels=wrap.querySelectorAll('.vs-panel');
    var loaded={episodes:false,library:false};
    function show(name){
      Array.prototype.forEach.call(tabs,function(t){ t.classList.toggle('on', t.getAttribute('data-tab')===name); });
      Array.prototype.forEach.call(panels,function(p){ p.classList.toggle('on', p.getAttribute('data-panel')===name); });
      if(name==='episodes' && !loaded.episodes){ loaded.episodes=true; loadEpisodes(); }
      if(name==='library' && !loaded.library){ loaded.library=true; loadScenes(); }
    }
    Array.prototype.forEach.call(tabs,function(t){ t.onclick=function(){ show(t.getAttribute('data-tab')); }; });

    // ---- CREATE: character segmented picker ----
    var chosenChar='soft_pull_bear';
    var seg=wrap.querySelector('#vs-seg');
    if(seg){ Array.prototype.forEach.call(seg.querySelectorAll('button'),function(b){ b.onclick=function(){
      chosenChar=b.getAttribute('data-char');
      Array.prototype.forEach.call(seg.querySelectorAll('button'),function(x){ x.classList.toggle('on', x===b); });
    }; }); }

    function setStat(el,msg,kind,spin){ if(!el)return; el.className='vs-status'+(kind?(' '+kind):''); el.innerHTML=(spin?'<span class="vs-spin"></span>':'')+esc(msg); }

    // ---- CREATE: Write Episode -> /api/video_writer ----
    var wBtn=wrap.querySelector('#vs-write'), wStat=wrap.querySelector('#vs-wstat');
    var preview=wrap.querySelector('#vs-preview');
    var pvTitle=wrap.querySelector('#vs-pv-title'), pvImage=wrap.querySelector('#vs-pv-image'), pvScript=wrap.querySelector('#vs-pv-script');
    if(wBtn){ wBtn.onclick=function(){
      var scenario=((wrap.querySelector('#vs-scenario')||{}).value||'').trim();
      if(!scenario){ setStat(wStat,'Describe the idea first.','err'); return; }
      wBtn.disabled=true; setStat(wStat,'Writing the script…','',true);
      post('/api/video_writer',{character:chosenChar,scenario:scenario}).then(function(r){
        wBtn.disabled=false;
        if(r&&r.ok!==false&&(r.voice_script||r.script||r.title||r.image_prompt)){
          if(pvTitle) pvTitle.value=r.title||'';
          if(pvImage) pvImage.value=r.image_prompt||r.image||'';
          if(pvScript) pvScript.value=r.voice_script||r.script||'';
          if(preview) preview.classList.add('on');
          setStat(wStat,'Script ready — tweak it, then Render Video.','ok');
        } else {
          setStat(wStat,(r&&(r.error||r.note))||'Could not write the script.','err');
        }
      });
    }; }

    // ---- CREATE: Render Video -> /api/video_pipeline ----
    var rBtn=wrap.querySelector('#vs-render'), rStat=wrap.querySelector('#vs-rstat'), rVideo=wrap.querySelector('#vs-rvideo');
    if(rBtn){ rBtn.onclick=function(){
      var script=((pvScript||{}).value||'').trim();
      if(!script){ setStat(rStat,'Write or paste a script first.','err'); return; }
      rBtn.disabled=true; if(rVideo)rVideo.innerHTML='';
      setStat(rStat,'Rendering… ~3-4 min. It will appear below when ready.','',true);
      var body={action:'render',character:chosenChar,script:script,
        title:(pvTitle&&pvTitle.value)||'',image_prompt:(pvImage&&pvImage.value)||''};
      post('/api/video_pipeline',body).then(function(r){
        rBtn.disabled=false;
        if(r&&r.ok!==false&&r.video_url){
          setStat(rStat,'Rendered ✓ — saved to Episodes.','ok');
          if(rVideo){ var v=document.createElement('video'); v.controls=true; v.preload='metadata'; v.src=r.video_url; rVideo.appendChild(v); }
          loaded.episodes=false; // refresh gallery next time it's opened
        } else {
          // never leave them staring at nothing: keep the written script + explain
          setStat(rStat,(r&&(r.error||r.note))||'Render did not complete here. Your script is saved above — render from Episodes or try again.','err');
        }
      });
    }; }

    // ---- EPISODES (lazy) ----
    var elEps=wrap.querySelector('#vs-eps'), elTs=wrap.querySelector('#vs-ts');
    function loadEpisodes(){
      if(elEps) elEps.innerHTML='<div class="vs-empty">Loading episodes&hellip;</div>';
      api({action:'list_episodes'}).then(function(j){
        if(!j||!j.ok){ if(elEps)elEps.innerHTML='<div class="vs-empty" style="color:#ffb27a">'+esc((j&&j.error)||'Could not load episodes')+'</div>'; if(elTs)elTs.textContent='rail error'; return; }
        var eps=j.episodes||[];
        if(elEps)elEps.innerHTML=eps.length?eps.map(episodeCard).join(''):'<div class="vs-empty">No episodes yet. Make one in Create.</div>';
        if(elTs)elTs.textContent=eps.length+' episodes · live';
        if(elEps){ Array.prototype.forEach.call(elEps.querySelectorAll('.vs-render'),function(btn){
          btn.onclick=function(){
            var epNo=btn.getAttribute('data-ep');
            var msg=elEps.querySelector('[data-rmsg="'+epNo+'"]');
            btn.disabled=true; if(msg){msg.style.color='#9fb0d0';msg.textContent='Rendering with Kling 3.0 — this can take a few minutes…';}
            api({action:'render',episode_no:Number(epNo)}).then(function(r){
              if(r&&r.ok&&r.video_url){ var card=elEps.querySelector('[data-card="'+epNo+'"]'); if(card){ var bdg=card.querySelector('.vs-badge'); var v=document.createElement('video'); v.controls=true; v.preload='metadata'; v.src=r.video_url; if(bdg)bdg.replaceWith(v); else card.appendChild(v); } if(msg){msg.style.color='#9be59b';msg.textContent='Rendered ✓';} btn.remove(); }
              else if(r&&r.note){ btn.disabled=false; if(msg){msg.style.color='#ffb27a';msg.textContent=r.note+(r.reason?(' — '+r.reason):'');} }
              else { btn.disabled=false; if(msg){msg.style.color='#ffb27a';msg.textContent=(r&&r.error)||'Render failed';} }
            });
          };
        }); }
      });
    }

    // ---- LIBRARY (lazy) ----
    var elScenes=wrap.querySelector('#vs-scenes');
    function loadScenes(){
      if(elScenes) elScenes.innerHTML='<div class="vs-empty">Loading scenes&hellip;</div>';
      api({action:'list_scenes'}).then(function(j){
        if(!j||!j.ok){ if(elScenes)elScenes.innerHTML='<div class="vs-empty" style="color:#ffb27a">'+esc((j&&j.error)||'Could not load scenes')+'</div>'; return; }
        var sc=j.scenes||[];
        if(elScenes)elScenes.innerHTML=sc.length?sc.map(sceneThumb).join(''):'<div class="vs-empty">No scene assets yet.</div>';
      });
    }
  };

  // convenience opener — owner can also call window.__openVideoStudio()
  window.__openVideoStudio=function(){ if(window.openWindow) window.openWindow({k:'videostudio',label:'Video Studio'}); };

  /* [2026-06-25 Mel] MAKE IT OPENABLE: (1) register into the bar's window list (window.__CAPS.windows is the same array cmd.js windowFrom reads), so "open video studio" works via the bar AND the brain; (2) a clickable launcher tab so no console needed. */
  (function(){
    function isAdmin(){ try{ return window.__isAdmin===true || (window.__me&&/^(ceo|admin|owner)$/i.test(String(window.__me.role||''))); }catch(e){ return false; } }
    var c=0, ri=setInterval(function(){
      try{ if(window.__CAPS && window.__CAPS.windows){
        if(!window.__CAPS.windows.some(function(w){return w.k==='videostudio';}))
          window.__CAPS.windows.push({k:'videostudio',label:'Video Studio',admin:1,kw:'video studio bear soft pull episodes ads commercials marketing reels videos'});
        clearInterval(ri);
      } }catch(e){}
      if(++c>40) clearInterval(ri);
    },400);
    function addTab(){
      if(document.getElementById('mb-vstab')) return;
      if(!isAdmin()) return;
      var t=document.createElement('div'); t.id='mb-vstab'; t.textContent='VIDEO'; t.title='Video Studio';
      t.style.cssText='position:fixed;right:0;top:34%;transform:translateY(-50%);writing-mode:vertical-rl;background:linear-gradient(135deg,#7a3df0,#c41e3a);color:#fff;font-weight:800;font-size:11px;letter-spacing:.14em;padding:16px 7px;border-radius:10px 0 0 10px;cursor:pointer;z-index:25;box-shadow:0 6px 22px rgba(0,0,0,.4)';
      t.onclick=function(){ if(window.openWindow) window.openWindow({k:'videostudio',label:'Video Studio'}); };
      document.body.appendChild(t);
    }
    var c2=0, ti=setInterval(function(){ if(document.body){ addTab(); if(document.getElementById('mb-vstab')||++c2>40) clearInterval(ti); } },500);
  })();
})();
