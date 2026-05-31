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
      if (dict[k]) el.textContent = dict[k];
    });
    document.querySelectorAll('[data-i18n-ph]').forEach((el) => {
      const k = el.getAttribute('data-i18n-ph');
      if (dict[k]) el.placeholder = dict[k];
    });
    injectTechLogos();
    try { localStorage.setItem('lang', lang); } catch (_) {}
  };
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
    container.querySelectorAll('[data-reveal]').forEach((el, i) => {
      el.classList.remove('reveal');
      setTimeout(() => el.classList.add('reveal'), 60 + i * 100);
    });
  }

  // ============ SCROLL REVEAL ============
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('reveal'); obs.unobserve(e.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll('[data-reveal]').forEach((el) => obs.observe(el));
  } else {
    document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('reveal'));
  }

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
      const el = document.getElementById('qs-cf');
      if (el) el.textContent = solved ? solved + '+' : 'Active';
    } catch (e) {
      console.warn('CF:', e);
      const el = document.getElementById('qs-cf');
      if (el) el.textContent = 'Active';
    }
  }

  // ============ LIVE SCORES — LeetCode ============
  async function loadLeetCode() {
    try {
      const res = await fetch('https://leetcode-stats-api.herokuapp.com/sidi_maadh');
      const d = await res.json();
      const el = document.getElementById('qs-lc');
      if (el) el.textContent = d.status === 'success' ? (d.totalSolved + '+') : 'Active';
    } catch (e) {
      console.warn('LC:', e);
      const el = document.getElementById('qs-lc');
      if (el) el.textContent = 'Active';
    }
  }

  // ============ DYNAMIC CERTIFICATIONS ============
  const ESC = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  function resolveCertUrl(cert) {
    if (cert.url) return cert.url;
    if (CERT_URLS[cert.name]) return CERT_URLS[cert.name];
    return null; // no link
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
      const qsCert = document.getElementById('qs-cert');
      if (qsCert) qsCert.textContent = done.length + '+';

      const buildRow = (cert, sc) => {
        const url = resolveCertUrl(cert);
        const tag = url ? 'a' : 'div';
        const hrefAttr = url ? ` href="${ESC(url)}" target="_blank" rel="noopener"` : '';
        const platClass = (cert.platform || '').toLowerCase() === 'aws' ? ' plat-aws' : '';
        const arrow = url ? '<svg class="cert-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M7 17L17 7M7 7h10v10"/></svg>' : '<span></span>';
        return `<${tag}${hrefAttr} class="cert-row ${sc}"><div class="cert-bar"></div><div class="cert-name">${ESC(cert.name || '')}</div><div class="cert-issuer">${ESC(cert.issuer || '')}</div><div class="cert-plat${platClass}">${ESC(cert.platform || '')}</div><div class="cert-year">${ESC(cert.year || '')}</div>${arrow}</${tag}>`;
      };
      const buildTile = (cert) => {
        const url = resolveCertUrl(cert);
        const tag = url ? 'a' : 'div';
        const hrefAttr = url ? ` href="${ESC(url)}" target="_blank" rel="noopener"` : '';
        return `<${tag}${hrefAttr} class="cert-planned"><span>${ESC(cert.name || '')}</span><span class="planned-platform">${ESC(cert.platform || cert.code || '')}</span></${tag}>`;
      };

      const dict = window.I18N?.[curLang] || {};
      const MAX_DONE = 5;
      const html = [];

      if (done.length) {
        html.push(`<div class="cert-block"><h3 class="cert-status-title done">${dict['cert.h.done'] || 'COMPLETED'}</h3>`);
        const visible = done.slice(0, MAX_DONE);
        visible.forEach(c => html.push(buildRow(c, 'done-row')));
        if (done.length > MAX_DONE) {
          html.push(`<div class="cert-view-more"><a href="https://github.com/sidi-maadh#certifications" target="_blank" rel="noopener">+${done.length - MAX_DONE} ${dict['cert.more'] || 'more on GitHub'} <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M7 17L17 7M7 7h10v10"/></svg></a></div>`);
        }
        html.push('</div>');
      }
      if (active.length) {
        html.push(`<div class="cert-block"><h3 class="cert-status-title active">${dict['cert.h.active'] || 'IN PROGRESS'}</h3>`);
        active.forEach(c => html.push(buildRow(c, 'active-row')));
        html.push('</div>');
      }
      if (planned.length) {
        html.push(`<div class="cert-block"><h3 class="cert-status-title planned">${dict['cert.h.planned'] || 'PLANNED'}</h3><div class="cert-planned-grid">`);
        planned.forEach(c => html.push(buildTile(c)));
        html.push('</div></div>');
      }
      container.innerHTML = html.join('');
      container.classList.remove('cert-loading');
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

    // Fallback data (consistent with GitHub profile)
    const subjects = {
      'Computer Science · Technology · Programming': 135 * 60 + 40,
      'Innovation · Design Thinking · Ideation': 30 * 60 + 40,
      'Economics · Marketing · Finance': 25 * 60,
      'Statistics · Mathematics · Data Analysis': 22 * 60,
      'Languages': 21 * 60 + 10,
    };
    const sorted = Object.entries(subjects).sort((a, b) => b[1] - a[1]);
    const maxMin = sorted[0][1];
    const totalMin = sorted.reduce((s, [, v]) => s + v, 0);
    const dict = window.I18N?.[curLang] || {};

    // Update quick-stat card
    const qsEdu = document.getElementById('qs-edu');
    if (qsEdu) qsEdu.textContent = Math.floor(totalMin / 60) + 'h+';

    container.innerHTML = `
      <h3 class="edu-bars-title">${dict['edu.hours'] || 'HOURS BY FIELD'}</h3>
      <div class="edu-bars">
        ${sorted.slice(0, 5).map(([name, mins]) => {
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
          <span>${dict['edu.tracker'] || 'Live tracker · My Self-Education Sheet'}</span>
        </a>
      </div>
    `;
    container.classList.remove('edu-loading');
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

  // ============ INIT ============
  try {
    setTheme(localStorage.getItem('theme') || 'dark');
    applyLang(localStorage.getItem('lang') || 'en');
  } catch (_) { setTheme('dark'); applyLang('en'); }
  injectTechLogos();
  loadCodeforces();
  loadLeetCode();
  loadCertifications();
  loadSelfEducation();
  setTimeout(() => revealItems(tlExp), 200);
})();
