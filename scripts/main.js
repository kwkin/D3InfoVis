;(function() {

	var margin = { top: 10, right: 0, bottom: 100, left: 50 };
	var width = 400;
	var height = 300;

	var dataXRange = { min: 0, max: 50 };
	var dataYRange = { min: 0, max: 100 };
	var xAxisLabelHeader = "Time";
	var yAxisLabelHeader = "Y Header";
	var circleRadius = 4;

	var data;
	var chart;
	var chartWidth;
	var chartHeight;
	var isPaused = false;

	var dotColor = "red";
	var interval;
	var lastStop;

	const local = d3.local();

	init();

	function init() {

		console.log("initiating!")

		chartWidth = width - margin.left - margin.right;
		chartHeight = height - margin.top - margin.bottom;

		// load data from json
		d3.json("./data/stream_1.json").then(function(json){
			data = json;
			rateMs = 1000;
			console.log("JSON loaded");

			initializeChart();
			createAxes();

			animateScatterplot("#graph1", data, 400, 300, rateMs);

			addResetButton();
			addPlayPauseButton();

		}).catch(function(error) {console.warn(error)})

	}//end init

	function initializeChart() {
		chart = d3.select("#chartDiv").append("svg")
			.attr("width", width)
			.attr("height", height);

		chart.plotArea = chart.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	}

	function createAxes() {
		// x axis
		chart.xScale = d3.scaleLinear()
			.domain([dataXRange.min, dataXRange.max])
			.range([0, chartWidth]);

		chart.xAxis = d3.axisBottom()
			.tickSizeOuter(0)
			.scale(chart.xScale);

		chart.xAxisContainer = chart.append("g")
			.attr("class", "x axis scatter-xaxis")
			.attr("transform", "translate(" + (margin.left) + ", " + (chartHeight + margin.top) + ")")
			.call(chart.xAxis);

		// x axis header label
		chart.append("text")
			.attr("class", "x axis scatter-xaxis")
			.style("font-size", "12px")
			.attr("text-anchor", "middle")
			.attr("transform", "translate(" + (margin.left + chartWidth / 2.0) + ", " + (chartHeight + (margin.bottom / 2.0)) + ")")
			.text(xAxisLabelHeader);

		// y axis labels
		chart.yScale = d3.scaleLinear()
			.domain([dataYRange.min, dataYRange.max])
			.range([chartHeight, 0]);

		chart.yAxis = d3.axisLeft()
			.scale(chart.yScale);

		chart.yAxisContainer = chart.append("g")
			.attr("class", "y axis scatter-yaxis")
			.attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
			.call(chart.yAxis);

		// y axis header label
		chart.append('text')
			.style("font-size", "12px")
			.attr("class", "heatmap-yaxis")
			.attr("text-anchor", "middle")
			.attr("transform", "translate(" + (margin.left / 2.0) + ", " + (chartHeight / 2.0) + ") rotate(-90)")
			.text(yAxisLabelHeader);
	}

	function animateScatterplot(id, data, width, height, speedMs) {
		var dots = chart.plotArea.selectAll(".dot")
			.data(data)
			.enter().append("circle")
				.attr("class", "dot")
				.attr("cx", function(d) { 
					return chart.xScale(d.xVal); 
				})
				.attr("cy", function(d) { 
					return chart.yScale(d.yVal); 
				})
				.attr("r", circleRadius)
				.attr("fill", dotColor)
				.on("click", function(d) {
					console.log("circle: ", d.xVal, ", ", d.yVal);
				});

		xMin = dataXRange.min;
		xMax = dataXRange.max;
		interval = setInterval(function() {
			redrawWithAnimation(speedMs)
		}, speedMs) 	
	}

	function redrawWithAnimation(speedMs) {
		chart.xScale.domain([xMin++, xMax++])
		chart.select(".x")
			.transition()
			.ease(d3.easeLinear)
			.duration(speedMs)
			.call(chart.xAxis);
		
		chart.plotArea.selectAll(".dot")
			.data(data)
				.attr("class", "dot")
				.on("click", function(d) {
					console.log("circle: ", d.xVal, ", ", d.yVal);
				})
				.transition()
				.attr("cx", function(d) { 
					xVal = chart.xScale(d.xVal)
					if (xVal < 0)
						d3.select(this).transition().attr("r", 0);
					return xVal; 
				})
				.attr("cy", function(d) { 
					return chart.yScale(d.yVal); 
				})
				.ease(d3.easeLinear)
				.duration(speedMs)
				.on("interrupt", function() {
					local.set(this, +d3.select(this).attr("cx"))
				});
	}

	function addResetButton() {
		var buttonNames = ["Reset"]

		d3.select("body").selectAll("resetButton")
			.data(buttonNames).enter()
				.append("input")
				.attr("type","button")
				.attr("class","button")
				.style("width", "80px")
				.attr("value", function (d) {
					return d;
				})
				.on("click", function(d, i) {
					console.log("reset");
				});
	}

	function addPlayPauseButton() {
		var buttonNames = ["Pause"]

		d3.select("body").selectAll("pauseButton")
			.data(buttonNames).enter()
				.append("input")
				.attr("type", "button")
				.attr("class", "button")
				.style("width", "80px")
				.attr("value", function (d) {
					return d;
				})
				.on("click", function(d, i) {
					if(isPaused) {
						d3.select(this).transition().attr("value", "Pause");
						d3.selectAll(".dot").transition()
							.attr("cx", function(d) { 
								xVal = chart.xScale(d.xVal)
								if (xVal < 0)
									d3.select(this).transition().attr("r", 0);
								return xVal; 
							})
							.attr("cy", function(d) { 
								return chart.yScale(d.yVal); 
							})
							.ease(d3.easeLinear)
							.duration(function() {
								lastStop = local.get(this);
								return 1000 * (560 - lastStop) / 560;
							})
							.on("interrupt", function() {
								console.log("Interrupting");
							});
						interval = setInterval(function() {
							redrawWithAnimation(1000)
						}, 1000) 	
					}
					else {
						d3.select(this).transition().attr("value", "Play");
						d3.selectAll(".dot")
							.interrupt();
						clearInterval(interval);
					}
					isPaused = !isPaused;
				});
	}
})();
