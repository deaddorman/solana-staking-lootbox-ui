import type { NextPage } from "next"
import Router from 'next/router'
import { useRouter } from 'next/router'
import { useEffect } from "react"
import { PublicKey } from "@solana/web3.js"
import { StakeView } from "../views"
import Head from "next/head"

const Stake: NextPage<StakeProps> = ({ mint }) => {

  // 5vrphUhxM9R6H4sGDKZWP2d91k1djNfjSsGVPLHHYJNS

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

  const { mint  } = ctx.query

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
