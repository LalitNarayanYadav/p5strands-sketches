# Bioluminescent Pond

![preview](preview.gif)

Glowing plankton drift across a dark pond. Move the mouse to guide one of them, and hold the mouse button to make it
swell and send out ripples. The whole picture is made by a single p5.strands filter shader, with no images or shapes drawn
in the normal p5.js way.

**Live:** [OpenProcessing link](https://openprocessing.org/@narayanlalit710/3036088)
Part of the **p5.strands Community Workshop** curation.

## How to interact

- **Move the mouse:** one glowing blob follows it, and ripples spread out from that spot.
- **Hold the mouse button:** the blob under your mouse swells.

## How it works

The sketch uses `buildFilterShader()`, so the shader runs once for every pixel on the canvas. `draw()` only clears the
background and calls `filter(pond)`. Everything you see comes from the shader.

1. **Pixel position.** Each pixel gets a position from `filterColor.texCoord`, corrected for the canvas's aspect
   ratio so the blobs stay round on any screen shape.
2. **Drifting blobs.** Three blobs move along looping paths made from `sin` and `cos` of the time (`millis()`), each with
   its own speed and phase. A fourth blob sits at the mouse position.
3. **Glow field.** For each blob, the brightness at a pixel falls off with distance:
   `size * size / (distance squared + a small number)`. The small number keeps the center from blowing up to infinity.
   Adding the four values together makes nearby blobs merge into a single glow.
4. **Color gradient.** The total glow value is mapped from 0 to 1 and used to `mix` between three colors: deep blue for
   water, teal for the body of each blob, and pink for the bright cores.
5. **Ripples.** A `sin` wave of the distance from the mouse, shifted by time, creates rings. They are faded out with
   distance so they only appear near the pointer.

### Passing the mouse into the shader

`mouseX`, `mouseY`, `width` and `height` can be used directly inside a p5.strands callback, so the position is just
`mouseX / width` and `mouseY / height`.

`mouseIsPressed` is different. Inside the shader it is a true/false value, and multiplying a number by it fails with
a compile error ("wrong operand types"). The fix is to turn it into 1 or 0 on the JavaScript side first:

```javascript
const press = uniformFloat(() => (mouseIsPressed ? 1 : 0));
```

> **Version note:** the version in the OpenProcessing curation passes all three values through `uniformFloat()`.
> The version in this repo uses the simpler direct form for the position values.

## What I learned

- A filter shader can draw a whole scene by itself, using only math on pixel positions.
- Adding up glow fields from several points is a simple way to get soft, organic shapes.
- Booleans need to be converted to numbers before they can be used in shader calculations.
- Feedback from the p5.strands community helped me simplify how the mouse values are passed in.

## Try changing

- **Colors:** change the `deep`, `teal` and `pink` values for a different mood (embers, a night sky, a neon sea).
- **Motion:** change the speeds inside the `sin` and `cos` calls for calmer or livelier plankton.
- **Size:** change the base blob sizes, or how much the mouse blob swells when pressed.
- **Ripples:** change the number inside the ripple `sin` (the spacing between rings) and the speed multiplier.
- **Bigger idea:** add more blobs, or let them react to each other.

## Credits

- Built with the [p5.strands intro tutorial](https://beta.p5js.org/tutorials/intro-to-p5-strands) as a guide.
- Thanks to the p5.strands community on the p5.js Discord for feedback on the mouse input.

## Files

- `sketch.js`: the sketch code
