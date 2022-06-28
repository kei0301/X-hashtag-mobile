import { ethers, constants } from "ethers";
import { JsonRpcProvider, StaticJsonRpcProvider } from "@ethersproject/providers";
import { Networks } from "../../constants/blockchain";
import { warning, success, info, error } from "./messages-slice";
import { messages } from "../../constants/messages";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { StakeTokenContract, StakingRewards, StakingRewardsFactory, Vault } from "../../abi";
import { getAddresses } from "../../constants";
import { getStakedBalances } from "./stake-slice";
import { metamaskErrorWrap } from "../../helpers/metamask-error-wrap";
import { sleep } from "../../helpers";
import { clearPendingTxn, fetchPendingTxns, getStakingTypeText } from "./pending-txns-slice";
import { fetchAccountSuccess, getBalances } from "./account-slice";
import { getGasPrice } from "src/helpers/get-gas-price";
import { IVault } from "../../constants/vaults"
import { DEFAULT_NETWORK_RPC } from "../../constants/config";

interface IStake {
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    address: string;
    networkID: Networks;
    amount: number;
    decimals: number;
    action: "stake" | "unstake";
    vault: IVault;
}
const expandDecimals = (amount: number, decimals = 18) => {
    return ethers.utils.parseUnits(String(amount), decimals);
}

interface IApproval {
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    address: string;
    networkID: Networks;
    vault: IVault;
}

export const handleClaimContract = createAsyncThunk("stake-reward/claim", async ({ vault, provider, address, networkID }: IApproval, { dispatch }) => {
    if (!provider) {
        dispatch(warning({ text: messages.please_connect_wallet }));
        return;
    }

    let provider1:any;
    let incorrectProvider = false;
    if(provider.connection.url == "Not supported network") {
        console.log("Not connected");
        dispatch(warning({ text: messages.please_connect_wallet }));
        incorrectProvider = true;
        provider1 = new ethers.providers.JsonRpcProvider(DEFAULT_NETWORK_RPC)

    } else {
        provider1 = new ethers.providers.Web3Provider(window.ethereum)

    }

    const addresses = getAddresses(networkID);
    const tokenContract = new ethers.Contract(vault.TOKEN_ADDRESS, vault.TOKEN_ABI, provider1);
    const tokenDecimals  = await tokenContract.decimals();

    let tx;
    let approveTx;
    if(vault.version =="1") {
        const stakingContract = new ethers.Contract(addresses.STAKING_REWARDS_ADDRESS, StakingRewards, provider1.getSigner());
        try {
            approveTx = await stakingContract.getReward();
    
            const text = "Getting Rewards";
            const pendingTxnType = "claim";
    
            dispatch(fetchPendingTxns({ txnHash: approveTx.hash, text, type: pendingTxnType }));
            await approveTx.wait();
            dispatch(success({ text: messages.tx_successfully_send }));
        } catch (err: any) {
            console.log(err)
            return metamaskErrorWrap(err, dispatch);
        } finally {
            if (approveTx) {
                dispatch(clearPendingTxn(approveTx.hash));
            }
        }
        await sleep(2);
        dispatch(info({ text: messages.your_balance_update_soon }));
        await sleep(15);
        await dispatch(getBalances({ address, networkID, provider }));
        await dispatch(getStakedBalances({ vault, token: 'xtag', address, networkID, provider }));
        dispatch(info({ text: messages.your_balance_updated }));
        return;
    } else if (vault.version =="2") {
        const vaultContract = new ethers.Contract(vault.VAULT_ADDRESS, Vault, provider1.getSigner());
        try {
            approveTx = await vaultContract.claim();
    
            const text = "Getting Rewards";
            const pendingTxnType = "claim";
    
            dispatch(fetchPendingTxns({ txnHash: approveTx.hash, text, type: pendingTxnType }));
            await approveTx.wait();
            dispatch(success({ text: messages.tx_successfully_send }));
        } catch (err: any) {
            console.log(err)
            return metamaskErrorWrap(err, dispatch);
        } finally {
            if (approveTx) {
                dispatch(clearPendingTxn(approveTx.hash));
            }
        }
    
        await sleep(2);
        dispatch(info({ text: messages.your_balance_update_soon }));
        await sleep(15);
        await dispatch(getBalances({ address, networkID, provider }));
        await dispatch(getStakedBalances({ vault, token: 'xtag', address, networkID, provider }));
        dispatch(info({ text: messages.your_balance_updated }));
        return;
    }
});

export const handleStakeApprovalContract = createAsyncThunk("stake-reward/approval", async ({ vault, provider, address, networkID }: IApproval, { dispatch }) => {
    if (!provider) {
        dispatch(warning({ text: messages.please_connect_wallet }));
        return;
    }

    const provider1 = new ethers.providers.Web3Provider(window.ethereum)
    const addresses = getAddresses(networkID);

    let tokenContract;
    let approveTx, stakeAllowance;
    const gasPrice = await getGasPrice(provider);
    const text = "Approve Staking";
    const pendingTxnType = "approve_deposit";


    if(vault.version =="1") {   
        tokenContract = new ethers.Contract(addresses.STAKING_TOKEN_ADDRESS, StakeTokenContract, provider1.getSigner());
        try {
            approveTx = await tokenContract.approve(addresses.STAKING_REWARDS_ADDRESS, ethers.constants.MaxUint256, { gasPrice });
            dispatch(fetchPendingTxns({ txnHash: approveTx.hash, text, type: pendingTxnType }));
            await approveTx.wait();
            dispatch(success({ text: messages.tx_successfully_send }));
        } catch (err: any) {
            return metamaskErrorWrap(err, dispatch);
        } finally {
            if (approveTx) {
                dispatch(clearPendingTxn(approveTx.hash));
            }
        }
        await sleep(2);
        stakeAllowance = await tokenContract.allowance(address, addresses.STAKING_REWARDS_ADDRESS);

    } else if (vault.version =="2") {
        tokenContract = new ethers.Contract(vault.TOKEN_ADDRESS, vault.TOKEN_ABI, provider1.getSigner());
        try {    
            approveTx = await tokenContract.approve(vault.VAULT_ADDRESS, ethers.constants.MaxUint256, { gasPrice });
            dispatch(fetchPendingTxns({ txnHash: approveTx.hash, text, type: pendingTxnType }));
            await approveTx.wait();
            dispatch(success({ text: messages.tx_successfully_send }));
        } catch (err: any) {
            return metamaskErrorWrap(err, dispatch);
        } finally {
            if (approveTx) {
                dispatch(clearPendingTxn(approveTx.hash));
            }
        }
    
        await sleep(2);
        stakeAllowance = await tokenContract.allowance(address, vault.VAULT_ADDRESS);
    }

    console.log("Checking allowance ", stakeAllowance)

    return dispatch(
        fetchAccountSuccess({
            staking: {
                xtagStake: Number(stakeAllowance),
            },
        }),
    );


});

export const handleStakeContract = createAsyncThunk("staking-rewards", async ({ vault, action, address, amount, provider, decimals, networkID }: IStake, { dispatch }) => {
    if (!provider) {
        dispatch(warning({ text: messages.please_connect_wallet }));
        return;
    }

    const provider1 = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider1.getSigner();
    const addresses = getAddresses(networkID);
    const tokenContract = new ethers.Contract(vault.TOKEN_ADDRESS, vault.TOKEN_ABI, signer);
    const tokenDecimals  = await tokenContract.decimals();

    let tx;
    if(vault.version =="1") {
        const stakingRewardsContract = new ethers.Contract(addresses.STAKING_REWARDS_ADDRESS, StakingRewards, signer);
        try {
            if (action === "stake") {
                tx = await stakingRewardsContract.stake(expandDecimals(amount, tokenDecimals).toString());
            } else {
                tx = await stakingRewardsContract.withdraw(expandDecimals(amount, tokenDecimals).toString());
            }
            const pendingTxnType = action === "stake" ? "deposit" : "approve_withdraw";
            console.log(pendingTxnType)
            dispatch(fetchPendingTxns({ txnHash: tx.hash, text: getStakingTypeText(action), type: pendingTxnType }));
            await tx.wait();
            dispatch(success({ text: messages.tx_successfully_send }));
        } catch (err: any) {
            console.log(err)
            return metamaskErrorWrap(err, dispatch);
        } finally {
            if (tx) {
                dispatch(clearPendingTxn(tx.hash));
            }
        }
        dispatch(info({ text: messages.your_balance_update_soon }));
        await sleep(15);
        await dispatch(getBalances({ address, networkID, provider }));
        await dispatch(getStakedBalances({ vault, token: 'xtag', address, networkID, provider }));
        dispatch(info({ text: messages.your_balance_updated }));
        return;
    } else if (vault.version =="2") {
        const vaultContract = new ethers.Contract(vault.VAULT_ADDRESS, Vault, signer);
        try {
            if (action === "stake") {
                tx = await vaultContract.stake(expandDecimals(amount, tokenDecimals).toString());
            } else {
                tx = await vaultContract.claim();
            }
            const pendingTxnType = action === "stake" ? "deposit" : "approve_withdraw";
            console.log(pendingTxnType)
            dispatch(fetchPendingTxns({ txnHash: tx.hash, text: getStakingTypeText(action), type: pendingTxnType }));
            await tx.wait();
            dispatch(success({ text: messages.tx_successfully_send }));
        } catch (err: any) {
            console.log(err)
            return metamaskErrorWrap(err, dispatch);
        } finally {
            if (tx) {
                dispatch(clearPendingTxn(tx.hash));
            }
        }
        dispatch(info({ text: messages.your_balance_update_soon }));
        await sleep(15);
        await dispatch(getBalances({ address, networkID, provider }));
        await dispatch(getStakedBalances({ vault, token: 'xtag', address, networkID, provider }));
        dispatch(info({ text: messages.your_balance_updated }));
        return;

    }

});