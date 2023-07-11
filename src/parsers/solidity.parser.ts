import { SOLIDITY_TEMPLATE } from '../templates/solidity.template';
import { Parser } from '../models/parser.model';
import { GenericParser } from './generic.parser';

export class SolidityParser extends GenericParser implements Parser {
  parse(contract: string) {
    return super.parse(contract, SOLIDITY_TEMPLATE);
  }
}