import { getCategories } from "@/actions/category.actions";
import CategoriesClient from "./CategoriesClient";

export default async function CategoriesPage() {
  // ✅ Barcha kategoriyalarni serverda oldindan olish
  const categories = await getCategories();

  return <CategoriesClient initialCategories={categories} />;
}
