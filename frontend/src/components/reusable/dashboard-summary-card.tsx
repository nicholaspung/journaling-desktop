import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export default function DashboardSummaryCard({
  icon,
  stat,
  description,
  title,
}: {
  icon: React.ReactNode;
  stat: string | number | undefined;
  description: string;
  title: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 space-x-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stat}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
