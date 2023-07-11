import { CharStreams, CommonTokenStream } from 'antlr4ts';
import * as ejs from 'ejs';
import { JabutiGrammarLexer } from 'jabuti-dsl-language-antlr-v3/dist/JabutiGrammarLexer';
import { JabutiGrammarParser } from 'jabuti-dsl-language-antlr-v3/dist/JabutiGrammarParser';
import { ASTProcessor } from '../ast-processor';
import { SOLIDITY_TEMPLATE } from '../templates/solidity.template';
import * as fs from 'fs';

const CONTRACT_NAME = {ruleIndex: 3, tokenType: 71};
const APPLICATION = {ruleIndex: 9, tokenType: 63};
const PROCESS = {ruleIndex: 10, tokenType: 63};
const BEGIN_DATE = [
{
  "tokenType": 70,
  "ruleIndex": 43
},
{
  "tokenType": 57,
  "ruleIndex": 36
},
{
  "tokenType": 64,
  "ruleIndex": 42
},
{
  "tokenType": 57,
  "ruleIndex": 36
},
{
  "tokenType": 67,
  "ruleIndex": 41
},
{
  "tokenType": 65,
  "ruleIndex": 40
},
{
  "tokenType": 55,
  "ruleIndex": 37
},
{
  "tokenType": 64,
  "ruleIndex": 39
},
{
  "tokenType": 55,
  "ruleIndex": 37
},
{
  "tokenType": 64,
  "ruleIndex": 38
}];

const DUE_DATE = [{
  "tokenType": 70,
  "ruleIndex": 43,
},
{
  "tokenType": 57,
  "ruleIndex": 36
},
{
  "tokenType": 64,
  "ruleIndex": 42
},
{
  "tokenType": 57,
  "ruleIndex": 36
},
{
  "tokenType": 67,
  "ruleIndex": 41
},
{
  "tokenType": 65,
  "ruleIndex": 40
},
{
  "tokenType": 55,
  "ruleIndex": 37
},
{
  "tokenType": 69,
  "ruleIndex": 39
},
{
  "tokenType": 55,
  "ruleIndex": 37
},
{
  "tokenType": 69,
  "ruleIndex": 38
}];

export class SolidityParser {
  

  parse(contract: string) {
    const inputStream = CharStreams.fromString(contract);
    const lexer = new JabutiGrammarLexer(inputStream);
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new JabutiGrammarParser(tokenStream);
    const context = parser.contract();

    const processor = new ASTProcessor();
    const ast = processor.process(context).get();

    const contractName = ast.find(item => item.ruleIndex === CONTRACT_NAME.ruleIndex && item.tokenType === CONTRACT_NAME.tokenType)?.token;

    const beginDate = ast
      .filter(item => BEGIN_DATE.find(_item => _item.ruleIndex === item.ruleIndex && _item.tokenType === item.tokenType) && item.rules?.includes(7))
      .map(item => item.token);

    const dueDate = ast
      .filter(item => DUE_DATE.find(_item => _item.ruleIndex === item.ruleIndex && _item.tokenType === item.tokenType) && item.rules?.includes(8))
      .map(item => item.token);

    const application = ast.find(item => item.ruleIndex === APPLICATION.ruleIndex && item.tokenType === APPLICATION.tokenType)?.token?.replace(/\/|\"/g, '');
    
    const process = ast.find(item => item.ruleIndex === PROCESS.ruleIndex && item.tokenType === PROCESS.tokenType)?.token?.replace(/\/|\"/g, '');

    const data = {
      contractName, dueDate: this.convertToDateTime(dueDate),
      variables: [
        { name: 'beginDate', value: this.convertToDateTime(beginDate) },
        { name: 'dueDate', value: this.convertToDateTime(dueDate) },
        { name: 'application', value: application }, {name: 'process', value: process}
      ]
    };

    return ejs.render(SOLIDITY_TEMPLATE, data);
  }

  private convertToDateTime(arr: string[]) {
    return [...arr.slice(0, 5), ' ', ...arr.slice(5)].join('');
  }
}