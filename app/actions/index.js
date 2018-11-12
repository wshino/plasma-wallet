import {
  Transaction,
  TransactionOutput
} from '@cryptoeconomicslab/plasma-chamber';
import utils from 'ethereumjs-util';

import ChildChainApi from '../helpers/childchain';
import PlasmaWallet from '../helpers/wallet';

const childChainApi = new ChildChainApi(process.env.CHILDCHAIN_ENDPOINT || 'http://localhost:3000');

const BN = utils.BN


export const WEB3_CONNECTED = 'WEB3_CONNECTED';
export const FETCH_BLOCK_NUMBER = 'FETCH_BLOCK_NUMBER';
export const FETCH_BLOCK = 'FETCH_BLOCK';
export const UPDATE_UTXO = 'UPDATE_UTXO';
export const DEPOSITED = 'DEPOSITED';
export const SEND_RAW_TRANSACTION = 'SEND_RAW_TRANSACTION';

import RootChainArtifacts from '../assets/RootChain.json';

const RootChainAddress = process.env.ROOTCHAIN_ADDRESS || '0x345ca3e014aaf5dca488057592ee47305d9b3e10';
const OperatorAddress = process.env.OPERATOR_ADDRESS || '0x627306090abab3a6e1400e9345bc60c78a8bef57';

export function web3connect() {
  return (dispatch) => {
    const wallet = new PlasmaWallet();
    wallet.initWeb3().then(() => {
      dispatch({
        type: WEB3_CONNECTED,
        payload: {
          wallet: wallet
        }
      });
    });
  };
}

export function fetchBlockNumber() {
  return (dispatch, getState) => {
    childChainApi.request('eth_blockNumber').then((blockNumber) => {
      dispatch({
        type: FETCH_BLOCK_NUMBER,
        payload: blockNumber.result
      });
    })
  };
}

export function deposit() {
  return (dispatch, getState) => {
    const web3 = getState().wallet.web3;
    var rootChainContract = new web3.eth.Contract(
      RootChainArtifacts.abi,
      RootChainAddress
    );
    web3.eth.getAccounts().then((accounts) => {
      return rootChainContract.methods.deposit(
        OperatorAddress
      ).send({
        from: accounts[0],
        gas: 200000,
        value: new BN("100000000000000000")
      })
    }).then(function(error, result) {
      console.log("deposit: ", error, result);
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
    })
  };
}

export function updateUTXO() {
  return (dispatch, getState) => {
    const wallet = getState().wallet;
    wallet.update().then(utxos => {
      console.log(utxos);
      dispatch({
        type: UPDATE_UTXO,
        payload: utxos
      });
    })
  };
}


export function transfer(utxo, toAddress) {
  toAddress = new Buffer(toAddress, 'hex');
  return (dispatch, getState) => {
    const wallet = getState().wallet;
    const input = new TransactionOutput(
      utxo.owners,
      utxo.value.map(s=>parseInt(s)),
      utxo.state,
      utxo.blkNum
    );
    wallet.getHistory(PlasmaWallet.getUTXOKey(input)).then(history => {
      console.log('we should send history to receiver.', history);
    });
    const output = new TransactionOutput(
      [toAddress],
      utxo.value.map(s=>parseInt(s)),
      [0]
    );
    const tx = new Transaction(
      0,
      [toAddress],
      new Date().getTime(),
      [input],
      [output]
    );
    const sign = wallet.sign(tx);
    tx.sigs.push(sign);
    // include sigunatures
    let txBytes = tx.getBytes(true);

    const data = txBytes.toString('hex');
    return childChainApi.sendRawTransaction(data).then(transactionHash => {
      console.log("sendRawTransaction: ", transactionHash);
      dispatch({
        type: SEND_RAW_TRANSACTION,
        payload: transactionHash
      });
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
