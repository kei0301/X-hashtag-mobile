import React, { useEffect, useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
    getLedgerWallet,
    getPhantomWallet,
    getSlopeWallet,
    getSolflareWallet,
    getSolletExtensionWallet,
    getSolletWallet,
    getTorusWallet,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

import App from "./App";
import Landing from "../Landing";
import { HashRouter } from "react-router-dom";
import Loading from "../../components/Loader";

// Default styles that can be overridden by your app
import '@solana/wallet-adapter-react-ui/styles.css';

function SolanaRoot() {
    const dispatch = useDispatch();
    const isApp = (): boolean => {
        return true; //window.location.host.includes("app");
    };

    // const [loading, setLoading] = useState(true);

    // if (loading) return <Loading />;

    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
    const network = WalletAdapterNetwork.Devnet;

    // You can also provide a custom RPC endpoint.
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking --
    // Only the wallets you configure here will be compiled into your application
    const wallets = useMemo(() => [
        getPhantomWallet(),
        getSlopeWallet(),
        getSolflareWallet(),
        getTorusWallet({
            options: { clientId: 'Get a client ID @ https://developer.tor.us' }
        }),
        getLedgerWallet(),
        getSolletWallet({ network }),
        getSolletExtensionWallet({ network }),
    ], [network]);

    const app = () => (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <HashRouter>
                    <App />
                </HashRouter>
            </WalletProvider>
        </ConnectionProvider>
    );

    return isApp() ? app() : <Landing />;
}

export default SolanaRoot;
