import React from "react";
import AppHeader from "../atoms/AppHeader";
import CollapseAbleTable from "../atoms/CollapseableTable";
import { faPenFancy, faProjectDiagram} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery } from "@apollo/client";
import Loading from "../atoms/Loading";
import { POST } from "../../gqls";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";

function Post () {

    const params = useParams();
    const { data:response, loading } = useQuery(POST, {
        variables: { discourse_id: parseInt(params.id) }
    });
    const [data, setData] = React.useState(null);

    React.useEffect(() => {

        if (loading) {
            return;
        }
        setData(response.post[0]);

    }, [response, loading]);

    if (loading) {
        return <Loading />
    }

    return (
        <>
            <AppHeader 
                name=""
            />
            <div>
                <p
                    style={{
                        whiteSpace: "pre-line",
                        paddingBottom: 10,
                        margin: "20px 0px",
                    }}
                >
                    <ReactMarkdown>
                        {data?.raw}
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
                                <td style={{ width: 40 }}>
                                    <FontAwesomeIcon icon={faProjectDiagram}/>
                                </td>
                                <td>
                                    <b>Themes</b>
                                </td>
                            </tr>
                        }
                        data={data?.annotations}
                        rowRenderer={(row) => (
                            row.refers_to.map(item => (
                                <React.Fragment key={item.discourse_id}>
                                    <td><span className="circle-count">{item.annotations_count}</span></td>
                                    <td><span className="circle-count">{item.cooccurring_codes.length}</span></td>
                                    <td><Link to={`/codes/${item.discourse_id}`}>{item.name}</Link></td>
                                </React.Fragment>
                            ))
                        )}
                    />
            </div>
        </>
    )

}

export default Post;