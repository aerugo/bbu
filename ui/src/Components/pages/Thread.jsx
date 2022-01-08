import React from "react";
import {Helmet} from "react-helmet";
import AppHeader from "../atoms/AppHeader";
import { useQuery } from "@apollo/client";
import Loading from "../atoms/Loading";
import { TOPIC } from "../../gqls";
import { useParams } from "react-router";
import "../../styles/thread.css";
import ThreadPost from "../atoms/ThreadPost";
import Showdown from "showdown";

function Thread () {

    const converter = new Showdown.Converter();
    const params = useParams();
    const { data:response, loading } = useQuery(TOPIC, {
        variables: { id: parseInt(params.id) }
    });
    const [data, setData] = React.useState(null);
    const [initialAnnotation, setInitialAnnotation] = React.useState(null);

    React.useEffect(() => {

        if (loading) {
            return;
        }
        setData(response.topic[0]);

    }, [response, loading]);

    React.useEffect(() => {
        if (window.location.hash && data) {
            const hash = window.location.hash.substr(1, window.location.hash.length)?.split("-");
            const id = "p" + hash[0];
            setInitialAnnotation(hash);
            document.getElementById(id)?.scrollIntoView();
            window.scrollBy(0, -60);
        }
    }, [data]);
    
    if (loading) {
        return <Loading />
    }
    
    return (
        <>

            <Helmet>
                <title>{data?.title}</title>
                <meta property="og:type"               content="fiction" />
                <meta property="og:title"              content={data?.title} />
                <meta property="og:description"        content={data?.posts?.find(element=>element!==undefined).raw.slice(0,300)} />
            </Helmet>

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
                        <ThreadPost 
                            post={post} 
                            key={index}
                            converter={converter}
                            initialAnnotation={initialAnnotation && initialAnnotation[0] == post.id ? decodeURI(initialAnnotation[1]) : null}
                        />
                    ))
                }
            </div>
        </>
    )

}

export default Thread;