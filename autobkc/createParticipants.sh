composer participant add -c admin@autobkc -d '{"$class":"org.corentin.autobkc.participants.Seller","ownerId":"Renault","companyName":"renault"}'
composer identity issue -c admin@autobkc -f Renault.card -u Renault -a "resource:org.corentin.autobkc.participants.Seller#Renault"