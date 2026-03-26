/* ===== NEW YEAR ANIMATION ===== */
(function () {
  const zones = document.querySelectorAll(".festival-particles");
  if (!zones.length) return;

  // Ribbon Confetti SVG (Twisting)
  const ribbonSVG = `
    <svg viewBox="0 0 100 100" width="15" height="40" xmlns="http://www.w3.org/2000/svg">
      <path d="M 20 10 Q 80 30 50 50 Q 20 70 80 90" fill="none" stroke="var(--confetti-color)" stroke-width="8" stroke-linecap="round"/>
    </svg>
  `;

  // Square Confetti SVG
  const squareSVG = `
    <svg viewBox="0 0 100 100" width="15" height="15" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="20" width="60" height="60" fill="var(--confetti-color)" opacity="0.9" rx="5"/>
    </svg>
  `;

  // Star Confetti SVG
  const starSVG = `
    <svg viewBox="0 0 100 100" width="25" height="25" xmlns="http://www.w3.org/2000/svg">
      <polygon points="50,10 61,35 88,35 66,54 75,80 50,65 25,80 34,54 12,35 39,35" fill="var(--confetti-color)"/>
    </svg>
  `;

  // Party Balloon SVG
  const balloonSVG = `
    <svg viewBox="0 0 100 150" width="35" height="50" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="40" rx="35" ry="40" fill="var(--confetti-color)" opacity="0.9"/>
      <polygon points="45,80 55,80 50,90" fill="var(--confetti-color)"/>
      <path d="M 50 90 Q 40 110 55 130 T 50 150" fill="none" stroke="#cccccc" stroke-width="2"/>
      <ellipse cx="35" cy="25" rx="5" ry="10" fill="#ffffff" opacity="0.5" transform="rotate(-30 35 25)"/>
    </svg>
  `;

  // Champagne Glass SVG
  const glassSVG = `
    <svg viewBox="0 0 100 150" width="30" height="45" xmlns="http://www.w3.org/2000/svg">
      <polygon points="20,10 80,10 50,70" fill="var(--confetti-color)" opacity="0.4" stroke="#ffffff" stroke-width="2"/>
      <polygon points="25,25 75,25 50,65" fill="var(--confetti-color)"/>
      <line x1="50" y1="70" x2="50" y2="130" stroke="#ffffff" stroke-width="4"/>
      <ellipse cx="50" cy="130" rx="25" ry="5" fill="#ffffff"/>
      <circle cx="45" cy="45" r="2" fill="#ffffff"/>
      <circle cx="55" cy="35" r="2" fill="#ffffff"/>
      <circle cx="50" cy="50" r="1.5" fill="#ffffff"/>
    </svg>
  `;

  const shapes = [ribbonSVG, squareSVG, squareSVG, starSVG, starSVG, balloonSVG, glassSVG];
  const colors = ["#ff3366", "#33ccff", "#ffcc00", "#33ff99", "#ba68c8"];

  zones.forEach((zone) => {
    zone.innerHTML = "";
    for (let i = 0; i < 28; i++) {
      const particle = document.createElement("span");
      particle.className = "festival-particle fp-newyear";
      particle.innerHTML = shapes[Math.floor(Math.random() * shapes.length)];

      const left = Math.random() * 100;
      const dur = 4 + Math.random() * 5;
      const delay = Math.random() * dur;
      const sway = (Math.random() - 0.5) * 60;
      const spin = (Math.random() - 0.5) * 360;
      const scale = 0.8 + Math.random() * 0.9;
      
      const color = colors[Math.floor(Math.random() * colors.length)];

      particle.style.left = left + "%";
      particle.style.setProperty("--dur", dur + "s");
      particle.style.setProperty("--delay", "-" + delay + "s");
      particle.style.setProperty("--sway", sway + "px");
      particle.style.setProperty("--spin", spin + "deg");
      particle.style.setProperty("--confetti-color", color);
      particle.style.transform = "scale(" + scale + ")";

      zone.appendChild(particle);
    }
  });
})();
