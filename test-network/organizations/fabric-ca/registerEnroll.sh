#!/bin/bash

function createHDFCCerts() {
  infoln "Enrolling the CA admin"
  mkdir -p organizations/peerOrganizations/hdfc.example.com/

  export FABRIC_CA_CLIENT_HOME=${PWD}/organizations/peerOrganizations/hdfc.example.com/

  set -x
  fabric-ca-client enroll -u https://hdfccaadmin:hdfccaadminpw@localhost:7054 --caname ca-hdfc --tls.certfiles "${PWD}/organizations/fabric-ca/hdfc/tls-cert.pem"
  { set +x; } 2>/dev/null

  echo 'NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-7054-ca-hdfc.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-7054-ca-hdfc.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-7054-ca-hdfc.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-7054-ca-hdfc.pem
    OrganizationalUnitIdentifier: orderer' > "${PWD}/organizations/peerOrganizations/hdfc.example.com/msp/config.yaml"

  infoln "Registering peer0"
  set -x
  fabric-ca-client register --caname ca-hdfc --id.name peer0 --id.secret peer0pw --id.type peer --tls.certfiles "${PWD}/organizations/fabric-ca/hdfc/tls-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Registering user"
  set -x
  fabric-ca-client register --caname ca-hdfc --id.name user1 --id.secret user1pw --id.type client --tls.certfiles "${PWD}/organizations/fabric-ca/hdfc/tls-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Registering the org admin"
  set -x
  fabric-ca-client register --caname ca-hdfc --id.name hdfcadmin --id.secret hdfcadminpw --id.type admin --tls.certfiles "${PWD}/organizations/fabric-ca/hdfc/tls-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Generating the peer0 msp"
  set -x
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:7054 --caname ca-hdfc -M "${PWD}/organizations/peerOrganizations/hdfc.example.com/peers/peer0.hdfc.example.com/msp" --csr.hosts peer0.hdfc.example.com --tls.certfiles "${PWD}/organizations/fabric-ca/hdfc/tls-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/organizations/peerOrganizations/hdfc.example.com/msp/config.yaml" "${PWD}/organizations/peerOrganizations/hdfc.example.com/peers/peer0.hdfc.example.com/msp/config.yaml"

  infoln "Generating the peer0-tls certificates"
  set -x
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:7054 --caname ca-hdfc -M "${PWD}/organizations/peerOrganizations/hdfc.example.com/peers/peer0.hdfc.example.com/tls" --enrollment.profile tls --csr.hosts peer0.hdfc.example.com --csr.hosts localhost --tls.certfiles "${PWD}/organizations/fabric-ca/hdfc/tls-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/organizations/peerOrganizations/hdfc.example.com/peers/peer0.hdfc.example.com/tls/tlscacerts/"* "${PWD}/organizations/peerOrganizations/hdfc.example.com/peers/peer0.hdfc.example.com/tls/ca.crt"
  cp "${PWD}/organizations/peerOrganizations/hdfc.example.com/peers/peer0.hdfc.example.com/tls/signcerts/"* "${PWD}/organizations/peerOrganizations/hdfc.example.com/peers/peer0.hdfc.example.com/tls/server.crt"
  cp "${PWD}/organizations/peerOrganizations/hdfc.example.com/peers/peer0.hdfc.example.com/tls/keystore/"* "${PWD}/organizations/peerOrganizations/hdfc.example.com/peers/peer0.hdfc.example.com/tls/server.key"

  mkdir -p "${PWD}/organizations/peerOrganizations/hdfc.example.com/msp/tlscacerts"
  cp "${PWD}/organizations/peerOrganizations/hdfc.example.com/peers/peer0.hdfc.example.com/tls/tlscacerts/"* "${PWD}/organizations/peerOrganizations/hdfc.example.com/msp/tlscacerts/ca.crt"

  mkdir -p "${PWD}/organizations/peerOrganizations/hdfc.example.com/tlsca"
  cp "${PWD}/organizations/peerOrganizations/hdfc.example.com/peers/peer0.hdfc.example.com/tls/tlscacerts/"* "${PWD}/organizations/peerOrganizations/hdfc.example.com/tlsca/tlsca.hdfc.example.com-cert.pem"

  mkdir -p "${PWD}/organizations/peerOrganizations/hdfc.example.com/ca"
  cp "${PWD}/organizations/peerOrganizations/hdfc.example.com/peers/peer0.hdfc.example.com/msp/cacerts/"* "${PWD}/organizations/peerOrganizations/hdfc.example.com/ca/ca.hdfc.example.com-cert.pem"

  infoln "Generating the user msp"
  set -x
  fabric-ca-client enroll -u https://user1:user1pw@localhost:7054 --caname ca-hdfc -M "${PWD}/organizations/peerOrganizations/hdfc.example.com/users/User1@hdfc.example.com/msp" --tls.certfiles "${PWD}/organizations/fabric-ca/hdfc/tls-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/organizations/peerOrganizations/hdfc.example.com/msp/config.yaml" "${PWD}/organizations/peerOrganizations/hdfc.example.com/users/User1@hdfc.example.com/msp/config.yaml"

  infoln "Generating the org admin msp"
  set -x
  fabric-ca-client enroll -u https://hdfcadmin:hdfcadminpw@localhost:7054 --caname ca-hdfc -M "${PWD}/organizations/peerOrganizations/hdfc.example.com/users/Admin@hdfc.example.com/msp" --tls.certfiles "${PWD}/organizations/fabric-ca/hdfc/tls-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/organizations/peerOrganizations/hdfc.example.com/msp/config.yaml" "${PWD}/organizations/peerOrganizations/hdfc.example.com/users/Admin@hdfc.example.com/msp/config.yaml"
}

function createSBICerts() {
  infoln "Enrolling the CA admin"
  mkdir -p organizations/peerOrganizations/sbi.example.com/

  export FABRIC_CA_CLIENT_HOME=${PWD}/organizations/peerOrganizations/sbi.example.com/

  set -x
  fabric-ca-client enroll -u https://sbicaadmin:sbicaadminpw@localhost:8054 --caname ca-sbi --tls.certfiles "${PWD}/organizations/fabric-ca/sbi/tls-cert.pem"
  { set +x; } 2>/dev/null

  echo 'NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-8054-ca-sbi.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-8054-ca-sbi.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-8054-ca-sbi.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-8054-ca-sbi.pem
    OrganizationalUnitIdentifier: orderer' > "${PWD}/organizations/peerOrganizations/sbi.example.com/msp/config.yaml"

  infoln "Registering peer0"
  set -x
  fabric-ca-client register --caname ca-sbi --id.name peer0 --id.secret peer0pw --id.type peer --tls.certfiles "${PWD}/organizations/fabric-ca/sbi/tls-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Registering user"
  set -x
  fabric-ca-client register --caname ca-sbi --id.name user1 --id.secret user1pw --id.type client --tls.certfiles "${PWD}/organizations/fabric-ca/sbi/tls-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Registering the org admin"
  set -x
  fabric-ca-client register --caname ca-sbi --id.name sbiadmin --id.secret sbiadminpw --id.type admin --tls.certfiles "${PWD}/organizations/fabric-ca/sbi/tls-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Generating the peer0 msp"
  set -x
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:8054 --caname ca-sbi -M "${PWD}/organizations/peerOrganizations/sbi.example.com/peers/peer0.sbi.example.com/msp" --csr.hosts peer0.sbi.example.com --tls.certfiles "${PWD}/organizations/fabric-ca/sbi/tls-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/organizations/peerOrganizations/sbi.example.com/msp/config.yaml" "${PWD}/organizations/peerOrganizations/sbi.example.com/peers/peer0.sbi.example.com/msp/config.yaml"

  infoln "Generating the peer0-tls certificates"
  set -x
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:8054 --caname ca-sbi -M "${PWD}/organizations/peerOrganizations/sbi.example.com/peers/peer0.sbi.example.com/tls" --enrollment.profile tls --csr.hosts peer0.sbi.example.com --csr.hosts localhost --tls.certfiles "${PWD}/organizations/fabric-ca/sbi/tls-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/organizations/peerOrganizations/sbi.example.com/peers/peer0.sbi.example.com/tls/tlscacerts/"* "${PWD}/organizations/peerOrganizations/sbi.example.com/peers/peer0.sbi.example.com/tls/ca.crt"
  cp "${PWD}/organizations/peerOrganizations/sbi.example.com/peers/peer0.sbi.example.com/tls/signcerts/"* "${PWD}/organizations/peerOrganizations/sbi.example.com/peers/peer0.sbi.example.com/tls/server.crt"
  cp "${PWD}/organizations/peerOrganizations/sbi.example.com/peers/peer0.sbi.example.com/tls/keystore/"* "${PWD}/organizations/peerOrganizations/sbi.example.com/peers/peer0.sbi.example.com/tls/server.key"

  mkdir -p "${PWD}/organizations/peerOrganizations/sbi.example.com/msp/tlscacerts"
  cp "${PWD}/organizations/peerOrganizations/sbi.example.com/peers/peer0.sbi.example.com/tls/tlscacerts/"* "${PWD}/organizations/peerOrganizations/sbi.example.com/msp/tlscacerts/ca.crt"

  mkdir -p "${PWD}/organizations/peerOrganizations/sbi.example.com/tlsca"
  cp "${PWD}/organizations/peerOrganizations/sbi.example.com/peers/peer0.sbi.example.com/tls/tlscacerts/"* "${PWD}/organizations/peerOrganizations/sbi.example.com/tlsca/tlsca.sbi.example.com-cert.pem"

  mkdir -p "${PWD}/organizations/peerOrganizations/sbi.example.com/ca"
  cp "${PWD}/organizations/peerOrganizations/sbi.example.com/peers/peer0.sbi.example.com/msp/cacerts/"* "${PWD}/organizations/peerOrganizations/sbi.example.com/ca/ca.sbi.example.com-cert.pem"

  infoln "Generating the user msp"
  set -x
  fabric-ca-client enroll -u https://user1:user1pw@localhost:8054 --caname ca-sbi -M "${PWD}/organizations/peerOrganizations/sbi.example.com/users/User1@sbi.example.com/msp" --tls.certfiles "${PWD}/organizations/fabric-ca/sbi/tls-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/organizations/peerOrganizations/sbi.example.com/msp/config.yaml" "${PWD}/organizations/peerOrganizations/sbi.example.com/users/User1@sbi.example.com/msp/config.yaml"

  infoln "Generating the org admin msp"
  set -x
  fabric-ca-client enroll -u https://sbiadmin:sbiadminpw@localhost:8054 --caname ca-sbi -M "${PWD}/organizations/peerOrganizations/sbi.example.com/users/Admin@sbi.example.com/msp" --tls.certfiles "${PWD}/organizations/fabric-ca/sbi/tls-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/organizations/peerOrganizations/sbi.example.com/msp/config.yaml" "${PWD}/organizations/peerOrganizations/sbi.example.com/users/Admin@sbi.example.com/msp/config.yaml"
}

function createNPCICerts() {
  infoln "Enrolling the CA admin"
  mkdir -p organizations/ordererOrganizations/example.com

  export FABRIC_CA_CLIENT_HOME=${PWD}/organizations/ordererOrganizations/example.com

  set -x
  fabric-ca-client enroll -u https://npcicaadmin:npcicaadminpw@localhost:9054 --caname ca-npci --tls.certfiles "${PWD}/organizations/fabric-ca/npci/tls-cert.pem"
  { set +x; } 2>/dev/null

  echo 'NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-9054-ca-npci.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-9054-ca-npci.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-9054-ca-npci.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-9054-ca-npci.pem
    OrganizationalUnitIdentifier: orderer' > "${PWD}/organizations/ordererOrganizations/example.com/msp/config.yaml"

  infoln "Registering orderer"
  set -x
  fabric-ca-client register --caname ca-npci --id.name orderer --id.secret ordererpw --id.type orderer --tls.certfiles "${PWD}/organizations/fabric-ca/npci/tls-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Registering the orderer admin"
  set -x
  fabric-ca-client register --caname ca-npci --id.name ordererAdmin --id.secret ordererAdminpw --id.type admin --tls.certfiles "${PWD}/organizations/fabric-ca/npci/tls-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Generating the orderer msp"
  set -x
  fabric-ca-client enroll -u https://orderer:ordererpw@localhost:9054 --caname ca-npci -M "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp" --csr.hosts orderer.example.com --csr.hosts localhost --tls.certfiles "${PWD}/organizations/fabric-ca/npci/tls-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/organizations/ordererOrganizations/example.com/msp/config.yaml" "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/config.yaml"

  infoln "Generating the orderer-tls certificates"
  set -x
  fabric-ca-client enroll -u https://orderer:ordererpw@localhost:9054 --caname ca-npci -M "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/tls" --enrollment.profile tls --csr.hosts orderer.example.com --csr.hosts localhost --tls.certfiles "${PWD}/organizations/fabric-ca/npci/tls-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/tls/tlscacerts/"* "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/tls/ca.crt"
  cp "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/tls/signcerts/"* "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/tls/server.crt"
  cp "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/tls/keystore/"* "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/tls/server.key"

  mkdir -p "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts"
  cp "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/tls/tlscacerts/"* "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"

  mkdir -p "${PWD}/organizations/ordererOrganizations/example.com/msp/tlscacerts"
  cp "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/tls/tlscacerts/"* "${PWD}/organizations/ordererOrganizations/example.com/msp/tlscacerts/tlsca.example.com-cert.pem"

  infoln "Generating the admin msp"
  set -x
  fabric-ca-client enroll -u https://ordererAdmin:ordererAdminpw@localhost:9054 --caname ca-npci -M "${PWD}/organizations/ordererOrganizations/example.com/users/Admin@example.com/msp" --tls.certfiles "${PWD}/organizations/fabric-ca/npci/tls-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/organizations/ordererOrganizations/example.com/msp/config.yaml" "${PWD}/organizations/ordererOrganizations/example.com/users/Admin@example.com/msp/config.yaml"
}
