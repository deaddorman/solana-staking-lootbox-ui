import { FC } from "react"

export const StakeView: FC = ({ children }) => {

  const metadata = children as any

  return (
    <div className="md:hero mx-auto p-4">
    <div className="md:hero-content flex flex-col">

      <h1 className="text-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#9945FF] to-[#14F195]">
        Staking NFT
      </h1>

      <div>
        <img src={metadata.image}></img>
      </div>

    </div>
  </div>
  )
}
