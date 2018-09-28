import Web3 from 'web3'
import {
  Asset,
  Transaction,
  TransactionOutput
} from '@cryptoeconomicslab/plasma-chamber';
const utils = require('ethereumjs-util');

const privKey1 = new Buffer('e88e7cda6f7fae195d0dcda7ccb8d733b8e6bb9bd0bc4845e1093369b5dc2257', 'hex')
const privKey2 = new Buffer('855364a82b6d1405211d4b47926f4aa9fa55175ab2deaf2774e28c2881189cff', 'hex')
const testAddress1 = utils.privateToAddress(privKey1);
const testAddress2 = utils.privateToAddress(privKey2);
const zeroAddress = new Buffer("0000000000000000000000000000000000000000", 'hex');

export const WEB3_CONNECTED = 'WEB3_CONNECTED';
export const FETCH_BLOCK_NUMBER = 'FETCH_BLOCK_NUMBER';
export const SEND_RAW_TRANSACTION = 'SEND_RAW_TRANSACTION';


export function web3connect() {
  return (dispatch) => {
    const web3 = window.web3;
    if (typeof web3 !== 'undefined') {
      dispatch({
        type: WEB3_CONNECTED,
        payload: new Web3(web3.currentProvider)
      });
    }else{
      const web3 = new Web3(new Web3.providers.HttpProvider(
        process.env.ENDPOINT || 'http://127.0.0.1:3000'
      ));
      dispatch({
        type: WEB3_CONNECTED,
        payload: web3
      });
    }
  };
}

export function fetchBlockNumber() {
  return (dispatch, getState) => {
    const web3 = getState().web3;
    return web3.eth.getBlockNumber().then(blockNumber => {
      console.log("last block number: ", blockNumber);
      dispatch({
        type: FETCH_BLOCK_NUMBER,
        payload: blockNumber
      });
    });
  };
}

export function sendRawTransaction() {
  return async (dispatch, getState) => {
    const web3 = getState().web3;

    const input = new TransactionOutput(
      [testAddress1],
      new Asset(zeroAddress, 2)
    );
    const output = new TransactionOutput(
      [testAddress2],
      new Asset(zeroAddress, 2)
    );
    const tx = new Transaction(
      0,
      [testAddress2],
      new Date().getTime(),
      [input],
      [output]
    );
    console.log('a');
    let txBytes = tx.getBytes();
    let accounts = await web3.eth.getAccounts();
    console.log(accounts)
    return web3.eth.sign(
      utils.bufferToHex(txBytes),
      accounts[0],
    ).then((sign) => {
      console.log('c');
      tx.sigs.push(new Buffer(sign, 'hex'));
      // include sigunatures
      let signedTxBytes = tx.getBytes(true);
  
      const data = signedTxBytes.toString('hex');
      return web3.eth.sendSignedTransaction(data);
    }).then(transactionHash => {
      console.log("sendRawTransaction: ", transactionHash);
      dispatch({
        type: SEND_RAW_TRANSACTION,
        payload: transactionHash
      });
    });
  };
}
