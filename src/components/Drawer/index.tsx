import { Drawer } from "@material-ui/core";
import DrawerContent from "./drawer-content";
import SolanaDrawerContent from "./Solana/drawer-content";
import { IS_SOLANA_ENABLED } from "../../constants/config"

function Sidebar() {
    const network = localStorage.getItem('network');
    return (
        <Drawer variant="permanent" anchor="left">
            {
                network === 'solana' ? <SolanaDrawerContent /> : <DrawerContent />
            }
        </Drawer>
    );
}
export default Sidebar;
