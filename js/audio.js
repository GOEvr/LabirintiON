// ============================================================
//  AUDIO - Gerenciador de sons (Web Audio API)
// ============================================================
var AudioManager = {
    ctx: null,

    init: function() {
        if (!this.ctx) {
            try {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                // Silêncio em navegadores sem suporte
            }
        }
    },

    play: function(freq, duration, type, volume) {
        type = type || 'sine';
        volume = volume || 0.3;
        try {
            this.init();
            if (!this.ctx) return;
            var osc = this.ctx.createOscillator();
            var gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(volume, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {}
    },

    pickup: function() {
        var self = this;
        this.play(800, 0.15);
        setTimeout(function() { self.play(1000, 0.15); }, 100);
    },

    hit: function() {
        this.play(200, 0.3, 'sawtooth', 0.2);
    },

    victory: function() {
        var self = this;
        this.play(523, 0.2, 'sine', 0.3);
        setTimeout(function() { self.play(659, 0.2, 'sine', 0.3); }, 150);
        setTimeout(function() { self.play(784, 0.4, 'sine', 0.3); }, 300);
    },

    heartbeat: function() {
        this.play(60, 0.1, 'sine', 0.1);
    },

    boss: function() {
        var self = this;
        this.play(440, 0.3, 'square', 0.15);
        setTimeout(function() { self.play(554, 0.3, 'square', 0.15); }, 200);
    },

    doorOpen: function() {
        var self = this;
        this.play(600, 0.2, 'sine', 0.15);
        setTimeout(function() { self.play(800, 0.2, 'sine', 0.15); }, 100);
    }
};
