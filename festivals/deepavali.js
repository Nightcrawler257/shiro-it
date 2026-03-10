/* ===== DEEPAVALI ANIMATION ===== */
(function () {
  const zones = document.querySelectorAll(".festival-particles");
  if (!zones.length) return;

  // Diya SVG
  const diyaSVG = `
    <svg viewBox="0 0 100 100" width="35" height="35" xmlns="http://www.w3.org/2000/svg">
      <!-- Glow -->
      <ellipse cx="50" cy="30" rx="25" ry="35" fill="#ff9800" opacity="0.3" filter="blur(6px)" />
      <!-- Flame Elements -->
      <path d="M 50 10 Q 60 40 50 50 Q 40 40 50 10 Z" fill="#ffb300" />
      <path d="M 50 25 Q 55 42 50 50 Q 45 42 50 25 Z" fill="#fff59d" />
      <!-- Clay Pot Base -->
      <path d="M 20 50 Q 50 60 80 50 Q 95 65 50 85 Q 5 65 20 50 Z" fill="#8d6e63" stroke="#5d4037" stroke-width="2"/>
      <ellipse cx="50" cy="50" rx="30" ry="10" fill="#a1887f" />
      <path d="M 30 52 Q 50 60 70 52" stroke="#5d4037" stroke-width="1.5" fill="none" />
      <!-- Wick -->
      <path d="M 50 40 L 50 50" stroke="#3e2723" stroke-width="2" />
      <!-- Star detail on pot -->
      <polygon points="50,65 53,72 60,72 54,77 56,84 50,80 44,84 46,77 40,72 47,72" fill="#ffd54f"/>
    </svg>
  `;

  // Supporting spark
  const sparkSVG = `
    <svg viewBox="0 0 100 100" width="15" height="15" xmlns="http://www.w3.org/2000/svg">
      <path d="M 50 0 L 55 45 L 100 50 L 55 55 L 50 100 L 45 55 L 0 50 L 45 45 Z" fill="#ffb300" filter="drop-shadow(0 0 4px #ffb300)"/>
    </svg>
  `;

  const shapes = [diyaSVG, diyaSVG, diyaSVG, sparkSVG, sparkSVG];

  zones.forEach((zone) => {
    zone.innerHTML = "";
    for (let i = 0; i < 10; i++) {
      const particle = document.createElement("span");
      particle.className = "festival-particle fp-deepavali";
      particle.innerHTML = shapes[Math.floor(Math.random() * shapes.length)];

      const left = Math.random() * 100;
      const dur = 6 + Math.random() * 4;
      const delay = Math.random() * dur;
      const sway = (Math.random() - 0.5) * 40;
      const spin = (Math.random() - 0.5) * 20;
      const scale = 0.5 + Math.random() * 0.7;

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
