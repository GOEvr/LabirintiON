// ============================================================
//  RENDERER - Desenho do jogo
//  (Inclui: roundRect para cantos arredondados)
// ============================================================
var Renderer = {
    render: function(game) {
        var ctx = game.ctx;
        var canvas = game.canvas;
        var size = game.currentSize;
        var cell = canvas.width / size;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();

        // Screen shake
        if (game.screenShake > 0) {
            var intensity = game.screenShake * 15;
            ctx.translate((Math.random() - 0.5) * intensity, (Math.random() - 0.5) * intensity);
        }

        // Céu
        var grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        if (game.isSunny) {
            grad.addColorStop(0, '#87CEEB');
            grad.addColorStop(0.6, '#f0e68c');
        } else {
            grad.addColorStop(0, '#4a5f70');
            grad.addColorStop(1, '#2c3e50');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Pássaros
        if (game.isSunny) {
            ctx.fillStyle = '#2c3e50';
            for (var b of game.birds) {
                ctx.beginPath();
                ctx.arc(b.x, b.y, 4, 0, 2 * Math.PI);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(b.x - 6, b.y - 3, 3, 0, 2 * Math.PI);
                ctx.fill();
                ctx.arc(b.x + 6, b.y - 3, 3, 0, 2 * Math.PI);
                ctx.fill();
            }
        }

        // ==========================================================
        //  LABIRINTO
        //  🆕 6º PASSO: CANTOS ARREDONDADOS (roundRect)
        // ==========================================================
        for (var row = 0; row < size; row++) {
            for (var col = 0; col < size; col++) {
                var revealed = game.revealedCells[row] && game.revealedCells[row][col];
                if (!revealed) {
                    ctx.fillStyle = '#0a0a0a';
                    ctx.fillRect(col * cell, row * cell, cell, cell);
                    continue;
                }

                if (MazeGenerator.maze[row][col] === 1) {
                    // Parede com cantos arredondados
                    ctx.fillStyle = '#3a2a1a';
                    ctx.beginPath();
                    if (ctx.roundRect) {
                        ctx.roundRect(col * cell, row * cell, cell, cell, 5);
                    } else {
                        // Fallback para navegadores sem roundRect
                        ctx.rect(col * cell, row * cell, cell, cell);
                    }
                    ctx.fill();

                    // Musgo (mantido como está)
                    ctx.fillStyle = '#4a7a4a';
                    for (var i = 0; i < 3; i++) {
                        var mx = col * cell + Math.random() * cell;
                        var my = row * cell + Math.random() * cell;
                        ctx.beginPath();
                        ctx.arc(mx, my, 2, 0, 2 * Math.PI);
                        ctx.fill();
                    }
                    ctx.strokeStyle = '#2a1a0a';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(col * cell + 2, row * cell + 4);
                    ctx.lineTo(col * cell + 6, row * cell + 12);
                    ctx.stroke();
                } else {
                    // Chão
                    ctx.fillStyle = game.isSunny ? '#7ec87e' : '#4a7a5a';
                    ctx.fillRect(col * cell, row * cell, cell, cell);

                    // Flores
                    for (var f of game.flowers) {
                        if (f.x === col && f.y === row && game.isSunny) {
                            var phase = Math.sin(performance.now() / 1000 + f.phase);
                            var colors = ['#e74c3c', '#f1c40f', '#9b59b6', '#3498db'];
                            ctx.fillStyle = colors[Math.floor(f.phase) % 4];
                            ctx.beginPath();
                            ctx.arc(col * cell + cell / 2 + phase * 3,
                                row * cell + cell / 2 + Math.cos(performance.now() / 1200 + f.phase) * 3,
                                3, 0, 2 * Math.PI);
                            ctx.fill();
                            ctx.fillStyle = '#2ecc71';
                            ctx.beginPath();
                            ctx.arc(col * cell + cell / 2 + phase * 2,
                                row * cell + cell / 2 + Math.cos(performance.now() / 1200 + f.phase) * 2,
                                1.5, 0, 2 * Math.PI);
                            ctx.fill();
                        }
                    }

                    // Espinhos
                    for (var s of game.spikes) {
                        if (s.x === col && s.y === row) {
                            ctx.fillStyle = '#e74c3c';
                            ctx.beginPath();
                            ctx.moveTo(col * cell + cell / 2, row * cell + 4);
                            ctx.lineTo(col * cell + 6, row * cell + 14);
                            ctx.lineTo(col * cell + 14, row * cell + 14);
                            ctx.fill();
                            ctx.beginPath();
                            ctx.moveTo(col * cell + cell / 2, row * cell + 4);
                            ctx.lineTo(col * cell + 22, row * cell + 8);
                            ctx.lineTo(col * cell + 18, row * cell + 16);
                            ctx.fill();
                        }
                    }
                }
            }
        }

        // Portas
        for (var d of game.doors) {
            if (!game.revealedCells[d.y] || !game.revealedCells[d.y][d.x]) continue;
            var x = d.x * cell, y = d.y * cell;
            if (!d.open) {
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(x + 2, y + 2, cell - 4, cell - 4);
                ctx.fillStyle = '#DAA520';
                ctx.font = 'bold 16px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('🔒', x + cell / 2, y + cell / 2);
            } else {
                ctx.fillStyle = 'rgba(46,204,113,0.3)';
                ctx.fillRect(x + 2, y + 2, cell - 4, cell - 4);
                ctx.fillStyle = '#2ecc71';
                ctx.font = 'bold 16px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('🔓', x + cell / 2, y + cell / 2);
            }
        }

        // Pedras do poder
        for (var s of game.powerStones) {
            if (!game.revealedCells[s.y] || !game.revealedCells[s.y][s.x]) continue;
            var x = s.x * cell + cell / 2;
            var y = s.y * cell + cell / 2;
            var angle = (s.angle || 0) + performance.now() / 1000;
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.shadowColor = '#f9d56e';
            ctx.shadowBlur = 25;
            ctx.fillStyle = '#f39c12';
            ctx.beginPath();
            ctx.arc(0, 0, cell * 0.25, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = '#f1c40f';
            ctx.beginPath();
            ctx.arc(-3, -3, cell * 0.1, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.beginPath();
            ctx.arc(x - 4, y - 6, 4, 0, 2 * Math.PI);
            ctx.fill();
        }

        // Pedras falsas
        for (var f of game.fakeStones) {
            if (!game.revealedCells[f.y] || !game.revealedCells[f.y][f.x]) continue;
            var x = f.x * cell + cell / 2;
            var y = f.y * cell + cell / 2;
            ctx.shadowColor = '#e74c3c';
            ctx.shadowBlur = 15;
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.arc(x, y, cell * 0.2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = '#c0392b';
            ctx.beginPath();
            ctx.arc(x - 2, y - 2, cell * 0.08, 0, 2 * Math.PI);
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        // Vilões
        for (var v of game.villains) {
            var revealedVillain = game.revealedCells[v.y] && game.revealedCells[v.y][v.x];
            if (!revealedVillain && !game.isVulnerable) continue;
            var progress = v.progress || 1;
            var animX = v.animX + (v.x - v.animX) * progress;
            var animY = v.animY + (v.y - v.animY) * progress;
            var vx = animX * cell + cell / 2;
            var vy = animY * cell + cell / 2;
            var r = game.isBoss ? cell * 0.5 : cell * 0.4;

            var shakeX = 0, shakeY = 0;
            if (game.isVulnerable) {
                shakeX = (Math.random() - 0.5) * 4;
                shakeY = (Math.random() - 0.5) * 4;
            }

            ctx.save();
            ctx.translate(vx + shakeX, vy + shakeY);
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#333';

            if (game.isVulnerable) ctx.fillStyle = '#bdc3c7';
            else ctx.fillStyle = game.isBoss ? '#6c3483' : '#8e44ad';
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, 2 * Math.PI);
            ctx.fill();

            if (!game.isVulnerable) {
                ctx.strokeStyle = '#f1c40f';
                ctx.lineWidth = 2;
                for (var i = -3; i <= 3; i++) {
                    ctx.beginPath();
                    ctx.ellipse(i * 4, 0, 2, r - 2, i * 0.2, 0, Math.PI * 2);
                    ctx.stroke();
                }
                if (game.isBoss) {
                    for (var i = 0; i < v.hp; i++) {
                        ctx.fillStyle = '#f1c40f';
                        ctx.beginPath();
                        ctx.arc(-r * 0.6 + i * 8, -r + 6, 3, 0, 2 * Math.PI);
                        ctx.fill();
                    }
                }
            } else {
                ctx.strokeStyle = '#e74c3c';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-r * 0.5, -r * 0.5);
                ctx.lineTo(r * 0.5, r * 0.5);
                ctx.moveTo(r * 0.5, -r * 0.5);
                ctx.lineTo(-r * 0.5, r * 0.5);
                ctx.stroke();
                ctx.strokeStyle = '#f1c40f';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(0, 0, r * 0.6, 0, 2 * Math.PI);
                ctx.stroke();
            }

            // Redoma
            ctx.fillStyle = 'rgba(174,214,241,0.4)';
            ctx.strokeStyle = '#aed6f1';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, -r + 4, r * 0.7, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();

            // Olhos (seguem o jogador)
            var angleToPlayer = Math.atan2(
                (game.player.y * cell + cell / 2) - vy,
                (game.player.x * cell + cell / 2) - vx
            );
            var eyeOffset = 4, pupilOffset = 2;
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(-eyeOffset, -r + 2, 5, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(eyeOffset, -r + 2, 5, 0, 2 * Math.PI);
            ctx.fill();

            ctx.fillStyle = game.isVulnerable ? '#c0392b' : '#e74c3c';
            var px2 = Math.cos(angleToPlayer) * pupilOffset;
            var py2 = Math.sin(angleToPlayer) * pupilOffset;
            ctx.beginPath();
            ctx.arc(-eyeOffset + px2, -r + 2 + py2, 2.5, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(eyeOffset + px2, -r + 2 + py2, 2.5, 0, 2 * Math.PI);
            ctx.fill();

            if (game.isVulnerable) {
                ctx.fillStyle = '#c0392b';
                ctx.beginPath();
                ctx.arc(0, -r + 8, 4, 0, Math.PI);
                ctx.fill();
            } else {
                ctx.strokeStyle = '#2c3e50';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-8, -r - 2);
                ctx.lineTo(-4, -r + 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(8, -r - 2);
                ctx.lineTo(4, -r + 2);
                ctx.stroke();
            }
            ctx.restore();
        }

        // Herói
        var pProgress = game.playerAnim.progress || 1;
        var pAnimX = game.playerAnim.x + (game.player.x - game.playerAnim.x) * pProgress;
        var pAnimY = game.playerAnim.y + (game.player.y - game.playerAnim.y) * pProgress;
        var px = pAnimX * cell + cell / 2;
        var py = pAnimY * cell + cell / 2;

        var progressData = SaveManager.getProgress();
        var equippedSkin = progressData.equippedSkin || 0;
        var color = getHeroColor(game.selectedHero, equippedSkin);
        var heroData = getHeroData(game.selectedHero);

        ctx.shadowBlur = 25;
        ctx.shadowColor = color;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(px, py, cell * 0.35, 0, 2 * Math.PI);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.font = cell * 0.35 + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        ctx.fillText(heroData.emoji, px, py + 2);

        // Olhos
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(px - 5, py - 4, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px + 5, py - 4, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#2c3e50';
        ctx.beginPath();
        ctx.arc(px - 5, py - 4, 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px + 5, py - 4, 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px, py + 1, 6, 0, Math.PI);
        ctx.stroke();

        if (heroData.dash && !game.hasDashed) {
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.beginPath();
            ctx.arc(px, py, cell * 0.5, 0, 2 * Math.PI);
            ctx.fill();
        }
        ctx.shadowBlur = 0;

        // Partículas
        for (var p of game.particles) {
            var alpha = Math.max(0, p.life / p.maxLife);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color || '#f1c40f';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * alpha, 0, 2 * Math.PI);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Fog of War (gradiente)
        var gradFog = ctx.createRadialGradient(px, py, 0, px, py, 3.0 * cell * 1.2);
        gradFog.addColorStop(0, 'rgba(0,0,0,0)');
        gradFog.addColorStop(0.8, 'rgba(0,0,0,0)');
        gradFog.addColorStop(1, 'rgba(0,0,0,0.6)');
        ctx.fillStyle = gradFog;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Sol
        if (game.isSunny) {
            ctx.save();
            ctx.shadowColor = '#f1c40f';
            ctx.shadowBlur = 50;
            ctx.beginPath();
            ctx.arc(70, 70, 35, 0, 2 * Math.PI);
            ctx.fillStyle = '#f1c40f';
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(50, 58, 15, 8);
            ctx.fillRect(75, 58, 15, 8);
            ctx.fillRect(65, 58, 10, 4);
            ctx.strokeStyle = 'rgba(241,196,15,0.3)';
            ctx.lineWidth = 3;
            for (var i = 0; i < 12; i++) {
                var angle = i * Math.PI / 6 + performance.now() / 2000;
                ctx.beginPath();
                ctx.moveTo(70 + Math.cos(angle) * 45, 70 + Math.sin(angle) * 45);
                ctx.lineTo(70 + Math.cos(angle) * 60, 70 + Math.sin(angle) * 60);
                ctx.stroke();
            }
            ctx.restore();
        }

        ctx.restore();
    }
};
