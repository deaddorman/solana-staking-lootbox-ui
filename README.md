# Solana DApp - NFTs, Staking and Lootbox

Mint NFT, Stake it and win $PINK as Reward. Change reward token for a random Lootbox.
<br>
A Pink Floyd NFT collection. Win $PINK and change it for Pink Floyd's SONGs collection.

![Stake NFT Demo](https://github.com/KevinFiorentino/solana-staking-lootbox-ui/blob/master/public/stake-demo.png?raw=true)

- See [Staking & Lootbox Program](https://github.com/KevinFiorentino/solana-staking-lootbox)

> Use at least NodeJS v16

### Create NFT Collection With Candy Machine

- `cd src/tokens/candy-machine`
- `sugar launch`
- Set `CANDY_MACHINE_ADDRESS` and `NFT_COLLECTION` in `src/utils/constants.ts`

### Create Reward Token

- Set `nft-staking` programId in `src/utils/constants.ts` from [programs repo](https://github.com/KevinFiorentino/solana-staking-lootbox)
- `npm run create-pink-token`
- Set `TOKEN_REWARD` in `src/utils/constants.ts`

### Create SONGs Token

- Set `lootbox` programId in `src/utils/constants.ts` from [programs repo](https://github.com/KevinFiorentino/solana-staking-lootbox)
- `npm run create-pink-songs`
- Set these program IDs generated in `lootbox-program`

### Run dapp

- `npm install`
- `npm run dev`
