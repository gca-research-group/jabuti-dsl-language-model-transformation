import * as ejs from 'ejs';
import { ASTProcessor } from '../ast-processor';

export abstract class GenericParser {
  protected parse(contract: string, template?: string): string | string[] | Promise<string | string[]> {
    const processor = new ASTProcessor();
    const data = processor.process(contract);
    return ejs.render(template ?? '', data);
  }

  protected abstract formatContent(content: string): string | Promise<string>;
}
