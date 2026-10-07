import type { LeafletProduct } from "./leaflets";
import type { OffersChannel } from "./home-offers";
// Photos from the Coopercica reference catalog. All prices below are illustrative.
const samples = {
  "delivery": [
    {
      "description": "PALETA SUÍNA GRANEL",
      "regular_price": 18.9,
      "offer_all_price": 15.9,
      "image_url": "https://sicomprasafe.yourintegration.top/api/merchant/50974732000150/imagem/L3VwbG9hZHMvY2F0YWxvZ29zL3Byb2R1dG9zL2ltYWdlbnMvYWRpY2lvbmFsLzE2NjE4NjgwMTYyMzMucG5n",
      "coopermais_price": 14.9
    },
    {
      "description": "PERNIL SUÍNO C/ OSSO GRANEL",
      "regular_price": 21.9,
      "offer_all_price": 18.9,
      "image_url": "https://sicomprasafe.yourintegration.top/api/merchant/50974732000150/imagem/L3VwbG9hZHMvY2F0YWxvZ29zL3Byb2R1dG9zL2ltYWdlbnMvYWRpY2lvbmFsLzE2NjE4Njc3MjYyMjgucG5n",
      "coopermais_price": null
    },
    {
      "description": "MEIO DA ASA",
      "regular_price": 22.9,
      "offer_all_price": 19.9,
      "image_url": "https://sicomprasafe.yourintegration.top/api/merchant/50974732000150/imagem/L3VwbG9hZHMvY2F0YWxvZ29zL3Byb2R1dG9zL2ltYWdlbnMvYWRpY2lvbmFsLzE2NjE4MDAzMDc3ODYucG5n",
      "coopermais_price": 17.9
    },
    {
      "description": "LOMBO SUÍNO GRANEL",
      "regular_price": 27.9,
      "offer_all_price": 23.9,
      "image_url": "https://sicomprasafe.yourintegration.top/api/merchant/50974732000150/imagem/L3VwbG9hZHMvY2F0YWxvZ29zL3Byb2R1dG9zL2ltYWdlbnMvYWRpY2lvbmFsLzE2NjE4NjcxMDg4MTEucG5n",
      "coopermais_price": null
    },
    {
      "description": "PATINHO MOIDO",
      "regular_price": 34.9,
      "offer_all_price": 29.9,
      "image_url": "https://sicomprasafe.yourintegration.top/api/merchant/50974732000150/imagem/L3VwbG9hZHMvY2F0YWxvZ29zL3Byb2R1dG9zL2ltYWdlbnMvYWRpY2lvbmFsLzE2NjE3OTgwMzQ2ODkucG5n",
      "coopermais_price": null
    }
  ],
  "pharmacy": [
    {
      "description": "DIPIRONA SÓDICA 1G GENÉRICO NEO QUÍMICA",
      "regular_price": 8.9,
      "offer_all_price": 6.9,
      "image_url": "https://sicomprasafe.yourintegration.top/api/merchant/50974732000312/imagem/L3VwbG9hZHMvY2F0YWxvZ29zL3Byb2R1dG9zL2ltYWdlbnMvanBnLzc4OTY3MTQyMDc1NzUuanBlZw==",
      "coopermais_price": 5.9
    },
    {
      "description": "DORFLEX C/10 COMP.",
      "regular_price": 12.9,
      "offer_all_price": 9.9,
      "image_url": "https://sicomprasafe.yourintegration.top/api/merchant/50974732000312/imagem/L3VwbG9hZHMvY2F0YWxvZ29zL3Byb2R1dG9zL2ltYWdlbnMvanBnLzc4OTEwNTgwMTczOTIuanBn",
      "coopermais_price": null
    },
    {
      "description": "DIPIRONA 1G GENÉRICO 10 COMPRIMIDOS",
      "regular_price": 11.9,
      "offer_all_price": 8.9,
      "image_url": "https://sicomprasafe.yourintegration.top/api/merchant/50974732000312/imagem/L3VwbG9hZHMvY2F0YWxvZ29zL3Byb2R1dG9zL2ltYWdlbnMvanBnLzc4OTY3MTQyMDc1NTEucG5n",
      "coopermais_price": null
    },
    {
      "description": "CORISTINA D PRO C/4 COMP.",
      "regular_price": 16.9,
      "offer_all_price": 12.9,
      "image_url": "https://sicomprasafe.yourintegration.top/api/merchant/50974732000312/imagem/L3VwbG9hZHMvY2F0YWxvZ29zL3Byb2R1dG9zL2ltYWdlbnMvYWRpY2lvbmFsLzE3MTIzNDQwNTExMTQucG5n",
      "coopermais_price": 11.9
    },
    {
      "description": "LACTO-PURGA 6 COMPRIMIDOS",
      "regular_price": 9.9,
      "offer_all_price": 7.9,
      "image_url": "https://sicomprasafe.yourintegration.top/api/merchant/50974732000312/imagem/L3VwbG9hZHMvY2F0YWxvZ29zL3Byb2R1dG9zL2ltYWdlbnMvanBnLzc4OTYwOTQ5MDMyMzQuanBn",
      "coopermais_price": null
    }
  ]
} as const;
export function previewOffers(channel: OffersChannel): LeafletProduct[] {
  return samples[channel].map((sample, index) => ({
    ...sample, id: `preview-${channel}-${index}`, sort_order: index,
    ean: null, complement: "Produto de demonstração",
    unit: channel === "delivery" ? "kg" : "un", delivery_url: null,
    age_18: false, breastfeeding_warning: false, super_offer: false,
    buy_3_pay_2: false, promo_pack: null, family_code: null, section: null, special_section: null,
  }));
}
