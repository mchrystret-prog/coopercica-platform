"use client";
import { useState } from "react";
import { ContentManager } from "./ContentManager";
import { LeafletCreate } from "./LeafletCreate";
import { LeafletAssetLibrary } from "./LeafletAssetLibrary";
export function LeafletWorkspace() {
  const [tab, setTab] = useState<"leaflets" | "assets">("leaflets");
  const [revision, setRevision] = useState(0);
  return (
    <>
      <div className="cms-custom-tabs">
        <button
          type="button"
          data-active={tab === "leaflets"}
          onClick={() => {
            setTab("leaflets");
            setRevision((value) => value + 1);
          }}
        >
          Folhetos
        </button>
        <button
          type="button"
          data-active={tab === "assets"}
          onClick={() => setTab("assets")}
        >
          Fundos e selos
        </button>
      </div>
      <div hidden={tab !== "leaflets"}>
        <ContentManager
          kind="leaflet"
          title="Folhetos"
          createTitle="Novo folheto"
          description="Gerencie os folhetos digitais, vigências e produtos publicados no site."
        >
          <LeafletCreate libraryRevision={revision} />
        </ContentManager>
      </div>
      {tab === "assets" ? <LeafletAssetLibrary /> : null}
    </>
  );
}
