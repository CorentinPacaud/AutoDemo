app.factory('DataService', function ($q, $http) {
    var END_POINT_BASE = "http://localhost:8084";

    var sessionToken = null;

    return {
        auth: function (username, passphrase) {
            var deferred = $q.defer();

            var svc = username == "admin" ? "/authAdmin" : "/auth";

            var req = {
                method: 'POST',
                url: END_POINT_BASE + svc,
                headers: {
                    'Content-Type': "application/json; charset=utf-8"
                },
                data: { "username": username, "pwd": passphrase }
            }

            $http(req).then(function (authResult) {
                try {
                    console.log("authResult", authResult);
                    if (null != authResult && authResult.data.status == "AUTHENTICATED") {
                        sessionToken = authResult.data.token;
                    }
                    deferred.resolve(authResult);
                }
                catch (e) {
                    deferred.resolve(authResult);
                    console.log(e);
                }
            }, function (authError) {
                console.log("authError");
                deferred.resolve(authError);
            });

            return deferred.promise;
        }

        , createSeller: function (token, data) {
            console.log("createSeller POST");
            var deferred = $q.defer();
            var req = {
                method: 'POST',
                url: END_POINT_BASE + "/Seller",
                headers: {
                    'Content-Type': "application/json; charset=utf-8",
                    'token': token
                },
                data: data
            }

            $http(req).then(function (result) {
                try {
                    deferred.resolve(result);
                }
                catch (e) {
                    console.log(e);
                }
            }, function (err) {
                deferred.resolve(err);
            });
            return deferred.promise;
        }
        , createBuyer: function (token, data) {
            console.log("createBuyer POST");
            var deferred = $q.defer();
            var req = {
                method: 'POST',
                url: END_POINT_BASE + "/Buyer",
                headers: {
                    'Content-Type': "application/json; charset=utf-8",
                    'token': token
                },
                data: data
            }

            $http(req).then(function (result) {
                try {
                    deferred.resolve(result);
                }
                catch (e) {
                    console.log(e);
                }
            }, function (err) {
                deferred.resolve(err);
            });
            return deferred.promise;
        }

        , buildCar: function (token, data) {
            console.log("Car POST");
            var deferred = $q.defer();
            var req = {
                method: 'POST',
                url: END_POINT_BASE + "/buildCar",
                headers: {
                    'Content-Type': "application/json; charset=utf-8",
                    'token': token
                },
                data: data
            }

            $http(req).then(function (result) {
                try {
                    deferred.resolve(result);
                }
                catch (e) {
                    console.log(e);
                }
            }, function (err) {
                deferred.resolve(err);
            });
            return deferred.promise;
        }
        , askSellCar: function (token, data) {
            console.log("askSellCar POST");
            var deferred = $q.defer();
            var req = {
                method: 'POST',
                url: END_POINT_BASE + "/SellCar",
                headers: {
                    'Content-Type': "application/json; charset=utf-8",
                    'token': token
                },
                data: data
            }

            $http(req).then(function (result) {
                try {
                    deferred.resolve(result);
                }
                catch (e) {
                    console.log(e);
                }
            }, function (err) {
                deferred.resolve(err);
            });
            return deferred.promise;
        }
        , getCars: function (token) {
            console.log("Cars GET");
            var deferred = $q.defer();
            var req = {
                method: 'GET',
                url: END_POINT_BASE + "/cars",
                headers: {
                    'Content-Type': "application/json; charset=utf-8",
                    'token': token
                }
            }

            $http(req).then(function (result) {
                try {
                    deferred.resolve(result);
                }
                catch (e) {
                    console.log(e);
                }
            }, function (err) {
                deferred.resolve(err);
            });
            return deferred.promise;
        }
        , getBuyers: function (token) {
            console.log("Buyers GET");
            var deferred = $q.defer();
            var req = {
                method: 'GET',
                url: END_POINT_BASE + "/Buyers",
                headers: {
                    'Content-Type': "application/json; charset=utf-8",
                    'token': token
                }
            }

            $http(req).then(function (result) {
                try {
                    deferred.resolve(result);
                }
                catch (e) {
                    console.log(e);
                }
            }, function (err) {
                deferred.resolve(err);
            });
            return deferred.promise;
        }
        ,
        getSellers: function (token) {
            console.log("Seller GET");
            var deferred = $q.defer();
            var req = {
                method: 'GET',
                url: END_POINT_BASE + "/Sellers",
                headers: {
                    'Content-Type': "application/json; charset=utf-8",
                    'token': token
                }
            }

            $http(req).then(function (result) {
                try {
                    deferred.resolve(result);
                }
                catch (e) {
                    console.log(e);
                }
            }, function (err) {
                deferred.resolve(err);
            });
            return deferred.promise;
        }
        ,
        getCarById: function (token, carId) {
            console.log("CarById GET");
            var deferred = $q.defer();
            var req = {
                method: 'GET',
                url: END_POINT_BASE + "/car/" + carId,
                headers: {
                    'Content-Type': "application/json; charset=utf-8",
                    'token': token
                }
            }

            $http(req).then(function (result) {
                try {
                    deferred.resolve(result);
                }
                catch (e) {
                    console.log(e);
                }
            }, function (err) {
                deferred.resolve(err);
            });
            return deferred.promise;
        }
        ,
        acceptSellCar: function (token, data) {
            console.log("acceptSellCar POST");
            var deferred = $q.defer();
            var req = {
                method: 'POST',
                url: END_POINT_BASE + "/acceptSell",
                headers: {
                    'Content-Type': "application/json; charset=utf-8",
                    'token': token
                },
                data: data
            }

            $http(req).then(function (result) {
                try {
                    deferred.resolve(result);
                }
                catch (e) {
                    console.log(e);
                }
            }, function (err) {
                deferred.resolve(err);
            });
            return deferred.promise;
        }
        , getAskSellCar: function (token) {
            console.log("AskSellCar GET");
            var deferred = $q.defer();
            var req = {
                method: 'GET',
                url: END_POINT_BASE + "/askSellCar",
                headers: {
                    'Content-Type': "application/json; charset=utf-8",
                    'token': token
                }
            }

            $http(req).then(function (result) {
                try {
                    deferred.resolve(result);
                }
                catch (e) {
                    console.log(e);
                }
            }, function (err) {
                deferred.resolve(err);
            });
            return deferred.promise;
        }
        , getHistorian: function (token) {
            console.log("Historian GET");
            var deferred = $q.defer();
            var req = {
                method: 'GET',
                url: END_POINT_BASE + "/historian",
                headers: {
                    'Content-Type': "application/json; charset=utf-8",
                    'token': token
                }
            }

            $http(req).then(function (result) {
                try {
                    deferred.resolve(result);
                }
                catch (e) {
                    console.log(e);
                }
            }, function (err) {
                deferred.resolve(err);
            });
            return deferred.promise;
        },
        getHistorianById: function (token, recId) {
            console.log("Record GET " + recId);
            var deferred = $q.defer();
            var req = {
                method: 'GET',
                url: END_POINT_BASE + "/historian/record/" + recId,
                headers: {
                    'Content-Type': "application/json; charset=utf-8",
                    'token': token
                }
            }

            $http(req).then(function (result) {
                try {
                    deferred.resolve(result);
                }
                catch (e) {
                    console.log(e);
                }
            }, function (err) {
                deferred.resolve(err);
            });
            return deferred.promise;
        }
    }

});


