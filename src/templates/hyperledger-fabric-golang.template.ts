export const ETHEREUM_GOLANG_TEMPLATE = `
package main

import (
	"encoding/json"
	"fmt"

	"github.com/google/uuid"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
	"github.com/hyperledger/fabric-chaincode-go/pkg/cid"
)

var timeInSeconds = map[string]int{
	"SECOND": 1,
	"MINUTE": 1 * 60,
	"HOUR":   1 * 60 * 60,
	"DAY":    1 * 60 * 60 * 24,
	"WEEK":   1 * 60 * 60 * 24 * 7,
	"MONTH":  1 * 60 * 60 * 24 * 7 * 30,
}

type SmartContract struct {
	contractapi.Contract
}

type Party struct {
	Name  string  \`json:"name"\`
	MSPID string  \`json:"mspid"\`
	Aware bool    \`json:"aware"\`
}

type Parties struct {
	Application Party \`json:"application"\`
	Process     Party \`json:"process"\`
}

type Interval struct {
  Start int \`json:"start"\`
  End int   \`json:"end"\`
}

type Timeout struct {
  Increase int \`json:"increase"\`
  End int \`json:"end"\`
}

type MaxNumberOfOperation struct {
  Max int \`json:"max"\`
  Used int \`json:"used"\`
  Start int \`json:"start"\`
  End int \`json:"end"\`
  TimeUnit string \`json:"timeUnit"\`
}

<% clauses.forEach(clause => { %>
  type <%= clause.name.pascal %> struct {
    <% clause.terms.forEach(term => { %>
      <% if (term.type === 'weekdayInterval' || term.type === 'timeInterval') { %>
        <%= term.name.pascal %> Interval \`json:"<%= term.name.camel %>"\`
      <% } %>
  
      <% if (term.type === 'maxNumberOfOperation') { %>
        <%= term.name.pascal %> MaxNumberOfOperation \`json:"<%= term.name.camel %>"\`
      <% } %>
  
      <% if (term.type === 'timeout') { %>
        <%= term.name.pascal %> Timeout \`json:"<%= term.name.camel %>"\`
      <% } %>
  
      <% if (term.type === 'messageContent') { %>
  
        <% if (term.arguments.type === 'BOOLEAN') { %>
          <%= term.name.pascal %> bool \`json:"<%= term.name.camel %>"\`
        <% } else if (term.arguments.type === 'NUMBER') { %>
          <%= term.name.pascal %> int \`json:"<%= term.name.camel %>"\`
        <% } else if (term.arguments.type === 'TEXT') { %>
          <%= term.name.pascal %> string \`json:"<%= term.name.camel %>"\`
        <% } %>
        
      <% } %>
  
    <% }) %>
  }
<% }) %>

type Asset struct {
	Parties     Parties \`json:"parties"\`
	IsActivated bool    \`json:"isActivated"\`
  <% clauses.forEach(clause => { %>
    <%= clause.name.pascal %> <%= clause.name.pascal %> \`json:"<%= clause.name.camel %>"\`
  <% }) %>
}

func (s *SmartContract) IsParty(MSPID string, asset *Asset) (bool) {
  return MSPID == asset.Parties.Process.MSPID || MSPID == asset.Parties.Application.MSPID
}

func (s *SmartContract) Init(ctx contractapi.TransactionContextInterface, parties Parties) (string, error) {

	if parties.Application.MSPID == "" {
		return "", fmt.Errorf("the MSPID from Application is required")
	}

	if parties.Process.MSPID == "" {
		return "", fmt.Errorf("the MSPID from process is required")
	}

	parties.Application.Aware = false
	parties.Process.Aware = false

	contractId := uuid.New()

	contract := Asset{}
  contract.Parties = parties
  <% clauses.forEach(clause => { %>
    <% clause.terms.forEach(term => { %>
      <% if (term.type === 'maxNumberOfOperation') { %>
        contract.<%= clause.name.pascal %>.<%= term.name.pascal %>.Used = 0
        contract.<%= clause.name.pascal %>.<%= term.name.pascal %>.Start = 0
        contract.<%= clause.name.pascal %>.<%= term.name.pascal %>.End = 0
      <% } %>
    <% }) %>
  <% }) %>

	contractAsBytes, err := json.Marshal(contract)

	if err != nil {
		return "", fmt.Errorf("marshal error: %s", err.Error())
	}

	ctx.GetStub().PutState(contractId.String(), contractAsBytes)

	return contractId.String(), nil
}

func (s *SmartContract) Sign(ctx contractapi.TransactionContextInterface, contractId string) error {

	contractAsBytes, err := ctx.GetStub().GetState(contractId)

	if err != nil {
		return fmt.Errorf("failed to read from state: %s", err.Error())
	}

	if contractAsBytes == nil {
		return fmt.Errorf("contract %s does not exist", contractId)
	}

	contract := new(Asset)

  MSPID, err := cid.GetMSPID(ctx.GetStub())

  if err != nil {
		return fmt.Errorf("fail to get MSPID")
	}

	err = json.Unmarshal(contractAsBytes, contract)

	if err != nil {
		return fmt.Errorf("marshal error: %s", err.Error())
	}

  if !s.IsParty(MSPID, contract) {
    return fmt.Errorf("only the process or the application can execute this operation")
  }

	if contract.Parties.Application.MSPID == MSPID {

		if contract.Parties.Application.Aware {
			return fmt.Errorf("the contract is already signed")
		}

		contract.Parties.Application.Aware = true
	}

	if contract.Parties.Process.MSPID == MSPID {

		if contract.Parties.Process.Aware {
			return fmt.Errorf("the contract is already signed")
		}

		contract.Parties.Process.Aware = true
	}

	contract.IsActivated = contract.Parties.Application.Aware && contract.Parties.Process.Aware

	return nil
}

func (s *SmartContract) Query(ctx contractapi.TransactionContextInterface, contractId string) (*Asset, error) {

	contractAsBytes, err := ctx.GetStub().GetState(contractId)

	if err != nil {
		return nil, fmt.Errorf("failed to read from state: %s", err.Error())
	}

	if contractAsBytes == nil {
		return nil, fmt.Errorf("contract %s does not exist", contractId)
	}

	contract := new(Asset)

	err = json.Unmarshal(contractAsBytes, contract)

	if err != nil {
		return nil, fmt.Errorf("marshal error: %s", err.Error())
	}

  return contract, nil
}

<% clauses.forEach(clause => { %>
  func (s *SmartContract) Clause<%= clause.name.pascal %> ( ctx contractapi.TransactionContextInterface, contractId string,
    <% clause.variables.map((variable, index) =>  { %>
      <% if (variable.type === 'BOOLEAN') {%>
        <%= \`\${variable.name} bool, \` %>
      <% } else { %>
        <%= \`\${variable.name} \${['NUMBER', 'DATE', 'DATETIME', 'TIME'].includes(variable.type) ? 'int' : 'string'},\` %>
      <% } %>
    <% }) %> 
  ) (bool, error) {

    contract, err := s.Query(ctx, contractId)

    if err != nil {
      return false, err
    }

    isValid := true;

    <% clause.terms.forEach((term, index) => { %>
      <% if (term.type === 'weekdayInterval') { %>
        isValid = isValid && weekDay >= contract.<%= clause.name.pascal %>.<%= term.name.pascal %>.Start && weekDay <= contract.<%= clause.name.pascal %>.<%= term.name.pascal %>.End;
      <% } %>

      <% if (term.type === 'timeInterval') { %>
        isValid = isValid && accessTime >= contract.<%= clause.name.pascal %>.<%= term.name.pascal %>.Start && accessTime <= contract.<%= clause.name.pascal %>.<%= term.name.pascal %>.End;
      <% } %>

      <% if (term.type === 'timeout') { %>
        isValid = isValid && accessDateTime <= contract.<%= clause.name.pascal %>.<%= term.name.pascal %>.End;
      <% } %>

      <% if (term.type === 'messageContent' && term.arguments.type === 'TEXT') { %>
        isValid = isValid && contract.<%= clause.name.pascal %>.<%= term.name.pascal %> <%- term.arguments.operator %> <%= term.name.camel %>;
      <% } %>

      <% if (term.type === 'messageContent' && term.arguments.type !== 'TEXT') { %>
        isValid = isValid && contract.<%= clause.name.pascal %>.<%= term.name.pascal %> <%- term.arguments.operator %> <%= term.name.camel %>;
      <% } %>

      <% if (term.type === 'maxNumberOfOperation') { %>
        maxNumberOfOperationIsInitialized<%= index %> := contract.<%= clause.name.pascal %>.<%= term.name.pascal %>.Start == 0 && contract.<%= clause.name.pascal %>.<%= term.name.pascal %>.End == 0;

        endPeriodIsLassThanAccessDateTime<%= index %> := contract.<%= clause.name.pascal %>.<%= term.name.pascal %>.End < accessDateTime;

        if (!maxNumberOfOperationIsInitialized<%= index %> || endPeriodIsLassThanAccessDateTime<%= index %>) {
          contract.<%= clause.name.pascal %>.<%= term.name.pascal %>.Start  = accessDateTime;
          contract.<%= clause.name.pascal %>.<%= term.name.pascal %>.End    = accessDateTime + timeInSeconds[contract.<%= clause.name.pascal %>.<%= term.name.pascal %>.TimeUnit];
          contract.<%= clause.name.pascal %>.<%= term.name.pascal %>.Used   = 0;
        }

        isValid = isValid && contract.<%= clause.name.pascal %>.<%= term.name.pascal %>.Used <= contract.<%= clause.name.pascal %>.<%= term.name.pascal %>.Max;

      <% } %>

    <% }) %>

    <% if (clause.operation === 'request') { %>
      <% timeoutTerms.forEach(timeout => { %>
        contract.<%= timeout.clauseName.pascal %>.<%= timeout.termName.pascal %>.End  = accessDateTime + contract.<%= timeout.clauseName.pascal %>.<%= timeout.termName.pascal %>.Increase;
      <% }) %>
    <% } %>

    if !isValid {
      <% if (clause.errorMessage) { %>
        return isValid, fmt.Errorf(<%- clause.errorMessage %>)
      <% } else { %>
        return isValid, fmt.Errorf("error executing clause: <%- clause.name.pascal %>")
      <% } %>
    }

    return isValid, nil;
  }
  <% }) %>

func main() {
	chainconde, err := contractapi.NewChaincode(new(SmartContract))

	if err != nil {
		fmt.Errorf("error create chaincode: %s", err.Error())
		return
	}

	if err := chainconde.Start(); err != nil {
		fmt.Errorf("error create chaincode: %s", err.Error())
	}
}

`;
