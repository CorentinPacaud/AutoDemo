composer archive create -t dir -n .
composer runtime install --card PeerAdmin@hlfv1 --businessNetworkName autobkc

composer network start --card PeerAdmin@hlfv1 --networkAdmin admin --networkAdminEnrollSecret adminpw --archiveFile autobkc@0.0.1.bna --file networkadmin.card

composer card import --file networkadmin.card

composer network ping --card admin@autobkc


composer-rest-server --card admin@autobkc -N never -w true

