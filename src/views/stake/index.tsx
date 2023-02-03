import { FC, useMemo } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { Program, AnchorProvider } from "@project-serum/anchor"
import { PublicKey } from "@solana/web3.js"
import { Nft, NftWithToken, Sft, SftWithToken, JsonMetadata } from "@metaplex-foundation/js"
import { PROGRAM_ID as METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";
import { getAssociatedTokenAddress, Account } from "@solana/spl-token";
import { IDL } from "../../utils/idl/anchor_nft_staking"
import { StakeAccount } from "../../utils/accounts";
import { TOKEN_REWARD } from "../../utils/constants";

export const StakeView: FC = ({ children }) => {

  const { connection } = useConnection()
  const wallet = useWallet()

  const provider = new AnchorProvider(connection, wallet, {})

  const stakingProgramId = new PublicKey(IDL.metadata.address);
  const stakingProgram = new Program(IDL, stakingProgramId, provider)

  const nftData: Nft | NftWithToken = children[0]    // Could be Sft | SftWithToken but cause error
  const pinkTokenAccount: Account = children[1]
  const stakingInfo: StakeAccount = children[2]
  const nftTokenAccount: PublicKey = children[3]
  const metadata: JsonMetadata = children[4]

  /* console.log('nftData', nftData)
  console.log('pinkTokenAccount', pinkTokenAccount)
  console.log('stakingInfo', stakingInfo)
  console.log('nftTokenAccount', nftTokenAccount)
  console.log('metadata', metadata) */

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
      TOKEN_REWARD,
      wallet.publicKey
    );

    await stakingProgram.methods
      .unstake()
      .accounts({
        nftTokenAccount: nftTokenAccount,
        nftMint: nftData.mint.address,
        nftEdition: nftData.edition.address,
        metadataProgram: METADATA_PROGRAM_ID,
        stakeMint: TOKEN_REWARD,
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
      TOKEN_REWARD,
      wallet.publicKey
    );

    await stakingProgram.methods
      .redeem()
      .accounts({
        nftTokenAccount: nftTokenAccount,
        stakeMint: TOKEN_REWARD,
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
          Stake your NFT and win $PINK
        </h1>

        <div className="grid lg:grid-cols-3 xs:grid-cols-1 p-2">

          <div className="m-2">
            <h1 className="text-3xl font-bold text-transparent text-center bg-clip-text bg-gradient-to-tr from-[#9945FF] to-[#14F195] mb-2">
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

          <div className="m-2">
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
                {`${Number(pinkTokenAccount?.amount ?? 0) / Math.pow(10, 2)} $PINK`}
              </p>
              <p>
                {stakingInfo?.stakeState?.staked
                  ? `${stakingInfo?.claimable().toFixed(2)} $PINK earned`
                  : "earn $PINK by staking"
                }
              </p>
            </div>
          </div>

          <div className="m-2">
            <div className="stake-box">
              <button
                onClick={ stakingInfo?.stakeState?.staked ? claimReward : stakeNFT }
                className="px-8 btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 btn-90"
              >
                {stakingInfo?.stakeState?.staked
                  ? "Claim $PINK"
                  : "Stake NFT"
                }
              </button>
              {stakingInfo?.stakeState?.staked ? (
                <button
                  onClick={unstakeNFT}
                  className="px-8 btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 btn-90"
                >
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
