import { IconButton, Modal, Paper, SvgIcon } from "@material-ui/core";
import { ReactComponent as XIcon } from "../../assets/icons/x.svg";
import AvaxIcon from "../../assets/tokens/AVAX.svg";
import SolanaIcon from "../../assets/tokens/SOL.png";
import "./networks.scss";
import NetworkLogo from "../NetworkLogo";
import { IS_SOLANA_ENABLED } from "../../constants/config";


interface IAdvancedSettingsProps {
    open: boolean;
    handleClose: () => void;
}

function Networks({ open, handleClose }: IAdvancedSettingsProps) {
    const onClose = () => {
        handleClose();
    };

    const changeNetwork = (network: string) => {
        localStorage.setItem('network', network);
        window.location.reload();
    }

    let WITH_SOLANA_ENABLED = (
        <Modal id="hades" open={open} onClose={onClose} hideBackdrop>
            <Paper className="network-token-poper">
                <div className="cross-wrap network-cros-wrap">
                    <IconButton onClick={onClose}>
                        <SvgIcon color="primary" component={XIcon} />
                    </IconButton>
                </div>
                <div className="networks-list">
                    <div className="network" onClick={(e) => changeNetwork('solana')}>
                        <NetworkLogo img={SolanaIcon} />
                        <div className="network-header-name">
                            <p>SOLANA</p>
                        </div>
                    </div>
                    <div className="network" onClick={(e) => changeNetwork('avalanche')}>
                        <NetworkLogo img={AvaxIcon} />
                        <div className="network-header-name">
                            <p>AVALANCHE</p>
                        </div>
                    </div>
                </div>


                {/* <div className="network" onClick={(e) => changeNetwork('solana')}>
                    <img src={SolanaIcon} /> SOLANA
                </div> */}
            </Paper>
        </Modal>
    );

    let WITHOUT_SOLANA_ENABLED = (
        <Modal id="hades" open={open} onClose={onClose} hideBackdrop>
            <Paper className="network-token-poper">
                <div className="cross-wrap network-cros-wrap">
                    <IconButton onClick={onClose}>
                        <SvgIcon color="primary" component={XIcon} />
                    </IconButton>
                </div>
                <div className="networks-list">
                    <div className="network" onClick={(e) => changeNetwork('avalanche')}>
                        <NetworkLogo img={AvaxIcon} />
                        <div className="network-header-name">
                            <p>AVALANCHE</p>
                        </div>
                    </div>
                </div>

            </Paper>
        </Modal>
    );

    if (IS_SOLANA_ENABLED) {
        return WITH_SOLANA_ENABLED;
    } else {
        return WITHOUT_SOLANA_ENABLED;
    }
}

export default Networks;
