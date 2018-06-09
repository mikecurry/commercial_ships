
var lineChart              = dc.seriesChart("#line_chart"),
	expedienceBarChart     = dc.barChart("#expedience"),
	variabilityBarChart    = dc.barChart("#variability"),
	averageBarChart        = dc.barChart("#average"),
	greatestChangeBarChart = dc.barChart("#greatest_change"),
	rangeBarChart 		   = dc.barChart("#range");

d3.csv("spacetug_single_era.csv", function(error, data) {

  var ndx = crossfilter(data);
  var fpnDimension            = ndx.dimension(function(d) {return [+d.design, +d.time]; }),
  	  expedienceDimension     = ndx.dimension(function(d) {return +d.expedience; }),
  	  variabilityDimension    = ndx.dimension(function(d) {return +d.variability; }),
      averageDimension        = ndx.dimension(function(d) {return +d.average; }),
      greatestChangeDimension = ndx.dimension(function(d) {return Math.max(Math.abs(+d.max_fall), Math.abs(+d.max_rise)) ; }),
      rangeDimension          = ndx.dimension(function(d) {return +d.range; });
  
  var fpnGroup            = fpnDimension.group().reduceSum(function(d) { return +d.fpn; }),
  	  expedienceGroup     = expedienceDimension.group(function(d) { return Math.floor(+d / 0.05) * 0.05; }),
  	  variabilityGroup    = variabilityDimension.group(function(d) { return Math.floor(+d / 50) * 50; }),
  	  averageGroup        = averageDimension.group(function(d) { return Math.floor(+d / 1) * 1; }),
  	  greatestChangeGroup = greatestChangeDimension.group(function(d) { return Math.floor(+d / 2) * 2; }),
  	  rangeGroup          = rangeDimension.group(function(d) { return Math.floor(+d / 2) * 2; });

  lineChart
    .width($("#line_chart").width()+35)
	.height($("#line_chart").height())
    .chart(function(c) { return dc.lineChart(c).interpolate('basis'); })
    .x(d3.scale.linear().domain([0,120]))
    .brushOn(false)
    .yAxisLabel("Fuzzy Pareto Number (FPN)")
    .xAxisLabel("Month")
    .clipPadding(10)
    .elasticX(false)
    .elasticY(false)
    .dimension(fpnDimension)
    .group(fpnGroup)
    .mouseZoomable(true)
    .seriesAccessor(function(d) {return "design: " + d.key[0];})
    .keyAccessor(function(d) {return +d.key[1];})
    .valueAccessor(function(d) {return +d.value - 0;});
    //.legend(dc.legend().x(350).y(350).itemHeight(13).gap(5).horizontal(1).legendWidth(140).itemWidth(70));
  //chart.yAxis().tickFormat(function(d) {return d3.format(',d')(d+299500);});
  lineChart.yAxis().tickFormat(function(d) {return d3.format(',d')(d+0);});
  //lineChart.margins().left += 10;
  
  expedienceBarChart
		.width($("#expedience").width())
		.height($("#expedience").height())
        .margins({top: 5, right: 15, bottom: 35, left: 15})
        .dimension(expedienceDimension)
	    .x(d3.scale.linear().domain([0, 1]))
	    .xUnits(function(){return 20;})    
        .group(expedienceGroup)
        .renderHorizontalGridLines(true)
        .centerBar(false)
        .elasticX(true)
        .elasticY(true)
        .brushOn(true)
        .yAxis().tickFormat(function(v) { return ""; });
        
  variabilityBarChart
		.width($("#variability").width())
		.height($("#variability").height())
        .margins({top: 5, right: 15, bottom: 35, left: 15})
        .dimension(variabilityDimension)
	    .x(d3.scale.linear().domain([0, 600]))
	    .xUnits(function(){return 20;})    
        .group(variabilityGroup)
        .renderHorizontalGridLines(true)
        .centerBar(false)
        .elasticX(true)
        .elasticY(true)
        .brushOn(true)
        .yAxis().tickFormat(function(v) { return ""; });
  
  averageBarChart
		.width($("#average").width())
		.height($("#average").height())
        .margins({top: 5, right: 15, bottom: 35, left: 15})
        .dimension(averageDimension)
	    .x(d3.scale.linear().domain([0, 25]))    
        //.xUnits(d3.scale.linear().domain([0, 1]))
        //.xUnits(function(){return 50;})
        .group(averageGroup)
        .renderHorizontalGridLines(true)
        .centerBar(false)
        .elasticX(true)
        .elasticY(true)
        .brushOn(true)
        .yAxis().tickFormat(function(v) { return ""; });
        
	greatestChangeBarChart
		.width($("#greatest_change").width())
		.height($("#greatest_change").height())
        .margins({top: 5, right: 15, bottom: 35, left: 15})
        .dimension(greatestChangeDimension)
	    .x(d3.scale.linear().domain([0, 40]))
	    .xUnits(function(){return 20;})    
        .group(greatestChangeGroup)
        .renderHorizontalGridLines(true)
        .centerBar(false)
        .elasticX(true)
        .elasticY(true)
        .brushOn(true)
        .yAxis().tickFormat(function(v) { return ""; });
        
	rangeBarChart
		.width($("#range").width())
		.height($("#range").height())
        .margins({top: 5, right: 15, bottom: 35, left: 15})
        .dimension(rangeDimension)
	    .x(d3.scale.linear().domain([0, 40]))
	    .xUnits(function(){return 20;})    
        .group(rangeGroup)
        .renderHorizontalGridLines(true)
        .centerBar(false)
        .elasticX(true)
        .elasticY(true)
        .brushOn(true)
        .yAxis().tickFormat(function(v) { return ""; });

  dc.renderAll();

});

/*
function load_button(file) {
    return function load_it() {
        d3.csv(file, function(error, data) {
            ndx.remove();
            ndx.add(data);
            dc.redrawAll();
        });
    };
}

var button1 = load_button("dataset1.csv"),
    button2 = load_button("dataset2.csv"),
    button3 = load_button("dataset3.csv");
*/