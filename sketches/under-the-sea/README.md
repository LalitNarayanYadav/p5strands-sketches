# Under the Sea

![preview](preview.gif)

A little ocean world: swaying kelp, coral, schools of fish, a sea turtle, crabs, starfish, rising bubbles and
drifting jellyfish. The big pink jellyfish follows your mouse, and the fish swim away from it. The scene is drawn with
plain p5.js shapes, and a p5.strands filter shader on top gives it an underwater look.

**Live:** [OpenProcessing link](https://openprocessing.org/@narayanlalit710/3036535)
Made for the **p5.strands Community Workshop** curation.

## How to interact

- **Move the mouse:** the big pink jellyfish slowly follows it, nearby fish scatter, and kelp bends away.

## How it works

### The scene (regular p5.js, WEBGL mode)

- **Coordinates.** The canvas uses `WEBGL` so a shader filter can run over it. `translate(-width / 2, -height / 2)` at the
  start of `draw()` moves the origin back to the top-left corner, so the drawing code reads like a normal 2D sketch.
- **Draw order.** Shapes are painted back to front: water gradient, back kelp, sand, rocks, coral, starfish, crabs, fish,
  turtle, jellyfish, front kelp, bubbles. Keeping the kelp in two layers (a darker, fainter back layer and a brighter
  front layer) gives the scene depth.
- **Seabed.** `floorY(x)` uses `noise()` to make a gently uneven sea floor. Plants, rocks, crabs and starfish all call it,
  so they sit on the sand instead of floating.
- **Kelp.** Each plant is a ribbon built with `TRIANGLE_STRIP`. Its sideways sway is a `sin` wave that grows toward the tip,
  and it gets pushed away slightly when the mouse is close.
- **Fish.** A `School` class moves a group of fish together. Each fish adds a small wobble of its own, wags its tail,
  and is pushed away from the mouse when it gets within 140 pixels. The same class makes the two big solo fish, with a
  school of one.
- **Turtle, crabs, starfish.** Each is built from simple shapes. The turtle's flippers beat on a `sin` wave, and the crabs
  scuttle sideways along the seabed and sometimes change direction.
- **Jellyfish.** The bell is a half-ellipse that pulses in and out over time, with tentacles drawn as wavy lines.
  Two of them drift on `noise()` paths, and the big pink one aims for the mouse position, easing toward it a little
  each frame.

### The shader (p5.strands)

`waterCallback()` is a filter shader made with `buildFilterShader()`. It runs after everything else is drawn, over the
whole picture:

1. **Ripples.** It shifts each pixel's lookup position by a small `sin` offset, so the image wobbles like light through
   water.
2. **Sunlight rays.** A `sin` wave across the screen, clamped at zero with `max`, makes soft bands of light that are
   strongest near the surface.
3. **Depth tint.** `mix()` blends from white at the top to a blue tint at the bottom, so deeper water looks colder
   and darker.

## What I learned

- In WEBGL mode, shapes are drawn in order, so what you paint last appears on top. Planning the draw order matters.
- A filter shader can change the whole look of a normal p5.js scene without touching the drawing code.
- Splitting animals and plants into classes keeps a big scene manageable, because each class has its own `update()`
  and `show()`.
- *(Add your own notes here about what was hard or surprising.)*

## Try changing

- **Water colors:** change the two colors in `drawWater()` for a tropical lagoon, a deep trench or a night sea.
- **Jellyfish palette:** change the colors in the `Jelly` constructor, or make them glow brighter for a night version.
- **Animal counts:** change the numbers in `buildWorld()` for more fish, more kelp or more bubbles.
- **Shader strength:** change the `0.0025` wobble size, or the `0.1` light-ray strength in `waterCallback()`.
- **Bigger idea:** add a new creature (a seahorse, an octopus or a manta ray) by copying the pattern of the `Crab` or
  `Turtle` class.

## Credits

- Built with the [p5.strands intro tutorial](https://beta.p5js.org/tutorials/intro-to-p5-strands) as a guide for the shader.
- *(Add any other tutorials, sketches or people that helped.)*

## Files

- `sketch.js`: the sketch code
