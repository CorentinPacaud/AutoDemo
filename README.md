# AutoDemo
Auto : Démo de Hyperledger

## Pour lancer le programme : 

Dans le dossier fabric-tools :
- lancer le script : startFabric.sh
- lancer le script : createPeerAdmins.sh

Dans le dossier AutoDemo/autobkc :
- lancer le script : build.sh

Dans le dossier AutoDemo/server : 
- lancer le serveur avec le script : startServer.sh

Dans le dossier AutoDemo/UI :
- lancer le serveyr avec le script : serve.sh
- Sur un navigateur, se connecter sur localhost:8086.
- Se connecter avec admin/adminpw
- Cliquer sur "Créer les participants". Ceci crée 4 participants. Leurs login/mdp ont été ajouté au fichier AutoDemo/server/creds.json. Utilisez-les pour vous connecter en tant que vendeyr ou acheteyr.

## Pour tout réinitialiser :

Dans le dossier fabric-tools : 
- lancer le script : teardownAll.sh.

Dans le dossier AutoDemo/server :
-éditer le fichier creds.json pour ne laisser que le premier login   admin/adminpw
- tuer le server node.
