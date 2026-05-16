/* ================================================
   NEONLATINO — Sound Effects (opt-in, Web Audio)
   ================================================ */
const NeonSFX = (() => {
  const KEY = 'neonlatino_sfx';
  let ctx = null;
  let enabled = localStorage.getItem(KEY) === '1';

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  }

  function play(freq, duration, type = 'sine', vol = 0.08) {
    if (!enabled) return;
    try {
      const c = getCtx();
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, c.currentTime);
      gain.gain.setValueAtTime(vol, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
      osc.connect(gain).connect(c.destination);
      osc.start();
      osc.stop(c.currentTime + duration);
    } catch {}
  }

  return {
    hover: () => play(1200, 0.06, 'sine', 0.04),
    click: () => play(800, 0.1, 'square', 0.05),
    slide: () => play(400, 0.15, 'sawtooth', 0.03),
    isEnabled: () => enabled,
    toggle() {
      enabled = !enabled;
      localStorage.setItem(KEY, enabled ? '1' : '0');
      return enabled;
    },
    init() {
      const btn = document.getElementById('sfx-toggle');
      if (btn) {
        btn.textContent = enabled ? '🔊 SFX' : '🔇 SFX';
        btn.addEventListener('click', () => {
          const on = NeonSFX.toggle();
          btn.textContent = on ? '🔊 SFX' : '🔇 SFX';
          if (on) NeonSFX.click();
        });
      }
      // Card hover sounds
      document.addEventListener('mouseenter', (e) => {
        if (e.target.closest('.card')) NeonSFX.hover();
      }, true);
    }
  };
})();

document.addEventListener('DOMContentLoaded', NeonSFX.init);
