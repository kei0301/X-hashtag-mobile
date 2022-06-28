import { useCallback, useState } from "react";
import { NavLink } from "react-router-dom";
import Social from "./social";
import StakeIcon from "../../../assets/icons/stake.svg";
import BondIcon from "../../../assets/icons/bond.svg";
import xHashtagLogoIcon from "../../../assets/icons/xHashtag-V (2).svg";
import DashboardIcon from "../../../assets/icons/dashboard.svg";
import { trim, shorten } from "../../../helpers";
import { useAddress } from "../../../hooks";
import useBonds from "../../../hooks/bonds";
import { Link, Tooltip, makeStyles } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import "./drawer-content.scss";
import DocsIcon from "../../../assets/icons/stake.svg";
import GlobeIcon from "../../../assets/icons/wonderglobe.svg";
import XtagIcon from "../../../assets/icons/xtag-svg.png";
import classnames from "classnames";
import { useDispatch } from "react-redux";
import { warning } from "src/store/slices/messages-slice";
import { messages } from "src/constants/messages";

import { IS_MAINNET } from "../../../constants/config";

const useStyles = makeStyles(() => ({
    tooltip: {
    //   stroke: "url(#linearColors)",
        fontFamily: "Averta",
        fontSize: "14px",
        borderWidth: 0
    },
}));

function NavContent() {
    const classes = useStyles({});

    const dispatch = useDispatch();

    const [isActive] = useState();
    const address = useAddress();
    const { bonds } = useBonds();

    const checkPage = useCallback((location: any, page: string): boolean => {
        const currentPath = location.pathname.replace("/", "");
        if (currentPath.indexOf("dashboard") >= 0 && page === "dashboard") {
            return true;
        }
        if (currentPath.indexOf("wrap-xtag") >= 0 && page === "wrap-xtag") {
            return true;
        }
        if (currentPath.indexOf("stake") >= 0 && page === "stake") {
            return true;
        }
        if (currentPath.indexOf("mints") >= 0 && page === "mints") {
            return true;
        }
        if (currentPath.indexOf("calculator") >= 0 && page === "calculator") {
            return true;
        }
        if (currentPath.indexOf("vaults") >= 0 && page === "vaults") {
            return true;
        }
        return false;
    }, []);

    const css = `.header-logo { width: 55px; }`;

    return (
        <div className="dapp-sidebar">
            <style>{css}</style>
            <div className="branding-header">
                <Link href="https://xhashtag.io" target="_blank">
                    <img className="header-logo" alt="" src={xHashtagLogoIcon} />
                </Link>

                {address && (
                    <div className="wallet-link">
                        <Link href={`https://cchain.explorer.avax.network/address/${address}`} target="_blank">
                            <p>{shorten(address)}</p>
                        </Link>
                    </div>
                )}
            </div>

            <div className="dapp-menu-links">
                <div className="dapp-nav">
                    {/* <Link
                        component={NavLink}
                        to="/dashboard"
                        isActive={(match: any, location: any) => {
                            return checkPage(location, "dashboard");
                        }}
                        className={classnames("button-dapp-menu", { active: isActive })}
                    >
                        <span className="selected-badge">&nbsp;</span>
                        <div className="dapp-menu-item">
                            <img alt="" src={DashboardIcon} />
                            <p>Dashboard</p>
                        </div>
                    </Link> */}

                    {/* <Link
                        component={NavLink}
                        to="/wrap-xtag"
                        isActive={(match: any, location: any) => {
                            return checkPage(location, "wrap-xtag");
                        }}
                        className={classnames("button-dapp-menu", { active: isActive })}
                    >
                        <span className="selected-badge">&nbsp;</span>
                        <div className="dapp-menu-item">
                            <img alt="" src={BondIcon} />
                            <p>Wrap/Unwrap XTAG</p>
                        </div>
                    </Link> */}

                    {/* <Link
                        component={NavLink}
                        to="/stake"
                        isActive={(match: any, location: any) => {
                            return checkPage(location, "stake");
                        }}
                        className={classnames("button-dapp-menu", { active: isActive })}
                    >
                        <span className="selected-badge">&nbsp;</span>
                        <div className="dapp-menu-item">
                            <img alt="" src={StakeIcon} />
                            <p>Stake</p>
                        </div>
                    </Link> */}

                    {
                        IS_MAINNET == true ? (
                            <Tooltip title="Coming Soon" classes={{ tooltip: classes.tooltip}}>
                                <Link
                                    component={NavLink}
                                    id="bond-nav"
                                    to="/mints"
                                    // title="Coming Soon"
                                    isActive={(match: any, location: any) => {
                                        console.log(location)
                                        if (location.pathname === "/mints") {
                                            dispatch(warning({ text: messages.coming_soon }));
                                        }
                                        return checkPage(location, "mints");
                                    }}
                                    className={classnames("button-dapp-menu", { active: isActive })}
                                >
                                    <span className="selected-badge">&nbsp;</span>
                                    <div className="dapp-menu-item">
                                        <img alt="" src={BondIcon} />
                                        <p> Bond Marketplace</p>
                                    </div>
                                </Link>
                            </Tooltip>) : (
                            <Link
                            component={NavLink}
                            id="bond-nav"
                            to="/mints"
                            isActive={(match: any, location: any) => {
                                return checkPage(location, "mints");
                            }}
                            className={classnames("button-dapp-menu", { active: isActive })}
                        >
                            <span className="selected-badge">&nbsp;</span>
                            <div className="dapp-menu-item">
                                <img alt="" src={BondIcon} />
                                <p> Bond Marketplace</p>
                            </div>
                        </Link>
                            )
                    }

                    { 
                        IS_MAINNET == true ? (<div> </div>) : (
                            <div className="bond-discounts">
                                <p>Mint discounts</p>
                                {bonds.map((bond, i) => (
                                    <Link component={NavLink} to={`/mints/${bond.name}`} key={i} className={"bond"}>
                                        {!bond.bondDiscount ? (
                                            <Skeleton variant="text" width={"150px"} />
                                        ) : (
                                            <p>
                                                {bond.displayName}
                                                <span className="bond-pair-roi">{bond.bondDiscount && trim(bond.bondDiscount * 100, 2)}%</span>
                                            </p>
                                        )}
                                    </Link>
                                ))}
                            </div>
                    )}

                    {/* <Link
                        component={NavLink}
                        to="/calculator"
                        isActive={(match: any, location: any) => {
                            return checkPage(location, "calculator");
                        }}
                        className={classnames("button-dapp-menu", { active: isActive })}
                    >
                        <span className="selected-badge">&nbsp;</span>
                        <div className="dapp-menu-item">
                            <img alt="" src={GlobeIcon} />
                            <p>Calculator</p>
                        </div>
                    </Link> */}

                    <Link
                        component={NavLink}
                        to="/vaults"
                        isActive={(match: any, location: any) => {
                            return checkPage(location, "vaults");
                        }}
                        className={classnames("button-dapp-menu", { active: isActive })}
                    >
                        <span className="selected-badge">&nbsp;</span>
                        <div className="dapp-menu-item">
                            <img alt="" src={BondIcon} />
                            <p>Vaults</p>
                        </div>
                    </Link>

                    {/* <Link
                        href="https://wonderland.gitbook.io/wonderland/" target="_blank"
                        className={classnames("button-dapp-menu", { active: isActive })}
                    >
                        <span className="selected-badge">&nbsp;</span>
                        <div className="dapp-menu-item">
                            <img alt="" src={DocsIcon} />
                            <p>Docs</p>
                        </div>
                    </Link> */}

                    <Link
                        href="https://docs.google.com/forms/d/e/1FAIpQLSdZ4xkYa2ZcFz_reCkPM-oczybuikzuDuutu266zCrNheoJDQ/viewform" target="_blank"
                        className={classnames("button-dapp-menu", { active: isActive })}
                    >
                        <span className="selected-badge">&nbsp;</span>
                        <div className="dapp-menu-item">
                            <img alt="" src={DocsIcon} />
                            <p>Submit Feedback</p>
                        </div>
                    </Link>
                </div>
            </div>
            <div className="dapp-menu-doc-link">
                {/* <Link href="https://wonderland.gitbook.io/wonderland/" target="_blank">
                    <img alt="" src={DocsIcon} />
                    <p>Docs</p>
                </Link> */}
                {/* <Link href="https://legacy.wonderland.money/" target="_blank">
                    <p>Legacy website</p>
                </Link> */}
            </div>
            <Social />
        </div>
    );
}

export default NavContent;
