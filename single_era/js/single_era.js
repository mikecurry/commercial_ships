
var designRowChart  = dc.rowChart("#design"),
	eraRowChart     = dc.rowChart("#era"),
	fpn1LineChart   = dc.seriesChart("#fpn1"),
	fpn2LineChart   = dc.seriesChart("#fpn2"),
	//mau1LineChart   = dc.seriesChart("#mau1"),
	//mau2LineChart   = dc.seriesChart("#mau2");
	cash1LineChart  = dc.seriesChart("#cash"),
	fpn1AvgBarChart = dc.barChart("#fpn1_avg"),
	fpn1VolBarChart = dc.barChart("#fpn1_vol"),
	fpn2AvgBarChart = dc.barChart("#fpn2_avg"),
	fpn2VolBarChart = dc.barChart("#fpn2_vol"),
	cashAvgBarChart = dc.barChart("#cash_avg"),
	cashVolBarChart = dc.barChart("#cash_vol"),
	npvBarChart     = dc.barChart("#npv");

d3.csv("data/ship_era_data.csv", function(error, data) {
  
  var ndx = crossfilter(data);
  
  var seriesDim   = ndx.dimension(function(d) {return [(+d.design + 6*(+d.era-1)), +d.time]; }),
  	  designDim   = ndx.dimension(function(d) {return +d.design;}),
  	  eraDim      = ndx.dimension(function(d) {return +d.era;}),
  	  timeDim     = ndx.dimension(function(d) {return +d.time;}),
  	  fpn1AvgDim  = ndx.dimension(function(d) {return +d.fpn1_avg; }),
  	  fpn1VolDim  = ndx.dimension(function(d) {return +d.fpn1_vol; }),
  	  fpn2AvgDim  = ndx.dimension(function(d) {return +d.fpn2_avg; }),
  	  fpn2VolDim  = ndx.dimension(function(d) {return +d.fpn2_vol; }),
  	  cashAvgDim  = ndx.dimension(function(d) {return +d.cash_avg; }),
  	  cashVolDim  = ndx.dimension(function(d) {return +d.cash_vol; }),
  	  npvDim 	  = ndx.dimension(function(d) {return +d.npv; });
  
  var designGroup   = designDim.group(function(d) { return +d; }),
  	  eraGroup      = eraDim.group(function(d) { return +d; }),
  	  fpn1Group     = seriesDim.group().reduceSum(function(d) { return +d.fpn1; }),
  	  fpn2Group     = seriesDim.group().reduceSum(function(d) { return +d.fpn2; }),
  	  mau1Group     = seriesDim.group().reduceSum(function(d) { return +d.mau1; }),
  	  mau2Group     = seriesDim.group().reduceSum(function(d) { return +d.mau2; }),
  	  cashFlowGroup = seriesDim.group().reduceSum(function(d) { return +d.cash_flow; });

  var fpn1AvgGroup = fpn1AvgDim.group(function(d) { return Math.floor(+d / 10) * 10; }),
  	  fpn1VolGroup = fpn1VolDim.group(function(d) { return Math.floor(+d / 50) * 50; }),
  	  fpn2AvgGroup = fpn2AvgDim.group(function(d) { return Math.floor(+d / 10) * 10; }),
  	  fpn2VolGroup = fpn2VolDim.group(function(d) { return Math.floor(+d / 50) * 50;  }),
  	  cashAvgGroup = cashAvgDim.group(function(d) { return Math.floor(+d / 1) * 1; }),
  	  cashVolGroup = cashVolDim.group(function(d) { return Math.floor(+d / 20) * 20; }),
  	  npvGroup     = npvDim.group(function(d) { return Math.floor(+d / 1) * 1; });
  
  	// Define charts
  	designRowChart
		.width($("#design").width())
		.height($("#design").height())
        .margins({top: 0, right: 20, bottom: 30, left: 20})
        .dimension(designDim)
        .group(designGroup)
        .elasticX(true)
        .labelOffsetY(9)
        .xAxis().tickFormat(function(v) { return ""; });
        
	eraRowChart
		.width($("#era").width())
		.height($("#era").height())
        .margins({top: 0, right: 20, bottom: 30, left: 20})
        .dimension(eraDim)
        .group(eraGroup)
        .elasticX(true)
        .labelOffsetY(9)
        .xAxis().tickFormat(function(v) { return ""; });
  			 
	fpn1LineChart
		.width($("#fpn1").width()+35)
		.height($("#fpn1").height()+5)
	    .chart(function(c) { return dc.lineChart(c).interpolate('basis'); })
	    .x(d3.scale.linear().domain([0,20]))
	    .brushOn(false)
	    .yAxisLabel("Fuzzy Pareto Number (FPN)")
	    .xAxisLabel("Year")
	    .clipPadding(10)
	    .elasticX(false)
	    .elasticY(true)
	    .dimension(seriesDim)
	    .group(fpn1Group)
	    .mouseZoomable(true)
	    .seriesAccessor(function(d) {return "design: " + d.key[0];})
	    .keyAccessor(function(d) {return +d.key[1];})
	    .valueAccessor(function(d) {return +d.value - 0;});
	    //.legend(dc.legend().x(350).y(350).itemHeight(13).gap(5).horizontal(1).legendWidth(140).itemWidth(70));
	  	//chart.yAxis().tickFormat(function(d) {return d3.format(',d')(d+299500);});
	fpn1LineChart.yAxis().tickFormat(function(d) {return d3.format(',d')(d+0);});

	fpn2LineChart
		.width($("#fpn2").width()+35)
		.height($("#fpn2").height()+5)
	    .chart(function(c) { return dc.lineChart(c).interpolate('basis'); })
	    .x(d3.scale.linear().domain([0,20]))
	    .brushOn(false)
	    .yAxisLabel("Fuzzy Pareto Number (FPN)")
	    .xAxisLabel("Year")
	    .clipPadding(10)
	    .elasticX(false)
	    .elasticY(true)
	    .dimension(seriesDim)
	    .group(fpn2Group)
	    .mouseZoomable(true)
	    .seriesAccessor(function(d) {return "design: " + d.key[0];})
	    .keyAccessor(function(d) {return +d.key[1];})
	    .valueAccessor(function(d) {return +d.value - 0;});
	    //.legend(dc.legend().x(350).y(350).itemHeight(13).gap(5).horizontal(1).legendWidth(140).itemWidth(70));
	  	//chart.yAxis().tickFormat(function(d) {return d3.format(',d')(d+299500);});
  fpn2LineChart.yAxis().tickFormat(function(d) {return d3.format(',d')(d+0);});
  
  /*
  mau1LineChart
		.width($("#mau1").width()+35)
		.height($("#mau1").height()+5)
	    .chart(function(c) { return dc.lineChart(c).interpolate('basis'); })
	    .x(d3.scale.linear().domain([0,20]))
	    .brushOn(false)
	    .yAxisLabel("Multi-Attribute Utility (MAU)")
	    .xAxisLabel("Year")
	    .clipPadding(10)
	    .elasticX(false)
	    .elasticY(true)
	    .dimension(seriesDim)
	    .group(mau1Group)
	    .mouseZoomable(true)
	    .seriesAccessor(function(d) {return "design: " + d.key[0];})
	    .keyAccessor(function(d) {return +d.key[1];})
	    .valueAccessor(function(d) {return +d.value - 0;});
	    //.legend(dc.legend().x(350).y(350).itemHeight(13).gap(5).horizontal(1).legendWidth(140).itemWidth(70));
	  	//chart.yAxis().tickFormat(function(d) {return d3.format(',d')(d+299500);});
	mau1LineChart.yAxis().tickFormat(function(d) {return d3.format(',d')(d+0);});
	
	mau2LineChart
		.width($("#mau2").width()+35)
		.height($("#mau2").height()+5)
	    .chart(function(c) { return dc.lineChart(c).interpolate('basis'); })
	    .x(d3.scale.linear().domain([0,20]))
	    .brushOn(false)
	    .yAxisLabel("Multi-Attribute Utility (MAU)")
	    .xAxisLabel("Year")
	    .clipPadding(10)
	    .elasticX(false)
	    .elasticY(true)
	    .dimension(seriesDim)
	    .group(mau2Group)
	    .mouseZoomable(true)
	    .seriesAccessor(function(d) {return "design: " + d.key[0];})
	    .keyAccessor(function(d) {return +d.key[1];})
	    .valueAccessor(function(d) {return +d.value - 0;});
	    //.legend(dc.legend().x(350).y(350).itemHeight(13).gap(5).horizontal(1).legendWidth(140).itemWidth(70));
	  	//chart.yAxis().tickFormat(function(d) {return d3.format(',d')(d+299500);});
	mau2LineChart.yAxis().tickFormat(function(d) {return d3.format(',d')(d+0);});
	*/
	cash1LineChart
		.width($("#cash").width()+35)
		.height($("#cash").height()+5)
	    .chart(function(c) { return dc.lineChart(c).interpolate('basis'); })
	    .x(d3.scale.linear().domain([0,20]))
	    .brushOn(false)
	    .yAxisLabel("Cash Flow ($M)")
	    .xAxisLabel("Year")
	    .clipPadding(10)
	    .elasticX(false)
	    .elasticY(true)
	    .dimension(seriesDim)
	    .group(cashFlowGroup)
	    .mouseZoomable(true)
	    .seriesAccessor(function(d) {return "design: " + d.key[0];})
	    .keyAccessor(function(d) {return +d.key[1];})
	    .valueAccessor(function(d) {return +d.value - 0;});
	    //.legend(dc.legend().x(350).y(350).itemHeight(13).gap(5).horizontal(1).legendWidth(140).itemWidth(70));
	  	//chart.yAxis().tickFormat(function(d) {return d3.format(',d')(d+299500);});
	cash1LineChart.yAxis().tickFormat(function(d) {return d3.format(',d')(d+0);});
	
	/*
	cash2LineChart
		.width($("#cash2").width()+35)
		.height($("#cash2").height()+5)
	    .chart(function(c) { return dc.lineChart(c).interpolate('basis'); })
	    .x(d3.scale.linear().domain([0,20]))
	    .brushOn(false)
	    .yAxisLabel("Cash Flow ($M)")
	    .xAxisLabel("Year")
	    .clipPadding(10)
	    .elasticX(false)
	    .elasticY(true)
	    .dimension(seriesDim)
	    .group(cashFlowGroup)
	    .mouseZoomable(true)
	    .seriesAccessor(function(d) {return "design: " + d.key[0];})
	    .keyAccessor(function(d) {return +d.key[1];})
	    .valueAccessor(function(d) {return +d.value - 0;});
	    //.legend(dc.legend().x(350).y(350).itemHeight(13).gap(5).horizontal(1).legendWidth(140).itemWidth(70));
	  	//chart.yAxis().tickFormat(function(d) {return d3.format(',d')(d+299500);});
	cash2LineChart.yAxis().tickFormat(function(d) {return d3.format(',d')(d+0);});
	*/
	
	 fpn1AvgBarChart
		.width($("#fpn1_avg").width())
		.height($("#fpn1_avg").height())
        .margins({top: 5, right: 15, bottom: 35, left: 15})
        .dimension(fpn1AvgDim)
	    .x(d3.scale.linear().domain([0, 100]))  
	    .xUnits(function(){return 20;})  
        .group(fpn1AvgGroup)
        .renderHorizontalGridLines(true)
        .centerBar(false)
        .elasticX(true)
        .elasticY(true)
        .brushOn(true)
        .yAxis().tickFormat(function(v) { return ""; });

	 fpn1VolBarChart
		.width($("#fpn1_vol").width())
		.height($("#fpn1_vol").height())
        .margins({top: 5, right: 15, bottom: 35, left: 15})
        .dimension(fpn1VolDim)
	    .x(d3.scale.linear().domain([0, 100]))  
	    .xUnits(function(){return 20;})  
        .group(fpn1VolGroup)
        .renderHorizontalGridLines(true)
        .centerBar(false)
        .elasticX(true)
        .elasticY(true)
        .brushOn(true)
        .yAxis().tickFormat(function(v) { return ""; });

	 fpn2AvgBarChart
		.width($("#fpn2_avg").width())
		.height($("#fpn2_avg").height())
        .margins({top: 5, right: 15, bottom: 35, left: 15})
        .dimension(fpn2AvgDim)
	    .x(d3.scale.linear().domain([0, 100]))
	    .xUnits(function(){return 20;})   
        .group(fpn2AvgGroup)
        .renderHorizontalGridLines(true)
        .centerBar(false)
        .elasticX(true)
        .elasticY(true)
        .brushOn(true)
        .yAxis().tickFormat(function(v) { return ""; });

	 fpn2VolBarChart
		.width($("#fpn2_vol").width())
		.height($("#fpn2_vol").height())
        .margins({top: 5, right: 15, bottom: 35, left: 15})
        .dimension(fpn2VolDim)
	    .x(d3.scale.linear().domain([0, 100]))
	    .xUnits(function(){return 20;})    
        .group(fpn2VolGroup)
        .renderHorizontalGridLines(true)
        .centerBar(false)
        .elasticX(true)
        .elasticY(true)
        .brushOn(true)
        .yAxis().tickFormat(function(v) { return ""; });
        
	cashAvgBarChart
		.width($("#cash_avg").width())
		.height($("#cash_avg").height())
        .margins({top: 5, right: 15, bottom: 35, left: 15})
        .dimension(cashAvgDim)
	    .x(d3.scale.linear().domain([0, 100]))    
        .group(cashAvgGroup)
        .renderHorizontalGridLines(true)
        .centerBar(false)
        .elasticX(true)
        .elasticY(true)
        .brushOn(true)
        .yAxis().tickFormat(function(v) { return ""; });

	 cashVolBarChart
		.width($("#cash_vol").width())
		.height($("#cash_vol").height())
        .margins({top: 5, right: 15, bottom: 35, left: 15})
        .dimension(cashVolDim)
	    .x(d3.scale.linear().domain([0, 100])) 
	    .xUnits(function(){return 20;})   
        .group(cashVolGroup)
        .renderHorizontalGridLines(true)
        .centerBar(false)
        .elasticX(true)
        .elasticY(true)
        .brushOn(true)
        .yAxis().tickFormat(function(v) { return ""; });

	npvBarChart
		.width($("#npv").width())
		.height($("#npv").height())
        .margins({top: 5, right: 15, bottom: 35, left: 15})
        .dimension(npvDim)
	    .x(d3.scale.linear().domain([0, 100]))    
        .group(npvGroup)
        .renderHorizontalGridLines(true)
        .centerBar(false)
        .elasticX(true)
        .elasticY(true)
        .brushOn(true)
        .yAxis().tickFormat(function(v) { return ""; });

	preFilter(timeDim,'time','1');
	// Define Table
	var datatable   = dc.dataTable("#design-table");
	datatable
	    //.dimension(designDim)
	    .dimension(timeDim)
	    //.dimension(timeDim.filter(1))
	    //.dimension(preFilter(timeDim,'time','1'))
	    //.group(function(d) { return ""})
	    .group(function(d) {return "Era " + d.era;})
	    .size(500)
	    .columns([
	        function(d) {return d.design;},
	        //function(d) {return d.era;},
	        function(d) {return d.acq_cost;},
	        function(d) {return (+d.fpn1).toFixed(1);},
	        function(d) {return (+d.fpn2).toFixed(1);},
	        function(d) {return (+d.npv).toFixed(1);}
	    ])
	    .sortBy(function(d){ return d.design; });

	//timeDim.filterAll();
  dc.renderAll();
  
  function preFilter(dim,okey,oval){

    return{

        top:function(x){
            var a1 = dim.top(x).filter(function(v){
                return v[okey] === oval;
            });
            return a1;
        }
    };
}

  
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