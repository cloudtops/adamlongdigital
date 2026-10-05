/* Adam Long Digital, index build
   Three behaviours only: accordion, carousel, form. Nothing decorative. */
(function(){
'use strict';

/* ───────── 1. work index accordion ───────── */
document.querySelectorAll('.index .rowhead').forEach(function(btn){
  btn.addEventListener('click', function(){
    var row  = btn.closest('.row');
    var open = row.classList.contains('is-open');
    row.classList.toggle('is-open', !open);
    btn.setAttribute('aria-expanded', String(!open));
  });
});

/* ───────── 2. active section in the top bar ───────── */
(function(){
  var links = [].slice.call(document.querySelectorAll('.topnav a'));
  var secs  = links.map(function(a){ return document.getElementById(a.dataset.sec); }).filter(Boolean);
  if (!secs.length || !('IntersectionObserver' in window)) return;
  var seen = new Map();
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ seen.set(e.target.id, e.intersectionRatio); });
    var best = null, top = 0;
    seen.forEach(function(ratio, id){ if (ratio > top){ top = ratio; best = id; } });
    links.forEach(function(a){ a.classList.toggle('on', a.dataset.sec === best); });
  }, { rootMargin:'-46px 0px -55% 0px', threshold:[0,.1,.25,.5,1] });
  secs.forEach(function(s){ io.observe(s); });
})();

/* ───────── 3. output viewer ───────── */
var POSTS=[
  {
    tab:'Beyond Brokers',
    client:'Beyond Brokers Consulting',
    title:"What's a move actually worth?",
    body:'Built from one agent’s real production numbers. The cover asks the question, the second answers it, and the third shows the network behind it.',
    tag:'#recruiting #realestate #brandmarketing',
    meta:'Instagram carousel · 1080 × 1350',
    slides:[
      {src:'assets/post-bb-1.jpg?v=2',alt:'Carousel cover asking what a move is actually worth'},
      {src:'assets/post-bb-2.jpg?v=2',alt:'Slide showing sales volume nearly doubled, up 95 percent'},
      {src:'assets/post-bb-3.jpg?v=2',alt:'Slide showing 21 agents recruited in Nashville'}
    ]
  },
  {
    tab:'Waterford Court',
    client:'Realogics Sotheby’s International Realty',
    title:'Waterford Court, Kirkland',
    body:'One shoot turned into a printed booklet and this carousel. Cover, four feature slides with one line of copy each, and the particulars at the end.',
    tag:'#kirklandrealestate #listingmarketing',
    meta:'Instagram carousel · 1080 × 1080',
    slides:[
      {src:'assets/post-wc-1.jpg?v=2',alt:'Waterford Court carousel cover'},
      {src:'assets/post-wc-2.jpg?v=2',alt:'Waterford Court feature slide'},
      {src:'assets/post-wc-3.jpg?v=2',alt:'Waterford Court feature slide'},
      {src:'assets/post-wc-4.jpg?v=2',alt:'Waterford Court feature slide'},
      {src:'assets/post-wc-5.jpg?v=2',alt:'The Terrace, a covered patio slide'},
      {src:'assets/post-wc-7.jpg?v=2',alt:'Waterford Court particulars slide'}
    ]
  },
  {
    tab:'Hope Landing',
    client:'Realogics Sotheby’s International Realty',
    title:'Hope Landing, Fox Island',
    body:'Nothing is built on this property yet, so the whole thing runs on concept renderings. It ends on the agent, not a photo.',
    tag:'#luxuryrealestate #foxisland',
    meta:'Instagram carousel · 1080 × 1080',
    slides:[
      {src:'assets/post-hope-1.jpg?v=2',alt:'Hope Landing carousel cover'},
      {src:'assets/post-hope-2.jpg?v=2',alt:'Hope Landing estate slide'},
      {src:'assets/post-hope-3.jpg?v=2',alt:'Hope Landing closing slide with contact details'}
    ]
  },
  {
    tab:'Growth graphics',
    client:'Beyond Brokers Consulting',
    title:'The affiliation effect',
    body:'A format I can repeat for every agent they recruit. Each one gets a curve built from their own numbers, and the roster card collects them as the list grows.',
    tag:'#casestudy #datavisualization',
    meta:'Feed graphics · 1080 × 1350',
    slides:[
      {src:'assets/post-growth-1.jpg?v=2',alt:'Agent growth curve graphic'},
      {src:'assets/post-growth-2.jpg?v=2',alt:'Second agent growth curve graphic'},
      {src:'assets/post-growth-3.jpg?v=2',alt:'Affiliation effect roster card'}
    ]
  }
];

var stage = document.getElementById('postMedia');
if (stage){
  var track = document.getElementById('postTrack');
  var tabs  = document.getElementById('postTabs');
  var out   = {
    client: document.getElementById('postClient'),
    title : document.getElementById('postTitle'),
    body  : document.getElementById('postBody'),
    tag   : document.getElementById('postTag'),
    meta  : document.getElementById('postMeta'),
    frame : document.getElementById('slideCount'),
    set   : document.getElementById('setCount')
  };
  var set = 0, slide = 0;

  POSTS.forEach(function(p,i){
    var b = document.createElement('button');
    b.type = 'button'; b.textContent = p.tab;
    b.addEventListener('click', function(){ load(i); });
    tabs.appendChild(b);
  });

  function paint(){
    track.style.transition = 'transform .3s cubic-bezier(.2,.7,.3,1)';
    track.style.transform  = 'translate3d(' + (-slide * 100) + '%,0,0)';
    out.frame.textContent  = (slide + 1) + ' / ' + POSTS[set].slides.length;
    [].forEach.call(tabs.children, function(b,i){ b.classList.toggle('on', i === set); });
  }

  function load(i){
    set = i; slide = 0;
    var p = POSTS[i];
    track.innerHTML = '';
    p.slides.forEach(function(s){
      var img = document.createElement('img');
      img.src = s.src; img.alt = s.alt; img.draggable = false; img.loading = 'lazy';
      track.appendChild(img);
    });
    out.client.textContent = p.client;
    out.title.textContent  = p.title;
    out.body.textContent   = p.body;
    out.tag.textContent    = p.tag;
    out.meta.textContent   = p.meta;
    if (out.set) out.set.textContent = 'Set ' + (i + 1) + '/' + POSTS.length;
    track.style.transition = 'none';
    paint();
  }

  function go(n){
    var max = POSTS[set].slides.length - 1;
    slide = Math.max(0, Math.min(max, n));
    paint();
  }

  stage.querySelector('.prev').addEventListener('click', function(){ go(slide - 1); });
  stage.querySelector('.next').addEventListener('click', function(){ go(slide + 1); });

  /* drag / swipe with axis lock and end rubber-banding */
  var down = false, lock = null, x0 = 0, y0 = 0, dx = 0, w = 1;
  stage.addEventListener('pointerdown', function(e){
    if (e.target.closest('.varrow')) return;
    down = true; lock = null; dx = 0;
    x0 = e.clientX; y0 = e.clientY; w = stage.clientWidth || 1;
    stage.classList.add('drag');
  });
  stage.addEventListener('pointermove', function(e){
    if (!down) return;
    var ax = e.clientX - x0, ay = e.clientY - y0;
    if (lock === null){
      if (Math.abs(ax) < 6 && Math.abs(ay) < 6) return;
      lock = Math.abs(ax) > Math.abs(ay) ? 'x' : 'y';
      if (lock === 'x' && stage.setPointerCapture) { try{ stage.setPointerCapture(e.pointerId); }catch(_){} }
    }
    if (lock !== 'x') return;
    e.preventDefault();
    var max = POSTS[set].slides.length - 1;
    if ((slide === 0 && ax > 0) || (slide === max && ax < 0)) ax *= .28;
    dx = ax;
    track.style.transition = 'none';
    track.style.transform  = 'translate3d(calc(' + (-slide * 100) + '% + ' + dx + 'px),0,0)';
  });
  function release(){
    if (!down) return;
    down = false; stage.classList.remove('drag');
    if (lock === 'x' && Math.abs(dx) > w * .16) go(slide + (dx < 0 ? 1 : -1));
    else paint();
    dx = 0; lock = null;
  }
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);
  stage.addEventListener('pointerleave', release);
  stage.addEventListener('dragstart', function(e){ e.preventDefault(); });

  document.addEventListener('keydown', function(e){
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    var r = stage.getBoundingClientRect();
    if (r.bottom < 60 || r.top > window.innerHeight - 60) return;
    go(slide + (e.key === 'ArrowRight' ? 1 : -1));
  });

  window.addEventListener('resize', function(){ w = stage.clientWidth || 1; paint(); });
  load(0);
}

/* ───────── 4. inquiry form ───────── */
var form = document.getElementById('inquiryForm');
if (form){
  var statusEl = document.getElementById('formStatus');
  var submit   = form.querySelector('button[type=submit]');

  function mailtoFallback(data){
    var body = 'Name: ' + (data.get('name')||'') +
      '\nEmail: ' + (data.get('email')||'') +
      '\nPhone: ' + (data.get('phone')||'') +
      '\nCompany: ' + (data.get('company')||'') +
      '\nNeeds: ' + (data.get('service')||'') +
      '\n\n' + (data.get('details')||'');
    window.location.href = 'mailto:adamlongdigital@gmail.com?subject=' +
      encodeURIComponent('Project inquiry') + '&body=' + encodeURIComponent(body);
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    var data = new FormData(form);
    var key  = (data.get('access_key') || '') + '';

    if (!key || key.indexOf('PASTE') === 0){
      statusEl.className = 'fstatus';
      statusEl.textContent = 'Opening your email app instead.';
      mailtoFallback(data);
      return;
    }

    submit.disabled = true;
    statusEl.className = 'fstatus';
    statusEl.textContent = 'Sending…';

    fetch(form.action, { method:'POST', body:data })
      .then(function(r){ return r.json(); })
      .then(function(j){
        if (j && j.success){
          form.reset();
          statusEl.className = 'fstatus ok';
          statusEl.textContent = 'Sent. I will get back to you, usually the same day.';
        } else { throw new Error('rejected'); }
      })
      .catch(function(){
        statusEl.className = 'fstatus';
        statusEl.textContent = 'That did not send. Opening your email app instead.';
        mailtoFallback(data);
      })
      .finally(function(){ submit.disabled = false; });
  });
}

})();
