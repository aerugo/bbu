import React from "react";
import ReactMarkdown from "react-markdown";

function TopicPreview ({
    id,
    title,
    text
}) {
    return (
        <div className="topic-preview-container">
            <a className="topic-preview-heading" href={"/post/" + id}>
                <h4>
                    {title}
                </h4>
                <p className="topic-preview-desc">
                    <ReactMarkdown>
                        {text[0].raw}
                    </ReactMarkdown>
                </p>
            </a>
        </div>
    )
}

export default TopicPreview;