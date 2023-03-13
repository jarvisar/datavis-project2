//Global Variables to hold data before/after filtering
var globalData =[];
let data;
let map;

//Data is split into 2 files to reduce file size for GitHub upload. 
//Read first half:
d3.csv('data/311_data_pt_1.csv')
.then(thisdata => {
    thisdata.forEach(d => {
      //Add a latitude and longitude for every data point with the correct configuration
      if(!isNaN(d.LATITUDE) && !isNaN(d.LONGITUDE) && d.LONGITUDE!= "" && d.LATITUDE!= "" && isNaN(Date.parse(d.LONGITUDE)) && isNaN(Date.parse(d.LATITUDE))){
          d.latitude = +d.LATITUDE; //make sure these are not strings
          d.longitude = +d.LONGITUDE; //make sure these are not strings
          d.mapColor = "#4682b4"
          d.dateDif = dateDiffInDays(d.REQUESTED_DATETIME,d.UPDATED_DATETIME)
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
        d.mapColor = "#4682b4"
        d.dateDif = dateDiffInDays(d.REQUESTED_DATETIME,d.UPDATED_DATETIME)
      }
      globalData.push(d)
    });


    //create the map
    map = new LeafletMap({parentElement: '#my-map'}, getMapData(data));
    updateMapColor();

  })
  .catch(error => console.error(error));

//Log Data
console.log("Here is the data: ", globalData);

//Always work with "data" object now, unless resetting to original data set (globalData)
data = globalData;

//set function of map dropdown
d3.select("#dropdown").on("change", updateMapColor);

//set call type legend functionality
d3.selectAll('.legend-btn').on('click', function() {
      // Toggle 'inactive' class
      d3.select(this).classed('inactive', !d3.select(this).classed('inactive'));

      // Check which categories are active
      let selectedCategory = [];
      d3.selectAll('.legend-btn:not(.inactive)').each(function() {
        if(d3.select(this).attr('category') == "bld"){
          selectedCategory.push("#4e79a7");
        }
        else if(d3.select(this).attr('category') == "pothole"){
          selectedCategory.push("#f28e2c");
        }
        else if(d3.select(this).attr('category') == "street"){
          selectedCategory.push("#e15759");
        }
        else if(d3.select(this).attr('category') == "trash"){
          selectedCategory.push("#76b7b2");
        }
        else if(d3.select(this).attr('category') == "recyc"){
          selectedCategory.push("#59a14f");
        }
        else if(d3.select(this).attr('category') == "special"){
          selectedCategory.push("#edc949");
        }
        else if(d3.select(this).attr('category') == "signage"){
          selectedCategory.push("#af7aa1");
        }
        else if(d3.select(this).attr('category') == "metal"){
          selectedCategory.push("#ff9da7");
        }
        else if(d3.select(this).attr('category') == "animal"){
          selectedCategory.push("#9c755f");
        }
        else if(d3.select(this).attr('category') == "other"){
          selectedCategory.push("#bab0ab");
        }
      });
      
      var returnData = data;
      console.log(selectedCategory)
      returnData = returnData.filter(d => selectedCategory.includes(d.mapColor));
      console.log(returnData)
      // Filter data accordingly and update vis
      map.data = returnData;
      map.updateVis();

    });



//Process data for leafletMap
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

//function to reset charts to originl data
function resetCharts(){
    let returnData = []

    //reset dropdown
    const dropdown = document.getElementById("dropdown");
    dropdown.value = "option1";

    //set legend
    document.getElementById("option1-legend").style.display = "inline-block";
    document.getElementById("option2-legend").style.display = "none";

    //reset map
    updateMapColor();

    //TO-DO

    return returnData
  }

  //function to reset charts to originl data
function updateMapColor(){
    let returnData = []
    var thisData = data;
    //get value
    const dropdownValue = document.getElementById("dropdown").value;

    if(dropdownValue == "option1"){
      document.getElementById("option1-legend").style.display = "inline-block";
      document.getElementById("option2-legend").style.display = "none";
      //Call type
      for(var obj in thisData){
        if(data[obj].latitude != null){
          colors = ["#4e79a7","#f28e2c","#e15759","#76b7b2","#59a14f","#edc949","#af7aa1","#ff9da7","#9c755f","#bab0ab"]

          
          if(thisData[obj].SERVICE_NAME.includes("Building,") || thisData[obj].SERVICE_NAME.includes("Unsanitary") || thisData[obj].SERVICE_NAME.includes("Tree") || thisData[obj].SERVICE_NAME.includes("Tall grass") || thisData[obj].SERVICE_NAME.includes("Sewage,")|| thisData[obj].SERVICE_NAME.includes("Plumbing") || thisData[obj].SERVICE_NAME.includes("Mold") || thisData[obj].SERVICE_NAME.includes("Land/use") || thisData[obj].SERVICE_NAME.includes("Heat, no")){
            //Building Repair
            thisData[obj].mapColor = colors[0]
          }
          else if(thisData[obj].SERVICE_NAME.includes("Pothole")){
            //Pothole Repair
            thisData[obj].mapColor = colors[1]
          }
          else if(thisData[obj].SERVICE_NAME.includes("Barricade") || thisData[obj].SERVICE_NAME.includes("Sunken") || thisData[obj].SERVICE_NAME.includes("Street") || thisData[obj].SERVICE_NAME.includes("streets") || thisData[obj].SERVICE_NAME.includes("Sidewalk") || thisData[obj].SERVICE_NAME.includes("Pavement") || thisData[obj].SERVICE_NAME.includes("traffc") || thisData[obj].SERVICE_NAME.includes("Light,") || thisData[obj].SERVICE_NAME.includes("Inlets") || thisData[obj].SERVICE_NAME.includes("Curb") || thisData[obj].SERVICE_NAME.includes("Exit, blocked") || thisData[obj].SERVICE_NAME.includes("Fire hydrant") || thisData[obj].SERVICE_NAME.includes("General repair, street")){
            //General Street Repair
            thisData[obj].mapColor = colors[2]
          }
          else if(thisData[obj].SERVICE_NAME.includes("Corner can") || thisData[obj].SERVICE_NAME.includes("Yard waste") || thisData[obj].SERVICE_NAME.includes("Trash") || thisData[obj].SERVICE_NAME.includes("yardwaste") || thisData[obj].SERVICE_NAME.includes("trash") || thisData[obj].SERVICE_NAME.includes("dumping") || thisData[obj].SERVICE_NAME.includes("Litter") || thisData[obj].SERVICE_NAME.includes("Dumping")){
            //Trash Collection
            thisData[obj].mapColor = colors[3]
          }
          else if(thisData[obj].SERVICE_NAME.includes("Recycling")){
            //Recycling Collection
            thisData[obj].mapColor = colors[4]
          }
          else if(thisData[obj].SERVICE_NAME.includes("and junk veh") || thisData[obj].SERVICE_NAME.includes("Vehicle") || thisData[obj].SERVICE_NAME.includes("Tires,") || thisData[obj].SERVICE_NAME.includes("Special collections")){
            //Special Collection
            thisData[obj].mapColor = colors[5]
          }
          else if(thisData[obj].SERVICE_NAME.includes("Sign")){
            //Signage Repair
            thisData[obj].mapColor = colors[6]
          }
          else if(thisData[obj].SERVICE_NAME.includes("Metal Furn")){
            //Metal Collection
            thisData[obj].mapColor = colors[7]
          }
          else if(thisData[obj].SERVICE_NAME.includes("Bed bugs") || thisData[obj].SERVICE_NAME.includes("Roaches") || thisData[obj].SERVICE_NAME.includes("Rats")|| thisData[obj].SERVICE_NAME.includes("Mice") || thisData[obj].SERVICE_NAME.includes("Animal, waste") || thisData[obj].SERVICE_NAME.includes("Dead animal")){
            //Animal Complaint
            thisData[obj].mapColor = colors[8]
          }
          else{
            //Other
            thisData[obj].mapColor = colors[9]
          }
          returnData.push(thisData[obj])
        }
      }
    }
    else if(dropdownValue == "option2"){
      //time between
      document.getElementById("option1-legend").style.display = "none";
      document.getElementById("option2-legend").style.display = "inline-block";

      var max = 30;
      var min = 0;
      // Define the D3 color scale using the Red-Yellow-Green color scale
      const colorScale = d3.scaleSequential()
        .interpolator(d3.interpolateRdYlGn)
        .domain([max, min]);

      for(var obj in thisData){
        var dateDifference = thisData[obj].dateDif
        if(dateDifference > max){
          dateDifference = max;
        }
        if(dateDifference < min){
          dateDifference = min;
        }
        thisData[obj].mapColor = colorScale(dateDifference)
        returnData.push(thisData[obj])
      }


    }
    else if(dropdownValue == "option3"){
      document.getElementById("option1-legend").style.display = "none";
      document.getElementById("option2-legend").style.display = "none";
      //time of year
    //TO-DO
    }
    else if(dropdownValue == "option4"){
      document.getElementById("option1-legend").style.display = "none";
      document.getElementById("option2-legend").style.display = "none";
      //agency
    //TO-DO
    }

    data = returnData;
    map.data = returnData;
    map.updateVis();
  }

  function dateDiffInDays(date1, date2) {
  // Convert date strings to Date objects
  const date1Obj = new Date(date1);
  const date2Obj = new Date(date2);

  // Calculate the time difference between the two dates
  const timeDiff = Math.abs(date2Obj.getTime() - date1Obj.getTime());

  // Calculate the number of days between the two dates
  const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

  return diffDays;
}