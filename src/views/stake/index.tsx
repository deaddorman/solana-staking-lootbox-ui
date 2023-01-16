import { FC } from "react"

export const StakeView: FC = ({ children }) => {

  const metadata = children as any

  return (
    <div className="md:hero mx-auto p-4">
    <div className="md:hero-content flex flex-col">

      <h1 className="text-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#9945FF] to-[#14F195]">
        Staking NFT
      </h1>

      <div className="grid grid-cols-4">

        <div>
          {/* <img src={metadata.image} /> */}
          <img className="img-stake" src="https://arweave.net/rbLMGswYi26B-UZeZDFTA0rxB0ic46tWNx955mPueNc?ext=jpg" alt=""/>
          <div className="caption-stake text-center font-bold p-2">
            STAKED
          </div>
        </div>

        <div className="p-2">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Sit, deleniti voluptatum. Ea natus, deleniti commodi praesentium nostrum alias et neque magnam veritatis deserunt consequuntur modi, expedita laudantium delectus? Debitis, blanditiis.
        </div>

        <div className="p-2">
          123
        </div>

        <div className="p-2">
          asd
        </div>

      </div>






    </div>
  </div>
  )
}
