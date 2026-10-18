// Under the Sea
// A hand-drawn ocean scene in p5.js 2.x with a p5.strands filter shader
// that adds water wobble, sunlight rays and depth tint over the whole scene.
// Move the mouse: the pink jellyfish follows it and the fish swim away from it.

let waterShader;
let kelp = [], corals = [], rocks = [], schools = [], bubbles = [];
let crabs = [], stars = [], jellies = [];
let turtle;

// height of the sandy seabed at a given x
function floorY(x) {
  return height * 0.86 + noise(x * 0.004, 7) * height * 0.08;
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  waterShader = buildFilterShader(waterCallback);
  buildWorld();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  buildWorld();
}

function buildWorld() {
  kelp = []; corals = []; rocks = []; schools = []; bubbles = [];
  crabs = []; stars = []; jellies = [];

  for (let x = -20; x < width + 20; x += random(22, 40)) {
    kelp.push(new Kelp(x, random() < 0.5));
  }
  for (let x = 40; x < width; x += random(120, 220)) {
    corals.push(new Coral(x));
  }
  for (let i = 0; i < 6; i++) {
    rocks.push({ x: random(width), w: random(50, 140), h: random(25, 60) });
  }

  // three small schools and two big solo fish
  schools.push(new School(18, 9, [255, 170, 60], [255, 230, 120]));
  schools.push(new School(14, 8, [90, 200, 255], [200, 250, 255]));
  schools.push(new School(10, 11, [255, 110, 150], [255, 200, 210]));
  schools.push(new School(1, 34, [255, 200, 40], [60, 90, 200]));
  schools.push(new School(1, 26, [120, 255, 200], [20, 140, 140]));

  turtle = new Turtle();
  for (let i = 0; i < 3; i++) crabs.push(new Crab());
  for (let i = 0; i < 5; i++) {
    stars.push({
      x: random(width),
      r: random(10, 18),
      c: random([[255, 120, 60], [255, 160, 200], [250, 210, 80]])
    });
  }
  for (let i = 0; i < 3; i++) jellies.push(new Jelly(i === 0));
  for (let i = 0; i < 60; i++) bubbles.push(new Bubble());
}

function draw() {
  // use top-left coordinates like a normal 2D sketch
  push();
  translate(-width / 2, -height / 2);
  const t = millis() / 1000;
  noStroke();

  drawWater();
  for (const k of kelp) if (k.back) k.show(t);
  drawSand();
  for (const r of rocks) drawRock(r);
  for (const c of corals) c.show(t);
  for (const s of stars) drawStar(s);
  for (const c of crabs) { c.update(); c.show(t); }
  for (const s of schools) { s.update(); s.show(t); }
  turtle.update(); turtle.show(t);
  for (const j of jellies) { j.update(t); j.show(t); }
  for (const k of kelp) if (!k.back) k.show(t);
  for (const b of bubbles) { b.update(t); b.show(); }
  pop();

  // the p5.strands shader runs over everything drawn above
  filter(waterShader);
}

// background 

function drawWater() {
  noStroke();
  const bands = 36;
  for (let i = 0; i < bands; i++) {
    fill(lerpColor(color(40, 150, 190), color(4, 20, 60), i / (bands - 1)));
    rect(0, (i * height) / bands, width, height / bands + 1);
  }
}

function drawSand() {
  noStroke();
  fill(214, 190, 140);
  beginShape(TRIANGLE_STRIP);
  for (let x = 0; x <= width + 10; x += 10) {
    vertex(x, floorY(x));
    vertex(x, height);
  }
  endShape();
}

function drawRock(r) {
  noStroke();
  fill(45, 75, 95);
  ellipse(r.x, floorY(r.x) + 6, r.w, r.h);
  fill(60, 95, 115);
  ellipse(r.x - r.w * 0.12, floorY(r.x) + 2, r.w * 0.6, r.h * 0.5);
}

function drawStar(s) {
  const y = floorY(s.x) + 8;
  noStroke();
  fill(s.c[0], s.c[1], s.c[2]);
  beginShape();
  for (let i = 0; i < 10; i++) {
    const a = -HALF_PI + (i * TWO_PI) / 10;
    const rr = i % 2 === 0 ? s.r : s.r * 0.45;
    vertex(s.x + cos(a) * rr, y + sin(a) * rr);
  }
  endShape(CLOSE);
}

// plants 

class Kelp {
  constructor(x, back) {
    this.x = x;
    this.back = back;
    this.base = floorY(x) + 8;
    this.h = random(height * 0.12, height * 0.42) * (back ? 1.25 : 0.9);
    this.w = random(5, 10);
    this.phase = random(TWO_PI);
    const g = random(90, 170);
    this.col = back ? [20, g * 0.6, 80] : [30, g, 90];
    this.alpha = back ? 150 : 235;
  }

  show(t) {
    noStroke();
    fill(this.col[0], this.col[1], this.col[2], this.alpha);
    beginShape(TRIANGLE_STRIP);
    const segs = 16;
    for (let i = 0; i <= segs; i++) {
      const f = i / segs;
      let sway = sin(t * 1.1 + this.phase + f * 3.2) * 32 * f * f;
      // gently pushed away when the mouse is near
      const near = max(0, 1 - abs(mouseX - (this.x + sway)) / 140);
      sway += near * (this.x - mouseX) * 0.15 * f * f;
      const cx = this.x + sway;
      const cy = this.base - f * this.h;
      const hw = this.w * (1 - f * 0.75);
      vertex(cx - hw, cy);
      vertex(cx + hw, cy);
    }
    endShape();
  }
}

class Coral {
  constructor(x) {
    this.x = x;
    this.y = floorY(x) + 6;
    this.col = random([[255, 110, 130], [255, 160, 70], [190, 110, 255], [255, 90, 180]]);
    this.tubes = [];
    const n = floor(random(4, 8));
    for (let i = 0; i < n; i++) {
      this.tubes.push({ dx: random(-40, 40), h: random(30, 110), w: random(10, 20) });
    }
  }

  show(t) {
    noStroke();
    for (const tb of this.tubes) {
      const x = this.x + tb.dx;
      fill(this.col[0], this.col[1], this.col[2]);
      rect(x - tb.w / 2, this.y - tb.h, tb.w, tb.h);
      ellipse(x, this.y - tb.h, tb.w, tb.w * 0.9);
      fill(this.col[0] * 0.5, this.col[1] * 0.5, this.col[2] * 0.5);
      ellipse(x, this.y - tb.h, tb.w * 0.55, tb.w * 0.4);
    }
  }
}

// ---------- animals ----------

function drawFish(x, y, sz, dir, c1, c2, t, ph) {
  push();
  translate(x, y);
  scale(dir, 1);
  noStroke();
  const wag = sin(t * 8 + ph) * sz * 0.25;
  fill(c1[0], c1[1], c1[2]);
  triangle(-sz * 0.7, 0, -sz * 1.5, -sz * 0.55 + wag, -sz * 1.5, sz * 0.55 + wag);
  ellipse(0, 0, sz * 2, sz * 1.1);
  triangle(-sz * 0.1, -sz * 0.5, sz * 0.4, -sz * 0.5, sz * 0.1, -sz * 0.95);
  fill(c2[0], c2[1], c2[2]);
  ellipse(sz * 0.15, sz * 0.18, sz * 1.2, sz * 0.45);
  fill(255);
  circle(sz * 0.62, -sz * 0.12, sz * 0.32);
  fill(10);
  circle(sz * 0.68, -sz * 0.12, sz * 0.16);
  pop();
}

class School {
  constructor(n, sz, c1, c2) {
    this.x = random(width);
    this.y = random(height * 0.2, height * 0.7);
    this.dir = random() < 0.5 ? 1 : -1;
    this.speed = random(0.8, 1.6);
    this.sz = sz;
    this.c1 = c1;
    this.c2 = c2;
    this.seed = random(1000);
    const spread = n > 1 ? 70 : 0;
    this.members = [];
    for (let i = 0; i < n; i++) {
      this.members.push({
        ox: random(-spread, spread),
        oy: random(-spread / 2, spread / 2),
        ph: random(TWO_PI)
      });
    }
  }

  update() {
    this.x += this.dir * this.speed;
    this.y += (noise(this.seed, frameCount * 0.003) - 0.5) * 1.2;
    this.y = constrain(this.y, height * 0.12, height * 0.72);
    if (this.dir > 0 && this.x > width + 150) this.x = -150;
    if (this.dir < 0 && this.x < -150) this.x = width + 150;
  }

  show(t) {
    for (const m of this.members) {
      let px = this.x + m.ox + sin(t * 2 + m.ph) * 6;
      let py = this.y + m.oy + cos(t * 1.7 + m.ph) * 5;
      // swim away from the mouse
      const dx = px - mouseX;
      const dy = py - mouseY;
      const d = sqrt(dx * dx + dy * dy) + 0.001;
      if (d < 140) {
        px += (dx / d) * (140 - d) * 0.7;
        py += (dy / d) * (140 - d) * 0.7;
      }
      drawFish(px, py, this.sz, this.dir, this.c1, this.c2, t, m.ph);
    }
  }
}

class Turtle {
  constructor() {
    this.x = -150;
    this.y = height * 0.45;
    this.speed = 0.7;
  }

  update() {
    this.x += this.speed;
    if (this.x > width + 150) {
      this.x = -150;
      this.y = random(height * 0.3, height * 0.65);
    }
  }

  show(t) {
    push();
    translate(this.x, this.y + sin(t * 0.8) * 12);
    rotate(sin(t * 0.8) * 0.06);
    noStroke();
    const flap = sin(t * 2.2) * 0.5;

    // far flippers (darker)
    fill(70, 140, 95);
    push(); translate(20, -14); rotate(-0.4 - flap); ellipse(22, 0, 56, 14); pop();
    push(); translate(-26, -12); rotate(0.4 + flap * 0.6); ellipse(-14, 0, 34, 12); pop();

    // head, tail and shell
    fill(110, 190, 120);
    ellipse(58, -4, 28, 22);
    triangle(-48, 0, -70, 4, -48, 8);
    fill(120, 95, 60);
    ellipse(0, 0, 100, 66);
    fill(150, 125, 80);
    ellipse(0, 0, 62, 40);
    fill(95, 75, 45);
    ellipse(-14, -4, 14, 12);
    ellipse(12, 6, 14, 12);
    ellipse(14, -10, 12, 10);
    fill(20);
    circle(64, -8, 5);

    // near flippers (lighter)
    fill(110, 190, 120);
    push(); translate(22, 16); rotate(0.5 + flap); ellipse(24, 0, 60, 16); pop();
    push(); translate(-28, 14); rotate(-0.4 - flap * 0.6); ellipse(-14, 0, 36, 13); pop();
    pop();
  }
}

class Crab {
  constructor() {
    this.x = random(width);
    this.dir = random() < 0.5 ? 1 : -1;
    this.speed = random(0.15, 0.35);
    this.sz = random(16, 24);
  }

  update() {
    this.x += this.dir * this.speed;
    if (this.x < 20 || this.x > width - 20) this.dir *= -1;
    if (random() < 0.002) this.dir *= -1;
  }

  show(t) {
    const y = floorY(this.x) + 2;
    const s = this.sz;
    push();
    translate(this.x, y - s * 0.4);
    stroke(200, 70, 50);
    strokeWeight(2);
    for (let i = -1; i <= 1; i++) {
      const w = sin(t * 6 + i) * 3;
      line(-s * 0.4, i * 4, -s * 0.9, i * 4 + 6 + w);
      line(s * 0.4, i * 4, s * 0.9, i * 4 + 6 - w);
    }
    noStroke();
    fill(225, 85, 60);
    ellipse(0, 0, s * 1.5, s);
    const snap = sin(t * 2) * 0.2;
    push(); translate(-s * 0.7, -s * 0.5); rotate(snap); circle(0, 0, s * 0.55); pop();
    push(); translate(s * 0.7, -s * 0.5); rotate(-snap); circle(0, 0, s * 0.55); pop();
    fill(255);
    circle(-s * 0.2, -s * 0.5, 5);
    circle(s * 0.2, -s * 0.5, 5);
    fill(10);
    circle(-s * 0.2, -s * 0.5, 2.5);
    circle(s * 0.2, -s * 0.5, 2.5);
    pop();
  }
}

class Jelly {
  constructor(follower) {
    this.follower = follower;
    this.x = random(width * 0.2, width * 0.8);
    this.y = random(height * 0.2, height * 0.6);
    this.r = follower ? 55 : random(28, 42);
    this.seed = random(1000);
    this.col = follower
      ? [255, 140, 220]
      : random([[140, 200, 255], [190, 160, 255], [150, 255, 220]]);
  }

  update(t) {
    let tx = noise(this.seed, t * 0.05) * width;
    let ty = noise(this.seed + 50, t * 0.05) * height * 0.7;
    // the big pink one follows the mouse once it has moved
    if (this.follower && !(mouseX === 0 && mouseY === 0)) {
      tx = mouseX;
      ty = mouseY;
    }
    this.x += (tx - this.x) * 0.006;
    this.y += (ty - this.y) * 0.006 + cos(t * 2.2 + this.seed) * 0.4;
  }

  show(t) {
    const c = this.col;
    const p = sin(t * 2.2 + this.seed);
    const w = this.r * (1 + 0.12 * p);
    const h = this.r * (0.8 - 0.1 * p);
    push();
    translate(this.x, this.y);

    // tentacles
    noFill();
    for (let i = 0; i < 9; i++) {
      const ox = map(i, 0, 8, -w * 0.8, w * 0.8);
      stroke(c[0], c[1], c[2], i % 2 ? 130 : 80);
      strokeWeight(i % 2 ? 2 : 3.5);
      beginShape();
      for (let s = 0; s <= 14; s++) {
        const f = s / 14;
        vertex(ox + sin(t * 2 + f * 5 + i) * 10 * f, 4 + f * h * 2.6);
      }
      endShape();
    }

    // bell
    noStroke();
    fill(c[0], c[1], c[2], 110);
    beginShape();
    for (let a = PI; a <= TWO_PI + 0.001; a += 0.15) {
      vertex(cos(a) * w, sin(a) * h);
    }
    for (let k = 8; k >= 0; k--) {
      const f = k / 8;
      vertex(map(f, 0, 1, -w, w), 3 + sin(t * 3 + f * 9 + this.seed) * 3);
    }
    endShape(CLOSE);

    // inner glow and spots
    fill(255, 255, 255, 70);
    ellipse(0, -h * 0.45, w * 1.1, h * 0.8);
    fill(c[0], c[1], c[2], 160);
    circle(-w * 0.3, -h * 0.35, w * 0.16);
    circle(w * 0.25, -h * 0.5, w * 0.12);
    circle(0, -h * 0.2, w * 0.14);
    pop();
  }
}

class Bubble {
  constructor() {
    this.reset(true);
  }

  reset(anywhere) {
    this.x = random(width);
    this.y = anywhere ? random(height) : height + 10;
    this.r = random(2, 7);
    this.v = random(0.4, 1.4);
    this.ph = random(TWO_PI);
  }

  update(t) {
    this.y -= this.v;
    this.x += sin(t * 2 + this.ph) * 0.4;
    if (this.y < -10) this.reset(false);
  }

  show() {
    noFill();
    stroke(220, 245, 255, 140);
    strokeWeight(1.3);
    circle(this.x, this.y, this.r * 2);
    noStroke();
    fill(255, 255, 255, 160);
    circle(this.x - this.r * 0.3, this.y - this.r * 0.3, this.r * 0.5);
  }
}

// p5.strands: underwater look for the whole scene

function waterCallback() {
  filterColor.begin();
  const t = millis() / 1000;
  const uv = filterColor.texCoord;

  // tiny ripples that bend the picture
  const wob = vec2(
    sin(uv.y * 40 + t * 1.4) * 0.0025,
    sin(uv.x * 28 + t * 1.1) * 0.0025
  );
  const col = getTexture(filterColor.canvasContent, uv + wob);

  // soft sunlight rays, strongest near the surface
  const rays = max(sin(uv.x * 14 + sin(t * 0.25) * 2 + uv.y * 4), 0);
  const glow = rays * (1 - uv.y) * 0.1;

  // the deeper the water, the bluer it gets
  const tint = mix(vec3(1, 1, 1), vec3(0.6, 0.8, 1.0), uv.y);

  filterColor.set([col.rgb * tint + vec3(glow, glow, glow), 1]);
  filterColor.end();
}
