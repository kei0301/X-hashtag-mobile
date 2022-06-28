require("dotenv")

export const TOKEN_DECIMALS = 9;

export enum Networks {
    AVAX_FUJI = 43113,
    AVAX = 43114,
    RINKEBY = 4,
    ROPSTEN = 3,
}

export const DEFAULT_NETWORK = Number(process.env.REACT_APP_DEFAULT_NETWORK_ID);
