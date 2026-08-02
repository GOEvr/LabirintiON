// ============================================================
//  UTILS - Funções utilitárias
// ============================================================
const Utils = {
    formatTime: function(seconds) {
        var m = Math.floor(seconds / 60);
        var s = Math.floor(seconds % 60);
        return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    },
    dist: function(x1, y1, x2, y2) {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    },
    rand: function(min, max) {
        return Math.random() * (max - min) + min;
    },
    randInt: function(min, max) {
        return Math.floor(this.rand(min, max + 1));
    },
    clamp: function(val, min, max) {
        return Math.max(min, Math.min(max, val));
    }
};
