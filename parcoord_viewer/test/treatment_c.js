d3.text("spacetug_vasc_384_cleaned_v4.csv", function(data) {

    var parsedCSV = d3.csv.parseRows(data);

	var main_table = d3.select("#main_table")
        .append("tbody")
        
        .selectAll("tr")
            .data(parsedCSV).enter()
            .append("tr")

        .selectAll("td")
            .data(function(d) { return d; }).enter()
            .append("td")
            .text(function(d) { return d; });
});

//d3.select('table').attr("id","main_table")