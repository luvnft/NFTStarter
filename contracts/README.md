# Cairo contracts (Starknet)

## Setting environment

https://docs.starknet.io/quick-start/environment-setup/

## Setting account

https://docs.starknet.io/quick-start/set-up-an-account/

Faucet: https://starknet-faucet.vercel.app/

## Build smart contract

```bash
cd cairo
scarb build
```

## Test smart contract

```bash
cd cairo
scarb test
```

## Declare contract

```bash
cd cairo
starkli declare target/dev/nftstarter_NFTStarter.contract_class.json --network=sepolia --account ./account.json --keystore ./keystore.json
```

## Deploy contract

```bash
starkli deploy <CLASS_HASH> <CONSTRUCTOR_INPUTS> --network <NETWORK> --account ./account.json --keystore ./keystore.json

# starkli deploy 0x00db872c1c126625e7c481e278b05edceab89bc5dc60140b0b9b0bb765224cf4 str:GALOIS 6 str:GAL 3 0x28a05038b835b9cfb77da07d8b921c012b7e277263d10c0a3d39674ff664957 --network sepolia --account ./account.json --keystore ./keystore.json
```

## Bridge NFT l2 -> l1

```bash
starkli invoke <ADDRESS_NFT_STARTER> send_message_struct <TO_ADDRESS> <ETH_RECEIVER_NFT> <TOKEN_ID> --account ./account.json --keystore ./keystore.json --network sepolia
```

# Soldity contracts

```bash
cd solidity
yarn
yarn hardhat compile
```

## Deploy NFT contract

```bash
yarn hardhat ignition deploy ignition/modules/NFTStarter.ts --network <NETWORK>
```

## Deploy NFTBridgeEthereum

```bash
yarn hardhat ignition deploy ignition/modules/NFTBridgeEthereum.ts --network <NETWORK>
```

## Bridge NFT from L1 to L2

```bash
yarn ts-node scripts/sendL1toL2.ts
```