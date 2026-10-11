/**
 * Procedural Web Audio API Emergency Siren Synthesizer
 * Produces crisp emergency alerts without external audio file assets.
 */

class EmergencyAudioAlarm {
  constructor() {
    this.ctx = null;
    this.oscillator = null;
    this.gainNode = null;
    this.isPlaying = false;
    this.intervalId = null;
    this.isMuted = false;
  }

  _initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  startAlarm() {
    if (this.isPlaying || this.isMuted) return;
    this._initContext();
    if (!this.ctx) return;

    this.isPlaying = true;
    let high = true;

    const playBeep = () => {
      if (!this.isPlaying || this.isMuted) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      // Alternating dual-tone high urgency siren
      osc.frequency.setValueAtTime(high ? 920 : 680, this.ctx.currentTime);
      high = !high;

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.38);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);
    };

    playBeep();
    this.intervalId = setInterval(playBeep, 450);
  }

  stopAlarm() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopAlarm();
    }
    return this.isMuted;
  }
}

export const audioAlarm = new EmergencyAudioAlarm();
