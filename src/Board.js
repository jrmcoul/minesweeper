import React from 'react'
import Square from './Square'

// Creates a board, comprised of a 2D array of Square elements
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
    )
  }
}

export default Board