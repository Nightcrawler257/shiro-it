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
    <svg viewBox="0 0 100 100" width="12" height="12" xmlns="http://www.w3.org/2000/svg">
      <path d="M 50 0 L 55 45 L 100 50 L 55 55 L 50 100 L 45 55 L 0 50 L 45 45 Z" fill="#ffffff"/>
    </svg>
  `;

  const shapes = [snowflakeSVG, snowflakeSVG, simpleFlakeSVG, simpleFlakeSVG, starSVG];

  zones.forEach((zone) => {
    zone.innerHTML = "";
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement("span");
      particle.className = "festival-particle fp-christmas";
      particle.innerHTML = shapes[Math.floor(Math.random() * shapes.length)];

      const left = Math.random() * 100;
      const dur = 6 + Math.random() * 6;
      const delay = Math.random() * dur;
      const sway = (Math.random() - 0.5) * 80;
      const spin = (Math.random() - 0.5) * 180;
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
