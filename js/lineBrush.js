class Line {

  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      contextHeight: 40,
       margin: {top: 40, bottom: 110, right: 20, left: 60},
      contextMargin: {top: 20, bottom: 40, right: 50, left: 60},
      width: _config.containerWidth,
      height:  _config.containerHeight
    }

    this.data = _data;

    // Call a class function
    this.initVis();
  }

  initVis() {
      
    let vis = this; //this is a keyword that can go out of scope, especially in callback functions, 
                    //so it is good to create a variable that is a reference to 'this' class instance

    //set up the width and height of the area where visualizations will go- factoring in margins               
    vis.width = vis.config.width - vis.config.margin.right - vis.config.margin.left;
    vis.height = vis.config.height - vis.config.margin.top - vis.config.margin.bottom;
    vis.containerHeight = vis.config.height + vis.config.margin.top + vis.config.margin.bottom;

// Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
        .attr('width', vis.config.width)
        .attr('height',  vis.config.height);

    //Title
    vis.svg.append("text")
       .attr('transform', `translate(${(vis.width - vis.config.margin.left - vis.config.margin.right)/2}, ${vis.config.margin.top -20 })`)
       .attr("font-size", "20px")
       .text("Calls Placed Over 2022")
       .style("font-family", "Roboto")
        .style("color", "black")
        .style("font-size", "20px");
    // X axis Label    
    vis.svg.append("text")
       .attr("transform", `translate(${(vis.width)/1.8},${vis.height + vis.config.margin.bottom + 25})`)
       .style("text-anchor", "middle")
       .text("Date Of Call")
       .style("font-family", "Roboto")
        .style("color", "black")
        .style("font-size", "16px");
    vis.svg.append("text")
       .attr("transform", "rotate(-90)")
       .attr("x", -(vis.height/2) - vis.config.margin.top)
       .attr("y", 15)
       .style("text-anchor", "middle")
       .text("Number of Calls Placed")
       .style("font-family", "Roboto")
        .style("color", "black")
        .style("font-size", "16px");
    vis.xAxisLine = vis.svg.append("line")
        .attr("x1", vis.config.margin.left)
        .attr("y1", vis.height + vis.config.margin.top)
        .attr("x2", vis.width + vis.config.margin.left)
        .attr("y2", vis.height + vis.config.margin.top)
        .attr("stroke", "black")
        .attr("stroke-width", 1);
    vis.yAxisLine = vis.svg.append("line")
        .attr("x1", vis.config.margin.left)
        .attr("y1", vis.config.margin.top)
        .attr("x2", vis.config.margin.left)
        .attr("y2", vis.height + vis.config.margin.top)
        .attr("stroke", "black")
        .attr("stroke-width", 1);
    vis.static = true;
    vis.updateVis();


  }
  updateVis() { 
        let vis = this;
        vis.svg.selectAll('.y-axis').remove();
        vis.svg.selectAll('.x-axis').remove();
        vis.svg.selectAll('.chart').remove();
        vis.svg.selectAll('.plan').remove();
        vis.xValue = d => parseFloat(d.day); 
        vis.yValue = d => parseFloat(d.num);
        let min = d3.min(vis.data, d => d.day)
        let max = d3.max(vis.data, d => d.day)
        if(min!=null){
            let dif = max - min;
            if(dif < 10){
                let newMin = min - 10 + dif
                for(let i = min -1; i >= newMin; i--){
                    vis.data.unshift({"day":i,"num":0})
                }
                min = newMin;
            }
        }
        else{
            min = 1992
            max = 2022
        }
        let yMin = d3.min(vis.data, d => d.num)
        let yMax = d3.max(vis.data, d => d.num)
        if(yMin==null){
            yMin = 0
            yMax = 1
        }
        const startDate = new Date(2021,0,min + 2);

        vis.xScaleFocus = d3.scaleTime()
            .domain([startDate, d3.timeDay.offset(startDate, max)])
            .range([0, vis.width]);

        vis.xScaleContext = d3.scaleLinear()
            .domain([startDate, d3.timeDay.offset(startDate, max)])
            .range([0, vis.width]);

        vis.yScaleFocus = d3.scaleLinear()
            .range([vis.height, 0])
            .nice();

        vis.yScaleContext = d3.scaleLinear()
            .range([vis.config.contextHeight, 0])
            .nice();

        const xTickFormat = d3.timeFormat('%B %d, %Y');

        // Initialize axes
        vis.xAxisFocus = d3.axisBottom(vis.xScaleFocus).ticks(5).tickFormat((d, i) => xTickFormat(new Date(startDate.getTime() + (d - 1) * 24 * 60 * 60 * 1000)));
        vis.xAxisContext = d3.axisBottom(vis.xScaleContext).ticks(5).tickFormat((d, i) => xTickFormat(new Date(startDate.getTime() + (d - 1) * 24 * 60 * 60 * 1000)));
        vis.yAxisFocus = d3.axisLeft(vis.yScaleFocus).ticks(5);


         // Append focus group with x- and y-axes
        vis.focus = vis.svg.append('g')
            .attr('id', 'focus')
            .attr('class', 'chart')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`)

        vis.focus.append('defs').append('clipPath')
            .attr('id', 'clip')
            .attr('class', 'chart')
            .append('rect')
            .attr('width', vis.width)
            .attr('height', vis.height);
        
        vis.focusLinePath = vis.focus.append('path')
            .attr('class', 'chart');

        vis.focusAreaPath = vis.focus.append('path')
            .attr('class', 'chart');

        vis.xAxisFocusG = vis.focus.append('g')
            .attr('class', 'chart')
            .attr('transform', `translate(0,${vis.height})`);

        vis.yAxisFocusG = vis.focus.append('g')
            .attr('class', 'chart');

        vis.tooltipTrackingArea = vis.focus.append('rect')
            .attr('width', vis.width)
            .attr('height', vis.height)
            .attr('fill', 'none')
            .attr('pointer-events', 'all');

        // Empty tooltip group (hidden by default)
        vis.tooltip = vis.focus.append('g')
            .attr('class', 'tooltip')
            .style('display', 'none');

        vis.tooltip.append('circle')
            .attr('r', 4);

        vis.tooltip.append('text');


        // Append context group with x- and y-axes
        vis.context = vis.svg.append('g')
            .attr('id', 'context')
            .attr('class', 'chart')
            .attr('transform', `translate(${vis.config.contextMargin.left},${vis.height + vis.config.contextMargin.top +vis.config.contextHeight})`);

        vis.contextAreaPath = vis.context.append('path')
            .attr('class', 'chart');

        vis.xAxisContextG = vis.context.append('g')
            .attr('class', 'chart')
            .attr('transform', `translate(0,${vis.config.contextHeight})`);

        vis.brushG = vis.context.append('g')
            .attr('class', 'chart');


        // Initialize brush component
        vis.brush = d3.brushX()
            .extent([[0, 0], [vis.width, vis.config.contextHeight]])
            .on('brush', function({selection}) {
              if (selection) vis.brushed(selection);
            })
            .on('end', function({selection}) {
              if (!selection) 
                {
                vis.brushed(null)
              }else if(selection[0] != 0 || selection[1] != vis.width){
                 updateFromLine(vis.selectedDomain[0],vis.selectedDomain[1])
                 vis.static == false
              }
              else if(selection[0] == 0 && selection[1] == vis.width && vis.static == false){
                 updateFromLine(vis.selectedDomain[0],vis.selectedDomain[1])
                 vis.static == true
              }

            });
        vis.lineBase = d3.line()
        .x(d => vis.xScaleFocus(vis.xValue(d)))
            .y(vis.height);

        // Initialize line and area generators
        vis.line = d3.line()
            .x(d => vis.xScaleFocus(vis.xValue(d)))
            .y(d => vis.yScaleFocus(vis.yValue(d)));

        vis.focusAreaBase = d3.area()
            .x(d => vis.xScaleFocus(vis.xValue(d)))
            .y1(vis.height)
            .y0(vis.height);

        vis.focusArea = d3.area()
            .x(d => vis.xScaleFocus(vis.xValue(d)))
            .y1(d => vis.yScaleFocus(vis.yValue(d)))
            .y0(vis.height);

        vis.area = d3.area()
            .x(d => vis.xScaleContext(d.day))
            .y1(d => vis.yScaleContext(d.num))
            .y0(vis.config.contextHeight);

        // Set the scale input domains
        vis.xScaleFocus.domain(d3.extent(vis.data, vis.xValue));
        vis.yScaleFocus.domain(d3.extent(vis.data, vis.yValue));
        vis.xScaleContext.domain(vis.xScaleFocus.domain());
        vis.yScaleContext.domain(vis.yScaleFocus.domain());

        vis.bisectDate = d3.bisector(vis.xValue).left;


    vis.focusLinePath
        .datum(vis.data)
        .attr('class','chart')
        .attr('stroke',  '#e52000')
        .attr('stroke-width', 2)
        .attr('fill', 'none')
        .attr('d', vis.lineBase)
        .attr("clip-path", "url(#clip)")

    vis.focusLinePath.transition()
        .duration(1000)
        .attr('d', vis.line)

    vis.focusAreaPath
        .attr('class','chart')
        .datum(vis.data)
        .attr('class','chart')
        .attr('fill', '#ffb1a4')
        .attr('d', vis.focusAreaBase)
        .attr("clip-path", "url(#clip)")

    vis.focusAreaPath.transition()
        .duration(1000)
        .attr('d', vis.focusArea)

    vis.contextAreaPath
        .attr('class','chart')
        .datum(vis.data)
        .attr('class','chart')
        .attr('fill', '#d2d2d2')
        .attr('d', vis.area)
        .attr("clip-path", "url(#clip)")

    vis.tooltipTrackingArea
        .on('mouseenter', () => {
          if(vis.data.length > 0){
          vis.tooltip.style('display', 'block');
      }
        })
        .on('mouseleave', () => {
          vis.tooltip.style('display', 'none');
          d3.select('#line-tooltip').style('display', 'none');
        })
        .on('mousemove', function(event) {
          // Get date that corresponds to current mouse x-coordinate
          const xPos = d3.pointer(event, this)[0]; // First array element is x, second is y
          const day = vis.xScaleFocus.invert(xPos);


          // Find nearest data point
          const index = vis.bisectDate(vis.data, day, 1);
          const a = vis.data[index - 1];
          const b = vis.data[index];
          const d = b && (day - a.day > b.day - day) ? b : a; 
          if(d != null){
          // Update tooltip
          if(d.day != max){
              const oneDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day
              const start = new Date( 'January 1, 2021'); // Convert start date to a Date object
              const date = new Date(start.getTime() + d.day * oneDay); // Add the number of days to the start date
              const options = { month: 'long', day: 'numeric', year: 'numeric' }; // Date formatting options

              d3.select('#line-tooltip')
              .style('display', 'block')
              .style('left', (vis.xScaleFocus(parseFloat(d.day)) + 5) + 'px')   
              .style('top', ((vis.yScaleFocus(d.num) - 5)) + 'px')
              .html(`
                <div style="text-align: center"><b>${date.toLocaleDateString('en-US', options)}</b></div>
                <div style="text-align: center">${Math.round(d.num) + " calls"}</div>
              `);
              vis.tooltip.select('circle')
              .attr('transform', `translate(${vis.xScaleFocus(parseFloat(d.day))},${vis.yScaleFocus(d.num)})`);
          
          }
          else{
            d3.select('#line-tooltip')
                .style('display', 'block') 
                .style('left', (vis.xScaleFocus(parseFloat(d.day)) + 5) + 'px')   
                .style('top', ((vis.yScaleFocus(d.num) - 5)) + 'px')
                .html(`
                <div style="text-align: center"><b>${date.toLocaleDateString('en-US', options)}</b></div>
                <div style="text-align: center">${Math.round(d.num) + " calls"}</div>
                `);
            vis.tooltip.select('circle')
              .attr('transform', `translate(${vis.xScaleFocus(parseFloat(d.day))},${vis.yScaleFocus(d.num)})`);
          
            }
        }
        });
    // Update the axes
    vis.xAxisFocusG.call(vis.xAxisFocus);
    vis.yAxisFocusG.call(vis.yAxisFocus);
    vis.xAxisContextG.call(vis.xAxisContext);
    var numMax = vis.xScaleContext.range()[1]
    var half = 0;
    if(numMax > 0){
        half = numMax/2
    }
    // Update the brush and define a default position
    const defaultBrushSelection = [half, numMax];
    
    if(vis.data.length>0){
    vis.brushG
        .call(vis.brush)
        .call(vis.brush.move, defaultBrushSelection);
    }
  
  }

  brushed(selection) {
    let vis = this;

    // Check if the brush is still active or if it has been removed
    if (selection) {
      // Convert given pixel coordinates (range: [x0,x1]) into a time period (domain: [Date, Date])
      vis.selectedDomain = selection.map(vis.xScaleContext.invert, vis.xScaleContext);
      // Update x-scale of the focus view accordingly
      vis.xScaleFocus.domain(vis.selectedDomain);
      var yData = vis.data
      var yMax = 0;
      for(var i = Math.floor(vis.selectedDomain[0]); i < vis.selectedDomain[1]; i++){
        if(yData[i].num>yMax){
          yMax = yData[i].num
        }
      } 
      vis.yScaleFocus.domain([0,yMax]);
      

    } else {
      // Reset x-scale of the focus view (full time period)
        vis.selectedDomain = vis.xScaleContext.domain()
      vis.xScaleFocus.domain(vis.xScaleContext.domain());

      vis.selectedRange = vis.yContext.domain()
      vis.yScaleFocus.domain(vis.xContext.domain());
    }

    // Redraw line and update x-axis labels in focus view
    vis.focusLinePath.attr('d', vis.lineBase);
    vis.focusLinePath.transition()
        .duration(1000)
        .attr('d', vis.line)
    vis.focusAreaPath
        .attr('d', vis.focusAreaBase)

    vis.focusAreaPath.transition()
        .duration(1000)
        .attr('d', vis.focusArea)

    vis.xAxisFocusG.call(vis.xAxisFocus);
    vis.yAxisFocusG.call(vis.yAxisFocus);
  }
}