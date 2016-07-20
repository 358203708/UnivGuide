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
    citycontextUI.config.mapboxMapId = 'rentable.4c1de95f';
    citycontextUI.config.mapboxToken = 'pk.eyJ1IjoicmVudGFibGUiLCJhIjoiNnFqUXgzUSJ9.xh6htS8Vscyxyf89mCSn6Q';
    citycontextUI.config.userKey = '2d9a92fdef94711b0818519b770e38c8'
    var transportWidget = citycontextUI.TransportWidget('#transport-widget', {
        displayForm: false
    }).render();
    //   transportWidget.queryByLatLon('51.623066,-3.983703');
    var criminalityWidget = citycontextUI.CriminalityWidget('#criminality-widget', {
        displayForm: false
    }).render();
    //   criminalityWidget.queryByLatLon('51.623066,-3.983703');
    var demographicsWidget = citycontextUI.DemographicsWidget('#demographics-widget', {
        displayForm: false
    }).render();
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
        console.log($scope.pubukprn);
        console.log($scope.kisCourseId);
        console.log($scope.kisMode);
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
            console.log($scope.courseInfo);
            console.log($scope.courseLoc);
            /*Maps*/
            NgMap.getMap().then(function (map) {
                $scope.map = map;
                $scope.universityInfo = [];
                $scope.universityInfo.push($scope.result[1].data[0].Latitude, $scope.result[1].data[0].Longitude, $scope.result[1].data[0].Name, $scope.result[0].data.Title, $scope.result[0].data.KisMode, $scope.result[0].data.CoursePageUrl);
                // console.log($scope.universityInfo);
                transportWidget.queryByLatLon($scope.universityInfo[0] + ',' + $scope.universityInfo[1]);
                criminalityWidget.queryByLatLon($scope.universityInfo[0] + ',' + $scope.universityInfo[1]);
                demographicsWidget.queryByLatLon($scope.universityInfo[0] + ',' + $scope.universityInfo[1]);
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
            });
            //            function showCurrentCity(d) {
            //                current_city_id = d.id;
            //                $('#city_name').html(d.name + ', ' + d.sys.country);
            //            }
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
                    if (forecast[i].sys.pod == 'd') html = html + '<div style="float: left; margin-left:3px; padding-left:14px; padding-right:12px; text-align: center;" >';
                    else html = html + '<div style="float: left; margin-left:3px; padding-left:14px; padding-right:12px; text-align: center; background-color:#eeeeee" >';
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
        });
    });
});