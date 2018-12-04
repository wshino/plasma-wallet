# Plasma Wallet
This is experimental software, don't run in production.

## Getting Started
You should run Plasma Chamber before running Plasma Wallet.

## Deploy Plasma Chamber Root Chain
### Install

```bash
$ git clone https://github.com/cryptoeconomicslab/plasma-chamber
$ cd plasma-chamber
$ mkdir .db

# Install Packages
$ yarn
$ yarn bootstrap
$ yarn build
```

### Run Main Chain on Ganache
Keep runnning active online.

```bash
$ yarn start:ganache-cli
```

### Deploy Root Chain

```bash
# Deploy Root Chain
$ cd packages/chamber-rootchain
$ truffle migrate --network live

# Move to plasma-chamber
# Copy .env
$ cd <go to plasma-chamber>
$ cp -p .env.sample .env
# To set .env file to the following values
ROOTCHAIN_ENDPOINT=http://127.0.0.1:8545
ROOTCHAIN_ADDRESS=0x345ca3e014aaf5dca488057592ee47305d9b3e10
OPERATOR_PRIVATE_KEY=c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3
MAIN=https://mainnet.infura.io/v3/12abea2d0fff436184cd78750a4e1966
KOVAN=https://kovan.infura.io/v3/12abea2d0fff436184cd78750a4e1966
RINKEBY=https://rinkeby.infura.io/v3/12abea2d0fff436184cd78750a4e1966
```

## Add plasma chamber-child-chain

```bash
# Move to plasma-chamber
$ cd <go to plasma-chamber>
$ cd packages/chamber-cli
$ cp -p .env.example .env
# To set .env file to the following values
ROOTCHAIN_ENDPOINT=http://127.0.0.1:8545
ROOTCHAIN_ADDRESS=0x345ca3e014aaf5dca488057592ee47305d9b3e10
MNEMONICS='candy maple cake sugar pudding cream honey rich smooth crumble sweet treat'

# Add child chain
$ yarn addchain
```

## Run RPC Server
Keep runnning active online.

```bash
# Run RPC Server
$ cd <go to plasma-chamber>
$ yarn start
```

## Run Plasma Wallet

```bash
$ git clone https://github.com/cryptoeconomicslab/plasma-wallet.git
$ cd plasma-wallet
$ cp -p .env.example .env
# To set .env file to the following values
ROOTCHAIN_ADDRESS=0x345ca3e014aaf5dca488057592ee47305d9b3e10
OPERATOR_ADDRESS=0x627306090abab3a6e1400e9345bc60c78a8bef57
ROOTCHAIN_ENDPOINT=http://127.0.0.1:8545
CHILDCHAIN_ENDPOINT=http://127.0.0.1:3000

# Install dependencies & Run
$ yarn
$ yarn start

# You can access to http://127.0.0.1:1234/
```
