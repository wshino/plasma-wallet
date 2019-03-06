import WalletFactory from '../helpers/wallet';

export const WEB3_CONNECTED = 'WEB3_CONNECTED';
export const FETCH_BALANCE_OF_MAINCHAIN = 'FETCH_BALANCE_OF_MAINCHAIN';
export const FETCH_BLOCK_NUMBER = 'FETCH_BLOCK_NUMBER';
export const FETCH_BLOCK = 'FETCH_BLOCK';
export const UPDATE_UTXO = 'UPDATE_UTXO';
export const DEPOSITED = 'DEPOSITED';
export const START_EXIT = 'START_EXIT';
export const GET_EXIT = 'GET_EXIT';
export const FINALIZE_EXIT = 'FINALIZE_EXIT';
export const SEND_RAW_TRANSACTION = 'SEND_RAW_TRANSACTION';
export const MERGE_TRANSACTION = 'MERGE_TRANSACTION';
export const DEFRAGMENTATION_START = 'DEFRAGMENTATION_START';
export const DEFRAGMENTATION_UPDATE = 'DEFRAGMENTATION_UPDATE';
export const UPDATE_WALLET = 'UPDATE_WALLET';

export function web3connect() {
  return async (dispatch) => {
    const wallet = WalletFactory.createWallet()
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

export function fetchBalanceOfMainChain() {
  return async (dispatch, getState) => {
    const wallet = getState().wallet;
    dispatch({
      type: FETCH_BALANCE_OF_MAINCHAIN,
      payload: await wallet.getBalanceOfMainChain()
    });
  };
}


export function deposit(eth) {
  return async (dispatch, getState) => {
    const wallet = getState().wallet;
    const result = await wallet.deposit(eth)
    dispatch({
      type: DEPOSITED,
      payload: result
    });
    setTimeout(() => {
      dispatch({
        type: DEPOSITED,
        payload: null
      });
    }, 10000)    
  }
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

export function transfer(toAddress, amount) {
  return async (dispatch, getState) => {
    const wallet = getState().wallet;
    const result = await wallet.transfer(toAddress, amount)
    dispatch({
      type: SEND_RAW_TRANSACTION,
      payload: result
    });
    setTimeout(() => {
      dispatch({
        type: SEND_RAW_TRANSACTION,
        payload: null
      });
    }, 10000)
  };
}

export function merge() {
  return async (dispatch, getState) => {
    const wallet = getState().wallet;
    await wallet.merge()
    dispatch({
      type: MERGE_TRANSACTION,
      payload: {}
    });
  };
}

export function startDefragmentation() {
  return async (dispatch, getState) => {
    const wallet = getState().wallet;
    await wallet.startDefragmentation((message) => {
      dispatch({
        type: DEFRAGMENTATION_UPDATE,
        payload: {
          message: message
        }
      });
    })
    dispatch({
      type: DEFRAGMENTATION_START,
      payload: {
        message: 'start'
      }
    });
  };
}
