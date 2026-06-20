/* ============================================================
   PulseCare — SCRIPT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
 
  /* ---------- LOADER ---------- */
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('hide'), 500);
  });
  // Fallback in case 'load' already fired
  setTimeout(() => loader && loader.classList.add('hide'), 2500);
 
  /* ---------- NAVBAR: scroll state, mobile toggle, smooth links ---------- */
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
 
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 12);
  }, { passive: true });
 
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
 
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
 
  /* ---------- NAV ACTIVE-LINK HIGHLIGHTING ---------- */
  const navAnchors = document.querySelectorAll('[data-nav]');
  const sectionsForNav = Array.from(navAnchors).map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
 
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
 
  sectionsForNav.forEach(sec => navObserver.observe(sec));
 
  /* ---------- SCROLL REVEAL ---------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
 
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
 
  /* ---------- ANIMATED STAT COUNTERS ---------- */
  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();
 
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
 
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
 
  document.querySelectorAll('.stat-number').forEach(el => counterObserver.observe(el));
 
  /* ============================================================
     LIVE HEALTH DASHBOARD (simulated data)
     ============================================================ */
  const RING_CIRCUMFERENCE = 326.7; // 2 * PI * 52
 
  const ringConfig = {
    heart:      { min: 50,  max: 140, el: null },
    spo2:       { min: 0,   max: 100, el: null },
    temp:       { min: 34,  max: 40,  el: null },
    compliance: { min: 0,   max: 100, el: null }
  };
 
  document.querySelectorAll('.vital-ring').forEach(ring => {
    const key = ring.dataset.ring;
    if (ringConfig[key]) ringConfig[key].el = ring.querySelector('.ring-fg');
  });
 
  function setRing(key, value) {
    const cfg = ringConfig[key];
    if (!cfg || !cfg.el) return;
    const pct = Math.max(0, Math.min(1, (value - cfg.min) / (cfg.max - cfg.min)));
    const offset = RING_CIRCUMFERENCE * (1 - pct);
    cfg.el.style.strokeDashoffset = offset;
  }
 
  const heartRateEl   = document.getElementById('heartRate');
  const spo2El         = document.getElementById('spo2');
  const temperatureEl = document.getElementById('temperature');
  const complianceEl  = document.getElementById('compliance');
  const deviceDot      = document.getElementById('deviceDot');
  const deviceStatusText = document.getElementById('deviceStatusText');
  const emergencyStatus = document.getElementById('emergencyStatus');
  const emergencyText   = document.getElementById('emergencyText');
  const trendLine        = document.getElementById('trendLine');
  const activityFeed    = document.getElementById('activityFeed');
 
  let state = { heart: 72, spo2: 98, temp: 36.8, compliance: 94 };
  let trendHistory = Array.from({ length: 24 }, () => state.heart);
  let emergencyMode = false;
 
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
 
  function randomWalk(value, step, min, max) {
    return clamp(value + (Math.random() - 0.5) * step, min, max);
  }
 
  function renderVitals() {
    heartRateEl.textContent = Math.round(state.heart);
    spo2El.textContent = Math.round(state.spo2);
    temperatureEl.textContent = state.temp.toFixed(1);
    complianceEl.textContent = Math.round(state.compliance);
 
    setRing('heart', state.heart);
    setRing('spo2', state.spo2);
    setRing('temp', state.temp);
    setRing('compliance', state.compliance);
  }
 
  function renderTrend() {
    const w = 600, h = 160, pad = 10;
    const max = Math.max(...trendHistory, 100);
    const min = Math.min(...trendHistory, 50);
    const range = (max - min) || 1;
    const stepX = (w - pad * 2) / (trendHistory.length - 1);
 
    const points = trendHistory.map((v, i) => {
      const x = pad + i * stepX;
      const y = h - pad - ((v - min) / range) * (h - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
 
    trendLine.setAttribute('points', points);
  }
 
  function addActivity(icon, text) {
    const li = document.createElement('li');
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    li.innerHTML = `<i class="fa-solid ${icon}"></i><span>${text}<time>${timeStr}</time></span>`;
    activityFeed.prepend(li);
    while (activityFeed.children.length > 6) {
      activityFeed.removeChild(activityFeed.lastChild);
    }
  }
 
  function triggerEmergencyPulse(message) {
    emergencyMode = true;
    emergencyStatus.classList.remove('safe');
    emergencyStatus.classList.add('alert');
    emergencyText.textContent = 'ALERT';
    addActivity('fa-triangle-exclamation', message);
 
    setTimeout(() => {
      emergencyMode = false;
      emergencyStatus.classList.remove('alert');
      emergencyStatus.classList.add('safe');
      emergencyText.textContent = 'SAFE';
      addActivity('fa-circle-check', 'Status resolved — vitals back to normal range');
    }, 5000);
  }
 
  const activityMessages = [
    { icon: 'fa-heart-pulse', text: 'Heart rate steady within normal range' },
    { icon: 'fa-satellite-dish', text: 'Wristband synced with PulseCare cloud' },
    { icon: 'fa-pills', text: 'Morning dose dispensed on schedule' },
    { icon: 'fa-droplet', text: 'SpO\u2082 reading stable' },
    { icon: 'fa-shield-heart', text: 'Routine vitals check complete — all clear' },
    { icon: 'fa-temperature-half', text: 'Temperature within healthy range' }
  ];
  let msgIndex = 0;
 
  function tickDashboard() {
    if (!emergencyMode) {
      state.heart = randomWalk(state.heart, 4, 58, 102);
      state.spo2 = randomWalk(state.spo2, 0.6, 95, 100);
      state.temp = randomWalk(state.temp, 0.12, 36.2, 37.4);
      state.compliance = randomWalk(state.compliance, 0.8, 88, 99);
    } else {
      state.heart = randomWalk(state.heart, 8, 105, 138);
      state.spo2 = randomWalk(state.spo2, 0.8, 88, 93);
    }
 
    trendHistory.push(Math.round(state.heart));
    trendHistory.shift();
 
    renderVitals();
    renderTrend();
 
    if (!emergencyMode) {
      msgIndex = (msgIndex + 1) % activityMessages.length;
      if (Math.random() > 0.35) {
        const m = activityMessages[msgIndex];
        addActivity(m.icon, m.text);
      }
 
      // Rare simulated emergency event for demo purposes
      if (Math.random() < 0.045) {
        triggerEmergencyPulse('Elevated heart rate detected — monitoring closely');
      }
    }
  }
 
  // Initial render
  renderVitals();
  renderTrend();
  addActivity('fa-power-off', 'Dashboard connected — streaming live data');
 
  setInterval(tickDashboard, 3000);
 
  // Device status flicker for realism (brief "syncing" blips)
  setInterval(() => {
    deviceStatusText.textContent = 'Device Status: SYNCING';
    deviceDot.style.background = 'var(--secondary)';
    setTimeout(() => {
      deviceStatusText.textContent = 'Device Status: CONNECTED';
      deviceDot.style.background = 'var(--accent)';
    }, 900);
  }, 14000);
 
});
