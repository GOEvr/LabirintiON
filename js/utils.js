// ============================================================
//  UTILS - Funções utilitárias
// ============================================================
const Utils = {
    formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    },
    dist(x1, y1, x2, y2) {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    },
    rand(min, max) {
        return Math.random() * (max - min) + min;
    },
    randInt(min, max) {
        return Math.floor(this.rand(min, max + 1));
    },
    lerp(a, b, t) {
        return a + (b - a) * t;
    }
};
