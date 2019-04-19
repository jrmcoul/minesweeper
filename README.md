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

Navigate to your own base folder, and in terminal type:

```
git clone https://github.com/jrmcoul/minesweeper.git
cd minesweeper
npm install
npm start
```

To play the game, left click an unrevealed square to reveal it.
Right click an unrevealed square to flag it as a mine.
Left click a revealed square with the correct number of flags next to it to reveal all bordering unflagged, unrevealed squares.
Full rules and other information can be found at: https://en.wikipedia.org/wiki/Minesweeper_(video_game)


## Still to do:

1. Implement final (edge case) solver technique
2. Implent probability calculator for making the "best guess" in the solver
