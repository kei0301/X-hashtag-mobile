import React, { useState, ReactElement, useContext, useMemo, useCallback } from "react";
import Web3Modal from "web3modal";
import { StaticJsonRpcProvider, JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
// import WalletConnectProvider from "@walletconnect/web3-provider";
import { Web3ReactProvider } from '@web3-react/core';
import { getMainnetURI, getRinkebyMainnetURI, getRopstenMainnetURI, getAvaxMainnetURI, getAVAXFujiTestnetURI } from "./helpers";
import { DEFAULT_NETWORK } from "../../constants";
import { Networks } from "../../constants";
import { messages } from "../../constants/messages";
import { useDispatch } from "react-redux";
import { swithNetwork } from "../../helpers/switch-network";

type onChainProvider = {
    connect: () => Promise<Web3Provider>;
    disconnect: () => void;
    checkWrongNetwork: () => Promise<boolean>;
    provider: JsonRpcProvider;
    address: string;
    connected: Boolean;
    web3Modal: Web3Modal;
    chainID: number;
    web3?: any;
    providerChainID: number;
    hasCachedProvider: () => boolean;
};

export type Web3ContextData = {
    onChainProvider: onChainProvider;
} | null;

const Web3Context = React.createContext<Web3ContextData>(null);

export const useWeb3Context = () => {
    const web3Context = useContext(Web3Context);
    if (!web3Context) {
        throw new Error("useWeb3Context() can only be used inside of <Web3ContextProvider />, " + "please declare it at a higher level.");
    }
    const { onChainProvider } = web3Context;
    return useMemo(() => {
        return { ...onChainProvider };
    }, [web3Context]);
};

export const useAddress = () => {
    const { address } = useWeb3Context();
    return address;
};

export const Web3ContextProvider: React.FC<{ children: ReactElement }> = ({ children }) => {
    const dispatch = useDispatch();

    const [connected, setConnected] = useState(false);
    const [chainID, setChainID] = useState(DEFAULT_NETWORK);
    const [providerChainID, setProviderChainID] = useState(DEFAULT_NETWORK);
    const [address, setAddress] = useState("");

    const [uri, setUri] = useState(getMainnetURI(chainID));
    const [provider, setProvider] = useState<JsonRpcProvider>(new StaticJsonRpcProvider(uri));

    const [web3Modal] = useState<Web3Modal>(
        new Web3Modal({
            cacheProvider: true,
            providerOptions: {
                walletconnect: {
                    package: Web3ReactProvider,
                    options: {
                        rpc: {
                            [Networks.AVAX]: getAvaxMainnetURI(),
                            [Networks.RINKEBY]: getRinkebyMainnetURI(),
                            [Networks.ROPSTEN]: getRopstenMainnetURI(),
                            [Networks.AVAX_FUJI]: getAVAXFujiTestnetURI(),
                        },
                    },
                },
            },
        }),
    );

    const hasCachedProvider = (): boolean => {
        if (!web3Modal) return false;
        if (!web3Modal.cachedProvider) return false;
        return true;
    };

    const _initListeners = useCallback(
        (rawProvider: JsonRpcProvider) => {
            if (!rawProvider.on) {
                return;
            }

            rawProvider.on("accountsChanged", () => setTimeout(() => window.location.reload(), 1));

            rawProvider.on("chainChanged", async (chain: number) => {
                changeNetwork(chain);
            });

            rawProvider.on("network", (_newNetwork, oldNetwork) => {
                if (!oldNetwork) return;
                window.location.reload();
            });
        },
        [provider],
    );

    const changeNetwork = async (otherChainID: number) => {
        const network = Number(otherChainID);

        setProviderChainID(network);
    };

    const connect = useCallback(async () => {
        let rawProvider;
        try {
            rawProvider = await web3Modal.connect();
        } catch (error) {
            console.log("Error while connecting wallet", error);
            rawProvider = await web3Modal.connect();
        }

        _initListeners(rawProvider);

        const connectedProvider = new Web3Provider(rawProvider, "any");

        const chainId = await connectedProvider.getNetwork().then(network => Number(network.chainId));
        console.log("Connected chainId", chainId);
        const connectedAddress = await connectedProvider.getSigner().getAddress();
        console.log("Connected address", connectedAddress);

        setAddress(connectedAddress);

        setProviderChainID(chainId);

        if (chainId === Networks.RINKEBY) {
            setProvider(connectedProvider);
        }

        if (chainId === Networks.AVAX_FUJI) {
            setProvider(connectedProvider);
        }

        setConnected(true);

        return connectedProvider;
    }, [provider, web3Modal, connected]);

    const checkWrongNetwork = async (): Promise<boolean> => {
        if (providerChainID !== DEFAULT_NETWORK) {
            let shouldSwitch = false;
            // @ts-ignore
            if (DEFAULT_NETWORK === Networks.AVAX) {
                shouldSwitch = window.confirm(messages.switch_to_avalanche);
            }
            // @ts-ignore
            else if (DEFAULT_NETWORK === Networks.RINKEBY) {
                shouldSwitch = window.confirm(messages.switch_to_rinkeby);
            }
            // @ts-ignore
            else if (DEFAULT_NETWORK === Networks.ROPSTEN) {
                shouldSwitch = window.confirm(messages.switch_to_ropsten);
            }

            else if (DEFAULT_NETWORK === Networks.AVAX_FUJI) {
                shouldSwitch = window.confirm(messages.switch_to_avax_fuji_testnet);
            }

            if (shouldSwitch) {
                await swithNetwork();
                window.location.reload();
            }
            return true;
        }

        return false;
    };

    const disconnect = useCallback(async () => {
        web3Modal.clearCachedProvider();
        setConnected(false);

        setTimeout(() => {
            window.location.reload();
        }, 1);
    }, [provider, web3Modal, connected]);

    const onChainProvider = useMemo(
        () => ({
            connect,
            disconnect,
            hasCachedProvider,
            provider,
            connected,
            address,
            chainID,
            web3Modal,
            providerChainID,
            checkWrongNetwork,
        }),
        [connect, disconnect, hasCachedProvider, provider, connected, address, chainID, web3Modal, providerChainID],
    );
    //@ts-ignore
    return <Web3Context.Provider value={{ onChainProvider }}>{children}</Web3Context.Provider>;
};
