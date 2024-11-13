import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

type ShoppingItem = {
  name: string;
  quantity: string;
};

type ShoppingCategory = {
  name: string;
  items: ShoppingItem[];
};

type ShoppingListCardProps = {
  categories: ShoppingCategory[];
};

export function ShoppingListCard({ categories }: ShoppingListCardProps) {
  return (
    <Card className="mb-6 shadow-lg">
      <CardHeader className="bg-primary/10 py-3">
        <CardTitle className="text-2xl font-bold">Shopping List</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {categories.map((category, index) => (
          <div key={index} className="mb-6">
            <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
            <ul className="list-disc pl-5 space-y-1">
              {category.items?.map((item, itemIndex) => (
                <li key={itemIndex} className="text-lg">
                  <span className="font-medium">{item.name}</span> -{" "}
                  {item.quantity}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
