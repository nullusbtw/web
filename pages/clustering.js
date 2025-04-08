const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const clearButton = document.getElementById("clearButton");
const algorithmButton = document.getElementById("algorithmButton");
const kMeansSelect = document.getElementById("clusterCount");
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

canvas.addEventListener("click", function(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    drawCircle(x, y, "white");
    points.push({x, y}); // добавляем координаты точки
});

algorithmButton.addEventListener("click", function(){
    if (points.length === 0) return;

    const k = parseInt(kMeansSelect.value); // Получаем количество кластеров из select
    
    if (k > points.length) {
        alert("Количество кластеров не может превышать количество точек.");
        return;
    }
    
    const clusters = kMeans(points, k);
    drawClusters(clusters);
});

// расстояние м-ду точками
function calculateDistance(firstPoint, secondPoint) {
    const deltaX = secondPoint.x - firstPoint.x;
    const deltaY = secondPoint.y - firstPoint.y;
    
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

function kMeans(points, k) {
    let centroids = initializeCentroidsKMeansPlusPlus(points, k);    
    let assignments = new Array(points.length);
    let supporting = true;

    while (supporting) {
        supporting = false;

        for (let i = 0; i < points.length; i++) {
            let minDistance = Infinity;
            let closestCenter = -1;
            for (let j = 0; j < k; j++) {
                let distance = calculateDistance(points[i], centroids[j]);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestCenter = j;
                }
            }

            if (assignments[i] !== closestCenter) {
                supporting = true;
                assignments[i] = closestCenter;
            }
        }

        for (let i = 0; i < centroids.length; i++) {
            let sumX = 0;
            let sumY = 0;
            let count = 0;

            for (let j = 0; j < points.length; j++) {
                if (assignments[j] === i) {
                    sumX += points[j].x;
                    sumY += points[j].y;
                    count++;
                }
            }

            if (count > 0) {
                centroids[i].x = sumX / count;
                centroids[i].y = sumY / count;
            }
        }
    }

    let clustered = [];
    for (let i = 0; i < k; i++) {
        clustered.push([]);
    }

    for (let i = 0; i < points.length; i++) {
        let clusteredIndex = assignments[i];
        clustered[clusteredIndex].push(points[i]);
    }

    return clustered;
}

function initializeCentroidsKMeansPlusPlus(points, k) {
    const centroids = [];

    // случайный первый центроид
    let firstCentroid = Math.floor(Math.random() * points.length);
    centroids.push({ ...points[firstCentroid]});

    // остальные центроиды выбираются с вероятностью на основе удалённости
    while (centroids.length < k) {
        const distances = [];
        for (const point of points) {
            let minDist = Infinity;
            for (const centroid of centroids) {
                const dist = calculateDistance(point, centroid);
                minDist = Math.min(minDist, dist);
            }
            distances.push(minDist);
        }

        // суммируем все расстояния для расчёта вероятности
        let total = 0;
        for (const dist of distances) {
            total += dist;
        }

        // Выбираем точку с вероятностью пропорциональной расстоянию
        let rand = Math.random() * total;
        let selectedCentroid = 0;
        for (let i = 0; i < points.length; i++) {
            rand -= distances[i];
            if (rand <= 0) {
                selectedCentroid = i;
                break;
            }
        }

        centroids.push({ ...points[selectedCentroid]});
    }

    return centroids;
}

function drawClusters(clusters) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const colors = ["red", "green", "blue", "yellow", "orange", "cyan", "purple"];

    for (let index = 0; index < clusters.length; index++) {
        const cluster = clusters[index];
        const color = colors[index % colors.length];
    
        for (let i = 0; i < cluster.length; i++) {
            const point = cluster[i];
            drawCircle(point.x, point.y, color);
        }
    }
}

randomButton.addEventListener("click", function(){
    const countPoints = 250;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    points.length = 0;

    for (let i = 0; i < countPoints; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        drawCircle(x, y, "white");
        points.push({x, y});
    }
});
