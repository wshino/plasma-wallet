import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  web3connect,
  fetchBlockNumber,
  fetchBlock,
  deposit,
  sendRawTransaction
} from './actions';

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

  sendRawTransaction() {
    this.props.sendRawTransaction();
  }

  deposit() {
    this.props.deposit();
  }

  render() {
    if (!this.props.web3) {
      return (
        <div> Loading web3 </div>
      );
    }
    return (
      <div>
        Hello, World!
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
          <button onClick={this.deposit.bind(this)}>Deposit 0.1ether</button>
        </div>
        <div>
          <button onClick={this.sendRawTransaction.bind(this)}>sendRawTransaction(not implemented)</button>
          <p>Tx Hash: {this.props.txResult}</p>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = {
  web3connect,
  fetchBlockNumber,
  fetchBlock,
  deposit,
  sendRawTransaction
};

const mapStateToProps = (state) => ({
  web3: state.web3,
  web3Root: state.web3Root,
  blockNumber: state.blockNumber,
  block: state.block,
  txResult: state.txResult
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
