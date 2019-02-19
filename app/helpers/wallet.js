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
    return ChamberWallet.createWalletWithPrivateKey(
      client,
      process.env.ROOTCHAIN_ENDPOINT || 'http://127.0.0.1:8545',
      process.env.ROOTCHAIN_ADDRESS || '0x30753E4A8aad7F8597332E813735Def5dD395028',
      storage,
      privateKey?privateKey:'0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3',
    )
  }

}
