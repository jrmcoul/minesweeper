This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

# Minesweeper

## Project source can be downloaded from https://github.com/jrmcoul/minesweeper.git

## Author: Jeffrey March

## File List:

```
./src

./public (react default files)

.gitignore

README.md

package-lock.json

package.json
```

```
./src:

index.css

index.js

```

## How to clone and run app:

Navigate to your base folder, and in terminal type:

```
git clone https://github.com/jrmcoul/minesweeper.git
cd minesweeper
npm install
npm start
```

## Game information:

#### Game mechanics:

* Left click an unrevealed square to reveal it.
* Right click an unrevealed square to flag it as a mine.
* Left click a revealed square with the correct number of flags next to it to reveal all bordering unflagged, unrevealed squares.
* Full rules and other information can be found at: https://en.wikipedia.org/wiki/Minesweeper_(video_game)

* If you want to calculate the next move, click the "next move" button.
* If you want to start a new game, click the smiley face icon.
* If you want to change the difficulty and start a new game, change the difficulty in the dropdown menu.

#### Solver Info:

The app includes a solver, which can be activated by clicking the "next move" button.
If it is the first move, clicking the "next move" button will guess a random square.

The first order solving algorithm is to search the "border" revealed squares and see if the number of neighboring unrevealed squares equals the value of the border square minus the number of neighboring flags.
If so, it flags all neighboring unrevealed squares.
If the number of neighboring flagged squares equals the value of the border square, it reveals all neighboring unrevealed squares.

The second order solving algorithm is more complicated and involves labeling all the unrevealed squares that neighbor the revealed "border" squares based on "links."
In each link object, a key is the 1D index of the revealed "border" square, while the value is an array: [number of neighboring mines remaining, number of neighboring unrevealed squares].
For more information on this method, read the comments surrounding calculateLinks() and linkSolve() in the Game component.

## Still to do:

1. Implement final (edge case) solver technique
2. Implent probability calculator for making the "best guess" in the solver
