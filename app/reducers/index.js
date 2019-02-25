import {
  WEB3_CONNECTED,
  UPDATE_WALLET,
  FETCH_BLOCK_NUMBER,
  FETCH_BLOCK,
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
//        balance: action.payload.wallet.getBalance()
      }
    },
    [UPDATE_WALLET]: (state, action) => {
      return {
        ...state,
        wallet: action.payload.wallet
//        balance: action.payload.wallet.getBalance()
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
    [UPDATE_UTXO]: (state, action) => {
      return { ...state, utxos: action.payload }
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