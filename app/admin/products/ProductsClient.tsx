"use client";

import { useState, FormEvent } from "react";
import {
  deleteProduct,
  toggleAvailability,
  addProduct,
  getProducts,
} from "@/actions/products.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Category {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  image?: string;
  available: boolean;
  category?: Category;
}

interface Props {
  initialProducts: Product[];
  initialCategories: Category[];
}

export default function ProductsClient({
  initialProducts,
  initialCategories,
}: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories] = useState<Category[]>(initialCategories);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDelete = async (id: string) => {
    await deleteProduct(id);
    setProducts(await getProducts());
  };

  const handleToggle = async (id: string) => {
    await toggleAvailability(id);
    setProducts(await getProducts());
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!selectedCategory) return alert("Please select a category.");

    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("image", imageUrl); // URL yuboriladi
    formData.append("category", selectedCategory);

    await addProduct(formData);
    setProducts(await getProducts());

    // reset
    setName("");
    setPrice("");
    setImageUrl("");
    setSelectedCategory("");
    setLoading(false);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 w-full max-w-7xl mx-auto">
      {/* === FORM === */}
      <Card className="shadow-lg border border-border/40 bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
            🛒 Add New Product
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <Input
              placeholder="Product name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              placeholder="Price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />

            {/* IMAGE URL INPUT */}
            <Input
              placeholder="Image URL (https://...)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />

            {/* CATEGORY */}
            <Select
              value={selectedCategory}
              onValueChange={(value) => setSelectedCategory(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* SUBMIT BUTTON WITH LOADER */}
            <Button
              type="submit"
              disabled={loading}
              className="col-span-1 sm:col-span-2 lg:col-span-1 mt-2 sm:mt-0"
            >
              {loading ? "Adding..." : "Add Product"}
            </Button>
          </form>

          {/* LIVE PREVIEW */}
          {imageUrl && (
            <div className="mt-4 flex justify-center">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-40 h-40 object-cover rounded-lg shadow-md"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* PRODUCTS LIST */}
      <div
        className="
          grid gap-6
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-3
          xl:grid-cols-4
          justify-items-center
        "
      >
        {products.map((p) => (
          <Card
            key={p._id}
            className="
              w-full max-w-xs sm:max-w-sm
              rounded-2xl
              overflow-hidden p-0
              border border-border/40
              bg-white dark:bg-zinc-900
              shadow-md hover:shadow-xl
              transition-all duration-300
            "
          >
            {p.image ? (
              <img
                src={p.image}
                alt={p.name}
                className="w-full h-48 object-cover rounded-t-2xl"
              />
            ) : (
              <div className="w-full h-48 bg-muted flex items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}
            <CardHeader className="pb-1 pt-3 text-center">
              <CardTitle className="text-lg font-semibold truncate">
                {p.name}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 text-center pb-5">
              <p className="text-base font-medium text-foreground">
                💰 {p.price.toLocaleString()} so‘m
              </p>

              <p
                className={`font-medium ${
                  p.available ? "text-green-600" : "text-red-500"
                }`}
              >
                {p.available ? "✅ Clientga Mavjud" : "❌ Mavjud emas"}
              </p>

              {p.category && (
                <p className="text-sm text-muted-foreground">
                  {p.category.name}
                </p>
              )}

              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(p._id)}
                  className="min-w-[80px]"
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {products.length === 0 && (
          <div className="text-center col-span-full py-10 text-muted-foreground">
            No products yet. Add one above 👆
          </div>
        )}
      </div>
    </div>
  );
}
