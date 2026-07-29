/* Adam Long Digital: interactions */
(function () {
  'use strict';

  var nav = document.getElementById('nav');
  var toggle = document.getElementById('navToggle');
  var mobile = document.getElementById('mobileNav');

  /* Sticky nav background after scrolling past the top */
  var onScroll = function () {
    if (window.scrollY > 24) nav.classList.add('is-stuck');
    else nav.classList.remove('is-stuck');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Mobile menu */
  var setMenu = function (open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mobile.hidden = !open;
  };
  toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });
  mobile.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  /* Scroll reveal */
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 4, 3) * 70 + 'ms';
      io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Current year in footer */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* Async form submit (Formspree) with inline status */
  var form = document.getElementById('inquiryForm');
  var note = document.getElementById('formNote');

  form.addEventListener('submit', function (e) {
    if (form.action.indexOf('YOUR_FORM_ID') !== -1) {
      e.preventDefault();
      note.className = 'form__note is-err';
      note.textContent = 'Form not connected yet. Add your Formspree endpoint in index.html.';
      return;
    }

    e.preventDefault();
    var btn = form.querySelector('button[type="submit"]');
    var label = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Sending…';
    note.className = 'form__note';
    note.textContent = '';

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Request failed');
        form.reset();
        note.className = 'form__note is-ok';
        note.textContent = 'Thanks. I’ll be in touch within one business day.';
      })
      .catch(function () {
        note.className = 'form__note is-err';
        note.textContent = 'Something went wrong. Email adamlongdigital@gmail.com and I’ll pick it up there.';
      })
      .finally(function () {
        btn.disabled = false;
        btn.textContent = label;
      });
  });
})();
