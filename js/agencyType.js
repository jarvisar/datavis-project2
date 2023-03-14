class AgencyType {
  constructor(_config, _data,_refresh) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 500,
      containerHeight: _config.containerHeight || 140,
      margin: { top: 40, bottom: 40, right: 50, left: 60 }
    }
    this.data = _data; 
    this.refresh = _refresh
    this.initVis();
  }

  initVis() {
    let vis = this;
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
    

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);
    //Title
    vis.svg.append("text")
       .attr('transform', `translate(${vis.width/2.67}, ${vis.config.margin.top -20 })`)
       .attr("font-size", "20px")
       .text("Calls by Responding Agency")
       .style("font-family", "Roboto")
        .style("color", "black")
        .style("font-size", "20px");

    // X axis Label    
    vis.svg.append("text")
       .attr("transform", `translate(${vis.width/2 + vis.config.margin.left},${vis.height + vis.config.margin.bottom + 35})`)
       .style("text-anchor", "middle")
       .text("Number of Calls")
       .style("font-family", "Roboto")
        .style("color", "black")
        .style("font-size", "14px")

    // Y axis Label    
    vis.svg.append("text")
       .attr("transform", "rotate(-90)")
       .attr("x", -(vis.height/2) - vis.config.margin.top)
       .attr("y", 35)
       .style("text-anchor", "middle")
       .text("Responding Agency")
       .style("font-family", "Roboto")
        .style("color", "black")
        .style("font-size", "14px");

      vis.updateVis(); //call updateVis() at the end - we aren't using this yet. 
  }
/**
   * Prepare the data and scales before we render it.
   */
  updateVis() {
    let vis = this;
    vis.svg.selectAll('.y-axis').remove();
    vis.svg.selectAll('.x-axis').remove();
    vis.svg.selectAll('.chart').remove();
    vis.svg.selectAll('.plan').remove();
    
    
    vis.yScale = d3.scaleBand()
        .domain(vis.data.map(function(d) { return d.agency; }))
        .range([vis.height, 0])
        .padding(0.4);
    
    vis.xScale = d3.scaleLinear()
        .domain([0, d3.max( vis.data, d => d.count)])
        .range([0, vis.width])
        .nice();
    // Initialize axes
    vis.xAxis = d3.axisBottom(vis.xScale)
        .ticks(0)
        .tickSizeOuter(0)
        .tickPadding(10)
        .tickFormat(d => d + "km");

    vis.yAxis = d3.axisLeft(vis.yScale)
        .ticks(6)
        .tickSizeOuter(0)
        .tickPadding(10)



    // Append group element that will contain our actual chart (see margin convention)
    vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Append empty x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chart.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${vis.height})`);

    // Append y-axis group
    vis.yAxisG = vis.chart.append('g')
        .attr('class', 'axis y-axis');
    

    //Add circles for each event in the data
    vis.rects = vis.chart.selectAll('rect')
      .data(vis.data)
      .join('rect')
      .attr('class', 'plan')
      .attr('data',(d) => d.agency)
      .attr('fill', "#ffb1a4")
      .attr("stroke", "#e52000")
      .style("border-left","none")
      .attr('y', (d) => {
        return vis.yScale(d.agency)}) 
      .attr('id', (d) => {
        return "byDisc" + d.agency.replace(/\s/g, '').replace(/[^a-zA-Z]/g, '')})  
      .attr('height', vis.yScale.bandwidth())
      .attr('x', 1)
      .attr('width', 0)

    vis.rects
          .on('mouseover', (event,d) => {
        d3.select("#byDisc" + d.agency.replace(/\s/g, '').replace(/[^a-zA-Z]/g, ''))
            .style("filter", "brightness(70%)");
          d3.select('#tooltip')
            .attr('data-value',d.agency)
            .style('display', 'block')
            .style('left', event.pageX + 10 + 'px')   
            .style('top', event.pageY + 'px')
            .html(`
              <div class="tooltip-title" style="font-weight: 600;">Agency: ${d.agency}</div>
              <div >Calls: ${d.count}</div>
            `);
        })
        .on('mouseleave', () => {
          d3.select('#tooltip').style('display', 'none');
          d3.selectAll("rect")
            .style("filter", "brightness(100%)");
        });
    // y axis
    vis.label = vis.svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`)
        .call(d3.axisLeft(vis.yScale))
        .selectAll("text")
        .style("text-anchor", "start")
        .style("word-wrap", "break-word")
        .style("font-family", "Roboto")
        .style("color", "black")
        .style("font-size", "11px")
        .attr("dx", "1.2em")
        .attr("dy", ".4em")

    vis.label
          .on('mouseover', (event,d) => {
        d3.select("#byDisc" + d.replace(/\s/g, '').replace(/[^a-zA-Z]/g, ''))
            .style("filter", "brightness(70%)");
          d3.select('#tooltip')
            .style('display', 'block')
            .style('left', event.pageX + 10 + 'px')   
            .style('top', event.pageY + 'px')
            .style('opacity', 1)
            .attr('data-value',d)
            .html(`
              <div class="tooltip-title" style="font-weight: 600;">Agency: ${d}</div>
              <div style="font-weight: 600;">Number of Calls: ${vis.data.filter(data => data.agency === d)[0].count}</div>
            `);
        })
        .on('mouseleave', () => {
          d3.select('#tooltip').style('display', 'none');
          d3.selectAll("rect")
            .style("filter", "brightness(100%)");
        });


    // Add the x axisS
    vis.svg.append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${vis.config.margin.left}, ${vis.config.margin.top + vis.height})`)
        .call(d3.axisBottom(vis.xScale))
        .append("text")
         .attr("transform", "rotate(-90)")
         .attr("y", 6)
         .attr("dy", "-4.1em")
         .attr("text-anchor", "end")
         .attr("stroke", "black")

    vis.rects.on('click', (event, d) => {
        d3.select('#tooltip').style('display', 'none')
        vis.refresh(d3.select('#tooltip')._groups[0][0].dataset.value);
      })
    vis.label.on('click', (event, d) => {
        d3.select('#tooltip').style('display', 'none')
        vis.refresh(d3.select('#tooltip')._groups[0][0].dataset.value);
      })
    vis.rects.transition()
        .duration(1000)
        .attr('width', (d) => vis.xScale(d.count));

    vis.renderVis();
  }

  /**
   * This function contains the D3 code for binding data to visual elements
   * Important: the chart is not interactive yet and renderVis() is intended
   * to be called only once; otherwise new paths would be added on top
   */
  renderVis() {
    let vis = this;

   
  }
}