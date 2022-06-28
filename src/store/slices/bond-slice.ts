import { ethers, constants } from "ethers";
import { getMarketPrice, getTokenPrice } from "../../helpers";
import { calculateUserBondDetails, getBalances } from "./account-slice";
import { getAddresses } from "../../constants";
import { fetchPendingTxns, clearPendingTxn } from "./pending-txns-slice";
import { createSlice, createSelector, createAsyncThunk } from "@reduxjs/toolkit";
import { JsonRpcProvider, StaticJsonRpcProvider } from "@ethersproject/providers";
import { fetchAccountSuccess } from "./account-slice";
import { Bond } from "../../helpers/bond/bond";
import { Networks } from "../../constants/blockchain";
import { getBondCalculator } from "../../helpers/bond-calculator";
import { RootState } from "../store";
// import { avaxTime, wavax } from "../../helpers/bond";
import { error, warning, success, info } from "../slices/messages-slice";
import { messages } from "../../constants/messages";
import { getGasPrice } from "../../helpers/get-gas-price";
import { metamaskErrorWrap } from "../../helpers/metamask-error-wrap";
import { sleep } from "../../helpers";
import { BigNumber } from "ethers";
import { DEFAULT_NETWORK_RPC } from "../../constants/config";

interface IChangeApproval {
    bond: Bond;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    networkID: Networks;
    address: string;
}

export const changeApproval = createAsyncThunk("bonding/changeApproval", async ({ bond, provider, networkID, address }: IChangeApproval, { dispatch }) => {
    if (!provider) {
        dispatch(warning({ text: messages.please_connect_wallet }));
        return;
    }

    const provider1 = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider1.getSigner();
    // const signer = provider.getSigner();
    const reserveContract = bond.getContractForReserve(networkID, signer);

    let approveTx;
    try {
        const gasPrice = await getGasPrice(provider);
        const bondAddr = bond.getAddressForBond(networkID);

        approveTx = await reserveContract.approve(bondAddr, constants.MaxUint256, { gasPrice });
        dispatch(
            fetchPendingTxns({
                txnHash: approveTx.hash,
                text: "Approving " + bond.displayName,
                type: "approve_" + bond.name,
            }),
        );
        await approveTx.wait();
        dispatch(success({ text: messages.tx_successfully_send }));
    } catch (err: any) {
        metamaskErrorWrap(err, dispatch);
    } finally {
        if (approveTx) {
            dispatch(clearPendingTxn(approveTx.hash));
        }
    }

    await sleep(2);

    let allowance = "0";

    let newERC20Token = bond.getContractForReserve(networkID, signer);

    allowance = await reserveContract.allowance(address, bond.getAddressForBond(networkID));
    console.log("checking allowance", allowance);

    return dispatch(
        fetchAccountSuccess({
            bonds: {
                [bond.name]: {
                    allowance: Number(allowance),
                },
            },
        }),
    );
});

interface ICalcBondDetails {
    address: string | null;
    bond: Bond;
    value: string | null;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    networkID: Networks;
}

export interface IBondDetails {
    bond: string;
    bondDiscount: number;
    bondQuote: number;
    purchased: number;
    vestingTerm: number;
    maxBondPrice: number;
    bondPrice: number;
    marketPrice: number;
    maxBondPriceToken: number;
}

export const calcBondDetails = createAsyncThunk("bonding/calcBondDetails", async ({ address, bond, value, provider, networkID }: ICalcBondDetails, { dispatch }) => {
    // return new Promise<any>(resevle => {
    //     resevle({
    //         bond: "",
    //         bondDiscount: "",
    //         bondQuote: "",
    //         vestingTerm: false,
    //         maxBondPrice: 0,
    //         bondPrice: 0,
    //         marketPrice: 0,
    //         maxBondPriceToken: "",
    //     });
    // });

    let network = 0 //await provider.getNetwork();
    let provider1;
    let isCorrectProvider = true;
    if(provider.connection.url == "Not supported network") {
        console.log("Not connected");
        isCorrectProvider = false;
        provider1 = new ethers.providers.JsonRpcProvider(DEFAULT_NETWORK_RPC)

    } else {
        provider1 = new ethers.providers.Web3Provider(window.ethereum)
    }

    if (!value) {
        value = "0";
    }

    const amountInWei = ethers.utils.parseEther(value);
    // console.log("checking amountInWei ---->", Number(amountInWei));

    let bondPrice = 0,
        bondDiscount = 0,
        valuation = 0,
        bondQuote = 0;

    const addresses = getAddresses(networkID);

    //  balance = await reserveContract.balanceOf(address);
    const balanceVal = ethers.utils.formatEther(0);


    // const bondContract = bond.getContractForBond(networkID, provider);
    // console.log("BondContract ----->", bondContract.address);
    // const bondCalcContract = getBondCalculator(networkID, provider);

    // const terms = await bondContract.terms();
    // console.log("termss 2---->", terms);
    // const maxBondPrice = (await bondContract.maxPayout()) / Math.pow(10, 9);
    // console.log("maxBondPrice -------------->", maxBondPrice);

    let marketPrice;
    // marketPrice = await getMarketPrice(networkID, provider);

    // const mimPrice = getTokenPrice("MIM");
    marketPrice = 1.05; // (marketPrice / Math.pow(10, 9)) * mimPrice;

    try {
        bondPrice = 1; // await bondContract.barterPriceInUSD();
        // console.log("bondPRice ---->", Number(bondPrice));

        // if (bond.name === avaxTime.name) {
        //     const avaxPrice = getTokenPrice("AVAX");
        //     bondPrice = bondPrice * avaxPrice;
        // }

        bondDiscount =  (marketPrice * Math.pow(10, 18) - bondPrice) / bondPrice;
        bondDiscount =  (marketPrice  - bondPrice) / bondPrice;

    } catch (e) {
        console.log("error getting barterPriceInUSD", e);
    }

    // let maxBondPriceToken = 0;
    const maxBodValue = ethers.utils.parseEther("1");

    if (bond.isLP) {
        // valuation = await bondCalcContract.valuation(bond.getAddressForReserve(networkID), amountInWei);
        // bondQuote = await bondContract.payoutFor(valuation);
        // bondQuote = bondQuote / Math.pow(10, 9);

        // const maxValuation = await bondCalcContract.valuation(bond.getAddressForReserve(networkID), maxBodValue);
        // const maxBondQuote = await bondContract.payoutFor(maxValuation);
        // maxBondPriceToken = maxBondPrice / (maxBondQuote * Math.pow(10, -9));
    } else {
        // bondQuote = await bondContract.payoutFor(amountInWei);
        // console.log("Bond quote 0 ---->", Number(bondQuote));
        bondQuote = Number(value);
        // console.log("Bond quote 1 ---->", bondQuote);

        // const maxBondQuote = await bondContract.payoutFor(maxBodValue);
        // console.log("max bond quote ---->", Number(maxBondQuote));
        // maxBondPriceToken = maxBondPrice / (maxBondQuote * Math.pow(10, -18));
    }
    let maxBondPrice = 1


    if (!!value && bondQuote > maxBondPrice) {
        // dispatch(error({ text: messages.try_mint_more(maxBondPrice.toFixed(2).toString()) }));
    }


    // Calculate bonds purchased
    const token = bond.getContractForReserve(networkID, provider1);
    let balance = 0
    let allowance = 0;
    if(address) {
        balance =  await token.balanceOf(address)
        allowance = await token.allowance(address, bond.getAddressForBond(networkID));
    }


    let purchased = await token.balanceOf(addresses.TREASURY_ADDRESS);
    console.log("purchased", purchased)


    purchased = purchased / Math.pow(10, 18);
    // console.log("checking inside bond details ---->", {
    //     bond: bond.name,
    //     bondDiscount: Number(bondDiscount.toString()),
    //     bondQuote: bondQuote,
    //     purchased: Number(purchased),
    //     vestingTerm: 0, //Number(terms.vestingTerm),
    //     maxBondPrice: 1, //Number(maxBoPrice),
    //     bondPrice: bondPrice / Math.pow(10, 18),
    //     marketPrice,
    //     maxBondPriceToken: 1,
    // });

    // return {
    //     bond: bond.name,
    //     bondDiscount: Number(bondDiscount.toString()),
    //     bondQuote: bondQuote,
    //     purchased: Number(purchased),
    //     vestingTerm: Number(terms.vestingTerm),
    //     maxBondPrice: Number(maxBondPrice),
    //     bondPrice: bondPrice / Math.pow(10, 18),
    //     marketPrice,
    //     maxBondPriceToken,
    // }


    return {
        bond: bond.name,
        bondDiscount: Number(bondDiscount.toString()),
        bondQuote: bondQuote,
        purchased: Number(purchased),
        vestingTerm: 0, //Number(terms.vestingTerm),
        maxBondPrice: 1, //Number(maxBoPrice),
        bondPrice: bondPrice,
        marketPrice,
        maxBondPriceToken: 1,
        balance: Number(ethers.utils.formatEther(balance)),
        allowance: Number(allowance)
    };
});

interface IBondAsset {
    value: string;
    address: string;
    bond: Bond;
    networkID: Networks;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    slippage: number;
    useAvax: boolean;
}
export const bondAsset = createAsyncThunk("bonding/bondAsset", async ({ value, address, bond, networkID, provider, slippage, useAvax }: IBondAsset, { dispatch }) => {

    const depositorAddress = address;
    const acceptedSlippage = slippage / 100 || 0.005;
    const valueInWei = ethers.utils.parseUnits(value, "ether");
    const provider1 = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider1.getSigner();

    // const signer = provider.getSigner();

    // const bondContract = bond.getContractForBond(networkID, signer);
    const newBondContract = bond.getNewContractForBond(networkID, signer);
    // console.log("bonfsdnkslds, --->", bondContract.address, bondContract);

    // const calculatePremium = await bondContract.barterPrice();
    // console.log("calculating premium --->", calculatePremium);
    // const maxPremium = Math.round(calculatePremium * (1 + acceptedSlippage));

    let bondTx;
    try {
        const gasPrice = await getGasPrice(provider);

        if (useAvax) {
            // bondTx = await bondContract.deposit(valueInWei, maxPremium, depositorAddress, { value: valueInWei, gasPrice });
        } else {
            // bondTx = await bondContract.deposit(valueInWei, maxPremium, depositorAddress, { gasPrice });
            bondTx = await newBondContract.deposit(bond.networkAddrs[networkID].reserveAddress, valueInWei, { gasPrice });

        }
        dispatch(
            fetchPendingTxns({
                txnHash: bondTx.hash,
                text: "Bonding " + bond.displayName,
                type: "bond_" + bond.name,
            }),
        );
        await bondTx.wait();
        dispatch(success({ text: messages.tx_successfully_send }));
        dispatch(info({ text: messages.your_balance_update_soon }));
        await sleep(10);
        await dispatch(calculateUserBondDetails({ address, bond, networkID, provider }));
        dispatch(info({ text: messages.your_balance_updated }));
        return;
    } catch (err: any) {
        return metamaskErrorWrap(err, dispatch);
    } finally {
        if (bondTx) {
            dispatch(clearPendingTxn(bondTx.hash));
        }
    }
});

interface IRedeemBond {
    address: string;
    bond: Bond;
    networkID: Networks;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    autostake: boolean;
}

export const redeemBond = createAsyncThunk("bonding/redeemBond", async ({ address, bond, networkID, provider, autostake }: IRedeemBond, { dispatch }) => {
    if (!provider) {
        dispatch(warning({ text: messages.please_connect_wallet }));
        return;
    }

    // const signer = provider.getSigner();
    const provider1 = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider1.getSigner();
    const bondContract = bond.getContractForBond(networkID, signer);

    let redeemTx;
    try {
        const gasPrice = await getGasPrice(provider);

        redeemTx = await bondContract.redeem(address, autostake === true, { gasPrice });
        const pendingTxnType = "redeem_bond_" + bond.name + (autostake === true ? "_autostake" : "");
        dispatch(
            fetchPendingTxns({
                txnHash: redeemTx.hash,
                text: "Redeeming " + bond.displayName,
                type: pendingTxnType,
            }),
        );
        await redeemTx.wait();
        dispatch(success({ text: messages.tx_successfully_send }));
        await sleep(0.01);
        dispatch(info({ text: messages.your_balance_update_soon }));
        await sleep(10);
        await dispatch(calculateUserBondDetails({ address, bond, networkID, provider }));
        await dispatch(getBalances({ address, networkID, provider }));
        dispatch(info({ text: messages.your_balance_updated }));
        return;
    } catch (err: any) {
        metamaskErrorWrap(err, dispatch);
    } finally {
        if (redeemTx) {
            dispatch(clearPendingTxn(redeemTx.hash));
        }
    }
});

export interface IBondSlice {
    loading: boolean;
    [key: string]: any;
}

const initialState: IBondSlice = {
    loading: true,
};

const setBondState = (state: IBondSlice, payload: any) => {
    const bond = payload.bond;
    const newState = { ...state[bond], ...payload };
    state[bond] = newState;
    state.loading = false;
};

const bondingSlice = createSlice({
    name: "bonding",
    initialState,
    reducers: {
        fetchBondSuccess(state, action) {
            state[action.payload.bond] = action.payload;
        },
    },
    extraReducers: builder => {
        builder
            .addCase(calcBondDetails.pending, state => {
                state.loading = true;
            })
            .addCase(calcBondDetails.fulfilled, (state, action) => {
                setBondState(state, action.payload);
                state.loading = false;
            })
            .addCase(calcBondDetails.rejected, (state, { error }) => {
                state.loading = false;
                console.log(error);
            });
    },
});

export default bondingSlice.reducer;

export const { fetchBondSuccess } = bondingSlice.actions;

const baseInfo = (state: RootState) => state.bonding;

export const getBondingState = createSelector(baseInfo, bonding => bonding);
