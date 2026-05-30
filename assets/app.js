/* Portfolio app — Sidi Chrif Ahmed Maadh */
(() => {
  'use strict';

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
      if (dict[k]) el.textContent = dict[k];
    });
    try { localStorage.setItem('lang', lang); } catch (_) {}
  };
  langBtn.addEventListener('click', () => applyLang(curLang === 'en' ? 'fr' : 'en'));

  // ============ BURGER ============
  const burger = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
  // close menu on link click
  navLinks.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
    burger.classList.remove('open');
    navLinks.classList.remove('open');
  }));

  // ============ SCROLL SPY ============
  const sections = document.querySelectorAll('section[id]');
  const topLinks = document.querySelectorAll('.nav-link');
  const bnLinks = document.querySelectorAll('.bn-item');
  const setActive = () => {
    const y = window.scrollY + 120;
    let current = sections[0]?.id;
    sections.forEach((s) => { if (s.offsetTop <= y) current = s.id; });
    topLinks.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + current));
    bnLinks.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + current));
  };
  window.addEventListener('scroll', setActive, { passive: true });
  setActive();

  // ============ SCROLL REVEAL ============
  if ('IntersectionObserver' in window) {
    const els = document.querySelectorAll('.project-card, .side-card, .edu-stat-card, .edu-ring-card, .contact-card, .big-plat, .cert-row, .skill-group');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    els.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(15px)';
      el.style.transition = `opacity 0.5s ease ${Math.min(i * 0.04, 0.4)}s, transform 0.5s ease ${Math.min(i * 0.04, 0.4)}s`;
      obs.observe(el);
    });
  }

  // ============ LIVE SCORES (CF + LC) ============
  // Codeforces public API
  async function loadCodeforces() {
    try {
      const handle = 'sidi_maadh';
      // user.info
      const infoRes = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
      const info = await infoRes.json();
      if (info.status !== 'OK') throw new Error('CF: ' + info.comment);
      const u = info.result[0];
      const rating = u.rating || 0;
      const rank = u.rank || 'unrated';
      // user.status for solved count
      const statRes = await fetch(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=10000`);
      const stat = await statRes.json();
      let solved = 0;
      if (stat.status === 'OK') {
        const set = new Set();
        for (const s of stat.result) {
          if (s.verdict === 'OK') {
            const p = s.problem;
            set.add((p.contestId || 'x') + '-' + p.index);
          }
        }
        solved = set.size;
      }
      document.getElementById('cf-rating').textContent = rating || 'Unrated';
      document.getElementById('cf-solved').textContent = solved + '+';
      document.getElementById('cf-rank').textContent = rank.split(' ').slice(0, 2).join(' ');
    } catch (e) {
      console.warn(e);
      document.getElementById('cf-rating').textContent = 'Unrated';
      document.getElementById('cf-solved').textContent = 'Active';
      document.getElementById('cf-rank').textContent = '—';
    }
  }

  async function loadLeetCode() {
    try {
      const username = 'sidi_maadh';
      // Public unofficial proxy for LeetCode GraphQL (alfa-leetcode-api)
      // Falls back gracefully if the endpoint changes
      const res = await fetch(`https://leetcode-stats-api.herokuapp.com/${username}`);
      const data = await res.json();
      if (data.status !== 'success') throw new Error('LC error');
      document.getElementById('lc-solved').textContent = data.totalSolved + '+';
      document.getElementById('lc-easy').textContent = data.easySolved || 0;
      document.getElementById('lc-medium').textContent = data.mediumSolved || 0;
      document.getElementById('lc-hard').textContent = data.hardSolved || 0;
    } catch (e) {
      console.warn(e);
      document.getElementById('lc-solved').textContent = 'Active';
      document.getElementById('lc-easy').textContent = '—';
      document.getElementById('lc-medium').textContent = '—';
      document.getElementById('lc-hard').textContent = '—';
    }
  }

  // ============ INIT ============
  try {
    const savedTheme = localStorage.getItem('theme');
    const savedLang = localStorage.getItem('lang');
    setTheme(savedTheme || 'dark');
    applyLang(savedLang || 'en');
  } catch (_) {
    setTheme('dark');
    applyLang('en');
  }
  loadCodeforces();
  loadLeetCode();
})();
