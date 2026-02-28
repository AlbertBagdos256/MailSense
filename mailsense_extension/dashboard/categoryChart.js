function renderCategoryChart(data, selector) {
    d3.select(selector).selectAll("*").remove();

    if (!data || data.length === 0) {
        d3.select(selector)
            .append("p")
            .text("No data available")
            .style("text-align", "center")
            .style("color", "#999")
            .style("padding", "40px");
        return;
    }

    const container = document.querySelector(selector);
    const containerWidth = container.clientWidth;
    const containerHeight = container.parentElement.clientHeight - 100;

    const margin = {top: 20, right: 20, bottom: 20, left: 20};
    const width = containerWidth - margin.left - margin.right;
    const height = Math.min(containerHeight, 800) - margin.top - margin.bottom;
    const radius = Math.min(width, height) / 2.2;

    const svg = d3
        .select(selector)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`);

    const g = svg
        .append("g")
        .attr("transform", `translate(${width / 2 + margin.left}, ${height / 2 + margin.top})`);

    const pie = d3.pie().value((d) => d.count);

    const arc = d3
        .arc()
        .innerRadius(radius * 0.5)
        .outerRadius(radius);

    const colors = d3
        .scaleOrdinal()
        .domain(data.map((d) => d.category))
        .range([
            "#667eea",
            "#764ba2",
            "#f093fb",
            "#4facfe",
            "#00f2fe",
            "#43e97b",
            "#fa709a",
            "#fee140"
        ]);

    const slices = g
        .selectAll(".slice")
        .data(pie(data))
        .enter()
        .append("g")
        .attr("class", "slice");

    slices
        .append("path")
        .attr("d", arc)
        .attr("fill", (d) => colors(d.data.category))
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .style("cursor", "pointer")
        .on("mouseover", function (event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("opacity", 0.8);

            showTooltip(
                event,
                `${d.data.category}: ${d.data.count} emails`
            );
        })
        .on("mouseout", function (event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("opacity", 1);

            hideTooltip();
        });

    const total = d3.sum(data, (d) => d.count);

    slices
        .append("text")
        .attr("transform", (d) => `translate(${arc.centroid(d)})`)
        .attr("text-anchor", "middle")
        .attr("dy", "-0.3em")
        .text((d) => d.data.category)
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("fill", "white")
        .style("pointer-events", "none");

    slices
        .append("text")
        .attr("transform", (d) => `translate(${arc.centroid(d)})`)
        .attr("text-anchor", "middle")
        .attr("dy", "1em")
        .text((d) => {
            const percentage = ((d.data.count / total) * 100).toFixed(1);
            return `${percentage}%`;
        })
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("fill", "white")
        .style("pointer-events", "none");

    svg.attr("width", "100%")
       .attr("height", "100%")
       .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
       .attr("preserveAspectRatio", "xMidYMid meet");

    console.log("Category chart rendered successfully");
}

function showTooltip(event, text) {
    let tooltip = document.querySelector(".tooltip");

    if (!tooltip) {
        tooltip = document.createElement("div");
        tooltip.className = "tooltip";
        document.body.appendChild(tooltip);
    }

    tooltip.textContent = text;
    tooltip.classList.add("visible");
    tooltip.style.left = event.pageX + 10 + "px";
    tooltip.style.top = event.pageY + 10 + "px";
}

function hideTooltip() {
    const tooltip = document.querySelector(".tooltip");
    if (tooltip) {
        tooltip.classList.remove("visible");
    }
}