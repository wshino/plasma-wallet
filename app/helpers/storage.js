export class Storage {

  static store(key, item) {
    window.localStorage.setItem(key, JSON.stringify(item));
  }

  static load(key) {
    try {
      return JSON.parse(window.localStorage.getItem(key));
    }catch (e) {
      return null;
    }
  }

}

export class BigStorage {

  constructor() {
    this.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    const request = window.indexedDB.open('proof', 3);
    request.onerror = (event) => {
      console.error('error at opening indexedDB', event.target.errorCode);
    };
    request.onsuccess = (event) => {
      this.db = event.target.result;
    };
    request.onupgradeneeded = (event) => {
      console.log('onupgradeneeded');
      const db = event.target.result;
      const proofStore = db.createObjectStore('proof', { keyPath: 'utxoKey' });
      proofStore.createIndex('blkNum', 'blkNum', { unique: false });
    }
  }

  add(key, blkNum, proof, txBytes) {
    const storeName = 'proof'
    this.db.transaction(storeName, 'readwrite')
        .objectStore(storeName)
        .add({
      utxoKey: key,
      blkNum: blkNum,
      proof: proof,
      txBytes: txBytes
    });
  }

}