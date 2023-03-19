class LeafletMap {

  /**
   * Class constructor with basic configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data,_background_Url, _background_Attr, _refresh) {
    this.config = {
      parentElement: _config.parentElement,
    }
    this.data = _data;
    this.refresh = _refresh;
    this.background_Url = _background_Url
    this.background_Attr = _background_Attr
    this.brushEnabled = false; // brush disabled by default
    this.heatmapEnabled = false; // heatmap disabled by default
    this.filteredData
    this.initVis();
  }
  
  /**
   * We initialize scales/axes and append static elements, such as axis titles.
   */
  initVis() {
    let vis = this;

    //ESRI
    vis.esriUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    vis.esriAttr = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';

    //TOPO
    vis.topoUrl ='https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
    vis.topoAttr = 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'

    //Thunderforest Outdoors- requires key... so meh... 
    vis.thOutUrl = 'https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey={apikey}';
    vis.thOutAttr = '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    //Stamen Terrain
    vis.stUrl = 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}';
    vis.stAttr = 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    //this is the base map layer, where we are showing the map background
    vis.base_layer = L.tileLayer(vis.stUrl, {
      id: 'esri-image',
      attribution: vis.esriAttr,
      ext: 'png'
    });

     vis.theMap = L.map('my-map', {
      center: [39.1431, -84.5120],
      zoom: 12,
      layers: [vis.base_layer]
    });

    //if you stopped here, you would just have a map

    //initialize svg for d3 to add to map
    L.svg({clickable:true}).addTo(vis.theMap)// we have to make the svg layer clickable
    vis.overlay = d3.select(vis.theMap.getPanes().overlayPane)
    vis.svg = vis.overlay.select('svg').attr("pointer-events", "auto")

    //these are the city locations, displayed as a set of dots 
    vis.Dots = vis.svg.selectAll('circle')
  .data(vis.data) 
  .join('circle')
      .attr("fill", d => d.mapColor) 
      .attr("stroke", "black")
      //Leaflet has to take control of projecting points. Here we are feeding the latitude and longitude coordinates to
      //leaflet so that it can project them on the coordinates of the view. Notice, we have to reverse lat and lon.
      //Finally, the returned conversion produces an x and y point. We have to select the the desired one using .x or .y
      .attr("cx", d => vis.theMap.latLngToLayerPoint([d.latitude,d.longitude]).x)
      .attr("cy", d => vis.theMap.latLngToLayerPoint([d.latitude,d.longitude]).y) 
      .attr("r", 3)
      .on('mouseover', function(event,d) { //function to add mouseover event
          d3.select(this).transition() //D3 selects the object we have moused over in order to perform operations on it
            .duration('150') //how long we are transitioning between the two states (works like keyframes)
            .attr('r', 7); //change radius

            //get values and check if blank, if so set to N/A
            var reqID = d.SERVICE_REQUEST_ID
            var reqDate = d.REQUESTED_DATETIME
            var upDate = d.UPDATED_DATETIME
            var agency = d.AGENCY_RESPONSIBLE
            var service = d.SERVICE_NAME
            var desc = d.DESCRIPTION

            reqID = reqID || "N/A";
            reqDate = reqDate || "N/A";
            upDate = upDate || "N/A";
            agency = agency || "N/A";
            service = service || "N/A";
            desc = (desc && desc.trim() !== '' && desc !== '"Request entered through the Web. Refer to Intake Questions for further description."') ? desc : "N/A";


          //create a tool tip
          d3.select('#tooltip')
              .style("display","block")
              .style('z-index', 1000000)
                // Format number with million and thousand separator
              .html(`<div class="tooltip-title"><b>Service Request ID: ${reqID}</b></div>
                        <ul>
                          <li>Date of Call: ${reqDate}</li>
                          <li>Updated Date: ${upDate}</li>
                          <li>Agency: ${agency}</li>
                          <li>Call Type: ${service}</li>
                          <li>Description: ${desc}</li>
                        </ul>`);

                          })
                        .on('mousemove', (event) => {
                            //position the tooltip
                            d3.select('#tooltip')
                             .style('left', (event.pageX + 10) + 'px')   
                              .style('top', (event.pageY + 10) + 'px');
                         })              
                        .on('mouseleave', function() { //function to add mouseover event
                            d3.select(this).transition() //D3 selects the object we have moused over in order to perform operations on it
                              .duration('150') //how long we are transitioning between the two states (works like keyframes)
                              .attr('r', 3) //change radius

                            d3.select('#tooltip').style('display', 'none');//turn off the tooltip

                          })
                        .on('click', (event, d) => { //experimental feature I was trying- click on point and then fly to it
                           // vis.newZoom = vis.theMap.getZoom()+2;
                           // if( vis.newZoom > 18)
                           //  vis.newZoom = 18; 
                           // vis.theMap.flyTo([d.latitude, d.longitude], vis.newZoom);
                          });
    
    //handler here for updating the map, as you zoom in and out           
    vis.theMap.on("zoomend", function(){
      vis.updateVis(vis.brushEnabled, vis.heatmapEnabled);
    });

    vis.brush = d3.brush()
    .extent([[0, 0], [vis.theMap.getSize().x, vis.theMap.getSize().y]])
    .on("start brush", brushed)
    .on("end", brushEnd);

    function brushed(event) {
      // Get the current brush selection and convert it to lat/lon coordinates
      let selection = event.selection;
      let bounds = L.latLngBounds(
        vis.theMap.layerPointToLatLng([selection[0][0], selection[0][1]]),
        vis.theMap.layerPointToLatLng([selection[1][0], selection[1][1]])
      );
    
      // Filter your data based on the brush selection
      vis.filteredData = vis.data.filter(d => bounds.contains([d.latitude, d.longitude]));
    
      // Update the visualization with the filtered data
      vis.Dots = vis.svg.selectAll('circle')
        .attr("stroke", d => bounds.contains([d.latitude, d.longitude]) ? "white" : "black");
    }

    function brushEnd(event){
      let selection = event.selection;
      let bounds = L.latLngBounds(
        vis.theMap.layerPointToLatLng([selection[0][0], selection[0][1]]),
        vis.theMap.layerPointToLatLng([selection[1][0], selection[1][1]])
      );

      vis.Dots = vis.svg.selectAll('circle')
        .attr("stroke", d => bounds.contains([d.latitude, d.longitude]) ? "white" : "black");
    
      // Filter your data based on the brush selection
      
      vis.refresh(vis.filteredData);
    }

    var fullscreen = new L.Control.Fullscreen();
    vis.theMap.addControl(fullscreen);

  }



  updateVis(brushEnabled, heatmapEnabled) {
    let vis = this;
    //want to see how zoomed in you are? 
    // console.log(vis.map.getZoom()); //how zoomed am I
    
    //want to control the size of the radius to be a certain number of meters? 
    vis.radiusSize = 3; 
    // clear brush

    // if( vis.theMap.getZoom > 15 ){
    //   metresPerPixel = 40075016.686 * Math.abs(Math.cos(map.getCenter().lat * Math.PI/180)) / Math.pow(2, map.getZoom()+8);
    //   desiredMetersForPoint = 100; //or the uncertainty measure... =) 
    //   radiusSize = desiredMetersForPoint / metresPerPixel;
    // }
    
   
   //update background:
    vis.base_layer = L.tileLayer(vis.background_Url, {
      id: 'new-background',
      attribution: vis.background_Attr,
      ext: 'png'
    });

    //delete the old background
    vis.theMap.eachLayer(function (layer) {
      if(layer.url != null){
        vis.theMap.removeLayer(layer);
      }
    });

  vis.theMap.addLayer(vis.base_layer);

  if (heatmapEnabled != true){
    vis.heatmapEnabled = false;
    vis.Dots.attr("cx", d => vis.theMap.latLngToLayerPoint([d.latitude,d.longitude]).x)
    .attr("cy", d => vis.theMap.latLngToLayerPoint([d.latitude,d.longitude]).y)
    //redraw dots with correct position and map color
    vis.Dots = vis.svg.selectAll('circle')
      .data(vis.data) 
      .join('circle')
      .attr("cx", d => vis.theMap.latLngToLayerPoint([d.latitude,d.longitude]).x)
      .attr("cy", d => vis.theMap.latLngToLayerPoint([d.latitude,d.longitude]).y)
      .attr("r", vis.radiusSize)
      .attr("fill", d => d.mapColor)
      .attr("stroke", "black")
      .on('mouseover', function(event,d) { //function to add mouseover event
        d3.select(this).transition() //D3 selects the object we have moused over in order to perform operations on it
          .duration('150') //how long we are transitioning between the two states (works like keyframes)
          .attr('r', 7); //change radius

          //get values and check if blank, if so set to N/A
          var reqID = d.SERVICE_REQUEST_ID
          var reqDate = d.REQUESTED_DATETIME
          var upDate = d.UPDATED_DATETIME
          var agency = d.AGENCY_RESPONSIBLE
          var service = d.SERVICE_NAME
          var desc = d.DESCRIPTION

          reqID = reqID || "N/A";
          reqDate = reqDate || "N/A";
          upDate = upDate || "N/A";
          agency = agency || "N/A";
          service = service || "N/A";
          desc = (desc && desc.trim() !== '' && desc !== '"Request entered through the Web. Refer to Intake Questions for further description."') ? desc : "N/A";


        //create a tool tip
        d3.select('#tooltip')
            .style("display","block")
            .style('z-index', 1000000)
              // Format number with million and thousand separator
            .html(`<div class="tooltip-title"><b>Service Request ID: ${reqID}</b></div>
                      <ul>
                        <li>Date of Call: ${reqDate}</li>
                        <li>Updated Date: ${upDate}</li>
                        <li>Agency: ${agency}</li>
                        <li>Call Type: ${service}</li>
                        <li>Description: ${desc}</li>
                      </ul>`);

                        })
                      .on('mousemove', (event) => {
                          //position the tooltip
                          d3.select('#tooltip')
                           .style('left', (event.pageX + 10) + 'px')   
                            .style('top', (event.pageY + 10) + 'px');
                       })              
                      .on('mouseleave', function() { //function to add mouseover event
                          d3.select(this).transition() //D3 selects the object we have moused over in order to perform operations on it
                            .duration('150') //how long we are transitioning between the two states (works like keyframes)
                            .attr('r', 3) //change radius

                          d3.select('#tooltip').style('display', 'none');//turn off the tooltip

                        })
                      .on('click', (event, d) => { //experimental feature I was trying- click on point and then fly to it
                         // vis.newZoom = vis.theMap.getZoom()+2;
                         // if( vis.newZoom > 18)
                         //  vis.newZoom = 18; 
                         // vis.theMap.flyTo([d.latitude, d.longitude], vis.newZoom);
                        });
   ;
  }

  if (brushEnabled == true) {
    d3.selectAll(".brush").remove();
    // disable dragging on leaflet
    vis.theMap.dragging.disable();
    // enable the brush
    vis.svg.append("g")
      .attr("class", "brush")
      .call(vis.brush);
    vis.brushEnabled = true;
  } else if (brushEnabled == false){
    // enable dragging on leaflet
    vis.theMap.dragging.enable();
    // disable the brush
    d3.selectAll(".brush").remove();
    vis.brushEnabled = false;
    if (vis.filteredData != null && vis.filteredData.length > 0) {
      vis.refresh(vis.filteredData);
    }
  }
  // if not null, remove heatmap layer
  if (vis.heatmapLayer){
    // remove heatmap layer
    vis.theMap.removeLayer(vis.heatmapLayer);
  }

  // add heatmap if enabled
  if (heatmapEnabled == true){

    vis.heatmapLayer = L.heatLayer([], {
      radius: 10,
      blur: 25, // increased blur value
      maxZoom: 13,
      gradient: {0.1: 'blue', 0.3: 'green', 0.4: 'yellow', 0.6: 'orange', 0.8: 'red'} // more color stops for a smoother transition
    }).addTo(vis.theMap);
    vis.heatmapEnabled = true;
    // remove dots
    vis.Dots.remove();

    let heatmapPoints = vis.data.map(d => [d.latitude, d.longitude]);

    // set heatmap layer data
    vis.heatmapLayer.setLatLngs(heatmapPoints);
  }

}


  renderVis() {
    let vis = this;

    //not using right now... 
 
  }
}