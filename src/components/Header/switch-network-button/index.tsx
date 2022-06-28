import React, { useState } from "react";
import "./network-button.scss";
import Networks from "../../../components/Networks";
import avaxIco from "../../../assets/icons/avalanche.svg"

function SwitchNetworkButton() {
    const [showNetwork, setShowNetwork] = useState(false);

    const handelOpenNetworks = () => {
        setShowNetwork(true);
    };

    const handelCloseNetworks = () => {
        setShowNetwork(false);
    };

    const network = localStorage.getItem('network');

    return (
        <div>
            <div className="network-button mb_none" onClick={handelOpenNetworks}>
                <p>{network === null || network === 'avalanche' ? 'AVALANCHE' : network.toUpperCase()}</p>
            </div>
            <div className="network-button mb_7" onClick={handelOpenNetworks}>
                <p>{network === null || network === 'avalanche' ? <img src={avaxIco} alt='avax' width='20px' /> : network.toUpperCase()}</p>
            </div>
            <Networks open={showNetwork} handleClose={handelCloseNetworks} />
        </div>
    );
}

export default SwitchNetworkButton;
