require("dotenv");
import { getMainnetURI } from "../hooks/web3/helpers/get-mainnet-uri"

export const IS_SOLANA_ENABLED= 
    process.env.REACT_APP_IS_SOLANA_ENABLED ? process.env.REACT_APP_IS_SOLANA_ENABLED == "true" : false;

export const DEFAULT_NETWORK_ID = Number(process.env.REACT_APP_DEFAULT_NETWORK_ID)

export const IS_MAINNET = process.env.REACT_APP_IS_MAINNET ? process.env.REACT_APP_IS_MAINNET == "true" : false

export const DEFAULT_NETWORK_RPC = getMainnetURI(DEFAULT_NETWORK_ID);

console.log("config --->", {
    IS_SOLANA_ENABLED,
    DEFAULT_NETWORK_ID,
    IS_MAINNET,
    DEFAULT_NETWORK_RPC
})
