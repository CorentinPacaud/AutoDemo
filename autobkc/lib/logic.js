'use strict';

var pkgAsset = 'org.corentin.autobkc.assets';
var pkgCar = 'org.corentin.autobkc.assets.Car';
var pkgSale = 'org.corentin.autobkc.assets.Sale';

var pkgParticipants = 'org.corentin.autobkc.participants';
var pkgSeller = 'org.corentin.autobkc.participants.Seller';
var pkgBuyer = 'org.corentin.autobkc.participants.Buyer';

/**
 * Allow to sell a car
 * @param {org.corentin.autobkc.transactions.BuildCarTransaction}  tx
 * @transaction
 */
function buildCarTransaction(tx) {
    var factory = getFactory();
    var newCar = factory.newResource(pkgAsset, 'Car', makeId(8));
    newCar.brand = tx.brand;
    newCar.model = tx.model;
    newCar.owner = factory.newRelationship(pkgParticipants, 'Seller', getCurrentParticipant().getIdentifier());
    return getAssetRegistry(pkgCar)
        .then(function(ar) {
            return ar.add(newCar);
        });
}

/**
 * Allow to sell a car
 * @param {org.corentin.autobkc.transactions.SaleTransaction} tx
 * @transaction
 */
function askSellCarTransaction(tx) {
    return getAssetRegistry(pkgCar)
    .then(function(carRegistry){
        return carRegistry.get(tx.carId)
        .then(function(car){
                var factory = getFactory();
                var sale = factory.newResource(pkgAsset, 'Sale', makeId(8));
                sale.buyer = factory.newRelationship(pkgParticipants, 'Buyer', getCurrentParticipant().getIdentifier());
                sale.seller = factory.newRelationship(pkgParticipants, 'Seller', car.owner.getIdentifier());
                sale.car = factory.newRelationship(pkgAsset, 'Car', car.getIdentifier());
                sale.price = tx.price;
                sale.status = "inprogress";
                return getAssetRegistry(pkgSale)
                .then(function(saleRegistry){
                    return saleRegistry.add(sale);
                })
        });
    });
}


/**
 * Allow to sell a car
 * @param {org.corentin.autobkc.transactions.AcceptSaleTransaction} tx
 * @transaction
 */
function acceptSellCarTransaction(tx) {
    return getAssetRegistry(pkgSale).then(function(saleRegistry){
        return saleRegistry.get(tx.saleId).then(function(sale){
            return getAssetRegistry(pkgCar)
            .then(function(cr) {
                carRegistry = cr;
                return carRegistry.get(sale.car.getIdentifier());
            })
            .then(function(car) {
                var factory = getFactory();
                car.owner = factory.newRelationship(pkgParticipants, 'Buyer', sale.buyer.getIdentifier());
                return carRegistry.update(car);
            }).then(function(){
                sale.status = "accepted";
                //TODO remove all other about this car;
                return saleRegistry.update(sale);
            });
        });
        
    });
}


function makeId(n){
    var id = "";
    for (var i = 0;i<n;i++) {
        id = id + Math.floor(Math.random() * Math.floor(10))
    }
    return id;
}