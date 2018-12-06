import {
  WEB3_CONNECTED,
  FETCH_BLOCK_NUMBER,
  FETCH_BLOCK,
  UPDATE_UTXO,
  SEND_RAW_TRANSACTION
} from '../actions';

const defaultState = {};

export const handlers = {
  transactionReducer:{
    [WEB3_CONNECTED]: (state, action) => {
      return { ...state, wallet: action.payload.wallet }
    },
    [FETCH_BLOCK_NUMBER]: (state, action) => {
      return { ...state, blockNumber: action.payload }
    },
    [FETCH_BLOCK]: (state, action) => {
      return { ...state, block: action.payload }
    },
    [UPDATE_UTXO]: (state, action) => {
      return { ...state, utxos: action.payload }
    },
    [SEND_RAW_TRANSACTION]: (state, action) => {
      return { ...state, txResult: action.payload };
    }
  }
}  

function reducer (state = defaultState, action) {
  const handler = handlers.transactionReducer[action.type]
  if (!handler) { return state }
  return handler(state, action)
}

export default reducer;