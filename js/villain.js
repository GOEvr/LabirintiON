// ============================================================
//  VILLAIN - Lógica do vilão (criação e movimento)
// ============================================================
function createVillain(x, y, isBoss) {
    return {
        x: x,
        y: y,
        animX: x,
        animY: y,
        progress: 1,
        hp: isBoss ? 3 : 1,
        maxHp: isBoss ? 3 : 1
    };
}

// Função auxiliar para encontrar a célula mais distante do jogador
function getFleeTarget(villain, player, mazeGen) {
    var best = { x: villain.x, y: villain.y, dist: 0 };
    var size = mazeGen.size;
    for (var y = 0; y < size; y++) {
        for (var x = 0; x < size; x++) {
            if (mazeGen.maze[y][x] === 0) {
                var d = Utils.dist(x, y, player.x, player.y);
                if (d > best.dist) {
                    best = { x: x, y: y, dist: d };
                }
            }
        }
    }
    return best;
}

// Movimento do vilão usando A*
function moveVillainAStar(villain, targetX, targetY, avoid, mazeGen) {
    var path = mazeGen.aStar(villain.x, villain.y, targetX, targetY, avoid);
    if (path && path.length > 1) {
        return { x: path[1].x, y: path[1].y };
    }
    return null;
}
