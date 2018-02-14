app.controller('RegistreController', ['$scope', '$rootScope', '$state', 'UtilService', 'DataService', function ($scope, $rootScope, $state, UtilService, DataService) {

    $rootScope.pageTitle = "Registre - Emetteur";

    console.log("DashboardController running");

    $rootScope.selectedMenu = 'registre';
    $rootScope.pageIcon = "fa fa-users";

    $scope.fileContent = "";

    $scope.shCollection = [];

    $rootScope.loading = false; // display the fa-spinner for the alert

    $scope.registreLoading = false;


    function filterGlobal() {
        $('#dataTable').DataTable().search(
            $('#global_filter').val()
        ).draw();
    };

    function filterColumn(i) {
        console.log('Column  ', i);
        $('#dataTable').DataTable().column(i).search(
            $('#col' + i + '_filter').val()
        ).draw();
    };

    $(document).ready(function () {
        setTimeout(function () {
            console.log("$('#dataTable')", $('#dataTable'));
            $('#dataTable').DataTable({
                "scrollY": "350px",
                "scrollCollapse": true,
                "paging": false,
                "info": false,
                "searching": false
            });
            $('input.global_filter').on('keyup click', function () {
                filterGlobal();
            });

            $('input.column_filter').on('keyup click', function () {
                filterColumn($(this).parents('tr').attr('data-column'));
            });
            $('#myModal').on('shown.bs.modal', function () {
                $('#myInput').focus()
            })

        }, 5000);

    });

    $scope.loadRegistre = function () {
        $scope.registreLoading = true;
        $scope.shCollection = [];
        DataService.getRegistres($rootScope.token).then(function (importResult) {
            if (importResult.data.status == "OK") {
                console.log('SUCCESS: ', importResult.data);
                importResult.data.registres.forEach(element => {
                    $scope.shCollection = $scope.shCollection.concat(element.sharedHolders);
                });
                console.log("SharedHolders length : ", $scope.shCollection.length);
            } else {
                console.log("ECHEC: ", importResult.data);
            }
            $scope.registreLoading = false;
        });
    }

    $scope.loadRegistre();


    function handleFileSelect(evt) {
        var file = evt.target.files[0]; // FileList object

        if (file) {
            var r = new FileReader();
            r.onload = function (e) {
                $scope.fileContent = e.target.result;
                // TODO Parse file and send request
            }
            r.readAsText(file);
        } else {
            alert("Error de lecture du fichier");
        }
        //document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
    }
    console.log('add event listener');
    document.getElementById('file').addEventListener('change', handleFileSelect, false);


    $rootScope.sendFile = function () {
        $rootScope.loading = true;
        console.log("Loading....");
        sendRegistre($scope.fileContent);
    }


    function sendRegistre(content) {
        var params = parseContentCSVRegistre(content);
        var json = {
            'valueCode': 'unknown',
            'toolNature': 'unknown',
            'sharedHolders': params
        };
        var startDate = new Date();
        console.log(json);
        DataService.importRegistre($rootScope.token, json).then(function (importResult) {
            if (importResult.data.status == "OK") {
                //console.log('SUCCESS: ', importResult.data);
                console.log('SUCCESS : Registre créé contenant ' + params.length + ' sharedHolders');
                $('#modalLoadRegistre').modal('toggle'); // Dismiss the modal
                $rootScope.loading = false;
                var time = (new Date().getTime() - startDate.getTime()) / 1000;
                var msg = "Temps d'import de " + params.length + " élements : " + time + " s.";
                swal('Import réussi!', msg, 'success');
                $scope.loadRegistre(); // reload registre, can be optimized.
            } else {
                $rootScope.loading = false;
                console.log("ECHEC: ", importResult.data);
                swal(
                    'Echec de l\'import',
                    importResult.data.reason,
                    'error'
                );
            }
        });
    }

    function parseContentCSVRegistre(content) {
        var startDate = new Date();
        var lines = content.split("\r\n");
        var sharedHolders = [];
        for (var i = 1; i < lines.length; i++) {
            var properties = lines[i].split(";");
            if (properties.length >= 13) {

                var dateString = properties[9]; // Oct 23
                var majString = properties[12]; // Oct 23

                var dateParts = dateString.split("/");
                var acquisition = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]); // month is 0-based
                //console.log('acquisition : ', acquisition);
                var test1 = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);


                var majParts = majString.split("/");
                var maj = new Date(majParts[2], majParts[1] - 1, majParts[0]); // month is 0-based
                //console.log('maj : ', maj);

                var test = new Date(majParts[2], majParts[1] - 1, majParts[0]);

                var ele = {
                    'sharedHolderId': properties[0],
                    'codeQuality': "Mr",
                    'clientLastName': properties[1],
                    'clientFirstName': properties[2],
                    'address': properties[3],
                    'zipCode': properties[4],
                    'city': properties[5],
                    'country': properties[6],
                    'tccId': properties[7],
                    'acquisitionYear': acquisition,
                    'lastUpdate': maj,
                    'iban': properties[13],
                    'restrictions': properties[11],
                    'quantity': parseInt(properties[10]),
                    'peaPME': false
                }
                sharedHolders.push(ele);
            }
        }
        console.log('Parse : ', sharedHolders.length);
        console.log('Parse Time (s) : ', (new Date().getTime() - startDate.getTime()) / 1000);
        return sharedHolders;
    }



    /*
    DataService.getHistorian($rootScope.token).then(function(result) {
        console.log("historian result", result)  ;
        
        result.sort(function(a, b){
            if ( a.timestamp > b.timestamp) return -1 ;
            if ( a.timestamp < b.timestamp) return  1 ;
            return 0;
        });

        result.forEach(element => {
            var m = new Date(element.timestamp);
            element.timestamp = $rootScope.formatDateTime(m);
        });

        $scope.history = result  ;
    }) ;*/




    var myTCC = [ // Bnp11  Sg22 Caceis33  Natixis44  Citi55
        {
            memberId: "BNPP",
            name: "BNPP",
            address: "",
            zipCode: "",
            city: "",
            country: "",
            senderCode: "",
            codeTCC: "BNPP"
        },
        {
            memberId: "SG",
            name: "SG",
            address: "",
            zipCode: "",
            city: "",
            country: "",
            senderCode: "",
            codeTCC: "SG"
        },
        {
            memberId: "CACEIS",
            name: "CACEIS",
            address: "",
            zipCode: "",
            city: "",
            country: "",
            senderCode: "",
            codeTCC: "CACEIS"
        },
        {
            memberId: "NATIXIS",
            name: "NATIXIS",
            address: "",
            zipCode: "",
            city: "",
            country: "",
            senderCode: "",
            codeTCC: "NATIXIS"
        },
        {
            memberId: "CITI",
            name: "CITI",
            address: "",
            zipCode: "",
            city: "",
            country: "",
            senderCode: "",
            codeTCC: "CITI"
        },
        {
            memberId: "AILANCY-TCC",
            name: "AILANCY-TCC",
            address: "",
            zipCode: "",
            city: "",
            country: "",
            senderCode: "",
            codeTCC: "AILANCY-TCC"
        }

    ];

    var myIssuers = [
        {
            memberId: "Ailancy",
            name: "Ailancy",
            address: "32 Rue de Ponthieu",
            zipCode: "75008",
            city: "Paris",
            country: "France",
            senderCode: "Ailancy",
            codeTCC: "",
            valueCode: "FRAIL",
            code: "AIL"
        },
        {
            memberId: "CACEIS_TG",
            name: "SigFox",
            address: "112 avenue de Wagram",
            zipCode: "75017",
            city: "Paris",
            country: "France",
            senderCode: "CACEIS_TG",
            codeTCC: "",
            valueCode: "FRSGF",
            code: "SGF"
        },
        {
            memberId: "SG_TG",
            name: "Actility",
            address: "67 Rue de la Victoire",
            zipCode: "75009",
            city: "Paris",
            country: "France",
            senderCode: "SG_TG",
            codeTCC: "",
            valueCode: "FRACT",
            code: "ACT"
        }
    ];





    $scope.importTCParticipants = function () {
        myTCC.forEach((ele) => {
            DataService.createTCParticipant($rootScope.token, ele).then(function (result) {
                console.log('TCC: ', result);
            })
        });

    }
    $scope.importIssuersParticipants = function () {
        myIssuers.forEach((ele) => {
            DataService.createIssuerParticipant($rootScope.token, ele).then(function (result) {
                console.log('ISSUER: ', result);
            })
        });
    }


}
]);
