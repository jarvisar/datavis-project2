class Zipcode {
  constructor(_config, _data,_refresh) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 500,
      containerHeight: _config.containerHeight || 140,
      margin: { top: 40, bottom: 60, right: 10, left: 60 }
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

    // Append group element that will contain our actual chart (see margin convention)
    

        //Title
    vis.svg.append("text")
       .attr('transform', `translate(${vis.width/1.80}, ${vis.config.margin.top -20 })`)
       .style("text-anchor", "middle")
       .text("Calls by ZIP Code")
       .style("font-family", "Roboto")
        .style("color", "black")
        .style("font-size", "20px");

    // X axis Label    
    vis.svg.append("text")
       .attr("transform", `translate(${vis.width/2},${vis.height + vis.config.margin.bottom + 35})`)
       .style("text-anchor", "start")
       .text("ZIP Code")
       .style("font-family", "Roboto")
       .style("color", "black")
       .style("font-size", "14px")
       .append("tspan")
       .style("font-size", "14px")
       .style("fill", "white")
       .text("____________")
       .append("tspan")
       .style("font-size", "14px")
       .style("fill", "black")
       .text("Click to view a ")
       .append("tspan")
       .style("font-size", "14px")
       .style("fill", "blue")
       .text("Cincinnati ZIP Codes Map")
        .style("text-decoration", "underline")
        .style("cursor", "pointer")
       .on("click", function() {
            // add the link you want to redirect to when the text is clicked
            window.open("https://www.zipdatamaps.com/zipcodes-cincinnati-oh", "_blank");
       });


    // Y axis Label    
    vis.svg.append("text")
       .attr("transform", "rotate(-90)")
       .attr("x", -(vis.height/2) - vis.config.margin.top)
       .attr("y", 15)
       .style("text-anchor", "middle")
       .text("Number of Calls")
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

    vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`).attr('class', 'chart');
    vis.xScale = d3.scaleBand()
        .domain(vis.data.map(function(d) { return d.zip; }))
        .range([0, vis.width])
        .padding(0.4);
    vis.yScale = d3.scaleLinear()
        .domain([0, d3.max( vis.data, d => d.count)])
        .range([vis.height, 0])
        .nice();
    // Initialize axes
    vis.xAxis = d3.axisBottom(vis.xScale)

    vis.yAxis = d3.axisLeft(vis.yScale)
        .tickPadding(10)

    // Append empty x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chart.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${vis.height})`);

    // Append y-axis group
    vis.yAxisG = vis.chart.append('g')
        .attr('class', 'y-axis');

        // X axis
    vis.xAxisInsert = vis.svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(${vis.config.margin.left},${vis.height + vis.config.margin.top})`)
        .call(d3.axisBottom(vis.xScale))
        .selectAll("text")
        .style("text-anchor", "end")
        .style("word-wrap", "break-word")
        .style("font-family", "Roboto")
        .style("color", "black")
        .style("font-size", "12px")
        .attr("dx", "-0.5em")
        .attr("dy", "1em")
        .attr("transform", "rotate(-40)")
        

    // Add the y axis
    vis.svg.append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${vis.config.margin.left}, ${vis.config.margin.top})`)
        .call(d3.axisLeft(vis.yScale))
        .append("text")
         .attr("transform", "rotate(-90)")
         .attr("y", 6)
         .attr("dy", "-4.1em")
         .attr("text-anchor", "end")
         .attr("stroke", "black")
    
// Construct a new ordinal scale with a range of ten categorical colours
      vis.colorPalette = d3.scaleOrdinal(d3.schemeDark2);
      vis.colorPalette.domain( vis.data.map(function(d) { return d.zip;}));
    //Add circles for each event in the data
    vis.rects = vis.chart.selectAll('rect')
      .data(vis.data)
      .join('rect')
      .attr('fill', "#073B4C")
      .attr("stroke", "#0c6b89")
      .attr('id', (d) => {
      return "byPlan" + d.zip}) 
      .attr('x', (d) => {
        return vis.xScale(d.zip)}) 
      .attr('width', vis.xScale.bandwidth())
      .attr('class',"plan")
      .attr('y', vis.height)
      .attr('height', 0)
vis.xAxisInsert.on('mouseover', (event,d) => {
    var thisCount = 0;
    for(var obj in vis.data){
        if(vis.data[obj].zip ==d){
            thisCount = vis.data[obj].count
        }
    }
    if(Number(d) < 45235){
              d3.select('#tooltip')
                .style('display', 'block')
                .style('left', event.pageX + 5 + 'px')   
                .style('top', event.pageY - 60 + 'px')
                .style('opacity', 1)
                .html(`
                  <div class="tooltip-title"  style="font-weight: 600;">Zipcode: ${d}</div>
                  <div style="font-weight: 300;">Calls: ${thisCount}</div>
                `);
            }
            else{
                d3.select('#tooltip')
                .style('display', 'block')
                .style('left', event.pageX - 125 + 'px')   
                .style('top', event.pageY - 60 + 'px')
                .style('opacity', 1)
                .html(`
                  <div class="tooltip-title"  style="font-weight: 600;">Zipcode: ${d}</div>
                  <div style="font-weight: 300;">Calls: ${thisCount}</div>
                `);
            }

})
    vis.rects
          .on('mouseover', (event,d) => {
        d3.select("#byPlan"+ d.zip)
            .style("filter", "brightness(70%)");

          if(Number(d.zip) < 45235){
              d3.select('#tooltip')
                .style('display', 'block')
                .style('left', event.pageX + 10 + 'px')   
                .style('top', event.pageY + 'px')
                .style('opacity', 1)
                .html(`
                  <div class="tooltip-title"  style="font-weight: 600;">Zipcode: ${d.zip}</div>
                  <div style="font-weight: 300;">Number of Calls: ${d.count}</div>
                `);
            }
            else{
                d3.select('#tooltip')
                .style('display', 'block')
                .style('left', event.pageX - 130 + 'px')   
                .style('top', event.pageY + 'px')
                .style('opacity', 1)
                .html(`
                  <div class="tooltip-title"  style="font-weight: 600;">Zipcode: ${d.zip}</div>
                  <div style="font-weight: 300;">Number of Calls: ${d.count}</div>
                `);
            }
        })
        .on('mouseleave', () => {
          d3.select('#tooltip').style('display', 'none');
          d3.selectAll("rect")
            .style("filter", "brightness(100%)");
        });
    vis.rects
      .on('click', (event, d) => {
        d3.select('#tooltip').style('display', 'none')
        vis.refresh(d.zip);
      })

      vis.xAxisInsert.on('click', (event, d) => {
        d3.select('#tooltip').style('display', 'none')
        vis.refresh(d);
      })

    vis.rects.transition()
        .duration(1000)
      .attr('y', (d) => vis.yScale(d.count) ) 
      .attr('height', (d) => vis.height - vis.yScale(d.count));

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