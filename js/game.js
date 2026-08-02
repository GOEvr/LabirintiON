// ============================================================
//  GAME - Estado principal do jogo
//  (Inclui: animSpeed 14, interpolação com Math.min, teclas independentes)
// ============================================================
var Game = {
    // Estado
    player: { x: 1, y: 1 },
    playerAnim: { x: 1, y: 1, progress: 1 },
    villains: [],
    powerStones: [],
    fakeStones: [],
    doors: [],
    spikes: [],
    particles: [],
    flowers: [],
    birds: [],
    selectedHero: 0,
    lives: 3,
    score: 0,
    coins: 0,
    isVulnerable: false,
    vulTimer: 0,
    vulDuration: 6,
    isSunny: false,
    gameRunning: false,
    gameWin: false,
    isBoss: false,
    bossPhase: 1,
    moveCooldown: 0,
    villainMoveTimer: 0,
    startTime: 0,
    elapsedTime: 0,
    currentLevel: 0,
    currentSize: 15,
    villainSpeed: 0.35,
    stoneCount: 3,
    revealedCells: [],
    hasDashed: false,
    doorCollectCount: 0,
    screenShake: 0,
    keys: { up: false, down: false, left: false, right: false },
    levelDef: null,
    canvas: null,
    ctx: null,
    uiElements: {},

    init: function(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.uiElements = {
            heroName: document.getElementById('heroName'),
            lives: document.getElementById('lives'),
            heartbeat: document.getElementById('heartbeat'),
            status: document.getElementById('statusDisplay'),
            stoneCount: document.getElementById('stoneCount'),
            timer: document.getElementById('timerDisplay'),
            vulFill: document.getElementById('vulnerabilityFill'),
            levelHud: document.getElementById('levelHud'),
            storyText: document.getElementById('storyText')
        };
        console.log('Game inicializado');
    },

    startLevel: function(levelIndex, heroIndex) {
        console.log('Iniciando nível', levelIndex, 'com herói', heroIndex);
        this.currentLevel = levelIndex;
        this.selectedHero = heroIndex;
        this.levelDef = LevelDefinitions[levelIndex];
        if (!this.levelDef) { console.error('Nível não encontrado!'); return; }
        this.isBoss = this.levelDef.isBoss || false;
        this.bossPhase = 1;

        MazeGenerator.generate(this.levelDef.size, this.levelDef);
        this.currentSize = MazeGenerator.size;
        this.doors = MazeGenerator.doors.slice();
        this.spikes = MazeGenerator.spikes.slice();
        this.fakeStones = MazeGenerator.fakeStones.slice();

        this.player.x = 1;
        this.player.y = 1;
        this.playerAnim.x = 1;
        this.playerAnim.y = 1;
        this.playerAnim.progress = 1;
        this.villains = [];
        this.powerStones = [];
        this.particles = [];
        this.flowers = [];
        this.birds = [];
        this.isVulnerable = false;
        this.vulTimer = 0;
        this.isSunny = false;
        this.gameWin = false;
        this.gameRunning = true;
        this.screenShake = 0;
        this.hasDashed = false;
        this.doorCollectCount = 0;
        this.lives = 3;
        this.score = 0;
        var heroData = getHeroData(heroIndex);
        this.vulDuration = this.levelDef.vulDuration + (heroData.vulBonus || 0);
        this.villainSpeed = this.levelDef.villainSpeed;
        this.stoneCount = this.levelDef.stoneCount;

        // Revelação inicial
        this.revealedCells = [];
        for (var i = 0; i < this.currentSize; i++) {
            this.revealedCells[i] = [];
            for (var j = 0; j < this.currentSize; j++) {
                this.revealedCells[i][j] = false;
            }
        }
        this.revealAround(1, 1, 3);

        // Criar vilões
        for (var i = 0; i < this.levelDef.villainCount; i++) {
            var vx = this.currentSize - 2 - i * 2;
            var vy = this.currentSize - 2 - i;
            if (vx < 1) vx = this.currentSize - 2;
            this.villains.push(createVillain(vx, vy, this.isBoss));
        }

        // Criar pedras
        for (var i = 0; i < this.stoneCount; i++) {
            var pos = MazeGenerator.randomEmptyCell([this.player].concat(this.villains, this.powerStones, this.flowers));
            this.powerStones.push({ x: pos.x, y: pos.y, angle: Math.random() * 2 * Math.PI });
        }

        // Flores
        for (var i = 0; i < 6; i++) {
            var pos = MazeGenerator.randomEmptyCell([this.player].concat(this.villains, this.powerStones, this.flowers));
            this.flowers.push({ x: pos.x, y: pos.y, phase: Math.random() * 2 * Math.PI });
        }

        // Pássaros
        for (var i = 0; i < 3; i++) {
            this.birds.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height * 0.3,
                speed: 20 + Math.random() * 30,
                phase: Math.random() * 2 * Math.PI
            });
        }

        this.startTime = performance.now();
        this.elapsedTime = 0;

        var storyEl = this.uiElements.storyText;
        storyEl.classList.remove('hide');
        storyEl.textContent = '📖 ' + this.levelDef.story;
        var self = this;
        setTimeout(function() { storyEl.classList.add('hide'); }, 4000);

        this.updateUI();
        document.getElementById('resultModal').classList.add('hide');
        this.gameRunning = true;
        console.log('Nível iniciado com sucesso');
    },

    revealAround: function(x, y, radius) {
        for (var dy = -radius; dy <= radius; dy++) {
            for (var dx = -radius; dx <= radius; dx++) {
                var cx = x + dx, cy = y + dy;
                if (cx >= 0 && cx < this.currentSize && cy >= 0 && cy < this.currentSize) {
                    if (Math.abs(dx) + Math.abs(dy) <= radius) {
                        this.revealedCells[cy][cx] = true;
                    }
                }
            }
        }
    },

    // ===== MOVIMENTO DO JOGADOR =====
    movePlayer: function(dx, dy) {
        if (!this.gameRunning || this.gameWin) return;
        var heroData = getHeroData(this.selectedHero);
        var speedFactor = heroData.speedBonus || 1;
        var newX = this.player.x + dx;
        var newY = this.player.y + dy;
        if (newX < 0 || newX >= this.currentSize || newY < 0 || newY >= this.currentSize) return;

        // Parede com dash
        if (MazeGenerator.maze[newY][newX] === 1) {
            if (heroData.dash && !this.hasDashed) {
                this.hasDashed = true;
                var nextX = newX + dx, nextY = newY + dy;
                if (nextX >= 0 && nextX < this.currentSize && nextY >= 0 && nextY < this.currentSize &&
                    MazeGenerator.maze[nextY][nextX] === 0) {
                    this.player.x = nextX;
                    this.player.y = nextY;
                    this.playerAnim.x = this.player.x - dx;
                    this.playerAnim.y = this.player.y - dy;
                    this.playerAnim.progress = 0;
                    this.spawnParticles(this.player.x, this.player.y, '#f1c40f', 10);
                    this.revealAround(this.player.x, this.player.y, 3);
                    AudioManager.pickup();
                    this.updateUI();
                    return;
                }
            }
            return;
        }

        // Portas
        for (var d of this.doors) {
            if (d.x === newX && d.y === newY && !d.open) return;
        }

        // Espinhos
        var onSpike = false;
        for (var s of this.spikes) {
            if (s.x === newX && s.y === newY) { onSpike = true; break; }
        }
        if (onSpike) speedFactor *= 0.6;

        // Movimento
        this.player.x = newX;
        this.player.y = newY;
        this.playerAnim.x = this.player.x - dx;
        this.playerAnim.y = this.player.y - dy;
        this.playerAnim.progress = 0;
        this.revealAround(this.player.x, this.player.y, 3);

        // Coletar pedras
        for (var i = this.powerStones.length - 1; i >= 0; i--) {
            if (this.powerStones[i].x === this.player.x && this.powerStones[i].y === this.player.y) {
                this.powerStones.splice(i, 1);
                this.score += 100;
                AudioManager.pickup();
                this.isVulnerable = true;
                this.vulTimer = this.vulDuration;
                this.isSunny = true;
                this.spikes = [];
                for (var d of this.doors) d.open = true;
                this.villainSpeed = this.levelDef.villainSpeed * 0.7;
                while (this.powerStones.length < this.stoneCount) {
                    var pos = MazeGenerator.randomEmptyCell([this.player].concat(this.villains, this.powerStones, this.flowers));
                    this.powerStones.push({ x: pos.x, y: pos.y, angle: Math.random() * 2 * Math.PI });
                }
                this.doorCollectCount++;
                this.updateUI();
                this.spawnParticles(this.player.x, this.player.y, '#f1c40f', 15);
            }
        }

        // Pedras falsas
        for (var i = this.fakeStones.length - 1; i >= 0; i--) {
            if (this.fakeStones[i].x === this.player.x && this.fakeStones[i].y === this.player.y) {
                this.fakeStones.splice(i, 1);
                this.spawnParticles(this.player.x, this.player.y, '#e74c3c', 20);
                this.screenShake = 0.3;
                this.lives--;
                AudioManager.hit();
                this.updateUI();
                if (this.lives <= 0) {
                    this.gameRunning = false;
                    this.showResult(false);
                }
            }
        }

        // Captura (vulnerável)
        if (this.isVulnerable) {
            for (var v of this.villains) {
                if (this.player.x === v.x && this.player.y === v.y) {
                    if (this.isBoss) {
                        v.hp--;
                        if (v.hp <= 0) {
                            this.gameWin = true;
                            this.gameRunning = false;
                            AudioManager.victory();
                            this.spawnParticles(this.player.x, this.player.y, '#f1c40f', 50);
                            this.screenShake = 0.8;
                            var bonus = this.bossPhase * 200;
                            this.score += 500 + bonus;
                            this.coins += 10 + this.bossPhase * 5;
                            this.showResult(true);
                        } else {
                            this.bossPhase++;
                            this.screenShake = 0.5;
                            AudioManager.boss();
                            var empty = MazeGenerator.randomEmptyCell([this.player].concat(this.villains));
                            v.x = empty.x;
                            v.y = empty.y;
                            v.animX = v.x;
                            v.animY = v.y;
                            v.progress = 1;
                            this.villainSpeed = Math.max(0.2, this.villainSpeed - 0.05);
                            this.updateUI();
                        }
                    } else {
                        this.gameWin = true;
                        this.gameRunning = false;
                        AudioManager.victory();
                        this.spawnParticles(this.player.x, this.player.y, '#f1c40f', 40);
                        this.screenShake = 0.8;
                        var timeBonus = Math.max(0, 300 - Math.floor(this.elapsedTime));
                        var livesBonus = this.lives * 50;
                        this.score += 500 + timeBonus + livesBonus;
                        this.coins += 5;
                        this.showResult(true);
                    }
                    return;
                }
            }
        }

        // Colisão com vilão (não vulnerável)
        if (!this.isVulnerable) {
            for (var v of this.villains) {
                if (this.player.x === v.x && this.player.y === v.y) {
                    this.lives--;
                    AudioManager.hit();
                    this.updateUI();
                    if (this.lives <= 0) {
                        this.gameRunning = false;
                        this.showResult(false);
                    } else {
                        this.player.x = 1;
                        this.player.y = 1;
                        this.playerAnim.x = 1;
                        this.playerAnim.y = 1;
                        this.playerAnim.progress = 1;
                        for (var i = 0; i < this.villains.length; i++) {
                            this.villains[i].x = this.currentSize - 2 - i * 2;
                            this.villains[i].y = this.currentSize - 2 - i;
                            this.villains[i].animX = this.villains[i].x;
                            this.villains[i].animY = this.villains[i].y;
                            this.villains[i].progress = 1;
                        }
                        this.powerStones = [];
                        for (var i = 0; i < this.stoneCount; i++) {
                            var pos = MazeGenerator.randomEmptyCell([this.player].concat(this.villains, this.powerStones, this.flowers));
                            this.powerStones.push({ x: pos.x, y: pos.y, angle: Math.random() * 2 * Math.PI });
                        }
                        this.isVulnerable = false;
                        this.vulTimer = 0;
                        this.isSunny = false;
                        this.updateUI();
                    }
                    return;
                }
            }
        }
        this.updateUI();
    },

    // ===== MOVIMENTO DO VILÃO =====
    moveVillain: function(index) {
        if (!this.gameRunning || this.gameWin) return;
        var v = this.villains[index];
        if (!v) return;

        var targetX = this.player.x, targetY = this.player.y;
        var avoid = [];

        if (this.isVulnerable) {
            // Fuga: célula mais distante do jogador
            var fleeTarget = getFleeTarget(v, this.player, MazeGenerator);
            targetX = fleeTarget.x;
            targetY = fleeTarget.y;
            avoid = [this.player];
        }

        var step = moveVillainAStar(v, targetX, targetY, avoid, MazeGenerator);
        if (step) {
            var occupied = false;
            for (var other of this.villains) {
                if (other !== v && other.x === step.x && other.y === step.y) { occupied = true; break; }
            }
            if (!occupied) {
                v.animX = v.x;
                v.animY = v.y;
                v.x = step.x;
                v.y = step.y;
                v.progress = 0;
            }
        }

        // Colisão com jogador (não vulnerável)
        if (!this.isVulnerable && this.player.x === v.x && this.player.y === v.y) {
            this.lives--;
            AudioManager.hit();
            this.updateUI();
            if (this.lives <= 0) {
                this.gameRunning = false;
                this.showResult(false);
            } else {
                this.player.x = 1;
                this.player.y = 1;
                this.playerAnim.x = 1;
                this.playerAnim.y = 1;
                this.playerAnim.progress = 1;
                for (var i = 0; i < this.villains.length; i++) {
                    this.villains[i].x = this.currentSize - 2 - i * 2;
                    this.villains[i].y = this.currentSize - 2 - i;
                    this.villains[i].animX = this.villains[i].x;
                    this.villains[i].animY = this.villains[i].y;
                    this.villains[i].progress = 1;
                }
                this.powerStones = [];
                for (var i = 0; i < this.stoneCount; i++) {
                    var pos = MazeGenerator.randomEmptyCell([this.player].concat(this.villains, this.powerStones, this.flowers));
                    this.powerStones.push({ x: pos.x, y: pos.y, angle: Math.random() * 2 * Math.PI });
                }
                this.isVulnerable = false;
                this.vulTimer = 0;
                this.isSunny = false;
                this.updateUI();
            }
        }
    },

    spawnParticles: function(x, y, color, count) {
        count = count || 10;
        var cell = this.canvas.width / this.currentSize;
        for (var i = 0; i < count; i++) {
            this.particles.push({
                x: x * cell + cell / 2,
                y: y * cell + cell / 2,
                vx: (Math.random() - 0.5) * 300,
                vy: (Math.random() - 0.5) * 300,
                life: 0.5 + Math.random() * 0.8,
                maxLife: 1.3,
                color: color || '#f1c40f',
                size: 4 + Math.random() * 8
            });
        }
    },

    updateUI: function() {
        var ui = this.uiElements;
        var heroData = getHeroData(this.selectedHero);
        ui.heroName.textContent = '👤 ' + heroData.name;
        var hearts = '';
        for (var i = 0; i < this.lives; i++) hearts += '❤️';
        for (var i = this.lives; i < 3; i++) hearts += '🖤';
        ui.lives.innerHTML = hearts;
        ui.status.textContent = this.isVulnerable ? '🛡️ Quebrado!' : (this.gameWin ? '🏆' : '☁️ Fechado');
        ui.stoneCount.textContent = '💎 ' + this.powerStones.length;
        ui.timer.textContent = '⏱️ ' + Utils.formatTime(this.elapsedTime);
        ui.levelHud.textContent = this.levelDef ? this.levelDef.label : 'Nível ' + (this.currentLevel + 1);

        if (this.isVulnerable) {
            var pct = (this.vulTimer / this.vulDuration) * 100;
            ui.vulFill.style.width = Math.min(100, pct) + '%';
            ui.vulFill.style.background = '#f1c40f';
        } else {
            ui.vulFill.style.width = '0%';
        }

        // Batimentos
        var minDist = Infinity;
        for (var v of this.villains) {
            var d = Utils.dist(v.x, v.y, this.player.x, this.player.y);
            if (d < minDist) minDist = d;
        }
        var hb = ui.heartbeat;
        if (minDist <= 4 && minDist !== Infinity) {
            var intensity = 1 - (minDist / 4);
            var scale = 1 + intensity * 0.8;
            hb.style.transform = 'scale(' + scale + ')';
            hb.style.color = intensity > 0.6 ? '#e74c3c' : '#ff6b6b';
            if (minDist <= 2 && Math.random() < 0.3) AudioManager.heartbeat();
        } else {
            hb.style.transform = 'scale(1)';
            hb.style.color = '#e74c3c';
        }
    },

    showResult: function(win) {
        var modal = document.getElementById('resultModal');
        modal.classList.remove('hide');
        var title = document.getElementById('resultTitle');
        var scoreEl = document.getElementById('resultScore');
        var stats = document.getElementById('resultStats');
        var best = document.getElementById('resultBestTime');
        var coinsEl = document.getElementById('resultCoins');

        if (win) {
            title.textContent = '🏆 Vitória!';
            title.style.color = '#f1c40f';
            var progress = SaveManager.getProgress();
            progress.coins += this.coins;
            if (this.elapsedTime < progress.bestTime) progress.bestTime = this.elapsedTime;
            if (this.currentLevel + 1 > progress.level) progress.level = this.currentLevel + 1;
            if (this.currentLevel % 3 === 2 && progress.unlockedSkins.indexOf(1) === -1) {
                progress.unlockedSkins.push(1);
            }
            SaveManager.saveProgress(progress);
            document.getElementById('coinDisplay').textContent = progress.coins;
        } else {
            title.textContent = '💀 Derrota';
            title.style.color = '#e74c3c';
        }
        scoreEl.textContent = '⭐ ' + this.score;
        stats.innerHTML = '⏱️ ' + Utils.formatTime(this.elapsedTime) + ' &nbsp;|&nbsp; ❤️ ' + this.lives + ' vidas';

        if (win) {
            var bestTime = SaveManager.getProgress().bestTime;
            best.textContent = '🏅 Melhor tempo: ' + (bestTime < Infinity ? Utils.formatTime(bestTime) : '--');
            coinsEl.textContent = '🪙 +' + this.coins + ' moedas';
        } else {
            best.textContent = '';
            coinsEl.textContent = '';
        }

        var nextBtn = document.getElementById('nextLevelBtn');
        if (win && this.currentLevel < LevelDefinitions.length - 1) {
            nextBtn.style.display = 'inline-block';
            nextBtn.textContent = 'Próximo Nível';
        } else if (win && this.currentLevel === LevelDefinitions.length - 1) {
            nextBtn.style.display = 'inline-block';
            nextBtn.textContent = '🎉 Jogo Completo!';
        } else {
            nextBtn.style.display = 'inline-block';
            nextBtn.textContent = 'Tentar Novamente';
        }
    },

    // ===== LOOP PRINCIPAL (update) =====
    update: function(delta) {
        if (!this.gameRunning && !this.gameWin) return;

        if (this.gameRunning) {
            this.elapsedTime = (performance.now() - this.startTime) / 1000;
            this.updateUI();
        }

        if (this.isVulnerable) {
            this.vulTimer -= delta;
            if (this.vulTimer <= 0) {
                this.isVulnerable = false;
                this.vulTimer = 0;
                this.isSunny = false;
                this.villainSpeed = this.levelDef.villainSpeed;
                this.updateUI();
            }
            this.updateUI();
        }

        if (this.gameRunning) {
            this.villainMoveTimer += delta;
            if (this.villainMoveTimer >= this.villainSpeed) {
                this.villainMoveTimer = 0;
                for (var i = 0; i < this.villains.length; i++) {
                    this.moveVillain(i);
                }
            }
        }

        // ==========================================================
        //  🆕 2º e 3º PASSOS: MOVIMENTO MAIS SUAVE
        //  AnimSpeed aumentado para 14.0 e interpolação com Math.min
        // ==========================================================
        var animSpeed = 14.0;  // ANTES: 6.0 → agora mais fluido

        if (this.playerAnim.progress < 1) {
            this.playerAnim.progress = Math.min(1, this.playerAnim.progress + delta * animSpeed);
        }
        for (var v of this.villains) {
            if (v.progress < 1) {
                v.progress = Math.min(1, v.progress + delta * animSpeed);
            }
        }

        // ==========================================================
        //  🆕 5º PASSO: TECLAS INDEPENDENTES (SEM else if)
        //  Permite prioridade da última tecla pressionada
        // ==========================================================
        if (this.moveCooldown <= 0 && this.gameRunning && !this.gameWin) {
            var heroData = getHeroData(this.selectedHero);
            var delay = 0.12 / (heroData.speedBonus || 1);
            var keys = this.keys;

            // Agora cada tecla é verificada independentemente
            if (keys.up) this.movePlayer(0, -1);
            if (keys.down) this.movePlayer(0, 1);
            if (keys.left) this.movePlayer(-1, 0);
            if (keys.right) this.movePlayer(1, 0);

            // Aplica o cooldown se pelo menos uma tecla estiver pressionada
            if (keys.up || keys.down || keys.left || keys.right) {
                this.moveCooldown = delay;
            }
        } else {
            this.moveCooldown -= delta;
        }

        // Atualizar partículas
        for (var i = this.particles.length - 1; i >= 0; i--) {
            var p = this.particles[i];
            p.x += p.vx * delta;
            p.y += p.vy * delta;
            p.life -= delta;
            if (p.life <= 0) this.particles.splice(i, 1);
        }

        // Pássaros
        for (var b of this.birds) {
            b.x += Math.sin(b.phase + performance.now() / 1000) * b.speed * delta;
            b.y += Math.cos(b.phase * 0.7 + performance.now() / 1500) * 20 * delta;
            if (b.x > this.canvas.width) b.x = 0;
            if (b.x < 0) b.x = this.canvas.width;
            if (b.y > this.canvas.height * 0.4) b.y = 0;
            if (b.y < 0) b.y = this.canvas.height * 0.4;
        }

        if (this.screenShake > 0) this.screenShake -= delta;
        if (this.screenShake < 0) this.screenShake = 0;
    },

    render: function() {
        // Delega a renderização para o módulo Renderer
        Renderer.render(this);
    }
};
