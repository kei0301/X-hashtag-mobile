import { useEffect, useState } from "react";
import {
    PublicKey,
    LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { Program, Provider, Idl } from '@project-serum/anchor';
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
    Paper,
    Grid,
    Box,
    Zoom,
    Checkbox,
    FormControlLabel,
    Select,
    MenuItem,
} from "@material-ui/core";
import { useSelector, useDispatch } from "react-redux";
import { IReduxState } from "../../../store/slices/state.interface";
import { trim } from "../../../helpers";

import AutoComplete from "src/components/AutoComplete";
import "../../Vaults/vaults.scss";
import VaultRow from "./VaultRow";
import {
    vaults,
    getPoolSigner,
    getProgramId,
    getStakeUserId,
    getPoolId,
} from "src/constants/solana";

interface FilterValuesInterface {
    isHideZeroBalances: boolean,
    isRetiredVaults: boolean,
    isDepositedVaults: boolean,
    isBoost: boolean,
    platform: string,
    vaultType: string,
    asset: string,
    sortBy: string,
}

function Vaults() {
    const dispatch = useDispatch();

    const [filterValues, setFilterValues] = useState({
        isHideZeroBalances: false,
        isRetiredVaults: false,
        isDepositedVaults: false,
        isBoost: false,
        platform: 'All',
        vaultType: 'All',
        asset: 'All',
        sortBy: 'Default',
    } as FilterValuesInterface)
    const [vaultBalances, setVaultBalances] = useState({} as any);
    const [filterVaults, setFilterVaults] = useState(vaults);

    // const platforms = ['All'];
    const vaultTypes = ['All', 'Single Assets', 'LPs'];
    // const assets = ['All'];
    const sortItems = ['Default', 'APY', 'TVL'];

    const handleFilterValuesChange = (value: boolean | string, type: string) => {
        if (type === 'sortBy') {
            if (value === 'Default') {
                setFilterVaults(vaults);
            } else if (value === 'APY') {

            } else if (value === 'TVL') {
                let vaultTypes = Object.keys(vaultBalances);
                let tvls = vaultTypes.map((vaultType: string) => [vaultType, vaultBalances[vaultType]?.totalStakedBalance || 0]).sort((a, b) => a[1] - b[1]);
                let tmp = [];
                for (const tvl of tvls) {
                    for (const vault of vaults) {
                        if (vault.type === tvl[0]) {
                            tmp.push(vault);
                        }
                    }
                }
                setFilterVaults(tmp);
            }
        }
        setFilterValues((prevState: FilterValuesInterface) => ({
            ...prevState,
            [type]: value
        }));
    }
    const { connection } = useConnection();

    const { signTransaction } = useWallet();
    const wallet = useWallet();

    const opts = {
        preflightCommitment: "processed"
    }

    const provider = new Provider(
        //@ts-ignore
        connection, wallet, opts.preflightCommitment,
    );
    async function getTokenBalance(pubkey: PublicKey) {
        if (!wallet.publicKey) {
            return 0;
        }

        const tokens = await provider.connection.getTokenAccountsByOwner(wallet.publicKey, { mint: pubkey });
        if (tokens.value.length == 0) {
            return 0;
        }
        const token = tokens.value.pop();
        let balance = 0;
        if (token) {
            const val = (await provider.connection.getTokenAccountBalance(token.pubkey)).value;
            console.log(val)
            balance = val.uiAmount || 0;
        }

        return parseFloat(balance.toFixed(6));
    }

    async function getStakedBalance(vault: any) {
        if (wallet.publicKey === null) {
            return 0;
        }

        const program = new Program(vault.idl as Idl, getProgramId(), provider);

        const [userPubkey] = await getStakeUserId(wallet.publicKey);

        try {
            const accountData = await program.account.user.fetch(userPubkey);
            return parseFloat((accountData.balanceStaked.toNumber() / LAMPORTS_PER_SOL).toFixed(6));
        } catch (e: any) {
            console.log(e.message)
            return 0;
        }

    }

    async function getTotalStakedBalance(vault: any) {
        const program = new Program(vault.idl as Idl, getProgramId(), provider);

        let poolObject = await program.account.pool.fetch(getPoolId());

        const balance = (await connection.getTokenAccountBalance(poolObject.stakingVault))?.value?.uiAmount?.toFixed(6);
        if (balance) {
            return parseFloat(balance);
        } else {
            return 0;
        }
    }

    useEffect(() => {
        vaults.map(async (vault) => {
            const totalStakedBalance = await getTotalStakedBalance(vault);
            const stakedBalance = await getStakedBalance(vault);
            const walletBalance = await getTokenBalance(new PublicKey(vault.mint));
            setVaultBalances((pre: any) => ({
                ...pre, [vault.type]: {
                    totalStakedBalance, stakedBalance, walletBalance
                }
            }));
        })

        return () => {

        }
    }, [wallet])

    return (
        <div className="vaults-view">
            <Zoom in={true}>
                <>
                    <div className="vaults-view-card">
                        <Grid container item xs={12} spacing={2} className="vaults-view-card-filters">
                            {/* <Grid item xs={12} sm={6} lg={3}>
                            <Box>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={filterValues.isHideZeroBalances}
                                            onChange={(e: any) => handleFilterValuesChange(e.target.checked, 'isHideZeroBalances')}
                                            className="filter filter-checkbox"
                                        />
                                    }
                                    label="Hide Zero Balances"
                                    className="filter filter-checkbox-label"
                                />
                            </Box>
                            <Box marginTop={5}>
                                <AutoComplete
                                    options={platforms}
                                    inputValue={filterValues.platform}
                                    label="Platform"
                                    handleChange={(e: any) => handleFilterValuesChange(e.target.value, 'platform')}
                                    handleSelect={(value: string) => handleFilterValuesChange(value, 'platform')}
                                />
                            </Box>
                        </Grid> */}
                            <Grid item xs={12} sm={6} lg={3}>
                                <Box>
                                    <Select
                                        label={<span id="checkbox-label"> Vault Type </span>}
                                        defaultValue={'All'}
                                        onChange={(e) => handleFilterValuesChange(e.target.value + '', 'vaultType')}>
                                        {
                                            vaultTypes.map(t => <MenuItem id="dropdown-select" value={t}>{t}</MenuItem>)
                                        }
                                    </Select>
                                </Box>
                            </Grid>

                            <Grid item xs={12} sm={6} lg={3}>
                                <Box>
                                    <Select
                                        label={<span id="dropdown-select"> Sort By </span>}
                                        defaultValue={'Default'}
                                        onChange={(e) => handleFilterValuesChange(e.target.value + '', 'sortBy')}>
                                        {
                                            sortItems.map(t => <MenuItem id="dropdown-select" value={t}>{t}</MenuItem>)
                                        }
                                    </Select>
                                </Box>
                            </Grid>

                            <Grid item xs={12} sm={6} lg={3}>
                                <Box>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={filterValues.isDepositedVaults}
                                                onChange={(e: any) => handleFilterValuesChange(e.target.checked, 'isDepositedVaults')}
                                                className="filter filter-checkbox"
                                            />
                                        }
                                        label={<span id="checkbox-label"> Deposited Vaults </span>}
                                        className="filter filter-checkbox-label"
                                    />
                                </Box>
                            </Grid>

                            <Grid item xs={12} sm={6} lg={3}>
                                <Box>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={filterValues.isRetiredVaults}
                                                onChange={(e: any) => handleFilterValuesChange(e.target.checked, 'isRetiredVaults')}
                                                className="filter filter-checkbox"
                                            />
                                        }
                                        label={<span id="checkbox-label"> Retired Vaults </span>}
                                        className="filter filter-checkbox-label"
                                    />
                                </Box>
                            </Grid>



                            {/* <Grid item xs={12} sm={6} lg={3}>
                            <Box>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={filterValues.isBoost}
                                            onChange={(e: any) => handleFilterValuesChange(e.target.checked, 'isBoost')}
                                            className="filter filter-checkbox"
                                        />
                                    }
                                    label="Boost"
                                    className="filter filter-checkbox-label"
                                />
                            </Box>
                            <Box marginTop={5}>
                                <AutoComplete
                                    options={assets}
                                    inputValue={filterValues.asset}
                                    label="Asset"
                                    handleChange={(e: any) => handleFilterValuesChange(e.target.value, 'asset')}
                                    handleSelect={(value: string) => handleFilterValuesChange(value, 'asset')}
                                />
                            </Box>
                        </Grid> */}
                        </Grid>
                    </div>
                    <div className="vaults-wrapper">
                        {
                            filterVaults.map((vault: any, index: number) => {
                                if ((filterValues.vaultType === 'All' ||
                                    filterValues.vaultType === 'LPs' && vault.lp ||
                                    filterValues.vaultType !== 'LPs' && !vault.lp) &&
                                    (filterValues.isRetiredVaults && vault.isExpired ||
                                        !filterValues.isRetiredVaults) &&
                                    (filterValues.isDepositedVaults && (vaultBalances[vault.type]?.stakedBalance || 0) > 0
                                        || !filterValues.isDepositedVaults)) {
                                    return <VaultRow
                                        key={index}
                                        vault={vault}
                                        balance={vaultBalances[vault.type]?.walletBalance || 0}
                                        staked={vaultBalances[vault.type]?.stakedBalance || 0}
                                        totalStaked={vaultBalances[vault.type]?.totalStakedBalance || 0} />
                                }
                                return null;
                            })
                        }
                    </div>
                </>
            </Zoom>
        </div>
    )
}

export default Vaults;