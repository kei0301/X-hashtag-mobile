import React, { useState, useCallback, useEffect } from "react";
import { Grid, InputAdornment, OutlinedInput, Zoom, Slider, Fade, Backdrop } from "@material-ui/core";
import { useSelector, useDispatch } from "react-redux";
import { IPendingTxn, isPendingTxn, txnButtonText } from "../../../store/slices/pending-txns-slice";
import { messages } from "../../../constants/messages";
import { handleStakeContract, handleStakeApprovalContract, handleClaimContract } from "../../../store/slices/stake-rewards-thunk";
import { IReduxState } from "../../../store/slices/state.interface";
import { useWeb3Context } from "../../../hooks";
import { trim } from "../../../helpers";
import { warning } from "../../../store/slices/messages-slice";
import VaultHeader from "./VaultHeader";
import VaultRow from "../VaultRow";
import "./vault.scss";
import { IVault } from "src/constants/vaults";
import { ethers } from "ethers";
import { DEFAULT_NETWORK_RPC } from "../../../constants/config";

interface IVaultProps {
    vault: IVault;
}
function Vault({ vault }: IVaultProps) {
    const dispatch = useDispatch();
    const [amount, setAmount] = useState(0);
    const [withdrawAmount, setWithdrawAmount] = useState(0);

    const [balances, setBalances] = useState({
        balance: '',
        staked: '',
        totalStaked: '',
        allownce: 0,
        earned: '',
        totalUserStake: ''
    })

    const { provider, address, connect, chainID, checkWrongNetwork } = useWeb3Context();

    const trimmedBalance = useCallback(() => {
        return parseFloat(trim(Number(balances.balance || 0), 6));
    }, [balances.balance]);
    const trimmedStaked = useCallback(() => {
        return parseFloat(trim(Number(balances.staked || 0), 6));
    }, [balances.staked]);

    let provider1: any;
    let incorrectProvider = false;
    if (provider.connection.url == "Not supported network") {
        console.log("Not connected");
        dispatch(warning({ text: messages.please_connect_wallet }));
        incorrectProvider = true;
        provider1 = new ethers.providers.JsonRpcProvider(DEFAULT_NETWORK_RPC);

    } else {
        provider1 = new ethers.providers.Web3Provider(window.ethereum)

    }

    const getVaultDetails = async () => {
        const balances = {
            totalUserStake: "0",
            balance: "0",
            staked: "0",
            totalStaked: "0",
            allownce: 0,
            earned: "0"
        };
        const tokenContract = new ethers.Contract(vault.TOKEN_ADDRESS, vault.TOKEN_ABI, provider1);
        const tokenDecimals = await tokenContract.decimals();


        if (vault.version == "1") {
            const xtagContract = new ethers.Contract(vault.CONTRACT_ADDRESS, vault.CONTRACT_ABI, provider1);
            if (address) {
                let [totalStaked, staked, balance, allownce, earned] = await Promise.all([
                    xtagContract.totalSupply(),
                    xtagContract.balanceOf(address),
                    tokenContract.balanceOf(address),
                    tokenContract.allowance(address, vault.CONTRACT_ADDRESS),
                    xtagContract.earned(address)
                ])
                balances.balance = ethers.utils.formatUnits(balance, tokenDecimals);
                balances.staked = ethers.utils.formatUnits(staked, tokenDecimals);
                balances.totalStaked = ethers.utils.formatUnits(totalStaked, tokenDecimals);
                balances.allownce = Number(ethers.utils.formatUnits(allownce, tokenDecimals));
                balances.earned = ethers.utils.formatUnits(earned, tokenDecimals);
            }

        } else {
            const vaultContract = new ethers.Contract(vault.VAULT_ADDRESS, vault.VAULT_ABI, provider1);
            if (address) {
                let [totalStaked, staked, balance, allownce, earned, userVaultInfo] = await Promise.all([
                    vaultContract.totalDeposits(),
                    vaultContract.balanceOf(address),
                    tokenContract.balanceOf(address),
                    tokenContract.allowance(address, vault.VAULT_ADDRESS),
                    vaultContract.earned(address),
                    vaultContract.getUserVaultInfo(address)

                ])
                balances.totalUserStake = ethers.utils.formatUnits(userVaultInfo[0][0].toString(), tokenDecimals);
                balances.balance = ethers.utils.formatUnits(balance, tokenDecimals);
                balances.staked = ethers.utils.formatUnits(staked, tokenDecimals);
                balances.totalStaked = ethers.utils.formatUnits(totalStaked, tokenDecimals);
                balances.allownce = Number(ethers.utils.formatUnits(allownce, tokenDecimals));
                balances.earned = ethers.utils.formatUnits(earned, tokenDecimals);
            }
        }


        // const balances = {
        //     balance: ethers.utils.formatEther(balance),
        //     staked: ethers.utils.formatEther(staked),
        //     totalStaked: ethers.utils.formatEther(totalStaked),
        //     allownce
        // };

        console.log("vault(balances)  ----->", balances)

        setBalances(balances);
    }

    const onHandleApproveContract = async () => {
        if (await checkWrongNetwork()) return;
        await dispatch(handleStakeApprovalContract({ vault, address, provider, networkID: chainID }));
        getVaultDetails();
    }

    const onHandleClaimContract = async () => {
        if (await checkWrongNetwork()) return;
        await dispatch(handleClaimContract({ vault, address, provider, networkID: chainID }));
        getVaultDetails();
    }

    const onHandleStakeContract = async (action: "stake" | "unstake") => {
        if (await checkWrongNetwork()) return;
        if (action === "stake" && amount === 0 || action === "unstake" && withdrawAmount === 0) {
            dispatch(warning({ text: action === "stake" ? messages.before_stake : messages.before_unstake }));
        } else {
            await dispatch(handleStakeContract({ vault, action, address, amount: (action === "stake" ? amount : withdrawAmount), decimals: 18, provider, networkID: chainID }));
            setAmount(0);
            setWithdrawAmount(0);
            getVaultDetails();
        }
    }

    const setMax = (action: string) => {
        if (action === "stake") {
            setAmount(trimmedBalance);
        } else {
            setWithdrawAmount(trimmedStaked);
        }
    };

    const pendingTransactions = useSelector<IReduxState, IPendingTxn[]>(state => {
        return state.pendingTransactions;
    });

    const hasAllowance = useCallback(
        () => {
            return balances.allownce > 0;
        },
        [balances.allownce],
    );

    useEffect(() => {
        getVaultDetails();

        return () => {

        };
    }, []);

    if (vault.version == "1") {
        return (
            <Fade in={true} mountOnEnter unmountOnExit>
                <Grid className="vault-view">
                    <Backdrop open={true}>
                        <Fade in={true}>
                            <div className="vault-card">
                                <VaultHeader />
                                <VaultRow
                                    vault={vault}
                                    balance={balances.balance}
                                    staked={balances.staked}
                                    totalStaked={balances.totalStaked}
                                />
                                <div className="vault-card-action-area">
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={6}>
                                            <div className="vault-card-action-area-inp-wrap">
                                                <p className="vault-card-action-area-inp-wrap-title">Balance: ${trim(Number(balances.balance), 2)}</p>
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
                                                    <p className="vault-card-action-area-inp-wrap-title">Deposited: ${trim(Number(balances.staked), 3)}</p>
                                                    <p className="vault-card-action-area-inp-wrap-title">Earned: ${trim(Number(balances.earned), 3)}</p>
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
                                                <Slider className="vault-percent-slider" min={0} max={trimmedBalance()} value={amount} onChange={(e, newValue: any) => setAmount(parseFloat(newValue))} />
                                                <div className="divided-percent">
                                                    <span className="vault-percent-slider-wrap-title" onClick={(e) => setAmount(0)}>0%</span>
                                                    <span className="vault-percent-slider-wrap-title" onClick={(e) => setAmount(trimmedBalance() * 0.25)}>25%</span>
                                                    <span className="vault-percent-slider-wrap-title" onClick={(e) => setAmount(trimmedBalance() * 0.5)}>50%</span>
                                                    <span className="vault-percent-slider-wrap-title" onClick={(e) => setAmount(trimmedBalance() * 0.75)}>75%</span>
                                                    <span className="vault-percent-slider-wrap-title end" onClick={(e) => setAmount(trimmedBalance())}>100%</span>
                                                </div>
                                            </div>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <div className="vault-percent-slider-wrap">
                                                <Slider className="vault-percent-slider" min={0} max={trimmedStaked()} value={withdrawAmount} onChange={(e, newValue: any) => setWithdrawAmount(parseFloat(newValue))} />
                                                <div className="divided-percent">
                                                    <span className="vault-percent-slider-wrap-title" onClick={(e) => setWithdrawAmount(0)}>0%</span>
                                                    <span className="vault-percent-slider-wrap-title" onClick={(e) => setWithdrawAmount(trimmedStaked() * 0.25)}>25%</span>
                                                    <span className="vault-percent-slider-wrap-title" onClick={(e) => setWithdrawAmount(trimmedStaked() * 0.5)}>50%</span>
                                                    <span className="vault-percent-slider-wrap-title" onClick={(e) => setWithdrawAmount(trimmedStaked() * 0.75)}>75%</span>
                                                    <span className="vault-percent-slider-wrap-title end" onClick={(e) => setWithdrawAmount(trimmedStaked())}>100%</span>
                                                </div>
                                            </div>
                                        </Grid>
                                        <Grid item xs={12} sm={6} className="deposit-btn-wrapper">
                                            {
                                                address && hasAllowance() ? (<div
                                                    className="vault-modal-btn deposit"
                                                    onClick={() => {
                                                        if (isPendingTxn(pendingTransactions, "deposit")) return;
                                                        onHandleStakeContract("stake");
                                                    }}
                                                >
                                                    <p>{txnButtonText(pendingTransactions, "deposit", "Deposit")}</p>
                                                </div>) : (<div
                                                    className="vault-modal-btn deposit"
                                                    onClick={() => {
                                                        if (isPendingTxn(pendingTransactions, "approve_deposit")) return;
                                                        onHandleApproveContract();
                                                    }}
                                                >
                                                    <p>{txnButtonText(pendingTransactions, "approve_deposit", "Approve")}</p>
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
                                        </Grid> */}
                                        {/* <Grid item xs={12} sm={6} className="withdraw-explain">
                                            <p>Withdraw will result in:</p>
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
        return (
            <Fade in={true} mountOnEnter unmountOnExit>
                <Grid className="vault-view">
                    <Backdrop open={true}>
                        <Fade in={true}>
                            <div className="vault-card top240">
                                <VaultHeader />
                                <VaultRow
                                    vault={vault}
                                    balance={balances.balance}
                                    staked={balances.staked}
                                    totalStaked={balances.totalStaked}
                                />
                                <div className="vault-card-action-area">
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={6}>
                                            <div className="vault-card-action-area-inp-wrap">

                                                <p className="vault-card-action-area-inp-wrap-title">Balance: ${trim(Number(balances.balance), 3)}</p>
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
                                                    <Slider className="vault-percent-slider" min={0} max={trimmedBalance()} value={amount} onChange={(e, newValue: any) => setAmount(parseFloat(newValue))} />
                                                    <div className="divided-percent">
                                                        <span className="vault-percent-slider-wrap-title" onClick={(e) => setAmount(0)}>0%</span>
                                                        <span className="vault-percent-slider-wrap-title" onClick={(e) => setAmount(trimmedBalance() * 0.25)}>25%</span>
                                                        <span className="vault-percent-slider-wrap-title" onClick={(e) => setAmount(trimmedBalance() * 0.5)}>50%</span>
                                                        <span className="vault-percent-slider-wrap-title" onClick={(e) => setAmount(trimmedBalance() * 0.75)}>75%</span>
                                                        <span className="vault-percent-slider-wrap-title end" onClick={(e) => setAmount(trimmedBalance())}>100%</span>
                                                    </div>
                                                </div>

                                            </Grid>
                                            <Grid item xs={12} sm={12} className="deposit-btn-wrapper">
                                                {
                                                    address && hasAllowance() ? (<div
                                                        className="vault-modal-btn deposit"
                                                        onClick={() => {
                                                            if (isPendingTxn(pendingTransactions, "deposit")) return;
                                                            onHandleStakeContract("stake");
                                                        }}
                                                    >
                                                        <p>{txnButtonText(pendingTransactions, "deposit", "Deposit")}</p>
                                                    </div>) : (<div
                                                        className="vault-modal-btn deposit"
                                                        onClick={() => {
                                                            if (isPendingTxn(pendingTransactions, "approve_deposit")) return;
                                                            onHandleApproveContract();
                                                        }}
                                                    >
                                                        <p>{txnButtonText(pendingTransactions, "approve_deposit", "Approve")}</p>
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
                                                        <p className="vault-card-action-area-inp-wrap-title">${trim(Number(balances.totalUserStake), 3)}</p>


                                                    </div>
                                                    <div className="vault-card-action-area-inp-wrap-title-new" style={{ paddingRight: "10px" }}>
                                                        <p className="vault-card-action-area-inp-wrap-title">Current Deposit: </p>
                                                        <p className="vault-card-action-area-inp-wrap-title">${trim(Number(balances.staked), 3)}</p>
                                                    </div>

                                                </div>

                                                <div className="vault-card-action-area-inp-wrap-title-div">
                                                    <div className="vault-card-action-area-inp-wrap-title-new">
                                                        <p className="vault-card-action-area-inp-wrap-title">Available to Claim:</p>
                                                        <p className="vault-card-action-area-inp-wrap-title">${trim(Number(balances.earned), 3)}</p>
                                                    </div>

                                                </div>


                                                {/* <div className="vertical-border-wrapper">
                                                    <div className="top-border-div"></div>
                                                </div> */}
                                                {/* <div className="left-border-div"></div>
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
                                                </div> */}
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
