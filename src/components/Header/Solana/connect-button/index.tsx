import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import './style.scss';
function SolanaConnectButton() {
    const wallet = useWallet();
    return (
        <WalletModalProvider>
            <WalletMultiButton className='solana-connect-button'>
                {wallet.publicKey ? '' : 'Connect Wallet'}
            </WalletMultiButton>
        </WalletModalProvider>
    );
}

export default SolanaConnectButton;
