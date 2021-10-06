'use strict'
const MINE = '💣';
const MINE_IMG = '<img class="mine" src="img/mine.png">';
const FLAG = '🇳🇵';
const EMPTY = ' ';
const NORMAL = '😃';
const OISH = '🤯';
const WIN = '😎';
const HINT = '<img src="img/hint.png">';
const HINT_CLICKED = '<img src="img/hintafter.png">';

var gBoard;
var gGame;
var gInterval;
var gLevel;
var gVictory;
var gHintMode;
var gCurrHint;
var gSafeClicks = 3;
var gManuallyMode;
var gMinesManuallyPlaced=0


function init() {
    gGame = {
        isOn: true,
        livesCount: 3,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    setLevel(4);
}

function buildBoard(size) {
    var board = []
    for (var i = 0; i < size; i++) {
        board[i] = []
        for (var j = 0; j < size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }
    return board;
}

function renderBoard(board) {
    var strHTML = `<table border="1"><tbody>
    <button onclick="setLevel(${gLevel.SIZE})"class="mood">${NORMAL}</button>`;

    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j];
            var className = (cell.isShown) ? 'shown' : ' ';
            var tdId = i + '-' + j;
            strHTML += `<td class="cell ${className}" id= "${tdId}"
            oncontextmenu=cellMarked(this)
            onclick="cellClicked(this, ${i}, ${j})"></td>`;
        }
        strHTML += '</tr>';
    }
    strHTML += '</tbody></table>';

    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}


function cellClicked(elCell, i, j) {
    if(gManuallyMode) {
        if(gGame.shownCount > 0){
            gManuallyMode=false;
            return;
        } 
        if(gBoard[i][j].isMine) return;
        
        gMinesManuallyPlaced++;
        if(gMinesManuallyPlaced> gLevel.MINES) {
            gManuallyMode=false;
        }else {
            elCell.innerHTML = '😉';
            gBoard[i][j].isMine = true;
            setTimeout(function(){elCell.innerHTML = ''},500);
            return;
        }
    }

    if (gHintMode) {
        gCurrHint.classList.add('hidden');
        revealCellsHintMode(elCell, i, j);
        setTimeout(function () {
            gHintMode = false;
            revealCellsHintMode(elCell, i, j)
        }, 1000);

    } else {
        if (gBoard[i][j].isMarked) return;
        else if (gBoard[i][j].isShown) return;
        else if (!gGame.isOn) return;

        else if (gBoard[i][j].isMine) {
            gBoard[i][j].isShown = true;
            gGame.shownCount++;
            mineClicked(elCell);

            if (gLevel.SIZE === 4 && gGame.livesCount === 1) isVictory(false);
            else if (!gGame.livesCount) isVictory(false);

        } else {
            gBoard[i][j].isShown = true;
            gGame.shownCount++;
            
            if (gGame.shownCount === 1 && !gMinesManuallyPlaced) {
                addMine(gLevel.MINES);
                gInterval = setInterval(incrementSeconds, 1000);
            }
            //MODEL
            var mineCountAround = setMinesNegsCount(gBoard, i, j);
            gBoard[i][j].minesAroundCount = mineCountAround;
            //DOM
            if (!mineCountAround) {
                renderCell(elCell, EMPTY);
                expandShown(i, j);

            } else {
                renderCell(elCell, mineCountAround);
            }  

            if (gGame.shownCount >= (gLevel.SIZE ** 2) - gLevel.MINES) checkVictory();
        }
    }
}


function cellMarked(elCell) {
    if (!gGame.isOn) return;
    if (elCell.classList.contains('shown')) return;

    var cellCoord = getCellCoord(elCell.id);

    if (gBoard[cellCoord.i][cellCoord.j].isMarked) {
        elCell.innerText = '';
        gBoard[cellCoord.i][cellCoord.j].isMarked = false;
        gGame.markedCount--;

    } else {
        elCell.innerText = FLAG;
        gBoard[cellCoord.i][cellCoord.j].isMarked = true;
        gGame.markedCount++;
        checkVictory();
    }
}


function setMinesNegsCount(board, rowIdx, colIdx) {
    var minesCount = 0;
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > board.length-1) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > board[0].length-1) continue;
            if (i === rowIdx && j === colIdx) continue;
            var cell = board[i][j];
            if (cell.isMine) minesCount++;
        }
    }
    return minesCount;
}


function checkVictory() {
    if (gGame.livesCount < 1) return;
    var shownMineCount = 0;
    var markedMineCount = 0;
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j];
            if (cell.isShown && cell.isMine) {
                shownMineCount++;
                if (shownMineCount >= 3) return;
            }
            else if (!cell.isShown && cell.isMine && cell.isMarked) {
                markedMineCount++;
            }
        }
    }
    if (!markedMineCount) return;

    if (markedMineCount === gLevel.MINES - shownMineCount &&
        gGame.shownCount === Math.pow(gLevel.SIZE, 2) - markedMineCount) {
        isVictory(true);
    }
}


function isVictory(isVictory) {
    if (isVictory) {
        gVictory = true;
        gGame.isOn = false;
        changeMood();
        playSound('victory');
        showModal();
        resetTimer();
    }
    else if (!isVictory) {
        gVictory = false;
        gGame.isOn = false;
        playSound('gameOver');
        showModal();
        revealMines();
        resetTimer();
    }
}

function setLevel(size) {
    if (size === 4) {
        gLevel = { SIZE: 4, MINES: 2 };
    } else if (size === 8) {
        gLevel = { SIZE: 8, MINES: 12, };
    } else if (size === 12) {
        gLevel = { SIZE: 12, MINES: 30, };
    }
    restartGame();
}


function restartGame() {
    lifeBack();
    unHideHints();
    gSafeClicks = 3;
    editSafeClicks(gSafeClicks);
    resetTimer();
    closeModal();
    gManuallyMode= false;
    gMinesManuallyPlaced=0  
    gVictory = false
    gGame = {
        isOn: true, livesCount: 3, shownCount: 0,
        markedCount: 0, secsPassed: 0
    }
    gBoard = buildBoard(gLevel.SIZE);
    renderBoard(gBoard);
}


function expandShown(rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            var cell = gBoard[i][j];
            var elCell = document.getElementById(`${i}-${j}`);
            var countMinesAround = setMinesNegsCount(gBoard, i, j);

            if (j < 0 || j > gBoard[0].length - 1) continue;
            if (i === rowIdx && j === colIdx) continue;
            if (cell.isMine) continue;
            if (cell.isShown) continue;
            if (cell.isMarked) continue;

            cell.isShown = true;
            gGame.shownCount++;
            if (countMinesAround) elCell.innerText= countMinesAround
            else {
                elCell.innerText = EMPTY
                expandShown(i,j)
            }
            elCell.classList.add('shown');
        }
    }
}

function revealCellsHintMode(elCell, rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > gBoard.length-1) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            var cell = gBoard[i][j];
            var elCell = document.getElementById(`${i}-${j}`)
            var countMinesAround = setMinesNegsCount(gBoard, i, j);

            if (j < 0 || j > gBoard[0].length-1) continue;
            if (cell.isShown) continue;
            if (cell.isMarked) continue;

            if (gHintMode) {
                if(cell.isMine) elCell.innerHTML = MINE_IMG;
                else if (countMinesAround) elCell.innerText = countMinesAround;
                else if(!countMinesAround) elCell.innerText = EMPTY;
                elCell.classList.add('shown');

            } else if (!gHintMode) {
                elCell.innerText = ' ';
                elCell.classList.remove('shown');
            }
        }
    }
}


function addMine(num) {
    var emptyCells = getEmptyCells(gBoard);
    for (var i = 0; i < num; i++) {
        var randIdx = getRandomInt(0, emptyCells.length);
        var emptyCell = emptyCells[randIdx];
        gBoard[emptyCell.i][emptyCell.j].isMine = true;
        emptyCells.splice(randIdx, 1);
    }
}

function revealMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMine) {
                gBoard[i][j].isShown = true;
                var elCell = document.getElementById(`${i}-${j}`);
                renderCell(elCell, MINE_IMG);
            }
        }
    }
}

function mineClicked(elCell) {
    playSound('mineClicked');
    lifeDown(gGame.livesCount);
    gGame.livesCount--;
    changeMood();
    renderCell(elCell, MINE_IMG);
    elCell.style.background = 'red';
    checkVictory();
}

function hint(elHint) {
    if (!gGame.shownCount) alert('Make a First Move Before Asking For Help!');
    else {
        gCurrHint = elHint;
        gHintMode = true;
        gCurrHint.innerHTML = HINT_CLICKED;
    }
}

function unHideHints() {
    for (var i = 1; i < 4; i++) {
        var elHint = document.querySelector(`.hint${i}`)
        elHint.innerHTML = HINT;
        elHint.classList.remove('hidden');
    }
}


function lifeDown(life) {
    var elLife = document.querySelector(`.life${life}`);
    elLife.classList.add('hidden')
}

function lifeBack() {
    for (var i = 1; i < 4; i++) {
        var eLife = document.querySelector(`.life${i}`);
        eLife.classList.remove('hidden')
    }
}

function changeMood() {
    var elMood = document.querySelector('.mood');
    if (gGame.livesCount < 3 && !gVictory) {
        elMood.innerText = OISH;
    } else if (gVictory) {
        elMood.innerText = WIN;
    }
}


function safeClick() {

    var emptyCells = getEmptyCells(gBoard);

    if (!emptyCells.length) return;
    if (!gSafeClicks) return;

    gSafeClicks--;
    editSafeClicks(gSafeClicks);
    var randIdx = getRandomInt(0, emptyCells.length);
    var emptyCell = emptyCells[randIdx];
    var elCell = document.getElementById(`${emptyCell.i}-${emptyCell.j}`);

    elCell.classList.add('safe');
    setTimeout(function () {
        elCell.classList.remove('safe');
    }, 2000);
    emptyCells.splice(randIdx, 1);

}


function editSafeClicks(gSafeClicks) {
    var elLeft = document.querySelector('.clicksleft');
    elLeft.innerText = ` ${gSafeClicks} `;
}

function incrementSeconds() {
    var elTimer = document.querySelector('.timer span');
    gGame.secsPassed++;
    elTimer.innerText = gGame.secsPassed;
}


function resetTimer() {
    var elTimer = document.querySelector('.timer span');
    gGame.secsPassed = 0;
    clearInterval(gInterval);
    elTimer.innerText = gGame.secsPassed;
}

function showModal() {
    var elModal = document.querySelector('.modal');
    elModal.innerText = (gVictory) ? 'victory!' : 'Game Over';
    elModal.style.display = 'block';
}

function closeModal() {
    var elModal = document.querySelector('.modal');
    elModal.style.display = 'none';
}

function manuallyCreate() {
    gManuallyMode= true;
}