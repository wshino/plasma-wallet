import Web3 from 'web3';
import {
  Block,
  Transaction,
  TransactionOutput
} from '@cryptoeconomicslab/plasma-chamber';
import RLP from 'rlp';
import ChildChainApi from '../helpers/childchain';
import {
  BigStorage,
  Storage
} from './storage';
import utils from 'ethereumjs-util';
import BigNumber from 'bignumber.js';

const CHUNK_SIZE = BigNumber('1000000000000000000');


/**
 * Plasma wallet store UTXO and proof
 */
export default class PlasmaWallet {
  constructor() {
    this.childChainApi = new ChildChainApi(process.env.CHILDCHAIN_ENDPOINT || 'http://localhost:3000');
    // what we have
    this.utxos = Storage.load('utxo') || {};
    this.bigStorage = new BigStorage();
    this.latestBlockNumber = 0;
    this.loadedBlockNumber = Storage.load('loadedBlockNumber') || 0;
    // privKey is Buffer
    this.privKey = null;
    // address is hex string and checksum address
    this.address = null;
    this.zeroHash = utils.sha3(0).toString('hex');
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
    const transactions = block.txs.map(tx => {
      return Transaction.fromBytes(new Buffer(tx, 'hex'));
    });
    const filterOwner = (o) => {
      const r = o.owners.map(ownerAddress => {
        return utils.toChecksumAddress(ownerAddress);
      });
      return r.indexOf(this.address) >= 0;
    };
    transactions.reduce((acc, tx) => {
      return acc.concat(tx.inputs);
    }, []).filter(filterOwner).forEach((spentUTXO) => {
      const key = spentUTXO.hash().toString('hex');
      console.log('delete', spentUTXO.blkNum, block.number, spentUTXO.value);
      delete this.utxos[key];
    });
    let newTx = {};
    transactions.forEach(tx => {
      tx.outputs.forEach((utxo, i) => {
        if(filterOwner(utxo)) {
          const key = utxo.hash(block.number).toString('hex');
          this.utxos[key] = utxo.getBytes(block.number).toString('hex');
          newTx[key] = {
            txBytes: tx.getBytes(true).toString('hex'),
            index: i
          };
          console.log('insert', block.number, utxo.value, i);
        }
      });
    });
    let chunks = [];
    transactions.forEach(tx => {
      tx.outputs.forEach((utxo, oIndex) => {
        utxo.value.forEach(({start, end}, i) => {
          const slot = start.div(CHUNK_SIZE).integerValue(BigNumber.ROUND_FLOOR).toNumber();
          chunks[slot] = {
            txBytes: tx.getBytes(true).toString('hex'),
            index: oIndex,
            output: utxo
          }
        });
      });
    });
    // getting proof
    Object.keys(this.utxos).forEach(key => {
      TransactionOutput.fromBytes(Buffer.from(this.utxos[key], 'hex')).value.map(({start, end}) => {
        const slot = start.div(CHUNK_SIZE).integerValue(BigNumber.ROUND_FLOOR).toNumber();
        const proof = this.calProof(
          block,
          transactions,
          slot);
        
        if(newTx.hasOwnProperty(key)) {
          console.log('update 1', block.number)
          // inclusion
          this.bigStorage.add(
            slot,
            block.number,
            proof,
            newTx[key].txBytes,
            newTx[key].index
          );
        }else{
          console.log('update 2', block.number)
          // non-inclusion
          if(chunks[slot]) {
            this.bigStorage.add(
              slot,
              block.number,
              proof,
              chunks[slot].txBytes,
              chunks[slot].index
            );
          }else{
            console.log('update 3', block.number)
            this.bigStorage.add(
              slot,
              block.number,
              proof,
              this.zeroHash
            );
          }
        }
      });
    });
    Storage.store('utxo', this.utxos);
  }

  calProof(blockJson, transactions, chunk) {
    const block = new Block(blockJson.number);
    transactions.forEach(tx => {
      block.appendTx(tx);
    });
    console.log(block.number, block.txs[0].getBytes(true).toString('hex'))
    console.log('merkleHash', blockJson.number, block.merkleHash().toString('hex'));
    return block.createCoinProof(chunk).toString('hex');
  }

  getHistory(utxoKey) {
    return this.bigStorage.searchProof(utxoKey);
  }

  async getTransactions(utxo, num) {
    const slots = utxo.value.map(({start, end}) => {
      const slot = start.div(CHUNK_SIZE).integerValue(BigNumber.ROUND_FLOOR).toNumber();
      return slot;
    });
    // TODO: shoud fold history
    const history = await this.bigStorage.get(slots[0], utxo.blkNum);
    console.log(history);
    const tx = Transaction.fromBytes(Buffer.from(history.txBytes, 'hex'));
    const prevTxo = tx.inputs[0];
    const prevSlots = prevTxo.value.map(({start, end}) => {
      const slot = start.div(CHUNK_SIZE).integerValue(BigNumber.ROUND_FLOOR).toNumber();
      return slot;
    });
    const prevHistory = await this.bigStorage.get(prevSlots[0], prevTxo.blkNum);
    const prevTx = Transaction.fromBytes(Buffer.from(prevHistory.txBytes, 'hex'));
    let prevIndex = 0;
    prevTx.outputs.map((o, i) => {
      if(Buffer.compare(o.hash(prevTxo.blkNum), prevTxo.hash()) == 0) {
        prevIndex = i;
      }
    });
    let index = 0;
    tx.outputs.map((o, i) => {
      if(Buffer.compare(o.hash(utxo.blkNum), utxo.hash()) == 0) {
        index = i;
      }
    });    
    console.log(prevTx, tx);
    return [[
      prevHistory.blkNum,
      prevTx.getBytes(),
      Buffer.from(prevHistory.proof, 'hex'),
      prevTx.sigs[0],
      prevIndex
    ], [
      history.blkNum,
      tx.getBytes(),
      Buffer.from(history.proof, 'hex'),
      tx.sigs[0],
      index
    ]]
  }

  /**
   * @dev sign transaction by private key
   * @param {Transaction} tx
   */
  sign(tx) {
    return tx.sign(this.privKey);
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

  getUTXOArray() {
    return Object.keys(this.utxos).map(k => {
      return TransactionOutput.fromTuple(RLP.decode(Buffer.from(this.utxos[k], 'hex')));
    });
  }
}