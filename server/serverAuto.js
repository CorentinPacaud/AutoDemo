var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser({ limit: '50mb' }));
var Enum = require('enum');
var fs = require('fs');

const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
//const ComposerCommon = require('composer-common');

const BUSINESS_NETWORK_IDENTIFIER = "autobkc";

const WALLET_PATH = '/home/admlcl/.composer-credentials/'; // CHANGE ?

const pkgAssets = 'org.corentin.autobkc.assets';
const pkgCars = 'org.corentin.autobkc.assets.Car';
const pkgSales = 'org.corentin.autobkc.assets.Sale';

const pkgParticipants = 'org.corentin.autobkc.participants';

const ADMIN_PROFILE = 'admin@autobkc';
var exec = require('child_process').exec;


var adminToken = "";

const connection_template = {
    "name": "hlfv1", "type": "hlfv1", "orderers":
        [{ "url": "grpc://localhost:7050" }], "ca":
        {
            "url": "http://localhost:7054",
            "name": "ca.org1.example.com"
        },
    "peers": [{ "requestURL": "grpc://localhost:7051", "eventURL": "grpc://localhost:7053" }],
    "keyValStore": "/Users/corentinpacaud/.composer-credentials", "channel": "composerchannel", "mspID": "Org1MSP", "timeout": 300
}

var myEnum = new Enum({
    'VALID': 0,
    'NIL_ENVELOPE': 1,
    'BAD_PAYLOAD': 2,
    'BAD_COMMON_HEADER': 3,
    'BAD_CREATOR_SIGNATURE': 4,
    'INVALID_ENDORSER_TRANSACTION': 5,
    'INVALID_CONFIG_TRANSACTION': 6,
    'UNSUPPORTED_TX_PAYLOAD': 7,
    'BAD_PROPOSAL_TXID': 8,
    'DUPLICATE_TXID': 9,
    'ENDORSEMENT_POLICY_FAILURE': 10,
    'MVCC_READ_CONFLICT': 11,
    'PHANTOM_READ_CONFLICT': 12,
    'UNKNOWN_TX_TYPE': 13,
    'TARGET_CHAIN_NOT_FOUND': 14,
    'MARSHAL_TX_ERROR': 15,
    'NIL_TXACTION': 16,
    'EXPIRED_CHAINCODE': 17,
    'CHAINCODE_VERSION_CONFLICT': 18,
    'BAD_HEADER_EXTENSION': 19,
    'BAD_CHANNEL_HEADER': 20,
    'BAD_RESPONSE_PAYLOAD': 21,
    'BAD_RWSET': 22,
    'ILLEGAL_WRITESET': 23,
    'INVALID_OTHER_REASON': 255
});

const AUTH_TIMEOUT = 10000;

var sessions = [];

const SERVER_LISTEN_PORT = 8084;


//////////////////
// HFC SDK
var cmd = require('node-cmd');
var hfc = require('fabric-client');
var path = require('path');

var options = {
    wallet_path: WALLET_PATH,
    user_id: '00007',
    channel_id: 'composerchannel',
    chaincode_id: BUSINESS_NETWORK_IDENTIFIER,
    network_url: 'grpc://localhost:7051',
    orderer_url: 'grpc://localhost:7050'
};

var channel = {};
var client = null;


app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({   // to support URL-encoded bodies
    extended: true
}));

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}
process.on('uncaughtException', function (err) {
    console.log('Caught exception: ', err);
});

// CREATE UNIQUE ID
var makeId = function () {
    var text = "";
    var possible = "0123456789abcdef";

    for (var i = 0; i < 40; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

// CORS


app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token");
    next();
});


var returnAuth = function (res, sessionInfo) {
    sessions.push(sessionInfo);


    var retParticipant = {
        ownerId: sessionInfo.participant.ownerId,
        role:sessionInfo.participant.role
    };

    console.log("retParticipant", retParticipant);

    res.json({ "status": "AUTHENTICATED", "token": sessionInfo.token, "participant": retParticipant });

}


// ----------------------------------- RESTFul API STUFF -----------------------------------

//------------------AUTHENTICATION---------------------
//-----------------------------------------------------

app.post('/auth', function (req, res) {
    // payload example : 




    var payload = req.body;

    var found = credentials.find(function (cred) {
        return cred.username == payload.username && cred.secret == payload.pwd;
    })


    if (null == found || undefined == found) {
        res.json({ "status": "FAILED", "reason": "Wrong credentials" });
        return;
    }

    var bizNetworkConnection = new BusinessNetworkConnection();


    var profile = payload.username + "@autobkc";


    var timeoutObject;

    var onTimeout = function () {
        console.log("auth timed out");
        res.json({ status: "FAILED", reason: "auth timeout" });
    }

    timeoutObject = setTimeout(onTimeout, AUTH_TIMEOUT);

    console.log("Received auth request from", payload.username);

    try {

        var profile = payload.username; 
        // CONNECTION_PROFILE_NAME

        bizNetworkConnection.connect(profile)
            .then((result) => {

                clearTimeout(timeoutObject);

                if (null != result && undefined != result && undefined != result.modelManager) {
                    var token = guid();

                    bizNetworkConnection.ping().then((pingRes) => {
                        if (pingRes.participant) {
                            var fqn = pingRes.participant + '';
                            var participantId = pingRes.participant.split("#")[1];
                            // var participantId = pingRes.participant  ;
                            console.log(`participant = ${pingRes.participant ? pingRes.participant : '<no participant found>'}`);
                            // Get the current participant
                            // TODO use the getCurrentParticipant() method ?

                            var registry = 'org.corentin.autobkc.participants.Seller';
                            var role = "Seller";
                            console.log("FQN", fqn);
                            if (fqn.indexOf('Seller') > -1) {
                                registry = 'org.corentin.autobkc.participants.Seller';
                                role = "Seller";
                            }
                            else {
                                registry = 'org.corentin.autobkc.participants.Buyer';
                                role = "Buyer";
                            }

                            console.log("Registry : ", registry, role);

                            bizNetworkConnection.getParticipantRegistry(registry).then((reg) => {
                                try {
                                    console.log("ID : ", participantId);
                                    reg.exists(participantId).then((exists) => {
                                        console.log('exist : ', exists);
                                        if (exists) {


                                            reg.get(participantId).then((theParticipant) => {

                                                theParticipant.role = role;
                                                sessionInfo = {
                                                    "token": token,
                                                    "connection": bizNetworkConnection,
                                                    "bizNetworkDefinition": result,
                                                    "createDate": new Date(),
                                                    "participant": theParticipant,
                                                    "userId": participantId
                                                };

                                                returnAuth(res, sessionInfo);
                                                return;
                                            });
                                        }
                                        else {
                                            res.json({ "status": "FAILED", "reason": "No participant found on the blockchain!" });
                                            return;
                                        }
                                    });
                                }
                                catch (excep) {
                                    res.json({ "status": "FAILED", "reason": "An error has occured. Please retry." });
                                    return;
                                }
                            });

                        } else {
                            console.log('No participant found!');
                            res.json({ "status": "FAILED", "reason": "No participant found on the blockchain!" });
                        }
                    })
                }
                else {
                    res.json({ "status": "FAILED", "reason": "Wrong credentials" });
                }
            });
    }
    catch (exception) {
        console.log("auth error", new Date(), exception);
        res.json({ "status": "FAILED", "reason": exception });
    }


});

app.post('/authAdmin', function (req, res) {
    // payload example : 

    var payload = req.body;

console.log("AuthAdmin");

    var found = credentials.find(function (cred) {
        return cred.username == payload.username && cred.secret == payload.pwd;
    })


    if (null == found || undefined == found) {
        res.json({ "status": "FAILED", "reason": "Wrong credentials" });
        return;
    }


    var bizNetworkConnection = new BusinessNetworkConnection();

    var timeoutObject;

    var onTimeout = function () {
        res.json({ status: "FAILED" });
    }

    var profile = payload.username + "@autobkc";

    timeoutObject = setTimeout(onTimeout, AUTH_TIMEOUT);

    console.log("Received auth request from", payload.username);

    if (payload.username == 'admin') {


        // CONNECTION_PROFILE_NAME


        //bizNetworkConnection.connect(profile,
        //    BUSINESS_NETWORK_IDENTIFIER,
        //    payload.username,
        //    payload.pwd)

        bizNetworkConnection.connect(profile)
            .then((result) => {
                clearTimeout(timeoutObject);

                if (null != result && undefined != result && undefined != result.modelManager) {
                    var token = guid();
                    // Deleting the generated wallet


                    /*  fs.unlink(WALLET_PATH + payload.username, (err) => {
                          if (err) {
                              console.error(err);
                          }
                          console.log('successfully deleted wallet ', WALLET_PATH + payload.username);
                      }); */
                    adminToken = token;
                    sessions.push({ "token": token, "connection": bizNetworkConnection, "bizNetworkDefinition": result, "createDate": new Date() });
                    var participantJSON = {
                        "adminId": payload.username,
                        "role": "ADMIN",
                        "memberId": "admin"
                    }
                    res.json({ "status": "AUTHENTICATED", "token": token, "participant": participantJSON });
                }
                else {
                    res.json({ "status": "FAILED", "reason": "Wrong credentials" });
                }
            })
            .catch((error) => {
                res.json({ "status": "FAILED", "reason": error.toString() });
                console.error(error);
            });
    }
});


//-------------------USER-----------------------------
//----------------------------------------------------

// Create TCParticipant-------------------------------
app.post('/Buyer', function (req, res) {
    try {
        token = req.headers["token"];
        var bizNetworkConnection = getBizNetworkFromToken(token);
        var bizNetworkDefinition = getBizNetworkDefinitionFromToken(token);
        bizNetworkConnection.getParticipantRegistry('org.corentin.autobkc.participants.Buyer')
            .then((participantRegistry) => {
                let factory = bizNetworkDefinition.getFactory();

                var participant = factory.newResource('org.corentin.autobkc.participants', 'Buyer', req.body.username);
                participant.firstname = req.body.firstname;
                participant.lastname = req.body.lastname; 

                participantRegistry.add(participant)
                    .then((result) => {
                        bizNetworkConnection.issueIdentity('org.corentin.autobkc.participants.Buyer#' + participant.ownerId, participant.ownerId, { userId: true })
                            .then((buyer) => {

                                console.log("calling createAndImportIdCard...")
                                createAndImportIdCard(buyer.userID, buyer.userSecret);


                                console.log(`userID = ${buyer.userID}`);
                                console.log(`userSecret = ${buyer.userSecret}`);

                                persistCredentials(buyer.userID, buyer.userSecret);

                                res.json({ 'status': 'OK', 'userId': buyer.userID, 'secret': buyer.userSecret });
                            })
                            .catch((error) => {
                                console.error(error);
                                res.json({ 'status': 'FAILED', 'reason': error.toString() });
                            });
                    })
                    .catch((error) => {
                        res.json({ "status": "FAILED", "reason": error.toString() });
                        console.error(error);
                    });
            })
            .catch((error) => {
                res.json({ "status": "FAILED", "reason": error.toString() });
                console.error(error);
            });
    }
    catch (exception) {
        console.log("auth error", exception);
        res.json({ "status": "FAILED" });
    }
});

//get all TCParticipant------------------------------
app.get('/Buyers', function (req, res) {
    try {
        token = req.headers["token"];
        var bizNetworkConnection = getBizNetworkFromToken(token);
        var bizNetworkDefinition = getBizNetworkDefinitionFromToken(token);
        bizNetworkConnection.getParticipantRegistry('org.corentin.autobkc.participants.Buyer')
            .then((participantRegistry) => {
                participantRegistry.getAll().then((allParticipants) => {
                    var ret = [];
                    for (let i = 0; i < allParticipants.length; i++) {
                        ret.push({
                            "ownerId": allParticipants[i].ownerId,
                            "firstname":allParticipants[i].firstname,
                            "lastname":allParticipants[i].lastname
                            // TODO add property
                        });
                    }
                    res.json({ "status": "OK", "Buyers": ret });
                });
            })
            .catch((error) => {
                res.json({ "status": "FAILED", "reason": error.toString() });
                console.error(error);
            });
    }
    catch (exception) {
        console.log("auth error", exception);
        res.json({ "status": "FAILED" });
    }
});

//get all SellersParticipants------------------------------
app.get('/Sellers', function (req, res) {
    try {
        token = req.headers["token"];
        var bizNetworkConnection = getBizNetworkFromToken(token);
        var bizNetworkDefinition = getBizNetworkDefinitionFromToken(token);
        bizNetworkConnection.getParticipantRegistry('org.corentin.autobkc.participants.Seller')
            .then((participantRegistry) => {
                participantRegistry.getAll().then((allParticipants) => {
                    var ret = [];
                    for (let i = 0; i < allParticipants.length; i++) {
                        ret.push({
                            "ownerId": allParticipants[i].ownerId,
                            // TODO add property
                            "companyName":allParticipants[i].companyName
                        });
                    }
                    res.json({ "status": "OK", "Sellers": ret });
                });
            })
            .catch((error) => {
                res.json({ "status": "FAILED", "reason": error.toString() });
                console.error(error);
            });
    }
    catch (exception) {
        console.log("error", new Date(), exception);
        res.json({ "status": "FAILED" });
    }
});

// CREATE SellerParticipant
app.post('/Seller', function (req, res) {
    try {
        token = req.headers["token"];
        var bizNetworkConnection = getBizNetworkFromToken(token);
        var bizNetworkDefinition = getBizNetworkDefinitionFromToken(token);
        bizNetworkConnection.getParticipantRegistry('org.corentin.autobkc.participants.Seller')
            .then((participantRegistry) => {
                let factory = bizNetworkDefinition.getFactory();

                var participant = factory.newResource('org.corentin.autobkc.participants', 'Seller', req.body.username);
                participant.ownerId = req.body.username;
                participant.companyName = req.body.companyName;
                // TODO add property

                participantRegistry.add(participant)
                    .then((result) => {
                        bizNetworkConnection.issueIdentity('org.corentin.autobkc.participants.Seller#' + participant.ownerId, participant.ownerId, { userId: true })
                            .then((seller) => {

                                console.log("calling createAndImportIdCard...")
                                createAndImportIdCard(seller.userID, seller.userSecret);

                                persistCredentials(seller.userID, seller.userSecret);

                                console.log(`userID = ${seller.userID}`);
                                console.log(`userSecret = ${seller.userSecret}`);
                                res.json({ 'status': 'OK', 'userId': seller.userID, 'secret': seller.userSecret });
                            })
                            .catch((error) => {
                                console.error(error);
                                res.json({ 'status': 'KO', 'reason': error.toString() });
                            });
                    })
                    .catch((error) => {
                        res.json({ "status": "FAILED", "reason": error.toString() });
                        console.error(error);
                    });
            })
            .catch((error) => {
                res.json({ "status": "FAILED", "reason": error.toString() });
                console.error(error);
            });
    }
    catch (exception) {
        console.log("error", new Date(), exception);
        res.json({ "status": "FAILED" });
    }
});


//--------------------Cars------------------------------
//-----------------------------------------------------

// GET all Cars
app.get('/cars', function (req, res) {
    try {
        console.log("Get Cars");
        token = req.headers["token"];
        var bizNetworkConnection = getBizNetworkFromToken(token);
        var bizNetworkDefinition = getBizNetworkDefinitionFromToken(token);
        if (!bizNetworkConnection) {
            res.json({ "status": "FAILED", "cars": [] });
        }
        bizNetworkConnection.getAssetRegistry(pkgCars)
            .then((carsRegistry) => {
                carsRegistry.resolveAll().then((allCars) => {
                    var ret = allCars;
                    res.json({ "status": "OK", "cars": ret });
                })
                    .catch((error) => {
                        res.json({ "status": "FAILED", "reason": error.toString() });
                        console.error(error);
                    });;
            })
            .catch((error) => {
                res.json({ "status": "FAILED", "reason": error.toString() });
                console.error(error);
            });
    }
    catch (exception) {
        console.log("error", new Date(), exception);
        res.json({ "status": "FAILED" });
    }
});

app.get('/askSellCar', function (req, res) {
    try {
        console.log("Get askSellCar");
        token = req.headers["token"];
        var bizNetworkConnection = getBizNetworkFromToken(token);
        var bizNetworkDefinition = getBizNetworkDefinitionFromToken(token);
        if (!bizNetworkConnection) {
            res.json({ "status": "FAILED", "askSellCar": [] });
        }
        bizNetworkConnection.getAssetRegistry(pkgSales)
            .then((carsRegistry) => {
                carsRegistry.resolveAll().then((allSales) => {
                    var ret = [];
                    allSales.forEach(function(ele){
                        var r = {
                            car:{carId:ele.car.carId,brand:ele.car.brand, model:ele.car.model},
                            price:ele.price,
                            status:ele.status,
                            saleId:ele.saleId
                        }
                        ret.push(r);
                    });
                    console.log("Ask Sell length :", allSales.length);
                    console.log("Ask sell result:",ret);
                    res.json({ "status": "OK", "askSellCar": ret });
                })
                    .catch((error) => {
                        res.json({ "status": "FAILED", "reason": error.toString() });
                        console.error(error);
                    });;
            })
            .catch((error) => {
                res.json({ "status": "FAILED", "reason": error.toString() });
                console.error(error);
            });
    }
    catch (exception) {
        console.log("error", new Date(), exception);
        res.json({ "status": "FAILED" });
    }
});

// GET  Car by ID
app.get('/car/:carId', function (req, res) {
    try {
        token = req.headers["token"];
        var carId = req.params["carId"];
        var bizNetworkConnection = getBizNetworkFromToken(token);
        var bizNetworkDefinition = getBizNetworkDefinitionFromToken(token);
        if (!bizNetworkConnection) {
            res.json({ "status": "FAILED", "car": {} });
        }
        bizNetworkConnection.getAssetRegistry(pkgCars)
            .then((carsRegistry) => {
                carsRegistry.resolve(carId).then((car) => {
                    console.log("car", car);
                    var ret = {
                        "carId": car.carId
                        // Do add properties
                    };
                    console.log("Ret : ", ret);
                    res.json({ "status": "OK", "car": ret });
                });
            })
            .catch((error) => {
                res.json({ "status": "FAILED", "reason": error.toString() });
                console.error(error);
            });
    }
    catch (exception) {
        console.log("error", new Date(), exception);
        res.json({ "status": "FAILED" });
    }
});


app.get('/historian', function (req, res) {
    try {
        var token = req.headers["token"];
        var participantId = getParticipantIdFromToken(token);
        var participant = getParticipantFromToken(token);
        if (participantId == undefined) {
            participantId = "admin";
            //participant = { 'role': 'ADMIN' }
        }
        console.log("get history", participant, token);

        var bizNetworkConnection = getBizNetworkFromToken(token);
        if (!bizNetworkConnection) {
            res.json({ "status": "FAILED", "historian": [], "reason": "bizNetworkConnection" });
            return;
        }
        var bizNetworkDefinition = getBizNetworkDefinitionFromToken(token);

        let now = new Date();
        now.setMinutes(10);  // set the date to be time you want to query from

        return bizNetworkConnection.getHistorian()
            .then((recordsRegistry) => {
                return recordsRegistry.getAll()
                    .then(function (records) {
                        try {
                            console.log("Res : ", records.length);
                            var ret = [];
                            records.forEach(function (rec) {
                                var name = "";
                                var role = "";
                                if (rec.participantInvoking) {
                                    console.log("P : ", rec.participantInvoking.getIdentifier());
                                    name = rec.participantInvoking.getIdentifier();
                                    role = rec.participantInvoking.getType();
                                }
                                // retrieve all data
                                var newRet = {
                                    "recId": rec.getIdentifier(),
                                    "txId": rec.transactionId,
                                    "type": rec.transactionInvoked.getType(),
                                    "timestamp": rec.transactionTimestamp,
                                    "participant": name,
                                    "role": role
                                };
                                ret.push(newRet);
                            });
                            res.json({ "status": "OK", "historian": ret });
                        } catch (e) {
                            console.log("error", e);
                            res.json({ "status": "FAILED", "reason": e.toString() })
                        }
                    })
                    .catch(function (ex) {
                        console.log("error", ex);
                        res.json({ "status": "FAILED", "reason": exception.toString() })
                    });
            });
    }
    catch (exception) {
        console.log("error", exception);
        res.json({ "status": "FAILED", "reason": exception.toString() });
    }
});

// Get one record and all the details
app.get('/historian/record/:recId', function (req, res) {
    try {
        var token = req.headers["token"];
        var recId = req.params["recId"];

        var participantId = getParticipantIdFromToken(token);
        var participant = getParticipantFromToken(token);

        if (participantId == undefined) {
            participantId = "admin";
            //participant = { 'role': 'ADMIN' }
        }
        console.log("get history", participant, token);

        var bizNetworkConnection = getBizNetworkFromToken(token);
        if (!bizNetworkConnection) {
            res.json({ "status": "FAILED", "historian": [], "reason": "bizNetworkConnection" });
            return;
        }
        var bizNetworkDefinition = getBizNetworkDefinitionFromToken(token);

        return bizNetworkConnection.getHistorian()
            .then((recordsRegistry) => {
                return recordsRegistry.get(recId)
                    .then(function (rec) {
                        bizNetworkConnection.getTransactionRegistry(rec.transactionInvoked.getFullyQualifiedType()).then(function (txRegistry) {
                            txRegistry.get(rec.transactionInvoked.getIdentifier()).then(function (transaction) {
                                var tx = bizNetworkDefinition.getSerializer().toJSON(transaction);
                                if (rec.participantInvoking != null && rec.participantInvoking != undefined) {
                                    bizNetworkConnection.getParticipantRegistry(rec.participantInvoking.getFullyQualifiedType()).then(function (pRegistry) {
                                        pRegistry.get(rec.participantInvoking.getIdentifier()).then(function (participant) {
                                            var p = bizNetworkDefinition.getSerializer().toJSON(participant);
                                            var ret = {
                                                "txId": rec.transactionId,
                                                "type": rec.transactionInvoked.getType(),
                                                "timestamp": rec.transactionTimestamp,
                                                "role": p.memberType,
                                                "transaction": tx,
                                                "participant": p
                                            };
                                            res.json({ "status": "OK", "record": ret });
                                        }).catch(function (ex) {
                                            console.log("error", ex);
                                            res.json({ "status": "FAILED", "reason": exception.toString() })
                                        });;
                                    }).catch(function (ex) {
                                        console.log("error", ex);
                                        res.json({ "status": "FAILED", "reason": exception.toString() })
                                    });;
                                } else {
                                    var ret = {
                                        "txId": rec.transactionId,
                                        "type": rec.transactionInvoked.getType(),
                                        "timestamp": rec.transactionTimestamp,
                                        "transaction": tx
                                    };
                                    res.json({ "status": "OK", "record": ret });
                                }
                            }).catch(function (ex) {
                                console.log("error", ex);
                                res.json({ "status": "FAILED", "reason": exception.toString() })
                            });;
                        }).catch(function (ex) {
                            console.log("error", ex);
                            res.json({ "status": "FAILED", "reason": exception.toString() })
                        });;
                    }).catch(function (ex) {
                        console.log("error", ex);
                        res.json({ "status": "FAILED", "reason": exception.toString() })
                    });;
            }).catch(function (ex) {
                console.log("error", ex);
                res.json({ "status": "FAILED", "reason": exception.toString() })
            });;
    }
    catch (exception) {
        console.log("error", exception);
        res.json({ "status": "FAILED", "reason": exception.toString() });
    }
});



//-------------------------------------------------------------------TRANSACTION---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------
app.post('/buildCar', function (req, res) {

    console.log("buildCar");
    var token = req.headers["token"];
    let params = req.body.transaction;
    console.log('params : ', req.body);

    var participantId = getParticipantIdFromToken(token);

    var bizNetworkConnection = getBizNetworkFromToken(token);
    if (!bizNetworkConnection) {
        res.json({ "status": "FAILED", "carId": {} });
        return;
    }
    var bizNetworkDefinition = getBizNetworkDefinitionFromToken(token);
    let factory = bizNetworkDefinition.getFactory();

    // CREATE TX buildCar

    var transaction = factory.newTransaction('org.corentin.autobkc.transactions', 'BuildCarTransaction');
    transaction.brand = req.body.brand;
    transaction.model = req.body.model;
  
    // ADD PROPERTIES for TRANSACTION

    console.log("Create car ", transaction);
    bizNetworkConnection.submitTransaction(transaction)
        .then(function (result) {
            console.log("Create car Result : ", result);
            res.json({ "status": "OK", "created": true });
        }).catch(function (error) {
            console.log("TX error", error);
            res.json({ "status": "FAILED", "reason": error.toString() });
        });
});

app.post('/SellCar', function (req, res) {

    console.log("SellCar");
    var token = req.headers["token"];
    console.log('params : ', req.body);

    var participantId = getParticipantIdFromToken(token);

    var bizNetworkConnection = getBizNetworkFromToken(token);
    if (!bizNetworkConnection) {
        res.json({ "status": "FAILED", "sellId": {} });
        return;
    }
    var bizNetworkDefinition = getBizNetworkDefinitionFromToken(token);
    let factory = bizNetworkDefinition.getFactory();

    // CREATE TX SellCar


    var transaction = factory.newTransaction('org.corentin.autobkc.transactions', 'SaleTransaction');
    console.log("Transaction id : ", transaction.getIdentifier());
    transaction.carId = req.body.carId;
    transaction.price = 10000;
    
    // ADD PROPERTY for TRANSACTION

    console.log("Create SellCar");
    bizNetworkConnection.submitTransaction(transaction)
        .then(function (result) {
            console.log("Create sellCar Result : ", result);
            res.json({ "status": "OK", "created": true });
        }).catch(function (error) {
            console.log("TX error", error);
            res.json({ "status": "FAILED", "reason": error.toString() });
        });
});


// Accept  Sell
app.post('/acceptSell', function (req, res) {

    let params = req.body;
    var token = req.headers["token"];
    console.log('params : ', req.body);

    var participantId = getParticipantIdFromToken(token);

    var bizNetworkConnection = getBizNetworkFromToken(token);
    if (!bizNetworkConnection) {
        res.json({ "status": "FAILED", "saleId": {} });
        return;
    }
    var bizNetworkDefinition = getBizNetworkDefinitionFromToken(token);
    let factory = bizNetworkDefinition.getFactory();

    var transaction = factory.newTransaction('org.corentin.autobkc.transactions', 'AcceptSaleTransaction');
    console.log("Transaction id : ", transaction.getIdentifier());
    transaction.saleId = req.body.saleId;

    bizNetworkConnection.submitTransaction(transaction)
        .then(function (result) {
            console.log("Accept Sale Result : ", result);
            res.json({ "status": "OK", "accepted": true });
        }).catch(function (error) {
            console.log("TX error", error);
            res.json({ "status": "FAILED", "reason": error.toString() });
        });
});

// REJECT Sale
app.post('/RejectSale', function (req, res) {

    let params = req.body.transaction;
    var token = req.headers["token"];
    console.log("RejectSale : ", params.saleId);
    console.log('params : ', params);

    var participantId = getParticipantIdFromToken(token);

    var bizNetworkConnection = getBizNetworkFromToken(token);
    if (!bizNetworkConnection) {
        res.json({ "status": "FAILED", "saleId": {} });
        return;
    }
    var bizNetworkDefinition = getBizNetworkDefinitionFromToken(token);
    let factory = bizNetworkDefinition.getFactory();

    var transaction = factory.newTransaction('org.corentin.autobkc.transactions', 'TODO');
    console.log("Transaction id : ", transaction.getIdentifier());
    transaction.saleId = params.saleId;
    transaction.comment = params.comment;
    bizNetworkConnection.submitTransaction(transaction)
        .then(function (result) {
            console.log("Reject sale Result : ", result);
            res.json({ "status": "OK", "rejected": true });
        }).catch(function (error) {
            console.log("TX error", error);
            res.json({ "status": "FAILED", "reason": error.toString() });
        });
});


/**
 * Get the business network connection from the given token
 * @param {*} token 
 */
function getBizNetworkFromToken(token) {
    for (var i = 0; i < sessions.length; i++) {
        if (sessions[i].token == token) {
            return sessions[i].connection;
        }
    }
    return false;
}

function getParticipantIdFromToken(token) {
    for (var i = 0; i < sessions.length; i++) {
        if (sessions[i].token == token) {
            return sessions[i].memberId;
        }
    }
    return false;
}

/**
 * Get the business network connection from the given token
 * @param {*} token 
 */
function getParticipantFromToken(token) {
    for (var i = 0; i < sessions.length; i++) {
        if (sessions[i].token == token) {
            return sessions[i].participant;
        }
    }
    return false;
}

/**
 * Get the business network definition from the given token
 * @param {*} token 
 */
function getBizNetworkDefinitionFromToken(token) {
    for (var i = 0; i < sessions.length; i++) {
        if (sessions[i].token == token) {
            return sessions[i].bizNetworkDefinition;
        }
    }
    return false;
}


var createAndImportIdCard = function (memberId, secret) {

    console.log("creating and importing card for " + memberId);

    exec('./createAndImportCard.sh ' + memberId + " " + secret,
        function (error, stdout, stderr) {
            if (error !== null) {
                console.log(error);
            } else {
                console.log('stdout: ' + stdout);
                console.log('stderr: ' + stderr);
            }
        });


    return;
}

var credentials = [];

var persistCredentials = function (username, secret) {
    credentials.push({ "username": username, "secret": secret });
    fs.writeFileSync("./creds.json", JSON.stringify(credentials));
}


var loadCredentials = function () {

    if (fs.existsSync("./creds.json")) {
        credentials = JSON.parse(fs.readFileSync("./creds.json"));

        console.log("Loaded ", credentials.length, " credentials");
    }
    else {
        console.log("No credentials file found");
    }
}

var startWebServer = function () {
    console.log("starting web server");

    loadCredentials();

    var server = app.listen(SERVER_LISTEN_PORT, function () {

        var host = server.address().address
        var port = server.address().port

        console.log("AutoServer running at http://%s:%s", host, port)

    });
}

startWebServer();



