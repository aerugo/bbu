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
        variables: { id:  parseInt(params.id)}
    });
    const [data, setData] = React.useState(null);

    React.useEffect(() => {
        if (loading)
            return;
        
        console.log(response)
        const data = response?.code[0];
        const top_cooccurring = []
        let v = 0
        for (var cc of data?.cooccurring_codes) {
            if(cc.cooccurrences > 3) {
                v += 1
                top_cooccurring.push(cc)
            }
          }
        console.log(v)
        setData( {...data, 'top_cooccurring': top_cooccurring} || null);
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

            {data?.top_cooccurring?.length > 0 && 
                <p style={{ fontStyle: "italic" }}>
                    '{ data?.name.toLowerCase() }' has often been applied together with 
                    <span> </span>
                    {data?.top_cooccurring?.map((code, i) => {
                        return (
                            <React.Fragment key={code.id}>
                                { 
                                    <span>
                                        <Link to={`/codes/${code.id}`} key={code.id}>
                                            {code.name.toLowerCase()}
                                        </Link>
                                        {data?.top_cooccurring.length - 2 > i && 
                                            <span>, </span>
                                        }
                                        {data?.top_cooccurring.length - 2 === i && 
                                            <span> and </span>
                                        }
                                        {data?.top_cooccurring.length - 1 === i && 
                                            <span> </span>
                                        }
                                    </span>
                                }
                            </React.Fragment>
                        )
                    })}
                </p>
            }

            <p style={{ fontStyle: "italic" }}>
                { data?.annotations_count } fragment{data?.annotations_count > 1 ? "s" : ""} refer to this code:
            </p>
            {   
                data?.annotations?.map(annotation => (
                    <Link style={{ textDecoration: "none" }}to={`/fragment/${annotation.id}`} key={annotation.id}>
                        <span key={annotation.id}>
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