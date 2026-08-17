document.body.classList.add('loaded');
const hdr=document.querySelector('header');
const dark=[...document.querySelectorAll('.output,.inquire,.marquee,footer,.process,.band')];
addEventListener('scroll',()=>{
  hdr.classList.toggle('solid',scrollY>40);
  const y=hdr.getBoundingClientRect().bottom;
  hdr.classList.toggle('dark-ctx',dark.some(el=>{const r=el.getBoundingClientRect();return r.top<y&&r.bottom>y}));
},{passive:true});

const tog=document.querySelector('.menu-toggle'),nv=document.getElementById('mainnav');
tog.addEventListener('click',()=>{const o=nv.classList.toggle('open');hdr.classList.toggle('nav-open',o);tog.setAttribute('aria-expanded',o);tog.textContent=o?'Close':'Menu'});
nv.addEventListener('click',e=>{if(e.target.tagName==='A'){nv.classList.remove('open');hdr.classList.remove('nav-open');tog.textContent='Menu'}});

const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}}),{rootMargin:'0px 0px -6% 0px',threshold:.06});
document.querySelectorAll('.rv').forEach(el=>io.observe(el));

// fit the hero headline to its container, whatever the font ends up being
const mega=document.querySelector('.mega');
function fitMega(){
  if(!mega)return;
  const wrap=mega.parentElement, cs=getComputedStyle(wrap);
  const avail=wrap.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
  const BASE=100;
  mega.style.fontSize=BASE+'px';
  let widest=0;
  mega.querySelectorAll('.ln i').forEach(el=>{
    const r=document.createRange(); r.selectNodeContents(el);
    widest=Math.max(widest,r.getBoundingClientRect().width);
  });
  if(!widest)return;
  const size=Math.max(34,Math.min(190,(avail*0.995)/widest*BASE));
  mega.style.fontSize=size+'px';
}
fitMega();
addEventListener('resize',fitMega);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fitMega);
addEventListener('load',fitMega);

// ── instagram-style post viewer ─────────────────
const POSTS=[
  {
    tab:'Beyond Brokers',
    client:'Beyond Brokers Consulting',
    title:"What's a move actually worth?",
    body:'Three slides built from one agent’s real production numbers. The cover asks the question, the second answers it, and the third shows the referral network behind the answer.',
    tag:'#recruiting #realestate #brandmarketing',
    meta:'Instagram carousel · 1080 × 1350',
    ratio:'4/5',
    slides:[
      {src:'assets/post-bb-1.jpg',alt:'Carousel cover asking what a move is actually worth'},
      {src:'assets/post-bb-2.jpg',alt:'Slide showing sales volume nearly doubled, up 95 percent'},
      {src:'assets/post-bb-3.jpg',alt:'Slide showing 21 agents recruited in Nashville'}
    ]
  },
  {
    tab:'Waterford Court',
    client:'Realogics Sotheby’s International Realty',
    title:'Waterford Court, Kirkland',
    body:'A listing carousel cut from the same shoot as the printed feature booklet. Cover, three feature slides with one line of copy each, and a particulars slide that closes it.',
    tag:'#kirklandrealestate #listingmarketing',
    meta:'Instagram carousel · 1080 × 1080',
    ratio:'1/1',
    slides:[
      {src:'assets/post-wc-1.jpg',alt:'Waterford Court carousel cover'},
      {src:'assets/post-wc-2.jpg',alt:'Waterford Court feature slide'},
      {src:'assets/post-wc-3.jpg',alt:'Waterford Court feature slide'},
      {src:'assets/post-wc-4.jpg',alt:'Waterford Court feature slide'},
      {src:'assets/post-wc-5.jpg',alt:'The Terrace, a covered patio slide'},
      {src:'assets/post-wc-7.jpg',alt:'Waterford Court particulars slide'}
    ]
  },
  {
    tab:'Hope Landing',
    client:'Realogics Sotheby’s International Realty',
    title:'Hope Landing, Fox Island',
    body:'A $10M waterfront parcel with nothing built on it. The carousel runs on concept renderings, so the estate sells before it exists, and ends on the agent rather than a photo.',
    tag:'#luxuryrealestate #foxisland',
    meta:'Instagram carousel · 1080 × 1080',
    ratio:'1/1',
    slides:[
      {src:'assets/post-hope-1.jpg',alt:'Hope Landing carousel cover'},
      {src:'assets/post-hope-2.jpg',alt:'Hope Landing estate slide'},
      {src:'assets/post-hope-3.jpg',alt:'Hope Landing closing slide with contact details'}
    ]
  },
  {
    tab:'Growth graphics',
    client:'Beyond Brokers Consulting',
    title:'The affiliation effect',
    body:'A repeatable format for proving the client’s pitch. Each agent gets a curve built from their own numbers, and the roster card collects them as the list grows.',
    tag:'#casestudy #datavisualization',
    meta:'Feed graphics · 1080 × 1350',
    ratio:'4/5',
    slides:[
      {src:'assets/post-growth-1.jpg',alt:'Agent growth curve graphic'},
      {src:'assets/post-growth-2.jpg',alt:'Second agent growth curve graphic'},
      {src:'assets/post-growth-3.jpg',alt:'Affiliation effect roster card'}
    ]
  }
];

const media=document.getElementById('postMedia'),track=document.getElementById('postTrack'),
      dotsEl=document.getElementById('postDots'),tabsEl=document.getElementById('postTabs'),
      countEl=document.getElementById('slideCount'),
      prevBtn=media.querySelector('.arrow.prev'),nextBtn=media.querySelector('.arrow.next');
let post=0,slide=0;

POSTS.forEach((p,i)=>{
  const b=document.createElement('button');
  b.type='button';b.textContent=p.tab;
  b.addEventListener('click',()=>loadPost(i));
  tabsEl.appendChild(b);
});

function loadPost(i){
  post=i;slide=0;
  const p=POSTS[i];
  media.style.aspectRatio=p.ratio;
  track.innerHTML=p.slides.map(s=>`<figure><img src="${s.src}" alt="${s.alt}" draggable="false"></figure>`).join('');
  dotsEl.innerHTML=p.slides.map((_,n)=>`<button type="button" aria-label="Slide ${n+1}"></button>`).join('');
  [...dotsEl.children].forEach((d,n)=>d.addEventListener('click',()=>go(n)));
  document.getElementById('postClient').textContent=p.client;
  document.getElementById('postTitle').textContent=p.title;
  document.getElementById('postBody').textContent=p.body;
  document.getElementById('postTag').textContent=p.tag;
  document.getElementById('postMeta').textContent=p.meta;
  [...tabsEl.children].forEach((b,n)=>b.classList.toggle('on',n===i));
  go(0,true);
}
function go(n,instant){
  const p=POSTS[post];
  slide=Math.max(0,Math.min(p.slides.length-1,n));
  if(instant)track.classList.add('dragging');
  track.style.transform=`translateX(${-slide*100}%)`;
  if(instant)requestAnimationFrame(()=>track.classList.remove('dragging'));
  [...dotsEl.children].forEach((d,i)=>d.classList.toggle('on',i===slide));
  countEl.textContent=`${slide+1}/${p.slides.length}`;
  prevBtn.disabled=slide===0;
  nextBtn.disabled=slide===p.slides.length-1;
}
prevBtn.addEventListener('click',()=>go(slide-1));
nextBtn.addEventListener('click',()=>go(slide+1));

// swipe / drag, following the finger like the real thing
let dragging=false,startX=0,startY=0,dx=0,locked=null;
media.addEventListener('pointerdown',e=>{
  if(e.target.closest('.arrow'))return;
  dragging=true;startX=e.clientX;startY=e.clientY;dx=0;locked=null;
  track.classList.add('dragging');
});
media.addEventListener('pointermove',e=>{
  if(!dragging)return;
  dx=e.clientX-startX;
  const dy=e.clientY-startY;
  if(locked===null&&(Math.abs(dx)>6||Math.abs(dy)>6))locked=Math.abs(dx)>Math.abs(dy)?'x':'y';
  if(locked!=='x')return;
  e.preventDefault();
  const max=POSTS[post].slides.length-1;
  let eased=dx;
  if((slide===0&&dx>0)||(slide===max&&dx<0))eased=dx*0.32;   // rubber band at the ends
  track.style.transform=`translateX(calc(${-slide*100}% + ${eased}px))`;
});
function endDrag(){
  if(!dragging)return;
  dragging=false;track.classList.remove('dragging');
  const threshold=Math.min(90,media.clientWidth*0.16);
  if(locked==='x'&&Math.abs(dx)>threshold)go(slide+(dx<0?1:-1));
  else go(slide);
}
['pointerup','pointercancel','pointerleave'].forEach(ev=>media.addEventListener(ev,endDrag));

// arrow keys when the post is in view
addEventListener('keydown',e=>{
  if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;
  const r=document.getElementById('post').getBoundingClientRect();
  if(r.top>innerHeight*0.75||r.bottom<innerHeight*0.25)return;
  go(slide+(e.key==='ArrowRight'?1:-1));
});

loadPost(0);

// band parallax
const band=document.querySelector('[data-parallax]');
let tick=false;
addEventListener('scroll',()=>{
  if(tick||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
  tick=true;
  requestAnimationFrame(()=>{
    const r=band.parentElement.getBoundingClientRect();
    if(r.bottom>0&&r.top<innerHeight){
      const p=(r.top+r.height/2-innerHeight/2)/innerHeight;
      band.style.transform=`translateY(${p*-60}px)`;
    }
    tick=false;
  });
},{passive:true});
