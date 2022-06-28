import { useState } from "react";
import { ethers } from "ethers";
import { getAddresses, TOKEN_DECIMALS, DEFAULT_NETWORK } from "../../../constants";
import { useSelector, useDispatch } from "react-redux";
import { Link, Fade, Popper } from "@material-ui/core";
import "./time-menu.scss";
import { IReduxState } from "../../../store/slices/state.interface";
import { getTokenUrl } from "../../../helpers";
import { UniversalMockERC20Token } from "../../../abi";
import { metamaskErrorWrap } from "../../../helpers/metamask-error-wrap";
import { fetchPendingTxns, clearPendingTxn } from "../../../store/slices/pending-txns-slice"
import { error, warning, success, info } from "../../../store/slices/messages-slice";
import { messages } from "../../../constants/messages";
import { useWeb3Context } from "../../../hooks";



let provider1: any;
if (window.ethereum) {
    provider1 = new ethers.providers.Web3Provider(window.ethereum)
}

const addTokenToWallet = (tokenSymbol: string, tokenAddress: string) => async () => {
    const tokenImage = getTokenUrl(tokenSymbol.toLowerCase());

    if (window.ethereum) {
        try {
            await window.ethereum.request({
                method: "wallet_watchAsset",
                params: {
                    type: "ERC20",
                    options: {
                        address: tokenAddress,
                        symbol: tokenSymbol,
                        decimals: TOKEN_DECIMALS,
                        image: tokenImage,
                    },
                },
            });
        } catch (error) {
            console.log(error);
        }
    }
};

function TestnetFaucet() {
    const [anchorEl, setAnchorEl] = useState(null);
    const isEthereumAPIAvailable = window.ethereum;
    const { connect, disconnect, connected, web3, providerChainID, checkWrongNetwork, address } = useWeb3Context();
    const dispatch = useDispatch();

    const networkID = useSelector<IReduxState, number>(state => {
        return (state.app && state.app.networkID) || DEFAULT_NETWORK;
    });

    const addresses = getAddresses(networkID);

    const handleClick = (event: any) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const open = Boolean(anchorEl);

    const mintXtagClickHandler = (address: any) => {
        console.log("Mint XTAG CLicked");
    };

    const mintUSDCClickHandler = async () => {
        console.log("Minting USDC", address);

        const tokenContract = new ethers.Contract(addresses.USDC_ADDRESS, UniversalMockERC20Token, provider1.getSigner());

        let tx;
        let amount = "100000000000000000000";
        try {
            tx = await tokenContract.mint(address, amount);
            const text = "Minting USDC";
            const pendingTxnType = "claim";

            dispatch(fetchPendingTxns({ txnHash: tx.hash, text, type: pendingTxnType }));
            await tx.wait();
            dispatch(success({ text: messages.tx_successfully_send }));
        } catch (err: any) {
            console.log(err)
            return metamaskErrorWrap(err, dispatch);
        } finally {
            if (tx) {
                dispatch(clearPendingTxn(tx.hash));
            }
        }

    };

    const mintDAIClickHandler = async () => {
        console.log("Minting DAI", address);

        const tokenContract = new ethers.Contract(addresses.DAI_ADDRESS, UniversalMockERC20Token, provider1.getSigner());

        let tx;
        let amount = "100000000000000000000";
        try {
            tx = await tokenContract.mint(address, amount);

            const text = "Minting DAI";
            const pendingTxnType = "claim";

            dispatch(fetchPendingTxns({ txnHash: tx.hash, text, type: pendingTxnType }));
            await tx.wait();
            dispatch(success({ text: messages.tx_successfully_send }));
        } catch (err: any) {
            console.log(err)
            return metamaskErrorWrap(err, dispatch);
        } finally {
            if (tx) {
                dispatch(clearPendingTxn(tx.hash));
            }
        }
    };

    return (
        <div className="time-menu-root" onMouseEnter={e => handleClick(e)} onMouseLeave={e => handleClick(e)}>
            <div className="time-menu-btn mb_none">
                <p> Testnet Faucet </p>
            </div>

            <div className="time-menu-btn mb_show">
                <p>TF</p>
            </div>

            <Popper className="time-menu-popper" open={open} anchorEl={anchorEl} transition>
                {({ TransitionProps }) => (
                    <Fade {...TransitionProps} timeout={200}>
                        <div className="tooltip">
                            <Link className="tooltip-item" href={`https://faucet.avax-test.network/`} target="_blank">
                                <p>Get AVAX</p>
                            </Link>

                            {/* <Link className="tooltip-item" target="_blank">
                                <p onClick={mintXtagClickHandler}>Mint XTAG</p>
                            </Link> */}

                            <Link className="tooltip-item" target="_blank">
                                <p onClick={mintUSDCClickHandler}>Mint USDC</p>
                            </Link>

                            <Link className="tooltip-item" target="_blank">
                                <p onClick={mintDAIClickHandler}>Mint DAI</p>
                            </Link>

                            {/* {isEthereumAPIAvailable && (
                                <div className="add-tokens">
                                    <div className="divider" />
                                    <p className="add-tokens-title">ADD TOKEN TO WALLET</p>
                                    <div className="divider" />
                                    <div className="tooltip-item" onClick={addTokenToWallet("XIGMA", TIME_ADDRESS)}>
                                        <p>XIGMA</p>
                                    </div>
                                    <div className="tooltip-item" onClick={addTokenToWallet("sXIGMA", MEMO_ADDRESS)}>
                                        <p>sXIGMA</p>
                                    </div>
                                </div>
                            )} */}
                        </div>
                    </Fade>
                )}
            </Popper>
        </div>
    );
}

export default TestnetFaucet;