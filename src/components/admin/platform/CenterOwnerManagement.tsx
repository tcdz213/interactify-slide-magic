
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash, Check, Ban } from 'lucide-react';

export const CenterOwnerManagement: React.FC = () => {
  // This would typically come from an API
  const owners = [
    { id: 1, name: 'John Smith', email: 'john@example.com', centers: 3, status: 'active' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', centers: 2, status: 'pending' },
    { id: 3, name: 'Michael Brown', email: 'michael@example.com', centers: 1, status: 'active' },
    { id: 4, name: 'Emily Davis', email: 'emily@example.com', centers: 5, status: 'suspended' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Center Owners Management</h2>
        <Button className="flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Add New Owner
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Center Owners</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Centers</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {owners.map((owner) => (
                <TableRow key={owner.id}>
                  <TableCell className="font-medium">{owner.name}</TableCell>
                  <TableCell>{owner.email}</TableCell>
                  <TableCell>{owner.centers}</TableCell>
                  <TableCell>
                    <Badge variant={
                      owner.status === 'active' ? 'default' : 
                      owner.status === 'pending' ? 'outline' : 
                      'destructive'
                    }>
                      {owner.status.charAt(0).toUpperCase() + owner.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {owner.status === 'pending' && (
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      {owner.status === 'active' && (
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                          <Ban className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                        <Trash className="h-4 w-4" />
                      </Button>
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

export default CenterOwnerManagement;
