/*
 * 
 * Mike Curry
 * August 2015
 * 
 */


$.ajax({
	type: 'GET',
	url: 'ship_data_v1.csv',
	success: function(data) {
		ship_data = csvJSON(data);
		run_after_ajax(ship_data);
		d3.select("#load_status").text('Status: File Loaded');
		
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

function isLessThan(value) {
  return function(element, index, array) {
    return (element <= value);
  }
}

/*
 * regroup function based on solution found here:
 * http://stackoverflow.com/questions/24737277/dc-js-how-to-create-a-row-chart-from-multiple-columns
 */
function regroup(dim, cols) {
    var _groupAll = dim.groupAll().reduce(
        function(p, v) { // add
            cols.forEach(function(c) {
                p[c] += v[c];
            });
            return p;
        },
        function(p, v) { // remove
            cols.forEach(function(c) {
                p[c] -= v[c];
            });
            return p;
        },
        function() { // init
            var p = {};
            cols.forEach(function(c) {
                p[c] = 0;
            });
            return p;
        });
    return {
        all: function() {
            // or _.pairs, anything to turn the object into an array
            return d3.map(_groupAll.value()).entries();
        }
    };
}

function run_after_ajax(ship_data) {
	d3.select("#load_status").text('Status: Processing Data');
	var numEpochs = 50;
	var fpnThreshold = 5.0;
	// Add "inEpoch" key for each epoch to indicate whether
	// the design is within threshold
	for (var ii = 0; ii < ship_data.length; ii++) {
		for (var jj = 1; jj < numEpochs+1; jj++) {
			if (ship_data[ii]["fpn"+jj] <= fpnThreshold) {
				ship_data[ii]["inEpoch"+jj] = 1;
			} else {
				ship_data[ii]["inEpoch"+jj] = 0;
			}
		}
	}
	
	meanND = dc.numberDisplay("#mean");
	
	// Define charts
	deckAreaBarChart = dc.barChart("#deck_area");
	costBarChart     = dc.barChart("#cost");
	fpn1BarChart     = dc.barChart("#fpn1");
	nfptBarChart     = dc.barChart("#nfpt");
	epochS1RowChart  = dc.rowChart("#s1_epochs");
	epochS2RowChart  = dc.rowChart("#s2_epochs");
	
	L_RowChart 		 = dc.rowChart("#l_chart");
	B_RowChart       = dc.rowChart("#b_chart");
	D_RowChart       = dc.rowChart("#d_chart");
	Crane_RowChart   = dc.rowChart("#crane_chart");
	POB_RowChart     = dc.rowChart("#pob_chart");
	Power_RowChart   = dc.rowChart("#power_chart");
	LWI_RowChart     = dc.rowChart("#lwi_chart");
	MP_RowChart      = dc.rowChart("#mp_chart");
	Fuel_RowChart    = dc.rowChart("#fuel_chart");
	ROV_RowChart     = dc.rowChart("#rov_chart");
	DP_RowChart      = dc.rowChart("#dp_chart");
	
	// Create crossfilter instance and dimensions for scatter plots
	var ndx = crossfilter(ship_data);
	
	// Create dimensions for histograms
	var designidDim	= ndx.dimension(function (d) {return +d.design_id;}),
		lDim       	= ndx.dimension(function (d) {return +d.L;}),
		bDim        = ndx.dimension(function (d) {return +d.B;}),
		dDim        = ndx.dimension(function (d) {return +d.D;}),
		craneDim    = ndx.dimension(function (d) {return +d.Crane;}),
		pobDim      = ndx.dimension(function (d) {return +d.POB;}),
		powerDim    = ndx.dimension(function (d) {return +d.Power;}),	
		lwiDim     = ndx.dimension(function (d) {return +d.LWI;}),
		mpDim      = ndx.dimension(function (d) {return +d.MP;}),
		fuelDim    = ndx.dimension(function (d) {return +d.Fuel;}),
		rovDim     = ndx.dimension(function (d) {return +d.ROV;}),
		dpDim      = ndx.dimension(function (d) {return +d.DP;}),
		deckAreaDim = ndx.dimension(function (d) {return +d.Deck_Area;}),
		costDim     = ndx.dimension(function (d) {return +d.Acq_Cost;}),
		fpn1Dim     = ndx.dimension(function (d) {return +d.fpn1;}),
		inEpoch1Dim = ndx.dimension(function (d) {return +d.inEpoch1;}),
		inEpoch2Dim = ndx.dimension(function (d) {return +d.inEpoch2;}),
		nfptDim     = ndx.dimension(function (d) {
			return [ +d.fpn1,+d.fpn2, +d.fpn3, +d.fpn4, +d.fpn5, +d.fpn6, +d.fpn7, +d.fpn8, +d.fpn9, +d.fpn10,
					+d.fpn11,+d.fpn12,+d.fpn13,+d.fpn14,+d.fpn15,+d.fpn16,+d.fpn17,+d.fpn18,+d.fpn19,+d.fpn20,
					+d.fpn21,+d.fpn22,+d.fpn23,+d.fpn24,+d.fpn25,+d.fpn26,+d.fpn27,+d.fpn28,+d.fpn29,+d.fpn30,
		 			+d.fpn31,+d.fpn32,+d.fpn33,+d.fpn34,+d.fpn35,+d.fpn36,+d.fpn37,+d.fpn38,+d.fpn39,+d.fpn40,
					+d.fpn41,+d.fpn42,+d.fpn43,+d.fpn44,+d.fpn45,+d.fpn46,+d.fpn47,+d.fpn48,+d.fpn49,+d.fpn50
					].filter(isLessThan(fpnThreshold)).length/50;
		});
		
	// Apply Filters
	var n = ndx.groupAll().reduceCount().value();
	console.log('There are ' + n + ' total designs.');
	
	// Create Groups
	var designidGroup = designidDim.group(function(d) { return +d; });
	var lGroup        = lDim.group(function(d) { return +d; });
	var bGroup        = bDim.group(function(d) { return +d; });
	var dGroup        = dDim.group(function(d) { return +d; });
	var craneGroup    = craneDim.group(function(d) { return +d; });
	var pobGroup      = pobDim.group(function(d) { return +d; });
	var powerGroup    = powerDim.group(function(d) { return +d; });
	var lwiGroup      = lwiDim.group(function(d) { return +d; });
	var mpGroup       = mpDim.group(function(d) { return +d; });
	var fuelGroup     = fuelDim.group(function(d) { return +d; });
	var rovGroup      = rovDim.group(function(d) { return +d; });
	var dpGroup       = dpDim.group(function(d) { return +d; });
	var deckAreaGroup = deckAreaDim.group(function(d) { return Math.floor(+d / 1) * 1; });
	var costGroup     = costDim.group(function(d) { return Math.floor(+d / 0.5) * 0.5; });
	var fpn1Group     = fpn1Dim.group(function(d) { return Math.floor(+d / 1) * 1; });
	var nfptGroup     = nfptDim.group(function(d) { return +d; });
	var sidewaysGroup1 = regroup(inEpoch1Dim, ['inEpoch1','inEpoch2','inEpoch3','inEpoch4','inEpoch5','inEpoch6','inEpoch7','inEpoch8','inEpoch9','inEpoch10',
											   'inEpoch11','inEpoch12','inEpoch13','inEpoch14','inEpoch15','inEpoch16','inEpoch17','inEpoch18','inEpoch19','inEpoch20',
											   'inEpoch21','inEpoch22','inEpoch23','inEpoch24','inEpoch25']);
	var sidewaysGroup2 = regroup(inEpoch2Dim, ['inEpoch26','inEpoch27','inEpoch28','inEpoch29','inEpoch30','inEpoch31','inEpoch32','inEpoch33','inEpoch34','inEpoch35', 
											   'inEpoch36','inEpoch37','inEpoch38','inEpoch39','inEpoch40','inEpoch41','inEpoch42','inEpoch43','inEpoch44','inEpoch45',
											   'inEpoch46','inEpoch47','inEpoch48','inEpoch49','inEpoch50']);
	
	var all = ndx.groupAll();
	meanND
		.group(all)
		.valueAccessor(function(d) { return +d; } )
		.formatNumber(d3.format(",d"));
	
	L_RowChart
		.width($("#l_chart").width())
		.height($("#l_chart").height())
        .margins({top: 0, right: 20, bottom: 30, left: 20})
        .dimension(lDim)
        .group(lGroup)
        .elasticX(true)
        .labelOffsetY(9)
        .xAxis().tickFormat(function(v) { return ""; });
        
	B_RowChart
		.width($("#d_chart").width())
		.height($("#d_chart").height())
        .margins({top: 0, right: 20, bottom: 30, left: 20})
        .dimension(dDim)
        .group(dGroup)
        .elasticX(true)
        .labelOffsetY(11)
        .xAxis().tickFormat(function(v) { return ""; });
        
    D_RowChart
		.width($("#b_chart").width())
		.height($("#b_chart").height())
        .margins({top: 0, right: 20, bottom: 30, left: 20})
        .dimension(bDim)
        .group(bGroup)
        .elasticX(true)
        .labelOffsetY(8)
        .xAxis().tickFormat(function(v) { return ""; });
        
	Crane_RowChart
		.width($("#crane_chart").width())
		.height($("#crane_chart").height())
        .margins({top: 0, right: 20, bottom: 30, left: 20})
        .dimension(craneDim)
        .group(craneGroup)
        .elasticX(true)
        .labelOffsetY(7)
        .xAxis().tickFormat(function(v) { return ""; });
        
    POB_RowChart
		.width($("#pob_chart").width())
		.height($("#pob_chart").height())
        .margins({top: 0, right: 20, bottom: 30, left: 20})
        .dimension(pobDim)
        .group(pobGroup)
        .elasticX(true)
        .labelOffsetY(8)
        .xAxis().tickFormat(function(v) { return ""; });
        
	Power_RowChart
		.width($("#power_chart").width())
		.height($("#power_chart").height())
        .margins({top: 0, right: 20, bottom: 30, left: 20})
        .dimension(powerDim)
        .group(powerGroup)
        .elasticX(true)
        .labelOffsetY(11)
        .xAxis().tickFormat(function(v) { return ""; });
        
    LWI_RowChart
		.width($("#lwi_chart").width())
		.height($("#lwi_chart").height())
        .margins({top: 0, right: 20, bottom: 30, left: 20})
        .dimension(lwiDim)
        .group(lwiGroup)
        .elasticX(true)
        .labelOffsetY(9)
        .xAxis().tickFormat(function(v) { return ""; });
        
	MP_RowChart
		.width($("#mp_chart").width())
		.height($("#mp_chart").height())
        .margins({top: 0, right: 20, bottom: 30, left: 20})
        .dimension(mpDim)
        .group(mpGroup)
        .elasticX(true)
        .xAxis().tickFormat(function(v) { return ""; });
        
    Fuel_RowChart
		.width($("#fuel_chart").width())
		.height($("#fuel_chart").height())
        .margins({top: 0, right: 20, bottom: 30, left: 20})
        .dimension(fuelDim)
        .group(fuelGroup)
        .elasticX(true)
        .xAxis().tickFormat(function(v) { return ""; });
        
	ROV_RowChart
		.width($("#rov_chart").width())
		.height($("#rov_chart").height())
        .margins({top: 0, right: 20, bottom: 30, left: 20})
        .dimension(rovDim)
        .group(rovGroup)
        .elasticX(true)
        .xAxis().tickFormat(function(v) { return ""; });

	DP_RowChart
		.width($("#dp_chart").width())
		.height($("#dp_chart").height())
        .margins({top: 0, right: 20, bottom: 30, left: 20})
        .dimension(dpDim)
        .group(dpGroup)
        .elasticX(true)
        .xAxis().tickFormat(function(v) { return ""; });
	
	deckAreaBarChart
		.width($("#deck_area").width())
		.height($("#deck_area").height())
        .margins({top: 0, right: 10, bottom: 20, left: 50})
        .dimension(deckAreaDim)
	    .x(d3.scale.linear().domain([0, 7]))    
        //.xUnits(d3.scale.linear().domain([0, 1]))
        .xUnits(function(){return 50;})
        .group(deckAreaGroup)
        .renderHorizontalGridLines(true)
        .centerBar(false)
        .elasticX(true)
        .elasticY(true)
        .brushOn(true)
        .yAxis().tickFormat(function(v) { return ""; });
	 
	costBarChart
		.width($("#cost").width())
		.height($("#cost").height())
        .margins({top: 0, right: 10, bottom: 20, left: 50})
        .dimension(costDim)
	    .x(d3.scale.linear().domain([0, 40]))    
        .xUnits(function(){return 50;})
        .group(costGroup)
        .renderHorizontalGridLines(true)
        .centerBar(false)
        .elasticX(true)
        .elasticY(true)
        .brushOn(true)
        .yAxis().tickFormat(function(v) { return ""; });

	fpn1BarChart
		.width($("#fpn1").width())
		.height($("#fpn1").height())
        .margins({top: 0, right: 10, bottom: 20, left: 50})
        .dimension(fpn1Dim)
	    .x(d3.scale.linear().domain([0, 100]))    
        .xUnits(function(){return 48;})
        .group(fpn1Group)
        .renderHorizontalGridLines(true)
        .centerBar(false)
        //.elasticX(true)
        .elasticY(true)
        .brushOn(true)
        .yAxis().tickFormat(function(v) { return ""; });

	 nfptBarChart
		.width($("#nfpt").width())
		.height($("#nfpt").height())
        .margins({top: 0, right: 10, bottom: 20, left: 50})
        .dimension(nfptDim)
	    .x(d3.scale.linear().domain([0.05, 1.01]))
	    //.xAxisPadding(0.05)    
        .xUnits(function(){return 25;})
        .group(nfptGroup)
        .renderHorizontalGridLines(true)
        .centerBar(true)
        //.elasticX(true)
        .elasticY(true)
        .y(d3.scale.linear().domain([0, 1000]))
        .brushOn(true)
        //.xAxis().tickValues([0.0, 0.2, 0.4, 0.6, 0.8, 1.0])
        .yAxis().tickFormat(function(v) { return ""; });
		//.yAxisLabel("Number of Designs");

	epochS1RowChart
		.width($("#s1_epochs").width())
		.height($("#s1_epochs").height())
        .margins({top: 10, right: 20, bottom: 20, left: 20})
        .dimension(inEpoch1Dim)
	    .x(d3.scale.linear().domain([0, 1.0]))
	    //.xAxisPadding(0.5)    
        .group(sidewaysGroup1)
        //.renderHorizontalGridLines(true)
        //.centerBar(true)
        .elasticX(true)
        //.elasticY(true)
        //.brushOn(true);
        .renderLabel(false)
        .ordering(function(d) { return d.key })
        .xAxis().tickFormat(function(v) { return ""; });
	
	epochS2RowChart
		.width($("#s2_epochs").width())
		.height($("#s2_epochs").height())
        .margins({top: 10, right: 20, bottom: 20, left: 20})
        .dimension(inEpoch2Dim)
	    //.x(d3.scale.linear().domain([0, 3.0]))
	    //.xAxisPadding(0.5)    
        //.xUnits(function(){return 5;})
        .group(sidewaysGroup2)
        //.renderHorizontalGridLines(true)
        //.centerBar(true)
        .elasticX(true)
        //.elasticY(true)
        //.brushOn(true);
        .renderLabel(false)
        .ordering(function(d) { return d.key })
        .xAxis().tickFormat(function(v) { return ""; });

	// when the input range changes update the chart 
	d3.select("#FPN_threshold").on("click", function() {
		d3.select("#FPN_threshold-value").text('Calculating...');
	  	updateFPN(+this.value);
	});
	
	// Define Table
	var datatable   = dc.dataTable("#design-table");
	datatable
	    .dimension(designidDim)
	    //.dimension(pseudoDimension)
	    //.group(function(d) {return Math.floor(+d.cost / 500) * 500 + 500;})
	    .group(function(d) { return ""})
	    //.group(function(d) {return +d.design_id;})
	    // dynamic columns creation using an array of closures
	    //.size(65466)
	    .size(50)
	    .columns([
	        function(d) {return d.design_id;},
	        function(d) {return d.Acq_Cost;},
	        function(d) {return d.fpn1;},
	        function(d) {return [+d.fpn1,+d.fpn2, +d.fpn3, +d.fpn4, +d.fpn5, +d.fpn6, +d.fpn7, +d.fpn8, +d.fpn9, +d.fpn10,
					+d.fpn11,+d.fpn12,+d.fpn13,+d.fpn14,+d.fpn15,+d.fpn16,+d.fpn17,+d.fpn18,+d.fpn19,+d.fpn20,
					+d.fpn21,+d.fpn22,+d.fpn23,+d.fpn24,+d.fpn25,+d.fpn26,+d.fpn27,+d.fpn28,+d.fpn29,+d.fpn30,
		 			+d.fpn31,+d.fpn32,+d.fpn33,+d.fpn34,+d.fpn35,+d.fpn36,+d.fpn37,+d.fpn38,+d.fpn39,+d.fpn40,
					+d.fpn41,+d.fpn42,+d.fpn43,+d.fpn44,+d.fpn45,+d.fpn46,+d.fpn47,+d.fpn48,+d.fpn49,+d.fpn50
					].filter(isLessThan(fpnThreshold)).length/50;},
	        function(d) {return d.L;},
	        function(d) {return d.B;},
	        function(d) {return d.D;},
	        function(d) {return d.Deck_Area;}
	    ])
	    .sortBy(function(d){ return d.fpn1; });
	    //.sortBy(function(d){ return d.design_id; });
	console.log('rendering')
	dc.renderAll();
	console.log('finished rendering')
	
	// Various formatters.
  	var formatNumber = d3.format(",d"),
      	formatChange = d3.format("+,d"),
      	formatDate = d3.time.format("%B %d, %Y"),
      	formatTime = d3.time.format("%I:%M %p");
	
	// Render the total.
  	d3.selectAll("#total")
      .text(formatNumber(ndx.size()));
    d3.select("#active").text(formatNumber(all.value()));
    
    // Initial FPN threshold 
	updateFPN(10);
	//d3.selectAll("rect").attr("fill","steelblue")
	d3.select("#load_status").text('Status: Ready');


	//////////////////////////////  
	function updateFPN(fpnThreshold) {

		// adjust the text on the range slider
		d3.select("#FPN_threshold-value").text(fpnThreshold + '%');
		d3.select("#FPN_threshold").property("value", fpnThreshold);
		
		nfptDim     = ndx.dimension(function (d) {			
			return [ +d.fpn1,+d.fpn2, +d.fpn3, +d.fpn4, +d.fpn5, +d.fpn6, +d.fpn7, +d.fpn8, +d.fpn9, +d.fpn10,
					+d.fpn11,+d.fpn12,+d.fpn13,+d.fpn14,+d.fpn15,+d.fpn16,+d.fpn17,+d.fpn18,+d.fpn19,+d.fpn20,
					+d.fpn21,+d.fpn22,+d.fpn23,+d.fpn24,+d.fpn25,+d.fpn26,+d.fpn27,+d.fpn28,+d.fpn29,+d.fpn30,
		 			+d.fpn31,+d.fpn32,+d.fpn33,+d.fpn34,+d.fpn35,+d.fpn36,+d.fpn37,+d.fpn38,+d.fpn39,+d.fpn40,
					+d.fpn41,+d.fpn42,+d.fpn43,+d.fpn44,+d.fpn45,+d.fpn46,+d.fpn47,+d.fpn48,+d.fpn49,+d.fpn50
					].filter(isLessThan(fpnThreshold)).length/50;
					
		});
		
		nfptGroup = nfptDim.group(function(d) { return +d; });
		nfptBarChart
			.dimension(nfptDim)
			.group(nfptGroup);
        
		
		for (var ii = 0; ii < ship_data.length; ii++) {
			for (var jj = 1; jj < numEpochs+1; jj++) {
				if (ship_data[ii]["fpn"+jj] <= fpnThreshold) {
					ship_data[ii]["inEpoch"+jj] = 1;
				} else {
					ship_data[ii]["inEpoch"+jj] = 0;
				}
			}
		}
		
		
		//for (var i = 0, len = myArray.length; i < len; i++) {	
		// }
		
		
		sidewaysGroup1 = regroup(inEpoch1Dim, ['inEpoch1','inEpoch2','inEpoch3','inEpoch4','inEpoch5','inEpoch6','inEpoch7','inEpoch8','inEpoch9','inEpoch10',
											   'inEpoch11','inEpoch12','inEpoch13','inEpoch14','inEpoch15','inEpoch16','inEpoch17','inEpoch18','inEpoch19','inEpoch20',
											   'inEpoch21','inEpoch22','inEpoch23','inEpoch24','inEpoch25']);
		sidewaysGroup2 = regroup(inEpoch2Dim, ['inEpoch26','inEpoch27','inEpoch28','inEpoch29','inEpoch30','inEpoch31','inEpoch32','inEpoch33','inEpoch34','inEpoch35', 
											   'inEpoch36','inEpoch37','inEpoch38','inEpoch39','inEpoch40','inEpoch41','inEpoch42','inEpoch43','inEpoch44','inEpoch45',
											   'inEpoch46','inEpoch47','inEpoch48','inEpoch49','inEpoch50']);
		
		epochS1RowChart
        	.dimension(inEpoch1Dim)
        	.group(sidewaysGroup1);
        	
        epochS2RowChart
        	.dimension(inEpoch2Dim)
        	.group(sidewaysGroup2);
        	
        datatable
		    .dimension(designidDim)
		    .group(function(d) { return ""})
		    .size(50)
		    .columns([
		        function(d) {return d.design_id;},
		        function(d) {return d.Acq_Cost;},
		        function(d) {return d.fpn1;},
		        function(d) {return [+d.fpn1,+d.fpn2, +d.fpn3, +d.fpn4, +d.fpn5, +d.fpn6, +d.fpn7, +d.fpn8, +d.fpn9, +d.fpn10,
						+d.fpn11,+d.fpn12,+d.fpn13,+d.fpn14,+d.fpn15,+d.fpn16,+d.fpn17,+d.fpn18,+d.fpn19,+d.fpn20,
						+d.fpn21,+d.fpn22,+d.fpn23,+d.fpn24,+d.fpn25,+d.fpn26,+d.fpn27,+d.fpn28,+d.fpn29,+d.fpn30,
			 			+d.fpn31,+d.fpn32,+d.fpn33,+d.fpn34,+d.fpn35,+d.fpn36,+d.fpn37,+d.fpn38,+d.fpn39,+d.fpn40,
						+d.fpn41,+d.fpn42,+d.fpn43,+d.fpn44,+d.fpn45,+d.fpn46,+d.fpn47,+d.fpn48,+d.fpn49,+d.fpn50
						].filter(isLessThan(fpnThreshold)).length/50;},
		        function(d) {return d.L;},
		        function(d) {return d.B;},
		        function(d) {return d.D;},
		        function(d) {return d.Deck_Area;}
		    ])
		    .sortBy(function(d){ return d.fpn1; });

		dc.redrawAll();
	}	
	//////////////////////////////
};

/*******************/

/*
$(document).ready(function() {
	
}); // End doc ready
*/