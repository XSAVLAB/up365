
import { createSlice } from '@reduxjs/toolkit';

interface Token {
  id: string;
  px: number;
  py: number;
  locationStatus: string;
  boardSquareId: string;
}

interface Player {
  id: string;
  name: string;
  socketId: string;
  isPlaying: boolean;
  tokens: Token[];
}

type PlayerState = Player[];


const playerState: PlayerState = [
  {
    "id": "P1",
    "name": "Player 1",
    "socketId": '',
    "isPlaying": true,
    "tokens": [
      { "id": "P11", "px": 20, "py": 110, "locationStatus": "spawn", "boardSquareId": "spawn11" },
      { "id": "P12", "px": 40, "py": 110, "locationStatus": "spawn", "boardSquareId": "spawn12" },
      { "id": "P13", "px": 20, "py": 130, "locationStatus": "spawn", "boardSquareId": "spawn13" },
      { "id": "P14", "px": 40, "py": 130, "locationStatus": "spawn", "boardSquareId": "spawn14" }
    ]
  },
  {
    "id": "P2",
    "name": "Player 2",
    "socketId": '',
    "isPlaying": true,
    "tokens": [
      { "id": "P21", "px": 20, "py": 20, "locationStatus": "spawn", "boardSquareId": "spawn21" },
      { "id": "P22", "px": 40, "py": 20, "locationStatus": "spawn", "boardSquareId": "spawn22" },
      { "id": "P23", "px": 20, "py": 40, "locationStatus": "spawn", "boardSquareId": "spawn23" },
      { "id": "P24", "px": 40, "py": 40, "locationStatus": "spawn", "boardSquareId": "spawn24" }
    ]
  },
  {
    "id": "P3",
    "name": "Player 3",
    "socketId": '',
    "isPlaying": true,
    "tokens": [
      { "id": "P31", "px": 110, "py": 20, "locationStatus": "spawn", "boardSquareId": "spawn31" },
      { "id": "P32", "px": 130, "py": 20, "locationStatus": "spawn", "boardSquareId": "spawn32" },
      { "id": "P33", "px": 110, "py": 40, "locationStatus": "spawn", "boardSquareId": "spawn33" },
      { "id": "P34", "px": 130, "py": 40, "locationStatus": "spawn", "boardSquareId": "spawn34" }
    ]
  },
  {
    "id": "P4",
    "name": "Player 4",
    "socketId": '',
    "isPlaying": true,
    "tokens": [
      { "id": "P41", "px": 110, "py": 110, "locationStatus": "spawn", "boardSquareId": "spawn41" },
      { "id": "P42", "px": 130, "py": 110, "locationStatus": "spawn", "boardSquareId": "spawn42" },
      { "id": "P43", "px": 110, "py": 130, "locationStatus": "spawn", "boardSquareId": "spawn43" },
      { "id": "P44", "px": 130, "py": 130, "locationStatus": "spawn", "boardSquareId": "spawn44" }
    ]
  }
];

const playerSlice = createSlice({
  name: 'players',
  initialState: playerState,
  reducers: {
    resetPlayerState: () => playerState,

    setPlayers: (state, action) => {
      state[0].name = action.payload["P1"]?.name;
      state[0].socketId = action.payload["P1"]?.socketId ?? '';
      state[1].name = action.payload["P2"]?.name;
      state[1].socketId = action.payload["P2"]?.socketId ?? '';
      state[1].isPlaying = action.payload["P2"]?.isPlaying || false;
      state[2].name = action.payload["P3"]?.name;
      state[2].socketId = action.payload["P3"]?.socketId ?? '';
      state[3].name = action.payload["P4"]?.name;
      state[3].socketId = action.payload["P4"]?.socketId ?? '';
      state[3].isPlaying = action.payload["P4"]?.isPlaying || false;
    },
    updateTokenPosition: (state, action) => {
      let { playerId, id, locationStatus, boardSquareId, px, py } = action.payload;
      state[playerId.slice(1) - 1].tokens[id.slice(2) - 1].locationStatus = locationStatus;
      state[playerId.slice(1) - 1].tokens[id.slice(2) - 1].boardSquareId = boardSquareId;
      state[playerId.slice(1) - 1].tokens[id.slice(2) - 1].px = px;
      state[playerId.slice(1) - 1].tokens[id.slice(2) - 1].py = py;
    },
    setDisconnected: (state, action) => {
      state[action.payload].socketId = "disconnected";
      state[action.payload].isPlaying = false;
      state[action.payload].name = "disconnected";
    }
  },
});
export const { resetPlayerState, updateTokenPosition, setPlayers, setDisconnected } = playerSlice.actions;
export default playerSlice.reducer;
