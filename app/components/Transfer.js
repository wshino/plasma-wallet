import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
  Link
} from 'react-router-dom';

import { 
  Button, 
  Header,
  Input,
  Label,
  Divider,
  Container,
  List,
  Table
} from 'semantic-ui-react';

import {
  fetchBalanceOfMainChain,
  fetchBlockNumber,
  fetchBlock,
  updateUTXO,
  deposit,
  startExit,
  getExit,
  finalizeExit,
  transfer,
  merge,
  startDefragmentation
} from './../actions';
import Styles from './style.css';
import BigNumber from 'bignumber.js';

class Transfer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      amount: 200,
      account: ''
    };
  }

  async componentDidMount() {
    await this.props.updateUTXO();
    await this.props.fetchBalanceOfMainChain();
    await this.setState({account: this.props.wallet.getAddress()});
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
    const amount = this.state.amount;
    this.props.transfer(
      this.state.toAddress,
      String(Number(amount) * 1000000) );
  }

  deposit(eth) {
    this.props.deposit(eth);
  }

  startExit(utxo) {
    console.log('startExit', utxo);
    this.props.startExit(utxo);
  }

  finalizeExit(exitPos) {
    console.log('finalizeExit', exitPos);
    this.props.finalizeExit(exitPos);
  }
  
  getExit(exitPos) {
    console.log('getExit', exitPos);
    this.props.getExit(exitPos);
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
    const { account } = this.state;
    console.log(this.props.mainchainBalance)
    return (
      <div className={Styles['header-base']} >
        <Container className={Styles['container-base']}>   
          <Link to="/game">Game</Link>
          <Header as='h2'>Account</Header>
          
          {/* now we can't copy to clipboard. if you use copy to clipboard that you use library */}
          <Input 
            as='a' 
            color='teal' 
            action={{ 
              color: 'teal',
              labelPosition: 'right',
              icon: 'copy',
              content: 'Copy' 
            }}
            className={Styles['form-address']}
            defaultValue={account} 
          />
          <div>
            <Button onClick={this.deposit.bind(this, '1.0')}>Deposit 1 ether</Button>
            <Button onClick={this.deposit.bind(this, '2.0')}>Deposit 2 ether</Button>
            <Button onClick={this.deposit.bind(this, '10.0')}>Deposit 10 ether</Button>
          </div>
          
          <Header as='h2'>Balance</Header>
          {
            this.props.wallet.getBalance().div(1000000).toString()
          } Finney
          (
          {
            this.props.mainchainBalance ? this.props.mainchainBalance.div(1000000000000000).toString() : 0
          } Finney(Main Chain)
          )

          <Divider />
          <div>
            <Header as='h2'>To Address: </Header>
            <Input 
              className={Styles['form-input-address']}
              onChange={this.onAddressChange.bind(this)}
            />
            <Input
              placeholder="amount"
              type="number"
              value={this.state.amount}
              className={Styles['form-input-address']}
              onChange={this.onAmountChange.bind(this)}
            />
          </div>
          <Button onClick={this.transfer.bind(this)}>transfer</Button>


          <Divider />
          <List>
            <List.Item className={Styles['content-horizontal']}>
              <List.Content>
                <Header as='h2'>UTXO List</Header>
              </List.Content>
              <List.Content floated='right' >
                <Button onClick={this.updateUTXO.bind(this)}>updateUTXOs</Button>
              </List.Content>
            </List.Item>
          </List>
          <Table celled fixed>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Start</Table.HeaderCell>
                <Table.HeaderCell>End</Table.HeaderCell>
                <Table.HeaderCell>BlkNum</Table.HeaderCell>
                <Table.HeaderCell>Exit</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {
                this.props.wallet.getUTXOArray().map((utxo, i) => {
                  return (
                    <Table.Row key={i} >
                      <Table.Cell>{JSON.stringify(utxo.getOutput().getSegment(0).start.toString())}</Table.Cell>
                      <Table.Cell>{JSON.stringify(utxo.getOutput().getSegment(0).end.toString())}</Table.Cell>
                      <Table.Cell>{JSON.stringify(utxo.blkNum.toString())}</Table.Cell>
                      <Table.Cell>
                        <Button onClick={this.startExit.bind(this, utxo)}>startExit</Button>
                      </Table.Cell>
                    </Table.Row>
                  );
                })
              }
            </Table.Body>
          </Table>

          <Divider />
          <Button onClick={this.props.startDefragmentation}>Start Defragmentation</Button>
          <div>defragmentation status: {this.props.message}</div>

          <Divider />
          <p>Exit List</p>
          {
            this.props.wallet.getExits().map((exit, i) => {
              return (
                <div key={i}>
                  Exit {exit.getId()}.
                  You can withdraw {exit.getAmount()} gwei at {new Date(exit.getExitableAt()).toLocaleString()}.
                  <button onClick={this.props.finalizeExit.bind(this, exit.getId())}>finalizeExit</button>
                  <button onClick={this.props.getExit.bind(this, exit.getId())}>getExit</button>
                </div>
              );
            })
          }

          <Divider />
          <Header as='h2'>Block Number</Header>
          <Input
            onChange={this.onBlkNumChange.bind(this)}
          />
          <Button onClick={this.fetchBlock.bind(this)}>fetchBlock</Button>

        </Container>
      </div>
    );
  }
}

const mapDispatchToProps = {
  fetchBalanceOfMainChain,
  fetchBlockNumber,
  fetchBlock,
  updateUTXO,
  deposit,
  startExit,
  getExit,
  finalizeExit,
  transfer,
  merge,
  startDefragmentation
};

const mapStateToProps = (state) => ({
  wallet: state.wallet,
  balance: state.balance,
  mainchainBalance: state.mainchainBalance,
  blockNumber: state.blockNumber,
  block: state.block,
  utxos: state.utxos,
  txResult: state.txResult,
  message: state.message
});

export default connect(mapStateToProps, mapDispatchToProps)(Transfer);
