# p5.strands Sketches

A collection of interactive generative sketches built with [p5.js](https://p5js.org) 2.x and
**p5.strands**, the p5.js feature for writing shaders in JavaScript.
Each sketch has its own folder with the code, a short explanation of how it works, and a preview.

> Some of these sketches are part of the **p5.strands Community Workshop** curation on OpenProcessing.

## Sketches

| Sketch | What it shows | Live | Techniques |
|---|---|---|---|
| [Bioluminescent Pond](sketches/bioluminescent-pond) | Glowing plankton drift in the dark; one follows your mouse | [OpenProcessing](https://openprocessing.org/@narayanlalit710/3036088) | filter shader, mouse input, color gradient |
| [Under the Sea](sketches/under-the-sea) | An ocean scene with kelp, fish, a turtle and jellyfish | [OpenProcessing](https://openprocessing.org/@narayanlalit710/3036535) | filter shader, water ripples, depth tint |
| [DNA Replication](sketches/dna-replication) | A helix unzips and builds two new DNA molecules | [OpenProcessing](https://openprocessing.org/@narayanlalit710/3036530) | slider control, bloom filter |


## Running a sketch

- **Easiest:** open the live link above.
- **Locally:** create an `index.html` that loads p5.js 2.x and the sketch's `sketch.js`,
  then open it in a browser (a simple local server such as the VS Code Live Server extension works well).

## What I'm learning

I keep short notes in each sketch folder on what worked, what broke, and what I'd change.
Ideas I want to try next:

- [ ] A sketch using vertex displacement (`objectInputs`) on a 3D shape
- [ ] A post-processing filter (pixelation, edge glow)
- [ ] A sketch that reacts to sound or the keyboard

## Credits

- Built with the [p5.strands intro tutorial](https://beta.p5js.org/tutorials/intro-to-p5-strands) as a guide.
- Thanks to the p5.js and Processing Foundation community for feedback and help.
- Any sketch that builds on someone else's work credits them in its own README.

## License

Code is released under the MIT License (see `LICENSE`). Each sketch's OpenProcessing page may show its own
Creative Commons license for that version.

## Author

Lalit Narayan Yadav, https://github.com/LalitNarayanYadav
