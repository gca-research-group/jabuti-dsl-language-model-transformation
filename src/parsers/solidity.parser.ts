import { type Parser } from '../models/parser.model';
import { SOLIDITY_TEMPLATE } from '../templates/solidity.template';
import { GenericParser } from './generic.parser';

export class SolidityParser extends GenericParser implements Parser {
  parse(contract: string) {
    const content = super.parse(contract, SOLIDITY_TEMPLATE);
    return content;
  }
}
