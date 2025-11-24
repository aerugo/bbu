import React from "react";
import AppHeader from "../atoms/AppHeader";
import CollapseAbleTable from "../atoms/CollapseableTable";
import { faPenFancy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery } from "@apollo/client";
import Loading from "../atoms/Loading";
import { TOPIC } from "../../gqls";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";

function Thread () {

    const params = useParams();
    const { data:response, loading } = useQuery(TOPIC, {
        variables: { discourse_id: parseInt(params.id) }
    });
    const [data, setData] = React.useState(null);

    React.useEffect(() => {

        if (loading) {
            return;
        }
        setData(response.topic[0]);

    }, [response, loading]);

    React.useEffect(() => {
        if (window.location.hash && data) {
            const id = "p" + window.location.hash.substr(1, window.location.hash.length)
            document.getElementById(id)?.scrollIntoView();
            window.scrollBy(0, -60);
        }
    }, [data]);

    if (loading) {
        return <Loading />
    }
    
    return (
        <>
            <div
                style={{
                    position: "sticky",
                    top: 0,
                    background: "white",
                    height: 40,
                }}
            >
                <AppHeader
                    name={data?.title}
                />
            </div>
            
            <div>
                {
                    data?.posts?.map((post, index) => (
                        <div id={`p${post.discourse_id}`} key={index}>
                        <p
                            style={{
                                whiteSpace: "pre-line",
                                paddingBottom: 10,
                                margin: "20px 0px",
                            }}
                        >
                            <ReactMarkdown>
                                {post.raw}
                            </ReactMarkdown>
                        </p>
                            <br/>
                            <CollapseAbleTable 
                                defaultIsCollapsed={true}
                                header={
                                    <tr>
                                        <td style={{ width: 40 }}>
                                            <FontAwesomeIcon icon={faPenFancy}/>
                                        </td>
                                        <td>
                                            <b>Themes</b>
                                        </td>
                                    </tr>
                                }
                                data={post?.annotations}
                                rowRenderer={(row) => (
                                    row.refers_to.map(item => (
                                        <React.Fragment key={item.discourse_id}>
                                            <td><span className="circle-count">{item.annotations_count}</span></td>
                                            <td><Link to={`/codes/${item.discourse_id}`}>{item.name}</Link></td>
                                        </React.Fragment>
                                    ))
                                )}
                            />
                        </div>
                    ))
                }
            </div>
        </>
    )

}

export default Thread;