import ReactDOM from "react-dom";
import Root from "./Root";
import store from "./store/store";
import { Provider } from "react-redux";
import { Web3ContextProvider } from "./hooks";
import { SnackbarProvider } from "notistack";
import SnackMessage from "./components/Messages/snackbar";
import SolanaRoot from "./Root/Solana";
import { IS_SOLANA_ENABLED } from "./constants/config";

let selectedNetwork: any;
if (!IS_SOLANA_ENABLED) {
    selectedNetwork = localStorage.setItem('network', 'avalanche');
}
selectedNetwork = localStorage.getItem('network');

ReactDOM.render(
    <SnackbarProvider
        maxSnack={4}
        anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
        }}
        content={(key, message: string) => <SnackMessage id={key} message={JSON.parse(message)} />}
        autoHideDuration={10000}
    >

        <Provider store={store}>
            {
                selectedNetwork === null || selectedNetwork === 'avalanche' ?
                    <Web3ContextProvider >
                        <Root />
                    </Web3ContextProvider>
                    :
                    <SolanaRoot />
            }
        </Provider>
    </SnackbarProvider >,
    document.getElementById("root"),
);
