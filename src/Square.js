import React from 'react'

// Creates a single square, with className providing css for appearance
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

export default Square