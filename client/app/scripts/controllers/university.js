'use strict';
/**
 * @ngdoc function
 * @name clientApp.controller:UniversityCtrl
 * @description
 * # UniversityCtrl
 * Controller of the clientApp
 */
angular.module('clientApp').config(['$httpProvider', function ($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
}]).controller('UniversityCtrl', function ($scope, $http, $q, $sce, algolia, NgMap) {
    /*Citycontext widget*/
    //    citycontextUI.config.mapboxMapId = 'rentable.4c1de95f';
    //    citycontextUI.config.mapboxToken = 'pk.eyJ1IjoicmVudGFibGUiLCJhIjoiNnFqUXgzUSJ9.xh6htS8Vscyxyf89mCSn6Q';
    //    citycontextUI.config.userKey = '2d9a92fdef94711b0818519b770e38c8'
    //    var transportWidget = citycontextUI.TransportWidget('#transport-widget', {
    //        displayForm: false
    //    }).render();
    //    //   transportWidget.queryByLatLon('51.623066,-3.983703');
    //    var criminalityWidget = citycontextUI.CriminalityWidget('#criminality-widget', {
    //        displayForm: false
    //    }).render();
    //   criminalityWidget.queryByLatLon('51.623066,-3.983703');
    //    var demographicsWidget = citycontextUI.DemographicsWidget('#demographics-widget', {
    //        displayForm: false
    //    }).render();
    //   demographicsWidget.queryByLatLon('50.907916,-1.400318');
    /*Algolia search widget*/
    var client = algolia.Client('4NHNQEE2ZH', '14a0b4fc5ebaddc5f6372146de81f6f0');
    var index = client.initIndex('kisData');
    var templateTeam = Hogan.compile('<div class="team">' + '<div class="name">{{{ _highlightResult.NAME.value }}}</div>' + '<div class="location">{{{ _highlightResult.TITLE.value }}}</div>' + '<div class="location">{{{ _highlightResult.MODE.value }}}</div>' + '</div>');
    $scope.getDatasets = function () {
        return {
            source: algolia.sources.hits(index, {
                hitsPerPage: 10
            })
            , displayKey: 'NAME,TITLE,MODE'
            , templates: {
                suggestion: function (suggestion) {
                    //    return suggestion._highlightResult.NAME.value;
                    return templateTeam.render(suggestion);
                    //   return $sce.trustAsHtml($scope.templates);
                }
            }
        };
    };
    $scope.$on('autocomplete:selected', function (event, suggestion, dataset) {
        //console.log(suggestion);
        $scope.pubukprn = suggestion.UKPRN;
        $scope.kisCourseId = suggestion.KISCOURSEID;
        $scope.kisMode = suggestion.MODE;
        $scope.name = suggestion.NAME;
        console.log($scope.pubukprn);
        console.log($scope.kisCourseId);
        console.log($scope.kisMode);
        console.log($scope.name);
        $scope.isShow = function (suggestion) {
            if (suggestion == []) return false;
            else return true;
        };
        console.log(suggestion);
        /*Send GET quries to UniStats API */
        var result = [];
        var promises = [];
        promises.push($http.get('http://localhost:3000/hello/' + $scope.pubukprn + '/Course/' + $scope.kisCourseId + '/' + $scope.kisMode
            //'/hello/:pubukprn/Course/:kisCourseId/:kisMode'
        ));
        promises.push($http.get('http://localhost:3000/hello/' + $scope.pubukprn + '/Course/' + $scope.kisCourseId + '/' + $scope.kisMode + '/Locations'));
        promises.push($http.get('http://localhost:3000/hello/' + $scope.pubukprn + '/Course/' + $scope.kisCourseId + '/' + $scope.kisMode + '/Stages'));
        promises.push($http.get('http://localhost:3000/hello/' + $scope.pubukprn + '/Course/' + $scope.kisCourseId + '/' + $scope.kisMode + '/Statistics'));
        $q.all(promises).
        then(function (response) {
            //   console.log(data);
            $scope.result = response;
            console.log($scope.result);
            console.log($scope.result[0].data);
            console.log($scope.result[1].data[0]);
            $scope.courseInfo = [];
            $scope.courseLoc = [];
            //   $scope.courseInfo.push($scope.result[0].data);
            $scope.courseInfo = $scope.result[0].data;
            $scope.courseLoc = $scope.result[1].data[0];
            //            $scope.courseStat = $scope.result[1].data[1];
            console.log($scope.courseInfo);
            console.log($scope.courseLoc);
            //             console.log($scope.courseStat);
            /*Course Location Maps*/
            NgMap.getMap().then(function (map) {
                $scope.map = map;
                $scope.universityInfo = [];
                $scope.universityInfo.push($scope.result[1].data[0].Latitude, $scope.result[1].data[0].Longitude, $scope.result[1].data[0].Name, $scope.result[0].data.Title, $scope.result[0].data.KisMode, $scope.result[0].data.CoursePageUrl);
                // console.log($scope.universityInfo);
                //                transportWidget.queryByLatLon($scope.universityInfo[0] + ',' + $scope.universityInfo[1]);
                //                criminalityWidget.queryByLatLon($scope.universityInfo[0] + ',' + $scope.universityInfo[1]);
                //                demographicsWidget.queryByLatLon($scope.universityInfo[0] + ',' + $scope.universityInfo[1]);
            });
            /*Course statistics visualisation*/
            var chartSeries = [];
            /*Weather forecast visualisation*/
            var forecast = [];
            var daily = [];
            var time_zone = 1000 * (new Date().getTimezoneOffset()) * (-60);
            var month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Avg", "Sen", "Oct", "Nov", "Dec"];
            $(function () {
                // Get the CSV and create the chart
                $.getJSON('http://api.openweathermap.org/data/2.5/forecast?lat=' + $scope.result[1].data[0].Latitude + '&lon=' + $scope.result[1].data[0].Longitude + '&units=metric&appid=7910a9e3a5d82b39a8f86c6049fc9c85', showForecast);
                $.getJSON('http://api.openweathermap.org/data/2.5/forecast/daily?lat=' + $scope.result[1].data[0].Latitude + '&lon=' + $scope.result[1].data[0].Longitude + '&units=metric&cnt=14&appid=7910a9e3a5d82b39a8f86c6049fc9c85', showForecastDaily);
                //                $.getJSON("/data/2.5/forecast?callback=?lat=" + $scope.result[1].data[0].Latitude + "&lon=" + $scope.result[1].data[0].Longitude + "&units=metric&appid=b1b15e88fa797225412429c1c50c122a", showForecast);
                //                $.getJSON("/data/2.5/forecast/daily?callback=?lat=" + $scope.result[1].data[0].Latitude + "&lon=" + $scope.result[1].data[0].Longitude + "&units=metric&cnt=14&appid=b1b15e88fa797225412429c1c50c122a", showForecastDaily);
            });

            function showForecast(d) {
                if (!d.list) {
                    console.log(d);
                }
                console.log(d);
                forecast = d.list;
                showForecastSmall();
                showHourlyForecastChart();
            }

            function showForecastDaily(d) {
                console.log(d);
                daily = d.list;
                showDailyChart();
            };

            function showHourlyForecastChart() {
                var curdate = new Date((new Date()).getTime() - 180 * 60 * 1000);
                var cnt = 0;
                var time = new Array();
                var tmp = new Array();
                var wind = new Array();
                var prcp = new Array();
                for (var i = 0; i < forecast.length; i++) {
                    var dt = new Date(forecast[i].dt * 1000);
                    if (curdate > dt) continue;
                    if (cnt > 10) break;
                    cnt++;
                    tmp.push(Math.round(10 * (forecast[i].main.temp)) / 10);
                    time.push(new Date(forecast[i].dt * 1000 + time_zone));
                    wind.push(forecast[i].speed);
                    var p = 0;
                    if (forecast[i]['rain'] && forecast[i]['rain']['3h']) p += forecast[i]['rain']['3h'];
                    if (forecast[i]['snow'] && forecast[i]['snow']['3h']) p += forecast[i]['snow']['3h'];
                    prcp.push(Math.round(p * 10) / 10);
                }
                $('#chart_small').highcharts({
                    chart: {
                        zoomType: 'xy'
                    }
                    , title: {
                        text: 'Next Hours'
                    }
                    , xAxis: {
                        categories: time
                        , type: 'datetime'
                        , labels: {
                            formatter: function () {
                                return Highcharts.dateFormat('%H:%M', this.value);
                            }
                        }
                    }
                    , yAxis: [
                        {
                            labels: {
                                format: '{value}°C'
                                , style: {
                                    color: '#666666'
                                }
                            }
                            , opposite: false
                            , title: {
                                text: 'Temp'
                                , style: {
                                    color: '#666666'
                                }
                            }
            }, {
                            labels: {
                                format: '{value}mm'
                                , style: {
                                    color: '#666666'
                                }
                            }
                            , opposite: true
                            , title: {
                                text: 'Precipitation'
                                , style: {
                                    color: '#666666'
                                }
                            }
            }]
                    , tooltip: {
                        useHTML: true
                        , shared: true
                        , formatter: function () {
                            var s = '<small>' + Highcharts.dateFormat('%d %b. %H:%M', this.x) + '</small><table>';
                            $.each(this.points, function (i, point) {
                                s += '<tr><td style="color:' + point.series.color + '">' + point.series.name + ': </td>' + '<td style="text-align: right"><b>' + point.y + '</b></td></tr>';
                            });
                            return s + '</table>';
                        }
                    }
                    , legend: {
                        enabled: true
                    }
                    , credits: {
                        enabled: false
                    }
                    , exporting: {
                        enabled: false
                    }
                    , series: [
                        {
                            name: 'Precipitation'
                            , type: 'column'
                            , color: '#a0cc9f'
                            , yAxis: 1
                            , data: prcp
            }, {
                            name: 'Temperature'
                            , type: 'spline'
                            , color: '#cc9fa0'
                            , data: tmp
            }]
                });
            };

            function showForecastSmall() {
                var curdate = new Date((new Date()).getTime() - 180 * 60 * 1000);
                var html = ''
                var cnt = 0;
                for (var i = 0; i < forecast.length; i++) {
                    var dt = new Date(forecast[i].dt * 1000);
                    if (curdate > dt) continue;
                    if (cnt > 10) break;
                    cnt++;
                    var temp = Math.round(10 * (forecast[i].main.temp)) / 10;
                    var tmin = Math.round(10 * (forecast[i].main.temp_min)) / 10;
                    var tmax = Math.round(10 * (forecast[i].main.temp_max)) / 10;
                    var text = forecast[i].weather[0].description;
                    var gust = forecast[i].wind.speed;
                    var pressure = forecast[i].main.pressure;
                    var cloud = forecast[i].clouds.all;
                    var icon = forecast[i].weather[0].icon;
                    if (forecast[i].sys.pod == 'd') html = html + '<div style="float: left; margin-left:10px; margin-right:6px; padding-left:16px; padding-right:12px; text-align: center;" >';
                    else html = html + '<div style="float: left; margin-left:10px; margin-right:6px; padding-left:16px; padding-right:12px; text-align: center; background-color:#eeeeee" >';
                    html = html + '<img alt="' + text + '" src="/img/w/' + icon + '.png"/>\
                        		<div class="small_val" title="Temp">' + forecast[i].main.temp + 'C</div>\
                        		<div class="small_val" title="Wind">' + forecast[i].wind.speed + 'm/s</div>\
                        		<div class="small_val_grey" title="Pressure">' + forecast[i].main.pressure + '</div>\
                        		</div>';
                }
                $("#forecast_small").html(html);
            };

            function showDailyChart() {
                var time = new Array();
                var tmp = new Array();
                var tmpr = new Array();
                var rain = new Array();
                var snow = new Array();
                //var prcp = new Array();
                //var wind = new Array();
                for (var i = 0; i < daily.length - 1; i++) {
                    tmp.push(Math.round(10 * (daily[i].temp.day)) / 10);
                    var dt = new Date(daily[i].dt * 1000 + time_zone);
                    time.push(dt);
                    var tmpi = Math.round(10 * (daily[i].temp.min)) / 10;
                    var tmpa = Math.round(10 * (daily[i].temp.max)) / 10;
                    tmpr.push([tmpi, tmpa]);
                    if (daily[i]['rain']) {
                        rain.push(Math.round(daily[i]['rain'] * 100) / 100);
                    }
                    else {
                        rain.push(0);
                    }
                    if (daily[i]['snow']) {
                        snow.push(Math.round(daily[i]['snow'] * 100) / 100);
                    }
                    else {
                        snow.push(0);
                    }
                }
                $('#dailyChart').highcharts({
                    chart: {
                        //    zoomType: 'xy'
                        type: 'column'
                    }
                    , title: {
                        text: 'Daily Forecast'
                    }
                    , xAxis: {
                        categories: time
                        , type: 'datetime'
                        , labels: {
                            formatter: function () {
                                return Highcharts.dateFormat('%d %b', this.value);
                            }
                        }
                    }
                    , yAxis: [
                        {
                            labels: {
                                format: '{value}°C'
                                , style: {
                                    color: '#666666'
                                }
                            }
                            , title: {
                                text: 'Temp'
                                , style: {
                                    color: '#666666'
                                }
                            }
            }, {
                            labels: {
                                format: '{value} mm'
                                , style: {
                                    color: '#666666'
                                }
                            }
                            , opposite: true
                            , title: {
                                text: 'Precipitation'
                                , style: {
                                    color: '#666666'
                                }
                            }
            }]
                    , tooltip: {
                        useHTML: true
                        , shared: true
                        , formatter: function () {
                            var s = '<small>' + Highcharts.dateFormat('%d %b', this.x) + '</small><table>';
                            $.each(this.points, function (i, point) {
                                //console.log(point);
                                if (point.y != 0) s += '<tr><td style="color:' + point.series.color + '">' + point.series.name + ': </td>' + '<td style="text-align: right"><b>' + point.y + '</b></td></tr>';
                            });
                            return s + '</table>';
                        }
                    }
                    , plotOptions: {
                        column: {
                            stacking: 'normal'
                        }
                    }
                    , legend: {
                        enabled: true
                    }
                    , credits: {
                        enabled: false
                    }
                    , exporting: {
                        enabled: false
                    }
                    , series: [
                        {
                            name: 'Snow'
                            , type: 'column'
                            , color: '#9fa0cc'
                            , yAxis: 1
                            , data: snow
                            , stack: 'precipitation'
            }
                    , {
                            name: 'Rain'
                            , type: 'column'
                            , color: '#a0cc9f'
                            , yAxis: 1
                            , data: rain
                            , stack: 'precipitation'
            }
                    , {
                            name: 'Temperature'
                            , type: 'spline'
                            , color: '#cc9fa0'
                            , data: tmp
            }
                    , {
                            name: 'Temperature min'
                            , data: tmpr
                            , type: 'arearange'
                            , lineWidth: 0
                            , linkedTo: ':previous'
                            , color: Highcharts.getOptions().colors[0]
                            , fillOpacity: 0.3
                            , zIndex: 0
		    }
            ]
                });
            };
            /*Criminality*/
            function CrimeMap(domId) {
                this.domId = domId;
                this.latLong = {};
                this.markers = [];
                this.crimeData = {};
                renderMap();
                setupListeners();
//                getLastUpdated();
            };

            function renderMap() {
                var mapExists = document.getElementById("map-canvas");
                //                var mapCenter = new google.maps.LatLng($scope.result[1].data[0].Latitude, $scope.result[1].data[0].Longitude);
                var mapCenter = new google.maps.LatLng('51.5150', '0.0300');
                if (mapExists) {
                    this.map = new google.maps.Map(document.getElementById(this.domId), {
                        center: mapCenter
                        , zoom: 13
                        , mapTypeId: google.maps.MapTypeId.ROADMAP
                        , mapTypeControl: false
                        , disableDefaultUI: true
                        , zoomControl: true
                        , zoomControlOptions: {
                            style: google.maps.ZoomControlStyle.LARGE
                            , position: google.maps.ControlPosition.RIGHT_BOTTOM
                        }
                    })
                };
            };

            function getCrimeData(date) {
                var dateString = ''
                    , self = this;
                if (date) {
                    dateString = '&date=' + date;
                }
                $.getJSON("http://data.police.uk/api/crimes-street/all-crime?lat=" + $scope.result[1].data[0].Latitude + "&lng=" + $scope.result[1].data[0].Longitude + dateString, function (data) {
                    self.crimeData = data;
                    if (self.crimeData.length > 0) {
                        console.log(crimeData);
                        self.organiseData();
                        self.plotCrimes();
                        self.prepareDataSummary();
                    }
                    else {
                        console.log('No results for this location');
                    }
                });
            };

//            function getLastUpdated() {
//                var self = this;
//                self.lastUpdated = {};
//                $.getJSON("http://data.police.uk/api/crime-last-updated", function (data) {
//                    self.lastUpdated.rawDate = new Date(data.date);
//                    if (self.lastUpdated.rawDate !== 'Invalid Date') {
//                        self.lastUpdated.curr_month_num = self.lastUpdated.rawDate.getMonth() + 1; //Months are zero based
//                        self.lastUpdated.curr_year_num = self.lastUpdated.rawDate.getFullYear();
//                    }
//                    self.updateDropdown();
//                });
//            };
//
//            function updateDropdown() {
//                var lastStaticMonth = 2;
//                if (this.lastUpdated.curr_month_num > lastStaticMonth) {
//                    var monthsToBuild = this.lastUpdated.curr_month_num - lastStaticMonth;
//                    for (var i = 0; i < monthsToBuild; ++i) {
//                        var genMonth = (+lastStaticMonth + i + 1);
//                        if (genMonth < 10) {
//                            genMonth = ('0' + genMonth);
//                        }
//                        $('#month').prepend('<option value="2015-' + genMonth + '">' + monthNames[+genMonth - 1] + ' 2015</option>');
//                    }
//                }
//                $('#month')[0].selectedIndex = 0;
//            };

            function clearMarkers() {
                for (var i = 0; i < this.markers.length; i++) {
                    this.markers[i].setMap(null);
                }
                this.markers = new Array();
            };

            function setupListeners() {
                var self = this;
                $('#month').on('change', function () {
                    self.getCrimeData($(this).val());
                });
            };

            function organiseData() {
                this.crimes = {};
                for (var i = 0; i < this.crimeData.length; ++i) {
                    if (!this.crimes[this.crimeData[i].location.latitude]) {
                        this.crimes[this.crimeData[i].location.latitude] = [];
                        this.crimes[this.crimeData[i].location.latitude].push(this.crimeData[i]);
                    }
                    else {
                        this.crimes[this.crimeData[i].location.latitude].push(this.crimeData[i]);
                    }
                }
            };

            function prepareDataSummary() {
                var self = this
                    , mostCommonCrime;
                $('#no-of-crimes').text(this.crimeData.length);
                mostCommonCrime = Object.keys(this.categories).sort(function (a, b) {
                    return -(self.categories[a] - self.categories[b])
                });
                this.buildPie();
                mostCommonCrime = mostCommonCrime[0].replace(/\-/g, '');
                $('#crime-type').text(categories[mostCommonCrime].name).css('color', categories[mostCommonCrime].tooltip);
                if (!this.isMobile()) {
                    $('#details').show();
                }
            };

            function buildPie() {
                var data = []
                    , i, width = 200
                    , height = 200
                    , radius = Math.min(width, height) / 2
                    , color, arc, pie, svg, g;
                $('#chart').empty();
                for (i in this.categories) {
                    data.push({
                        'cat': i
                        , 'no': this.categories[i]
                    });
                }
                color = d3.scale.ordinal().range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
                arc = d3.svg.arc().outerRadius(radius - 10).innerRadius(45);
                pie = d3.layout.pie().sort(null).value(function (d) {
                    return d.no;
                });
                svg = d3.select("#chart").append("svg").attr("width", width).attr("height", height).append("g").attr("transform", "translate(" + width / 1.9 + "," + height / 2.2 + ")");
                g = svg.selectAll(".arc").data(pie(data)).enter().append("g").attr("class", "arc").on(this.ev, function (d) {
                    $("#tooltip").html('<p><strong>' + d.data.cat.replace(/\-/g, ' ') + ':</strong> ' + d.data.no + ' crimes</p>').css("top", y + 10).css("left", x + 10).show();
                }).on('mousemove', function (d) {
                    $("#tooltip").css("top", y + 10).css("left", x + 10);
                }).on('mouseout', function (d) {
                    $("#tooltip").html('').hide();
                });
                g.append("path").attr("d", arc).style("fill", function (d) {
                    return categories[d.data.cat.replace(/\-/g, '')].tooltip;
                });
                g.append("text").attr("transform", function (d) {
                    return "translate(" + arc.centroid(d) + ")";
                }).attr("dy", ".35em").style("text-anchor", "middle");
                if (!this.isMobile()) {
                    $('#chart').show();
                }
                this.buildKey();
            };

            function getCircle(size, cat) {
                size = size + 4;
                var colour = categories[cat.replace(/\-/g, '')];
                var circle = {
                    path: google.maps.SymbolPath.CIRCLE
                    , fillColor: '' + colour.tooltip + ''
                    , fillOpacity: 0.7
                    , scale: size
                    , strokeColor: '#888'
                    , strokeWeight: 1
                };
                return circle;
            };

            function buildKey() {
                var key = $('<ul id="key"></ul>')
                    , listItem;
                for (var i in this.categories) {
                    listItem = $('<li><span class="circle" style="background-color:' + categories[i.replace(/\-/g, '')].tooltip + '"></span><span>' + i.replace(/\-/g, ' ') + '</span></li>');
                    key.append(listItem);
                }
                $('#chart').append(key);
            };
            /* This method should definitely not be doing so much - it should be refactored */
            function plotCrimes() {
                var crimes = this.crimes
                    , i, j, p, outcome, marker, self = this
                    , size, loc, list, crimeType, categoriesCurr, curr, co, mode, ev, point, infowindow;
                this.categories = {};
                this.clearMarkers();
                this.hideLoader();
                for (i in crimes) {
                    mode = {};
                    size = crimes[i].length;
                    //work out the mean of the returned crimes
                    for (j = 0; j < size; ++j) {
                        crimeType = crimes[i][j].category;
                        if (!this.categories[crimeType]) {
                            this.categories[crimeType] = 1;
                        }
                        else {
                            categoriesCurr = this.categories[crimeType];
                            this.categories[crimeType] = categoriesCurr + 1;
                        }
                        if (!mode[crimeType]) {
                            mode[crimeType] = 1;
                        }
                        else {
                            curr = mode[crimeType];
                            mode[crimeType] = curr + 1;
                        }
                    }
                    //sort the data for the location numerically - greatest to smallest
                    co = Object.keys(mode).sort(function (a, b) {
                        return -(mode[a] - mode[b])
                    });
                    loc = new google.maps.LatLng(crimes[i][0].location.latitude, crimes[i][0].location.longitude);
                    list = this.buildLocationCrimeList(mode, co);
                    var currMonth = $('#month option:selected').text();
                    if (size > 1) {
                        crimes[i].markerContent = '<div class="infodiv" style="width: 300px;"><h4><strong>' + size + ' crimes reported ' + crimes[i][0].location.street.name + ' in ' + currMonth + '</strong></h4><br />' + ' ' + list + '</div>'
                    }
                    else {
                        crimes[i].markerContent = '<div class="infodiv" style="width: 300px"><h4><strong>' + size + ' crime reported ' + crimes[i][0].location.street.name + ' in ' + currMonth + '</strong></h4><br />' + ' ' + list + '</div>'
                    }
                    marker = new google.maps.Marker({
                        icon: this.getCircle(size, co[0])
                        , position: loc
                        , map: this.map
                        , zIndex: 400
                    });
                    this.markers.push(marker);
                    point = new google.maps.Point(0, 350);
                    infowindow = new google.maps.InfoWindow({
                        content: crimes[i].markerContent
                        , anchorPoint: point
                    });
                    google.maps.event.addListener(marker, this.ev, (function (pointer, bubble, mode) {
                        return function () {
                            self.bubbleChart(bubble);
                            bubble.open(self.map, pointer);
                        }
                    })(marker, infowindow, mode));
                    google.maps.event.addListener(marker, 'mouseout', (function (pointer, bubble) {
                        return function () {
                            bubble.close(self.map);
                        }
                    })(marker, infowindow));
                    this.panAndZoom();
                }
            };

            function buildLocationCrimeList(modeList, ordered) {
                var i, list = ''
                    , currentCat, singlePlural = 's';
                for (i = 0; i < ordered.length; ++i) {
                    currentCat = ordered[i].replace(/\-/g, '');
                    modeList[ordered[i]] === 1 ? singlePlural = '' : singlePlural = 's';
                    list += '<li><span class="circle" style="background-color:' + categories[currentCat].tooltip + '"></span>' + modeList[ordered[i]] + ' count' + singlePlural + ' of <span style="color:' + categories[currentCat].tooltip + '">' + ordered[i].replace(/\-/g, ' ') + '</span></li>';
                }
                return '<ul>' + list + '</ul>';
            };

            function bubbleChart(marker) {
                var svg = d3.select().append("svg").attr("width", 300).attr("height", 300).attr("class", "bubble");
            };

            function panAndZoom() {
                var ltln = new google.maps.LatLng(this.lat, this.lng);
                this.map.panTo(ltln);
                this.map.setZoom(15);
            };
            var monthNames = [
        "Jan", "Feb", "Mar"
        , "Apr", "May", "Jun"
        , "Jul", "Aug", "Sep"
        , "Oct", "Nov", "Dec"
    ];
            var categories = {
                othertheft: {
                    tooltip: '#4B3E4D'
                    , name: 'Other theft'
                }
                , vehiclecrime: {
                    tooltip: '#1E8C93'
                    , name: 'Vehicle crime'
                }
                , antisocialbehaviour: {
                    tooltip: '#679208'
                    , name: 'Antisocial behaviour'
                }
                , criminaldamagearson: {
                    tooltip: '#C4AC30'
                    , name: 'Criminal Damage or Arson'
                }
                , violentcrime: {
                    tooltip: '#D31900'
                    , name: 'Violent crime'
                }
                , shoplifting: {
                    tooltip: '#305AA1'
                    , name: 'Shoplifting'
                }
                , burglary: {
                    tooltip: '#FF6600'
                    , name: 'Burglary'
                }
                , publicorder: {
                    tooltip: '#7CB490'
                    , name: 'Public Order'
                }
                , publicdisorderweapons: {
                    tooltip: 'grey'
                    , name: 'Public disorder weapons'
                }
                , bicycletheft: {
                    tooltip: '#680148'
                    , name: 'Bicycle Theft'
                }
                , drugs: {
                    tooltip: '#7DB4B5'
                    , name: 'Drugs'
                }
                , othercrime: {
                    tooltip: '#FF1168'
                    , name: 'Other crime'
                }
                , possessionofweapons: {
                    tooltip: 'brown'
                    , name: 'Possession of weopons'
                }
                , theftfromtheperson: {
                    tooltip: '#DBD8A2'
                    , name: 'Theft from the person'
                }
                , robbery: {
                    tooltip: 'silver'
                    , name: 'Robbery'
                }
            };
            $(document).mousemove(function (e) {
                window.x = e.pageX;
                window.y = e.pageY;
            });
            $(function () {
                new CrimeMap('map_canvas');
            });
        });
    });
});