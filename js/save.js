// ============================================================
//  SAVE - Gerenciador de progresso (localStorage)
// ============================================================
var SaveManager = {
    get: function(key, defaultVal) {
        var data = localStorage.getItem('labirintion_' + key);
        return data ? JSON.parse(data) : defaultVal;
    },

    set: function(key, val) {
        localStorage.setItem('labirintion_' + key, JSON.stringify(val));
    },

    getProgress: function() {
        return {
            level: this.get('level', 0),
            totalScore: this.get('totalScore', 0),
            coins: this.get('coins', 0),
            bestTime: this.get('bestTime', Infinity),
            unlockedSkins: this.get('unlockedSkins', [0]),
            equippedSkin: this.get('equippedSkin', 0),
            heroUnlocked: this.get('heroUnlocked', [true, false, false])
        };
    },

    saveProgress: function(p) {
        this.set('level', p.level);
        this.set('totalScore', p.totalScore);
        this.set('coins', p.coins);
        this.set('bestTime', p.bestTime);
        this.set('unlockedSkins', p.unlockedSkins);
        this.set('equippedSkin', p.equippedSkin);
        this.set('heroUnlocked', p.heroUnlocked);
    }
};
