import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function SelectDifficulty(props) {
  return (
    <select onChange={props.onChange}>
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
		};

    this.convert1Dto2D = this.convert1Dto2D.bind(this);
    this.convert2Dto1D = this.convert2Dto1D.bind(this);
    this.startTimer = this.startTimer.bind(this);
    this.stoptimer = this.stopTimer.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleContextMenu = this.handleContextMenu.bind(this);
    this.handleDifficultyChange = this.handleDifficultyChange.bind(this);
    this.handleNewGameClick = this.handleNewGameClick.bind(this);
	  this.initializeBoard = this.initializeBoard.bind(this);
    this.randomizeMines = this.randomizeMines.bind(this);
    this.setBoard = this.setBoard.bind(this);
    this.checkSurrounding = this.checkSurrounding.bind(this);
    this.clearSurrounding = this.clearSurrounding.bind(this);
    this.revealEmpty = this.revealEmpty.bind(this);
    this.checkSquaresRemaining = this.checkSquaresRemaining.bind(this);
    this.revealAllMines = this.revealAllMines.bind(this);
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
  	const squares = this.state.squares.slice();

  	if(squares[indices[0]][indices[1]].flagged || this.state.gameOver){
  		return;
  	}

    if(squares[indices[0]][indices[1]].className === "square revealed" && 
        squares[indices[0]][indices[1]].value !== null) {
      if(squares[indices[0]][indices[1]].value === this.checkSurrounding(indices[0],indices[1],true)){
        this.clearSurrounding(indices[0],indices[1]);
      }
    }


    let move = this.state.move;
    if(move === 0) {
      const mines = this.randomizeMines(this.state.height, this.state.width, [indices[0], indices[1]])
      this.setBoard(mines);
      this.startTimer();
    }
    squares[indices[0]][indices[1]].className = "square revealed";
    move++;

  	this.setState({
      move: move,
  		squares: squares,
  	}, function(){
      this.revealEmpty(indices);
    });

    if(squares[indices[0]][indices[1]].value === "M") {
      this.stoptimer();
      this.setState({
        gameOver: true,
      })
      this.revealAllMines();
      return;
    }

    const totalSquares = this.state.height*this.state.width - this.state.numMines;
    const squaresRevealed = this.checkSquaresRemaining();
    const gameOver = (totalSquares === squaresRevealed ? true : this.state.gameOver)
    if(gameOver){
      this.stopTimer();
    }
    this.setState({
      squaresRemaining: totalSquares - squaresRevealed,
      gameOver: gameOver
    });
  }

  handleContextMenu(event, i) {
    event.preventDefault();
    const indices = this.convert1Dto2D(i);
    const squares = this.state.squares.slice();
    let minesRemaining = this.state.minesRemaining;

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
    });
  }


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
    });
  }

  handleNewGameClick(event) {
    this.stopTimer();
    this.setState({
      time: 0,
      move: 0,
      squares: this.initializeBoard(this.state.height, this.state.width),
      gameOver: false,
      minesRemaining: this.state.numMines,
      squaresRemaining: this.state.height*this.state.width - this.state.numMines,
    });
  }

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
        }
      }
    }
    return arr;
  }

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

  checkSurrounding(row,col,isClearAll) {
    let mineCount = 0;
    const squares = this.state.squares.slice();
    for(let i = row - 1; i <=  row + 1; i++) {
      for(let j = col -1; j <= col + 1; j++) {
        if(i >= 0 && i < this.state.height &&
          j >= 0 && j < this.state.width){
          if(isClearAll){
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


  clearSurrounding(row,col) {
    const squares = this.state.squares.slice();
    for(let i = row - 1; i <=  row + 1; i++) {
      for(let j = col -1; j <= col + 1; j++) {
        if(i >= 0 && i < this.state.height &&
          j >= 0 && j < this.state.width &&
          squares[i][j].className === "square"){
          this.handleClick(this.convert2Dto1D([i,j]))
        }
      }
    }

    this.setState({
      squares: squares,
    })
  }

  revealEmpty(indices){
    const squares = this.state.squares.slice();
    if(squares[indices[0]][indices[1]].value === null) {
      for(let i = indices[0] - 1; i <= indices[0] + 1; i++){
        for(let j = indices[1] - 1; j <= indices[1] + 1; j++){
          if(i >= 0 && i < this.state.height &&
            j >= 0 && j < this.state.width &&
            squares[i][j].className === "square"){
            this.handleClick(this.convert2Dto1D([i,j]))
          }
        }
      }
    }
  }

  checkSquaresRemaining(){
    const squares = this.state.squares.slice();
    let revealedCount = 0;
    for(let i = 0; i < this.state.height; i++){
      for(let j = 0; j < this.state.width; j++){
        if(squares[i][j].className === "square revealed"){
          revealedCount++;
        }
      }
    }
    return revealedCount;
  }

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

  handleSolveClick(){

  }

  render() {
    let smileButton;
    if (this.state.gameOver && this.state.squaresRemaining === 0){
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
          <SelectDifficulty onChange={this.handleDifficultyChange}/>
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
          <p>
            {this.state.squaresRemaining === 0 ? "Great Job!!" : 
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
