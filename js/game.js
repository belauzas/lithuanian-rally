"use strict";

let lastTime = Date.now();
let time = 0;
let dt = 0;

const carWidth = 20;    // % of window
const car = {
    position: {
        current: (100 - carWidth) / 2,
        min: 0,
        max: 100 - carWidth
    }
}

const wheel = {
    maxWheelTurn: 120,      // deg of rotation
    turningSpeed: 120,      // deg / sec
    autoSteeringCoef: 0.3,  // deg / sec
    maxTurn: 0.5,             // % or road width
    turnedDegrees: 0        // current turn angle [-maxTurn ... maxTurn]
}

const speed = {
    max: 240,
    frame: {
        min: 50,
        max: 1200
    },
    current: 0
}
const speedIncrement = (speed.frame.max - speed.frame.min) / speed.max;

const DOM = {
    car: document.querySelector('.car'),
    roadLines: document.querySelectorAll('.road > .line'),
    speedometer: document.querySelector('.car-info > .speed > .value'),
    wheel: document.querySelector('.wheel')
}

const key = {
    left: false,
    up: false,
    right: false,
    down: false
}


function step(timestamp) {
    time = Date.now();
    dt = (time - lastTime) / 1000;

    turnStreeringWheel();
    moveCar();
    updateSpeedometer();
    updateRoadLineAnimation();
    updateGasMeter();
    moveBalls();
    updatePoints();

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

function moveCar() {
    if ( wheel.turnedDegrees === 0 ) {
        return;
    }
    
    if ( wheel.turnedDegrees !== 0 ) {
        const turn = car.position.current  + wheel.turnedDegrees * wheel.maxTurn * (speed.current / speed.max) * dt;
        
        if ( turn > car.position.min && turn < car.position.max ) {
            car.position.current = turn;
            DOM.car.style.left = turn + '%';
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

        DOM.speedometer.textContent = newSpeed;

        for ( let i=0; i<4; i++ ) {
            DOM.roadLines[i].style.animationDuration = frameTime + 'ms';
        }
    }
    car.updateSpeed = 0;
}

function updateRoadLineAnimation() {

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

function moveBalls() {

}

function updatePoints() {

}
