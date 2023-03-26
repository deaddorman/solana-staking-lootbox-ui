import { Program, AnchorProvider } from "@project-serum/anchor"
import { useConnection, useWallet, WalletContextState } from "@solana/wallet-adapter-react"
import { Connection, PublicKey, Transaction } from "@solana/web3.js"
import { MouseEventHandler, useCallback, useEffect, useState } from "react"
import { SendTransactionOptions } from "@solana/wallet-adapter-base"
import { getAssociatedTokenAddress, Account } from "@solana/spl-token"
import { SwitchboardProgram, loadSwitchboardProgram, AnchorWallet } from "@switchboard-xyz/switchboard-v2"
import { LOOTBOX_PROGRAM_ID, STAKE_PROGRAM_ID } from "../utils/constants"
import { StakeAccount } from "../utils/accounts"
import { createInitSwitchboardInstructions, createOpenLootboxInstructions } from "../utils/lootbox-instructions"
import { SolanaNftStaking, IDL as STAKING_IDL } from "../utils/idl/solana_nft_staking"
import { LootboxProgram, IDL as LOOTBOX_IDL } from "../utils/idl/lootbox_program"

export const Lootbox = ({
  stakeAccount,
  nftTokenAccount,
  pinkTokenAccount,
  fetchUpstreamState,
}: {
  stakeAccount?: StakeAccount
  nftTokenAccount: PublicKey
  pinkTokenAccount: Account
  fetchUpstreamState: () => void
}) => {

  // States
  const [isConfirmingTransaction, setIsConfirmingTransaction] = useState(false)
  const [availableLootbox, setAvailableLootbox] = useState(0)
  const [userAccountExists, setUserAccountExist] = useState(false)
  const [mint, setMint] = useState<PublicKey>()

  /* const { switchboardProgram } = useWorkspace() */

  // Wallet conexion
  const { connection } = useConnection()
  const walletAdapter = useWallet()
  const provider = new AnchorProvider(connection, walletAdapter, {})

  // Staking program conexion
  const stakingProgramId = STAKE_PROGRAM_ID;
  const stakingProgram = new Program(STAKING_IDL, stakingProgramId, provider)

  // Lootbox program conexion
  const lootboxProgramId = STAKE_PROGRAM_ID;
  const lootboxProgram = new Program(LOOTBOX_IDL, lootboxProgramId, provider)

  // Switchboard setup
  const [switchboardProgram, setProgramSwitchboard] = useState<any>()


  useEffect(() => {
    setupSwitchboard().then((result) => {
      setProgramSwitchboard(result)
      console.log("result", result)
    })
  }, [connection])

  useEffect(() => {
    if (!walletAdapter.publicKey || !lootboxProgram || !stakingProgram) return
    handleStateRefresh(lootboxProgram, walletAdapter.publicKey)
  }, [walletAdapter, lootboxProgram])


  async function setupSwitchboard() {
    let response = await loadSwitchboardProgram(
      "devnet",
      connection,
      ((provider as AnchorProvider).wallet as AnchorWallet).payer
    )
    return response
  }

  const handleOpenLootbox: MouseEventHandler<HTMLButtonElement> = useCallback(
    async (event) => {

      console.log('handleOpenLootbox')

      if (
        event.defaultPrevented ||
        !walletAdapter.publicKey ||
        !lootboxProgram ||
        !switchboardProgram ||
        !stakingProgram
      )
        return

      openLootbox(
        connection,
        userAccountExists,
        walletAdapter.publicKey,
        lootboxProgram,
        switchboardProgram,
        stakingProgram
      )
    },
    [
      lootboxProgram,
      connection,
      walletAdapter,
      userAccountExists,
      walletAdapter,
      switchboardProgram,
      stakingProgram,
    ]
  )

  const handleRedeemLoot: MouseEventHandler<HTMLButtonElement> = useCallback(
    async (event) => {
      if (
        event.defaultPrevented ||
        !walletAdapter.publicKey ||
        !lootboxProgram ||
        !mint
      )
        return


      console.log('handleRedeemLoot')

      const userSongAta = await getAssociatedTokenAddress(
        mint,
        walletAdapter.publicKey
      )


      const transaction = new Transaction()
      transaction.add(
        await lootboxProgram.methods
          .retrieveItemFromLootbox()
          .accounts({
            mint: mint,
            userSongAta: userSongAta,
          })
          .instruction()
      )

      sendAndConfirmTransaction(connection, walletAdapter, transaction)
    },
    [walletAdapter, lootboxProgram, mint]
  )

  // check if UserState account exists
  // if UserState account exists also check if there is a redeemable item from lootbox
  const checkUserAccount = async (
    lootboxProgram: Program<LootboxProgram>,
    publicKey: PublicKey
  ) => {
    try {
      const [userStatePda] = PublicKey.findProgramAddressSync(
        [publicKey.toBytes()],
        lootboxProgram.programId
      )
      const account = await lootboxProgram.account.userState.fetch(userStatePda)
      if (account) {
        setUserAccountExist(true)
      } else {
        setMint(undefined)
        setUserAccountExist(false)
      }
    } catch {}
  }

  const fetchLootboxPointer = async (
    lootboxProgram: Program<LootboxProgram>,
    publicKey: PublicKey
  ) => {
    try {
      const [lootboxPointerPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("lootbox"), publicKey.toBytes()],
        LOOTBOX_PROGRAM_ID
      )

      const lootboxPointer = await lootboxProgram.account.lootboxPointer.fetch(
        lootboxPointerPda
      )

      setAvailableLootbox(lootboxPointer.availableLootbox.toNumber())
      setMint(lootboxPointer.redeemable ? lootboxPointer.mint : undefined)
    } catch (error) {
      console.log(error)
      setAvailableLootbox(10)
      setMint(undefined)
    }
  }

  const handleStateRefresh = async (
    lootboxProgram: Program<LootboxProgram>,
    publicKey: PublicKey
  ) => {
    checkUserAccount(lootboxProgram, publicKey)
    fetchLootboxPointer(lootboxProgram, publicKey)
  }

  const openLootbox = async (
    connection: Connection,
    userAccountExists: boolean,
    publicKey: PublicKey,
    lootboxProgram: Program<LootboxProgram>,
    switchboardProgram: SwitchboardProgram,
    stakingProgram: Program<SolanaNftStaking>
  ) => {

    console.log('openLootbox', openLootbox)

    if (!userAccountExists) {
      const { instructions, vrfKeypair } =
        await createInitSwitchboardInstructions(
          switchboardProgram,
          lootboxProgram,
          publicKey
        )

      console.log(instructions, vrfKeypair)

      const transaction = new Transaction()
      transaction.add(...instructions)
      sendAndConfirmTransaction(connection, walletAdapter, transaction, {
        signers: [vrfKeypair],
      })
    } else {
      const instructions = await createOpenLootboxInstructions(
        connection,
        stakingProgram,
        switchboardProgram,
        lootboxProgram,
        publicKey,
        nftTokenAccount,
        availableLootbox
      )

      console.log('instructions', instructions)

      const transaction = new Transaction()
      transaction.add(...instructions)
      try {
        await sendAndConfirmTransaction(connection, walletAdapter, transaction)
        setIsConfirmingTransaction(true)
        const [lootboxPointerPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("lootbox"), publicKey.toBytes()],
          lootboxProgram.programId
        )

        const id = await connection.onAccountChange(
          lootboxPointerPda,
          async (_) => {
            try {
              const account = await lootboxProgram.account.lootboxPointer.fetch(
                lootboxPointerPda
              )
              if (account.redeemable) {
                setMint(account.mint)
                connection.removeAccountChangeListener(id)
                setIsConfirmingTransaction(false)
              }
            } catch (error) {
              console.log("Error in waiter:", error)
            }
          }
        )
      } catch (error) {
        console.log(error)
      }
    }
  }

  const sendAndConfirmTransaction = async (
    connection: Connection,
    walletAdapter: WalletContextState,
    transaction: Transaction,
    options?: SendTransactionOptions
  ) => {
    setIsConfirmingTransaction(true)

    try {
      const signature = await walletAdapter.sendTransaction(
        transaction,
        connection,
        options
      )
      const latestBlockhash = await connection.getLatestBlockhash()
      await connection.confirmTransaction(
        {
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
          signature: signature,
        },
        "finalized"
      )

      console.log("Transaction complete")
      await Promise.all([
        handleStateRefresh(lootboxProgram!, walletAdapter.publicKey!),
        fetchUpstreamState(),
      ])
    } catch (error) {
      console.log(error)
      throw error
    } finally {
      setIsConfirmingTransaction(false)
    }
  }

  return (
    <div>
      {/* {availableLootbox && stakeAccount && stakeAccount.totalEarned &&
        stakeAccount.totalEarned.toNumber() >= availableLootbox ?
      ( */}
      {availableLootbox && stakeAccount &&
        Number(pinkTokenAccount?.amount ?? 0) / Math.pow(10, 2) >= availableLootbox ?
      (
        <button
          onClick={mint ? handleRedeemLoot : handleOpenLootbox}
          className="px-8 btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 btn-90"
        >
          {mint
            ? "Redeem"
            : userAccountExists
            ? `${availableLootbox} $BLD`
            : "Enable"}
        </button>
      ) : (
        <p className="text-2xl p-2">Keep Staking</p>
      )}
    </div>
  )
}
