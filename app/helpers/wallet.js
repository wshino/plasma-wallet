import ChildChainApi from '../helpers/childchain';
import Storage from './storage';
import utils from 'ethereumjs-util';

/**
 * Plasma wallet store UTXO and proof
 */
export default class PlasmaWallet {
  constructor(address) {
    this.address = address;
    this.childChainApi = new ChildChainApi(process.env.CHILDCHAIN_ENDPOINT || 'http://localhost:3000');
    // what we have
    this.utxos = Storage.load('utxo') || {};
    this.latestBlockNumber = 0;
    this.loadedBlockNumber = Storage.load('loadedBlockNumber') || 0;
  }

  /**
   * @dev update UTXO and proof.
   */
  update() {
    return this.childChainApi.getBlockNumber().then((blockNumber) => {
      this.latestBlockNumber = blockNumber.result;
      let tasks = []
      for(let i = this.loadedBlockNumber + 1;i <= this.latestBlockNumber;i++) {
        tasks.push(this.childChainApi.getBlockByNumber(i));
      }
      return Promise.all(tasks);
    }).then((responses) => {
      responses.map(this.updateBlock.bind(this));
      this.updateLoadedBlockNumber(this.latestBlockNumber);
      return this.getUTXOArray();
    })
  }

  updateBlock(res) {
    const block = res.result;
    const filterOwner = (o) => {
      return o.owners.indexOf(this.address) >= 0;
    }
    block.txs.reduce((acc, tx) => {
      return acc.concat(tx.inputs);
    }, []).filter(filterOwner).forEach((spentUTXO) => {
      const key = utils.sha3(JSON.stringify(spentUTXO)).toString('hex');
      delete this.utxos[key];
    })
    block.txs.reduce((acc, tx) => {
      return acc.concat(tx.outputs);
    }, []).filter(filterOwner).forEach((utxo) => {
      const key = utils.sha3(JSON.stringify(utxo)).toString('hex');
      this.utxos[key] = utxo;
    })
    Storage.store('utxo', this.utxos);
  }

  updateLoadedBlockNumber(n) {
    this.loadedBlockNumber = n;
    Storage.store('loadedBlockNumber', this.loadedBlockNumber);
  }

  getUTXOArray() {
    return Object.keys(this.utxos).map(k => {
      return this.utxos[k];
    })
  }
}