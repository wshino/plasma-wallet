import * as mqtt from 'mqtt'
import {
  ChamberWallet,
  PlasmaClient
} from '@layer2/wallet';
import {
  OwnState
} from '@layer2/core';
import {
  WalletStorage
} from './storage';
import {
  JsonRpcClient
} from './jsonrpc'

// should set up state verifier's address
OwnState.setAddress('0x9fbda871d559710256a2502a2517b794b482db40')

class WalletMQTTClient {

  constructor(endpoint) {
    this.client = mqtt.connect(endpoint)
    this.client.on('connect', (e) => {
      console.log('connect', e)
    })
  }

  publish(
    topic,
    message
  ) {
    console.log('publish', topic)
    this.client.publish(topic, message)
    return true
  }

  subscribe(
    topic,
    handler
  ) {
    console.log('subscribe', topic)
    this.client.subscribe(topic, (err) => {
      console.log('subscribed', err)
    })
    this.client.on('message', function (_topic, message) {
      console.log('message', _topic, message.toString())
      handler(message.toString())
    })
  }

}


/**
 * Plasma wallet store UTXO and proof
 */
export default class WalletFactory {

  static createWallet() {
    const childChainEndpoint = process.env.CHILDCHAIN_ENDPOINT || 'http://localhost:3000'
    const jsonRpcClient = new JsonRpcClient(childChainEndpoint)
    const client = new PlasmaClient(jsonRpcClient, new WalletMQTTClient(process.env.CHILDCHAIN_PUBSUB_ENDPOINT || childChainEndpoint))
    const storage = new WalletStorage()
    const privateKey = storage.get('privateKey')
    const options = {
      // kovan
      // initialBlock: 10000000,
      initialBlock: process.env.INITIAL_BLOCK || 1,
      interval: 20000,
      confirmation: process.env.CONFIRMATION || 0
    }
    if(privateKey) {
      return ChamberWallet.createWalletWithPrivateKey(
        client,
        process.env.ROOTCHAIN_ENDPOINT || 'http://127.0.0.1:8545',
        process.env.ROOTCHAIN_ADDRESS || '0x30753E4A8aad7F8597332E813735Def5dD395028',
        storage,
        privateKey,
        options
      )
    } else {
      const wallet = ChamberWallet.createRandomWallet(
        client,
        process.env.ROOTCHAIN_ENDPOINT || 'http://127.0.0.1:8545',
        process.env.ROOTCHAIN_ADDRESS || '0x30753E4A8aad7F8597332E813735Def5dD395028',
        storage,
        options
      )
      storage.add('privateKey', wallet.wallet.privateKey)
      location.reload()
      return wallet
    }
  }

}
