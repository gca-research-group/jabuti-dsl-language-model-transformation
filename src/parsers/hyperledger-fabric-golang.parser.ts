import { execSync } from 'child_process';
import { HYPERLEDGER_FABRIC_GOLANG_TEMPLATE } from '../templates/hyperledger-fabric-golang.template';
import { GenericParser } from './generic.parser';

const GO_MOD_FILE = `
module github.com/hyperledger-fabric/chaincode

go 1.20

require github.com/hyperledger/fabric-contract-api-go v1.2.1

require github.com/google/uuid v1.3.1

require github.com/hyperledger/fabric-chaincode-go v0.0.0-20230731094759-d626e9ab09b9

`;

export class HyperledgerFabricGolangParser extends GenericParser {
  protected formatContent(content: string) {
    try {
      const code = execSync('gofmt', {
        input: content,
        encoding: 'utf8'
      });

      return code.replace(/,\n\n/g, ',');
    } catch (error) {
      return content;
    }
  }

  parse(contract: string) {
    const content = super.parse(contract, HYPERLEDGER_FABRIC_GOLANG_TEMPLATE);
    return [this.formatContent(content as string), GO_MOD_FILE];
  }
}
