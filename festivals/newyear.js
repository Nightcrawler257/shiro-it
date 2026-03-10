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
    <svg viewBox="0 0 100 100" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
      <polygon points="50,10 61,35 88,35 66,54 75,80 50,65 25,80 34,54 12,35 39,35" fill="var(--confetti-color)"/>
    </svg>
  `;

  const shapes = [ribbonSVG, squareSVG, squareSVG, squareSVG, starSVG, starSVG];
  const colors = ["#ff3366", "#33ccff", "#ffcc00", "#33ff99", "#ba68c8"];

  zones.forEach((zone) => {
    zone.innerHTML = "";
    for (let i = 0; i < 25; i++) {
      const particle = document.createElement("span");
      particle.className = "festival-particle fp-newyear";
      particle.innerHTML = shapes[Math.floor(Math.random() * shapes.length)];

      const left = Math.random() * 100;
      const dur = 4 + Math.random() * 5;
      const delay = Math.random() * dur;
      const sway = (Math.random() - 0.5) * 60;
      const spin = (Math.random() - 0.5) * 360;
      const scale = 0.5 + Math.random() * 0.8;
      
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
