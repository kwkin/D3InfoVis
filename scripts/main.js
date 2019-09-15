// Student: Kenneth W. King
// ID: 0901-3401
// Course #: CIS6930
// Course Name: Information Visualization
// Semester: Fall 2019
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
	var isPaused = true;

	var rateMs = 500;
	var timer;
	var pauseButton;
	var playButton;

	var dotColor = "red";
	var e = d3.select("#time");
	init();

	function init() {

		console.log("initiating!")

		chartWidth = width - margin.left - margin.right;
		chartHeight = height - margin.top - margin.bottom;

		// load data from json
		d3.json("./data/stream_1.json").then(function(json){
			e.attr("T",0);

			data = json;
			console.log("JSON loaded");

			initializeChart();
			createAxes();

			animateScatterplot("#graph1", data, 400, 300);

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
		initializeDots(data);

		xMin = dataXRange.min;
		xMax = dataXRange.max;
	}

	function initializeDots(data) {
		chart.plotArea.selectAll(".dot")
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
	}

	function startAnimation() {
		redrawWithAnimation();
		timer = d3.interval(function() {
			redrawWithAnimation()
		}, rateMs);
	}
	
	function stopAnimation() {
		timer.stop();
		
		chart.plotArea.selectAll(".dot")
			.interrupt()
	}

	function redrawWithAnimation() {
		chart.xScale.domain([++xMin, ++xMax])
		// chart.select(".x")
		// 	.transition()
		// 	.ease(d3.easeLinear)
		// 	.duration(rateMs)
		// 	.call(chart.xAxis);

		chart.plotArea.selectAll(".dot")
			.data(data)
				.attr("class", "dot")
				.on("click", function(d) {
					console.log("circle: ", d.xVal, ", ", d.yVal);

					indexData = [1, 2, 3, 4]
					var circle = chart.plotArea.selectAll(".animation")
						.data(indexData)
						.enter().append("circle")
							.attr("cx", function(index) {
								xScale = chart.xScale(d.xVal)
								return xScale;
							})
							.attr("cy", function(index) { 
								yScale = chart.yScale(d.yVal)
								return yScale;
							})
							.attr("r", 0)
							.attr("fill", "transparent")
							.attr("stroke", "black")
							.style("stroke-width", function(index) {
								return 5 / (index)
							})
							.transition()
								.delay(function(index) {
									return Math.pow(index, 2.5) * 50;
								})
								.duration(2000)
								.ease(d3.easeQuadOut)
							.attr("r", 400)
							.style("stroke-opacity", 0)
							.on("end", function () {
								d3.select(this).remove();
							})
				})
				.transition()
				.attr("cx", function(d) { 
					xVal = chart.xScale(d.xVal)
					if (xVal < 0)
						d3.select(this)
							.transition()
							.attr("r", 0);
					return xVal; 
				})
				.attr("cy", function(d) { 
					return chart.yScale(d.yVal); 
				})
				.duration(rateMs)
				.ease(d3.easeLinear)
				.attr("T",1);
	}

	function resetData() {
		stopAnimation();
			
		// Reset axis
		xMin = dataXRange.min;
		xMax = dataXRange.max;
		chart.xScale.domain([xMin, xMax])
		chart.select(".x")
			.transition()
			.duration(0)
			.call(chart.xAxis);
		
		// Reset position of dots
		chart.plotArea.selectAll(".dot")
			.data(data)
				.interrupt()
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
	}

	function addResetButton() {
		var buttonData = [{label: "Reset", width: "80px"}]

		pauseButton = d3.select("body").selectAll("resetButton")
			.data(buttonData).enter()
				.append("input")
				.attr("type","button")
				.attr("class","button")
				.style("width", function(d) {
					return d.width;
				})
				.attr("value", function(d) {
					return d.label;
				})
				.on("click", function(d, i) {
					isPaused = true;
					playButton.attr("value", "Play")
					resetData();
				});
	}

	function addPlayPauseButton() {
		var buttonData = [{label: "Play", width: "80px"}]

		playButton = d3.select("body").selectAll("pauseButton")
			.data(buttonData).enter()
				.append("input")
				.attr("type", "button")
				.attr("class", "button")
				.style("width", function(d) {
					return d.width;
				})
				.attr("value", function(d) {
					return d.label;
				})
				.on("click", function(d, i) {
					if(isPaused) {
						d3.select(this).attr("value", "Pause");	
						startAnimation();
					}
					else {
						d3.select(this).attr("value", "Play");
						stopAnimation();
					}
					isPaused = !isPaused;
				});	
	}
})();
