import React from "react";
import { Link } from "react-router-dom";
import "../../styles/menu.css";
import { blocked_fragments } from "../../annotation_ids"

function Menu ({ hide }) {

    const annotations = Array.from({length:10500},(v,k)=>k+1).filter(x => !blocked_fragments.includes(x));
    const randomId = annotations[Math.floor(Math.random() * annotations.length)];

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
                X
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