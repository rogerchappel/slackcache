import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const packageJson = JSON.parse(read("package.json"));
const readme = read("README.md");
const releaseWorkflow = read(".github/workflows/release.yml");

assert.doesNotMatch(
  readme,
  /npm (?:i|install)(?:\s+--global|\s+-g)\s+slackcache\b/,
  "README must not claim slackcache is available from npm without an npm publish step",
);

assert.match(
  readme,
  /releases\/download\/v\$\{VERSION\}\/slackcache-\$\{VERSION\}\.tgz/,
  "README must install the versioned GitHub release package",
);

assert.match(
  releaseWorkflow,
  /\brun:\s+npm pack\b/,
  "tag workflow must build the npm package tarball",
);
assert.match(
  releaseWorkflow,
  /gh release create[\s\S]*\*\.tgz/,
  "tag workflow must attach the package tarball to the GitHub release",
);

assert.equal(packageJson.name, "slackcache");
assert.match(packageJson.version, /^\d+\.\d+\.\d+$/);

console.log("slackcache release contract passed");
