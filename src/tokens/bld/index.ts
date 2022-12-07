import * as web3 from "@solana/web3.js";
import * as token from "@solana/spl-token";
import * as fs from "fs";
import { DataV2, createCreateMetadataAccountV2Instruction } from "@metaplex-foundation/mpl-token-metadata";
import { bundlrStorage, keypairIdentity, Metaplex, toMetaplexFile } from "@metaplex-foundation/js";
import { initializeKeypair } from "./initializeKeypair";

const TOKEN_NAME = "Pink Floyd Collection";
const TOKEN_SYMBOL = "PINK";
const TOKEN_DESCRIPTION = "NFT collection of Pink Floyd album covers, a English rock band formed in London in 1965. Gaining an early following as one of the first British psychedelic groups, they were distinguished by their extended compositions, sonic experimentation, philosophical lyrics and elaborate live shows. They became a leading band of the progressive rock genre, cited by some as the greatest progressive rock band of all time.";
const TOKEN_IMAGE_NAME = "pink-floyd-cover.jpg";
const TOKEN_IMAGE_PATH = `src/tokens/bld/assets/${TOKEN_IMAGE_NAME}`;

async function createBldToken(
  connection: web3.Connection,
  payer: web3.Keypair
) {
  // This will create a token with all the necessary inputs
  const tokenMint = await token.createMint(
    connection,
    payer,
    payer.publicKey,
    payer.publicKey,
    2
  );

  // Create a metaplex object so that we can create a metaplex metadata
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(payer))
    .use(
      bundlrStorage({
        address: "https://devnet.bundlr.network",
        providerUrl: "https://api.devnet.solana.com",
        timeout: 60000,
      })
    );

  // Read image file
  const imageBuffer = fs.readFileSync(TOKEN_IMAGE_PATH);
  const file = toMetaplexFile(imageBuffer, TOKEN_IMAGE_NAME);
  const imageUri = await metaplex.storage().upload(file);

  // Upload the rest of offchain metadata
  const { uri } = await metaplex
    .nfts()
    .uploadMetadata({
      name: TOKEN_NAME,
      description: TOKEN_DESCRIPTION,
      image: imageUri,
    });

  // Finding out the address where the metadata is stored
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
    "src/tokens/bld/cache.json",
    JSON.stringify({
      mint: tokenMint.toBase58(),
      imageUri: imageUri,
      metadataUri: uri,
      tokenMetadata: metadataPda.toBase58(),
      metadataTransaction: transactionSignature,
    })
  );
}

async function main() {
  const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
  const payer = await initializeKeypair(connection);

  await createBldToken(connection, payer);
}

main()
  .then(() => {
    console.log("Finished successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
