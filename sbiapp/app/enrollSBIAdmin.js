/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, enrollAdmin } = require('../../commonApp/utils/CAUtil.js');
const { buildCCPSBI, buildWallet } = require('../../commonApp/utils/AppUtil.js');

const mspOrg = 'SBIMSP';
const walletPath = path.join(__dirname, '../wallet');

async function enrollSBIAdmin() {
	try {
		// build an in memory object with the network configuration (also known as a connection profile)
		const ccp = buildCCPSBI();

		// build an instance of the fabric ca services client based on
		// the information in the network configuration
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.sbi.example.com');

		// setup the wallet to hold the credentials of the application user
		const wallet = await buildWallet(Wallets, walletPath);

		// in a real application this would be done on an administrative flow, and only once
		await enrollAdmin(caClient, wallet, mspOrg);
	
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
	process.exit(0);

}

enrollSBIAdmin();
