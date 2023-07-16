import { TerminalNode } from 'antlr4ts/tree/TerminalNode';
import { Ast } from './models/ast.model';
import { CharStreams, CommonTokenStream, RuleContext } from 'antlr4ts'
import { JabutiGrammarLexer } from 'jabuti-dsl-language-antlr-v3/dist/JabutiGrammarLexer';
import { JabutiGrammarParser } from 'jabuti-dsl-language-antlr-v3/dist/JabutiGrammarParser';

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
  "tokenType": 66,
  "ruleIndex": 41
},
{
  "tokenType": 66,
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
  "tokenType": 69,
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
  "tokenType": 66,
  "ruleIndex": 41
},
{
  "tokenType": 66,
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
  "tokenType": 69,
  "ruleIndex": 38
}];

export class ASTProcessor {
  private ast: Ast[] = [];

  process(contract: string) {
    const context = this.getContext(contract);
    this.buildRecursiveAst(context);
    return this.buildAst(this.ast);
  }

  private getContext(contract: string) {
    const inputStream = CharStreams.fromString(contract);
    const lexer = new JabutiGrammarLexer(inputStream);
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new JabutiGrammarParser(tokenStream);
    const context = parser.contract();

    return context;
  }

  private buildRecursiveAst(tree: RuleContext, rules: number[] = []) {
    const childCount = tree.childCount;
    Array.from(Array(childCount).keys()).forEach((_, index) => {
      const child = tree.getChild(index) as RuleContext;
      if (!child) return;
      if (!(child instanceof TerminalNode)) {
        if (!rules.includes(tree.ruleIndex))
          rules.push(tree.ruleIndex);
        this.buildRecursiveAst(child, [...rules]);
        return;
      }
      const ruleIndex = tree.ruleIndex;
      const token = child.symbol;
      const tokenType = token.type;
      this.ast.push({ token: <string>token.text, tokenType, ruleIndex, rules});
    });
  }

  private buildAst(ast: Ast[]) {

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

    return data;
  }

  private convertToDateTime(arr: string[]) {
    return [...arr.slice(0, 5), ' ', ...arr.slice(5)].join('');
  }
}
