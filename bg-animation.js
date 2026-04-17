/* ===== SHIRO IT — Gaming Background Canvas Animation ===== */
(function () {
  const canvas = document.getElementById("bgCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let W, H, mouseX = -9999, mouseY = -9999;
  let particles = [], meteors = [], rings = [], hexes = [];
  let frame = 0;

  // Track mouse for interactive particles
  window.addEventListener("mousemove", e => { mouseX = e.clientX; mouseY = e.clientY; });

  function isLight() { return document.body.classList.contains("light"); }

  function palette() {
    return isLight()
      ? { a: [37, 99, 235], b: [239, 68, 68] }
      : { a: [56, 189, 248], b: [248, 113, 113] };
  }

  function rgba([r, g, b], a) { return `rgba(${r},${g},${b},${a})`; }

  // ── Particle network ──
  function initParticles() {
    const count = Math.floor((W * H) / 14000);
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2.5 + 1,
      col: Math.random() > 0.5 ? "a" : "b",
      pulse: Math.random() * Math.PI * 2,
    }));
  }

  function drawParticles(p) {
    const LINK_DIST = 140;
    const MOUSE_DIST = 180;

    particles.forEach((pt, i) => {
      // Move
      pt.x += pt.vx; pt.y += pt.vy;
      pt.pulse += 0.02;
      if (pt.x < 0) pt.x = W; if (pt.x > W) pt.x = 0;
      if (pt.y < 0) pt.y = H; if (pt.y > H) pt.y = 0;

      // Mouse attraction
      const dx = mouseX - pt.x, dy = mouseY - pt.y;
      const dm = Math.sqrt(dx * dx + dy * dy);
      if (dm < MOUSE_DIST) {
        const force = (MOUSE_DIST - dm) / MOUSE_DIST * 0.012;
        pt.vx += dx * force; pt.vy += dy * force;
        // Dampen
        pt.vx *= 0.97; pt.vy *= 0.97;
      }

      const alpha = (Math.sin(pt.pulse) * 0.3 + 0.7);
      const col = p[pt.col];
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.r * alpha, 0, Math.PI * 2);
      ctx.fillStyle = rgba(col, alpha * 0.85);
      ctx.fill();

      // Glow dot
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.r * 2.5, 0, Math.PI * 2);
      const g = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, pt.r * 2.5);
      g.addColorStop(0, rgba(col, 0.15));
      g.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = g;
      ctx.fill();

      // Lines to nearby particles
      for (let j = i + 1; j < particles.length; j++) {
        const pt2 = particles[j];
        const dx2 = pt.x - pt2.x, dy2 = pt.y - pt2.y;
        const dist = Math.sqrt(dx2 * dx2 + dy2 * dy2);
        if (dist < LINK_DIST) {
          const lineAlpha = (1 - dist / LINK_DIST) * 0.3;
          const lg = ctx.createLinearGradient(pt.x, pt.y, pt2.x, pt2.y);
          lg.addColorStop(0, rgba(p[pt.col], lineAlpha));
          lg.addColorStop(1, rgba(p[pt2.col], lineAlpha));
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y);
          ctx.lineTo(pt2.x, pt2.y);
          ctx.strokeStyle = lg;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    });
  }

  // ── HUD grid overlay ──
  function drawGrid(p) {
    const gridSize = 80;
    const t = frame * 0.003;
    ctx.save();
    ctx.lineWidth = 0.35;

    for (let x = 0; x < W; x += gridSize) {
      const alpha = 0.04 + Math.sin(x / W * Math.PI + t) * 0.02;
      ctx.strokeStyle = rgba(p.a, alpha);
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += gridSize) {
      const alpha = 0.04 + Math.sin(y / H * Math.PI + t) * 0.02;
      ctx.strokeStyle = rgba(p.b, alpha);
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Scanning horizontal line
    const scanY = (H * ((Math.sin(t * 0.4) * 0.5 + 0.5)));
    const sg = ctx.createLinearGradient(0, scanY - 40, 0, scanY + 40);
    sg.addColorStop(0, rgba(p.a, 0));
    sg.addColorStop(0.5, rgba(p.a, 0.07));
    sg.addColorStop(1, rgba(p.a, 0));
    ctx.fillStyle = sg;
    ctx.fillRect(0, scanY - 40, W, 80);

    ctx.restore();
  }

  // ── Floating hex glyphs ──
  function initHexes() {
    hexes = Array.from({ length: 12 }, () => spawnHex());
  }
  function spawnHex() {
    return {
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 30 + 15,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.006,
      life: Math.random() * 0.08 + 0.04,
      col: Math.random() > 0.5 ? "a" : "b",
    };
  }
  function drawHex(h, col) {
    ctx.save();
    ctx.translate(h.x, h.y);
    ctx.rotate(h.rot);
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      i === 0 ? ctx.moveTo(Math.cos(angle) * h.r, Math.sin(angle) * h.r)
              : ctx.lineTo(Math.cos(angle) * h.r, Math.sin(angle) * h.r);
    }
    ctx.closePath();
    ctx.strokeStyle = rgba(col, h.life * 1.5);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = rgba(col, h.life * 0.08);
    ctx.fill();
    ctx.restore();
  }

  // ── Meteors ──
  function spawnMeteor() {
    const p = palette();
    const col = Math.random() > 0.5 ? p.a : p.b;
    meteors.push({ x: Math.random() * W * 1.5, y: 0, vx: -3 - Math.random() * 4, vy: 3 + Math.random() * 5, len: 100 + Math.random() * 100, life: 1, decay: 0.015 + Math.random() * 0.015, color: col });
  }

  // ── Pulse rings ──
  function spawnRing() {
    const p = palette();
    const col = Math.random() > 0.5 ? p.a : p.b;
    rings.push({ x: Math.random() * W, y: Math.random() * H, r: 0, maxR: 80 + Math.random() * 120, life: 1, decay: 0.006 + Math.random() * 0.006, color: col });
  }

  setInterval(spawnMeteor, 1200);
  setInterval(spawnRing, 2200);

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    initParticles();
    initHexes();
  }

  function draw() {
    frame++;
    const p = palette();
    ctx.clearRect(0, 0, W, H);

    // Grid
    drawGrid(p);

    // Particle network
    drawParticles(p);

    // Hexes
    hexes.forEach((h, i) => {
      h.x += h.vx; h.y += h.vy; h.rot += h.rotV;
      if (h.x < -50 || h.x > W + 50 || h.y < -50 || h.y > H + 50) hexes[i] = spawnHex();
      drawHex(h, p[h.col]);
    });

    // Rings
    rings = rings.filter(r => r.life > 0);
    rings.forEach(r => {
      r.r += 1.8; r.life -= r.decay;
      const progress = r.r / r.maxR;
      const alpha = r.life * (1 - progress) * 0.6;
      ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(r.color, alpha); ctx.lineWidth = 1.5; ctx.stroke();
      if (r.r >= r.maxR) r.life = 0;
    });

    // Meteors
    meteors = meteors.filter(m => m.life > 0);
    meteors.forEach(m => {
      const mg = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 12, m.y - m.vy * 12);
      mg.addColorStop(0, rgba(m.color, Math.min(m.life * 1.2, 0.9)));
      mg.addColorStop(1, rgba(m.color, 0));
      ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x - m.vx * 12, m.y - m.vy * 12);
      ctx.strokeStyle = mg; ctx.lineWidth = 2; ctx.stroke();
      // Bright head
      ctx.beginPath(); ctx.arc(m.x, m.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = rgba(m.color, m.life); ctx.fill();
      m.x += m.vx; m.y += m.vy; m.life -= m.decay;
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  resize();
  draw();
})();
