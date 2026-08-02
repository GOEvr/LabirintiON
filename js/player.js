// ============================================================
//  PLAYER - Dados e habilidades dos heróis
// ============================================================
const HERO_DATA = [
    { name: 'Benício', emoji: '🐱', color: '#3498db', speedBonus: 1.25, vulBonus: 0, dash: false },
    { name: 'Joaquim', emoji: '🦁', color: '#2ecc71', speedBonus: 1.0, vulBonus: 3, dash: false },
    { name: 'Pedro', emoji: '🐉', color: '#e74c3c', speedBonus: 1.0, vulBonus: 0, dash: true }
];

const SKIN_COLORS = {
    0: '#3498db', // Padrão (azul)
    1: '#f1c40f', // Dourado
    2: '#bdc3c7', // Prata
    3: '#e74c3c'  // Rubi
};

function getHeroData(index) {
    return HERO_DATA[index] || HERO_DATA[0];
}

function getHeroColor(heroIndex, skinId = 0) {
    const baseColor = HERO_DATA[heroIndex]?.color || '#3498db';
    // Se a skin for a padrão (0), usa a cor do herói
    if (skinId === 0) return baseColor;
    // Senão, usa a cor da skin
    return SKIN_COLORS[skinId] || baseColor;
}
