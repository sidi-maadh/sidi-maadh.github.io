/* Tech logos — SVG paths for each technology */
window.TECH_LOGOS = {
  // AI / ML
  "PyTorch": '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="#ee4c2c" d="M16.6 5.5l-1.2 1.2a6.5 6.5 0 11-7.4 0L4.4 3a11 11 0 1014.4.4z"/><circle cx="16" cy="6.5" r="1" fill="#ee4c2c"/></svg>',
  "TensorFlow": '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="#ff6f00" d="M2 4l10-2 10 2-10 18z"/><path fill="#fff" fill-opacity="0.3" d="M12 2v20l-3-5.5V6L7 5.4 12 4z"/></svg>',
  "scikit-learn": '<svg viewBox="0 0 24 24" width="18" height="18"><circle cx="7" cy="8" r="2.5" fill="#f7931e"/><circle cx="17" cy="8" r="2.5" fill="#3499cd"/><circle cx="12" cy="17" r="2.5" fill="#f7931e"/><path stroke="#7a7a7a" stroke-width="1" d="M7 8h10M7 8l5 9M17 8l-5 9"/></svg>',
  "Hugging Face": '<svg viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="12" r="10" fill="#ffd21e"/><circle cx="9" cy="10" r="1.3" fill="#0a0c10"/><circle cx="15" cy="10" r="1.3" fill="#0a0c10"/><path stroke="#0a0c10" stroke-width="1.5" stroke-linecap="round" fill="none" d="M8 14q4 3 8 0"/></svg>',
  "LangChain": '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="#00a67e" d="M9 4a4 4 0 014 4v2h-3v-2a1 1 0 00-2 0v5a1 1 0 002 0H8a4 4 0 110-8h1zM15 20a4 4 0 01-4-4v-2h3v2a1 1 0 002 0v-5a1 1 0 00-2 0h3a4 4 0 110 8h-2z"/></svg>',
  "OpenCV": '<svg viewBox="0 0 24 24" width="18" height="18"><circle cx="6" cy="14" r="3.5" fill="none" stroke="#5c3ee8" stroke-width="2.5"/><circle cx="18" cy="14" r="3.5" fill="none" stroke="#5c3ee8" stroke-width="2.5"/><circle cx="12" cy="6" r="3.5" fill="none" stroke="#5c3ee8" stroke-width="2.5"/></svg>',
  "Pandas": '<svg viewBox="0 0 24 24" width="18" height="18"><rect x="4" y="3" width="3" height="18" fill="#150458"/><rect x="10.5" y="3" width="3" height="11" fill="#150458"/><rect x="10.5" y="17" width="3" height="4" fill="#e70488"/><rect x="17" y="3" width="3" height="7" fill="#150458"/></svg>',
  "NumPy": '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="#4d77cf" d="M12 2L3 7v10l9 5 9-5V7z" fill-opacity="0.3"/><path fill="#4d77cf" d="M12 2L3 7l9 5 9-5z"/><path fill="#013243" d="M3 7v10l9 5V12z" fill-opacity="0.7"/></svg>',

  // Languages
  "Python": '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="#3776ab" d="M12 2c-4 0-4 2-4 2v3h4v1H5s-3 0-3 5 3 5 3 5h2v-3s0-3 3-3h6s3 0 3-3V4s0-2-3-2z"/><circle cx="9" cy="4.5" r="1" fill="#fff"/><path fill="#ffd43b" d="M12 22c4 0 4-2 4-2v-3h-4v-1h7s3 0 3-5-3-5-3-5h-2v3s0 3-3 3H8s-3 0-3 3v5s0 2 3 2z"/><circle cx="15" cy="19.5" r="1" fill="#fff"/></svg>',
  "C++": '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="#00599c" d="M12 2L3 7v10l9 5 9-5V7z"/><text x="12" y="15" text-anchor="middle" fill="#fff" font-size="7" font-weight="700" font-family="sans-serif">C++</text></svg>',
  "Java": '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="#ed8b00" d="M8 4c-2 4 2 6 2 8 1-3-1-5 0-8zM7 14c-3 1 1 3 5 3s8-2 5-3c1 2-3 2-5 2s-6 0-5-2z"/><ellipse cx="12" cy="19" rx="6" ry="1.5" fill="#5382a1"/></svg>',
  "JavaScript": '<svg viewBox="0 0 24 24" width="18" height="18"><rect width="24" height="24" rx="3" fill="#f7df1e"/><text x="12" y="17" text-anchor="middle" fill="#0a0c10" font-size="11" font-weight="800" font-family="sans-serif">JS</text></svg>',
  "TypeScript": '<svg viewBox="0 0 24 24" width="18" height="18"><rect width="24" height="24" rx="3" fill="#3178c6"/><text x="12" y="17" text-anchor="middle" fill="#fff" font-size="11" font-weight="800" font-family="sans-serif">TS</text></svg>',
  "Dart": '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="#0175c2" d="M8 3l-4 4v10l4 4h10l4-4V7l-4-4z"/><path fill="#13b9fd" d="M4 7l8 8 6-6-4-4H8z" fill-opacity="0.7"/></svg>',

  // Full-Stack · Mobile
  "React": '<svg viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="12" r="2" fill="#61dafb"/><ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#61dafb" stroke-width="1"/><ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#61dafb" stroke-width="1" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#61dafb" stroke-width="1" transform="rotate(120 12 12)"/></svg>',
  "Spring Boot": '<svg viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="12" r="10" fill="#6db33f"/><path fill="#fff" d="M16 7c-2-1-5-1-7 1-3 3-2 7 0 9 2 1 4 1 6 0l-1-1c-2 1-3 0-4-1-2-2-2-5 0-6 2-2 5-1 6 0z"/></svg>',
  "Django": '<svg viewBox="0 0 24 24" width="18" height="18"><rect width="24" height="24" rx="3" fill="#092e20"/><text x="12" y="16" text-anchor="middle" fill="#fff" font-size="10" font-weight="700" font-family="serif">dj</text></svg>',
  "Flutter": '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="#54c5f8" d="M14 2L4 12l4 4 14-14z"/><path fill="#01579b" d="M14 22l-6-6 4-4 10 10z"/><path fill="#29b6f6" d="M8 16l4 4 6-6-4-4z"/></svg>',
  "Tailwind": '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="#38b2ac" d="M7 9c2-4 5-4 8-2 2 1 2 3 4 3 2 0 3-1 4-3-2 4-5 4-8 2-2-1-2-3-4-3-2 0-3 1-4 3zm-4 7c2-4 5-4 8-2 2 1 2 3 4 3 2 0 3-1 4-3-2 4-5 4-8 2-2-1-2-3-4-3-2 0-3 1-4 3z"/></svg>',

  // Data · DevOps · Cloud
  "PostgreSQL": '<svg viewBox="0 0 24 24" width="18" height="18"><ellipse cx="12" cy="12" rx="10" ry="10" fill="#316192"/><path fill="#fff" d="M8 9c0-2 2-3 4-3s4 1 4 3-2 3-4 3-4-1-4-3zm0 5c0-1 2-2 4-2s4 1 4 2-2 2-4 2-4-1-4-2z" fill-opacity="0.8"/></svg>',
  "MySQL": '<svg viewBox="0 0 24 24" width="18" height="18"><ellipse cx="12" cy="6" rx="9" ry="3" fill="#00758f"/><path fill="#00758f" d="M3 6v6c0 1.5 4 3 9 3s9-1.5 9-3V6c0 1.5-4 3-9 3S3 7.5 3 6zm0 6v6c0 1.5 4 3 9 3s9-1.5 9-3v-6c0 1.5-4 3-9 3s-9-1.5-9-3z" fill-opacity="0.8"/></svg>',
  "Firebase": '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="#ffa000" d="M5 18l3-15 4 6z"/><path fill="#f57c00" d="M5 18l11-9 4 9z"/><path fill="#ffca28" d="M5 18l11-13v6z" fill-opacity="0.7"/></svg>',
  "Docker": '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="#2496ed" d="M2 13h20c0 4-3 7-7 7H9c-4 0-7-3-7-7zm2-1V8h3v4H4zm4 0V8h3v4H8zm4 0V8h3v4h-3zm4-4V4h3v4h-3zm-4 0V4h3v4h-3zm-4 0V4h3v4H8z"/></svg>',
  "Git": '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="#f05032" d="M22 12L12 2 2 12l10 10z"/><circle cx="9" cy="9" r="1.5" fill="#fff"/><circle cx="15" cy="9" r="1.5" fill="#fff"/><circle cx="12" cy="15" r="1.5" fill="#fff"/><path stroke="#fff" stroke-width="1" d="M9 9l3 6M15 9l-3 6"/></svg>',
  "AWS": '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="#ff9900" d="M6 16c2 1 4 2 6 2s4-1 6-2v-1c-2 1-4 1-6 1s-4 0-6-1z"/><text x="12" y="12" text-anchor="middle" fill="#252f3e" font-size="6" font-weight="800" font-family="sans-serif">aws</text></svg>',
};
