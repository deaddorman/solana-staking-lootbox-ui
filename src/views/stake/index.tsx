import { FC } from "react"

export const StakeView: FC = ({ children }) => {

  const nftData = children[0]
  const bldTokenAccount = children[1]
  const stakingInfo = children[2]
  const nftTokenAccount = children[3]
  const metadata = children[4]

  console.log('nftData', nftData)
  console.log('bldTokenAccount', bldTokenAccount)
  console.log('stakingInfo', stakingInfo)
  console.log('nftTokenAccount', nftTokenAccount)
  console.log('metadata', metadata)

  return (
    <div className="md:hero mx-auto p-4">
    <div className="md:hero-content flex flex-col">

      <h1 className="text-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#9945FF] to-[#14F195]">
        Staking NFT
      </h1>

      <div className="grid grid-cols-4 p-2">

        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#9945FF] to-[#14F195] mb-2">
            {metadata.name}
          </h1>
          <img src={metadata.image} className="stake-img" alt={metadata.name} />
          <div className="stake-caption text-center font-bold p-2">
            STAKED
          </div>
        </div>

        <div>
          <div className="stake-box">
            <span>KEVIN</span>
            <h4>450 PINK</h4>
            <small>earned</small>
            <button className="px-8 m-2 btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500">
              Claim
            </button>
          </div>
        </div>

        <div>
          <div className="stake-box">
            <span>KEVIN 2</span>
            <h4>450 PINK</h4>
            <small>earned asdasd</small>
            <button className="px-8 m-2 btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500">
              Claim asd
            </button>
          </div>
        </div>

        <div>
        </div>

      </div>

      <div className="grid grid-cols-3 p-2">

        <div className="flex flex-row">
          <div className="gear-box">
            GEAR
          </div>
          <div className="gear-box">
            GEAR
          </div>
        </div>

      </div>

    </div>
  </div>
  )
}
