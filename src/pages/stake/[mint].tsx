import type { NextPage } from "next"
import { useEffect, useState, useMemo } from "react"
import { Program, AnchorProvider } from "@project-serum/anchor"
import { getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount, createAssociatedTokenAccountInstruction, getAccount, Account } from "@solana/spl-token";
import { PublicKey, Signer } from "@solana/web3.js"
import { StakeView } from "../../views"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { Metaplex, walletAdapterIdentity, Nft, NftWithToken, Sft, SftWithToken, JsonMetadata } from "@metaplex-foundation/js"
import { IDL } from "../../utils/idl/solana_nft_staking"
import { TOKEN_REWARD, STAKE_PROGRAM_ID } from '../../utils/constants'
import { StakeAccount, getStakeAccount } from "../../utils/accounts"
import { getOrCreateATA } from "../../utils/accounts";
import Head from "next/head"

const Stake: NextPage<StakeProps> = ({ mint }) => {

  const [mintAddress, setMintAddress] = useState<PublicKey>()

  const [nftData, setNFTData] = useState<Nft | NftWithToken | Sft | SftWithToken>(null)
  const [pinkTokenAccount, setpinkTokenAccount] = useState<Account>()
  const [stakingInfo, setStakingInfo] = useState<StakeAccount>()
  const [nftTokenAccount, setNftTokenAccount] = useState<PublicKey>();
  const [metadata, setMetadata] = useState<JsonMetadata>(null)

  const { connection } = useConnection()
  const wallet = useWallet()

  const provider = new AnchorProvider(connection, wallet, {})

  const stakingProgramId = STAKE_PROGRAM_ID;
  const stakingProgram = new Program(IDL, stakingProgramId, provider)

  const metaplex = useMemo(() => {
    return Metaplex.make(connection).use(walletAdapterIdentity(wallet))
  }, [connection, wallet])

  useEffect(() => {
    setMintAddress(new PublicKey(mint))
  }, [])

  useEffect(() => {
    if (mintAddress && wallet)
      getViewInformation()
  }, [mintAddress, wallet])

  const getViewInformation = () => {
    // Step 1 - Get NFT Info
    metaplex
      .nfts()
      .findByMint({ mintAddress: mintAddress })
      .then((nft) => {

        setNFTData(nft)

        // Step 2 - Get Reward Info
        getTokenPINKInfo()

        // Step 4 - Get NFT Token Account
        getNftTokenAccount(nft)

        // Step 5 - Get NFT Staking Info
        getStakingState()

        // Step 6 - Get NFT Metadata
        fetch(nft.uri)
          .then((res) => res.json())
          .then((m) => {
            setMetadata(m)
          })
      })
  }

  const getNftTokenAccount = (nft) => {
    connection.getTokenLargestAccounts(nft.mint.address)
      .then((accounts) =>
        setNftTokenAccount(accounts.value[0].address)
      );
  }

  const getTokenPINKInfo = async () => {
    getOrCreateATA(wallet, connection, wallet.publicKey, TOKEN_REWARD, wallet.publicKey)
      .then((ata) => {
        return getAccount(connection, ata.address);
      })
      .then((tokenAccount) => {
        setpinkTokenAccount(tokenAccount)
      })
      .catch((error) => {
        console.log('Error getting ATA', error);
      });
  }

  const getStakingState = async () => {
    try {
      if (wallet?.publicKey) {
        const tokenAccount = (await connection.getTokenLargestAccounts(mintAddress)).value[0].address

        const stakingAccount = await getStakeAccount(
          stakingProgram,
          wallet.publicKey,
          tokenAccount
        )
        setStakingInfo(stakingAccount)
      }
    } catch (e) {
      console.log("Error: This NFT isn't in staking")
    }
  }

  return (
    <div>
      <Head>
        <title>Stake</title>
      </Head>

      {(metadata && nftData && pinkTokenAccount && nftTokenAccount) ?
        <StakeView children={[
          nftData,
          pinkTokenAccount,
          stakingInfo,
          nftTokenAccount,
          metadata,
          getViewInformation
        ]} /> : <p className="text-center m-4">Loading...</p>}

    </div>
  )
}

interface StakeProps {
  mint: string
}

Stake.getInitialProps = ctx => {

  const { mint } = ctx.query

  if (!mint) {
    ctx.res.writeHead(302, { Location: '/my-nfts' });
    ctx.res.end();
  }

  try {
    const _ = new PublicKey(mint)
    return { mint: mint as string }
  } catch {
    ctx.res.writeHead(302, { Location: '/my-nfts' });
    ctx.res.end();
  }
}

export default Stake
