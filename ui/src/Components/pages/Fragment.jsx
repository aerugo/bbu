import React from "react";
import {Helmet} from "react-helmet";
import AppHeader from "../atoms/AppHeader";
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
        variables: { id: parseInt(id) }
    });

    const [data, setData] = React.useState(null);

    React.useEffect(() => {
        if (loading)
            return;
        
        const annotation = response.annotation[0]

        const codes = [annotation?.refers_to[0]]
        annotation?.overlaps.map(overlap => {
            return overlap?.refers_to?.map(item => (
                codes.push(item)
            ))
        })
        const sortedcodes = codes.reduce((unique, o) => {
            if(!unique.some(obj => obj.name === o.name)) {
              unique.push(o);
            }
            let sortedunique = unique.slice().sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
            return sortedunique;
        },[]);

        setData({...annotation, sortedcodes} || null);
    
    }, [response, loading]);

    if (loading) {
        return <Loading />
    }

    return (
        <>
            <Helmet>
                <title>Babel Between Us: Fragment</title>
                <meta property="og:type"               content="fiction" />
                <meta property="og:title"              content="Babel Between Us: Fragment" />
                <meta property="og:description"        content={data?.quote} />
            </Helmet>
            <AppHeader name="" />
            <p>
                <ReactMarkdown>
                {
                    data?.quote
                }
                </ReactMarkdown>
            </p>

            <p style={{ fontStyle: "italic" }}>
                    From <Link to={
                        "/post/" + data?.annotates[0]?.in_topic[0].id + "#"
                        + data?.annotates[0]?.id + "-"
                        + data?.quote
                    }>
                    {data?.annotates[0]?.in_topic.map(item => (
                        <span key={item.id}>{item.title}</span>
                    ))}
                    </Link>
            </p>

            <p style={{ fontStyle: "italic" }}>Codes:</p>

            {
                data?.sortedcodes?.map(item => (
                    <p key={item.id} style={{ fontStyle: "italic" }}>
                        <Link to={`/codes/${item.id}`}>{item.name.toLowerCase()}</Link>, {item.annotations_count} annotations with {item.cooccurring_codes.length} connections
                    </p>
                ))
            }

        </>
    )
}

export default Fragment;