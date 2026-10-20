const pairs = 24;
const radius = 60;
const rise = 14;
const twist = 0.6;
const sep = 130;               // how far the two new DNA molecules move apart
const maxFork = pairs + 8;

const baseColors = {
  A: [255, 90, 90], T: [255, 210, 80],
  G: [90, 220, 120], C: [90, 160, 255]
};
const partner = { A: 'T', T: 'A', G: 'C', C: 'G' };

let strand1 = [];   // original strand 1
let strand2 = [];   // original strand 2 (always the complement of strand 1)
let slider, playButton, caption;
let playing = false;
let lastMsg = '';

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  for (let i = 0; i < pairs; i++) {
    const b = random(['A', 'T', 'G', 'C']);
    strand1.push(b);
    strand2.push(partner[b]);
  }

  caption = createDiv('').position(20, 16);
  caption.style('color', 'white');
  caption.style('font-family', 'sans-serif');
  caption.style('font-size', '18px');
  caption.style('max-width', '520px');

  playButton = createButton('Play / Pause').position(20, 90);
  playButton.mousePressed(() => {
    if (Number(slider.value()) >= maxFork - 0.01) slider.value(0);
    playing = !playing;
  });

  slider = createSlider(0, maxFork, 0, 0.01).position(20, 124);
  slider.style('width', '320px');
}

function keyPressed() {
  if (key === 'r') { slider.value(0); playing = false; }
}

function ease(x) {
  x = constrain(x, 0, 1);
  return x * x * (3 - 2 * x);
}

function mixPos(a, b, k) {
  return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
}

function line3(a, b) {
  line(a[0], a[1], a[2], b[0], b[1], b[2]);
}

// where a free-floating nucleotide drifts before it joins
function freePos(p, i, which, t) {
  const o = which * 100 + i * 3.1;
  return [p[0] + (noise(o, t) - 0.5) * 260,
          p[1] + (noise(o + 30, t) - 0.5) * 200,
          p[2] + (noise(o + 60, t) - 0.5) * 260];
}

function rung(p, q, baseP, baseQ, alpha) {
  const mid = mixPos(p, q, 0.5);
  stroke(...baseColors[baseP], alpha);
  line3(p, mid);
  stroke(...baseColors[baseQ], alpha);
  line3(mid, q);
}

function drawBall(p, base) {
  push();
  translate(p[0], p[1], p[2]);
  fill(...baseColors[base]);
  sphere(8, 12, 12);
  pop();
}

function draw() {
  background(5, 10, 25);
  ambientLight(90);
  pointLight(255, 255, 255, 0, -200, 300);
  rotateY(frameCount * 0.004);

  if (playing) {
    slider.value(min(Number(slider.value()) + 0.04, maxFork));
    if (Number(slider.value()) >= maxFork) playing = false;
  }
  const fork = Number(slider.value());
  const t = millis() / 4000;

  const old1 = [], old2 = [], new1 = [], new2 = [], uu = [], kk = [];
  for (let i = 0; i < pairs; i++) {
    const a = i * twist, c = cos(a), s = sin(a);
    const y = (i - pairs / 2) * rise;
    const u = ease((fork - i) / 5);        // how far the parent strands have separated
    const k = ease((fork - i - 3) / 5);    // how far the new partner has joined
    uu.push(u);
    kk.push(k);
    old1.push([ radius * c + sep * u, y,  radius * s]);
    old2.push([-radius * c - sep * u, y, -radius * s]);
    const t1 = [ sep * u - radius * c, y, -radius * s];
    const t2 = [-sep * u + radius * c, y,  radius * s];
    new1.push(mixPos(freePos(t1, i, 0, t), t1, k));
    new2.push(mixPos(freePos(t2, i, 1, t), t2, k));
  }

  strokeWeight(3);
  for (let i = 0; i < pairs; i++) {
    if (i < pairs - 1) {
      stroke(110);                           // old strands: gray backbone
      line3(old1[i], old1[i + 1]);
      line3(old2[i], old2[i + 1]);
      if (kk[i] > 0.95 && kk[i + 1] > 0.95) {
        stroke(100, 230, 255);               // new strands: cyan backbone
        line3(new1[i], new1[i + 1]);
        line3(new2[i], new2[i + 1]);
      }
    }
    if (uu[i] < 0.5) {
      rung(old1[i], old2[i], strand1[i], strand2[i], 255 * (1 - 2 * uu[i]));
    }
    if (kk[i] > 0.9) {
      rung(old1[i], new1[i], strand1[i], partner[strand1[i]], 255);
      rung(old2[i], new2[i], strand2[i], partner[strand2[i]], 255);
    }
  }

  noStroke();
  for (let i = 0; i < pairs; i++) {
    drawBall(old1[i], strand1[i]);
    drawBall(old2[i], strand2[i]);
    drawBall(new1[i], partner[strand1[i]]);
    drawBall(new2[i], partner[strand2[i]]);
  }

  // helicase: the white ball that unzips the helix
  if (fork > 0 && fork < pairs + 3) {
    push();
    translate(0, (fork - pairs / 2) * rise, 0);
    emissiveMaterial(255, 255, 255);
    sphere(12, 16, 16);
    pop();
  }

  let msg;
  if (fork < 0.05) msg = '1. The original DNA double helix. Press Play or drag the slider.';
  else if (fork < pairs) msg = '2. Helicase (white) unzips the helix. Each exposed base attracts its partner: A with T, G with C.';
  else if (fork < maxFork - 0.05) msg = '3. The last base pairs are joining up...';
  else msg = '4. Done: two identical DNA molecules. Each has one old strand (gray) and one new strand (cyan).';
  if (msg !== lastMsg) { caption.html(msg); lastMsg = msg; }
}
