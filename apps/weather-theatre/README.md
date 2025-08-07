Weather Theatre — React + Canvas

What this is
- A single‑file React + Canvas experience that remixes a mock forecast into different “stage sets.”
- Sliders for Cosy, Eerie, and Heroic moods reshape the same weather into parallax backdrops, spotlight sweeps, and a velvet curtain reveal.
- A Matinée/Night toggle shifts palette and ambience; a typewriter subtitle narrates the scene.
- No external APIs are used for data (React is loaded via CDN; the forecast is mocked).

How to run
- Open index.html in any modern browser (Chrome, Edge, Firefox, Safari). No build step required.
- Move your mouse over the stage for subtle parallax.
- Use the sliders to change mood. Click “Raise Curtain” to reveal the scene.
- Toggle Matinée/Night to change time of day.

Notes
- All visuals are drawn to an HTML Canvas, driven by React state. The canvas adjusts for device pixel ratio.
- The spotlight, fog, rain, and colors blend based on the mood mix.
- Everything is deterministic per page load (with a seed) but you can refresh to vary skyline/cloud layout.

