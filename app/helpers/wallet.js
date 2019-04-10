import * as mqtt from 'mqtt'
import {
  ChamberWallet,
  PlasmaClient,
  BrowserStorage,
  WalletMQTTClient
} from '@layer2/wallet';
import {
  JsonRpcClient
} from './jsonrpc'


/**
 * Plasma wallet store UTXO and proof
 */
export default class WalletFactory {

  static createWallet() {
    const childChainEndpoint = process.env.CHILDCHAIN_ENDPOINT
    const jsonRpcClient = new JsonRpcClient(childChainEndpoint || 'http://localhost:3000')
    const client = new PlasmaClient(jsonRpcClient, new WalletMQTTClient(process.env.CHILDCHAIN_PUBSUB_ENDPOINT || childChainEndpoint))
    const storage = new BrowserStorage()
    const privateKey = localStorage.getItem('privateKey')
    const options = {
      // kovan
      // initialBlock: 10000000,
      initialBlock: process.env.INITIAL_BLOCK || 1,
      interval: 20000,
      confirmation: process.env.CONFIRMATION || 0,
      OwnershipPredicate: process.env.OWNERSHIP_PREDICATE
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
      localStorage.setItem('privateKey', wallet.wallet.privateKey)
      location.reload()
      return wallet
    }
  }

}
