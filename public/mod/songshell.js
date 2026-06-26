/* [voice_song_lane / MAIN COMPOSER 2026-06-21 v5 CLEAN+USABLE: Songs slide top, simple Now Playing, pro under Advanced] THE ONE SONG on the universal frame + the full MEMELLI DAW living in the Music window. Owner-gated via the LISTENER AUTHORITY /api/song/view listening_as===ceo (NOT whoami - whoami's role leaked the DAW to the client login), session-auth only (NO key in client), additive — never touches scene.js, never throws. */
(function(){
  var BASE='';
  function j(url,opts){ opts=opts||{}; opts.credentials='include'; opts.headers=Object.assign({'Content-Type':'application/json'},opts.headers||{}); return fetch(url,opts).then(function(r){return r.json();}); }
  function whenReady(fn,t){ t=t||0; if(t>120)return; if(window.__text&&typeof window.__text.render==='function'&&document.getElementById('homesong')){ try{fn();}catch(e){} } else setTimeout(function(){whenReady(fn,t+1);},300); }

  function __activate(){ whenReady(function(){
    var a=document.getElementById('homesong');
    var lines=[], cur=-1, lyricsOn=true, title='', songId=null;
    function strip(s){ return String(s==null?'':s).replace(/\([^)]*\)/g,'').replace(/^\s*\[[^\]]*\]\s*$/g,'').replace(/\[[^\]]*\]/g,'').trim(); }
    function loadLyrics(cb){ j('/api/song/lyrics').then(function(d){ if(!d)return; title=d.title||''; songId=d.song_id||d.id||songId; var L=d.lines||d.lyrics_lines||d.lyrics||[]; if(typeof L==='string')L=L.split(/\r?\n/); lines=(L||[]).map(strip).filter(function(x){return x&&x.length>1;}); cur=-1; if(cb)cb(d); }).catch(function(){}); }
    loadLyrics(); window.__songReloadLyrics=loadLyrics;

    function tick(){ try{ if(!lyricsOn||!lines.length||!a.duration||a.paused)return; var i=Math.floor((a.currentTime/a.duration)*lines.length); if(i<0)i=0; if(i>lines.length-1)i=lines.length-1; if(i!==cur){cur=i; window.__text.render(lines[i]);} }catch(e){} }
    a.addEventListener('timeupdate',tick);
    a.addEventListener('play',function(){ if(!lines.length)loadLyrics(); });
    window.__lyricsOnWall=function(on){ lyricsOn=!!on; if(!on){try{window.__text.render('');}catch(e){}} };

    // ---- styling helpers ----
    function el(tag,css,txt){ var e=document.createElement(tag); if(css)e.style.cssText=css; if(txt!=null)e.textContent=txt; return e; }
    function section(title){ var s=el('div','margin:14px 0 4px;padding:12px;border:1px solid rgba(255,255,255,.12);border-radius:12px;background:rgba(20,24,32,.55)'); var h=el('div','font:800 13px Inter,system-ui,sans-serif;color:#fff;margin-bottom:10px;letter-spacing:.02em',title); s.appendChild(h); return s; }
    var RANGES={beat_vol:[0,1.3,.05],throw_vol:[0,.6,.02],vocal_vol:[0,1.3,.05],volume:[0,1,.05],speed_bpm:[70,180,1],sub_boost_db:[0,8,.5],mud_cut_db:[-8,0,.5],clap_db:[0,6,.5],air_db:[0,8,.5],comp_ratio:[1,6,.25],exciter_amount:[0,5,.25],limiter_ceiling:[.7,1,.01],loudness_lufs:[-16,-6,.5],true_peak:[-3,0,.1],preference_balance:[0,1,.05]};
    function num(v){ try{ return parseFloat(String(v).split(':')[0]); }catch(e){ return 0; } }
    function slider(label,sub,val,min,max,step,fmt,onset){ var w=el('div','margin-bottom:11px'); var row=el('div','display:flex;justify-content:space-between;margin-bottom:2px'); row.appendChild(el('span','font:700 12px Inter;color:#fff',label)); var vv=el('span','font:700 12px Inter;color:#9fe9bd',fmt(val)); row.appendChild(vv); w.appendChild(row); if(sub)w.appendChild(el('div','font:500 10px Inter;color:rgba(255,255,255,.42);margin-bottom:5px',sub)); var inp=el('input','width:100%;accent-color:#c41e3a'); inp.type='range'; inp.min=min; inp.max=max; inp.step=step; inp.value=val; inp.oninput=function(){ vv.textContent=fmt(+inp.value); onset(+inp.value); }; w.appendChild(inp); w._inp=inp; w._vv=vv; w._fmt=fmt; return w; }

    function injectDAW(){
      try{
        var host=null, ds=document.querySelectorAll('div');
        for(var i=ds.length-1;i>=0;i--){ if(/Music Studio/.test(ds[i].textContent||'') && ds[i].querySelector('input[type=range]')){ host=ds[i]; break; } }
        if(!host||host.querySelector('#memelli-daw'))return;
        var scope = window.__isAdmin ? 'ceo' : 'client:default';
        var root=el('div','margin-top:6px'); root.id='memelli-daw';

        // ===== YOUR SONGS - find & play any song you made =====
        var ss=section('\u{1F3B5} Your Songs'); root.appendChild(ss);
        j('/api/song/list').then(function(d){ var songs=(d&&d.songs)||[]; if(!songs.length){ ss.appendChild(el('div','font:500 11px Inter;color:rgba(255,255,255,.5)','No songs yet - generate one and it shows here.')); return; } songs.forEach(function(s){ var it=el('div','display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 0;border-top:1px solid rgba(255,255,255,.07)'); var lf=el('div','min-width:0;flex:1'); lf.appendChild(el('div','font:700 12px Inter;color:#fff','#'+s.song_id+(s.is_current?'   ▶ live':''))); if(s.title)lf.appendChild(el('div','font:500 10px Inter;color:rgba(255,255,255,.5);overflow:hidden;text-overflow:ellipsis;white-space:nowrap',s.title)); it.appendChild(lf); var b=el('button','cursor:pointer;border:1px solid rgba(159,233,189,.4);border-radius:8px;padding:6px 12px;font:700 11px Inter;color:#9fe9bd;background:rgba(62,207,106,.10)','Play'); b.onclick=function(){ try{ a.src='/api/voice/ref?id='+s.song_id; a.play(); if(window.__songReloadLyrics)window.__songReloadLyrics(); }catch(e){} }; it.appendChild(b); ss.appendChild(it); }); }).catch(function(){});

        // ===== NOW PLAYING - simple =====
        var np=section('▶ Now Playing');
        var lr=el('div','display:flex;align-items:center;justify-content:space-between;margin-bottom:9px');
        lr.appendChild(el('span','font:600 12px Inter;color:rgba(255,255,255,.85)','Lyrics on wall'));
        var lb=el('span','cursor:pointer;border:1px solid rgba(159,233,189,.4);border-radius:8px;padding:4px 11px;font:700 11px Inter'); function pl(){lb.textContent=lyricsOn?'ON':'OFF';lb.style.color=lyricsOn?'#9fe9bd':'#ff97a3';} pl(); lb.onclick=function(){window.__lyricsOnWall(!lyricsOn);pl();}; lr.appendChild(lb); np.appendChild(lr);
        np.appendChild(slider('Volume','',(a.volume||.55),0,1,.05,function(v){return Math.round(v*100)+'%';},function(v){a.volume=v;}));
        root.appendChild(np);

        // ===== ADVANCED (pro) - collapsed so the default stays usable =====
        var adv=el('div','margin:14px 0 4px;border:1px solid rgba(255,255,255,.12);border-radius:12px;background:rgba(20,24,32,.55);overflow:hidden');
        var advH=el('div','font:800 13px Inter;color:#fff;padding:12px;cursor:pointer;display:flex;justify-content:space-between;align-items:center'); advH.appendChild(el('span',null,'\u{1F39A} Advanced - mixer, EQ, plugins, lyrics')); var caret=el('span','color:#9fb4d8','▾'); advH.appendChild(caret); adv.appendChild(advH);
        var advBody=el('div','display:none;padding:0 12px 12px'); adv.appendChild(advBody);
        advH.onclick=function(){ var open=advBody.style.display==='none'; advBody.style.display=open?'block':'none'; caret.textContent=open?'▴':'▾'; };
        root.appendChild(adv);

        var pw=slider('Preference','0 = system   1 = your feel',0.5,0,1,.05,function(v){return (+v).toFixed(2);},function(v){ j('/api/daw/set',{method:'POST',body:JSON.stringify({knob:'preference_balance',value:String(v),scope:scope})}); });
        advBody.appendChild(el('div','font:700 11px Inter;color:#9fb4d8;letter-spacing:.08em;margin:6px 0','PREFERENCE')); advBody.appendChild(pw);

        var bs=el('div','margin-top:8px'); advBody.appendChild(bs);
        j('/api/daw/board?scope='+encodeURIComponent(scope)).then(function(d){ try{ var b=d.board||{}; if(b.PREFERENCE&&b.PREFERENCE.preference_balance){ pw._inp.value=b.PREFERENCE.preference_balance.value; pw._vv.textContent=pw._fmt(+pw._inp.value);} ['MIXER','EQ','DYNAMICS','MASTER','PLAYBACK'].forEach(function(cat){ if(!b[cat])return; var ch=el('div','margin:4px 0 10px'); ch.appendChild(el('div','font:700 11px Inter;color:#9fb4d8;letter-spacing:.08em;margin-bottom:6px',cat)); Object.keys(b[cat]).forEach(function(kn){ var rr=RANGES[kn]; var v=num(b[cat][kn].value); var unit=b[cat][kn].unit||''; var mn=rr?rr[0]:0,mx=rr?rr[1]:1,stp=rr?rr[2]:.05; ch.appendChild(slider(kn.replace(/_/g,' '),unit,v,mn,mx,stp,function(x){return (stp<1?(+x).toFixed(2):Math.round(x))+'';},function(x){ j('/api/daw/set',{method:'POST',body:JSON.stringify({knob:kn,value:String(x),scope:scope})}); })); }); bs.appendChild(ch); }); }catch(e){} }).catch(function(){});

        var pls=el('div','margin-top:8px'); pls.appendChild(el('div','font:700 11px Inter;color:#9fb4d8;letter-spacing:.08em;margin-bottom:4px','PLUGINS')); advBody.appendChild(pls);
        (function loadPlugins(){ pls.querySelectorAll('.pl-item').forEach(function(n){n.remove();}); j('/api/daw/plugins?scope='+encodeURIComponent(scope)).then(function(d){ var rack=d.rack||{}; Object.keys(rack).forEach(function(cat){ rack[cat].forEach(function(p){ var it=el('div','display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 0;border-top:1px solid rgba(255,255,255,.07)'); it.className='pl-item'; var lf=el('div','min-width:0'); lf.appendChild(el('div','font:700 12px Inter;color:#fff',p.name)); lf.appendChild(el('div','font:500 10px Inter;color:rgba(255,255,255,.5)',p.price)); it.appendChild(lf); var btn=el('button',''); var owned=p.installed; btn.textContent=owned?'Installed':(p.tier==='free'?'Add':'Subscribe'); btn.style.cssText='cursor:pointer;border:1px solid '+(owned?'rgba(159,233,189,.5)':'rgba(255,255,255,.2)')+';border-radius:9px;padding:7px 12px;font:700 11px Inter;color:'+(owned?'#9fe9bd':'#fff')+';background:'+(owned?'rgba(62,207,106,.12)':'rgba(255,255,255,.06)'); btn.onclick=function(){ btn.disabled=true; var lic=p.tier==='free'?'free':'subscribe'; var act=owned?'uninstall':'install'; j('/api/daw/plugin',{method:'POST',body:JSON.stringify({plugin_id:p.plugin_id,scope:scope,license:lic,action:act})}).then(function(){ loadPlugins(); }).catch(function(){ btn.disabled=false; }); }; it.appendChild(btn); pls.appendChild(it); }); }); }).catch(function(){}); })();

        var ls=el('div','margin-top:8px'); ls.appendChild(el('div','font:700 11px Inter;color:#9fb4d8;letter-spacing:.08em;margin-bottom:4px','LYRICS - edit a line')); advBody.appendChild(ls);
        j('/api/song/lyrics').then(function(d){ var L=(d&&(d.lines||d.lyrics_lines))||[]; if(typeof L==='string')L=L.split(/\r?\n/); L.filter(function(x){return x&&strip(x).length>1;}).slice(0,40).forEach(function(orig){ var inp=el('input','width:100%;box-sizing:border-box;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:7px;padding:6px 8px;color:#dbe4f0;font:500 11px Inter;margin:4px 0'); inp.value=orig; inp.onchange=function(){ if(inp.value===orig)return; inp.style.borderColor='#ffd479'; j('/api/song/lyrics_edit',{method:'POST',body:JSON.stringify({find:orig,replace:inp.value})}).then(function(r){ inp.style.borderColor=(r&&r.ok)?'#9fe9bd':'#ff97a3'; if(r&&r.ok&&window.__songReloadLyrics)window.__songReloadLyrics(); }).catch(function(){ inp.style.borderColor='#ff97a3'; }); }; ls.appendChild(inp); }); }).catch(function(){});

        host.appendChild(root);
      }catch(e){}
    }
    if(typeof window.openWindow==='function' && !window.__songWrap){ window.__songWrap=true; var _ow=window.openWindow; window.openWindow=function(st){ var r=_ow.apply(this,arguments); if(st&&st.k==='music'){ setTimeout(injectDAW,60); setTimeout(injectDAW,320); } return r; }; }
  }); }

  // OWNER-ONLY: activates for the CEO LISTENER only (admin@memelli.io). briggsmel1604=customer=client -> no DAW. Guests/clients see the normal scene.
  j('/api/song/view').then(function(o){ var r=(o&&o.listening_as)||''; window.__isAdmin=(r==='ceo'); if(r==='ceo'){ __activate(); } }).catch(function(){});
})();
