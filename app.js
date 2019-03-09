
let humanType = 'x',
    botType = 'o',
    gameBegun = 0,
    player = ['bot', 'human'],
    change = true,
    nextPlayer = player[1],
    availableCells = [],
    xscore = 0;
    oscore = 0;
    humanCells = [];
    botCells = [];

const xMarkup = `<div class="ex">
                        X
                  </div>`;

const oMarkup = `<div class="ohh">
                  O
                </div>`;

const elements = {

  'cell0': document.querySelector('.cell-0'),
  'cell1': document.querySelector('.cell-1'),
  'cell2': document.querySelector('.cell-2'),
  'cell3': document.querySelector('.cell-3'),
  'cell4': document.querySelector('.cell-4'),
  'cell5': document.querySelector('.cell-5'),
  'cell6': document.querySelector('.cell-6'),
  'cell7': document.querySelector('.cell-7'),
  'cell8': document.querySelector('.cell-8'),
  'btnEx': document.querySelector('.btn--ex'),
  'btnOhh': document.querySelector('.btn--ohh'),
  'grid': document.querySelector('div.grid'),
  'winner': document.querySelector('.winner'),
  'result-h1': document.querySelector('.winner__header'),
  'win-o': document.querySelector('.winner .js--o'),
  'win-x': document.querySelector('.winner .js--x'),
  'xscore': document.querySelector('.xScore'),
  'oscore': document.querySelector('.oScore'),
  'restart': document.querySelector('.btn--restart'),
  'msg': document.querySelector('.header__display--msg')
}

const grid = [
  elements.cell0,
  elements.cell1,
  elements.cell2,
  elements.cell3,
  elements.cell4,
  elements.cell5,
  elements.cell6,
  elements.cell7,
  elements.cell8
]

const winCombos = [
  ['cell-0', 'cell-1', 'cell-2'],
  ['cell-3', 'cell-4', 'cell-5'],
  ['cell-6', 'cell-7', 'cell-8'],
  ['cell-0', 'cell-3', 'cell-6'],
  ['cell-1', 'cell-4', 'cell-7'],
  ['cell-2', 'cell-5', 'cell-8'],
  ['cell-2', 'cell-4', 'cell-6'],
  ['cell-0', 'cell-4', 'cell-8']
]


//? Initially populate available cells array with all cells of grid. We will remove cells from this array as the game moves on and players click on the cells

for (let index = 0; index < 9; index++) {
  availableCells.push(`cell-${index}`);
}


//? Initialize stuff in beginning like playertype and setup grid listeners
function init() {

  //* 1. Setup grid listeners
    setupListeners();


  //* 2. check if player has started game
    elements.grid.addEventListener('click', () => {
      gameBegun = 1;
    });
}

//? Call init
init();


//? Setup all listeners
function setupListeners() {

  //* 1. GRID Listener
    for (const cell of grid) {

      cell.addEventListener('click', (e) => {

        //! Which cell user has clicked on
        cellTarget = e.srcElement.classList[1];

        //!Call player move fn with this cell
         if(availableCells.includes(cellTarget)) {

          playTurn(cellTarget);
        }
      })
    }

  //* 2. Score Card Listeners

    //? Left-score-card button
    elements["btnEx"].addEventListener('click', () => {
      //! if use has not started game already allow him to pick his choice of weapon
      if (gameBegun === 0) {
        pickWeapon("btnEx", 'btnOhh');
      }
    })


    //? Right-score-card button
    elements["btnOhh"].addEventListener('click', () => {
      //! if use has not started game already allow him to pick his choice of weapon
      if (gameBegun === 0) {
        pickWeapon("btnOhh", 'btnEx');
      }
    })


  //* 3. Restart button listener
    elements.restart.addEventListener('click', restartGame);
}


//? Make X's or O's Characters visible on grid as per player type when they make a move
function renderIcon(cell, type) {

  //* 1. Add x or o markup as per player type
    if (type === 'x') {
      document.querySelector(`.${cell}`).insertAdjacentHTML('beforeend', xMarkup);
    } else {
      document.querySelector(`.${cell}`).insertAdjacentHTML('beforeend', oMarkup);
    }

  //* 2. Determine remaining available cells on grid
    availableCells.forEach((value, index) => {
      if (value === cell) {
        availableCells.splice(index, 1);
      }
    });

}


//? DETERMINE PLAYER TYPE
function pickWeapon(type, inverseType) {

  //* 1. Determine player type (Exx or Ohh)
    if (type === 'btnEx') {
      humanType = 'x';
      botType = 'o';
    } else {
      humanType = 'o';
      botType = 'x';
    }

  //* 2. Add btn--active class to this button
    elements[type].classList.add('btn--active');

  //* 3. Remove btn--active class from the other button
    elements[inverseType].classList.remove('btn--active');
}


//? Human makes a move
function playTurn(cell) {

  //* 1. Add X's or O's to grid as per human type
    renderIcon(cell, humanType);
    humanCells.push(cell);

  //* unless there is already a winner call bot to play
    if (checkWinner(humanCells, player[1]) !== 999 ) {

      if(availableCells.length > 0) {

        display(`${botType}'s turn`);

        //* Call bot to make a move next with botTurnSmart
        setTimeout(botTurnSmart, 500);

      }
      else {
        onDraw();
      }

    }
}

//? This is called when we can't determine a forcing move for the bot i.e a move which either gives a win to the bot or prevents the human from winning. In which case a random move is played by bot
  //! THIS IS TO BE CALLED AS A LAST RESORT
  /*
  TODO: MAKE RANDOM CHOOSING - ALSO SMARTER
  */
function botTurnDumb() {
  //* Randomly pick a cell for bot from available cells
    const totalCells = availableCells.length;

    const pickNumber = Math.floor(Math.random() * totalCells);

    const pickCell = availableCells[pickNumber];

  //* 1. Add X's or O's to grid as per bot type ON chosen cell
    botMove(pickCell);
}

 //? 1. Add X's or O's to grid as per bot type ON chosen cell
function botMove(pickCell) {

  if (availableCells.includes(pickCell)) {
    renderIcon(pickCell, botType);

    //* Add this cell to array of cells on which bot has made a move
    botCells.push(pickCell);
  }

  //* check for win
   if (checkWinner(botCells, player[0]) !== 999 ) {

    if(availableCells.length > 0) {

      display(`${humanType}'s turn`);
    }
    else {
      onDraw();
    }
  }
}

//? This is called to make bot play an 'intelligent' move: It either tries for a win in the next move - if available or tries to block opponent's win in next move.
//? If either of above conditions are NA, it calls the botTurn fn to make a random move from amongst the available cells

function botTurnSmart () {

    //? Steps to take
      //* 1. take each element from available cells arr, push it to botCells array clone.
      //* 2. compare this new arr with each wincombo - use checkWinner function
          //! if winning - play the move with this cell
          //! if not winning with any combo, break out of this loop and try with next element in aviailble cells
      //* 3. Next try above with humanCells combo
      //*4. If still nothing, Play some random move with the botTurn fn

      let tryArr =botCells.slice();

      if (bothelper(tryArr) === 1001) {
        return;
      } else {

        let tryArr2 =humanCells.slice();
          if ( bothelper(tryArr2) === 1001) {
            return;
          }
          else {
            botTurnDumb();
          }
      }

      function bothelper ( arr ) {
        for (let i = 0; i < availableCells.length; i++) {
          const testCell = availableCells[i];
          arr.push(testCell);

            if (checkWinner(arr, 'test') === 999 ) {
              botMove(testCell);
              return 1001;
            } else {
              arr.pop();
              continue;
            }
        }
      }
}

//? Check if current move has made a winner
function checkWinner( playerCells, type) {

  //* Message is returned with value of 999 incase we want to check if current move has made a winner
  let message = 0;

  //* type - human or bot
  const currentPlayer = type;

  //* compare each win combo with playercells
    winCombos.forEach( combo => {
      let winCount =0;
      let winnArr = [];
        for (let c = 0; c < combo.length; c++) {
          for (let i = 0; i < playerCells.length; i++) {

            if(combo[c] === playerCells[i]) {
              winCount++;
              winnArr.push(playerCells[i]);
                if(winCount === 3) {
                  message = 999;
                    if(type !== 'test') {

                      console.log(winnArr, xscore, oscore);

                      onWin(currentPlayer);
                    }
                }
              break;
            }
            continue;
          }
        }
    })

  return message;
}


//? Things to do when a winner has been found
function onWin (winner) {

  //* 1. fade the tic-tac-toe grid and its contents and display the winner card
    elements.winner.classList.add('show');
    elements.grid.classList.add('hide');

  //* 2. Update winner scores and show the winner weapon type on winner card
    if(winner === player[0]) {
      elements[`win-${humanType}`].classList.add('hide');

      if(botType === 'x'? xscore++ : oscore++);

    } else {
      elements[`win-${botType}`].classList.add('hide');
      if(humanType === 'x'? xscore++ : oscore++);
    }

  //*3. Change header display
    display('Game Over');

  //* 4. Display result text
    elements["result-h1"].textContent = "WINNER";
}


//? Call on game Drawn
function onDraw() {

  //* 1. fade the tic-tac-toe grid and its contents and display the winner card
    elements.winner.classList.add('show');
    elements.grid.classList.add('hide');

    elements[`win-${botType}`].classList.add('hide');
    elements[`win-${humanType}`].classList.add('hide');

  //*2. Change header display
    display('Game Drawn');

  //* 4. Display result text
    elements["result-h1"].textContent = "DRAW";
}


//? Displays the player scores and if a message has to be displayed to user
function display(message) {

  elements.msg.textContent= message;
  elements.xscore.textContent = xscore;
  elements.oscore.textContent = oscore;

}

function  restartGame() {

  //* 1. Hide winner message section
    elements.winner.classList.remove('show');
    elements.grid.classList.remove('hide');

  //* 2 Empty player cells arrays
    humanCells = [];
    botCells = [] ;

  //*3 Refill available cells array
    for (let index = 0; index < 9; index++) {
      availableCells.push(`cell-${index}`);
    }

  //* 4. Remove all X's and 0's from tic-tac-toe grid
    const exs = document.querySelectorAll('.ex');
      for (const element of exs) {
        element.parentNode.removeChild(element);
      }

    const ohhs = document.querySelectorAll('.ohh');
      for (const element of ohhs) {
        element.parentNode.removeChild(element);
      }

  //* 5. remove hide class from X and O divs inside winner card

    elements["win-o"].classList.remove('hide');
    elements["win-x"].classList.remove('hide');

  //* 6 Change display message
    display('Start game or select player');

  //*7 Reset result header message in winer card
  elements["result-h1"].textContent = "";

}

