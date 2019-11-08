"use strict";

let start = null;
let frame = 0;
let turnSize = 1;       // %

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
            break;

        case 37:        // left
            data.turn = -turnSize;
            break;
            
        case 39:        // right
            data.turn = turnSize;
            break;

        case 40:        // bottom
            break;

        default:
            break;
    }
})

function makeTurn() {
    console.log(data.position, data.turn);
    if ( data.turn !== 0 ) {
        const turn = data.position + data.turn;
        if ( turn > 20 && turn < 60 ) {
            data.position = turn;
            car.style.left = data.position + '%';
        }
        data.turn = 0;
    }
    
}