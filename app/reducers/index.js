import {
  WEB3_CONNECTED,
  FETCH_BLOCK_NUMBER,
  FETCH_BLOCK,
  UPDATE_UTXO,
  SEND_RAW_TRANSACTION
} from '../actions';

const defaultState = {};

const reducer = (state = defaultState, action) => {
  switch (action.type) {
  case WEB3_CONNECTED:
    return Object.assign({}, state, {
      wallet: action.payload.wallet
    });
  case FETCH_BLOCK_NUMBER:
    return Object.assign({}, state, {blockNumber: action.payload});
  case FETCH_BLOCK:
    return Object.assign({}, state, {block: action.payload});
  case UPDATE_UTXO:
    return Object.assign({}, state, {utxos: action.payload});
  case SEND_RAW_TRANSACTION:
    return Object.assign({}, state, {txResult: action.payload});
  default:
    return state
  }
};

export default reducer;
