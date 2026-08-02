// ============================================================
//  MAZE - Geração de labirinto e A*
//  (Adicionado: criação de loops para múltiplos caminhos)
// ============================================================
var MazeGenerator = {
    size: 15,
    maze: [],
    doors: [],
    spikes: [],
    fakeStones: [],

    generate: function(size, levelDef) {
        this.size = size;
        this.maze = [];
        for (var i = 0; i < size; i++) {
            this.maze[i] = [];
            for (var j = 0; j < size; j++) {
                this.maze[i][j] = 1;
            }
        }
        this.doors = [];
        this.spikes = [];
        this.fakeStones = [];

        var self = this;

        // === BACKTRACKING BÁSICO ===
        function carve(maze, cx, cy) {
            maze[cy][cx] = 0;
            var dirs = [[0, -2], [0, 2], [-2, 0], [2, 0]];
            // Embaralha as direções
            for (var k = 0; k < dirs.length; k++) {
                var r = Math.random();
                var idx = Math.floor(r * dirs.length);
                var temp = dirs[k];
                dirs[k] = dirs[idx];
                dirs[idx] = temp;
            }
            for (var d of dirs) {
                var nx = cx + d[0], ny = cy + d[1];
                if (nx > 0 && nx < size && ny > 0 && ny < size && maze[ny][nx] === 1) {
                    maze[cy + d[1] / 2][cx + d[0] / 2] = 0;
                    carve(maze, nx, ny);
                }
            }
        }
        carve(this.maze, 1, 1);
        this.maze[1][0] = 0;
        this.maze[size - 2][size - 1] = 0;

        // === GARANTIR CAMINHO MÍNIMO ===
        var attempts = 0;
        while (attempts < 5) {
            var path = this.aStar(1, 1, size - 2, size - 2);
            if (path && path.length > 10) break;
            this.maze = [];
            for (var i = 0; i < size; i++) {
                this.maze[i] = [];
                for (var j = 0; j < size; j++) {
                    this.maze[i][j] = 1;
                }
            }
            carve(this.maze, 1, 1);
            this.maze[1][0] = 0;
            this.maze[size - 2][size - 1] = 0;
            attempts++;
        }

        // === ELEMENTOS DO NÍVEL ===
        if (levelDef.hasDoors) {
            for (var i = 0; i < 2; i++) {
                var p = this.randomEmptyCell();
                this.doors.push({ x: p.x, y: p.y, open: false, required: 2 });
            }
        }
        if (levelDef.hasSpikes) {
            for (var i = 0; i < 6; i++) {
                var p = this.randomEmptyCell();
                this.spikes.push({ x: p.x, y: p.y });
            }
        }
        if (levelDef.hasFakeStones) {
            for (var i = 0; i < 3; i++) {
                var p = this.randomEmptyCell();
                this.fakeStones.push({ x: p.x, y: p.y });
            }
        }

        // ==========================================================
        //  🆕 1º PASSO: ABRIR CAMINHOS EXTRAS (LOOPS)
        //  Cria atalhos para tornar o labirinto menos linear
        // ==========================================================
        var extraPassages = Math.floor(size * size * 0.06);
        for (var i = 0; i < extraPassages; i++) {
            var x = 1 + Math.floor(Math.random() * (size - 2));
            var y = 1 + Math.floor(Math.random() * (size - 2));
            if (this.maze[y][x] !== 1) continue;
            var openCount = 0;
            if (x > 0 && this.maze[y][x - 1] === 0) openCount++;
            if (x < size - 1 && this.maze[y][x + 1] === 0) openCount++;
            if (y > 0 && this.maze[y - 1][x] === 0) openCount++;
            if (y < size - 1 && this.maze[y + 1][x] === 0) openCount++;
            if (openCount >= 2) {
                this.maze[y][x] = 0; // abre a parede
            }
        }
    },

    randomEmptyCell: function(exclude) {
        exclude = exclude || [];
        for (var i = 0; i < 2000; i++) {
            var x = Math.floor(Math.random() * this.size);
            var y = Math.floor(Math.random() * this.size);
            if (this.maze[y][x] === 0) {
                var ok = true;
                for (var e of exclude) {
                    if (e.x === x && e.y === y) { ok = false; break; }
                }
                for (var d of this.doors) if (d.x === x && d.y === y) ok = false;
                for (var s of this.spikes) if (s.x === x && s.y === y) ok = false;
                for (var f of this.fakeStones) if (f.x === x && f.y === y) ok = false;
                if (ok) return { x: x, y: y };
            }
        }
        return { x: 1, y: 1 };
    },

    // ===== A* =====
    aStar: function(sx, sy, tx, ty, avoid) {
        avoid = avoid || [];
        var size = this.size;
        var open = [];
        var closed = {};
        var cameFrom = {};
        var gScore = {};
        var fScore = {};
        var startKey = sx + ',' + sy;
        gScore[startKey] = 0;
        fScore[startKey] = Utils.dist(sx, sy, tx, ty);
        open.push({ x: sx, y: sy, f: fScore[startKey] });

        while (open.length > 0) {
            open.sort(function(a, b) { return a.f - b.f; });
            var cur = open.shift();
            var key = cur.x + ',' + cur.y;
            if (cur.x === tx && cur.y === ty) {
                var path = [];
                var c = { x: cur.x, y: cur.y };
                while (c) {
                    path.push({ x: c.x, y: c.y });
                    var p = cameFrom[c.x + ',' + c.y];
                    if (p) c = p;
                    else break;
                }
                path.reverse();
                return path;
            }
            closed[key] = true;
            var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
            for (var d of dirs) {
                var nx = cur.x + d[0], ny = cur.y + d[1];
                if (nx < 0 || nx >= size || ny < 0 || ny >= size) continue;
                if (this.maze[ny][nx] === 1) continue;
                var blocked = false;
                for (var door of this.doors) {
                    if (door.x === nx && door.y === ny && !door.open) { blocked = true; break; }
                }
                if (blocked) continue;
                var avoidBlocked = false;
                for (var a of avoid) {
                    if (a.x === nx && a.y === ny) { avoidBlocked = true; break; }
                }
                if (avoidBlocked) continue;
                var nKey = nx + ',' + ny;
                if (closed[nKey]) continue;
                var tentative = gScore[key] + 1;
                if (gScore[nKey] === undefined || tentative < gScore[nKey]) {
                    cameFrom[nKey] = { x: cur.x, y: cur.y };
                    gScore[nKey] = tentative;
                    fScore[nKey] = tentative + Utils.dist(nx, ny, tx, ty);
                    var found = false;
                    for (var o of open) {
                        if (o.x === nx && o.y === ny) { found = true; break; }
                    }
                    if (!found) {
                        open.push({ x: nx, y: ny, f: fScore[nKey] });
                    }
                }
            }
        }
        return null;
    }
};
