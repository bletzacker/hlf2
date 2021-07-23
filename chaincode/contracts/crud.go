package contracts

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// Create
func (c *Contract) CreateHouse(ctx contractapi.TransactionContextInterface, houseID string, owner string, price uint32, event string) error {
	exists, err := c.HouseExists(ctx, houseID)
	if err != nil {
		return fmt.Errorf("Error to have house: %v", err)
	}
	if exists {
		return fmt.Errorf("House already exists: %s", houseID)
	}

	house := &House{
		HouseID:  	houseID,
		Owner:      owner,
		Price: 		price,
		Event: 		event,	
	}
	houseBytes, err := json.Marshal(house)
	if err != nil {
		return err
	}

	err = ctx.GetStub().PutState(houseID, houseBytes)
	if err != nil {
		return err
	}

	return nil
}

// Read
func (t *Contract) ReadHouse(ctx contractapi.TransactionContextInterface, houseID string) (*House, error) {
	houseBytes, err := ctx.GetStub().GetState(houseID)
	if err != nil {
		return nil, fmt.Errorf("Error to have house %s: %v", houseID, err)
	}
	if houseBytes == nil {
		return nil, fmt.Errorf("House %s does not exist", houseID)
	}

	var house House
	err = json.Unmarshal(houseBytes, &house)
	if err != nil {
		return nil, err
	}

	return &house, nil
}

// Update
func (c *Contract) TransferHouse(ctx contractapi.TransactionContextInterface, houseID string, newOwner string) error {
	house, err := c.ReadHouse(ctx, houseID)
	if err != nil {
		return err
	}

	house.Owner = newOwner
	house.Event = "HouseTransered"

	houseBytes, err := json.Marshal(house)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(houseID, houseBytes)
}

// Delete
func (c *Contract) DeleteHouse(ctx contractapi.TransactionContextInterface, houseID string) error {
	_, err := c.ReadHouse(ctx, houseID)
	if err != nil {
		return err
	}

	err = ctx.GetStub().DelState(houseID)
	if err != nil {
		return fmt.Errorf("Error to delete house %s: %v", houseID, err)
	}

	return nil
}

// Exist
func (t *Contract) HouseExists(ctx contractapi.TransactionContextInterface, houseID string) (bool, error) {
	houseBytes, err := ctx.GetStub().GetState(houseID)
	if err != nil {
		return false, fmt.Errorf("Error to read house %s. %v", houseID, err)
	}

	return houseBytes != nil, nil
}