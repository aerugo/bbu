import React from "react";
import AppHeader from "../atoms/AppHeader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenFancy, faProjectDiagram, faShare } from "@fortawesome/free-solid-svg-icons";
import { useQuery } from "@apollo/client";
import Loading from "../atoms/Loading";
import { ANNOTATION } from "../../gqls";
import { Link } from "react-router-dom";
import { useParams } from "react-router";
import ReactMarkdown from "react-markdown";
import "../../styles/fragment.css";

function Fragment () {

    const { id } = useParams();

    const {data:response, loading} = useQuery(ANNOTATION, {
        variables: { discource_id: parseInt(id) }
    });

    const [data, setData] = React.useState(null);

    React.useEffect(() => {
        if (loading)
            return;
        setData(response.annotation[0] || null);
    }, [response, loading]);

    if (loading) {
        return <Loading />
    }

    return (
        <>
            <AppHeader name="" />
            <p>
                <ReactMarkdown>
                {
                    data?.quote
                }
                </ReactMarkdown>
            </p>
            <table
                style={{
                    width: "100%"
                }}
                className="app-table"
            >
                <thead>
                <tr>
                    <td style={{ width: 40 }} />
                    <td style={{ width: 40 }}>
                        <FontAwesomeIcon icon={faShare} />
                    </td>
                    <td>
                        <Link to={
                            "/post/" + data?.annotates[0]?.in_topic[0].discourse_id + "#"
                            + data?.annotates[0]?.discourse_id
                        }>
                        {data?.annotates[0]?.in_topic.map(item => (
                            <span key={item.discourse_id}>{item.title}</span>
                        ))}
                        </Link>
                    </td>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>
                        <FontAwesomeIcon icon={faPenFancy}/>
                    </td>
                    <td>
                        <FontAwesomeIcon icon={faProjectDiagram}/>
                    </td>
                    <td>
                        Themes
                    </td>
                </tr>
                {
                    data?.refers_to?.map(item => (
                        <tr key={item.discourse_id}>
                            <td>
                                <span className="circle-count">{item.annotations_count}</span>
                            </td>
                            <td>
                                <span className="circle-count">
                                    {item.cooccurring_codes.length}
                                </span>
                            </td>
                            <td><Link to={`/codes/${item.discourse_id}`}>{item.name}</Link></td>
                        </tr>
                    ))
                }
                {
                    data?.overlaps?.map(overlap => {
                        return overlap?.refers_to?.map(item => (
                            <tr key={item.discourse_id}>
                                <td>
                                    <span className="circle-count">{item.annotations_count}</span>
                                </td>
                                <td>
                                    <span className="circle-count">
                                        {item.cooccurring_codes.length}
                                    </span>
                                </td>
                                <td><Link to={`/codes/${item.discourse_id}`}>{item.name}</Link></td>
                            </tr>
                        ))
                    })
                }
                </tbody>
            </table>
        </>
    )
}

export default Fragment;