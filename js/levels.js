// ============================================================
//  LEVELS - Definição das fases
// ============================================================
const LevelDefinitions = [
    { size: 15, villainSpeed: 0.5, stoneCount: 3, vulDuration: 6, label: '🌳 Nível 1 – A Floresta', hasDoors: false, hasSpikes: false, hasFakeStones: false, villainCount: 1, isBoss: false, story: 'Bem-vindo ao Reino dos Labirintos! O vilão Vitrolan roubou o Cristal do Sol.' },
    { size: 16, villainSpeed: 0.47, stoneCount: 4, vulDuration: 5.5, label: '🚪 Nível 2 – Portas Mágicas', hasDoors: true, hasSpikes: false, hasFakeStones: false, villainCount: 1, isBoss: false, story: 'As portas se fecharam! Colete 2 pedras para abri-las.' },
    { size: 17, villainSpeed: 0.45, stoneCount: 4, vulDuration: 5, label: '🌵 Nível 3 – Campo de Espinhos', hasDoors: false, hasSpikes: true, hasFakeStones: false, villainCount: 1, isBoss: false, story: 'Cuidado com os espinhos! Eles diminuem sua velocidade.' },
    { size: 18, villainSpeed: 0.4, stoneCount: 5, vulDuration: 4, label: '⭐ CHEFE – Vitrolan Gigante', hasDoors: false, hasSpikes: false, hasFakeStones: false, villainCount: 1, isBoss: true, story: 'O grande Vitrolan surgiu! Derrote-o com as pedras do poder!' },
    { size: 19, villainSpeed: 0.38, stoneCount: 5, vulDuration: 4, label: '👥 Nível 5 – Dois Vilões', hasDoors: false, hasSpikes: false, hasFakeStones: false, villainCount: 2, isBoss: false, story: 'Agora são dois Vitrolans! Um persegue, outro patrulha.' },
    { size: 20, villainSpeed: 0.35, stoneCount: 6, vulDuration: 3.5, label: '💎 Nível 6 – Pedras Falsas', hasDoors: false, hasSpikes: false, hasFakeStones: true, villainCount: 1, isBoss: false, story: 'Algumas pedras são falsas! Toque com cuidado.' },
    { size: 21, villainSpeed: 0.33, stoneCount: 6, vulDuration: 3, label: '⭐ CHEFE – Vitrolan das Sombras', hasDoors: false, hasSpikes: false, hasFakeStones: true, villainCount: 2, isBoss: true, story: 'O Vitrolan das Sombras traz dois clones! Enfrente-o com bravura.' }
];
