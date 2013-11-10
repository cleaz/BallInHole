window.onload = init;

var winW, winH, ball, hole;
var ballRadius = 25, holeRadius = 30, time = 0, ballIsInHole = 0;
var mouseDownInsideball, touchDownInsideball, movementTimer;
var lastMouse, lastOrientation, lastTouch;
var interval1, position;
var objects;
var message = "";
var running = false; started = false;

// Initialisation on opening of the window
function init() {
    lastOrientation = {};
    window.addEventListener('resize', doLayout, false);
    document.body.addEventListener('mousemove', onMouseMove, false);
    document.body.addEventListener('mousedown', onMouseDown, false);
    document.body.addEventListener('mouseup', onMouseUp, false);
    document.body.addEventListener('touchmove', onTouchMove, false);
    document.body.addEventListener('touchstart', onTouchDown, false);
    document.body.addEventListener('touchend', onTouchUp, false);
    window.addEventListener('deviceorientation', deviceOrientationTest, false);
    lastMouse = {x: 0, y: 0};
    lastTouch = {x: 0, y: 0};
    mouseDownInsideball = false;
    touchDownInsideball = false;
    doLayout(document);
}

function setValue() {
    document.getElementById("tijd").innerHTML = time;
}

function start(){
	started = true;
}

function startGame() {
	time = 0; 
	running = true;
    interval1 = setInterval(
		function chrono() {
			if(running){
				time++;
				setValue();
			}
		}
	, 1000);
}

function doLayout(event) {
    winW = window.innerWidth;
    winH = window.innerHeight;
    var surface = document.getElementById('surface');
    surface.width = winW; surface.height = winH;
    hole = {radius: holeRadius,
			x: generateRandomPosition(winW),
			y: generateRandomPosition(winH),
			color: 'rgba(255, 255, 255, 255)',
			color2: 'rgba(255, 125, 125, 125)'};
	ball = {radius: ballRadius,
			x: generateRandomPosition(winW),
			y: generateRandomPosition(winH),
			color:'rgba(255, 0, 0, 255)',
			color2:'rgba(255, 255, 255, 255)'};
	checkPositionOnField(ball);
	checkPositionOnField(hole);
	objects=new Array(hole,ball);
    renderObjects();
	if(started == true){
		startGame();
	}
}

function checkPositionOnField(object){
	if(object.x <= 15){
		object.x += 15;
	}else if (object.x >= winW - 15){
		object.x -= 15;
	}else if (object.y <= 15){
		object.y += 15;
	}else if (object.y >= winH - 15){
		object.y -= 15;
	}
}

function renderObjects() {
    var surface = document.getElementById('surface');
    var context = surface.getContext('2d');
    context.clearRect(0, 0, surface.width, surface.height);
	for (var i=0;i<objects.length;i++)	{ 
		renderObject(context, objects[i]);
	}
}

function renderObject(context, object){
	context.beginPath();
    context.arc(object.x, object.y, object.radius, 0, 2 * Math.PI, false);
    context.fillStyle = object.color;
    context.fill();
    context.strokeStyle = object.color2;
    context.stroke();
}

function moveBall(xDelta, yDelta) {
	if(running){
		ball.x += xDelta;
		ball.y += yDelta;
		renderObjects();
		checkCollision();
		stayInWindow();
	}
}

function checkCollision(){
	if ((ball.x < (hole.x + (holeRadius / 2))) && (ball.x > (hole.x - (holeRadius / 2)))
            && (ball.y < (hole.y + (holeRadius / 2))) && (ball.y > (hole.y - (holeRadius / 2)))) {
		ballIsInHole = 1;
        stop();
    }
}

function stayInWindow(){
	if (ball.x + ballRadius >= winW) {ball.x = winW - ballRadius;}
    if (ball.x - ballRadius <= 0) { ball.x = ballRadius;}
    if (ball.y - ballRadius <= 0) { ball.y = ballRadius;}
    if (ball.y + ballRadius >= winH) { ball.y = winH - ballRadius; }
}

function stop() {
	running = false;
    if (ballIsInHole == 1) {
        var canvas = document.getElementById("surface");
        var context = canvas.getContext("2d");
        message = "Congratulations! You have finished the game in " + time + " seconds.";
        alert(message);
    }
	else{
		var canvas = document.getElementById("surface");
        var context = canvas.getContext("2d");
        message = "You have stopped the game after " + time + " seconds.";
		alert(message);
	}
	location.reload(true);
	ballIsInHole = 0;
	time = 0;
	started = false;
}

function pauze(){
	if(!running){
		running = true;
	} else{
		running = false;
	}
}
	
function generateRandomPosition(position) {
    return Math.round((Math.random() * (position - 60)) + 30);
}

function repositionHole(){
	if (hole.x + holeRadius >= winW - 15 || hole.x - holeRadius <= 15 || hole.y - holeRadius <= 15 || hole.y + holeRadius >= winH - 15){
		hole.x = generateRandomPosition(winW);
		hole.y = generateRandomPosition(winH);
	}
}

// Does the gyroscope or accelerometer actually work?
function deviceOrientationTest(event) {
    window.removeEventListener('deviceorientation', deviceOrientationTest);
    if (event.beta !== null && event.gamma !== null) {
        window.addEventListener('deviceorientation', onDeviceOrientationChange, false);
        movementTimer = setInterval(onRenderUpdate, 10);
    }
}

function onTouchUp(event) {touchDownInsideball = false;}

function onDeviceOrientationChange(event) {
    lastOrientation.gamma = event.gamma;
    lastOrientation.beta = event.beta;
}

function onRenderUpdate(event) {
    var xDelta, yDelta;
    switch (window.orientation) {
        case 0: // portrait - normal
            xDelta = lastOrientation.gamma;
            yDelta = lastOrientation.beta;
            break;
        case 180: // portrait - upside down
            xDelta = lastOrientation.gamma * -1;
            yDelta = lastOrientation.beta * -1;
            break;
        case 90: // landscape - bottom right
            xDelta = lastOrientation.beta;
            yDelta = lastOrientation.gamma * -1;
            break;
        case -90: // landscape - bottom left
            xDelta = lastOrientation.beta * -1;
            yDelta = lastOrientation.gamma;
            break;
        default:
            xDelta = lastOrientation.gamma;
            yDelta = lastOrientation.beta;
    }
    moveBall(xDelta, yDelta);
}

function onMouseMove(event) {
    if (mouseDownInsideball) {
        var xDelta, yDelta;
        xDelta = event.clientX - lastMouse.x;
        yDelta = event.clientY - lastMouse.y;
        moveBall(xDelta, yDelta);
        lastMouse.x = event.clientX;
        lastMouse.y = event.clientY;
    }
}

function onMouseDown(event) {
    var x = event.clientX, y = event.clientY;
    if (x > ball.x - ball.radius &&
            x < ball.x + ball.radius &&
            y > ball.y - ball.radius &&
            y < ball.y + ball.radius) {
        mouseDownInsideball = true;
        lastMouse.x = x;
        lastMouse.y = y;
    } else { mouseDownInsideball = false;}
}

function onMouseUp(event) { mouseDownInsideball = false;}

function onTouchMove(event) {
    event.preventDefault();
    if (touchDownInsideball) {
        var touches = event.changedTouches;
        var xav = 0, yav = 0;
        for (var i = 0; i < touches.length; i++) {
            var x = touches[i].pageX, y = touches[i].pageY;
            xav += x;
            yav += y;
        }
        xav /= touches.length;
        yav /= touches.length;
        var xDelta, yDelta;
        xDelta = xav - lastTouch.x;
        yDelta = yav - lastTouch.y;
        moveBall(xDelta, yDelta);
        lastTouch.x = xav;
        lastTouch.y = yav;
    }
}

function onTouchDown(event) {
    event.preventDefault();
    touchDownInsideball = false;
    var touches = event.changedTouches;
    for (var i = 0; i < touches.length && !touchDownInsideball; i++) {
        var x = touches[i].pageX;
        var y = touches[i].pageY;
        if (x > ball.x - ball.radius &&
                x < ball.x + ball.radius &&
                y > ball.y - ball.radius &&
                y < ball.y + ball.radius) {
            touchDownInsideball = true;
            lastTouch.x = x;
            lastTouch.y = y;
        }
    }
}
