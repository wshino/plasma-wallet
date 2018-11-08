import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  web3connect,
  fetchBlockNumber,
  fetchBlock,
  updateUTXO,
  deposit,
  transfer
} from './actions';
import Styles from './style.css';
console.log(Styles)
class App extends Component {
  constructor(props) {
    super(props)
    this.state = {}
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
    this.props.fetchBlock();
  }

  updateUTXO() {
    this.props.updateUTXO();
  }
  
  transfer() {
    const utxo = this.props.utxos[0];
    if(utxo) {
      this.props.transfer(
        utxo,
        this.state.toAddress);
    }
  }

  deposit() {
    this.props.deposit();
  }

  onAddressChange(e) {
    this.setState({toAddress: e.target.value})
  }

  render() {
    if (!this.props.wallet) {
      return (
        <div> Loading wallet </div>
      );
    }
    return (
      <div>
        Plasma Sample Wallet!!
        <div>
          <button onClick={this.fetchBlockNumber.bind(this)}>fetchBlockNumber</button>
          <p>Block Number: {this.props.blockNumber}</p>
        </div>
        <div>
          <button onClick={this.fetchBlock.bind(this)}>fetchBlock</button>
          <p>Block</p>
          {this.props.block ? this.props.block.txs.map(tx => {
            return (JSON.stringify(tx))
          }) : null}
        </div>
        <div>
          <button onClick={this.updateUTXO.bind(this)}>updateUTXOs</button>
          <p>UTXO List</p>
          {this.props.utxos ? this.props.utxos.map(utxo => {
            return (JSON.stringify(utxo.value))
          }) : null}
          <p>balance</p>
          {this.props.utxos ? (this.props.utxos.filter(utxo => {
            return utxo.state.length == 0 || utxo.state[0] === 0;
          }).length * 0.1) : null}
        </div>
        <div>
          <button onClick={this.deposit.bind(this)}>Deposit 0.1ether</button>
        </div>
        <div>
          <div>
            <span>To Address: </span>
            <input 
              className={Styles['form-input-address']}
              onChange={this.onAddressChange.bind(this)}
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
