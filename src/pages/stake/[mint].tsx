import type { NextPage } from "next"
import { useEffect, useState, useMemo } from "react"
import { PublicKey } from "@solana/web3.js"
import { StakeView } from "../../views"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js"
import Head from "next/head"

const Stake: NextPage<StakeProps> = ({ mint }) => {

  // 5vrphUhxM9R6H4sGDKZWP2d91k1djNfjSsGVPLHHYJNS

  const [mintAddress, setMintAddress] = useState<PublicKey>()
  const [metadata, setMetadata] = useState<any>(null)

  const { connection } = useConnection()
  const wallet = useWallet()

  const metaplex = useMemo(() => {
    return Metaplex.make(connection).use(walletAdapterIdentity(wallet))
  }, [connection, wallet])

  useEffect(() => {
    console.log('mint', mint)
    setMintAddress(new PublicKey(mint))
  }, [])

  useEffect(() => {
    if (mintAddress) {
      metaplex
        .nfts()
        .findByMint({ mintAddress: mintAddress })
        .then((nft) => {

          console.log('nft', nft)

          fetch(nft.uri)
            .then((res) => res.json())
            .then((m) => {
              setMetadata(m)
            })
        })
    }
  }, [mintAddress])

  return (
    <div>
      <Head>
        <title>Stake</title>
      </Head>

      {metadata ? <StakeView children={metadata} /> : <p className="text-center m-4">Loading...</p>}

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
