/*
 * 
 * Mike Curry
 * August 2015
 * 
 */


$.ajax({
	type: 'GET',
	url: 'sub_data_2015_10_09v.csv',
	success: function(data) {
		sub_data = csvJSON(data);
		//for (var ii = 0; ii < sub_data.length; ii++) {
		//	sub_data[ii].fpn1 = +sub_data[ii].fpn1;
		//	sub_data[ii].fpn2 = +sub_data[ii].fpn2;
		//	sub_data[ii].fpn3 = +sub_data[ii].fpn3;
		//}
		run_after_ajax(sub_data);
		
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
/* Example
var a = [2,10,3,5,14,1,6];
var b = a.filter(isLessThan(5));
console.log(b); // [ 2, 3, 5, 1 ] values
c = [];
for (var ii=0; ii<b.length; ii++) {
	c.push(a.indexOf(b[ii]));
}
console.log(c); // [ 0, 2, 3, 5 ] indeces
*/

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

function run_after_ajax(sub_data) {
	
	var numEpochs = 3;
	var fpnThreshold = 5.0;
	// Add "inEpoch" key for each epoch to indicate whether
	// the design is within threshold
	for (var ii = 0; ii < sub_data.length; ii++) {
		for (var jj = 1; jj < numEpochs+1; jj++) {
			if (sub_data[ii]["fpn"+jj] <= fpnThreshold) {
				sub_data[ii]["inEpoch"+jj] = 1;
			} else {
				sub_data[ii]["inEpoch"+jj] = 0;
			}
		}
	}
	
	
	meanND = dc.numberDisplay("#mean");
	
	// Define charts
	combineScoreBarChart = dc.barChart("#combine_score");
	costBarChart         = dc.barChart("#cost");
	fpnBarChart          = dc.barChart("#fpn");
	nfptBarChart         = dc.barChart("#nfpt");
	epochRowChart        = dc.rowChart("#epoch");
	
	weightRowChart       = dc.rowChart("#weight");	
	paxRowChart        	 = dc.rowChart("#pax");	
	cargoRowChart        = dc.rowChart("#cargo");
	lio_depthRowChart    = dc.rowChart("#lio_depth");	
	lio_typeRowChart     = dc.rowChart("#lio_type");	
	pwr_sourceRowChart   = dc.rowChart("#pwr_source");	
	prop_typeRowChart    = dc.rowChart("#prop_type");	
	modRowChart          = dc.rowChart("#mod");

	// Create crossfilter instance and dimensions for scatter plots
	var ndx = crossfilter(sub_data);
	
	// Create dimensions for histograms
	var designidDim	    = ndx.dimension(function (d) {return +d.design_id;}),
		weightDim       = ndx.dimension(function (d) {return +d.weight;}),
		paxDim          = ndx.dimension(function (d) {return +d.pax;}),
		cargoDim        = ndx.dimension(function (d) {return +d.cargo;}),
		lio_depthDim    = ndx.dimension(function (d) {return +d.lio_depth;}),
		lio_typeDim     = ndx.dimension(function (d) {return +d.lio_type;}),	
		pwr_sourceDim   = ndx.dimension(function (d) {return +d.pwr_source;}),	
		prop_typeDim    = ndx.dimension(function (d) {return +d.prop_type;}),	
		modDim          = ndx.dimension(function (d) {return +d.mod;}),
		combineScoreDim = ndx.dimension(function (d) {return +d.combine_score;}),
		costDim         = ndx.dimension(function (d) {return +d.cost;}),
		fpnDim          = ndx.dimension(function (d) {return +d.fpn;});
		inEpoch1Dim     = ndx.dimension(function (d) {return +d.inEpoch1;});
		nfptDim         = ndx.dimension(function (d) {
			//var fpnThreshold = 5.0;
			return [+d.fpn1, +d.fpn2, +d.fpn3].filter(isLessThan(fpnThreshold)).length/3;
		});


	// Apply Filters	
	var n = ndx.groupAll().reduceCount().value();
	console.log('There are ' + n + ' total designs.');

	// Create Groups
	var designidGroup     = designidDim.group(function(d) { return +d; });
	var weightGroup       = weightDim.group(function(d) { return +d; });
	var paxGroup          = paxDim.group(function(d) { return +d; });
	var cargoGroup        = cargoDim.group(function(d) { return +d; });
	var lio_depthGroup    = lio_depthDim.group(function(d) { return +d; });
	var lio_typeGroup     = lio_typeDim.group(function(d) { return +d; });	
	var pwr_sourceGroup   = pwr_sourceDim.group(function(d) { return +d; });	
	var prop_typeGroup    = prop_typeDim.group(function(d) { return +d; });	
	var modGroup          = modDim.group(function(d) { return +d; });
	var combineScoreGroup = combineScoreDim.group(function(d) { return Math.floor(+d / 0.01) * 0.01; });
	var fpnGroup          = fpnDim.group(function(d) { return Math.floor(+d / 1) * 1; });
	var costGroup         = costDim.group(function(d) { return Math.floor(+d / 0.5) * 0.5; });
	var nfptGroup         = nfptDim.group(function(d) { return +d; });
	var sidewaysGroup = regroup(inEpoch1Dim, ['inEpoch1', 'inEpoch2', 'inEpoch3']);

   	var all = ndx.groupAll();
	meanND
		.group(all)
		.valueAccessor(function(d) { return +d; } )
		.formatNumber(d3.format(",d"));

	weightRowChart
		.width($("#weight").width())
		.height($("#weight").height())
        .margins({top: 10, right: 10, bottom: 20, left: 50})
        .dimension(weightDim)
        .group(weightGroup)
        .elasticX(true)
        .xAxis().tickFormat(function(v) { return ""; });
        
    paxRowChart
		.width($("#pax").width())
		.height($("#pax").height())
        .margins({top: 10, right: 10, bottom: 20, left: 50})
        .dimension(paxDim)
        .group(paxGroup)
        .elasticX(true)
        .xAxis().tickFormat(function(v) { return ""; });

	cargoRowChart
		.width($("#cargo").width())
		.height($("#cargo").height())
        .margins({top: 10, right: 10, bottom: 20, left: 50})
        .dimension(cargoDim)
        .group(cargoGroup)
        .elasticX(true)
        .xAxis().tickFormat(function(v) { return ""; });

	lio_depthRowChart
		.width($("#lio_depth").width())
		.height($("#lio_depth").height())
        .margins({top: 10, right: 10, bottom: 20, left: 50})
        .dimension(lio_depthDim)
        .group(lio_depthGroup)
        .elasticX(true)
        .xAxis().tickFormat(function(v) { return ""; });

	lio_typeRowChart
		.width($("#lio_type").width())
		.height($("#lio_type").height())
        .margins({top: 10, right: 10, bottom: 20, left: 50})
        .dimension(lio_typeDim)
        .group(lio_typeGroup)
        .elasticX(true)
        .xAxis().tickFormat(function(v) { return ""; });

	pwr_sourceRowChart
		.width($("#pwr_source").width())
		.height($("#pwr_source").height())
        .margins({top: 10, right: 10, bottom: 20, left: 50})
        .dimension(pwr_sourceDim)
        .group(pwr_sourceGroup)
        .elasticX(true)
        .xAxis().tickFormat(function(v) { return ""; });

	prop_typeRowChart
		.width($("#prop_type").width())
		.height($("#prop_type").height())
        .margins({top: 10, right: 10, bottom: 20, left: 50})
        .dimension(prop_typeDim)
        .group(prop_typeGroup)
        .elasticX(true)
        .xAxis().tickFormat(function(v) { return ""; });

	modRowChart
		.width($("#mod").width())
		.height($("#mod").height())
        .margins({top: 10, right: 10, bottom: 20, left: 50})
        .dimension(modDim)
        .group(modGroup)
        .elasticX(true)
        .xAxis().tickFormat(function(v) { return ""; });

	combineScoreBarChart
		.width($("#combine_score").width())
		.height($("#combine_score").height())
        .margins({top: 0, right: 10, bottom: 20, left: 50})
        .dimension(combineScoreDim)
	    .x(d3.scale.linear().domain([0, 7]))    
        //.xUnits(d3.scale.linear().domain([0, 1]))
        .xUnits(function(){return 50;})
        .group(combineScoreGroup)
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
       
    fpnBarChart
		.width($("#fpn").width())
		.height($("#fpn").height())
        .margins({top: 0, right: 10, bottom: 20, left: 50})
        .dimension(fpnDim)
	    .x(d3.scale.linear().domain([0, 40]))    
        .xUnits(function(){return 50;})
        .group(fpnGroup)
        .renderHorizontalGridLines(true)
        .centerBar(false)
        .elasticX(true)
        .elasticY(true)
        .brushOn(true)
        .yAxis().tickFormat(function(v) { return ""; }); 

	 nfptBarChart
		.width($("#nfpt").width())
		.height($("#nfpt").height())
        .margins({top: 10, right: 10, bottom: 20, left: 50})
        .dimension(nfptDim)
	    .x(d3.scale.linear().domain([0, 3.0]))
	    .xAxisPadding(0.05)    
        .xUnits(function(){return 20;})
        .group(nfptGroup)
        .renderHorizontalGridLines(true)
        .centerBar(true)
        .elasticX(true)
        .elasticY(true)
        .brushOn(true)
        //.yAxis().tickFormat(function(v) { return ""; });
		.yAxisLabel("Number of Designs");
		
	epochRowChart
		.width($("#epoch").width())
		.height($("#epoch").height())
        .margins({top: 10, right: 10, bottom: 20, left: 50})
        .dimension(inEpoch1Dim)
	    //.x(d3.scale.linear().domain([0, 3.0]))
	    //.xAxisPadding(0.5)    
        //.xUnits(function(){return 50;})
        .group(sidewaysGroup)
        //.renderHorizontalGridLines(true)
        //.centerBar(true)
        .elasticX(true)
        //.elasticY(true)
        //.brushOn(true);
		;

	// when the input range changes update the chart 
	d3.select("#FPN_threshold").on("click", function() {
	  updateFPN(+this.value);
	});
    
	// Define Table
	// Data Table
	var datatable   = dc.dataTable("#design-table");
	datatable
	    .dimension(designidDim)
	    //.dimension(pseudoDimension)
	    //.group(function(d) {return Math.floor(+d.cost / 500) * 500 + 500;})
	    .group(function(d) { return ""})
	    //.group(function(d) {return +d.design_id;})
	    // dynamic columns creation using an array of closures
	    .size(384)
	    .columns([
	        function(d) {return d.design_id;},
	        function(d) {return d.combine_score;},
	        function(d) {return d.cost;},
	        function(d) {return d.fpn;},
	        function(d) {return d.fpn1;},
	        function(d) {return d.fpn2;},
	        function(d) {return d.fpn3;}
	    ])
	    .sortBy(function(d){ return d.design_id; });
	
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
    
    // Initial FPN threshold 
	updateFPN(5);
    
	//////////////////////////////  
	function updateFPN(fpnThreshold) {
		// adjust the text on the range slider
		d3.select("#FPN_threshold-value").text(fpnThreshold + '%');
		d3.select("#FPN_threshold").property("value", fpnThreshold);
		
		//console.log(fpnThreshold)
		nfptDim = ndx.dimension(function (d) {
			return [+d.fpn1, +d.fpn2, +d.fpn3].filter(isLessThan(fpnThreshold)).length/3;
		});
		nfptGroup = nfptDim.group(function(d) { return +d; });
		nfptBarChart
			.dimension(nfptDim)
			.group(nfptGroup);
		
		for (var ii = 0; ii < sub_data.length; ii++) {
			for (var jj = 1; jj < numEpochs+1; jj++) {
				if (sub_data[ii]["fpn"+jj] <= fpnThreshold) {
					sub_data[ii]["inEpoch"+jj] = 1;
				} else {
					sub_data[ii]["inEpoch"+jj] = 0;
				}
			}
		}
		sidewaysGroup = regroup(inEpoch1Dim, ['inEpoch1', 'inEpoch2', 'inEpoch3']);
		
		epochRowChart
        	.dimension(inEpoch1Dim)
        	.group(sidewaysGroup);

		dc.redrawAll();
	}	
	//////////////////////////////
};

/*******************/

/*
$(document).ready(function() {
	
}); // End doc ready
*/