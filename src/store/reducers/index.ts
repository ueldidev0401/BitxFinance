import { combineReducers } from 'redux';
import IDOReducer from './IDO';

export const rootReducer = combineReducers({
  IDO: IDOReducer,
});

const reducers = (state, action) => rootReducer(state, action);

export default reducers;
