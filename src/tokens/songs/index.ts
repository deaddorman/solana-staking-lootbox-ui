import * as token from '@solana/spl-token'
import * as web3 from '@solana/web3.js'
import * as fs from 'fs'
import { initializeKeypair } from './initializeKeypair'
import { bundlrStorage, findMetadataPda, keypairIdentity, Metaplex, toMetaplexFile} from '@metaplex-foundation/js'
import { DataV2, createCreateMetadataAccountV2Instruction } from '@metaplex-foundation/mpl-token-metadata'
import { LOOKBOX_PROGRAM_ID } from '../../utils/constants'
import songs_metadata from './metadata.json'

interface Song {
  song: string;
  img: string;
  album: string;
  year: string;
  lyrics: string;
}

async function createSongs(
  connection: web3.Connection,
  payer: web3.Keypair,
) {
  const songs: Song[] = songs_metadata;
  let collection: any = {}

  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(payer))
    .use(
      bundlrStorage({
        address: 'https://devnet.bundlr.network',
        providerUrl: 'https://api.devnet.solana.com',
        timeout: 60000,
      })
    )

  for (let i = 0; i < songs.length; i++) {
    let mints: Array<string> = []

    const imageBuffer = fs.readFileSync(`src/tokens/songs/assets/${songs[i].img}.png`)
    const file = toMetaplexFile(imageBuffer, `${songs[i].img}.png`)
    const imageUri = await metaplex.storage().upload(file)

    // The Lootbox program will have the complete Authority of these tokens
    const [mintAuth] = await web3.PublicKey.findProgramAddress(
      [Buffer.from('mint')],
      LOOKBOX_PROGRAM_ID
    )

    const tokenMint = await token.createMint(
      connection,
      payer,
      payer.publicKey,
      payer.publicKey,
      0
    )

    mints.push(tokenMint.toBase58())

    const { uri } = await metaplex
      .nfts()
      .uploadMetadata({
        name: songs[i].song,
        description: 'Pink Floyd - Songs',
        image: imageUri,
        attributes: [
          {
            trait_type: 'Album',
            value: songs[i].album,
          },
          {
            trait_type: 'Year',
            value: songs[i].year,
          },
          {
            trait_type: 'Lyrics',
            value: songs[i].lyrics,
          },
        ],
      })

    // const metadataPda = await findMetadataPda(tokenMint)
    const metadataPda = metaplex.nfts().pdas().metadata({ mint: tokenMint })

    const tokenMetadata = {
      name: songs[i].song,
      symbol: 'PINKSONG',
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
        updateAuthority: payer.publicKey,
      },
      {
        createMetadataAccountArgsV2: {
          data: tokenMetadata,
          isMutable: true,
        },
      }
    )

    const transaction = new web3.Transaction()
    transaction.add(instruction)

    const transactionSignature = await web3.sendAndConfirmTransaction(
      connection,
      transaction,
      [payer]
    )

    // Later to create the token, we change the mint authority and owner
    await token.setAuthority(
      connection,
      payer,
      tokenMint,
      payer.publicKey,
      token.AuthorityType.MintTokens,
      mintAuth
    )

    console.log('OK:', songs[i].song)

    collection[songs[i].img] = mints
  }

  fs.writeFileSync('src/tokens/songs/cache.json', JSON.stringify(collection))
}

async function main() {
  const connection = new web3.Connection(web3.clusterApiUrl('devnet'))
  const payer = await initializeKeypair(connection)

  await createSongs(
    connection,
    payer,
  )
}

main()
  .then(() => {
    console.log('Finished successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.log(error)
    process.exit(1)
  })
