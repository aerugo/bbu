import React from "react";
import {Helmet} from "react-helmet";
import AppHeader from "../atoms/AppHeader";
import TopicSearch from "../atoms/TopicSearch";
import TopicPreview from "../atoms/TopicPreview";
import { TOPICS } from "../../gqls";
import { useQuery } from "@apollo/client";
import "../../styles/corpus.css";
import Loading from "../atoms/Loading";

function Corpus () {
    const { data:response, loading, } = useQuery(TOPICS);
    const [data, setData] = React.useState([]);
    const [filteredData, setFilteredData] = React.useState(data);
    const [searchString, setSearchString] = React.useState("");

    React.useEffect(() => {
        const _data = data.filter(topic => topic.title?.toLowerCase().indexOf(searchString.toLowerCase()) > -1).filter(topic => topic.posts.length > 0);
        setFilteredData(_data);
    }, [searchString, data]);

    React.useEffect(() => {
        if (loading)
            return;
        setData(response?.topic || [])
    }, [response, loading]);

    if (loading) {
        return <Loading />;
    }

    return (
        <>

            <Helmet>
                <title>Babel Between Us</title>
                <meta property="og:type"               content="fiction" />
                <meta property="og:title"              content="Babel Between Us" />
                <meta property="og:description"        content="Babel Between Us is a collaborative literary project exploring the uncharted waters between collaboration, fiction and ethnography." />
            </Helmet>

            <AppHeader 
                name="Babel corpus"
            />
            <TopicSearch 
                searchString={searchString}
                setSearchString={setSearchString}
            />
            {
                filteredData.map(topic => (
                    <TopicPreview 
                        key={topic.id}
                        id={topic.id}
                        title={topic.title}
                        text={topic.posts}
                    />
                ))
            }
        </>
    )
}

export default Corpus;