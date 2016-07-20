var forecast = [];
var daily = [];
var time_zone = 1000 * (new Date().getTimezoneOffset()) * (-60);
$(function () {
            // Get the CSV and create the chart
            $.getJSON('http://api.openweathermap.org/data/2.5/forecast?lat=35&lon=139&appid=7910a9e3a5d82b39a8f86c6049fc9c85', showForecastDaily);

            function showForecastDaily(d) {
                console.log(d);
                daily = d.list;
                showDailyChart();
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
                $('#chart').highcharts({
                    chart: {
                        //    zoomType: 'xy'
                        type: 'column'
                    }
                    , title: NaN
                    , xAxis: {
                        categories: time
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
                                    color: 'blue'
                                }
                            }
                            , title: {
                                text: 'Temp'
                                , style: {
                                    color: 'blue'
                                }
                            }
            }, {
                            labels: {
                                format: '{value} mm'
                                , style: {
                                    color: '#909090'
                                }
                            }
                            , opposite: true
                            , title: {
                                text: 'Precipitation'
                                , style: {
                                    color: '#4572A7'
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
                    , legend: NaN
                    , series: [
                        {
                            name: 'Snow'
                            , type: 'column'
                            , color: '#909090'
                            , yAxis: 1
                            , data: snow
                            , stack: 'precipitation'
            }
                        , {
                            name: 'Rain'
                            , type: 'column'
                            , color: '#B0B0B0'
                            , yAxis: 1
                            , data: rain
                            , stack: 'precipitation'
            }
                        , {
                            name: 'Temperature'
                            , type: 'spline'
                            , color: 'blue'
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
            }