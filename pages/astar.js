var step = 50;
const canv = document.getElementById("canvas");
const ctx = canv.getContext("2d");

function updateSliderValue() {
    const slider = document.getElementById('slider');
    const sliderValue = document.getElementById('sliderValue');
    sliderValue.textContent = slider.value;
}

var maze = {matrix: [], n: 0, start: {x: 0, y: 0}, finish: {x: 0, y: 0}};
function duom(){

    var a = parseInt(document.getElementById("slider").value);
    var b = a;
    canv.width = a * step;
    canv.height = a * step;
    ctx.clearRect(0, 0, canv.width, canv.height);
    maze = createMaze((a + 1) / 2, (b + 1) / 2);
    maze.matrix[0][0] = 2;
    maze.matrix[maze.n - 1][maze.n - 1] = 3;
    maze.finish = {x: maze.n - 1, y: maze.n - 1};
    display(maze.matrix, maze.n, maze.n);
}

function startPointGenerate(n, m) {
    if (Math.random() < 0.5) {
        if (Math.random() < 0.5) {
            start = [0, Math.floor(Math.random() * m)];
        } else {
            start = [n - 1, Math.floor(Math.random() * m)];
        }
    } else {
        if (Math.random() < 0.5) {
            start = [Math.floor(Math.random() * n), 0];
        } else {
            start = [Math.floor(Math.random() * n), m - 1];
        }
    }
    return start;
}

function finishPointGenerate(start, n, m) {
    return [n - 1 - start[0], m - 1 - start[1]];
}

function transitionChoice(x, y, rm) {
    let choiceList = [];
    if (x > 0) {
        if (!rm[x - 1][y]) {
            choiceList.push([x - 1, y]);
        }
    }
    if (x < rm.length - 1) {
        if (!rm[x + 1][y]) {
            choiceList.push([x + 1, y]);
        }
    }
    if (y > 0) {
        if (!rm[x][y - 1]) {
            choiceList.push([x, y - 1]);
        }
    }
    if (y < rm[0].length - 1) {
        if (!rm[x][y + 1]) {
            choiceList.push([x, y + 1]);
        }
    }
    if (choiceList.length > 0) {
        let [nx, ny] = choiceList[Math.floor(Math.random() * choiceList.length)];
        let tx, ty;
        if (x == nx) {
            if (ny > y) {
                tx = x * 2;
                ty = ny * 2 - 1;
            } else {
                tx = x * 2;
                ty = ny * 2 + 1;
            }
        } else {
            if (nx > x) {
                tx = nx * 2 - 1;
                ty = y * 2;
            } else {
                tx = nx * 2 + 1;
                ty = y * 2;
            }
        }
        return [nx, ny, tx, ty];
    } else {
        return [-1, -1, -1, -1];
    }
}

function createMaze(n, m) {

    let reachMatrix = [];
    for (let i = 0; i < n; i++) {
        // создаём матрицу достижимости ячеек
        reachMatrix.push([]);
        for (let j = 0; j < m; j++) {
            reachMatrix[i].push(false);
        }
    }
    let transitionMatrix = [];
    for (let i = 0; i < n * 2 - 1; i++) {
        // заполнение матрицы переходов
        transitionMatrix.push([]);
        for (let j = 0; j < m * 2 - 1; j++) {
            if (i % 2 === 0 && j % 2 === 0) {
                transitionMatrix[i].push(1);
            } else {
                transitionMatrix[i].push(0);
            }
        }
    }
    let start = startPointGenerate(n, m);
    let finish = finishPointGenerate(start, n, m);
    let listTransition = [start];
    let [x, y] = start;
    reachMatrix[x][y] = true;
    let [nx, ny, tx, ty] = transitionChoice(x, y, reachMatrix);
    x = nx;
    y = ny;
    for (let i = 1; i < m * n; i++) {
        while (!(x >= 0 && y >= 0)) {
            [x, y] = listTransition[listTransition.length - 1];
            listTransition.pop();
            [nx, ny, tx, ty] = transitionChoice(x, y, reachMatrix);
            x = nx;
            y = ny;
        }
        reachMatrix[x][y] = 1;
        listTransition.push([x, y]);
        transitionMatrix[tx][ty] = 1;
        [nx, ny, tx, ty] = transitionChoice(x, y, reachMatrix);
        x = nx;
        y = ny;
    }
    console.log("Maze Grid:");
    for (let i = 0; i < transitionMatrix.length; i++) {
        console.log(transitionMatrix[i].join(" "));
    }

    n = n * 2 - 1;
    m = m * 2 - 1;
    // console.log(n);
    // console.log(m);
    start = {x: 0, y: 0};
    finish = {x: n, y: m};
    return ({matrix: transitionMatrix, n: n, start: start, finish: finish});
}

const mouse = { x:0, y:0};
canvas.addEventListener("mousedown", function(e){
      
    mouse.x = e.pageX - this.offsetLeft;
    mouse.y = e.pageY - this.offsetTop;

	var curSqrX = Math.floor(mouse.x / step);
    var curSqrY = Math.floor(mouse.y / step);
    
    const mode = document.getElementById("customizeMode").value;
    if (mode == 'walls') {
        ctx.fillStyle = 'white';
        if (maze.matrix[curSqrY][curSqrX] == 2) {
            maze.start = {x: -1, y: -1};
        }
        if (maze.matrix[curSqrY][curSqrX] == 3) {
            maze.finish = {x: -1, y: -1};
        }
        maze.matrix[curSqrY][curSqrX] = 0;
    }
    if (mode == 'passes') {
        ctx.fillStyle = 'black';
        if (maze.matrix[curSqrY][curSqrX] == 2) {
            maze.start = {x: -1, y: -1};
        }
        if (maze.matrix[curSqrY][curSqrX] == 3) {
            maze.finish = {x: -1, y: -1};
        }
        maze.matrix[curSqrY][curSqrX] = 1;
    }
    if (mode == 'start') {
        if (maze.start.x != -1) {
            ctx.fillStyle = 'black';
            maze.matrix[maze.start.y][maze.start.x] = 1;
            ctx.fillRect(maze.start.x * step, maze.start.y * step, step, step);
        }
        ctx.fillStyle = 'green';
        maze.start = {x: curSqrX, y:curSqrY};
        maze.matrix[curSqrY][curSqrX] = 2;
    }
    if (mode == 'finish') {
        if (maze.finish.x != -1) {
            ctx.fillStyle = 'black';
            maze.matrix[maze.finish.y][maze.finish.x] = 1;
            ctx.fillRect(maze.finish.x * step, maze.finish.y * step, step, step);
        }
        ctx.fillStyle = 'red';
        maze.finish = {x: curSqrX, y:curSqrY};
        maze.matrix[curSqrY][curSqrX] = 3;
    }
    ctx.fillRect(curSqrX * step, curSqrY * step, step, step);
});

function display(matrix, n, m) {
    for (let i = 0; i < n + 1; i++) {
        for (let j = 0; j < m + 1; j++) {
            let y = i * step;
            let x = j * step;

            switch (matrix[i][j]) {
                case 0:
                    ctx.fillStyle = 'white';
                    break;
                case 1:
                    ctx.fillStyle = 'black';
                    break;
                case 2:
                    ctx.fillStyle = "green";
                    break;
                case 3:
                    ctx.fillStyle = "red";
                    break;
                default:
                    ctx.fillStyle = "yellow";
                    break;
            }
            ctx.fillRect(x, y, step, step);
        }
    }
}

function logMatrix(matrix) {
    console.log("Maze Grid:");
    for (let i = 0; i < matrix.length; i++) {
        console.log(matrix[i].join(" "));
    }
}

async function algorithm() {
        /**
     * Манхэттенское расстояние между двумя точками
     * @param {number[]} a - Точка [x, y]
     * @param {number[]} b - Точка [x, y]
     * @returns {number} Расстояние
     */
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function heuristic(a, b) {
        return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
    }

    /**
     * Получает соседей клетки (только по горизонтали/вертикали)
     * @param {number[]} node - Текущая точка [x, y]
     * @param {number[][]} grid - Матрица лабиринта
     * @returns {number[][]} Массив соседей [[x1,y1], [x2,y2], ...]
     */
    function getNeighbors(node, grid) {
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]]; // Вниз, вправо, вверх, влево
        const neighbors = [];
        
        for (const [dx, dy] of directions) {
            const x = node[0] + dx;
            const y = node[1] + dy;
            
            // Проверяем границы и проходимость
            if (x >= 0 && x < grid[0].length && 
                y >= 0 && y < grid.length && 
                grid[y][x] === 1) {
                neighbors.push([x, y]);
            }
        }
        
        return neighbors;
    }

    /**
     * Реализация алгоритма A* для поиска пути
     * @param {number[][]} grid - Матрица лабиринта (0 - стена, 1 - проход)
     * @param {number[]} start - Старт [x, y]
     * @param {number[]} goal - Цель [x, y]
     * @returns {number[][]|null} Кратчайший путь или null
     */
    async function aStar(grid, start, goal) {
        // Валидация входных данных
        if (!grid || !grid.length) return null;
        if (grid[start[1]][start[0]] === 0 || grid[goal[1]][goal[0]] === 0) return null;

        // Структуры данных для алгоритма
        const openSet = new Set([start.toString()]);
        const cameFrom = {};
        const gScore = { [start]: 0 };
        const fScore = { [start]: heuristic(start, goal) };

        while (openSet.size > 0) {
            // Находим узел с минимальным fScore
            let current = null;
            let lowestFScore = Infinity;
            
            for (const nodeStr of openSet) {
                const node = nodeStr.split(',').map(Number);
                if (fScore[node] < lowestFScore) {
                    lowestFScore = fScore[node];
                    current = node;
                }
            }
            ctx.fillRect(current[0] * step, current[1] * step, step, step);
            await delay(200);
            // Проверка достижения цели
            if (current[0] === goal[0] && current[1] === goal[1]) {
                return reconstructPath(cameFrom, current);
            }

            openSet.delete(current.toString());
            
            // Обработка соседей
            for (const neighbor of getNeighbors(current, grid)) {
                const tentativeGScore = gScore[current] + 1; // Стоимость каждого шага = 1
                
                if (tentativeGScore < (gScore[neighbor] ?? Infinity)) {
                    cameFrom[neighbor] = current;
                    gScore[neighbor] = tentativeGScore;
                    fScore[neighbor] = tentativeGScore + heuristic(neighbor, goal);
                    
                    if (!openSet.has(neighbor.toString())) {
                        openSet.add(neighbor.toString());
                    }
                }
            }
        }

        return null; // Путь не найден
    }

    /**
     * Восстанавливает путь от цели к старту
     * @param {Object} cameFrom - Словарь "узел -> родитель"
     * @param {number[]} current - Текущий узел
     * @returns {number[][]} Полный путь
     */
    function reconstructPath(cameFrom, current) {
        const path = [current];
        while (cameFrom[current]) {
            current = cameFrom[current];
            path.unshift(current);
        }
        return path;
    }

    // Пример использования
    maze.matrix[maze.start.y][maze.start.x] = 1;
    maze.matrix[maze.finish.y][maze.finish.x] = 1;
    ctx.fillStyle = "yellow";
    const path = await aStar(maze.matrix, [maze.start.x, maze.start.y], [maze.finish.x, maze.finish.y]);
    if (path) {
        ctx.fillStyle = "green";
        for (const [x, y] of path) {
            ctx.fillRect(x * step, y * step, step, step);
            await delay(200); // Небольшая задержка между шагами пути
        }
        console.log("Кратчайший путь:", path);
    } else {
        console.log("Путь не найден");
    }
}
