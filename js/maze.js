// ============================================================
//  MAZE - Geração de labirinto e A*
// ============================================================
const MazeGenerator = {
    size: 15,
    maze: [],
    doors: [],
    spikes: [],
    fakeStones: [],

    generate(size, levelDef) {
        this.size = size;
        this.maze = Array.from({ length: size }, () => Array(size).fill(1));
        this.doors = [];
        this.spikes = [];
        this.fakeStones = [];

        const carve = (maze, cx, cy) => {
            maze[cy][cx] = 0;
            const dirs = [[0, -2], [0, 2], [-2, 0], [2, 0]];
            for (let d of dirs.sort(() => Math.random() - 0.5)) {
                const nx = cx + d[0], ny = cy + d[1];
                if (nx > 0 && nx < size && ny > 0 && ny < size && maze[ny][nx] === 1) {
                    maze[cy + d[1] / 2][cx + d[0] / 2] = 0;
                    carve(maze, nx, ny);
                }
            }
        };

        carve(this.maze, 1, 1);
        this.maze[1][0] = 0;
        this.maze[size - 2][size - 1] = 0;

        // Garantir caminho mínimo
        let attempts = 0;
        while (attempts < 5) {
            const path = this.aStar(1, 1, size - 2, size - 2);
            if (path && path.length > 10) break;
            this.maze = Array.from({ length: size }, () => Array(size).fill(1));
            carve(this.maze, 1, 1);
            this.maze[1][0] = 0;
            this.maze[size - 2][size - 1] = 0;
            attempts++;
        }

        // Elementos do nível
        if (levelDef.hasDoors) {
            for (let i = 0; i < 2; i++) {
                let pos = this.randomEmptyCell();
                this.doors.push({ x: pos.x, y: pos.y, open: false, required: 2 });
            }
        }
        if (levelDef.hasSpikes) {
            for (let i = 0; i < 6; i++) {
                let pos = this.randomEmptyCell();
                this.spikes.push({ x: pos.x, y: pos.y });
            }
        }
        if (levelDef.hasFakeStones) {
            for (let i = 0; i < 3; i++) {
                let pos = this.randomEmptyCell();
                this.fakeStones.push({ x: pos.x, y: pos.y });
            }
        }
    },

    randomEmptyCell(exclude = []) {
        const size = this.size;
        for (let i = 0; i < 2000; i++) {
            let x = Math.floor(Math.random() * size);
            let y = Math.floor(Math.random() * size);
            if (this.maze[y][x] === 0) {
                let ok = true;
                for (let e of exclude) {
                    if (e.x === x && e.y === y) { ok = false; break; }
                }
                for (let d of this.doors) if (d.x === x && d.y === y) ok = false;
                for (let s of this.spikes) if (s.x === x && s.y === y) ok = false;
                for (let f of this.fakeStones) if (f.x === x && f.y === y) ok = false;
                if (ok) return { x, y };
            }
        }
        return { x: 1, y: 1 };
    },

    // ===== A* =====
    aStar(startX, startY, targetX, targetY, avoidPositions = []) {
        const size = this.size;
        const open = [];
        const closed = new Set();
        const cameFrom = {};
        const gScore = {};
        const fScore = {};
        const startKey = `${startX},${startY}`;
        gScore[startKey] = 0;
        fScore[startKey] = Utils.dist(startX, startY, targetX, targetY);
        open.push({ x: startX, y: startY, f: fScore[startKey] });

        while (open.length > 0) {
            open.sort((a, b) => a.f - b.f);
            const current = open.shift();
            const key = `${current.x},${current.y}`;
            if (current.x === targetX && current.y === targetY) {
                let path = [];
                let c = { x: current.x, y: current.y };
                while (c) {
                    path.push({ x: c.x, y: c.y });
                    const p = cameFrom[`${c.x},${c.y}`];
                    if (p) c = p;
                    else break;
                }
                path.reverse();
                return path;
            }
            closed.add(key);
            const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
            for (let d of dirs) {
                const nx = current.x + d[0], ny = current.y + d[1];
                if (nx < 0 || nx >= size || ny < 0 || ny >= size) continue;
                if (this.maze[ny][nx] === 1) continue;
                let blocked = false;
                for (let door of this.doors) {
                    if (door.x === nx && door.y === ny && !door.open) blocked = true;
                }
                if (blocked) continue;
                if (avoidPositions.some(p => p.x === nx && p.y === ny)) continue;
                const nKey = `${nx},${ny}`;
                if (closed.has(nKey)) continue;
                const tentative = gScore[key] + 1;
                if (!gScore[nKey] || tentative < gScore[nKey]) {
                    cameFrom[nKey] = { x: current.x, y: current.y };
                    gScore[nKey] = tentative;
                    fScore[nKey] = tentative + Utils.dist(nx, ny, targetX, targetY);
                    if (!open.some(o => o.x === nx && o.y === ny)) {
                        open.push({ x: nx, y: ny, f: fScore[nKey] });
                    }
                }
            }
        }
        return null;
    }
};
