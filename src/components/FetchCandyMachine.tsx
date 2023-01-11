import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import { Metaplex, walletAdapterIdentity, CandyMachineV2 } from "@metaplex-foundation/js"
import { FC, useEffect, useState } from "react"
import { CANDY_MACHINE_ADDRESS } from '../utils/constants';
import styles from "../styles/custom.module.css"

export const FetchCandyMachine: FC = () => {

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
  const fetchCandyMachine = async () => {

    setIsLoading(true)

    // Set page to 1 - we wanna be at the first page whenever we fetch a new Candy Machine
    setPage(1)

    // Fetch CandyMachine data
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

  // paging
  const getPage = async (page, perPage) => {
    const pageItems = candyMachineData.items.slice(
      (page - 1) * perPage,
      page * perPage
    )

    // Fetch metadata of NFTs for page
    let nftData = []
    for (let i = 0; i < pageItems.length; i++) {
      let fetchResult = await fetch(pageItems[i].uri)
      let json = await fetchResult.json()
      nftData.push(json)
    }

    // Set state
    setPageItems(nftData)
  }

  // Previous page
  const prev = async () => {
    if (page - 1 < 1) {
      setPage(1)
    } else {
      setPage(page - 1)
    }
  }

  // Next page
  const next = async () => {
    setPage(page + 1)
  }

  // Fetch placeholder candy machine on load
  useEffect(() => {
    fetchCandyMachine()
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
          <div className={styles.gridNFT}>
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
