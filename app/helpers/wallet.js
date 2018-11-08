import Web3 from 'web3';
import ChildChainApi from '../helpers/childchain';
import Storage from './storage';
import utils from 'ethereumjs-util';

/**
 * Plasma wallet store UTXO and proof
 */
export default class PlasmaWallet {
  constructor() {
    this.childChainApi = new ChildChainApi(process.env.CHILDCHAIN_ENDPOINT || 'http://localhost:3000');
    // what we have
    this.utxos = Storage.load('utxo') || {};
    this.latestBlockNumber = 0;
    this.loadedBlockNumber = Storage.load('loadedBlockNumber') || 0;
    // privKey is Buffer
    this.privKey = null;
    // address is hex string and checksum address
    this.address = null;
  }

  initWeb3() {
    const web3 = window.web3;
    const privateKeyHex = Storage.load('privateKey') || 'c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3';
    this.privKey = new Buffer(privateKeyHex, 'hex');
    if (typeof web3 !== 'undefined') {
      // MetaMask
      const web3tmp = new Web3(web3.currentProvider);
      this.web3 = web3tmp;
      this.web3Child = web3tmp;
      return this.web3.eth.getAccounts().then(accounts => {
        this.address = accounts[0];
        return Promise.resolve();
      });
    }else{
      // Mobile
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
      this.address = utils.toChecksumAddress(utils.bufferToHex(address));
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
      responses.map(this.updateBlock.bind(this));
      this.updateLoadedBlockNumber(this.latestBlockNumber);
      return this.getUTXOArray();
    });
  }

  updateBlock(res) {
    const block = res.result;
    const filterOwner = (o) => {
      const r = o.owners.map(ownerAddress => {
        return utils.toChecksumAddress(ownerAddress);
      });
      return r.indexOf(this.address) >= 0;
    };
    block.txs.reduce((acc, tx) => {
      return acc.concat(tx.inputs);
    }, []).filter(filterOwner).forEach((spentUTXO) => {
      const key = getUTXOKey({
        owners: spentUTXO.owners,
        value: spentUTXO.value,
        state: spentUTXO.state,
        blkNum: spentUTXO.blkNum
      });
      delete this.utxos[key];
    });
    block.txs.reduce((acc, tx) => {
      return acc.concat(tx.outputs);
    }, []).filter(filterOwner).forEach((utxo) => {
      const data = {
        owners: utxo.owners,
        value: utxo.value,
        state: utxo.state,
        blkNum: block.number
      };
      const key = getUTXOKey(data);
      this.utxos[key] = data;
    });
    Storage.store('utxo', this.utxos);
  }

  /**
   * @dev sign transaction by private key
   * @param {Transaction} tx
   */
  sign(tx) {
    tx.sign(this.privKey);
  }

  /**
   * @dev generate key from UTXO
   * @param {TransactionOutput} data 
   */
  static getUTXOKey(data) {
    if(data.owners && data.value && data.state && data.blkNum) {
      return utils.sha3(JSON.stringify(data)).toString('hex');
    }else{
      throw new Error('invalid UTXO');
    }
  }

  updateLoadedBlockNumber(n) {
    this.loadedBlockNumber = n;
    Storage.store('loadedBlockNumber', this.loadedBlockNumber);
  }

  getUTXOArray() {
    return Object.keys(this.utxos).map(k => {
      return this.utxos[k];
    });
  }
}