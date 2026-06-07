/* Portfolio app — Sidi Chrif Ahmed Maadh */
(() => {
  'use strict';

  // ============ EMAILJS CONFIG ============
  const EMAILJS_PUBLIC_KEY = 'XHF6q6xnp8lenal-L';
  const EMAILJS_SERVICE_ID = 'service_puat13e';
  const EMAILJS_TEMPLATE_ID = 'template_fn44u0r';

  // Initialize EmailJS when SDK is loaded
  if (window.emailjs) {
    window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }

  // Default certification URLs (used as fallback if profile.json doesn't have them)
  const CERT_URLS = {
    "Machine Learning Specialization": "https://www.coursera.org/specializations/machine-learning-introduction",
    "Deep Learning Specialization": "https://www.coursera.org/specializations/deep-learning",
    "NLP Specialization": "https://www.coursera.org/specializations/natural-language-processing",
    "Generative AI with LLMs": "https://www.coursera.org/learn/generative-ai-with-llms",
    "AWS Cloud Practitioner": "https://aws.amazon.com/certification/certified-cloud-practitioner/",
    "Google Professional ML Engineer": "https://cloud.google.com/learn/certification/machine-learning-engineer",
    "Microsoft Azure AI Fundamentals": "https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-fundamentals/",
  };

  // ============ THEME ============
  const themeBtn = document.getElementById('theme-toggle');
  const iconSun = document.getElementById('icon-sun');
  const iconMoon = document.getElementById('icon-moon');
  const setTheme = (t) => {
    document.documentElement.setAttribute('data-theme', t);
    iconSun.style.display = t === 'dark' ? 'block' : 'none';
    iconMoon.style.display = t === 'light' ? 'block' : 'none';
    try { localStorage.setItem('theme', t); } catch (_) {}
  };
  themeBtn.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') || 'dark';
    setTheme(cur === 'dark' ? 'light' : 'dark');
  });

  // ============ LANG ============
  const langBtn = document.getElementById('lang-toggle');
  const langLabel = document.getElementById('lang-label');
  let curLang = 'en';
  const applyLang = (lang) => {
    curLang = lang;
    document.documentElement.lang = lang;
    langLabel.textContent = lang === 'en' ? 'FR' : 'EN';
    const dict = (window.I18N && window.I18N[lang]) || {};
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const k = el.getAttribute('data-i18n');
      if (dict[k]) {
        if (/<[a-z][^>]*>/i.test(dict[k])) {
          el.innerHTML = dict[k];
        } else {
          el.textContent = dict[k];
        }
      }
    });
    document.querySelectorAll('[data-i18n-ph]').forEach((el) => {
      const k = el.getAttribute('data-i18n-ph');
      if (dict[k]) el.placeholder = dict[k];
    });
    injectTechLogos();
    try { localStorage.setItem('lang', lang); } catch (_) {}
  };
  // Expose globally so other scripts (globe.js, dynamic loaders) can re-apply translations
  window.applyLang = applyLang;
  langBtn.addEventListener('click', () => applyLang(curLang === 'en' ? 'fr' : 'en'));

  // ============ TECH LOGOS INJECTION ============
  function injectTechLogos() {
    if (!window.TECH_LOGOS) return;
    document.querySelectorAll('.chip[data-tech]').forEach((chip) => {
      const name = chip.getAttribute('data-tech');
      const logo = window.TECH_LOGOS[name];
      if (logo && !chip.querySelector('svg')) {
        chip.insertAdjacentHTML('afterbegin', logo);
      }
    });
  }

  // ============ BURGER ============
  const burger = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
    burger.classList.remove('open');
    navLinks.classList.remove('open');
  }));

  // ============ EXPERIENCE / EDUCATION TOGGLE ============
  const segBtns = document.querySelectorAll('.seg-btn');
  const tlExp = document.getElementById('tl-experience');
  const tlEdu = document.getElementById('tl-education');
  segBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      segBtns.forEach((b) => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const tab = btn.getAttribute('data-tab');
      if (tab === 'experience') { tlEdu.hidden = true; tlExp.hidden = false; revealItems(tlExp); }
      else { tlExp.hidden = true; tlEdu.hidden = false; revealItems(tlEdu); }
    });
  });
  function revealItems(container) {
    container.querySelectorAll('.tl-item').forEach((el, i) => {
      el.classList.remove('revealed');
      setTimeout(() => el.classList.add('revealed'), 60 + i * 100);
    });
  }

  // ============ SCROLL REVEAL (auto-tagging + IntersectionObserver) ============
  // Auto-tag elements with reveal classes based on their type/context.
  function initScrollReveal() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: show everything
      document.querySelectorAll('.reveal-init').forEach(el => el.classList.add('revealed'));
      return;
    }

    // Auto-tag rules: selector → reveal classes (string of space-separated classes)
    const tagRules = [
      // Section headers: titles slide up
      ['.sec-header',            'reveal-init reveal-up'],
      ['.contact-title',         'reveal-init reveal-up'],

      // Hero (about) — slide in from sides
      ['.ha-left',               'reveal-init reveal-left'],
      ['.ha-right',              'reveal-init reveal-right'],

      // Quick stats: stagger fade-up
      ['.quick-stats',           'reveal-init reveal-fade reveal-stagger'],

      // Tech stack groups
      ['.tech-group',            'reveal-init reveal-up'],
      ['.tech-chips',            'reveal-stagger'],

      // Projects grid
      ['.proj-grid',             'reveal-init reveal-fade reveal-stagger'],

      // Certifications blocks
      ['.cert-block',            'reveal-init reveal-up'],

      // Self Education bars
      ['.edu-bars',              'reveal-init reveal-up reveal-stagger'],

      // Contact cards
      ['.contact-cards',         'reveal-init reveal-fade reveal-stagger'],
      ['.contact-form',          'reveal-init reveal-up'],

      // Footer
      ['.site-footer .footer-top',    'reveal-init reveal-up'],
      ['.site-footer .footer-bottom', 'reveal-init reveal-fade'],

      // Seg toggle button
      ['.seg-toggle',            'reveal-init reveal-scale'],

      // Already-tagged timeline items: just ensure init class
      ['.tl-item',               'reveal-init'],
    ];

    tagRules.forEach(([selector, classes]) => {
      document.querySelectorAll(selector).forEach(el => {
        classes.split(' ').forEach(c => el.classList.add(c));
      });
    });

    // Timeline items use reveal-left / reveal-right based on their side
    document.querySelectorAll('.tl-item.tl-left').forEach(el => el.classList.add('reveal-left'));
    document.querySelectorAll('.tl-item.tl-right').forEach(el => el.classList.add('reveal-right'));

    // Observer to add .revealed when element enters viewport
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal-init').forEach(el => obs.observe(el));
  }

  // Replaced the old simple reveal observer; remove old [data-reveal] observer reference
  // (the timeline JS still uses revealItems() for tab switching — keep it)

  // ============ SCROLL SPY ============
  const sections = document.querySelectorAll('section[id]');
  const topLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  const setActive = () => {
    const y = window.scrollY + 130;
    let current = sections[0]?.id;
    sections.forEach((s) => { if (s.offsetTop <= y) current = s.id; });
    topLinks.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + current));
  };
  window.addEventListener('scroll', setActive, { passive: true });
  setActive();

  // ============ LIVE SCORES — Codeforces ============
  async function loadCodeforces() {
    try {
      const handle = 'sidi_maadh';
      const statRes = await fetch(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=10000`);
      const stat = await statRes.json();
      let solved = 0;
      if (stat.status === 'OK') {
        const set = new Set();
        for (const s of stat.result) if (s.verdict === 'OK') { const p = s.problem; set.add((p.contestId || 'x') + '-' + p.index); }
        solved = set.size;
      }
      updateCounterTarget('qs-cf', solved);
    } catch (e) {
      console.warn('CF:', e);
      updateCounterTarget('qs-cf', 0);
    }
  }

  // ============ LIVE SCORES — LeetCode ============
  async function loadLeetCode() {
    // Try multiple endpoints (the heroku one is dead, use alfa-leetcode-api as primary)
    const endpoints = [
      'https://alfa-leetcode-api.onrender.com/sidi_maadh/solved',
      'https://leetcode-stats-api.herokuapp.com/sidi_maadh',
    ];
    for (const url of endpoints) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const d = await res.json();
        const total = d.solvedProblem || d.totalSolved || 0;
        if (total > 0) {
          updateCounterTarget('qs-lc', total);
          return;
        }
      } catch (_) { /* try next */ }
    }
    updateCounterTarget('qs-lc', 0);
  }

  // ============ DYNAMIC CERTIFICATIONS ============
  const ESC = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  function resolveCertUrl(cert, statusGroup) {
    // Only completed certifications get clickable links
    if (statusGroup !== 'done') return null;
    if (cert.url) return cert.url;
    if (CERT_URLS[cert.name]) return CERT_URLS[cert.name];
    return null;
  }
  async function loadCertifications() {
    const container = document.getElementById('cert-content');
    if (!container) return;
    try {
      const res = await fetch('https://raw.githubusercontent.com/sidi-maadh/sidi-maadh/main/profile.json');
      if (!res.ok) throw new Error('profile.json HTTP ' + res.status);
      const cfg = await res.json();
      const c = cfg.certifications || {};
      const done = c.completed || [];
      const active = c.in_progress || [];
      const planned = c.planned || [];

      // Update counters
      const upd = (id, n) => { const el = document.getElementById(id); if (el) el.textContent = n; };
      upd('c-done', done.length);
      upd('c-active', active.length);
      upd('c-planned', planned.length);
      // Quick-stat card
      updateCounterTarget('qs-cert', done.length);

      // ============ OFFICIAL ORGANIZATION LOGOS ============
      // Authentic SVG paths from Simple Icons / official brand resources
      const platformLogos = {
        // Coursera — official blue C
        coursera: '<svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><path fill="#0056D2" d="M11.374 23.977C4.834 23.65-.318 18.06.015 11.434.345 4.876 5.918-.286 12.483.013c6.56.299 11.756 5.91 11.456 12.467-.302 6.605-5.926 11.84-12.565 11.497zm.582-7.247c2.605.04 4.794-2.082 4.84-4.69.045-2.61-2.057-4.805-4.673-4.882-2.604-.077-4.793 2.061-4.876 4.764-.082 2.643 2.066 4.766 4.71 4.808z"/></svg>',

        // AWS — official orange smile
        aws: '<svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg"><g fill="#FF9900"><path d="M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.183 0 .08-.048.16-.152.24l-.503.335a.383.383 0 01-.208.072c-.08 0-.16-.04-.239-.112a2.47 2.47 0 01-.287-.375 6.18 6.18 0 01-.248-.471c-.622.734-1.405 1.101-2.347 1.101-.67 0-1.205-.191-1.596-.574-.391-.384-.59-.894-.59-1.533 0-.678.239-1.23.726-1.644.487-.415 1.133-.623 1.955-.623.272 0 .551.024.846.064.296.04.6.104.918.176v-.583c0-.607-.127-1.03-.375-1.277-.255-.248-.686-.367-1.3-.367-.28 0-.568.031-.863.103-.295.072-.583.16-.862.272a2.287 2.287 0 01-.28.104.488.488 0 01-.127.023c-.112 0-.168-.08-.168-.247v-.391c0-.128.016-.224.056-.28a.597.597 0 01.224-.167c.279-.144.614-.264 1.005-.36a4.84 4.84 0 011.246-.151c.95 0 1.644.216 2.091.647.439.43.662 1.085.662 1.963v2.586z"/><path d="M21.698 17.43c-2.626 1.94-6.443 2.97-9.722 2.97-4.595 0-8.732-1.7-11.857-4.524-.247-.223-.024-.526.27-.350 3.376 1.96 7.553 3.144 11.873 3.144 2.91 0 6.107-.607 9.058-1.852.439-.2.81.288.378.612zM22.794 16.18c-.336-.43-2.22-.207-3.073-.103-.255.032-.295-.192-.063-.36 1.5-1.053 3.967-.75 4.254-.399.287.36-.08 2.83-1.485 4.012-.215.184-.423.088-.327-.151.32-.79 1.03-2.57.694-2.999z"/></g></svg>',

        // Stanford — official cardinal red "S" inside shape
        stanford: '<svg viewBox="0 0 100 100" width="22" height="22" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" rx="14" fill="#8C1515"/><text x="50" y="68" font-family="Georgia, serif" font-size="60" font-weight="700" fill="#fff" text-anchor="middle">S</text></svg>',

        // IBM — iconic 8-bar stacked horizontal lines logo
        ibm: '<svg viewBox="0 0 32 13" width="28" height="14" xmlns="http://www.w3.org/2000/svg"><g fill="#1F70C1"><rect y="0" width="32" height="1"/><rect y="2" width="32" height="1"/><rect y="4" width="32" height="1"/><rect y="6" width="32" height="1"/><rect y="8" width="32" height="1"/><rect y="10" width="32" height="1"/><rect y="12" width="32" height="1"/></g></svg>',

        // DeepLearning.AI — official purple/blue
        deeplearning: '<svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="dlg" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#8B5CF6"/><stop offset="1" stop-color="#3B82F6"/></linearGradient></defs><circle cx="12" cy="12" r="10" fill="url(#dlg)"/><circle cx="7" cy="9" r="1.4" fill="#fff"/><circle cx="12" cy="6.5" r="1.4" fill="#fff"/><circle cx="17" cy="9" r="1.4" fill="#fff"/><circle cx="9" cy="15" r="1.4" fill="#fff"/><circle cx="15" cy="15" r="1.4" fill="#fff"/><circle cx="12" cy="18" r="1.2" fill="#fff"/><g stroke="#fff" stroke-width="0.8" opacity="0.7"><line x1="7" y1="9" x2="12" y2="6.5"/><line x1="12" y1="6.5" x2="17" y2="9"/><line x1="7" y1="9" x2="9" y2="15"/><line x1="17" y1="9" x2="15" y2="15"/><line x1="9" y1="15" x2="15" y2="15"/><line x1="12" y1="6.5" x2="9" y2="15"/><line x1="12" y1="6.5" x2="15" y2="15"/><line x1="9" y1="15" x2="12" y2="18"/><line x1="15" y1="15" x2="12" y2="18"/></g></svg>',

        // Google — official 4-color G
        google: '<svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>',

        // Udemy — official purple
        udemy: '<svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><path fill="#A435F0" d="M11.997.06L5.36 3.84l6.637 3.776L18.633 3.84zM5.232 9.135v6.135C5.232 19.305 8.295 22 12 22s6.768-2.695 6.768-6.73V9.135l-3.305 1.88v4.07c0 2.038-1.563 3.305-3.463 3.305s-3.463-1.267-3.463-3.305v-4.07z"/></svg>',

        // Microsoft — official 4-square
        microsoft: '<svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="10" height="10" fill="#F25022"/><rect x="13" y="1" width="10" height="10" fill="#7FBA00"/><rect x="1" y="13" width="10" height="10" fill="#00A4EF"/><rect x="13" y="13" width="10" height="10" fill="#FFB900"/></svg>',

        // Meta / Facebook
        meta: '<svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><path fill="#0866FF" d="M24 12c0-6.627-5.373-12-12-12S0 5.373 0 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.356c0-3.007 1.792-4.668 4.533-4.668 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874V12h3.328l-.532 3.469h-2.796v8.385C19.612 22.954 24 17.99 24 12z"/></svg>',

        // NVIDIA
        nvidia: '<svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg"><path fill="#76B900" d="M8.948 9.378v-1.41c.14-.01.282-.017.425-.017 3.93-.123 6.508 3.378 6.508 3.378s-2.784 3.866-5.768 3.866c-.41 0-.795-.066-1.165-.18v-4.27c1.51.183 1.815.852 2.722 2.366l2.013-1.696s-1.47-1.93-3.95-1.93c-.27 0-.527.02-.785.04m0-4.668v2.1c.14-.01.282-.018.425-.022 5.46-.184 9.024 4.477 9.024 4.477s-4.09 4.97-8.343 4.97c-.388 0-.752-.036-1.106-.097v1.302c.303.04.617.062.94.062 3.957 0 6.82-2.022 9.594-4.412.46.37 2.346 1.27 2.733 1.665-2.638 2.21-8.787 3.99-12.265 3.99-.337 0-.66-.02-.978-.05v1.83H24V4.71H8.948m0 10.18v1.12c-3.66-.65-4.674-4.458-4.674-4.458s1.756-1.94 4.674-2.258v1.225h-.006c-1.532-.184-2.732 1.246-2.732 1.246s.677 2.424 2.738 3.124M1.605 11.166s2.167-3.198 6.342-3.516V6.532C3.328 6.91 0 10.836 0 10.836s1.886 5.45 7.948 6.02v-1.222c-4.446-.557-6.343-4.468-6.343-4.468"/></svg>',

        // edX
        edx: '<svg viewBox="0 0 24 24" width="22" height="14" xmlns="http://www.w3.org/2000/svg"><text x="12" y="14" font-family="Arial Black, sans-serif" font-size="12" font-weight="900" fill="#02262B" text-anchor="middle">ed<tspan fill="#B82339">X</tspan></text></svg>',

        // LinkedIn Learning
        linkedin: '<svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><path fill="#0A66C2" d="M20.452 20.452h-3.554v-5.569c0-1.328-.025-3.037-1.852-3.037-1.854 0-2.137 1.446-2.137 2.94v5.667H9.355V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.268 2.37 4.268 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9H7.12v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',

        // Kaggle
        kaggle: '<svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><path fill="#20BEFF" d="M18.825 23.859c-.022.092-.117.141-.281.141h-3.139c-.187 0-.351-.082-.492-.248l-5.178-6.589-1.448 1.374v5.111c0 .235-.117.352-.351.352H5.505c-.236 0-.354-.117-.354-.352V.353c0-.233.118-.353.354-.353h2.431c.234 0 .351.12.351.353v14.343l6.203-6.272c.165-.165.33-.246.495-.246h3.239c.144 0 .236.06.285.18.046.166.034.279-.036.339l-6.555 6.344 6.836 8.643c.095.142.103.286.07.388z"/></svg>',

        // Andrew Ng → use deeplearning as he founded DeepLearning.AI
        'andrew ng': '<svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="ngg" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#8B5CF6"/><stop offset="1" stop-color="#3B82F6"/></linearGradient></defs><circle cx="12" cy="12" r="10" fill="url(#ngg)"/><circle cx="7" cy="9" r="1.4" fill="#fff"/><circle cx="12" cy="6.5" r="1.4" fill="#fff"/><circle cx="17" cy="9" r="1.4" fill="#fff"/><circle cx="9" cy="15" r="1.4" fill="#fff"/><circle cx="15" cy="15" r="1.4" fill="#fff"/><circle cx="12" cy="18" r="1.2" fill="#fff"/></svg>',
      };

      // Aliases — multiple keys can match the same logo
      const logoAliases = {
        'deeplearning.ai': 'deeplearning',
        'dlai': 'deeplearning',
        'amazon web services': 'aws',
        'amazon': 'aws',
        'gcp': 'google',
        'google cloud': 'google',
        'azure': 'microsoft',
        'mit': 'stanford',  // No MIT logo but use similar style as fallback
        'facebook': 'meta',
      };

      function getOrgLogo(text) {
        if (!text) return '';
        const lower = text.toLowerCase().trim();
        // 1. Exact key match
        if (platformLogos[lower]) return platformLogos[lower];
        // 2. Alias match
        if (logoAliases[lower] && platformLogos[logoAliases[lower]]) {
          return platformLogos[logoAliases[lower]];
        }
        // 3. Substring search — check each known logo key against the text
        for (const key of Object.keys(platformLogos)) {
          if (lower.includes(key)) return platformLogos[key];
        }
        // 4. Substring search through aliases
        for (const [alias, targetKey] of Object.entries(logoAliases)) {
          if (lower.includes(alias)) return platformLogos[targetKey] || '';
        }
        return '';
      }

      // Backward compat alias
      const getPlatformLogo = getOrgLogo;

      const buildRow = (cert, sc, statusGroup) => {
        const url = resolveCertUrl(cert, statusGroup);
        const tag = url ? 'a' : 'div';
        const hrefAttr = url ? ` href="${ESC(url)}" target="_blank" rel="noopener"` : '';
        const platClass = (cert.platform || '').toLowerCase() === 'aws' ? ' plat-aws' : '';
        const arrow = url ? '<svg class="cert-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M7 17L17 7M7 7h10v10"/></svg>' : '<span></span>';
        return `<${tag}${hrefAttr} class="cert-row ${sc}"><div class="cert-bar"></div><div class="cert-name">${ESC(cert.name || '')}</div><div class="cert-issuer">${ESC(cert.issuer || '')}</div><div class="cert-plat${platClass}">${ESC(cert.platform || '')}</div><div class="cert-year">${ESC(cert.year || '')}</div>${arrow}</${tag}>`;
      };
      const buildTile = (cert, statusGroup) => {
        const url = resolveCertUrl(cert, statusGroup);
        const tag = url ? 'a' : 'div';
        const hrefAttr = url ? ` href="${ESC(url)}" target="_blank" rel="noopener"` : '';
        return `<${tag}${hrefAttr} class="cert-planned"><span>${ESC(cert.name || '')}</span><span class="planned-platform">${ESC(cert.platform || cert.code || '')}</span></${tag}>`;
      };

      const dict = window.I18N?.[curLang] || {};
      const MAX_DONE = 5;
      const html = [];

      if (done.length) {
        html.push(`<div class="cert-block"><h3 class="cert-status-title done" data-i18n="cert.h.done">${dict['cert.h.done'] || 'COMPLETED'}</h3>`);
        // Show first MAX_DONE
        done.slice(0, MAX_DONE).forEach(c => html.push(buildRow(c, 'done-row', 'done')));
        // Hide the rest, will reveal 2 per Load More click
        if (done.length > MAX_DONE) {
          done.slice(MAX_DONE).forEach((c, i) => {
            const row = buildRow(c, 'done-row hidden-cert', 'done');
            html.push(row);
          });
          const remaining = done.length - MAX_DONE;
          html.push(`<div class="cert-view-more"><button type="button" id="loadMoreCerts" class="btn-load-more">
            <span data-i18n="cert.more">${dict['cert.more'] || 'Load More'}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
          </button></div>`);
        }
        html.push('</div>');
      }
      if (active.length) {
        html.push(`<div class="cert-block"><h3 class="cert-status-title active" data-i18n="cert.h.active">${dict['cert.h.active'] || 'IN PROGRESS'}</h3>`);
        active.forEach(c => html.push(buildRow(c, 'active-row', 'active')));
        html.push('</div>');
      }
      if (planned.length) {
        html.push(`<div class="cert-block"><h3 class="cert-status-title planned" data-i18n="cert.h.planned">${dict['cert.h.planned'] || 'PLANNED'}</h3><div class="cert-planned-grid">`);
        planned.forEach(c => html.push(buildTile(c, 'planned')));
        html.push('</div></div>');
      }
      container.innerHTML = html.join('');
      container.classList.remove('cert-loading');
      // Re-apply translations to newly injected content
      if (window.applyLang) window.applyLang(curLang);

      // Wire up Load More button for hidden certifications
      const certLoadMore = document.getElementById('loadMoreCerts');
      if (certLoadMore) {
        certLoadMore.addEventListener('click', () => {
          const hiddenCerts = container.querySelectorAll('.cert-row.hidden-cert');
          let revealed = 0;
          for (const row of hiddenCerts) {
            if (revealed >= 4) break;
            row.classList.remove('hidden-cert');
            row.style.opacity = '0';
            row.style.transform = 'translateX(-10px)';
            requestAnimationFrame(() => {
              row.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
              row.style.opacity = '1';
              row.style.transform = 'translateX(0)';
            });
            revealed++;
          }
          // Hide button if no more hidden
          if (container.querySelectorAll('.cert-row.hidden-cert').length === 0) {
            certLoadMore.parentElement.style.display = 'none';
          }
        });
      }
    } catch (e) {
      console.warn('Cert load failed:', e);
      container.innerHTML = '<p class="error-note">Could not load certifications. <a href="https://github.com/sidi-maadh" target="_blank" rel="noopener">View them on my GitHub</a> instead.</p>';
    }
  }

  // ============ SELF EDUCATION ============
  function formatHM(totalMinutes) {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}h ${String(m).padStart(2, '0')}m`;
  }
  async function loadSelfEducation() {
    const container = document.getElementById('edu-content');
    if (!container) return;

    // Real Google Sheet CSV (published to web)
    const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS9qcgWzwekcE488FaB73lGI9T_gsT1vbPt_zfnqhonZskpQpYY8n0vgZuELZwkoXCJwSXndSmPAHQY/pub?gid=0&single=true&output=csv';

    let subjects = {};
    let totalMin = 0;
    let totalHoursFromSheet = null;  // Direct value from cell M13
    let dataSource = 'fallback';

    // Simple CSV row parser (handles quoted fields with commas)
    function parseCSVRow(line) {
      const cells = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (ch === '"') { inQuotes = !inQuotes; }
        else if (ch === ',' && !inQuotes) { cells.push(cur); cur = ''; }
        else { cur += ch; }
      }
      cells.push(cur);
      return cells.map(c => c.trim());
    }

    try {
      const res = await fetch(SHEET_CSV_URL);
      if (res.ok) {
        const text = await res.text();
        const lines = text.split(/\r?\n/);
        const rows = lines.map(parseCSVRow);

        // ============ Extract total from cell M13 (row index 12, col index 12) ============
        if (rows.length > 12 && rows[12].length > 12) {
          const rawTotal = rows[12][12];
          if (rawTotal) {
            // Parse "234h 30m", "234.5", "234", etc.
            const hm = rawTotal.match(/(\d+)\s*h\s*(\d+)?/i);
            if (hm) {
              totalHoursFromSheet = parseInt(hm[1]) + (parseInt(hm[2]) || 0) / 60;
            } else {
              const n = parseFloat(rawTotal.replace(',', '.'));
              if (!isNaN(n)) totalHoursFromSheet = n;
            }
          }
        }

        // ============ Extract subject hours from data rows ============
        if (rows.length > 1) {
          const header = (rows[0] || []).map(h => (h || '').toLowerCase().trim());
          const iSubj = header.findIndex(h => h.includes('subject') || h.includes('field') || h.includes('matière') || h.includes('topic') || h.includes('category'));
          const iH = header.findIndex(h => h === 'hours' || h === 'h' || h.includes('heure'));
          const iM = header.findIndex(h => h === 'minutes' || h === 'm' || h.includes('min'));
          const iTime = header.findIndex(h => h.includes('time') || h.includes('duration'));

          for (let i = 1; i < rows.length; i++) {
            const cols = rows[i];
            if (iSubj < 0 || !cols[iSubj]) continue;
            const subj = cols[iSubj];
            // Skip if subject looks like "TOTAL" or aggregated label
            if (/^total/i.test(subj.trim())) continue;

            let mins = 0;
            if (iH >= 0 || iM >= 0) {
              const h = parseInt(cols[iH] || 0) || 0;
              const m = parseInt(cols[iM] || 0) || 0;
              mins = h * 60 + m;
            } else if (iTime >= 0) {
              const v = cols[iTime] || '';
              const hm = v.match(/(\d+)h\s*(\d+)?m?/i);
              if (hm) {
                mins = parseInt(hm[1]) * 60 + (parseInt(hm[2]) || 0);
              } else {
                const n = parseFloat(v);
                if (!isNaN(n)) mins = Math.round(n * 60);
              }
            }
            if (mins > 0) {
              subjects[subj] = (subjects[subj] || 0) + mins;
              totalMin += mins;
            }
          }
          if (Object.keys(subjects).length > 0) {
            dataSource = 'sheet';
          }
        }
      }
    } catch (e) {
      console.warn('Sheet CSV:', e);
    }

    // Fallback if no data from sheet
    if (dataSource === 'fallback') {
      subjects = {
        'Computer Science · Technology · Programming': 135 * 60 + 40,
        'Innovation · Design Thinking · Ideation': 30 * 60 + 40,
        'Economics · Marketing · Finance': 25 * 60,
        'Statistics · Mathematics · Data Analysis': 22 * 60,
        'Languages': 21 * 60 + 10,
      };
      totalMin = Object.values(subjects).reduce((a, b) => a + b, 0);
    }

    const sorted = Object.entries(subjects).sort((a, b) => b[1] - a[1]);
    const top5 = sorted.slice(0, 5);
    const maxMin = top5[0] ? top5[0][1] : 1;
    const dict = window.I18N?.[curLang] || {};

    // ============ Update Hours Studied stat ============
    // Priority: total from sheet cell M13 (if available) > sum of all subjects
    const displayedTotalHours = totalHoursFromSheet !== null
      ? Math.round(totalHoursFromSheet)
      : Math.floor(totalMin / 60);
    updateCounterTarget('qs-edu', displayedTotalHours);

    container.innerHTML = `
      <h3 class="edu-bars-title"><span data-i18n="edu.hours">${dict['edu.hours'] || 'HOURS BY FIELD'}</span>${dataSource === 'sheet' ? ' · <span style="color:var(--success)">LIVE</span>' : ''}</h3>
      <div class="edu-bars">
        ${top5.map(([name, mins]) => {
          const pct = Math.max(8, Math.round(mins / maxMin * 100));
          return `<div class="edu-bar">
            <div class="edu-bar-row"><span class="edu-bar-name">${ESC(name)}</span><span class="edu-bar-val">${formatHM(mins)}</span></div>
            <div class="edu-bar-track"><div class="edu-bar-fill" style="width:${pct}%"></div></div>
          </div>`;
        }).join('')}
      </div>
      <div class="edu-source">
        <a href="https://docs.google.com/spreadsheets/d/1ZML9h4zXsLC8KIx6g4DR-lsSJ7VzN-aj-Meo9Lrdt7w/edit" target="_blank" rel="noopener" class="tracker-link">
          <span class="live-dot"></span>
          <span data-i18n="edu.tracker">${dict['edu.tracker'] || 'Live tracker · My Self-Education Sheet'}</span>
        </a>
      </div>
    `;
    container.classList.remove('edu-loading');
    // Render last update date (today's date in dd/mm/yyyy format)
    const updateEl = document.getElementById('edu-update');
    if (updateEl) {
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const yyyy = now.getFullYear();
      // Use data-i18n on the label span so applyLang updates it on language switch
      updateEl.innerHTML = `<span class="edu-update-icon">⟳</span> <span data-i18n="edu.last_update">Last update</span>: <strong>${dd}/${mm}/${yyyy}</strong>`;
    }
    if (window.applyLang) window.applyLang(curLang);
  }

  // ============ CONTACT FORM (EmailJS + validation) ============
  const form = document.getElementById('contactForm');
  const status = document.getElementById('cfStatus');
  const submitBtn = document.getElementById('cfSubmit');

  function showError(field, msg) {
    field.classList.add('invalid');
    const err = form.querySelector(`.form-error[data-for="${field.id}"]`);
    if (err) err.textContent = msg;
  }
  function clearError(field) {
    field.classList.remove('invalid');
    const err = form.querySelector(`.form-error[data-for="${field.id}"]`);
    if (err) err.textContent = '';
  }
  function validateField(field) {
    const v = field.value.trim();
    const dict = window.I18N?.[curLang] || {};
    if (!v) { showError(field, dict['form.required'] || 'This field is required'); return false; }
    if (field.type === 'email') {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(v)) { showError(field, dict['form.email.invalid'] || 'Please enter a valid email'); return false; }
    }
    if (field.id === 'cf-msg' && v.length < 10) {
      showError(field, dict['form.msg.short'] || 'Please write at least 10 characters');
      return false;
    }
    clearError(field);
    return true;
  }

  // Real-time validation
  form.querySelectorAll('input, textarea').forEach((field) => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => { if (field.classList.contains('invalid')) validateField(field); });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.className = 'form-status'; status.textContent = '';

    // Validate all
    let valid = true;
    form.querySelectorAll('input, textarea').forEach((field) => { if (!validateField(field)) valid = false; });
    if (!valid) return;

    const dict = window.I18N?.[curLang] || {};

    // Check EmailJS is configured
    if (EMAILJS_TEMPLATE_ID === 'TEMPLATE_ID_HERE') {
      status.className = 'form-status error';
      status.textContent = '⚠️ EmailJS template ID not set yet. Configure it in app.js.';
      return;
    }
    if (!window.emailjs) {
      status.className = 'form-status error';
      status.textContent = dict['form.error.sdk'] || 'Email service not loaded. Please try again.';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    try {
      const payload = {
        from_name: form.elements['from_name'].value.trim(),
        from_email: form.elements['from_email'].value.trim(),
        subject: form.elements['subject'].value.trim(),
        message: form.elements['message'].value.trim(),
      };
      await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, payload);
      status.className = 'form-status success';
      status.textContent = dict['form.success'] || '✓ Message sent successfully! I will get back to you soon.';
      form.reset();
    } catch (err) {
      console.error('EmailJS error:', err);
      status.className = 'form-status error';
      status.textContent = dict['form.error'] || '✗ Something went wrong. Please email me directly at sidichrifahdmaadh@gmail.com';
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
    }
  });

  // ============ ANIMATED COUNTERS ============
  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target')) || 0;
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1600;
    const start = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(target * eased);
      el.textContent = value + suffix;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  // Helper: update a counter's target and re-animate if already in view
  function updateCounterTarget(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    el.setAttribute('data-target', value);
    if (el.dataset.animated) {
      // Already in view → re-animate from 0 to new value
      el.dataset.animated = '';
      animateCounter(el);
    }
  }
  if ('IntersectionObserver' in window) {
    const counterObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !e.target.dataset.animated) {
          e.target.dataset.animated = '1';
          animateCounter(e.target);
          counterObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('.counter').forEach((el) => counterObs.observe(el));
  } else {
    document.querySelectorAll('.counter').forEach(animateCounter);
  }

  // ============ GITHUB COMMITS (real number) ============
  async function loadGitHubCommits() {
    try {
      // GitHub search API: count commits authored by user
      const res = await fetch('https://api.github.com/search/commits?q=author:sidi-maadh', {
        headers: { 'Accept': 'application/vnd.github.cloak-preview+json' }
      });
      const d = await res.json();
      const count = d.total_count;
      if (typeof count === 'number' && count > 0) {
        const el = document.getElementById('qs-commits');
        if (el) {
          el.setAttribute('data-target', count);
          // If already animated, reset
          if (el.dataset.animated) {
            el.dataset.animated = '';
            animateCounter(el);
          }
        }
      }
    } catch (e) {
      console.warn('GitHub commits:', e);
    }
  }

  // ============ LOAD MORE PROJECTS ============
  const loadMoreBtn = document.getElementById('loadMoreProjects');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      const hidden = document.querySelectorAll('.extra-project[hidden]');
      // Reveal next 2 hidden projects per click
      let revealed = 0;
      for (const el of hidden) {
        if (revealed >= 2) break;
        el.hidden = false;
        // Animate in
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        requestAnimationFrame(() => {
          el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        });
        revealed++;
      }
      // If no more hidden, hide the button
      if (document.querySelectorAll('.extra-project[hidden]').length === 0) {
        loadMoreBtn.style.display = 'none';
      }
    });
  }

  // ============ PROJECT FILTERS ============
  function initProjectFilters() {
    const filterBtns = document.querySelectorAll('.proj-filter');
    const projectCards = document.querySelectorAll('.proj-card');
    const loadMoreBtn = document.getElementById('loadMoreProjects');
    if (!filterBtns.length || !projectCards.length) return;

    function applyFilter(filter) {
      projectCards.forEach(card => {
        const matches = (filter === 'all') || (card.dataset.category === filter);
        if (matches) {
          card.classList.remove('filter-hidden');
          card.removeAttribute('hidden');
          card.style.opacity = '';
          card.style.transform = '';
        } else {
          card.classList.add('filter-hidden');
        }
      });
      // When a specific category is active, hide Load More (all matching are shown)
      if (loadMoreBtn) {
        if (filter === 'all') {
          const stillHidden = Array.from(document.querySelectorAll('.extra-project')).some(
            el => el.hasAttribute('hidden')
          );
          loadMoreBtn.style.display = stillHidden ? '' : 'none';
        } else {
          loadMoreBtn.style.display = 'none';
        }
      }
    }

    // Recompute count badges
    function updateCounts() {
      const counts = { 'all': 0, 'ai-agents': 0, 'ml-dl': 0, 'data': 0, 'web-apps': 0 };
      projectCards.forEach(card => {
        const cat = card.dataset.category;
        counts.all++;
        if (counts[cat] !== undefined) counts[cat]++;
      });
      Object.entries(counts).forEach(([cat, n]) => {
        const badge = document.querySelector(`.pf-count[data-count-for="${cat}"]`);
        if (badge) badge.textContent = n;
      });
    }

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        filterBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        applyFilter(filter);
        setTimeout(() => window.dispatchEvent(new Event('scroll')), 100);
      });
    });

    updateCounts();
  }
  initProjectFilters();

  // ============ DYNAMIC PROJECTS & TECH COUNT ============
  function updateProjectsAndTechCount() {
    // Count all project cards (visible + hidden "extra-project")
    const projectCount = document.querySelectorAll('.proj-card').length;
    updateCounterTarget('qs-projects', projectCount);

    // Count all tech chips
    const techCount = document.querySelectorAll('.chip[data-tech]').length;
    updateCounterTarget('qs-techs', techCount);

    // Years of experience: ~6 months of internships = 1+ year
    updateCounterTarget('qs-years', 1);
  }

  // ============ INIT ============
  try {
    setTheme(localStorage.getItem('theme') || 'dark');
    applyLang(localStorage.getItem('lang') || 'en');
  } catch (_) { setTheme('dark'); applyLang('en'); }
  injectTechLogos();
  updateProjectsAndTechCount();
  initScrollReveal();
  loadCodeforces();
  loadLeetCode();
  loadCertifications();
  loadSelfEducation();
  loadGitHubCommits();
  setTimeout(() => revealItems(tlExp), 200);

  // ============ TIMELINE SCROLL PROGRESS ============
  // The line draws progressively as user scrolls through the timeline
  function initTimelineProgress() {
    const timelines = document.querySelectorAll('.timeline');
    if (!timelines.length) return;

    function update() {
      timelines.forEach(tl => {
        if (tl.hidden || tl.offsetParent === null) return;  // skip if hidden
        const line = tl.querySelector('.tl-line');
        if (!line) return;
        const rect = tl.getBoundingClientRect();
        const vh = window.innerHeight;
        // Anchor: when timeline top reaches 70% of viewport, start drawing
        // Finish when timeline bottom reaches 30% of viewport
        const startPx = rect.top - vh * 0.7;
        const endPx = rect.bottom - vh * 0.3;
        const total = rect.height + vh * 0.4;
        let progress;
        if (startPx >= 0) {
          progress = 0;  // not yet in view
        } else if (endPx <= 0) {
          progress = 1;  // already scrolled past
        } else {
          // currently scrolling through
          progress = Math.min(1, Math.max(0, -startPx / total));
        }
        line.style.setProperty('--tl-progress', progress.toFixed(3));
        if (progress >= 1) line.setAttribute('data-progress', '1');
        else line.removeAttribute('data-progress');
      });
    }

    // Throttle with requestAnimationFrame
    let ticking = false;
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => { update(); ticking = false; });
        ticking = true;
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    // Initial call after DOM settles
    setTimeout(update, 100);
    setTimeout(update, 500);
  }

  // ============ TIMELINE NODES PING (when card enters viewport) ============
  function initTimelineNodes() {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // The 'revealed' class triggers nodePing animation via CSS
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('.tl-item').forEach(item => observer.observe(item));
  }

  initTimelineProgress();
  initTimelineNodes();
  initParallaxScroll();

  // Re-run when toggle switches between Experience / Education
  document.querySelectorAll('.tl-tab, [data-tl-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      setTimeout(() => {
        initTimelineNodes();
        const event = new Event('scroll');
        window.dispatchEvent(event);
      }, 250);
    });
  });

  // ============ PARALLAX SCROLL — progressive movement on cards ============
  function initParallaxScroll() {
    // Skip on mobile (too distracting + perf)
    if (window.matchMedia('(max-width: 820px)').matches) return;
    // Skip if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const selectors = [
      '.proj-card',
      '.cert-row',
      '.edu-bar',
      '.contact-card',
      '.journey-langs-card',
      '.globe-stats',
      '.stat-card',
      '.cert-planned',
      '.about-card',
      '.skill-card',
      '.tl-card',
    ];
    const elements = Array.from(document.querySelectorAll(selectors.join(',')));
    if (!elements.length) return;

    function update() {
      const vh = window.innerHeight;
      const vCenter = vh / 2;
      elements.forEach(el => {
        if (el.offsetParent === null) return; // skip hidden
        const rect = el.getBoundingClientRect();
        // skip if far above or below viewport (perf)
        if (rect.bottom < -vh || rect.top > vh * 2) return;
        // Center of element vs center of viewport
        const elementCenter = rect.top + rect.height / 2;
        // distance from viewport center, normalized to [-1, 1] roughly
        const dist = (elementCenter - vCenter) / vh;
        const clamped = Math.max(-1, Math.min(1, dist));
        // PARALLAX: card moves opposite direction of scroll (subtle)
        // When element is below center, push it DOWN slightly (so it floats up as scroll happens)
        // When above center, push UP — creates the parallax illusion
        const yOffset = clamped * 18; // max ±18px, smooth feel
        el.style.setProperty('--parallax-y', `${yOffset.toFixed(1)}px`);
      });
    }

    let ticking = false;
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          update();
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    // Initial calls so elements get positioned before user scrolls
    setTimeout(update, 100);
    setTimeout(update, 800);
    setTimeout(update, 2000); // after dynamic content loads (certs, edu)
  }
})();
