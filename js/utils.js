'use strict'

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}


function getCellCoord(strCellId) {
    var coord = {};
    var parts = strCellId.split('-'); 
    coord.i = +parts[0]; 
    coord.j = +parts[1]; 
    return coord; 
}

function renderCell(elCell, value) {
    if (value === MINE_IMG) {
        elCell.innerHTML = MINE_IMG;
    } else {
        elCell.innerText = value;
    }
    elCell.classList.add('shown');
}


function getEmptyCells(board) {
    var emptyCells = [];
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (!board[i][j].isMine && !gBoard[i][j].isShown && !gBoard[i][j].isMarked) {
                emptyCells.push({ i: i, j: j });
            }
        }
    }
    return emptyCells;
}


function playSound(event) {
    var sound;
    if (event === 'mineClicked') {
        sound = new Audio("sounds/lifeDown.mp3");

    } else if (event === 'gameOver') {
        sound = new Audio("sounds/gameOver.wav");

    } else if (event === 'victory') {
        sound = new Audio("sounds/victory.mp3");
    }
    sound.play();
}

