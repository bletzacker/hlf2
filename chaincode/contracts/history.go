package contracts

import (
	"encoding/json"
	"log"
	"time"

	"github.com/golang/protobuf/ptypes"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type HistoryQueryResult struct {
	Record    	*House    `json:"record"`
	TxId     	string    `json:"txId"`
	Timestamp 	time.Time `json:"timestamp"`
	IsDelete  	bool      `json:"isDelete"`
}

func (c *Contract) CreateEvent(ctx contractapi.TransactionContextInterface, houseID string, event string) error {
	house, err := c.ReadHouse(ctx, houseID)
	if err != nil {
		return err
	}

	house.Event = event

	houseBytes, err := json.Marshal(house)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(houseID, houseBytes)
}

func (c *Contract) GetHouseHistory(ctx contractapi.TransactionContextInterface, houseID string) ([]HistoryQueryResult, error) {
	log.Printf("GetHouseHistory: ID %v", houseID)

	resultsIterator, err := ctx.GetStub().GetHistoryForKey(houseID)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var records []HistoryQueryResult
	for resultsIterator.HasNext() {
		response, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var house House
		if len(response.Value) > 0 {
			err = json.Unmarshal(response.Value, &house)
			if err != nil {
				return nil, err
			}
		} else {
			house = House{
				HouseID: houseID,
			}
		}

		timestamp, err := ptypes.Timestamp(response.Timestamp)
		if err != nil {
			return nil, err
		}

		record := HistoryQueryResult{
			TxId:      response.TxId,
			Timestamp: timestamp,
			Record:    &house,
			IsDelete:  response.IsDelete,
		}
		records = append(records, record)
	}

	return records, nil
}