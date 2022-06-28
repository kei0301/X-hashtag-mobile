import { ethers } from "ethers";
import { getMarketPrice, getTokenPrice } from "../../helpers";

import { getAddresses } from "../../constants";
import { TimeTokenContract, MemoTokenContract, MimTokenContract, wMemoTokenContract, StakeTokenContract, StakingRewards } from "../../abi";
import { setAll } from "../../helpers";

import { createSlice, createSelector, createAsyncThunk } from "@reduxjs/toolkit";
import { JsonRpcProvider, StaticJsonRpcProvider } from "@ethersproject/providers";
import { Bond } from "../../helpers/bond/bond";
import { Networks } from "../../constants/blockchain";
import React from "react";
import { RootState } from "../store";
import { IToken } from "../../helpers/tokens";
import { DEFAULT_NETWORK_RPC } from "../../constants/config"

interface IGetBalances {
    address: string;
    networkID: Networks;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
}

interface IAccountBalances {
    balances: {
        memo: string;
        time: string;
        wmemo: string;
    };
    updated: number;
}

export const getBalances = createAsyncThunk("account/getBalances", async ({ address, networkID, provider }: IGetBalances): Promise<IAccountBalances> => {
    // const addresses = getAddresses(networkID);
    // console.log("Checking address in geTBlanaces", address);

    // const memoContract = new ethers.Contract(addresses.MEMO_ADDRESS, MemoTokenContract, provider);
    // const memoBalance = await memoContract.balanceOf(address);
    // console.log("memoBalance: ", memoBalance)
    // const timeContract = new ethers.Contract(addresses.TIME_ADDRESS, TimeTokenContract, provider);
    // const timeBalance = await timeContract.balanceOf(address);
    // console.log("timeBalance: ", timeBalance)
    // // const wmemoContract = new ethers.Contract(addresses.WMEMO_ADDRESS, wMemoTokenContract, provider);
    // // const wmemoBalance = await wmemoContract.balanceOf(address);
    // // console.log("wmemoBalance: ", wmemoBalance)
    // const wmemoBalance = 0;

    // console.log("checking balances 11 ---------->", {
    //     balances: {
    //         memo: ethers.utils.formatUnits(memoBalance, "gwei"),
    //         time: ethers.utils.formatUnits(timeBalance, "gwei"),
    //         wmemo: ethers.utils.formatEther(0),
    //     },
    // });

    // return {
    //     balances: {
    //         memo: ethers.utils.formatUnits(memoBalance, "gwei"),
    //         time: ethers.utils.formatUnits(timeBalance, "gwei"),
    //         wmemo: ethers.utils.formatEther(wmemoBalance),
    //     },
    //     updated: (new Date()).getTime()
    // };
        return {
        balances: {
            memo: "89", //ethers.utils.formatUnits(memoBalance, "gwei"),
            time: "89", //ethers.utils.formatUnits(timeBalance, "gwei"),
            wmemo: "89" //ethers.utils.formatEther(wmemoBalance),
        },
        updated: (new Date()).getTime()
    };
});

interface ILoadAccountDetails {
    address: string;
    networkID: Networks;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
}

interface IUserAccountDetails {
    balances: {
        time: string;
        memo: string;
        wmemo: string;
    };
    staking: {
        time: number;
        memo: number;
    };
    wrapping: {
        memo: number;
    };
}

export const loadAccountDetails = createAsyncThunk("account/loadAccountDetails", async ({ networkID, provider, address }: ILoadAccountDetails): Promise<IUserAccountDetails> => {
    let timeBalance = 0;
    let memoBalance = 0;

    let wmemoBalance = 0;
    let memoWmemoAllowance = 0;

    let stakeAllowance = 0;
    let unstakeAllowance = 0;

    const addresses = getAddresses(networkID);

    if (addresses.TIME_ADDRESS) {
        const timeContract = new ethers.Contract(addresses.TIME_ADDRESS, TimeTokenContract, provider);
        timeBalance = await timeContract.balanceOf(address);
        stakeAllowance = await timeContract.allowance(address, addresses.STAKING_HELPER_ADDRESS);
    }

    if (addresses.MEMO_ADDRESS) {
        const memoContract = new ethers.Contract(addresses.MEMO_ADDRESS, MemoTokenContract, provider);
        memoBalance = await memoContract.balanceOf(address);
        unstakeAllowance = await memoContract.allowance(address, addresses.STAKING_ADDRESS);

        if (addresses.WMEMO_ADDRESS) {
            memoWmemoAllowance = await memoContract.allowance(address, addresses.WMEMO_ADDRESS);
        }
    }

    if (addresses.WMEMO_ADDRESS) {
        // const wmemoContract = new ethers.Contract(addresses.WMEMO_ADDRESS, wMemoTokenContract, provider);
        wmemoBalance = 0; // await wmemoContract.balanceOf(address);
    }

    return {
        balances: {
            memo: ethers.utils.formatUnits(memoBalance, "gwei"),
            time: ethers.utils.formatUnits(timeBalance, "gwei"),
            wmemo: ethers.utils.formatEther(wmemoBalance),
        },
        staking: {
            time: Number(stakeAllowance),
            memo: Number(unstakeAllowance),
        },
        wrapping: {
            memo: Number(memoWmemoAllowance),
        },
    };
});

interface ICalcUserBondDetails {
    address: string;
    bond: Bond;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    networkID: Networks;
}

export interface IUserBondDetails {
    allowance: number;
    balance: number;
    avaxBalance: number;
    interestDue: number;
    bondMaturationBlock: number;
    pendingPayout: number; //Payout formatted in gwei.
}

export const calculateUserBondDetails = createAsyncThunk("account/calculateUserBondDetails", async ({ address, bond, networkID, provider }: ICalcUserBondDetails) => {
    if (!address) {
        return new Promise<any>(resevle => {
            resevle({
                bond: "",
                displayName: "",
                bondIconSvg: "",
                isLP: false,
                allowance: 0,
                balance: 0,
                interestDue: 0,
                bondMaturationBlock: 0,
                pendingPayout: "",
                avaxBalance: 0,
            });
        });
    }

    let network = 0 //await provider.getNetwork();
    let provider1;
    let incorrectProvider = false;
    // console.log("account-slice 111 ---->", networkID, provider, provider.connection.url)
    if(provider.connection.url == "Not supported network") {
        console.log("Not connected");
        incorrectProvider = true;
        provider1 = new ethers.providers.JsonRpcProvider(DEFAULT_NETWORK_RPC);

    } else {
        provider1 = new ethers.providers.Web3Provider(window.ethereum)

    }

    // const bondContract = bond.getContractForBond(networkID, provider1);
    const reserveContract = bond.getContractForReserve(networkID, provider1);

    let interestDue, pendingPayout, bondMaturationBlock;

    // console.log("bondDetails1 -----------", address, reserveContract);
    
    // const bondDetails = await bondContract.barterInfo(address);
    // console.log("bondDetails -----------", bondDetails);
    // interestDue = bondDetails.payout / Math.pow(10, 9);

    // const lastBlockTime = (await provider.getBlock(Number(bondDetails.lastBlock))).timestamp;
    // bondMaturationBlock = Number(bondDetails.vesting) + Number(lastBlockTime);
    // pendingPayout = await bondContract.pendingPayoutFor(address);

    let allowance,
        balance = "0";

    allowance = await reserveContract.allowance(address, bond.getAddressForBond(networkID));
    balance = await reserveContract.balanceOf(address);
    const balanceVal = ethers.utils.formatEther(balance);

    let avaxBalance = 0;
    if(incorrectProvider) {
        avaxBalance = 0; //await provider1.getSigner().getBalance();
    } else {
        avaxBalance = Number(await provider1.getSigner().getBalance());
    }
    const avaxVal = ethers.utils.formatEther(avaxBalance);

    let marketPrice 
    // marketPrice= await getMarketPrice(networkID, provider);
    // const mimPrice = getTokenPrice("MIM");
    marketPrice = 1.05 //(marketPrice / Math.pow(10, 9)) * mimPrice;

    let bondPrice = Math.pow(10, 18); //await bondContract.barterPriceInUSD();
    let bondDiscount = (marketPrice * Math.pow(10, 18) - bondPrice) / bondPrice;
    bondDiscount = (marketPrice * Math.pow(10, 18) - bondPrice) / bondPrice;

    const addresses = getAddresses(networkID);

    console.log("bondDetails2 -----------", address, reserveContract);

    const token = bond.getContractForReserve(networkID, provider);
    let purchased = await token.balanceOf(addresses.TREASURY_ADDRESS);

    // const pendingPayoutVal = ethers.utils.formatUnits(pendingPayout, "gwei");
    console.log("chekcing somerner e account-slice------->", {
        pendingPayout,
        // pendingPayoutVal,
        // bondVesting: bondDetails.vesting,
        bondPrice: bondPrice / Math.pow(10, 18),
        bondDiscount: Number(bondDiscount.toString()),
        purchased: purchased / Math.pow(10, 18)
    });

    // console.log("nfjkbsdjfnds ------->", {
    //     bondPrice: 1, //bondPrice / Math.pow(10, 18),
    //     bondDiscount: Number(bondDiscount.toString()),
    //     bond: bond.name,
    //     displayName: bond.displayName,
    //     bondIconSvg: bond.bondIconSvg,
    //     isLP: bond.isLP,
    //     allowance: Number(allowance),
    //     balance: Number(balanceVal),
    //     avaxBalance: Number(avaxVal),
    //     interestDue,
    //     bondMaturationBlock,
    //     pendingPayout: 0, //Number(pendingPayoutVal),
    //     purchased: purchased / Math.pow(10, 18)
    // });

    return {
        bondPrice: 1, //bondPrice / Math.pow(10, 18),
        bondDiscount: Number(bondDiscount.toString()),
        bond: bond.name,
        displayName: bond.displayName,
        bondIconSvg: bond.bondIconSvg,
        isLP: bond.isLP,
        allowance: Number(allowance),
        balance: Number(balanceVal),
        avaxBalance: Number(avaxVal),
        interestDue,
        bondMaturationBlock,
        pendingPayout: 0, //Number(pendingPayoutVal),
        purchased: purchased / Math.pow(10, 18)
    };
});

interface ICalcUserTokenDetails {
    address: string;
    token: IToken;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    networkID: Networks;
}

export interface IUserTokenDetails {
    allowance: number;
    balance: number;
    isAvax?: boolean;
}

export const calculateUserTokenDetails = createAsyncThunk("account/calculateUserTokenDetails", async ({ address, token, networkID, provider }: ICalcUserTokenDetails) => {
    console.log("calculateUserTokenDetails", {
        address,
        token,
    });
    if (!address) {
        return new Promise<any>(resevle => {
            resevle({
                token: "",
                address: "",
                img: "",
                allowance: 0,
                balance: 0,
            });
        });
    }
    // } else {
    //     return new Promise<any>(resevle => {
    //         resevle({
    //             token: "",
    //             address: "",
    //             img: "",
    //             allowance: 0,
    //             balance: 0,
    //         });
    //     });
    // }

    return new Promise<any>(resevle => {
                resevle({
                    token: "",
                    address: "",
                    img: "",
                    allowance: 0,
                    balance: 10000,
                });
            });

    if (token.isAvax) {
        const provider1 = new ethers.providers.Web3Provider(window.ethereum)
        const avaxBalance = await provider1.getSigner().getBalance();
        const avaxVal = ethers.utils.formatEther(avaxBalance);

        return {
            token: token.name,
            tokenIcon: token.img,
            balance: Number(avaxVal),
            isAvax: true,
        };
    }

    const addresses = getAddresses(networkID);

    const tokenContract = new ethers.Contract(token.address, MimTokenContract, provider);

    let allowance;
    let balance = "0";

    // allowance = await tokenContract.allowance(address, addresses.ZAPIN_ADDRESS);
    balance = await tokenContract.balanceOf(address);

    const balanceVal = Number(balance) / Math.pow(10, token.decimals);
    console.log("balance of ", balanceVal)

    return {
        token: token.name,
        address: token.address,
        img: token.img,
        allowance: Number(allowance),
        balance: 87 //Number(balanceVal),
    };
});

export interface IAccountSlice {
    bonds: { [key: string]: IUserBondDetails };
    balances: {
        memo: string;
        time: string;
        wmemo: string;
    };
    loading: boolean;
    updated: number;
    staking: {
        time: number;
        memo: number;
    };
    wrapping: {
        memo: number;
    };
    tokens: { [key: string]: IUserTokenDetails };
}

const initialState: IAccountSlice = {
    loading: true,
    bonds: {},
    balances: { memo: "", time: "", wmemo: "" },
    staking: { time: 0, memo: 0 },
    wrapping: { memo: 0 },
    tokens: {},
    updated: 0,
};

const accountSlice = createSlice({
    name: "account",
    initialState,
    reducers: {
        fetchAccountSuccess(state, action) {
            setAll(state, action.payload);
        },
    },
    extraReducers: builder => {
        builder
            .addCase(loadAccountDetails.pending, state => {
                state.loading = true;
            })
            .addCase(loadAccountDetails.fulfilled, (state, action) => {
                setAll(state, action.payload);
                state.loading = false;
            })
            .addCase(loadAccountDetails.rejected, (state, { error }) => {
                state.loading = false;
                console.log(error);
            })
            .addCase(getBalances.pending, state => {
                state.loading = true;
            })
            .addCase(getBalances.fulfilled, (state, action) => {
                setAll(state, action.payload);
                state.loading = false;
            })
            .addCase(getBalances.rejected, (state, { error }) => {
                state.loading = false;
                console.log(error);
            })
            .addCase(calculateUserBondDetails.pending, (state, action) => {
                state.loading = true;
            })
            .addCase(calculateUserBondDetails.fulfilled, (state, action) => {
                if (!action.payload) return;
                const bond = action.payload.bond;
                state.bonds[bond] = action.payload;
                state.loading = false;
            })
            .addCase(calculateUserBondDetails.rejected, (state, { error }) => {
                state.loading = false;
                console.log(error);
            })
            .addCase(calculateUserTokenDetails.pending, (state, action) => {
                state.loading = true;
            })
            .addCase(calculateUserTokenDetails.fulfilled, (state, action) => {
                if (!action.payload) return;
                const token = action.payload.token;
                state.tokens[token] = action.payload;
                state.loading = false;
            })
            .addCase(calculateUserTokenDetails.rejected, (state, { error }) => {
                state.loading = false;
                console.log(error);
            });
    },
});

export default accountSlice.reducer;

export const { fetchAccountSuccess } = accountSlice.actions;

const baseInfo = (state: RootState) => state.account;

export const getAccountState = createSelector(baseInfo, account => account);
