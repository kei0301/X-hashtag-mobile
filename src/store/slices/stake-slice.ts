import { ethers } from "ethers";
import { StakeTokenContract, StakingRewards, Vault } from "../../abi";
import { RootState } from "../store";
import { setAll } from "../../helpers";
import { getAddresses } from "../../constants";
import { Networks } from "../../constants/blockchain";
import { JsonRpcProvider, StaticJsonRpcProvider } from "@ethersproject/providers";
import { createSlice, createSelector, createAsyncThunk } from "@reduxjs/toolkit";
import { IVault } from "src/constants/vaults";

export interface IStakeState {
    loading: boolean;
    balances: {
        staked: number;
        total: number;
    }
}

interface IGetStakedBalance {
    vault: IVault
    token: string;
    address: string;
    networkID: Networks;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
}

export interface IStakeBalances {
    balances: {
        staked: string;
        total: string;
    }
}

export const getStakedBalances = createAsyncThunk("stake/getBalances", async ({ vault, token, address, networkID, provider }: IGetStakedBalance): Promise<IStakeBalances> => {
    let provider1;
    let incorrectProvider = false;
    if(provider.connection.url == "Not supported network") {
        console.log("Not connected");
        incorrectProvider = true;
        provider1 = new ethers.providers.JsonRpcProvider("https://api.avax-test.network/ext/bc/C/rpc")
    } else {
        provider1 = new ethers.providers.Web3Provider(window.ethereum)

    }
    
    const addresses = getAddresses(networkID)
    const tokenContract = new ethers.Contract(vault.TOKEN_ADDRESS, vault.TOKEN_ABI, provider1);
    const tokenDecimals = await tokenContract.decimals();

    let ret = {
        balances: {
            totalUserStake: "0",
            staked: "0",
            total: "0",
            earned: "0",
            balance: "0"
        }
    };
    
    if(vault.version =="1") {
        // if (token === 'xtag') {
        const xtagContract = new ethers.Contract(addresses.STAKING_REWARDS_ADDRESS, StakingRewards, provider1);
        let [staked, totalStaked, earned, balance] = await Promise.all([
            xtagContract.balanceOf(address),
            tokenContract.balanceOf(addresses.STAKING_REWARDS_ADDRESS),
            xtagContract.earned(),
            tokenContract.balanceOf(address)
        ])
        ret.balances.staked = ethers.utils.formatUnits(staked, tokenDecimals);
        ret.balances.total = ethers.utils.formatUnits(totalStaked, tokenDecimals);
        ret.balances.earned = ethers.utils.formatUnits(earned, tokenDecimals);
        ret.balances.balance = ethers.utils.formatUnits(balance, tokenDecimals);
        // }
    } else if (vault.version =="2") {
        const vaultContract = new ethers.Contract(vault.VAULT_ADDRESS, Vault, provider1);
        let [staked, totalStaked, earned, balance, userVaultInfo] = await Promise.all(
            [
                vaultContract.balanceOf(address),
                vaultContract.totalDeposits(),
                vaultContract.earned(address),
                tokenContract.balanceOf(address),
                vaultContract.getUserVaultInfo(address)
            ]
        );
        console.log("", userVaultInfo[0][0].toString())
        ret.balances.totalUserStake =  ethers.utils.formatUnits(userVaultInfo[0][0].toString(), tokenDecimals); 
        ret.balances.staked = ethers.utils.formatUnits(staked, tokenDecimals);
        ret.balances.total = ethers.utils.formatUnits(totalStaked, tokenDecimals);
        ret.balances.earned = ethers.utils.formatUnits(earned, tokenDecimals);
        ret.balances.balance = ethers.utils.formatUnits(balance, tokenDecimals);
    }
    return ret;
})

const initialState: IStakeState = {
    loading: true,
    balances: {
        staked: 0,
        total: 0
    }
};
const stakeSlice = createSlice({
    name: "stake",
    initialState,
    reducers: {
        fetchAccountSuccess(state, action) {
            setAll(state, action.payload);
        },
    },
    extraReducers: builder => {
        builder
            .addCase(getStakedBalances.pending, state => {
                state.loading = true;
            })
            .addCase(getStakedBalances.fulfilled, (state, action) => {
                setAll(state, action.payload);
                state.loading = false;
            })
            .addCase(getStakedBalances.rejected, (state, { error }) => {
                state.loading = false;
                console.log(error);
            })
    }
});

export default stakeSlice.reducer;

export const { fetchAccountSuccess } = stakeSlice.actions;

const baseInfo = (state: RootState) => state.stake;

export const getStakeState = createSelector(baseInfo, stake => stake);
