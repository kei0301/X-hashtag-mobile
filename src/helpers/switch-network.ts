import { Networks } from "../constants/blockchain";
import {DEFAULT_NETWORK_ID} from "../constants/config"

const switchRequest = () => {
    if(DEFAULT_NETWORK_ID == 43114) {
        return window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xa86A" }],
        });
    } else {
        return window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xa869" }],
        });
    }

};

const addChainRequest = () => {
    return window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
            {
                chainId: "0xa86a",
                chainName: "Avalanche Mainnet",
                rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
                blockExplorerUrls: ["https://cchain.explorer.avax.network/"],
                nativeCurrency: {
                    name: "AVAX",
                    symbol: "AVAX",
                    decimals: 18,
                },
            },
        ],
    });
};

const addChainRequestForAVAXFuji = () => {
    return window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
            {
                chainId: "0xa869",
                chainName: "Avalanche Fuji Testnet",
                rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
                blockExplorerUrls: ["https://cchain.explorer.avax-test.network/"],
                nativeCurrency: {
                    name: "AVAX",
                    symbol: "AVAX",
                    decimals: 18,
                },
            },
        ],
    });
};

export const swithNetwork = async () => {
    if (window.ethereum) {
        try {
            await switchRequest();
        } catch (error: any) {
            if (error.code === 4902) {
                try {
                    if(DEFAULT_NETWORK_ID ==43113) {
                        await addChainRequestForAVAXFuji();

                    } else {
                        await addChainRequest();
                    }
                    await switchRequest();
                } catch (addError) {
                    console.log(error);
                }
            }
            console.log(error);
        }
    }
};
