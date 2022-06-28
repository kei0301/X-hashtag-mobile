import { PublicKey } from "@solana/web3.js";
import xtagIdl from '../assets/json/idl.json';

export function getPoolId() {
    return new PublicKey('GnP3AtRmgCRtVN6oL8wih9gdNaPaPb5xRpTDtEZbdyDZ')
}
export function getProgramId() {
    return new PublicKey('DKjeBtpHyWnC8RuEPAeG8Au8P12HyTMZ73KDFFktVtWT');
}
export function getStakeTokenId() {
    return new PublicKey('HuMJHQL3UbiECz8ZB7aAWeEG9Nn3WrHmkgwgNpkWYL77');
}
export async function getPoolSigner() {
    const poolPubkey = getPoolId();
    const programPubkey = getProgramId();
    return await PublicKey.findProgramAddress(
        [poolPubkey.toBuffer()],
        programPubkey
    )
}
export async function getStakeUserId(walletPubkey: PublicKey) {
    const poolPubkey = getPoolId();
    const programPubkey = getProgramId();
    return await PublicKey.findProgramAddress(
        [walletPubkey.toBuffer(), poolPubkey.toBuffer()],
        programPubkey
    )
}
export const vaults = [
    {
        mint: 'HuMJHQL3UbiECz8ZB7aAWeEG9Nn3WrHmkgwgNpkWYL77',
        name: 'XTAG',
        type: 'xtag',
        idl: xtagIdl,
        lp: false,
        isExpired: false,
        version: 1
    },
    {
        mint: 'HuMJHQL3UbiECz8ZB7aAWeEG9Nn3WrHmkgwgNpkWYL77',
        name: 'XTAG',
        type: 'xtag2',
        idl: xtagIdl,
        lp: false,
        isExpired: false,
        version: 2
    }
]