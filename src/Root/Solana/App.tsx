import { useEffect, useState, useCallback } from "react";
import { Route, Redirect, Switch } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ViewBase from "../../components/ViewBase";
import {
    // Stake,
    // ChooseBond,
    // Bond,
    Dashboard,
    NotFound,
    ComingSoon,
    // Calculator,
    SolanaVaults,
    // WrapXTAG
} from "../../views";
import "../style.scss";
// import useTokens from "../../hooks/tokens";
import Vault from "src/views/Solana/Vaults/Vault";
import { vaults } from "src/constants/solana";

function SolanaApp() {
    const dispatch = useDispatch();
    return (
        <ViewBase>
            <Switch>
                <Route exact path="/dashboard">
                    <Dashboard />
                </Route>
                <Route exact path="/">
                    <Redirect to="/vaults" />
                </Route>
                <Route exact path="/marketplace">
                    <Redirect to="/vaults" />
                </Route>

                {/* 
                <Route exact path="/wrap-xtag">
                    <WrapXTAG />
                </Route>

                <Route path="/stake">
                    <Stake />
                </Route>

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

                <Route path="/calculator">
                    <Calculator />
                </Route> 
                */}
                {/* <Route path="/marketplace">
                    <ComingSoon />
                </Route> */}

                <Route path="/vaults">
                    {vaults.map(vault => {
                        return (
                            <Route exact key={vault.type} path={`/vaults/${vault.type}`}>
                                <Vault vault={vault} />
                            </Route>
                        );
                    })}
                    <SolanaVaults />
                </Route>

                <Route component={NotFound} />
            </Switch>
        </ViewBase>
    );
}

export default SolanaApp;
