import { useState } from "react";
import { getAddresses, TOKEN_DECIMALS, DEFAULT_NETWORK } from "../../../constants";
import { useSelector } from "react-redux";
import { Link, Fade, Popper } from "@material-ui/core";
import "./time-menu.scss";
import { IReduxState } from "../../../store/slices/state.interface";
import { getTokenUrl } from "../../../helpers";
import xIcon from "../../../assets/icons/xtag-svg.png";

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

function TimeMenu() {
    const [anchorEl, setAnchorEl] = useState(null);
    const isEthereumAPIAvailable = window.ethereum;

    const networkID = useSelector<IReduxState, number>(state => {
        return (state.app && state.app.networkID) || DEFAULT_NETWORK;
    });

    const addresses = getAddresses(networkID);

    const MEMO_ADDRESS = addresses.MEMO_ADDRESS;
    const TIME_ADDRESS = addresses.TIME_ADDRESS;

    const handleClick = (event: any) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const open = Boolean(anchorEl);

    return (
        <div className="time-menu-root" onMouseEnter={e => handleClick(e)} onMouseLeave={e => handleClick(e)}>
            <div className="time-menu-btn mb_none">
                <p> XTAG</p>
            </div>
            <div className="time-menu-btn mb_show">
                <img src={xIcon} width='20px' alt='ico' />
            </div>

            <Popper className="time-menu-popper" open={open} anchorEl={anchorEl} transition>
                {({ TransitionProps }) => (
                    <Fade {...TransitionProps} timeout={200}>
                        <div className="tooltip">
                            {/* <Link className="tooltip-item" href={`https://www.traderjoexyz.com/#/trade?inputCurrency=&outputCurrency=${TIME_ADDRESS}`} target="_blank">
                                <p>Buy on Trader Joe</p>
                            </Link> */}

                            <Link className="tooltip-item" href={`https://trade.kucoin.com/trade/XTAG-USDT`} target="_blank">
                                <p>Buy on Kucoin.com</p>
                            </Link>

                            <Link className="tooltip-item" href={`https://www.gate.io/trade/XTAG_USDT`} target="_blank">
                                <p>Buy on Gate.io</p>
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

export default TimeMenu;
