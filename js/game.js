"use strict";

let start = null;
let frame = 0;
let turnSize = 1;       // %
const minFrameTime = 50;
const maxFrameTime = 1200;
const maxSpeed = 240;
const speedIncrement = (maxFrameTime - minFrameTime) / maxSpeed;
let speed = 0;

const roadLines = document.querySelectorAll('.road > .line');
const speedometer = document.querySelector('.car-info > .speed > .value');

const car = document.querySelector('.car');

const data = {
    position: 40,
    turn: 0
}

function step(timestamp) {
    makeTurn();


    window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);



window.addEventListener('keydown', (e) => {
    switch (e.keyCode) {
        case 38:        // top
            updateSpeed(1);
            break;

        case 37:        // left
            data.turn = -turnSize;
            break;
            
        case 39:        // right
            data.turn = turnSize;
            break;

        case 40:        // bottom
            updateSpeed(-1);
            break;

        default:
            break;
    }
})

function makeTurn() {
    if ( data.turn !== 0 ) {
        const turn = data.position + data.turn;
        if ( turn > 0 && turn < 80 ) {
            data.position = turn;
            car.style.left = data.position + '%';
        }
        data.turn = 0;
    }   
}

function updateSpeed( increment ) {
    // const minFrameTime = 50;
    // const maxFrameTime = 1200;
    // const frameTimeDiff = maxFrameTime - minFrameTime;
    // const maxSpeed = 240;
    // let speed = 0;

    if ( (increment === -1 || increment === 1) &&
         speed+increment >= 0 &&
         speed+increment <= 240 ) {
        speed += increment;

        let frameTime = 0;
        if ( speed !== 0 ) {
            frameTime = maxFrameTime - speedIncrement * speed;
        }

        speedometer.textContent = speed;
        for ( let i=0; i<4; i++ ) {
            roadLines[i].style.animationDuration = frameTime + 'ms';
        }

        console.log(frameTime);
    }
}