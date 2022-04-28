import React from "react";
import {Helmet} from "react-helmet";
import AppHeader from "../atoms/AppHeader";

function Analysis () {

    return (
        <>

            <Helmet>
                <title>Babel Between Us: Analysis</title>
                <meta property="og:type"               content="fiction" />
                <meta property="og:title"              content="Babel Between Us: Analysis" />
                <meta property="og:description"        content="Babel Between Us: Analysis" />
            </Helmet>

            <AppHeader 
                name="Babel Between Us: Analysis"
            />
     
    <div>
        <p>
            So much analysis!
        </p>
    </div>

        </>
    );

}

export default Analysis;