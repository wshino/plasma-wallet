import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
  Link
} from 'react-router-dom';

import { 
  Header,
  Container,
} from 'semantic-ui-react';

import Styles from './style.css';

class MultisigGame extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
    
  render() {
    const { account } = this.state;
    
    return (
      <div className={Styles['header-base']} >
        <Container className={Styles['container-base']}>   
          <Link to="/transfer">Return</Link>
          <Header as='h2'>Rock-paper-scissors</Header>
        </Container>
      </div>
    );
  }
}

const mapDispatchToProps = {};

const mapStateToProps = (state) => ({
  wallet: state.wallet,
  blockNumber: state.blockNumber,
  block: state.block,
  utxos: state.utxos
});

export default connect(mapStateToProps, mapDispatchToProps)(MultisigGame);
