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
    <svg viewBox="0 0 100 100" width="45" height="45" xmlns="http://www.w3.org/2000/svg">
      <path d="M 60 10 A 40 40 0 1 0 90 60 A 30 30 0 1 1 60 10 Z" fill="#fdd835" filter="drop-shadow(0 0 5px #fdd835)"/>
    </svg>
  `;

  // Mosque SVG
  const mosqueSVG = `
    <svg viewBox="0 0 100 100" width="55" height="55" xmlns="http://www.w3.org/2000/svg">
      <path d="M 50 10 Q 60 30 70 40 L 70 80 L 30 80 L 30 40 Q 40 30 50 10 Z" fill="#2ecc71" stroke="#1b5e20" stroke-width="2"/>
      <path d="M 45 60 Q 50 50 55 60 L 55 80 L 45 80 Z" fill="#fdd835"/>
      <circle cx="50" cy="5" r="4" fill="#fdd835"/>
    </svg>
  `;

  // Islamic Star (Rub el Hizb)
  const starSVG = `
    <svg viewBox="0 0 100 100" width="40" height="40" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(50,50)">
        <rect x="-25" y="-25" width="50" height="50" fill="none" stroke="#fdd835" stroke-width="4"/>
        <rect x="-25" y="-25" width="50" height="50" fill="none" stroke="#fdd835" stroke-width="4" transform="rotate(45)"/>
        <circle cx="0" cy="0" r="10" fill="#fdd835"/>
      </g>
    </svg>
  `;

  const shapes = [ketupatSVG, ketupatSVG, crescentSVG, mosqueSVG, starSVG];

  zones.forEach((zone) => {
    zone.innerHTML = "";
    // Travel distance = zone height + a small buffer so particles fully exit
    const travel = (zone.offsetHeight || 80) + 40;
    const count = 8; // fewer particles = smoother, less distracting
    for (let i = 0; i < count; i++) {
      const particle = document.createElement("span");
      particle.className = "festival-particle fp-raya";
      particle.innerHTML = shapes[Math.floor(Math.random() * shapes.length)];

      const left  = Math.random() * 100;
      const dur   = 9 + Math.random() * 5;   // slightly slower = smoother feel
      const delay = Math.random() * dur;
      const sway  = (Math.random() - 0.5) * 50;
      const spin  = (Math.random() - 0.5) * 25;
      const scale = 0.7 + Math.random() * 0.5;

      particle.style.left = left + "%";
      particle.style.setProperty("--dur",    dur + "s");
      particle.style.setProperty("--delay",  "-" + delay + "s");
      particle.style.setProperty("--sway",   sway + "px");
      particle.style.setProperty("--spin",   spin + "deg");
      particle.style.setProperty("--scale",  scale);
      particle.style.setProperty("--travel", travel + "px");

      zone.appendChild(particle);
    }
  });
})();
