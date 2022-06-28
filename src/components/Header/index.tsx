import { AppBar, Toolbar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import MenuIcon from "../../assets/icons/hamburger.svg";
import TimeMenu from "./time-menu";
import ConnectButton from "./connect-button";
import SolanaConnectButton from "./Solana/connect-button";
import SwitchNetwork from "./switch-network-button";
import WrapButton from "./wrap-button";
import TestnetFaucet from "./testnet-faucet";
import "./header.scss";
import { DRAWER_WIDTH, TRANSITION_DURATION } from "../../constants/style";
import { IS_MAINNET } from "../../constants/config"

interface IHeader {
    handleDrawerToggle: () => void;
    drawe: boolean;
}

const useStyles = makeStyles(theme => ({
    appBar: {
        [theme.breakpoints.up("sm")]: {
            width: "100%",
            padding: "20px 0 30px 0",
        },
        justifyContent: "flex-end",
        alignItems: "flex-end",
        background: "transparent",
        backdropFilter: "none",
        zIndex: 10,
    },
    topBar: {
        transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.sharp,
            duration: TRANSITION_DURATION,
        }),
        marginLeft: DRAWER_WIDTH,
    },
    topBarShift: {
        transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.easeOut,
            duration: TRANSITION_DURATION,
        }),
        marginLeft: 0,
    },
}));

function Header({ handleDrawerToggle, drawe }: IHeader) {
    const classes = useStyles();
    const isVerySmallScreen = useMediaQuery("(max-width: 400px)");
    const isWrapShow = useMediaQuery("(max-width: 480px)");

    const network = localStorage.getItem('network');

    return (
        <div className={`${classes.topBar} ${!drawe && classes.topBarShift}`}>
            <AppBar position="sticky" className={classes.appBar} elevation={0}>
                <Toolbar disableGutters className="dapp-topbar">
                    <div onClick={handleDrawerToggle} className="dapp-topbar-slider-btn">
                        <img src={MenuIcon} alt="" />
                    </div>
                    <div className="dapp-topbar-btns-wrap">
                        {/* {!isVerySmallScreen && network !== 'solana' && <TimeMenu />} */}
                        <TimeMenu />
                        {network !== 'solana' && !IS_MAINNET && <TestnetFaucet />}
                        {
                            network === 'solana' ?
                                <SolanaConnectButton /> :
                                <ConnectButton />
                        }
                        <SwitchNetwork />
                    </div>
                </Toolbar>
            </AppBar>
        </div>
    );
}

export default Header;
