import { getProducts } from "@/actions/products.actions";
import { getCategories } from "@/actions/category.actions";
import ProductsClient from "./ProductsClient";

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <ProductsClient initialProducts={products} initialCategories={categories} />
  );
}
