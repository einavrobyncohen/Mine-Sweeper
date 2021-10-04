'use strict'
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}




function getCellCoord(strCellId) {
    var coord = {};
    var parts = strCellId.split('-'); // ['2','7']
    coord.i = +parts[0] // 2
    coord.j = +parts[1]; // 7
    return coord; // {i:2 , j:7}
}


function renderCell(location, value) {
    // Select the elCell and set the value
    var elCell = document.querySelector(`.cell${location.i}-${location.j}`);
    elCell.innerHTML = value;
}