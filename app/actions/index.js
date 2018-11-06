import Web3 from 'web3'
import {
  Transaction,
  TransactionOutput
} from '@cryptoeconomicslab/plasma-chamber';
import utils from 'ethereumjs-util';
const BN = utils.BN

fetch('http://localhost:3000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },    
    body: JSON.stringify({
      "jsonrpc": "2.0",
      "id": 6412,
      "method": "chamber_block",
      "params": [7]
    })
  })
  .then(response => {
    return response.text();
  })
  .then(body => {
    console.log(body);
  });

const privKey1 = new Buffer('c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3', 'hex')
//const privKey2 = new Buffer('ae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f', 'hex')
const testAddress1 = utils.privateToAddress(privKey1);
//const testAddress2 = utils.privateToAddress(privKey2);

export const WEB3_CONNECTED = 'WEB3_CONNECTED';
export const FETCH_BLOCK_NUMBER = 'FETCH_BLOCK_NUMBER';
export const DEPOSITED = 'DEPOSITED';
export const SEND_RAW_TRANSACTION = 'SEND_RAW_TRANSACTION';

import RootChainArtifacts from '../assets/RootChain.json'

const RootChainAddress = process.env.ROOTCHAIN_ADDRESS || '0x345ca3e014aaf5dca488057592ee47305d9b3e10';
const OperatorAddress = process.env.OPERATOR_ADDRESS || '0x627306090abab3a6e1400e9345bc60c78a8bef57';
const user = '0x' + testAddress1.toString('hex');
console.log(user);

export function web3connect() {
  return (dispatch) => {
    const web3 = window.web3;
    if (typeof web3 !== 'undefined') {
      const web3tmp = new Web3(web3.currentProvider);
      dispatch({
        type: WEB3_CONNECTED,
        payload: {
          web3: web3tmp,
          web3Root: web3tmp
        }
      });
    }else{
      const web3 = new Web3(new Web3.providers.HttpProvider(
        process.env.ENDPOINT || 'http://127.0.0.1:3000'
      ));
      const web3Root = new Web3(new Web3.providers.HttpProvider(
        process.env.ENDPOINT || 'http://127.0.0.1:8545'
      ));
//      web3Root.eth.defaultAccount = user;
//      web3Root.eth.accounts.wallet.add(wallet.getPrivateKeyString());
      dispatch({
        type: WEB3_CONNECTED,
        payload: {
          web3,
          web3Root
        }
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

export function deposit() {
  return (dispatch, getState) => {
    const web3 = getState().web3Root;
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

export function sendRawTransaction() {
  return (dispatch, getState) => {
    const web3 = getState().web3;

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
