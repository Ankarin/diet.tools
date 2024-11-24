import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ShoppingListCategory,
  ShoppingListItem,
} from "@/app/api/gen-day/schema";

interface ShoppingListCardProps {
  shoppingList?: ShoppingListCategory;
}

export function ShoppingListCard({ shoppingList }: ShoppingListCardProps) {
  if (
    !shoppingList ||
    !shoppingList.categories ||
    shoppingList.categories.length === 0
  ) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Shopping List</CardTitle>
      </CardHeader>
      <CardContent>
        {shoppingList.categories.map((category, index) => (
          <div key={index} className="mb-4">
            <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {category.items && category.items.length > 0 ? (
                  category.items.map(
                    (item: ShoppingListItem, itemIndex: number) => (
                      <TableRow key={itemIndex}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                      </TableRow>
                    ),
                  )
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center">
                      No items in this category
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
