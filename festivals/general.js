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
    <svg viewBox="0 0 100 100" width="10" height="10" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="30" fill="#ffffff" filter="drop-shadow(0 0 10px #ffffff)"/>
    </svg>
  `;

  const shapes = [sparkleSVG, sparkleSVG, sparkleSVG, starSVG, starSVG, dotSVG, dotSVG, dotSVG];

  zones.forEach((zone) => {
    zone.innerHTML = "";
    for (let i = 0; i < 15; i++) {
      const particle = document.createElement("span");
      particle.className = "festival-particle fp-general";
      particle.innerHTML = shapes[Math.floor(Math.random() * shapes.length)];

      const left = Math.random() * 100;
      const dur = 5 + Math.random() * 6;
      const delay = Math.random() * dur;
      const sway = (Math.random() - 0.5) * 50;
      const spin = (Math.random() - 0.5) * 60;
      const scale = 0.4 + Math.random() * 0.8;

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
