import React, { useRef, useEffect, useState, useCallback } from "react";
import * as d3 from "d3";
import { Link } from "react-router-dom";

function CooccurrenceGraph({ codes }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [minCooccurrences, setMinCooccurrences] = useState(3);
  const [maxCooccurrences, setMaxCooccurrences] = useState(100);
  const [hoveredNode, setHoveredNode] = useState(null);
  const simulationRef = useRef(null);

  // Process data to create nodes and links
  const processData = useCallback((codes, minCooc) => {
    const nodesMap = new Map();
    const links = [];
    const nodeConnections = new Map();

    // First pass: count max cooccurrences per node
    codes.forEach(code => {
      if (code.cooccurring_codes) {
        code.cooccurring_codes.forEach(cooc => {
          if (cooc.cooccurrences >= minCooc) {
            const currentMax = nodeConnections.get(code.id) || 0;
            nodeConnections.set(code.id, Math.max(currentMax, cooc.cooccurrences));

            const coocMax = nodeConnections.get(cooc.ccid) || 0;
            nodeConnections.set(cooc.ccid, Math.max(coocMax, cooc.cooccurrences));
          }
        });
      }
    });

    // Only include nodes that have at least one connection >= minCooc
    codes.forEach(code => {
      if (nodeConnections.has(code.id)) {
        nodesMap.set(code.id, {
          id: code.id,
          name: code.name,
          annotations_count: code.annotations_count,
          maxCooc: nodeConnections.get(code.id)
        });
      }
    });

    // Create links
    const seenLinks = new Set();
    codes.forEach(code => {
      if (code.cooccurring_codes && nodesMap.has(code.id)) {
        code.cooccurring_codes.forEach(cooc => {
          if (cooc.cooccurrences >= minCooc && nodesMap.has(cooc.ccid)) {
            const linkKey = [code.id, cooc.ccid].sort().join("-");
            if (!seenLinks.has(linkKey)) {
              seenLinks.add(linkKey);
              links.push({
                source: code.id,
                target: cooc.ccid,
                value: cooc.cooccurrences
              });
            }
          }
        });
      }
    });

    return {
      nodes: Array.from(nodesMap.values()),
      links
    };
  }, []);

  // Calculate max cooccurrences for slider
  useEffect(() => {
    if (codes && codes.length > 0) {
      let max = 0;
      codes.forEach(code => {
        if (code.cooccurring_codes) {
          code.cooccurring_codes.forEach(cooc => {
            max = Math.max(max, cooc.cooccurrences);
          });
        }
      });
      setMaxCooccurrences(max);
    }
  }, [codes]);

  useEffect(() => {
    if (!codes || codes.length === 0 || !svgRef.current || !containerRef.current) return;

    const { nodes, links } = processData(codes, minCooccurrences);

    if (nodes.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = Math.max(600, window.innerHeight * 0.7);

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);

    // Create a group for zoom/pan
    const g = svg.append("g");

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Calculate link strength based on cooccurrences
    const maxLinkValue = d3.max(links, d => d.value) || 1;
    const minLinkValue = d3.min(links, d => d.value) || 1;

    // Create the simulation
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links)
        .id(d => d.id)
        .distance(d => {
          // Stronger connections = shorter distance
          const normalized = (d.value - minLinkValue) / (maxLinkValue - minLinkValue + 1);
          return 150 - normalized * 80;
        })
        .strength(d => {
          const normalized = (d.value - minLinkValue) / (maxLinkValue - minLinkValue + 1);
          return 0.3 + normalized * 0.5;
        }))
      .force("charge", d3.forceManyBody()
        .strength(-300)
        .distanceMax(400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30));

    simulationRef.current = simulation;

    // Create curved links using a line generator
    const linkGroup = g.append("g")
      .attr("class", "links");

    const link = linkGroup.selectAll("path")
      .data(links)
      .join("path")
      .attr("fill", "none")
      .attr("stroke", "#000")
      .attr("stroke-opacity", d => {
        const normalized = (d.value - minLinkValue) / (maxLinkValue - minLinkValue + 1);
        return 0.15 + normalized * 0.4;
      })
      .attr("stroke-width", d => {
        const normalized = (d.value - minLinkValue) / (maxLinkValue - minLinkValue + 1);
        return 0.5 + normalized * 2;
      });

    // Create nodes group
    const nodeGroup = g.append("g")
      .attr("class", "nodes");

    const node = nodeGroup.selectAll("g")
      .data(nodes)
      .join("g")
      .attr("class", "node")
      .style("cursor", "grab");

    // Add circles to nodes
    node.append("circle")
      .attr("r", d => {
        const baseSize = 4;
        const scale = Math.log(d.annotations_count + 1) * 1.5;
        return baseSize + scale;
      })
      .attr("fill", "#000")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5);

    // Add labels to nodes
    node.append("text")
      .text(d => d.name)
      .attr("x", d => {
        const baseSize = 4;
        const scale = Math.log(d.annotations_count + 1) * 1.5;
        return baseSize + scale + 4;
      })
      .attr("y", 4)
      .attr("font-family", "'Baskervville', 'Times New Roman', serif")
      .attr("font-size", "11px")
      .attr("fill", "#000")
      .attr("pointer-events", "none")
      .style("font-style", "italic");

    // Add drag behavior
    const drag = d3.drag()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
        d3.select(event.sourceEvent.target.parentNode).style("cursor", "grabbing");
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
        d3.select(event.sourceEvent.target.parentNode).style("cursor", "grab");
      });

    node.call(drag);

    // Hover effects
    node.on("mouseenter", (event, d) => {
      setHoveredNode(d);

      // Highlight connected links
      link.attr("stroke-opacity", l => {
        if (l.source.id === d.id || l.target.id === d.id) {
          return 0.8;
        }
        return 0.05;
      });

      // Fade non-connected nodes
      node.select("circle").attr("fill-opacity", n => {
        if (n.id === d.id) return 1;
        const isConnected = links.some(l =>
          (l.source.id === d.id && l.target.id === n.id) ||
          (l.target.id === d.id && l.source.id === n.id)
        );
        return isConnected ? 1 : 0.2;
      });

      node.select("text").attr("fill-opacity", n => {
        if (n.id === d.id) return 1;
        const isConnected = links.some(l =>
          (l.source.id === d.id && l.target.id === n.id) ||
          (l.target.id === d.id && l.source.id === n.id)
        );
        return isConnected ? 1 : 0.2;
      });
    })
    .on("mouseleave", () => {
      setHoveredNode(null);
      link.attr("stroke-opacity", d => {
        const normalized = (d.value - minLinkValue) / (maxLinkValue - minLinkValue + 1);
        return 0.15 + normalized * 0.4;
      });
      node.select("circle").attr("fill-opacity", 1);
      node.select("text").attr("fill-opacity", 1);
    });

    // Function to create curved paths
    const linkArc = (d) => {
      const dx = d.target.x - d.source.x;
      const dy = d.target.y - d.source.y;
      const dr = Math.sqrt(dx * dx + dy * dy) * 1.5; // Curve intensity
      return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
    };

    // Update positions on tick
    simulation.on("tick", () => {
      link.attr("d", linkArc);

      node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [codes, minCooccurrences, processData]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (simulationRef.current) {
        simulationRef.current.alpha(0.3).restart();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const nodeCount = codes ? processData(codes, minCooccurrences).nodes.length : 0;
  const linkCount = codes ? processData(codes, minCooccurrences).links.length : 0;

  return (
    <div className="cooccurrence-graph-container" ref={containerRef}>
      <div className="graph-controls">
        <div className="slider-container">
          <label htmlFor="cooc-slider">
            Minimum co-occurrences: <strong>{minCooccurrences}</strong>
          </label>
          <input
            id="cooc-slider"
            type="range"
            min="1"
            max={Math.max(maxCooccurrences, 10)}
            value={minCooccurrences}
            onChange={(e) => setMinCooccurrences(parseInt(e.target.value, 10))}
            className="cooc-slider"
          />
          <div className="slider-labels">
            <span>1</span>
            <span>{Math.max(maxCooccurrences, 10)}</span>
          </div>
        </div>
        <div className="graph-stats">
          {nodeCount} codes &middot; {linkCount} connections
        </div>
      </div>

      {hoveredNode && (
        <div className="node-tooltip">
          <Link to={`/codes/${hoveredNode.id}`}>
            <strong>{hoveredNode.name}</strong>
          </Link>
          <br />
          {hoveredNode.annotations_count} annotations
        </div>
      )}

      <svg ref={svgRef} className="cooccurrence-svg"></svg>

      <div className="graph-instructions">
        Drag nodes to rearrange &middot; Scroll to zoom &middot; Click and drag background to pan
      </div>
    </div>
  );
}

export default CooccurrenceGraph;
