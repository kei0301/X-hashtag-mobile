import { useEffect, useState, useCallback } from "react";
import { Route, Redirect, Switch } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAddress, useWeb3Context } from "../hooks";
import { calcBondDetails } from "../store/slices/bond-slice";
import { loadAppDetails } from "../store/slices/app-slice";
import { loadAccountDetails, calculateUserBondDetails, calculateUserTokenDetails } from "../store/slices/account-slice";
import { IReduxState } from "../store/slices/state.interface";
import Loading from "../components/Loader";
import useBonds from "../hooks/bonds";
// import useVaults from "../hooks/vaults";
import ViewBase from "../components/ViewBase";
import { Stake, ChooseBond, Bond, Dashboard, NotFound, Calculator, Vaults, WrapXTAG } from "../views";
import "./style.scss";
import useTokens from "../hooks/tokens";
import Vault from "src/views/Vaults/Vault";
import { getVaults } from "src/constants/vaults";
import { IS_MAINNET } from "../constants/config";
import { warning } from "src/store/slices/messages-slice";
import { messages } from "src/constants/messages";
import { Backdrop, Fade, Grid } from "@material-ui/core";

function App() {
    const dispatch = useDispatch();

    const { connect, provider, hasCachedProvider, chainID, connected } = useWeb3Context();
    const address = useAddress();

    const [walletChecked, setWalletChecked] = useState(false);

    const isAppLoading = useSelector<IReduxState, boolean>(state => state.app.loading);
    const isAppLoaded = useSelector<IReduxState, boolean>(state => !Boolean(state.app.marketPrice));

    const { bonds } = useBonds();
    const vaults = getVaults(chainID);
    const { tokens } = useTokens();

    async function loadDetails(whichDetails: string) {
        let loadProvider = provider;

        if (whichDetails === "app") {
            loadApp(loadProvider);
        }

        if (whichDetails === "account" && address && connected) {
            loadAccount(loadProvider);
            if (isAppLoaded) return;

            loadApp(loadProvider);
        }

        if (whichDetails === "userBonds" && address && connected) {
            bonds.map(bond => {
                dispatch(calculateUserBondDetails({ address, bond, provider, networkID: chainID }));
            });
        }

        if (whichDetails === "userTokens" && address && connected) {
            tokens.map(token => {
                dispatch(calculateUserTokenDetails({ address, token, provider, networkID: chainID }));
            });
        }
    }

    const loadApp = useCallback(
        loadProvider => {
            dispatch(loadAppDetails({ networkID: chainID, provider: loadProvider }));
            bonds.map(bond => {
                dispatch(calcBondDetails({ address, bond, value: null, provider: loadProvider, networkID: chainID }));
            });
            tokens.map(token => {
                dispatch(calculateUserTokenDetails({ address: "", token, provider, networkID: chainID }));
            });
        },
        [connected],
    );

    const loadAccount = useCallback(
        loadProvider => {
            dispatch(loadAccountDetails({ networkID: chainID, address, provider: loadProvider }));
        },
        [connected],
    );

    useEffect(() => {
        if (hasCachedProvider()) {
            connect().then(() => {
                setWalletChecked(true);
            });
        } else {
            setWalletChecked(true);
        }
    }, []);

    useEffect(() => {
        if (walletChecked) {
            loadDetails("app");
            loadDetails("account");
            loadDetails("userBonds");
            loadDetails("userTokens");
        }
    }, [walletChecked]);

    useEffect(() => {
        if (connected) {
            loadDetails("app");
            loadDetails("account");
            loadDetails("userBonds");
            loadDetails("userTokens");
        }
    }, [connected]);

    if (isAppLoading) return <Loading />;

    return (<>{
        !window.ethereum ? <Fade in={true} mountOnEnter unmountOnExit>
            <Grid className="metamask-error-view">
                <Backdrop open={true}>
                    <Fade in={true}>
                        <div className="vault-card">
                            <div className="text-content">You need to install metamask chrome extension.</div>
                            <div className="text-content">Do you want to install it?</div>
                            <div className="toolbar">
                                <a href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en" target="_blank">Install -&gt;</a>
                            </div>
                        </div>
                    </Fade>
                </Backdrop>
            </Grid>
        </Fade> :
            <ViewBase>
                <Switch>
                    <Route exact path="/dashboard">
                        <Dashboard />
                    </Route>

                    <Route exact path="/">
                        <Redirect to="/vaults" />
                    </Route>

                    <Route exact path="/wrap-xtag">
                        <WrapXTAG />
                    </Route>

                    {/* <Route path="/stake">
                    <Stake />
                </Route> */}

                    {IS_MAINNET == true ? (
                        <Route path="/mints">
                            <Redirect to="/vaults" />
                        </Route>
                    ) : (
                        <Route path="/mints">
                            {bonds.map(bond => {
                                return (
                                    <Route exact key={bond.name} path={`/mints/${bond.name}`}>
                                        <Bond bond={bond} />
                                    </Route>
                                );
                            })}
                            <ChooseBond />
                        </Route>
                    )}

                    <Route path="/calculator">
                        <Calculator />
                    </Route>

                    <Route path="/vaults">
                        {vaults.map(vault => {
                            return (
                                <Route exact key={vault.TOKEN_TYPE} path={`/vaults/${vault.TOKEN_TYPE}`}>
                                    <Vault vault={vault} />
                                </Route>
                            );
                        })}
                        <Vaults />
                    </Route>

                    <Route component={NotFound} />
                </Switch>
            </ViewBase>
    }
    </>);
}

export default App;
