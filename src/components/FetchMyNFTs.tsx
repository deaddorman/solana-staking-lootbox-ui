import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js"
import { FC, useEffect, useState } from "react"
import { PublicKey } from "@solana/web3.js"
import { CANDY_MACHINE_ADDRESS, STAKE_MINT } from '../utils/constants';
import Link from "next/link"

export const FetchMyNFTs: FC = () => {

  const [candyMachineAddress, setCandyMachineAddress] = useState(new PublicKey(CANDY_MACHINE_ADDRESS))

  const [nftData, setNftData] = useState(null)

  const { connection } = useConnection()
  const wallet = useWallet()
  const metaplex = Metaplex.make(connection).use(walletAdapterIdentity(wallet))

  const [isLoading, setIsLoading] = useState(true)

  const fetchMyNFTs = async () => {
    if (!wallet.connected) {
      return
    }

    setIsLoading(true)

    // Fetch NFTs for connected wallet
    const allOwnerNFTs = await metaplex
      .nfts()
      .findAllByOwner({ owner: wallet.publicKey })

    const nftsByCollectionId = []
    allOwnerNFTs.forEach((nft: any) => {
      if (nft.collection?.address.toString() == STAKE_MINT.toString())
        nftsByCollectionId.push(nft)
    })

    // Fetch off-chain metadata for each NFT
    let nftData = []
    for (let i = 0; i < nftsByCollectionId.length; i++) {
      let fetchResult = await fetch(nftsByCollectionId[i].uri)
      let nft = await fetchResult.json()
      nftData.push({...nft, ...{ mintAddress: nftsByCollectionId[i].mintAddress.toString() }})
    }

    setNftData(nftData)
    setIsLoading(false)
  }

  // Fetch nfts when connected wallet changes
  useEffect(() => {
    fetchMyNFTs()
  }, [wallet])

  return (
    <div>

      {isLoading && (
        <div>
          Loading NFTs...
        </div>
      )}

      {!isLoading && nftData && (
        <div className="gridNFT">
          {nftData.map((nft) => (
            <Link href={`/stake/${encodeURIComponent(nft.mintAddress)}`}>
              <a>
                <div key={nft.name}>
                  <ul>{nft.name}</ul>
                  <img src={nft.image} />
                </div>
              </a>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
