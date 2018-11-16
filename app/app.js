import React, { Component } from 'react'
import { connect } from 'react-redux'
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

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      amount: 20000000000000000
    }
  }

  componentWillMount() {
    // initialize web3
    window.addEventListener('load', () => {
      this.props.web3connect();
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
    const utxo = this.props.utxos[0];
    if(utxo) {
      this.props.transfer(
        utxo,
        this.state.toAddress,
        this.state.amount);
    }
  }

  deposit() {
    this.props.deposit();
  }

  startExit(utxo) {
    console.log('startExit', utxo);
    this.props.wallet.getTransactions(utxo, 2).then(txList => {
      return this.props.startExit(txList);
    });
  }

  onBlkNumChange(e) {
    this.setState({
      blkNum: e.target.value
    });
  }

  onAddressChange(e) {
    this.setState({toAddress: e.target.value})
  }

  onAmountChange(e) {
    this.setState({amount: e.target.value})
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
            <input className={Styles['form-address']} value={this.props.wallet.getAddress()} />
          </div>
          <div>
            <button onClick={this.deposit.bind(this)}>Deposit 0.1ether</button>
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
          {this.props.block ? this.props.block.txs.map(tx => {
            return (JSON.stringify(tx))
          }) : null}
        </div>
        <div className={Styles.container}>
          <button onClick={this.updateUTXO.bind(this)}>updateUTXOs</button>
          <p>UTXO List</p>
          {this.props.utxos ? this.props.utxos.map(utxo => {
            return (<div>
              {JSON.stringify(utxo.value)}
              <button onClick={this.startExit.bind(this, utxo)}>startExit</button></div>)
          }) : null}
          <p>balance</p>
          {this.props.utxos ? (this.props.utxos.filter(utxo => {
            return utxo.state.length == 0 || utxo.state[0] === 0;
          }).reduce((acc, utxo) => {
            return acc + (utxo.value[0].end.div(1000000000000000000).minus(utxo.value[0].start.div(1000000000000000000))).toNumber();
          }, 0)) : null}
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
