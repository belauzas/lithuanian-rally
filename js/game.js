"use strict";

let lastTime = Date.now();
let time = 0;
let dt = 0;

const DOM = {
    car: document.querySelector('.car'),
    road: document.querySelector('.road'),
    roadLines: document.querySelectorAll('.road > .line'),
    speedometer: document.querySelector('.car-info > .speed > .value'),
    wheel: document.querySelector('.wheel'),
    points: document.querySelector('.game-info > .points > .value')
}

const windowSize = {
    width: window.innerWidth
}
const carWidth = 20;    // % of window
const car = {
    width: parseInt(getComputedStyle(DOM.car).width),
    position: {
        current: (100 - carWidth) / 2,
        min: 0,
        max: 100 - carWidth
    },
    linesCount: 3,
    lines: [],
    inLine: 1           // [0..2]
}

const wheel = {
    maxWheelTurn: 120,      // deg of rotation
    turningSpeed: 120,      // deg / sec
    autoSteeringCoef: 0.3,  // deg / sec
    maxTurn: 0.5,           // % or road width
    turnedDegrees: 0        // current turn angle [-maxTurn ... maxTurn]
}

const speed = {
    max: 240,
    frame: {
        min: 50,
        max: 1200,
        time: 0
    },
    current: 0
}
const speedIncrement = (speed.frame.max - speed.frame.min) / speed.max;

const balls = {
    total: 0,
    list: [],
    catchHeight: {
        min: 53,
        max: 55,
        remove: 60
    },
    maxCount: 12,
    speed: 10,          // % per sec at max car speed
    points: 0,
}

const points = {
    total: 0,
    animation: {
        duration: 0.4,    // seconds
        current: 0
    },
    update: false
}

const key = {
    left: false,
    up: false,
    right: false,
    down: false
}

function init() {
   calcLineSizes(); 
}
init();

function step(timestamp) {
    time = Date.now();
    dt = (time - lastTime) / 1000;

    turnStreeringWheel();
    moveCar();
    updateSpeedometer();
    updateRoadLineAnimation();
    updateGasMeter();
    updateBalls();
    updatePoints();

    // current frame rate
    // console.log( Math.floor(1/dt) );
    
    lastTime = time;
    window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);



window.addEventListener('keydown', (e) => {
    switch (e.keyCode) {
        case 38: key.up = true; break;
        case 37: key.left = true; break;
        case 39: key.right = true; break;
        case 40: key.down = true; break;
        default:
            break;
    }
})

window.addEventListener('keyup', (e) => {
    switch (e.keyCode) {
        case 38: key.up = false; break;
        case 37: key.left = false; break;
        case 39: key.right = false; break;
        case 40: key.down = false; break;
        default:
            break;
    }
})

function calcLineSizes() {
    for ( let i=0; i<car.linesCount; i++ ) {
        // const min = 100 / car.linesCount * i + (100 / car.linesCount / 6);
        // const max = 100 / car.linesCount * (i+1) - (100 / car.linesCount / 6);
        const min = 100 / car.linesCount * i;
        const max = 100 / car.linesCount * (i+1);
        car.lines.push([min, max]);
    }
}

function moveCar() {
    if ( wheel.turnedDegrees === 0 ) {
        return;
    }
    
    if ( wheel.turnedDegrees !== 0 ) {
        const turn = car.position.current  + wheel.turnedDegrees * wheel.maxTurn * (speed.current / speed.max) * dt;
        
        if ( turn > car.position.min && turn < car.position.max ) {
            car.position.current = turn;
            DOM.car.style.left = turn + '%';
            updateCarInLineValue();
        }
    }
}

function updateCarInLineValue() {
    car.inLine = null;
    for ( let i=0; i<car.linesCount; i++ ) {
        if ( car.lines[i][0] <= car.position.current && car.lines[i][1] >= car.position.current + carWidth ) {
            car.inLine = i;
            break;
        }
    }
}

function updateSpeedometer() {
    // if ( car.updateSpeed === 0 ) {
    //     return;
    // }

    let newSpeed = speed.current;
    if ( key.up ) newSpeed++;
    if ( key.down ) newSpeed--;
    
    if ( newSpeed >= 0 &&
         newSpeed <= 240 ) {
        speed.current = newSpeed;
        
        let frameTime = 0;
        if ( speed.current !== 0 ) {
            // frameTime = speed.frame.max - speedIncrement * newSpeed;
            // frameTime = (speed.frame.max - speed.frame.min) / newSpeed + speed.frame.min;
            frameTime = ( (speed.frame.max - speed.frame.min) / newSpeed + speed.frame.min + speed.frame.max - speedIncrement * newSpeed ) / 2
        }
        speed.frame.time = frameTime;

        DOM.speedometer.textContent = newSpeed;
    }
    car.updateSpeed = 0;
}

function updateRoadLineAnimation() {
    for ( let i=0; i<4; i++ ) {
        DOM.roadLines[i].style.animationDuration = speed.frame.time + 'ms';
    }
}

function turnStreeringWheel() {
    if ( !key.left && !key.right && wheel.turnedDegrees === 0 ) {
        return;
    }

    let newTurn = wheel.turnedDegrees;
    const turnDelta = wheel.turningSpeed * dt;
    
    if ( !key.left && !key.right ) {
        // rotate steering wheel back to 0 degs if user is not rotating
        if ( newTurn > 0 ) newTurn -= turnDelta * wheel.autoSteeringCoef;
        if ( newTurn < 0 ) newTurn += turnDelta * wheel.autoSteeringCoef;
    } else {
        // rotate steering wheel based on users inpute
        if ( key.left && newTurn - turnDelta > -wheel.maxWheelTurn ) newTurn -= turnDelta;
        if ( key.right && newTurn + turnDelta < wheel.maxWheelTurn ) newTurn += turnDelta;
    }

    // reset to 0 degrees if wheel turn is so small, almost 0
    if ( newTurn < turnDelta * 0.5 && newTurn > -turnDelta * 0.5 ) {
        newTurn = 0;
    }

    if ( wheel.turnedDegrees !== newTurn ) {
        wheel.turnedDegrees = newTurn;   
        DOM.wheel.style.transform = 'rotate('+newTurn+'deg)';
    }
    
}

function updateGasMeter() {

}

function updateBalls() {
    // create new balls if available
    if ( balls.list.length < balls.maxCount ) {
        if ( Math.random() < 0.01 * (speed.current / speed.max) ) {
            balls.list.push({
                id: balls.total,
                track: Math.floor(Math.random() * 3),
                distance: 0
            });

            balls.total++;

            // append new ball to DOM
            const ballData = balls.list[balls.list.length-1];
            const top = 'top: ' + ballData.distance + '%;';
            // const top = 'top: ' + (ballData.id * 5) + '%;';
            const left = 'left: calc(((100% / 3) * (2 * '+ballData.track+' + 1) - 100px) / 2);';
            const ball = '<div class="ball" data-id="'+ballData.id+'" style="'+top+left+'"></div>';
            DOM.road.insertAdjacentHTML('beforeend', ball);
        }
    }

    // remove balls that have passed window
    balls.list = balls.list.filter(ball => {
        if ( ball.distance > balls.catchHeight.remove ) {
            DOM.road.querySelector('.ball[data-id="'+ball.id+'"]').remove();
        }
        return ball.distance <= balls.catchHeight.remove;
    });

    // move balls down
    for ( let i=0; i<balls.list.length; i++ ) {
        const ball = balls.list[i];
        const newPosition = ball.distance + (speed.current / speed.max) * dt * balls.speed;
        balls.list[i].distance = newPosition;
        DOM.road.querySelector('.ball[data-id="'+ball.id+'"]').style.top = newPosition + '%';
    }
    
    // check for any hits with car and remove
    for ( let i=0; i<balls.list.length; i++ ) {
        const ball = balls.list[i];
        if ( ball.distance < balls.catchHeight.min ||
            ball.distance > balls.catchHeight.max ) {
            continue;
        }
        
        if ( ball.track !== car.inLine ) {
            continue;
        }
        points.total++;
        points.update = true;
        balls.list = balls.list.filter(b => b.id !== ball.id );
        DOM.road.querySelector('.ball[data-id="'+ball.id+'"]').remove();
    }
}

function updatePoints() {
    if ( points.update ) {
        DOM.points.textContent = points.total;
        points.update = false;
        points.animation.current = 0;
    }
    
    points.animation.current += dt;

    if ( points.animation.current < points.animation.duration ) {
        const scale = 0.7 + 1.3 * (points.animation.current / points.animation.duration);
        DOM.points.style.transform = 'scale('+ scale +')';
    } else {
        DOM.points.style.transform = 'scale(1)';
    }
}
