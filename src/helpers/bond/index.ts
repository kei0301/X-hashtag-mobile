import { Networks } from "../../constants/blockchain";
import { LPBond, CustomLPBond } from "./lp-bond";
import { StableBond, CustomBond } from "./stable-bond";

import MimIcon from "../../assets/tokens/MIM.svg";
import DAIIcon from "../../assets/tokens/DAI.e.png";
import USDCIcon from "../../assets/tokens/USDC.e.png";

import AvaxIcon from "../../assets/tokens/AVAX.svg";
import MimTimeIcon from "../../assets/tokens/TIME-MIM.svg";
import AvaxTimeIcon from "../../assets/tokens/TIME-AVAX.svg";

import { StableBondContract, LpBondContract, WavaxBondContract, StableReserveContract, LpReserveContract } from "../../abi";

// dai
export const mim = new StableBond({
    name: "USDC",
    displayName: "USDC",
    bondToken: "USDC",
    bondIconSvg: USDCIcon,
    bondContractABI: StableBondContract,
    reserveContractAbi: StableReserveContract,
    networkAddrs: {
        [Networks.AVAX]: {
            bondAddress: "0x694738E0A438d90487b4a549b201142c1a97B556",
            reserveAddress: "0x130966628846BFd36ff31a822705796e8cb8C18D",
        },
        [Networks.RINKEBY]: {
            bondAddress: "0xc41512C7E7b81a56DCfE8f667D12b122a6d76421",
            reserveAddress: "0xaaDD4B360f9005A1e1C784c8F385579B84e3a4F7",
        },
        [Networks.ROPSTEN]: {
            bondAddress: "0xAf09b5534e51538d3e1E4A2d1C3a25322BFC8098",
            reserveAddress: "0x272246D43fa0eeee18C034f62eF8498202192b64",
        },
        [Networks.AVAX_FUJI]: {
            bondAddress: "0x5Fa79C160A73E38ff48592Aa10cb407dD706799C",
            reserveAddress: "0x94C76375Ea86aC05764FBB2e7A4Ddc729Ac9806B",
        },
    },
    tokensInStrategy: "60500000000000000000000000",
});

// export const usdc = new StableBond({
//     name: "usdc",
//     displayName: "USDC",
//     bondToken: "USDC",
//     bondIconSvg: USDCIcon,
//     bondContractABI: StableBondContract,
//     reserveContractAbi: StableReserveContract,
//     networkAddrs: {
//         [Networks.AVAX]: {
//             bondAddress: "0x694738E0A438d90487b4a549b201142c1a97B556",
//             reserveAddress: "0x130966628846BFd36ff31a822705796e8cb8C18D",
//         },
//         [Networks.RINKEBY]: {
//             bondAddress: "0xc41512C7E7b81a56DCfE8f667D12b122a6d76421",
//             reserveAddress: "0xaaDD4B360f9005A1e1C784c8F385579B84e3a4F7",
//         },
//         [Networks.ROPSTEN]: {
//             bondAddress: "0xAf09b5534e51538d3e1E4A2d1C3a25322BFC8098",
//             reserveAddress: "0xF47901640BF118aF92CB420Fb5799d35a5767DD6",
//         },
//     },
//     tokensInStrategy: "60500000000000000000000000",
// });

export const dai = new StableBond({
    name: "DAI",
    displayName: "DAI",
    bondToken: "DAI",
    bondIconSvg: DAIIcon,
    bondContractABI: StableBondContract,
    reserveContractAbi: StableReserveContract,
    networkAddrs: {
        [Networks.AVAX]: {
            bondAddress: "0x694738E0A438d90487b4a549b201142c1a97B556",
            reserveAddress: "0x130966628846BFd36ff31a822705796e8cb8C18D",
        },
        [Networks.RINKEBY]: {
            bondAddress: "0xc41512C7E7b81a56DCfE8f667D12b122a6d76421",
            reserveAddress: "0xaaDD4B360f9005A1e1C784c8F385579B84e3a4F7",
        },
        [Networks.ROPSTEN]: {
            bondAddress: "0xAf09b5534e51538d3e1E4A2d1C3a25322BFC8098",
            reserveAddress: "0xAbba78ceA704f72a4548242114c6dFd05476E217",
        },
        [Networks.AVAX_FUJI]: {
            bondAddress: "0x5Fa79C160A73E38ff48592Aa10cb407dD706799C",
            reserveAddress: "0xC9D26E47883271ff70182f4266C18fb454FE1B43",
        },
    },
    tokensInStrategy: "60500000000000000000000000",
});

// export const wavax = new CustomBond({
//     name: "wavax",
//     displayName: "wAVAX",
//     bondToken: "AVAX",
//     bondIconSvg: AvaxIcon,
//     bondContractABI: WavaxBondContract,
//     reserveContractAbi: StableReserveContract,
//     networkAddrs: {
//         [Networks.AVAX]: {
//             bondAddress: "0xE02B1AA2c4BE73093BE79d763fdFFC0E3cf67318",
//             reserveAddress: "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
//         },
//         [Networks.RINKEBY]: {
//             bondAddress: "0x694738E0A438d90487b4a549b201142c1a97B556",
//             reserveAddress: "0x130966628846BFd36ff31a822705796e8cb8C18D",
//         },
//     },
//     tokensInStrategy: "756916000000000000000000",
// });

// dai-usv
export const mimTime = new LPBond({
    name: "mim_time_lp",
    displayName: "XIGMA-MIM LP",
    bondToken: "MIM",
    bondIconSvg: MimTimeIcon,
    bondContractABI: LpBondContract,
    reserveContractAbi: LpReserveContract,
    networkAddrs: {
        [Networks.AVAX]: {
            bondAddress: "0xA184AE1A71EcAD20E822cB965b99c287590c4FFe",
            reserveAddress: "0x113f413371fc4cc4c9d6416cf1de9dfd7bf747df",
        },
        [Networks.RINKEBY]: {
            bondAddress: "0xF041D242561795cd56CC14FB4CD7Bf7229759646",
            reserveAddress: "0x892f3B0DD954A18BDFDC353F3D23C2d72248323d",
        },
        [Networks.ROPSTEN]: {
            bondAddress: "0xF041D242561795cd56CC14FB4CD7Bf7229759646",
            reserveAddress: "0x892f3B0DD954A18BDFDC353F3D23C2d72248323d",
        },
        [Networks.AVAX_FUJI]: {
            bondAddress: "0xF041D242561795cd56CC14FB4CD7Bf7229759646",
            reserveAddress: "0x892f3B0DD954A18BDFDC353F3D23C2d72248323d",
        },
    },
    lpUrl: "https://www.traderjoexyz.com/#/pool/0x130966628846BFd36ff31a822705796e8cb8C18D/0xb54f16fB19478766A268F172C9480f8da1a7c9C3",
});

// export const avaxTime = new CustomLPBond({
//     name: "avax_time_lp",
//     displayName: "XIGMA-AVAX LP",
//     bondToken: "AVAX",
//     bondIconSvg: AvaxTimeIcon,
//     bondContractABI: LpBondContract,
//     reserveContractAbi: LpReserveContract,
//     networkAddrs: {
//         [Networks.AVAX]: {
//             bondAddress: "0xc26850686ce755FFb8690EA156E5A6cf03DcBDE1",
//             reserveAddress: "0xf64e1c5B6E17031f5504481Ac8145F4c3eab4917",
//         },
//         [Networks.RINKEBY]: {
//             bondAddress: "0x694738E0A438d90487b4a549b201142c1a97B556",
//             reserveAddress: "0x130966628846BFd36ff31a822705796e8cb8C18D",
//         },
//     },
//     lpUrl: "https://www.traderjoexyz.com/#/pool/AVAX/0xb54f16fB19478766A268F172C9480f8da1a7c9C3",
// });

// export default [mim, wavax, mimTime, avaxTime];
export default [mim, dai];
