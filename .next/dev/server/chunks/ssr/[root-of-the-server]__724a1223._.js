module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/app/admin/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/admin/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/data/content.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "campaigns",
    ()=>campaigns,
    "magazines",
    ()=>magazines,
    "stores",
    ()=>stores
]);
const campaigns = [
    {
        id: "julina",
        title: "Mió que essa tradição num tem",
        eyebrow: "Campanha vigente",
        image: "/placeholders/campaign-julina.svg",
        mobileImage: "/placeholders/campaign-julina.svg",
        href: "/revista",
        cta: "Confira a campanha",
        active: true,
        order: 1,
        accent: "#f5b82e"
    },
    {
        id: "delivery",
        title: "Suas compras, do nosso jeito, onde você estiver",
        eyebrow: "Coopercica Delivery",
        image: "/placeholders/campaign-delivery.svg",
        mobileImage: "/placeholders/campaign-delivery.svg",
        href: "https://www.coopercicadelivery.com.br/",
        cta: "Comprar agora",
        active: true,
        order: 2,
        accent: "#64b445"
    },
    {
        id: "coopermais",
        title: "Vantagens que acompanham a sua rotina",
        eyebrow: "Cliente Coopermais",
        image: "/placeholders/campaign-coopermais.svg",
        mobileImage: "/placeholders/campaign-coopermais.svg",
        href: "#coopermais",
        cta: "Conheça",
        active: true,
        order: 3,
        accent: "#0d5b32"
    }
];
const stores = [
    {
        id: "loja-1",
        name: "Loja 1",
        neighborhood: "Jardim Cica",
        city: "Jundiaí",
        address: "Rua João Ferrara, 233",
        hours: "Todos os dias • 07h às 22h",
        image: "/stores/loja-01.jpg",
        mapsUrl: "https://maps.app.goo.gl/brDJneFt8p4KmMJJ9"
    },
    {
        id: "loja-2",
        name: "Loja 2",
        neighborhood: "Parque Residencial Eloy Chaves",
        city: "Jundiaí",
        address: "Rua Romeu Seckler Machado, 105",
        hours: "Todos os dias • 07h às 22h",
        image: "/stores/loja-02.jpg",
        mapsUrl: ""
    },
    {
        id: "loja-3",
        name: "Loja 3",
        neighborhood: "Vila Rio Branco",
        city: "Jundiaí",
        address: "Av. Antônio Frederico Ozanan, 6001",
        hours: "Todos os dias • 07h às 22h",
        image: "/stores/loja-03.jpg",
        mapsUrl: ""
    },
    {
        id: "loja-4",
        name: "Loja 4",
        neighborhood: "Jardim São Vicente",
        city: "Jundiaí",
        address: "Rua Hisashi Nagaoka, 3595",
        hours: "Todos os dias • 07h às 22h",
        image: "/stores/loja-04.jpg",
        mapsUrl: ""
    },
    {
        id: "loja-5",
        name: "Loja 5",
        neighborhood: "Jardim Santa Lúcia",
        city: "Campo Limpo Paulista",
        address: "Rua Maria José Rodrigues, 90",
        hours: "Todos os dias • 07h às 22h",
        image: "/stores/loja-05.jpg",
        mapsUrl: ""
    },
    {
        id: "loja-6",
        name: "Loja 6",
        neighborhood: "Caxambu",
        city: "Jundiaí",
        address: "Av. Humberto Cereser, 3805",
        hours: "Todos os dias • 07h às 22h",
        image: "/stores/loja-06.jpg",
        mapsUrl: ""
    },
    {
        id: "loja-7",
        name: "Loja 7",
        neighborhood: "Jardim Promeca",
        city: "Várzea Paulista",
        address: "Av. Duque de Caxias, 2395",
        hours: "Todos os dias • 07h às 22h",
        image: "/stores/loja-07.jpg",
        mapsUrl: ""
    },
    {
        id: "loja-8",
        name: "Loja 8",
        neighborhood: "Centro",
        city: "Várzea Paulista",
        address: "Av. Fernão Dias Paes Leme, 2211",
        hours: "Todos os dias • 07h às 22h",
        image: "/stores/loja-08.jpg",
        mapsUrl: ""
    },
    {
        id: "loja-9",
        name: "Loja 9",
        neighborhood: "Centro",
        city: "Itupeva",
        address: "Av. José Tonoli, 336",
        hours: "Todos os dias • 07h às 22h",
        image: "/stores/loja-09.jpg",
        mapsUrl: ""
    }
];
const magazines = [
    {
        id: "ed-01",
        title: "Revista Coopercica",
        edition: "Edição atual",
        cover: "/magazine/edicao-atual.webp",
        href: "#"
    },
    {
        id: "ed-02",
        title: "Receitas e histórias",
        edition: "Edição anterior",
        cover: "/magazine/edicao-anterior.webp",
        href: "#"
    },
    {
        id: "ed-03",
        title: "Bem-estar e sabores",
        edition: "Especial",
        cover: "/magazine/especial.webp",
        href: "#"
    }
];
}),
"[project]/components/admin/AdminTable.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AdminTable",
    ()=>AdminTable,
    "AdminToolbar",
    ()=>AdminToolbar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
;
function AdminTable({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "admin-table",
        children: children
    }, void 0, false, {
        fileName: "[project]/components/admin/AdminTable.tsx",
        lineNumber: 2,
        columnNumber: 76
    }, this);
}
function AdminToolbar({ title, description, action }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
        className: "admin-header",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "eyebrow",
                        children: "Conteúdo"
                    }, void 0, false, {
                        fileName: "[project]/components/admin/AdminTable.tsx",
                        lineNumber: 3,
                        columnNumber: 165
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        children: title
                    }, void 0, false, {
                        fileName: "[project]/components/admin/AdminTable.tsx",
                        lineNumber: 3,
                        columnNumber: 206
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: description
                    }, void 0, false, {
                        fileName: "[project]/components/admin/AdminTable.tsx",
                        lineNumber: 3,
                        columnNumber: 222
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/admin/AdminTable.tsx",
                lineNumber: 3,
                columnNumber: 160
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "button",
                type: "button",
                children: action
            }, void 0, false, {
                fileName: "[project]/components/admin/AdminTable.tsx",
                lineNumber: 3,
                columnNumber: 248
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/admin/AdminTable.tsx",
        lineNumber: 3,
        columnNumber: 127
    }, this);
}
}),
"[project]/app/admin/campanhas/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Page
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$content$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/data/content.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$admin$2f$AdminTable$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/admin/AdminTable.tsx [app-rsc] (ecmascript)");
;
;
;
function Page() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "admin-page",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$admin$2f$AdminTable$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AdminToolbar"], {
                title: "Campanhas",
                description: "Organize os banners do hero, links, ordem e período de exibição.",
                action: "Adicionar banner"
            }, void 0, false, {
                fileName: "[project]/app/admin/campanhas/page.tsx",
                lineNumber: 3,
                columnNumber: 71
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$admin$2f$AdminTable$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AdminTable"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "admin-table-head",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Campanha"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/campanhas/page.tsx",
                                lineNumber: 3,
                                columnNumber: 255
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Destino"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/campanhas/page.tsx",
                                lineNumber: 3,
                                columnNumber: 276
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Ordem"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/campanhas/page.tsx",
                                lineNumber: 3,
                                columnNumber: 296
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Status"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/campanhas/page.tsx",
                                lineNumber: 3,
                                columnNumber: 314
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/campanhas/page.tsx",
                        lineNumber: 3,
                        columnNumber: 221
                    }, this),
                    __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$content$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["campaigns"].map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "admin-table-row",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                            children: c.title
                                        }, void 0, false, {
                                            fileName: "[project]/app/admin/campanhas/page.tsx",
                                            lineNumber: 3,
                                            columnNumber: 408
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                            children: c.eyebrow
                                        }, void 0, false, {
                                            fileName: "[project]/app/admin/campanhas/page.tsx",
                                            lineNumber: 3,
                                            columnNumber: 424
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/admin/campanhas/page.tsx",
                                    lineNumber: 3,
                                    columnNumber: 403
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: c.href
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/campanhas/page.tsx",
                                    lineNumber: 3,
                                    columnNumber: 456
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: c.order
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/campanhas/page.tsx",
                                    lineNumber: 3,
                                    columnNumber: 477
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "badge",
                                    children: c.active ? 'Ativa' : 'Inativa'
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/campanhas/page.tsx",
                                    lineNumber: 3,
                                    columnNumber: 499
                                }, this)
                            ]
                        }, c.id, true, {
                            fileName: "[project]/app/admin/campanhas/page.tsx",
                            lineNumber: 3,
                            columnNumber: 359
                        }, this))
                ]
            }, void 0, true, {
                fileName: "[project]/app/admin/campanhas/page.tsx",
                lineNumber: 3,
                columnNumber: 209
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/admin/campanhas/page.tsx",
        lineNumber: 3,
        columnNumber: 39
    }, this);
}
}),
"[project]/app/admin/campanhas/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/admin/campanhas/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__724a1223._.js.map