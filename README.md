<h1 align="center">
  <br>
  <img src="light.png#gh-light-mode-only" width="200" alt="Jabuti DSL">
  <img src="dark.png#gh-dark-mode-only" width="200" alt="Jabuti DSL">
  <br>
  Jabuti DSL Model Transformation
  <br>
</h1>

<h4 align="center">A package for transforming Jabuti code into other languages.</h4>

<div align="center">
  <img src="https://img.shields.io/badge/Node.js-16-green.svg" alt="Node.js v16">
</div>

<br>

# Executing the transformation

Currently, there are two transformation templates available: Ethereum with Solidity and Hyperledger Fabric with Golang. To transform to one of these blockchains, simply instantiate the corresponding class and execute the transformation as shown below:

```javascript
import { HyperledgerFabricGolangParser, EthereumSolidityParser } from 'jabuti-dsl-model-transformation';

const hyperledgerFabricGolangParser = new HyperledgerFabricGolangParser();
const ethereumSolidityParser = new EthereumSolidityParser();

const jabutiContract = `
  contract Sample {

  }
`;

hyperledgerFabricGolangParser
  .parse(jabutiContract)
  .then(smartContract => {
    console.log('[Hyperledger Fabric Golang Smart Contract]', smartContract);
  });

ethereumSolidityParser
  .parse(jabutiContract)
  .then(smartContract => {
    console.log('[Ethereum Solidity Smart Contract]', smartContract);
  });

```

# Compiling the project

This project uses esbuild as the build engine. The esbuild settings are available in the build.js file, but can be seen below.

```javascript 
const esbuild = require("esbuild");
const path = require("path");

esbuild.buildSync({
  entryPoints: [path.join(__dirname, 'src/index.ts')],
  bundle: true,
  platform: 'node',
  minify: true,
  entryNames: 'index',
  external: ['esbuild', 'prettier'],
  sourcemap: 'inline',
  outdir: path.join(__dirname, 'dist'),
});
```

Para compilar este projeto basta executar o comando: 

```shell
node build.js
```


## License

Copyright © 2023 [The Applied Computing Research Group (GCA)](https://github.com/gca-research-group).<br />
This project is [MIT](https://github.com/gca-research-group/jabuti-dsl-language-model-transformation/blob/master/LICENSE) licensed.