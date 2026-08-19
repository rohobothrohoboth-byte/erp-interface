import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type StageData = {
  name: string;
  candidates: number;
};

const CandidateStageChart = ({ data }: { data: StageData[] }) => (
  <Card>
    <CardHeader>
      <CardTitle>Candidates by Stage</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="candidates" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
);

export default CandidateStageChart;