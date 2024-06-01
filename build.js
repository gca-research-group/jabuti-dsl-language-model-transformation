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