/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser } = require('../../commonApp/utils/CAUtil.js');
const { buildCCPSBI, buildWallet } = require('../../commonApp/utils/AppUtil.js');

const mspOrg = 'SBIMSP';
const walletPath = path.join(__dirname, '../wallet');

async function registerSBIUser(userId, affiliation) {
	try {
		// build an in memory object with the network configuration (also known as a connection profile)
		const ccp = buildCCPSBI();

		// build an instance of the fabric ca services client based on
		// the information in the network configuration
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.sbi.example.com');

		// setup the wallet to hold the credentials of the application user
		const wallet = await buildWallet(Wallets, walletPath);

		// in a real application this would be done only when a new user was required to be added
		// and would be part of an administrative flow
		await registerAndEnrollUser(caClient, wallet, mspOrg, userId, affiliation);

	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
	process.exit(0);
}

// registerSBIUser('hobbes','sbi.user');
registerSBIUser('operator2','sbi.operator');
