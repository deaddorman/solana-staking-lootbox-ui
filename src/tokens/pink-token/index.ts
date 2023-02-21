import * as web3 from '@solana/web3.js';
import * as token from '@solana/spl-token';
import * as fs from 'fs';
import * as anchor from '@project-serum/anchor';
import { DataV2, createCreateMetadataAccountV2Instruction } from '@metaplex-foundation/mpl-token-metadata';
import { bundlrStorage, keypairIdentity, Metaplex, toMetaplexFile } from '@metaplex-foundation/js';
import { setAuthority } from '@solana/spl-token';
import { initializeKeypair } from './initializeKeypair';
import { STAKE_PROGRAM_ID } from '../../utils/constants'

const TOKEN_NAME = 'Pink Floyd Token';
const TOKEN_SYMBOL = 'PINK';
const TOKEN_DESCRIPTION = 'Pink Floyd fungible token.';
const TOKEN_IMAGE_NAME = 'pink-floyd-cover.jpg';
const TOKEN_IMAGE_PATH = `src/tokens/pink-token/assets/${TOKEN_IMAGE_NAME}`;

async function createPINKToken(
  connection: web3.Connection,
  payer: web3.Keypair
) {

  // The Staking program will have the complete Authority of this token
  const [mintAuth] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from('mint')],
    STAKE_PROGRAM_ID
  )

  const tokenMint = await token.createMint(
    connection,
    payer,
    payer.publicKey,
    null,
    2
  );

  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(payer))
    .use(
      bundlrStorage({
        address: 'https://devnet.bundlr.network',
        providerUrl: 'https://api.devnet.solana.com',
        timeout: 60000,
      })
    );

  const imageBuffer = fs.readFileSync(TOKEN_IMAGE_PATH);
  const file = toMetaplexFile(imageBuffer, TOKEN_IMAGE_NAME);
  const imageUri = await metaplex.storage().upload(file);

  const { uri } = await metaplex
    .nfts()
    .uploadMetadata({
      name: TOKEN_NAME,
      description: TOKEN_DESCRIPTION,
      image: imageUri,
    });

  const metadataPda = metaplex.nfts().pdas().metadata({ mint: tokenMint });
  const tokenMetadata = {
    name: TOKEN_NAME,
    symbol: TOKEN_SYMBOL,
    uri: uri,
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
  } as DataV2

  const instruction = createCreateMetadataAccountV2Instruction(
    {
      metadata: metadataPda,
      mint: tokenMint,
      mintAuthority: payer.publicKey,
      payer: payer.publicKey,
      updateAuthority: payer.publicKey
    },
    {
      createMetadataAccountArgsV2: {
        data: tokenMetadata,
        isMutable: true
      }
    }
  )

  const transaction = new web3.Transaction()
  transaction.add(instruction)

  const transactionSignature = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [payer]
  )

  fs.writeFileSync(
    'src/tokens/pink-token/cache.json',
    JSON.stringify({
      mint: tokenMint.toBase58(),
      imageUri: imageUri,
      metadataUri: uri,
      tokenMetadata: metadataPda.toBase58(),
      metadataTransaction: transactionSignature,
    })
  );

  // Later to create the token and metadata, we change the mint authority and owner
  await setAuthority(
    connection,
    payer,
    tokenMint,
    payer.publicKey,
    0,                          // MintTokens authority
    mintAuth,
  );

  console.log('Change MintTokens authority OK');
}

async function main() {
  const connection = new web3.Connection(web3.clusterApiUrl('devnet'));
  const payer = await initializeKeypair(connection);

  await createPINKToken(connection, payer);
}

main()
  .then(() => {
    console.log('Finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
