// ============================================================
//  MAIN - Inicialização e loop principal
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado – LabirintiON com melhorias');

    Game.init('gameCanvas');

    var progress = SaveManager.getProgress();
    document.getElementById('bestTimeDisplay').textContent =
        progress.bestTime < Infinity ? Utils.formatTime(progress.bestTime) : '--';
    document.getElementById('coinDisplay').textContent = progress.coins;

    // ===== BOTÕES DOS HERÓIS =====
    var heroBtns = document.querySelectorAll('.hero-btn');
    for (var i = 0; i < heroBtns.length; i++) {
        heroBtns[i].addEventListener('click', function() {
            var hero = parseInt(this.dataset.hero);
            console.log('Clique no herói', hero);

            // Para teste, todos desbloqueados
            document.getElementById('menu').classList.add('hide');
            document.getElementById('gameArea').classList.remove('hide');

            var level = Math.min(progress.level, LevelDefinitions.length - 1);
            Game.startLevel(level, hero);
            Game.gameRunning = true;
        });
    }

    // ===== CONTROLES =====
    function setupButton(id, key) {
        var btn = document.getElementById(id);
        if (!btn) return;
        btn.addEventListener('mousedown', function(e) {
            e.preventDefault();
            Game.keys[key] = true;
            AudioManager.init();
        });
        btn.addEventListener('mouseup', function(e) {
            e.preventDefault();
            Game.keys[key] = false;
        });
        btn.addEventListener('mouseleave', function() {
            Game.keys[key] = false;
        });
        btn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            Game.keys[key] = true;
            AudioManager.init();
        });
        btn.addEventListener('touchend', function(e) {
            e.preventDefault();
            Game.keys[key] = false;
        });
        btn.addEventListener('touchcancel', function() {
            Game.keys[key] = false;
        });
    }
    setupButton('btnUp', 'up');
    setupButton('btnDown', 'down');
    setupButton('btnLeft', 'left');
    setupButton('btnRight', 'right');

    document.addEventListener('keydown', function(e) {
        var key = e.key;
        if (key === 'ArrowUp' || key === 'w') { Game.keys.up = true;
            e.preventDefault(); }
        if (key === 'ArrowDown' || key === 's') { Game.keys.down = true;
            e.preventDefault(); }
        if (key === 'ArrowLeft' || key === 'a') { Game.keys.left = true;
            e.preventDefault(); }
        if (key === 'ArrowRight' || key === 'd') { Game.keys.right = true;
            e.preventDefault(); }
    });
    document.addEventListener('keyup', function(e) {
        var key = e.key;
        if (key === 'ArrowUp' || key === 'w') { Game.keys.up = false;
            e.preventDefault(); }
        if (key === 'ArrowDown' || key === 's') { Game.keys.down = false;
            e.preventDefault(); }
        if (key === 'ArrowLeft' || key === 'a') { Game.keys.left = false;
            e.preventDefault(); }
        if (key === 'ArrowRight' || key === 'd') { Game.keys.right = false;
            e.preventDefault(); }
    });

    // ===== BOTÕES DO MODAL =====
    document.getElementById('nextLevelBtn').addEventListener('click', function() {
        if (Game.gameWin) {
            var next = Game.currentLevel + 1;
            if (next < LevelDefinitions.length) {
                Game.startLevel(next, Game.selectedHero);
            } else {
                alert('🎉 Parabéns! Você completou todos os níveis!');
                document.getElementById('resultModal').classList.add('hide');
                document.getElementById('menu').classList.remove('hide');
                document.getElementById('gameArea').classList.add('hide');
                Game.gameRunning = false;
            }
        } else {
            Game.startLevel(Game.currentLevel, Game.selectedHero);
        }
    });

    document.getElementById('restartGameBtn').addEventListener('click', function() {
        document.getElementById('menu').classList.remove('hide');
        document.getElementById('gameArea').classList.add('hide');
        document.getElementById('resultModal').classList.add('hide');
        Game.gameRunning = false;
    });

    // ===== LOJA =====
    document.getElementById('shopMenuBtn').addEventListener('click', function() {
        openShop();
    });
    document.getElementById('closeShop').addEventListener('click', function() {
        document.getElementById('shopModal').classList.add('hide');
    });

    function openShop() {
        var modal = document.getElementById('shopModal');
        modal.classList.remove('hide');
        var progress = SaveManager.getProgress();
        document.getElementById('shopCoins').textContent = progress.coins;
        var container = document.getElementById('shopItems');
        container.innerHTML = '';

        var skins = [
            { id: 0, name: 'Padrão', cost: 0, type: 'skin' },
            { id: 1, name: 'Dourado', cost: 10, type: 'skin' },
            { id: 2, name: 'Prata', cost: 15, type: 'skin' },
            { id: 3, name: 'Rubi', cost: 20, type: 'skin' }
        ];
        var heroes = [
            { id: 1, name: 'Joaquim (Leão)', cost: 15, type: 'hero' },
            { id: 2, name: 'Pedro (Dragão)', cost: 20, type: 'hero' }
        ];
        var allItems = skins.concat(heroes);

        for (var i = 0; i < allItems.length; i++) {
            var item = allItems[i];
            var div = document.createElement('div');
            div.className = 'item';
            var owned = false;
            var equipped = false;
            if (item.type === 'skin') {
                owned = progress.unlockedSkins.indexOf(item.id) !== -1;
                equipped = progress.equippedSkin === item.id;
            } else {
                owned = progress.heroUnlocked[item.id] || false;
            }
            if (owned) div.classList.add('owned');
            if (equipped) div.classList.add('equipped');
            else if (progress.coins < item.cost) div.classList.add('locked');

            div.innerHTML = '<strong>' + item.name + '</strong><br>' +
                (owned ? (equipped ? '✅ ATIVO' : '✅') : '🪙 ' + item.cost);

            div.addEventListener('click', function(item) {
                return function() {
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
                };
            }(item));
            container.appendChild(div);
        }
    }

    // ===== LOOP PRINCIPAL (ÚNICO) =====
    var lastTime = 0;

    function gameLoop(timestamp) {
        if (!lastTime) lastTime = timestamp;
        var delta = Math.min((timestamp - lastTime) / 1000, 0.05);
        lastTime = timestamp;

        if (Game.gameRunning || Game.gameWin) {
            Game.update(delta);
            Game.render();
        }

        requestAnimationFrame(gameLoop);
    }

    requestAnimationFrame(gameLoop);
    console.log('Loop principal iniciado');
});
