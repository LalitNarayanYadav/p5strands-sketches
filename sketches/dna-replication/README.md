# DNA Replication

![preview](preview.gif)

An interactive 3D model of how a DNA double helix copies itself. A helicase (the white ball) unzips the helix, free
nucleotides drift in and pair up with the exposed bases, and the result is two identical DNA molecules, each made of
one old strand and one new strand. A slider lets you pause at any moment and see what is happening.

**Live:** [OpenProcessing link](https://openprocessing.org/@narayanlalit710/3036530)

## How to interact

- **Play / Pause button:** run the animation. When it reaches the end, pressing Play starts it again.
- **Slider:** drag it to move the unzipping point back and forth, one base pair at a time.
- **R key:** reset to the original helix.
- A caption in the top-left corner explains what stage you are looking at.

## What you are seeing

1. **The original helix.** Two strands wound around each other, joined by base pairs.
2. **Unzipping.** The helicase (white) moves along the helix and separates the two strands into a Y shape.
3. **Pairing.** Each exposed base attracts its partner from the free nucleotides floating nearby:
   A pairs with T (red and yellow) and G pairs with C (green and blue).
4. **Two new molecules.** Each copy has one old strand (gray backbone) and one new strand (cyan backbone). This is
   called semi-conservative replication.

## How it works

The sketch is written in regular p5.js in `WEBGL` mode, with no shader needed for the animation itself.

- **The sequence.** A random list of bases (A, T, G, C) is generated for the first strand. The second strand is always its
  complement, using a lookup table of partners (`A` to `T`, `G` to `C`).
- **The helix shape.** Each base pair sits at a position on a circle (`cos` and `sin` of an angle that increases along the
  ladder) at a height that increases by a fixed step. A twist of 0.6 radians per pair gives about 10.5 pairs per full
  turn, close to real B-form DNA.
- **One number controls everything.** The slider sets `fork`, the position of the unzipping point along the molecule. For
  each base pair, `fork` is turned into two progress values between 0 and 1: how far the two parent strands have
  separated, and how far the new partner has joined. Both use an easing function so motion starts and stops smoothly.
- **Free nucleotides.** Before a new base joins, it drifts around using `noise()` of position and time. As its pairing
  progress increases, it is blended (with `lerp`) from that drifting position to its place on the new strand.
- **Unzipping.** As the parent strands separate, the two old strands are pushed apart sideways, and the rungs between
  them fade out.
- **The helicase.** A white, glowing sphere at the fork position, drawn only while the unzipping is happening.
- **The caption.** An HTML `div` updated only when the stage changes.

[**Optional: keep this section only if you added the bloom.**]

### The glow (p5.strands)

The scene is drawn into a framebuffer, then a p5.strands filter blends it with a blurred copy of itself. This is a
bloom effect that makes the bright, colorful nucleotides glow. The shader is made with `buildFilterShader()` and uses
`getTexture()` to read both the sharp and blurred images.

## A simplified model

This is a teaching illustration, so it leaves out some real details:

- Real DNA strands run in opposite directions, and the two new strands are built in opposite directions relative to the
  fork. One (the leading strand) is made continuously. The other (the lagging strand) is made in short pieces called
  Okazaki fragments.
- DNA polymerase, not just chemical attraction, joins the new nucleotides, and other enzymes (primase, ligase) help.
- Here, both new strands are drawn forming in step with the fork for clarity.

## What I learned

- One driving value (the `fork` slider) can control a whole animation, which also makes it easy to pause and explore.
- Easing functions make motion look natural instead of mechanical.
- A p5.js sketch can break in surprising ways when you name your own function after a built-in one. My helper called
  `smooth` caused the error "Cannot redefine property: smooth", and renaming it to `ease` fixed it.
- *(Add your own notes here about what was hard or surprising.)*

## Try changing

- **Length:** change `pairs` for a longer or shorter molecule.
- **Colors:** change the four base colors in `baseColors`.
- **Shape:** change `radius`, `rise` or `twist` for a tighter, looser or flatter helix.
- **Spread:** change `sep` to move the two new molecules further apart.
- **Speed:** change the `0.04` step in `draw()` to speed up or slow down Play.
- **Bigger idea:** add the leading and lagging strand difference, with Okazaki fragments forming in short pieces.

## Credits

- Base pairing and replication steps from standard biology textbooks.
- *(Add any tutorials, sketches or people that helped.)*

## Files

- `sketch.js`: the sketch code
