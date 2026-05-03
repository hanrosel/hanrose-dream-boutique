export const WA_NUMBER = "6287887297885";
export const WA_MESSAGE = "Halo Hanrose Atelier";
export const WA_LINK = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_MESSAGE)}`;

export const waLink = (productName?: string) => {
  const msg = productName
    ? `Halo Hanrose Atelier, saya tertarik dengan ${productName}`
    : WA_MESSAGE;
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
};
