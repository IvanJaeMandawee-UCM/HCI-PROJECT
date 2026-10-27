

const roles=["Student","Programmer","Gamer"];
const typed=document.getElementById('typed');
let r=0,c=0,del=false;
(function type(){
  const w=roles[r];
  typed.textContent=w.slice(0,c);
  if(!del&&c<w.length){c++;setTimeout(type,90)}
  else if(!del){del=true;setTimeout(type,1200)}
  else if(c>0){c--;setTimeout(type,45)}
  else{del=false;r=(r+1)%roles.length;setTimeout(type,300)}
})();
//New add
//this newcomment is for testing the git hub
// scroll progress bar
const bar=document.getElementById('bar');
addEventListener('scroll',()=>{
  const h=document.documentElement.scrollHeight-innerHeight;
  bar.style.width=(scrollY/h*100)+'%';
},{passive:true});

// skill bars fill when scrolled into view
const io=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting){e.target.style.width=e.target.dataset.w+'%';io.unobserve(e.target)}
}),{threshold:.4});
document.querySelectorAll('.fill').forEach(f=>io.observe(f));

// optional auto tour: smooth scroll top to bottom in about 45 seconds
const btn=document.getElementById('tour');
let raf=null,start,from,dist;
const DURATION=45000;
function stop(){cancelAnimationFrame(raf);raf=null;btn.textContent='Play auto tour'}
function step(t){
  if(!start)start=t;
  const p=Math.min((t-start)/DURATION,1);
  scrollTo(0,from+dist*p);
  if(p<1&&raf)raf=requestAnimationFrame(step);else stop();
}
btn.addEventListener('click',()=>{
  if(raf){stop();return}
  document.documentElement.style.scrollBehavior='auto';
  from=scrollY;dist=document.documentElement.scrollHeight-innerHeight-from;start=null;
  btn.textContent='Pause tour';
  raf=requestAnimationFrame(step);
});
['wheel','touchstart','keydown'].forEach(ev=>addEventListener(ev,()=>{if(raf)stop()},{passive:true}));

// pixelated matte-yellow background that reacts to the cursor
(function(){
  const hero=document.querySelector('.hero'),cv=document.getElementById('px'),ctx=cv.getContext('2d');
  const S=16,still=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W,H,cols,rows,heat,mx=-999,my=-999,px=-999,py=-999,live=true,running=false;
  function size(){
    const r=hero.getBoundingClientRect();W=cv.width=r.width;H=cv.height=r.height;
    cols=Math.ceil(W/S);rows=Math.ceil(H/S);heat=new Float32Array(cols*rows);
  }
  function inject(x,y,k){
    const cx=x/S,cy=y/S,R=6;
    for(let j=Math.max(0,Math.floor(cy-R));j<Math.min(rows,cy+R);j++)
      for(let i=Math.max(0,Math.floor(cx-R));i<Math.min(cols,cx+R);i++){
        const d=Math.hypot(i+.5-cx,j+.5-cy);
        if(d<R)heat[j*cols+i]=Math.min(1,heat[j*cols+i]+k*(1-d/R));
      }
  }
  hero.addEventListener('pointermove',e=>{
    if(still)return;
    const r=hero.getBoundingClientRect();mx=e.clientX-r.left;my=e.clientY-r.top;
    const sp=Math.min(1,Math.hypot(mx-px,my-py)/40);
    if(px>-900){ // fill the gap between events so the trail is continuous
      const n=Math.ceil(Math.hypot(mx-px,my-py)/S)||1;
      for(let k=1;k<=n;k++)inject(px+(mx-px)*k/n,py+(my-py)*k/n,.12+.18*sp);
    }
    px=mx;py=my;
  },{passive:true});
  hero.addEventListener('pointerleave',()=>{px=py=-999});
  function start(){if(still){requestAnimationFrame(draw);return}if(!running){running=true;requestAnimationFrame(draw)}}
  new IntersectionObserver(es=>{live=es[0].isIntersecting;if(live)start()}).observe(hero);
  addEventListener('resize',size);

  function draw(t){
    if(!live){running=false;return}
    ctx.clearRect(0,0,W,H);
    for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
      const x=i*S+S/2,y=j*S+S/2;let a=0;
      for(let b=0;b<3;b++){ // slow drifting blobs
        const bx=W*(.5+.38*Math.sin(t*.00018+b*2.1)),by=H*(.5+.3*Math.cos(t*.00023+b*1.7)),
              d2=((x-bx)**2+(y-by)**2),sg=Math.min(W,H)*.28;
        a+=.2*Math.exp(-d2/(2*sg*sg));
      }
      const idx=j*cols+i;
      a+=heat[idx]*.55+Math.sin(i*12.9+j*78.2+t*.0016)*.025;
      a=Math.round(Math.max(0,Math.min(.5,a))*10)/10;
      if(a>0.04){ctx.fillStyle='rgba('+(window.__acc||'214,170,40')+','+a+')';ctx.fillRect(i*S,j*S,S-1,S-1)}
      heat[idx]*=.955;
    }
    if(!still)requestAnimationFrame(draw);
  }
  size();
  window.__px=still?()=>requestAnimationFrame(draw):null;
  start();
})();

// About bands fade in (opacity) when scrolled into view
(function(){
  const band=document.querySelector('.band');
  if(!band||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  band.classList.add('pre');
  new IntersectionObserver((es,o)=>es.forEach(e=>{
    if(e.isIntersecting){band.classList.remove('pre');o.unobserve(band)}
  }),{threshold:.25}).observe(band);
})();

// photo gallery: filter, flip cards, pop-up viewer
(function(){
  const wall=document.querySelector('.wall'),shots=[...wall.querySelectorAll('.shot')],
        fbtns=document.querySelectorAll('.filters button'),lb=document.getElementById('lb'),
        calm=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const vimg=lb.querySelector('.vimg img'),vtag=lb.querySelector('.vtxt i'),vh=lb.querySelector('h3'),vp=lb.querySelector('.vtxt p'),cnt=lb.querySelector('.cnt');
  let cur=0,list=shots;
  function pop(items){items.forEach((s,i)=>{s.classList.remove('pop');void s.offsetWidth;s.style.setProperty('--i',i);if(!calm)s.classList.add('pop')})}
  fbtns.forEach(b=>b.addEventListener('click',()=>{
    fbtns.forEach(x=>x.classList.toggle('on',x===b));
    const f=b.dataset.f;wall.classList.toggle('all',f==='all');
    shots.forEach(s=>s.classList.toggle('hide',f!=='all'&&s.dataset.cat!==f));
    list=shots.filter(s=>!s.classList.contains('hide'));pop(list);
  }));
  if(!calm){
    wall.classList.add('pre');
    new IntersectionObserver((es,o)=>{if(es[0].isIntersecting){wall.classList.remove('pre');pop(shots);o.disconnect()}},{threshold:.15}).observe(wall);
  }
  function open(i){
    cur=(i+list.length)%list.length;const s=list[cur];
    vimg.src=s.querySelector('.front img').src;vimg.alt=s.querySelector('.front img').alt;
    vtag.textContent=s.querySelector('.back i').textContent;
    vh.textContent=s.querySelector('.back b').textContent;
    vp.textContent=s.querySelector('.back .d').textContent;
    cnt.textContent=(cur+1)+' / '+list.length;
    const v=lb.querySelector('.viewer');v.style.animation='none';void v.offsetWidth;v.style.animation='';
    lb.classList.add('open');
  }
  function close(){lb.classList.remove('open')}
  shots.forEach(s=>s.addEventListener('click',()=>{
    s.classList.add('flip');                       // turn the card over, then pop up the story
    setTimeout(()=>{open(list.indexOf(s));s.classList.remove('flip')},calm?0:380);
  }));
  lb.querySelector('.x').onclick=close;
  lb.querySelector('.pv').onclick=()=>open(cur-1);
  lb.querySelector('.nx').onclick=()=>open(cur+1);
  lb.addEventListener('click',e=>{if(e.target===lb)close()});
  addEventListener('keydown',e=>{
    if(!lb.classList.contains('open'))return;
    if(e.key==='Escape')close();
    if(e.key==='ArrowLeft')open(cur-1);
    if(e.key==='ArrowRight')open(cur+1);
  });
})();

// ===== professional polish: nav, reveal, counters, tilt, cursor, extras =====
(function(){
  const calm=matchMedia('(prefers-reduced-motion: reduce)').matches,fine=matchMedia('(pointer:fine)').matches;
  const nav=document.querySelector('nav'),burger=nav.querySelector('.burger'),top=document.getElementById('top'),line=document.querySelector('.line');

  // nav: shrink on scroll, back-to-top, timeline progress
  let tk=false;
  function onScroll(){
    tk=false;
    nav.classList.toggle('scrolled',scrollY>30);
    top.classList.toggle('show',scrollY>700);
    if(line){const r=line.getBoundingClientRect();line.style.setProperty('--p',Math.max(0,Math.min(1,(innerHeight*.75-r.top)/r.height)))}
  }
  addEventListener('scroll',()=>{if(!tk){tk=true;requestAnimationFrame(onScroll)}},{passive:true});onScroll();
  top.onclick=()=>scrollTo({top:0,behavior:'smooth'});
  burger.onclick=()=>{const o=nav.classList.toggle('open');burger.setAttribute('aria-expanded',o)};
  nav.querySelectorAll('ul a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));

  // scrollspy
  const links=[...nav.querySelectorAll('ul a')];
  const spy=new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting)links.forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id));
  }),{rootMargin:'-45% 0px -50% 0px'});
  links.forEach(a=>{const s=document.querySelector(a.getAttribute('href'));if(s)spy.observe(s)});

  // staggered scroll reveal
  if(!calm){
    const cnt=new Map();
    document.querySelectorAll('section h2,.gal-sub,.filters,.skill,.tags,.item,.card,.tile,.links,.contact .big').forEach(el=>{
      const n=cnt.get(el.parentNode)||0;cnt.set(el.parentNode,n+1);
      el.style.setProperty('--d',Math.min(n,6)*90+'ms');el.classList.add('rv');
    });
    const rio=new IntersectionObserver((es,o)=>es.forEach(e=>{
      if(e.isIntersecting){e.target.classList.add('seen');o.unobserve(e.target);
        setTimeout(()=>e.target.classList.remove('rv','seen'),1300)}
    }),{threshold:.15});
    document.querySelectorAll('.rv').forEach(el=>rio.observe(el));
  }

  // skill percentages count up
  document.querySelectorAll('.skill').forEach(sk=>{
    const out=sk.querySelector('.top span:last-child'),to=parseInt(out.textContent);
    if(calm)return;out.textContent='0%';
    new IntersectionObserver((es,o)=>{if(es[0].isIntersecting){o.disconnect();
      const t0=performance.now();(function f(t){const p=Math.min((t-t0)/1400,1);
        out.textContent=Math.round(to*(1-Math.pow(1-p,3)))+'%';if(p<1)requestAnimationFrame(f)})(t0)}},{threshold:.6}).observe(sk);
  });

  if(fine&&!calm){
    // 3D tilt on achievement cards
    document.querySelectorAll('.card').forEach(c=>{
      c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
        c.style.transform='perspective(700px) rotateX('+(-y*8)+'deg) rotateY('+(x*10)+'deg) translateY(-4px)'});
      c.addEventListener('pointerleave',()=>c.style.transform='');
    });
    // magnetic buttons
    document.querySelectorAll('.btn').forEach(b=>{
      b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();
        b.style.translate=((e.clientX-r.left-r.width/2)*.18)+'px '+((e.clientY-r.top-r.height/2)*.3)+'px'});
      b.addEventListener('pointerleave',()=>b.style.translate='');
    });
    // trailing cursor ring
    const ring=document.createElement('div');ring.className='ring';document.body.appendChild(ring);
    let rx=0,ry=0,tx=0,ty=0;
    addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY;ring.classList.add('on');
      ring.classList.toggle('big',!!e.target.closest('a,button,.shot,.card'))},{passive:true});
    document.addEventListener('pointerleave',()=>ring.classList.remove('on'));
    (function loop(){rx+=(tx-rx)*.18;ry+=(ty-ry)*.18;ring.style.transform='translate('+rx+'px,'+ry+'px) translate(-50%,-50%)';requestAnimationFrame(loop)})();
    // portrait parallax
    const pt=document.querySelector('.portrait');
    document.querySelector('.hero').addEventListener('pointermove',e=>{
      pt.style.translate=((e.clientX/innerWidth-.5)*-18)+'px '+((e.clientY/innerHeight-.5)*-18)+'px'},{passive:true});
  }

  // copy email
  const toast=document.getElementById('toast');
  document.querySelector('.copy').addEventListener('click',async()=>{
    const m='ivanjaemandawe@gmail.com';
    try{await navigator.clipboard.writeText(m)}catch(e){prompt('Copy this email:',m);return}
    toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1800);
  });
})();

// ===== theme picker: change the 3 main colors =====
(function(){
  const root=document.documentElement,btn=document.querySelector('.theme-btn'),panel=document.querySelector('.theme-panel'),
        box=document.querySelector('.presets'),iBg=document.getElementById('c-bg'),iPn=document.getElementById('c-pn'),iAc=document.getElementById('c-ac');
  const P=[
    {n:'Classic Gold',bg:'#161616',pn:'#222224',ac:'#e8b923'},
    {n:'Midnight Blue',bg:'#0f141f',pn:'#172033',ac:'#4fa3ff'},
    {n:'Forest',bg:'#101611',pn:'#18221a',ac:'#4cc38a'},
    {n:'Crimson',bg:'#171011',pn:'#241719',ac:'#ff5d6c'},
    {n:'Violet',bg:'#130f1b',pn:'#1d1628',ac:'#a98bff'},
    {n:'Sunset',bg:'#18120f',pn:'#271c16',ac:'#ff8a3d'}];
  const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
  const hex=a=>'#'+a.map(v=>Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0')).join('');
  const mix=(a,b,t)=>{const x=rgb(a),y=rgb(b);return hex(x.map((v,i)=>v*(1-t)+y[i]*t))};
  function apply(t,save){
    const set=(k,v)=>root.style.setProperty(k,v);
    set('--black',t.bg);set('--charcoal',t.pn);set('--graphite',mix(t.pn,'#ffffff',.08));
    set('--gray2',mix(t.pn,'#ffffff',.2));set('--gray3',mix(t.pn,'#ffffff',.15));
    set('--gold',t.ac);set('--gold-dim',mix(t.ac,'#000000',.22));set('--acc',rgb(t.ac).join(','));
    set('--matte',mix(mix(t.ac,'#6f6f6f',.25),'#000000',.08));set('--matte2',mix(t.ac,'#6f6f6f',.15));
    set('--glint',mix(t.ac,'#ffffff',.35));set('--deep',mix(t.ac,'#000000',.5));
    window.__acc=rgb(mix(t.ac,'#000000',.1)).join(',');
    if(window.__px)window.__px();
    iBg.value=t.bg;iPn.value=t.pn;iAc.value=t.ac;
    box.querySelectorAll('button').forEach((b,i)=>b.classList.toggle('on',P[i].bg===t.bg&&P[i].pn===t.pn&&P[i].ac===t.ac));
    if(save){try{localStorage.setItem('ijm-theme',JSON.stringify(t))}catch(e){}}
  }
  P.forEach(t=>{
    const b=document.createElement('button');b.type='button';
    b.innerHTML='<span class="sw"><s style="background:'+t.bg+'"></s><s style="background:'+mix(t.pn,'#ffffff',.2)+'"></s><s style="background:'+t.ac+'"></s></span>'+t.n;
    b.onclick=()=>apply(t,true);box.appendChild(b);
  });
  [iBg,iPn,iAc].forEach(i=>i.addEventListener('input',()=>apply({bg:iBg.value,pn:iPn.value,ac:iAc.value},true)));
  panel.querySelector('.reset').onclick=()=>apply(P[0],true);
  btn.addEventListener('click',e=>{e.stopPropagation();panel.hidden=!panel.hidden;btn.setAttribute('aria-expanded',!panel.hidden)});
  document.addEventListener('click',e=>{if(!panel.hidden&&!e.target.closest('.theme')){panel.hidden=true;btn.setAttribute('aria-expanded','false')}});
  addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){panel.hidden=true;btn.setAttribute('aria-expanded','false')}});
  let saved=null;try{saved=JSON.parse(localStorage.getItem('ijm-theme'))}catch(e){}
  apply(saved&&saved.bg?saved:P[0],false);
})();

// achievements banner: reveal the metrics one by one
(function(){
  const t=document.querySelector('.trophy');if(!t)return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){t.classList.add('go');return}
  new IntersectionObserver((es,o)=>{if(es[0].isIntersecting){t.classList.add('go');o.disconnect()}},{threshold:.3}).observe(t);
})();
