import React from "react";
import {Helmet} from "react-helmet";
import AppHeader from "../atoms/AppHeader";
import { FULLCODE } from "../../gqls";
import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import Loading from "../atoms/Loading";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";

function Code () {

    const params = useParams();

    const { data:response, loading, } = useQuery(FULLCODE, {
        variables: { discource_id:  parseInt(params.id)}
    });
    const [data, setData] = React.useState(null);

    React.useEffect(() => {
        if (loading)
            return;
        setData(response?.code[0] || null);
    }, [response, loading]);

    if (loading) {
        return <Loading />;
    }

    return (
        <>

            <Helmet>
                <title>{data?.name.toLowerCase()}</title>
                <meta property="og:type"               content="fiction" />
                <meta property="og:title"              content={data?.name.toLowerCase()} />
                <meta property="og:description"        content={data?.description} />
            </Helmet>

            <AppHeader 
                name={data?.name.toLowerCase() || "..."}
            />
            <p style={{ fontStyle: "italic" }}>
                { data?.description }
            </p>
            <p style={{ fontStyle: "italic" }}>
                { data?.annotations_count } fragment{data?.annotations_count > 1 ? "s" : ""} refer to this code
            </p>
            {
                data?.annotations?.map(annotation => (
                    <Link style={{ textDecoration: "none" }}to={`/fragment/${annotation.id}`} key={annotation.id}>
                        <span key={annotation.discource_id}>
                            <ReactMarkdown>
                                { "➢  " + annotation.quote }
                            </ReactMarkdown>
                        </span>
                    </Link>
                ))
            }
        </>
    )
}

export default Code;