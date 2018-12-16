import {
  BufferUtils,
  Transaction,
  TransactionOutput
} from '@cryptoeconomicslab/plasma-chamber';
import utils from 'ethereumjs-util';

import ChildChainApi from '../helpers/childchain';
import PlasmaWallet from '../helpers/wallet';
import RLP from 'rlp';

const childChainApi = new ChildChainApi(process.env.CHILDCHAIN_ENDPOINT || 'http://localhost:3000');

const BN = utils.BN;

export const WEB3_CONNECTED = 'WEB3_CONNECTED';
export const FETCH_BLOCK_NUMBER = 'FETCH_BLOCK_NUMBER';
export const FETCH_BLOCK = 'FETCH_BLOCK';
export const UPDATE_UTXO = 'UPDATE_UTXO';
export const DEPOSITED = 'DEPOSITED';
export const SEND_RAW_TRANSACTION = 'SEND_RAW_TRANSACTION';

import RootChainArtifacts from '../assets/RootChain.json';

const RootChainAddress = process.env.PLASMACHAIN_ADDRESS || '0x345ca3e014aaf5dca488057592ee47305d9b3e10';

export function web3connect() {
  return async (dispatch) => {
    const wallet = new PlasmaWallet();
    await wallet.initWeb3();
    const rootChainContract = new wallet.web3.eth.Contract(
      RootChainArtifacts.abi,
      RootChainAddress
    );
    wallet.setRootChainContract(rootChainContract);
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
    childChainApi.request('eth_blockNumber').then((blockNumber) => {
      dispatch({
        type: FETCH_BLOCK_NUMBER,
        payload: blockNumber.result
      });
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

export function startExit(utxo) {
  return (dispatch, getState) => {
    const wallet = getState().wallet;
    wallet.startExit(utxo).then(function(error, result) {
      console.log("startExit: ", error, result);
      dispatch({
        type: DEPOSITED,
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
    wallet.update().then(utxos => {
      console.log('utxos', utxos);
      dispatch({
        type: UPDATE_UTXO,
        payload: utxos
      });
    });
  };
}


export function transfer(utxo, toAddress, amount) {
  toAddress = BufferUtils.hexToBuffer(toAddress);
  return async (dispatch, getState) => {
    const wallet = getState().wallet;
    const input = new TransactionOutput(
      utxo.owners,
      utxo.value,
      utxo.state,
      utxo.blkNum
    );
    if(utxo.value[0].end.minus(utxo.value[0].start).toNumber() <= amount) {
      throw new Error('amount is too big');
    }
    wallet.getHistory(PlasmaWallet.getUTXOKey(input)).then(history => {
      console.log('we should send history to receiver.', history);
    });
    const output1 = new TransactionOutput(
      [toAddress],
      utxo.value.map(({start, end}) => {
        return {
          start: start,
          end: start.plus(amount)
        };
      }),
      [0]
    );
    const output2 = new TransactionOutput(
      utxo.owners,
      utxo.value.map(({start, end}) => {
        return {
          start: start.plus(amount),
          end: end
        };
      }),
      [0]
    );
    const tx = new Transaction(
      1,
      [toAddress, BufferUtils.numToBuffer(amount)],
      new Date().getTime(),
      [input],
      [output1, output2]
    );
    const accounts = await wallet.web3.eth.getAccounts();
    const sign = await wallet.sign(tx);
    tx.sigs.push(sign);
    // include sigunatures
    let txBytes = tx.getBytes(true);
    const data = txBytes.toString('hex');
    const transactionHash = await childChainApi.sendRawTransaction(data);
    console.log("sendRawTransaction: ", transactionHash);
    dispatch({
      type: SEND_RAW_TRANSACTION,
      payload: transactionHash
    });
  };
}

export function sendRawTransaction() {
  return (dispatch, getState) => {
    const web3 = getState().wallet.web3Child;

    const input = new TransactionOutput(
      [testAddress1],
      0
    );
    const output = new TransactionOutput(
      [testAddress2],
      0
    );
    const tx = new Transaction(
      0,
      [testAddress2],
      new Date().getTime(),
      [input],
      [output]
    );
    const sign = tx.sign(privKey1)
    tx.sigs.push(sign);
    // include sigunatures
    let txBytes = tx.getBytes(true);

    const data = txBytes.toString('hex');
    return web3.eth.sendSignedTransaction(data).then(transactionHash => {
      console.log("sendRawTransaction: ", transactionHash);
      dispatch({
        type: SEND_RAW_TRANSACTION,
        payload: transactionHash
      });
    });
  };
}
