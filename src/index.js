import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function isEmpty(obj) {
  for(let key in obj) {
      if(obj.hasOwnProperty(key))
          return false;
  }
  return true;
}

function SelectDifficulty(props) {
  return (
    <select onChange={props.onChange} className={props.className}>
      <option value="beginner">Beginner</option>
      <option value="intermediate">Intermediate</option>
      <option value="expert">Expert</option>
    </select>
  )
}

function NewGame(props) {
  return (
    <button onClick={props.onClick} className={props.className}></button>
  )
}

function SolveButton(props) {
  return (
    <button onClick={props.onClick} className ={props.className}>Solve</button>
  )
}

function Square(props) {

  return (
    <button
      value = {props.value}
      className={props.className}
      onClick={props.onClick}
      onContextMenu={(event) => props.onContextMenu(event)}
    >
      {props.value}
    </button>
  );

}

class Board extends React.Component {

  renderSquare(i) {
    const indices = this.props.convert1Dto2D(i);
    return (
    	<Square
        key={indices}
    	  value={this.props.squares[indices[0]][indices[1]].value}
    	  onClick={() => this.props.onClick(i)}
        onContextMenu={(event) => this.props.onContextMenu(event,i)}
        className={this.props.squares[indices[0]][indices[1]].className}
    	/>);
  }

  render() {
    let table = [];
    for(let i = 0; i < this.props.height; i++) {
      let children = [];
      for(let j = 0; j < this.props.width; j++) {
        children.push(this.renderSquare(this.props.width*i + j))
      }
      table.push(<div key={"row" + i} className="board-row">{children}</div>)
    }
    return (
      <div>
        {table}
      </div>
    );
  }
}


class Game extends React.Component {
	constructor(props) {
		super(props);

    this.boardSize = {
      beginner: [8,8,10],
      intermediate: [16,16,40],
      expert: [16,30,99]
    }

		this.state = {
      difficulty: "beginner",
      time: 0,
      timerOn: false,
      timerStart: 0,
      move: 0,
      height: this.boardSize.beginner[0],
      width: this.boardSize.beginner[1],
      numMines: this.boardSize.beginner[2],
      squares: this.initializeBoard(this.boardSize.beginner[0], this.boardSize.beginner[1]),
      gameOver: false,
      minesRemaining: this.boardSize.beginner[2],
      squaresRemaining: this.boardSize.beginner[0]*this.boardSize.beginner[1] - this.boardSize.beginner[2],
		  border: [],
      loss: false,
    };

    // this.squareRef = [];
    // for(i = 0; i < this.state.heightReact.createRef();

    this.convert1Dto2D = this.convert1Dto2D.bind(this);
    this.convert2Dto1D = this.convert2Dto1D.bind(this);
    this.startTimer = this.startTimer.bind(this);
    this.stoptimer = this.stopTimer.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleContextMenu = this.handleContextMenu.bind(this);
    this.placeFlag = this.placeFlag.bind(this);
    this.handleDifficultyChange = this.handleDifficultyChange.bind(this);
    this.handleNewGameClick = this.handleNewGameClick.bind(this);
	  this.initializeBoard = this.initializeBoard.bind(this);
    this.randomizeMines = this.randomizeMines.bind(this);
    this.setBoard = this.setBoard.bind(this);
    this.checkSurrounding = this.checkSurrounding.bind(this);
    this.clearSurrounding = this.clearSurrounding.bind(this);
    this.revealAllMines = this.revealAllMines.bind(this);
    this.winLoss = this.winLoss.bind(this);
    this.isBorder = this.isBorder.bind(this);
    this.findBorder = this.findBorder.bind(this);
    this.handleSolveClick = this.handleSolveClick.bind(this);
    this.calculateProbabilities = this.calculateProbabilities.bind(this);
    this.easySolve = this.easySolve.bind(this);
    this.calculateLinks = this.calculateLinks.bind(this);
    this.linkSolve = this.linkSolve.bind(this);
    this.borderingUnrevealed = this.borderingUnrevealed.bind(this);
  }

  convert1Dto2D(index){
    return [Math.floor(index/this.state.width), index % this.state.width];
  }

  convert2Dto1D(indices){
    return this.state.width*indices[0] + indices[1];
  }

  startTimer(){
    this.setState({
      time: this.state.time,
      timerOn: true,
      timerStart: Date.now() - this.state.time,
    });
    this.timer = setInterval(() => this.setState({
      time: Math.floor((Date.now() - this.state.timerStart)/1000),
    }),1000);
  }

  stopTimer() {
    this.setState({
      timerOn: false,
    });
    clearInterval(this.timer);
  }

	handleClick(i) {
    const indices = this.convert1Dto2D(i);
  	let squares = this.state.squares.slice();
    let move = this.state.move;

    // Doesn't allow click of flagged square or when game is over 
  	if(squares[indices[0]][indices[1]].flagged || this.state.gameOver){
  		return;
  	}

    // Initializing game on first move
    if(move === 0) {
      const mines = this.randomizeMines(this.state.height, this.state.width, [indices[0], indices[1]])
      this.setBoard(mines);
      this.startTimer();
    }

    const totalSquares = this.state.height*this.state.width - this.state.numMines;

    // If clicked square is unrevealed 
    if(squares[indices[0]][indices[1]].className === "square") {

      squares[indices[0]][indices[1]].className = "square revealed";  
      move += 1;

      if(squares[indices[0]][indices[1]].value === null) {
        const tempObj = this.clearSurrounding(indices[0], indices[1], squares, move);
        move = tempObj.move;
        squares = tempObj.squares;
      }

    }

    // If user clicks on revealed square that is surrounded by square.value flags
    else if(squares[indices[0]][indices[1]].className === "square revealed" && 
      squares[indices[0]][indices[1]].value !== null && 
      squares[indices[0]][indices[1]].value === this.checkSurrounding(indices[0],indices[1],true)){

      const tempObj = this.clearSurrounding(indices[0], indices[1], squares, move);
      move = tempObj.move;
      squares = tempObj.squares;

    }

    this.setState({
      move: move,
      squares: squares,
      squaresRemaining: totalSquares - move,
    }, () => {

      this.winLoss();
      let borderSquares = this.findBorder();
      this.setState({
        border: borderSquares,
      });

    });

  }

  handleContextMenu(event, i) {
    event.preventDefault();
    this.placeFlag(i);
  }

  placeFlag(i) {
    const indices = this.convert1Dto2D(i);
    const squares = this.state.squares.slice();
    let minesRemaining = this.state.minesRemaining

    if(squares[indices[0]][indices[1]].className === "square revealed" || this.state.gameOver){
      return;
    }

    if(squares[indices[0]][indices[1]].flagged){
      minesRemaining += 1;
    } else{
      minesRemaining -= 1;
    }
    squares[indices[0]][indices[1]].flagged = !squares[indices[0]][indices[1]].flagged;
    squares[indices[0]][indices[1]].flagged ? 
      squares[indices[0]][indices[1]].className = "square flagged" :
      squares[indices[0]][indices[1]].className = "square"

    this.setState({
      squares: squares,
      minesRemaining: minesRemaining,
    }, () => {

      let borderSquares = this.findBorder();
      this.setState({
        border: borderSquares,
      });
      
    });
  }

  // This is the event handler for the SelectDifficulty drop-down menu. It changes
  // the difficulty and re-initializes all of the necessary parameters.
  handleDifficultyChange(event) {
    let settings = this.boardSize[event.target.value];
    this.stopTimer();
    this.setState({
      difficulty: event.target.value,
      time: 0,
      move: 0,
      height: settings[0],
      width: settings[1],
      numMines: settings[2],
      squares: this.initializeBoard(settings[0], settings[1]),
      gameOver: false,
      minesRemaining: settings[2],
      squaresRemaining: settings[0]*settings[1] - settings[2],
      border: [],
      loss: false,
    });
  }

  // This is the event handler for the NewGame button. It re-initializes all of
  // the necessary parameters
  handleNewGameClick(event) {
    this.stopTimer();
    this.setState({
      time: 0,
      move: 0,
      squares: this.initializeBoard(this.state.height, this.state.width),
      gameOver: false,
      minesRemaining: this.state.numMines,
      squaresRemaining: this.state.height*this.state.width - this.state.numMines,
      border: [],
      loss: false,
    });
  }

  // This initializes the board of a given height and width by returning a 2x2
  // array of squares objects
  initializeBoard(height, width) {
    const arr = new Array(height);
    for(let i = 0; i < height; i++) {
      arr[i] = new Array(width);
      for(let j = 0; j < width; j++) {
        arr[i][j] = {
          className: "square",
          value: null,
          flagged: false,
          prob: null,
          link: {},
        }
      }
    }
    return arr;
  }

  // This returns the indices of all the mines for initial board placement.
  // "Lucky click" is instituted, meaning that the first click will always be
  // a blank square
  randomizeMines(height, width, firstClick) {
    let arr = [];
    let iClick = firstClick[0];
    let jClick = firstClick[1];
    for(let i = 0; i < height; i++) {
      for(let j = 0; j < width; j++) {
        if(!(i === iClick - 1 && j === jClick - 1) &&
          !(i === iClick - 1 && j === jClick) &&
          !(i === iClick - 1 && j === jClick + 1) &&
          !(i === iClick && j === jClick - 1) &&
          !(i === iClick && j === jClick) &&
          !(i === iClick && j === jClick + 1) &&
          !(i === iClick + 1 && j === jClick - 1) &&
          !(i === iClick + 1 && j === jClick) &&
          !(i === iClick + 1 && j === jClick + 1)){
          arr.push([i,j]);
        }
      } 
    }

    while(arr.length > this.state.numMines) {
      let removeInd = Math.floor(arr.length*Math.random());
      arr.splice(removeInd,1);
    }
    return arr;
  }

  // After mines have been randomized, this places all the mines and then
  // calculates and places all of the numbered squares
  setBoard(arr){
    let squares = this.state.squares.slice();
    for(let ind = 0; ind < arr.length; ind++) {
      squares[arr[ind][0]][arr[ind][1]].value = 'M';
    }
    for(let i = 0; i < this.state.height; i++) {
      for(let j = 0; j < this.state.width; j++) {
        if(squares[i][j].value !== 'M') {
          squares[i][j].value = this.checkSurrounding(i,j,false);
          if(squares[i][j].value === 0) {
            squares[i][j].value = null;
          }
        }        
      }
    }
    this.setState({
      squares: squares,
    })
  }

  // Checks each suqare for either:
  // -> the number of surrounding flags (isCountingFlags === true), or
  // -> the number of surrounding mines (isCountingFlags === false).
  // This returns the total number of surrounding flags or mines
  checkSurrounding(row,col,isCountingFlags) {
    let mineCount = 0;
    const squares = this.state.squares.slice();
    for(let i = row - 1; i <=  row + 1; i++) {
      for(let j = col - 1; j <= col + 1; j++) {
        if(i >= 0 && i < this.state.height &&
          j >= 0 && j < this.state.width){
          if(isCountingFlags){
            if(squares[i][j].flagged){
              mineCount++;
            }
          } else {
            if(squares[i][j].value === 'M') {
              mineCount++;
            }
          }
        }
      }
    }
    return mineCount;
  }

  // This reveals all non-flag squares around the center square. Calls this
  // again, recursively, if an empty square is encountered. 
  clearSurrounding(row, col, squares, move) {
    let resultObj = {};
    resultObj.squares = squares;
    resultObj.move = move;
    for(let i = row - 1; i <=  row + 1; i++) {
      for(let j = col - 1; j <= col + 1; j++) {
        if(i >= 0 && i < this.state.height &&
          j >= 0 && j < this.state.width &&
          resultObj.squares[i][j].className === "square" &&
          !resultObj.squares[i][j].flagged) {

          resultObj.squares[i][j].className = "square revealed";
          resultObj.move += 1;
          if(resultObj.squares[i][j].value === null) {
            resultObj = this.clearSurrounding(i, j, resultObj.squares, resultObj.move);
          }

        }
      }
    }
    return resultObj;
  }

  // Upon losing the game, this reveals all remaining mines by adding " exploded"
  // to the class names of all the unrevealed and unflagged squares
  revealAllMines(){
    const squares = this.state.squares.slice();
    for(let i = 0; i < this.state.height; i++){
      for(let j = 0; j < this.state.width; j++){
        if(squares[i][j].value === "M" && !squares[i][j].flagged){
          squares[i][j].className += " exploded"
        }
      }
    }
    this.setState({
      squares: squares,
    })
  }

  // Computed after every move to determine if the game was won or lost
  winLoss() {
    // In case of loss
    const squares = this.state.squares.slice();
    for(let i = 0; i < this.state.height; i++){
      for(let j = 0; j < this.state.width; j++){
        if(squares[i][j].value === "M" && squares[i][j].className === "square revealed"){
          this.stoptimer();
          this.setState({
            gameOver: true,
            loss: true,
          });
          this.revealAllMines();
          return;
        }
      }
    }

    // In case of win
    if(this.state.squaresRemaining === 0){
      this.stopTimer();
      this.setState({
        gameOver: true,
      })
      return;
    }

  }

  isBorder(row,col) {
    const squares = this.state.squares.slice();
    for(let i = row - 1; i <=  row + 1; i++) {
      for(let j = col - 1; j <= col + 1; j++) {
        if(i >= 0 && i < this.state.height &&
          j >= 0 && j < this.state.width &&
          !(i === row && j === col)){

          if(!squares[i][j].flagged && squares[i][j].className === "square") {
            return true;
          }
          
        }
      }
    }
    return false;
  }

  findBorder() {
    const squares = this.state.squares.slice();
    let resultArr = [];
    for(let i = 0; i < this.state.height; i++) {
      for(let j = 0; j < this.state.width; j++) {
        if(squares[i][j].className === "square revealed" && this.isBorder(i,j)) {
          resultArr.push([i,j]);
        }
      }
    }
    return resultArr;
  }

  handleSolveClick() {
    // this.squareRef.current.contextMenu(1);
    this.calculateProbabilities();
    // let squares = this.calculateLinks();
    // console.log(squares);
    // this.linkSolve(squares);
  }

  calculateProbabilities() {
    if(this.state.gameOver){
      return;
    } 

    const totalSquares = this.state.height*this.state.width - this.state.numMines;
    const squares = this.state.squares.slice();
    const border = this.state.border.slice();
    let result;

    // Guessing if there are no border cells
    if(border.length === 0) {
      let guess = this.convert1Dto2D(Math.floor(this.state.height * this.state.width * Math.random()));
      while(squares[guess[0]][guess[1]].className === "square revealed" || squares[guess[0]][guess[1]].flagged) {
        guess = this.convert1Dto2D(Math.floor(this.state.height * this.state.width * Math.random()));
      }
      this.handleClick(this.convert2Dto1D(guess));
      return
    }

    // Iterating through the border and computing the easySolve method on each border square
    for(let i = 0; i < border.length; i++) {
      result = this.easySolve(border[i]);
      if (result === "click" || result === "flag") {
        return;
      }
    }

    const linkSquares = this.calculateLinks();
    this.linkSolve(linkSquares);

  }

  // This enacts the easiest method for revealing or flagging a square:
  // finding where the bordering unrevealed squares === the inspected square's value
  // or where the bordering flags === the inspected square's value, revealing
  // or flagging the matching border square respectively.
  easySolve(indices) {
    const squares = this.state.squares.slice();
    let unrevealed = 0;
    let flags = 0;
    let unrevealedArr = [];
    for(let i = indices[0] - 1; i <=  indices[0] + 1; i++) {
      for(let j = indices[1] - 1; j <= indices[1] + 1; j++) {
        if(i >= 0 && i < this.state.height &&
          j >= 0 && j < this.state.width &&
          !(i === indices[0] && j === indices[1])){

          if(squares[i][j].flagged) {
            flags += 1;
          }
          
          else if(!squares[i][j].flagged && squares[i][j].className === "square") {
            unrevealed += 1;
            unrevealedArr.push([i,j]);
          }
       
        }
      }
    }

    if(flags === squares[indices[0]][indices[1]].value) {
      this.handleClick(this.convert2Dto1D(indices));
      return "click";
    } else if(unrevealed === squares[indices[0]][indices[1]].value - flags) {
      this.placeFlag(this.convert2Dto1D(unrevealedArr[0]));
      return "flag";
    } else {
      return "none";
    }

    // for(let sq = 0; sq < unrevealedArr.length; sq++){

        //squares[unrevealedArr[sq][0]][unrevealedArr[sq][1]].link
    // }
    // return unrevealed;

  }

  calculateLinks() {
    const squares = this.state.squares.slice();
    const border = this.state.border.slice();
    let indices, unrevealed, flags, unrevealedArr, row, col;

    for(let borderInd = 0; borderInd < border.length; borderInd++) {

      indices = border[borderInd];
      unrevealed = 0;
      flags = 0;
      unrevealedArr = [];

      for(let i = indices[0] - 1; i <=  indices[0] + 1; i++) {
        for(let j = indices[1] - 1; j <= indices[1] + 1; j++) {
          if(i >= 0 && i < this.state.height &&
            j >= 0 && j < this.state.width &&
            !(i === indices[0] && j === indices[1])){

            if(squares[i][j].flagged) {
              flags += 1;
            }
            
            else if(!squares[i][j].flagged && squares[i][j].className === "square") {
              unrevealed += 1;
              unrevealedArr.push([i,j]);
            }
         
          }
        }
      }

      for(let unrevealedInd = 0; unrevealedInd < unrevealedArr.length; unrevealedInd++){
        row = unrevealedArr[unrevealedInd][0];
        col = unrevealedArr[unrevealedInd][1];
        squares[row][col].link[this.convert2Dto1D([indices[0],indices[1]])] = 
          [squares[indices[0]][indices[1]].value - flags, unrevealed];
        // console.log(row + " " + col);
        // console.log(squares[row][col]);
      }

    }

    return squares;

  }

  linkSolve(squares) {
    let unrevealedArr = [];   
    for(let i = 0; i < this.state.height; i ++) {
      for(let j = 0; j < this.state.width; j++) {
        if(!isEmpty(squares[i][j].link)) {
          unrevealedArr.push([i,j]);
        }
      }
    }

    let row, col, borderingKey, borderingAnotherKey, borderingOnlyKey;
    for(let sq = 0; sq < unrevealedArr.length; sq++) {
      row = unrevealedArr[sq][0];
      col = unrevealedArr[sq][1];
      for(let key in squares[row][col].link) {
        for(let anotherKey in squares[row][col].link) {
          if(squares[row][col].link[key][0] > squares[row][col].link[anotherKey][0]) {
            borderingKey = this.borderingUnrevealed(this.convert1Dto2D(parseInt(key,10)));
            borderingAnotherKey = this.borderingUnrevealed(this.convert1Dto2D(parseInt(anotherKey,10)));
            borderingOnlyKey = [];

            for(let index = 0; index < borderingKey.length; index++) {
              if(!borderingAnotherKey.some((element) => {return element === borderingKey[index]})) {
                borderingOnlyKey.push(borderingKey[index]);
              }
            }

            if(squares[row][col].link[key][0] - borderingOnlyKey.length === squares[row][col].link[anotherKey][0]) {
              this.placeFlag(borderingOnlyKey[0]);
              console.log(borderingOnlyKey[0]);
              return "flag";
            }
          }

        }
      }
    }

    return "none"
    // console.log(unrevealedArr);
  }

  borderingUnrevealed(indices) {
    const squares = this.state.squares.slice();
    let resultArr = [];
    for(let i = indices[0] - 1; i <=  indices[0] + 1; i++) {
      for(let j = indices[1] - 1; j <= indices[1] + 1; j++) {
        if(i >= 0 && i < this.state.height &&
          j >= 0 && j < this.state.width &&
          !(i === indices[0] && j === indices[1])){

          if(!squares[i][j].flagged && squares[i][j].className === "square") {
            resultArr.push(this.convert2Dto1D([i,j]));
          }
          
        }
      }
    }
    return resultArr;
  }



  render() {
    let smileButton;
    if (this.state.gameOver && this.state.squaresRemaining === 0 && !this.state.loss){
      smileButton = "smiley victory";
    } else if (this.state.gameOver) {
      smileButton = "smiley loss";
    } else {
      smileButton = "smiley"
    }

    return (
      <div className="game">
        <div className={"around-board " + this.state.difficulty}>
          <p>{"Time elapsed: " + this.state.time}</p>
          <SelectDifficulty onChange={this.handleDifficultyChange}
            className="difficulty"/>
          <div>
            <NewGame onClick={this.handleNewGameClick}
              className={smileButton}/>
          </div>
          <div className = "game-board">
            <Board
            	squares = {this.state.squares}
            	onClick = {(i) =>  this.handleClick(i)}
              onContextMenu = {(event, i) => this.handleContextMenu(event, i)}
              height = {this.state.height}
              width = {this.state.width}
              numMines = {this.state.numMines}
              convert1Dto2D = {this.convert1Dto2D}
            />
          </div>
          <div>
            <SolveButton onClick={this.handleSolveClick}
              className="solve"/>
          </div>
          <p>
            {this.state.squaresRemaining === 0 && !this.state.loss ? "Great Job!!" : 
              (this.state.gameOver ? "You Lose :(" : "Mines Remaining: " + this.state.minesRemaining)}
          </p>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
