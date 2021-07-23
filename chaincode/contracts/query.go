
package contracts

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric-chaincode-go/shim"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// Query Houses by owner
func (c *Contract) QueryHousesByOwner(ctx contractapi.TransactionContextInterface, owner string) ([]*House, error) {
	queryString := fmt.Sprintf(`{"selector":{"owner":"%s"}}`, owner)
	return getQueryResultForQueryString(ctx, queryString)
}

// Query Houses by selector CouchDB
func (c *Contract) QueryHouses(ctx contractapi.TransactionContextInterface, queryString string) ([]*House, error) {
	return getQueryResultForQueryString(ctx, queryString)
}

func getQueryResultForQueryString(ctx contractapi.TransactionContextInterface, queryString string) ([]*House, error) {
	resultsIterator, err := ctx.GetStub().GetQueryResult(queryString)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	return constructQueryResponseFromIterator(resultsIterator)
}

func constructQueryResponseFromIterator(resultsIterator shim.StateQueryIteratorInterface) ([]*House, error) {
	var houses []*House
	for resultsIterator.HasNext() {
		queryResult, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}
		var house House
		err = json.Unmarshal(queryResult.Value, &house)
		if err != nil {
			return nil, err
		}
		houses = append(houses, &house)
	}

	return houses, nil
}

// Total Price by owner
func (c *Contract) QueryTotalPriceByOwner(ctx contractapi.TransactionContextInterface, owner string) (uint32, error) {
	queryString := fmt.Sprintf(`{"selector":{"owner":"%s"}}`, owner)

	houses, error := getQueryResultForQueryString(ctx, queryString)

	var sum uint32

	for _, house := range houses {
		sum = sum + house.Price
	}

	return sum, error
}