import React from "react";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Menu from "./Menu";

function AppHeader ({ name, onMenuClick }) {

    const [menuView, setMenuView] = React.useState(false);

    if (menuView) {
        return <Menu hide={() => setMenuView(false)}/>
    }

    return (
        <div className="app-header">
            <span>
                {name}
            </span>
            <span className="hamburger-menu"
                onClick={() => setMenuView(true)}
            >
                ≡
            </span>
        </div>
    );
}

export default AppHeader;