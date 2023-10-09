import { execSync } from 'child_process';
import { ETHEREUM_GOLANG_TEMPLATE } from '../templates/hyperledger-fabric-golang.template';
import { GenericParser } from './generic.parser';

const GO_MOD_FILE = `
module github.com/hyperledger-fabric/chaincode

go 1.20

require github.com/hyperledger/fabric-contract-api-go v1.2.1

require github.com/google/uuid v1.3.1

require github.com/hyperledger/fabric-chaincode-go v0.0.0-20230731094759-d626e9ab09b9

`;

export class EthereumGolangParser extends GenericParser {
  protected formatContent(content: string) {
    try {
      return execSync('gofmt', {
        input: content,
        encoding: 'utf8'
      });
    } catch (error) {
      return content;
    }
  }

  parse(contract: string) {
    const content = super.parse(contract, ETHEREUM_GOLANG_TEMPLATE);
    return [this.formatContent(content as string), GO_MOD_FILE];
  }
}
