import {
  ChamberWallet,
  PlasmaClient
} from '@layer2/wallet';
import {
  WalletStorage
} from './storage';
import {
  JsonRpcClient
} from './jsonrpc'

/**
 * Plasma wallet store UTXO and proof
 */
export default class WalletFactory {

  static createWallet() {
    const jsonRpcClient = new JsonRpcClient(process.env.CHILDCHAIN_ENDPOINT || 'http://localhost:3000')
    const client = new PlasmaClient(jsonRpcClient)
    const storage = new WalletStorage()
    const privateKey = storage.get('privateKey')
    if(privateKey) {
      return ChamberWallet.createWalletWithPrivateKey(
        client,
        process.env.ROOTCHAIN_ENDPOINT || 'http://127.0.0.1:8545',
        process.env.ROOTCHAIN_ADDRESS || '0x30753E4A8aad7F8597332E813735Def5dD395028',
        storage,
        privateKey
      )
    } else {
      const wallet = ChamberWallet.createRandomWallet(
        client,
        process.env.ROOTCHAIN_ENDPOINT || 'http://127.0.0.1:8545',
        process.env.ROOTCHAIN_ADDRESS || '0x30753E4A8aad7F8597332E813735Def5dD395028',
        storage
      )
      storage.add('privateKey', wallet.wallet.privateKey)
      location.reload()
      return wallet
    }
  }

}
