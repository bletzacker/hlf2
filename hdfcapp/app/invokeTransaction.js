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

async function invokeTransaction (fcn, args, userId) {
	try {
		const ccp = buildCCPHDFC();
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.hdfc.example.com');
		const wallet = await buildWallet(Wallets, walletPath);
 
        const gateway = new Gateway();

        await gateway.connect(ccp, {
            wallet,
            identity: userId,
            discovery: { enabled: true, asLocalhost: false } 
        });

        const network = await gateway.getNetwork(channelName);
        const contract = network.getContract(chaincodeName);

        let result
        let message;
        
        if (fcn === "ReadHouse") {
            result = await contract.submitTransaction(fcn, args[0]);
            message = `Successfully read the house record with key ${args[0]}`
        } else if (fcn === "HouseExists") {
            result = await contract.submitTransaction(fcn, args[0]);
            message = `Successfully check if the house ${args[0]} exists`
        } else if (fcn === "CreateHouse") {
            result = await contract.submitTransaction(fcn, args[0], args[1], args[2], args[3]);
            message = `Successfully create the house record with key ${args[0]}`
        } else if (fcn === "TransferHouse") {
            result = await contract.submitTransaction(fcn, args[0], args[1]);
            message = `Successfully transfer the house ${args[0]} to ${args[1]}`
        } else if (fcn === "QueryHousesByOwner") {
            result = await contract.submitTransaction(fcn, args[0]);
            message = `Successfully Query Houses By Owner ${args[0]}`
        } else if (fcn === "QueryHouses") {
            result = await contract.submitTransaction(fcn, args[0]);
            message = `Successfully Query Houses ${args[0]}`
        } else if (fcn === "QueryTotalPriceByOwner") {
            result = await contract.submitTransaction(fcn, args[0]);
            message = `Successfully Query Total Price By Owner ${args[0]}`
        } else if (fcn === "CreateEvent") {
            result = await contract.submitTransaction(fcn, args[0], args[1]);
            message = `Successfully Create Event ${args[1]} for house ${args[0]}`
        } else if (fcn === "GetHouseHistory") {
            result = await contract.submitTransaction(fcn, args[0]);
            message = `Successfully Get House History ${args[0]}`
        } else if (fcn === "DeleteHouse") {
            result = await contract.submitTransaction(fcn, args[0]);
            message = `Successfully delete house ${args[0]}`
        } else {
            return `Invocation require an existing function but have ${fcn}`
        }

        await gateway.disconnect();

        result = JSON.parse(result.toString());

        let response = {
            message: message,
            result
        }

        return response;

    } catch (error) {
        console.log(`Getting error: ${error}`)
        return error.message
    }
}

module.exports = invokeTransaction;