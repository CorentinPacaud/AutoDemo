app.controller('CarController', ['$scope', '$rootScope', '$state', 'UtilService', 'DataService', function ($scope, $rootScope, $state, UtilService, DataService) {

  $rootScope.pageTitle = "Nouvelle voiture";
  $rootScope.selectedMenu = 'newcar';
  $rootScope.pageIcon = "fa fa-file-text-o";


  console.log("CarController running ");


  $scope.isValid = function () {
    return true
  }

  $scope.createCar = function () {
    console.log('Create Car');

    DataService.buildCar($rootScope.token, datas).then(
      function (result) {
        console.log("Result:  ", result);
        if (result.status == 200 && result.data.created === true) {
          swal({ title: 'Voiture créée avec succès', text: '', type: 'success', confirmButtonText: "Ok" }).then((result) => {
            $rootScope.gotoDashboard();
          }
          );
        } else {
          swal({ title: 'Une erreur est survenue', text: result, type: 'warning', confirmButtonText: "Ok" });
        }
      }
    )
  }
}
]);
