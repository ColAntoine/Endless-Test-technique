const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let points = [];
let vector = { x: 0, y: 0 };
let mode = 'draw';
let vectorPoints = [];

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (mode === 'draw') {
        points.push({ x, y });
        draw();
    } else if (mode === 'vector') {
        if (vectorPoints.length < 2) {
            vectorPoints.push({ x, y });
        }
        if (vectorPoints.length === 2) {
            vector.x = vectorPoints[1].x - vectorPoints[0].x;
            vector.y = vectorPoints[1].y - vectorPoints[0].y;
            vectorPoints = [];
            mode = 'draw';
            draw();
        }
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 't') {
        mode = 'vector';
        vectorPoints = [];
    }
});

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawPolygon(points, strokeStyle, fillStyle) {
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
    }
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
    
    drawPolygon(points, 'blue', 'rgba(0, 0, 255, 0.3)');
    
    const translatedPoints = getTranslatedPoints(points, vector);
    drawPolygon(translatedPoints, 'green', 'rgba(0, 255, 0, 0.3)');

    const allPoints = points.concat(translatedPoints);
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

draw();
