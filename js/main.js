


d3.tsv('data/Cincy311_2022_final.tsv')
.then(data => {
    console.log(data[0]);
    console.log(data.length);
    processedData = []
    data.forEach(d => {
      if(!isNaN(d.LATITUDE) && !isNaN(d.LONGITUDE) && d.LONGITUDE!= "" && d.LATITUDE!= ""){
        d.latitude = +d.LATITUDE; //make sure these are not strings
        d.longitude = +d.LONGITUDE; //make sure these are not strings
      }
      processedData.push(d)
    });
    console.log(processedData)
    // Initialize chart and then show it
    leafletMap = new LeafletMap({ parentElement: '#my-map'}, processedData);


  })
  .catch(error => console.error(error));
