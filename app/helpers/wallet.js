import Web3 from 'web3';
import {
  BaseWallet,
  Block,
  Transaction,
  TransactionOutput
} from '@cryptoeconomicslab/chamber-core';
import ChildChainApi from '../helpers/childchain';
import {
  BigStorage,
  Storage
} from './storage';
import utils from 'ethereumjs-util';
import BigNumber from 'bignumber.js';

const CHUNK_SIZE = BigNumber('1000000000000000000');

const WALLET_MODE_UNKNOWM = 0;
const WALLET_MODE_METAMASK = 1;
const WALLET_MODE_MOBILE = 2;

/**
 * Plasma wallet store UTXO and proof
 */
export default class PlasmaWallet extends BaseWallet {

  constructor() {
    super({
      storage: Storage,
      bigStorage: new BigStorage()
    });
    this.childChainApi = new ChildChainApi(process.env.CHILDCHAIN_ENDPOINT || 'http://localhost:3000');
    // what we have
    this.utxos = Storage.load('utxo') || {};
    this.latestBlockNumber = 0;
    this.loadedBlockNumber = Storage.load('loadedBlockNumber') || 0;
    // privKey is Buffer
    this.privKey = null;
    this.zeroHash = utils.sha3(0).toString('hex');
    this.mode = WALLET_MODE_UNKNOWM;
  }

  getAddress() {
    return this.address;
  }

  initWeb3() {
    const web3 = window.web3;
    const privateKeyHex = Storage.load('privateKey') || 'c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3';
    this.privKey = new Buffer(privateKeyHex, 'hex');
    if (typeof web3 !== 'undefined') {
      // MetaMask
      this.mode = WALLET_MODE_METAMASK;
      const web3tmp = new Web3(web3.currentProvider);
      this.web3 = web3tmp;
      this.web3Child = web3tmp;
      return this.web3.eth.getAccounts().then(accounts => {
        this.setAddress(accounts[0])
        return Promise.resolve();
      });
    }else{
      // Mobile
      this.mode = WALLET_MODE_MOBILE;
      const web3 = new Web3(new Web3.providers.HttpProvider(
        process.env.CHILDCHAIN_ENDPOINT || 'http://localhost:3000'
      ));
      const web3Root = new Web3(new Web3.providers.HttpProvider(
        process.env.ROOTCHAIN_ENDPOINT || 'http://localhost:8545'
      ));
      const address = utils.privateToAddress(this.privKey);
      web3Root.eth.defaultAccount = utils.bufferToHex(address);
      web3Root.eth.accounts.wallet.add(utils.bufferToHex(this.privKey));
      this.web3 = web3Root;
      this.web3Child = web3;
      this.setAddress(utils.toChecksumAddress(utils.bufferToHex(address)))
      return Promise.resolve();
    }
  }

  /**
   * @dev update UTXO and proof.
   */
  update() {
    return this.childChainApi.getBlockNumber().then((blockNumber) => {
      this.latestBlockNumber = blockNumber.result;
      let tasks = [];
      for(let i = this.loadedBlockNumber + 1;i <= this.latestBlockNumber;i++) {
        tasks.push(this.childChainApi.getBlockByNumber(i));
      }
      return Promise.all(tasks);
    }).then((responses) => {
      responses.map(res => {
        const block = res.result
        this.updateBlock(Block.fromString(JSON.stringify(block)))
      });
      this.updateLoadedBlockNumber(this.latestBlockNumber);
      return this.getUTXOs();
    });
  }

  getHistory(utxoKey) {
    return this.bigStorage.searchProof(utxoKey);
  }
  
  /**
   * @dev sign transaction by private key
   * @param {Transaction} tx
   */
  async sign(tx) {
    if(this.mode == WALLET_MODE_METAMASK) {
      const accounts = await this.web3.eth.getAccounts();
      return await this.web3.eth.sign(utils.bufferToHex(tx.hash()), accounts[0]);
    }else{
      return tx.sign(this.privKey);
    }
  }

  /**
   * @dev generate key from UTXO
   * @param {TransactionOutput} data 
   */
  static getUTXOKey(data) {
    if(data.owners && data.value && data.state && data.hasOwnProperty('blkNum')) {
      return utils.sha3(JSON.stringify(data)).toString('hex');
    }else{
      throw new Error('invalid UTXO');
    }
  }

  updateLoadedBlockNumber(n) {
    this.loadedBlockNumber = n;
    Storage.store('loadedBlockNumber', this.loadedBlockNumber);
  }

}