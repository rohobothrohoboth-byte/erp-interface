// src/components/hr/Leave/EncashmentCalendar.tsx
export const EncashmentCalendar: React.FC = () => {
    // Show when encashment requests are allowed
    const encashmentWindow = {
        start: 'November 1',
        end: 'December 31'
    };

    return (
        <Card className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold">📅 Encashment Request Window</h3>
                        <p className="text-sm text-gray-600">
                            Requests accepted from {encashmentWindow.start} to {encashmentWindow.end}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            💡 Tip: Early submission helps with financial planning
                        </p>
                    </div>
                    <div className="text-right">
                        <Badge variant="outline" className="bg-green-100">
                            Planning Period
                        </Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};