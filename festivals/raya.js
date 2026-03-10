/* ===== HARI RAYA ANIMATION ===== */
(function () {
  const zones = document.querySelectorAll(".festival-particles");
  if (!zones.length) return;

  // Ketupat SVG
  const ketupatSVG = `
    <svg viewBox="0 0 100 100" width="35" height="35" xmlns="http://www.w3.org/2000/svg">
      <g transform="rotate(45 50 50)">
        <rect x="25" y="25" width="50" height="50" fill="#1b5e20"/>
        <!-- Weave pattern -->
        <rect x="25" y="25" width="25" height="25" fill="#4caf50"/>
        <rect x="50" y="50" width="25" height="25" fill="#4caf50"/>
        
        <rect x="25" y="50" width="25" height="25" fill="#388e3c"/>
        <rect x="50" y="25" width="25" height="25" fill="#388e3c"/>
        
        <line x1="25" y1="50" x2="75" y2="50" stroke="#fdd835" stroke-width="2"/>
        <line x1="50" y1="25" x2="50" y2="75" stroke="#fdd835" stroke-width="2"/>
        
        <!-- Ribbons -->
        <path d="M 25 25 L 10 10" stroke="#fdd835" stroke-width="3" fill="none"/>
        <path d="M 75 75 L 90 90" stroke="#fdd835" stroke-width="3" fill="none"/>
        <path d="M 75 75 L 85 65" stroke="#fdd835" stroke-width="2" fill="none"/>
      </g>
    </svg>
  `;

  // Crescent Moon
  const crescentSVG = `
    <svg viewBox="0 0 100 100" width="30" height="30" xmlns="http://www.w3.org/2000/svg">
      <path d="M 60 10 A 40 40 0 1 0 90 60 A 30 30 0 1 1 60 10 Z" fill="#fdd835" filter="drop-shadow(0 0 5px #fdd835)"/>
    </svg>
  `;

  const shapes = [ketupatSVG, ketupatSVG, crescentSVG];

  zones.forEach((zone) => {
    zone.innerHTML = "";
    for (let i = 0; i < 12; i++) {
      const particle = document.createElement("span");
      particle.className = "festival-particle fp-raya";
      particle.innerHTML = shapes[Math.floor(Math.random() * shapes.length)];

      const left = Math.random() * 100;
      const dur = 7 + Math.random() * 4;
      const delay = Math.random() * dur;
      const sway = (Math.random() - 0.5) * 60;
      const spin = (Math.random() - 0.5) * 30;
      const scale = 0.6 + Math.random() * 0.6;

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
