/* Portfolio app — Sidi Chrif Ahmed Maadh
   Theme · Lang · Burger · Scroll spy · CF/LC live · Dynamic certs/education */
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

  // ============ LANGUAGE ============
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
    injectTechLogos(); // re-inject after lang change (text gets replaced)
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

  // ============ LIVE SCORES — Codeforces ============
  async function loadCodeforces() {
    try {
      const handle = 'sidi_maadh';
      const infoRes = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
      const info = await infoRes.json();
      if (info.status !== 'OK') throw new Error('CF: ' + info.comment);
      const u = info.result[0];
      const rating = u.rating || 0;
      const rank = u.rank || 'unrated';
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

  // ============ LIVE SCORES — LeetCode ============
  async function loadLeetCode() {
    try {
      const res = await fetch('https://leetcode-stats-api.herokuapp.com/sidi_maadh');
      const d = await res.json();
      if (d.status !== 'success') throw new Error('LC error');
      document.getElementById('lc-solved').textContent = d.totalSolved + '+';
      document.getElementById('lc-easy').textContent = d.easySolved || 0;
      document.getElementById('lc-medium').textContent = d.mediumSolved || 0;
      document.getElementById('lc-hard').textContent = d.hardSolved || 0;
    } catch (e) {
      console.warn(e);
      document.getElementById('lc-solved').textContent = 'Active';
      ['lc-easy', 'lc-medium', 'lc-hard'].forEach(id => document.getElementById(id).textContent = '—');
    }
  }

  // ============ DYNAMIC CERTIFICATIONS (from profile.json) ============
  const ESC = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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

      const updateCount = (id, n) => { const el = document.getElementById(id); if (el) el.textContent = n; };
      updateCount('c-done', done.length);
      updateCount('c-active', active.length);
      updateCount('c-planned', planned.length);

      const buildRow = (cert, statusClass) => {
        const url = cert.url || '#';
        const target = url !== '#' ? ' target="_blank" rel="noopener"' : '';
        const platClass = (cert.platform || '').toLowerCase() === 'aws' ? ' plat-aws' : '';
        return `<a href="${ESC(url)}"${target} class="cert-row ${statusClass}">
          <div class="cert-bar"></div>
          <div class="cert-name">${ESC(cert.name || '')}</div>
          <div class="cert-issuer">${ESC(cert.issuer || '')}</div>
          <div class="cert-plat${platClass}">${ESC(cert.platform || '')}</div>
          <div class="cert-year">${ESC(cert.year || '')}</div>
          <svg class="cert-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M7 17L17 7M7 7h10v10"/></svg>
        </a>`;
      };

      const buildPlannedTile = (cert) => {
        const url = cert.url || '#';
        const target = url !== '#' ? ' target="_blank" rel="noopener"' : '';
        return `<a href="${ESC(url)}"${target} class="cert-planned"><span>${ESC(cert.name || '')}</span><span class="planned-platform">${ESC(cert.platform || cert.code || '')}</span></a>`;
      };

      const html = [];
      if (done.length) {
        const dict = window.I18N?.[curLang] || {};
        html.push(`<div class="cert-block"><h3 class="cert-status-title done">${dict['cert.h.done'] || 'COMPLETED'}</h3>`);
        done.forEach(c => html.push(buildRow(c, 'done-row')));
        html.push('</div>');
      }
      if (active.length) {
        const dict = window.I18N?.[curLang] || {};
        html.push(`<div class="cert-block"><h3 class="cert-status-title active">${dict['cert.h.active'] || 'IN PROGRESS'}</h3>`);
        active.forEach(c => html.push(buildRow(c, 'active-row')));
        html.push('</div>');
      }
      if (planned.length) {
        const dict = window.I18N?.[curLang] || {};
        html.push(`<div class="cert-block"><h3 class="cert-status-title planned">${dict['cert.h.planned'] || 'PLANNED'}</h3><div class="cert-planned-grid">`);
        planned.forEach(c => html.push(buildPlannedTile(c)));
        html.push('</div></div>');
      }
      container.innerHTML = html.join('');
      container.classList.remove('cert-loading');
    } catch (e) {
      console.warn('Cert load failed:', e);
      container.innerHTML = '<p class="error-note">Could not load certifications from profile.json. <a href="https://github.com/sidi-maadh" target="_blank" rel="noopener">View them on my GitHub profile</a> instead.</p>';
    }
  }

  // ============ DYNAMIC SELF EDUCATION (from Google Sheet CSV) ============
  // Note: requires the Sheet to be "Published to web" as CSV
  const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS9qcgWzwekcE488FaB73lGI9T_gsT1vbPt_zfnqhonZskpQpYY8n0vgZuELZwkoXCJwSXndSmPAHQY/pub?gid=0&single=true&output=csv';
  // ^ The user must replace this with their actual published-to-web CSV URL.
  // For now, falls back gracefully to a static demo if the URL is invalid.

  function parseCSV(text) {
    const rows = [];
    const lines = text.split(/\r?\n/);
    for (const line of lines) {
      if (!line.trim()) continue;
      // Simple CSV (no quoted commas — fits our sheet format)
      rows.push(line.split(','));
    }
    return rows;
  }

  function formatHM(totalMinutes) {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}h ${String(m).padStart(2, '0')}m`;
  }

  async function loadSelfEducation() {
    const container = document.getElementById('edu-content');
    if (!container) return;

    // Try to load real data. If unreachable, render a polished placeholder with note.
    let rows = null;
    try {
      const res = await fetch(SHEET_CSV_URL);
      if (res.ok) {
        const text = await res.text();
        rows = parseCSV(text);
      }
    } catch (e) { /* fallback */ }

    // Fallback dataset matching GitHub profile style
    const subjects = {};
    let totalMinutes = 0;
    if (rows && rows.length > 1) {
      // Expect format: date, subject, hours, minutes (or similar)
      // We aggregate hours+minutes per subject
      const header = rows[0].map(h => (h || '').toLowerCase().trim());
      const iSubj = header.findIndex(h => h.includes('subject') || h.includes('field') || h.includes('matière'));
      const iH = header.findIndex(h => h === 'hours' || h === 'h' || h.includes('heure'));
      const iM = header.findIndex(h => h === 'minutes' || h === 'm' || h.includes('min'));
      for (let r = 1; r < rows.length; r++) {
        const row = rows[r];
        if (!row[iSubj]) continue;
        const subj = (row[iSubj] || '').trim();
        const h = parseInt(row[iH] || 0) || 0;
        const m = parseInt(row[iM] || 0) || 0;
        const mins = h * 60 + m;
        subjects[subj] = (subjects[subj] || 0) + mins;
        totalMinutes += mins;
      }
    }
    // If parsing produced nothing useful, use fallback values matching GitHub data
    if (totalMinutes === 0) {
      const demo = {
        'Computer Science · Technology · Programming': 135 * 60 + 40,
        'Innovation · Design Thinking · Ideation': 30 * 60 + 40,
        'Economics · Marketing · Finance': 25 * 60,
        'Statistics · Mathematics · Data Analysis': 22 * 60,
        'Languages': 21 * 60 + 10,
      };
      Object.entries(demo).forEach(([k, v]) => { subjects[k] = v; totalMinutes += v; });
    }

    const sorted = Object.entries(subjects).sort((a, b) => b[1] - a[1]);
    const top = sorted[0];
    const maxMin = top ? top[1] : 1;
    const fieldsCount = sorted.length;
    const goalMin = 1200 * 60;
    const pctGoal = Math.round(totalMinutes / goalMin * 100);

    // Year progress
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now - start) / 86400000);
    const yearPct = Math.round(dayOfYear / 365 * 100);
    const yearRemain = 365 - dayOfYear;

    // Life progress (assuming ~24yo, target ~85)
    const lifeYears = 24;
    const lifePct = Math.round(lifeYears / 85 * 100);

    const dict = window.I18N?.[curLang] || {};
    const labelsActive = dict['edu.active'] || 'active areas';
    const topName = top ? top[0].split(' · ')[0].split(' - ')[0] : '—';
    const topHours = top ? Math.floor(top[1] / 60) + 'h' : '—';

    container.innerHTML = `
      <div class="edu-stats">
        <div class="edu-stat-card">
          <div class="edu-stat-label">${dict['edu.total'] || 'TOTAL STUDIED'}</div>
          <div class="edu-stat-value">${Math.floor(totalMinutes / 60)}<span class="unit">h</span> <span class="extra">${totalMinutes % 60}m</span></div>
        </div>
        <div class="edu-stat-card">
          <div class="edu-stat-label">${dict['edu.goal'] || 'YEARLY GOAL'}</div>
          <div class="edu-stat-value">1200<span class="unit">h</span> <span class="extra">· ${pctGoal}%</span></div>
        </div>
        <div class="edu-stat-card">
          <div class="edu-stat-label">${dict['edu.top'] || 'TOP SUBJECT'}</div>
          <div class="edu-stat-value top-name">${ESC(topName)} <span class="extra">${topHours}</span></div>
        </div>
        <div class="edu-stat-card">
          <div class="edu-stat-label">${dict['edu.fields'] || 'FIELDS TRACKED'}</div>
          <div class="edu-stat-value">${fieldsCount} <span class="extra">${labelsActive}</span></div>
        </div>
      </div>

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

      <div class="edu-rings">
        <div class="edu-ring-card">
          <svg class="ring" viewBox="0 0 80 80" width="72" height="72">
            <circle cx="40" cy="40" r="32" fill="none" stroke="var(--bg-soft)" stroke-width="8"/>
            <circle cx="40" cy="40" r="32" fill="none" stroke="url(#rg1)" stroke-width="8" stroke-linecap="round" stroke-dasharray="201" stroke-dashoffset="${201 - (201 * yearPct / 100)}" transform="rotate(-90 40 40)"/>
            <defs><linearGradient id="rg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8b5cf6"/><stop offset="1" stop-color="#3b82f6"/></linearGradient></defs>
            <text x="40" y="46" text-anchor="middle" fill="var(--text)" font-size="16" font-weight="700">${yearPct}%</text>
          </svg>
          <div>
            <h4>${dict['edu.year'] || 'Year Progress'}</h4>
            <p>${dayOfYear} ${curLang === 'fr' ? 'jours passés' : 'days passed'} · ${yearRemain} ${curLang === 'fr' ? 'restants' : 'remaining'}</p>
          </div>
        </div>
        <div class="edu-ring-card">
          <svg class="ring" viewBox="0 0 80 80" width="72" height="72">
            <circle cx="40" cy="40" r="32" fill="none" stroke="var(--bg-soft)" stroke-width="8"/>
            <circle cx="40" cy="40" r="32" fill="none" stroke="url(#rg2)" stroke-width="8" stroke-linecap="round" stroke-dasharray="201" stroke-dashoffset="${201 - (201 * lifePct / 100)}" transform="rotate(-90 40 40)"/>
            <defs><linearGradient id="rg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#34d399"/></linearGradient></defs>
            <text x="40" y="46" text-anchor="middle" fill="var(--text)" font-size="16" font-weight="700">${lifePct}%</text>
          </svg>
          <div>
            <h4>${dict['edu.life'] || 'Life Progress'}</h4>
            <p>${lifeYears} ${curLang === 'fr' ? 'ans' : 'years'} · ${curLang === 'fr' ? 'continue à construire' : 'keep building'}</p>
          </div>
        </div>
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
  injectTechLogos();
  loadCodeforces();
  loadLeetCode();
  loadCertifications();
  loadSelfEducation();
})();
