// audio.js
// Gentle sine-based musical feedback for the associative-property applet

(() => {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
  
    function now() { return ctx.currentTime; }
  
    function tone(freq, start, dur = 0.18, gain = 0.12) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, start);
      g.gain.setValueAtTime(0.0001, start);
      g.gain.exponentialRampToValueAtTime(gain, start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      o.connect(g).connect(ctx.destination);
      o.start(start);
      o.stop(start + dur + 0.05);
    }
  
    function chord(freqs, dur = 0.35, gain = 0.1) {
      const t = now();
      freqs.forEach(f => tone(f, t, dur, gain));
    }
  
    const SCALE = {
      C: 261.6,
      D: 293.7,
      E: 329.6,
      G: 392.0
    };
  
    const API = {
      play(type) {
        const t = now();
        if (type === 'tap') {
          tone(SCALE.C, t);
          tone(SCALE.E, t + 0.05);
        }
        if (type === 'block') {
          tone(SCALE.E, t);
          tone(SCALE.D, t + 0.06);
        }
      },
  
      seq(type, arg) {
        const t = now();
  
        switch (type) {
          case 'buildStep':
            if (arg === 1) tone(SCALE.C, t);
            if (arg === 2) {
              tone(SCALE.C, t);
              tone(SCALE.E, t + 0.08);
            }
            if (arg === 3) {
              tone(SCALE.C, t);
              tone(SCALE.E, t + 0.08);
              tone(SCALE.G, t + 0.16);
            }
            break;
  
          case 'sceneComplete':
            chord([SCALE.C, SCALE.E, SCALE.G], 0.5);
            break;
  
          case 'transition':
            tone(SCALE.E, t, 0.25);
            tone(SCALE.G, t + 0.12, 0.25);
            break;
  
          case 'transitionStrong':
            chord([SCALE.E, SCALE.G], 0.45);
            break;
  
          case 'mergeStart':
            tone(SCALE.G, t, 0.3);
            tone(SCALE.C, t + 0.18, 0.4);
            break;
  
          case 'shakeConfirm':
            chord([SCALE.C, SCALE.G], 0.6, 0.09);
            break;
  
          case 'sliderRelease':
            tone(SCALE.E, t, 0.22);
            tone(SCALE.C, t + 0.14, 0.3);
            break;
  
          case 'rebuildDone':
            tone(SCALE.C, t);
            tone(SCALE.E, t + 0.1);
            tone(SCALE.G, t + 0.2);
            break;
  
          case 'confirmed':
            chord([SCALE.C, SCALE.E, SCALE.G], 0.7, 0.08);
            break;
  
          case 'reset':
            tone(SCALE.G, t, 0.2);
            tone(SCALE.E, t + 0.1, 0.2);
            tone(SCALE.C, t + 0.2, 0.35);
            break;
        }
      },
  
      slide(value = 3) {
        const f = SCALE.C + value * 20;
        tone(f, now(), 0.05, 0.05);
      }
    };
  
    // expose globally
    window.APP_AUDIO = API;
  
    // unlock audio on first user gesture
    window.addEventListener('pointerdown', () => {
      if (ctx.state !== 'running') ctx.resume();
    }, { once: true });
  })();