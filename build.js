const { build } = require('esbuild');
const { Generator } = require('npm-dts');
const fs = require('fs');
const path = require("path");

const pkg = require(path.resolve("./package.json"));

const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

fs.rmSync('dist', { recursive: true, force: true });

new Generator({
  entry: 'index.ts',
  output: 'dist/index.d.ts',
}).generate();

const shared = {
  entryPoints: ['index.ts'],
  bundle: true,
  minify: true,
  platform: 'node'
};

build({
  ...shared,
  outfile: 'dist/index.js',
  external,
  format: 'cjs'
});

build({
  ...shared,
  outfile: 'dist/index.esm.js',
  external,
  format: 'esm',
  external
});