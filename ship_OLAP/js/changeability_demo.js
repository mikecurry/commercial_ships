/*
 * 
 * Mike Curry
 * August 2015
 * 
 */

$.ajax({
	type: 'GET',
	//url: 'spacetug_vasc_384_cleaned_v3.csv',
	url: 'spacetug_changeability_v1.csv',
	success: function(data) {
		spacetug_data = csvJSON(data);
		//console.log(spacetug_data);
		run_after_ajax(spacetug_data);
		
	},
	error: function(data) {console.log('ajax error');},
	dataType: 'text'
});


//var csv is the CSV file with headers
function csvJSON(csv) {

	var lines = csv.split("\n");
	var result = [];
	var headers = lines[0].split(",");

	for (var i = 1; i < lines.length-1; i++) {
		var obj = {};
		var currentline = lines[i].split(",");

		for (var j = 0; j < headers.length; j++) {
			obj[headers[j]] = currentline[j];
		}

		result.push(obj);
	}

	return result; //JavaScript object
	//return JSON.stringify(result); //JSON
}


function run_after_ajax(spacetug_data) {
	
	//console.log('made it passed ajax!');
	meanND = dc.numberDisplay("#mean");
	
	// Define charts
	capabilityRowChart = dc.rowChart("#capability");
	propulsionRowChart = dc.rowChart("#propulsion");
	fuelmassRowChart   = dc.rowChart("#fuel_mass");
	dfcRowChart        = dc.rowChart("#dfc");
	familyRowChart     = dc.rowChart("#family");
	costBarChart       = dc.barChart("#cost");
	changecostBarChart = dc.barChart("#change_cost_present");
	changetimeBarChart = dc.barChart("#change_time_present");
	fodBarChart        = dc.barChart("#fod");
	
	// Create crossfilter instance and dimensions for scatter plots
	var ndx = crossfilter(spacetug_data);
	
	// Create dimensions for histograms
	var designidDim	   = ndx.dimension(function (d) {return +d.design_id;}),
		capabilityDim  = ndx.dimension(function (d) {return +d.capability;}),
		propulsionDim  = ndx.dimension(function (d) {return +d.propulsion;}),
		fuelmassDim    = ndx.dimension(function (d) {return +d.fuel_mass;}),
		dfcDim         = ndx.dimension(function (d) {return +d.dfc;}),
		familyDim      = ndx.dimension(function (d) {return +d.family;}),
		costDim        = ndx.dimension(function (d) {return +d.cost;}),
		changecostDim  = ndx.dimension(function (d) {return +d.change_cost_present;}),
		changetimeDim  = ndx.dimension(function (d) {return +d.change_time_present;});
		
	// Apply Filters	
	
	var n = ndx.groupAll().reduceCount().value();
	console.log('There are ' + n + ' total change paths.'); // 147,456
	
	var changecostFilterDim  = ndx.dimension(function (d) {return +d.change_cost_present;});
	changecostFilterDim.filterFunction(function(d) { return d > 0; });
	//changecostFilterDim.filterRange([10, 50]);
	//var changecostFilterGroup  = changecostFilterDim.group(function(d) { return Math.floor(+d / 100) * 100; });
	/*
	var countMeasure = designidDim.group().reduceCount();
	var a = countMeasure.top(384);

	var fod = new Array(384);
	for(ii=0; ii<384; ii++) {
		kk = parseInt(a[ii]['key'])-1;
		fod[kk] = parseInt(a[ii]['value']);
	//	//console.log(a[ii]['key'])
	//	fod(parseInt(a[ii]['key'])) = parseInt(a[ii]['value']);
	}
	
	//spacetug_data.forEach(function(d,i) {
	//	console.log('foo');
	//	//d.fod		= +dataBase[i][0];
	//});
	
	//changecostFilterDim.filterAll();
	*/
	
	// Create Groups
	var designidGroup    = designidDim.group(function(d) { return +d; });
	var costGroup        = costDim.group(function(d) { return Math.floor(+d / 100) * 100; });
	var changecostGroup  = changecostDim.group(function(d) { return Math.floor(+d / 100) * 100; });
	var changetimeGroup  = changetimeDim.group(function(d) { return +d; });
	
	
   	var all = ndx.groupAll();
	meanND
		.group(all)
		.valueAccessor(function(d) { return +d; } )
		.formatNumber(d3.format(",d"));
		
	// Create Charts
	var capabilityNames = ['Low (300 kg)', 'Med (1000 kg)', 'High (3000 kg)', 'Extreme (5000 kg)'];
	capabilityRowChart
	    .width($("#capability").width())
	    .height($("#capability").height())
	    .margins({top: 0, right: 10, bottom: 40, left: 10})
	    .dimension(capabilityDim)
	    .group(capabilityDim.group().reduceCount())
	    .elasticX(true)
	    .label(function(d) { return capabilityNames[d.key];})
	    .xAxis().tickFormat(function(v) { return ""; });
	
	var propulsionNames = ['BiProp', 'Cryo', 'Electric', 'Nuclear'];
	propulsionRowChart
	    .width($("#propulsion").width())
	    .height($("#propulsion").height())
	    .margins({top: 0, right: 10, bottom: 40, left: 10})
	    .dimension(propulsionDim)
	    .group(propulsionDim.group().reduceCount())
	    .elasticX(true)
	    .label(function(d) { return propulsionNames[d.key];})
	    .xAxis().tickFormat(function(v) { return ""; });
	
	fuelmassRowChart
	    .width($("#fuel_mass").width())
	    .height($("#fuel_mass").height())
	    .margins({top: 0, right: 10, bottom: 40, left: 10})
	    .dimension(fuelmassDim)
	    .group(fuelmassDim.group().reduceCount())
	    .elasticX(true)
	    .xAxis().tickFormat(function(v) { return ""; });

	dfcRowChart
	    .width($("#dfc").width())
	    .height($("#dfc").height())
	    .margins({top: 0, right: 10, bottom: 40, left: 10})
	    .dimension(dfcDim)
	    .group(dfcDim.group().reduceCount())
	    .elasticX(true)
	    .xAxis().tickFormat(function(v) { return ""; });
	
	familyRowChart
	    .width($("#family").width())
	    .height($("#family").height())
	    .margins({top: 0, right: 10, bottom: 40, left: 10})
	    .dimension(familyDim)
	    .group(familyDim.group().reduceCount())
	    .elasticX(true)
	    .xAxis().tickFormat(function(v) { return ""; });
	    
	costBarChart
		.width($("#cost").width())
		.height($("#cost").height())
        .margins({top: 0, right: 10, bottom: 20, left: 50})
        .dimension(costDim)
	    .x(d3.scale.linear().domain([0, 4000]))    
        //.xUnits(d3.scale.linear().domain([0, 1]))
        .xUnits(function(){return 50;})
        .group(costGroup)
        .renderHorizontalGridLines(true)
        .centerBar(false)
        .elasticX(true)
        .elasticY(true)
        .brushOn(true)
        .yAxis().tickFormat(function(v) { return ""; });
    
	changecostBarChart
		.width($("#change_cost_present").width())
		.height($("#change_cost_present").height())
        .margins({top: 0, right: 10, bottom: 20, left: 50})
        .dimension(changecostDim)
	    .x(d3.scale.linear().domain([0, 3750]))   
	    .y(d3.scale.linear().domain([0, 1000])) 
        //.xUnits(d3.scale.linear().domain([0, 1]))
        .xUnits(function(){return 50;})
        .group(changecostGroup)
        .renderHorizontalGridLines(true)
        .centerBar(false)
        .elasticX(false)
        .elasticY(false)
        .brushOn(true)
        .yAxis().tickFormat(function(v) { return ""; });
        
    changetimeBarChart
		.width($("#change_time_present").width())
		.height($("#change_time_present").height())
        .margins({top: 0, right: 10, bottom: 20, left: 50})
        .dimension(changetimeDim)
	    .x(d3.scale.linear().domain([0, 14]))   
	    .y(d3.scale.linear().domain([0, 3000])) 
        //.xUnits(d3.scale.linear().domain([0, 1]))
        .xUnits(function(){return 50;})
        .group(changetimeGroup)
        .renderHorizontalGridLines(true)
        .centerBar(false)
        .elasticX(false)
        .elasticY(false)
        .brushOn(true)
        .yAxis().tickFormat(function(v) { return ""; });
        
	// Define Table
	var countMeasure = designidDim.group().reduceCount();
	var a = countMeasure.top(384);

	var pseudoDimension = {
		top: function (x) {
			a = designidGroup.top(x).map(function (grp) { return {"design_id":grp.key, "fod":grp.value}; });
			//console.log(a);
			result = $.grep(a, function(e){ return e.fod > 0; });
			//console.log(result.length)
			d3.selectAll("#mean2")
      			.text(result.length);
			return result;
	    }
	};
	
	fodBarChart
		.width($("#fod").width())
		.height($("#fod").height())
        .margins({top: 0, right: 10, bottom: 20, left: 50})
        .dimension(pseudoDimension)
	    .x(d3.scale.linear().domain([0, 14]))   
	    .y(d3.scale.linear().domain([0, 3000])) 
        //.xUnits(d3.scale.linear().domain([0, 1]))
        .xUnits(function(){return 50;})
        .group(designidGroup)
        .renderHorizontalGridLines(true)
        .centerBar(false)
        .elasticX(true)
        .elasticY(true)
        .brushOn(true)
        .yAxis().tickFormat();
        //.yAxis().tickFormat(function(v) { return ""; });
	
	// Data Table
	var datatable   = dc.dataTable("#design-table");
	datatable
	    //.dimension(designidDim)
	    .dimension(pseudoDimension)
	    //.group(function(d) {return Math.floor(+d.cost / 500) * 500 + 500;})
	    .group(function(d) { return ""})
	    //.group(function(d) {return +d.design_id;})
	    // dynamic columns creation using an array of closures
	    .size(384)
	    .columns([
	        function(d) {return d.design_id;},
	        function(d) {return capabilityNames[parseInt(spacetug_data[d.design_id]['capability'])];},
	        function(d) {return propulsionNames[parseInt(spacetug_data[d.design_id]['propulsion'])];},
	        function(d) {return spacetug_data[d.design_id]['fuel_mass'];},
	        function(d) {return spacetug_data[d.design_id]['dfc'];},
	        function(d) {return spacetug_data[d.design_id]['family'];},
	        function(d) {return spacetug_data[d.design_id]['cost'];},
	        function(d) {return d.fod;}
	    ])
	    .sortBy(function(d){ return -d.fod; });
	
	dc.renderAll();
	
	// Various formatters.
  	var formatNumber = d3.format(",d"),
      	formatChange = d3.format("+,d"),
      	formatDate = d3.time.format("%B %d, %Y"),
      	formatTime = d3.time.format("%I:%M %p");
	
	// Render the total.
  	d3.selectAll("#total")
      .text(formatNumber(ndx.size()));
    d3.select("#active").text(formatNumber(all.value()));

};

/*******************/

function run_after_ajax_old(spacetrak_data) {
	
	console.log('made it passed ajax!')
	
	/*
	var yearRingChart   = dc.pieChart("#chart-ring-year"),
		spendHistChart  = dc.barChart("#chart-hist-spend"),
    	spenderRowChart = dc.rowChart("#chart-row-spenders");
    */
   	
    var yearBarChart 		 = dc.barChart("#bar-chart1"),
    	lifeBarChart 		 = dc.barChart("#bar-chart2"),
    	missionGroupRowChart = dc.rowChart("#row-chart1"),
    	eventGroupRowChart 	 = dc.rowChart("#row-chart2");
    	//satsRowChart = dc.rowChart("#row-chart2");
	
	// use static or load via d3.csv("spendData.csv", function(error, spendData) {/* do stuff */});
	var spendData = [
	    {Name: 'Mr A', Spent: '$40', Year: 2011},
	    {Name: 'Mr B', Spent: '$10', Year: 2011},
	    {Name: 'Mr C', Spent: '$40', Year: 2011},
	    {Name: 'Mr A', Spent: '$70', Year: 2012},
	    {Name: 'Mr B', Spent: '$20', Year: 2012},
	    {Name: 'Mr B', Spent: '$50', Year: 2013},
	    {Name: 'Mr C', Spent: '$30', Year: 2013}
	];
	
	// normalize/parse data
	spendData.forEach(function(d) {
	    d.Spent = d.Spent.match(/\d+/);
	});
	
	console.log(Object.keys(spacetrak_data[0]))
	
	// set crossfilter
	var ndx = crossfilter(spendData),
	    yearDim  = ndx.dimension(function(d) {return +d.Year;}),
	    spendDim = ndx.dimension(function(d) {return Math.floor(d.Spent/10);}),
	    nameDim  = ndx.dimension(function(d) {return d.Name;}),
	    spendPerYear = yearDim.group().reduceSum(function(d) {return +d.Spent;}),
	    spendPerName = nameDim.group().reduceSum(function(d) {return +d.Spent;}),
	    spendHist    = spendDim.group().reduceCount();

	
	var STndx = crossfilter(spacetrak_data),
		STyearDim  = STndx.dimension(function(d) {return parseFloat(d.YEAR);}),
		STlifeDim  = STndx.dimension(function(d) {return d.LIFE;}),
		STsatsDim  = STndx.dimension(function(d) {return d.SATELLITE;}),
		STsatsPerYear    = STsatsDim.group().reduceCount(),
		STmissionGroupDim  = STndx.dimension(function(d) {return d.MISSIONGROUP;}),
		STmissionGroupPerName = STmissionGroupDim.group().reduceCount(),
		STeventGroupDim  = STndx.dimension(function(d) {return d.EVENT;}),
		STeventGroupPerName = STeventGroupDim.group().reduceCount();
		//STmissionTypePerName = STmissionTypeDim.group().reduceCount(function(d) {return +d.MISSIONTYPE;});
	
	var STsatDim  = STndx.dimension(function(d) {return d.SATELLITE;}),
		STeventsPerSat = STsatDim.group().reduceSum(function(d) {return +d.EVENT;});
		
	
	console.log(STyearDim.bottom(1)[0].YEAR)
	console.log(STyearDim.top(1)[0].YEAR)

	/*		
	yearRingChart
	    .width(200).height(200)
	    .dimension(yearDim)
	    .group(spendPerYear)
	    .innerRadius(50);
	
	spendHistChart
	    .width(300).height(200)
	    .dimension(spendDim)
	    .group(spendHist)
	    .x(d3.scale.linear().domain([0,10]))
	    .elasticY(true);
	spendHistChart.xAxis().tickFormat(function(d) {return d*10}); // convert back to base unit
	spendHistChart.yAxis().ticks(2);
	
	spenderRowChart
	    .width(350).height(200)
	    .dimension(nameDim)
	    .group(spendPerName)
	    .elasticX(true);
	*/
	    
	yearBarChart
	    .width(600)
	    .height(200)
	    .dimension(STyearDim)
	    .group(STyearDim.group().reduceCount())
	    .x(d3.scale.linear().domain([1950,2020]))
	    .elasticY(true);
	    
	lifeBarChart
	    .width(600)
	    .height(200)
	    .dimension(STlifeDim)
	    .group(STlifeDim.group().reduceCount())
	    .x(d3.scale.linear().domain([-5,30]))
	    .elasticY(true);
	
	missionGroupRowChart
	    .width(350)
	    .height(400)
	    .dimension(STmissionGroupDim)
	    .group(STmissionGroupPerName)
	    .elasticX(true);
	    
	eventGroupRowChart
	    .width(800)
	    .height(5000)
	    .dimension(STeventGroupDim)
	    .group(STeventGroupPerName)
	    .elasticX(true);
	
	/*
	satsRowChart
	    .width(350)
	    .height(400)
	    .dimension(STsatDim)
	    .group(STeventsPerSat)
	    .elasticX(true);
	*/
	dc.renderAll();
	
}

/*
$(document).ready(function() {
	
}); // End doc ready
*/