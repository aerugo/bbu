import React from "react";
import AppHeader from "../atoms/AppHeader";
import CodeSearch from "../atoms/CodeSearch";
import CodePreview from "../atoms/CodePreview";
import { CODES } from "../../gqls";
import { useQuery } from "@apollo/client";
import "../../styles/codebook.css";
import Loading from "../atoms/Loading";

function CodeBook () {
    
    const { data:response, loading, } = useQuery(CODES);

    const [data, setData] = React.useState([]);
    const [filteredData, setFilteredData] = React.useState(data);
    const [searchString, setSearchString] = React.useState("");

    React.useEffect(() => {
        const _data = data.filter(code => code.name?.toLowerCase().indexOf(searchString.toLowerCase()) > -1);
        setFilteredData(_data);
    }, [searchString, data]);

    React.useEffect(() => {
        if (loading)
            return;
        setData(response?.code || [])
    }, [response, loading]);

    if (loading) {
        return <Loading />;
    }

    return (
        <>
            <AppHeader 
                name="Babel codebook"
            />
            <CodeSearch 
                searchString={searchString}
                setSearchString={setSearchString}
            />
            {
                filteredData.map(code => (
                    <CodePreview 
                        key={code.discourse_id}
                        id={code.discourse_id}
                        name={code.name}
                        annotationsCount={code.annotations_count}
                        description={code.description}
                    />
                ))
            }
        </>
    )
}

export default CodeBook;