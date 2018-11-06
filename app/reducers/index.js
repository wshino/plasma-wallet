import {
  WEB3_CONNECTED,
  FETCH_BLOCK_NUMBER,
  SEND_RAW_TRANSACTION

} from '../actions';

const defaultState = {};

const reducer = (state = defaultState, action) => {
  switch (action.type) {
  case WEB3_CONNECTED:
    return Object.assign({}, state, {
      web3: action.payload.web3,
      web3Root: action.payload.web3Root
    });
  case FETCH_BLOCK_NUMBER:
    return Object.assign({}, state, {blockNumber: action.payload});
  case SEND_RAW_TRANSACTION:
    return Object.assign({}, state, {txResult: action.payload});
  default:
    return state
  }
};

export default reducer;
