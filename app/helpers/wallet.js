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
    return new ChamberWallet(
      client,
      privateKey?privateKey:'0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3',
      process.env.ROOTCHAIN_ENDPOINT || 'http://127.0.0.1:8545',
      process.env.ROOTCHAIN_ADDRESS || '0xeec918d74c746167564401103096D45BbD494B74',
      storage
    )
  }

}
