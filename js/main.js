'use strict' 
const MINE ='💣'
const FLAG = '🇳🇵'
const EMPTY = ' '

var gBoard;
var gGame;
var gInterval;
var gLevel;
var gVictory;


function init() {
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount:0,
        secsPassed:0
    }
    setLevel(4);
}

function buildBoard(size) {
    var board = []
    for (var i=0; i<size; i++) {
        board[i] = []
        for (var j=0; j<size; j++) {
            board[i][j] = { 
                minesAroundCount:0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }
    return board
}

function renderBoard(board) {
    var strHTML ='<table border="1"><tbody>';

    for (var i = 0; i < board.length; i++) {
      strHTML += '<tr>';
      for (var j = 0; j < board[0].length; j++) {
        var cell = board[i][j]
        var className = (cell.isShown)? 'shown': ' '
        var id =i + '-' + j;
        strHTML += `<td class="cell ${className}" id= "${id}"
        oncontextmenu=cellMarked(this)
        onclick="cellClicked(this, ${i}, ${j})"></td>`
      }
      strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';

    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}


function setMinesNegsCount(board, rowIdx, colIdx) {
    var mineCount = 0;
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > board.length - 1) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > board[0].length - 1) continue;
            if (i === rowIdx && j === colIdx) continue;
            var cell = board[i][j];
            if (cell.isMine) mineCount++;
        }
    }
    return mineCount;
}


function cellClicked(elCell, i, j) {
    if (gBoard[i][j].isMarked) return;
    else if (gBoard[i][j].isShown) return;
    else if(!gGame.isOn) return;

    else if (gBoard[i][j].isMine) {
        gBoard[i][j].isShown = true;
        elCell.innerText = MINE;
        elCell.classList.add('shown');
        gameOver();

    }else {
        gBoard[i][j].isShown = true
        gGame.shownCount++;

        if (gGame.shownCount === 1) {
            gInterval = setInterval(incrementSeconds, 1000);
        }

        //MODEL
        var mineCountAround = setMinesNegsCount(gBoard,i,j)
        gBoard[i][j].minesAroundCount = mineCountAround;

        //DOM
        if (!mineCountAround) {
            elCell.innerText = EMPTY;
            elCell.classList.add('shown');
            showCellsAround(i, j);

        } else {
            elCell.innerText = mineCountAround;
            elCell.classList.add('shown');

        }
        if (gGame.shownCount === (gLevel.SIZE**2)- gLevel.MINES) checkVictory();
    
    }
}


function showCellsAround(rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > gBoard[0].length - 1) continue;
            if (i === rowIdx && j === colIdx) continue;

            var cell = gBoard[i][j];
            if (cell.isMine) continue;
            if (cell.isShown) continue;
            if(cell.isMarked) continue;

            cell.isShown = true;
            gGame.shownCount++;
            var elCell = document.getElementById(`${i}-${j}`)
            var countMinesAround = setMinesNegsCount(gBoard,i,j);
            elCell.innerText = (countMinesAround)? countMinesAround : EMPTY;
            elCell.classList.add('shown');
           
        }
    }
}



function cellMarked(elCell) {

    if (!gGame.isOn) return;

    var cellCoord = getCellCoord(elCell.id)
    if (gBoard[cellCoord.i][cellCoord.j].isMarked) {
        elCell.innerText = '';
        gBoard[cellCoord.i][cellCoord.j].isMarked = false;
        gGame.markedCount--;

    } else {
        elCell.innerText = FLAG;
        gBoard[cellCoord.i][cellCoord.j].isMarked = true;
        gGame.markedCount ++;
        if (gGame.markedCount === gLevel.MINES) {
            checkVictory();

        }
    }
}   


function addMine(num) {
    for (var i=0; i<num; i++) {
        var randRowIdx = getRandomInt(0,gBoard.length);
        var randColIdx = getRandomInt(0,gBoard[0].length);
        if (gBoard[randRowIdx][randColIdx].isMine) {
            i--
        } else {
            gBoard[randRowIdx][randColIdx].isMine= true;
        }
    }
}



function checkVictory() {
    if (gGame.markedCount === gLevel.MINES && gGame.shownCount === (gLevel.SIZE**2)- gLevel.MINES) {
        gVictory = true;
        gGame.isOn= false;

        showModal();
        resetTimer();

    }
}


function gameOver() {
    gVictory = false;
    gGame.isOn= false;
    showModal();
    revealMines();
    resetTimer();

 

}


function setLevel(size) {
    if (size === 4) {
        gLevel= {
            SIZE: 4,
            MINES: 2,
        }
    } else if (size === 8) {
        gLevel= {
            SIZE: 8,
            MINES: 12,
        }
    }else if (size === 12) {
        gLevel= {
            SIZE: 12,
            MINES: 30,
        }
    }

    restartGame();
}


function restartGame() {
    resetTimer();
    closeModal();

    gVictory = false
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount:0,
        secsPassed:0
    }
    gBoard = buildBoard(gLevel.SIZE);
    addMine(gLevel.MINES);
    renderBoard(gBoard);

}


function revealMines() {
    for (var i=0; i<gBoard.length; i++) {
        for (var j=0; j< gBoard[0].length; j++) {
            if(gBoard[i][j].isMine) {
                gBoard[i][j].isShown = true;
                var elCell = document.getElementById(`${i}-${j}`)
                elCell.innerText = MINE;
                elCell.classList.add('shown');
            }
        }
    }
}



function incrementSeconds() {
    var elTimer = document.querySelector('.timer span');
    gGame.secsPassed++;
    elTimer.innerText = gGame.secsPassed;
}


function resetTimer(){
    var elTimer = document.querySelector('.timer span');
    gGame.secsPassed = 0;
    clearInterval(gInterval);
    elTimer.innerText = gGame.secsPassed;
}


function showModal() {
    var elModal = document.querySelector('.modal')
    elModal.innerText = (gVictory)? 'victory!' : 'Game Over:('
    elModal.style.display = 'block';
}

function closeModal() {
    var elModal = document.querySelector('.modal')
    elModal.style.display = 'none';
}