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
const { response } = require('express');

const channelName = 'mychannel';
const chaincodeName = 'spac';
const mspOrg1 = 'HDFCMSP';
const walletPath = path.join(__dirname, '../wallet');

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}

async function getUserAccountStatement(userId, bankUserId) {
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

            let result;
    
            console.log('\n**************** As HDFC Client ****************');
            console.log('\n--> Evaluate Transaction: GetAccountStatement');
            result = await contract.evaluateTransaction('GetAccountStatement', bankUserId);
            console.log(`<-- result: ${prettyJSONString(result.toString())}`);
			response = { success: true, message: `${prettyJSONString(result.toString())}`};
		}catch(error){
            console.error(`******** FAILED to evaluate transation: ${error}`);
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
module.exports = getUserAccountStatement;
// getUserAccountStatement('calvin',"calvin@HDFC");