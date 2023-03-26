import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import { useEffect, useState } from "react"

export const SongItem = ({
  item,
  balance,
}: {
  item: string
  balance: number
}) => {
  const [metadata, setMetadata] = useState<any>()
  const { connection } = useConnection()
  const walletAdapter = useWallet()

  useEffect(() => {
    const metaplex = Metaplex.make(connection).use(
      walletAdapterIdentity(walletAdapter)
    )

    const mint = new PublicKey(item)

    try {
      metaplex
        .nfts()
        .findByMint({ mintAddress: mint })
        .then((nft) => fetch(nft.uri))
        .then((response) => response.json())
        .then((nftData) => setMetadata(nftData))
    } catch (error) {
      console.log("error getting song token:", error)
    }
  }, [item, connection, walletAdapter])

  return (
    <div>
      <div>
        <img src={metadata?.image ?? ""} alt="song token"></img>
      </div>
      <p className="text-4xl p-2">
        {`x${balance}`}
      </p>
    </div>
  )
}
