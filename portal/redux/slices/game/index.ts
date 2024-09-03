import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type tokensOnBoard = {
  id: string,
  boardSquareId: string;
}[];

interface GameState {
  isMultiplayer: boolean;
  numberOfPlayers: number;
  currentTurn: string;
  diceRoll: number;
  hasRolled: boolean;
  isSix: boolean;
  isCapture: boolean,
  tokensOnBoardList: tokensOnBoard;
  winnerList: string[];
  gameStatus: string;
}

const gameState: GameState = {
  "isMultiplayer": false,
  "numberOfPlayers": 4,
  "currentTurn": "P1",
  "diceRoll": 0,
  "hasRolled": false,
  "isSix": false,
  "isCapture": false,
  "tokensOnBoardList": [],
  "winnerList": [],
  "gameStatus": 'start'
};


const calculateNextTurn = (state: GameState) => {
  let currentIndex = +state.currentTurn.slice(1);
  if (state.numberOfPlayers === 2) {
    return currentIndex === 1 ? 'P3' : 'P1';
  }
  let nextIndex = (currentIndex % state.numberOfPlayers) + 1;
  let wrappedIndex = (nextIndex + state.numberOfPlayers - 1) % state.numberOfPlayers + 1;
  while (state.winnerList.includes(`P${wrappedIndex}`)) {
    wrappedIndex = (wrappedIndex % state.numberOfPlayers) + 1;
  }
  return `P${wrappedIndex}`;
};


export const gameSlice = createSlice({
  name: 'gameState',
  initialState: gameState,
  reducers: {
    resetGameState: () => gameState,

    setNoOfPlayers: (state, action) => {
      state.numberOfPlayers = action.payload;
    },
    startGame: (state, action) => {
      state.gameStatus = 'inPlay';
      state.currentTurn = action.payload;
    },
    setMultiplayer: (state) => {
      state.isMultiplayer = true;
    },
    updateWinnerList: (state) => {
      state.winnerList.push(state.currentTurn);
    },
    endGame: (state) => {
      state.gameStatus = 'end';
    },
    setDiceRoll: (state, action) => {
      state.diceRoll = action.payload;
      state.hasRolled = true;
      if (action.payload == 6)
        state.isSix = true;
    },
    passTurn: (state, action: PayloadAction<string | undefined>) => {
      state.diceRoll = 0;
      state.hasRolled = false;
      state.isSix = false;
      state.isCapture = false;
      if (action.payload) {
        state.currentTurn = action.payload;
      }
      else
        state.currentTurn = calculateNextTurn(state);
    },
    updateMoveStatus: (state, action: PayloadAction<string | undefined>) => {
      state.diceRoll = 0;
      state.hasRolled = false;
      if (state.isSix)
        state.isSix = false;
      else if (state.isCapture)
        state.isCapture = false;
      else
        state.currentTurn = action.payload ? action.payload! : calculateNextTurn(state);
    },
    updateCapture: (state) => {
      state.isCapture = true;
    },
    addTokenToBoardList: (state, action) => {
      let { id, boardSquareId } = action.payload;
      let existingTokenIndex = state.tokensOnBoardList.findIndex(token => token.id === id);
      if (existingTokenIndex !== -1) {
        state.tokensOnBoardList[existingTokenIndex].boardSquareId = boardSquareId;
      } else {
        state.tokensOnBoardList.push(action.payload);
      }
    },
    removeTokenFromBoardList: (state, action) => {
      state.tokensOnBoardList = state.tokensOnBoardList.filter(token => token.id !== action.payload.id);
    }
  }
});

export const { resetGameState, setNoOfPlayers, setMultiplayer, startGame, setDiceRoll, passTurn, updateMoveStatus, updateCapture, addTokenToBoardList, removeTokenFromBoardList, updateWinnerList, endGame } = gameSlice.actions;
export default gameSlice.reducer;