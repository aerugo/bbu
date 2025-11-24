import React from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@apollo/client";
import AppHeader from "../atoms/AppHeader";
import CooccurrenceGraph from "../atoms/CooccurrenceGraph";
import Loading from "../atoms/Loading";
import { ALL_CODES_WITH_COOCCURRENCES } from "../../gqls";
import "../../styles/analysis.css";

function Analysis() {
  const { loading, error, data } = useQuery(ALL_CODES_WITH_COOCCURRENCES);

  if (loading) return <Loading />;
  if (error) return <p>Error loading codes: {error.message}</p>;

  const codes = data?.code || [];

  return (
    <>
      <Helmet>
        <title>Babel Between Us: Analysis</title>
        <meta property="og:type" content="fiction" />
        <meta property="og:title" content="Babel Between Us: Analysis" />
        <meta property="og:description" content="Babel Between Us: Code Co-occurrence Network" />
      </Helmet>

      <AppHeader name="Babel Between Us: Analysis" />

      <div className="analysis-intro">
        <h2>Code Co-occurrence Network</h2>
        <p>
          This graph visualizes how ethnographic codes appear together in the corpus.
          Each node represents a code, and edges connect codes that have been applied
          to overlapping text fragments. Thicker, darker edges indicate stronger
          co-occurrence relationships.
        </p>
      </div>

      <CooccurrenceGraph codes={codes} />
    </>
  );
}

export default Analysis;
