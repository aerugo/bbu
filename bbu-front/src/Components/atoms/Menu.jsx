import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import "../../styles/menu.css";


function Menu ({ hide }) {

    const randomId = Math.floor((Math.random() * 11500) + 2500);

    const links = [
        { label: "Codebook", value: "codes" },
        { label: "Random fragment", value: "fragment/" + randomId },
        { label: "About", value: "about" }
    ];

    return (
        <div className="menu-container">
            <div 
                className="menu-control"
                onClick={hide}
            >
                <FontAwesomeIcon icon={faTimes} />
            </div>
            <div>
                <p className="menu-heading">Babel Between Us</p>
                {
                    links.map(menuItem => (
                        <Link
                            to={"/" + menuItem.value}
                            key={menuItem.label}
                            className="menu-link"
                        >
                            {menuItem.label}
                        </Link>
                    ))
                }
            </div>
        </div>
    );
}

export default Menu;