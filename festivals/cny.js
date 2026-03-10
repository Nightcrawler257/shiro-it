/* ===== CHINESE NEW YEAR ANIMATION ===== */
(function () {
  const zones = document.querySelectorAll(".festival-particles");
  if (!zones.length) return;

  // High-def SVG Lantern
  const lanternSVG = `
    <svg viewBox="0 0 100 150" width="30" height="45" xmlns="http://www.w3.org/2000/svg">
      <!-- Glow -->
      <ellipse cx="50" cy="50" rx="35" ry="40" fill="#ffcc00" opacity="0.4" filter="blur(8px)" />
      <!-- Lantern Body -->
      <path d="M 25 20 Q 50 10 75 20 C 95 35 95 65 75 80 Q 50 90 25 80 C 5 65 5 35 25 20 Z" fill="#e60000" stroke="#cc0000" stroke-width="2"/>
      <!-- Gold Ribs -->
      <path d="M 50 18 L 50 82" stroke="#ffcc00" stroke-width="2" fill="none"/>
      <path d="M 35 21 Q 40 50 35 79" stroke="#ffcc00" stroke-width="1.5" fill="none"/>
      <path d="M 65 21 Q 60 50 65 79" stroke="#ffcc00" stroke-width="1.5" fill="none"/>
      <!-- Top/Bottom Caps -->
      <rect x="35" y="14" width="30" height="6" fill="#ffcc00" rx="2" />
      <rect x="35" y="80" width="30" height="6" fill="#ffcc00" rx="2" />
      <!-- Tassel -->
      <line x1="50" y1="86" x2="50" y2="100" stroke="#ffcc00" stroke-width="2" />
      <path d="M 45 100 L 55 100 L 60 130 L 40 130 Z" fill="#e60000" />
      <line x1="45" y1="100" x2="40" y2="140" stroke="#ffcc00" stroke-width="1" />
      <line x1="50" y1="100" x2="50" y2="145" stroke="#ffcc00" stroke-width="1" />
      <line x1="55" y1="100" x2="60" y2="140" stroke="#ffcc00" stroke-width="1" />
      <!-- String -->
      <line x1="50" y1="0" x2="50" y2="14" stroke="#cca300" stroke-width="2" />
    </svg>
  `;

  zones.forEach((zone) => {
    zone.innerHTML = "";
    for (let i = 0; i < 10; i++) {
      const particle = document.createElement("span");
      particle.className = "festival-particle fp-cny";
      particle.innerHTML = lanternSVG;

      const left = Math.random() * 100;
      const dur = 6 + Math.random() * 4;
      const delay = Math.random() * dur;
      const sway = (Math.random() - 0.5) * 60;
      const spin = (Math.random() - 0.5) * 15;
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
