'use strict';

// ─── Utilities ────────────────────────────────────────────────
const el  = (id)  => document.getElementById(id);
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// ─── Init on DOM ready ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileNav();
  initScrollReveal();
  initCounters();
  initPricingToggle();
  initFAQ();
  initContactForm();
  initNewsletter();
  initBackToTop();
  initScrollSpy();
  el('footer-year').textContent = new Date().getFullYear();
});

// ─── Sticky header ─────────────────────────────────────────────
function initHeader() {
  const header = el('site-header');
  const onScroll = () => header.classList.toggle('scrolled', scrollY > 20);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ─── Mobile navigation ─────────────────────────────────────────
function initMobileNav() {
  const toggle   = el('nav-toggle');
  const nav      = el('primary-nav');
  const backdrop = el('nav-backdrop');

  const open = () => {
    nav.classList.add('open');
    backdrop.classList.add('show');
    toggle.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    nav.classList.remove('open');
    backdrop.classList.remove('show');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () =>
    toggle.getAttribute('aria-expanded') === 'true' ? close() : open()
  );
  backdrop.addEventListener('click', close);
  qsa('.nav-item', nav).forEach(a => a.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

// ─── Scroll reveal ─────────────────────────────────────────────
function initScrollReveal() {
  qsa('[data-reveal], .service-row, .platform-feature, .reason, .testimonial, .pricing-col, .faq-item, .value-item, .contact-item').forEach(el => {
    el.classList.add('reveal');
  });

  const io = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (!entry.isIntersecting) return;
      // Stagger siblings
      const siblings = qsa('.reveal', entry.target.parentElement);
      const idx = siblings.indexOf(entry.target);
      setTimeout(() => entry.target.classList.add('in'), Math.min(idx * 60, 300));
      io.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });

  qsa('.reveal').forEach(el => io.observe(el));
}

// ─── Animated counters ─────────────────────────────────────────
function initCounters() {
  const easeOutQuad = t => 1 - (1 - t) * (1 - t);

  const animate = (el, target, suffix = '') => {
    const duration = 1600;
    const start = performance.now();
    const step = now => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(easeOutQuad(p) * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count || el.dataset.countVal || '0', 10);
      animate(el, target);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });

  // Hero trust bar
  qsa('.trust-stat strong[data-count]').forEach(el => {
    el.dataset.countVal = el.dataset.count;
    io.observe(el);
  });

  // Why section stats
  qsa('.stat-number[data-count]').forEach(el => io.observe(el));
}

// ─── Pricing toggle ────────────────────────────────────────────
function initPricingToggle() {
  const btnMonthly = el('toggle-monthly');
  const btnAnnual  = el('toggle-annual');
  const amounts    = qsa('.amount[data-monthly]');
  let isAnnual = false;

  const update = annual => {
    isAnnual = annual;
    btnMonthly.classList.toggle('active', !annual);
    btnAnnual.classList.toggle('active', annual);
    btnMonthly.setAttribute('aria-pressed', String(!annual));
    btnAnnual.setAttribute('aria-pressed', String(annual));
    amounts.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'scale(0.9)';
      setTimeout(() => {
        el.textContent = '\u20b9' + el.getAttribute(annual ? 'data-annual' : 'data-monthly');
        el.style.opacity = '1';
        el.style.transform = 'none';
      }, 160);
    });
  };

  amounts.forEach(el => {
    el.style.transition = 'opacity 0.18s, transform 0.18s';
  });

  btnMonthly.addEventListener('click', () => update(false));
  btnAnnual.addEventListener('click',  () => update(true));
}

// ─── FAQ accordion ─────────────────────────────────────────────
function initFAQ() {
  qsa('.faq-item').forEach(item => {
    const btn = qs('.faq-q', item);
    const ans = qs('.faq-a', item);

    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';

      // Close all
      qsa('.faq-q').forEach(b => b.setAttribute('aria-expanded', 'false'));
      qsa('.faq-a').forEach(a => a.setAttribute('hidden', ''));

      if (!open) {
        btn.setAttribute('aria-expanded', 'true');
        ans.removeAttribute('hidden');
      }
    });
  });
}

// ─── Contact form ──────────────────────────────────────────────
function initContactForm() {
  const form    = el('contact-form');
  const success = el('form-success');
  const submit  = el('form-submit');
  if (!form) return;

  const nameEl    = el('f-name');
  const emailEl   = el('f-email');
  const messageEl = el('f-message');

  const errName    = el('err-name');
  const errEmail   = el('err-email');
  const errMessage = el('err-message');

  const setErr = (input, errEl, msg) => {
    errEl.textContent = msg;
    input.classList.add('has-error');
  };
  const clearErr = (input, errEl) => {
    errEl.textContent = '';
    input.classList.remove('has-error');
  };

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  nameEl.addEventListener('blur', () =>
    nameEl.value.trim() ? clearErr(nameEl, errName) : setErr(nameEl, errName, 'Please enter your name.')
  );
  emailEl.addEventListener('blur', () => {
    if (!emailEl.value.trim()) setErr(emailEl, errEmail, 'Please enter your email.');
    else if (!emailRe.test(emailEl.value)) setErr(emailEl, errEmail, 'Enter a valid email address.');
    else clearErr(emailEl, errEmail);
  });
  messageEl.addEventListener('blur', () =>
    messageEl.value.trim() ? clearErr(messageEl, errMessage) : setErr(messageEl, errMessage, 'Please enter a message.')
  );

  [nameEl, emailEl, messageEl].forEach(input => {
    input.addEventListener('input', () => input.classList.remove('has-error'));
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;

    if (!nameEl.value.trim())    { setErr(nameEl, errName, 'Please enter your name.'); valid = false; }
    if (!emailEl.value.trim())   { setErr(emailEl, errEmail, 'Please enter your email.'); valid = false; }
    else if (!emailRe.test(emailEl.value)) { setErr(emailEl, errEmail, 'Enter a valid email address.'); valid = false; }
    if (!messageEl.value.trim()) { setErr(messageEl, errMessage, 'Please enter a message.'); valid = false; }

    if (!valid) return;

    const label = submit.querySelector('.btn-label');
    submit.disabled = true;
    if (label) label.textContent = 'Sending…';

    // Simulate async send
    setTimeout(() => {
      form.reset();
      submit.disabled = false;
      if (label) label.textContent = 'Send Message';
      success.removeAttribute('hidden');
      success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setTimeout(() => success.setAttribute('hidden', ''), 6000);
    }, 1200);
  });
}

// ─── Newsletter ────────────────────────────────────────────────
function initNewsletter() {
  const form  = el('newsletter-form');
  const input = el('nl-email');
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  form?.addEventListener('submit', e => {
    e.preventDefault();
    if (!emailRe.test(input.value)) {
      input.style.borderColor = '#E53E3E';
      input.focus();
      return;
    }
    input.style.borderColor = '';
    const btn = qs('button', form);
    if (btn) { btn.textContent = '✓ Subscribed'; btn.disabled = true; }
    input.value = '';
    setTimeout(() => {
      if (btn) { btn.textContent = 'Subscribe'; btn.disabled = false; }
    }, 4000);
  });
}

// ─── Back to top ───────────────────────────────────────────────
function initBackToTop() {
  const btn = el('back-to-top');
  addEventListener('scroll', () => {
    btn.classList.toggle('visible', scrollY > 500);
  }, { passive: true });
  btn.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
}

// ─── Scroll spy (active nav link) ─────────────────────────────
function initScrollSpy() {
  const sections = qsa('section[id]');
  const links    = qsa('.nav-item');
  const headerH  = 72;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
      });
    });
  }, { rootMargin: `-${headerH}px 0px -55% 0px` });

  sections.forEach(s => io.observe(s));
}

// ─── Smooth scroll with header offset ─────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const offset = (el('site-header')?.offsetHeight || 64) + 8;
    scrollTo({ top: target.getBoundingClientRect().top + scrollY - offset, behavior: 'smooth' });
  });
});
