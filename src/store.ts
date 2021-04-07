import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import videoReducer from '../lib/slices/video-slice';

const store = configureStore({
  reducer: videoReducer,
  devTools: true,
});

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();

export default store;
