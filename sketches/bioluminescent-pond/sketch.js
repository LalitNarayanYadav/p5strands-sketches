let pond;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pond = buildFilterShader(pondCallback);
}

function pondCallback() {
  const mx = uniformFloat(() => mouseX / width);
  const my = uniformFloat(() => mouseY / height);
  const press = uniformFloat(() => (mouseIsPressed ? 1 : 0));

  filterColor.begin();
  const aspect = filterColor.canvasSize.x / filterColor.canvasSize.y;
  const p = vec2(filterColor.texCoord.x * aspect, filterColor.texCoord.y);
  const t = millis() / 1000;
  const mouse = vec2(mx * aspect, my);

  function glow(center, size) {
    const d = p - center;
    return (size * size) / (dot(d, d) + 0.002);
  }

  // three plankton blobs drifting on their own paths
  const b1 = vec2(0.5 * aspect + 0.35 * sin(t * 0.7), 0.5 + 0.3 * cos(t * 0.9));
  const b2 = vec2(0.5 * aspect + 0.4 * cos(t * 0.5), 0.5 + 0.35 * sin(t * 0.6 + 2.0));
  const b3 = vec2(0.5 * aspect + 0.3 * sin(t * 0.4 + 4.0), 0.5 + 0.3 * cos(t * 0.8 + 1.0));

  // the blob under your mouse swells when pressed
  const field = glow(b1, 0.07) + glow(b2, 0.06) + glow(b3, 0.08)
              + glow(mouse, 0.06 + 0.05 * press);

  // water color gradient: deep blue, teal, then hot pink at the cores
  const deep = vec3(0.0, 0.05, 0.12);
  const teal = vec3(0.0, 0.7, 0.6);
  const pink = vec3(1.0, 0.5, 0.8);
  const body = map(field, 0.3, 1.5, 0, 1, true);
  const core = map(field, 1.5, 4.0, 0, 1, true);
  let col = mix(mix(deep, teal, body), pink, core);

  // ripples spreading from the mouse
  const r = length(p - mouse);
  const fade = 1 - map(r, 0, 0.6, 0, 1, true);
  const ripple = 0.5 + 0.5 * sin(r * 40 - t * 4);
  col = col + 0.12 * ripple * fade;

  filterColor.set([col, 1]);
  filterColor.end();
}

function draw() {
  background(0);
  filter(pond);
}
