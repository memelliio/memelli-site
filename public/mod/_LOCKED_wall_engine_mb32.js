;(function(){try{window.__look=JSON.parse(localStorage.getItem('memelli_look')||'{}')||{};}catch(e){window.__look={};}window.__hexrgb=function(h){h=String(h||'#f53343').replace('#','');if(h.length===3)h=h.charAt(0)+h.charAt(0)+h.charAt(1)+h.charAt(1)+h.charAt(2)+h.charAt(2);var n=parseInt(h,16)||0;return [((n>>16)&255)/255,((n>>8)&255)/255,(n&255)/255];};})();
;(function(){
  /* [bar_mel 2026-06-20] PARTICLE RENDER WALL restored — red morph field, 110k particles, NO logo/crown, NO video (both pushed aside). window.__scene = the control surface the admin master panel programs: setSpin(speed) / setDensity(size) / setMorph / setGlow(blur/brightness). */
  var canvas=document.getElementById('scene'); if(!canvas) return;
  var gl=canvas.getContext('webgl2',{preserveDrawingBuffer:true}); if(!gl) return;
  var NL=String.fromCharCode(10);
  var vsSrc='#version 300 es'+NL+'in vec3 aSeed;'+NL+'uniform float uTime;'+NL+'uniform float uMorph;'+NL+'uniform float uCell;'+NL+'out float vSeed;'+NL+'void main(){'+NL+'vec2 p=aSeed.xy;float ang=uTime*0.06;vec2 c=p-0.5;vec2 rp=vec2(c.x*cos(ang)-c.y*sin(ang),c.x*sin(ang)+c.y*cos(ang))+0.5;vec2 jit=(vec2(fract(sin(aSeed.z*127.1)*43758.5453),fract(sin(aSeed.z*311.7+1.3)*24634.6))-0.5)*0.04;vec2 scatter=vec2(sin(aSeed.z*53.0+uTime*0.7),cos(aSeed.z*97.0+uTime*0.6))*0.6;vec2 amb=vec2(sin(uTime*0.9+aSeed.z*31.0),cos(uTime*1.1+aSeed.z*29.0))*0.02;vec2 off=scatter+jit+amb;vec2 d=fract(rp+off*(1.0-uMorph));gl_Position=vec4(d*2.0-1.0,0,1);gl_PointSize=uCell*(0.28+0.72*uMorph);vSeed=aSeed.z;}';
  /* [bar_mel 2026-06-20] TWO COLORS: uColor=base (red), uColor2=flash (white); uMix = fraction of particles that are color2 (the white flash). No additive blending so each stays its own pure color (red is red, white is white). */
  /* [bar_mel 2026-06-20] COLOR group: uColor/uC1Amt = color1+amount, uColor2/uMix = color2+amount(fraction), uGrad+uCount = gradient on/off + color count. Pure per-particle (no additive). */
  var fsSrc='#version 300 es'+NL+'precision highp float;'+NL+'in float vSeed;'+NL+'uniform float uTime;'+NL+'uniform vec3 uColor;'+NL+'uniform vec3 uColor2;'+NL+'uniform float uMix;'+NL+'uniform float uC1Amt;'+NL+'uniform float uGrad;'+NL+'uniform float uCount;'+NL+'out vec4 outColor;'+NL+'void main(){'+NL+'float d=length(gl_PointCoord-vec2(0.5))*2.0;float a=smoothstep(1.0,0.0,d);vec3 c1=uColor*uC1Amt;vec3 dCol=mix(c1,uColor2,step(1.0-uMix,vSeed));vec3 gCol=mix(c1,uColor2,clamp(floor(vSeed*uCount)/max(1.0,uCount-1.0),0.0,1.0));vec3 col=mix(dCol,gCol,step(0.5,uGrad));float aa=a*0.95;outColor=vec4(col*aa,aa);}';
  /* [bar_mel 2026-06-20] SAFETY NET: surface shader compile/link errors on-screen (no more silent blank) */
  function __err(k,m){try{var dd=document.createElement('div');dd.style.cssText='position:fixed;left:8px;top:8px;z-index:99999;background:rgba(60,0,0,.95);color:#fff;font:11px/1.4 monospace;padding:8px 10px;max-width:92vw;white-space:pre-wrap;border:1px solid #f55';dd.textContent='WALL SHADER '+k+' ERROR:\n'+String(m||'');document.body.appendChild(dd);}catch(e){}}
  function cS(t,s){var sh=gl.createShader(t);gl.shaderSource(sh,s);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS)){__err((t===gl.VERTEX_SHADER?'vertex compile':'fragment compile'),gl.getShaderInfoLog(sh));return null;}return sh;}
  var vS=cS(gl.VERTEX_SHADER,vsSrc),fS=cS(gl.FRAGMENT_SHADER,fsSrc); if(!(vS&&fS)) return;
  var prog=gl.createProgram(); gl.attachShader(prog,vS); gl.attachShader(prog,fS); gl.linkProgram(prog); if(!gl.getProgramParameter(prog,gl.LINK_STATUS)){ __err('link',gl.getProgramInfoLog(prog)); return; } gl.useProgram(prog);
  /* [bar_mel 2026-06-20] SOLID = a FILLED GRID (every cell occupied) so morph=1 is a COMPLETE solid (no gaps); morph=0 scatters each dot off its cell into the spread. aSeed.xy = grid home, aSeed.z = per-particle random (scatter dir + sparkle). */
  var cnt=400000; var GW=Math.ceil(Math.sqrt(cnt*(innerWidth/Math.max(1,innerHeight)))); var GH=Math.ceil(cnt/GW); var data=new Float32Array(cnt*3); for(var i=0;i<cnt;i++){ data[i*3]=((i%GW)+0.5)/GW; data[i*3+1]=((Math.floor(i/GW))+0.5)/GH; data[i*3+2]=Math.random(); }
  var buf=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buf); gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
  var aLoc=gl.getAttribLocation(prog,'aSeed'); var uTime=gl.getUniformLocation(prog,'uTime'); var uMorph=gl.getUniformLocation(prog,'uMorph'); var uCell=gl.getUniformLocation(prog,'uCell'); var uColor=gl.getUniformLocation(prog,'uColor'); var uColor2=gl.getUniformLocation(prog,'uColor2'); var uMix=gl.getUniformLocation(prog,'uMix'); var uC1Amt=gl.getUniformLocation(prog,'uC1Amt'); var uGrad=gl.getUniformLocation(prog,'uGrad'); var uCount=gl.getUniformLocation(prog,'uCount'); var uFlash=gl.getUniformLocation(prog,'uFlash');
  /* [bar_mel 2026-06-20] NORMAL alpha blend (not additive) so overlapping red stays SOLID RED instead of piling up into pink/white */
  /* [bar_mel 2026-06-20] PREMULTIPLIED-ALPHA = stable live compositing (kills co-location flicker) while staying ONE field; color stays color, motion stays motion */
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
  /* [bar_mel 2026-06-20] CELL-RELATIVE dot size (ported from the video dissolve): cell = fill spacing for cnt dots over the canvas, so each round dot fills its cell -> solid with NO black holes, scales at any screen size. */
  var cellVal=3.0; function resize(){var r=Math.min(2,devicePixelRatio);canvas.width=innerWidth*r;canvas.height=innerHeight*r;gl.viewport(0,0,canvas.width,canvas.height);cellVal=2.1*Math.sqrt((canvas.width*canvas.height)/cnt);} resize(); addEventListener('resize',resize);
  var __spin=1,__density=1,__morph=0,__auto=1; var __c1=[0.85,0.11,0.17],__c2=[1.0,1.0,1.0],__mix=0.0,__c1amt=1.0,__grad=0.0,__count=3.0,__flash=0.0; function __hx(h){h=String(h||'').replace('#','');if(h.length===3)h=h.charAt(0)+h.charAt(0)+h.charAt(1)+h.charAt(1)+h.charAt(2)+h.charAt(2);var n=parseInt(h,16)||0;return [((n>>16)&255)/255,((n>>8)&255)/255,(n&255)/255];}
  window.__scene={setSpin:function(v){__spin=+v;},setDensity:function(v){__density=Math.max(0.05,Math.min(1,+v));},setMorph:function(v){__auto=0;__morph=Math.max(0,Math.min(1,+v));},setGlow:function(v){canvas.style.filter='brightness('+Math.max(0,Math.min(2,+v))+')';},setColor1:function(h){__c1=__hx(h);},setColor2:function(h){__c2=__hx(h);},setColor1Amt:function(v){__c1amt=Math.max(0,Math.min(2,+v));},setColor2Mix:function(v){__mix=Math.max(0,Math.min(1,+v));},setGradient:function(on){__grad=on?1.0:0.0;},setGradientCount:function(n){__count=Math.max(2,Math.min(12,Math.round(+n)));},setFlash:function(v){__flash=Math.max(0,Math.min(1,+v));},play:function(){__auto=1;},get state(){return __morph<0.02?1:(__morph>0.98?3:2);},get morph(){return __morph;}};
  /* [bar_mel 2026-06-20] DELTA-TIME loop: __vt += dt*__spin drives BOTH uTime and the morph cycle -> speed changes are smooth (rate, not phase jump) and morph+shimmer share one rate. */
  var __vt=0,__last=0;
  (function render(ts){ if(!ts)ts=performance.now(); if(!__last)__last=ts; var dt=(ts-__last)*0.001; if(dt>0.1)dt=0.1; __last=ts; __vt+=dt*__spin; var T=__vt;
    if(__auto){ /* [bar_mel 2026-06-20] RESOLVE-IN: one-time ramp 0->1 over ~3.2s then HOLD 1.0 = a true crisp solid (uMorph=1, no scatter). Ambient life is a separate tiny shimmer in the shader (does NOT lower solidity) — so it lands and STAYS solid, never an oscillating loop. */
      __morph = (T<3.2) ? (0.5-0.5*Math.cos((T/3.2)*Math.PI)) : 1.0; }
    gl.clearColor(0,0,0,1); gl.clear(gl.COLOR_BUFFER_BIT); gl.useProgram(prog); gl.uniform1f(uTime,T); gl.uniform1f(uMorph,__morph); gl.uniform1f(uCell,cellVal); gl.uniform3f(uColor,__c1[0],__c1[1],__c1[2]); gl.uniform3f(uColor2,__c2[0],__c2[1],__c2[2]); gl.uniform1f(uMix,__mix); gl.uniform1f(uC1Amt,__c1amt); gl.uniform1f(uGrad,__grad); gl.uniform1f(uCount,__count); gl.uniform1f(uFlash,__flash); gl.bindBuffer(gl.ARRAY_BUFFER,buf); gl.enableVertexAttribArray(aLoc); gl.vertexAttribPointer(aLoc,3,gl.FLOAT,false,0,0); gl.drawArrays(gl.POINTS,0,Math.round(cnt*__density)); requestAnimationFrame(render);
  })();
})();
(function(){var c=document.getElementById("scene-text");if(!c)return;var gl=c.getContext("webgl2",{alpha:true,premultipliedAlpha:true});if(!gl)return;var NL=String.fromCharCode(10);function cS(t,s){var sh=gl.createShader(t);gl.shaderSource(sh,s);gl.compileShader(sh);return gl.getShaderParameter(sh,gl.COMPILE_STATUS)?sh:null;}var vs="#version 300 es"+NL+"in vec2 aPos;uniform float uScale;uniform float uAspect;void main(){vec2 p=aPos*uScale;p.x*=uAspect;gl_Position=vec4(p,0.0,1.0);gl_PointSize=2.3;}";var fs="#version 300 es"+NL+"precision mediump float;uniform float uGlow;uniform vec3 uColor;out vec4 o;void main(){float d=length(gl_PointCoord-vec2(0.5))*2.0;float a=smoothstep(1.0,0.0,d);o=vec4(uColor,a*0.92*uGlow);}";var v=cS(gl.VERTEX_SHADER,vs),f=cS(gl.FRAGMENT_SHADER,fs);if(!(v&&f))return;var prog=gl.createProgram();gl.attachShader(prog,v);gl.attachShader(prog,f);gl.linkProgram(prog);if(!gl.getProgramParameter(prog,gl.LINK_STATUS))return;var aPos=gl.getAttribLocation(prog,"aPos"),uScale=gl.getUniformLocation(prog,"uScale"),uAspect=gl.getUniformLocation(prog,"uAspect"),uGlow=gl.getUniformLocation(prog,"uGlow"),uColor=gl.getUniformLocation(prog,"uColor");var buf=gl.createBuffer();var N=0,sc=0.8,gw=1.0;function rz(){var r=Math.min(2,devicePixelRatio||1);c.width=innerWidth*r;c.height=innerHeight*r;gl.viewport(0,0,c.width,c.height);}rz();addEventListener("resize",rz);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);function build(str,desc){str=(str||"").trim();desc=(desc||"").trim();if(!str){N=0;return;}var off=document.createElement("canvas");off.width=1024;off.height=256;var x=off.getContext("2d");x.clearRect(0,0,1024,256);x.fillStyle="#fff";x.textAlign="center";x.textBaseline="middle";if(desc){var fz=118;x.font="800 "+fz+"px Inter,system-ui,sans-serif";while(x.measureText(str).width>980&&fz>16){fz-=4;x.font="800 "+fz+"px Inter,system-ui,sans-serif";}x.fillText(str,512,90);var dz=44;x.font="500 "+dz+"px Inter,system-ui,sans-serif";while(x.measureText(desc).width>980&&dz>12){dz-=2;x.font="500 "+dz+"px Inter,system-ui,sans-serif";}x.fillText(desc,512,184);}else{var fz=150;x.font="800 "+fz+"px Inter,system-ui,sans-serif";while(x.measureText(str).width>980&&fz>16){fz-=4;x.font="800 "+fz+"px Inter,system-ui,sans-serif";}x.fillText(str,512,128);}var im=x.getImageData(0,0,1024,256).data;var pts=[];for(var yy=0;yy<256;yy+=2){for(var xx=0;xx<1024;xx+=2){if(im[(yy*1024+xx)*4+3]>128){pts.push((xx-512)/512,-(yy-128)/512);}}}N=pts.length/2;gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(pts),gl.STATIC_DRAW);}(function loop(){gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);if(N>0){gl.useProgram(prog);gl.uniform1f(uScale,sc);gl.uniform1f(uAspect,c.height/c.width);gl.uniform1f(uGlow,(window.__look&&window.__look.glow!=null)?+window.__look.glow:gw);var _lc=(window.__hexrgb&&window.__look&&window.__look.color)?window.__hexrgb(window.__look.color):[0.96,0.2,0.26];gl.uniform3f(uColor,_lc[0],_lc[1],_lc[2]);gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.enableVertexAttribArray(aPos);gl.vertexAttribPointer(aPos,2,gl.FLOAT,false,0,0);gl.drawArrays(gl.POINTS,0,N);}requestAnimationFrame(loop);})();window.__text={render:function(s,d){build(s,d);},setSize:function(val){sc=+val;},setGlow:function(val){gw=+val;}};})();
;(function() {
  'use strict';
  if (window.__drOn) return;
  const params = new URLSearchParams(location.search);
  /* default home */
  window.__drOn = true;

  function init() {
    // Constants
    const PHASE_REST = 4800;
    const PHASE_DISSOLVE = 1400;
    const PHASE_SCATTERED = 1000;
    const PHASE_REFORM = 2200;
    const CYCLE_TOTAL = PHASE_REST + PHASE_DISSOLVE + PHASE_SCATTERED + PHASE_REFORM;

    // State
    let particles = [];

    // Helpers
    function hash(i) {
      let x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
      return x - Math.floor(x);
    }

    function smoothstep(p) {
      return p * p * (3 - 2 * p);
    }

    function getCoverSourceRect(videoWidth, videoHeight, containerWidth, containerHeight) {
      const scale = Math.max(containerWidth / videoWidth, containerHeight / videoHeight);
      const sWidth = containerWidth / scale;
      const sHeight = containerHeight / scale;
      return {
        sx: (videoWidth - sWidth) / 2,
        sy: (videoHeight - sHeight) / 2,
        sWidth,
        sHeight
      };
    }

    // Layer A: TWO persistent videos - smooth two-scene dissolve, no reload flash
    var vurl = params.get('vid') || 'https://storage.googleapis.com/deep-inference-results/veo-3.1-fast-generate-001/728584615678765176/sample_0.mp4';
    var SCENES = [ (params.get('vid') ? ('/api/video/proxy?url=' + encodeURIComponent(vurl)) : '/api/video/proxy?url=' + encodeURIComponent(vurl)), '/api/video/clip?id=memelli_video_test' ];
    function mkVideo(src){
      var v=document.createElement('video');
      v.muted=true; v.loop=true; v.autoplay=true; v.playsInline=true; v.defaultMuted=true;
      v.setAttribute('muted',''); v.setAttribute('loop',''); v.setAttribute('autoplay',''); v.setAttribute('playsinline','');
      v.crossOrigin='anonymous'; v.preload='auto'; v.src=src;
      Object.assign(v.style,{position:'fixed',left:'0',top:'0',width:'100vw',height:'100vh',objectFit:'cover',zIndex:'1',opacity:'0',transition:'none'});
      document.body.appendChild(v); v.play().catch(function(){}); return v;
    }
    var vids=[ mkVideo(SCENES[0]), mkVideo(SCENES[1]) ]; window.__setVid=function(u){ if(!u)return; var p='/api/video/proxy?url='+encodeURIComponent(u); vids.forEach(function(v){ try{v.src=p;v.load();v.play().catch(function(){});}catch(e){} }); };
    var cur=0; vids[0].style.opacity='1';
    var resumePlay=function(){ vids.forEach(function(v){ v.play().catch(function(){}); }); };
    document.addEventListener('click',resumePlay);
    document.addEventListener('pointerdown',resumePlay);

    // Layer B: dissolve particle canvas
    var canvas=document.createElement('canvas'); canvas.id='drfx';
    Object.assign(canvas.style,{position:'fixed',left:'0',top:'0',width:'100vw',height:'100vh',zIndex:'2',pointerEvents:'none'});
    document.body.appendChild(canvas);
    var ctx=canvas.getContext('2d',{alpha:true});
    function resizeCanvas(){ canvas.width=window.innerWidth; canvas.height=window.innerHeight; }
    resizeCanvas(); window.addEventListener('resize',resizeCanvas);

    // sample a video element's current frame -> fine particle grid (full screen)
    var GW=480, GH=270, STEP=2; var _doff=document.createElement('canvas');_doff.width=GW;_doff.height=GH;var _doctx=_doff.getContext('2d',{willReadFrequently:true});
    function sampleVideo(v){
      if(v.readyState<2 || v.videoWidth===0 || v.videoHeight===0){ return []; }
      var off=_doff;
      var octx=_doctx;
      var r=getCoverSourceRect(v.videoWidth,v.videoHeight,GW,GH);
      octx.drawImage(v,r.sx,r.sy,r.sWidth,r.sHeight,0,0,GW,GH);
      var d; try{ d=octx.getImageData(0,0,GW,GH).data; }catch(e){ return []; }
      var pts=[];
      for(var gy=0; gy<GH; gy+=STEP){
        for(var gx=0; gx<GW; gx+=STEP){
          var i=(gy*GW+gx)*4, rr=d[i],gg=d[i+1],bb=d[i+2];
          if(rr+gg+bb<14) continue;
          var idx=gy*GW+gx, ang=hash(idx)*6.2831853;
          pts.push({gx:gx,gy:gy,r:rr,g:gg,b:bb,ca:Math.cos(ang),sa:Math.sin(ang),df:0.08+hash(idx+9999)*0.16});
        }
      }
      return pts;
    }

    // draw particles: p=0 formed (full image) -> p=1 fully scattered. small ROUND dots
    function draw(pts,p){
      if(!pts.length) return;
      var cw=canvas.width/GW, ch=canvas.height/GH, cell=Math.min(cw,ch)*STEP;
      var rad=Math.max(0.6, cell*(0.5+0.35*p)*((window.__look&&window.__look.size!=null&&+window.__look.size)||(window.__render&&+window.__render.size)||1)), scatter=Math.min(canvas.width,canvas.height), TAU=6.2831853; var __deepinfraBIND=window.__render||{}; try{ctx.globalAlpha=Math.max(0.45,Math.min(1,(+__deepinfraBIND.opacity||0.92)*(0.6+0.55*((+__deepinfraBIND.intensity||0.8)-0.6))));}catch(e){}
      for(var i=0;i<pts.length;i++){
        var pt=pts[i];
        var x=pt.gx*cw+cw/2 + pt.ca*pt.df*scatter*p;
        var y=pt.gy*ch+ch/2 + pt.sa*pt.df*scatter*p;
        ctx.fillStyle='rgb('+pt.r+','+pt.g+','+pt.b+')';
        ctx.beginPath(); ctx.arc(x,y,rad,0,TAU); ctx.fill();
      }
    }

    var partsOut=[], partsIn=[], builtOut=false, builtIn=false, lastCycle=-1;
    function animate(now){
      var _sp=((window.__look&&+window.__look.speed)||1); if(window.__lt==null)window.__lt=now; window.__vt=(window.__vt||0)+(now-window.__lt)*_sp; window.__lt=now; var _T=window.__vt;
      var cyc=Math.floor(_T/CYCLE_TOTAL);
      if(lastCycle<0) lastCycle=cyc;
      if(cyc!==lastCycle){ lastCycle=cyc; cur=(cur+1)%vids.length; builtOut=false; builtIn=false; partsOut=[]; partsIn=[]; }
      var t=_T % CYCLE_TOTAL, nxt=(cur+1)%vids.length;
      ctx.clearRect(0,0,canvas.width,canvas.height);
      if(t < PHASE_REST){
        vids[cur].style.opacity='1'; vids[nxt].style.opacity='0';
      } else if(t < PHASE_REST+PHASE_DISSOLVE){
        if(!builtOut){ partsOut=sampleVideo(vids[cur]); builtOut=true; }
        var p=smoothstep((t-PHASE_REST)/PHASE_DISSOLVE);
        if(partsOut.length){ vids[cur].style.opacity=(1-p).toString(); draw(partsOut,p); } else { vids[cur].style.opacity='1'; }
      } else if(t < PHASE_REST+PHASE_DISSOLVE+PHASE_SCATTERED){
        vids[cur].style.opacity='0'; vids[nxt].style.opacity='0';
        if(!builtIn){ partsIn=sampleVideo(vids[nxt]); builtIn=true; }
        if(partsIn.length) draw(partsIn,1); else if(partsOut.length) draw(partsOut,1);
      } else {
        var pr=smoothstep((t-(PHASE_REST+PHASE_DISSOLVE+PHASE_SCATTERED))/PHASE_REFORM);
        if(partsIn.length){ vids[nxt].style.opacity=pr.toString(); if(pr<0.99) draw(partsIn,1-pr); } else { vids[nxt].style.opacity='1'; }
      }
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }

  /* [bar_mel 2026-06-20] never let a background error abort scene.js — openWindow (the one shell) MUST always define */
  function __safeInit(){ /* [bar_mel 2026-06-20] video dissolve test PUSHED ASIDE — code kept (init defined) but NOT run; the particle wall is the live background now */ }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', __safeInit);
  } else {
    __safeInit();
  }
})();
;(function(){
  if(window.__dock)return; window.__dock=1;
  var RED='rgba(214,30,46,';
  /* [bar_mel 2026-06-20] step dock DELETED (not hidden — no stacked dead code). No horizontal step buttons exist at all. On-screen controls = the right-side vertical auth tabs only (#sutab/#sitab). openWindow (below) stays so the Sign Up tab opens the transparent window; journey steps to be placed later per Mel. */

  var z=40, open={};
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  /* [bar_mel 2026-06-20] MASTER CONTROLS panel — per-window, drives window.__scene (the wall). Built on the UNIVERSAL two-way-bar primitive. */
  function renderLook(bd){
    bd.innerHTML='';
    var SC=window.__scene||{setSpin:function(){},setDensity:function(){},setGlow:function(){},setMorph:function(){}};
    var w=document.createElement('div'); w.style.cssText='max-width:380px;margin:0 auto;width:100%;color:#fff;font:13px Inter,system-ui,sans-serif';
    var h=document.createElement('div'); h.textContent='Master Controls'; h.style.cssText='font:800 16px Inter,system-ui;letter-spacing:.03em;margin:0 0 3px';
    var sub=document.createElement('div'); sub.textContent='this window · drives the particle wall'; sub.style.cssText='font:10px Inter;letter-spacing:.07em;text-transform:uppercase;color:rgba(255,255,255,.5);margin-bottom:18px';
    w.appendChild(h); w.appendChild(sub);
    var bars=[];
    /* UNIVERSAL CONTROL PRIMITIVE = two-way bar. compact single thumb; toggle flips one-way<->two-way (ping-pong from..to). state {from,to,direction,rest,scope}. no reverse-duplication. */
    function twoWayBar(cfg){
      var min=cfg.min,max=cfg.max,step=cfg.step||0.01;
      var rest=(cfg.value!=null?cfg.value:min), from=(cfg.from!=null?cfg.from:min), to=(cfg.to!=null?cfg.to:max);
      var dir=cfg.direction||'fwd', bidir=false, raf=null, t0=0, period=cfg.periodMs||4000;
      var row=document.createElement('div'); row.style.cssText='margin-bottom:13px';
      var head=document.createElement('div'); head.style.cssText='display:flex;justify-content:space-between;align-items:center;margin-bottom:5px';
      var lab=document.createElement('span'); lab.textContent=cfg.label; lab.style.cssText='font:10px Inter;letter-spacing:.07em;text-transform:uppercase;color:rgba(255,255,255,.62)';
      var rightw=document.createElement('span'); rightw.style.cssText='display:flex;align-items:center;gap:8px';
      var val=document.createElement('span'); val.style.cssText='font:10px Inter;color:#ff97a3;min-width:30px;text-align:right';
      var tog=document.createElement('span'); tog.textContent='1-way'; tog.title='toggle one-way / two-way (ping-pong)'; tog.style.cssText='cursor:pointer;font:9px Inter;letter-spacing:.05em;text-transform:uppercase;color:#9fe9bd;border:1px solid rgba(159,233,189,0.4);border-radius:8px;padding:2px 7px';
      rightw.appendChild(val); rightw.appendChild(tog); head.appendChild(lab); head.appendChild(rightw);
      var inp=document.createElement('input'); inp.type='range'; inp.min=min; inp.max=max; inp.step=step; inp.value=rest; inp.style.cssText='width:100%;accent-color:#c41e3a';
      row.appendChild(head); row.appendChild(inp);
      function applyV(v){ cfg.apply(+v); val.textContent=(+v).toFixed(2); }
      if(!cfg.skipInit) applyV(rest); else val.textContent='auto';
      inp.oninput=function(){ if(bidir) return; rest=+inp.value; applyV(rest); };
      function anim(ts){ if(!t0)t0=ts; var p=(((ts-t0)/period)%1); var tri=p<0.5?p*2:(1-(p-0.5)*2); var base=(dir==='fwd')?tri:(1-tri); var v=from+(to-from)*base; inp.value=v; applyV(v); raf=requestAnimationFrame(anim); }
      tog.onclick=function(){ bidir=!bidir; if(bidir){ tog.textContent='2-way'; tog.style.color='#ff97a3'; tog.style.borderColor='rgba(255,151,163,0.5)'; t0=0; raf=requestAnimationFrame(anim); } else { if(raf)cancelAnimationFrame(raf); raf=null; tog.textContent='1-way'; tog.style.color='#9fe9bd'; tog.style.borderColor='rgba(159,233,189,0.4)'; rest=+inp.value; applyV(rest); } };
      return { el:row, key:cfg.key, state:function(){ return {from:from,to:to,direction:bidir?dir:'one-way',rest:rest,scope:null}; } };
    }
    /* [bar_mel 2026-06-20] Master Controls TABS: Motion + Colors. Colors is its own tab; color 2 = white = the flash, on its own slide bar (same primitive). */
    var tabrow=document.createElement('div'); tabrow.style.cssText='display:flex;gap:8px;margin-bottom:16px';
    var panel=document.createElement('div');
    function mkTab(name){ var b=document.createElement('button'); b.type='button'; b.textContent=name; b.style.cssText='flex:1;cursor:pointer;border:1px solid rgba(255,255,255,0.16);border-radius:9px;padding:7px 4px;font:700 11px Inter,system-ui;letter-spacing:.06em;text-transform:uppercase;color:#fff;background:rgba(255,255,255,0.06)'; return b; }
    var tMotion=mkTab('Motion'), tColors=mkTab('Colors'); tabrow.appendChild(tMotion); tabrow.appendChild(tColors); w.appendChild(tabrow); w.appendChild(panel);
    function sel(b){ [tMotion,tColors].forEach(function(x){x.style.background='rgba(255,255,255,0.06)';x.style.borderColor='rgba(255,255,255,0.16)';}); b.style.background='rgba(196,30,58,0.32)'; b.style.borderColor='#c41e3a'; }
    function showMotion(){ sel(tMotion); panel.innerHTML=''; [
        twoWayBar({key:'speed',label:'Speed',min:0,max:4,step:0.05,value:1,from:0,to:4,apply:function(v){SC.setSpin(v);}}),
        twoWayBar({key:'size',label:'Size',min:0.05,max:1,step:0.01,value:1,from:0.05,to:1,apply:function(v){SC.setDensity(v);}}),
        twoWayBar({key:'glow',label:'Blur / Glow',min:0,max:2,step:0.05,value:1,from:0,to:2,apply:function(v){SC.setGlow(v);}}),
        twoWayBar({key:'morph',label:'Morph (million → solid)',min:0,max:1,step:0.01,value:1,from:0,to:1,direction:'fwd',skipInit:true,apply:function(v){SC.setMorph(v);}})
      ].forEach(function(b){ panel.appendChild(b.el); }); }
    function colorRow(label,val,onset){ var d=document.createElement('div'); d.style.cssText='display:flex;align-items:center;justify-content:space-between;margin-bottom:13px'; var l=document.createElement('span'); l.textContent=label; l.style.cssText='font:10px Inter;letter-spacing:.07em;text-transform:uppercase;color:rgba(255,255,255,.62)'; var c=document.createElement('input'); c.type='color'; c.value=val; c.style.cssText='width:54px;height:28px;border:1px solid rgba(255,255,255,.2);border-radius:8px;background:none;cursor:pointer'; c.oninput=function(){ onset(c.value); }; d.appendChild(l); d.appendChild(c); return d; }
    function toggleRow(label,on,onset){ var d=document.createElement('div'); d.style.cssText='display:flex;align-items:center;justify-content:space-between;margin-bottom:13px'; var l=document.createElement('span'); l.textContent=label; l.style.cssText='font:10px Inter;letter-spacing:.07em;text-transform:uppercase;color:rgba(255,255,255,.62)'; var b=document.createElement('span'); var st=!!on; b.style.cssText='cursor:pointer;font:9px Inter;letter-spacing:.05em;border:1px solid;border-radius:8px;padding:2px 10px'; function paint(){ b.textContent=st?'ON':'OFF'; b.style.color=st?'#ff97a3':'#9fe9bd'; b.style.borderColor=st?'rgba(255,151,163,0.5)':'rgba(159,233,189,0.4)'; } paint(); b.onclick=function(){ st=!st; paint(); onset(st); }; d.appendChild(l); d.appendChild(b); return d; }
    function showColors(){ sel(tColors); panel.innerHTML='';
      panel.appendChild(colorRow('Color 1','#d91c2c',function(h){SC.setColor1&&SC.setColor1(h);}));
      panel.appendChild(twoWayBar({key:'c1amt',label:'Color 1 amount',min:0,max:2,step:0.01,value:1,from:0,to:2,apply:function(v){SC.setColor1Amt&&SC.setColor1Amt(v);}}).el);
      panel.appendChild(colorRow('Color 2','#ffffff',function(h){SC.setColor2&&SC.setColor2(h);}));
      panel.appendChild(twoWayBar({key:'c2amt',label:'Color 2 amount',min:0,max:1,step:0.01,value:0,from:0,to:1,apply:function(v){SC.setColor2Mix&&SC.setColor2Mix(v);}}).el);
      panel.appendChild(toggleRow('Gradient',false,function(on){SC.setGradient&&SC.setGradient(on);}));
      panel.appendChild(twoWayBar({key:'gcount',label:'Gradient colors',min:2,max:8,step:1,value:3,from:2,to:8,apply:function(v){SC.setGradientCount&&SC.setGradientCount(v);}}).el);
    }
    tMotion.onclick=showMotion; tColors.onclick=showColors; showMotion();
    bd.appendChild(w);
  }
    function renderBackground(bd){bd.innerHTML='';var w=document.createElement('div');w.style.cssText='max-width:340px;margin:0 auto;width:100%;color:#fff;font:13px Inter,system-ui';var l=document.createElement('label');l.textContent='Background video URL';l.style.cssText='display:block;font:10px Inter;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.6);margin-bottom:6px';var inp=document.createElement('input');inp.type='text';inp.placeholder='https://...mp4';inp.style.cssText='width:100%;box-sizing:border-box;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.22);border-radius:9px;padding:9px 11px;color:#fff;font-size:12.5px;outline:none';var go=document.createElement('button');go.type='button';go.textContent='Load background';go.style.cssText='width:100%;border:none;border-radius:10px;padding:10px;margin-top:10px;background:#c41e3a;color:#fff;font:700 13px Inter;cursor:pointer';var msg=document.createElement('div');msg.style.cssText='min-height:16px;margin-top:8px;font:12px Inter;color:#9fe9bd';go.onclick=function(){var u=inp.value.trim();if(!u){msg.style.color='#ffb3bb';msg.textContent='Paste a video URL.';return;}if(window.__setVid){window.__setVid(u);msg.style.color='#9fe9bd';msg.textContent='Background updated.';}else{msg.style.color='#ffb3bb';msg.textContent='Video layer not ready.';}};w.appendChild(l);w.appendChild(inp);w.appendChild(go);w.appendChild(msg);bd.appendChild(w);}
    function renderCustomers(bd){bd.innerHTML='<div style="opacity:.7">Loading customers...</div>';fetch('/api/customers',{credentials:'include'}).then(function(r){return r.json();}).then(function(j){var list=(j&&(j.customers||j.rows||j.data))||(Array.isArray(j)?j:[]);var w=document.createElement('div');w.style.cssText='color:#fff;font:13px Inter,system-ui';var srch=document.createElement('input');srch.type='text';srch.placeholder='Search customers...';srch.style.cssText='width:100%;box-sizing:border-box;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.22);border-radius:9px;padding:9px 11px;color:#fff;margin-bottom:10px;outline:none';var ul=document.createElement('div');function paint(qq){ul.innerHTML='';list.filter(function(c){var s=JSON.stringify(c).toLowerCase();return !qq||s.indexOf(qq.toLowerCase())>=0;}).slice(0,100).forEach(function(c){var row=document.createElement('div');row.style.cssText='padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.08)';var nm=(c.name||c.full_name||c.email||c.id||'customer').toString();row.textContent=nm.slice(0,50)+(c.email&&c.email!==nm?(' - '+c.email):'');ul.appendChild(row);});if(!ul.children.length)ul.innerHTML='<div style="opacity:.6;padding:8px">No matches.</div>';}srch.oninput=function(){paint(srch.value);};w.appendChild(srch);w.appendChild(ul);bd.innerHTML='';bd.appendChild(w);paint('');}).catch(function(){bd.innerHTML='<div style="opacity:.7">Could not load customers.</div>';});}
    function renderSignup(bd,startMode){
    var mode='signup';
    function field(label,id,type){ var d=document.createElement('div'); d.style.cssText='margin-bottom:6px'; var l=document.createElement('label'); l.textContent=label; l.style.cssText='display:block;font:9px Inter,system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.6);margin-bottom:3px'; var i=document.createElement('input'); i.type=type||'text'; i.style.cssText='width:100%;box-sizing:border-box;background:rgba(255,255,255,0.10);border:1px solid rgba(255,255,255,0.22);border-radius:9px;padding:8px 10px;color:#fff;font-size:12.5px;outline:none'; d.appendChild(l); d.appendChild(i); d._in=i; return d; }
    bd.innerHTML='';
    /* [bar_mel 2026-06-20] ~50% translucent card so the form + fields are clearly visible but you still see the wall/videos through it */
    var wrap=document.createElement('div'); wrap.style.cssText='max-width:340px;margin:0 auto;width:100%;background:rgba(12,14,22,0.5);border:1px solid rgba(255,255,255,0.18);border-radius:16px;padding:26px 24px;box-shadow:0 24px 70px rgba(0,0,0,0.45);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)';
    var h=document.createElement('div'); h.style.cssText='font:800 16px Inter,system-ui,sans-serif;color:#fff;text-align:center;margin:0 0 3px';
    var sub=document.createElement('div'); sub.style.cssText='color:rgba(255,255,255,.72);font:12px Inter,system-ui,sans-serif;text-align:center;margin-bottom:14px';
    var fName=field('Full name','name'),fEmail=field('Email','email','email'),fPhone=field('Phone','phone','tel'),fPass=field('Password','password','password');
    var go=document.createElement('button'); go.style.cssText='width:100%;border:none;border-radius:10px;padding:9px;margin-top:6px;background:'+RED+'1);color:#fff;font:700 13px Inter,system-ui,sans-serif;cursor:pointer';
    var msg=document.createElement('div'); msg.style.cssText='min-height:16px;margin-top:8px;text-align:center;font:12px Inter,system-ui,sans-serif;color:#ffb3bb';
    var alt=document.createElement('a'); alt.style.cssText='display:block;text-align:center;margin-top:10px;color:rgba(255,255,255,.8);font:12px Inter,system-ui,sans-serif;cursor:pointer;text-decoration:underline';
    function setMode(m){ mode=m; msg.textContent=''; if(m==='login'){ h.textContent='Welcome back'; sub.textContent='Sign in to your account.'; fName.style.display='none'; fPhone.style.display='none'; go.textContent='Sign in'; alt.textContent='New here? Create account'; } else { h.textContent='Create your account'; sub.textContent='One account - credit, funding, and business.'; fName.style.display=''; fPhone.style.display=''; go.textContent='Create account'; alt.textContent='Already have one? Sign in'; } }
    alt.onclick=function(e){ e.preventDefault(); setMode(mode==='signup'?'login':'signup'); };
    go.onclick=function(){ go.disabled=true; msg.style.color='#ffb3bb'; msg.textContent=mode==='login'?'Signing in...':'Creating...'; var em=fEmail._in.value.trim(), pw=fPass._in.value, url, b; if(mode==='login'){ url='/api/auth/login'; b={email:em,password:pw}; } else { url='/api/signup'; b={name:fName._in.value.trim(),email:em,phone:fPhone._in.value.trim(),password:pw}; } fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify(b)}).then(function(r){return r.json();}).then(function(j){ go.disabled=false; if(j&&(j.ok||j.success||j.user||j.session||j.token)){ msg.style.color='#9be59b'; msg.textContent=mode==='login'?'Signed in.':'Account created.'; setTimeout(function(){ location.reload(); },800); } else { msg.style.color='#ffb3bb'; msg.textContent=(j&&(j.error||j.message))||'Please try again.'; } }).catch(function(){ go.disabled=false; msg.style.color='#ffb3bb'; msg.textContent='Connection error.'; }); };
    wrap.appendChild(h); wrap.appendChild(sub); wrap.appendChild(fName); wrap.appendChild(fEmail); wrap.appendChild(fPhone); wrap.appendChild(fPass); wrap.appendChild(go); wrap.appendChild(msg); wrap.appendChild(alt);
    bd.appendChild(wrap); setMode(startMode||'signup');
  }
  /* [bar_mel 2026-06-20] REAL dock = horizontal taskbar strip across the TOP; hidden when empty, same logged in or out */
  function mwTaskbar(){ var tb=document.getElementById('mw-taskbar'); if(!tb){ tb=document.createElement('div'); tb.id='mw-taskbar'; tb.style.cssText='position:fixed;top:0;left:0;right:0;z-index:56;display:none;flex-direction:row;flex-wrap:wrap;gap:8px;align-items:center;padding:6px 10px;background:rgba(10,12,20,0.62);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border-bottom:1px solid rgba(255,255,255,0.12)'; document.body.appendChild(tb); } return tb; }
  function openWindow(st){
    /* [bar_mel 2026-06-20] ONE universal shell — every open reuses the SAME full-size adjustable window; content swaps in. Never spawn another window. */
    if(open.shell){ var ww=open.shell; ww.style.display='flex'; ww.style.zIndex=++z; ww.__ttl.textContent=st.label||''; var wb=ww.__cw; wb.style.display='block'; wb.style.alignItems=''; wb.style.justifyContent=''; wb.innerHTML=''; renderInto(wb,st); if(ww.__fit)ww.__fit(); return; }
    var w=document.createElement('div'); w.id='mw-shell'; open.shell=w;
    var prev=null;
    /* full size = same as the background; adjustable via drag + resize handles + green button */
    /* [bar_mel 2026-06-20] NO backdrop blur — the particle wall + dissolve videos stay clearly visible through the shell; only a light scrim for form legibility */
    w.style.cssText='position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:'+(++z)+';background:rgba(10,12,18,0.22);border:1px solid rgba(255,255,255,0.16);display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 70px rgba(0,0,0,0.45)';
    // header
    var hd=document.createElement('div'); hd.style.cssText='display:flex;align-items:center;justify-content:space-between;padding:11px 14px;background:rgba(255,255,255,0.05);cursor:move;color:#fff;font:700 13.5px Inter,system-ui,sans-serif;user-select:none;flex:0 0 auto';
    var dot=document.createElement('span'); dot.style.cssText='display:inline-block;width:9px;height:9px;border-radius:50%;background:'+RED+'1);margin-right:9px;vertical-align:middle';
    var ttl=document.createElement('span'); ttl.textContent=st.label;
    var left=document.createElement('div'); left.style.cssText='display:flex;align-items:center'; left.appendChild(dot); left.appendChild(ttl);
    /* [bar_mel 2026-06-20] per-window Master Controls entry in the header */
    var mcLbl=document.createElement('span'); mcLbl.textContent='⚙ Controls'; mcLbl.title='Master Controls for this window'; mcLbl.style.cssText='cursor:pointer;margin-left:14px;font:600 11px Inter,system-ui,sans-serif;letter-spacing:.05em;color:#9fe9bd;border:1px solid rgba(159,233,189,0.4);border-radius:8px;padding:2px 9px';
    mcLbl.onmousedown=function(e){e.stopPropagation();}; mcLbl.onclick=function(e){e.stopPropagation(); if(window.openWindow) window.openWindow({k:'look',label:'Master Controls'}); }; left.appendChild(mcLbl);
    var ctr=document.createElement('div'); ctr.style.cssText='display:flex;gap:8px;align-items:center';
    function ctrl(sym,bg,fn){ var b=document.createElement('span'); b.style.cssText='cursor:pointer;width:13px;height:13px;border-radius:50%;background:'+bg+''; b.onmousedown=function(e){e.stopPropagation();}; b.onclick=function(e){e.stopPropagation();fn();}; return b; }
    var minB=ctrl('–','#f5c451',function(){ w.style.display='none'; var tb=mwTaskbar(); tb.style.display='flex';
      if(w.__item) return; /* one dock item per window */
      var item=document.createElement('div'); item.style.cssText='display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.18);border-radius:10px;padding:5px 9px;font:600 12px Inter,system-ui,sans-serif;color:#fff';
      var lbl=document.createElement('span'); lbl.textContent=(w.__ttl&&w.__ttl.textContent)||st.label||'Window'; lbl.style.cssText='cursor:pointer;white-space:nowrap'; lbl.onclick=function(){ w.style.display='flex'; w.style.zIndex=++z; };
      function idot(bg,fn){ var b=document.createElement('span'); b.style.cssText='cursor:pointer;width:11px;height:11px;border-radius:50%;background:'+bg; b.onclick=function(e){e.stopPropagation();fn();}; return b; }
      var openD=idot('#3ecf6a',function(){ w.style.display='flex'; w.style.zIndex=++z; });   /* open/restore */
      var minD=idot('#f5c451',function(){ w.style.display='none'; });                          /* keep minimized */
      var closeD=idot('#ff5f57',function(){ w.style.display='none'; if(item.parentNode)item.parentNode.removeChild(item); w.__item=null; if(!tb.children.length)tb.style.display='none'; }); /* close */
      item.appendChild(lbl); item.appendChild(openD); item.appendChild(minD); item.appendChild(closeD);
      tb.appendChild(item); w.__item=item; });
    var maxB=ctrl('□','#3ecf6a',function(){ if(prev){ w.style.left=prev.l;w.style.top=prev.t;w.style.width=prev.w;w.style.height=prev.h;prev=null; } else { prev={l:w.style.left,t:w.style.top,w:w.style.width,h:w.style.height}; w.style.left='2vw';w.style.top='2vh';w.style.width='96vw';w.style.height='92vh'; } });
    var closeB=ctrl('✕','#ff5f57',function(){ if(w.__pill&&w.__pill.parentNode)w.__pill.parentNode.removeChild(w.__pill); w.style.display='none'; });
    ctr.appendChild(minB); ctr.appendChild(maxB); ctr.appendChild(closeB);
    hd.appendChild(left); hd.appendChild(ctr);
    // body
    // [bar_mel 2026-06-20] body = clip viewport; CONTENT lives in a scale-to-fit STAGE so EVERYTHING (form, video, anything) resizes WITH the window
    var bd=document.createElement('div'); bd.style.cssText='flex:1;overflow:hidden;position:relative;color:#eee;font:14px Inter,system-ui,sans-serif;line-height:1.55';
    var cw=document.createElement('div'); cw.id='mw-cw'; cw.style.cssText='position:absolute;top:0;left:0;transform-origin:top left;display:block;overflow:auto;box-sizing:border-box;padding:18px';
    bd.appendChild(cw);
    w.appendChild(hd); w.appendChild(bd); w.__ttl=ttl; w.__bd=bd; w.__cw=cw;
    var BASE={w:0,h:0};
    function fit(){ if(!BASE.w){ BASE.w=bd.clientWidth||window.innerWidth; BASE.h=bd.clientHeight||window.innerHeight; cw.style.width=BASE.w+'px'; cw.style.height=BASE.h+'px'; } var s=Math.min(bd.clientWidth/BASE.w, bd.clientHeight/BASE.h)||1; cw.style.transform='scale('+s+')'; }
    w.__fit=fit;
    if(window.ResizeObserver){ try{ new ResizeObserver(function(){ fit(); }).observe(bd); }catch(e){} }
    // resize handles - all sides + corners
    var dirs=[['n','top:0;left:8px;right:8px;height:6px;cursor:ns-resize'],['s','bottom:0;left:8px;right:8px;height:6px;cursor:ns-resize'],['e','top:8px;bottom:8px;right:0;width:6px;cursor:ew-resize'],['w','top:8px;bottom:8px;left:0;width:6px;cursor:ew-resize'],['ne','top:0;right:0;width:12px;height:12px;cursor:nesw-resize'],['nw','top:0;left:0;width:12px;height:12px;cursor:nwse-resize'],['se','bottom:0;right:0;width:14px;height:14px;cursor:nwse-resize'],['sw','bottom:0;left:0;width:12px;height:12px;cursor:nesw-resize']];
    var rz=[];
    dirs.forEach(function(d){ var h=document.createElement('div'); h.style.cssText='position:absolute;z-index:5;'+d[1]; h.dataset.dir=d[0]; w.appendChild(h); rz.push(h);
      h.addEventListener('mousedown',function(e){ e.preventDefault();e.stopPropagation(); var sx=e.clientX,sy=e.clientY,r=w.getBoundingClientRect(),dir=d[0];
        function mv(ev){ var dxp=ev.clientX-sx,dyp=ev.clientY-sy,nl=r.left,nt=r.top,nw=r.width,nh=r.height;
          if(dir.indexOf('e')>=0)nw=Math.max(300,r.width+dxp); if(dir.indexOf('s')>=0)nh=Math.max(200,r.height+dyp);
          if(dir.indexOf('w')>=0){nw=Math.max(300,r.width-dxp);nl=r.left+(r.width-nw);} if(dir.indexOf('n')>=0){nh=Math.max(200,r.height-dyp);nt=r.top+(r.height-nh);}
          w.style.width=nw+'px';w.style.height=nh+'px';w.style.left=nl+'px';w.style.top=nt+'px'; }
        function up(){document.removeEventListener('mousemove',mv);document.removeEventListener('mouseup',up);}
        document.addEventListener('mousemove',mv);document.addEventListener('mouseup',up); });
    });
    document.body.appendChild(w);
    w.addEventListener('mousedown',function(){ w.style.zIndex=++z; });
    // free drag (loose bounds - keep ~30px on screen)
    var dx,dy,drag=false;
    hd.addEventListener('mousedown',function(e){ drag=true; dx=e.clientX-w.offsetLeft; dy=e.clientY-w.offsetTop; e.preventDefault(); });
    document.addEventListener('mousemove',function(e){ if(!drag)return; w.style.left=clamp(e.clientX-dx,-(w.offsetWidth-60),window.innerWidth-60)+'px'; w.style.top=clamp(e.clientY-dy,0,window.innerHeight-40)+'px'; });
    document.addEventListener('mouseup',function(){ drag=false; });
    // load content (robust: timeout + retry)
    function load(){ bd.innerHTML='<div style="opacity:0.65;display:flex;align-items:center;gap:10px"><span style="width:14px;height:14px;border:2px solid rgba(255,255,255,0.3);border-top-color:'+RED+'1);border-radius:50%;display:inline-block;animation:mwspin .7s linear infinite"></span>Connecting to Memelli...</div>';
      var ctl=new AbortController(); var to=setTimeout(function(){ctl.abort();},35000);
      fetch('/api/memelli_bar/brain',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:st.msg,session_uid:'win_'+st.k}),signal:ctl.signal})
        .then(function(r){return r.json();}).then(function(j){ clearTimeout(to); var t=(j&&(j.reply||j.answer))||(st.label+' is ready.'); bd.innerHTML='<div style="white-space:pre-wrap">'+String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</div>'; })
        .catch(function(){ clearTimeout(to); bd.innerHTML='<div style="opacity:0.8">Couldn\'t reach the bar. <span style="color:'+RED+'1);cursor:pointer;text-decoration:underline" onclick="this.closest(\'div\').parentNode.__retry()">Retry</span></div>'; bd.__retry=load; }); }
    renderInto(cw,st); fit();
  }
  function renderInto(bd,st){
    if(st.k==='signup'){ bd.style.display='flex'; bd.style.alignItems='center'; bd.style.justifyContent='center'; bd.style.overflow='hidden'; renderSignup(bd, st.mode); }
    else if(st.k==='look'){ renderLook(bd); }
    else if(st.k==='background'){ renderBackground(bd); }
    else if(st.k==='customers'){ renderCustomers(bd); }
    else { bd.__retry=function(){renderInto(bd,st);}; bd.innerHTML='<div style="opacity:0.65;display:flex;align-items:center;gap:10px"><span style="width:14px;height:14px;border:2px solid rgba(255,255,255,0.3);border-top-color:'+RED+'1);border-radius:50%;display:inline-block;animation:mwspin .7s linear infinite"></span>Connecting to Memelli...</div>'; var ctl=new AbortController(); var to=setTimeout(function(){ctl.abort();},35000); fetch('/api/memelli_bar/brain',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:st.msg,session_uid:'win_'+st.k}),signal:ctl.signal}).then(function(r){return r.json();}).then(function(j){ clearTimeout(to); var t=(j&&(j.reply||j.answer))||(st.label+' is ready.'); bd.innerHTML='<div style="white-space:pre-wrap">'+String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</div>'; }).catch(function(){ clearTimeout(to); bd.innerHTML='<div style="opacity:0.8">Could not reach the bar.</div>'; }); }
  }
  if(!document.getElementById('mw-style')){ var s=document.createElement('style'); s.id='mw-style'; s.textContent='@keyframes mwspin{to{transform:rotate(360deg)}}'; document.head.appendChild(s); }
  window.openWindow=openWindow;
})();
;(function(){ if(window.__renderRead)return; window.__renderRead=1;
  function pull(){ fetch('/api/render_state',{cache:'no-store'}).then(function(r){return r.json();}).then(function(j){ try{ var h=j&&j.uniforms&&j.uniforms.home; if(h){ window.__render=(typeof h==='string')?JSON.parse(h):h; } }catch(e){} }).catch(function(){}); }
  pull(); setInterval(pull, 4000);
})();
