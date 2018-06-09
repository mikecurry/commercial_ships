$(document).ready(function() { 
	
	var margin = { top: 50, right: 0, bottom: 100, left: 75 },
		width = 960 - margin.left - margin.right,
		height = 550 - margin.top - margin.bottom,
		gridSize = Math.floor(width / (48)),
		legendElementWidth = gridSize*4,
		buckets = 9,
		colors = ["#f7fbff","#deebf7","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#08519c","#08306b"],
		fnpts = ["0","","10", "", "20", "", "30", "", "40", "","50",
	  		     "","60", "", "70", "", "80", "","90", "","100"],
		fpns = ["0", "", "", "", "", "", "", "", "", "", "25",
	  		    "", "", "", "", "", "", "", "", "", "50",
				"", "", "", "", "", "", "", "", "", "75",
  		   		"", "", "", "", "", "", "", "", "", "100"];

  d3.tsv("heatmap_ships6.tsv",
    function(d) {
      return {
        fnpt: +d.fnpt,
        fpn: +d.fpn,
        value: +d.value
      };
    },
    function(error, data) {
      var colorScale = d3.scale.quantile()
          .domain([0, buckets - 1, d3.max(data, function (d) { return d.value; })])
          .range(colors);

      var svg = d3.select("#chart").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var fnptLabels = svg.selectAll(".fnptLabel")
          .data(fnpts)
          .enter().append("text")
            .text(function (d) { return d; })
            .attr("x", 0)
            .attr("y", function (d, i) { return i * gridSize; })
            .style("text-anchor", "end")
            .attr("transform", "translate(-6," + 1.5*gridSize / 1.5 + ")")
            .attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "fnptLabel mono axis axis-workweek" : "fnptLabel mono axis"); });

      var timeLabels = svg.selectAll(".timeLabel")
          .data(fpns)
          .enter().append("text")
            .text(function(d) { return d; })
            .attr("x", function(d, i) { return i * gridSize; })
            .attr("y", 0)
            .style("text-anchor", "middle")
            .attr("transform", "translate(" + gridSize / 2 + ", -6)")
            .attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });

      var heatMap = svg.selectAll(".fpn")
          .data(data)
          .enter().append("rect")
          //.attr("x", function(d) { return (d.fpn - 1) * gridSize; })
          //.attr("y", function(d) { return (d.fnpt - 1) * gridSize; })
          .attr("x", function(d) { return ((1/500)*10*10*2*d.fpn * (gridSize+0.5)); })
          .attr("y", function(d) { return (20*d.fnpt * (gridSize+0.5)); })
          .attr("rx", 4)
          .attr("ry", 4)
          .attr("class", "fpn bordered")
          .attr("width", gridSize)
          .attr("height", gridSize)
          .style("fill", colors[0])
          .attr("value",function(d) { return d.value; })    
		  .on("click", function(d) {
		  	//console.log(d);
		  	update_design_table2(d.fpn, d.fnpt)
		  })
          .on("mouseover", function() { 
          	d3.select("#num_designs").html(this.getAttribute("value"));
          	d3.select("#fpn").html(d3.format(",.1%")(this.getAttribute("x")/((gridSize+0.5)*2*100/5)));
          	d3.select("#fnpt").html(d3.format(",.1%")(this.getAttribute("y")/((gridSize+0.5)*20)));
          	d3.select(this)
          		.style("opacity", 1.0)
          		.style("stroke-width","2px")
          		.style("stroke", "black");
          })
  		  .on("mouseout", function() { 
  		  	d3.select(this)
          		.style("stroke-width","1px")
          		.style("stroke", "#E6E6E6"); 
  		  });

      heatMap.transition().duration(1000)
          .style("fill", function(d) { return colorScale(d.value); });

      heatMap.append("title").text(function(d) { return d.value; });
          
      var legend = svg.selectAll(".legend")
          .data([0].concat(colorScale.quantiles()), function(d) { return d; })
          .enter().append("g")
          .attr("class", "legend");

      legend.append("rect")
        .attr("x", function(d, i) { return legendElementWidth * i; })
        .attr("y", height)
        .attr("width", legendElementWidth)
        .attr("height", gridSize / 2)
        .style("fill", function(d, i) { return colors[i]; });

      legend.append("text")
        .attr("class", "mono")
        .text(function(d) { return "≥ " + Math.round(d); })
        .attr("x", function(d, i) { return legendElementWidth * i; })
        .attr("y", height + gridSize +10);
  });


	function update_design_table2(fpn_threshold, fnpt_threshold) {
	
		d3.csv("ship_data_v1.csv", 
		function(d,i) {
			// Load ship data
			return {
				design:		+i+1,
				fpn:		[ +d.fpn1,+d.fpn2, +d.fpn3, +d.fpn4, +d.fpn5, +d.fpn6, +d.fpn7, +d.fpn8, +d.fpn9, +d.fpn10,
							 +d.fpn11,+d.fpn12,+d.fpn13,+d.fpn14,+d.fpn15,+d.fpn16,+d.fpn17,+d.fpn18,+d.fpn19,+d.fpn20,
							 +d.fpn21,+d.fpn22,+d.fpn23,+d.fpn24,+d.fpn25,+d.fpn26,+d.fpn27,+d.fpn28,+d.fpn29,+d.fpn30,
							 +d.fpn31,+d.fpn32,+d.fpn33,+d.fpn34,+d.fpn35,+d.fpn36,+d.fpn37,+d.fpn38,+d.fpn39,+d.fpn40,
							 +d.fpn41,+d.fpn42,+d.fpn43,+d.fpn44,+d.fpn45,+d.fpn46,+d.fpn47,+d.fpn48,+d.fpn49,+d.fpn50],			 
				cost:		+d.Acq_Cost,
				L:			+d.L,
				B:			+d.B,
				D:			+d.D,
				crane:		+d.Crane,
				pob:		+d.POB,
				power:		+d.Power,
				lwi:		+d.LWI,
				mp:			+d.MP,
				fuel:		+d.Fuel,
				rov:		+d.ROV,
				dp:			+d.DP,
				deck_area:	+d.Deck_Area
			};
		}, 
		function(error, data) {
			// Assumption being made here that we are working with the Norway ship case study
			// with 65466 designs, 2 stakeholders and 25 contexts
			var num_designs = 65466,
				num_epochs  = 50;
			
			var idx = [],
				filtered_designs = [],
				fpn_thr = fpn_threshold,
				fnpt_thr = fnpt_threshold,
				kk = 0,
				count = 0;
	
			// Determine which design id's are within the filter
			for (var ii = 0; ii < num_designs; ii++) {
				count = 0;
				for (var jj = 0; jj < num_epochs; jj++) {	
					if (data[ii].fpn[jj] <= fpn_thr) {
						count++;
					}
				}
				idx.push(count);
				if (count >= (fnpt_thr*num_epochs)) {
					filtered_designs.push(data[ii].design)
				}
			}
			console.log("Norway")
			console.log(filtered_designs)
	
			var table = document.getElementById("design-table"),
				num_rows = table.rows.length; //including the header
			
			// remove all previous rows
			for (var ii = num_rows-1; ii > 0; ii--) {
				table.deleteRow(ii)
			}
	
			// insert new rows
			for (var ii = 0; ii < filtered_designs.length; ii++) {
				
				// Create an empty <tr> element and add it to the 1st position of the table:
				var row = table.insertRow(ii+1);
				
				// Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
				var cell1 = row.insertCell(0);
				var cell2 = row.insertCell(1);
				var cell3 = row.insertCell(2);
				var cell4 = row.insertCell(3);
				var cell5 = row.insertCell(4);
				var cell6 = row.insertCell(5);
				var cell7 = row.insertCell(6);
				var cell8 = row.insertCell(7);
				var cell9 = row.insertCell(8);
				var cell10 = row.insertCell(9);
				var cell11 = row.insertCell(10);
				var cell12 = row.insertCell(11);
				var cell13 = row.insertCell(12);
				var cell14 = row.insertCell(13);
				
				// Add some text to the new cells:
				cell1.innerHTML = filtered_designs[ii];
				cell2.innerHTML = data[filtered_designs[ii]-1].cost;
				cell3.innerHTML = data[filtered_designs[ii]-1].L;
				cell4.innerHTML = data[filtered_designs[ii]-1].B;
				cell5.innerHTML = data[filtered_designs[ii]-1].D;
				cell6.innerHTML = data[filtered_designs[ii]-1].crane;
				cell7.innerHTML = data[filtered_designs[ii]-1].pob;
				cell8.innerHTML = data[filtered_designs[ii]-1].power;
				cell9.innerHTML = data[filtered_designs[ii]-1].lwi;
				cell10.innerHTML = data[filtered_designs[ii]-1].mp;
				cell11.innerHTML = data[filtered_designs[ii]-1].fuel;		
				cell12.innerHTML = data[filtered_designs[ii]-1].rov;
				cell13.innerHTML = data[filtered_designs[ii]-1].dp;
				cell14.innerHTML = data[filtered_designs[ii]-1].deck_area;
								
			}

		}); 

	}


	function update_design_table(fpn_threshold, fnpt_threshold) {
	
		d3.csv("spacetug_vasc_384_cleaned_v3.csv", 
		function(d) {
			// design_id, capability, propulsion, fuel_mass, dfc
			// payload, speed, deltav, base_mass, mass_fraction, isp, dry_mass, wet_mass
			// mau, cost, fpn, mission, context, epoch_id
			return {
				design:		+d.design_id,
				capability:	+d.capability,
				propulsion:	+d.propulsion,
				fuel_mass: 	+d.fuel_mass,
				dfc:		+d.dfc,
				fpn:		[+d.fpn_1_1,+d.fpn_2_1,+d.fpn_3_1,+d.fpn_4_1,+d.fpn_5_1,+d.fpn_6_1,+d.fpn_7_1,+d.fpn_8_1,+d.fpn_1_2,+d.fpn_2_2,+d.fpn_3_2,+d.fpn_4_2,+d.fpn_5_2,+d.fpn_6_2,+d.fpn_7_2,+d.fpn_8_2],
				epoch:		+d.epoch_id,
				cost:		+d.cost
			};
		}, 
		function(error, data) {
			// Assumption being made here that we are working with the VASC Spacetug case study
			// with 384 designs, 8 missions and 2 contexts
			var num_designs = 384,
				num_epochs  = 16;
			
			var idx = [],
				filtered_designs = [],
				//fpn_thr = 1,
				//fnpt_thr = 10/16,
				fpn_thr = fpn_threshold,
				fnpt_thr = fnpt_threshold,
				kk = 0,
				count = 0,
				capability_label = ["Low","Medium","High","Extreme"],
				propulsion_label = ["BiProp","Cryo","Electric","Nuclear"];
		
			// Determine which design id's are within the filter
			for (var ii = 0; ii < num_designs; ii++) {
				count = 0;
				//console.log(ii)
				for (var jj = 0; jj < num_epochs; jj++) {	
					//ii = design, jj = epoch
					/*
					kk =  (ii-1) + (jj-1)*num_designs;
					if (data[kk].fpn <= fpn_thr) {
						count++;
					}
					*/
					console.log('foo')
					if (data[ii].fpn[jj] <= fpn_thr) {
						count++;
					}
				}
				idx.push(count);
				if (count >= (fnpt_thr*16)) {
					filtered_designs.push(data[ii].design)
				}
			}
	
			var table = document.getElementById("design-table"),
				num_rows = table.rows.length; //including the header
			
			// remove all previous rows
			for (var ii = num_rows-1; ii > 0; ii--) {
				table.deleteRow(ii)
			}
	
			// insert new rows
			for (var ii = 0; ii < filtered_designs.length; ii++) {
				
				// Create an empty <tr> element and add it to the 1st position of the table:
				var row = table.insertRow(ii+1);
				
				// Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
				var cell1 = row.insertCell(0);
				var cell2 = row.insertCell(1);
				var cell3 = row.insertCell(2);
				var cell4 = row.insertCell(3);
				var cell5 = row.insertCell(4);
				var cell6 = row.insertCell(5);
				
				// Add some text to the new cells:
				cell1.innerHTML = filtered_designs[ii];
				cell2.innerHTML = data[filtered_designs[ii]-1].cost;
				cell3.innerHTML = capability_label[data[filtered_designs[ii]-1].capability];
				cell4.innerHTML = propulsion_label[data[filtered_designs[ii]-1].propulsion];
				cell5.innerHTML = data[filtered_designs[ii]-1].fuel_mass;
				cell6.innerHTML = data[filtered_designs[ii]-1].dfc;
			}
	
		}); 
	
	}


	/************ Helper functions ***********/
	
	// Determine unique elements of an array
	Array.prototype.unique = function() {
		var n = {}, r = [];
		for (var i = 0; i < this.length; i++) {
			if (!n[this[i]]) {
				n[this[i]] = true;
				r.push(this[i]);
			}
		}
		return r;
	}; 

}); // End doc ready