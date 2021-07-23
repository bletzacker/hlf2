package contracts

import "github.com/hyperledger/fabric-contract-api-go/contractapi"

type House struct {
	HouseID	string 	`json:"houseID"` 
	Owner	string 	`json:"owner"`
	Price	uint32  `json:"price"`
	Event	string	`json:"event"`
}

func (c *Contract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	
	houses := []House{
		{ HouseID: "1", Owner: "Laurent", Price: 180000, Event: "InitLedger"},
		{ HouseID: "2", Owner: "Mathieu", Price: 300000, Event: "InitLedger"},
		{ HouseID: "3", Owner: "Sudeep" , Price: 200000, Event: "InitLedger"},
		{ HouseID: "4", Owner: "Bharat" , Price: 300000, Event: "InitLedger"},
		{ HouseID: "5", Owner: "Laurent", Price: 220000, Event: "InitLedger"},
		{ HouseID: "6", Owner: "Mathieu", Price: 500000, Event: "InitLedger"},
		{ HouseID: "7", Owner: "Sudeep" , Price: 200000, Event: "InitLedger"},
		{ HouseID: "8", Owner: "Bharat" , Price: 300000, Event: "InitLedger"},
	}

	for _, house := range houses {
		err := c.CreateHouse(ctx, house.HouseID, house.Owner, house.Price, house.Event)
		if err != nil {
			return err
		}
	}

	return nil
}