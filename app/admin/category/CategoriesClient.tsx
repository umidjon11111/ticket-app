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

  // Editing states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>("");

  // Loaders
  const [addLoading, setAddLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState<string | null>(null);

  // === Add Category ===
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setAddLoading(true);
    const formData = new FormData(e.currentTarget);

    await addCategory(formData);
    setCategories(await getCategories());

    setAddLoading(false);
    e.currentTarget.reset();
  };

  // === Delete ===
  const handleDelete = async (id: string) => {
    setDeleteLoading(id);
    await deleteCategory(id);

    setCategories(await getCategories());
    setDeleteLoading(null);
  };

  // === Start edit ===
  const startEdit = (cat: Category) => {
    setEditingId(cat._id);
    setEditName(cat.name);
  };

  // === Save edit ===
  const handleEditSave = async (id: string) => {
    setEditLoading(id);

    const formData = new FormData();
    formData.append("name", editName);

    await EditCategory(id, formData);
    setCategories(await getCategories());

    setEditingId(null);
    setEditName("");
    setEditLoading(null);
  };

  // === Cancel edit ===
  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  return (
    <div className="p-6 space-y-6 w-full">
      {/* ADD CATEGORY FORM */}
      <Card>
        <CardHeader>
          <CardTitle>📦 Add Category</CardTitle>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <Input name="name" placeholder="Category name" required />

            <Button type="submit" disabled={addLoading}>
              {addLoading ? "Saving..." : "Add Category"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* CATEGORY LIST */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <Card key={cat._id} className="p-2">
            <CardHeader>
              {editingId === cat._id ? (
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              ) : (
                <CardTitle>{cat.name}</CardTitle>
              )}
            </CardHeader>

            <CardContent>
              <div className="flex justify-end mt-3 gap-2">
                {editingId === cat._id ? (
                  <>
                    <Button
                      onClick={() => handleEditSave(cat._id)}
                      disabled={editLoading === cat._id}
                    >
                      {editLoading === cat._id ? "Saving..." : "Save"}
                    </Button>

                    <Button variant="outline" onClick={cancelEdit}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={() => startEdit(cat)}>Edit</Button>

                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(cat._id)}
                      disabled={deleteLoading === cat._id}
                    >
                      {deleteLoading === cat._id ? "Deleting..." : "Delete"}
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
