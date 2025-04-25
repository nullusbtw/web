const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const clearButton = document.getElementById("clearButton");
const algorithmButton = document.getElementById("algorithmButton");
const randomButton = document.getElementById("randomButton");
const points = [];
let toggle = false;

clearButton.addEventListener("click", function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    points.length = 0;
});

function drawCircle(x, y, color) {
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
}

canvas.addEventListener("click", function (event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    drawCircle(x, y, "white");
    points.push({ x, y });
});

randomButton.addEventListener("click", function () {
    let countPoints = 30;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    points.length = 0;

    for (let i = 0; i < countPoints; i++) {
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        drawCircle(x, y, "white");
        points.push({ x, y });
    }
});

algorithmButton.addEventListener("click", function () {
    toggle = !toggle;

    if (toggle) {
        document.getElementById("algorithmButton").innerText = "Остановить алгоритм";
        genetic(points, points.length * 3, 0.3);
    } else {
        document.getElementById("algorithmButton").innerText = "Запустить алгоритм";
    }
});

function calculateDistance(firstPoint, secondPoint) {
    let deltaX = secondPoint.x - firstPoint.x;
    let deltaY = secondPoint.y - firstPoint.y;
    
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

function getGraph(points) {
    let matrix = [];
    for (let i = 0; i < points.length; i++) {
        matrix[i] = [];
        for (let j = 0; j < points.length; j++) {
            if (i == j) {
                matrix[i][j] = Infinity;
            } else {
                matrix[i][j] = calculateDistance(points[i], points[j]);
            }
        }
    }
    return matrix;
}

function randomPath(n) {
    let path = Array.from({ length: n-1 }, (_, index) => index + 1);

    for (let i = path.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [path[i], path[j]] = [path[j], path[i]];
    }

    path.unshift(0);

    return path;
}

function random(a) {
    return Math.floor(Math.random() * (a + 1));
}

function getPathDist(graph, path) {
    let dist = 0;

    for (let i = 1; i < path.length; i++) {
        dist += graph[path[i]][path[i - 1]];
    }
    dist += graph[0][path[path.length - 1]];

    return dist;
}

function crossover(parent1, parent2, n) {
    let child = [];

    let cut = random(n - 2) + 1;

    let visited = new Array(n).fill(0);

    for (let i = 0; i <= cut; i++) {
        child.push(parent1[i]);
        visited[parent1[i]] = 1;
    }

    for (let i = cut; i < n; i++) {
        if (visited[parent2[i]] == 0) {
            child.push(parent2[i]);
            visited[parent2[i]] = 1;
        }
    }

    for (let i = cut; i < n; i++) {
        if (visited[parent1[i]] == 0) {
            child.push(parent1[i]);
            visited[parent1[i]] = 1;
        }
    }

    return child;
}

function drawPath(path) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < points.length; i++) {
        drawCircle(points[i].x, points[i].y, "white");
    }

    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(points[path[0]].x, points[path[0]].y);
    for (let i = 1; i < path.length; i++) {
        ctx.lineTo(points[path[i]].x, points[path[i]].y);
    }
    ctx.lineTo(points[0].x, points[0].y);
    ctx.stroke();
}

function mutate(child, n) {
    gene1 = random(n - 2) + 1;
    gene2 = random(n - 2) + 1;
    while (gene2 == gene1) {
        gene2 = random(n - 2) + 1;
    }

    [child[gene1], child[gene2]] = [child[gene2], child[gene1]];

    return child;
}

function genetic(points, populationSize, mutationRate) {
    let graph = getGraph(points);
    let population = [];

    for (let i = 0; i < populationSize; i++) {
        let path = randomPath(points.length);
        population.push({ dist: getPathDist(graph, path), path: path });
    }

    population.sort((a, b) => a.dist - b.dist);

    function evolve() {
        if (!toggle) return;

        let parent1 = random(populationSize - 1);
        let parent2 = random(populationSize - 1);
        while (parent2 == parent1) {
            parent2 = random(populationSize - 1);
        }

        let childPath = crossover(population[parent1].path, population[parent2].path, points.length);

        if (Math.random() < mutationRate) {
            childPath = mutate(childPath, points.length);
        }

        let child = { dist: getPathDist(graph, childPath), path: childPath };

        if (child.dist < population[population.length - 1].dist) {
            let i = 0;
            while (child.dist > population[i].dist) {
                i++;
            }

            population.splice(i, 0, child);
            population.pop();
        }

        drawPath(population[0].path);
        requestAnimationFrame(evolve);
    }

    evolve();
}