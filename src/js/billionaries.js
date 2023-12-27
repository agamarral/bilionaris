// Demo dataset: Enlargement of the European Union
var baseColor = '#B9B9B9';
var highColor = '#ff4500';

// Asynchronous JSON load
async function loadDataFromJSON(filepath) {
    let response = await fetch(filepath);
    let data = await response.json();
    return data;
}

// Load SVG World Map
async function loadSVGWorldMap() {
    // Custom options
    var options = { 
        libPath: './assets/vendors/SVG-World-Map-master/src/',
        showAntarctica: false,
        bigMap: false,
        showLabels: false, // Hide country labels
        showInfoBox: true, // Show info box
        timeControls: true, // Time data to activate time antimation controls
        timePause: false, // Set pause to false for autostart
        timeLoop: true, // Loop time animation
        containerId: 'my_world_map',
        worldColor: '#ffae42',
        oceanColor: '#009698'
    };
    // Startup SVG World Map
    myWorldMap = await svgWorldMap(options, false, timeData);
    
    // SvgPanZoom 
    svgPanZoom(myWorldMap.worldMap, { minZoom: 1, dblClickZoomEnabled: false }); 
    // Fadein with opacity 
    document.getElementById('svg-world-map-container').style.opacity = 1;
}

// Custom callback function for map click, defined in 'options.mapClick'
function mapClick(country) {
    var nation = country.country; // Get parent nation
    if (nation != undefined && country.id != 'Ocean') {
        var out = '<div class=row><div class="col">'
        var out = '<a class="hide" onclick="document.getElementById(\'info\').classList.add(\'hidden\')">×</a>';
        //out += '<br><br><a onmouseover="myWorldMap.over(\'' + nation.id + '\')" onmouseout="myWorldMap.out(\'' + nation.id + '\')" onclick="myWorldMap.click(\'' + nation.id + '\')">País: ' + nation.name + '</a>';
        out += '<br><br>Recompte de billionaris a ' + nation.name + ':<br><br>';
        out += '</div></div><div class="row"><div class="col">'

        idx = 0;
        for (var year in bpc) {
            // change the column
            if (idx >= 13) {
                out +='</div> <div class="col">'
            }
            bpc[year].map((countryObj) => {
                if (countryObj.country == nation.id) {
                    out += '<p> Any '+ year + ' # bilionaris = ' + countryObj.qty +'</p>'
                }
            });
            idx+=1;
        }
        out += '</div></div>'
        document.getElementById("info").innerHTML = out;
        document.getElementById("info").classList.remove("hidden");
    } else {
        document.getElementById("info").classList.add("hidden");
    }
}

function mapDate(tick) {
    console.log('mapDate ' + tick);
    document.getElementById("myDate").innerHTML = "El " + Object.keys(busTimeData[tick])[0];
    updateLollipop(tick, 800, loliCoord);
    updatePie(tick, 800, pieCoord); 
}

function loadLollipop(tagName) {
    // set the dimensions and margins of the graph
    var margin = {top: 30, right: 30, bottom: 70, left: 60};
    var viewport_width = screen.width * 7/12;
    var viewport_height = screen.height * 0.55;
    var width = viewport_width - margin.left - margin.right;
    var height = viewport_height - margin.top - margin.bottom - 200;

    // append the svg object to the body of the page
    var svg = d3.select(tagName)
    .append("svg")
        .attr("viewBox", "0 0 " + 
                    (viewport_width) + " " + 
                    (viewport_height))
        //.attr("width", width + margin.left + margin.right)
        //.attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Initialize the X axis
    var x = d3.scaleBand()
    .range([ 0, width ])
    .padding(1);
    var xAxis = svg.append("g")
    .attr("class", "myXaxis")
    .attr("transform", "translate(0," + height + ")")
    .style("stroke",'#009698')
    .style("font-size", "20px");

    // Initialize the Y axis
    var y = d3.scaleLinear()
    .range([ height, 0]);
    var yAxis = svg.append("g")
    .attr("class", "myYaxis")
    .style("stroke",'#009698')
    .style("font-size", "20px");

    svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 6)
    .attr("dy", ".75em")
    .style("stroke",'#009698')
    .style("font-size", "20px")
    .attr("transform", "rotate(-90)")
    .text("Nombre d'indústries");

    return { svg, x, xAxis, y, yAxis };

}
// A function that create / update the plot for a given variable:
function updateLollipop(tick, dur, { svg, x, xAxis, y, yAxis}) {

    // X axis
    if (busTimeData.length > 0) {
        data = Object.values(busTimeData[tick])[0];
        x.domain(data.map(function(d) { return d.business; }))
        xAxis
            .transition()
            .duration(dur)
            .call(d3.axisBottom(x))
            .selectAll("text")    
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", "-.5em")
            .attr("transform", "rotate(-90)")

    
        // Add Y axis
        y.domain([0, d3.max(data, function(d) { return +d.qty }) ]);
        yAxis
            .transition()
            .duration(dur)
            .call(d3.axisLeft(y));
    
        // variable u: map data to existing circle
        var j = svg.selectAll(".myLine")
            .remove();
        j = svg.selectAll(".myLine")
          .data(data);
        // update lines
        j
          .enter()
          .append("line")
          .attr("class", "myLine")
          .merge(j)
          .transition()
          .duration(dur)
            .attr("x1", function(d) { return x(d.business); })
            .attr("x2", function(d) { return x(d.business); })
            .attr("y1", y(0))
            .attr("y2", function(d) { return y(d.qty); })
            .attr("stroke","#ff6700")
    
        // variable u: map data to existing circle
        var u = svg.selectAll("circle").remove();
        
        u = svg.selectAll("circle")
          .data(data);
        // update bars
        u
          .enter()
          .append("circle")
          .merge(u)
          .transition()
          .duration(dur)
            .attr("cx", function(d) { return x(d.business); })
            .attr("cy", function(d) { return y(d.qty); })
            .attr("r", 8)
            .attr("fill", "#ff6700");
    }
}

function loadPie(tagName) {

    // set the dimensions and margins of the graph
    var viewport_width = screen.width * 5/12;
    var viewport_height = screen.width * 0.25;

    width = viewport_width
    height = viewport_height
    margin = 0
      
    // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
    var radius = Math.min(width, height) / 2 - margin

    // append the svg object to the div with id= tagName
    var svg = d3.select(tagName)
        .append("svg")
        .attr("viewBox", "0 0 " + (viewport_width) + " " + (viewport_height))
        .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    svg.append("g")
        .attr("class", "slices");
    svg.append("g")
        .attr("class", "labels")
        .style("fill","#009698")
        .style("font-size", "24px");
    svg.append("g")
        .attr("class", "lines")
        .style("fill","#009698");

    // Compute the position of each group on the pie:
    var pie = d3.pie()
        .sort(null)
        .value(function(d) {
            return d.qty;
        });
    
    var arc = d3.arc()
        .outerRadius(radius * 0.8)
        .innerRadius(radius * 0.4);
    
    var outerArc = d3.arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9);

    var color = d3.scaleOrdinal()
        .domain(['Unknown', '< 25y', '25y - 50y', '50y - 75y', '> 75y'])
        .range(["#ffbf00", "#ff8c00", "#ffba00", "#ff6700", "#ffcc00"]);
    
    return {radius, svg, pie, color, arc, outerArc}
}
function updatePie(tick, dur, { radius, svg, pie, color, arc, outerArc}) {
    
    // define the 'lambda' functions
    var key = function(d){ return d.data.age_range; };

    function midAngle(d){
        return d.startAngle + (d.endAngle - d.startAngle)/2;
    }

    if (ageTimeData.length > 0) {
        data = Object.values(ageTimeData[tick])[0];
    
        /* ------- PIE SLICES -------*/
        var slice = svg.select(".slices").selectAll("path.slice")
            .data(pie(data), key);

        slice.enter()
            .insert("path")
            .style("fill", function(d) { return color(d.data.age_range); })
            .attr("class", "slice");

        slice		
            .transition().duration(dur)
            .attrTween("d", function(d) {
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function(t) {
                    return arc(interpolate(t));
                };
            })

        slice.exit()
            .remove();

        /* ------- TEXT LABELS -------*/

        var text = svg.select(".labels").selectAll("text")
            .data(pie(data), key);

        text.enter()
            .append("text")
            .attr("dy", ".35em")
            .text(function(d) {
                return d.data.age_range;
            });

        text.transition().duration(dur)
            .attrTween("transform", function(d) {
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function(t) {
                    var d2 = interpolate(t);
                    var pos = outerArc.centroid(d2);
                    pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
                    return "translate("+ pos +")";
                };
            })
            .styleTween("text-anchor", function(d){
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function(t) {
                    var d2 = interpolate(t);
                    return midAngle(d2) < Math.PI ? "start":"end";
                };
            });
/*         text.style("fill","#009698")
            .style("font-size", "24px") */

        text.exit()
            .remove();

        /* ------- SLICE TO TEXT POLYLINES -------*/
        var polyline = svg.select(".lines").selectAll("polyline")
            .data(pie(data), key);
        
        polyline.enter()
            .append("polyline");

        polyline.transition().duration(dur)
            .attrTween("points", function(d){
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function(t) {
                    var d2 = interpolate(t);
                    var pos = outerArc.centroid(d2);
                    pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                    return [arc.centroid(d2), outerArc.centroid(d2), pos];
                };			
            });
        polyline.
            style("fill","none").
            style("stroke", '#009698').
            style("stroke-width", "1");

        polyline.exit()
            .remove();
    }
};

var bpc;
var bpb;
var bpa;
var cd;
var myWorldMap;
var countries;
var defaultTimeData = {};
var loliCoord;
var pieCoord;
var timeData = [];
var busTimeData = [];
var ageTimeData = [];

loadDataFromJSON('assets/vendors/SVG-World-Map-master/src/country-data.json').then((cd) => {
    // remove first element ('World')
    countries = Object.keys(cd);
    countries.splice(0, 1);

    time = 0;
    delay = 10;
    // create default timedata
    countries.forEach((item) => {
        defaultTimeData[item] = baseColor;
    });
    console.log(defaultTimeData);
});
// Wait for JSON data first, then init SVG World Map
loadDataFromJSON('assets/data/billionaires_per_country.json').then((data) => {
    bpc = JSON.parse(data);
    for (var year in bpc) {
        var td = Object.assign({}, defaultTimeData); 
        bpc[year].forEach((countryObj) => {
            delete td[countryObj.country];
            td[countryObj.country] = highColor;
        });
        timeObj = {};
        timeObj[year] = td;
        timeData.push(timeObj);
    }
    maxDates = timeData.length-1
});
loadDataFromJSON('assets/data/billionaires_per_business.json').then((data) => {
    bpb = JSON.parse(data);
    for (var year in bpb) {
        var businessData = Array();
        bpb[year].forEach((businessObj) => {
            delete businessObj.year;
            businessData.push(businessObj);
        });
        timeObj = {};
        timeObj[year] = businessData;
        busTimeData.push(timeObj);
    }    
});
loadDataFromJSON('assets/data/billionaires_per_age.json').then((data) => {
    bpa = JSON.parse(data);
    for (var year in bpa) {
        var ageData = Array();
        bpa[year].forEach((ageObj) => {
            delete ageObj.year;
            ageData.push(ageObj);
        });
        timeObj = {};
        timeObj[year] = ageData;
        ageTimeData.push(timeObj);
    }      
});

loadSVGWorldMap();
loliCoord = loadLollipop('#my_lolli_chart');
pieCoord = loadPie('#my_pie_chart')
