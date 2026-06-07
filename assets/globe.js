/* ============================================================
   3D GLOBE — Earth-like with country borders, dynamic projects from DOM
   ============================================================ */
(function () {
  'use strict';

  // Country database: ISO2 → lat/lng/name/continent/flag
  const COUNTRIES = {
    MR: { lat: 18.0735, lng: -15.9582, name: 'Mauritania',   continent: 'africa',   flag: '🇲🇷' },
    TN: { lat: 36.8065, lng: 10.1815,  name: 'Tunisia',      continent: 'africa',   flag: '🇹🇳' },
    MA: { lat: 31.7917, lng: -7.0926,  name: 'Morocco',      continent: 'africa',   flag: '🇲🇦' },
    EG: { lat: 26.8206, lng: 30.8025,  name: 'Egypt',        continent: 'africa',   flag: '🇪🇬' },
    ZA: { lat: -30.5595,lng: 22.9375,  name: 'South Africa', continent: 'africa',   flag: '🇿🇦' },
    AE: { lat: 24.4539, lng: 54.3773,  name: 'UAE',          continent: 'asia',     flag: '🇦🇪' },
    SA: { lat: 23.8859, lng: 45.0792,  name: 'Saudi Arabia', continent: 'asia',     flag: '🇸🇦' },
    IN: { lat: 20.5937, lng: 78.9629,  name: 'India',        continent: 'asia',     flag: '🇮🇳' },
    JP: { lat: 36.2048, lng: 138.2529, name: 'Japan',        continent: 'asia',     flag: '🇯🇵' },
    CN: { lat: 35.8617, lng: 104.1954, name: 'China',        continent: 'asia',     flag: '🇨🇳' },
    FR: { lat: 46.6034, lng: 1.8883,   name: 'France',       continent: 'europe',   flag: '🇫🇷' },
    DE: { lat: 51.1657, lng: 10.4515,  name: 'Germany',      continent: 'europe',   flag: '🇩🇪' },
    GB: { lat: 55.3781, lng: -3.4360,  name: 'UK',           continent: 'europe',   flag: '🇬🇧' },
    NL: { lat: 52.1326, lng: 5.2913,   name: 'Netherlands',  continent: 'europe',   flag: '🇳🇱' },
    ES: { lat: 40.4637, lng: -3.7492,  name: 'Spain',        continent: 'europe',   flag: '🇪🇸' },
    IT: { lat: 41.8719, lng: 12.5674,  name: 'Italy',        continent: 'europe',   flag: '🇮🇹' },
    CA: { lat: 56.1304, lng: -106.3468,name: 'Canada',       continent: 'namerica', flag: '🇨🇦' },
    US: { lat: 37.0902, lng: -95.7129, name: 'USA',          continent: 'namerica', flag: '🇺🇸' },
    BR: { lat: -14.2350,lng: -51.9253, name: 'Brazil',       continent: 'samerica', flag: '🇧🇷' },
    AU: { lat: -25.2744,lng: 133.7751, name: 'Australia',    continent: 'oceania',  flag: '🇦🇺' },
  };

  // Continent colors — distinct from "Project location" yellow and "Visited" bright red
  const CONTINENT_COLORS = {
    africa:   '#a855f7',  // violet (was red — conflict with Visited red markers)
    asia:     '#f97316',  // orange
    europe:   '#3b82f6',  // blue
    namerica: '#10b981',  // green
    samerica: '#ec4899',  // pink
    oceania:  '#06b6d4',  // cyan
  };

  // Marker colors per mode (distinct from continent colors)
  const PROJECT_MARKER_COLOR = '#fbbf24';   // gold
  const VISITED_MARKER_COLOR = '#ff3838';   // bright red — maximum contrast on land/ocean

  // Visited countries with year (or 'home' for origin)
  const VISITED = [
    { iso: 'MR', year: 'home' },   // Home country (since birth)
    { iso: 'TN', year: '2025' },   // Visited 2025
    { iso: 'MA', year: '2024' },   // Visited 2024
  ];

  // ============ Build the projects list dynamically from DOM ============
  function buildProjectsFromDOM() {
    const cards = document.querySelectorAll('.proj-card[data-country]');
    const projects = [];
    cards.forEach(c => {
      const iso = c.getAttribute('data-country');
      if (COUNTRIES[iso]) projects.push({ ...COUNTRIES[iso], iso });
    });
    return projects;
  }

  function buildVisitedFromList() {
    return VISITED.map(v => ({
      ...COUNTRIES[v.iso],
      iso: v.iso,
      year: v.year,
    })).filter(c => c.name);
  }

  // Convert lat/lng → 3D position on sphere
  function latLngToVec3(lat, lng, r) {
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lng + 180) * Math.PI / 180;
    return {
      x: -r * Math.sin(phi) * Math.cos(theta),
      y:  r * Math.cos(phi),
      z:  r * Math.sin(phi) * Math.sin(theta),
    };
  }

  // ============ STATE ============
  let scene, camera, renderer, sphere, atm, bordersGroup;
  let markersGroup, arcsGroup;
  let currentMode = 'projects';
  let initialized = false;
  let manualRotX = 0;
  let rotVy = 0;
  let isDragging = false;
  let prevX = 0, prevY = 0;
  const autoRotSpeed = 0.0015;
  const RADIUS = 95;
  let THREE = null;
  let countriesLines = null;
  let countriesPolys = null;

  // ============ ENTRY POINT ============
  async function loadThreeAndInit() {
    if (initialized) return;
    initialized = true;

    const container = document.getElementById('journey-globe');
    if (!container) return;

    container.innerHTML = '<div style="position:absolute;inset:0;display:grid;place-items:center;color:rgba(255,255,255,0.4);font-size:13px;font-family:JetBrains Mono,monospace">loading globe…</div>';

    try {
      THREE = await import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js');
    } catch (e) {
      console.warn('Globe: Three.js failed to load', e);
      renderFallback(container);
      return;
    }

    // Fetch country borders (TopoJSON)
    try {
      const res = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
      const topo = await res.json();
      const parsed = parseTopojson(topo);
      countriesLines = parsed.lines;
      countriesPolys = parsed.polygons;
    } catch (e) {
      console.warn('Globe: borders failed to load', e);
    }

    container.innerHTML = '';

    const testCanvas = document.createElement('canvas');
    if (!(testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl'))) {
      renderFallback(container);
      return;
    }

    initScene(container);
    setMode(currentMode, true);  // true = skip animation on init
    setupInteraction(renderer.domElement);
    animate();
    wireToggle();
  }

  // ============ SCENE ============
  function initScene(container) {
    scene = new THREE.Scene();
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
    camera.position.set(0, 0, 260);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    container.appendChild(renderer.domElement);

    // ============ Earth-like ocean sphere ============
    const sphereGeo = new THREE.SphereGeometry(RADIUS, 64, 64);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x0c2841,  // Deep ocean blue
      transparent: true,
      opacity: 0.95,
    });
    sphere = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphere);

    // Subtle equator/meridian wireframe for depth (very faint)
    const wireGeo = new THREE.SphereGeometry(RADIUS + 0.05, 16, 12);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x4a90e2,
      wireframe: true,
      transparent: true,
      opacity: 0.08,
    });
    scene.add(new THREE.Mesh(wireGeo, wireMat));

    // ============ Continents as filled green polygons ============
    bordersGroup = new THREE.Group();
    if (countriesPolys && countriesLines) {
      drawContinents(bordersGroup);  // async — fires and forgets, continents appear progressively
      drawBorders(bordersGroup);
    }
    scene.add(bordersGroup);

    // ============ Atmosphere glow ============
    const atmGeo = new THREE.SphereGeometry(RADIUS * 1.08, 48, 48);
    const atmMat = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,  // Light blue atmosphere
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
    });
    atm = new THREE.Mesh(atmGeo, atmMat);
    scene.add(atm);

    // Markers + arcs group
    markersGroup = new THREE.Group();
    arcsGroup = new THREE.Group();
    scene.add(markersGroup);
    scene.add(arcsGroup);

    // Initial rotation to face Africa
    const initialRotY = -0.3;
    sphere.rotation.y = initialRotY;
    bordersGroup.rotation.y = initialRotY;
    markersGroup.rotation.y = initialRotY;
    arcsGroup.rotation.y = initialRotY;

    window.addEventListener('resize', () => {
      const nw = container.clientWidth, nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    });
  }

  // ============ TOPOJSON PARSER ============
  function parseTopojson(topo) {
    const arcs = topo.arcs;
    const transform = topo.transform;
    const tx = transform.translate, sc = transform.scale;

    function decodeArc(arcIdx) {
      const reverse = arcIdx < 0;
      if (reverse) arcIdx = ~arcIdx;
      const arc = arcs[arcIdx];
      let x = 0, y = 0;
      const coords = [];
      for (let i = 0; i < arc.length; i++) {
        x += arc[i][0];
        y += arc[i][1];
        coords.push([x * sc[0] + tx[0], y * sc[1] + tx[1]]);
      }
      return reverse ? coords.reverse() : coords;
    }

    const countries = topo.objects.countries.geometries;
    const lines = [];      // For border outlines
    const polygons = [];   // For filled continent surfaces

    countries.forEach(country => {
      const polys = country.type === 'Polygon' ? [country.arcs] : country.arcs;
      polys.forEach(poly => {
        // Outer ring only (first ring) for fill
        if (poly.length === 0) return;
        const outerRing = poly[0];
        const ringCoords = [];
        outerRing.forEach(arcIdx => {
          const decoded = decodeArc(arcIdx);
          const start = ringCoords.length > 0 ? 1 : 0;
          for (let i = start; i < decoded.length; i++) ringCoords.push(decoded[i]);
        });
        if (ringCoords.length > 2) polygons.push(ringCoords);

        // All rings for border lines
        poly.forEach(ring => {
          const coords = [];
          ring.forEach(arcIdx => {
            const decoded = decodeArc(arcIdx);
            const start = coords.length > 0 ? 1 : 0;
            for (let i = start; i < decoded.length; i++) coords.push(decoded[i]);
          });
          if (coords.length > 1) lines.push(coords);
        });
      });
    });
    return { lines, polygons };
  }

  // Filled continents using earcut + subdivided triangles (proper spherical fit)
  async function drawContinents(group) {
    let earcut;
    try {
      const mod = await import('https://cdn.jsdelivr.net/npm/earcut@2.2.4/+esm');
      earcut = mod.default || mod;
    } catch (e) {
      console.warn('Globe: earcut failed, using fan fallback', e);
      drawContinentsFan(group);
      return;
    }

    const mat = new THREE.MeshBasicMaterial({
      color: 0x16a34a,           // Vibrant land green
      transparent: false,         // OPAQUE — no see-through to ocean
      opacity: 1.0,
      side: THREE.FrontSide,      // FrontSide only — back faces won't show through
      depthWrite: true,
    });

    // Helper: subdivide a triangle on the sphere by midpoint splitting.
    // Each level multiplies triangle count by 4. For ~3km-resolution borders we need 2 levels.
    function subdivideTriangle(a, b, c, levels, out) {
      if (levels === 0) {
        out.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
        return;
      }
      // Midpoints in lat/lng space, then projected onto sphere
      const ab = midpointOnSphere(a, b);
      const bc = midpointOnSphere(b, c);
      const ca = midpointOnSphere(c, a);
      subdivideTriangle(a, ab, ca, levels - 1, out);
      subdivideTriangle(b, bc, ab, levels - 1, out);
      subdivideTriangle(c, ca, bc, levels - 1, out);
      subdivideTriangle(ab, bc, ca, levels - 1, out);
    }

    function midpointOnSphere(p1, p2) {
      // Average and re-project onto sphere of correct radius
      const mx = (p1[0] + p2[0]) / 2;
      const my = (p1[1] + p2[1]) / 2;
      const mz = (p1[2] + p2[2]) / 2;
      const len = Math.sqrt(mx * mx + my * my + mz * mz);
      const r = RADIUS + 0.4;  // Hug the surface
      return [mx / len * r, my / len * r, mz / len * r];
    }

    // Country surface radius — just outside the ocean sphere
    const SURFACE_R = RADIUS + 0.4;

    countriesPolys.forEach(ring => {
      // Keep more vertices for better edge fidelity
      const sampled = [];
      const step = Math.max(1, Math.floor(ring.length / 120));
      for (let i = 0; i < ring.length; i += step) sampled.push(ring[i]);
      if (sampled.length < 3) return;

      // ===== Skip Antarctica (creates artifacts around the south pole) =====
      // Detect if the polygon is mostly below -60° latitude → Antarctica
      let southCount = 0;
      sampled.forEach(([, lat]) => { if (lat < -60) southCount++; });
      if (southCount / sampled.length > 0.5) return;

      // ===== Fix for Russia & other antimeridian-crossing polygons =====
      // Detect if the ring crosses the 180° line (longitude wraps from +180 to -180)
      // Split it into two rings: one for east hemisphere, one for west
      let minLng = Infinity, maxLng = -Infinity;
      sampled.forEach(([lng]) => {
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
      });
      const crossesAntimeridian = (maxLng - minLng) > 180;

      const ringsToRender = [];
      if (crossesAntimeridian) {
        // Split: shift negative longitudes to be > 180 to make a continuous polygon, then split
        const east = sampled.filter(([lng]) => lng >= 0).slice();
        const west = sampled.filter(([lng]) => lng < 0).slice();
        if (east.length >= 3) ringsToRender.push(east);
        if (west.length >= 3) ringsToRender.push(west);
      } else {
        ringsToRender.push(sampled);
      }

      ringsToRender.forEach(rng => {
        if (rng.length < 3) return;
        const flat = [];
        rng.forEach(([lng, lat]) => { flat.push(lng, lat); });

        const triangles = earcut(flat);
        if (triangles.length === 0) return;

        const positions = [];
        for (let i = 0; i < triangles.length; i += 3) {
          const i0 = triangles[i];
          const i1 = triangles[i + 1];
          const i2 = triangles[i + 2];
          const p0 = latLngToVec3(flat[i0 * 2 + 1], flat[i0 * 2], SURFACE_R);
          const p1 = latLngToVec3(flat[i1 * 2 + 1], flat[i1 * 2], SURFACE_R);
          const p2 = latLngToVec3(flat[i2 * 2 + 1], flat[i2 * 2], SURFACE_R);
          const a = [p0.x, p0.y, p0.z];
          const b = [p1.x, p1.y, p1.z];
          const c = [p2.x, p2.y, p2.z];
          // 3 levels = 64 triangles per original → smoother on big countries like Russia
          subdivideTriangle(a, b, c, 3, positions);
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geo.computeVertexNormals();
        group.add(new THREE.Mesh(geo, mat));
      });
    });
  }

  // Fallback fan triangulation (used if earcut fails to load)
  function drawContinentsFan(group) {
    const mat = new THREE.MeshBasicMaterial({
      color: 0x16a34a,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide,
    });
    countriesPolys.forEach(ring => {
      const sampled = [];
      const step = Math.max(1, Math.floor(ring.length / 60));
      for (let i = 0; i < ring.length; i += step) sampled.push(ring[i]);
      if (sampled.length < 3) return;
      let cx = 0, cy = 0;
      sampled.forEach(([lng, lat]) => { cx += lng; cy += lat; });
      cx /= sampled.length; cy /= sampled.length;
      const positions = [];
      const centerVec = latLngToVec3(cy, cx, RADIUS + 0.2);
      for (let i = 0; i < sampled.length; i++) {
        const [lng1, lat1] = sampled[i];
        const [lng2, lat2] = sampled[(i + 1) % sampled.length];
        const v1 = latLngToVec3(lat1, lng1, RADIUS + 0.2);
        const v2 = latLngToVec3(lat2, lng2, RADIUS + 0.2);
        positions.push(centerVec.x, centerVec.y, centerVec.z);
        positions.push(v1.x, v1.y, v1.z);
        positions.push(v2.x, v2.y, v2.z);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geo.computeVertexNormals();
      group.add(new THREE.Mesh(geo, mat));
    });
  }

  function drawBorders(group) {
    const mat = new THREE.LineBasicMaterial({
      color: 0xbbf7d0,  // Lighter green-white border
      transparent: true,
      opacity: 0.55,
    });
    countriesLines.forEach(line => {
      // Skip Antarctica lines (mostly south of -60° latitude)
      let southCount = 0;
      line.forEach(([, lat]) => { if (lat < -60) southCount++; });
      if (southCount / line.length > 0.5) return;

      const points = line.map(([lng, lat]) => {
        // Above the continent surface (which is at RADIUS + 0.4)
        const v = latLngToVec3(lat, lng, RADIUS + 0.6);
        return new THREE.Vector3(v.x, v.y, v.z);
      });
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      group.add(new THREE.Line(geo, mat));
    });
  }

  // ============ MARKERS ============
  function clearGroup(g) {
    while (g.children.length) {
      const c = g.children[0];
      g.remove(c);
      if (c.geometry) c.geometry.dispose();
      if (c.material) c.material.dispose();
    }
  }

  // Store clickable markers' data for raycaster + selected country state
  let clickableMarkers = [];
  let selectedCountry = null;
  let isTransitioning = false;

  function setMode(mode, skipAnimation) {
    if (isTransitioning && !skipAnimation) return;
    currentMode = mode;
    clickableMarkers = [];

    // Animate out: shrink existing markers + arcs, then rebuild
    const oldMarkers = markersGroup.children.slice();
    const oldArcs = arcsGroup.children.slice();

    if (oldMarkers.length === 0 || skipAnimation) {
      buildMarkersForMode(mode);
      return;
    }

    isTransitioning = true;
    const startT = performance.now();
    const fadeDuration = 350;

    function fadeOut() {
      const elapsed = performance.now() - startT;
      const p = Math.min(elapsed / fadeDuration, 1);
      const scale = 1 - p;

      oldMarkers.forEach(m => {
        m.scale.setScalar(scale);
        if (m.material) m.material.opacity = (m.material.opacity || 1) * (1 - p * 0.5);
      });
      oldArcs.forEach(a => {
        if (a.material) a.material.opacity = 0.7 * (1 - p);
      });

      if (p < 1) {
        requestAnimationFrame(fadeOut);
      } else {
        clearGroup(markersGroup);
        clearGroup(arcsGroup);
        buildMarkersForMode(mode);
        // Animate in: scale from 0 to 1
        animateMarkersIn();
        isTransitioning = false;
      }
    }
    fadeOut();
  }

  function animateMarkersIn() {
    const newMarkers = markersGroup.children.slice();
    newMarkers.forEach((m, i) => {
      m.scale.setScalar(0);
      m.userData.targetScale = 1;
      m.userData.delay = i * 40;  // Stagger entrance
    });
    const startT = performance.now();
    const inDuration = 400;
    function fadeIn() {
      const elapsed = performance.now() - startT;
      let allDone = true;
      newMarkers.forEach(m => {
        const t = Math.max(0, elapsed - (m.userData.delay || 0));
        const p = Math.min(t / inDuration, 1);
        // Easing: bounce-out
        const eased = 1 - Math.pow(1 - p, 3);
        m.scale.setScalar(eased);
        if (p < 1) allDone = false;
      });
      if (!allDone) requestAnimationFrame(fadeIn);
    }
    fadeIn();
  }

  function buildMarkersForMode(mode) {
    const data = mode === 'projects' ? buildProjectsFromDOM() : buildVisitedFromList();
    const markerColor = mode === 'projects' ? PROJECT_MARKER_COLOR : VISITED_MARKER_COLOR;
    const markerColorHex = parseInt(markerColor.replace('#', '0x'));

    // Group by lat/lng for stacking
    const grouped = {};
    data.forEach(loc => {
      const key = `${loc.lat},${loc.lng}`;
      if (!grouped[key]) grouped[key] = { ...loc, count: 0 };
      grouped[key].count++;
    });

    const uniqueLocs = Object.values(grouped);

    uniqueLocs.forEach(loc => {
      const pos = latLngToVec3(loc.lat, loc.lng, RADIUS + 1.2);
      const size = 1.6 + Math.min(loc.count - 1, 3) * 0.4;

      // Inner dot (clickable)
      const dotGeo = new THREE.SphereGeometry(size, 16, 16);
      const dotMat = new THREE.MeshBasicMaterial({ color: markerColorHex });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.set(pos.x, pos.y, pos.z);
      dot.userData.countryData = loc;  // Store for raycaster
      dot.userData.mode = mode;
      markersGroup.add(dot);
      clickableMarkers.push(dot);

      // Pulsing halo (also clickable, larger hit area)
      const haloGeo = new THREE.SphereGeometry(size * 2.3, 16, 16);
      const haloMat = new THREE.MeshBasicMaterial({
        color: markerColorHex,
        transparent: true,
        opacity: 0.32,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.copy(dot.position);
      halo.userData.phase = Math.random() * Math.PI * 2;
      halo.userData.countryData = loc;
      halo.userData.mode = mode;
      markersGroup.add(halo);
      clickableMarkers.push(halo);
      dot.userData.halo = halo;
    });

    // Arcs from Mauritania (home) to each other
    const home = uniqueLocs.find(l => l.iso === 'MR');
    if (home) {
      uniqueLocs.forEach(loc => {
        if (loc.iso !== 'MR') {
          arcsGroup.add(makeArc(home, loc, markerColorHex));
        }
      });
    }

    updateLegend(mode);
    updateStats(mode, data);
    hideCountryCard();  // Clear any previous selection
  }

  function makeArc(from, to, color) {
    const s = latLngToVec3(from.lat, from.lng, RADIUS + 0.8);
    const e = latLngToVec3(to.lat, to.lng, RADIUS + 0.8);
    const sv = new THREE.Vector3(s.x, s.y, s.z);
    const ev = new THREE.Vector3(e.x, e.y, e.z);
    const mid = sv.clone().add(ev).multiplyScalar(0.5);
    const dist = sv.distanceTo(ev);
    mid.normalize().multiplyScalar(RADIUS + dist * 0.5);
    const curve = new THREE.QuadraticBezierCurve3(sv, mid, ev);
    const pts = curve.getPoints(48);
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({
      color: color, transparent: true, opacity: 0.7,
    });
    return new THREE.Line(geo, mat);
  }

  function updateLegend(mode) {
    const legend = document.getElementById('journey-legend');
    if (!legend) return;
    const dict = (window.I18N && window.I18N[document.documentElement.lang || 'en']) || {};
    if (mode === 'projects') {
      legend.innerHTML = `<span class="legend-item"><span class="legend-dot" style="background:${PROJECT_MARKER_COLOR}"></span><span>${dict['jrn.l.project'] || 'Project location'}</span></span>`;
    } else {
      legend.innerHTML = `<span class="legend-item"><span class="legend-dot" style="background:${VISITED_MARKER_COLOR}"></span><span>${dict['jrn.l.visited'] || 'Visited country'}</span></span>`;
    }
  }

  function updateStats(mode, data) {
    const container = document.getElementById('globe-stats');
    if (!container) return;
    const dict = (window.I18N && window.I18N[document.documentElement.lang || 'en']) || {};

    // Group by continent
    const byCont = {};
    data.forEach(loc => {
      byCont[loc.continent] = (byCont[loc.continent] || 0) + 1;
    });

    const uniqueCountries = new Set(data.map(l => l.name));
    const totalLabel = mode === 'projects'
      ? (dict['jrn.stats.projects'] || 'Projects')
      : (dict['jrn.stats.countries'] || 'Countries');
    const total = mode === 'projects' ? data.length : uniqueCountries.size;

    const continentLabels = {
      africa: dict['jrn.continent.africa']    || 'Africa',
      asia: dict['jrn.continent.asia']        || 'Asia',
      europe: dict['jrn.continent.europe']    || 'Europe',
      namerica: dict['jrn.continent.namerica']|| 'North America',
      samerica: dict['jrn.continent.samerica']|| 'South America',
      oceania: dict['jrn.continent.oceania']  || 'Oceania',
    };

    const totalHTML = `
      <div class="gs-total">
        <span class="gs-total-num">${total}</span>
        <span class="gs-total-label">${totalLabel}</span>
      </div>
    `;
    const continentsHTML = Object.entries(byCont).map(([key, count]) => `
      <div class="gs-cont">
        <span class="gs-cont-name">${continentLabels[key]}</span>
        <span class="gs-cont-dot-sep"></span>
        <span class="gs-cont-count">${count}</span>
      </div>
    `).join('');

    container.innerHTML = totalHTML + `<div class="gs-continents">${continentsHTML}</div>`;
  }

  function wireToggle() {
    document.querySelectorAll('.globe-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.globe-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        setMode(btn.dataset.mode);
      });
    });
    const langBtn = document.getElementById('lang-toggle');
    if (langBtn) {
      langBtn.addEventListener('click', () => {
        setTimeout(() => {
          updateLegend(currentMode);
          const data = currentMode === 'projects' ? buildProjectsFromDOM() : buildVisitedFromList();
          updateStats(currentMode, data);
        }, 100);
      });
    }
  }

  // ============ INTERACTION ============
  function setupInteraction(dom) {
    dom.style.cursor = 'grab';
    let dragMoved = false;
    let pointerDownPos = null;

    function down(e) {
      isDragging = true;
      dragMoved = false;
      dom.style.cursor = 'grabbing';
      const cx = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const cy = e.clientY || (e.touches && e.touches[0].clientY) || 0;
      prevX = cx;
      prevY = cy;
      pointerDownPos = { x: cx, y: cy };
    }
    function move(e) {
      if (!isDragging) return;
      const cx = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const cy = e.clientY || (e.touches && e.touches[0].clientY) || 0;
      const dx = cx - prevX, dy = cy - prevY;
      if (pointerDownPos) {
        const totalDx = Math.abs(cx - pointerDownPos.x);
        const totalDy = Math.abs(cy - pointerDownPos.y);
        if (totalDx > 5 || totalDy > 5) dragMoved = true;
      }
      rotVy = dx * 0.005;
      manualRotX = Math.max(-Math.PI/2.2, Math.min(Math.PI/2.2, manualRotX + dy * 0.005));
      prevX = cx; prevY = cy;
    }
    function up(e) {
      isDragging = false;
      dom.style.cursor = 'grab';

      // If it wasn't a drag, treat as click → raycast
      if (!dragMoved && pointerDownPos) {
        const cx = (e.clientX !== undefined ? e.clientX :
                   (e.changedTouches && e.changedTouches[0].clientX)) || pointerDownPos.x;
        const cy = (e.clientY !== undefined ? e.clientY :
                   (e.changedTouches && e.changedTouches[0].clientY)) || pointerDownPos.y;
        handleClick(cx, cy, dom);
      }
      pointerDownPos = null;
    }

    dom.addEventListener('mousedown', down);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    dom.addEventListener('touchstart', down, { passive: true });
    window.addEventListener('touchmove', move, { passive: true });
    window.addEventListener('touchend', up);
  }

  // ============ CLICK / RAYCASTER ============
  let raycaster, ndc;
  function handleClick(clientX, clientY, dom) {
    if (!raycaster) raycaster = new THREE.Raycaster();
    if (!ndc) ndc = new THREE.Vector2();
    const rect = dom.getBoundingClientRect();
    ndc.x =  ((clientX - rect.left) / rect.width)  * 2 - 1;
    ndc.y = -((clientY - rect.top)  / rect.height) * 2 + 1;
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObjects(clickableMarkers, false);
    if (hits.length > 0) {
      const hit = hits[0].object;
      const loc = hit.userData.countryData;
      if (loc) {
        showCountryCard(loc, hit.userData.mode);
        rotateToCountry(loc);
      }
    } else {
      // Clicked on empty area → hide the card
      hideCountryCard();
    }
  }

  // ============ ROTATE TO COUNTRY ============
  let rotateTween = null;
  function rotateToCountry(loc) {
    // Compute the target rotation Y so this country faces the camera.
    // Country is currently at world position relative to group rotation.
    // We want sphere.rotation.y to be such that the country lands at lng ≈ 0 facing camera.
    // After our latLngToVec3 mapping, target world rotation Y = -((lng+180)*PI/180) - PI/2 (empirical)
    // Simpler: aim so the dot's world position has x≈0, z>0 (toward camera).
    const targetRotY = -((loc.lng + 180) * Math.PI / 180) - Math.PI / 2;
    const targetRotX = (loc.lat * Math.PI / 180) * 0.7;  // Slight tilt towards latitude

    // Normalize current Y to nearest equivalent within ±PI of target
    const groups = [sphere, bordersGroup, markersGroup, arcsGroup];
    const currentY = sphere.rotation.y;
    let delta = ((targetRotY - currentY + Math.PI) % (Math.PI * 2)) - Math.PI;
    const finalY = currentY + delta;

    if (rotateTween) cancelAnimationFrame(rotateTween);
    const startT = performance.now();
    const duration = 1100;
    const startY = currentY;
    const startX = manualRotX;

    function tick() {
      const elapsed = performance.now() - startT;
      const p = Math.min(elapsed / duration, 1);
      // Ease in-out cubic
      const eased = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      const newY = startY + (finalY - startY) * eased;
      const newX = startX + (targetRotX - startX) * eased;
      groups.forEach(g => {
        if (!g) return;
        g.rotation.y = newY;
      });
      manualRotX = newX;
      if (p < 1) {
        rotateTween = requestAnimationFrame(tick);
      } else {
        rotateTween = null;
      }
    }
    rotateTween = requestAnimationFrame(tick);
  }

  // ============ COUNTRY INFO CARD ============
  function showCountryCard(loc, mode) {
    const card = document.getElementById('country-card');
    if (!card) return;
    selectedCountry = loc;
    const dict = (window.I18N && window.I18N[document.documentElement.lang || 'en']) || {};
    const flag = loc.flag || '🌍';

    let infoHTML;
    if (mode === 'projects') {
      const labelProjects = loc.count > 1
        ? (dict['jrn.card.projects'] || 'projects')
        : (dict['jrn.card.project'] || 'project');
      infoHTML = `
        <div class="cc-info">
          <span class="cc-count">${loc.count}</span>
          <span class="cc-label">${labelProjects}</span>
        </div>
      `;
    } else {
      // Visited mode: show year or "home"
      const yearText = loc.year === 'home'
        ? (dict['jrn.card.home'] || 'Home country')
        : `${dict['jrn.card.visited'] || 'Visited'} ${loc.year}`;
      infoHTML = `<div class="cc-info"><span class="cc-year">${yearText}</span></div>`;
    }

    card.innerHTML = `
      <button type="button" class="cc-close" aria-label="Close">×</button>
      <div class="cc-flag">${flag}</div>
      <div class="cc-name">${loc.name}</div>
      ${infoHTML}
    `;
    card.classList.add('visible');

    // Wire close button
    const closeBtn = card.querySelector('.cc-close');
    if (closeBtn) closeBtn.addEventListener('click', hideCountryCard);
  }

  function hideCountryCard() {
    const card = document.getElementById('country-card');
    if (!card) return;
    card.classList.remove('visible');
    selectedCountry = null;
  }

  // ============ ANIMATION ============
  let frame = 0;
  function animate() {
    frame++;
    const targetVy = isDragging ? rotVy : autoRotSpeed;
    [sphere, bordersGroup, markersGroup, arcsGroup].forEach(g => {
      if (!g) return;
      g.rotation.y += targetVy;
      g.rotation.x = manualRotX;
    });
    if (!isDragging) {
      rotVy *= 0.92;
      if (Math.abs(rotVy) < autoRotSpeed) rotVy = 0;
    }
    markersGroup.children.forEach(m => {
      if (m.userData.halo) {
        const halo = m.userData.halo;
        const t = frame * 0.04 + halo.userData.phase;
        halo.scale.setScalar(1 + Math.sin(t) * 0.18);
        halo.material.opacity = 0.22 + 0.15 * Math.cos(t);
      }
    });
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  // ============ FALLBACK ============
  function renderFallback(container) {
    container.innerHTML = `
      <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
        <defs>
          <radialGradient id="oceanG" cx="40%" cy="40%">
            <stop offset="0" stop-color="#1e3a8a"/>
            <stop offset="1" stop-color="#0c1e3f"/>
          </radialGradient>
        </defs>
        <circle cx="200" cy="200" r="180" fill="url(#oceanG)" stroke="#60a5fa" stroke-opacity="0.4" stroke-width="1"/>
        <ellipse cx="200" cy="200" rx="180" ry="60" fill="none" stroke="#60a5fa" stroke-opacity="0.12"/>
        <ellipse cx="200" cy="200" rx="180" ry="120" fill="none" stroke="#60a5fa" stroke-opacity="0.10"/>
        <!-- Continents (green) -->
        <path d="M 175 165 Q 220 160 240 195 Q 245 240 220 260 Q 195 275 180 255 Q 160 235 165 200 Z" fill="#1f5f3e" stroke="#86efac" stroke-opacity="0.5" stroke-width="0.6"/>
        <path d="M 185 140 Q 235 135 245 158 Q 240 175 220 175 Q 195 175 188 158 Z" fill="#1f5f3e" stroke="#86efac" stroke-opacity="0.5" stroke-width="0.6"/>
        <path d="M 245 140 Q 295 135 310 170 Q 315 195 290 200 Q 260 200 248 180 Q 240 160 245 140 Z" fill="#1f5f3e" stroke="#86efac" stroke-opacity="0.5" stroke-width="0.6"/>
        <path d="M 95 145 Q 140 142 150 175 Q 148 200 125 205 Q 100 200 92 175 Z" fill="#1f5f3e" stroke="#86efac" stroke-opacity="0.5" stroke-width="0.6"/>
        <!-- Project markers -->
        <circle cx="195" cy="225" r="6" fill="#fbbf24"><animate attributeName="r" values="6;9;6" dur="2s" repeatCount="indefinite"/></circle>
        <circle cx="215" cy="195" r="5" fill="#fbbf24"/>
        <circle cx="245" cy="170" r="5" fill="#fbbf24"/>
        <circle cx="225" cy="160" r="5" fill="#fbbf24"/>
        <circle cx="125" cy="160" r="5" fill="#fbbf24"/>
      </svg>
    `;
    updateStatsFallback('projects');
    document.querySelectorAll('.globe-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.globe-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMode = btn.dataset.mode;
        updateStatsFallback(currentMode);
        const legend = document.getElementById('journey-legend');
        if (legend) {
          const dict = (window.I18N && window.I18N[document.documentElement.lang || 'en']) || {};
          if (currentMode === 'projects') {
            legend.innerHTML = `<span class="legend-item"><span class="legend-dot" style="background:${PROJECT_MARKER_COLOR}"></span><span>${dict['jrn.l.project'] || 'Project location'}</span></span>`;
          } else {
            legend.innerHTML = `<span class="legend-item"><span class="legend-dot" style="background:${VISITED_MARKER_COLOR}"></span><span>${dict['jrn.l.visited'] || 'Visited country'}</span></span>`;
          }
        }
      });
    });
  }

  function updateStatsFallback(mode) {
    const data = mode === 'projects' ? buildProjectsFromDOM() : buildVisitedFromList();
    updateStats(mode, data);
  }

  // ============ LAZY INIT ============
  function init() {
    const target = document.getElementById('journey-globe');
    if (!target) return;
    if (!('IntersectionObserver' in window)) { loadThreeAndInit(); return; }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { loadThreeAndInit(); obs.disconnect(); }
      });
    }, { rootMargin: '200px 0px' });
    obs.observe(target);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
