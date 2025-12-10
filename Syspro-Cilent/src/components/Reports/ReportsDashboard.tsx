
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';

// Mock data for charts
const taskStatusData = [
  { name: 'Completed', value: 85, color: '#10B981' },
  { name: 'In Progress', value: 40, color: '#3B82F6' },
  { name: 'Delayed', value: 25, color: '#F59E0B' },
  { name: 'Blocked', value: 10, color: '#EF4444' },
];

const resourceAllocationData = [
  { name: 'John', tasks: 15, color: '#3B82F6' },
  { name: 'Sarah', tasks: 22, color: '#10B981' },
  { name: 'Mike', tasks: 18, color: '#F59E0B' },
  { name: 'Lisa', tasks: 12, color: '#8B5CF6' },
  { name: 'David', tasks: 8, color: '#EC4899' },
];

const completionTimeData = [
  { month: 'Jan', completed: 30, expected: 35 },
  { month: 'Feb', completed: 45, expected: 40 },
  { month: 'Mar', completed: 55, expected: 60 },
  { month: 'Apr', completed: 40, expected: 45 },
  { month: 'May', completed: 65, expected: 55 },
  { month: 'Jun', completed: 70, expected: 65 },
];

// Chart configuration that matches the ChartConfig type
const chartConfig = {
  taskStatus: { color: '#10B981' },
  inProgress: { color: '#3B82F6' },
  delayed: { color: '#F59E0B' },
  blocked: { color: '#EF4444' },
  completed: { color: '#10B981' },
  expected: { color: '#6B7280' },
};

export const ReportsDashboard = () => {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Task Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Task Status Distribution</CardTitle>
          <CardDescription>Overview of tasks by their current status</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Resource Allocation */}
      <Card>
        <CardHeader>
          <CardTitle>Resource Allocation</CardTitle>
          <CardDescription>Task distribution across team members</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resourceAllocationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="tasks" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Task Completion Over Time */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Task Completion Over Time</CardTitle>
          <CardDescription>Comparison of completed vs expected task completion</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={completionTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={2} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="expected" stroke="#6B7280" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};
