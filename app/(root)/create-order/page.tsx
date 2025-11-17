// app/create-order/page.tsx

import { getCategories } from "@/actions/category.actions";
import { getProducts } from "@/actions/products.actions";
import CreateOrderClient from "@/components/orders/CreateOrderClient";

export default async function CreateOrderPage({ searchParams }: any) {
  const params = await searchParams; // ⬅ MUAMMONI 100% HAL QILADI

  console.log("Search Params:", params);

  const orderType = params?.type || "Zal";

  const categories = await getCategories();
  const products = await getProducts();

  return (
    <CreateOrderClient
      orderType={orderType}
      categories={JSON.parse(JSON.stringify(categories))}
      products={JSON.parse(JSON.stringify(products))}
    />
  );
}
