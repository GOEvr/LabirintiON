// ============================================================
//  AUDIO - Gerenciador de sons
// ============================================================
const AudioManager = {
    ctx: null,

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },

    play(freq, duration, type = 'sine', volume = 0.3) {
        try {
            this.init();
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(volume, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) { /* silêncio */ }
    },

    pickup() {
        this.play(800, 0.15, 'sine', 0.2);
        setTimeout(() => this.play(1000, 0.15, 'sine', 0.2), 100);
    },

    hit() {
        this.play(200, 0.3, 'sawtooth', 0.2);
    },

    victory() {
        this.play(523, 0.2, 'sine', 0.3);
        setTimeout(() => this.play(659, 0.2, 'sine', 0.3), 150);
        setTimeout(() => this.play(784, 0.4, 'sine', 0.3), 300);
    },

    heartbeat() {
        this.play(60, 0.1, 'sine', 0.1);
    },

    boss() {
        this.play(440, 0.3, 'square', 0.15);
        setTimeout(() => this.play(554, 0.3, 'square', 0.15), 200);
    },

    doorOpen() {
        this.play(600, 0.2, 'sine', 0.15);
        setTimeout(() => this.play(800, 0.2, 'sine', 0.15), 100);
    },

    complete() {
        [523, 587, 659, 784].forEach((freq, i) => {
            setTimeout(() => this.play(freq, 0.3, 'sine', 0.25), i * 150);
        });
    }
};
