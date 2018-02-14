app.controller('AuthController', ['$scope', '$rootScope', '$state', 'UtilService', 'DataService', function ($scope, $rootScope, $state, UtilService, DataService) {

  $scope.username = "";
  $scope.password = "";

  $rootScope.pageTitle = "Login";
  $rootScope.userFullName = "";
  $rootScope.token = "";

  $scope.loginLoading = false;

  console.log("AuthController running");

  $rootScope.createRiskCarrier = function () {
    $state.go('riskcarrier-add');
  }

  $scope.error = "";

  $scope.authenticate = function () {
    console.log("username", $scope.username, "pwd", $scope.password);
    $scope.loginLoading = true;
    DataService.auth($scope.username, $scope.password).then(function (authResult) {
      try {

        if (authResult.data.status == "AUTHENTICATED") {

          $rootScope.user = authResult.data.participant;
          $rootScope.username = authResult.data.participant.companyName;
          $rootScope.token = authResult.data.token;
          $rootScope.role = authResult.data.participant.role;
          console.log(authResult.data.participant);
          console.log("ROLE :", $rootScope.role);
          $rootScope.codeTCC = authResult.data.participant.codeTCC;
          // TODO Add codeTTC

          if ($scope.username != "admin") {
            $state.go("dashboard");
          }
          else {
            //swal('Authenticated!', '', 'success');
            $state.go("dashboard");
  
          }
          $rootScope.userIsAuthenticated = true;
        }
        else {
          swal(
            'Authentication failed',
            authResult.data.reason,
            'error'
          );
        }
        $scope.loginLoading = false;
      }
      catch (e) {
        //console.log(e);
        swal(
          'Authentication failed',
          '',
          'error'
        );
        $scope.loginLoading = false;
      }
    });
  }

}]);
