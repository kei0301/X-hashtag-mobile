import { useState } from "react";
import { NavLink, useHistory } from "react-router-dom";
import { SvgIcon, Link } from "@material-ui/core";
import { ReactComponent as XIcon } from "../../../../assets/icons/x.svg";
import { useEscape } from "../../../../hooks";

function VaultHeader() {
    const [open, setOpen] = useState(false);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    let history = useHistory();

    useEscape(() => {
        if (open) handleClose;
        else history.push("/vaults");
    });

    return (
        <div className="vault-header">
            <Link component={NavLink} to="/vaults" className="cancel-vault">
                <SvgIcon color="primary" component={XIcon} />
            </Link>
        </div>
    );
}

export default VaultHeader;
