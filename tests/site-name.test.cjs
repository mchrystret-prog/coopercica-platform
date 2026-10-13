/* eslint-disable @typescript-eslint/no-require-imports -- Run the real metadata exports from TSX in Node. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const site = require("../.seo-test/lib/site.js");
const seo = require("../.seo-test/lib/seo.js");

function metadataModule(file) {
  const filename = path.join(__dirname, "..", file);
  const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
    fileName: filename,
  }).outputText;
  const exports = {};
  const dependencies = {
    "@/lib/site": site,
    "@/lib/seo": seo,
    "next/font/google": { Montserrat: () => ({ variable: "font-montserrat" }) },
  };
  vm.runInNewContext(output, {
    exports,
    process,
    URL,
    require: (id) => id in dependencies ? dependencies[id]
      : id === "react/jsx-runtime" ? require(id) : {},
  }, { filename });
  return exports;
}

test("saved CMS names reach the actual Home and root metadata on every request", async () => {
  const previousFetch = global.fetch;
  const previousIndexing = process.env.SITE_INDEXING_ENABLED;
  process.env.SITE_INDEXING_ENABLED = "false";
  let savedIdentity = { siteName: "Coopercica | Site Institucional", favicon: "/custom-icon.png" };
  global.fetch = async (url, options) => {
    assert.match(url, /site_settings\?key=eq.identity&select=value$/);
    assert.equal(options.cache, "no-store");
    return { ok: true, json: async () => [{ value: savedIdentity }] };
  };
  try {
    const root = metadataModule("app/layout.tsx");
    const home = metadataModule("app/page.tsx");
    for (const name of ["Coopercica | Site Institucional", "Coopercica — Novo nome"]) {
      savedIdentity = { ...savedIdentity, siteName: name };
      const rootMetadata = await root.generateMetadata();
      const homeMetadata = await home.generateMetadata();
      assert.equal(rootMetadata.title.default, name);
      assert.equal(rootMetadata.title.template, `%s | ${name}`);
      assert.equal(rootMetadata.applicationName, name);
      assert.equal(rootMetadata.icons.icon[0].url, "/custom-icon.png");
      assert.equal(homeMetadata.title.absolute, name);
      assert.equal(homeMetadata.openGraph.title, name);
      assert.equal(homeMetadata.openGraph.siteName, name);
      assert.equal(homeMetadata.twitter.title, name);
      assert.equal(homeMetadata.robots.index, false);
      const identity = await site.getSiteIdentity();
      const graph = seo.organizationGraph(identity.siteName)["@graph"];
      assert.equal(graph[1].name, name);
      assert.equal(graph[0].legalName, "Cooperativa de Consumo Coopercica");
    }
    for (const value of [undefined, "", "   "]) {
      savedIdentity = { siteName: value };
      assert.equal((await home.generateMetadata()).title.absolute, "Coopercica");
    }
    savedIdentity = { siteName: "  Nome salvo  " };
    assert.equal((await home.generateMetadata()).title.absolute, "Nome salvo");
    global.fetch = async () => ({ ok: false });
    assert.equal((await root.generateMetadata()).title.default, "Coopercica");
  } finally {
    global.fetch = previousFetch;
    if (previousIndexing === undefined) delete process.env.SITE_INDEXING_ENABLED;
    else process.env.SITE_INDEXING_ENABLED = previousIndexing;
  }
});
