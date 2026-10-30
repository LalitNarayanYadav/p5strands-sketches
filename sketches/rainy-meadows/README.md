# Rainy Meadow

![preview](preview.gif)

A soft, painterly rain scene. Layered green hills fade into the mist, fluffy clouds drift across a gray-blue sky,
smoke curls from a cottage chimney, and a small figure in a yellow raincoat walks up a wet path under a red umbrella.
Rain falls in layers, rings spread across the puddles, and the grass sways in the wind.

The look is inspired by the gentle, hand-painted backgrounds of classic animated films. It is an original scene.
No characters, scenes or artwork from any film are used or copied.

**Live:** [OpenProcessing link](https://openprocessing.org/@narayanlalit710/3043795)

## How to interact

- **Move the mouse left and right:** changes the wind. The rain slants, the grass and trees lean, the clouds speed up and
  the smoke blows sideways.
- **Hold the mouse button:** brings a downpour. There are more drops, the rain falls faster and the sky darkens. Let go
  and it eases back to a light shower.

## How it works

### The scene (regular p5.js, WEBGL mode)

- **Coordinates.** The canvas uses `WEBGL` so a shader filter can run over it. `translate(-width / 2, -height / 2)` at the
  start of `draw()` puts the origin back in the top-left corner, so the drawing code reads like a normal 2D sketch.
- **Draw order.** Things are painted from back to front: sky, clouds, far hills, mist, middle hills with trees, near
  meadow, cottage, path, puddles, person, foreground grass, then the nearest rain. Layering and the mist bands between
  the hills create the feeling of depth.
- **Hills.** `hillY(x, layer)` uses `noise()` to make a different rolling skyline for each of three layers. Each hill is a
  `TRIANGLE_STRIP`, with a lighter strip along its top edge like a painted highlight. Farther hills are bluer and paler.
- **Clouds.** Each cloud is a row of overlapping circles drawn three times: a shadowed underside, a pale body and a
  bright highlight. Together they give the clouds their fluffy, hand-painted volume.
- **Cottage.** Built from rectangles and triangles. The window glow is a few translucent circles whose brightness
  flickers using `noise()`. Smoke puffs rise from the chimney, grow and fade, and drift with the wind.
- **The path.** `pathX()` and `pathY()` describe a winding curve from the bottom of the screen to the cottage door. The
  path is drawn as a strip, and the walking figure uses the same functions, so it follows the path and gets smaller as
  it moves into the distance.
- **Grass.** Each blade is a tapering ribbon that sways with a `sin` wave, plus an extra lean from the wind.

### The rain

- Each drop has a depth value (`z`). Drops that are farther away are shorter, slower, thinner and fainter. Closer drops are
  longer, faster and brighter.
- Far drops are drawn behind the near hills. Near drops are drawn last, in front of everything, which gives the rain
  parallax.
- Drops fall until they hit the ground line for their depth. Some of the closer ones leave a small splash ring, and extra
  rings are added in the puddles. The rings grow and fade over 40 frames.
- The number of active drops goes from 260 to 600 as the downpour builds, easing smoothly with `lerp()`.

### The shader (p5.strands)

`paintCallback()` is a filter shader made with `buildFilterShader()`. It runs over the finished picture:

1. **Watercolor softness.** It samples the picture at the pixel and at four neighbors, averages the neighbors into a soft
   version, and blends it with the sharp picture. This takes the hard edge off every shape.
2. **Warm color.** It nudges the colors slightly warmer.
3. **Paper grain.** A fine `noise()` pattern that changes with time adds a subtle texture.
4. **Vignette.** The corners are darkened, based on distance from the center, to draw the eye inward.

## What I learned

- Layering simple shapes with a few shades of the same color goes a long way toward a painted look.
- Giving each raindrop a depth value makes a flat set of lines feel three-dimensional.
- A filter shader can change the whole mood of a normal p5.js scene without touching the drawing code.
- p5.js 2.x has many built-in functions with short names, such as `step`. Using one of those names for my own variable
  (I called a leg-swing value `step`) triggered a console warning, and renaming it to `stride` fixed it.

## Try changing

- **Mood:** change the sky colors in `drawSky()` for a stormy evening or a pale morning drizzle.
- **Time of day:** lower the brightness of the sky and hills, and make the window glow stronger for a night version.
- **Weather:** change the 260 and 600 numbers for lighter or heavier rain.
- **Shader strength:** change the `0.55` blend for more or less softness, or the `0.06` grain amount.
- **Bigger ideas:** add lightning that flashes on a click, a second figure, birds sheltering in the trees, or a pond with
  proper reflections.

## Credits

- Built with the [p5.strands intro tutorial](https://beta.p5js.org/tutorials/intro-to-p5-strands) as a guide for the shader.

## Files

- `sketch.js`: the sketch code
