//Global Variables to hold data before/after filtering
var globalData =[];
let data;
let map;
let background_Url = 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}';
let background_Attr = 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
let daysOfTheWeek, lineChart, agencyChart, zipChart;

//Data is split into 2 files to reduce file size for GitHub upload. 
//Read first half:
d3.csv('data/311_data_pt_1.csv')
  .then(thisdata => {
    var loading = document.getElementById("loading"); 
    loading.classList.add("loading"); // Add loading message
    setTimeout(function(){
      thisdata.forEach(d => {
        //Add a latitude and longitude for every data point with the correct configuration
        if(!isNaN(d.LATITUDE) && !isNaN(d.LONGITUDE) && d.LONGITUDE!= "" && d.LATITUDE!= "" && isNaN(Date.parse(d.LONGITUDE)) && isNaN(Date.parse(d.LATITUDE))){
          d.latitude = +d.LATITUDE; //make sure these are not strings
          d.longitude = +d.LONGITUDE; //make sure these are not strings
          d.mapColor = "#4682b4"
        }
        d.dateDif = dateDiffInDays(d.REQUESTED_DATETIME,d.UPDATED_DATETIME)
        if (d.dateDif > 30){
          d.dateDifHist = 30
        } else{
          d.dateDifHist = d.dateDif
        }
        d.dayOfYear = dayOfTheYear(d.REQUESTED_DATETIME)
        globalData.push(d)
      });
      
    }) // Use setTimeout to delay the loading message (prevent null classlist error)
  })
.catch(error => console.error(error));

//Read second half:
d3.csv('data/311_data_pt_2.csv')
.then(thisdata => {

  setTimeout(function(){
    thisdata.forEach(d => {
      //Add a latitude and longitude for every data point with the correct configuration
      if(!isNaN(d.LATITUDE) && !isNaN(d.LONGITUDE) && d.LONGITUDE!= "" && d.LATITUDE!= "" && isNaN(Date.parse(d.LONGITUDE)) && isNaN(Date.parse(d.LATITUDE))){
        d.latitude = +d.LATITUDE; //make sure these are not strings
        d.longitude = +d.LONGITUDE; //make sure these are not strings
        d.mapColor = "#4682b4"
        
      }
      d.dateDif = dateDiffInDays(d.REQUESTED_DATETIME,d.UPDATED_DATETIME)
      if(d.dateDif > 30){
        d.dateDifHist = 30
      }
      else{
        d.dateDifHist = d.dateDif
      }
      d.dayOfYear = dayOfTheYear(d.REQUESTED_DATETIME)
      globalData.push(d)
    });


    //create the map
    map = new LeafletMap({parentElement: '#my-map'}, getMapData(data), background_Url, background_Attr);
    updateMapColor();

    //Create Line chart
    lineChart = new Line({
      'parentElement': '#timeline',
      'containerHeight': window.innerHeight/4,
      'containerWidth': window.innerWidth/2.26,
      }, getLineData(data)); 

    //Create days of the week chart:
    daysOfTheWeek = new DaysOfTheWeek({
      'parentElement': '#daysOfTheWeek',
      'containerHeight': window.innerHeight/2.7,
      'containerWidth': window.innerWidth/3.8,
      }, getDayOfWeekData(data),(filterData) => {
        //TO-DO
        const filteredData = data.filter(item => {
          const dayOfWeek = getDay(item.REQUESTED_DATETIME);
          const weekdayName = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][dayOfWeek];
          return weekdayName === filterData;
        });
        updateCharts(filteredData);
    }); 

    //Create Agency chart
    agencyChart = new AgencyType({
      'parentElement': '#agency',
      'containerHeight': window.innerHeight/2.7,
      'containerWidth': window.innerWidth/3.8,
      }, getAgency(data),(filterData) => {
        let filteredData = data.filter(item => {
          return item.AGENCY_RESPONSIBLE.includes(filterData);
        });
        updateCharts(filteredData);
    }); 

    //Create histogram
    histogram = new Histogram({
      'parentElement': '#histogram',
      'containerHeight': window.innerHeight/4,
      'containerWidth': window.innerWidth/2.26,
      }, data); 

    //Create Zipcode chart
    zipChart = new Zipcode({
      'parentElement': '#zipcode',
      'containerHeight': window.innerHeight/2.7,
      'containerWidth': window.innerWidth/2.13,
      }, getZip(data),(filterData) => {
        let filteredData = data.filter(item => item.ZIPCODE === filterData);
        console.log(filteredData)
        updateCharts(filteredData);
    }); 

    loading.classList.remove("loading"); // Remove loading message

  }) // Use setTimeout to delay the loading message (prevent null classlist error)
})
.catch(error => console.error(error));

//Log Data
console.log("Here is the data: ", globalData);

//Always work with "data" object now, unless resetting to original data set (globalData)
data = globalData;

//set function of map color dropdown
d3.select("#dropdown").on("change", updateMapColor);

//set function of map type dropdown
d3.select("#map-layer-dropdown").on("change", updateMapType);

//set call type legend functionality
d3.selectAll('.legend-btn').on('click', function() {
  // Toggle 'inactive' class
  d3.select(this).classed('inactive', !d3.select(this).classed('inactive'));
  var val = document.getElementById("dropdown").value;

  // Check which categories are active
  let selectedCategory = [];
  d3.selectAll('.legend-btn:not(.inactive)').each(function() {
    if(d3.select(this).attr('category') == "bld" && val == "option1"){
      selectedCategory.push("#4e79a7");
    }
    else if(d3.select(this).attr('category') == "pothole"  && val == "option1"){
      selectedCategory.push("#f28e2c");
    }
    else if(d3.select(this).attr('category') == "street"  && val == "option1"){
      selectedCategory.push("#e15759");
    }
    else if(d3.select(this).attr('category') == "trash"  && val == "option1"){
      selectedCategory.push("#76b7b2");
    }
    else if(d3.select(this).attr('category') == "recyc"  && val == "option1"){
      selectedCategory.push("#59a14f");
    }
    else if(d3.select(this).attr('category') == "special"  && val == "option1"){
      selectedCategory.push("#edc949");
    }
    else if(d3.select(this).attr('category') == "signage" && val == "option1"){
      selectedCategory.push("#af7aa1");
    }
    else if(d3.select(this).attr('category') == "metal"  && val == "option1"){
      selectedCategory.push("#ff9da7");
    }
    else if(d3.select(this).attr('category') == "animal"  && val == "option1"){
      selectedCategory.push("#9c755f");
    }
    else if(d3.select(this).attr('category') == "other"  && val == "option1"){
      selectedCategory.push("#bab0ab");
    }
    else if(d3.select(this).attr('category') == "water" && val == "option4"){
      selectedCategory.push("#4e79a7");
    }
    else if(d3.select(this).attr('category') == "build" && val == "option4"){
      selectedCategory.push("#f28e2c");
    }
    else if(d3.select(this).attr('category') == "health" && val == "option4"){
      selectedCategory.push("#e15759");
    }
    else if(d3.select(this).attr('category') == "manager" && val == "option4"){
      selectedCategory.push("#76b7b2");
    }
    else if(d3.select(this).attr('category') == "trans" && val == "option4"){
      selectedCategory.push("#59a14f");
    }
    else if(d3.select(this).attr('category') == "fire" && val == "option4"){
      selectedCategory.push("#edc949");
    }
    else if(d3.select(this).attr('category') == "park" && val == "option4"){
      selectedCategory.push("#af7aa1");
    }
    else if( d3.select(this).attr('category') == "public" && val == "option4"){
      selectedCategory.push("#ff9da7");
    }
    else if(d3.select(this).attr('category') == "law" && val == "option4"){
      selectedCategory.push("#9c755f");
    }
    else if(d3.select(this).attr('category') == "other2" && val == "option4"){
      selectedCategory.push("#bab0ab");
    }
  });
  
  var returnData = data;
  returnData = returnData.filter(d => selectedCategory.includes(d.mapColor));
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

function updateCharts(filteredData){
  var loading = document.getElementById("loading");
  loading.classList.add("loading");
  setTimeout(function() {
    lineChart.data = getLineData(filteredData);
    zipChart.data = getZip(filteredData);
    histogram.data = filteredData;
    agencyChart.data = getAgency(filteredData);
    daysOfTheWeek.data = getDayOfWeekData(filteredData);
    map.data = getMapData(filteredData);
    lineChart.updateVis();
    zipChart.updateVis();
    histogram.updateVis();
    agencyChart.updateVis();
    daysOfTheWeek.updateVis();
    map.updateVis();
    loading.classList.remove("loading");
  }, 100);
}

//function to reset charts to originl data
function resetCharts(){
    let returnData = []

    var loading = document.getElementById("loading");
    loading.classList.add("loading");
    setTimeout(function() {
    //reset dropdown
    const dropdown = document.getElementById("dropdown");
    dropdown.value = "option1";

    const dropdown2 = document.getElementById("map-layer-dropdown");
    dropdown2.value = "option1";

    //set legend
    document.getElementById("option1-legend").style.display = "inline-block";
    document.getElementById("option2-legend").style.display = "none";
    document.getElementById("option3-legend").style.display = "none";
    document.getElementById("option4-legend").style.display = "none";

    // remove inactive from all legend buttons
    d3.selectAll('.legend-btn').classed('inactive', false); 

    //reset backfround
    background_1_Url = 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}';
    background_1_Attr = 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    map.background_Url = background_1_Url
    map.background_Attr = background_1_Attr

    //reset map -- update vis is always called when the color is updated
    updateMapColor();

    //TO-DO
    lineChart.data = getLineData(data);
    zipChart.data = getZip(data);
    histogram.data = data;
    agencyChart.data = getAgency(data);
    daysOfTheWeek.data = getDayOfWeekData(data);
    map.data = getMapData(data);
    lineChart.updateVis();
    zipChart.updateVis();
    histogram.updateVis();
    agencyChart.updateVis();
    daysOfTheWeek.updateVis();
    map.updateVis();
    loading.classList.remove("loading");
    return returnData
    }, 100);
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
      document.getElementById("option3-legend").style.display = "none";
      document.getElementById("option4-legend").style.display = "none";
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
      document.getElementById("option3-legend").style.display = "none";
      document.getElementById("option4-legend").style.display = "none";


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
      //time of year
      document.getElementById("option1-legend").style.display = "none";
      document.getElementById("option2-legend").style.display = "none";
      document.getElementById("option3-legend").style.display = "inline-block";
      document.getElementById("option4-legend").style.display = "none";


      //order it randomly so not all the new dates are plotted first then covered by older dates
      thisData.sort(function(x, y){
         return d3.ascending(x.SERVICE_CODE, y.SERVICE_CODE);
      })

      var max = 365;
      var min = 0;
      // Define the D3 color scale using the Red-Yellow-Green color scale

      const colorScale = d3.scaleSequential()
        .interpolator(d3.interpolateRainbow)
        .domain([min, max]);



      for(var obj in thisData){
        var dayOfYear = thisData[obj].dayOfYear
        if(dayOfYear > max){
          dayOfYear = max;
        }
        if(dayOfYear < min){
          dayOfYear = min;
        }
        thisData[obj].mapColor = colorScale(dayOfYear)
        returnData.push(thisData[obj])
      }
    }
    else if(dropdownValue == "option4"){
      document.getElementById("option1-legend").style.display = "none";
      document.getElementById("option2-legend").style.display = "none";
      document.getElementById("option3-legend").style.display = "none";
      document.getElementById("option4-legend").style.display = "inline-block";
      //agency
      for(var obj in thisData){
        if(data[obj].latitude != null){
          colors = ["#4e79a7","#f28e2c","#e15759","#76b7b2","#59a14f","#edc949","#af7aa1","#ff9da7","#9c755f","#bab0ab"]

          
          if(thisData[obj].AGENCY_RESPONSIBLE.includes("Water Works") ){
            //Cin Water Works
            thisData[obj].mapColor = colors[0]
          }
          else if(thisData[obj].AGENCY_RESPONSIBLE.includes("Building Dept")){
            //Cinc Building Dept
            thisData[obj].mapColor = colors[1]
          }
          else if(thisData[obj].AGENCY_RESPONSIBLE.includes("Health Dept") ){
            //Cinc Health Dept
            thisData[obj].mapColor = colors[2]
          }
          else if(thisData[obj].AGENCY_RESPONSIBLE.includes("Manager's") ){
            //City Manager's Office
            thisData[obj].mapColor = colors[3]
          }
          else if(thisData[obj].AGENCY_RESPONSIBLE.includes("Trans and Eng")){
            //Dept of Trans and Eng
            thisData[obj].mapColor = colors[4]
          }
          else if(thisData[obj].AGENCY_RESPONSIBLE.includes("Fire") || thisData[obj].AGENCY_RESPONSIBLE.includes("Police")){
            //Fire and Police Department
            thisData[obj].mapColor = colors[5]
          }
          else if(thisData[obj].AGENCY_RESPONSIBLE.includes("Park Department")){
            //Park Department
            thisData[obj].mapColor = colors[6]
          }
          else if(thisData[obj].AGENCY_RESPONSIBLE.includes("Public Services")){
            //Public Services
            thisData[obj].mapColor = colors[7]
          }
          else if(thisData[obj].AGENCY_RESPONSIBLE.includes("Law Department") ){
            //Law Department
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

    data = returnData;
    map.data = returnData;
    map.updateVis();
  }

  function updateMapType(){
    //areial background
    background_1_Url = 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}';
    background_1_Attr = 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    //satelite background
    background_2_Url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    background_2_Attr = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';

    if(background_Url == background_1_Url){
      background_Url = background_2_Url
      background_Attr =  background_2_Attr
    }
    else{
      background_Url = background_1_Url
      background_Attr =  background_1_Attr
    }
    map.background_Url = background_Url
    map.background_Attr = background_Attr
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

function dayOfTheYear(dateString){
  const date = new Date(dateString);
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date - startOfYear;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return dayOfYear;
}

function getLineData(thisData){
    //console.log(data)
    //lets compute costs per year for the line chart
    
    let requestsPerDay = [];
    for(var i = 0; i < 731; i++){
      requestsPerDay.push( {"day": i, "num":0});
    }

    for(var obj in thisData){
      var thisDate = new Date(thisData[obj].REQUESTED_DATETIME)
      var startDate = new Date(2022, 0, 0);
      var startDate2 = new Date(2021, 0, 0);
      if(thisDate - startDate > 0){
        requestsPerDay[365 + thisData[obj].dayOfYear].num++;
      }
      else if(thisDate - startDate2 > 0){
        requestsPerDay[thisData[obj].dayOfYear].num++;
      }
    }
    return requestsPerDay
  }

  function updateFromLine(date1,date2){
      //console.log("line")
        let min = Math.trunc(Math.round(parseFloat(date1)* 10)/10)
        let max = Math.trunc(Math.round(parseFloat(date2) * 10)/10)
        lineData = data;
        lineData = lineData.filter(d => d.REQUESTED_DATETIME >= min)
        lineData = lineData.filter(d => d.REQUESTED_DATETIME <= max)
        //ToDO
  }

//Function to get day of week data
function getDayOfWeekData(thisData){
    var returnData = []
    returnData.push({"day":"Monday","count":0})
    returnData.push({"day":"Tuesday","count":0})
    returnData.push({"day":"Wednesday","count":0})
    returnData.push({"day":"Thursday","count":0})
    returnData.push({"day":"Friday","count":0})
    returnData.push({"day":"Saturday","count":0})
    returnData.push({"day":"Sunday","count":0})

    for(let i = 0; i <= 6; i++){

      let justThisDay = thisData.filter( d => getDay(d.REQUESTED_DATETIME) == i );
      returnData[i].count = justThisDay.length
    }
    return returnData
  }

  function getDay(dateStr){
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();
    // Convert Sunday (0) to 6 and shift all other days by 1
    const shiftedDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    return shiftedDayOfWeek
  }

  //Function to get agency data
  function getAgency(thisData){
    var returnData = []
    returnData.push({"agency":"Water Works","count":0})
    returnData.push({"agency":"Building Deptartment","count":0})
    returnData.push({"agency":"Health Deptartment","count":0})
    returnData.push({"agency":"Manager's Office","count":0})
    returnData.push({"agency":"Deptartment of Transportation","count":0})
    returnData.push({"agency":"Fire and Police Deptartment","count":0})
    returnData.push({"agency":"Park Deptartment","count":0})
    returnData.push({"agency":"Public Services","count":0})
    returnData.push({"agency":"Law Deptartment","count":0})
    returnData.push({"agency":"Other","count":0})

    for(var obj in thisData){
          colors = ["#4e79a7","#f28e2c","#e15759","#76b7b2","#59a14f","#edc949","#af7aa1","#ff9da7","#9c755f","#bab0ab"]

          
          if(thisData[obj].AGENCY_RESPONSIBLE.includes("Water Works") ){
            //Cin Water Works
            returnData[0].count++
          }
          else if(thisData[obj].AGENCY_RESPONSIBLE.includes("Building Dept")){
            //Cinc Building Dept
            returnData[1].count++
          }
          else if(thisData[obj].AGENCY_RESPONSIBLE.includes("Health Dept") ){
            //Cinc Health Dept
            returnData[2].count++
          }
          else if(thisData[obj].AGENCY_RESPONSIBLE.includes("Manager's") ){
            //City Manager's Office
            returnData[3].count++
          }
          else if(thisData[obj].AGENCY_RESPONSIBLE.includes("Trans and Eng")){
            //Dept of Trans and Eng
            returnData[4].count++
          }
          else if(thisData[obj].AGENCY_RESPONSIBLE.includes("Fire") || thisData[obj].AGENCY_RESPONSIBLE.includes("Police")){
            //Fire and Police Department
            returnData[5].count++
          }
          else if(thisData[obj].AGENCY_RESPONSIBLE.includes("Park Department")){
            //Park Department
            returnData[6].count++
          }
          else if(thisData[obj].AGENCY_RESPONSIBLE.includes("Public Services")){
            //Public Services
            returnData[7].count++
          }
          else if(thisData[obj].AGENCY_RESPONSIBLE.includes("Law Department") ){
            //Law Department
            returnData[8].count++
          }
          else{
            //Other
            returnData[9].count++
          }        
      }
    return returnData.reverse()
  }

  //Zipcode Data
  function getZip(thisData){
    var returnData = []
    returnData.push({"zip":"45202","count":0})
    returnData.push({"zip":"45203","count":0})
    returnData.push({"zip":"45204","count":0})
    returnData.push({"zip":"45205","count":0})
    returnData.push({"zip":"45206","count":0})
    returnData.push({"zip":"45207","count":0})
    returnData.push({"zip":"45208","count":0})
    returnData.push({"zip":"45209","count":0})
    returnData.push({"zip":"45211","count":0})
    returnData.push({"zip":"45212","count":0})
    returnData.push({"zip":"45213","count":0})
    returnData.push({"zip":"45214","count":0})
    returnData.push({"zip":"45215","count":0})
    returnData.push({"zip":"45216","count":0})
    returnData.push({"zip":"45217","count":0})
    returnData.push({"zip":"45219","count":0})
    returnData.push({"zip":"45220","count":0})
    returnData.push({"zip":"45223","count":0})
    returnData.push({"zip":"45224","count":0})
    returnData.push({"zip":"45225","count":0})
    returnData.push({"zip":"45226","count":0})
    returnData.push({"zip":"45227","count":0})
    returnData.push({"zip":"45229","count":0})
    returnData.push({"zip":"45230","count":0})
    returnData.push({"zip":"45232","count":0})
    returnData.push({"zip":"45233","count":0})
    returnData.push({"zip":"45237","count":0})
    returnData.push({"zip":"45238","count":0})
    returnData.push({"zip":"45239","count":0})
    returnData.push({"zip":"45248","count":0})

    for(var obj in returnData){
      let justThisDay = thisData.filter( d => d.ZIPCODE == returnData[obj].zip );
      returnData[obj].count = justThisDay.length
    }
    return returnData
  }