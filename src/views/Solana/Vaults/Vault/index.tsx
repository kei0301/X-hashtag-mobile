import React, { useState, useCallback, useEffect } from "react";
import { Grid, InputAdornment, OutlinedInput, Zoom, Slider, Fade, Backdrop } from "@material-ui/core";
import {
    PublicKey,
    Transaction,
    TransactionInstruction,
    SystemProgram,
    LAMPORTS_PER_SOL,
    SYSVAR_CLOCK_PUBKEY
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";
import { Program, Provider, BN, Idl, Instruction } from '@project-serum/anchor';
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
    getPoolId,
    getPoolSigner,
    getProgramId,
    getStakeTokenId,
    getStakeUserId
} from "../../../../constants/solana"
import { useSelector, useDispatch } from "react-redux";
import { IPendingTxn, isPendingTxn, txnButtonText } from "../../../../store/slices/pending-txns-slice";
import { messages } from "../../../../constants/messages";
import { IReduxState } from "../../../../store/slices/state.interface";
import { trim } from "../../../../helpers";
import { success, warning } from "../../../../store/slices/messages-slice";
import VaultHeader from "./VaultHeader";
import VaultRow from "../VaultRow";
import "../../../Vaults/Vault/vault.scss";
import idl from '../../../../assets/json/idl.json';

interface IVaultProps {
    vault: any;
}
function Vault({ vault }: IVaultProps) {
    console.log(vault)
    const dispatch = useDispatch();
    const [amount, setAmount] = useState(0);
    const [withdrawAmount, setWithdrawAmount] = useState(0);
    const { connection } = useConnection();

    const { signTransaction } = useWallet();
    const wallet = useWallet();

    const opts = {
        preflightCommitment: "processed"
    }

    const provider = new Provider(
        //@ts-ignore
        connection, wallet, opts.preflightCommitment,
    );
    async function getTokenBalance(pubkey: PublicKey) {
        if (!wallet.publicKey) {
            return 0;
        }

        const tokens = await provider.connection.getTokenAccountsByOwner(wallet.publicKey, { mint: pubkey });
        if (tokens.value.length == 0) {
            return 0;
        }
        const token = tokens.value[0];
        let balance = 0;
        if (token) {
            const val = (await provider.connection.getTokenAccountBalance(token.pubkey)).value;
            console.log(val)
            balance = val.uiAmount || 0;
        }

        return parseFloat(balance.toFixed(6));
    }

    async function getStakedBalance() {
        if (wallet.publicKey === null) {
            return 0;
        }

        const program = new Program(idl as Idl, getProgramId(), provider);

        const [userPubkey] = await getStakeUserId(wallet.publicKey);

        try {
            const accountData = await program.account.user.fetch(userPubkey);
            if (accountData.totalStaked) {
                const totalUserStaked = (accountData.totalStaked.toNumber() / LAMPORTS_PER_SOL);
                setTotalUserStakedBalance(totalUserStaked);
            }

            return parseFloat((accountData.balanceStaked.toNumber() / LAMPORTS_PER_SOL).toFixed(6));
        } catch (e: any) {
            console.log(e.message)
            return 0;
        }

    }

    async function getTotalStakedBalance() {
        const program = new Program(idl as Idl, getProgramId(), provider);

        let poolObject = await program.account.pool.fetch(getPoolId());
        console.log(poolObject.rewardAVault.toBase58())
        const balance = (await connection.getTokenAccountBalance(poolObject.stakingVault))?.value?.uiAmount?.toFixed(6);
        if (balance) {
            return parseFloat(balance);
        } else {
            return 0;
        }
    }

    async function createStakeAccount() {
        const program = new Program(idl as Idl, getProgramId(), provider);
        if (wallet.publicKey) {
            const [
                userPubkey, userNonce,
            ] = await getStakeUserId(wallet.publicKey);

            try {
                return await program.instruction.createUser(userNonce, {
                    accounts: {
                        pool: getPoolId(),
                        user: userPubkey,
                        owner: wallet.publicKey,
                        systemProgram: SystemProgram.programId,
                    },
                });
            } catch (e: any) {
                if (e.message == 'failed to send transaction: Transaction simulation failed: Attempt to debit an account but found no record of a prior credit.') {
                    alert("You need to charge at least 0.00001 sol");
                    return false;
                }
            }
        }
    }

    async function stake() {
        if (isNaN(amount) || amount === 0) {
            dispatch(warning({ text: messages.before_stake }));
            return;
        }

        const maxAmount = await getTokenBalance(new PublicKey(vault.mint));
        if (amount > maxAmount) {
            dispatch(warning({ text: messages.your_balance_not_enough }));
            return;
        }

        const program = new Program(idl as Idl, getProgramId(), provider);
        let poolObject = await program.account.pool.fetch(getPoolId());

        const [poolSigner] = await getPoolSigner();
        if (wallet.publicKey) {
            const [userPubkey] = await getStakeUserId(wallet.publicKey);
            let instructions = [];
            try {
                await program.account.user.fetch(userPubkey);
            } catch (e: any) {
                if (e.message == 'Account does not exist ' + userPubkey.toBase58()) {
                    const createUserInstruction = await createStakeAccount();
                    if (createUserInstruction === false) {
                        return;
                    }

                    instructions.push(createUserInstruction);
                }
            }

            try {
                const stakingMintObject = new Token(
                    provider.connection,
                    new PublicKey(vault.mint),
                    TOKEN_PROGRAM_ID,
                    // @ts-ignore
                    provider.wallet.payer);
                const stakingAccountInfo = await stakingMintObject.getOrCreateAssociatedAccountInfo(wallet.publicKey);
                const stakingPubkey = stakingAccountInfo.address;

                instructions.push(
                    await program.instruction.stake(
                        new BN(amount * LAMPORTS_PER_SOL),
                        {
                            accounts: {
                                // Stake instance.
                                pool: getPoolId(),
                                stakingVault: poolObject.stakingVault,
                                // User.
                                user: userPubkey,
                                owner: wallet.publicKey,
                                stakeFromAccount: stakingPubkey,
                                // Program signers.
                                poolSigner,
                                // Misc.
                                clock: SYSVAR_CLOCK_PUBKEY,
                                tokenProgram: TOKEN_PROGRAM_ID,
                            },
                        }
                    )
                );

                // @ts-ignore
                const result = await sendConfirmTransaciton(instructions);
                if (result === false) {
                    alert("Something went wrong! Try again");
                } else {
                    alert("Successfully staked. Transaction ID: " + result);
                }
            } catch (err) {
                console.log("Transaction error: ", err);
            }
        }
    }

    async function sendConfirmTransaciton(instructions: TransactionInstruction[]) {
        if (wallet.publicKey === null) {
            return;
        }
        try {
            const transaction = new Transaction().add(...instructions);
            const blockHash = await connection.getLatestBlockhash('processed')
            transaction.feePayer = await wallet.publicKey;
            transaction.recentBlockhash = await blockHash.blockhash
            // @ts-ignore
            const signed = await signTransaction(transaction)

            const signature = await connection.sendRawTransaction(signed.serialize())
            const tx = await connection.confirmTransaction(signature)
            return tx;
        } catch (e: any) {
            console.log(e.message)
            return false;
        }
    }

    async function unstake() {
        if (wallet.publicKey === null) {
            dispatch(warning({ text: messages.please_connect_wallet }));
            return;
        }

        let amount = withdrawAmount;
        if (isNaN(amount) || amount === 0) {
            dispatch(warning({ text: messages.before_unstake }));
            return;
        }

        const maxAmount = await getStakedBalance();
        if (amount > maxAmount) {
            dispatch(warning({ text: messages.your_balance_not_enough }));
            return;
        }

        const program = new Program(idl as Idl, getProgramId(), provider);
        let poolObject = await program.account.pool.fetch(getPoolId());

        const [poolSigner] = await getPoolSigner();

        const [userPubkey] = await getStakeUserId(wallet.publicKey);
        try {

            const stakingMintObject = new Token(
                connection,
                new PublicKey(vault.mint),
                TOKEN_PROGRAM_ID,
                // @ts-ignore
                wallet.payer);
            const stakingAccountInfo = await stakingMintObject.getOrCreateAssociatedAccountInfo(wallet.publicKey);
            const stakingPubkey = stakingAccountInfo.address;

            await program.rpc.unstake(
                new BN(amount * LAMPORTS_PER_SOL),
                {
                    accounts: {
                        // Stake instance.
                        pool: getPoolId(),
                        stakingVault: poolObject.stakingVault,
                        // User.
                        user: userPubkey,
                        owner: wallet.publicKey,
                        stakeFromAccount: stakingPubkey,
                        // Program signers.
                        poolSigner,
                        // Misc.
                        clock: SYSVAR_CLOCK_PUBKEY,
                        tokenProgram: TOKEN_PROGRAM_ID,
                    },
                });
        } catch (err) {
            console.log("Transaction error: ", err);
        }
    }

    async function claim() {
        if (wallet.publicKey === null) {
            dispatch(warning({ text: messages.please_connect_wallet }));
            return;
        }
        const program = new Program(idl as Idl, getProgramId(), provider);

        let poolObject = await program.account.pool.fetch(getPoolId());

        const stakingMintObject = new Token(
            provider.connection,
            new PublicKey(vault.mint),
            TOKEN_PROGRAM_ID,
            // @ts-ignore
            provider.wallet.payer);
        const stakingAccountInfo = await stakingMintObject.getOrCreateAssociatedAccountInfo(wallet.publicKey);
        const stakingPubkey = stakingAccountInfo.address;

        const [poolSigner] = await getPoolSigner();

        const [userPubkey] = await getStakeUserId(wallet.publicKey);

        try {
            await program.rpc.claim({
                accounts: {
                    // Stake instance.
                    pool: getPoolId(),
                    stakingVault: poolObject.stakingVault,
                    rewardAVault: poolObject.rewardAVault,
                    rewardBVault: poolObject.rewardBVault,
                    // User.
                    user: userPubkey,
                    owner: provider.wallet.publicKey,
                    rewardAAccount: stakingPubkey,
                    rewardBAccount: stakingPubkey,
                    // Program signers.
                    poolSigner,
                    // Misc.
                    clock: SYSVAR_CLOCK_PUBKEY,
                    tokenProgram: TOKEN_PROGRAM_ID,
                },
            });

            dispatch(success({ text: messages.your_balance_update_soon }));
        } catch (e) {
            console.log(e)
        }

        const stakingTokenMint = new PublicKey(vault.mint);
        return await getTokenBalance(stakingTokenMint);
    }

    const onHandleClaimContract = async () => {
        if (!wallet.publicKey) {
            dispatch(warning({ text: messages.please_connect_wallet }));
            return;
        }
        await claim();
        updateBalances()
    }

    const onHandleStakeContract = async (action: "stake" | "unstake") => {
        if (!wallet.publicKey) {
            dispatch(warning({ text: messages.please_connect_wallet }));
            return;
        }

        if (action === 'stake') {
            await stake();
        } else {
            await unstake();
        }
        dispatch(success({ text: messages.your_balance_update_soon }));
        updateBalances()
        setWithdrawAmount(0);
        setAmount(0);
    }

    const setMax = (action: string) => {
        if (action === "stake") {
            setAmount(walletBalance);
        } else {
            setWithdrawAmount(stakedBalance);
        }
    };

    async function getEarned() {
        const program = new Program(idl as Idl, getProgramId(), provider);
        if (wallet.publicKey === null) {
            // setTimeout(() => {
            //     getEarned();
            // }, 1000)
            return;
        }

        const [userPubkey] = await getStakeUserId(wallet.publicKey);

        try {
            const U64_MAX = new BN("18446744073709551615", 10);
            let poolObject = await program.account.pool.fetch(getPoolId());
            let rewardAPerToken = new BN(poolObject.rewardAPerTokenStored);
            let rewardARate = new BN(poolObject.rewardARate);
            let lastUpdate = poolObject.lastUpdateTime;
            var lastApplicable = Math.min(Math.floor(Date.now() / 1000), poolObject.rewardDurationEnd);
            var elapsed = new BN(lastApplicable - lastUpdate);
            let vaultBalance: any = await connection.getTokenAccountBalance(poolObject.stakingVault);
            vaultBalance = new BN(parseInt(vaultBalance.value.amount));
            var currentARewardPerToken = rewardAPerToken.add(elapsed.mul(rewardARate).mul(U64_MAX).div(vaultBalance));
            const accountData = await program.account.user.fetch(userPubkey);
            let completeA = new BN(accountData.rewardAPerTokenComplete);
            let pendingA = new BN(accountData.rewardAPerTokenPending);
            let balanceStaked = new BN(accountData.balanceStaked);
            var a = balanceStaked.mul(currentARewardPerToken.sub(completeA)).div(U64_MAX).add(pendingA).toNumber();

            setEarned(parseFloat((a / LAMPORTS_PER_SOL).toFixed(6)));
        } catch (e) {
            console.log(e)
        }
    }

    const [walletBalance, setWalletBalance] = useState(0);
    const [stakedBalance, setStakedBalance] = useState(0);
    const [totalUserStakedBalance, setTotalUserStakedBalance] = useState(0);
    const [totalStakedBalance, setTotalStakedBalance] = useState(0);
    const [earned, setEarned] = useState(0);

    const pendingTransactions = useSelector<IReduxState, IPendingTxn[]>(state => {
        return state.pendingTransactions;
    });

    const updateBalances = async () => {
        const balance = await getTotalStakedBalance();
        setTotalStakedBalance(balance);

        const stakedBalance = await getStakedBalance();
        setStakedBalance(stakedBalance);

        const walletBalance = await getTokenBalance(new PublicKey(vault.mint));
        setWalletBalance(walletBalance);
    }

    useEffect(() => {
        if (!wallet.publicKey) {
            dispatch(warning({ text: messages.please_connect_wallet }));
        }
    }, [])

    useEffect(() => {

        updateBalances();

        getEarned();

        return () => {

        }
    }, [wallet])
    if (vault.version === 1) {
        console.log(11111111111111111);
        return (
            <Fade in={true} mountOnEnter unmountOnExit>
                <Grid className="vault-view">
                    <Backdrop open={true}>
                        <Fade in={true}>
                            <div className="vault-card">
                                <VaultHeader />
                                <VaultRow balance={walletBalance} staked={stakedBalance} totalStaked={totalStakedBalance} vault={vault} />
                                <div className="vault-card-action-area">
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={6}>
                                            <div className="vault-card-action-area-inp-wrap">
                                                <p className="vault-card-action-area-inp-wrap-title">Balance: {trim(Number(walletBalance), 3)}</p>
                                                <div className="vertical-border-wrapper">
                                                    <div className="top-border-div"></div>
                                                </div>
                                                <div className="left-border-div"></div>
                                                <div className="right-border-div"></div>
                                                <OutlinedInput
                                                    type="number"
                                                    placeholder="Amount"
                                                    className="vault-card-action-input"
                                                    value={amount}
                                                    onChange={e => setAmount(parseFloat(e.target.value))}
                                                    labelWidth={0}
                                                    endAdornment={
                                                        <InputAdornment position="end">
                                                            <div onClick={() => setMax('stake')} className="stake-card-action-input-btn">
                                                                <p>Max</p>
                                                            </div>
                                                        </InputAdornment>
                                                    }
                                                />
                                                <div className="vertical-border-wrapper">
                                                    <div className="bottom-border-div"></div>
                                                </div>
                                            </div>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <div className="vault-card-action-area-inp-wrap">
                                                <div className="vault-card-action-area-inp-wrap-title-div">
                                                    <p className="vault-card-action-area-inp-wrap-title">Deposited: {stakedBalance}</p>
                                                    <p className="vault-card-action-area-inp-wrap-title">Earned: {earned}</p>
                                                </div>
                                                <div className="vertical-border-wrapper">
                                                    <div className="top-border-div"></div>
                                                </div>
                                                <div className="left-border-div"></div>
                                                <div className="right-border-div"></div>
                                                <OutlinedInput
                                                    type="number"
                                                    placeholder="Amount"
                                                    className="vault-card-action-input"
                                                    value={withdrawAmount}
                                                    onChange={e => setWithdrawAmount(parseFloat(e.target.value))}
                                                    labelWidth={0}
                                                    endAdornment={
                                                        <InputAdornment position="end">
                                                            <div onClick={() => setMax('unstake')} className="stake-card-action-input-btn">
                                                                <p>Max</p>
                                                            </div>
                                                        </InputAdornment>
                                                    }
                                                />
                                                <div className="vertical-border-wrapper">
                                                    <div className="bottom-border-div"></div>
                                                </div>
                                            </div>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <div className="vault-percent-slider-wrap">
                                                <Slider className="vault-percent-slider" min={0} max={walletBalance} value={amount} onChange={(e, newValue: any) => setAmount(parseFloat(newValue))} />
                                                <div className="divided-percent">
                                                    <span className="vault-percent-slider-wrap-title" onClick={(e) => setAmount(0)}>0%</span>
                                                    <span className="vault-percent-slider-wrap-title" onClick={(e) => setAmount(walletBalance * 0.25)}>25%</span>
                                                    <span className="vault-percent-slider-wrap-title" onClick={(e) => setAmount(walletBalance * 0.5)}>50%</span>
                                                    <span className="vault-percent-slider-wrap-title" onClick={(e) => setAmount(walletBalance * 0.75)}>75%</span>
                                                    <span className="vault-percent-slider-wrap-title end" onClick={(e) => setAmount(walletBalance)}>100%</span>
                                                </div>
                                            </div>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <div className="vault-percent-slider-wrap">
                                                <Slider className="vault-percent-slider" min={0} max={stakedBalance} value={withdrawAmount} onChange={(e, newValue: any) => setWithdrawAmount(parseFloat(newValue))} />
                                                <div className="divided-percent">
                                                    <span className="vault-percent-slider-wrap-title" onClick={(e) => setWithdrawAmount(0)}>0%</span>
                                                    <span className="vault-percent-slider-wrap-title" onClick={(e) => setWithdrawAmount(stakedBalance * 0.25)}>25%</span>
                                                    <span className="vault-percent-slider-wrap-title" onClick={(e) => setWithdrawAmount(stakedBalance * 0.5)}>50%</span>
                                                    <span className="vault-percent-slider-wrap-title" onClick={(e) => setWithdrawAmount(stakedBalance * 0.75)}>75%</span>
                                                    <span className="vault-percent-slider-wrap-title end" onClick={(e) => setWithdrawAmount(stakedBalance)}>100%</span>
                                                </div>
                                            </div>
                                        </Grid>
                                        <Grid item xs={12} sm={6} className="deposit-btn-wrapper">
                                            {
                                                (<div
                                                    className="vault-modal-btn deposit"
                                                    onClick={() => {
                                                        if (isPendingTxn(pendingTransactions, "deposit")) return;
                                                        onHandleStakeContract("stake");
                                                    }}
                                                >
                                                    <p>{txnButtonText(pendingTransactions, "deposit", "Deposit")}</p>
                                                </div>)
                                            }
                                        </Grid>
                                        <Grid item xs={12} sm={6} className="withdraw-btn-wrapper">
                                            <div
                                                className="vault-modal-btn withdraw"
                                                onClick={() => {
                                                    if (isPendingTxn(pendingTransactions, "approve_withdraw")) return;
                                                    onHandleStakeContract("unstake");
                                                }}
                                            >
                                                <p>{txnButtonText(pendingTransactions, "approve_withdraw", "Withdraw")}</p>
                                            </div>
                                            <div
                                                className="vault-modal-btn withdraw"
                                                onClick={() => {
                                                    if (isPendingTxn(pendingTransactions, "claim")) return;
                                                    onHandleClaimContract();
                                                }}
                                            >
                                                <p>{txnButtonText(pendingTransactions, "claim", "Claim")}</p>
                                            </div>
                                        </Grid>
                                        {/* <Grid item xs={12} sm={6} className="deposit-explain">
                                            <p>Deposit fee: 0%, Withdraw fee: 0.05%</p>
                                            <p>You will receive X token as a receipt for your deposited BIFI assets. This token is needed to withdraw your BIFI, do not trade or transfer mooBIFI to strangers!</p>
                                        </Grid> */}
                                        {/* <Grid item xs={12} sm={6} className="withdraw-explain">
                                            <p>Withdraw will result in:</p>
                                            <p>1. Redeem mooBIFI token for BIFI</p>
                                        </Grid> */}
                                    </Grid>
                                </div>
                            </div>
                        </Fade>
                    </Backdrop>
                </Grid>
            </Fade>
        );
    } else {
        console.log(222222222222222);
        return (
            <Fade in={true} mountOnEnter unmountOnExit>
                <Grid className="vault-view">
                    <Backdrop open={true}>
                        <Fade in={true}>
                            <div className="vault-card">
                                <VaultHeader />
                                <VaultRow
                                    balance={walletBalance}
                                    staked={stakedBalance}
                                    totalStaked={totalStakedBalance}
                                    vault={vault}
                                />
                                <div className="vault-card-action-area">
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={6}>
                                            <div className="vault-card-action-area-inp-wrap">

                                                <p className="vault-card-action-area-inp-wrap-title">Balance: ${trim(Number(walletBalance), 3)}</p>
                                                {/* <div style={{height: "50px"}}></div> */}
                                                <div style={{ paddingTop: "10px" }}>
                                                    <div className="vertical-border-wrapper">
                                                        <div className="top-border-div"></div>
                                                    </div>
                                                    <div className="left-border-div-new"></div>
                                                    <div className="right-border-div-new"></div>
                                                    <OutlinedInput
                                                        type="number"
                                                        placeholder="Amount"
                                                        className="vault-card-action-input"
                                                        value={amount}
                                                        onChange={e => setAmount(parseFloat(e.target.value))}
                                                        labelWidth={0}
                                                        endAdornment={
                                                            <InputAdornment position="end">
                                                                <div onClick={() => setMax('stake')} className="stake-card-action-input-btn">
                                                                    <p>Max</p>
                                                                </div>
                                                            </InputAdornment>
                                                        }
                                                    />
                                                    <div className="vertical-border-wrapper">
                                                        <div className="bottom-border-div"></div>
                                                    </div>
                                                </div>

                                            </div>
                                            <Grid item xs={12} sm={12} style={{ paddingTop: "10px", paddingBottom: "20px" }}>
                                                <div className="vault-percent-slider-wrap">
                                                    <Slider className="vault-percent-slider" min={0} max={walletBalance} value={amount} onChange={(e, newValue: any) => setAmount(parseFloat(newValue))} />
                                                    <div className="divided-percent">
                                                        <span className="vault-percent-slider-wrap-title" onClick={(e) => setAmount(0)}>0%</span>
                                                        <span className="vault-percent-slider-wrap-title" onClick={(e) => setAmount(walletBalance * 0.25)}>25%</span>
                                                        <span className="vault-percent-slider-wrap-title" onClick={(e) => setAmount(walletBalance * 0.5)}>50%</span>
                                                        <span className="vault-percent-slider-wrap-title" onClick={(e) => setAmount(walletBalance * 0.75)}>75%</span>
                                                        <span className="vault-percent-slider-wrap-title end" onClick={(e) => setAmount(walletBalance)}>100%</span>
                                                    </div>
                                                </div>

                                            </Grid>
                                            <Grid item xs={12} sm={12} className="deposit-btn-wrapper">
                                                {
                                                    (<div
                                                        className="vault-modal-btn deposit"
                                                        onClick={() => {
                                                            if (isPendingTxn(pendingTransactions, "deposit")) return;
                                                            onHandleStakeContract("stake");
                                                        }}
                                                    >
                                                        <p>{txnButtonText(pendingTransactions, "deposit", "Deposit")}</p>
                                                    </div>)
                                                }
                                            </Grid>
                                        </Grid>

                                        {/* Text */}
                                        <Grid item xs={12} sm={6}>
                                            <div className="vault-card-action-area-inp-wrap" >
                                                <div className="vault-card-action-area-inp-wrap-title-div">
                                                    <div className="vault-card-action-area-inp-wrap-title-new">
                                                        <p className="vault-card-action-area-inp-wrap-title">Total Deposited:</p>
                                                        <p className="vault-card-action-area-inp-wrap-title">${trim(Number(totalUserStakedBalance), 3)}</p>


                                                    </div>
                                                    <div className="vault-card-action-area-inp-wrap-title-new" style={{ paddingRight: "10px" }}>
                                                        <p className="vault-card-action-area-inp-wrap-title">Current Deposit: </p>
                                                        <p className="vault-card-action-area-inp-wrap-title">${trim(Number(stakedBalance), 3)}</p>
                                                    </div>

                                                </div>

                                                <div className="vault-card-action-area-inp-wrap-title-div">
                                                    <div className="vault-card-action-area-inp-wrap-title-new">
                                                        <p className="vault-card-action-area-inp-wrap-title">Available to Claim:</p>
                                                        <p className="vault-card-action-area-inp-wrap-title">${trim(Number(earned), 3)}</p>
                                                    </div>

                                                </div>
                                            </div>
                                            {/* Claim button */}
                                            <Grid item xs={12} sm={12} className="deposit-btn-wrapper">
                                                <div
                                                    className="vault-modal-btn deposit"
                                                    onClick={() => {
                                                        if (isPendingTxn(pendingTransactions, "claim")) return;
                                                        onHandleClaimContract();
                                                    }}
                                                >
                                                    <p>{txnButtonText(pendingTransactions, "claim", "Claim")}</p>
                                                </div>
                                            </Grid>
                                        </Grid>


                                        {/* <Grid item xs={12} sm={6} className="deposit-explain">
                                            <p>Deposit fee: 0%, Withdraw fee: 0.05%</p>
                                        </Grid> */}
                                        {/* <Grid item xs={12} sm={6} className="withdraw-explain">
                                            <p>Withdraw will result in:</p>
                                        </Grid> */}
                                    </Grid>
                                    <div className="withdraw-explain">
                                        <p>*Staked tokens and earnings can be linearly claimed over the vault duration</p>
                                    </div>
                                </div>

                            </div>
                        </Fade>
                    </Backdrop>
                </Grid>
            </Fade>
        );
    }
}

export default Vault;
