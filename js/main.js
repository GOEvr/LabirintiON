// ============================================================
//  MAIN - Inicialização e loop principal
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado – LabirintiON v2.0');

    // Inicializar Game
    Game.init('gameCanvas');

    // Carregar progresso
    const progress = SaveManager.getProgress();
    document.getElementById('bestTimeDisplay').textContent =
        progress.bestTime < Infinity ? Utils.formatTime(progress.bestTime) : '--';
    document.getElementById('coinDisplay').textContent = progress.coins;

    // ===== BOTÕES DOS HERÓIS =====
    document.querySelectorAll('.hero-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const hero = parseInt(this.dataset.hero);
            console.log('Clique no herói', hero);

            // Verifica se o herói está desbloqueado
            if (!progress.heroUnlocked[hero]) {
                alert('Desbloqueie este herói na loja!');
                return;
            }

            // Esconde menu e mostra jogo
            document.getElementById('menu').classList.add('hide');
            document.getElementById('gameArea').classList.remove('hide');

            // Inicia o nível (garantindo que não ultrapasse o número de fases)
            const level = Math.min(progress.level, LevelDefinitions.length - 1);
            Game.startLevel(level, hero);

            // O loop já está rodando, apenas garante que a flag esteja correta
            Game.gameRunning = true;
        });
    });

    // ===== CONTROLES =====
    function setupButton(id, key) {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.addEventListener('mousedown', (e) => { e.preventDefault();
            Game.keys[key] = true;
            AudioManager.init(); });
        btn.addEventListener('mouseup', (e) => { e.preventDefault();
            Game.keys[key] = false; });
        btn.addEventListener('mouseleave', () => { Game.keys[key] = false; });
        btn.addEventListener('touchstart', (e) => { e.preventDefault();
            Game.keys[key] = true;
            AudioManager.init(); });
        btn.addEventListener('touchend', (e) => { e.preventDefault();
            Game.keys[key] = false; });
        btn.addEventListener('touchcancel', () => { Game.keys[key] = false; });
    }
    setupButton('btnUp', 'up');
    setupButton('btnDown', 'down');
    setupButton('btnLeft', 'left');
    setupButton('btnRight', 'right');

    document.addEventListener('keydown', (e) => {
        const key = e.key;
        if (key === 'ArrowUp' || key === 'w') { Game.keys.up = true;
            e.preventDefault(); }
        if (key === 'ArrowDown' || key === 's') { Game.keys.down = true;
            e.preventDefault(); }
        if (key === 'ArrowLeft' || key === 'a') { Game.keys.left = true;
            e.preventDefault(); }
        if (key === 'ArrowRight' || key === 'd') { Game.keys.right = true;
            e.preventDefault(); }
    });
    document.addEventListener('keyup', (e) => {
        const key = e.key;
        if (key === 'ArrowUp' || key === 'w') { Game.keys.up = false;
            e.preventDefault(); }
        if (key === 'ArrowDown' || key === 's') { Game.keys.down = false;
            e.preventDefault(); }
        if (key === 'ArrowLeft' || key === 'a') { Game.keys.left = false;
            e.preventDefault(); }
        if (key === 'ArrowRight' || key === 'd') { Game.keys.right = false;
            e.preventDefault(); }
    });

    // ===== BOTÕES DO MODAL RESULTADO =====
    document.getElementById('nextLevelBtn').addEventListener('click', () => {
        if (Game.gameWin) {
            const next = Game.currentLevel + 1;
            if (next < LevelDefinitions.length) {
                Game.startLevel(next, Game.selectedHero);
            } else {
                // Mostra modal de jogo completo (já tratado no showResult)
                document.getElementById('resultModal').classList.add('hide');
                document.getElementById('completeModal').classList.remove('hide');
            }
        } else {
            Game.startLevel(Game.currentLevel, Game.selectedHero);
        }
    });

    document.getElementById('restartGameBtn').addEventListener('click', () => {
        document.getElementById('menu').classList.remove('hide');
        document.getElementById('gameArea').classList.add('hide');
        document.getElementById('resultModal').classList.add('hide');
        document.getElementById('completeModal').classList.add('hide');
        Game.gameRunning = false;
    });

    document.getElementById('completeRestartBtn').addEventListener('click', () => {
        document.getElementById('completeModal').classList.add('hide');
        document.getElementById('menu').classList.remove('hide');
        document.getElementById('gameArea').classList.add('hide');
        Game.gameRunning = false;
        // Resetar progresso do nível (volta ao início)
        const progress = SaveManager.getProgress();
        progress.level = 0;
        progress.totalScore = 0;
        progress.coins = 0;
        SaveManager.saveProgress(progress);
        document.getElementById('coinDisplay').textContent = 0;
    });

    // ===== LOJA =====
    document.getElementById('shopMenuBtn').addEventListener('click', openShop);
    document.getElementById('closeShop').addEventListener('click', () => {
        document.getElementById('shopModal').classList.add('hide');
    });

    function openShop() {
        const modal = document.getElementById('shopModal');
        modal.classList.remove('hide');
        const progress = SaveManager.getProgress();
        document.getElementById('shopCoins').textContent = progress.coins;
        const container = document.getElementById('shopItems');
        container.innerHTML = '';

        const skins = [
            { id: 0, name: 'Padrão', cost: 0, type: 'skin' },
            { id: 1, name: 'Dourado', cost: 10, type: 'skin' },
            { id: 2, name: 'Prata', cost: 15, type: 'skin' },
            { id: 3, name: 'Rubi', cost: 20, type: 'skin' }
        ];
        const heroes = [
            { id: 1, name: 'Joaquim (Leão)', cost: 15, type: 'hero' },
            { id: 2, name: 'Pedro (Dragão)', cost: 20, type: 'hero' }
        ];
        const allItems = [...skins, ...heroes];

        for (let item of allItems) {
            const div = document.createElement('div');
            div.className = 'item';
            let owned = false;
            let equipped = false;
            if (item.type === 'skin') {
                owned = progress.unlockedSkins.includes(item.id);
                equipped = progress.equippedSkin === item.id;
            } else {
                owned = progress.heroUnlocked[item.id] || false;
            }
            if (owned) div.classList.add('owned');
            if (equipped) div.classList.add('equipped');
            else if (progress.coins < item.cost) div.classList.add('locked');

            div.innerHTML = `<strong>${item.name}</strong><br>${owned ? (equipped ? '✅ ATIVO' : '✅') : '🪙 ' + item.cost}`;

            div.addEventListener('click', () => {
                if (owned) {
                    if (item.type === 'skin') {
                        progress.equippedSkin = item.id;
                        SaveManager.saveProgress(progress);
                        alert('Skin equipada!');
                        openShop();
                    } else {
                        alert('Herói já desbloqueado!');
                    }
                } else if (progress.coins >= item.cost) {
                    progress.coins -= item.cost;
                    if (item.type === 'skin') {
                        progress.unlockedSkins.push(item.id);
                    } else {
                        progress.heroUnlocked[item.id] = true;
                    }
                    SaveManager.saveProgress(progress);
                    document.getElementById('coinDisplay').textContent = progress.coins;
                    alert('Desbloqueado!');
                    openShop();
                } else {
                    alert('Moedas insuficientes!');
                }
            });
            container.appendChild(div);
        }
    }

    // ===== LOOP PRINCIPAL (ÚNICO) =====
    let lastTime = 0;

    function gameLoop(timestamp) {
        if (!lastTime) lastTime = timestamp;
        const delta = Math.min((timestamp - lastTime) / 1000, 0.05);
        lastTime = timestamp;

        if (Game.gameRunning || Game.gameWin) {
            Game.update(delta);
            Game.render();
        }

        requestAnimationFrame(gameLoop);
    }

    // Inicia o loop (uma única vez)
    console.log('Iniciando loop principal...');
    requestAnimationFrame(gameLoop);
});
