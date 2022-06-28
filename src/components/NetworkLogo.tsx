import { Box } from "@material-ui/core";

interface NetworkImg {
    img: string
}

function NetworkLogo( {img} : NetworkImg) {
    let style = { height: "32px", width: "32px" };

    // if (bond.isLP) {
    //     style = { height: "30px", width: "62px" };
    // }

    return (
        <Box display="flex" alignItems="center" justifyContent="center" width={"64px"}>
            <img src={img} style={style} />
        </Box>
    );
}

export default NetworkLogo;
