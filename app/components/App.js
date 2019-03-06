import React, { Component } from 'react';
import { connect } from 'react-redux';

import { 
  Header,
  Loader,
  Container,
} from 'semantic-ui-react';

import {
  web3connect,
  fetchBlockNumber,
  fetchBlock,
  updateUTXO
} from './../actions';
import Styles from './style.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  async componentDidMount() {
    // initialize web3
    window.addEventListener('load', async () => {
      const wallet = await this.props.web3connect();
      await this.setState({account: wallet.getAddress()});
    });
  }

  render() {
    const { account } = this.state;

    if (!this.props.wallet) {
      return (
        <Loader active>Loading</Loader>
      );
    }
    
    return (
      <div>
        <div className={Styles['header-top']} >
          <Container>
            <Header as='h1'>Plasma Sample Wallet (kovan version)</Header>
          </Container>   
        </div>
        {this.props.children}
      </div>
    );
  }
}

const mapDispatchToProps = {
  web3connect,
  fetchBlockNumber,
  fetchBlock,
  updateUTXO
};

const mapStateToProps = (state) => ({
  wallet: state.wallet,
  blockNumber: state.blockNumber,
  block: state.block,
  utxos: state.utxos,
  txResult: state.txResult
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
