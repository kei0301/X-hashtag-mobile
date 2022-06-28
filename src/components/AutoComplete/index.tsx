import React, { useState, useRef, useEffect, useCallback } from "react";
import { makeStyles } from "@material-ui/core/styles";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import TextField from "@material-ui/core/TextField";
import MenuList from "@material-ui/core/MenuList";
import MenuItem from "@material-ui/core/MenuItem";
import "./autocomplete.scss";
const useStyles = makeStyles((theme) => ({
    menuItem: {
        maxHeight: 300,
        overflowY: "auto",
        backgroundColor: "#fff",
        boxShadow: `0 1px 2px 0 rgba(0, 0, 0, 0.15)`
    }
}));

const AutoComplete = ({
    options,
    handleChange,
    handleSelect,
    inputValue,
    label
}: any) => {
    const classes = useStyles();

    const listRef = useRef(null);
    const [isMatched, setMatched] = useState([]);
    const [count, setCount] = useState(0);
    const [isOpen, setOpen] = useState(false);

    // Use callback to avoid re-created on each render
    const findMatchs = useCallback(
        // Check first if there is a value then start to find matches
        // !! before inputValue will change it from string to 'true/false'
        () =>
            !!inputValue &&
            options.filter(
                (item: string) => item.toLowerCase().indexOf(inputValue.toLowerCase()) === 0
            ),
        [inputValue, options]
    );

    useEffect(() => {
        // Call function to find matches
        setMatched(findMatchs);

        // Reset all state on component unmount
        return () => {
            setMatched([]);
            setOpen(false);
            setCount(0);
        };
    }, [inputValue, findMatchs]);

    // Handle keyup
    const handleKeyUp = ({ keyCode }: any) => {
        setOpen(true);
        // Handle arrow up and down
        switch (keyCode) {
            // Down arrow
            case 40:
                if (count < isMatched.length - 1) {
                    setCount((prev) => prev + 1);
                    // Set focus to the first child in the list
                    // @ts-ignore
                    listRef.current && listRef.current.firstChild.focus();
                }
                break;
            // Up arrow
            case 38:
                if (count > 0) {
                    setCount((prev) => prev - 1);
                    // Set focus to the last child
                    // @ts-ignore
                    listRef.current && listRef.current.lastChild.focus();
                }
                break;
            // Escape key
            case 27:
                setOpen(false);
                break;

            default:
                break;
        }
    };

    /* 
      - 'onClickAway' is an material ui listener to detect if a click event happened outside of an element
      - https://material-ui.com/components/click-away-listener/#click-away-listener
    */

    return (
        <>
            <TextField
                fullWidth
                autoComplete="off"
                label={label}
                value={inputValue}
                onChange={handleChange}
                onKeyUp={handleKeyUp}
                type="search"
            />
            {!!inputValue && isOpen && (
                <ClickAwayListener onClickAway={() => setOpen(false)}>
                    {isMatched.length > 0 ? (
                        <MenuList role="listbox" ref={listRef} className={classes.menuItem}>
                            {isMatched.map((match) => {
                                // Just add "Bold" the the first char
                                const suggest = match
                                    // @ts-ignore
                                    .toLowerCase()
                                    .replace(inputValue, `<b>${inputValue}</b>`);
                                return (
                                    <MenuItem
                                        role="option"
                                        key={match}
                                        onClick={() => handleSelect(match)}
                                    >
                                        <span dangerouslySetInnerHTML={{ __html: suggest }} />
                                    </MenuItem>
                                );
                            })}
                        </MenuList>
                    ) : (
                        <MenuList>
                            <MenuItem>No result found!</MenuItem>
                        </MenuList>
                    )}
                </ClickAwayListener>
            )}
        </>
    );
};

export default AutoComplete;
