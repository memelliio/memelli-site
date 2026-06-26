(function(){
  /* [autonomous 2026-06-23] STORE + CART = its OWN universal window (openWindow {k:'store'}), same design.
     Live prices only: plans from /api/funnel/plans, offerings from /api/shop/catalog, a-la-carte business
     services quoted live via /api/cart_quote (ceo_resolve_price). Add -> /api/cart_add (server cart row).
     Checkout -> /cart/checkout?id=<cart_id> (route_cart_checkout: Stripe retail-only, monthly subs, reseller
     not charged). Nothing hardcoded; nothing thrown on the page. */
  function esc(x){return String(x==null?'':x).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function money(c){ c=Number(c)||0; return '$'+(c/100).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}); }
  var ALACARTE=['Business Tradeline','Business Setup & EIN','Business Phone System','Business Website (DFY)','SEO Services'];
  var IN='style="margin-top:6px;background:linear-gradient(135deg,#c41e3a,#ff5f6d);border:0;color:#fff;font-weight:800;border-radius:10px;padding:8px 16px;cursor:pointer;font-family:inherit;font-size:12.5px"';
  function getCartId(){ try{ return localStorage.getItem('mio_cart_id')||''; }catch(e){ return ''; } }
  function setCartId(v){ try{ localStorage.setItem('mio_cart_id',v); }catch(e){} }
  function getCart(){ try{ return JSON.parse(localStorage.getItem('mio_cart')||'[]'); }catch(e){ return []; } }
  function setCart(a){ try{ localStorage.setItem('mio_cart',JSON.stringify(a)); }catch(e){} }

  function itemRow(name,desc,price_cents,billing,key){
    var per=(billing==='month')?'<span style="font-size:10px;color:#7e8cad">/mo</span>':'';
    return '<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;padding:11px 0;border-top:1px solid rgba(255,255,255,.08)">'
      +'<div style="flex:1"><div style="font-weight:700;font-size:13.5px">'+esc(name)+'</div>'+(desc?'<div style="font-size:11px;color:#7e8cad;line-height:1.3">'+esc(desc)+'</div>':'')+'</div>'
      +'<div style="text-align:right"><div style="font-weight:800;color:#ffd479;font-size:13.5px">'+money(price_cents)+per+'</div>'
      +'<button class="st_add" data-key="'+esc(key)+'" data-name="'+esc(name)+'" data-cents="'+price_cents+'" '+IN+'>Add</button></div></div>';
  }
  function cartSummary(bd){
    var c=getCart(); var box=bd.querySelector('#st_cart'); if(!box)return;
    if(!c.length){ box.innerHTML='<div style="font-size:12px;color:#7e8cad;padding:8px 0">Your cart is empty.</div>'; return; }
    var total=c.reduce(function(a,i){return a+(Number(i.cents)||0)*(i.qty||1);},0);
    box.innerHTML='<div style="font-weight:800;font-size:14px;margin:6px 0">Cart</div>'
      +c.map(function(i){return '<div style="display:flex;justify-content:space-between;font-size:12.5px;padding:4px 0;color:#dfe6f5"><span>'+esc(i.name)+(i.qty>1?(' &times;'+i.qty):'')+'</span><span>'+money((i.cents||0)*(i.qty||1))+'</span></div>';}).join('')
      +'<div style="display:flex;justify-content:space-between;font-weight:800;border-top:1px solid rgba(255,255,255,.12);margin-top:6px;padding-top:8px"><span>Total</span><span style="color:#ffd479">'+money(total)+'</span></div>'
      +'<button id="st_checkout" style="width:100%;margin-top:12px;background:linear-gradient(135deg,#c41e3a,#ff5f6d);border:0;color:#fff;font-weight:800;border-radius:11px;padding:12px;cursor:pointer;font-family:inherit">Checkout</button>'
      +'<div id="st_msg" style="font-size:12px;color:#9fb0d0;margin-top:8px;min-height:14px"></div>';
    var co=box.querySelector('#st_checkout'); if(co)co.onclick=function(){ doCheckout(bd); };
  }
  function addItem(bd,btn){
    var name=btn.getAttribute('data-name'), key=btn.getAttribute('data-key'), cents=+btn.getAttribute('data-cents');
    btn.disabled=true; btn.textContent='Adding…';
    var body={product_key:key,qty:1}; var cid=getCartId(); if(cid)body.cart_id=cid;
    fetch('/api/cart_add',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
      .then(function(r){return r.json();}).then(function(j){
        if(j&&(j.cart_id!=null))setCartId(String(j.cart_id));
        var serverCents=(j&&(j.price_cents!=null))?j.price_cents:cents; // trust server resolve
        var c=getCart(); var ex=c.filter(function(i){return i.name===name;})[0];
        if(ex)ex.qty=(ex.qty||1)+1; else c.push({name:name,key:key,cents:serverCents,qty:1});
        setCart(c); cartSummary(bd);
        btn.disabled=false; btn.textContent='Added ✓'; setTimeout(function(){btn.textContent='Add';},1100);
      }).catch(function(){ btn.disabled=false; btn.textContent='Add'; });
  }
  function doCheckout(bd){
    var msg=bd.querySelector('#st_msg'); var cid=getCartId();
    if(!cid){ if(msg){msg.style.color='#ffd479';msg.textContent='Add something first.';} return; }
    if(msg){msg.style.color='#9fb0d0';msg.textContent='Opening secure checkout…';}
    try{ localStorage.removeItem('mio_cart'); }catch(e){}
    location.href='/cart/checkout?id='+encodeURIComponent(cid);
  }

  window.__winRender=window.__winRender||{};
  window.__winRender.store=function(bd,st){
    bd.innerHTML='<div style="opacity:.7;padding:20px">Loading store…</div>';
    Promise.all([
      fetch('/api/shop/catalog',{credentials:'include'}).then(function(r){return r.json();}).catch(function(){return{};}),
      fetch('/api/funnel/plans',{credentials:'include'}).then(function(r){return r.json();}).catch(function(){return{};}),
      Promise.all(ALACARTE.map(function(n){return fetch('/api/cart_quote',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({product_key:n,qty:1})}).then(function(r){return r.json();}).catch(function(){return null;});}))
    ]).then(function(R){
      var offerings=((R[0]&&R[0].products)||[]).filter(function(p){return Number(p.price_cents)>0;});
      var plans=((R[1]&&R[1].ladder)||[]).filter(function(p){return p.price&&p.price!=='$0';});
      var ala=(R[2]||[]).map(function(q,i){ return q&&q.ok?{name:ALACARTE[i],cents:q.price_cents}:null; }).filter(Boolean);
      var h='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><div style="font-weight:800;font-size:19px">Store</div></div>';
      h+='<div style="font-size:12px;color:#9fb0d0;margin-bottom:10px">Everything à la carte — plans, credit products, and business services. Add and check out securely.</div>';
      // Membership plans
      if(plans.length){ h+='<div style="font-weight:800;color:#e11d2a;font-size:12px;letter-spacing:.05em;text-transform:uppercase;margin-top:8px">Membership Plans</div>';
        h+=plans.map(function(p){ var cents=Math.round(parseFloat(String(p.price).replace(/[^0-9.]/g,''))*100); return itemRow(p.name,(p.unlocks||[]).join(' · '),cents,(p.per==='month'?'month':''),p.name); }).join(''); }
      // À la carte business services (live-quoted)
      if(ala.length){ h+='<div style="font-weight:800;color:#e11d2a;font-size:12px;letter-spacing:.05em;text-transform:uppercase;margin-top:16px">Business Services</div>';
        h+=ala.map(function(a){ return itemRow(a.name,'',a.cents,(a.name.indexOf('Phone')>=0?'month':''),a.name); }).join(''); }
      // Credit products / offerings
      if(offerings.length){ h+='<div style="font-weight:800;color:#e11d2a;font-size:12px;letter-spacing:.05em;text-transform:uppercase;margin-top:16px">Credit Products</div>';
        h+=offerings.map(function(o){ return itemRow(o.name,o.description,o.price_cents,o.billing,o.name); }).join(''); }
      h+='<div id="st_cart" style="margin-top:18px;border-top:2px solid rgba(255,255,255,.14);padding-top:10px"></div>';
      bd.innerHTML=h;
      Array.prototype.forEach.call(bd.querySelectorAll('.st_add'),function(b){ b.onclick=function(){ addItem(bd,b); }; });
      cartSummary(bd);
    });
  };
})();
