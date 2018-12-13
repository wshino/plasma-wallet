import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  web3connect,
  fetchBlockNumber,
  fetchBlock,
  updateUTXO,
  deposit,
  startExit,
  transfer
} from './actions';
import Styles from './style.css';
import BigNumber from 'bignumber.js';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      amount: 20000000000000000
    };
  }

  componentDidMount() {
    // initialize web3
    window.addEventListener('load', async () => {
      const wallet = await this.props.web3connect();
      await this.props.updateUTXO();
    });
  }

  fetchBlockNumber() {
    this.props.fetchBlockNumber();
  }

  fetchBlock() {
    this.props.fetchBlock(
      this.state.blkNum || this.props.blockNumber);
  }

  updateUTXO() {
    this.props.updateUTXO();
  }
  
  transfer() {
    const utxos = this.props.utxos;
    const amount = Number(this.state.amount);
    const amounts = utxos.map((utxo, i) => {
      return utxo.value[0].end - utxo.value[0].start;
    });
    let maxIndex = 0;
    let maxAmount = 0;
    amounts.forEach((a, i) => {
      if(maxAmount < a && a > amount) {
        maxAmount = a;
        maxIndex = i;
      }
    });
    const utxo = this.props.utxos[maxIndex];
    if(utxo) {
      this.props.transfer(
        utxo,
        this.state.toAddress,
        amount);
    }
  }

  deposit(eth) {
    this.props.deposit(eth);
  }

  startExit(utxo) {
    console.log('startExit', utxo);
    this.props.startExit(utxo);
  }

  onBlkNumChange(e) {
    this.setState({
      blkNum: e.target.value
    });
  }

  onAddressChange(e) {
    this.setState({toAddress: e.target.value});
  }

  onAmountChange(e) {
    this.setState({amount: e.target.value});
  }

  render() {
    if (!this.props.wallet) {
      return (
        <div> Loading wallet </div>
      );
    }
    
    return (
      <div>
        <div className={Styles.container}>
          Plasma Sample Wallet!!
          <div>
            <p className={Styles['form-address']} >{this.props.wallet.getAddress()}</p>
          </div>
          <div>
            <button onClick={this.deposit.bind(this, 1)}>Deposit 1 ether</button>
            <button onClick={this.deposit.bind(this, 2)}>Deposit 2 ether</button>
            <button onClick={this.deposit.bind(this, 10)}>Deposit 10 ether</button>
          </div>
        </div>
        <div className={Styles.container}>
          <span>blkNum</span>
          <input
            onChange={this.onBlkNumChange.bind(this)}
          />
          <button onClick={this.fetchBlock.bind(this)}>fetchBlock</button>
          <p>Block Number: {this.props.blockNumber}</p>
          <p>Block</p>
          {
            this.props.block 
              ? this.props.block.txs.map(tx => { return (JSON.stringify(tx)); }) 
              : null
          }
        </div>
        <div className={Styles.container}>
          <button onClick={this.updateUTXO.bind(this)}>updateUTXOs</button>
          <p>UTXO List</p>
          {
            this.props.utxos 
              ? this.props.utxos.map((utxo, i) => {
                return (
                  <div key={i}>
                    {JSON.stringify(utxo.value)}
                    <button onClick={this.startExit.bind(this, utxo)}>startExit</button>
                  </div>
                );
              }) 
              : null
          }
          <p>balance</p>
          {
            this.props.utxos 
              ? (this.props.utxos.filter(utxo => {
                return utxo.state.length == 0 || utxo.state[0] === 0;
              }).reduce((acc, utxo) => {
                return acc.plus(utxo.value[0].end.div(1000000000000000000).minus(utxo.value[0].start.div(1000000000000000000)));
              }, BigNumber(0))).toString() 
              : null
          }
        </div>
        <div className={Styles.container}>
          <div>
            <span>To Address: </span>
            <input 
              className={Styles['form-input-address']}
              onChange={this.onAddressChange.bind(this)}
            />
            <input
              placeholder="amount"
              type="number"
              value={this.state.amount}
              className={Styles['form-input-address']}
              onChange={this.onAmountChange.bind(this)}
            />
          </div>
          <button onClick={this.transfer.bind(this)}>transfer</button>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = {
  web3connect,
  fetchBlockNumber,
  fetchBlock,
  updateUTXO,
  deposit,
  startExit,
  transfer
};

const mapStateToProps = (state) => ({
  wallet: state.wallet,
  blockNumber: state.blockNumber,
  block: state.block,
  utxos: state.utxos,
  txResult: state.txResult
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
