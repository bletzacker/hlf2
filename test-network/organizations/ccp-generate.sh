#!/bin/bash

function one_line_pem {
    echo "`awk 'NF {sub(/\\n/, ""); printf "%s\\\\\\\n",$0;}' $1`"
}

function json_ccp {
    local PP=$(one_line_pem $4)
    local CP=$(one_line_pem $5)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${P0PORT}/$2/" \
        -e "s/\${CAPORT}/$3/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        -e "s/\${ORGC}/$6/" \
        organizations/ccp-template.json
}

function yaml_ccp {
    local PP=$(one_line_pem $4)
    local CP=$(one_line_pem $5)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${P0PORT}/$2/" \
        -e "s/\${CAPORT}/$3/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        -e "s/\${ORGC}/$6/" \
        organizations/ccp-template.yaml | sed -e $'s/\\\\n/\\\n          /g'
}

ORG=hdfc
P0PORT=7051
CAPORT=7054
PEERPEM=organizations/peerOrganizations/hdfc.example.com/tlsca/tlsca.hdfc.example.com-cert.pem
CAPEM=organizations/peerOrganizations/hdfc.example.com/ca/ca.hdfc.example.com-cert.pem
ORGC=HDFC

echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM $ORGC)" > organizations/peerOrganizations/hdfc.example.com/connection-hdfc.json
echo "$(yaml_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM $ORGC)" > organizations/peerOrganizations/hdfc.example.com/connection-hdfc.yaml

ORG=sbi
P0PORT=9051
CAPORT=8054
PEERPEM=organizations/peerOrganizations/sbi.example.com/tlsca/tlsca.sbi.example.com-cert.pem
CAPEM=organizations/peerOrganizations/sbi.example.com/ca/ca.sbi.example.com-cert.pem
ORGC=SBI

echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM $ORGC)" > organizations/peerOrganizations/sbi.example.com/connection-sbi.json
echo "$(yaml_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM $ORGC)" > organizations/peerOrganizations/sbi.example.com/connection-sbi.yaml