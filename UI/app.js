var app = angular.module('DLTCar', ['ui.router', 'xeditable', "chart.js"]);

app.run(function ($rootScope, $location, $http, $interval, $templateCache, $state, $q, DataService) {
  $templateCache.removeAll();
  console.log("app is running now. removed all cached templates");

  $rootScope.notifications = [];

  $rootScope.userIsAuthenticated = false;

  $rootScope.selectedMenu = "";

  $rootScope.back = function () {
    window.history.back();
  };


  $rootScope.gotoDashboard = function (filter) {
    $state.go('dashboard');
  }

  $rootScope.gotoRegistre = function (filter) {
    $state.go('registre');
  }

  $rootScope.gotoBuildCar = function () {
    $state.go('buildCar');
  }

  $rootScope.gotoTransactions = function () {
    $state.go('historian');
  }



  $rootScope.formatDateTime = function (date) {
    return $rootScope.formatDate(date) + ' ' + $rootScope.formatTime(date);
  }

  $rootScope.formatTime = function (date) {
    return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
  }

  $rootScope.formatDate = function (date) {
    var strArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var d = date.getDate();
    var m = strArray[date.getMonth()];
    var y = date.getFullYear();
    return '' + (d <= 9 ? '0' + d : d) + '-' + m + '-' + y;
  }


});
