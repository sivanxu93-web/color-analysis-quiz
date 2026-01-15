const priceProd = [
  {
    currency: "usd",
    type: "recurring",
    unit_amount: 11880,
    id: "price_"
  },
  {
    currency: "usd",
    type: "recurring",
    unit_amount: 1990,
    id: "price_"
  }
];

const priceTest = [
  {
    currency: "usd",
    type: "recurring",
    unit_amount: 11880,
    id: "price_"
  },
  {
    currency: "usd",
    type: "recurring",
    unit_amount: 1990,
    id: "price_"
  }
];

export const priceList = (process.env.NODE_ENV === 'production' ? priceProd: priceTest);

export const colorLabPrice = {
    currency: "usd",
    type: "one_time",
    unit_amount: 1990,
    id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_COLOR_LAB || "price_1Ot..." 
};
