/* ===== CHINESE NEW YEAR ANIMATION ===== */
(function () {
  const zones = document.querySelectorAll(".festival-particles");
  if (!zones.length) return;

  // High-def SVG Lantern (Scaled Up)
  const lanternSVG = `
    <svg viewBox="0 0 100 150" width="50" height="75" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="50" rx="35" ry="40" fill="#ffcc00" opacity="0.4" filter="blur(8px)" />
      <path d="M 25 20 Q 50 10 75 20 C 95 35 95 65 75 80 Q 50 90 25 80 C 5 65 5 35 25 20 Z" fill="#e60000" stroke="#cc0000" stroke-width="2"/>
      <path d="M 50 18 L 50 82" stroke="#ffcc00" stroke-width="2" fill="none"/>
      <path d="M 35 21 Q 40 50 35 79" stroke="#ffcc00" stroke-width="1.5" fill="none"/>
      <path d="M 65 21 Q 60 50 65 79" stroke="#ffcc00" stroke-width="1.5" fill="none"/>
      <rect x="35" y="14" width="30" height="6" fill="#ffcc00" rx="2" />
      <rect x="35" y="80" width="30" height="6" fill="#ffcc00" rx="2" />
      <line x1="50" y1="86" x2="50" y2="100" stroke="#ffcc00" stroke-width="2" />
      <path d="M 45 100 L 55 100 L 60 130 L 40 130 Z" fill="#e60000" />
      <line x1="45" y1="100" x2="40" y2="140" stroke="#ffcc00" stroke-width="1" />
      <line x1="50" y1="100" x2="50" y2="145" stroke="#ffcc00" stroke-width="1" />
      <line x1="55" y1="100" x2="60" y2="140" stroke="#ffcc00" stroke-width="1" />
      <line x1="50" y1="0" x2="50" y2="14" stroke="#cca300" stroke-width="2" />
    </svg>
  `;

  // Red Envelope (Ang Pao) SVG
  const angPaoSVG = `
    <svg viewBox="0 0 100 100" width="45" height="60" xmlns="http://www.w3.org/2000/svg">
      <rect x="15" y="10" width="70" height="85" fill="#e60000" rx="5" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
      <path d="M 15 35 Q 50 55 85 35" fill="none" stroke="#ffcc00" stroke-width="3"/>
      <circle cx="50" cy="55" r="10" fill="#ffcc00"/>
      <rect x="44" y="49" width="12" height="12" fill="#e60000"/>
    </svg>
  `;

  // Gold Ingot (Yuanbao) SVG
  const ingotSVG = `
    <svg viewBox="0 0 100 100" width="65" height="50" xmlns="http://www.w3.org/2000/svg">
      <path d="M 10 50 Q 10 30 30 30 L 70 30 Q 90 30 90 50 Q 90 70 70 80 L 30 80 Q 10 70 10 50 Z" fill="#ffb300" stroke="#ffa000" stroke-width="2" filter="drop-shadow(0 2px 5px rgba(255, 179, 0, 0.5))"/>
      <path d="M 25 30 Q 50 10 75 30 Q 50 50 25 30 Z" fill="#ffd54f"/>
    </svg>
  `;

  // Firecracker SVG
  const firecrackerSVG = `
    <svg viewBox="0 0 100 150" width="35" height="60" xmlns="http://www.w3.org/2000/svg">
      <line x1="50" y1="10" x2="50" y2="140" stroke="#b30000" stroke-width="4"/>
      <rect x="35" y="20" width="30" height="25" fill="#e60000" rx="3"/>
      <rect x="35" y="55" width="30" height="25" fill="#e60000" rx="3"/>
      <rect x="35" y="90" width="30" height="25" fill="#e60000" rx="3"/>
      <path d="M 50 140 Q 40 150 55 150" stroke="#ffcc00" stroke-width="2" fill="none"/>
    </svg>
  `;

  // Chinese Coin SVG
  const coinSVG = `
    <svg viewBox="0 0 100 100" width="45" height="45" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" fill="#ffd54f" stroke="#ffa000" stroke-width="5"/>
      <rect x="35" y="35" width="30" height="30" fill="none" stroke="#ffa000" stroke-width="4"/>
    </svg>
  `;

  const shapes = [lanternSVG, lanternSVG, angPaoSVG, angPaoSVG, ingotSVG, firecrackerSVG, coinSVG];

  zones.forEach((zone) => {
    zone.innerHTML = "";
    for (let i = 0; i < 18; i++) {
      const particle = document.createElement("span");
      particle.className = "festival-particle fp-cny";
      particle.innerHTML = shapes[Math.floor(Math.random() * shapes.length)];

      const left = Math.random() * 100;
      const dur = 6 + Math.random() * 4;
      const delay = Math.random() * dur;
      const sway = (Math.random() - 0.5) * 60;
      const spin = (Math.random() - 0.5) * 20;
      // Made base scale larger
      const scale = 1.0 + Math.random() * 0.8;

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
