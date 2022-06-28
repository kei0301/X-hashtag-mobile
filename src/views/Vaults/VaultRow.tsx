import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Grid, Link } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { IReduxState } from "../../store/slices/state.interface";

import { NavLink } from "react-router-dom";
import "./vaultrow.scss";
import { trim } from "src/helpers";
import { IVault } from "src/constants/vaults";
import { warning } from "src/store/slices/messages-slice";
import { messages } from "src/constants/messages";

interface IVaultRow {
    vault: IVault | undefined;
    balance: string;
    staked: string;
    totalStaked: string;
}
function VaultRow({ balance, staked, totalStaked, vault }: IVaultRow) {
    console.log("vaultrow", { balance, staked, totalStaked });

    const dispatch = useDispatch();

    const isAppLoading = useSelector<IReduxState, boolean>(state => state.app.loading);

    const trimmedWalletBalance = trim(Number(balance || 0), 6);
    const trimmedStakedBalance = trim(Number(staked || 0), 6);
    const trimmedTotalStakedBalance = trim(Number(totalStaked || 0), 6);

    useEffect(() => {
        return () => {

        };
    }, []);

    let grid = (<Grid container item xs={12} spacing={2} className="vaults-view-card-metrics">
        <Grid item xs={12} sm={1} className="token-icon-column">
            <Box textAlign="center" className="token-icon-wrapper">
                <img src={vault?.TOKEN_ICON} style={{ height: "32px", width: "32px" }} />
            </Box>
        </Grid>

        <Grid item xs={12} sm={4}>
            <Box>
                <p className="vaults-view-card-metrics-value token-name">
                    {vault?.TOKEN_NAME}
                </p>
                <p className="vaults-view-card-metrics-title"> Vault Limit {vault?.LIMIT} </p>
            </Box>
        </Grid>

        <Grid item xs={6} sm={2}>
            <Box textAlign="center">
                <p className="vaults-view-card-metrics-value">{isAppLoading ? <Skeleton width="100px" /> : `$${trim(Number(trimmedWalletBalance), 3)}`}</p>
                <p className="vaults-view-card-metrics-title">Balance</p>
            </Box>
        </Grid>

        <Grid item xs={6} sm={2}>
            <Box textAlign="center">
                <p className="vaults-view-card-metrics-value">{isAppLoading ? <Skeleton width="100px" /> : `${trim(Number(trimmedStakedBalance), 3)}`}</p>
                <p className="vaults-view-card-metrics-title">Deposited</p>
            </Box>
        </Grid>

        <Grid item xs={6} sm={1}>
            <Box textAlign="center">
                <p className="vaults-view-card-metrics-value">{isAppLoading ? <Skeleton width="100px" /> : `${vault?.APR}`}</p>
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

        <Grid item xs={6} sm={2}>
            <Box textAlign="center">
                <p className="vaults-view-card-metrics-value">{isAppLoading ? <Skeleton width="100px" /> : `$${trim(Number(trimmedTotalStakedBalance), 3)}`}</p>
                <p className="vaults-view-card-metrics-title">TVL</p>
            </Box>
        </Grid>



    </Grid>);

    if (Date.now() < Number(vault?.GENESIS)) {
        let genesis = Number(vault?.GENESIS)
        return (
            <Link className="vault-row"
                onClick={
                    () => {
                        dispatch(warning({ text: `${messages.vault_not_open_yet} ${new Date(genesis)}` }));
                    }
                }>
                {grid}
            </Link>
        )
    } else {
        return (
            <Link component={NavLink} to={`/vaults/${vault?.TOKEN_TYPE}`} className="vault-row">
                {grid}
            </Link>
        )
    }

}
export default VaultRow;