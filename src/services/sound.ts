/**
 * Web Audio API procedural cosmic sound synthesizer & ambient soundscape engine
 * Zero external audio file dependencies — 100% procedural Web Audio synthesis.
 */
class SoundService {
  private ctx: AudioContext | null = null;
  public enabled: boolean = false;

  // Ambient Drone Nodes
  private ambientGain: GainNode | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneOsc3: OscillatorNode | null = null;
  private droneLfo: OscillatorNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private isDroneRunning: boolean = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setEnabled(enable: boolean) {
    this.enabled = enable;
    if (enable) {
      this.initContext();
      this.startAmbientDrone();
    } else {
      this.stopAmbientDrone();
    }
  }

  /**
   * Generates continuous cinematic cosmic ambient drone
   * Detuned multi-oscillator chord (55Hz, 82.4Hz, 110Hz) + LFO-swept lowpass filter + stellar hiss
   */
  public startAmbientDrone() {
    if (!this.enabled || this.isDroneRunning) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // Master ambient gain with soft 2.5s fade in
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.001, now);
      this.ambientGain.gain.exponentialRampToValueAtTime(0.045, now + 2.5);
      this.ambientGain.connect(this.ctx.destination);

      // Slow resonant filter
      this.droneFilter = this.ctx.createBiquadFilter();
      this.droneFilter.type = 'lowpass';
      this.droneFilter.frequency.setValueAtTime(220, now);
      this.droneFilter.Q.setValueAtTime(3.2, now);
      this.droneFilter.connect(this.ambientGain);

      // LFO slowly modulating cutoff frequency (0.07 Hz = ~14 second breathing cycle)
      this.droneLfo = this.ctx.createOscillator();
      this.droneLfo.frequency.setValueAtTime(0.07, now);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(90, now);
      this.droneLfo.connect(lfoGain);
      lfoGain.connect(this.droneFilter.frequency);
      this.droneLfo.start(now);

      // Deep space fundamental chords (A1, E2, A2 with micro-detuning)
      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc1.type = 'sine';
      this.droneOsc1.frequency.setValueAtTime(55.0, now); // A1

      this.droneOsc2 = this.ctx.createOscillator();
      this.droneOsc2.type = 'triangle';
      this.droneOsc2.frequency.setValueAtTime(82.4, now); // E2

      this.droneOsc3 = this.ctx.createOscillator();
      this.droneOsc3.type = 'sine';
      this.droneOsc3.frequency.setValueAtTime(110.2, now); // A2 detuned

      this.droneOsc1.connect(this.droneFilter);
      this.droneOsc2.connect(this.droneFilter);
      this.droneOsc3.connect(this.droneFilter);

      this.droneOsc1.start(now);
      this.droneOsc2.start(now);
      this.droneOsc3.start(now);

      // Subtle pink noise generator for cosmic stellar wind
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2) * 0.035;
      }
      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = noiseBuffer;
      this.noiseNode.loop = true;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(650, now);
      noiseFilter.Q.setValueAtTime(1.5, now);

      this.noiseNode.connect(noiseFilter);
      noiseFilter.connect(this.ambientGain);
      this.noiseNode.start(now);

      this.isDroneRunning = true;
    } catch (e) {
      console.warn('Cosmic ambient audio init notice:', e);
    }
  }

  public stopAmbientDrone() {
    if (!this.isDroneRunning || !this.ctx || !this.ambientGain) return;
    try {
      const now = this.ctx.currentTime;
      this.ambientGain.gain.linearRampToValueAtTime(0.0001, now + 1.2);
      setTimeout(() => {
        try {
          this.droneOsc1?.stop();
          this.droneOsc2?.stop();
          this.droneOsc3?.stop();
          this.droneLfo?.stop();
          this.noiseNode?.stop();
          this.droneOsc1?.disconnect();
          this.droneOsc2?.disconnect();
          this.droneOsc3?.disconnect();
          this.droneLfo?.disconnect();
          this.noiseNode?.disconnect();
          this.droneFilter?.disconnect();
          this.ambientGain?.disconnect();
        } catch {
          // ignore cleanup errors
        }
        this.isDroneRunning = false;
      }, 1300);
    } catch {
      this.isDroneRunning = false;
    }
  }

  // --- UI INTERACTION SFX ---
  public playClick() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.06);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.07);
  }

  public playWarp() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(750, this.ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.38);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }

  public playSelect() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
    osc2.frequency.setValueAtTime(659.25, this.ctx.currentTime); // E5

    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(this.ctx.currentTime + 0.2);
    osc2.stop(this.ctx.currentTime + 0.2);
  }

  /**
   * Procedural Space Beep (Sputnik / Deep Space Network ping)
   */
  public playTelemetryPing() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.setValueAtTime(1800, now + 0.08);

    gain.gain.setValueAtTime(0.07, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  /**
   * Procedural Pulsar Radio Signal (Periodic neutron star pulse)
   */
  public playPulsarBurst() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + i * 0.12;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320 - i * 30, t);

      gain.gain.setValueAtTime(0.04, t);
      gain.gain.linearRampToValueAtTime(0.001, t + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.07);
    }
  }
}

export const sound = new SoundService();
