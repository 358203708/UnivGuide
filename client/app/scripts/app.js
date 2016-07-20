'use strict';
/**
 * @ngdoc overview
 * @name clientApp
 * @description
 * # clientApp
 *
 * Main module of the application.
 */
angular.module('clientApp', [
    'ngRoute', 'ngSanitize', 'restangular', 'ngTable', 'algoliasearch', 'algolia.autocomplete', 'ngMap', 'ui.bootstrap'
  ]).config(function ($routeProvider, RestangularProvider) {
    $routeProvider.when('/about', {
        templateUrl: 'views/about.html'
        , controller: 'AboutCtrl'
    }).when('/university', {
        templateUrl: 'views/university.html'
        , controller: 'UniversityCtrl'
    }).when('/ranking', {
        templateUrl: 'views/ranking.html'
        , controller: 'RankingCtrl'
    }).when('/', {
        templateUrl: 'views/main.html'
        , controller: 'MainCtrl'
    }).otherwise({
        redirectTo: '/'
    });
});