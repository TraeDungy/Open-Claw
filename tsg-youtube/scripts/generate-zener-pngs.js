const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const OUT = '/Users/trialxfire/open claw/tsg-youtube/visuals/shared';
const SIZE = 240;
const OPACITIES = [0.02, 0.04, 0.06, 0.08];

const symbols = {
  circle: (ctx, s, color) => {
    ctx.beginPath();
    ctx.ellipse(s/2, s/2, s*0.35, s*0.38, 0, 0, Math.PI*2);
    ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.stroke();
  },
  star: (ctx, s, color) => {
    const pts = [[s/2,s*0.1],[s*0.6,s*0.4],[s*0.92,s*0.4],[s*0.66,s*0.6],[s*0.76,s*0.9],[s/2,s*0.71],[s*0.24,s*0.9],[s*0.34,s*0.6],[s*0.08,s*0.4],[s*0.4,s*0.4]];
    ctx.beginPath();
    pts.forEach((p,i) => i===0 ? ctx.moveTo(p[0],p[1]) : ctx.lineTo(p[0],p[1]));
    ctx.closePath();
    ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.stroke();
  },
  waves: (ctx, s, color) => {
    [0.35, 0.5, 0.65].forEach(y => {
      ctx.beginPath();
      ctx.moveTo(s*0.15, s*y);
      ctx.quadraticCurveTo(s*0.33, s*(y-0.12), s/2, s*y);
      ctx.quadraticCurveTo(s*0.67, s*(y+0.12), s*0.85, s*y);
      ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.stroke();
    });
  },
  square: (ctx, s, color) => {
    ctx.strokeStyle = color; ctx.lineWidth = 2.5;
    ctx.strokeRect(s*0.18, s*0.18, s*0.64, s*0.64);
  },
  cross: (ctx, s, color) => {
    ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(s/2, s*0.12); ctx.lineTo(s/2, s*0.88); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(s*0.12, s/2); ctx.lineTo(s*0.88, s/2); ctx.stroke();
  }
};

console.log('Generating Zener symbol PNGs...\n');

for (const [name, drawFn] of Object.entries(symbols)) {
  for (const opacity of OPACITIES) {
    const c = createCanvas(SIZE, SIZE);
    const ctx = c.getContext('2d');
    // Transparent background
    ctx.clearRect(0, 0, SIZE, SIZE);
    const color = `rgba(255, 194, 96, ${opacity})`;
    drawFn(ctx, SIZE, color);
    const fname = `zener-${name}-${Math.round(opacity*100)}pct.png`;
    fs.writeFileSync(path.join(OUT, fname), c.toBuffer('image/png'));
    console.log(`  ✓ ${fname}`);
  }
}
console.log('\nDone.');
