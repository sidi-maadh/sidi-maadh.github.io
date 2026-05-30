/* ===========================================================
   Portfolio app — Sidi Maadh
   Theme toggle · Language toggle · Multi-page navigation
   =========================================================== */
(() => {
  'use strict';

  // ============ THEME ============
  const themeBtn = document.getElementById('theme-toggle');
  const iconSun = document.getElementById('icon-sun');
  const iconMoon = document.getElementById('icon-moon');

  const setTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    // No localStorage in artifact environments — keep in memory only.
    // For real deployment, you can enable: try { localStorage.setItem('theme', theme); } catch {}
    iconSun.style.display = theme === 'dark' ? 'block' : 'none';
    iconMoon.style.display = theme === 'light' ? 'block' : 'none';
  };

  themeBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    setTheme(current === 'dark' ? 'light' : 'dark');
  });

  // ============ LANGUAGE ============
  const langBtn = document.getElementById('lang-toggle');
  const langLabel = document.getElementById('lang-label');
  let currentLang = 'en';

  const applyLang = (lang) => {
    currentLang = lang;
    document.documentElement.lang = lang;
    langLabel.textContent = lang === 'en' ? 'FR' : 'EN';
    const dict = (window.I18N && window.I18N[lang]) || {};
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) el.textContent = dict[key];
    });
  };

  langBtn.addEventListener('click', () => {
    applyLang(currentLang === 'en' ? 'fr' : 'en');
  });

  // ============ NAVIGATION ============
  const navLinks = document.querySelectorAll('.nav-link, [data-route]');
  const pages = document.querySelectorAll('.page');

  const navigate = (route) => {
    pages.forEach((p) => {
      const match = p.getAttribute('data-page') === route;
      p.hidden = !match;
    });
    document.querySelectorAll('.nav-link').forEach((l) => {
      l.classList.toggle('active', l.getAttribute('data-route') === route);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Update URL hash without scroll-jump
    history.replaceState(null, '', '#' + route);
  };

  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const route = link.getAttribute('data-route');
      if (!route) return;
      e.preventDefault();
      navigate(route);
    });
  });

  // Initial route from URL hash
  const initialRoute = (location.hash || '#home').replace('#', '');
  navigate(['home', 'about', 'projects', 'platforms', 'contact'].includes(initialRoute) ? initialRoute : 'home');

  // ============ MOBILE MENU ============
  const menuBtn = document.getElementById('menu-toggle');
  const navContainer = document.querySelector('.nav-links');
  menuBtn?.addEventListener('click', () => {
    navContainer.style.display = navContainer.style.display === 'flex' ? '' : 'flex';
  });

  // ============ SCROLL REVEAL ============
  const revealEls = document.querySelectorAll('.focus-card, .strip-item');
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = `opacity 0.6s ease ${i * 0.08}s, transform 0.6s ease ${i * 0.08}s`;
      obs.observe(el);
    });
  }

  // ============ INIT ============
  setTheme('dark');
  applyLang('en');
})();
