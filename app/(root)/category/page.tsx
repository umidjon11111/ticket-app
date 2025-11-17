import { getCategories } from "@/actions/category.actions";

const Category = async () => {
  const categories = await getCategories();
  return (
    <div>
      <div className="grid grid-cols-4 gap-4 p-6">
        {categories.map((c: any) => (
          <div
            key={c?._id}
            className="p-4 border rounded-lg hover:bg-accent cursor-pointer text-center"
          >
            {c.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Category;
