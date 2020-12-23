// Make the chart repsonive
function makeResponsive() {

  // If SVG area isn't empty when the browser loads, remove & replace with resized chart
  var svgArea = d3.select("#scatter").select("svg");

  if (!svgArea.empty()) {
    svgArea.remove();
  }

  // SVG params
  var svgWidth = window.innerWidth/1.5
  var svgHeight = window.innerHeight/1.75

  //Set up margins
  var margin = {
    top: 30,
    right: 100,
    bottom: 60,
    left: 55
    };
    
  // Chart area minus margins
  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;

  // Create SVG wrapper, append a group to hold the chart, shift group by left/top margins
  var svg = d3.select("#scatter").append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Initial Params
  var chosenXAxis = "poverty";
  var chosenYAxis = "obesity";

  // Function for updating x-scale var upon label click
  function xScale(healthData, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
      d3.max(healthData, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
    
    return xLinearScale;
  }

  // Function for updating y-scale var upon label click
  function yScale(healthData, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, d => d[chosenYAxis]) * 0.8,
      d3.max(healthData, d => d[chosenYAxis]) * 1.2
      ])
      .range([height, 0]);
  
      return yLinearScale;
  }

  // Function or updating x-axis var upon label click
  function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }

  // Function for updating y-axis var upon label click
  function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    
      yAxis.transition()
        .duration(1000)
        .call(leftAxis);
  
     return yAxis;
  }

  // Function for updating circles group with a transition to new circles
  function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis,chosenYAxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));
  return circlesGroup;
}

  // Function for updating circle labels
  function renderLabels(circleLabels, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    circleLables.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .attr("y", d => newYScale(d[chosenYAxis]));
  return circleLabels;
}

// Function for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circleLabels) {
  if (chosenXAxis === "poverty") {
    var xLabel = "Poverty";
  }
  else {
    var xLabel = "Healthcare";
  }
 
  if (chosenYAxis === "obesity") {
    var yLabel = "Obesity";
  }
  else {
    var yLabel = "Smokes";
  }

  // ToolTip
  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
  
  return (`${d.abbr}<br>${xLabel} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`);
  });

  // Append to chart
  circlesGroup.call(toolTip);

  // Cirlces mouseover event
  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })

  // Circles mouseout event
  .on("mouseout", function(data) {
      toolTip.hide(data);  
  });
  
  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(healthData) {

  // Cast data a numbers
  healthData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
  });

  // LinearScale functions
  var xLinearScale = xScale(healthData, chosenXAxis);
  var yLinearScale = yScale(healthData, chosenYAxis);
  
  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // Append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // Append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  // Append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(healthData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 15)
    .attr("fill", "blue")
    .attr("opacity", ".5");
  
   // Append initial circle lables
   var circleLabels = chartGroup.selectAll("value")
    .data(healthData)
    .enter()
    .append("text")
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .attr("font-size", "10px")
    .attr("text-anchor", "middle")
    .attr("fill", "white")
    .text(d => d.abbr);
  
  // Create group for two x-axis labels
  var xLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("Poverty");

  var healthcareLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "healthcare") // value to grab for event listener
    .classed("inactive", true)
    .text("Healthcare");

  // Create group for two y-axis labels
  var yLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${-2}, ${10})`);
  
  var obesityLabel = yLabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0 - (height / 2))
    .attr("y", 0 - margin.left - 3)
    .attr("dy", "1em")
    .attr("value", "obesity") // value to grab for event listener
    .classed("active", true)
    .text("Obesity");

  var smokesLabel = yLabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0 - (height / 2))
    .attr("y", 0 - margin.left + 13)
    .attr("dy", "1em")
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smokes");

  // UpdateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circleLabels);

  // x axis labels event listener
  xLabelsGroup.selectAll("text")
    .on("click", function() {
      // Cet value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // Replaces chosenXAxis with value
        chosenXAxis = value;

        // Updates x scale for new data
        xLinearScale = xScale(healthData, chosenXAxis);

        // Updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        // Updates circles with new values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        //Updates circle labels with new values
        circleLables = renderLabels(circleLabels, xLinearScale, yLinearScale, chosenXAxis, chosenYaxis);

        // Updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circleLabels);

        // Changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          }
        }
      });

  // y axis labels event listener
  yLabelsGroup.selectAll("text")
    .on("click", function() {
      // Get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

        // Replaces chosenYAxis with value
        chosenYAxis = value;

        // Updates y scale for new data
        yLinearScale = yScale(healthData, chosenYAxis);

        // Updates y axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // Updates circles with new values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        // Updates circle labels with new values
        circleLables = renderLabels(circleLabels, xLinearScale, yLinearScale, chosenXAxis, chosenYaxis);

        // Updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circleLabels);

        // Changes classes to change bold text
        if (chosenYAxis === "obesity") {
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
          }
        }
      });
    });
    };

makeResponsive();
// Event listener for window resize.
// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);