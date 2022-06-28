import { ethers } from "ethers";
import { LpReserveContract } from "../abi";
import { mimTime } from "../helpers/bond";
import { Networks } from "../constants/blockchain";

export async function getMarketPrice(networkID: Networks, provider: ethers.Signer | ethers.providers.Provider): Promise<number> {
    const mimTimeAddress = mimTime.getAddressForReserve(networkID);
    const pairContract = new ethers.Contract(mimTimeAddress, LpReserveContract, provider);
    const reserves = await pairContract.getReserves();
    // const token0 = await pairContract.token0();
    // const token1 = await pairContract.token1();
    // console.log("checking reserves ------->", {
    //     pairContract,
    //     token0,
    //     token1,
    //     reserve0: Number(reserves[0]),
    //     reserve1: Number(reserves[1]),
    // });
    const marketPrice = reserves[1] / reserves[0];
    return marketPrice;
}
