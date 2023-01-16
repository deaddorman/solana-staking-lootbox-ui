import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { FC, useEffect, useState } from "react"
import { PublicKey } from "@solana/web3.js"
import { Metaplex, walletAdapterIdentity, CandyMachineV2 } from "@metaplex-foundation/js"
import { CANDY_MACHINE_ADDRESS } from '../utils/constants';

export const FetchCollection: FC = () => {

  const [candyMachineAddress, setCandyMachineAddress] = useState(CANDY_MACHINE_ADDRESS)
  const [candyMachineData, setCandyMachineData] = useState<CandyMachineV2>(null)
  const [pageItems, setPageItems] = useState(null)
  const [page, setPage] = useState(1)

  const walletAdapter = useWallet()
  const { connection } = useConnection()

  const [isLoading, setIsLoading] = useState(true)

  const metaplex = Metaplex.make(connection).use(walletAdapterIdentity(walletAdapter))
  const [isMinting, setIsMinting] = useState(false)

  // Fetch CandyMachine by address
  const fetchCollection = async () => {

    setIsLoading(true)
    setPage(1)

    try {
      const candyMachine = await metaplex
        .candyMachinesV2()
        .findByAddress({ address: new PublicKey(candyMachineAddress) })

      setCandyMachineData(candyMachine)
      setIsLoading(false)
    } catch (e) {
      alert("Please submit a valid CMv2 address.")
      setIsLoading(false)
    }
  }

  const getPage = async (page, perPage) => {
    const pageItems = candyMachineData.items.slice(
      (page - 1) * perPage,
      page * perPage
    )

    const nftData = []
    for (let i = 0; i < pageItems.length; i++) {
      let fetchResult = await fetch(pageItems[i].uri)
      let json = await fetchResult.json()
      nftData.push(json)
    }

    setPageItems(nftData)
  }

  const prev = async () => {
    if (page - 1 < 1) {
      setPage(1)
    } else {
      setPage(page - 1)
    }
  }

  const next = async () => {
    setPage(page + 1)
  }

  // Fetch placeholder candy machine on load
  useEffect(() => {
    fetchCollection()
  }, [])

  // Fetch metadata for NFTs when page or candy machine changes
  useEffect(() => {
    if (!candyMachineData) {
      return
    }
    getPage(page, 9)
  }, [candyMachineData, page])

  // Mint NFTS
  const mintNewNFT = async () => {
    setIsMinting(true)
    const nft = await metaplex.candyMachinesV2().mint({ candyMachine: candyMachineData })
    setIsMinting(false)
  }

  return (
    <div>

      {!isLoading && !isMinting && (
        <button
          className="px-8 m-2 btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ..."
          onClick={mintNewNFT}
        >
          Mint NFT <small>(0.3 SOL)</small>
        </button>
      )}

      {isMinting && (
        <button
          className="px-8 m-2 btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ..."
        >
          Minting NFT...
        </button>
      )}

      {candyMachineData && (
        <div className="flex flex-col items-center justify-center p-5">
          <ul>Candy Machine Address: {candyMachineData.address.toString()}</ul>
        </div>
      )}

      {isLoading && (
        <div>
          Loading NFTs Collection...
        </div>
      )}

      {!isLoading && pageItems && (
        <div>
          <div className="gridNFT">
            {pageItems.map((nft) => (
              <div key={nft.name}>
                <ul>{nft.name}</ul>
                <img src={nft.image} />
              </div>
            ))}
          </div>
          <button
            className="px-8 m-2 btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ..."
            onClick={prev}
          >
            Prev
          </button>
          <button
            className="px-8 m-2 btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ..."
            onClick={next}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
