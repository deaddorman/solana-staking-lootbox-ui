# Pink Floyd NFT Collection

Solana, Metaplex, and Candy Machine Token Collection
<br>
Mint NFT, stake it and win a $PINK as reward

[Staking program](https://github.com/KevinFiorentino/solana-nft-staking)

### Create reward token

- `npm run create-pink-token`
- Set `TOKEN_REWARD` in `src/utils/constants.ts`

### Create Candy Machine

- `cd src/tokens/candy-machine`
- `sugar launch`
- Set `CANDY_MACHINE_ADDRESS` and `NFT_COLLECTION` in `src/utils/constants.ts`

### Run dapp

- `nvm use 16`
- `npm install`
- `npm run dev`
