// ============================================================
//  VILLAIN - Lógica do vilão
// ============================================================
function createVillain(x, y, isBoss = false) {
    return {
        x, y,
        animX: x, animY: y,
        progress: 1,
        hp: isBoss ? 3 : 1,
        maxHp: isBoss ? 3 : 1
    };
}

function moveVillainAStar(villain, targetX, targetY, avoid = []) {
    const path = MazeGenerator.aStar(villain.x, villain.y, targetX, targetY, avoid);
    if (path && path.length > 1) {
        const next = path[1];
        let occupied = false;
        // Verifica se a célula está ocupada por outro vilão (passado como referência)
        // Esta verificação é feita fora da função
        return { x: next.x, y: next.y };
    }
    return null;
}

function getFleeTarget(villain, player, mazeGen) {
    // Encontra a célula mais distante do jogador
    let best = { x: villain.x, y: villain.y, dist: 0 };
    const size = mazeGen.size;
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (mazeGen.maze[y][x] === 0) {
                const d = Utils.dist(x, y, player.x, player.y);
                if (d > best.dist) {
                    best = { x, y, dist: d };
                }
            }
        }
    }
    return best;
}
