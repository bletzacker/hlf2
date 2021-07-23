
export CC_RUNTIME_LANGUAGE=golang
export CC_SRC_PATH="../chaincode_pdc"
export VERSION=1

echo Vendoring Go dependencies ...
pushd ../chaincode_pdc
export GO111MODULE=on go mod vendor
popd
echo Finished vendoring Go dependencies