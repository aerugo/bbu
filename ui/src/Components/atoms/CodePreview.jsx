import React from "react";

function CodePreview ({
    id,
    name,
    annotationsCount,
    description,
}) {
    return (
        <div className="code-preview-container">
            <a className="code-preview-heading" href={"/codes/" + id}>
                {name} ({annotationsCount})
            </a>
            <p className="code-preview-desc">
                {description}
            </p>
        </div>
    )
}

export default CodePreview;