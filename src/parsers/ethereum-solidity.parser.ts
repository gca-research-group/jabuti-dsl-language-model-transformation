import { SOLIDITY_TEMPLATE } from '../templates/ethereum-solidity.template';
import { GenericParser } from './generic.parser';

import * as path from 'path';

import * as prettier from 'prettier';

export class EthereumSolidityParser extends GenericParser {
  protected async formatContent(content: string) {
    try {
      const modulePath = require.resolve('prettier-plugin-solidity');
      const pluginPath = path.dirname(modulePath);

      const options = {
        parser: 'solidity-parse',
        plugins: [pluginPath]
      };

      return await prettier.format(content, options);
    } catch (error) {
      return content;
    }
    
  }

  async parse(contract: string) {
    const content = super.parse(contract, SOLIDITY_TEMPLATE);
    return await this.formatContent(content as string);
  }
}
