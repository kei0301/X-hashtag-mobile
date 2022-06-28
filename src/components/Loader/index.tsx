import React from "react";
import { makeStyles } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import "./loader.scss";

const useStyles = makeStyles(() => ({
    circle: {
    //   stroke: "url(#linearColors)",
      borderRadius: 20,
      background: "linear-gradient(93.45deg, #4861C9 4.32%, #892CBD 97.46%)"
    },
  }));

function Loader() {
    const classes = useStyles({});
    // return (
    //     <>
    //       <svg width="500" height="500">
    //         <linearGradient id="linearColors" x1="0" y1="0" x2="1" y2="1">
    //           <stop offset="20%" stopColor="#39F" />
    //           <stop offset="90%" stopColor="#F3F" />
    //         </linearGradient>
    //       </svg>
    //       <CircularProgress
    //         thickness={4}
    //         classes={{ circle: classes.circle }}
    //       />
    //     </>
    //   );

    return (
        <div className="loader-wrap">
            <CircularProgress classes={{ circle: classes.circle}} />
        </div>
    );
}

export default Loader;
