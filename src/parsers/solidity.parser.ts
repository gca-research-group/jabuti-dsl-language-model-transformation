import { CharStreams, CommonTokenStream } from 'antlr4ts';
import * as ejs from 'ejs';
import { JabutiGrammarLexer } from 'jabuti-dsl-language-antlr-v3/dist/JabutiGrammarLexer';
import { JabutiGrammarParser } from 'jabuti-dsl-language-antlr-v3/dist/JabutiGrammarParser';
import { ASTProcessor } from '../ast-processor';
import { SOLIDITY_TEMPLATE } from '../templates/solidity.template';

export class SolidityParser {
  parse(contract: string) {
    const inputStream = CharStreams.fromString(contract);
    const lexer = new JabutiGrammarLexer(inputStream);
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new JabutiGrammarParser(tokenStream);
    const context = parser.contract();

    const processor = new ASTProcessor();
    const ast = processor.process(context).get();

    const contractName = ast.find(item => item.rule === 'VariableName' && item.namespace === 'contract')?.token;

    const beginDate = ast
      .filter(item => item.namespace?.includes('contract.dates.begindate.dateordatetime.datetime'))
      .map(item => item.token);

    const dueDate = ast
      .filter(item => item.namespace?.includes('contract.dates.duedate.dateordatetime.datetime'))
      .map(item => item.token);

    const application = ast.find(item => item.rule === 'Application' && item.namespace === 'contract.parties' && item.tokenType === 63)?.token?.replace(/\/|\"/g, '');
    const process = ast.find(item => item.rule === 'Process' && item.namespace === 'contract.parties' && item.tokenType === 63)?.token?.replace(/\/|\"/g, '');

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