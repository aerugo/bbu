import React from "react";

function TopicSearch ({searchString, setSearchString}) {

    return (
        <div>
        <input 
            className="topic-search-input"
            placeholder="Find stories..."
            value={searchString}
            onChange={(e) => {
                setSearchString(e.target.value)
            }}
        />
        </div>
    )

}

export default TopicSearch;