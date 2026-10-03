export type Product={id:string;name:string;slug:string;category:string;price:number;image:string;description:string};
export const naira=(amount:number)=>new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',maximumFractionDigits:0}).format(amount);
