angular.module('DLTCar').config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise('/login');
    $stateProvider

        // admin
        .state('login', {
            url: '/login',
            templateUrl: 'templates/login.html'
        })
        .state('dashboard', {
            url: '/dashboard',
            templateUrl: 'templates/dashboard.html'
        })
        .state('registre', {
            url: '/registre',
            templateUrl: 'templates/registre.html'
        })
        .state('buildCar', {
            url: '/buildCar',
            templateUrl: 'templates/car.html'
        })
        .state('historian', {
            url: '/historian',
            templateUrl: 'templates/historian.html'
        })
});

