  composer card create -n autobkc -p connection.json -u $1 -s $2
  composer card import --f $1@autobkc.card  -n $1
# rm -rf $1@autobkc.card
