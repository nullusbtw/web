/* 
    document.addEventListener('DOMContentLoaded', function() {}) - Подгружает элементы страницы после загрузки сайта; задаёт изначальные значения и
загружает модель; обрабатывает нажатие на кнопоки и рисование на canvas.

    function initCanvas() {} - задаёт значение линии, обнуляет canvas и таблицу.

    async function loadModel() {} - загружает и запоминает веса модели из файла.

    async function getPredict() {} - блокирует кнопки; обращается к подключаемой функции predict; обновляет интерфейс;
разблокировывает кнопки.

    function displayProbabilities(probabilities) {} - очищает таблицу; ищет наилучший вариант; задаёт новые строки для каждой цифры.
*/


let canvas, ctx, predictButton, clearButton, stateText, tableBody;
let modelWeights;
let drawing = false;
let mouseX = 0, mouseY = 0;

class NeuralNetwork {
    constructor(weights1, b1, weights2, b2) {
        this.weights1 = weights1;
        this.b1 = b1;
        this.weights2 = weights2;
        this.b2 = b2;
    }

    forward(x) {
        const step1 = matrixVectorMultiply(this.weights1, x, this.b1);
        const activation = step1.map(value => Math.tanh(value));
        const step2 = matrixVectorMultiply(this.weights2, activation, this.b2);
        return this.softmax(step2);
    }

    softmax(x) {
        let maxValue = Math.max(...x); // избегает слишком больших значений от exp
        let exp = x.map(value => Math.exp(value - maxValue)); // проводит экспоненциальное преобразование
        let sum = 0;
        for (let i = 0; i < exp.length; i++) {
            sum += exp[i];
        }
        return exp.map(value => value / sum); // нормализация
    }
}

function matrixVectorMultiply(matrix, vector, bias) {
    let result = [];
    let biasIndex = 0;
    for (let columnIndex in matrix[0]) {
        let sum = bias[biasIndex];
        let rowIndex = 0;
        for (let row of matrix) {
            sum += row[columnIndex] * vector[rowIndex];
            rowIndex++;
        }
        result.push(sum);
        biasIndex++;
    }
    return result;
}

function prepareImage(canvas) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 50;
    tempCanvas.height = 50;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.fillStyle = 'black';
    tempCtx.fillRect(0, 0, 50, 50);

    tempCtx.drawImage(canvas, 0, 0, 50, 50);
    const imageData = tempCtx.getImageData(0, 0, 50, 50);
    const pixels = imageData.data;
    let input = new Float32Array(2500);

    for (let i = 0; i < 2500; i++) {
        let brightness = 0.299 * pixels[i * 4] + 0.587 * pixels[i * 4 + 1] + 0.114 * pixels[i * 4 + 2]; // формула стандарта ITU BT.601 для преобразование RGB в Luma
        input[i] = brightness / 255; // масштабирование
    }
    return input;
}

export function predict(modelWeights, canvas) {
    let input = prepareImage(canvas);

    const model = new NeuralNetwork(modelWeights.weights1, modelWeights.b1, modelWeights.weights2, modelWeights.b2);
    let probs = model.forward(input);
    return probs;
}

function canvReset() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 15;
    ctx.strokeStyle = "white";
}

async function loadModel() {
    const data = await fetch("model_weights.json");
    const loadedWeights = await data.json();
    modelWeights = {
        weights1: loadedWeights.weights1,
        b1: loadedWeights.b1,
        weights2: loadedWeights.weights2,
        b2: loadedWeights.b2
    };
    
    return modelWeights;
}

async function getPredict() {
    predictButton.disabled = true;
    clearButton.disabled = true;
    try {
        let probs = await predict(modelWeights, canvas);
        let digit = probs.indexOf(Math.max(...probs))
        stateText.textContent = `Результат: ${digit}`;
    } catch (error) {
        stateText.textContent = "Ошибка распознавания";
        console.error("Ошибка распознавания:", error);
    }
    predictButton.disabled = false;
    clearButton.disabled = false;
}

document.addEventListener('DOMContentLoaded', function () {
    canvas = document.getElementById("drawCanvas");
    ctx = canvas.getContext("2d");
    predictButton = document.getElementById("predict-button");
    clearButton = document.getElementById("clear-button");
    stateText = document.getElementById("result");


    canvas.addEventListener("mousedown", function (e) {
        drawing = true;
        mouseX = e.offsetX;
        mouseY = e.offsetY;
    });

    canvas.addEventListener("mousemove", function (e) {
        if (drawing) {
            ctx.beginPath();
            ctx.moveTo(mouseX, mouseY);
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
            mouseX = e.offsetX;
            mouseY = e.offsetY;
        }
    });

    canvas.addEventListener("mouseup", function () {
        drawing = false;
    });

    canvas.addEventListener("mouseout", function () {
        drawing = false;
    });

    predictButton.addEventListener("click", getPredict);

    clearButton.addEventListener("click", function () {
        canvReset();
        stateText.textContent = "Результат: ";
    });

    canvReset();
    loadModel();
}); 