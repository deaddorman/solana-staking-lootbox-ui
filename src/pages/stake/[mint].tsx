import type { NextPage } from "next"
import { useEffect, useState, useMemo } from "react"
import { Program, Idl, AnchorProvider } from "@project-serum/anchor"
import { getAssociatedTokenAddress, getAccount, Account } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js"
import { StakeView } from "../../views"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js"
import { AnchorNftStaking, IDL } from "../../utils/idl/anchor_nft_staking"
import { STAKE_MINT } from '../../utils/constants'
import { getStakeAccount, StakeAccount } from "../../utils/accounts"
import Head from "next/head"

const Stake: NextPage<StakeProps> = ({ mint }) => {

  const [mintAddress, setMintAddress] = useState<PublicKey>()

  const [nftData, setNFTData] = useState<any>(null)
  const [bldTokenAccount, setBldTokenAccount] = useState<Account>()
  const [stakingInfo, setStakingInfo] = useState<any>(null)
  const [nftTokenAccount, setNftTokenAccount] = useState<PublicKey>();
  const [metadata, setMetadata] = useState<any>(null)

  const { connection } = useConnection()
  const wallet = useWallet()

  const provider = new AnchorProvider(connection, wallet, {})

  const stakingProgramId = new PublicKey(IDL.metadata.address);
  const stakingProgram = new Program(IDL, stakingProgramId, provider)

  const metaplex = useMemo(() => {
    return Metaplex.make(connection).use(walletAdapterIdentity(wallet))
  }, [connection, wallet])

  useEffect(() => {
    setMintAddress(new PublicKey(mint))
  }, [])

  useEffect(() => {
    if (mintAddress && wallet) {
      // Step 1 - Get NFT Info
      metaplex
        .nfts()
        .findByMint({ mintAddress: mintAddress })
        .then((nft) => {

          setNFTData(nft)

          // Step 2 - Get Reward Info
          getTokenBLDInfo(nft)

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
  }, [mintAddress, wallet])

  const getNftTokenAccount = (nft) => {
    connection.getTokenLargestAccounts(nft.mint.address)
      .then((accounts) =>
        setNftTokenAccount(accounts.value[0].address)
      );
  }

  const getTokenBLDInfo = (nft) => {

    getAssociatedTokenAddress(STAKE_MINT, wallet.publicKey)
      .then((ata) => {
        return getAccount(connection, ata);
      })
      .then((tokenAccount) => {
        setBldTokenAccount(tokenAccount)
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const getStakingState = async () => {
    try {
      const tokenAccount = (await connection.getTokenLargestAccounts(mintAddress)).value[0].address

      const stakingAccount = await getStakeAccount(
        stakingProgram,
        wallet.publicKey,
        tokenAccount
      )
      setStakingInfo(stakingAccount)

    } catch (e) {
      console.log("Error Getting NFT Staking State:", e)
    }
  }

  return (
    <div>
      <Head>
        <title>Stake</title>
      </Head>

      {(metadata && nftData && bldTokenAccount && stakingInfo && nftTokenAccount) ?
        <StakeView children={[
          nftData,
          bldTokenAccount,
          stakingInfo,
          nftTokenAccount,
          metadata,
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
