/* eslint-disable @typescript-eslint/no-require-imports -- Verify actual client markup with React's server renderer. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const navigation = require("../.navigation-test/mobile-navigation.js");

function renderNavigation(pathname, deliveryUrl, withHeader = false) {
  const modules = new Map();
  function load(file) {
    if (modules.has(file)) return modules.get(file);
    const filename = path.join(__dirname, "..", file);
    const exports = {};
    modules.set(file, exports);
    const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX }, fileName: filename,
    }).outputText;
    vm.runInNewContext(output, { exports, require: id => {
      if (id === "react" || id === "react/jsx-runtime") return require(id);
      if (id === "next/navigation") return { usePathname: () => pathname };
      if (id === "next/link") return { default: props => React.createElement("a", props) };
      if (id === "@/lib/mobile-navigation") return navigation;
      if (id === "@/components/ui/Icon") return load("components/ui/Icon.tsx");
      if (id === "./MobileNavigation") return load("components/layout/MobileNavigation.tsx");
      if (id === "next/image") return { default: props => {
        const imageProps = { ...props }; delete imageProps.priority;
        return React.createElement("img", imageProps);
      } };
      if (id === "@/components/ui/Button") return { Button: props => {
        const linkProps = { ...props }; delete linkProps.external;
        return React.createElement("a", linkProps);
      } };
      if (id.endsWith(".css")) return { default: new Proxy({}, { get: (_, key) => String(key) }) };
      throw new Error(`Unexpected dependency: ${id}`);
    } }, { filename });
    return exports;
  }
  const { MobileNavigationProvider } = load("components/layout/MobileNavigation.tsx");
  const children = withHeader
    ? React.createElement(load("components/layout/Header.tsx").Header)
    : React.createElement("main", null, "Conteúdo");
  return renderToStaticMarkup(React.createElement(MobileNavigationProvider, { deliveryUrl }, children));
}

test("all five mobile actions render with the configured Delivery link and accessible menu control", () => {
  const html = renderNavigation("/", "https://delivery.example.com/compras");
  for (const label of ["Início", "Ofertas", "Compre Online", "Lojas", "Mais"]) assert.match(html, new RegExp(label));
  assert.match(html, /href="https:\/\/delivery.example.com\/compras"/);
  assert.match(html, /href="\/folheteria"/);
  assert.match(html, /href="\/lojas"/);
  assert.match(html, /aria-controls="main-navigation"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /aria-label="Mais — abrir menu completo"/);
  assert.equal((html.match(/aria-current="page"/g) || []).length, 1);
});
test("the complete header menu and the lower navigation share the same disclosure", () => {
  const html = renderNavigation("/lojas", undefined, true);
  assert.match(html, /id="main-navigation"/);
  assert.match(html, /aria-label="Navegação principal"/);
  assert.match(html, /aria-label="Navegação rápida"/);
  assert.match(html, /aria-label="Fechar menu completo"/);
  assert.equal((html.match(/aria-controls="main-navigation"/g) || []).length, 2);
  assert.match(html, /href="\/#historia"/);
});
test("public destinations preserve route-aware active states without partial-prefix mistakes", () => {
  for (const pathname of ["/folheteria", "/folheteria/flv", "/folhetos/123"]) assert.equal(navigation.mobileNavigationActive(pathname), "offers");
  for (const pathname of ["/lojas", "/lojas/loja-1"]) assert.equal(navigation.mobileNavigationActive(pathname), "stores");
  for (const pathname of ["/videos", "/vagas", "/lojas-outras"]) assert.equal(navigation.mobileNavigationActive(pathname), "more");
  assert.match(renderNavigation("/lojas/loja-1"), /href="\/lojas"[^>]+aria-current="page"/);
});
test("CMS, design previews and PDF readers retain their available screen space", () => {
  for (const pathname of ["/admin", "/admin/personalizacao", "/design-system", "/revista/123/folhear", "/folhetos/123/folhear"]) {
    const html = renderNavigation(pathname);
    assert.equal(html, "<main>Conteúdo</main>");
    assert.equal(navigation.mobileNavigationVisible(pathname), false);
  }
  for (const pathname of ["/", "/videos", "/vagas", "/revista", "/admin-outro"]) assert.equal(navigation.mobileNavigationVisible(pathname), true);
});
test("empty or unsafe purchase URLs fall back to Coopercica Delivery", () => {
  const fallback = "https://www.coopercicadelivery.com.br/";
  for (const value of [undefined, "", "javascript:alert(1)", "http://delivery.example.com", "https://user:pass@delivery.example.com", "invalid"]) assert.equal(navigation.mobileDeliveryHref(value), fallback);
  assert.equal(navigation.mobileDeliveryHref("https://delivery.example.com/?loja=1"), "https://delivery.example.com/?loja=1");
});
