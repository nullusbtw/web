const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const clearButton = document.getElementById("clearButton");
const algorithmButton = document.getElementById("algorithmButton");
const kMeansSelect = document.getElementById("clusterCount");
const randomButton = document.getElementById("randomButton");
const points = [];

// открывает окно помощи
helpButton.addEventListener("click", () => {
    helpModal.style.display = "block";
});

// закрывает окно помощи
closeHelpModal.addEventListener("click", () => {
    helpModal.style.display = "none";
});

// закрывает окно помощи при клике вне его
window.addEventListener("click", (event) => {
    if (event.target === helpModal) {
        helpModal.style.display = "none";
    }
});

// очищает холст и массив точек
clearButton.addEventListener("click", function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    points.length = 0;
});

// рисует круг на холсте
function drawCircle(x, y, color) {
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
}

// добавляет точку на холст при клике
canvas.addEventListener("click", function(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    drawCircle(x, y, "white");
    points.push({ x, y }); // добавляем координаты точки
});

// запускает алгоритм k-means кластеризации
algorithmButton.addEventListener("click", function(){
    if (points.length === 0) return;

    const k = parseInt(kMeansSelect.value); // получаем количество кластеров из select
    
    if (k > points.length) {
        alert("Количество кластеров не может превышать количество точек.");
        return;
    }
    
    const clusters = kMeans(points, k);
    drawClusters(clusters);
});

// вычисляет расстояние между двумя точками
function calculateDistance(firstPoint, secondPoint) {
    const deltaX = secondPoint.x - firstPoint.x;
    const deltaY = secondPoint.y - firstPoint.y;
    
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

// выполняет алгоритм k-means кластеризации
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

// инициализирует центроиды для алгоритма k-means++
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

        // выбираем точку с вероятностью пропорциональной расстоянию
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

// рисует кластеры на холсте
function drawClusters(clusters) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const colors = ["Red", "Green", "Blue", "Yellow", "Orange", "Aqua", "Purple",
         "Black", "Gray", "Fuchsia", "Maroon", "Olive", "Lime",
         "Teal", "Navy", "Gold", "Coral", "Chocolate", "Silver", "Pink"];

    for (let index = 0; index < clusters.length; index++) {
        const cluster = clusters[index];
        const color = colors[index % colors.length];
    
        for (let i = 0; i < cluster.length; i++) {
            const point = cluster[i];
            drawCircle(point.x, point.y, color);
        }
    }
}

// генерирует случайные точки на холсте
randomButton.addEventListener("click", function(){
    const countPoints = 300;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    points.length = 0;

    for (let i = 0; i < countPoints; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        drawCircle(x, y, "white");
        points.push({x, y});
    }
});

    // ВТОРОЙ АЛГОРИТМ DBSCAN


// выполняет алгоритм DBSCAN кластеризации
dbscanButton.addEventListener("click", function () {
    if (points.length === 0) return;

    const epsilon = 50; // радиус соседства
    const minPoints = 5; // минимальное количество точек для формирования кластера

    const clusters = dbscan(points, epsilon, minPoints);
    drawClusters(clusters);
});

// выполняет алгоритм DBSCAN кластеризации
function dbscan(points, epsilon, minPoints) {
    const visited = new Set();
    const clusters = [];
    const noise = [];

    function regionQuery(point) {
        return points.filter(p => calculateDistance(point, p) <= epsilon); //находит все точки в окрестности точки
    }

    function expandCluster(point, neighbors, cluster) {
        cluster.push(point);
        visited.add(point);

        for (let i = 0; i < neighbors.length; i++) {
            const neighbor = neighbors[i];     //добавляет точку в кластер и помечает как посещенную
            if (!visited.has(neighbor)) {   //если не посещен, находим его соседей
                visited.add(neighbor);
                const newNeighbors = regionQuery(neighbor);
                if (newNeighbors.length >= minPoints) {
                    neighbors = neighbors.concat(newNeighbors); // добавляем soseda их в список для обработки
                }
            }
            if (!clusters.some(c => c.includes(neighbor))) {
                cluster.push(neighbor);  //если сосед не принадлежит ни одному кластеру добавляем в текущий
            }
        }
    }

    for (const point of points) {
        if (visited.has(point)) continue;
        const neighbors = regionQuery(point);
        if (neighbors.length < minPoints) {   //если соседей меньше помечаем точку как шум
            noise.push(point);
        } 
        else {
            const cluster = [];
            expandCluster(point, neighbors, cluster);   // создаем новый кластер и расширяем его
            clusters.push(cluster);
        }
    }

    return clusters;
}


        // ТРЕТИЙ АЛГОРИТМ ИЕРАРХИЧЕСКИЙ 

// выполняет иерархическую кластеризацию
function hierarchicalClustering(points, numClusters) {
    // инициализация каждая точка это отдельный кластер
    let clusters = points.map(point => [point]); //каждая точка становится отдельным кластером

    // минимальное расстояние
    function clusterDistance(cluster1, cluster2) {
        let minDist = Infinity;
        for (const p1 of cluster1) {
            for (const p2 of cluster2) {
                minDist = Math.min(minDist, calculateDistance(p1, p2));
            }
        }
        return minDist;
    }

    // пока количество кластеров больше требуемого
    while (clusters.length > numClusters) {
        let minDistance = Infinity;
        let mergeIndex1 = -1;
        let mergeIndex2 = -1;

        // найти два ближайших кластера
        for (let i = 0; i < clusters.length; i++) {
            for (let j = i + 1; j < clusters.length; j++) {
                const dist = clusterDistance(clusters[i], clusters[j]);
                if (dist < minDistance) {
                    minDistance = dist;
                    mergeIndex1 = i;
                    mergeIndex2 = j;
                }
            }
        }

        // объединить два ближайших кластера
        const mergedCluster = clusters[mergeIndex1].concat(clusters[mergeIndex2]); //cоздает новый массив объединяя с другой точкой
        clusters.splice(mergeIndex2, 1); // удалить второй кластер
        clusters.splice(mergeIndex1, 1, mergedCluster); // заменить первый кластер объединённым
    }

    return clusters;
}

// запускает иерархическую кластеризацию
hierarchicalButton.addEventListener("click", function () {
    if (points.length === 0) return;

    const numClusters = parseInt(kMeansSelect.value); // количество кластеров из select
    if (numClusters > points.length) {
        alert("Количество кластеров не может превышать количество точек.");
        return;
    }

    const clusters = hierarchicalClustering(points, numClusters);
    drawClusters(clusters);
});


        // СРАВНЕНИЕ

// сравнивает результаты различных алгоритмов кластеризации
compareButton.addEventListener("click", function () {
    if (points.length === 0) return;

    const k = parseInt(kMeansSelect.value); // количество кластеров из select
    if (k > points.length) {
        alert("Количество кластеров не может превышать количество точек.");
        return;
    }

    // выполняем кластеризацию
    const kMeansClusters = kMeans(points, k);
    const dbscanClusters = dbscan(points, 50, 5);
    const hierarchicalClusters = hierarchicalClustering(points, k);

    // сравниваем результаты
    const mismatchedPoints = compareClusterings(points, kMeansClusters, dbscanClusters, hierarchicalClusters);

    const colors = ["Red", "Green", "Blue", "Yellow", "Orange", "Aqua", "Purple",
        "Black", "Gray", "Fuchsia", "Maroon", "Olive", "Lime",
        "Teal", "Navy", "Gold", "Coral", "Chocolate", "Silver", "Pink"];


    // отображаем результаты
    drawClusters(kMeansClusters);
    drawMismatchedPoints(mismatchedPoints, colors, colors, colors);
});

// сравнивает кластеры для каждой точки
function compareClusterings(points, kMeansClusters, dbscanClusters, hierarchicalClusters) {

    // создаем массив для хранения кластеров каждой точки
    const comparisonResults = points.map(point => ({
        point,
        kMeansCluster: findClusterIndex(kMeansClusters, point),
        dbscanCluster: findClusterIndex(dbscanClusters, point),
        hierarchicalCluster: findClusterIndex(hierarchicalClusters, point)
    }));

    // выделяем точки, которые попадают в разные кластеры
    const mismatchedPoints = comparisonResults.filter(result =>
        result.kMeansCluster !== result.dbscanCluster ||
        result.kMeansCluster !== result.hierarchicalCluster ||
        result.dbscanCluster !== result.hierarchicalCluster
    );

    return mismatchedPoints;
}

// находит индекс кластера к которому принадлежит точка
function findClusterIndex(clusters, point) {
    for (let i = 0; i < clusters.length; i++) {
        if (clusters[i].some(p => p.x === point.x && p.y === point.y)) {
            return i;
        }
    }
    return -1;
}

// рисует точки которые попали в разные кластеры
function drawMismatchedPoints(mismatchedPoints, kMeansColors, dbscanColors, hierarchicalColors) {
    for (let i = 0; i < mismatchedPoints.length; i++) {
        const { point, kMeansCluster, dbscanCluster, hierarchicalCluster } = mismatchedPoints[i];

        // верхняя часть точки K-means++
        ctx.beginPath();
        ctx.arc(point.x, point.y, 10, Math.PI, 2 * Math.PI);
        ctx.fillStyle = kMeansCluster !== -1 ? kMeansColors[kMeansCluster % kMeansColors.length] : "white";
        ctx.fill();
        ctx.closePath();

        // нижняя часть точки DBSCAN
        ctx.beginPath();
        ctx.arc(point.x, point.y, 10, 0, Math.PI);
        ctx.fillStyle = dbscanCluster !== -1 ? dbscanColors[dbscanCluster % dbscanColors.length] : "white";
        ctx.fill();
        ctx.closePath();

        // oбводка Иерархическая
        ctx.beginPath();
        ctx.arc(point.x, point.y, 10, 0, 2 * Math.PI);
        ctx.strokeStyle = hierarchicalCluster !== -1 ? hierarchicalColors[hierarchicalCluster % hierarchicalColors.length] : "white";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
    }
}
