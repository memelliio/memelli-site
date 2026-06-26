(function(){
  if(window.__autosurfaceInit)return; window.__autosurfaceInit=true;
  // [autosurface 2026-06-24] The bar reads the user's LIVE completion state (always-on analytics)
  // and surfaces the right window. Reuses /api/session_context (next_action = what they've completed/not)
  // + window.openWindow (singleton: reuses/restores the one window). New module, no approved-module edits.
  function mapWindow(na){
    var M={ sign_up:'signup', connect_smartcredit:'smartcredit', prequalify:'smartcredit',
      review:'decision', review_prequal:'decision', decision:'decision',
      start_credit_repair:'credit_repair', credit_repair:'credit_repair',
      proceed_funding:'funding', funding_approved:'funding', funding:'funding', sign_funding_agreement:'funding' };
    return M[String(na||'')]||null;
  }
  var LBL={ signup:'Sign Up', smartcredit:'Check SmartCredit', decision:'Funding Decision',
    credit_repair:'Credit Repair', funding:'Funding' };
  function surface(){
    if(document.cookie.indexOf('mio_sess=')<0) return; // only a real session
    /* [2026-06-24 Mel] DO NOT override the user's own window layout. If they have a restored active window
       or parked windows in the dock, respect that — only auto-surface for a fresh session with no saved state. */
    try{ if(localStorage.getItem('memelli_lastwin')) return; }catch(e){}
    try{ var __d=JSON.parse(localStorage.getItem('memelli_dock')||'[]'); if(__d&&__d.length) return; }catch(e){}
    fetch('/api/session_context',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:'{}'})
      .then(function(r){return r.json();}).then(function(j){
        var k=mapWindow(j&&j.next_action);
        if(k&&window.openWindow){ window.openWindow({k:k,label:LBL[k]||'Your Journey'}); }
      }).catch(function(){});
  }
  // wait for openWindow (scene.js) to be ready, then surface once
  var n=0,t=setInterval(function(){ if(window.openWindow||n++>40){ clearInterval(t); surface(); } },300);
})();
