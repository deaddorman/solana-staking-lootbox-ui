import type { NextPage } from "next"
import Router from 'next/router'
import { useRouter } from 'next/router'
import { useEffect } from "react"
import { PublicKey } from "@solana/web3.js"
import { StakeView } from "../../views"
import Head from "next/head"

const Stake: NextPage<StakeProps> = ({ mintAddress }) => {

  // 5vrphUhxM9R6H4sGDKZWP2d91k1djNfjSsGVPLHHYJNS

  setTimeout(() => {
    console.log('mintAddress', mintAddress)

  }, 1000)


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
  mintAddress: string
}

Stake.getInitialProps = ctx => {

  const { stake } = ctx.query

  if (!stake) {
    ctx.res.writeHead(302, { Location: '/display' });
    ctx.res.end();
  }

  try {
    const _ = new PublicKey(stake)
    return { mintAddress: stake as string }
  } catch {
    ctx.res.writeHead(302, { Location: '/display' });
    ctx.res.end();
  }
}

export default Stake
