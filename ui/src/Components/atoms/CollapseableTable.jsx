import { faChevronRight, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

function CollapseAbleTable ({
    header,
    rowRenderer,
    data,
    defaultIsCollapsed,
}) {
    const [isCollapsed, setIsCollapsed] = React.useState(defaultIsCollapsed);
    
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "40px calc(100% - 40px)"
            }}
        >
            <div
                onClick={() => setIsCollapsed(!isCollapsed)}
                style={{
                    width: "200px"
                }}
            >
                <span>
                    <FontAwesomeIcon icon={isCollapsed ? faChevronRight : faChevronDown} />
                </span>
            </div>
            <div>
                <table>
                    <thead>
                        {header}
                    </thead>
                    <tbody>
                    {
                        isCollapsed ? null :
                        data.map((row, index) => <tr key={index}>{rowRenderer(row)}</tr>)
                    }
                    </tbody>
                </table>
            </div>
        </div>
    )

}

export default CollapseAbleTable;