/* ===== CHRISTMAS ANIMATION ===== */
(function () {
  const zones = document.querySelectorAll(".festival-particles");
  if (!zones.length) return;

  // Detailed multi-branch snowflake SVG
  const snowflakeSVG = `
    <svg viewBox="0 0 100 100" width="24" height="24" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff" stroke-width="4" stroke-linecap="round" fill="none">
      <g filter="drop-shadow(0 0 3px rgba(255,255,255,0.8))">
        <!-- Main axes -->
        <line x1="50" y1="10" x2="50" y2="90" />
        <line x1="10" y1="50" x2="90" y2="50" />
        <line x1="22" y1="22" x2="78" y2="78" />
        <line x1="22" y1="78" x2="78" y2="22" />
        
        <!-- Branches Top -->
        <line x1="50" y1="25" x2="60" y2="15" />
        <line x1="50" y1="25" x2="40" y2="15" />
        
        <!-- Branches Bottom -->
        <line x1="50" y1="75" x2="60" y2="85" />
        <line x1="50" y1="75" x2="40" y2="85" />
        
        <!-- Branches Left -->
        <line x1="25" y1="50" x2="15" y2="60" />
        <line x1="25" y1="50" x2="15" y2="40" />
        
        <!-- Branches Right -->
        <line x1="75" y1="50" x2="85" y2="60" />
        <line x1="75" y1="50" x2="85" y2="40" />
        
        <!-- Center Hexagon -->
        <polygon points="50,38 60,45 60,55 50,62 40,55 40,45" stroke-width="2"/>
      </g>
    </svg>
  `;

  // Simpler secondary snowflake
  const simpleFlakeSVG = `
    <svg viewBox="0 0 100 100" width="16" height="16" xmlns="http://www.w3.org/2000/svg" stroke="#e0f7fa" stroke-width="6" stroke-linecap="round" fill="none">
      <line x1="50" y1="20" x2="50" y2="80" />
      <line x1="20" y1="50" x2="80" y2="50" />
      <line x1="29" y1="29" x2="71" y2="71" />
      <line x1="29" y1="71" x2="71" y2="29" />
    </svg>
  `;

  // Star detail
  const starSVG = `
    <svg viewBox="0 0 100 100" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
      <path d="M 50 0 L 55 45 L 100 50 L 55 55 L 50 100 L 45 55 L 0 50 L 45 45 Z" fill="#ffffff"/>
    </svg>
  `;

  // Christmas Bauble (Ornament) SVG
  const baubleSVG = `
    <svg viewBox="0 0 100 100" width="35" height="45" xmlns="http://www.w3.org/2000/svg">
      <rect x="45" y="10" width="10" height="10" fill="#ffcc00"/>
      <path d="M 50 0 Q 60 5 50 10" stroke="#cccccc" stroke-width="2" fill="none"/>
      <circle cx="50" cy="55" r="35" fill="#e60000"/>
      <path d="M 15 55 Q 50 20 85 55" stroke="#ffcc00" stroke-width="4" stroke-dasharray="5,3" fill="none"/>
      <path d="M 15 55 Q 50 90 85 55" stroke="#ffcc00" stroke-width="4" stroke-dasharray="5,3" fill="none"/>
      <circle cx="35" cy="40" r="5" fill="#ffffff" opacity="0.6"/>
    </svg>
  `;

  // Christmas Tree SVG
  const treeSVG = `
    <svg viewBox="0 0 100 100" width="40" height="50" xmlns="http://www.w3.org/2000/svg">
      <rect x="42" y="80" width="16" height="20" fill="#5d4037"/>
      <polygon points="50,15 20,45 40,45 10,80 90,80 60,45 80,45" fill="#2e7d32"/>
      <polygon points="50,5 55,15 65,15 58,22 60,30 50,25 40,30 42,22 35,15 45,15" fill="#ffc107"/>
      <circle cx="30" cy="65" r="4" fill="#e53935"/>
      <circle cx="70" cy="65" r="4" fill="#1e88e5"/>
      <circle cx="50" cy="50" r="4" fill="#ffb300"/>
      <circle cx="45" cy="75" r="4" fill="#fdd835"/>
    </svg>
  `;

  const shapes = [snowflakeSVG, snowflakeSVG, simpleFlakeSVG, simpleFlakeSVG, starSVG, baubleSVG, treeSVG];

  zones.forEach((zone) => {
    zone.innerHTML = "";
    const travel = (zone.offsetHeight || 80) + 40;
    for (let i = 0; i < 8; i++) {
      const particle = document.createElement("span");
      particle.className = "festival-particle fp-christmas";
      particle.innerHTML = shapes[Math.floor(Math.random() * shapes.length)];

      const left  = Math.random() * 100;
      const dur   = 8 + Math.random() * 5;
      const delay = Math.random() * dur;
      const sway  = (Math.random() - 0.5) * 60;
      const spin  = (Math.random() - 0.5) * 180;
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
