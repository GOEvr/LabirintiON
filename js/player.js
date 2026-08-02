// ============================================================
//  PLAYER - Dados e habilidades dos heróis
// ============================================================
var HERO_DATA = [
    { name: 'Benício', emoji: '🐱', color: '#3498db', speedBonus: 1.25, vulBonus: 0, dash: false },
    { name: 'Joaquim', emoji: '🦁', color: '#2ecc71', speedBonus: 1.0, vulBonus: 3, dash: false },
    { name: 'Pedro', emoji: '🐉', color: '#e74c3c', speedBonus: 1.0, vulBonus: 0, dash: true }
];

var SKIN_COLORS = {
    0: '#3498db',
    1: '#f1c40f',
    2: '#bdc3c7',
    3: '#e74c3c'
};

function getHeroData(index) {
    return HERO_DATA[index] || HERO_DATA[0];
}

function getHeroColor(heroIndex, skinId) {
    skinId = skinId || 0;
    var base = HERO_DATA[heroIndex] ? HERO_DATA[heroIndex].color : '#3498db';
    return skinId === 0 ? base : (SKIN_COLORS[skinId] || base);
}
