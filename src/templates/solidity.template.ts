export const SOLIDITY_TEMPLATE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract <%= contractName %> { <% variables.forEach(variable => { %>\n\tstring public <%= variable.name %>;<% }) %>

    constructor() {<% variables.forEach((variable, index) => { %>\n\t\t<%= variable.name %> = "<%= variable.value %>";<% }) %>
    }
    <% variables.forEach(variable => { %>
    function set<%= variable.name.substring(0, 1).toUpperCase() %><%= variable.name.substring(1) %>(string memory _<%= variable.name %>) public {
        <%= variable.name %> = _<%= variable.name %>;
    }

    function get<%= variable.name.substring(0, 1).toUpperCase() %><%= variable.name.substring(1) %>() public view returns (string memory) {
        return <%= variable.name %>;
    }
    <% }) %>
}
`;