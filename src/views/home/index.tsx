import { FC, useEffect } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { RequestAirdrop } from "../../components/RequestAirdrop"
import pkg from "../../../package.json"
import useUserSOLBalanceStore from "../../stores/useUserSOLBalanceStore"

export const HomeView: FC = ({}) => {
  const wallet = useWallet()
  const { connection } = useConnection()

  const balance = useUserSOLBalanceStore((s) => s.balance)
  const { getUserSOLBalance } = useUserSOLBalanceStore()

  useEffect(() => {
    if (wallet.publicKey) {
      console.log(wallet.publicKey.toBase58())
      getUserSOLBalance(wallet.publicKey, connection)
    }
  }, [wallet.publicKey, connection, getUserSOLBalance])

  return (
    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <h1 className="text-center text-5xl md:pl-12 font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#9945FF] to-[#14F195]">
          A NFT Pink Floyd Collection
        </h1>
        <div className="max-w-md mx-auto mockup-code bg-primary p-6 my-2">
          <pre data-prefix=">">
            <code className="truncate">Conect your wallet to Solana DevNet</code>
          </pre>
        </div>
        <div className="text-center">
          <RequestAirdrop />
          {wallet && <p>Your SOL Balance: {(balance || 0).toLocaleString()}</p>}
        </div>
      </div>
    </div>
  )
}
