export const SOLIDITY_TEMPLATE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

uint8 constant SUNDAY=0;
uint8 constant MONDAY=1;
uint8 constant TUESDAY=2;
uint8 constant WEDNESDAY=3;
uint8 constant THURSDAY=4;
uint8 constant FRIDAY=5;
uint8 constant SATURDAY=6;

uint8 constant SECOND = 0;
uint8 constant MINUTE = 1;
uint8 constant HOUR= 2;
uint8 constant DAY= 3;
uint8 constant WEEK= 4;
uint8 constant MONTH= 5;
uint8 constant YEAR= 6;

struct Party {
    string name;
    address walletAddress;
    bool aware;
}

struct Parties {
    Party application;
    Party proccess;
}

struct Interval {
    uint32 start;
    uint32 end;
}

struct Timeout {
  uint32 increase;
  uint32 end;
}

struct MaxNumberOfOperation {
    uint32 max;
    uint32 used;
    uint32 start;
    uint32 end;
    uint8 timeUnit;
}

<% clauses.forEach(clause => { %>
struct <%= clause.name.pascal %> {
  <% clause.terms.forEach(term => { %>
    <% if (term.type === 'weekdayInterval' || term.type === 'timeInterval') { %>
      Interval <%= term.name.camel %>;
    <% } %>

    <% if (term.type === 'maxNumberOfOperation') { %>
      MaxNumberOfOperation <%= term.name.camel %>;
    <% } %>

    <% if (term.type === 'timeout') { %>
      Timeout <%= term.name.camel %>;
    <% } %>

    <% if (term.type === 'messageContent') { %>

      <% if (term.arguments.type === 'BOOLEAN') { %>
        bool <%= term.name.camel %>;
      <% } else if (term.arguments.type === 'NUMBER') { %>
        uint32 <%= term.name.camel %>;
      <% } else if (term.arguments.type === 'TEXT') { %>
        string <%= term.name.camel %>;
      <% } %>
      
    <% } %>

  <% }) %>
}
<% }) %>

contract <%= contractName %> {

    Parties private parties;
    bool private isActivated = false;

    <% clauses.forEach(clause => { %>
      <%= clause.name.pascal %> private <%= clause.name.camel %>;
    <% }) %>

    mapping (uint8 => uint32) private timeInSeconds;

    event SuccessEvent(string _logMessage);

    modifier onlyProcess() {
        require(isActivated, "This contract is deactivated");
        require(parties.proccess.walletAddress == msg.sender, "Only the process can execute this operation");
        _;
    }

    modifier onlyParties() {
        require(parties.application.walletAddress == msg.sender || parties.proccess.walletAddress == msg.sender, "Only the process or the application can execute this operation");
        _;
    }

    constructor(Parties memory _parties, <%= clauses.map(clause => \`\${clause.name.pascal} memory _\${clause.name.camel}\`).join(', ') %>) {
        parties = _parties;

        parties.application.aware = false;
        parties.proccess.aware = false;

        <%= clauses.map(clause => \`\${clause.name.camel} = _\${clause.name.camel};\`).join('') %>

        <% clauses.forEach(clause => { %>
          <% clause.terms.forEach(term => { %>
            <% if (term.type === 'maxNumberOfOperation') { %>
              <%= clause.name.camel %>.<%= term.name.camel %>.used = 0;
              <%= clause.name.camel %>.<%= term.name.camel %>.start = 0;
              <%= clause.name.camel %>.<%= term.name.camel %>.end = 0;
            <% } %>
          <% }) %>
        <% }) %>

        timeInSeconds[SECOND]   = 1;
        timeInSeconds[MINUTE]   = 1 * 60;
        timeInSeconds[HOUR]     = 1 * 60 * 60;
        timeInSeconds[DAY]      = 1 * 60 * 60 * 24;
        timeInSeconds[WEEK]     = 1 * 60 * 60 * 24 * 7;
        timeInSeconds[MONTH]    = 1 * 60 * 60 * 24 * 7 * 30;
    }

    <% clauses.forEach(clause => { %>
    function clause<%= clause.name.pascal %> ( 
      <% clause.variables.map((variable, index) =>  { %>
        <% if (variable.type === 'BOOLEAN') {%>
          <%= \`bool _\${variable.name} \${index !== (clause.variables.length - 1) ? ',' : ''} \` %>
        <% } else { %>
          <%= \`\${['NUMBER', 'DATE', 'DATETIME', 'TIME'].includes(variable.type) ? 'uint32' : 'string memory'} _\${variable.name} \${index !== (clause.variables.length - 1) ? ',' : ''} \` %>
        <% } %>
      <% }) %> 
    )
     public onlyProcess returns (bool) {
      bool isValid = true;

      <% clause.terms.forEach((term, index) => { %>
        <% if (term.type === 'weekdayInterval') { %>
          isValid = isValid && _weekDay >= <%= clause.name.camel %>.<%= term.name.camel %>.start && _weekDay <= <%= clause.name.camel %>.<%= term.name.camel %>.end;
        <% } %>

        <% if (term.type === 'timeInterval') { %>
          isValid = isValid && _accessTime >= <%= clause.name.camel %>.<%= term.name.camel %>.start && _accessTime <= <%= clause.name.camel %>.<%= term.name.camel %>.end;
        <% } %>

        <% if (term.type === 'timeout') { %>
          isValid = isValid && _accessDateTime <= <%= clause.name.camel %>.<%= term.name.camel %>.end;
        <% } %>

        <% if (term.type === 'messageContent' && term.arguments.type === 'TEXT') { %>
          isValid = isValid && keccak256(abi.encodePacked(<%= clause.name.camel %>.<%= term.name.camel %>)) <%- term.arguments.operator %> keccak256(abi.encodePacked(_<%= term.name.camel %>));
        <% } %>

        <% if (term.type === 'messageContent' && term.arguments.type !== 'TEXT') { %>
          isValid = isValid && <%= clause.name.camel %>.<%= term.name.camel %> <%- term.arguments.operator %> _<%= term.name.camel %>;
        <% } %>

        <% if (term.type === 'maxNumberOfOperation') { %>
          bool maxNumberOfOperationIsInitialized<%= index %> = <%= clause.name.camel %>.<%= term.name.camel %>.start == 0 && <%= clause.name.camel %>.<%= term.name.camel %>.end == 0;

          bool endPeriodIsLassThanAccessDateTime<%= index %> = <%= clause.name.camel %>.<%= term.name.camel %>.end < _accessDateTime;

          if (!maxNumberOfOperationIsInitialized<%= index %> || endPeriodIsLassThanAccessDateTime<%= index %>) {
            <%= clause.name.camel %>.<%= term.name.camel %>.start  = _accessDateTime;
            <%= clause.name.camel %>.<%= term.name.camel %>.end    = _accessDateTime + timeInSeconds[<%= clause.name.camel %>.<%= term.name.camel %>.timeUnit];
            <%= clause.name.camel %>.<%= term.name.camel %>.used   = 0;
          }

          isValid = isValid && <%= clause.name.camel %>.<%= term.name.camel %>.used <= <%= clause.name.camel %>.<%= term.name.camel %>.max;

        <% } %>

      <% }) %>

      <% if (clause.operation === 'request') { %>
        <% timeoutTerms.forEach(timeout => { %>
          <%= timeout.clauseName.camel %>.<%= timeout.termName.camel %>.end  = _accessDateTime + <%= timeout.clauseName.camel %>.<%= timeout.termName.camel %>.increase;
        <% }) %>
      <% } %>

      <% if (clause.errorMessage) { %>
        require(!isValid, <%- clause.errorMessage %>);
      <% } else { %>
        require(!isValid, "Error executing clause: <%- clause.name.pascal %>");
      <% } %>

      emit SuccessEvent("Successful execution!");
      return isValid;
    }
    <% }) %>

    function signContract() public onlyParties returns(bool) {

        if (parties.application.walletAddress == msg.sender) {
            require(!parties.application.aware, "The contract is already signed");
            parties.application.aware = true;
        }

        if (parties.proccess.walletAddress == msg.sender) {
            require(!parties.proccess.aware, "The contract is already signed");
            parties.proccess.aware = true;
        }

        isActivated = parties.application.aware && parties.proccess.aware;

        return true;
    }
}
`;
