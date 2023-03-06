//Global Variables to hold data before/after filtering
var globalData =[];
let data;

//Data is split into 2 files to reduce file size for GitHub upload. 
//Read first half:
d3.csv('data/311_data_pt_1.csv')
.then(thisdata => {
    thisdata.forEach(d => {
      //Add a latitude and longitude for every data point with the correct configuration
      if(!isNaN(d.LATITUDE) && !isNaN(d.LONGITUDE) && d.LONGITUDE!= "" && d.LATITUDE!= "" && isNaN(Date.parse(d.LONGITUDE)) && isNaN(Date.parse(d.LATITUDE))){
          d.latitude = +d.LATITUDE; //make sure these are not strings
          d.longitude = +d.LONGITUDE; //make sure these are not strings
      }
      globalData.push(d)
    });

  })
  .catch(error => console.error(error));
//Read first half:
  d3.csv('data/311_data_pt_2.csv')
.then(thisdata => {
    thisdata.forEach(d => {
      //Add a latitude and longitude for every data point with the correct configuration
      if(!isNaN(d.LATITUDE) && !isNaN(d.LONGITUDE) && d.LONGITUDE!= "" && d.LATITUDE!= "" && isNaN(Date.parse(d.LONGITUDE)) && isNaN(Date.parse(d.LATITUDE))){
        d.latitude = +d.LATITUDE; //make sure these are not strings
        d.longitude = +d.LONGITUDE; //make sure these are not strings
      }
      globalData.push(d)
    });


    //create the map
    map = new LeafletMap({ parentElement: '#my-map'}, getMapData(data));

  })
  .catch(error => console.error(error));

//Log Data
console.log("Here is the data: ", globalData);

//Always work with "data" object now, unless resetting to original data set (globalData)
data = globalData;


//Process data for leafletMap (might not be)
function getMapData(thisData){
    let returnData = []

    //Only show items on the map that have a Lat/Lon
    for(var obj in thisData){
      if(thisData[obj].latitude != null){
        returnData.push(thisData[obj])
      }
    }
    return returnData
  }