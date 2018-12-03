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
    return state;
  }
};

export default reducer;


// const handlers = {
//   transactionReducer:{
//     [WEB3_CONNECTED]: (state, action) => {
//       return ( ...state, { wallet: action.payload.wallet }}
//     },
//     [FETCH_BLOCK_NUMBER]: (state) => {
//       return { ...state, {blockNumber: action.payload}}
//     },
//     [FETCH_BLOCK]: (state) => {
//       return { ...state, {block: action.payload}}
//     },
//     [UPDATE_UTXO]: (state) => {
//       return { ...state, {utxos: action.payload}}
//     },
//     [SEND_RAW_TRANSACTION]: (state) => {
//       return { ...state, {txResult: action.payload}};
//     }
//   }
// }  

// reducer = (state = defaultState, action) => {
//   const handler = handlers.transactionReducer[action.type]
//   if (!handler) { return state }
//   return handler(state, action)
// }

// export default reducer;