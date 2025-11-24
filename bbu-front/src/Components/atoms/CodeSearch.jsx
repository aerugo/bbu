import React from "react";

function CodeSearch ({searchString, setSearchString}) {

    return (
        <div>
        <input 
            className="code-search-input"
            placeholder="Search for Codes..."
            value={searchString}
            onChange={(e) => {
                setSearchString(e.target.value)
            }}
        />
        </div>
    )

}

export default CodeSearch;