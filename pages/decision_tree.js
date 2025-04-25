const trainFileInput = document.getElementById('trainFile');
const loadTrainBtn = document.getElementById('loadTrainBtn');
const trainDataTextarea = document.getElementById('trainData');
const buildTreeBtn = document.getElementById('buildTreeBtn');
const classifyFileInput = document.getElementById('classifyFile');
const loadClassifyBtn = document.getElementById('loadClassifyBtn');
const classifyDataTextarea = document.getElementById('classifyData');
const classifyBtn = document.getElementById('classifyBtn');
const canvas = document.getElementById('treeCanvas');
const ctx = canvas.getContext('2d');

setupCanvas();
window.addEventListener('resize', setupCanvas);
loadTrainBtn.addEventListener('click', loadTrainData);
buildTreeBtn.addEventListener('click', buildTreeHandler);
loadClassifyBtn.addEventListener('click', loadClassifyData);
classifyBtn.addEventListener('click', classifyDataHandler);

let trainingData = [];
let treeModel = null;
let headers = [];
let lastClassificationPath = [];
let canvasOffsetX = 0;
let canvasOffsetY = 0;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;

let zoomLevel = 1; // текущий уровень зума
const minZoom = 0.1; // минимальный зум
const maxZoom = 2.5; // максимальный зум

// настраивает размеры canvas в зависимости от размеров контейнера
function setupCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}

// загружает обучающие данные из выбранного файла
function loadTrainData() {
    if (trainFileInput.files.length > 0) {
        const file = trainFileInput.files[0]; // получаю выбранный файл
        const reader = new FileReader(); // читает файл

        reader.onload = function (e) {      // обратывает события когда срабатывает FileReader
            trainDataTextarea.value = e.target.result;  // записываем его в textarea
        };

        reader.readAsText(file);   // запускает процесс чтения
    }
}

// загружает данные для классификации из выбранного файла
function loadClassifyData() {
    if (classifyFileInput.files.length > 0) {
        const file = classifyFileInput.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            classifyDataTextarea.value = e.target.result;
        };

        reader.readAsText(file);
    }
}

// парсит CSV-данные в массив объектов и возвращает заголовки и данные
function parseCSV(csv) {
    const lines = csv.split('\n').filter(line => line.trim() !== '');  // сплитует на строки и удаляет пробелы
    const headers = lines[0].split(',').map(h => h.trim()); // сплитует заголовки по , и удаляет пробелы
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const entry = {}; // создаем пустой объект для текущей строки

        // заполняем обьект
        for (let j = 0; j < headers.length; j++) {
            entry[headers[j]] = values[j] ? values[j].trim() : '';
        }

        data.push(entry);
    }

    return { headers, data };
}

// обрабатывает событие построения дерева решений
function buildTreeHandler() {
    const csvData = trainDataTextarea.value.trim(); // получаем текст из textarea
    if (csvData) {
        try {                                   // "опасный код" или ошибка
            const parsedData = parseCSV(csvData);
            if (parsedData.data.length > 0) {
                trainingData = parsedData.data;  // сохраняем данные
                headers = parsedData.headers;      //сохраняем данные
                treeModel = buildDecisionTree(trainingData);
                lastClassificationPath = [];  // очищаем предыдущий путь классификации,
                drawTree(treeModel); // отрисовки дерева
            } 
            else {
                alert('Ошибка: Данные отсутствуют или неверный формат CSV.');
            }
        } 
        catch (error) {
            alert('Ошибка при обработке данных: ' + error.message);
        }
    } 
    else {
        alert('Пожалуйста, загрузите или введите обучающие данные.');
    }
}

// строит дерево решений на основе обучающих данных
function buildDecisionTree(data) {
    if (data.length === 0) return null;

    const targetAttribute = headers[headers.length - 1]; // выбираем последний столбец
    const uniqueClasses = [...new Set(data.map(item => item[targetAttribute]))]; // расспаковываем фильтруем сетом и перемешаем мапом находим уникальные классы

    if (uniqueClasses.length === 1) {
        // если все элементы принадлежат одному классу, создаем лист
        return {
            type: 'leaf',
            value: uniqueClasses[0],
            count: data.length
        };
    }

    let bestAttribute = null; // лучший атрибут для разделения
    let bestGain = -1; // максимальный прирост информации

    for (let i = 0; i < headers.length - 1; i++) {
        const attribute = headers[i]; // текущий атрибут
        const gain = calculateInformationGain(data, attribute, targetAttribute); // вычисляем прирост информации

        if (gain > bestGain) {
            // обновляем лучший атрибут, если прирост информации больше
            bestGain = gain;
            bestAttribute = attribute;
        }
    }

    if (!bestAttribute) {
        // если нет подходящего атрибута возвращаем лист с большинством класса
        const classCounts = {};
        for (let i = 0; i < data.length; i++) {
            const cls = data[i][targetAttribute];
            classCounts[cls] = (classCounts[cls] || 0) + 1;
        }
        // преобразует объект в массив пар и находим максимальное значение
        const majorityClass = Object.entries(classCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0]; 

        return {
            type: 'leaf',
            value: majorityClass,
            count: data.length
        };
    }

    const node = {
        type: 'node', // создаем узел
        attribute: bestAttribute, // сохраняем лучший атрибут
        children: {}, // дочерние узлы
        count: data.length
    };

    const attributeValues = [...new Set(data.map(item => item[bestAttribute]))]; // уникальные значения атрибута
   
    for (let i = 0; i < attributeValues.length; i++) {
        const value = attributeValues[i]; //  уникальные значения для какого либо атрибута
        // создаем поддеревья для каждого значения атрибута
        const subset = data.filter(item => item[bestAttribute] === value);
        node.children[value] = buildDecisionTree(subset); // рекурсивно для остальный веток
    }

    return node;
}

// вычисляет прирост информации для заданного атрибута
function calculateInformationGain(data, attribute, targetAttribute) {
    const totalEntropy = calculateEntropy(data, targetAttribute); // вычисляем общую энтропию
    const attributeValues = [...new Set(data.map(item => item[attribute]))]; // уникальные значения атрибута
    let remainder = 0; // остаточная энтропия

    //смотрим что происходит с энтропией если данные разделить
    for (let i = 0; i < attributeValues.length; i++) {
        const value = attributeValues[i];
        // для каждого значения атрибута вычисляем энтропию подмножества
        const subset = data.filter(item => item[attribute] === value);
        const subsetEntropy = calculateEntropy(subset, targetAttribute);
        remainder += (subset.length / data.length) * subsetEntropy; // добавляем взвешенную энтропию
    }

    return totalEntropy - remainder;
}

// вычисляет энтропия для заданного набора данных
function calculateEntropy(data, targetAttribute) {
    const classCounts = {}; // (cловарь) подсчитываем количество элементов каждого класса
    // идем по объекту и считаем кол-во класса 
    for (let i = 0; i < data.length; i++) {
        const cls = data[i][targetAttribute];
        classCounts[cls] = (classCounts[cls] || 0) + 1;
    }

    let entropy = 0; // начальная энтропия
    const total = data.length; // общее количество элементов

    for (const cls in classCounts) {
        // для каждого класса вычисляем вклад в энтропию
        const p = classCounts[cls] / total;
        entropy -= p * Math.log2(p);
    }

    return entropy;
}

// обрабатывает событие классификации данных
function classifyDataHandler() {
    if (!treeModel) {
        alert('Сначала постройте дерево решений!');
        return;
    }

    let csvData = classifyDataTextarea.value.trim(); // получаем данные для классификации
    if (csvData) {
        try {
            const lines = csvData.split('\n'); // разбиваем данные на строки
            const firstLine = lines[0].split(','); // первая строка заголовки

            if (firstLine.length < headers.length) {
                // если заголовков меньше чем в обучающих данных добавляем их
                // slice cоздаёт новый массив cодержащий элементы из исходного массива + разделяем ,
                const headerLine = headers.slice(0, headers.length - 1).join(',');
                csvData = `${headerLine}\n${csvData}`;
            }

            const parsedData = parseCSV(csvData); // парсим данные
            if (parsedData.data.length > 0) {
                const item = parsedData.data[0]; // берем первый элемент для классификации
                const { result, path } = classifyItemWithPath(item, treeModel); // классифицируем элемент

                lastClassificationPath = path; // сохраняем путь для отображения
                displayClassificationResult(result, path); // отображаем результат
                drawTree(treeModel); // перерисовываем дерево с подсветкой пути
            } 
            else {
                alert('Ошибка: Данные для классификации отсутствуют или неверный формат CSV.');
            }
        } catch (error) {
            alert('Ошибка при обработке данных: ' + error.message);
        }
    } 
    else {
        alert('Пожалуйста, загрузите или введите данные для классификации.');
    }
}

// классифицирует элемент и возвращает результат с путём классификации
function classifyItemWithPath(item, node, path = []) {
    const currentPath = [...path, {
        node: node, // добавляем текущий узел в путь
        value: node.type === 'node' ? item[node.attribute] : null // сохраняем значение атрибута если это узел
    }];

    if (node.type === 'leaf') {
        // если это лист возвращаем результат и путь
        return {
            result: node.value,
            path: currentPath
        };
    }

    const attributeValue = item[node.attribute]; // значение атрибута для текущего узла
    if (node.children[attributeValue]) {
        // если есть дочерний узел для значения рекурсивно классифицируем
        return classifyItemWithPath(item, node.children[attributeValue], currentPath);
    } 
    else {
        // если дочернего узла нет возвращаем null и путь
        return {
            result: null,
            path: currentPath
        };
    }
}

// отображает результат классификации и путь классификации
function displayClassificationResult(result, path) {
    const resultsContainer = document.getElementById('classificationResults');
    let message = `<strong>Результат классификации:</strong> ${result || "не определен"}<br><br>`;
    message += `<strong>Путь классификации:</strong><br>`;

    path.forEach((step, index) => {
        if (step.node.type === 'node') {
            message += `${index + 1}. Атрибут: ${step.node.attribute}, Значение: ${step.value}<br>`;
        } 
        else {
            message += `${index + 1}. Решение: ${step.node.value}<br>`;
        }
    });

    resultsContainer.innerHTML = message;
}

// вычисляет ширину поддерева для корректного отображения
function calculateSubtreeWidth(node, radius) {
    if (node.type === 'leaf') {
        return radius * 2; // Минимальная ширина для листа
    }

    const childrenWidths = Object.values(node.children).map(child => calculateSubtreeWidth(child, radius));
    return Math.max(radius * 2, childrenWidths.reduce((a, b) => a + b, 0)); // Сумма ширин детей
}

// рисует дерево решений на canvas с учётом зума и панорамирования
function drawTree(tree) {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // очищаем canvas
    ctx.save(); // сохраняем текущий контекст
    ctx.translate(canvasOffsetX, canvasOffsetY); // применяем панорамирование
    ctx.scale(zoomLevel, zoomLevel); // применяем масштабирование

    if (tree) {
        const startX = canvas.width / 2 / zoomLevel; 
        const startY = 70 / zoomLevel;
        const nodeRadius = 30; // радиус узлов 
        const levelHeight = 150; // высота между уровнями
        drawNode(tree, startX, startY, nodeRadius, levelHeight);
    }

    ctx.restore();
}

// рисует узел дерева и его потомков
function drawNode(node, x, y, radius, levelHeight) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);

    // Убираем изменение цвета кружков
    ctx.fillStyle = node.type === 'leaf' ? '#a5d6a7' : '#90caf9';
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const fontSize = 12;
    ctx.font = `${fontSize}px Arial`;

    let nodeText = node.type === 'leaf' ?
        `${node.value}\n(${node.count})` :
        `${node.attribute}\n(${node.count})`;

    const lines = nodeText.split('\n');
    lines.forEach((line, i) => {
        ctx.fillText(line, x, y + (i - 0.5) * (fontSize + 2));
    });

    if (node.type === 'node') {
        // keys возвращает массив всех собственных перечисляемых свойств
        const childrenCount = Object.keys(node.children).length;
        const subtreeWidth = calculateSubtreeWidth(node, radius); // ширина поддерева
        let childX = x - subtreeWidth / 2; // начальная позиция для первого ребенка

         //entries возвращает массив всех собственных перечисляемых свойств в виде пар
        for (const [value, child] of Object.entries(node.children)) {
            if (child) {
                const childSubtreeWidth = calculateSubtreeWidth(child, radius); // ширина поддерева ребенка
                const childY = y + levelHeight;

                // Линия к ребенку
                ctx.strokeStyle = lastClassificationPath.some(step => step.node === child) ? '#ff5722' : '#000';
                ctx.lineWidth = lastClassificationPath.some(step => step.node === child) ? 2 : 1;
                ctx.beginPath();
                ctx.moveTo(x, y + radius);
                ctx.lineTo(childX + childSubtreeWidth / 2, childY - radius);
                ctx.stroke();

                // Текст на линии
                ctx.fillStyle = 'white';
                ctx.textAlign = 'center';
                ctx.fillText(value, (x + (childX + childSubtreeWidth / 2)) / 2, (y + childY) / 2);

                // Рекурсивный вызов для ребенка
                drawNode(child, childX + childSubtreeWidth / 2, childY, radius, levelHeight);

                // Смещение для следующего ребенка
                childX += childSubtreeWidth;
            }
        }
    }
}

// зумирование canvas
canvas.addEventListener("wheel", (event) => {
    event.preventDefault(); // предотвращаем стандартное поведение прокрутки
    const delta = -Math.sign(event.deltaY) * 0.1; // определяем направление прокрутки
    const newZoom = zoomLevel + delta;

    // ограничиваем зум в пределах minZoom и maxZoom
    if (newZoom >= minZoom && newZoom <= maxZoom) {
        zoomLevel = newZoom;
        drawTree(treeModel); // перерисовываем дерево с учетом нового масштаба
    }
});

// панорамирование канваса
canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragStartX = e.clientX - canvasOffsetX;
    dragStartY = e.clientY - canvasOffsetY;
    canvas.style.cursor = "grabbing";
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
        canvasOffsetX = e.clientX - dragStartX;
        canvasOffsetY = e.clientY - dragStartY;
        drawTree(treeModel);
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
    canvas.style.cursor = "default";
});

canvas.addEventListener('mouseleave', () => {
    isDragging = false;
    canvas.style.cursor = "default";
});
