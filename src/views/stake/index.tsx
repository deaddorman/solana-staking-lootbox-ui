import { FC, useMemo } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { Program, AnchorProvider } from "@project-serum/anchor"
import { PublicKey } from "@solana/web3.js"
import { PROGRAM_ID as METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";
import { getAssociatedTokenAddress, getAccount, Account } from "@solana/spl-token";
import { IDL } from "../../utils/idl/anchor_nft_staking"
import { STAKE_MINT } from "../../utils/constants";

export const StakeView: FC = ({ children }) => {

  const { connection } = useConnection()
  const wallet = useWallet()

  const provider = new AnchorProvider(connection, wallet, {})

  const stakingProgramId = new PublicKey(IDL.metadata.address);
  const stakingProgram = new Program(IDL, stakingProgramId, provider)

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

  const stakeNFT = async () => {
    if (
      !wallet.connected ||
      !wallet.publicKey ||
      !nftTokenAccount ||
      !stakingProgram
    ) {
      alert("Please connect your wallet");
      return;
    }

    await stakingProgram.methods
      .stake()
      .accounts({
        nftTokenAccount: nftTokenAccount,
        nftMint: nftData.mint.address,
        nftEdition: nftData.edition.address,
        metadataProgram: METADATA_PROGRAM_ID,
      })
      .rpc()

    // REFLESH PAGE !!!
  }

  const unstakeNFT = async () => {
    if (
      !wallet.connected ||
      !wallet.publicKey ||
      !nftTokenAccount ||
      !stakingProgram
    ) {
      alert("Please connect your wallet");
      return;
    }

    const userStakeATA = await getAssociatedTokenAddress(
      STAKE_MINT,
      wallet.publicKey
    );

    await stakingProgram.methods
      .unstake()
      .accounts({
        nftTokenAccount: nftTokenAccount,
        nftMint: nftData.mint.address,
        nftEdition: nftData.edition.address,
        metadataProgram: METADATA_PROGRAM_ID,
        stakeMint: STAKE_MINT,
        userStakeAta: userStakeATA,
      })
      .rpc()

    // REFLESH PAGE !!!
  }

  const claimReward = async () => {
    if (
      !wallet.connected ||
      !wallet.publicKey ||
      !nftTokenAccount ||
      !stakingProgram
    ) {
      alert("Please connect your wallet");
      return;
    }

    const userStakeATA = await getAssociatedTokenAddress(
      STAKE_MINT,
      wallet.publicKey
    );

    await stakingProgram.methods
      .redeem()
      .accounts({
        nftTokenAccount: nftTokenAccount,
        stakeMint: STAKE_MINT,
        userStakeAta: userStakeATA,
      })
      .rpc()

    // REFLESH PAGE !!!
  }

  const daysStaked = useMemo(() => {
    return stakingInfo?.daysStaked ? stakingInfo?.daysStaked() : 0 ;
  }, [stakingInfo]);

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
              {stakingInfo?.stakeState?.staked
                ? daysStaked > 0
                  ? `STAKED`
                  : `READY TO STAKE`
                : `READY TO STAKE`
              }
            </div>
          </div>

          <div>
            <div className="stake-box">
              <div className="text-center">
                {stakingInfo?.stakeState?.staked
                  ? daysStaked < 1
                    ? "STAKED LESS THAN 1 DAY"
                    : `STAKED ${daysStaked.toFixed(2)} DAY${Math.floor(daysStaked) === 1 ? "" : "S"
                    }`
                  : "READY TO STAKE"}
              </div>
              <p className="text-4xl font-bold p-2">
                {`${Number(bldTokenAccount?.amount ?? 0) / Math.pow(10, 2)} $BLD`}
              </p>
              <p>
                {stakingInfo?.stakeState?.staked
                  ? `${stakingInfo?.claimable().toPrecision(2)} $BLD earned`
                  : "earn $BLD by staking"
                }
              </p>
            </div>
          </div>

          <div>
            <div className="stake-box">
              <button onClick={
                stakingInfo?.stakeState?.staked ? claimReward : stakeNFT
              } className="px-8 m-2 btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500">
                {stakingInfo?.stakeState?.staked
                  ? "Claim $BLD"
                  : "Stake NFT"
                }
              </button>
              {stakingInfo?.stakeState?.staked ? (
                <button onClick={unstakeNFT} className="px-8 m-2 btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500">
                  Unstake
                </button>
              ) : null}
            </div>
          </div>

          <div>
          </div>

        </div>

        {/* <div className="grid grid-cols-3 p-2">

          <div className="flex flex-row">
            <div className="gear-box">
              GEAR
            </div>
            <div className="gear-box">
              GEAR
            </div>
          </div>

        </div> */}

      </div>
    </div>
  )
}
