import { Card, CardContent } from "@/shared/components/ui/card";

type Metric = {
  id: number;
  title: string;
  value: string | number;
  change: string;
  icon: React.ReactNode;
};

const CandidateMetrics = ({ metrics }: { metrics: Metric[] }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
    {metrics.map((metric) => (
      <Card key={metric.id} className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">{metric.title}</h3>
              <p className="text-2xl font-bold mt-1">{metric.value}</p>
              <p className="text-sm text-green-600 mt-2 font-medium">
                {metric.change} from last month
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
              {metric.icon}
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export default CandidateMetrics;