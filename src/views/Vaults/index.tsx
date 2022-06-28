import { useCallback, useEffect, useState } from "react";
import {
    Grid,
    Box,
    Zoom,
    Checkbox,
    FormControlLabel,
    Select,
    MenuItem
} from "@material-ui/core";
import { IVault, getVaults } from "../../constants/vaults";
import { useAddress, useWeb3Context } from "../../hooks";

import AutoComplete from "src/components/AutoComplete";
import "./vaults.scss";
import VaultRow from "./VaultRow";
import { ethers } from "ethers";
import { useSelector } from "react-redux";
import { IReduxState } from "src/store/slices/state.interface";
import { DEFAULT_NETWORK_RPC } from "../../constants/config";

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
    const address = useAddress();
    const { provider, chainID } = useWeb3Context();

    let provider1: any;
    let incorrectProvider = false;
    if (provider.connection.url == "Not supported network") {
        console.log("Not connected");
        // dispatch(warning({ text: messages.please_connect_wallet }));
        incorrectProvider = true;
        provider1 = new ethers.providers.JsonRpcProvider(DEFAULT_NETWORK_RPC)

    } else {
        provider1 = new ethers.providers.Web3Provider(window.ethereum)
    }

    const [balances, setBalances] = useState({} as any);
    const [vaults, setVaults] = useState([] as IVault[]);
    const [updatedBalance, setUpdateBalance] = useState(0);



    const _updated = useSelector<IReduxState, number>(state => {
        if (updatedBalance !== state.account.updated) {
            setUpdateBalance(state.account.updated)
        }
        return state.account.updated;
    });

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

    // const platforms = ['All'];
    const vaultTypes = ['All', 'Single Assets', 'LPs'];
    // const assets = ['All'];
    const sortItems = ['Default', 'APY', 'TVL'];

    const getBalances = async () => {
        vaults.map((vault: IVault) => {
            getVaultDetails(vault).then(b => {
                setBalances((prevState: any) => ({
                    ...prevState,
                    [vault.TOKEN_TYPE]: b
                }))
            })
        })
    }


    const getVaultDetails = async (vault: IVault) => {
        let balances;
        const tokenContract = new ethers.Contract(vault.TOKEN_ADDRESS, vault.TOKEN_ABI, provider1);
        let tokenDecimals = await tokenContract.decimals();

        if (incorrectProvider) {
            if (vault.version == "1") {
                const xtagContract = new ethers.Contract(vault.CONTRACT_ADDRESS, vault.CONTRACT_ABI, provider1);
                let totalStaked = await xtagContract.totalSupply()
                balances = {
                    balance: 0,
                    staked: 0,
                    totalStaked: ethers.utils.formatUnits(totalStaked, tokenDecimals)
                };
            } else if (vault.version == "2") {
                const vaultContract = new ethers.Contract(vault.VAULT_ADDRESS, vault.VAULT_ABI, provider1);
                let totalStaked = await vaultContract.totalSupply()

                balances = {
                    balance: 0,
                    staked: 0,
                    totalStaked: ethers.utils.formatUnits(totalStaked, tokenDecimals)
                };
            }
        } else {
            if (vault.version == "1") {
                const xtagContract = new ethers.Contract(vault.CONTRACT_ADDRESS, vault.CONTRACT_ABI, provider1);
                if (address) {
                    let [staked, totalStaked, balance] = await Promise.all(
                        [
                            xtagContract.balanceOf(address),
                            xtagContract.totalSupply(),
                            tokenContract.balanceOf(address),
                        ]
                    );
                    balances = {
                        balance: ethers.utils.formatUnits(balance, tokenDecimals),
                        staked: ethers.utils.formatUnits(staked, tokenDecimals),
                        totalStaked: ethers.utils.formatUnits(totalStaked, tokenDecimals)
                    };
                } else {
                    balances = {
                        staked: "0",
                        balance: "0",
                        totalStaked: "0"
                    }
                }
            } else if (vault.version == "2") {
                const vaultContract = new ethers.Contract(vault.VAULT_ADDRESS, vault.VAULT_ABI, provider1);

                if (address) {
                    let [staked, totalStaked, balance] = await Promise.all(
                        [
                            vaultContract.balanceOf(address),
                            vaultContract.totalDeposits(),
                            tokenContract.balanceOf(address),
                        ]
                    );
                    balances = {
                        balance: ethers.utils.formatUnits(balance, tokenDecimals),
                        staked: ethers.utils.formatUnits(staked, tokenDecimals),
                        totalStaked: ethers.utils.formatUnits(totalStaked, tokenDecimals)
                    };
                } else {
                    balances = {
                        staked: "0",
                        balance: "0",
                        totalStaked: "0"
                    }
                }
            }


        }


        return balances;
    }


    const handleFilterValuesChange = (value: boolean | string, type: string) => {
        if (type === 'sortBy') {
            if (value === 'Default') {
                setVaults(getVaults(chainID));
            } else if (value === 'APY') {

            } else if (value === 'TVL') {
                let vaultTypes = Object.keys(balances);
                let tvls = vaultTypes.map((vaultType: string) => [vaultType, balances[vaultType].totalStaked]).sort((a, b) => a[1] - b[1]);
                let tmp = [];
                for (const tvl of tvls) {
                    for (const vault of vaults) {
                        if (vault.TOKEN_TYPE === tvl[0]) {
                            tmp.push(vault);
                        }
                    }
                }
                setVaults(tmp);
            }
        }
        setFilterValues((prevState: FilterValuesInterface) => ({
            ...prevState,
            [type]: value
        }));
    }

    useEffect(() => {
        let x = getVaults(chainID);
        setVaults(getVaults(chainID));
        console.log('initialized vaults');
        return () => {

        };
    }, []);

    useEffect(() => {
        const callBackGetBalances = async () => {
            await getBalances();
        }
        callBackGetBalances();
    }, [vaults, updatedBalance])


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

                            <Grid className="filter-grid" item xs={12} sm={6} lg={3}>
                                <Box>
                                    <Select
                                        className="select-filter"
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
                                        className="select-filter"
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
                            <Grid id="checkbox-label" item xs={12} sm={6} lg={3}>
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
                            vaults.map((vault: IVault, index: number) => {
                                if ((filterValues.vaultType === 'All' ||
                                    filterValues.vaultType === 'LPs' && vault.LP ||
                                    filterValues.vaultType !== 'LPs' && !vault.LP) &&
                                    (filterValues.isRetiredVaults && vault.isExpired ||
                                        !filterValues.isRetiredVaults) &&
                                    (filterValues.isDepositedVaults && balances[vault.TOKEN_TYPE] && balances[vault.TOKEN_TYPE].staked > 0
                                        || !filterValues.isDepositedVaults)) {
                                    return <VaultRow
                                        key={index}
                                        vault={vault}
                                        balance={balances[vault.TOKEN_TYPE] && balances[vault.TOKEN_TYPE].balance}
                                        staked={balances[vault.TOKEN_TYPE] && balances[vault.TOKEN_TYPE].staked}
                                        totalStaked={balances[vault.TOKEN_TYPE] && balances[vault.TOKEN_TYPE].totalStaked} />
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