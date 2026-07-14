import { campaigns } from "@/data/campaigns";
import { stores } from "@/data/stores";
import { magazines } from "@/data/content";

export async function getCampaigns() {
  return campaigns
    .filter((campaign) => campaign.active)
    .sort((a, b) => a.order - b.order);
}

export async function getStores() {
  return stores;
}

export async function getMagazines() {
  return magazines;
}

// Futuro Admin:
// estas funções poderão buscar os dados diretamente do banco ou CMS.
// Os componentes do site não precisarão ser reconstruídos.