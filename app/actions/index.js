import WalletFactory from '../helpers/wallet';

export const WEB3_CONNECTED = 'WEB3_CONNECTED';
export const FETCH_BLOCK_NUMBER = 'FETCH_BLOCK_NUMBER';
export const FETCH_BLOCK = 'FETCH_BLOCK';
export const UPDATE_UTXO = 'UPDATE_UTXO';
export const DEPOSITED = 'DEPOSITED';
export const START_EXIT = 'START_EXIT';
export const GET_EXIT = 'GET_EXIT';
export const FINALIZE_EXIT = 'FINALIZE_EXIT';
export const SEND_RAW_TRANSACTION = 'SEND_RAW_TRANSACTION';


export function web3connect() {
  return async (dispatch) => {
    const wallet = WalletFactory.createWallet()
    await wallet.init()
    dispatch({
      type: WEB3_CONNECTED,
      payload: {
        wallet: wallet
      }
    });
    return wallet;
  };
}

export function fetchBlockNumber() {
  return (dispatch, getState) => {
    const wallet = getState().wallet;
    dispatch({
      type: FETCH_BLOCK_NUMBER,
      payload: wallet.latestBlockNumber
    });
  };
}

export function deposit(eth) {
  return (dispatch, getState) => {
    const wallet = getState().wallet;
    return wallet.deposit(eth).then(function(error, result) {
      console.log("deposit: ", error, result);
      dispatch({
        type: DEPOSITED,
        payload: {}
      });
    });
  };
}

export function startExit(tx) {
  return (dispatch, getState) => {
    const wallet = getState().wallet;
    wallet.exit(tx).then(function(error, result) {
      console.log("startExit: ", error, result);
      dispatch({
        type: START_EXIT,
        payload: {}
      });
    });
  };
}

export function getExit(exitPos) {
  return (dispatch, getState) => {
    const wallet = getState().wallet;
    wallet.getExit(exitPos).then(function(error, result) {
      console.log("getExit: ", error, result);
      dispatch({
        type: GET_EXIT,
        payload: {}
      });
    });
  };
}

export function finalizeExit(exitPos) {
  return (dispatch, getState) => {
    const wallet = getState().wallet;
    wallet.finalizeExit(exitPos).then(function(error, result) {
      console.log("finalizeExit: ", error, result);
      dispatch({
        type: FINALIZE_EXIT,
        payload: {}
      });
    });
  };
}

export function fetchBlock(blkNum) {
  if(typeof blkNum == 'string') {
    blkNum = Number(blkNum);
  }
  return (dispatch, getState) => {
    return childChainApi.getBlockByNumber(blkNum).then((block) => {
      const transactions = block.result.txs.map(tx => {
        return Transaction.fromBytes(new Buffer(tx, 'hex'));
      });
      dispatch({
        type: FETCH_BLOCK,
        payload: {
          txs: transactions
        }
      });
    });
  };
}

export function updateUTXO() {
  return (dispatch, getState) => {
    const wallet = getState().wallet;
    wallet.updateBlocks().then(() => {
      console.log('utxos', wallet.utxos);
      const utxos = Object.keys(wallet.utxos).map(k => wallet.utxos[k])
      dispatch({
        type: UPDATE_UTXO,
        payload: utxos
      });
    });
  };
}


export function transfer(toAddress, amount) {
  return async (dispatch, getState) => {
    const wallet = getState().wallet;
    await wallet.sendTransaction(toAddress, amount)
    dispatch({
      type: SEND_RAW_TRANSACTION,
      payload: {}
    });
  };
}
