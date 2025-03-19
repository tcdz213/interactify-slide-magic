
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check, X, Eye } from 'lucide-react';

export const TrainingCenterApproval: React.FC = () => {
  // This would typically come from an API
  const centers = [
    { id: 1, name: 'Fitness Forever', owner: 'John Smith', type: 'Fitness', status: 'pending' },
    { id: 2, name: 'Yoga Retreat', owner: 'Sarah Johnson', type: 'Yoga', status: 'approved' },
    { id: 3, name: 'Tech Training Hub', owner: 'Michael Brown', type: 'Vocational', status: 'pending' },
    { id: 4, name: 'Language Center', owner: 'Emily Davis', type: 'Language', status: 'rejected' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Training Center Approval</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Training Centers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Center Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {centers.map((center) => (
                <TableRow key={center.id}>
                  <TableCell className="font-medium">{center.name}</TableCell>
                  <TableCell>{center.owner}</TableCell>
                  <TableCell>{center.type}</TableCell>
                  <TableCell>
                    <Badge variant={
                      center.status === 'approved' ? 'default' : 
                      center.status === 'pending' ? 'outline' : 
                      'destructive'
                    }>
                      {center.status.charAt(0).toUpperCase() + center.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {center.status === 'pending' && (
                        <>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainingCenterApproval;
