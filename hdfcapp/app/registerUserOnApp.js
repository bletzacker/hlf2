/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient } = require('../utils/CAUtil.js');
const { buildCCPHDFC, buildWallet } = require('../utils/AppUtil.js');

const channelName = 'mychannel';
const chaincodeName = 'spac';
const mspOrg1 = 'HDFCMSP';
const walletPath = path.join(__dirname, '../wallet');

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}

async function registerUserOnChaincode(userId, userAddress) {
	let response;
	try {
		// build an in memory object with the network configuration (also known as a connection profile)
		const ccp = buildCCPHDFC();

		// build an instance of the fabric ca services client based on
		// the information in the network configuration
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.hdfc.example.com');

		// setup the wallet to hold the credentials of the application user
		const wallet = await buildWallet(Wallets, walletPath);

		// Create a new gateway instance for interacting with the fabric network.
		// In a real application this would be done as the backend server session is setup for
		// a user that has been verified.
		const gateway = new Gateway();

		try {
			// setup the gateway instance
			// The user will now be able to create connections to the fabric network and be able to
			// submit transactions and query. All transactions submitted by this gateway will be
			// signed by this user using the credentials stored in the wallet.
			await gateway.connect(ccp, {
				wallet,
				identity: userId,
				discovery: { enabled: true, asLocalhost: false } // using asLocalhost as this gateway is using a fabric network deployed locally
			});

			// Build a network instance based on the channel where the smart contract is deployed
			const network = await gateway.getNetwork(channelName);

			// Get the contract from the network.
			const contract = network.getContract(chaincodeName);
            contract.addDiscoveryInterest({ name: chaincodeName, collectionNames: ["HDFCMSPUserCollection"] });

            let result;
            let userData = { name: userId, address: userAddress };
    
            console.log('\n**************** As HDFC Client ****************');
            console.log('Adding User Private Details to work with:\n--> Submit Transaction: RegisterUser ' + userId);
            let statefulTxn = contract.createTransaction('RegisterUser');
            //if you need to customize endorsement to specific set of Orgs, use setEndorsingOrganizations                //statefulTxn.setEndorsingOrganizations(mspOrg1);
            let tmapData = Buffer.from(JSON.stringify(userData));
            statefulTxn.setTransient({
                asset_properties: tmapData
            });
			result = await statefulTxn.submit('HDFC');
			response = {success: true, message: `Successfully registered user ${userId} on App` };
            console.log(`<-- result: ${result} -->`);
		}catch(error){
            console.error(`******** FAILED to run the application: ${error}`);
			response = { success: false, message: `${error}`};
        }finally {
            // Disconnect from the gateway peer when all work for this client identity is complete
            gateway.disconnect();
        }
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
		response = { success: false, message: `${error}`};
	}
	return response;
}

module.exports = registerUserOnChaincode;
// registerUserOnChaincode('calvin','World of comics,HDFC');
