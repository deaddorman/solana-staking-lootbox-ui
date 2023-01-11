import type { NextPage } from "next"
import { useEffect, useState } from "react"
import { PublicKey } from "@solana/web3.js"
import { StakeView } from "../../views"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import Head from "next/head"

const Stake: NextPage<StakeProps> = ({ mint }) => {

  // 5vrphUhxM9R6H4sGDKZWP2d91k1djNfjSsGVPLHHYJNS

  const [mintAddress, setMintAddress] = useState<PublicKey>(null)

  const wallet = useWallet()
  const { connection } = useConnection()


  useEffect(() => {
    setTimeout(() => setMintAddress(new PublicKey(mint)))
  }, [])

  useEffect(() => {
    console.log('mintAddress', mintAddress)
  }, [mintAddress])

  return (
    <div>
      <Head>
        <title>Stake</title>
      </Head>
      <StakeView />
    </div>
  )
}

interface StakeProps {
  mint: string
}

Stake.getInitialProps = ctx => {

  const { mint } = ctx.query

  if (!mint) {
    ctx.res.writeHead(302, { Location: '/display' });
    ctx.res.end();
  }

  try {
    const _ = new PublicKey(mint)
    return { mint: mint as string }
  } catch {
    ctx.res.writeHead(302, { Location: '/display' });
    ctx.res.end();
  }
}

export default Stake
