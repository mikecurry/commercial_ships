	d3.select("#epochs").property("value","1"); // Default dropdown to Epoch 1

	// https://github.com/wbkd/d3-extended
    d3.selection.prototype.moveToFront = function() {  
      return this.each(function(){
        this.parentNode.appendChild(this);
      });
    };
    d3.selection.prototype.moveToBack = function() {  
        return this.each(function() { 
            var firstChild = this.parentNode.firstChild; 
            if (firstChild) { 
                this.parentNode.insertBefore(this, firstChild); 
            } 
        });
    };

	function updateTrackedDots(tracked_dots, with_trans) {
		
		var tracked_scattered = d3.select("#tracked_group")
			.selectAll(".tracked_dot")
      		.data(tracked_dots);
      	
		tracked_scattered.exit()
			//.attr("class", "exit")
			//.transition().duration(transDur)
			.remove();
		
		tracked_scattered		      
			.enter().append("circle")
			//.attr("class","enter")
			.attr("class", "tracked_dot");
		
		if(with_trans == 1) {	
			tracked_scattered
			  .transition().duration(transDur)
				.style("blend-mode","multiply")
				.style("fill","black")
				.attr("r", 7.5)
				.attr("cx", function(d) {		      	
						return x2(d[curX[0]]);
					})
				.attr("cy", function(d) { 
						// FIXME - this is to make sure MAU values that are NaN do not appear in scatter 
			      		if( !isNaN(d[curY[0]]) ) {
			      			return y(d[curY[0]]);
			      		} else {
			      			return 1000;
			      		}      			  
					})
				.style("stroke","red")
				.style("stroke-width",2)
				//.style("stroke-dasharray", "1,2")
				.style("fill","black")
				.attr('fill-opacity', 0.2);
				
		} else {
			tracked_scattered
			  //.transition().duration(transDur)
				.style("blend-mode","multiply")
				.style("fill","black")
				.attr("r", 7.5)
				.attr("cx", function(d) {		      	
						return x2(d[curX[0]]);
					})
				.attr("cy", function(d) { 
						// FIXME - this is to make sure MAU values that are NaN do not appear in scatter 
			      		if( !isNaN(d[curY[0]]) ) {
			      			return y(d[curY[0]]);
			      		} else {
			      			return 1000;
			      		}      			  
					})
				.style("stroke","red")
				.style("stroke-width",2)
				//.style("stroke-dasharray", "1,2")
				.style("fill","black")
				.attr('fill-opacity', 0.2);
		}

	}

	function updateTable(brushedObjects) {
		//console.log("updateTable");
		d3.selectAll("tbody").remove(); // FIXME: Must be a better way to do this4
		d3.select("#mean").text(brushedObjects.length)
		design_data = [];
		for (ii = 0; ii < brushedObjects.length; ii++) {
			var	obj = brushedObjects[ii];
			var arr = Object.keys(obj).map(function (key) { return obj[key]; });
			design_data.push(arr);
		}
		
		var main_table = d3.select("#main_table")
	        .append("tbody")
	        
	        .selectAll("tr")
	            .data(design_data).enter()
	            .append("tr")
	
	        .selectAll("td")
	            .data(function(d) { return d; }).enter()
	            .append("td")
	            .text(function(d) { return d; });
		
	}


	// handle on click event
	d3.select('#epochs').on('change', function() {
		console.log("dropdown change");

		var epoch_num = +this.value;
		for (ii = 0; ii < allObjects.length; ii++) {
			allObjects[ii].MAU = (+dataBase[ii+1][epoch_num+115]);
			allObjects[ii].FPN = (+dataBase[ii+1][epoch_num+19]);
			//allObjects[ii].MAU = (+dataBase[ii+1][epoch_num+115]).toFixed(3);
			//allObjects[ii].FPN = (+dataBase[ii+1][epoch_num+19]).toFixed(3);
		}
		for (ii = 0; ii < brushees.length; ii++) {
			jj = +brushees[ii].ID;		
			brushees[ii].MAU = (+dataBase[jj][epoch_num+115]);
			brushees[ii].FPN = (+dataBase[jj][epoch_num+19]);
			//brushees[ii].MAU = (+dataBase[jj][epoch_num+115]).toFixed(3);
			//brushees[ii].FPN = (+dataBase[jj][epoch_num+19]).toFixed(3);
			//if(isNaN(brushees[ii].MAU)) {brushees[ii].MAU=undefined;}
		}
		for (ii = 0; ii < tracked_dots.length; ii++) {
			jj = +tracked_dots[ii].ID;	
			tracked_dots[ii].MAU = (+dataBase[jj][epoch_num+115]);
			tracked_dots[ii].FPN = (+dataBase[jj][epoch_num+19]);
			//tracked_dots[ii].MAU = (+dataBase[jj][epoch_num+115]).toFixed(3);
			//tracked_dots[ii].FPN = (+dataBase[jj][epoch_num+19]).toFixed(3);
		}
		
		new_brushees = []; // this variable only for updating data table
		for (ii = 0; ii < brushees.length; ii++) {	
			if(!isNaN(brushees[ii].MAU)) {
				new_brushees.push(brushees[ii]);
			} 
		}
		
		updateTable(new_brushees);
		plotUpdate(allObjects,new_brushees,0);
		updateTrackedDots(tracked_dots,1);
		parcoords.render();
				
	}); 
	
	function updateEpochData(allObjects, brushees, tracked_dots) {
		
		var dropdown = d3.select('#epochs');
		var epoch_num;
		if (dropdown[0][0] == null) {
			epoch_num = 1;
		} else {
			epoch_num = dropdown[0][0].value;
		}
		
		
		for (ii = 0; ii < allObjects.length; ii++) {
			allObjects[ii].MAU = (+dataBase[ii+1][epoch_num+115]);
			allObjects[ii].FPN = (+dataBase[ii+1][epoch_num+19]);
			//allObjects[ii].MAU = (+dataBase[ii+1][epoch_num+115]).toFixed(3);
			//allObjects[ii].FPN = (+dataBase[ii+1][epoch_num+19]).toFixed(3);
		}
		for (ii = 0; ii < brushees.length; ii++) {
			jj = +brushees[ii].ID;		
			brushees[ii].MAU = (+dataBase[jj][epoch_num+115]);
			brushees[ii].FPN = (+dataBase[jj][epoch_num+19]);
			//brushees[ii].MAU = (+dataBase[jj][epoch_num+115]).toFixed(3);
			//brushees[ii].FPN = (+dataBase[jj][epoch_num+19]).toFixed(3);
			//if(isNaN(brushees[ii].MAU)) {brushees[ii].MAU=undefined;}
		}
		for (ii = 0; ii < tracked_dots.length; ii++) {
			jj = +tracked_dots[ii].ID;	
			tracked_dots[ii].MAU = (+dataBase[jj][epoch_num+115]);
			tracked_dots[ii].FPN = (+dataBase[jj][epoch_num+19]);
			//tracked_dots[ii].MAU = (+dataBase[jj][epoch_num+115]).toFixed(3);
			//tracked_dots[ii].FPN = (+dataBase[jj][epoch_num+19]).toFixed(3);
		}
		
		new_brushees = []; // this variable only for updating data table
		for (ii = 0; ii < brushees.length; ii++) {	
			if(!isNaN(brushees[ii].MAU)) {
				new_brushees.push(brushees[ii]);
			} 
		}
		updateTable(new_brushees);
	}
	

var modulor;
var dataList=[];
//var mainWidth=580;
var mainWidth=1200;
var mainHeight = 300;
var contents;
var module;
var iterationValue;
var parcolor="black";
var toolhover;
var mainRad=2;
var colMin,colMax;
var color;
var parcoords;
var yPicker;
var xPicker;
var pickCircle;
var pickRectangle;
//var curX=["Cost"];
//var curY=["MAU"];
var curX=[" "];
var curY=[" "];
// var curRad=["RH"];
// var curCol=["DewPoint"];
var curRad;
var curCol;
var colorado=d3.scale.category20();
var objectivity=[];
var categories=["MAU"];
var objectify={};
var allObjects=[];

var trends;
var scatters;
var xAx,yAx,xAxText,yAxText;
var transDur=1600;
var transBack=transDur;
var fullList=[];

//var unitList=["","","°C","°C","%","Pa","Wh/m2","Wh/m2","Wh/m2","Wh/m2","Wh/m2","Wh/m2","lux","lux","lux","Cd/m2","°","m/s","","","km","m","mm",""]
var unitList=["","m","m","m","t","ppl","GW","t","","","","","","","kts","m2","tons","","$M","","",""]
/*		  
var colorScale = 
	d3.scale.linear()
	  .range(["maroon","darkcyan"])
	  .interpolate(d3.interpolateHsl);
*/
var colorScale = 
	d3.scale.linear()
	  .range(["#E47E21","#4977B1"])
	  .interpolate(d3.interpolateHsl);

// Set the dimensions of the canvas / graph
var	margin = {top: 5, right: 25, bottom: 40, left:30},
	width = mainWidth - margin.left - margin.right,
	height = mainHeight - margin.top - margin.bottom;

// Parse the date / time
// var	parseDate = d3.time.format("%d-%b-%y").parse;
var	parseDates = d3.time.format("%m-%d-%H-%M").parse;

// Set the ranges
var	x = d3.time.scale().range([0, width]);
var	x2 = d3.scale.linear().range([0, width]);
var	y = d3.scale.linear().range([height, 0]);
var	y2 = d3.time.scale().range([height, 0]);
var radScale=d3.scale.linear().range([1, 5]);



// Define the axes
var	xAxis = d3.svg.axis().scale(x)
	.orient("bottom").ticks(5);
var xAxis2=d3.svg.axis().scale(x2)
	.orient("bottom").ticks(5);
var	yAxis = d3.svg.axis().scale(y)
	.orient("left").ticks(5); 
var	yAxis2 = d3.svg.axis().scale(y2)
	.orient("left").ticks(5); 
// Adds the svg canvas


// Get the data
var brushedIn;
var brushedOut;
var dataBase=[];
var data2=[];
var dates=[];
var dataAll=[];		
var csver;	 
var dataBase2=[];
var svgTrend;
var titleTool = d3.select("#titler")
    .attr("class", "titleBar")   
    ;
var moduleTool = d3.select("#moduleSpacer")
    .attr("class", "refreshModule")   
    ;

dataCollectionSatellite(10);

function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (Math.min(high1,Math.max(value,low1)) - low1) / (high1 - low1);
};

function dataCollectionSatellite(modulor){
	console.log("dataCollection");
	svgTrend = d3.select("#scatterPlot")
		.append("svg")
			.attr("class","therealliang")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
		.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	d3.text("data/ship_data_41024_v2.csv", function(error,data) {
		
		dataAll=d3.csv.parseRows(data);
		
		var dataBase=[];

		dataAll.forEach(function(j,k) {	
			if(k>0&&k%modulor==0){
				dataBase.push(dataAll[k]);
			}
		});
		//console.log(dataAll[0])
		//console.log(dataAll[1])
		
		titleTool


		dataBase.forEach(function(d,i) {	
			
		
			d.design_id		= +dataBase[i][0];
			d.L				= +dataBase[i][1];
			d.B   		 	= +dataBase[i][2];
			d.D				= +dataBase[i][3];
			d.crane			= +dataBase[i][4];
			d.pob			= +dataBase[i][5];
			d.power			= (+dataBase[i][6])/1000;
			d.lwi			= +dataBase[i][7];
			if(+dataBase[i][8]==0) {d.mp='No';} else {d.mp='Yes';};
			if(+dataBase[i][9]==0) {d.fuel='MGO';} else {d.fuel='Dual';};
			if(+dataBase[i][10]==0) {d.rov='No';} else {d.rov='Yes';};
			if(+dataBase[i][11]==0) {d.dp='No';} else {d.dp='Yes';};
			if(+dataBase[i][12]==0) {d.pc='No';} else {d.pc='Yes';};
			//d.mp			= +dataBase[i][8];
			//d.fuel			= +dataBase[i][9];
			//d.rov			= +dataBase[i][10];
			//d.dp			= +dataBase[i][11];
			//d.pc			= +dataBase[i][12];
			d.dfc			= +dataBase[i][13];
			d.eco_friend	= (+dataBase[i][14]).toFixed(2);;
			d.cost			= Math.round(+dataBase[i][15]*10)/10;
			d.close			= +dataBase[i][16];
			d.between		= +dataBase[i][17];
			d.modularity	= +dataBase[i][18];
			d.outdegree		= +dataBase[i][19];
			
			d.fpn1	= +dataBase[i][20];
			d.fpn2	= +dataBase[i][21];
			d.fpn3	= +dataBase[i][22];
			d.fpn4	= +dataBase[i][23];
			d.fpn5	= +dataBase[i][24];
			d.fpn6	= +dataBase[i][25];
			d.fpn7	= +dataBase[i][26];
			d.fpn8	= +dataBase[i][27];
			d.fpn9	= +dataBase[i][28];
			d.fpn10	= +dataBase[i][29];
			
			d.fpn11	= +dataBase[i][30];
			d.fpn12	= +dataBase[i][31];
			d.fpn13	= +dataBase[i][32];
			d.fpn14	= +dataBase[i][33];
			d.fpn15	= +dataBase[i][34];
			d.fpn16	= +dataBase[i][35];
			d.fpn17	= +dataBase[i][36];
			d.fpn18	= +dataBase[i][37];
			d.fpn19	= +dataBase[i][38];
			d.fpn20	= +dataBase[i][39];
			
			d.fpn21	= +dataBase[i][40];
			d.fpn22	= +dataBase[i][41];
			d.fpn23	= +dataBase[i][42];
			d.fpn24	= +dataBase[i][43];
			d.fpn25	= +dataBase[i][44];
			d.fpn26	= +dataBase[i][45];
			d.fpn27	= +dataBase[i][46];
			d.fpn28	= +dataBase[i][47];
			d.fpn29	= +dataBase[i][48];
			d.fpn30	= +dataBase[i][49];
			
			d.fpn31	= +dataBase[i][50];
			d.fpn32	= +dataBase[i][51];
			d.fpn33	= +dataBase[i][52];
			d.fpn34	= +dataBase[i][53];
			d.fpn35	= +dataBase[i][54];
			d.fpn36	= +dataBase[i][55];
			d.fpn37	= +dataBase[i][56];
			d.fpn38	= +dataBase[i][57];
			d.fpn39	= +dataBase[i][58];
			d.fpn40	= +dataBase[i][59];
			
			d.fpn41	= +dataBase[i][60];
			d.fpn42	= +dataBase[i][61];
			d.fpn43	= +dataBase[i][62];
			d.fpn44	= +dataBase[i][63];
			d.fpn45	= +dataBase[i][64];
			d.fpn46	= +dataBase[i][65];
			d.fpn47	= +dataBase[i][66];
			d.fpn48	= +dataBase[i][67];
			d.fpn49	= +dataBase[i][68];
			d.fpn50	= +dataBase[i][69];
			
			d.fpn51	= +dataBase[i][70];
			d.fpn52	= +dataBase[i][71];
			d.fpn53	= +dataBase[i][72];
			d.fpn54	= +dataBase[i][73];
			d.fpn55	= +dataBase[i][74];
			d.fpn56	= +dataBase[i][75];
			d.fpn57	= +dataBase[i][76];
			d.fpn58	= +dataBase[i][77];
			d.fpn59	= +dataBase[i][78];
			d.fpn60	= +dataBase[i][79];
			
			d.fpn61	= +dataBase[i][80];
			d.fpn62	= +dataBase[i][81];
			d.fpn63	= +dataBase[i][82];
			d.fpn64	= +dataBase[i][83];
			d.fpn65	= +dataBase[i][84];
			d.fpn66	= +dataBase[i][85];
			d.fpn67	= +dataBase[i][86];
			d.fpn68	= +dataBase[i][87];
			d.fpn69	= +dataBase[i][88];
			d.fpn70	= +dataBase[i][89];
			
			d.fpn71	= +dataBase[i][90];
			d.fpn72	= +dataBase[i][91];
			d.fpn73	= +dataBase[i][92];
			d.fpn74	= +dataBase[i][93];
			d.fpn75	= +dataBase[i][94];
			d.fpn76	= +dataBase[i][95];
			d.fpn77	= +dataBase[i][96];
			d.fpn78	= +dataBase[i][97];
			d.fpn79	= +dataBase[i][98];
			d.fpn80	= +dataBase[i][99];
			
			d.fpn81	= +dataBase[i][100];
			d.fpn82	= +dataBase[i][101];
			d.fpn83	= +dataBase[i][102];
			d.fpn84	= +dataBase[i][103];
			d.fpn85	= +dataBase[i][104];
			d.fpn86	= +dataBase[i][105];
			d.fpn87	= +dataBase[i][106];
			d.fpn88	= +dataBase[i][107];
			d.fpn89	= +dataBase[i][108];
			d.fpn90	= +dataBase[i][109];
			
			d.fpn91	= +dataBase[i][110];
			d.fpn92	= +dataBase[i][111];
			d.fpn93	= +dataBase[i][112];
			d.fpn94	= +dataBase[i][113];
			d.fpn95	= +dataBase[i][114];
			d.fpn96	= +dataBase[i][115];
			
			d.mau1	= +dataBase[i][116];
			d.mau2	= +dataBase[i][117];
			d.mau3	= +dataBase[i][118];
			d.mau4	= +dataBase[i][119];
			d.mau5	= +dataBase[i][120];
			d.mau6	= +dataBase[i][121];
			d.mau7	= +dataBase[i][122];
			d.mau8	= +dataBase[i][123];
			d.mau9	= +dataBase[i][124];
			d.mau10	= +dataBase[i][125];
			
			d.mau11	= +dataBase[i][126];
			d.mau12	= +dataBase[i][127];
			d.mau13	= +dataBase[i][128];
			d.mau14	= +dataBase[i][129];
			d.mau15	= +dataBase[i][130];
			d.mau16	= +dataBase[i][131];
			d.mau17	= +dataBase[i][132];
			d.mau18	= +dataBase[i][133];
			d.mau19	= +dataBase[i][134];
			d.mau20	= +dataBase[i][135];
			
			d.mau21	= +dataBase[i][136];
			d.mau22	= +dataBase[i][137];
			d.mau23	= +dataBase[i][138];
			d.mau24	= +dataBase[i][139];
			d.mau25	= +dataBase[i][140];
			d.mau26	= +dataBase[i][141];
			d.mau27	= +dataBase[i][142];
			d.mau28	= +dataBase[i][143];
			d.mau29	= +dataBase[i][144];
			d.mau30	= +dataBase[i][145];
			
			d.mau31	= +dataBase[i][146];
			d.mau32	= +dataBase[i][147];
			d.mau33	= +dataBase[i][148];
			d.mau34	= +dataBase[i][149];
			d.mau35	= +dataBase[i][150];
			d.mau36	= +dataBase[i][151];
			d.mau37	= +dataBase[i][152];
			d.mau38	= +dataBase[i][153];
			d.mau39	= +dataBase[i][154];
			d.mau40	= +dataBase[i][155];
			
			d.mau41	= +dataBase[i][156];
			d.mau42	= +dataBase[i][157];
			d.mau43	= +dataBase[i][158];
			d.mau44	= +dataBase[i][159];
			d.mau45	= +dataBase[i][160];
			d.mau46	= +dataBase[i][161];
			d.mau47	= +dataBase[i][162];
			d.mau48	= +dataBase[i][163];
			d.mau49	= +dataBase[i][164];
			d.mau50	= +dataBase[i][165];
			
			d.mau51	= +dataBase[i][166];
			d.mau52	= +dataBase[i][167];
			d.mau53	= +dataBase[i][168];
			d.mau54	= +dataBase[i][169];
			d.mau55	= +dataBase[i][170];
			d.mau56	= +dataBase[i][171];
			d.mau57	= +dataBase[i][172];
			d.mau58	= +dataBase[i][173];
			d.mau59	= +dataBase[i][174];
			d.mau60	= +dataBase[i][175];
			
			d.mau61	= +dataBase[i][176];
			d.mau62	= +dataBase[i][177];
			d.mau63	= +dataBase[i][178];
			d.mau64	= +dataBase[i][179];
			d.mau65	= +dataBase[i][180];
			d.mau66	= +dataBase[i][181];
			d.mau67	= +dataBase[i][182];
			d.mau68	= +dataBase[i][183];
			d.mau69	= +dataBase[i][184];
			d.mau70	= +dataBase[i][185];
			
			d.mau71	= +dataBase[i][186];
			d.mau72	= +dataBase[i][187];
			d.mau73	= +dataBase[i][188];
			d.mau74	= +dataBase[i][189];
			d.mau75	= +dataBase[i][190];
			d.mau76	= +dataBase[i][191];
			d.mau77	= +dataBase[i][192];
			d.mau78	= +dataBase[i][193];
			d.mau79	= +dataBase[i][194];
			d.mau80	= +dataBase[i][195];
			
			d.mau81	= +dataBase[i][196];
			d.mau82	= +dataBase[i][197];
			d.mau83	= +dataBase[i][198];
			d.mau84	= +dataBase[i][199];
			d.mau85	= +dataBase[i][200];
			d.mau86	= +dataBase[i][201];
			d.mau87	= +dataBase[i][202];
			d.mau88	= +dataBase[i][203];
			d.mau89	= +dataBase[i][204];
			d.mau90	= +dataBase[i][205];
			
			d.mau91	= +dataBase[i][206];
			d.mau92	= +dataBase[i][207];
			d.mau93	= +dataBase[i][208];
			d.mau94	= +dataBase[i][209];
			d.mau95	= +dataBase[i][210];
			d.mau96	= +dataBase[i][211];
			
			d.light_weight_ship	= +dataBase[i][212];
			d.deck_area			= Math.round(+dataBase[i][213]);
			d.ship_depth		= +dataBase[i][214];	
			d.dead_weight		= Math.round(+dataBase[i][215]);
			d.weight_hull		= +dataBase[i][216];
			d.max_speed			= Math.round(+dataBase[i][217]*10)/10;
			d.max_sea_state		= +dataBase[i][218];
			d.cost_acq			= +dataBase[i][219];
			d.resistance		= +dataBase[i][220];
			d.cost_hull			= +dataBase[i][221];
			
			d.efficiency		= +dataBase[i][222];
   
			 //Math.round(num * 100) / 100		
			 objectify={"ID":d.design_id,
					   "L":d.L,
					   "B":d.B,
					   "D":d.D,
					   "Crane":d.crane,
					   "POB":d.pob,
					   "Power":d.power,
					   "LWI":d.lwi,
					   "MP":d.mp,
					   "Fuel":d.fuel,
					   "ROV":d.rov,
					   "DP":d.dp,
					   "PC":d.pc,
					   "DFC":d.dfc,
					   "Max Speed":d.max_speed,
					   "Deck Area":d.deck_area,
					   "Dead Weight":d.dead_weight,
					   "Eco Score":d.eco_friend,
					   "Cost":d.cost,
					   "MAU":d.mau1,
					   "FPN":d.fpn1,
					   "Efficiency":(1-d.fpn1)
					   };
			  		
			allObjects.push(objectify);
			

		});

		updateTable(allObjects);
		parcoordRun();
		plotTrend(allObjects,allObjects,categories);
	});


}


var brushees=allObjects;
var new_brushees = brushees;
var tracked_dots = [];

function renegotiateRadius(runner){
	
	function curry(runner){
		if(curRad!="repeat"){
			curRad=[runner];
		}
		else{
			curRad=undefined;
		}
	}
	function checkRepeat(runner){
		if(curRad!=undefined){	
			if(curRad[0]==runner){
				curRad="repeat";
			}
		}
	}
		
	$.when(checkRepeat(runner)).done(function(){	
		$.when(curry(runner)).done(function(){
				plotUpdate(allObjects,brushees,0);
		});			
	});
	
}

	
function renegotiateColor(runner){
	// console.log(parcoords.color());
	
	function curry(runner){
		if(curCol!="repeat"){
			curCol=[runner];
		}
		else{
			curCol=undefined;
		}
	}
	function checkRepeat(runner){
		if(curCol!=undefined){	
			if(curCol[0]==runner){
				curCol="repeat";
			}
		}
	}
		
	$.when(checkRepeat(runner)).done(function(){	
		$.when(curry(runner)).done(function(){
			// console.log(curCol);
				plotUpdate(allObjects,brushees,0);
		});			
	});

}	
	

function renegotiateY(runner){
	
	function curry(runner){
		curY=[runner];
	}
	
	$.when(curry(runner)).done(function(){
		// console.log(curY);
		plotUpdate(allObjects,brushees,0);
	});	
}	


function renegotiateX(runner){
	function curry(runner){
		curX=[runner];
	}
	
	$.when(curry(runner)).done(function(){
		//console.log(curX);
		plotUpdate(allObjects,brushees,0);
		// console.log(d3.select)
	});	
}	


function plotTrend(allObjects,brushedObjects,init,brusher){
	console.log("plotTrend");
	//x.domain(d3.extent(allObjects, function(d) { return d.Date; }));
	x.domain(d3.extent(allObjects, function(d) { return d.inclination; }));
	//y.domain((d3.extent(allObjects,function(d){return d[curY[0]];})));
	y.domain(d3.extent(allObjects, function(d) { return d.inclination; }));
	
	xAx=svgTrend.append("g")			
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis)
			;
	xAxText=xAx.append("text")
	      .attr("transform", "translate("+width+",-20)")
	      .attr("y", 6)
	      .attr("dy", ".71em")
	      .style("text-anchor", "end")
	      .text(curX[0])	
			;
	// Add the Y Axis
	yAx=svgTrend.append("g")		
			.attr("class", "y axis")
			.call(yAxis)
			;
	yAxText=yAx.append("text")
	      .attr("transform", "rotate(-90)")
	      .attr("y", 6)
	      .attr("dy", ".71em")
	      .style("text-anchor", "end")
	      .text(curY[0])
      		;
	
	 scatters=svgTrend.append("g")
		.attr("class","sofresh")
		;

	var mainRad=2;

	scatters.append("g")
		.attr("id","tracked_group");

	scattered= 
	 	scatters.append("g")
	 	.attr("id","dots")
	 	.selectAll(".dot")
      .data(brushedObjects)		      
      .enter().append("circle")
      .attr("class", "dot")
      ;
      
	scattered
		      .attr("r", mainRad)
		      .attr("cx", function(d) { 
		      	if(curX=="Date"){		      	
		      		return x(d[curX[0]]);
		      		}	
		      	else{	      	
		      		return x2(d[curX[0]]);
		      		}			  
		      	})
		      .attr("cy", function(d) {
			      		return y(d[curY[0]]);
	      		})
			;
	
	
tooltipper();
}		

function plotScrub(allObjects,brushedObjects,init,brusher){
	console.log("plotScrub");
	function initiate(){
		if(scatters!=undefined){
			scatters.remove();
			scattered.remove();
		}
	}
	$.when(initiate()).done(function(){
	 scatters=svgTrend.append("g")
		.attr("class","sofresh")
		
		;

	scattered = scatters.append("g")
		.selectAll(".dot")
		.data(brushedObjects)	      
		.enter().append("circle")
		.attr("class", "dot");
			
	scattered
		.attr("r", mainRad)
		.attr("cx", function(d) { 
				if(curX=="Date"){		      	
					return x(d[curX[0]]);
				} else {		      	
					return x2(d[curX[0]]);
				}			  
			})
		.attr("cy", function(d) { 
			return y(d[curY[0]]);
			})
		;
	});	
	// console.log(mainRad);
	tooltipper(mainRad);

}	

function tooltipper(mainRad){
	console.log("tooltipper")
var objectifyHighlight={};
	
	//tooltip time
var formatTime = d3.time.format("%B %e");

var divTool = d3.select("body").append("div")   
    .attr("class", "tooltip")               
    .style("opacity", 0)
    ;

   scattered
        .on("click", function(d) { 
        	//console.log(+this.id);
        	var tracked_ids = [];
        	for (ii = 0; ii < tracked_dots.length; ii++) {
        		tracked_ids.push(+tracked_dots[ii].ID);
        	}
        	if(tracked_ids.includes(+this.id)) {
        		var idx = tracked_ids.indexOf(+this.id);
        		tracked_dots.splice(idx,1); // got it already so remove
        	} else {
        		tracked_dots.push(allObjects[(+this.id-1)]); //this is new
        	}

        	//tracked_dots.push(allObjects[(+this.id-1)]);
        	//console.log(tracked_dots);
        	//updateEpochData(allObjects, brushees, tracked_dots);
        	updateTrackedDots(tracked_dots,0);      
        	
        	
        })
        .on("mouseover", function(d) {
        	
        	fullList=[];
        	objectifyHighlight={};      	   
        	scattered.transition()
        		.duration(200)
        		.style("stroke",function(q){if (q==d){return "black";}else{return "none";}})
        		.style("stroke-width",function(q){if (q==d){return 5;}else{return 0;}})
        		// .attr("r",function(q){if (q==d){toolhover=d3.select(this).attr("r");return 8;}else{return d3.select(this).attr("r");}})
        		; 
            divTool.transition()        
                .duration(200)      
                .style("opacity", .85);    
            
            var finderX,finderY,finderRad,finderCol;
 			
 			var allNames=parcoords.dimensions();
            for(var i=0;i<parcoords.dimensions().length;i++){
            	fullList.push(d[parcoords.dimensions()[i]]);	
            	if(allNames[i]==curX[0]){finderX=i;}
            	if(allNames[i]==curY[0]){finderY=i;}
            	if(curRad!=undefined){
            		if(allNames[i]==curRad[0]){finderRad=i;}
            	}
            	if(curCol!=undefined){
            		if(allNames[i]==curCol[0]){finderCol=i;}
            	}
            	// allNames.push(d[parcoords.dimensions()]);
			} ;
			// console.log(allObjects);
			
			for(var i=0;i<fullList.length;i++){
				var newFieldName=parcoords.dimensions()[i];
				var newFieldValue=d[parcoords.dimensions()[i]];
				// console.log(newFieldName);
				// console.log(parcoords.dimensions());
				// console.log(newFieldValue);
				objectifyHighlight[newFieldName]=newFieldValue;
			}
			// console.log(objectifyHighlight);
		
			// for(var i=0;i<fullList.length;i++){
				// var newFieldName=Object.keys(objectify)[i];
				// var newFieldValue=fullList[i];
				// objectifyHighlight[newFieldName]=newFieldValue;
			// }
			
			
			
			// console.log(objectifyHighlight);
			// console.log(allObjects);
			// console.log(objectify);
			
			            parcoords.highlight([objectifyHighlight]);
			            parcoords.render();
//      

            // console.log(unitList[finderCol]);
            // console.log(allNames);
            // console.log(fullList);
            // d3.selectAll(".axisValue")
            	// .text(fullList)
            	// ;
            	
           //update parcoords axes
            d3.selectAll(".axisValue").text(function(d,i){
            	if(i==1000){
            		console.log(fullList[i])
            		return formatTime(fullList[i])+" "+unitList[i];
            	}
            	else{
            		//console.log('bar')
	            	return fullList[i]+" "+unitList[i];
            	}
        	});
            
            //format date vs not formatting date
            if(curX[0]=="Date"){var newCurX=formatTime(d[curX[0]]);}  else{var newCurX=d[curX[0]]+" " +unitList[finderX];}
            if(curY[0]=="Date"){var newCurY=formatTime(d[curY[0]]);}  else{var newCurY=d[curY[0]]+" " +unitList[finderY];}
            if(curRad!=undefined){if(curRad[0]=="Date"){var newCurRad=formatTime(d[curRad[0]]);}  else{var newCurRad=d[curRad[0]]+" " +unitList[finderRad];}}
            if(curCol!=undefined){if(curCol[0]=="Date"){var newCurCol=formatTime(d[curCol[0]]);}  else{var newCurCol=d[curCol[0]]+" " +unitList[finderCol];}}
            
            if(curCol!=undefined && curRad!=undefined){
	            divTool.html(
	            	curX[0]+" (X): "+newCurX + "<br/>"  + 
					curY[0]+" (Y): "+newCurY + "<br/>"  + 
					curRad[0]+" (Radius): "+newCurRad + "<br/>"  + 
					curCol[0]+" (Color): "+newCurCol
	            	) 
	            	.style("left", (d3.event.pageX+10) + "px")     
	                .style("top", (d3.event.pageY - 0) + "px"); 
            }
            
            if(curCol!=undefined && curRad==undefined){
	            divTool.html(
	            	curX[0]+" (X): "+newCurX + "<br/>"  + 
					curY[0]+" (Y): "+newCurY + "<br/>"  + 
					curCol[0]+" (Color): "+newCurCol
	            	) 
	            	.style("left", (d3.event.pageX+10) + "px")     
	                .style("top", (d3.event.pageY - 0) + "px"); 
            }
            
            if(curCol==undefined && curRad!=undefined){
	            divTool.html(
	            	curX[0]+" (X): "+newCurX + "<br/>"  + 
					curY[0]+" (Y): "+newCurY + "<br/>"  + 
					curRad[0]+" (Radius): "+newCurRad
	            	) 
	            	.style("left", (d3.event.pageX+10) + "px")     
	                .style("top", (d3.event.pageY - 0) + "px"); 
            }
            
             if(curCol==undefined && curRad==undefined){
	            divTool.html(
	            	curX[0]+" (X): "+newCurX + "<br/>"  + 
					curY[0]+" (Y): "+newCurY
	            	) 
	            	.style("left", (d3.event.pageX+10) + "px")     
	                .style("top", (d3.event.pageY - 0) + "px"); 
            }
            
            	 
                   
            

            
            })    
                          
        .on("mouseout", function(d) {   
        	d3.selectAll(".axisValue").text("");   
        	 parcoords.unhighlight([objectifyHighlight]);
            divTool.transition()        
                .duration(500)      
                .style("opacity", 0);   
            scattered.transition()
            	.duration(500) 
            	.style("stroke-width",0)
            	;
            	// .attr("r",function(q){if (q==d){return toolhover;}else{return d3.select(this).attr("r");}})
        });
//tooltip time 



plotUpdate(allObjects,brushees,1);
}

function plotUpdate(allObjects,brushedObjects,brusher){
	console.log("plotUpdate");
	//updateTable(brushedObjects);
	
	if(brusher==1){
		transDur=0;
	}
	else{
		transDur=transBack;
	}
	function initiate(){

		if(scatters!=undefined){
			// scatters.remove();
			if(xAx!=undefined){
				xAx.remove();
			}
			if(yAx!=undefined){
				yAx.remove();
			}
		}
	}
	
	$.when(initiate()).done(function(){
	
	if(curX=="Date"){
		x.domain((d3.extent(allObjects,function(d){return d[curX[0]];})));
		
		xAx=svgTrend.append("g")			
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis)
			;
		xAxText=xAx.append("text")
			   .attr("transform", "translate("+width+",-20)")
			      .attr("y", 6)
			      .attr("dy", ".71em")
			      .style("text-anchor", "end")
			      .text(curX[0])	
			      ;
	}
	
	else{
		x2.domain(d3.extent(allObjects,function(d){return d[curX[0]];}));
		xAx=svgTrend.append("g")			
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis2)
			;
		xAxText=xAx.append("text")
			   .attr("transform", "translate("+width+",-20)")
			      .attr("y", 6)
			      .attr("dy", ".71em")
			      .style("text-anchor", "end")
			      .text(curX[0])	
			      ;
			
	}
	if(curY=="Date"){
		y2.domain((d3.extent(allObjects,function(d){return d[curY[0]];})));
		yAx=svgTrend.append("g")			
			.attr("class", "y axis")
			// .attr("transform", "translate(0," + height + ")")
			.call(yAxis2)
	      		;
  		yAxText=yAx.append("text")
	      .attr("transform", "rotate(-90)")
	      .attr("y", 6)
	      .attr("dy", ".71em")
	      .style("text-anchor", "end")
	      .text(curY[0])
      		;
		// console.log(curY[0]);
	}
	else{
		y.domain((d3.extent(allObjects,function(d){return d[curY[0]];})));
		yAx=svgTrend.append("g")			
			.attr("class", "y axis")

			.call(yAxis)
	      		;
  		yAxText=yAx.append("text")
	      .attr("transform", "rotate(-90)")
	      .attr("y", 6)
	      .attr("dy", ".71em")
	      .style("text-anchor", "end")
	      .text(curY[0])
      		;
	}	  
	
	if (curRad!=undefined){
		// Store unique values of this variable in levels if variable is a string rather than a number
		// Create an interger mapping and store in string_rad_map
		if(typeof(allObjects[0][curRad[0]])=='string') {
			var  levels = allObjects.map(function(obj) { return obj[curRad[0]]; });
			levels = levels.filter(function(v,i) { return levels.indexOf(v) == i; });
			string_rad_map =  {};
			for (var ii = 0; ii < levels.length; ii++) { 
	    		string_rad_map[levels[ii]] = ii;
			}
		}
	}
	
	if (curCol!=undefined){
		// Store unique values of this variable in levels if variable is a string rather than a number
		// Create an interger mapping and store in string_col_map
		if(typeof(allObjects[0][curCol[0]])=='string') {
			var  levels = allObjects.map(function(obj) { return obj[curCol[0]]; });
			levels = levels.filter(function(v,i) { return levels.indexOf(v) == i; });
			string_col_map =  {};
			for (var ii = 0; ii < levels.length; ii++) { 
	    		string_col_map[levels[ii]] = ii;
	    		//console.log(string_col_map);
			}
			//console.log(string_col_map);
		}
	}
	
	if(curRad!=undefined){
		//radScale.domain((d3.extent(allObjects,function(d){return d[curRad[0]];})));
		radScale.domain((d3.extent(allObjects, function(d){ return typeof( d[curRad[0]])=='number' ? d[curRad[0]] : string_rad_map[d[curRad[0]]]; } )));
	};

	if (curCol!=undefined){
		
		//colMin=d3.max(allObjects,function(d){return d[curCol[0]];});
		//colMax=d3.max(allObjects,function(d){return d[curCol[0]];});
		colMin=d3.min(allObjects,function(d){return typeof( d[curCol[0]])=='number' ? d[curCol[0]] : string_col_map[d[curCol[0]]];});
		colMax=d3.max(allObjects,function(d){return typeof( d[curCol[0]])=='number' ? d[curCol[0]] : string_col_map[d[curCol[0]]];});
		// colorScale.domain([colMin,colMin+(colMax-colMin)/5,colMin+(colMax-colMin)/4,colMin+(colMax-colMin)/3,colMin+(colMax-colMin)/2,colMax]);
		colorScale.domain([colMin,colMax]);
		//typeof( d[curCol[0]])=='number' ? colorScale(d[curCol[0]]) : colorScale(0);});
		//typeof(d[curCol[0]])=='number' ? d[curCol[0]] : string_col_map[d[curCol[0]]];
		
		
		parcolor=function(d) { 
	      	return colorScale( typeof(d[curCol[0]])=='number' ? d[curCol[0]] : string_col_map[d[curCol[0]]] );
	      	//return colorScale(d[curCol[0]]);
	      	};
	    parcoords.color(parcolor);
	}
	else{
		parcolor="black";
		parcoords.color(parcolor);
	};


	// colorScale.domain([colMin,colMax]);  
	scatters=svgTrend.append("g")
		.attr("class","sofresh");
	

	scattered
		.transition().duration(transDur)
		.style("blend-mode","multiply")
		.attr("id", function(d) { return d.ID.toString();})
		.style("fill", function(d) { 
				if(curCol!=undefined){
					return colorScale( typeof(d[curCol[0]])=='number' ? d[curCol[0]] : string_col_map[d[curCol[0]]] );
				} else {
					return "black";
				}
			})
		.attr("r", function(d) {
				if(curRad!=undefined){
					return radScale( typeof(d[curRad[0]])=='number' ? d[curRad[0]] : string_rad_map[d[curRad[0]]] );	 
				} else if(curRad==undefined) {
					return mainRad;
				}	      	
			})   
		.attr("cx", function(d) { 
				if(curX=="Date"){		      	
					return x(d[curX[0]]);
				} else {		      	
					return x2(d[curX[0]]);
				}			  
			})
		.attr("cy", function(d) { 
				if(curY=="Date"){		      	
					return y2(d[curY[0]]);
				} else {
					/* FIXME - this is to make sure MAU values that are NaN do not appear in scatter */
		      		//console.log(d[curY[0]])
		      		if( !isNaN(d[curY[0]]) ){return y(d[curY[0]]);}
		      		else {return 1000;}      	
		      		//return y(d[curY[0]]);
				}			  
			})
		;
	
	});	
}		



		
function parcoordRun(){
	console.log("parcoorRun")
	parcoords = d3.parcoords()("#parc")
		.width(mainWidth)
		.height(mainHeight)
    	// .color("black")
    	// .alpha(.05);
	;

	function checker(){
	}
	parcoords
		.data(allObjects)  
		.alpha(.05)
		//.margin({ top: 50, right: 0, bottom: 65, left: 0 }) 	
		.lineWidth(.01)
		.color("black")
		.render()
		.shadows()
		.interactive()
		.brushable()
		.reorderable() 
		.on("brush", function(items) {
			var newAlpha=(map_range(parcoords.brushed().length,0,500,1,.25));
			var newStroke=map_range(parcoords.brushed().length,0,500,.35,.15);
			parcoords.lineWidth(newStroke);
			parcoords.alpha(newAlpha);
			brushees=parcoords.brushed();
			plotScrub(allObjects,parcoords.brushed());
			//updateEpochData(allObjects, brushees, tracked_dots); // FIXME - MDC added 01/18/2017 
    	})  
    	
    // console.log(parcoords.state);
    //console.log(parcoords.types())

};



// CSV Uploader
var uploader = document.getElementById("uploader");  
var reader = new FileReader();
var loadSeattle = document.getElementById("loadSeattle");  
reader.onload = function(e) {
  contents = e.target.result;
  dataCollection(contents,1);
  // var data = d3.csv.parse(contents);
  // parallelCoordinates(data);

  // remove button, since re-initializing doesn't work for now
  uploader.parentNode.removeChild(uploader);
  loadSeattle.parentNode.removeChild(loadSeattle);
};


// 
// 
// loadSeattle.addEventListener("click", handleSeattle, false);  
// uploader.addEventListener("change", handleFiles, false);  

function handleFiles() {
   d3.select("#uploader")
	// .append("svg")
	.transition().duration(transDur)
		.style("height", "0px")
		// .attr("height", height + margin.top + margin.bottom)
		;
  d3.select("#scatterPlot")
	// .append("svg")
	.transition().duration(transDur)
		.style("margin-left", "250px")
		// .style("height", "550px")
		// .attr("height", height + margin.top + margin.bottom)
		;
  d3.select("#parc")
	// .append("svg")
	.transition().duration(transDur)
		.style("margin-left", "250px")
		.style("margin-top", "0px")
		// .attr("height", height + margin.top + margin.bottom)
		;
  d3.select(".titleBarMain")
	// .append("svg")
	.transition().duration(transDur)
		.style("margin-left", "0px")
		// .attr("height", height + margin.top + margin.bottom)
		;
 // console.log(this.files);
  var file = this.files[0];
  // console.log(file);
  reader.readAsText(file);
};

$.ajax({
	type: 'GET',
	url: 'data/ship_data_41024_v2.csv',
	success: function(data) {
		dataBase = d3.csv.parseRows(data);
	},
	error: function(data) {console.log('ajax error');},
	dataType: 'text'
});