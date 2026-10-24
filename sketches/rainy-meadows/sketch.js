// Rainy Meadow
// A soft, painterly rain scene in p5.js 2.x, inspired by the gentle, hand-painted look of
// classic animated films: layered green hills, big fluffy clouds, a warm cottage window,
// and a small figure walking up a wet path under an umbrella.
// A p5.strands filter shader adds watercolor softness, paper grain and a warm vignette.
//
// Mouse: move left and right to change the wind. Hold the button for a downpour.

let paintShader;
let drops = [], ripples = [], puddles = [], clouds = [];
let blades = [], smoke = [], trees = [];
let cottage;
let wind = 0;
let rainAmt = 0;
const MAX_DROPS = 600;

// ---------- landscape helpers ----------

// height of each hill layer at x (0 = far, 1 = middle, 2 = near meadow)
function hillY(x, layer) {
  const base = [0.58, 0.66, 0.77][layer] * height;
  const amp = [0.16, 0.12, 0.07][layer] * height;
  const freq = [0.0014, 0.002, 0.0028][layer];
  return base - noise(x * freq, layer * 13 + 3) * amp;
}

// the winding path from the bottom of the screen to the cottage door
function pathX(s) {
  return lerp(width * 0.46, cottage.x, s) + sin(s * PI * 2.2) * width * 0.05 * (1 - s);
}

function pathY(s) {
  return lerp(height * 1.02, cottage.y, s);
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  paintShader = buildFilterShader(paintCallback);
  buildWorld();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  buildWorld();
}

function buildWorld() {
  drops = []; ripples = []; puddles = []; clouds = [];
  blades = []; smoke = []; trees = [];

  const cx = width * 0.72;
  cottage = { x: cx, y: hillY(cx, 2) + 4, s: constrain(width / 1400, 0.6, 1.4) };

  for (let i = 0; i < MAX_DROPS; i++) drops.push(newDrop(true));
  for (let i = 0; i < 7; i++) {
    clouds.push(new Cloud(random(width), random(height * 0.04, height * 0.32), random(0.7, 1.6)));
  }
  for (const f of [0.06, 0.17, 0.3, 0.9, 0.97]) {
    trees.push({ x: f * width, y: hillY(f * width, 1) + 8, s: random(0.8, 1.3) });
  }
  for (let i = 0; i < 5; i++) {
    puddles.push({
      x: width * random(0.3, 0.62),
      y: height * random(0.88, 0.96),
      w: random(70, 150),
      h: random(14, 26)
    });
  }
  for (let i = 0; i < 170; i++) {
    const x = random(-10, width + 10);
    if (abs(x - width * 0.46) < width * 0.11) continue;   // keep the path clear
    blades.push({
      x: x,
      y: random(height * 0.9, height * 1.02),
      h: random(40, 110),
      ph: random(TWO_PI),
      g: random(110, 190)
    });
  }
}

// ---------- main loop ----------

function draw() {
  // use top-left coordinates like a normal 2D sketch
  push();
  translate(-width / 2, -height / 2);
  noStroke();
  const t = millis() / 1000;

  // wind follows the mouse, a held button brings heavier rain
  const targetWind = mouseX === 0 && mouseY === 0 ? -1.5 : map(mouseX, 0, width, -6, 6);
  wind = lerp(wind, targetWind, 0.03);
  rainAmt = lerp(rainAmt, mouseIsPressed ? 1 : 0, 0.03);
  updateRain();

  drawSky();
  for (const c of clouds) { c.update(); c.show(); }

  drawHill(0, [126, 160, 176], [170, 200, 208, 110]);
  drawMist(0.6, 0.12, 60);
  drawRain(false);

  drawHill(1, [88, 146, 122], [140, 190, 150, 90]);
  for (const tr of trees) drawTree(tr, t);
  drawMist(0.7, 0.1, 45);

  drawHill(2, [74, 140, 86], [150, 200, 115, 130]);
  drawCottage(t);
  updateSmoke();

  drawPath();
  drawPuddles(t);
  drawPerson(0.12 + ((t * 0.012) % 0.8), t);
  for (const b of blades) drawBlade(b, t);

  // the sky gets darker in a downpour
  noStroke();
  fill(25, 40, 60, rainAmt * 80);
  rect(0, 0, width, height);

  drawRain(true);
  drawRipples();
  pop();

  // the p5.strands shader runs over everything drawn above
  filter(paintShader);
}

// ---------- sky and clouds ----------

function drawSky() {
  noStroke();
  const bands = 40;
  const top = color(112, 138, 158);
  const mid = color(170, 196, 204);
  const low = color(226, 226, 206);
  for (let i = 0; i < bands; i++) {
    const f = i / (bands - 1);
    fill(f < 0.5 ? lerpColor(top, mid, f * 2) : lerpColor(mid, low, (f - 0.5) * 2));
    rect(0, (i * height) / bands, width, height / bands + 1);
  }
}

class Cloud {
  constructor(x, y, s) {
    this.x = x;
    this.y = y;
    this.s = s;
    this.v = random(0.08, 0.25);
    this.puffs = [];
    const n = floor(random(9, 15));
    for (let i = 0; i < n; i++) {
      const a = i / (n - 1);
      this.puffs.push({
        dx: (a - 0.5) * 260,
        dy: -sin(a * PI) * random(20, 70) + random(-10, 10),
        r: random(36, 78) * (0.6 + sin(a * PI) * 0.6)
      });
    }
  }

  update() {
    this.x += this.v * (1 + abs(wind) * 0.1);
    if (this.x > width + 300 * this.s) this.x = -300 * this.s;
  }

  show() {
    noStroke();
    const s = this.s;
    for (const p of this.puffs) {       // shadowed undersides
      fill(150, 165, 182, 200);
      circle(this.x + p.dx * s, this.y + p.dy * s + p.r * 0.25 * s, p.r * 2 * s);
    }
    for (const p of this.puffs) {       // main body
      fill(206, 216, 224, 220);
      circle(this.x + p.dx * s, this.y + p.dy * s, p.r * 2 * s);
    }
    for (const p of this.puffs) {       // soft highlights
      fill(244, 247, 250, 150);
      circle(this.x + p.dx * s - p.r * 0.2 * s, this.y + p.dy * s - p.r * 0.3 * s, p.r * 1.3 * s);
    }
  }
}

// ---------- hills, trees and mist ----------

function drawHill(layer, col, hi) {
  noStroke();
  fill(col[0], col[1], col[2]);
  beginShape(TRIANGLE_STRIP);
  for (let x = 0; x <= width + 12; x += 12) {
    vertex(x, hillY(x, layer));
    vertex(x, height);
  }
  endShape();

  // lighter rim along the top edge, like a painted highlight
  fill(hi[0], hi[1], hi[2], hi[3]);
  beginShape(TRIANGLE_STRIP);
  for (let x = 0; x <= width + 12; x += 12) {
    const y = hillY(x, layer);
    vertex(x, y);
    vertex(x, y + 14 + noise(x * 0.02, layer) * 14);
  }
  endShape();
}

function drawMist(yFrac, hFrac, alpha) {
  noStroke();
  for (let i = 0; i < 6; i++) {
    fill(228, 238, 240, alpha / 6);
    rect(0, height * yFrac + (i * height * hFrac) / 6, width, (height * hFrac) / 2);
  }
}

function drawTree(tr, t) {
  const s = tr.s;
  const sway = sin(t * 1.2 + tr.x) * 2 + wind * 0.6;
  noStroke();
  fill(80, 60, 45);
  rect(tr.x - 5 * s, tr.y - 60 * s, 10 * s, 60 * s);
  const blobs = [[-22, -80, 30], [18, -84, 34], [0, -112, 34], [-30, -58, 24], [32, -56, 26]];
  fill(50, 105, 70);
  for (const b of blobs) circle(tr.x + (b[0] + sway) * s, tr.y + b[1] * s, b[2] * 2 * s);
  fill(70, 135, 85);
  for (const b of blobs) circle(tr.x + (b[0] + sway - 4) * s, tr.y + (b[1] - 5) * s, b[2] * 1.6 * s);
  fill(130, 182, 108, 190);
  for (const b of blobs) circle(tr.x + (b[0] + sway - 9) * s, tr.y + (b[1] - 11) * s, b[2] * 0.9 * s);
}

// ---------- cottage ----------

function drawCottage(t) {
  const c = cottage;
  push();
  translate(c.x, c.y);
  scale(c.s);
  noStroke();

  // chimney, then walls, then roof on top
  fill(150, 90, 80);
  rect(30, -132, 16, 44);
  fill(238, 222, 190);
  rect(-60, -70, 120, 70);
  fill(215, 196, 165);
  rect(-60, -14, 120, 14);
  fill(165, 78, 70);
  triangle(-82, -68, 82, -68, 0, -136);
  fill(195, 105, 88, 150);
  triangle(-82, -68, 0, -136, 0, -68);

  // warm window with a soft glow that flickers a little
  const flicker = 0.85 + 0.15 * noise(t * 2);
  fill(255, 200, 100, 28 * flicker);
  circle(-29, -39, 120);
  fill(255, 200, 100, 40 * flicker);
  circle(-29, -39, 70);
  fill(255, 214, 120);
  rect(-42, -52, 26, 26);
  fill(150, 100, 60);
  rect(-30, -52, 2, 26);
  rect(-42, -40, 26, 2);

  // door with a little lantern
  fill(120, 80, 60);
  rect(12, -44, 26, 44);
  ellipse(25, -44, 26, 18);
  fill(230, 200, 90);
  circle(33, -22, 3);
  fill(255, 220, 130, 160 * flicker);
  circle(46, -50, 8);
  pop();
}

function updateSmoke() {
  const c = cottage;
  if (frameCount % 10 === 0) {
    smoke.push({ x: c.x + 38 * c.s, y: c.y - 134 * c.s, r: 6 * c.s, age: 0 });
  }
  noStroke();
  for (let i = smoke.length - 1; i >= 0; i--) {
    const p = smoke[i];
    p.age++;
    p.y -= 0.6;
    p.x += wind * 0.15 + sin(p.age * 0.05) * 0.3;
    p.r += 0.08;
    fill(232, 236, 240, 120 * (1 - p.age / 200));
    circle(p.x, p.y, p.r * 2);
    if (p.age > 200) smoke.splice(i, 1);
  }
}

// ---------- path, puddles, person, grass ----------

function drawPath() {
  noStroke();
  fill(168, 142, 104);
  beginShape(TRIANGLE_STRIP);
  for (let i = 0; i <= 30; i++) {
    const s = i / 30;
    const w = lerp(width * 0.07, width * 0.012, s);
    vertex(pathX(s) - w, pathY(s));
    vertex(pathX(s) + w, pathY(s));
  }
  endShape();

  fill(190, 165, 125, 120);       // lighter, wet middle of the path
  beginShape(TRIANGLE_STRIP);
  for (let i = 0; i <= 30; i++) {
    const s = i / 30;
    const w = lerp(width * 0.04, width * 0.006, s);
    vertex(pathX(s) - w, pathY(s));
    vertex(pathX(s) + w, pathY(s));
  }
  endShape();
}

function drawPuddles(t) {
  noStroke();
  for (const p of puddles) {
    fill(150, 182, 198, 210);
    ellipse(p.x, p.y, p.w, p.h);
    fill(214, 232, 242, 110);
    ellipse(p.x - p.w * 0.1, p.y - p.h * 0.1, p.w * 0.7, p.h * 0.5);
  }
  // drops hitting the puddles make rings
  if (puddles.length > 0 && random() < 0.35 * (0.5 + rainAmt)) {
    const p = random(puddles);
    ripples.push({
      x: p.x + random(-0.4, 0.4) * p.w,
      y: p.y + random(-0.3, 0.3) * p.h,
      age: 0,
      max: random(10, 22),
      a: 190
    });
  }
}

function drawPerson(s, t) {
  const x = pathX(s);
  const y = pathY(s);
  const h = height * 0.16 * lerp(1, 0.3, s);
  const bob = sin(t * 6) * h * 0.012;
  const stride = sin(t * 6) * h * 0.05;
  push();
  translate(x, y);
  noStroke();
  fill(20, 40, 30, 70);
  ellipse(0, 0, h * 0.5, h * 0.12);

  fill(40, 50, 80);                                   // legs
  rect(-h * 0.07 + stride, -h * 0.34, h * 0.06, h * 0.34);
  rect(h * 0.01 - stride, -h * 0.34, h * 0.06, h * 0.34);

  fill(240, 200, 70);                                 // yellow raincoat
  beginShape();
  vertex(-h * 0.11, -h * 0.62 + bob);
  vertex(h * 0.11, -h * 0.62 + bob);
  vertex(h * 0.14, -h * 0.3);
  vertex(-h * 0.14, -h * 0.3);
  endShape(CLOSE);

  fill(240, 205, 175);                                // head and hair
  circle(0, -h * 0.7 + bob, h * 0.14);
  fill(50, 35, 30);
  ellipse(0, -h * 0.735 + bob, h * 0.145, h * 0.09);

  const uy = -h * 0.8 + bob;                          // umbrella
  const r = h * 0.38;
  stroke(70, 55, 45);
  strokeWeight(max(1, h * 0.012));
  line(0, -h * 0.5 + bob, 0, uy);
  noStroke();
  fill(205, 72, 62);
  beginShape();
  for (let a = PI; a <= TWO_PI + 0.001; a += 0.2) {
    vertex(cos(a) * r, uy + sin(a) * r * 0.55);
  }
  endShape(CLOSE);
  fill(235, 110, 95, 150);
  ellipse(-r * 0.25, uy - r * 0.2, r * 0.6, r * 0.2);
  pop();
}

function drawBlade(b, t) {
  noStroke();
  fill(45, b.g, 80);
  beginShape(TRIANGLE_STRIP);
  const segs = 6;
  for (let i = 0; i <= segs; i++) {
    const f = i / segs;
    const sway = sin(t * 1.4 + b.ph) * 8 * f * f + wind * 4 * f * f;
    const hw = 5 * (1 - f);
    vertex(b.x + sway - hw, b.y - f * b.h);
    vertex(b.x + sway + hw, b.y - f * b.h);
  }
  endShape();
}

// ---------- rain ----------

function newDrop(anywhere) {
  const z = random();
  return {
    x: random(-300, width + 300),
    y: anywhere ? random(-height * 0.2, height) : random(-200, -10),
    z: z,
    len: lerp(10, 34, z),
    v: lerp(9, 22, z)
  };
}

function updateRain() {
  const active = floor(lerp(260, MAX_DROPS, rainAmt));
  for (let i = 0; i < active; i++) {
    const d = drops[i];
    d.y += d.v * (1 + rainAmt * 0.3);
    d.x += wind * d.v * 0.12;
    if (d.y > lerp(height * 0.62, height * 0.99, d.z)) {
      if (d.z > 0.45 && random() < 0.25) {
        ripples.push({ x: d.x, y: d.y, age: 0, max: 5 + 5 * d.z, a: 150 });
      }
      drops[i] = newDrop(false);
    }
  }
  if (ripples.length > 220) ripples.splice(0, ripples.length - 220);
}

function drawRain(near) {
  const active = floor(lerp(260, MAX_DROPS, rainAmt));
  for (let i = 0; i < active; i++) {
    const d = drops[i];
    if ((d.z >= 0.5) !== near) continue;
    stroke(215, 232, 245, lerp(70, 170, d.z));
    strokeWeight(lerp(0.7, 1.8, d.z));
    const slant = wind * 0.12;
    line(d.x - slant * d.len, d.y - d.len, d.x, d.y);
  }
  noStroke();
}

function drawRipples() {
  noFill();
  for (let i = ripples.length - 1; i >= 0; i--) {
    const r = ripples[i];
    r.age++;
    const f = r.age / 40;
    stroke(235, 245, 255, r.a * (1 - f));
    strokeWeight(1.2);
    const w = map(r.age, 0, 40, 1, r.max);
    ellipse(r.x, r.y, w * 2, w * 0.7);
    if (r.age >= 40) ripples.splice(i, 1);
  }
  noStroke();
}

// ---------- p5.strands: the painted look ----------

function paintCallback() {
  filterColor.begin();
  const t = millis() / 1000;
  const uv = filterColor.texCoord;
  const sx = 1.4 / filterColor.canvasSize.x;
  const sy = 1.4 / filterColor.canvasSize.y;

  // blur a little, then blend with the sharp picture for a soft watercolor feel
  const c0 = getTexture(filterColor.canvasContent, uv);
  const c1 = getTexture(filterColor.canvasContent, uv + vec2(sx, 0));
  const c2 = getTexture(filterColor.canvasContent, uv - vec2(sx, 0));
  const c3 = getTexture(filterColor.canvasContent, uv + vec2(0, sy));
  const c4 = getTexture(filterColor.canvasContent, uv - vec2(0, sy));
  const soft = (c1.rgb + c2.rgb + c3.rgb + c4.rgb) * 0.25;
  const painted = mix(c0.rgb, soft, 0.55);

  // warm the colors, add fine paper grain, and darken the corners
  const warm = painted * vec3(1.04, 1.0, 0.94);
  const grain = (noise(uv.x * 700, uv.y * 700, t * 3) - 0.5) * 0.06;
  const vig = 1 - 0.45 * pow(length(uv - vec2(0.5, 0.5)) * 1.3, 2);

  filterColor.set([warm * vig + vec3(grain, grain, grain), 1]);
  filterColor.end();
}
