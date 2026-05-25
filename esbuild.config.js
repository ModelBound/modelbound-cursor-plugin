// Build the extension into a single CJS bundle for VS Code.
const esbuild = require("esbuild");

const watch = process.argv.includes("--watch");

const ctxPromise = esbuild.context({
  entryPoints: ["src/extension.ts"],
  bundle: true,
  format: "cjs",
  platform: "node",
  target: "node18",
  outfile: "dist/extension.js",
  external: ["vscode"],
  sourcemap: true,
  minify: !watch,
  logLevel: "info",
});

(async () => {
  const ctx = await ctxPromise;
  if (watch) {
    await ctx.watch();
  } else {
    await ctx.rebuild();
    await ctx.dispose();
  }
})();
