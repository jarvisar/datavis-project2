class Histogram {
  constructor(_config, _data, _refresh) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 500,
      containerHeight: _config.containerHeight || 140,
      margin: { top: 40, bottom: 80, right: 20, left: 60 },
      contextHeight: 30
    }
    this.data = _data; 
    this.refresh = _refresh
    this.initVis();
  }
  /**
   * Define titles and lables, assign them to the SVG element
   */
  initVis() {
    let vis = this;


    vis.width = vis.config.containerWidth - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom - vis.config.contextHeight;
        
        // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    //Title
    vis.svg.append("text")
       .attr('transform', `translate(${(vis.width)/2.4}, ${vis.config.margin.top -20 })`)
       .attr("font-size", "20px")
       .text("Response Time of Calls")
       .style("font-family", "Roboto")
        .style("color", "black")
        .style("font-size", "20px");
    // X axis Label    
    vis.svg.append("text")
       .attr("transform", `translate(${(vis.width- vis.config.margin.right - vis.config.margin.left)/2 + vis.config.margin.left},${vis.height + vis.config.contextHeight + vis.config.margin.bottom + 35})`)
       .style("text-anchor", "middle")
       .text("Time to Respond (days)")
       .style("font-family", "Roboto")
        .style("color", "black")
        .style("font-size", "14px");
    vis.svg.append("text")
       .attr("transform", "rotate(-90)")
       .attr("x", -(vis.height/2) - vis.config.margin.top)
       .attr("y", 15)
       .style("text-anchor", "middle")
       .text("Number of Calls")
       .style("font-family", "Roboto")
        .style("color", "black")
        .style("font-size", "14px");
vis.static = true;
      vis.updateVis(); 
  }
  /**
   * Prepare the data and scales and render it.
   */
  updateVis() {
    let vis = this;
    vis.svg.selectAll('.y-axis').remove();
    vis.svg.selectAll('.x-axis').remove();
    vis.svg.selectAll('.chart').remove();
    vis.svg.selectAll('.plan').remove();
    vis.svg.selectAll('.rects').remove();
    vis.svg.selectAll('.clipHist').remove();
    vis.svg.selectAll('.rectsdrawn').remove();
vis.x = d3.scaleLinear()
  .domain([0,  31])
  .range([vis.config.margin.left, vis.width])
vis.xContext = d3.scaleLinear()
  .domain([0,  31])
  .range([vis.config.margin.left, vis.width])
// set the parameters for the histogram
let histogram = d3.histogram()
  .value(function(d) { return d.dateDifHist; })   // I need to give the vector of value
  .domain(vis.x.domain())  // then the domain of the graphic
  .thresholds(vis.x.ticks(31)); // then the numbers of bins

vis.bins = histogram(vis.data);

let max = d3.max(vis.bins, function(d) { return d.length; })
if(max==0){
  max = 1
}
// Y axis: scale and draw:
vis.y = d3.scaleLinear()
  .range([vis.height, 0])
  .domain([0, max]);   // d3.hist has to be called before the Y axis obviously

// Y axis: scale and draw:
vis.yContext = d3.scaleLinear()
  .range([vis.height + vis.config.margin.bottom + vis.config.contextHeight, vis.height + vis.config.margin.bottom])
  .domain([0, max]);   // d3.hist has to be called before the Y axis obviously



vis.contextRects = vis.svg.append('g').attr('class', 'rects');
vis.rects = vis.svg.append('g').attr('class', 'rects')
    .attr('height', vis.height)
    .attr('clip-path', 'url(#clipHist)');


vis.xAxis = d3.axisBottom(vis.x)
vis.yAxis = d3.axisLeft(vis.y).ticks(5)
vis.xAxisG = vis.svg.append('g')
  .attr('class', 'x-axis')
  .attr('transform', `translate(0,${vis.height  + vis.config.margin.top})`)

vis.svg.append('g')
  .attr('class', 'x-axis')
  .attr('transform', `translate(0,${vis.height + vis.config.contextHeight + vis.config.margin.bottom})`)
  .call(d3.axisBottom(vis.xContext));

vis.yAxisG = vis.svg.append('g')
  .attr('class', 'y-axis')
  .attr('transform', `translate(${vis.config.margin.left}, ${vis.config.margin.top})`)
  .call(vis.yAxis);


vis.svg.append('defs').append('clipPath')
    .attr('id', 'clipHist')
    .attr('class', 'chart')
    .append('rect')
    .attr('x',  vis.config.margin.left)
    .attr('y',  vis.config.margin.top)
    .attr('width', vis.width-vis.config.margin.left)
    .attr('height', vis.height)

vis.brush = d3.brushX()
  .extent([[vis.config.margin.left, vis.height + vis.config.margin.bottom ], [vis.width, vis.config.contextHeight + vis.height + vis.config.margin.bottom ]])
  .on('brush', function({selection}) {
      if (selection) vis.brushed(selection);
    })
    .on('end', function({selection}) {
      let s1 = selection[0]
      let s2 = selection[1]
      if(isNaN(selection[0])){s1 = vis.config.margin.left}
      if(isNaN(selection[1])){s2 = max} 
      if (!selection) 
        {
        vis.brushed(null)
      }else if(s1 != vis.config.margin.left || s2 != vis.width){
          //updateFromHist(vis.selectedDomain[0],vis.selectedDomain[1])
          vis.static == false
      }
      else if(s1 == vis.config.margin.left && s2 == vis.width && vis.static == false){
          //updateFromHist(vis.selectedDomain[0],vis.selectedDomain[1])
          vis.static == true
      }
    });

vis.contextRects.selectAll('rect')
  .data(vis.bins)
  .join('rect')
  .attr('class', 'plan')
  .attr("transform", function(d) { 
                    let xVal = vis.x(d.x0);
                    let yVal = vis.yContext(d.length);
                return "translate(" + xVal + "," + yVal + ")"; })

  .attr("width", function(d) { return vis.x(d.x1) - vis.x(d.x0) ; })
  .attr('height', (d) => vis.config.contextHeight + vis.height  + vis.config.margin.bottom - vis.yContext(d.length))
  .style("fill", "#d2d2d2")
  var numMax = vis.xContext.range()[1]
    var half = 0;
    if(numMax > 0){
        half = numMax/2
    }
let defaultBrushSelection = [vis.xContext(0), half];
if(vis.data.length>0){
vis.svg.append('g')
  .attr('class', 'plan')
  .call(vis.brush) // initialize the brush
  .call(vis.brush.move, defaultBrushSelection)
  .selectAll('rect')
  .attr('y', vis.config.margin.top + 10 + vis.height + vis.config.contextHeight)
  .attr('height', vis.config.contextHeight)
vis.tooltipTrackingArea = vis.svg.append('rect')
            .attr('width', vis.width - vis.config.margin.left)
            .attr('height', vis.height)
            .attr('transform', `translate(${vis.config.margin.left}, ${vis.config.margin.top})`)
            .attr('fill', 'none')
            .attr('pointer-events', 'all');

// Empty tooltip group (hidden by default)
        vis.tooltip = vis.svg.append('g')
            .attr('class', 'tooltip')
            .style('display', 'none')
        vis.tooltip.append('text');
        vis.tooltip.append('circle')
            .attr('r', 4);
    vis.tooltipTrackingArea
        .on('mouseenter', () => {
          vis.tooltip.style('display', 'block');
        })
        .on('mouseleave', () => {
          vis.tooltip.style('display', 'none');
          d3.select('#histo-tooltip').style('display', 'none');
        })
        .on('mousemove', function(event) {
          // Get date that corresponds to current mouse x-coordinate
          const xPos = d3.pointer(event, this)[0]; // First array element is x, second is y
          const distance = vis.x.domain()[0] + (((vis.x.domain()[1] - vis.x.domain()[0])*xPos)/(vis.width-vis.config.margin.left));
          
          var thisData = vis.bins
          var thisData1 = thisData.filter(d=>d.x0<distance)
          var thisData2 = thisData1.filter(d=>d.x1>distance)
          if(thisData2.length>0){
          var median = (thisData2[0].x0 + thisData2[0].x1)/2
          if(median < vis.x.domain()[1] && median > vis.x.domain()[0]){
            var text = thisData2[0].x0 +" to " + thisData2[0].x1 + " days"
            if(thisData2[0].x0 == 30){
              text ="30+ days"
            }
            d3.select('#histo-tooltip')
                .style('display', 'block')
                .style('left', (vis.x(median) + 5) + 'px')   
                .style('top', (vis.y(thisData2[0].length) - 10) + 'px')
                .html(`
                  <div style="text-align: center"><b>${text}</b></div>
                  <div style="text-align: center">${thisData2[0].length + " calls"}</div>
                `);
            vis.tooltip.select('circle')
              .attr('transform', `translate(${vis.x(median)}, ${vis.y(thisData2[0].length) + vis.config.margin.top})`)
            }
          }
        })
        
      }
        vis.xAxisG.call(vis.xAxis)
  }
  /**
   * Define brush interaction
   */
  brushed(selection) {
    let vis = this;

    // Check if the brush is still active or if it has been removed
    if (selection) {
      // Convert given pixel coordinates (range: [x0,x1]) into a time period (domain: [Date, Date])
      vis.selectedDomain = selection.map(vis.xContext.invert, vis.xContext);
      // Update x-scale of the focus view accordingly
      vis.x.domain(vis.selectedDomain);
      
      //do the same for the range
      // Convert given pixel coordinates (range: [x0,x1]) into a time period (domain: [Date, Date])
      var yData = vis.bins
      var yMax = 0;
      for(var i = Math.floor(vis.selectedDomain[0]); i < vis.selectedDomain[1]; i++){
        if(yData[i].length>yMax){
          yMax = yData[i].length
        }
      } 
      vis.y.domain([0,yMax]);
      

    } else {
      // Reset x-scale of the focus view (full time period)
      vis.selectedDomain = vis.xContext.domain()
      vis.x.domain(vis.xContext.domain());

      vis.selectedRange = vis.yContext.domain()
      vis.y.domain(vis.xContext.domain());
    }
    vis.svg.selectAll('.rectsdrawn').remove();
    // Redraw line and update x-axis labels in focus view
    vis.mainRects = vis.rects.selectAll('rect')
      .data(vis.bins)
      .join('rect')
      .attr('class', 'rectsdrawn')
      .attr("transform", function(d) { 
                        let xVal = vis.x(d.x0);
                        let yVal =vis. y(d.length) + vis.config.margin.top;
                    return "translate(" + xVal + "," + (vis.height + vis.config.margin.top) + ")"; })

      .attr("width", function(d) { return vis.x(d.x1) - vis.x(d.x0) ; })
      .attr('height', 0)
      .attr('fill', "#118AB2")
      .attr("stroke", "#0b5d78")

      vis.mainRects.transition()
        .duration(1000)
        .attr('height', (d) => vis.height - vis.y(d.length))
        .attr("transform", function(d) { 
                        let xVal = vis.x(d.x0);
                        let yVal =vis. y(d.length) + vis.config.margin.top;
                    return "translate(" + xVal + "," + yVal + ")"; })
      //.attr('clip-path', 'url(#clipHist)')
    vis.xAxisG.call(vis.xAxis);
    vis.yAxisG.call(vis.yAxis);
  }
}