/* global React, ReactDOM */
(function() {
  const { useRef, useEffect, useState, useMemo, useCallback } = React;

  // Utilities
  const clamp = (v, mi, ma) => Math.min(ma, Math.max(mi, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  function useRaf(callback) {
    const cbRef = useRef(callback);
    useEffect(() => { cbRef.current = callback; });
    useEffect(() => {
      let raf, running = true;
      const loop = (t) => {
        if (!running) return;
        cbRef.current(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      return () => { running = false; cancelAnimationFrame(raf); };
    }, []);
  }

  // Audio engine: dreamy vapor‑pad using WebAudio, no uploads, fully in code
  function useVaporEngine() {
    const [isPlaying, setIsPlaying] = useState(false);
    const ctxRef = useRef(null);
    const analyserRef = useRef(null);
    const masterRef = useRef(null);
    const oscARef = useRef(null);
    const oscBRef = useRef(null);
    const bassRef = useRef(null);
    const lfoRef = useRef(null);
    const delayRef = useRef(null);
    const filterRef = useRef(null);
    const seqTimerRef = useRef(null);

    const chords = useRef([
      // A minor, Fmaj7, Cmaj7, G
      [220.00, 261.63, 329.63],
      [174.61, 220.00, 349.23],
      [130.81, 261.63, 329.63],
      [196.00, 246.94, 392.00],
    ]);
    const chordIndex = useRef(0);

    const ensureContext = useCallback(() => {
      if (ctxRef.current) return;
      const ctx = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'interactive' });
      ctxRef.current = ctx;

      // Nodes
      const master = ctx.createGain();
      master.gain.value = 0.6;
      masterRef.current = master;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.85;
      analyserRef.current = analyser;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 2200; // soften highs
      filterRef.current = filter;

      const delay = ctx.createDelay(1.5);
      delay.delayTime.value = 0.45;
      delayRef.current = delay;
      const fb = ctx.createGain();
      fb.gain.value = 0.35;
      delay.connect(fb).connect(delay);

      // Slight chorus via dual detuned saws
      const padGain = ctx.createGain();
      padGain.gain.value = 0.25;
      const oscA = ctx.createOscillator();
      oscA.type = 'sawtooth';
      const oscB = ctx.createOscillator();
      oscB.type = 'sawtooth';
      oscARef.current = oscA; oscBRef.current = oscB;

      // subtle LFO for wow/flutter
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.12;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.8; // cents detune
      lfo.connect(lfoGain);
      lfo.start();
      lfoRef.current = lfo;

      // detune via LFO
      lfoGain.connect(oscA.detune);
      lfoGain.connect(oscB.detune);

      // Bass
      const bass = ctx.createOscillator();
      bass.type = 'sine';
      const bassGain = ctx.createGain();
      bassGain.gain.value = 0.15;
      bassRef.current = bass;

      oscA.connect(padGain);
      oscB.connect(padGain);
      padGain.connect(filter);
      bass.connect(bassGain);
      bassGain.connect(filter);

      // FX chain: filter -> delay (feedback) -> master
      filter.connect(delay);
      delay.connect(master);
      filter.connect(master);
      master.connect(analyser);
      analyser.connect(ctx.destination);

      // Start oscillators with initial chord
      const setChord = (notes) => {
        // use two oscillators at lower + upper note averages for a lush pad
        const root = notes[0];
        const high = notes[2];
        try {
          oscA.frequency.setValueAtTime(root / 2, ctx.currentTime);
          oscB.frequency.setValueAtTime(high / 2, ctx.currentTime);
          bass.frequency.setValueAtTime(root / 4, ctx.currentTime);
        } catch (_) {}
      };
      setChord(chords.current[0]);

      // Envelope start
      const now = ctx.currentTime;
      padGain.gain.setValueAtTime(0.0001, now);
      padGain.gain.exponentialRampToValueAtTime(0.25, now + 1.5);
      bassGain.gain.setValueAtTime(0.0001, now);
      bassGain.gain.exponentialRampToValueAtTime(0.15, now + 1.5);

      oscA.start();
      oscB.start();
      bass.start();

      // simple chord progress change every 5.5s
      const tick = () => {
        chordIndex.current = (chordIndex.current + 1) % chords.current.length;
        const notes = chords.current[chordIndex.current];
        const t = ctx.currentTime;
        try {
          oscA.frequency.linearRampToValueAtTime(notes[0] / 2, t + 0.02);
          oscB.frequency.linearRampToValueAtTime(notes[2] / 2, t + 0.04);
          bass.frequency.linearRampToValueAtTime(notes[0] / 4, t + 0.05);
          filter.frequency.linearRampToValueAtTime(lerp(1400, 2600, Math.random()), t + 0.5);
        } catch (_) {}
      };
      seqTimerRef.current = setInterval(tick, 5500);
    }, []);

    const play = useCallback(async () => {
      ensureContext();
      const ctx = ctxRef.current;
      if (ctx.state === 'suspended') await ctx.resume();
      setIsPlaying(true);
    }, [ensureContext]);

    const pause = useCallback(async () => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      if (ctx.state === 'running') await ctx.suspend();
      setIsPlaying(false);
    }, []);

    useEffect(() => () => {
      // cleanup on unmount
      if (seqTimerRef.current) clearInterval(seqTimerRef.current);
      const ctx = ctxRef.current;
      if (ctx) ctx.close();
    }, []);

    return {
      isPlaying,
      analyser: analyserRef,
      play,
      pause,
      ensureContext,
      ctxRef,
    };
  }

  function VisualiserCanvas({ analyserRef, styleName, speed, density, glow, hue }) {
    const wrapRef = useRef(null);
    const canvasRef = useRef(null);
    const dataRef = useRef(null);
    const phaseRef = useRef(0);

    useEffect(() => {
      if (!analyserRef.current) return;
      const analyser = analyserRef.current;
      const bufferLength = analyser.frequencyBinCount;
      dataRef.current = new Uint8Array(bufferLength);
    }, [analyserRef]);

    // draw loop
    useRaf(() => {
      const canvas = canvasRef.current;
      const analyser = analyserRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      // Determine size directly each frame (fallback for browsers without ResizeObserver)
      const rect = wrapRef.current?.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect?.width || canvas.clientWidth || 0));
      const height = Math.max(1, Math.floor(rect?.height || canvas.clientHeight || 0));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width; canvas.height = height;
      }

      // Pull audio data if available; otherwise synthesize a soft fallback pattern
      let values = [];
      if (analyser) {
        if (!dataRef.current) {
          dataRef.current = new Uint8Array(analyser.frequencyBinCount);
        }
        const buffer = dataRef.current;
        analyser.getByteFrequencyData(buffer);
        const bins = Math.max(8, Math.floor(lerp(24, 256, density)));
        const step = Math.max(1, Math.floor(buffer.length / bins));
        values = new Array(bins);
        for (let i=0;i<bins;i++) {
          let sum = 0;
          const start = i*step;
          for (let j=0;j<step;j++) sum += buffer[start + j] || 0;
          values[i] = (sum / step) / 255; // 0..1
        }
      } else {
        // Fallback animated values using time and noise
        const bins = Math.max(8, Math.floor(lerp(24, 256, density)));
        values = new Array(bins);
        const t = phaseRef.current * (0.6 + speed*0.4);
        for (let i=0;i<bins;i++) {
          const k = i / bins;
          values[i] = 0.5 + 0.5*Math.sin(2*Math.PI*(k*1.5 + t)) * (0.6 + 0.4*Math.sin(2*Math.PI*(k*0.25 - t*0.5)));
        }
      }

      // background with slow shifting vignette
      phaseRef.current += 0.002 * speed;
      const t = phaseRef.current;
      const baseHue = hue % 360;
      const bg1 = `hsl(${(baseHue + 240) % 360} 30% 8% / 1)`;
      const bg2 = `hsl(${(baseHue + 280) % 360} 35% 12% / 1)`;
      const g = ctx.createRadialGradient(
        width*0.5 + Math.cos(t)*width*0.1,
        height*0.35 + Math.sin(t*0.8)*height*0.08,
        Math.min(width, height)*0.1,
        width*0.5,
        height*0.5,
        Math.hypot(width, height)*0.7
      );
      g.addColorStop(0, bg2);
      g.addColorStop(1, bg1);
      ctx.fillStyle = g;
      ctx.fillRect(0,0,width,height);

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.shadowColor = `hsl(${baseHue} 100% 60% / 0.8)`;
      ctx.shadowBlur = glow;

      const colorA = `hsl(${baseHue} 100% 70%)`;
      const colorB = `hsl(${(baseHue+60)%360} 100% 70%)`;
      const colorC = `hsl(${(baseHue+300)%360} 100% 70%)`;

      if (styleName === 'bars') {
        const margin = 24;
        const n = Math.max(1, values.length);
        const w = (width - margin*2) / n;
        for (let i=0;i<values.length;i++) {
          // add a baseline so bars are visible even at silence
          const v = Math.max(0.06, values[i] * 0.94);
          const h = (height - margin*2) * Math.pow(v, 0.85);
          const x = margin + i * w;
          const grad = ctx.createLinearGradient(0, height - margin - h, 0, height - margin);
          grad.addColorStop(0, colorA);
          grad.addColorStop(1, colorB);
          ctx.fillStyle = grad;
          ctx.fillRect(x + 1, height - margin - h, Math.max(1, w - 2), h);
          // top dot
          ctx.beginPath();
          ctx.arc(x + w/2, height - margin - h - 4, Math.max(1.5, w*0.12), 0, Math.PI*2);
          ctx.fillStyle = colorC;
          ctx.fill();
        }
      } else if (styleName === 'dots') {
        // dots along a wavy baseline where amplitude modulates radius
        const margin = 24;
        const yBase = height * 0.55;
        const spread = height * 0.22;
        const N = values.length;
        for (let i=0;i<N;i++) {
          const t1 = (i / N) * Math.PI * 2 * (0.5 + speed*0.5) + phaseRef.current*2.0;
          const amp = values[i];
          const x = lerp(margin, width - margin, i / Math.max(1,(N-1)));
          const y = yBase + Math.sin(t1) * spread * (0.35 + amp * 0.9);
          const r = Math.max(1.5, (8 + amp * 24) * (1 + Math.sin(t1+phaseRef.current)*0.15));
          const grad = ctx.createRadialGradient(x, y, 1, x, y, r*1.6);
          grad.addColorStop(0, colorA);
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI*2);
          ctx.fill();
        }
      } else if (styleName === 'grid') {
        // responsive grid; cell brightness from averaged bands and an evolving ripple
        const cols = Math.max(6, Math.floor(lerp(8, 30, density)));
        const rows = Math.max(6, Math.floor(cols * (height/width)));
        const cellW = width / cols;
        const cellH = height / rows;
        const time = phaseRef.current * (1.5 + speed*0.5);
        for (let y=0;y<rows;y++) {
          for (let x=0;x<cols;x++) {
            const idx = Math.floor(((x+y) / (cols+rows)) * Math.max(1,(values.length-1)));
            const v = values[idx];
            const cx = (x+0.5)*cellW, cy = (y+0.5)*cellH;
            const dist = Math.hypot(cx-width/2, cy-height/2) / Math.hypot(width/2, height/2);
            const ripple = 0.5 + 0.5*Math.sin((dist*6 - time*2*Math.PI));
            const bright = Math.pow(clamp(v*0.7 + ripple*0.6,0,1), 1.3);
            ctx.fillStyle = `hsla(${baseHue + bright*80}, 100%, ${lerp(25, 75, bright)}%, ${lerp(0.2, 0.9, bright)})`;
            ctx.fillRect(x*cellW+0.5, y*cellH+0.5, Math.ceil(cellW)-1, Math.ceil(cellH)-1);
          }
        }
      }

      ctx.restore();
    });

    return React.createElement('div', { className: 'canvas-wrap', ref: wrapRef },
      React.createElement('canvas', { ref: canvasRef })
    );
  }

  function HueWheel({ hue, onChange }) {
    const ref = useRef(null);
    const thumbRef = useRef(null);
    const size = 160; const rOuter = 78; const rInner = 48;
    useEffect(() => {
      const canvas = ref.current;
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext('2d');
      // draw ring
      const cx = size/2, cy = size/2;
      const segments = 360;
      for (let i=0;i<segments;i++) {
        const a0 = (i/segments) * Math.PI*2;
        const a1 = ((i+1)/segments) * Math.PI*2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a0)*rInner, cy + Math.sin(a0)*rInner);
        ctx.lineTo(cx + Math.cos(a0)*rOuter, cy + Math.sin(a0)*rOuter);
        ctx.lineTo(cx + Math.cos(a1)*rOuter, cy + Math.sin(a1)*rOuter);
        ctx.lineTo(cx + Math.cos(a1)*rInner, cy + Math.sin(a1)*rInner);
        ctx.closePath();
        ctx.fillStyle = `hsl(${i} 100% 50%)`;
        ctx.fill();
      }
    }, []);

    const setHueFromEvent = (e) => {
      const rect = ref.current.getBoundingClientRect();
      const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
      const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
      const cx = rect.width/2, cy = rect.height/2;
      const dx = x - cx, dy = y - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < rInner || dist > rOuter) return; // outside ring
      let angle = Math.atan2(dy, dx); // -PI..PI
      const degrees = ((angle * 180 / Math.PI) + 360) % 360;
      onChange(Math.round(degrees));
    };

    useEffect(() => {
      const el = ref.current;
      let dragging = false;
      const onDown = (e) => { dragging = true; setHueFromEvent(e); e.preventDefault(); };
      const onMove = (e) => { if (!dragging) return; setHueFromEvent(e); };
      const onUp = () => { dragging = false; };
      el.addEventListener('mousedown', onDown);
      el.addEventListener('touchstart', onDown, { passive: false });
      window.addEventListener('mousemove', onMove);
      window.addEventListener('touchmove', onMove, { passive: false });
      window.addEventListener('mouseup', onUp);
      window.addEventListener('touchend', onUp);
      return () => {
        el.removeEventListener('mousedown', onDown);
        el.removeEventListener('touchstart', onDown);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('touchmove', onMove);
        window.removeEventListener('mouseup', onUp);
        window.removeEventListener('touchend', onUp);
      };
    }, [onChange]);

    // position thumb
    const cx = size/2, cy = size/2;
    const a = hue * Math.PI / 180;
    const tx = cx + Math.cos(a) * (rInner + rOuter)/2;
    const ty = cy + Math.sin(a) * (rInner + rOuter)/2;

    return React.createElement('div', { className: 'hue-wheel' },
      React.createElement('canvas', { ref, width: size, height: size }),
      React.createElement('div', { className: 'hue-thumb', ref: thumbRef, style: { left: tx+'px', top: ty+'px', background: `hsl(${hue} 100% 50%)` } })
    );
  }

  function App() {
    const { isPlaying, analyser, play, pause, ensureContext } = useVaporEngine();
    const [styleName, setStyleName] = useState('bars');
    const [speed, setSpeed] = useState(1);
    const [density, setDensity] = useState(0.5);
    const [glow, setGlow] = useState(18);
    const [hue, setHue] = useState(285); // purple pink default

    useEffect(() => { ensureContext(); }, [ensureContext]);

    return (
      React.createElement('div', { className: 'desktop' },
        React.createElement('div', { className: 'window' },
          React.createElement('div', { className: 'titlebar' },
            React.createElement('div', null, 'Lo‑Fi Visualiser — Win\'96 Edition'),
            React.createElement('div', { className: 'buttons' },
              React.createElement('div', { className: 'px-btn', title: 'Minimize' },
                React.createElement('svg', { viewBox: '0 0 10 10' }, React.createElement('rect', { x: 1, y: 7, width: 8, height: 2 }))
              ),
              React.createElement('div', { className: 'px-btn', title: 'Maximize' },
                React.createElement('svg', { viewBox: '0 0 10 10' }, React.createElement('rect', { x: 1, y: 1, width: 8, height: 8, fill: 'none', stroke: 'black', 'stroke-width': 1 }))
              ),
              React.createElement('div', { className: 'px-btn', title: 'Close' },
                React.createElement('svg', { viewBox: '0 0 10 10' },
                  React.createElement('path', { d: 'M2 2 L8 8 M8 2 L2 8', stroke: 'black', 'stroke-width': 1 })
                )
              )
            )
          ),
          React.createElement('div', { className: 'menubar' },
            React.createElement('div', { className: 'menu-item active' }, 'File'),
            React.createElement('div', { className: 'menu-item' }, 'Edit'),
            React.createElement('div', { className: 'menu-item' }, 'View'),
            React.createElement('div', { className: 'menu-item' }, 'Help')
          ),
          React.createElement('div', { className: 'window-body' },
            React.createElement('div', { className: 'panel' },
              React.createElement('div', { className: 'panel-title' }, 'Controls'),
              React.createElement('div', { className: 'panel-body' },
                React.createElement('div', { className: 'playbar' },
                  React.createElement('button', { className: 'big-btn', onClick: isPlaying ? pause : play, title: isPlaying ? 'Pause' : 'Play' },
                    isPlaying
                      ? React.createElement('svg', { viewBox: '0 0 24 24', width: 18, height: 18 },
                          React.createElement('rect', { x: 5, y: 4, width: 5, height: 16 }),
                          React.createElement('rect', { x: 14, y: 4, width: 5, height: 16 })
                        )
                      : React.createElement('svg', { viewBox: '0 0 24 24', width: 18, height: 18 },
                          React.createElement('path', { d: 'M7 5 L19 12 L7 19 Z' })
                        )
                  ),
                  React.createElement('div', { className: 'hint' }, 'Click Play to start audio (no downloads, fully generated).')
                ),
                React.createElement('div', { className: 'row' },
                  React.createElement('label', null, 'Style'),
                  React.createElement('div', { className: 'style-toggle' },
                    ['bars','dots','grid'].map(s => (
                      React.createElement('button', { key: s, onClick: () => setStyleName(s), className: s===styleName? 'active' : '' }, s)
                    ))
                  )
                ),
                React.createElement('div', { className: 'row' },
                  React.createElement('label', null, 'Speed'),
                  React.createElement('input', { type: 'range', min: 0.2, max: 2.0, step: 0.01, value: speed, onChange: e => setSpeed(parseFloat(e.target.value)) })
                ),
                React.createElement('div', { className: 'row' },
                  React.createElement('label', null, 'Density'),
                  React.createElement('input', { type: 'range', min: 0, max: 1, step: 0.01, value: density, onChange: e => setDensity(parseFloat(e.target.value)) })
                ),
                React.createElement('div', { className: 'row' },
                  React.createElement('label', null, 'Glow'),
                  React.createElement('input', { type: 'range', min: 0, max: 40, step: 1, value: glow, onChange: e => setGlow(parseFloat(e.target.value)) })
                ),
                React.createElement('div', { className: 'row' },
                  React.createElement('label', null, 'Hue'),
                  React.createElement('div', { style: { width: 160 } },
                    React.createElement(HueWheel, { hue, onChange: setHue })
                  )
                ),
                React.createElement('div', { className: 'credits' }, 'Bars • Dots • Grid visual styles. Windows\'96‑style chrome. Made with React + Canvas + WebAudio.')
              )
            ),
            React.createElement('div', { className: 'panel' },
              React.createElement('div', { className: 'panel-title' }, 'Scene'),
              React.createElement('div', { className: 'panel-body' },
                React.createElement(VisualiserCanvas, { analyserRef: analyser, styleName, speed, density, glow, hue })
              ),
              React.createElement('div', { className: 'statusbar' },
                React.createElement('div', null, isPlaying ? 'Playing vapor‑pad' : 'Paused'),
                React.createElement('div', null, `Style: ${styleName}`)
              )
            )
          )
        )
      )
    );
  }

  ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
})();
