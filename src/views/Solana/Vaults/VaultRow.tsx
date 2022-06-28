import { useSelector } from "react-redux";
import { Box, Grid, Link } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { IReduxState } from "../../../store/slices/state.interface";

import { NavLink } from "react-router-dom";
import xtagSvg from '../../../assets/tokens/xtag.svg';
import "../../Vaults/vaultrow.scss";
import { trim } from "src/helpers";


interface IVaultRow {
    vault: any;
    balance: number;
    staked: number;
    totalStaked: number;
}
function VaultRow({ balance, staked, totalStaked, vault }: IVaultRow) {
    // const isAppLoading = useSelector<IReduxState, boolean>(state => state.app.loading);
    const isAppLoading = false;
    return (
        <Link component={NavLink} to={`/vaults/${vault.type}`} className="vault-row">
            <Grid container item xs={12} spacing={2} className="vaults-view-card-metrics">
                <Grid item xs={12} sm={1} className="token-icon-column">
                    <Box textAlign="center" className="token-icon-wrapper">
                        <img src={xtagSvg} style={{ height: "32px", width: "32px" }} />
                    </Box>
                </Grid>

                <Grid item xs={12} sm={4}>
                    <Box>
                        <p className="vaults-view-card-metrics-value token-name">
                            {vault.name}
                        </p>
                        {/* <p className="vaults-view-card-metrics-title">Buy Token</p> */}
                    </Box>
                </Grid>

                <Grid item xs={12} sm={2}>
                    <Box textAlign="center">
                        <p className="vaults-view-card-metrics-value">{isAppLoading ? <Skeleton width="100px" /> : `$${trim(Number(balance), 3)}`}</p>
                        <p className="vaults-view-card-metrics-title">Wallet</p>
                    </Box>
                </Grid>

                <Grid item xs={12} sm={2}>
                    <Box textAlign="center">
                        <p className="vaults-view-card-metrics-value">{isAppLoading ? <Skeleton width="100px" /> : `$${trim(Number(staked), 3)}`}</p>
                        <p className="vaults-view-card-metrics-title">Deposited</p>
                    </Box>
                </Grid>

                <Grid item xs={12} sm={1}>
                    <Box textAlign="center">
                        <p className="vaults-view-card-metrics-value">{isAppLoading ? <Skeleton width="100px" /> : `3.92%`}</p>
                        <p className="vaults-view-card-metrics-title">APR</p>
                    </Box>
                </Grid>
                {/* 
            <Grid item xs={12} sm={1}>
                <Box textAlign="center">
                    <p className="vaults-view-card-metrics-value">{isAppLoading ? <Skeleton width="100px" /> : `0.0105%`}</p>
                    <p className="vaults-view-card-metrics-title">Daily</p>
                </Box>
            </Grid> */}

                <Grid item xs={12} sm={2}>
                    <Box textAlign="center">
                        <p className="vaults-view-card-metrics-value">{isAppLoading ? <Skeleton width="100px" /> : `$${trim(Number(totalStaked), 3)}`}</p>
                        <p className="vaults-view-card-metrics-title">TVL</p>
                    </Box>
                </Grid>
            </Grid>
        </Link>
    )
}
export default VaultRow;