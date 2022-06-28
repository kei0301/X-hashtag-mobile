import { Networks } from "../../../constants";
export const getMainnetURI = (chainID: number): string => {
    if (chainID === Networks.AVAX) {
        return getAvaxMainnetURI();
    } else if (chainID === Networks.RINKEBY) {
        return getRinkebyMainnetURI();
    } else if (chainID === Networks.ROPSTEN) {
        return getRopstenMainnetURI();
    } else if (chainID === Networks.AVAX_FUJI) {
        return getAVAXFujiTestnetURI();
    }
    return "Not supported network";
};

export const getRinkebyMainnetURI = (): string => {
    return "https://rinkeby.infura.io/v3/a1a541eb43594cb7b1d9bac30cb8fdc9";
}

export const getAvaxMainnetURI = (): string => {
    return "https://api.avax.network/ext/bc/C/rpc";
}

export const getRopstenMainnetURI = (): string => {
    return "https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161";
}

export const getAVAXFujiTestnetURI = (): string => {
    return "https://api.avax-test.network/ext/bc/C/rpc";
}
