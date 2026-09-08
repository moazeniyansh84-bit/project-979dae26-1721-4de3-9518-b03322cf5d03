export function toFa(n: number | string) {
  return String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

export function formatPrice(value: number) {
  return toFa(value.toLocaleString("en-US")) + " تومان";
}

export function finalPrice(price: number, discount: number) {
  return Math.round(price * (1 - (discount || 0) / 100));
}

export const GENDER_LABELS: Record<string, string> = {
  girl: "دخترانه",
  boy: "پسرانه",
  unisex: "همه",
};

export const AGE_LABELS: Record<string, string> = {
  baby: "نوپا",
  kids: "کودک",
  teen: "نوجوان",
};
