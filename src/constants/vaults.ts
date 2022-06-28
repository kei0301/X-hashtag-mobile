import {
    StakeTokenContract,
    StakingRewards,
    StakingRewardsFactory,
    BondingContract,
    Vault,
    sUniversalERC20,
    UniversalMockERC20Token
} from "src/abi";
import { Networks } from "./blockchain";
import xtagSvg from '../assets/tokens/xtag.svg';
export interface IVault {
    APR: string;
    version: string;
    TOKEN_TYPE: string;
    TOKEN_NAME: string;
    TOKEN_ICON: string;
    TOKEN_ADDRESS: string;
    TOKEN_ABI: any;
    CONTRACT_ADDRESS: string;
    CONTRACT_ABI: any;
    FACTORY_ADDRESS: string;
    FACTORY_ABI: any;
    VAULT_ADDRESS: string;
    VAULT_ABI: any;
    sXTAG_ADDRESS: string;
    sXTAG_ABI: any;
    LP: boolean;
    isExpired: boolean;
    LIMIT: string;
    GENESIS: string;
}
const AVAX_MAINNET: IVault[] = [{
    APR: "??%",
    version: "2",
    TOKEN_TYPE: "xtag",
    TOKEN_NAME: "XTAG",
    TOKEN_ICON: xtagSvg,
    TOKEN_ADDRESS: "0xA608D79C5f695C0D4C0E773A4938b57e18e0fc57",
    TOKEN_ABI: UniversalMockERC20Token,
    CONTRACT_ADDRESS: "0x65974DD22F724C606d868D4058335F62554cF453",
    CONTRACT_ABI: StakingRewards,
    FACTORY_ADDRESS: "0xfBF3c4FA2EBEE0B01a2E46f5FE545d54f496Ae01",
    FACTORY_ABI: StakingRewardsFactory,
    LP: false,
    isExpired: false,
    VAULT_ABI: Vault,
    VAULT_ADDRESS: "0x5bb7d5221fdd68d61ad75d5d15b5b99443f1d756",
    sXTAG_ABI: sUniversalERC20,
    sXTAG_ADDRESS: "0xA661a0d5F79e391B1b1D249cbacEF4021D2fB59b",
    LIMIT: "1M",
    GENESIS: "1645346580000"
}];
const RINKEBY_MAINNET: IVault[] = [];
const AVAX_FUJI_TESTNET: IVault[] = [
    {
        APR: "19.2%",
        version: "1",
        TOKEN_TYPE: "testtoken",
        TOKEN_NAME: "TEST TOKEN",
        TOKEN_ICON: xtagSvg,
        TOKEN_ADDRESS: "0x5Fa79C160A73E38ff48592Aa10cb407dD706799C",
        TOKEN_ABI: BondingContract,
        CONTRACT_ADDRESS: "0x65974DD22F724C606d868D4058335F62554cF453",
        CONTRACT_ABI: StakingRewards,
        FACTORY_ADDRESS: "0xfBF3c4FA2EBEE0B01a2E46f5FE545d54f496Ae01",
        FACTORY_ABI: StakingRewardsFactory,
        LP: false,
        isExpired: false,
        VAULT_ABI: "",
        VAULT_ADDRESS: "",
        sXTAG_ABI: "",
        sXTAG_ADDRESS: "",
        LIMIT: "None",
        GENESIS: "1645346580000"

    },
    {
        APR: "30%",
        version: "2",
        TOKEN_TYPE: "testtoken2",
        TOKEN_NAME: "XTAG 3-month",
        TOKEN_ICON: xtagSvg,
        TOKEN_ADDRESS: "0x41A452769dd05829304723e39443e4d1F7d73dBA",
        TOKEN_ABI: UniversalMockERC20Token,
        CONTRACT_ADDRESS: "0x65974DD22F724C606d868D4058335F62554cF453",
        CONTRACT_ABI: StakingRewards,
        FACTORY_ADDRESS: "0xfBF3c4FA2EBEE0B01a2E46f5FE545d54f496Ae01",
        FACTORY_ABI: StakingRewardsFactory,
        LP: false,
        isExpired: false,
        VAULT_ABI: Vault,
        VAULT_ADDRESS: "0xA06e34E53036fa97e1EC0723D0b4B504cd7f16FB",
        sXTAG_ABI: sUniversalERC20,
        sXTAG_ADDRESS: "0x103e65B426aa8652456107daFBc43941db701215",
        LIMIT: "1M",
        GENESIS: "1645346580000"
    },
    {
        APR: "30%",
        version: "2",
        TOKEN_TYPE: "testtoken2.1",
        TOKEN_NAME: "XTAG 6-month",
        TOKEN_ICON: xtagSvg,
        TOKEN_ADDRESS: "0x41A452769dd05829304723e39443e4d1F7d73dBA",
        TOKEN_ABI: UniversalMockERC20Token,
        CONTRACT_ADDRESS: "0x65974DD22F724C606d868D4058335F62554cF453",
        CONTRACT_ABI: StakingRewards,
        FACTORY_ADDRESS: "0xfBF3c4FA2EBEE0B01a2E46f5FE545d54f496Ae01",
        FACTORY_ABI: StakingRewardsFactory,
        LP: false,
        isExpired: false,
        VAULT_ABI: Vault,
        VAULT_ADDRESS: "0xce45F696742167705021f6aAF8F4Ad5A8FBC90D0",
        sXTAG_ABI: sUniversalERC20,
        sXTAG_ADDRESS: "0x103e65B426aa8652456107daFBc43941db701215",
        LIMIT: "1M",
        GENESIS: "1645440418702"
    }
];

const ROPSTEN_MAINNET: IVault[] = [];

export const getVaults = (networkID: number) => {
    if (networkID === Networks.AVAX) return AVAX_MAINNET;
    if (networkID === Networks.RINKEBY) return RINKEBY_MAINNET;
    if (networkID === Networks.ROPSTEN) return ROPSTEN_MAINNET;
    if (networkID === Networks.AVAX_FUJI) return AVAX_FUJI_TESTNET;

    throw Error("Network don't support");
};
