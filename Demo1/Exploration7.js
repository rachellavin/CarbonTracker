// Set the margins
var margin = {top: 60, right: 100, bottom: 20, left: 80},
  width = 850 - margin.left - margin.right,
  height = 370 - margin.top - margin.bottom;

// Parse the month variable
var parseMonth = d3.timeParse("%b");
var formatMonth = d3.timeFormat("%b");

var formatYear = d3.timeFormat("%Y");
var parseYear = d3.timeParse("%Y");


// Set the ranges
var x = d3.scaleTime().domain([parseMonth("Jan"), parseMonth("Dec")]).range([0, width]);
var y = d3.scaleLinear().range([height, 0]);


// Define the line
var valueLine = d3.line()
    .x(function(d) { return x(d.Month); })
    .y(function(d) { return y(+d.Sales); })

// Create the svg canvas in the "graph" div
var svg = d3.select("#graph")
        .append("svg")
        .style("width", width + margin.left + margin.right + "px")
        .style("height", height + margin.top + margin.bottom + "px")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform","translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "svg");

// Import the CSV data
d3.csv("Example5.csv", function(error, data) {
  if (error) throw error;

   // Format the data
  data.forEach(function(d) {
      d.Month = parseMonth(d.Month);
      d.Sales = +d.Sales;
      d.Fruit = d.Fruit;
      d.Year = formatYear(parseYear(+d.Year));
  });

  var nest = d3.nest()
	    .key(function(d){
	    	return d.Fruit;
	    })
		.rollup(function(leaves){
            var max = d3.max(leaves, function(d){
            	return d.Sales
            })
            var year = d3.nest().key(function(d){
            	return d.Year
            })
            .entries(leaves);
            return {max:max, year:year};
            })
	  .entries(data)

  // Scale the range of the data
  x.domain(d3.extent(data, function(d) { return d.Month; }));
  //y.domain([0, d3.max(data, function(d) { return d.Sales; })]);

  // Set up the x axis
  var xaxis = svg.append("g")
       .attr("transform", "translate(0," + height + ")")
       .attr("class", "x axis")
       .call(d3.axisBottom(x)
          .ticks(d3.timeMonth)
          .tickSize(0, 0)
          .tickFormat(d3.timeFormat("%B"))
          .tickSizeInner(0)
          .tickPadding(10));



  // Create 1st dropdown
    var fruitMenu = d3.select("#fruitDropdown")

    fruitMenu
		.append("select")
		.selectAll("option")
        .data(nest)
        .enter()
        .append("option")
        .attr("value", function(d){
            return d.key;
        })
        .text(function(d){
            return d.key;
        })

    // Create 2nd dropdown
    var yearMenu = d3.select("#yearDropdown")

    yearMenu
    	.data(nest)
		.append("select")
		.selectAll("option")
        .data(function(d) { return d.value.year; })
       	.enter()
        .append("option")
        .attr("value", function(d){
            return d.key;
        })
        .text(function(d){
            return d.key;
        })


 	// Function to create the initial graph
 	var initialGraph = function(fruit){

 		// Filter the data to include only fruit of interest
 		var selectFruit = nest.filter(function(d){
                return d.key == fruit;
              })

	    var selectFruitGroups = svg.selectAll(".fruitGroups")
		    .data(selectFruit, function(d){
		      return d ? d.key : this.key;
		    })
		    .enter()
		    .append("g")
		    .attr("class", "fruitGroups")
		    .each(function(d){
                y.domain([0, d.value.max])
            });

		var initialPath = selectFruitGroups.selectAll(".line")
			.data(function(d) { return d.value.year; })
			.enter()
			.append("path")

		initialPath
			.attr("d", function(d){
				return valueLine(d.values)
			})
			.attr("class", "line")

		  // Add the Y Axis
		   var yaxis = svg.append("g")
		       .attr("class", "y axis")
		       .call(d3.axisLeft(y)
		          .ticks(5)
		          .tickSizeInner(0)
		          .tickPadding(6)
		          .tickSize(0, 0));

	

 	}

 	// Create initial graph
 	initialGraph("strawberry")


 	// Update the data
 	var updateGraph = function(fruit){

 		// Filter the data to include only fruit of interest
 		var selectFruit = nest.filter(function(d){
                return d.key == fruit;
              })

 		// Select all of the grouped elements and update the data
	    var selectFruitGroups = svg.selectAll(".fruitGroups")
		    .data(selectFruit)
		    .each(function(d){
                y.domain([0, d.value.max])
            });

		    // Select all the lines and transition to new positions
            selectFruitGroups.selectAll("path.line")
               .data(function(d) { return d.value.year; },
               		function(d){ return d.key; })
               .transition()
                  .duration(1000)
                  .attr("d", function(d){
                    return valueLine(d.values)
                  })

        // Update the Y-axis
            d3.select(".y")
                    .transition()
                    .duration(1500)
                    .call(d3.axisLeft(y)
                      .ticks(5)
                      .tickSizeInner(0)
                      .tickPadding(6)
                      .tickSize(0, 0));


 	}


 	// Run update function when dropdown selection changes
 	fruitMenu.on('change', function(){

 		// Find which fruit was selected from the dropdown
 		var selectedFruit = d3.select(this)
            .select("select")
            .property("value")

        // Run update function with the selected fruit
        updateGraph(selectedFruit)


    });


    // Change color of selected line when year dropdown changes
    yearMenu.on('change', function(){

    	// Find which year was selected
    	var selectedYear = d3.select(this)
    		.select("select")
    		.property("value")

    	// Change the class of the matching line to "selected"
    	var selLine = svg.selectAll(".line")
              // de-select all the lines
              .classed("selected", false)
              .filter(function(d) {
                  return +d.key === +selectedYear
              })
              // Set class to selected for matching line
              .classed("selected", true)
              .raise()
    })



})
