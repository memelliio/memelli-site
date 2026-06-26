(function(){
  /* [COMPOSER - DESIGN FRONTEND 2026-06-22] INTENT-DRIVEN SCENE (Mel: make it richer, a natural spawn setting). The wall responds to BUSINESS INTENT, not just verbs: reads the spawn setting INTENT_SCENE_MAP (api/intent_scene), watches what the user asks + what the brain replies, matches the intent by keywords, and morphs the particle wall to that scene (source + look). The MAP is the variable (spawn grows it); this is the LOOP that applies it. Beat carries, content rides. */
  var MAP=[];
  function load(){ fetch('/api/intent_scene',{cache:'no-store'}).then(function(r){return r.json();}).then(function(j){ if(j&&j.intents&&j.intents.length){ MAP=j.intents; } }).catch(function(){}); }
  load(); setInterval(load, 120000); /* re-pull so spawn-grown intents flow in live */
  function match(text){
    text=String(text||'').toLowerCase(); if(!text) return null;
    var best=null, bestHits=0;
    MAP.forEach(function(m){
      var hits=0; (m.keywords||[]).forEach(function(k){ if(k && text.indexOf(String(k).toLowerCase())>=0) hits++; });
      if(hits>bestHits){ bestHits=hits; best=m; }
    });
    return bestHits>0 ? best : null;
  }
  var lastApplied='';
  function apply(text){
    var m=match(text); if(!m || m.intent===lastApplied) return; lastApplied=m.intent;
    /* [2026-06-22 fix: do NOT swap the background video on chat - it read as 'threw up a video'. ambient look only.] */
    try{ if(m.look && window.__applyPref){ window.__applyPref(m.look); } }catch(e){}
    try{ if(window.__wallEvent) window.__wallEvent('intent_scene',{intent:m.intent,source:m.source},'scene'); }catch(e){}
  }
  /* the LOOP: watch the bar's question (#ask on send) + the brain's reply (#reply), apply the intent scene */
  window.__applyIntentScene=apply;
  function hook(){
    var ask=document.getElementById('ask'), reply=document.getElementById('reply'), send=document.getElementById('sendb');
    
    
    if(reply){ var last=''; new MutationObserver(function(){ var t=(reply.textContent||'').trim(); if(t&&t!==last&&t.indexOf('thinking')<0){ last=t; apply(t); } }).observe(reply,{childList:true,characterData:true,subtree:true}); }
  }
  var t=setInterval(function(){ if(document.getElementById('ask')||document.getElementById('reply')){ clearInterval(t); hook(); } },500);
})();
