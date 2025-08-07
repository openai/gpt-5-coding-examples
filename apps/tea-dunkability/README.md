Tea Dunkability Simulator

What this is
- A single-page React experience that simulates biscuit dunkability with:
  - Sliders for tea temperature, dunk time, biscuit type, and structural integrity
  - A looping teacup animation with steam that scales with temperature
  - A live “Crumble‑o‑meter” graph showing predicted crumble risk vs time
  - Crumb particles sprinkled on risky over-dunks
  - Glass-card UI, dark mode (auto + toggle), and keyboard shortcuts

How to run it
1. Open index.html in any modern browser (no build step required). The page
   uses React 18 and Babel from CDN for convenience.

Keyboard shortcuts
- T: focus Tea temperature slider
- D: focus Dunk time slider
- I: focus Structural integrity slider
- B: cycle Biscuit type
- [: nudge focused slider down
- ]: nudge focused slider up
- Space: playful over-dunk crumb burst
- M: toggle theme (light/dark/auto)
- /: toggle help overlay

Notes on the model
- Risk increases with hotter tea, longer dunk time, more fragile/porous biscuits,
  and lower structural integrity.
- The model is qualitative and tuned for feel rather than scientific accuracy
  (absorption modeled as 1 - e^{-k t} with parameters from the controls).

