import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useWeb3Context } from "../../../hooks";
import { DEFAULT_NETWORK } from "../../../constants";
import { IReduxState } from "../../../store/slices/state.interface";
import { IPendingTxn } from "../../../store/slices/pending-txns-slice";
import "./connect-menu.scss";
import CircularProgress from "@material-ui/core/CircularProgress";
import Wallet from "../../../assets/icons/wallet.jpeg";
import meta from "../../../assets/icons/metamask.jpeg";
import pending from "../../../assets/icons/pending.png";

function ConnectMenu() {
    const { connect, disconnect, connected, web3, providerChainID, checkWrongNetwork } = useWeb3Context();
    const dispatch = useDispatch();
    const [isConnected, setConnected] = useState(connected);

    let pendingTransactions = useSelector<IReduxState, IPendingTxn[]>(state => {
        return state.pendingTransactions;
    });

    let buttonText = "Connect Wallet";
    let buttonText2 = meta;
    let clickFunc: any = connect;
    let buttonStyle = {};

    if (isConnected) {
        buttonText = "Disconnect";
        buttonText2 = Wallet;
        clickFunc = disconnect;
    }

    if (pendingTransactions && pendingTransactions.length > 0) {
        buttonText = `${pendingTransactions.length} Pending `;
        buttonText2 = pending
        clickFunc = () => { };
    }

    if (isConnected && providerChainID !== DEFAULT_NETWORK) {
        buttonText = "Wrong network";
        buttonText2 = meta;
        buttonStyle = { backgroundColor: "rgb(255, 67, 67)" };
        clickFunc = () => {
            checkWrongNetwork();
        };
    }

    useEffect(() => {
        setConnected(connected);
    }, [web3, connected]);

    return (
        <div>
            <div className="connect-button mb_none" style={buttonStyle} onClick={clickFunc}>
                <p>{buttonText}</p>
                {pendingTransactions.length > 0 && (
                    <div className="connect-button-progress">
                        <CircularProgress size={15} color="inherit" />
                    </div>
                )}
            </div>
            <div className="connect-button mb_7" style={buttonStyle} onClick={clickFunc}>
                <img src={buttonText2} width='20px' alt='ico' />
                {pendingTransactions.length > 0 && (
                    <div className="connect-button-progress">
                        <CircularProgress size={15} color="inherit" />
                    </div>
                )}
            </div>
        </div>
    );
}

export default ConnectMenu;
