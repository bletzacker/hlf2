/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets, DefaultEventHandlerStrategies,} = require('fabric-network');
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

async function transferAmount(userId, remitter, beneficiary, amount) {
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
				discovery: { enabled: true, asLocalhost: false }, // using asLocalhost as this gateway is using a fabric network deployed locally
				eventHandlerOptions: {
					strategy: DefaultEventHandlerStrategies.MSPID_SCOPE_ALLFORTX,
				}
			});

			// Build a network instance based on the channel where the smart contract is deployed
			const network = await gateway.getNetwork(channelName);

			await setupBlockListener(network);
			
			// Get the contract from the network.
			const contract = network.getContract(chaincodeName);
			let listener;

			try {
				// first create a listener to be notified of chaincode code events
				// coming from the chaincode ID "events"
				listener = async (event) => {
					// The payload of the chaincode event is the value place there by the
					// chaincode. Notice it is a byte data and the application will have
					// to know how to deserialize.
					console.log(event);
					const tx = event.payload.toString();
					console.log(`<-- Contract Event Received: ${event.eventName} - ${tx}`);
					
					// notice how we have access to the transaction information that produced this chaincode event
					const eventTransaction = event.getTransactionEvent();
					console.log(`*** transaction: ${eventTransaction.transactionId} status:${eventTransaction.status}`);
					showTransactionData(eventTransaction.transactionData);
					// notice how we have access to the full block that contains this transaction
					const eventBlock = eventTransaction.getBlockEvent();
					console.log(`*** block: ${eventBlock.blockNumber.toString()}`);
				};
				// now start the client side event service and register the listener
				console.log(`--> Start contract event stream to peer`);
				await contract.addContractListener(listener);
			} catch (eventError) {
				console.log(`<-- Failed: Setup contract events - ${eventError}`);
				response = { success: false, message: `${error}`};
			}
			
            let result;
			
            console.log('\n**************** As HDFC Client ****************');
            console.log('\n--> Submit Transaction: Transfer');
            result = await contract.submitTransaction('Transfer', remitter, beneficiary, amount);
			
			await sleep(5000);
			contract.removeContractListener(listener);
            console.log(`<-- result: ${result}`);
			response = { success: true, message: `${result}`};
		}catch(error){
            console.error(`******** FAILED to submit transation: ${error}`);
			response = { success: false, message: `${error}`};
        }finally {
            gateway.disconnect();
			
        }
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
		response = { success: false, message: `${error}`};
	}
	return response;
}

async function setupBlockListener(network){
	
	const listener = async (event) => {
		
		console.log(event);
	
		// Listener may remove itself if desired
		if (event.blockNumber.equals(1000)) {
			network.removeBlockListener(listener);
		}
	}
	
	const options = {
		startBlock: 1
	};

	await network.addBlockListener(listener, options);
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
function showTransactionData(transactionData) {
	const creator = transactionData.actions[0].header.creator;
	console.log(`    - submitted by: ${creator.mspid}-${creator.id_bytes.toString('hex')}`);
	for (const endorsement of transactionData.actions[0].payload.action.endorsements) {
		console.log(`    - endorsed by: ${endorsement.endorser.mspid}-${endorsement.endorser.id_bytes.toString('hex')}`);
	}
	const chaincode = transactionData.actions[0].payload.chaincode_proposal_payload.input.chaincode_spec;
	console.log(`    - chaincode:${chaincode.chaincode_id.name}`);
	console.log(`    - function:${chaincode.input.args[0].toString()}`);
	for (let x = 1; x < chaincode.input.args.length; x++) {
		console.log(`    - arg:${chaincode.input.args[x].toString()}`);
	}
}

module.exports = transferAmount;
// transferAmount('calvin',"calvin@HDFC","hobbes@SBI", 10);