package main

import (
    "simple-payment-application-chaincode/contracts"
    "github.com/hyperledger/fabric-contract-api-go/contractapi"
)

func main() {
    Contract := new(contracts.Contract)

    cc, err := contractapi.NewChaincode(Contract)

    if err != nil {
        panic(err.Error())
    }

    if err := cc.Start(); err != nil {
        panic(err.Error())
    }
}