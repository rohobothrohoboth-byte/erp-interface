import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { BookOpen } from 'lucide-react';

interface TrainingCourse {
  id: number;
  title: string;
  category: string;
  duration: string;
}

const courseData: TrainingCourse[] = [
  { id: 1, title: 'Leadership Development', category: 'Management', duration: '8 weeks' },
  { id: 2, title: 'Cybersecurity Awareness', category: 'IT', duration: '2 hours' },
  { id: 3, title: 'Diversity & Inclusion', category: 'HR', duration: '4 hours' },
  { id: 4, title: 'Advanced Excel', category: 'Finance', duration: '3 days' },
];

const TrainingList = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-emerald-500" />
          <span>Training List</span>
        </CardTitle>
        <CardDescription>
          Comprehensive list of all training programs and courses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {courseData.map(course => (
            <div key={course.id} className="border rounded-lg p-4 flex justify-between items-center">
              <div>
                <h3 className="font-medium">{course.title}</h3>
                <p className="text-sm text-gray-500">{course.category} • {course.duration}</p>
              </div>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrainingList;