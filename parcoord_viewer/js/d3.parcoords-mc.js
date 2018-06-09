d3.parcoords = function(config) {

  var __ = {
    data: [],
    dimensions: [],
    dimensionTitles: {},
    types: {},
    brushed: false,
    mode: "default",
    rate: 20,
    width: 520,
    height: 300,
    margin: { top: 36, right: 25, bottom: 80, left: 0 },
    color: "#069",
    composite: "source-over",
    alpha: 0.7,
    lineWidth: 0.2
  };

  extend(__, config);
  

var axisValue,axisTitle;
var pc = function(selection) {
  selection = pc.selection = d3.select(selection);

  __.width = selection[0][0].clientWidth;
  __.height = selection[0][0].clientHeight;

  // canvas data layers
  ["shadows", "marks", "foreground", "highlight"].forEach(function(layer) {
    canvas[layer] = selection
      .append("canvas")
      .attr("class", layer)[0][0];
    ctx[layer] = canvas[layer].getContext("2d");
  });

  // svg tick and brush layers
  pc.svg = selection
    .append("svg")
      .attr("width", __.width)
      .attr("height", __.height)
    .append("svg:g")
      .attr("transform", "translate(" + __.margin.left + "," + __.margin.top + ")");

  return pc;
};
var events = d3.dispatch.apply(this,["render", "resize", "highlight", "brush"].concat(d3.keys(__))),
    w = function() { return __.width - __.margin.right - __.margin.left; },
    h = function() { return __.height - __.margin.top - __.margin.bottom; },
    flags = {
      brushable: false,
      reorderable: false,
      axes: false,
      interactive: false,
      shadows: false,
      debug: false
    },
    xscale = d3.scale.ordinal(),
    yscale = {},
    dragging = {},
    line = d3.svg.line(),
    axis = d3.svg.axis().orient("left").ticks(5),
    g, // groups for axes, brushes
    ctx = {},
    canvas = {};

// side effects for setters
var side_effects = d3.dispatch.apply(this,d3.keys(__))
  .on("composite", function(d) { ctx.foreground.globalCompositeOperation = d.value; })
  .on("alpha", function(d) { ctx.foreground.globalAlpha = d.value; })
  .on("lineWidth", function(d) { ctx.foreground.lineWidth = d.value; })
  .on("width", function(d) { pc.resize(); })
  .on("height", function(d) { pc.resize(); })
  .on("margin", function(d) { pc.resize(); })
  .on("rate", function(d) { rqueue.rate(d.value); })
  .on("data", function(d) {
    if (flags.shadows) paths(__.data, ctx.shadows);
  })
  .on("dimensions", function(d) {
    xscale.domain(__.dimensions);
    if (flags.interactive) pc.render().updateAxes();
  });

// expose the state of the chart
pc.state = __;
pc.flags = flags;

// create getter/setters
getset(pc, __, events);

// expose events
d3.rebind(pc, events, "on");

// tick formatting
d3.rebind(pc, axis, "ticks", "orient", "tickValues", "tickSubdivide", "tickSize", "tickPadding", "tickFormat");

// getter/setter with event firing
function getset(obj,state,events)  {
  d3.keys(state).forEach(function(key) {
    obj[key] = function(x) {
      if (!arguments.length) return state[key];
      var old = state[key];
      state[key] = x;
      side_effects[key].call(pc,{"value": x, "previous": old});
      events[key].call(pc,{"value": x, "previous": old});
      return obj;
    };
  });
};

function extend(target, source) {
  for (key in source) {
    target[key] = source[key];
  }
  return target;
};
pc.autoscale = function() {
  // yscale
  var defaultScales = {
    "date": function(k) {
      return d3.time.scale()
        .domain(d3.extent(__.data, function(d) {
          return d[k] ? d[k].getTime() : null;
        }))
        .range([h()+1, 1])
        ;
    },
    "number": function(k) {
      return d3.scale.linear()
        .domain(d3.extent(__.data, function(d) { return +d[k]; }))
        .range([h()+1, 1])
        ;
    },

    "string": function(k) {
      return d3.scale.ordinal()
        .domain(__.data.map(function(p) { return p[k]; }))
        .rangePoints([h()+1, 1])
        ;
    }
  };

  __.dimensions.forEach(function(k) {
    yscale[k] = defaultScales[__.types[k]](k);
  });
	

  // hack to remove ordinal dimensions with many values
  pc.dimensions(pc.dimensions().filter(function(p,i) {
    var uniques = yscale[p].domain().length;
    if (__.types[p] == "string" && (uniques > 60 || uniques < 2)) {
      return false;
    }
    return true;
  }));

  // xscale
  xscale.rangePoints([0, w()], 1);

  // canvas sizes
  pc.selection.selectAll("canvas")
      .style("margin-top", __.margin.top + "px")
      .style("margin-left", __.margin.left + "px")
      .attr("width", w()+2)
      .attr("height", h()+2)
      ;

  // default styles, needs to be set when canvas width changes
  ctx.foreground.strokeStyle = __.color;
  ctx.foreground.lineWidth = .45;
  ctx.foreground.globalCompositeOperation = __.composite;
  ctx.foreground.globalAlpha = __.alpha;
  ctx.highlight.lineWidth = 0;
  ctx.shadows.strokeStyle = "#EDEDED";
  ctx.shadows.lineWidth = 0.25;

  

  return this;
};

pc.detectDimensions = function() {
  pc.types(pc.detectDimensionTypes(__.data));
  pc.dimensions(d3.keys(pc.types()));
  return this;
};

// a better "typeof" from this post: http://stackoverflow.com/questions/7390426/better-way-to-get-type-of-a-javascript-variable
pc.toType = function(v) {
  return ({}).toString.call(v).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
  ;
};

// try to coerce to number before returning type
pc.toTypeCoerceNumbers = function(v) {
  if ((parseFloat(v) == v) && (v != null)) return "number";
  return pc.toType(v);
};

// attempt to determine types of each dimension based on first row of data
pc.detectDimensionTypes = function(data) {
  var types = {};
  d3.keys(data[0])
    .forEach(function(col) {
      types[col] = pc.toTypeCoerceNumbers(data[0][col]);
    });
    console.log(types)
  return types;
};

pc.render = function() {
  // try to autodetect dimensions and create scales
  console.log("foo")
  console.log(!__.dimensions.length)
  if (!__.dimensions.length) pc.detectDimensions();
  if (!(__.dimensions[0] in yscale)) pc.autoscale();

  pc.render[__.mode]();

  events.render.call(this);
  return this;
};

pc.render.default = function() {
  pc.clear('foreground');
  if (__.brushed) {
    __.brushed.forEach(path_foreground);
  } else {
    __.data.forEach(path_foreground);
  }
};

var rqueue = d3.renderQueue(path_foreground)
  .rate(50)
  .clear(function() { pc.clear('foreground'); });

pc.render.queue = function() {
  if (__.brushed) {
    rqueue(__.brushed);
  } else {
    rqueue(__.data);
  }
};
pc.shadows = function() {
  flags.shadows = true;
  if (__.data.length > 0) paths(__.data, ctx.shadows);
  return this;
};

// draw little dots on the axis line where data intersects
pc.axisDots = function() {
  var ctx = pc.ctx.marks;
  ctx.globalAlpha = d3.min([1/Math.pow(data.length, 1/2), 1]);
  __.data.forEach(function(d) {
    __.dimensions.map(function(p,i) {
      ctx.fillRect(position(p)-0.75,yscale[p](d[p])-0.75,1.5,1.5);
    });
  });
  return this;
};

// draw single polyline
function color_path(d, ctx) {
  ctx.strokeStyle = d3.functor(__.color)(d);
  ctx.beginPath();
  __.dimensions.map(function(p,i) {
    if (i == 0) {
      ctx.moveTo(position(p),yscale[p](d[p]));
    } else {
      ctx.lineTo(position(p),yscale[p](d[p]));
    }
  });
  ctx.stroke();
};

// draw many polylines of the same color
function paths(data, ctx) {
  ctx.clearRect(-1,-1,w()+2,h()+2);
  ctx.beginPath();
  data.forEach(function(d) {
    __.dimensions.map(function(p,i) {
      if (i == 0) {
        ctx.moveTo(position(p),yscale[p](d[p]));
      } else {
        ctx.lineTo(position(p),yscale[p](d[p]));
      }
    });
  });
  ctx.stroke();
};

function path_foreground(d) {
  return color_path(d, ctx.foreground);
};

function path_highlight(d) {
  return color_path(d, ctx.highlight);
};
pc.clear = function(layer) {
  ctx[layer].clearRect(0,0,w()+2,h()+2);
  return this;
};
/*
pc.createAxes = function() {
  if (g) pc.removeAxes();

  // Add a group element for each dimension.
  
  g = pc.svg.selectAll(".dimension")
      .data(__.dimensions, function(d) { return d; })
    .enter().append("svg:g")
      .attr("class", "dimension")
      .attr("transform", function(d) { return "translate(" + xscale(d) + ")"; })
	;
  // Add an axis and title.
  var newAxis=g.append("svg:g")
      .attr("class", "axis")
      .attr("transform", "translate(0,0)")
      .each(function(d) { d3.select(this).call(axis.scale(yscale[d])); })
      ;
      
   axisValue=newAxis.append("svg:text")
      .attr({
        "text-anchor": "middle",
        "y": 0,
        "transform": "translate(0,-12)",
        "x": 0,
        "class": "axisValue"
      })
      // .text(function(d) {
        // return d in __.dimensionTitles ? __.dimensionTitles[d] : d;  // dimension display names
      // })  
      ;
      
      
   axisTitle=newAxis.append("svg:text")
      .attr({
        "text-anchor": "middle",
        "y": 0,
        "transform": "translate(0,-24)",
        "x": 0,
        "class": "axisTitle"
      })
      .text(function(d) {
        return d in __.dimensionTitles ? __.dimensionTitles[d] : d;  // dimension display names
      })  ;

      
 /*     
   var clickedX=[];  var initX=1;
   var jumper=65;   
   var nodeJump=__.height-jumper;
   var nodeJump2=__.height-jumper*.65;
   // console.log(nodeJump);
    xPicker=g.append("svg:g")
      .append("g")
      .style("fill", function(d){
		      if(curX==d){
		      	// console.log(d);
		      	clickedX[d]=1;
		      	return "black";
		      }
		      else{	      
		      	clickedX[d]=0;
		      	return "#AAAAAA";
		      }
	      }
	      ) 
	      .style("font-weight", function(d){
		      if(curX==d){
		      	return "bold";
		      }
		      else{	      
		      	return "normal";
		      }
	      }
	      ) 
      .attr("transform", "translate(0,"+(nodeJump-25)+")")
      .append("svg:text")
      .attr({
        "text-anchor": "middle",
        "font-size":14,
        "y": 0,
        "x": 0,
        "class": "xOption"
      })
      .text("X")
      .on("mouseover",function(d){
      	xPicker
	      		.style("cursor", "hand")
	      		.style("fill",function(q){
	        		if(q==d){return "black";}
	        		else{return d3.select(this).style("fill");}
	        	})
	        	.style("font-weight",function(q){
	        		if(q==d){return "bold";}
	        		else{return d3.select(this).style("font-weight");}
	        	})
	      		
	  		;
      })
      .on("click",function(d) {
        xPicker
        	.style("fill",function(q){        		
        		if(q==d){clickedX[q]=1;return "black";}
        		else{clickedX[q]=0;return "#AAAAAA";}
        	})
        	.style("font-weight",function(q){        		
        		if(q==d){return "bold";}
        		else{return "normal";}
        	})
        	;
  		renegotiateX(d in __.dimensionTitles ? __.dimensionTitles[d] : d);
        })
        
       .on("mouseout",function(d){
			xPicker
	      		.style("fill",function(q){
	      			if(q=="Date"&&initX==1&&clickedX[q]==0){
	      				// console.log(clickedX["Date"]);
	      				return "#AAAAAA";
	      			}
	      			else{
		        		if(q==d&&clickedX[q]==0){return "#AAAAAA";}
		        		else if(clickedX[q]==1){return d3.select(this).style("fill");}
	        		}
	        	})
				.style("font-weight",function(q){
					if(q=="Date"&&initX==1&&clickedX[q]==0){
	      				// initX=0;
	      				// console.log(clickedX["Date"]);
	      				return "normal";
	      			}
	      			else{
	        		if(q==d&&clickedX[q]==0){return "normal";}
	        		else if(clickedX[q]==1){return d3.select(this).style("font-weight");}
	        		}
	        	});
      }) 
      ;
*/
/*		
	var clickedY=[];   var initY=1;

      yPicker=g.append("svg:g")
	      .append("g")
	      .attr("transform", "translate(0,"+(nodeJump-7.5)+")")
	      .style("fill", function(d){
		      if(curY==d){
		      	return "black";
		      }
		      else{	      
		      	return "#AAAAAA";
		      }
	      }
	      ) 
	      .style("font-weight", function(d){
		      if(curY==d){
		      	return "bold";
		      }
		      else{	      
		      	return "normal";
		      }
	      }
	      ) 
	      .append("svg:text")
	      
	      // .style("font-weight","normal")
	      .attr({
	        "text-anchor": "middle",
	        "font-size":14,
	        "y": 0,
	        "x": 0,
	        "class": "yOption"
	      })
	      .text("Y")
	      
	      
		  .on("mouseover",function(d){
	      	yPicker
		      		.style("cursor", "hand")
		      		.style("fill",function(q){
		        		if(q==d){return "black";}
		        		else{return d3.select(this).style("fill");}
		        	})
		        	.style("font-weight",function(q){
		        		if(q==d){return "bold";}
		        		else{return d3.select(this).style("font-weight");}
		        	})
		      		
		  		;
	      })
	      .on("click",function(d) {
	        yPicker
	        	.style("fill",function(q){        		
	        		if(q==d){clickedY[q]=1;return "black";}
	        		else{clickedY[q]=0;return "#AAAAAA";}
	        	})
	        	.style("font-weight",function(q){        		
	        		if(q==d){return "bold";}
	        		else{return "normal";}
	        	})
	        	;
	  		renegotiateY(d in __.dimensionTitles ? __.dimensionTitles[d] : d);
	        })
	        
	       .on("mouseout",function(d){
			yPicker
	      		.style("fill",function(q){
	      			if(q=="DryBulb"&&initY==1&&clickedY[q]==0){
	      				return "#AAAAAA";
	      			}
	      			else{
		        		if(q==d&&clickedY[q]==0){return "#AAAAAA";}
		        		else if(clickedY[q]==1){return d3.select(this).style("fill");}
	        		}
	        	})
				.style("font-weight",function(q){
					if(q=="DryBulb"&&initY==1&&clickedY[q]==0){
	      				// initX=0;
	      				return "normal";
	      			}
	      			else{
	        		if(q==d&&clickedY[q]==0){return "normal";}
	        		else if(clickedY[q]==1){return d3.select(this).style("font-weight");}
	        		}
	        	});
      })   
      ;
*/
/*    
	var repeaterRect;
   	var justClickedRect=0;  
      
   pickRectangle=g.append("svg:g")
      .attr("class", "colorNode")
      // .attr("transform", "translate(0,"+height/4+")")
      .attr("transform", "translate(0,"+(nodeJump2)+")")
      // .each(function(d) { d3.select(this).call(axis.scale(yscale[d])); })    
      .style("fill","#AAAAAA")      
     // .append("svg:rect")
    	// .attr({
    		// "y": 0,
    		// "x": -5,
    		// "width":10,
    		// "height":10
    		 // })
     .append("svg:text")
	      .style("font-weight","regular")
	      .attr({
	        "text-anchor": "middle",
	        "font-size":10,
	        "y": 0,
	        "x": 0,
	        "class": "yOption"
	      })
	      .text("COLOR")
	      
	      
    .on("mouseover",function(d){
  			pickRectangle
      			.style("cursor", "hand")
      			.style("fill",function(q){
		      		if(q==d){return "black";}
		      		else{
		      			return d3.select(this).style("fill");
		      			}})
		      	;	
  		})
  		
	 .on("click",function(d) {  	
	 	 	pickRectangle
		      	.style("fill",function(q){
		      		if(q==d&&q!=repeaterRect){justClickedRect=1;repeaterRect=q;return "black";}
		      		else if(q==repeaterRect){justClickedRect=0;repeaterRect=undefined;return"#AAAAAA";}
		      		else{return "#AAAAAA";}
	      		});	  
	 	 
	 	 
      		renegotiateColor(d in __.dimensionTitles ? __.dimensionTitles[d] : d);
      		parcoords.render(); 
	        })
	        
	  .on("mouseout",function(d){
  			pickRectangle
      			.style("fill",function(q){
		      		if(q==d){
		      			if(justClickedRect==1||q==repeaterRect){
		      				return "black";
		      			}
		      			else{
		      				return "#AAAAAA";
		      			}
	      			}
		      		else{
		      			return d3.select(this).style("fill");
		      		}});
      			;
      		justClickedRect=0;			
      		})
      ;
*/
/*
   var repeaterCirc;
   var justClickedCirc=0;
     
   pickCircle=g.append("svg:g")
      .attr("class", "radiusNode")
      .style("fill","#AAAAAA")
      // .attr("transform", "translate(0,"+height/4+")")
      .attr("transform", "translate(0,"+(nodeJump+4)+")")
      // .each(function(d) { d3.select(this).call(axis.scale(yscale[d])); })          
     .append("svg:circle")
    	.attr({
    		"cy": 0,
    		"cx": 0,
    		"r":5
    		 })
    .on("mouseover",function(d){
  			pickCircle
      			.style("cursor", "hand")
      			.style("fill",function(q){
		      		if(q==d){return "black";}else{
		      			// return "#AAAAAA";
		      			return d3.select(this).style("fill");
		      			}});
      			;			
      		})
    .on("click",function(d) {  	
    		  
    	    pickCircle
		      	.style("fill",function(q){
		      		if(q==d&&q!=repeaterCirc){justClickedCirc=1;repeaterCirc=q;return "black";}
		      		else if(q==repeaterCirc){justClickedCirc=0;repeaterCirc=undefined;return"#AAAAAA";}
		      		else{return "#AAAAAA";}
	      		});	   
      		renegotiateRadius(d in __.dimensionTitles ? __.dimensionTitles[d] : d);
	        })	
	        
	  .on("mouseout",function(d){
  			pickCircle
      			.style("fill",function(q){
		      		if(q==d){
		      			if(justClickedCirc==1||q==repeaterCirc){
		      				return "black";
		      			}
		      			else{
		      				return "#AAAAAA";
		      			}
	      			}
		      		else{
		      			return d3.select(this).style("fill");
		      		}});
      			;
      		justClickedCirc=0;			
      		})
      ;

      
       
      
      
      
  flags.axes= true;
  return this;
};
*/

pc.removeAxes = function() {
  g.remove();
  return this;
};

pc.updateAxes = function() {
  var g_data = pc.svg.selectAll(".dimension")
      .data(__.dimensions, function(d) { return d; })
      ;

  g_data.enter().append("svg:g")
      .attr("class", "dimension")
      .attr("transform", function(p) { return "translate(" + position(p) + ")"; })
      .style("opacity", 0)
      .append("svg:g")
      .attr("class", "axis")
      .attr("transform", "translate(0,0)")
      .each(function(d) { d3.select(this).call(axis.scale(yscale[d])); })
    .append("svg:text")
      .attr({
        "text-anchor": "middle",
        "y": 0,
        "transform": "translate(0,-12)",
        "x": 0,
        "class": "label"
      })
      .text(String);

  g_data.exit().remove();

  g = pc.svg.selectAll(".dimension");

  g.transition().duration(1100)
    .attr("transform", function(p) { return "translate(" + position(p) + ")"; })
    .style("opacity", 1)
    ;
  if (flags.shadows) paths(__.data, ctx.shadows);
  return this;
};

pc.brushable = function() {
  if (!g) pc.createAxes();

  // Add and store a brush for each axis.
  g.append("svg:g")
      .attr("class", "brush")
      .each(function(d) {
        d3.select(this).call(
          yscale[d].brush = d3.svg.brush()
            .y(yscale[d])
            .on("brushstart", function() {
              d3.event.sourceEvent.stopPropagation();
            })
            .on("brush", pc.brush)
        );
      })
    .selectAll("rect")
      .style("visibility", null)
      .attr("x", -15)
      .attr("width", 30)
      ;
  flags.brushable = true;
  return this;
};

// Jason Davies, http://bl.ocks.org/1341281
pc.reorderable = function() {
  if (!g) pc.createAxes();

  g
  .style("cursor", "move")
    .call(d3.behavior.drag()
      .on("dragstart", function(d) {
        dragging[d] = this.__origin__ = xscale(d);
      })
      .on("drag", function(d) {
        dragging[d] = Math.min(w(), Math.max(0, this.__origin__ += d3.event.dx));
        __.dimensions.sort(function(a, b) { return position(a) - position(b); });
        xscale.domain(__.dimensions);
        pc.render();
        g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
      })
      .on("dragend", function(d) {
        delete this.__origin__;
        delete dragging[d];
        d3.select(this).transition().attr("transform", "translate(" + xscale(d) + ")");
        pc.render();
      }));
  flags.reorderable = true;
  return this;
};

// pairs of adjacent dimensions
pc.adjacent_pairs = function(arr) {
  var ret = [];
  for (var i = 0; i < arr.length-1; i++) {
    ret.push([arr[i],arr[i+1]]);
  };
  return ret;
};
pc.interactive = function() {
  flags.interactive = true;
  return this;
};

// Get data within brushes
pc.brush = function() {
  __.brushed = selected();
  events.brush.call(pc,__.brushed);
  pc.render();
};


// expose a few objects
pc.xscale = xscale;
pc.yscale = yscale;
pc.ctx = ctx;
pc.canvas = canvas;
pc.g = function() { return g; };

pc.brushReset = function(dimension) {
  if (g) {
    g.selectAll('.brush')
      .each(function(d) {
        d3.select(this).call(
          yscale[d].brush.clear()
        );
      })
    pc.brush();

  }
  return this;
};

// rescale for height, width and margins
// TODO currently assumes chart is brushable, and destroys old brushes
pc.resize = function() {
  // selection size
  pc.selection.select("svg")
    .attr("width", __.width)
    .attr("height", __.height)
  pc.svg.attr("transform", "translate(" + __.margin.left + "," + __.margin.top + ")");

  // scales
  pc.autoscale();

  // axes, destroys old brushes. the current brush state should pass through in the future
  if (g) pc.createAxes().brushable();

  events.resize.call(this, {width: __.width, height: __.height, margin: __.margin});
  return this;
};

// highlight an array of data
pc.highlight = function(data) {
  pc.clear("highlight");
  d3.select(canvas.foreground).classed("faded", true);
  data.forEach(path_highlight);
  events.highlight.call(this,data);
  return this;
};

// clear highlighting
pc.unhighlight = function(data) {
  pc.clear("highlight");
  d3.select(canvas.foreground).classed("faded", false);
  return this;
};

// calculate 2d intersection of line a->b with line c->d
// points are objects with x and y properties
pc.intersection =  function(a, b, c, d) {
  return {
    x: ((a.x * b.y - a.y * b.x) * (c.x - d.x) - (a.x - b.x) * (c.x * d.y - c.y * d.x)) / ((a.x - b.x) * (c.y - d.y) - (a.y - b.y) * (c.x - d.x)),
    y: ((a.x * b.y - a.y * b.x) * (c.y - d.y) - (a.y - b.y) * (c.x * d.y - c.y * d.x)) / ((a.x - b.x) * (c.y - d.y) - (a.y - b.y) * (c.x - d.x))
  };
};

function is_brushed(p) {
  return !yscale[p].brush.empty();
};

// data within extents


function brushedDimensions(){

}

function getDomain(){
	var actives = __.dimensions.filter(is_brushed),
	extents = actives.map(function(p) { return yscale[p].brush.extent(); });
	return extents;
}



function selected() {
  var actives = __.dimensions.filter(is_brushed),
      extents = actives.map(function(p) { return yscale[p].brush.extent(); });
  // console.log(actives);
  categories=actives;
  // test if within range
  var within = {
    "date": function(d,p,dimension) {
      return extents[dimension][0] <= d[p] && d[p] <= extents[dimension][1]
    },
    "number": function(d,p,dimension) {
      return extents[dimension][0] <= d[p] && d[p] <= extents[dimension][1]
    },
    "string": function(d,p,dimension) {
      return extents[dimension][0] <= yscale[p](d[p]) && yscale[p](d[p]) <= extents[dimension][1]
    }
  };

  return __.data
    .filter(function(d) {
      return actives.every(function(p, dimension) {
        return within[__.types[p]](d,p,dimension);
      });
    });
};

function position(d) {
  var v = dragging[d];
  return v == null ? xscale(d) : v;
}
  pc.toString = function() { return "Parallel Coordinates: " + __.dimensions.length + " dimensions (" + d3.keys(__.data[0]).length + " total) , " + __.data.length + " rows"; };
  
  pc.version = "0.2.2";

  return pc;
};


d3.renderQueue = (function(func) {
  var _queue = [],                  // data to be rendered
      _rate = 10,                   // number of calls per frame
      _clear = function() {},       // clearing function
      _i = 0;                       // current iteration

  var rq = function(data) {
    if (data) rq.data(data);
    rq.invalidate();
    _clear();
    rq.render();
  };

  rq.render = function() {
    _i = 0;
    var valid = true;
    rq.invalidate = function() { valid = false; };

    function doFrame() {
      if (!valid) return true;
      if (_i > _queue.length) return true;
      var chunk = _queue.slice(_i,_i+_rate);
      _i += _rate;
      chunk.map(func);
    }

    d3.timer(doFrame);
  };

  rq.data = function(data) {
    rq.invalidate();
    _queue = data.slice(0);
    return rq;
  };

  rq.rate = function(value) {
    if (!arguments.length) return _rate;
    _rate = value;
    return rq;
  };

  rq.remaining = function() {
    return _queue.length - _i;
  };

  // clear the canvas
  rq.clear = function(func) {
    if (!arguments.length) {
      _clear();
      return rq;
    }
    _clear = func;
    return rq;
  };

  rq.invalidate = function() {};

  return rq;
});d3.parcoords = function(config) {

  var __ = {
    data: [],
    dimensions: [],
    dimensionTitles: {},
    types: {},
    brushed: false,
    mode: "default",
    rate: 20,
    width: 520,
    height: 300,
    margin: { top: 70, right: 15, bottom: 70, left: 40 },
    color: "#069",
    composite: "source-over",
    alpha: 0.7,
    lineWidth: 0.2
  };

  extend(__, config);
  

var axisValue,axisTitle;
var pc = function(selection) {
  selection = pc.selection = d3.select(selection);

  __.width = selection[0][0].clientWidth;
  __.height = selection[0][0].clientHeight;

  // canvas data layers
  ["shadows", "marks", "foreground", "highlight"].forEach(function(layer) {
    canvas[layer] = selection
      .append("canvas")
      .attr("class", layer)[0][0];
    ctx[layer] = canvas[layer].getContext("2d");
  });

  // svg tick and brush layers
  pc.svg = selection
    .append("svg")
      .attr("width", __.width)
      .attr("height", __.height)
    .append("svg:g")
      .attr("transform", "translate(" + __.margin.left + "," + __.margin.top + ")");

  return pc;
};
var events = d3.dispatch.apply(this,["render", "resize", "highlight", "brush"].concat(d3.keys(__))),
    w = function() { return __.width - __.margin.right - __.margin.left; },
    h = function() { return __.height - __.margin.top - __.margin.bottom; },
    flags = {
      brushable: false,
      reorderable: false,
      axes: false,
      interactive: false,
      shadows: false,
      debug: false
    },
    xscale = d3.scale.ordinal(),
    yscale = {},
    dragging = {},
    line = d3.svg.line(),
    axis = d3.svg.axis().orient("left").ticks(5),
    g, // groups for axes, brushes
    ctx = {},
    canvas = {};

// side effects for setters
var side_effects = d3.dispatch.apply(this,d3.keys(__))
  .on("composite", function(d) { ctx.foreground.globalCompositeOperation = d.value; })
  .on("alpha", function(d) { ctx.foreground.globalAlpha = d.value; })
  .on("lineWidth", function(d) { ctx.foreground.lineWidth = d.value; })
  .on("width", function(d) { pc.resize(); })
  .on("height", function(d) { pc.resize(); })
  .on("margin", function(d) { pc.resize(); })
  .on("rate", function(d) { rqueue.rate(d.value); })
  .on("data", function(d) {
    if (flags.shadows) paths(__.data, ctx.shadows);
  })
  .on("dimensions", function(d) {
    xscale.domain(__.dimensions);
    if (flags.interactive) pc.render().updateAxes();
  });

// expose the state of the chart
pc.state = __;
pc.flags = flags;

// create getter/setters
getset(pc, __, events);

// expose events
d3.rebind(pc, events, "on");

// tick formatting
d3.rebind(pc, axis, "ticks", "orient", "tickValues", "tickSubdivide", "tickSize", "tickPadding", "tickFormat");

// getter/setter with event firing
function getset(obj,state,events)  {
  d3.keys(state).forEach(function(key) {
    obj[key] = function(x) {
      if (!arguments.length) return state[key];
      var old = state[key];
      state[key] = x;
      side_effects[key].call(pc,{"value": x, "previous": old});
      events[key].call(pc,{"value": x, "previous": old});
      return obj;
    };
  });
};

function extend(target, source) {
  for (key in source) {
    target[key] = source[key];
  }
  return target;
};
pc.autoscale = function() {
  // yscale
  var defaultScales = {
    "date": function(k) {
      return d3.time.scale()
        .domain(d3.extent(__.data, function(d) {
          return d[k] ? d[k].getTime() : null;
        }))
        .range([h()+1, 1])
        ;
    },
    "number": function(k) {
      return d3.scale.linear()
        .domain(d3.extent(__.data, function(d) { return +d[k]; }))
        .range([h()+1, 1])
        ;
    },

    "string": function(k) {
      return d3.scale.ordinal()
        .domain(__.data.map(function(p) { return p[k]; }))
        .rangePoints([h()+1, 1])
        ;
    }
  };

  __.dimensions.forEach(function(k) {
    yscale[k] = defaultScales[__.types[k]](k);
  });

  // hack to remove ordinal dimensions with many values
  /*
  // MDC - commented out on 12/19/2016 to make ordinal scales work
  pc.dimensions(pc.dimensions().filter(function(p,i) {
    var uniques = yscale[p].domain().length;
    if (__.types[p] == "string" && (uniques > 60 || uniques < 2)) {
      return false;
    }
    return true;
  }));
*/
  // xscale
  xscale.rangePoints([0, w()], 1);

  // canvas sizes
  pc.selection.selectAll("canvas")
      .style("margin-top", __.margin.top + "px")
      .style("margin-left", __.margin.left + "px")
      .attr("width", w()+2)
      .attr("height", h()+2)
      ;

  // default styles, needs to be set when canvas width changes
  ctx.foreground.strokeStyle = __.color;
  ctx.foreground.lineWidth = .45;
  ctx.foreground.globalCompositeOperation = __.composite;
  ctx.foreground.globalAlpha = __.alpha;
  ctx.highlight.lineWidth = 0;
  ctx.shadows.strokeStyle = "#EDEDED";
  ctx.shadows.lineWidth = 0.25;

  

  return this;
};

pc.detectDimensions = function() {
  pc.types(pc.detectDimensionTypes(__.data));
  pc.dimensions(d3.keys(pc.types()));
  return this;
};

// a better "typeof" from this post: http://stackoverflow.com/questions/7390426/better-way-to-get-type-of-a-javascript-variable
pc.toType = function(v) {
  return ({}).toString.call(v).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
  ;
};

// try to coerce to number before returning type
pc.toTypeCoerceNumbers = function(v) {
  if ((parseFloat(v) == v) && (v != null)) return "number";
  return pc.toType(v);
};

// attempt to determine types of each dimension based on first row of data
pc.detectDimensionTypes = function(data) {
  var types = {};
  d3.keys(data[0])
    .forEach(function(col) {
      types[col] = pc.toTypeCoerceNumbers(data[0][col]);
    });
  return types;
};

pc.render = function() {
  // try to autodetect dimensions and create scales
  if (!__.dimensions.length) pc.detectDimensions();
  if (!(__.dimensions[0] in yscale)) pc.autoscale();
  pc.render[__.mode]();

  events.render.call(this);
  return this;
};

pc.render.default = function() {
  pc.clear('foreground');
  if (__.brushed) {
    __.brushed.forEach(path_foreground);
  } else {
    __.data.forEach(path_foreground);
  }
};

var rqueue = d3.renderQueue(path_foreground)
  .rate(50)
  .clear(function() { pc.clear('foreground'); });

pc.render.queue = function() {
  if (__.brushed) {
    rqueue(__.brushed);
  } else {
    rqueue(__.data);
  }
};
pc.shadows = function() {
  flags.shadows = true;
  if (__.data.length > 0) paths(__.data, ctx.shadows);
  return this;
};

// draw little dots on the axis line where data intersects
pc.axisDots = function() {
  var ctx = pc.ctx.marks;
  ctx.globalAlpha = d3.min([1/Math.pow(data.length, 1/2), 1]);
  __.data.forEach(function(d) {
    __.dimensions.map(function(p,i) {
      ctx.fillRect(position(p)-0.75,yscale[p](d[p])-0.75,1.5,1.5);
    });
  });
  return this;
};

// draw single polyline
function color_path(d, ctx) {
  ctx.strokeStyle = d3.functor(__.color)(d);
  ctx.beginPath();
  __.dimensions.map(function(p,i) {
    if (i == 0) {
      ctx.moveTo(position(p),yscale[p](d[p]));
    } else {
      ctx.lineTo(position(p),yscale[p](d[p]));
    }
  });
  ctx.stroke();
};

// draw many polylines of the same color
function paths(data, ctx) {
  ctx.clearRect(-1,-1,w()+2,h()+2);
  ctx.beginPath();
  data.forEach(function(d) {
    __.dimensions.map(function(p,i) {
      if (i == 0) {
        ctx.moveTo(position(p),yscale[p](d[p]));
      } else {
        ctx.lineTo(position(p),yscale[p](d[p]));
      }
    });
  });
  ctx.stroke();
};

function path_foreground(d) {
  return color_path(d, ctx.foreground);
};

function path_highlight(d) {
  return color_path(d, ctx.highlight);
};
pc.clear = function(layer) {
  ctx[layer].clearRect(0,0,w()+2,h()+2);
  return this;
};
pc.createAxes = function() {
  if (g) pc.removeAxes();

  // Add a group element for each dimension.
  
  g = pc.svg.selectAll(".dimension")
      .data(__.dimensions, function(d) { return d; })
    .enter().append("svg:g")
      .attr("class", "dimension")
      .attr("transform", function(d) { return "translate(" + xscale(d) + ")"; })
	;
  // Add an axis and title.
  var newAxis=g.append("svg:g")
      .attr("class", "axis")
      .attr("transform", "translate(0,0)")
      .each(function(d) { d3.select(this).call(axis.scale(yscale[d])); })
      ;
      
   axisValue=newAxis.append("svg:text")
      .attr({
        "text-anchor": "middle",
        "y": 0,
        "transform": "translate(0,-12)",
        "x": 0,
        "class": "axisValue"
      })
      // .text(function(d) {
        // return d in __.dimensionTitles ? __.dimensionTitles[d] : d;  // dimension display names
      // })  
      ;
      
      
   axisTitle=newAxis.append("svg:text")
      .attr({
        "text-anchor": "middle",
        "y": 0,
        "transform": "translate(0,-24)",
        "x": 0,
        "class": "axisTitle"
      })
      .text(function(d) {
        return d in __.dimensionTitles ? __.dimensionTitles[d] : d;  // dimension display names
      })  ;

      
      
 
		//var clickedX=[];
		var clickedX = {};
		var initX = 1;
		var jumper = 65;
		var nodeJump = __.height - jumper;
		var nodeJump2 = __.height - jumper * .65; 

	// console.log(nodeJump);
    xPicker=g.append("svg:g")
	  .append("g")
		.style("fill", function(d){
			if (curX == d) {
				clickedX[d] = 1;
				return "black";
			} else {
				clickedX[d] = 0;
				return "#AAAAAA";
			}
		}) 
		.style("font-weight", function(d){
		      
			if (curX == d) {
				return "bold";
			} else {
				return "normal";
			}
	      }) 
		.attr("transform", "translate(0,"+(nodeJump-25)+")")
		.append("svg:text")
			.attr({
		        "text-anchor": "middle",
		        "font-size":14,
		        "y": -30,
		        "x": 0,
		        "class": "xOption"
			})
      		.text("X")
      .on("mouseover",function(d){
      	xPicker
	      		.style("cursor", "hand")
	      		.style("fill",function(q){
					if (q == d) {
						return "black";
					} else {
						return d3.select(this).style("fill");
					}

	        	})
	        	.style("font-weight",function(q){
	        		if(q==d){return "bold";}
	        		else{return d3.select(this).style("font-weight");}
	        	})
	      		
	  		;
      })
      .on("click",function(d) {
        xPicker
        	.style("fill",function(q){        		
				if (q == d) {
					clickedX[q] = 1;
					return "black";
				} else {
					clickedX[q] = 0;
					return "#AAAAAA";
				}

        	})
        	.style("font-weight",function(q){        		
        		if(q==d){return "bold";}
        		else{return "normal";}
        	})
        	;
  		renegotiateX(d in __.dimensionTitles ? __.dimensionTitles[d] : d);
        })
        
       .on("mouseout",function(d){
       		//console.log("mouseout");
       		//console.log(clickedX)
       		//console.log(curX)
       		//console.log(this)
			xPicker
	      		.style("fill",function(q){
	      			if(q=="Date"&&initX==1&&clickedX[q]==0){
	      				//console.log(clickedX["Date"]);
	      				return "#AAAAAA";
	      			}
	      			else{
						if (q == d && clickedX[q] == 0) {
							console.log(q)
							return "#AAAAAA";
						} else if (clickedX[q] == 1) {
							return d3.select(this).style("fill");
						}
	        		}
	        	})
				.style("font-weight",function(q){
					if(q=="Date"&&initX==1&&clickedX[q]==0){
	      				// initX=0;
	      				// console.log(clickedX["Date"]);
	      				return "normal";
	      			}
	      			else{
	        		if(q==d&&clickedX[q]==0){return "normal";}
	        		else if(clickedX[q]==1){return d3.select(this).style("font-weight");}
	        		}
	        	});
      }) 
      ;

		
	var clickedY=[];   var initY=1;

      yPicker=g.append("svg:g")
	      .append("g")
	      .attr("transform", "translate(0,"+(nodeJump-7.5)+")")
	      .style("fill", function(d){
		      if(curY==d){
		      	return "black";
		      }
		      else{	      
		      	return "#AAAAAA";
		      }
	      }
	      ) 
	      .style("font-weight", function(d){
		      if(curY==d){
		      	return "bold";
		      }
		      else{	      
		      	return "normal";
		      }
	      }
	      ) 
	      .append("svg:text")
	      
	      // .style("font-weight","normal")
	      .attr({
	        "text-anchor": "middle",
	        "font-size":14,
	        "y": -30,
	        "x": 0,
	        "class": "yOption"
	      })
	      .text("Y")
	      
	      
		  .on("mouseover",function(d){
	      	yPicker
		      		.style("cursor", "hand")
		      		.style("fill",function(q){
		        		if(q==d){return "black";}
		        		else{return d3.select(this).style("fill");}
		        	})
		        	.style("font-weight",function(q){
		        		if(q==d){return "bold";}
		        		else{return d3.select(this).style("font-weight");}
		        	})
		      		
		  		;
	      })
	      .on("click",function(d) {
	        yPicker
	        	.style("fill",function(q){        		
	        		if(q==d){clickedY[q]=1;return "black";}
	        		else{clickedY[q]=0;return "#AAAAAA";}
	        	})
	        	.style("font-weight",function(q){        		
	        		if(q==d){return "bold";}
	        		else{return "normal";}
	        	})
	        	;
	  		renegotiateY(d in __.dimensionTitles ? __.dimensionTitles[d] : d);
	        })
	        
	       .on("mouseout",function(d){
			yPicker
	      		.style("fill",function(q){
	      			if(q=="DryBulb"&&initY==1&&clickedY[q]==0){
	      				return "#AAAAAA";
	      			}
	      			else{
		        		if(q==d&&clickedY[q]==0){return "#AAAAAA";}
		        		else if(clickedY[q]==1){return d3.select(this).style("fill");}
	        		}
	        	})
				.style("font-weight",function(q){
					if(q=="DryBulb"&&initY==1&&clickedY[q]==0){
	      				// initX=0;
	      				return "normal";
	      			}
	      			else{
	        		if(q==d&&clickedY[q]==0){return "normal";}
	        		else if(clickedY[q]==1){return d3.select(this).style("font-weight");}
	        		}
	        	});
      })   
      ;
    
	var repeaterRect;
   	var justClickedRect=0;  
      
   pickRectangle=g.append("svg:g")
      .attr("class", "colorNode")
      // .attr("transform", "translate(0,"+height/4+")")
      .attr("transform", "translate(0,"+(nodeJump2)+")")
      // .each(function(d) { d3.select(this).call(axis.scale(yscale[d])); })    
      .style("fill","#AAAAAA")      
     // .append("svg:rect")
    	// .attr({
    		// "y": 0,
    		// "x": -5,
    		// "width":10,
    		// "height":10
    		 // })
     .append("svg:text")
	      .style("font-weight","regular")
	      .attr({
	        "text-anchor": "middle",
	        "font-size":10,
	        "y": -30,
	        "x": 0,
	        "class": "yOption"
	      })
	      .text("COLOR")
	      
	      
    .on("mouseover",function(d){
  			pickRectangle
      			.style("cursor", "hand")
      			.style("fill",function(q){
		      		if(q==d){return "black";}
		      		else{
		      			return d3.select(this).style("fill");
		      			}})
		      	;	
  		})
  		
	 .on("click",function(d) {  	
	 	 	pickRectangle
		      	.style("fill",function(q){
		      		if(q==d&&q!=repeaterRect){justClickedRect=1;repeaterRect=q;return "black";}
		      		else if(q==repeaterRect){justClickedRect=0;repeaterRect=undefined;return"#AAAAAA";}
		      		else{return "#AAAAAA";}
	      		});	  
	 	 
	 	 console.log("other colorNode");
      		renegotiateColor(d in __.dimensionTitles ? __.dimensionTitles[d] : d);
      		parcoords.render(); 
	        })
	        
	  .on("mouseout",function(d){
  			pickRectangle
      			.style("fill",function(q){
		      		if(q==d){
		      			if(justClickedRect==1||q==repeaterRect){
		      				return "black";
		      			}
		      			else{
		      				return "#AAAAAA";
		      			}
	      			}
		      		else{
		      			return d3.select(this).style("fill");
		      		}});
      			;
      		justClickedRect=0;			
      		})
      ;


   var repeaterCirc;
   var justClickedCirc=0;
     
   pickCircle=g.append("svg:g")
      .attr("class", "radiusNode")
      .style("fill","#AAAAAA")
      // .attr("transform", "translate(0,"+height/4+")")
      .attr("transform", "translate(0,"+(nodeJump+4)+")")
      // .each(function(d) { d3.select(this).call(axis.scale(yscale[d])); })          
     .append("svg:circle")
    	.attr({
    		"cy": -30,
    		"cx": 0,
    		"r":5
    		 })
    .on("mouseover",function(d){
  			pickCircle
      			.style("cursor", "hand")
      			.style("fill",function(q){
		      		if(q==d){return "black";}else{
		      			// return "#AAAAAA";
		      			return d3.select(this).style("fill");
		      			}});
      			;			
      		})
    .on("click",function(d) {  	
    		  
    	    pickCircle
		      	.style("fill",function(q){
		      		if(q==d&&q!=repeaterCirc){justClickedCirc=1;repeaterCirc=q;return "black";}
		      		else if(q==repeaterCirc){justClickedCirc=0;repeaterCirc=undefined;return"#AAAAAA";}
		      		else{return "#AAAAAA";}
	      		});	   
      		renegotiateRadius(d in __.dimensionTitles ? __.dimensionTitles[d] : d);
	        })	
	        
	  .on("mouseout",function(d){
  			pickCircle
      			.style("fill",function(q){
		      		if(q==d){
		      			if(justClickedCirc==1||q==repeaterCirc){
		      				return "black";
		      			}
		      			else{
		      				return "#AAAAAA";
		      			}
	      			}
		      		else{
		      			return d3.select(this).style("fill");
		      		}});
      			;
      		justClickedCirc=0;			
      		})
      ;
      
      
  flags.axes= true;
  return this;
};

pc.removeAxes = function() {
  g.remove();
  return this;
};

pc.updateAxes = function() {
  var g_data = pc.svg.selectAll(".dimension")
      .data(__.dimensions, function(d) { return d; })
      ;

  g_data.enter().append("svg:g")
      .attr("class", "dimension")
      .attr("transform", function(p) { return "translate(" + position(p) + ")"; })
      .style("opacity", 0)
      .append("svg:g")
      .attr("class", "axis")
      .attr("transform", "translate(0,0)")
      .each(function(d) { d3.select(this).call(axis.scale(yscale[d])); })
    .append("svg:text")
      .attr({
        "text-anchor": "middle",
        "y": 0,
        "transform": "translate(0,-12)",
        "x": 0,
        "class": "label"
      })
      .text(String);

  g_data.exit().remove();

  g = pc.svg.selectAll(".dimension");

  g.transition().duration(1100)
    .attr("transform", function(p) { return "translate(" + position(p) + ")"; })
    .style("opacity", 1)
    ;
  if (flags.shadows) paths(__.data, ctx.shadows);
  return this;
};

pc.brushable = function() {
  if (!g) pc.createAxes();

  // Add and store a brush for each axis.
  g.append("svg:g")
      .attr("class", "brush")
      .each(function(d) {
        d3.select(this).call(
          yscale[d].brush = d3.svg.brush()
            .y(yscale[d])
            .on("brushstart", function() {
              d3.event.sourceEvent.stopPropagation();
            })
            .on("brush", pc.brush)
        );
      })
    .selectAll("rect")
      .style("visibility", null)
      .attr("x", -15)
      .attr("width", 30)
      ;
  flags.brushable = true;
  return this;
};

// Jason Davies, http://bl.ocks.org/1341281
pc.reorderable = function() {
  if (!g) pc.createAxes();

  g
  .style("cursor", "move")
    .call(d3.behavior.drag()
      .on("dragstart", function(d) {
        dragging[d] = this.__origin__ = xscale(d);
      })
      .on("drag", function(d) {
        dragging[d] = Math.min(w(), Math.max(0, this.__origin__ += d3.event.dx));
        __.dimensions.sort(function(a, b) { return position(a) - position(b); });
        xscale.domain(__.dimensions);
        pc.render();
        g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
      })
      .on("dragend", function(d) {
        delete this.__origin__;
        delete dragging[d];
        d3.select(this).transition().attr("transform", "translate(" + xscale(d) + ")");
        pc.render();
      }));
  flags.reorderable = true;
  return this;
};

// pairs of adjacent dimensions
pc.adjacent_pairs = function(arr) {
  var ret = [];
  for (var i = 0; i < arr.length-1; i++) {
    ret.push([arr[i],arr[i+1]]);
  };
  return ret;
};
pc.interactive = function() {
  flags.interactive = true;
  return this;
};

// Get data within brushes
pc.brush = function() {
  __.brushed = selected();
  events.brush.call(pc,__.brushed);
  pc.render();

};

// expose a few objects
pc.xscale = xscale;
pc.yscale = yscale;
pc.ctx = ctx;
pc.canvas = canvas;
pc.g = function() { return g; };

pc.brushReset = function(dimension) {
  if (g) {
    g.selectAll('.brush')
      .each(function(d) {
        d3.select(this).call(
          yscale[d].brush.clear()
        );
      })
    pc.brush();

  }
  return this;
};

pc.brushExtents = function(dimension) {
  if (g) {
  	//yscale["ID"].brush.extent([100,200])
 
    g.selectAll('.brush')
      .each(function(d) {
      	if (d=="ID") {
      		console.log(yscale[d].brush.extent());
      	}
      	
      })
      
    pc.brush();
    //pc.render();
    //pc.render().updateAxes()

  }
  return this;
};

// rescale for height, width and margins
// TODO currently assumes chart is brushable, and destroys old brushes
pc.resize = function() {
  // selection size
  pc.selection.select("svg")
    .attr("width", __.width)
    .attr("height", __.height)
  pc.svg.attr("transform", "translate(" + __.margin.left + "," + __.margin.top + ")");

  // scales
  pc.autoscale();

  // axes, destroys old brushes. the current brush state should pass through in the future
  if (g) pc.createAxes().brushable();

  events.resize.call(this, {width: __.width, height: __.height, margin: __.margin});
  return this;
};

// highlight an array of data
pc.highlight = function(data) {
  pc.clear("highlight");
  d3.select(canvas.foreground).classed("faded", true);
  data.forEach(path_highlight);
  events.highlight.call(this,data);
  return this;
};

// clear highlighting
pc.unhighlight = function(data) {
  pc.clear("highlight");
  d3.select(canvas.foreground).classed("faded", false);
  return this;
};

// calculate 2d intersection of line a->b with line c->d
// points are objects with x and y properties
pc.intersection =  function(a, b, c, d) {
  return {
    x: ((a.x * b.y - a.y * b.x) * (c.x - d.x) - (a.x - b.x) * (c.x * d.y - c.y * d.x)) / ((a.x - b.x) * (c.y - d.y) - (a.y - b.y) * (c.x - d.x)),
    y: ((a.x * b.y - a.y * b.x) * (c.y - d.y) - (a.y - b.y) * (c.x * d.y - c.y * d.x)) / ((a.x - b.x) * (c.y - d.y) - (a.y - b.y) * (c.x - d.x))
  };
};

function is_brushed(p) {
  return !yscale[p].brush.empty();
};

// data within extents


function brushedDimensions(){

}

function getDomain(){
	var actives = __.dimensions.filter(is_brushed),
	extents = actives.map(function(p) { return yscale[p].brush.extent(); });
	return extents;
}



function selected() {
  var actives = __.dimensions.filter(is_brushed),
      extents = actives.map(function(p) { return yscale[p].brush.extent(); });
  // console.log(actives);
  categories=actives;
  // test if within range
  var within = {
    "date": function(d,p,dimension) {
      return extents[dimension][0] <= d[p] && d[p] <= extents[dimension][1]
    },
    "number": function(d,p,dimension) {
      return extents[dimension][0] <= d[p] && d[p] <= extents[dimension][1]
    },
    "string": function(d,p,dimension) {
      return extents[dimension][0] <= yscale[p](d[p]) && yscale[p](d[p]) <= extents[dimension][1]
    }
  };
  return __.data
    .filter(function(d) {
      return actives.every(function(p, dimension) {
        return within[__.types[p]](d,p,dimension);
      });
    });
};

function position(d) {
  var v = dragging[d];
  return v == null ? xscale(d) : v;
}
  pc.toString = function() { return "Parallel Coordinates: " + __.dimensions.length + " dimensions (" + d3.keys(__.data[0]).length + " total) , " + __.data.length + " rows"; };
  
  pc.version = "0.2.2";

  return pc;
};

d3.renderQueue = (function(func) {
  var _queue = [],                  // data to be rendered
      _rate = 10,                   // number of calls per frame
      _clear = function() {},       // clearing function
      _i = 0;                       // current iteration

  var rq = function(data) {
    if (data) rq.data(data);
    rq.invalidate();
    _clear();
    rq.render();
  };

  rq.render = function() {
    _i = 0;
    var valid = true;
    rq.invalidate = function() { valid = false; };

    function doFrame() {
      if (!valid) return true;
      if (_i > _queue.length) return true;
      var chunk = _queue.slice(_i,_i+_rate);
      _i += _rate;
      chunk.map(func);
    }

    d3.timer(doFrame);
  };

  rq.data = function(data) {
    rq.invalidate();
    _queue = data.slice(0);
    return rq;
  };

  rq.rate = function(value) {
    if (!arguments.length) return _rate;
    _rate = value;
    return rq;
  };

  rq.remaining = function() {
    return _queue.length - _i;
  };

  // clear the canvas
  rq.clear = function(func) {
    if (!arguments.length) {
      _clear();
      return rq;
    }
    _clear = func;
    return rq;
  };

  rq.invalidate = function() {};

  return rq;
});
