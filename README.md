# Draft 77

A prompt desk for [Local Dream](https://github.com/xororz/local-dream), the on-phone Stable Diffusion app.

Open the site, tap short tags, stay under the 75-token budget, then copy the prompt into Local Dream. Saved slips stay in the browser on that phone. Nothing is uploaded.

The page is `index.html` plus `app.js`. The rules Grok should follow are in [SKILL.md](SKILL.md). The TypeScript those files were built from is in `src/`.

## Phone

1. Open the GitHub Pages link for this repo.
2. In Chrome, use the menu and choose **Install app** or **Add to Home screen**.
3. In Local Dream, paste the prompt, then the negative, and match the scheduler, steps, and CFG on the card.

If the filename of your model contains `_dmd2`, turn the fast switch on before you generate. Illustrious stays on Euler. Other DMD2 files use LCM, CFG 1, about 8 steps.

The GitHub build of Local Dream does not black out images. The Play Store build does. This desk only writes the words.
