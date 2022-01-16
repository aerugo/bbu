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
                display: "grid"
            }}
        >
            <div
                onClick={() => setIsCollapsed(!isCollapsed)}
                style={{
                    width: "200px"
                }}
            >
                <span>
                    {isCollapsed ? <span>〉</span> : <span>﹀</span>}
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
                        data.map((row, index) => <span key={index} style={{display: "inline-block"}}>{rowRenderer(row)}</span>)
                    }
                    </tbody>
                </table>
            </div>
        </div>
    )

}

export default CollapseAbleTable;