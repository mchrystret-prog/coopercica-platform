import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./leaflets";
import {
  ASSET_PREFIX,
  isAsset,
  type LeafletAsset,
} from "./leaflet-presentation";

export async function getLeafletAssets(
  token?: string,
): Promise<LeafletAsset[]> {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/site_settings?key=like.${ASSET_PREFIX}*&select=value&order=key.asc`,
    {
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    },
  );
  if (!response.ok)
    throw new Error(
      "Não foi possível consultar a biblioteca de fundos e selos. Tente novamente.",
    );
  const rows: Array<{ value: unknown }> = await response.json();
  return rows.map((row) => row.value).filter(isAsset);
}
