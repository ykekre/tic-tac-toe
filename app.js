
let humanType = 'x',
    botType = 'o',
    gameBegun = 0,
    isHumanTurn = true,
    humanCells = [], botCells = [], availableCells = [],
    xscore = 0,
    oscore = 0;

const xMarkup = `<div class="ex">
                        X
                  </div>`,

      oMarkup = `<div class="ohh">
                  O
                </div>`,

      elements = {
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
                },

      grid = [
              elements.cell0,
              elements.cell1,
              elements.cell2,
              elements.cell3,
              elements.cell4,
              elements.cell5,
              elements.cell6,
              elements.cell7,
              elements.cell8
            ],

      winCombos = [
                    ['cell-0', 'cell-1', 'cell-2'],
                    ['cell-3', 'cell-4', 'cell-5'],
                    ['cell-6', 'cell-7', 'cell-8'],
                    ['cell-0', 'cell-3', 'cell-6'],
                    ['cell-1', 'cell-4', 'cell-7'],
                    ['cell-2', 'cell-5', 'cell-8'],
                    ['cell-2', 'cell-4', 'cell-6'],
                    ['cell-0', 'cell-4', 'cell-8']
                  ],
      player = ['bot', 'human'],
      result = ['win', 'draw']


//? Initialize stuff in beginning like playertype and setup grid listeners
function init() {

  //* 1. Setup grid listeners
    setupListeners();

  //* 2. check if human has started game
    elements.grid.addEventListener('click', () => {
      gameBegun = 1;
    });

  /*
   * 3. Initially populate available cells array with all cells of grid.
        *We will remove cells from this array as the game moves on
        *and players click on the cells
  */
    fillAvailableCells();

  //*4. Hide the restart button

  elements.restart.classList.add('hide');
}

//? Call init
init();

//? populate available cells array
function fillAvailableCells() {
  for (let index = 0; index < 9; index++) {
    availableCells.push(`cell-${index}`);
  }
}

//? Setup all listeners
function setupListeners() {

  //* 1. GRID Listener: to pickup cells which have been clicked by human
    for (const cell of grid) {
      cell.addEventListener('click', (e) => {
        //! Which cell user has clicked on
        cellTarget = e.srcElement.classList[1];

        //!Call player move fn with this cell
         if(availableCells.includes(cellTarget)) {
           HumanTurn(cellTarget);
        }

        //!4. Show the restart button
        elements.restart.classList.remove('hide');
      })
    }

  //* 2. Score Card Listeners
    //? Left-score-card button listener
    scoreButtonListener('btnEx');

    //? Right-score-card button listener
    scoreButtonListener('btnOhh');

  //* 3. Restart button listener
    elements.restart.addEventListener('click', restartGame);
}


//? Score display button listeners,
//?Also used to select player type (X or O) in beginning of game
function scoreButtonListener(button) {
  elements[button].addEventListener('click', () => {
    //! if use has not started game already allow him to pick his choice of weapon
    if (gameBegun === 0) {
      if (button === 'btnEx' ?  pickWeapon("btnEx", 'btnOhh') : pickWeapon("btnOhh", 'btnEx') ) ;
    }

    display("Start game by making first move")
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
function HumanTurn(cell) {

  //* 1. Add X's or O's to grid as per player's weapon type
  if (availableCells.includes(cell) && isHumanTurn && !humanCells.includes(cell) ) {
    renderXorO(cell, humanType);
    humanCells.push(cell);
  }

  //* 2. Next move
  nextStep(humanCells, player[1]);
}

//? Make X's or O's Characters visible on grid as per player type when they make a move
function renderXorO(cell, type) {

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

//? fn to call after player has made a move
function nextStep(playerCells, who) {

  //* unless this move is winning, call next player to play
  if (!isWinning(playerCells)) {

    //!If there are still available cells on grid
    if (availableCells.length > 0) {

      //!Check if player is bot
      if (who === player[0]) {
        isHumanTurn = true ;
        display(`${humanType}'s turn`);

      }

      //!player is human
      else {
        isHumanTurn = false;
        display(`${botType}'s turn`);

        //! Call bot to make a move next with botTurnSmart
          setTimeout(botTurnSmart ,500) ;
      }
    }

    //! not winning and no more free cells - hence draw
    else {
      gameResult(result[1], who);
    }
  }

  //* winning with this move
  else { gameResult(result[0], who);
  }

}

/*
  ?Below fn is called to make bot play an 'intelligent' move i.e:
  ?It either tries for a win in the next move - if available
  ?or tries to block opponent's win in next move.
  ?If either of above conditions are NA,
  ?it calls the botTurnDumb fn to make a random move from amongst the available cells
*/

function botTurnSmart () {

  /*
    ? Steps to take
    * 1. take each element from available cells arr,
        *push it to a botCells array clone.
    * 2. check if this clone has any of the winning combos present
        ! if winning - play the move with this cell
        ! if not winning with any combo, break out of this loop and
        !try above next element in available cells
    * 3.Next try above with humanCells combo
    *4. If still nothing, Play some random move with the botTurnDumb fn
  */

        if (botHelper(botCells.slice())) {
          return;
        } else if  ( botHelper(humanCells.slice())) {
          return;
        }
        else {
          botTurnDumb();
        }

        function botHelper ( arr ) {

          //* take each cell from available cells, push it to playerCells array
          for (let i = 0; i < availableCells.length; i++) {
            const testCell = availableCells[i];
            arr.push(testCell);

            //*test if this new array has any winning combo
              if ( isWinning(arr) ) {
                //* if true, play botMove with this cell
                botMove(testCell);

                //* return true to botTurnSmart
                return true;
              } else {
                //* reject this cell, try with next avaialble cell
                arr.pop();
                continue;
              }
          }
        }

        //? This fn is called when we can't determine a forcing move for the bot i.e
        //? a move which either gives a win to the bot or prevents the human from winning.
        //?In which case a random move is played by bot
          //! THIS IS TO BE CALLED AS A LAST RESORT
          //TODO: MAKE RANDOM CHOOSING - ALSO SMARTER

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

          if (availableCells.includes(pickCell) && !isHumanTurn && !botCells.includes(pickCell) && !humanCells.includes(pickCell)) {
            renderXorO(pickCell, botType);

            //* Add this cell to array of cells on which bot has made a move
            botCells.push(pickCell);
          }

          //* next check for win or draw
          //* else call bot to play
            nextStep(botCells, player[0]);
        }
    }




//? Fn to check whether the given array of cells has a winning combo
function isWinning(playerCells) {

  //* compare each win combo with playercells
  for (let index = 0; index < winCombos.length; index++) {
    const combo = winCombos[index];

    //! winCount keeps track of no. of cells from playerCells arr
    //! which were found in any given winning combo
    //! when it reaches 3, it means we have found a winning combo and can return back
    let winCount = 0;
    ////let winnArr = [];
    for (let c = 0; c < combo.length; c++) {
      for (let i = 0; i < playerCells.length; i++) {
        if (combo[c] === playerCells[i]) {
          winCount++;
          ////winnArr.push(playerCells[i]);
          if (winCount === 3) {
            return true;
          }
          break;
        }
        continue;
      }
    }

  }
  return false;
}

//? Things to do when a winner has been found
function gameResult (result, who) {

  //* 1. fade the tic-tac-toe grid and its contents and display the winner card
    elements.winner.classList.add('show');
    elements.grid.classList.add('hide');

    if(result === 'win') {
      //* 2. Update winner scores and show the winner weapon type on winner card
      if(who === player[0]) {
        elements[`win-${humanType}`].classList.add('hide');

        if(botType === 'x'? xscore++ : oscore++);

      } else {
        elements[`win-${botType}`].classList.add('hide');
        if(humanType === 'x'? xscore++ : oscore++);
      }

      //*3. Change header display
      display(`Game won by ${who}`);

      //* 4. Display result text
      elements["result-h1"].textContent = "WINNER";
    }
    else {

      //*2. Show both weapon types on winner card
      elements[`win-${botType}`].classList.add('hide');
      elements[`win-${humanType}`].classList.add('hide');

      //*3. Change header display
      display('Game Drawn');

      //* 4. Display result text
      elements["result-h1"].textContent = "DRAW";
    }
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
    availableCells = [];

  //*3 Refill available cells array
    fillAvailableCells();

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
    display('Start the game');

  //*7 Reset result header message in winer card
  elements["result-h1"].textContent = "";

  //*8 Set player turn to true
  isHumanTurn = true;

   //*9. Hide the restart button
   elements.restart.classList.add('hide');
}

