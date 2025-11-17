"use client";

import { useState, FormEvent } from "react";
import {
  getCategories,
  addCategory,
  deleteCategory,
  EditCategory,
} from "@/actions/category.actions";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Category {
  _id: string;
  name: string;
  createdAt?: string;
}

interface Props {
  initialCategories: Category[];
}

export default function CategoriesClient({ initialCategories }: Props) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>("");

  // ✅ Yangi kategoriya qo‘shish
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await addCategory(formData);
    setCategories(await getCategories());
    e.currentTarget.reset();
  };

  // ✅ Kategoriyani o‘chirish
  const handleDelete = async (id: string) => {
    await deleteCategory(id);
    setCategories(await getCategories());
  };

  // ✅ Tahrirlashni boshlash
  const startEdit = (cat: Category) => {
    setEditingId(cat._id);
    setEditName(cat.name);
  };

  // ✅ Tahrirlashni saqlash
  const handleEditSave = async (id: string) => {
    const formData = new FormData();
    formData.append("name", editName);

    await EditCategory(id, formData);
    setCategories(await getCategories());
    setEditingId(null);
    setEditName("");
  };

  // ✅ Tahrirlashni bekor qilish
  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  return (
    <div className="p-6 space-y-6 w-full">
      {/* === Kategoriya qo‘shish formi === */}
      <Card>
        <CardHeader>
          <CardTitle>📦 Add Category</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4"
          >
            <Input name="name" placeholder="Category name" required />
            <Button type="submit">Add Category</Button>
          </form>
        </CardContent>
      </Card>

      {/* === Kategoriya ro‘yxati === */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {categories.map((cat) => (
          <Card key={cat._id} className="sm:w-[300px]">
            <CardHeader>
              {editingId === cat._id ? (
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full"
                />
              ) : (
                <CardTitle>{cat.name}</CardTitle>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mt-3">
                {editingId === cat._id ? (
                  <>
                    <Button
                      className="mr-2"
                      onClick={() => handleEditSave(cat._id)}
                    >
                      Save
                    </Button>
                    <Button variant="outline" onClick={cancelEdit}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button className="mr-2" onClick={() => startEdit(cat)}>
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(cat._id)}
                    >
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {categories.length === 0 && (
          <div className="text-center col-span-full py-10 text-muted-foreground">
            No categories yet. Add one above 👆
          </div>
        )}
      </div>
    </div>
  );
}
