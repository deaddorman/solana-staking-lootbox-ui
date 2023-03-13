import { BN } from "@project-serum/anchor";
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import {
  getMint, getAccount, createInitializeMintInstruction, createMintToInstruction, createTransferInstruction, createBurnInstruction,
  getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, MINT_SIZE, MintLayout,
  TokenAccountNotFoundError, TokenInvalidAccountOwnerError
} from '@solana/spl-token';
import { WalletContextState } from "@solana/wallet-adapter-react";

export async function getStakeAccount(
  program: any,
  user: PublicKey,
  tokenAccount: PublicKey
): Promise<StakeAccount> {
  const [pda] = PublicKey.findProgramAddressSync(
    [user.toBuffer(), tokenAccount.toBuffer()],
    program.programId
  );
  const account = await program.account.userStakeInfo.fetch(pda);
  return new StakeAccount(account);
}

export class StakeAccount {

  tokenAccount: PublicKey;
  stakeStartTime: BN;
  lastStakeRedeem: BN;
  stakeState: { staked: boolean; unstaked: boolean };
  isInitialized: boolean;

  constructor(params: {
    tokenAccount: PublicKey;
    stakeStartTime: BN;
    lastStakeRedeem: BN;
    stakeState: { staked: boolean; unstaked: boolean };
    isInitialized: boolean;
  }) {
    this.tokenAccount = params.tokenAccount;
    this.stakeStartTime = params.stakeStartTime;
    this.lastStakeRedeem = params.lastStakeRedeem;
    this.stakeState = params.stakeState;
    this.isInitialized = params.isInitialized;
  }

  daysStaked(): number {
    const seconds = new BN(Date.now() / 1000)
      .sub(this.stakeStartTime)
      .toNumber();

    return seconds / (24 * 60 * 60);
  }

  claimable(): number {
    const seconds = new BN(Date.now() / 1000)
      .sub(this.lastStakeRedeem)
      .toNumber();

    return 10 * (seconds / (24 * 60 * 60));
  }
}

export async function getOrCreateATA(
  wallet: WalletContextState,
  connection: Connection,
  payerPublicKey: PublicKey,
  mint: PublicKey,
  owner: PublicKey
) {

  // ATA = Associated Token Address
  const ATA = await getAssociatedTokenAddress(mint, owner, true, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);

  let account;

  try {
    account = await getAccount(connection, ATA, 'confirmed', TOKEN_PROGRAM_ID);
  }
  catch (error) {
    if (error instanceof TokenAccountNotFoundError || error instanceof TokenInvalidAccountOwnerError) {
      try {
        const transaction = new Transaction().add(
          createAssociatedTokenAccountInstruction(
            payerPublicKey,
            ATA,
            owner,
            mint,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID,
          )
        );

        const latestBlockHash = await connection.getLatestBlockhash();
        transaction.recentBlockhash = latestBlockHash.blockhash;
        transaction.lastValidBlockHeight = latestBlockHash.lastValidBlockHeight;

        transaction.feePayer = payerPublicKey;

        const transactionSigned = await wallet.signTransaction(transaction);
        await connection.sendRawTransaction(transactionSigned.serialize());

        // Recargo página por que la app no espera a que el ATA exista y fallan otras request a Solana
        window.location.reload()
      }
      catch (error) {}
      account = await getAccount(connection, ATA, 'confirmed', TOKEN_PROGRAM_ID);
    }
    else {
      throw error;
    }
  }


  return account;
}
