app.controller('HistorianController', ['$scope', '$rootScope', '$state', 'DataService',
    function ($scope, $rootScope, $state, DataService) {
        $scope.history = [];
        $rootScope.selectedMenu = 'transactions';

        console.log("Role : ", $rootScope.user);
        DataService.getHistorian($rootScope.token).then((results) => {
            console.log("Historian : ", results.data.historian);
            results.data.historian.sort(function (a, b) { return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime() });
            $scope.history = results.data.historian;
        });


        $scope.details = function (rec) {
            DataService.getHistorianById($rootScope.token, rec.recId).then((results) => {
                console.log("Record : ", results.data.record);
                swal('Détail de l\'enregistrement :', JSON.stringify(results.data.record));
            });
        }


        
        // DataService.getIssuers($rootScope.token).then(function (importResult) {
        //     if (importResult.data.status == "OK") {
        //         console.log('SUCCESS: ', importResult.data);
        //         console.log("IssuerParticipants length : ", importResult.data.IssuerParticipants.length);

        //     } else {
        //         console.log("ECHEC: ", importResult.data);
        //     }
        // });


    }]);

