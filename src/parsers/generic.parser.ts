import * as ejs from 'ejs';
import { ASTProcessor } from '../ast-processor';
import { Parser } from '../models/parser.model';

export class GenericParser implements Parser {
  parse(contract: string, template: string) {
    const processor = new ASTProcessor();
    const data = processor.process(contract);
    return ejs.render(template, data);
  }
}