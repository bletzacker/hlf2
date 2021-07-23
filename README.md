To run the HLF2 Project:

In: hlf2/hdfcapp  
Run: docker build -t hdfcapp:1.1 .

In: hlf2/test-network  
Run in first terminal:

./network.sh down  
./network.sh up -s couchdb -ca

Run in second terminal:

./network.sh createChannel -c mychannel  
./network.sh deployCC -ccn spac -ccl go -ccp ../chaincode -cci InitLedger

In: hlf2/test-network/organizations/peerOrganizations/hdfc.example.com/connection-hdfc.json  
Replace (line 27):  
            "url": "grpcs://localhost:7051",
            
by :  
            "url": "grpcs://peer0.hdfc.example.com:7051",

and

Replace (line 39):  
            "url": "https://localhost:7054",
            
by :  
            "url": "https://ca_hdfc:7054",


To test a scenario with Postman:

Run in third terminal: postman and import: Demo HLF2.postman_collection from directory : hlf2/hdfcapp
