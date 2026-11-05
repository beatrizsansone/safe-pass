// Version-pinned Prisma WASM generation for restricted/offline build environments.
// No native engine is downloaded; npm validates the published package integrity.
const fs = require('node:fs');
const path = require('node:path');
const { getConfig, getInternalDMMF } = require('@prisma/internals');
const { generateClient } = require('@prisma/client-generator-js');
const { enginesVersion } = require('@prisma/engines-version');
async function main() {
  const schemaPath = path.resolve('prisma/schema.prisma');
  const datamodel = fs.readFileSync(schemaPath, 'utf8');
  const { generators, datasources } = await getConfig({ datamodel });
  const dmmf = await getInternalDMMF({ datamodel });
  await generateClient({
    datamodel,
    schemaPath,
    generator: generators[0],
    dmmf,
    datasources,
    binaryPaths: {},
    outputDir: path.resolve('node_modules/.prisma/client'),
    runtimeSourcePath: path.resolve('node_modules/@prisma/client/runtime'),
    engineVersion: enginesVersion,
    clientVersion: require('@prisma/client/package.json').version,
    activeProvider: 'postgresql',
    compilerBuild: 'fast',
  });
  console.log('Cliente Prisma gerado via WASM.');
}
main().catch(() => {
  console.error('Falha na geração do cliente Prisma.');
  process.exitCode = 1;
});
