import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MealItem } from "@/app/api/gen-day/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MealCardProps = {
  mealName: string;
  items: MealItem[];
};

export function MealCard({ mealName, items }: MealCardProps) {
  const totalCalories = items.reduce((sum, item) => sum + item.calories, 0);

  return (
    <Card className="mb-6 shadow-lg">
      <CardHeader className="bg-primary/10 py-3">
        <CardTitle className="text-2xl font-bold capitalize">{mealName}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Total Calories: {totalCalories ?? "N/A"}
        </p>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Desktop view */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Food</TableHead>
                  <TableHead>Portion</TableHead>
                  <TableHead>Calories</TableHead>
                  <TableHead>Protein (g)</TableHead>
                  <TableHead>Carbs (g)</TableHead>
                  <TableHead>Fats (g)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items && items.length > 0 ? (
                  items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.food}</TableCell>
                      <TableCell>{item.portion}</TableCell>
                      <TableCell>{item.calories}</TableCell>
                      <TableCell>{item.protein}</TableCell>
                      <TableCell>{item.carbs}</TableCell>
                      <TableCell>{item.fats}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No meal items available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile view */}
          <div className="md:hidden space-y-4">
            {items && items.length > 0 ? (
              items.map((item, index) => (
                <div key={index}>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">{item.food}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {item.portion}
                    </p>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <div>
                        Calories:{" "}
                        <span className="font-medium">{item.calories}</span>
                      </div>
                      <div>
                        Protein:{" "}
                        <span className="font-medium">{item.protein}g</span>
                      </div>
                      <div>
                        Carbs: <span className="font-medium">{item.carbs}g</span>
                      </div>
                      <div>
                        Fats: <span className="font-medium">{item.fats}g</span>
                      </div>
                    </div>
                  </div>
                  {index < items.length - 1 && <Separator />}
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No meal items available
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
