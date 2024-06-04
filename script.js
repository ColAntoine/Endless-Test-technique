const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let points = [];
let vector = { x: 0, y: 0 };
let mode = 'draw';
let isDragging = false;
let startPoint = null;
let isPolygonClosed = false;
let originalPoints = [];
let clonedPoints = [];

canvas.addEventListener('click', (e) => {
    if (isPolygonClosed) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (mode === 'draw') {
        if (points.length > 0 && isClose(points[0], { x, y })) {
            points.push(points[0]);
            isPolygonClosed = true;
            originalPoints = points.slice();
            clonedPoints = clonePoints(points);
            draw();
        } else {
            points.push({ x, y });
            draw();
            drawPoints(points);
        }
    }
});

canvas.addEventListener('mousedown', (e) => {
    if (!isPolygonClosed) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - vector.x;
    const y = e.clientY - rect.top - vector.y;

    if (isPointInsidePolygon({ x, y }, clonedPoints)) {
        isDragging = true;
        startPoint = { x: x + vector.x, y: y + vector.y };
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const dx = x - startPoint.x;
        const dy = y - startPoint.y;
        
        vector.x += dx;
        vector.y += dy;
        
        startPoint = { x, y };
        draw();
    }
});

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawPolygon(points, strokeStyle, fillStyle, pointStyle) {
    if (points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.closePath();
        ctx.strokeStyle = strokeStyle;
        ctx.stroke();
        ctx.fillStyle = fillStyle;
        ctx.fill();
        ctx.fillStyle = pointStyle;
        for (let i = 0; i < points.length; i++) {
            ctx.beginPath();
            ctx.arc(points[i].x, points[i].y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function drawPoints(points) {
    clearCanvas();
    drawPolygon(originalPoints, 'blue', 'rgba(0, 0, 255, 0.3)', 'blue');
    drawPolygon(points, 'blue', 'rgba(0, 0, 255, 0.3)', 'blue');
}

function getTranslatedPoints(points, vector) {
    return points.map(point => ({
        x: point.x + vector.x,
        y: point.y + vector.y
    }));
}

function drawConvex(points, strokeStyle) {
    const hull = calculateConvex(points);
    if (hull.length > 0) {
        ctx.beginPath();
        ctx.moveTo(hull[0].x, hull[0].y);
        for (let i = 1; i < hull.length; i++) {
            ctx.lineTo(hull[i].x, hull[i].y);
        }
        ctx.closePath();
        ctx.strokeStyle = strokeStyle;
        ctx.stroke();
    }
}

function draw() {
    clearCanvas();

    drawPolygon(originalPoints, 'blue', 'rgba(0, 0, 255, 0.3)', 'blue');

    const translatedClonedPoints = getTranslatedPoints(clonedPoints, vector);
    drawPolygon(translatedClonedPoints, 'green', 'rgba(0, 255, 0, 0.3)', 'green');

    const allPoints = originalPoints.concat(translatedClonedPoints);
    drawConvex(allPoints, 'red');
}

function cross(o, a, b) {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

function calculateConvex(points) {
    points.sort((a, b) => a.x === b.x ? a.y - b.y : a.x - b.x);

    const lower = [];
    for (let i = 0; i < points.length; i++) {
        while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], points[i]) <= 0) {
            lower.pop();
        }
        lower.push(points[i]);
    }

    const upper = [];
    for (let i = points.length - 1; i >= 0; i--) {
        while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], points[i]) <= 0) {
            upper.pop();
        }
        upper.push(points[i]);
    }
    upper.pop();
    lower.pop();
    return lower.concat(upper);
}

function isClose(point1, point2) {
    const distance = Math.hypot(point1.x - point2.x, point1.y - point2.y);
    return distance < 10;
}

function isPointInsidePolygon(point, polygon) {
    let isInside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x, yi = polygon[i].y;
        const xj = polygon[j].x, yj = polygon[j].y;

        const intersect = ((yi > point.y) !== (yj > point.y)) &&
            (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
        if (intersect) isInside = !isInside;
    }
    return isInside;
}

function clonePoints(points) {
    return points.map(point => ({ x: point.x, y: point.y }));
}

draw();
