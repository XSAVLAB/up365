import { configureStore } from "@reduxjs/toolkit";
import gameSlice from './slices/game/index';
import playerSlice from './slices/player/index';

const isDevelopment = process.env.NODE_ENV === 'development';

export const store = configureStore({
  reducer:
  {
    gameState: gameSlice,
    players: playerSlice
  },
  devTools: isDevelopment
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;