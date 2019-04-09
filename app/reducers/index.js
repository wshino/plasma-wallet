import {
  WEB3_CONNECTED,
  UPDATE_WALLET,
  DEPOSITED,
  FETCH_BLOCK_NUMBER,
  FETCH_BLOCK,
  FETCH_USER_ACTIONS,
  UPDATE_UTXO,
  SEND_RAW_TRANSACTION,
  FETCH_BALANCE_OF_MAINCHAIN,
  DEFRAGMENTATION_START,
  DEFRAGMENTATION_UPDATE
} from '../actions';

const defaultState = {};

export const handlers = {
  transactionReducer:{
    [WEB3_CONNECTED]: (state, action) => {
      return {
        ...state,
        wallet:
        action.payload.wallet
      }
    },
    [UPDATE_WALLET]: (state, action) => {
      return {
        ...state,
        wallet: action.payload.wallet
      }
    },
    [FETCH_BALANCE_OF_MAINCHAIN]: (state, action) => {
      return { ...state, mainchainBalance: action.payload }
    },
    [FETCH_BLOCK_NUMBER]: (state, action) => {
      return { ...state, blockNumber: action.payload }
    },
    [FETCH_BLOCK]: (state, action) => {
      return { ...state, block: action.payload }
    },
    [FETCH_USER_ACTIONS]: (state, action) => {
      return { ...state, actions: action.payload }
    },
    [UPDATE_UTXO]: (state, action) => {
      return { ...state, utxos: action.payload }
    },
    [DEPOSITED]: (state, action) => {
      return { ...state, depositResult: action.payload };
    },
    [SEND_RAW_TRANSACTION]: (state, action) => {
      return { ...state, txResult: action.payload };
    },
    [DEFRAGMENTATION_START]: (state, action) => {
      return { ...state, message: action.payload.message };
    },
    [DEFRAGMENTATION_UPDATE]: (state, action) => {
      return { ...state, message: action.payload.message };
    }
  }
}  

function reducer (state = defaultState, action) {
  const handler = handlers.transactionReducer[action.type]
  if (!handler) { return state }
  return handler(state, action)
}

export default reducer;