import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type InfoCardProps = {
  title: string;
  content: string;
};

export function InfoCard({ title, content }: InfoCardProps) {
  return (
    <Card className="mb-6 shadow-lg">
      <CardHeader className="bg-primary/10 py-3">
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-lg leading-relaxed">{content}</p>
      </CardContent>
    </Card>
  );
}
