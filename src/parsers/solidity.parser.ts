import { type Parser } from '../models/parser.model';
import { SOLIDITY_TEMPLATE } from '../templates/solidity.template';
import { GenericParser } from './generic.parser';
import * as prettier from 'prettier';

export class SolidityParser extends GenericParser implements Parser {
  parse(contract: string) {
    const content = super.parse(contract, SOLIDITY_TEMPLATE);
    return prettier.format(content.toString(), {
      parser: 'solidity-parse',
      plugins: ['prettier-plugin-solidity'],
      printWidth: 120,
      tabWidth: 4,
      useTabs: false,
      singleQuote: false,
      bracketSpacing: false
    });
  }
}
