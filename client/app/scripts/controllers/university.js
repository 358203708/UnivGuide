'use strict';
/**
 * @ngdoc function
 * @name clientApp.controller:UniversityCtrl
 * @description
 * # UniversityCtrl
 * Controller of the clientApp
 */
angular.module('clientApp').config(['$httpProvider', function($httpProvider) {
  $httpProvider.defaults.useXDomain = true;
  delete $httpProvider.defaults.headers.common['X-Requested-With'];
}]).controller('UniversityCtrl', function($scope, $http, $q, $sce, algolia, $window) {
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
  $scope.getDatasets = function() {
    return {
      source: algolia.sources.hits(index, {
        hitsPerPage: 10
      }),
      displayKey: 'NAME,TITLE,MODE',
      templates: {
        suggestion: function(suggestion) {
          //    return suggestion._highlightResult.NAME.value;
          return templateTeam.render(suggestion);
          //   return $sce.trustAsHtml($scope.templates);
        }
      }
    };
  };
  $scope.$on('autocomplete:selected', function(event, suggestion, dataset) {
    //console.log(suggestion);
    $scope.pubukprn = suggestion.UKPRN;
    $scope.kisCourseId = suggestion.KISCOURSEID;
    $scope.kisMode = suggestion.MODE;
    $scope.name = suggestion.NAME;
    console.log($scope.pubukprn);
    console.log($scope.kisCourseId);
    console.log($scope.kisMode);
    console.log($scope.name);
    $scope.isShow = function(suggestion) {
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
    then(function(response) {
      //   console.log(data);
      $scope.result = response;
      //   console.log($scope.result);
      //   console.log($scope.result[0].data);
      //   console.log($scope.result[1].data[0]);
      $scope.courseInfo = [];
      $scope.courseLoc = [];
      //   $scope.courseInfo.push($scope.result[0].data);
      $scope.courseInfo = $scope.result[0].data;
      $scope.courseLoc = $scope.result[1].data[0];
      //            $scope.courseStat = $scope.result[1].data[1];
      //   console.log($scope.courseInfo);
      //   console.log($scope.courseLoc);

      //             console.log($scope.courseStat);

      $scope.universityInfo = [];
      $scope.universityInfo.push($scope.result[1].data[0].Latitude, $scope.result[1].data[0].Longitude, $scope.result[1].data[0].Name, $scope.result[0].data.Title, $scope.result[0].data.KisMode, $scope.result[0].data.CoursePageUrl);
      /*Course Location Maps*/
      //   NgMap.getMap().then(function(map) {
      //     $scope.map = map;
      //     $scope.universityInfo = [];
      //     $scope.universityInfo.push($scope.result[1].data[0].Latitude, $scope.result[1].data[0].Longitude, $scope.result[1].data[0].Name, $scope.result[0].data.Title, $scope.result[0].data.KisMode, $scope.result[0].data.CoursePageUrl);
      //     // console.log($scope.universityInfo);
      //     //                transportWidget.queryByLatLon($scope.universityInfo[0] + ',' + $scope.universityInfo[1]);
      //     //                criminalityWidget.queryByLatLon($scope.universityInfo[0] + ',' + $scope.universityInfo[1]);
      //     //                demographicsWidget.queryByLatLon($scope.universityInfo[0] + ',' + $scope.universityInfo[1]);
      //   });

      $(document).ready(function() {
        initializeLocationMap();
      });

      var mapCenter = {
        lat: $scope.result[1].data[0].Latitude,
        lng: $scope.result[1].data[0].Longitude
      };



      function CenterControl(controlDiv, map) {

        // Set CSS for the control border.
        var controlUI = document.createElement('div');
        controlUI.style.backgroundColor = '#fff';
        controlUI.style.border = '2px solid #fff';
        controlUI.style.borderRadius = '3px';
        controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
        controlUI.style.cursor = 'pointer';
        controlUI.style.marginBottom = '22px';
        controlUI.style.textAlign = 'center';
        controlUI.style.margin = '10px';
        controlUI.title = 'Click to recenter the map';
        controlDiv.appendChild(controlUI);

        // Set CSS for the control interior.
        var controlText = document.createElement('div');
        controlText.style.color = 'black';
        controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
        controlText.style.fontSize = '12px';
        controlText.style.lineHeight = '30px';
        controlText.style.paddingLeft = '5px';
        controlText.style.paddingRight = '5px';
        controlText.innerHTML = 'Center Map';
        controlUI.appendChild(controlText);

        // Setup the click event listeners: simply set the map to Chicago.
        controlUI.addEventListener('click', function() {
          map.setCenter(mapCenter);
        });

      };



      function initializeLocationMap() {
        var myLatLng = {
          lat: $scope.result[1].data[0].Latitude,
          lng: $scope.result[1].data[0].Longitude
        };

        var bounds = new google.maps.LatLngBounds;
        var markersArray = [];
        var london = {
          lat: 51.507351,
          lng: -0.127758

        };
        var edinburgh = {
          lat: 55.953252,
          lng: -3.188267

        };

        var manchester = {
          lat: 53.480759,
          lng: -2.242631
        };

        var cardiff = {
          lat: 51.481581,
          lng: -3.17909
        };

        var destinationIcon = 'https://chart.googleapis.com/chart?' +
          'chst=d_map_pin_letter&chld=D|FF0000|000000';
        var originIcon = 'https://chart.googleapis.com/chart?' +
          'chst=d_map_pin_letter&chld=O|FFFF00|000000';
        // console.log(myLatLng);
        // Create a map object and specify the DOM element for display.
        var locationMap = new google.maps.Map(document.getElementById('locationMap'), {
          center: myLatLng,
          scrollwheel: false,
          zoom: 9,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          mapTypeControl: true,
          disableDefaultUI: false,
          zoomControl: true,
          zoomControlOptions: {
            style: google.maps.ZoomControlStyle.LARGE,
            position: google.maps.ControlPosition.RIGHT_BOTTOM
          }
        });

        var geocoder = new google.maps.Geocoder;

        var service = new google.maps.DistanceMatrixService;

        service.getDistanceMatrix({
          origins: [myLatLng],
          destinations: [london, edinburgh, manchester, cardiff],
          travelMode: 'DRIVING',
          //   travelMode: google.maps.DirectionsTravelMode.TRANSIT,

          unitSystem: google.maps.UnitSystem.METRIC,
          avoidHighways: false,
          avoidTolls: false
        }, function(response, status) {
          if (status !== 'OK') {
            alert('Error was: ' + status);
          } else {
            var originList = response.originAddresses;
            var destinationList = response.destinationAddresses;
            var outputDiv = document.getElementById('output');
            outputDiv.innerHTML = '';
            deleteMarkers(markersArray);

            var showGeocodedAddressOnMap = function(asDestination) {
              var icon = asDestination ? destinationIcon : originIcon;
              return function(results, status) {
                if (status === 'OK') {
                  locationMap.fitBounds(bounds.extend(results[0].geometry.location));
                  markersArray.push(new google.maps.Marker({
                    map: locationMap,
                    position: results[0].geometry.location,
                    icon: icon
                  }));
                } else {
                  alert('Geocode was not successful due to: ' + status);
                }
              };
            };

            for (var i = 0; i < originList.length; i++) {
              var results = response.rows[i].elements;
              geocoder.geocode({
                  'address': originList[i]
                },
                showGeocodedAddressOnMap(false));
              for (var j = 0; j < results.length; j++) {
                geocoder.geocode({
                    'address': destinationList[j]
                  },
                  showGeocodedAddressOnMap(true));
                // outputDiv.innerHTML += '<div>''</div>'originList[i] + ' to ' + destinationList[j] +
                //   ': ' + results[j].distance.text + ' in ' +
                //   results[j].duration.text + '<br>';
                outputDiv.innerHTML += '<div>' + ' To ' + '<strong>' + destinationList[j] + '</strong>' +
                  ': ' + results[j].distance.text + ' in ' +
                  results[j].duration.text + '<br><br>' + '</div>';
              }
            }
          }
        });

        // Create the DIV to hold the control and call the CenterControl()
        // constructor passing in this DIV.
        var centerControlDiv = document.createElement('div');
        var centerControl = new CenterControl(centerControlDiv, locationMap);
        centerControlDiv.index = 1;
        locationMap.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);


        // Create a marker and set its position.
        // var marker = new google.maps.Marker({
        //   map: locationMap,
        //   position: myLatLng
        //     //   setMap: locationMap
        //     //   animation: google.maps.Animation.BOUNCE
        // });



        // var contentString = '<div id="bodyContent">' +
        //   '<p> ' + '<b>Location:</b> ' + $scope.name + '/ ' + $scope.universityInfo[2] + '</p>' + '<p>' + '<b> Course: </b> ' + $scope.universityInfo[3] + '</p>' + '<p>' + ' <b> Mode: </b> ' + $scope.universityInfo[4] + '</p>' + '<p>' + ' <b> Course Page: </b> ' + '<a href="{{universityInfo[5]}}" target="_blank">' + $scope.universityInfo[5] +
        //   '</a>' + ' </p>' +
        //   ' </div>'
        // var infowindow = new google.maps.InfoWindow({
        //   content: contentString
        // });
        // google.maps.event.addListener(marker, 'click', function() {
        //   infowindow.open(locationMap, marker);
        // });
        // infowindow.open(locationMap, marker);
      };

      function deleteMarkers(markersArray) {
        for (var i = 0; i < markersArray.length; i++) {
          markersArray[i].setMap(null);
        }
        markersArray = [];
      }

      /*Course statistics visualisation*/
      var chartSeries = [];
      /*Weather forecast visualisation*/
      var forecast = [];
      var daily = [];
      var time_zone = 1000 * (new Date().getTimezoneOffset()) * (-60);
      var month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Avg", "Sen", "Oct", "Nov", "Dec"];
      $(function() {
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
        // console.log(d);
        forecast = d.list;
        showForecastSmall();
        showHourlyForecastChart();
      }

      function showForecastDaily(d) {
        // console.log(d);
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
          },
          title: {
            text: 'Next Hours'
          },
          xAxis: {
            categories: time,
            type: 'datetime',
            labels: {
              formatter: function() {
                return Highcharts.dateFormat('%H:%M', this.value);
              }
            }
          },
          yAxis: [{
            labels: {
              format: '{value}°C',
              style: {
                color: '#666666'
              }
            },
            opposite: false,
            title: {
              text: 'Temp',
              style: {
                color: '#666666'
              }
            }
          }, {
            labels: {
              format: '{value}mm',
              style: {
                color: '#666666'
              }
            },
            opposite: true,
            title: {
              text: 'Precipitation',
              style: {
                color: '#666666'
              }
            }
          }],
          tooltip: {
            useHTML: true,
            shared: true,
            formatter: function() {
              var s = '<small>' + Highcharts.dateFormat('%d %b. %H:%M', this.x) + '</small><table>';
              $.each(this.points, function(i, point) {
                s += '<tr><td style="color:' + point.series.color + '">' + point.series.name + ': </td>' + '<td style="text-align: right"><b>' + point.y + '</b></td></tr>';
              });
              return s + '</table>';
            }
          },
          legend: {
            enabled: true
          },
          credits: {
            enabled: false
          },
          exporting: {
            enabled: false
          },
          series: [{
            name: 'Precipitation',
            type: 'column',
            color: '#a0cc9f',
            yAxis: 1,
            data: prcp
          }, {
            name: 'Temperature',
            type: 'spline',
            color: '#cc9fa0',
            data: tmp
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
          } else {
            rain.push(0);
          }
          if (daily[i]['snow']) {
            snow.push(Math.round(daily[i]['snow'] * 100) / 100);
          } else {
            snow.push(0);
          }
        }
        $('#dailyChart').highcharts({
          chart: {
            //    zoomType: 'xy'
            type: 'column'
          },
          title: {
            text: 'Daily Forecast'
          },
          xAxis: {
            categories: time,
            type: 'datetime',
            labels: {
              formatter: function() {
                return Highcharts.dateFormat('%d %b', this.value);
              }
            }
          },
          yAxis: [{
            labels: {
              format: '{value}°C',
              style: {
                color: '#666666'
              }
            },
            title: {
              text: 'Temp',
              style: {
                color: '#666666'
              }
            }
          }, {
            labels: {
              format: '{value} mm',
              style: {
                color: '#666666'
              }
            },
            opposite: true,
            title: {
              text: 'Precipitation',
              style: {
                color: '#666666'
              }
            }
          }],
          tooltip: {
            useHTML: true,
            shared: true,
            formatter: function() {
              var s = '<small>' + Highcharts.dateFormat('%d %b', this.x) + '</small><table>';
              $.each(this.points, function(i, point) {
                //console.log(point);
                if (point.y != 0) s += '<tr><td style="color:' + point.series.color + '">' + point.series.name + ': </td>' + '<td style="text-align: right"><b>' + point.y + '</b></td></tr>';
              });
              return s + '</table>';
            }
          },
          plotOptions: {
            column: {
              stacking: 'normal'
            }
          },
          legend: {
            enabled: true
          },
          credits: {
            enabled: false
          },
          exporting: {
            enabled: false
          },
          series: [{
            name: 'Snow',
            type: 'column',
            color: '#9fa0cc',
            yAxis: 1,
            data: snow,
            stack: 'precipitation'
          }, {
            name: 'Rain',
            type: 'column',
            color: '#a0cc9f',
            yAxis: 1,
            data: rain,
            stack: 'precipitation'
          }, {
            name: 'Temperature',
            type: 'spline',
            color: '#cc9fa0',
            data: tmp
          }, {
            name: 'Temperature min',
            data: tmpr,
            type: 'arearange',
            lineWidth: 0,
            linkedTo: ':previous',
            color: Highcharts.getOptions().colors[0],
            fillOpacity: 0.3,
            zIndex: 0
          }]
        });
      };
      /*Criminality*/
      function CrimeMap(domId) {
        this.domId = domId;
        this.latLong = {};
        this.markers = [];
        this.crimeData = {};
        this.renderMap();
        this.getCrimeData();
        this.setupListeners();
        this.getLastUpdated();
      };
      CrimeMap.prototype.getLastUpdated = function() {
        var self = this;
        this.lastUpdated = {};
        $.getJSON("http://data.police.uk/api/crime-last-updated", function(data) {
          self.lastUpdated.rawDate = new Date(data.date);
          if (self.lastUpdated.rawDate !== 'Invalid Date') {
            self.lastUpdated.curr_month_num = self.lastUpdated.rawDate.getMonth() + 1; //Months are zero based
            self.lastUpdated.curr_year_num = self.lastUpdated.rawDate.getFullYear();
          }
          self.updateDropdown();
        });
      };
      CrimeMap.prototype.updateDropdown = function() {
        var lastStaticMonth = 2;
        if (this.lastUpdated.curr_month_num > lastStaticMonth) {
          var monthsToBuild = this.lastUpdated.curr_month_num - lastStaticMonth;
          for (var i = 0; i < monthsToBuild; ++i) {
            var genMonth = (+lastStaticMonth + i + 1);
            if (genMonth < 10) {
              genMonth = ('0' + genMonth);
            }
            $('#month').prepend('<option value="2015-' + genMonth + '">' + monthNames[+genMonth - 1] + ' 2015</option>');
          }
        }
        $('#month')[0].selectedIndex = 0;
      };
      //Render the initial map on the River Thames - ala Eastenders intro
      CrimeMap.prototype.renderMap = function() {
        var eastenders = new google.maps.LatLng('51.5150', '0.0300');
        this.map = new google.maps.Map(document.getElementById(this.domId), {
          center: eastenders,
          zoom: 13,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          mapTypeControl: false,
          disableDefaultUI: true,
          zoomControl: true,
          zoomControlOptions: {
            style: google.maps.ZoomControlStyle.LARGE,
            position: google.maps.ControlPosition.RIGHT_BOTTOM
          }
        });



      };
      CrimeMap.prototype.clearMarkers = function() {
        for (var i = 0; i < this.markers.length; i++) {
          this.markers[i].setMap(null);
        }
        this.markers = new Array();
      };
      CrimeMap.prototype.setupListeners = function() {
        var self = this;
        $('#month').on('change', function() {
          self.getCrimeData($(this).val());
        });
        //                $("input:text:visible:first").focus();
      };
      CrimeMap.prototype.getCrimeData = function(date) {
        var dateString = '',
          self = this;
        if (date) {
          dateString = '&date=' + date;
        }
        //                if (pos) {
        //                    this.lat = pos.coords.latitude;
        //                    this.lng = pos.coords.longitude;
        //                }
        // this.showLoader();
        $.getJSON("http://data.police.uk/api/crimes-street/all-crime?lat=" + $scope.result[1].data[0].Latitude + "&lng=" + $scope.result[1].data[0].Longitude + dateString, function(data) {
          self.crimeData = data;
          if (self.crimeData.length > 0) {
            // console.log(self.crimeData);
            self.organiseData();
            self.plotCrimes();
            self.prepareDataSummary();
          } else {
            console.log('No results for this location');
          }
        }, function() {
          console.log('Lookup failed. Try again');
        });
      };
      CrimeMap.prototype.organiseData = function() {
        this.crimes = {};
        for (var i = 0; i < this.crimeData.length; ++i) {
          if (!this.crimes[this.crimeData[i].location.latitude]) {
            this.crimes[this.crimeData[i].location.latitude] = [];
            this.crimes[this.crimeData[i].location.latitude].push(this.crimeData[i]);
          } else {
            this.crimes[this.crimeData[i].location.latitude].push(this.crimeData[i]);
          }
        }
      };
      CrimeMap.prototype.prepareDataSummary = function() {
        var self = this,
          mostCommonCrime;
        $('#no-of-crimes').text(this.crimeData.length);
        mostCommonCrime = Object.keys(this.categories).sort(function(a, b) {
          return -(self.categories[a] - self.categories[b])
        });
        this.buildPie();
        mostCommonCrime = mostCommonCrime[0].replace(/\-/g, '');
        $('#crime-type').text(categories[mostCommonCrime].name).css('color', categories[mostCommonCrime].tooltip);
        // if (!this.isMobile()) {
        //     $('#details').show();
        // }
      };
      CrimeMap.prototype.buildPie = function() {
        var data = [],
          i, width = 200,
          height = 200,
          radius = Math.min(width, height) / 2,

          color, arc, pie, svg, g;
        // this.ev = 'mouseover';

        $('#chart').empty();
        for (i in this.categories) {
          data.push({
            'cat': i,
            'no': this.categories[i]
          });
        }
        color = d3.scale.ordinal().range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
        arc = d3.svg.arc().outerRadius(radius - 10).innerRadius(35);
        pie = d3.layout.pie().sort(null).value(function(d) {
          return d.no;
        });
        svg = d3.select("#chart").append("svg").attr("width", width).attr("height", height).append("g").attr("transform", "translate(" + width / 1.9 + "," + height / 2.2 + ")");
        g = svg.selectAll(".arc").data(pie(data)).enter().append("g").attr("class", "arc").on('mouseover', function(d) {
          $("#tooltip").html('<p><strong>' + d.data.cat.replace(/\-/g, ' ') + ':</strong> ' + d.data.no + ' crimes</p>').css("top", y + 10).css("left", x + 10).show();
        }).on('mousemove', function(d) {
          $("#tooltip").css("top", y + 10).css("left", x + 10);
        }).on('mouseout', function(d) {
          $("#tooltip").html('').hide();
        });
        g.append("path").attr("d", arc).style("fill", function(d) {
          return categories[d.data.cat.replace(/\-/g, '')].tooltip;
        });
        g.append("text").attr("transform", function(d) {
          return "translate(" + arc.centroid(d) + ")";
        }).attr("dy", ".35em").style("text-anchor", "middle");

        this.buildKey();
      };
      CrimeMap.prototype.getCircle = function(size, cat) {
        size = size + 4;
        var colour = categories[cat.replace(/\-/g, '')];
        var circle = {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '' + colour.tooltip + '',
          fillOpacity: 0.7,
          scale: size,
          strokeColor: '#888',
          strokeWeight: 1
        };
        return circle;
      };
      CrimeMap.prototype.buildKey = function() {
        var key = $('<ul id="key" ></ul>'),
          listItem;
        for (var i in this.categories) {
          listItem = $('<li><span class="circle" style="background-color:' + categories[i.replace(/\-/g, '')].tooltip + '"></span><span>' + i.replace(/\-/g, ' ') + '</span></li>');
          key.append(listItem);
        }
        $('#chart').append(key);
      };
      /* This method should definitely not be doing so much - it should be refactored */
      CrimeMap.prototype.plotCrimes = function() {
        var crimes = this.crimes,
          i, j, p, outcome, marker, self = this,
          size, loc, list, crimeType, categoriesCurr, curr, co, mode, ev, point, infowindow;
        this.categories = {};
        this.clearMarkers();
        // this.hideLoader();
        for (i in crimes) {
          mode = {};
          size = crimes[i].length;
          //work out the mean of the returned crimes
          for (j = 0; j < size; ++j) {
            crimeType = crimes[i][j].category;
            if (!this.categories[crimeType]) {
              this.categories[crimeType] = 1;
            } else {
              categoriesCurr = this.categories[crimeType];
              this.categories[crimeType] = categoriesCurr + 1;
            }
            if (!mode[crimeType]) {
              mode[crimeType] = 1;
            } else {
              curr = mode[crimeType];
              mode[crimeType] = curr + 1;
            }
          }
          //sort the data for the location numerically - greatest to smallest
          co = Object.keys(mode).sort(function(a, b) {
            return -(mode[a] - mode[b])
          });
          loc = new google.maps.LatLng(crimes[i][0].location.latitude, crimes[i][0].location.longitude);
          list = this.buildLocationCrimeList(mode, co);
          var currMonth = $('#month option:selected').text();
          if (size > 1) {
            crimes[i].markerContent = '<div class="infodiv" style="width: 300px;"><h4><strong>' + size + ' crimes reported ' + crimes[i][0].location.street.name + ' in ' + currMonth + '</strong></h4><br />' + ' ' + list + '</div>'
          } else {
            crimes[i].markerContent = '<div class="infodiv" style="width: 300px"><h4><strong>' + size + ' crime reported ' + crimes[i][0].location.street.name + ' in ' + currMonth + '</strong></h4><br />' + ' ' + list + '</div>'
          }
          marker = new google.maps.Marker({
            icon: this.getCircle(size, co[0]),
            position: loc,
            map: this.map,
            zIndex: 400
          });
          this.markers.push(marker);
          point = new google.maps.Point(0, 350);
          infowindow = new google.maps.InfoWindow({
            content: crimes[i].markerContent,
            anchorPoint: point
          });
          google.maps.event.addListener(marker, 'mouseover', (function(pointer, bubble, mode) {
            return function() {
              self.bubbleChart(bubble);
              bubble.open(self.map, pointer);
            }
          })(marker, infowindow, mode));
          google.maps.event.addListener(marker, 'mouseout', (function(pointer, bubble) {
            return function() {
              bubble.close(self.map);
            }
          })(marker, infowindow));
          this.panAndZoom();
        }
      };
      CrimeMap.prototype.buildLocationCrimeList = function(modeList, ordered) {
        var i, list = '',
          currentCat, singlePlural = 's';
        for (i = 0; i < ordered.length; ++i) {
          currentCat = ordered[i].replace(/\-/g, '');
          modeList[ordered[i]] === 1 ? singlePlural = '' : singlePlural = 's';
          list += '<li><span class="circle" style="background-color:' + categories[currentCat].tooltip + '"></span>' + modeList[ordered[i]] + ' count' + singlePlural + ' of <span style="color:' + categories[currentCat].tooltip + '">' + ordered[i].replace(/\-/g, ' ') + '</span></li>';
        }
        return '<ul>' + list + '</ul>';
      };
      CrimeMap.prototype.bubbleChart = function(marker) {
        var svg = d3.select().append("svg").attr("width", 300).attr("height", 300).attr("class", "bubble");
      };
      CrimeMap.prototype.panAndZoom = function() {
        var ltln = new google.maps.LatLng($scope.result[1].data[0].Latitude, $scope.result[1].data[0].Longitude);
        this.map.panTo(ltln);
        this.map.setZoom(15);
      };
      //   CrimeMap.prototype.showLoader = function() {
      //     $('.loading').show();
      //   };
      //   CrimeMap.prototype.hideLoader = function() {
      //     $('.loading').hide();
      //   };
      var monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];
      var categories = {
        othertheft: {
          tooltip: '#4B3E4D',
          name: 'Other theft'
        },
        vehiclecrime: {
          tooltip: '#1E8C93',
          name: 'Vehicle crime'
        },
        antisocialbehaviour: {
          tooltip: '#679208',
          name: 'Antisocial behaviour'
        },
        criminaldamagearson: {
          tooltip: '#C4AC30',
          name: 'Criminal Damage or Arson'
        },
        violentcrime: {
          tooltip: '#D31900',
          name: 'Violent crime'
        },
        shoplifting: {
          tooltip: '#305AA1',
          name: 'Shoplifting'
        },
        burglary: {
          tooltip: '#FF6600',
          name: 'Burglary'
        },
        publicorder: {
          tooltip: '#7CB490',
          name: 'Public Order'
        },
        publicdisorderweapons: {
          tooltip: 'grey',
          name: 'Public disorder weapons'
        },
        bicycletheft: {
          tooltip: '#680148',
          name: 'Bicycle Theft'
        },
        drugs: {
          tooltip: '#7DB4B5',
          name: 'Drugs'
        },
        othercrime: {
          tooltip: '#FF1168',
          name: 'Other crime'
        },
        possessionofweapons: {
          tooltip: 'brown',
          name: 'Possession of weopons'
        },
        theftfromtheperson: {
          tooltip: '#DBD8A2',
          name: 'Theft from the person'
        },
        robbery: {
          tooltip: 'silver',
          name: 'Robbery'
        }
      };
      $(document).mousemove(function(e) {
        window.x = e.pageX;
        window.y = e.pageY;
      });
      $(function() {
        new CrimeMap('map_canvas');
      });




      /*Transport Map*/
      //   $(document).ready(function() {
      //     initializeTransportMap();
      //   });

      //   var infowindow;
      //   var service;
      //   var transportMap;
      //

      //   function initializeTransportMap() {
      //
      //     var transportLatLng = {
      //       lat: $scope.result[1].data[0].Latitude,
      //       lng: $scope.result[1].data[0].Longitude
      //     };
      //
      //      transportMap = new google.maps.Map(document.getElementById('transportMap'), {
      //
      //       center: transportLatLng,
      //       scrollwheel: false,
      //       zoom: 15,
      //       mapTypeId: google.maps.MapTypeId.ROADMAP,
      //     //   mapTypeId: google.maps.MapTypeId.HYBRID,
      //       mapTypeControl: true,
      //       disableDefaultUI: false,
      //       zoomControl: true,
      //       zoomControlOptions: {
      //         style: google.maps.ZoomControlStyle.LARGE,
      //         position: google.maps.ControlPosition.RIGHT_BOTTOM
      //       }
      //     });
      //
      //     var request = {
      //       location: transportLatLng,
      //       radius: 5000,
      //       types: ['train_station', 'bus_station', 'subway_station', 'transit_station','airport'，'grocery_or_supermarket','hospital','movie_theater','restaurant','shopping_center','park','night_club','pharmacy','police','embassy','shopping_mall']
      //     };
      //     infowindow = new google.maps.InfoWindow();
      //     service = new google.maps.places.PlacesService(transportMap);
      //     service.search(request, callback);
      //   }
      //
      //   function callback(results, status) {
      //     if (status == google.maps.places.PlacesServiceStatus.OK) {
      //       for (var i = 0; i < results.length; i++) {
      //         createMarker(results[i]);
      //       }
      //     }
      //   }

      //   function createMarker(place) {
      //
      //     var placeLoc = place.geometry.location;
      //     var marker = new google.maps.Marker({
      //       map: transportMap,
      //       position: place.geometry.location,
      //       icon: {
      //         url: 'http://maps.gstatic.com/mapfiles/circle.png',
      //         anchor: new google.maps.Point(10, 10),
      //         scaledSize: new google.maps.Size(10, 17)
      //       }
      //     });
      //
      //
      //     var content = '<strong style="font-size:1.2em">' + place.name + '</strong>' +
      //       '<br/><strong>Type:</strong> ' + place.types[0] +
      //       '<br/><strong>Rating:</strong> ' + (place.rating || 'n/a');
      //     var more_content = '<img src=""/>';
      //
      //     //make a request for further details
      //     service.getDetails({
      //       reference: place.reference
      //     }, function(place, status) {
      //       if (status == google.maps.places.PlacesServiceStatus.OK) {
      //         more_content = '<hr/><strong><a href="' + place.url + '" target="details">Details</a>';
      //
      //         if (place.website) {
      //           more_content += '<br/><br/><strong><a href="' + place.website + '" target="details">' + place.website + '</a>';
      //         }
      //       }
      //     });
      //     console.log(place);
      //
      //     google.maps.event.addListener(marker, 'click', function() {
      //
      //       infowindow.setContent(content + more_content);
      //       infowindow.open(transportMap, this);
      //     });
      //   }

      var infowindow;
      var service;
      var transportMap;
      var markersArray = [];
      var options = ['train_station', 'bus_station', 'subway_station', 'transit_station', 'airport',
        'grocery_or_supermarket', 'hospital', 'movie_theater', 'restaurant', 'shopping_center', 'park', 'night_club', 'pharmacy', 'police', 'embassy', 'shopping_mall'
      ];

      $(document).ready(function() {
        initializeTransportMap();

        setupListeners();

      });

      function getLetteredIcon(letter) {
        return "http://www.google.com/mapfiles/marker" + letter + ".png";
      }

      function initializeTransportMap() {
        var transportLatLng = {
          lat: $scope.result[1].data[0].Latitude,
          lng: $scope.result[1].data[0].Longitude
        };

        transportMap = new google.maps.Map(document.getElementById('transportMap'), {

          center: transportLatLng,
          scrollwheel: false,
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          //   mapTypeId: google.maps.MapTypeId.HYBRID,
          mapTypeControl: true,
          disableDefaultUI: false,
          zoomControl: true,
          zoomControlOptions: {
            style: google.maps.ZoomControlStyle.LARGE,
            position: google.maps.ControlPosition.RIGHT_BOTTOM
          }
        });

        infowindow = new google.maps.InfoWindow();
        service = new google.maps.places.PlacesService(transportMap);


        var defaultMarker = 'http://maps.google.com/mapfiles/kml/shapes/ranger_station.png';
        var marker = new google.maps.Marker({
          position: transportLatLng,
          map: transportMap,
          icon: defaultMarker,
          title: 'Hello World!'
        });
        google.maps.event.addListenerOnce(transportMap, 'bounds_changed', performSearch);

        // for (var i = 0; i < options.length; i++) {
        //   document.getElementById('options').innerHTML += '<input type="checkbox" id="' + options[i] + '" onclick="performSearch();"> <img src=' + getLetteredIcon(String.fromCharCode('A'.charCodeAt(0) + i)) + ' height="20" /> ' + options[i] + '<br>';
        // };
        for (var i = 0; i < options.length; i++) {
          document.getElementById('options').innerHTML += '<input type="checkbox" id="' + options[i] + '" > <img src=' + getLetteredIcon(String.fromCharCode('A'.charCodeAt(0) + i)) + ' height="20" /> ' + options[i] + '<br>';
        };

      }




      function setupListeners() {

        $('#input :checkbox').on('change', function() {
          performSearch();
        });
        //                $("input:text:visible:first").focus();
      }


      function performSearch() {
        clearMaps();
        var clickedOptions = [];
        for (var i = 0; i < options.length; i++) {
          if (document.getElementById(options[i]).checked) {
            performTypeSearch(options[i], getLetteredIcon(String.fromCharCode('A'.charCodeAt(0) + i)));
          }
        }
      }

      function performTypeSearch(type, icon) {
        var request = {
          //   bounds: transportMap.getBounds(),
          location: transportLatLng,
          radius: 5000,
          types: [type]
        };
        service.radarSearch(request, function(results, status) {
          if (status != google.maps.places.PlacesServiceStatus.OK) {
            alert(type + ":" + status);
            return;
          }
          for (var i = 0, result; result = results[i]; i++) {
            createMarker(result, icon);

          }
        });
      }

      function createMarker(place, icon) {
        var marker = new google.maps.Marker({
          map: transportMap,
          position: place.geometry.location,
          icon: icon

        });
        markersArray.push(marker);

        google.maps.event.addListener(marker, 'click', function() {
          service.getDetails(place, function(result, status) {
            if (status != google.maps.places.PlacesServiceStatus.OK) {
              alert(status);
              return;
            }
            infoWindow.setContent(result.name);
            infoWindow.open(transportMap, marker);
          });
        });
      }

      function clearMaps() {
        for (var i = 0; i < markersArray.length; i++) {
          markersArray[i].setMap(null);
        }
        markersArray.length = 0;
      }





    });
  });
});
