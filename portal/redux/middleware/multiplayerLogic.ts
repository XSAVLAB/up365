import { Socket } from 'socket.io-client';
import { RootState, AppDispatch } from '../store';
import { setDisconnected, setPlayers, updateTokenPosition } from '../slices/player';
import { startGame, updateWinnerList, passTurn, updateMoveStatus, updateCapture, addTokenToBoardList, removeTokenFromBoardList, endGame, setMultiplayer } from '../slices/game/index';
import * as squareMapData from '@/utils/SquareMap.json';


interface SquareMap {
  [key: string]: {
    x: number;
    y: number;
    isSafeSquare?: boolean;
    boardSquareId?: number | string;
  };
};

interface MoveInput { playerId: string; tokenId: string; };
interface Player { socketId: string; name: string; };
interface newPlayerData { name: string; socketId: string; isPlaying: boolean; };
interface newPlayers { [key: string]: newPlayerData; };
type PlayerKey = keyof typeof laneData;

const laneData = {
  "P1": {
    startSquareId: 53,
    endSquareId: 58,
    thresholdSquareId: 51,
  },
  "P2": {
    startSquareId: 59,
    endSquareId: 64,
    thresholdSquareId: 12,
  },
  "P3": {
    startSquareId: 65,
    endSquareId: 70,
    thresholdSquareId: 25,
  },
  "P4": {
    startSquareId: 71,
    endSquareId: 76,
    thresholdSquareId: 38,
  },
};

const squareMap: SquareMap = squareMapData;


export const start = (playerList: Player[], playerTurn: string) => (dispatch: AppDispatch) => {


  let newPlayers: newPlayers = {};

  newPlayers["P1"] = { "name": playerList[0].name, "socketId": playerList[0].socketId, "isPlaying": true };
  newPlayers["P2"] = { "name": playerList[1].name, "socketId": playerList[1].socketId, "isPlaying": true };
  newPlayers["P3"] = { "name": playerList[2].name, "socketId": playerList[2].socketId, "isPlaying": true };
  newPlayers["P4"] = { "name": playerList[3].name, "socketId": playerList[3].socketId, "isPlaying": true };

  dispatch(setPlayers(newPlayers));
  dispatch(setMultiplayer());
  dispatch(startGame(playerTurn));
};

interface UserItem {
  socketId: string;
  name: string;
};


export const inPlayUserDisconnect = (userList: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  const state = getState();
  const users: UserItem[] = JSON.parse(userList);
  const currentTurn = state.gameState.currentTurn;

  let currentIndex = state.players.findIndex(p => p.socketId === currentTurn);
  let countDisc = 0;

  const socketIdList: string[] = [];

  for (let i = 0; i < users.length; i++) {
    socketIdList.push(users[i].socketId);
    if (users[i].socketId === "disconnected") {
      countDisc++;
      dispatch(setDisconnected(i));
    }
  }

  if (countDisc == 3)
    dispatch(endGame());

  if (socketIdList[currentIndex] === "disconnected") {
    let nextIndex = (currentIndex + 1) % 4;
    while (socketIdList[nextIndex] === "disconnected") {
      nextIndex = (nextIndex + 1) % 4;
    }
    dispatch(passTurn(socketIdList[nextIndex]));
  }
};


export const validateTurn = (socket: Socket) => (dispatch: AppDispatch, getState: () => RootState) => {
  const state = getState();
  let currentTurn = state.gameState.currentTurn;

  if (currentTurn !== socket.id) {
    return;
  }

  let diceRoll = state.gameState.diceRoll;
  let player = state.players.find((p) => p.socketId === currentTurn);
  let shouldPassTurn = diceRoll != 6 && player?.tokens.every(token => token.locationStatus === "spawn" || token.locationStatus === "home");
  if (shouldPassTurn) {
    setTimeout(() => {
      socket.emit('passTurn');
    }, 1500);
  }
};


export const calculateAndMove = (socket: Socket, moveInput: MoveInput) => (dispatch: AppDispatch, getState: () => RootState) => {
  const state = getState();
  let diceRoll = state.gameState.diceRoll;
  let tokensOnBoardList = state.gameState.tokensOnBoardList;
  let { playerId, tokenId } = moveInput;
  let playerKey = playerId as keyof typeof laneData;
  let player = state.players[+playerId.slice(1) - 1];
  let token = player.tokens[+tokenId.slice(2) - 1];
  let newLocationStatus = token.locationStatus;
  let newSquareId: number = 0;

  //* Spawn Logic

  if (token?.locationStatus === 'spawn' && diceRoll == 6) {
    newLocationStatus = "onBoard";
    let ref = `start${tokenId.split('')[1]}`;
    newSquareId = +squareMap[ref].boardSquareId!;
  }

  //* OnLane Logic

  if (token?.locationStatus === "onLane") {
    let newPos = +token.boardSquareId + diceRoll;
    if (newPos > laneData[playerKey].endSquareId)
      throw new Error('Cannot move this token');
    if (newPos === laneData[playerKey].endSquareId) {
      newLocationStatus = "home";
    }
    newSquareId = newPos;
  }

  //* OnBoard Logic

  if (token?.locationStatus === 'onBoard') {
    let currentSquare = +token.boardSquareId;
    newSquareId = (+token.boardSquareId + diceRoll - 1) % 52 + 1;

    const helperFunction = (current: number, pos: number) => {
      if (current <= laneData[playerKey].thresholdSquareId && pos > laneData[playerKey].thresholdSquareId) {
        newSquareId = laneData[playerKey].startSquareId + (pos - laneData[playerKey].thresholdSquareId) - 1;
        newLocationStatus = "onLane";
      }
    };

    if (playerId === "P1") {
      let newPos = +token.boardSquareId + diceRoll;
      helperFunction(currentSquare, newPos);
    }
    else {
      helperFunction(currentSquare, newSquareId);
    }
  }

  //* Capture Logic 

  let filteredList = tokensOnBoardList.filter((token) => +token.boardSquareId == newSquareId);

  let isACapture = !squareMap[newSquareId]?.isSafeSquare && (filteredList.length == 1) && (filteredList[0].id.substring(0, 2) !== token.id.substring(0, 2));


  if (isACapture) {
    let tokenToCapture = state.players[+filteredList[0].id.split('')[1] - 1].tokens[+filteredList[0].id.slice(2) - 1];
    let newBoardSquareId = `spawn${tokenToCapture.id.slice(1)}`;
    let newTokenCapture = {
      ...tokenToCapture,
      boardSquareId: newBoardSquareId,
      px: squareMap[newBoardSquareId].x,
      py: squareMap[newBoardSquareId].y,
      locationStatus: "spawn"
    };
    dispatch(updateTokenPosition({
      ...newTokenCapture,
      playerId: filteredList[0].id.substring(0, 2)
    }));
    dispatch(removeTokenFromBoardList(newTokenCapture.id));
    dispatch(updateCapture());
  }

  //* Adjust x and y for Overlapping Tokens 

  let correctionX = 0, correctionY = 0;

  let existingTokens = filteredList.map((t) => (
    state.players[+t.id.split('')[1] - 1].tokens[+t.id.slice(2) - 1])
  );

  if (!isACapture && filteredList.length != 0) {
    switch (filteredList.length) {
      case 1:
        let newTokenAdjust = {
          ...existingTokens[0],
          px: squareMap[existingTokens[0].boardSquareId].x - 2
        };

        dispatch(updateTokenPosition({
          ...newTokenAdjust,
          playerId: newTokenAdjust.id.substring(0, 2)
        }));

        correctionX = 2;

        break;

      case 2:
      case 3:
      case 4:

        let newTokenAdjust1 = {
          ...existingTokens[0],
          px: squareMap[existingTokens[0].boardSquareId].x - 2,
          py: squareMap[existingTokens[0].boardSquareId].y - 2
        };

        let newTokenAdjust2 = {
          ...existingTokens[1],
          px: squareMap[existingTokens[1].boardSquareId].x + 2,
          py: squareMap[existingTokens[1].boardSquareId].y - 2
        };

        dispatch(updateTokenPosition({
          ...newTokenAdjust1,
          playerId: newTokenAdjust1.id.substring(0, 2)
        }));

        dispatch(updateTokenPosition({
          ...newTokenAdjust2,
          playerId: newTokenAdjust2.id.substring(0, 2)
        }));

        correctionX = -2;
        correctionY = 2;

        if (filteredList.length >= 3) {
          let newTokenAdjust3 = {
            ...existingTokens[2],
            px: squareMap[existingTokens[2].boardSquareId].x - 2,
            py: squareMap[existingTokens[2].boardSquareId].y + 2
          };
          dispatch(updateTokenPosition({
            ...newTokenAdjust3,
            playerId: newTokenAdjust3.id.substring(0, 2)
          }));

          correctionX = 2;
          correctionY = 2;
        }

        if (filteredList.length == 4) {
          let newTokenAdjust4 = {
            ...existingTokens[3],
            px: squareMap[existingTokens[3].boardSquareId].x - 2,
            py: squareMap[existingTokens[3].boardSquareId].y + 2
          };
          dispatch(updateTokenPosition({
            ...newTokenAdjust4,
            playerId: newTokenAdjust4.id.substring(0, 2)
          }));

          correctionX = 0;
          correctionY = 0;
        }
        break;
    }
  }


  //* Update Current Token and dispatch Actions


  let newToken = {
    ...token,
    boardSquareId: newSquareId,
    locationStatus: newLocationStatus,
    px: squareMap[newSquareId].x + correctionX,
    py: squareMap[newSquareId].y + correctionY
  };

  dispatch(updateTokenPosition({ ...newToken, playerId: playerId }));
  if (newLocationStatus === 'home') {
    dispatch(removeTokenFromBoardList(newToken.id));
    dispatch(checkWinner(playerKey));
  }
  else {
    dispatch(addTokenToBoardList({ id: newToken.id, boardSquareId: newToken.boardSquareId }));
    dispatch(updateMultiplayerTurn());
  }
};

export const updateMultiplayerTurn = () => (dispatch: AppDispatch, getState: () => RootState) => {
  const state = getState();
  let nextTurn = '';
  if (state.gameState.isSix || state.gameState.isCapture) {
    nextTurn = state.gameState.currentTurn;
  }
  else {
    let currentIndex = state.players.findIndex((p) => p.socketId === state.gameState.currentTurn);
    let nextIndex = (currentIndex + 1) % 4;

    while (state.players[nextIndex].socketId === "disconnected") {
      nextIndex = (nextIndex + 1) % 4;
    }
    nextTurn = state.players[nextIndex].socketId;
  }
  dispatch(updateMoveStatus(nextTurn));
};


export const checkWinner = (playerKey: PlayerKey) => (dispatch: AppDispatch, getState: () => RootState) => {
  const state = getState();
  let player = state.players[+playerKey.slice(1) - 1];
  let numberOfPlayers = state.gameState.numberOfPlayers;
  let checkAllTokensHome = player.tokens.every((t) => +t.boardSquareId === laneData[playerKey].endSquareId);
  if (!checkAllTokensHome) {
    dispatch(updateMoveStatus());
    return;
  }
  dispatch(updateWinnerList());
  if (state.gameState.winnerList.length == numberOfPlayers - 1) {
    dispatch(endGame());
  }
};