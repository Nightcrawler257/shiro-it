/* ===== NATIONAL DAY (MERDEKA) ANIMATION ===== */
(function () {
  const zones = document.querySelectorAll(".festival-particles");
  if (!zones.length) return;

  // True Malaysia Flag SVG
  const malaysiaFlagSVG = `
    <svg viewBox="0 0 1200 600" width="40" height="20" xmlns="http://www.w3.org/2000/svg">
      <!-- 14 Stripes -->
      <path fill="#cc0000" d="M0 0h1200v42.85H0zm0 85.7h1200v42.85H0zm0 85.7h1200v42.85H0zm0 85.7h1200v42.85H0zm0 85.7h1200v42.85H0zm0 85.7h1200v42.85H0zm0 85.7h1200v42.85H0z"/>
      <path fill="#fff" d="M0 42.85h1200v42.85H0zm0 85.7h1200v42.85H0zm0 85.7h1200v42.85H0zm0 85.7h1200v42.85H0zm0 85.7h1200v42.85H0zm0 85.7h1200v42.85H0zm0 85.7h1200v42.85H0z"/>
      <!-- Blue Canton -->
      <rect fill="#000066" width="600" height="300"/>
      <!-- Crescent -->
      <path fill="#fcda03" d="M400 150a100 100 0 1 1-200 0 100 100 0 0 1 200 0z"/>
      <path fill="#000066" d="M420 150a85 85 0 1 1-170 0 85 85 0 0 1 170 0z"/>
      <!-- 14 Point Star -->
      <polygon fill="#fcda03" points="390,150 480,150 405,175 460,230 395,190 410,270 370,210 330,285 330,210 270,265 300,195 220,210 280,165 200,135 285,135 250,60 310,105 320,25 350,100 410,20 380,100 460,55 400,120"/>
    </svg>
  `;

  // Supporting elements
  const starSVG = `<svg viewBox="0 0 24 24" width="30" height="30" xmlns="http://www.w3.org/2000/svg" fill="#fcda03"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;

  // Hibiscus (Bunga Raya) SVG
  const hibiscusSVG = `
    <svg viewBox="0 0 100 100" width="55" height="55" xmlns="http://www.w3.org/2000/svg">
      <!-- Petals -->
      <path d="M 50 50 C 70 20 90 40 50 50 Z" fill="#e53935" stroke="#c62828" stroke-width="2"/>
      <path d="M 50 50 C 90 60 70 90 50 50 Z" fill="#e53935" stroke="#c62828" stroke-width="2"/>
      <path d="M 50 50 C 50 90 20 80 50 50 Z" fill="#e53935" stroke="#c62828" stroke-width="2"/>
      <path d="M 50 50 C 10 50 20 20 50 50 Z" fill="#e53935" stroke="#c62828" stroke-width="2"/>
      <path d="M 50 50 C 40 10 70 10 50 50 Z" fill="#e53935" stroke="#c62828" stroke-width="2"/>
      <!-- Stamen -->
      <path d="M 50 50 Q 60 20 70 15" fill="none" stroke="#ffeb3b" stroke-width="3" stroke-linecap="round"/>
      <circle cx="70" cy="15" r="4" fill="#fbc02d"/>
      <circle cx="65" cy="20" r="2" fill="#fbc02d"/>
      <circle cx="75" cy="22" r="2" fill="#fbc02d"/>
    </svg>
  `;

  const shapes = [malaysiaFlagSVG, malaysiaFlagSVG, hibiscusSVG, hibiscusSVG, starSVG];

  zones.forEach((zone) => {
    zone.innerHTML = "";
    const travel = (zone.offsetHeight || 80) + 40;
    for (let i = 0; i < 8; i++) {
      const particle = document.createElement("span");
      particle.className = "festival-particle fp-national";
      particle.innerHTML = shapes[Math.floor(Math.random() * shapes.length)];

      const left  = Math.random() * 100;
      const dur   = 9 + Math.random() * 5;
      const delay = Math.random() * dur;
      const sway  = (Math.random() - 0.5) * 60;
      const spin  = (Math.random() - 0.5) * 45;
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
