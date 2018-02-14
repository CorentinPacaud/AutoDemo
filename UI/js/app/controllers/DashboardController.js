app.controller('DashboardController', ['$scope', '$rootScope', '$state', '$interval', 'UtilService', 'DataService', function ($scope, $rootScope, $state, $interval, UtilService, DataService) {

    if ($rootScope.role == "Buyer") { $rootScope.pageTitle = "Acheteur"; }
    if ($rootScope.role == "Seller") { $rootScope.pageTitle = "Vendeur"; }

    $rootScope.selectedMenu = 'dashboard';
    $rootScope.pageIcon = "fa fa-file-text-o";
    console.log("DashboardController running");

    $scope.cars = [];
    $scope.offers = [];

    $scope.carLoading = false;

    $scope.statusPending = 0;
    $scope.statusRejected = 0;
    $scope.toBeAcquitted = 0;
    $scope.reflated = 0;

    function filterGlobal() {
        $('#dataTable').DataTable().search(
            $('#global_filter').val()
        ).draw();
    };

    function filterColumn(i) {
        //  console.log('Column  ', i);
        $('#dataTable').DataTable().column(i).search(
            $('#col' + i + '_filter').val()
        ).draw();
    };


    $(document).ready(function () {
        setTimeout(function () {
            //console.log("$('#dataTable')");
            $('#dataTable').DataTable({
                "scrollY": "350px",
                "scrollCollapse": true,
                "paging": false,
                "info": false,
                "searching": false,
                "order": [[4, "desc"]],
                "oLanguage": { "sZeroRecords": null, "sEmptyTable": null }
            });


            $.fn.dataTable.ext.search.push(
                function (settings, data, dataIndex) {
                    //  console.log('Toto');
                    var name = data[1];
                    if (name.contains($('#col1_filter').val())) {
                        return true;
                    }
                    return false;
                }
            );
            //console.log("oto : ", $.fn);

            var table = $('#dataTable').DataTable();

            $('input.global_filter').on('keyup click', function () {
                filterGlobal();
            });

            // $('input.column_filter').on('keyup click', function () {
            //     console.log("Column: ", $(this).parents('tr').attr('data-column'));
            //     filterColumn($(this).parents('tr').attr('data-column'));
            // });

            $('#col1_filter').keyup(function () {
                //  console.log('TEST');
                table.draw();
            });


            $('#myModal').on('shown.bs.modal', function () {
                $('#myInput').focus()
            })

        }, 1000);

    });

    $scope.rowClick = function (ele) {
        // console.log("Click: ", ele);
        //$rootScope.gotoCarById(ele);
    }


    $scope.carLoading = true;

    // DataService.getIssuers($rootScope.token).then(function (result) {
    //     console.log("ISSUERS : ", result);
    // })

    $scope.getSellers = function(){
        DataService.getSellers($rootScope.token).then(function (importResult) {
            console.log("Datas: ", importResult.data);
            


        });
        DataService.getBuyers($rootScope.token).then(function (importResult) {
            console.log("Buyers: ", importResult.data);
            


        });
    }
   // $scope.getSellers();


    $scope.getCars = function () {
        DataService.getCars($rootScope.token).then(function (importResult) {
            console.log("Datas: ", importResult.data.cars);
            if (importResult.data.status == "OK") {
                importResult.data.cars.sort(function (car1, car2) {
                    return new Date(car2.creationDate).getTime() - new Date(car1.creationDate).getTime();
                })
                $scope.cars = importResult.data.cars;

            } else {
                console.log("ECHEC: ", importResult.data);
            }
            $scope.carLoading = false;


        });
    }

    $scope.getOffers = function(){
        DataService.getAskSellCar($rootScope.token).then(function (importResult) {
            console.log("AskSellCar: ", importResult.data.askSellCar);
            if (importResult.data.status == "OK") {
               
                $scope.offers = importResult.data.askSellCar;

            } else {
                console.log("ECHEC: ", importResult.data);
            }
            $scope.carLoading = false;

        });
    }

    $scope.getOffers();


    $scope.getCars();

    $scope.updateData = function () {
        if ($state.current.name !== "dashboard") {
            $interval.cancel(timer);
            timer = undefined;
            return;
        }
        //$scope.getCars();
    }

    var timer = $interval(
        $scope.updateData, 5000, 0);

    $scope.proceed = function (car) {
        //$rootScope.gotoCarById(cars);
    };


    $scope.acceptSellCar = function (saleId) {
        var datas = { 'transaction': { 'saleId': saleId } };
        console.log("Accept Sale : ", datas);
        DataService.acceptSellCar($rootScope.token, datas).then(function (result) {
            console.log(result);
            if (result.data.status == 200 && result.data.statusText == "OK") {
                console.log("Accept SUCCESS");
                $scope.updateData();
            }
        });
    }

    console.log('Test');
    $scope.createParticipants = function(){

        console.log("Create Sellers");
        var sellers = [{'username':"Renault", 'companyName':"Renault Inc."},
        {'username':"Citroen", 'companyName':"Citroen Inc."}]

        sellers.forEach(function(ele){
            DataService.createSeller($rootScope.token, ele).then(function(result){
                console.log('Seller:',result);
            })
        });

        console.log("Create Buyers");

        var buyers = [{'username':"alice", 'firstname':"Alice", "lastname":"Jaco"},
        {'username':"bob", 'firstname':"Bob", "lastname":"Dupont"}]

        buyers.forEach(function(ele){
            DataService.createBuyer($rootScope.token, ele).then(function(result){
                console.log('Buyer:',result);
            })
        });
    }

    $scope.car = {'brand':"", 'model':""};

    $scope.createCar  = function(){
        if($scope.car.model !="" && $scope.car.brand !=""){
            DataService.buildCar($rootScope.token, $scope.car)
            .then(function(result){
                console.log("Build Car :", result);
                $scope.car = {'brand':"", 'model':""};
                $scope.getCars();
            });
        }
    }

    $scope.buyCar = function(carId){
        DataService.askSellCar($rootScope.token,{'carId':carId})
            .then(function(result){
                console.log("Sell Car :", result);
                $scope.car = {'brand':"", 'model':""};
                $scope.getCars();
                $scope.getOffers();
            });
    }

    $scope.sellCar = function(saleId){
        console.log("Sell Car:", saleId);
        DataService.acceptSellCar($rootScope.token,{'saleId':saleId})
            .then(function(result){
                console.log("Sell Car :", result);
                $scope.getCars();
                $scope.getOffers();
            });
    }

    $scope.refresh = function(){
        $scope.getOffers();
        $scope.getCars();
    }
}
]);
