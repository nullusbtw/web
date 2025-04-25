const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const clearButton = document.getElementById("clearButton");
const algorithmButton = document.getElementById("algorithmButton");
const randomButton = document.getElementById("randomButton");
const points = [];

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
    const countPoints = 50;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    points.length = 0;

    for (let i = 0; i < countPoints; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        drawCircle(x, y, "white");
        points.push({ x, y });
    }
});

algorithmButton.addEventListener("click", function(){
    if (points.length === 0) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < points.length; i++) {
        drawCircle(points[i].x, points[i].y, "white");
    }

    const result = antColonyOptimization(points, 10, 100, 1, 5, 0.1);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(points[result.bestPath[0]].x, points[result.bestPath[0]].y);
    for (let i = 1; i < result.bestPath.length; i++) {
        ctx.lineTo(points[result.bestPath[i]].x, points[result.bestPath[i]].y);
    }
    ctx.stroke();
});

function calculateDistance(firstPoint, secondPoint) {
    const deltaX = secondPoint.x - firstPoint.x;
    const deltaY = secondPoint.y - firstPoint.y;
    
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

function getGraph(points) {
    const matrix = [];
    for (let i = 0; i < points.length; i++) {
        matrix[i] = [];
        for (let j = 0; j < points.length; j++) {
            if (i === j) {
                matrix[i][j] = Infinity;
            } else {
                matrix[i][j] = calculateDistance(points[i], points[j]);
            }
        }
    }
    return matrix;
}

class Ant {
    constructor(start) {
        this.path = [start];
        this.distance = 0;
    }

    pushNode(node, distance) {
        this.path.push(node);
        this.distance += distance;
    }

    getPos() {
        return this.path[this.path.length - 1];
    }

    getPath() {
        return this.path;
    }

    getDistance() {
        return this.distance;
    }
}

function antColonyOptimization(points, numAnts, iterations, alpha, beta, evaportion) {
    const graph = getGraph(points);
    const pheromones = Array.from({ length: points.length }, () => Array(points.length).fill(1));
    let bestPath = null;
    let bestDistance = Infinity;

    for (let i = 0; i < iterations; i++) {
        const ants = [];

        for (let i = 0; i < numAnts; i++) {
            const startNode = Math.floor(Math.random() * points.length);
            const ant = new Ant(startNode);
            const visited = new Set([startNode]);

            while (visited.size < points.length) {
                const curNode = ant.getPos();
                const probabilities = [];

                for (let j = 0; j < points.length; j++) {
                    if (!visited.has(j)) {
                        const pheromone = pheromones[curNode][j];
                        const distance = graph[curNode][j];
                        const probability = Math.pow(pheromone, alpha) * Math.pow(1 / distance, beta);
                        probabilities[j] = probability;
                    } else {
                        probabilities[j] = 0;
                    }
                }

                const totalProbability = probabilities.reduce((sum, prob) => sum + prob, 0);
                const random = Math.random() * totalProbability;
                let chooseProbability = 0;
                let nextNode = -1;

                for (let j = 0; j < probabilities.length; j++) {
                    chooseProbability += probabilities[j];
                    if (chooseProbability >= random) {
                        nextNode = j;
                        break;
                    }
                }

                ant.pushNode(nextNode, graph[curNode][nextNode]);
                visited.add(nextNode);
            }

            ant.pushNode(startNode, graph[ant.getPos()][startNode]);
            ants.push(ant);
            
            if (ant.getDistance() < bestDistance) {
                bestPath = ant.getPath();
                bestDistance = ant.getDistance();
            }
        }

        for (let i = 0; i < pheromones.length; i++) {
            for (let j = 0; j < pheromones[i].length; j++) {
                pheromones[i][j] *= (1 - evaportion);
            }
        }

        for (const ant of ants) {
            const path = ant.getPath();
            const pathLength = ant.getDistance();

            for (let i = 0; i < path.length - 1; i++) {
                pheromones[path[i]][path[i + 1]] += 1 / pathLength;
            }
        }
    }

    return { bestPath, bestDistance };
}
