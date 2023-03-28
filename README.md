# 🏗 Scaffold-Balancer

> everything you need to build on Balancer! 🚀

🧪 Quickly experiment with custom AMMs using a frontend that allows you to interact with your custom pool contract(s).

🧪 Fork mainnet ethereum and test your custom pools within the context of all available liquidity.

🏗 Build and test your Smart Order Router (SOR) extension, getting you one step closer to being integrated into the Balancer ecosystem.

## Features

This project is a fork of scaffold-eth-typescript with a focus on providing [Balancer]:

- A react frontend running with `nextjs`.
- Solidity toolkit of `hardhat` or `foundry`

# 🏄‍♂️ Quick Start

Prerequisites: [Node (v16)](https://nodejs.org/en/download/) plus [Yarn (v1.x)](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)

> 1️⃣ clone/fork 🏗 scaffold-balancer:

```bash
git clone https://github.com/beethovenxfi/scaffold-balancer.git
```

> 2️⃣ Install all necessary dependencies

```bash
yarn install
```

> 3️⃣ Create scaffold config

```bash
yarn create-config
```

> 4️⃣ Create Mnemonics for contract deployments

```bash
yarn generate && yarn account
```

> 5️⃣ start your 👷‍ Hardhat fork of mainnet ethereum:

```bash
yarn fork
```

> 6️⃣ in a second terminal window, 🛰 deploy your contract:

⚠️Including deploys on `yarn fork` sometimes causes gas price issues. So, deployments are disabled and should be done separately.

```bash
yarn deploy
```

> 7️⃣ in a third terminal window, generate frontend files for deployed contracts:

```bash
yarn contracts:build
```

> 8️⃣ start your 📱 frontend:

```bash
yarn dev
```



🔏 Edit your smart contract `YourCustomPool.sol` in `packages/solidity-ts/contracts`

💼 Edit your contract deployment scripts in `packages/solidity-ts/deploy`

📝 Edit your frontend in `packages/nextjs-app-ts/src`

💻 Open http://localhost:3000 to see the app

## Configuration

Scaffold uses `scaffold.config.json` as a configuration file located in `/packages/common/src/scaffold.config.json`. You can create the config file by running the command `yarn create-config`.
