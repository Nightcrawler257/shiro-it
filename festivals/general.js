/* ===== GENERAL/PARTY ANIMATION ===== */
(function () {
  const zones = document.querySelectorAll(".festival-particles");
  if (!zones.length) return;

  // Diamond Sparkle SVG
  const sparkleSVG = `
    <svg viewBox="0 0 100 100" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
      <path d="M 50 0 Q 50 50 100 50 Q 50 50 50 100 Q 50 50 0 50 Q 50 50 50 0 Z" fill="#ffd700" filter="drop-shadow(0 0 5px #ffaa00)"/>
    </svg>
  `;

  // Gold Star SVG
  const starSVG = `
    <svg viewBox="0 0 100 100" width="25" height="25" xmlns="http://www.w3.org/2000/svg">
      <polygon points="50,10 61,35 88,35 66,54 75,80 50,65 25,80 34,54 12,35 39,35" fill="#fbc02d" filter="drop-shadow(0 0 6px #f57f17)"/>
    </svg>
  `;

  // Small Dot Glow
  const dotSVG = `
    <svg viewBox="0 0 100 100" width="15" height="15" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="30" fill="#ffffff" filter="drop-shadow(0 0 10px #ffffff)"/>
    </svg>
  `;

  // Party Popper SVG
  const popperSVG = `
    <svg viewBox="0 0 100 150" width="35" height="50" xmlns="http://www.w3.org/2000/svg">
      <path d="M 20 120 L 50 80 L 80 120 Z" fill="#9c27b0"/>
      <path d="M 25 110 L 75 110" stroke="#ffd700" stroke-width="4"/>
      <path d="M 50 80 L 30 30 M 50 80 L 50 20 M 50 80 L 70 30" stroke="#f44336" stroke-width="3" stroke-linecap="round"/>
      <circle cx="30" cy="20" r="3" fill="#ffeb3b"/>
      <circle cx="50" cy="10" r="3" fill="#4caf50"/>
      <circle cx="70" cy="20" r="3" fill="#2196f3"/>
    </svg>
  `;

  // Ribbon Confetti SVG
  const ribbonSVG = `
    <svg viewBox="0 0 100 100" width="20" height="40" xmlns="http://www.w3.org/2000/svg">
      <path d="M 20 20 Q 80 50 50 50 Q 20 50 80 80" fill="none" stroke="#ff4081" stroke-width="6" stroke-linecap="round"/>
    </svg>
  `;

  const shapes = [sparkleSVG, sparkleSVG, starSVG, starSVG, dotSVG, dotSVG, popperSVG, ribbonSVG];

  zones.forEach((zone) => {
    zone.innerHTML = "";
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement("span");
      particle.className = "festival-particle fp-general";
      particle.innerHTML = shapes[Math.floor(Math.random() * shapes.length)];

      const left = Math.random() * 100;
      const dur = 5 + Math.random() * 6;
      const delay = Math.random() * dur;
      const sway = (Math.random() - 0.5) * 50;
      const spin = (Math.random() - 0.5) * 60;
      const scale = 0.8 + Math.random() * 0.9;

      particle.style.left = left + "%";
      particle.style.setProperty("--dur", dur + "s");
      particle.style.setProperty("--delay", "-" + delay + "s");
      particle.style.setProperty("--sway", sway + "px");
      particle.style.setProperty("--spin", spin + "deg");
      particle.style.transform = "scale(" + scale + ")";

      zone.appendChild(particle);
    }
  });
})();
