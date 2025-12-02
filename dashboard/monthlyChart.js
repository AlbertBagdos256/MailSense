function renderMonthlyChart(data, selector) {
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
    const width = container.clientWidth || 500;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3
        .select(selector)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`);

    const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const parseDate = d3.timeParse("%Y-%m");
    const dates = data.map((d) => parseDate(d.month));

    const xScale = d3
        .scaleBand()
        .domain(data.map((d) => d.month))
        .range([0, innerWidth])
        .padding(0.3);

    const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.count) * 1.1])
        .range([innerHeight, 0]);

    g.append("g")
        .attr("class", "grid")
        .attr("opacity", 0.1)
        .call(
            d3
                .axisLeft(yScale)
                .tickSize(-innerWidth)
                .tickFormat("")
        );

    g.append("g")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(d3.axisBottom(xScale))
        .append("text")
        .attr("x", innerWidth / 2)
        .attr("y", 35)
        .attr("fill", "#333")
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text("Month");

    g.append("g")
        .call(d3.axisLeft(yScale))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -innerHeight / 2)
        .attr("y", -45)
        .attr("fill", "#333")
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text("Email Count");

    g.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", (d) => xScale(d.month))
        .attr("y", (d) => yScale(d.count))
        .attr("width", xScale.bandwidth())
        .attr("height", (d) => innerHeight - yScale(d.count))
        .attr("fill", "#667eea")
        .attr("rx", 4)
        .style("cursor", "pointer")
        .on("mouseover", function (event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("fill", "#764ba2");

            showTooltip(event, `${d.month}: ${d.count} emails`);
        })
        .on("mouseout", function (event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("fill", "#667eea");

            hideTooltip();
        });

    g.selectAll(".bar-label")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "bar-label")
        .attr("x", (d) => xScale(d.month) + xScale.bandwidth() / 2)
        .attr("y", (d) => yScale(d.count) - 5)
        .attr("text-anchor", "middle")
        .text((d) => d.count)
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("fill", "#333");

    console.log("Monthly chart rendered successfully");
}