import { resolve } from 'path';

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
      const proofStore = db.createObjectStore('proof', { keyPath: 'id' });
      proofStore.createIndex('utxoKey', 'utxoKey', { unique: false });
    }
  }

  add(utxoKey, blkNum, proof, txBytes, index) {
    const storeName = 'proof';
    this.db.transaction(storeName, 'readwrite')
      .objectStore(storeName)
      .add({
        id: utxoKey + '.' + blkNum,
        utxoKey: utxoKey,
        blkNum: blkNum,
        proof: proof,
        txBytes: txBytes,
        index: index
      });
  }

  get(utxoKey, blkNum) {
    const storeName = 'proof'
    const request = this.db.transaction(storeName, 'readwrite')
      .objectStore(storeName)
      .get(utxoKey + '.' + blkNum);
    return new Promise((resolve, reject) => {
      request.onerror = function(event) {
        reject(event);
      };
      request.onsuccess = function(event) {
        resolve(request.result);
      };
    });
  }

  lastTransactions(utxoKey) {
    const storeName = 'proof';
    const range = IDBKeyRange.upperBound(utxoKey, true);
    return new Promise((resolve, reject) => {
      let proofs = [];
      this.db.transaction(storeName, 'readonly')
        .objectStore(storeName)
        .index('id')
        .openCursor(range).onsuccess = function(event) {
          var cursor = event.target.result;
          if (cursor) {
            proofs.push(cursor.value);
            cursor.continue();
          } else {
            resolve(proofs);
          }
        };
    });
  }

  searchProof(utxoKey) {
    const storeName = 'proof';
    const range = IDBKeyRange.only(utxoKey);
    return new Promise((resolve, reject) => {
      let proofs = [];
      this.db.transaction(storeName, 'readonly')
        .objectStore(storeName)
        .index('utxoKey')
        .openCursor(range).onsuccess = function(event) {
          var cursor = event.target.result;
          if (cursor) {
            proofs.push(cursor.value);
            cursor.continue();
          } else {
            resolve(proofs);
          }
        };
    });
  }

}