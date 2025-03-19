import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Filter, 
  Download, 
  Search, 
  CreditCard, 
  DollarSign,
  CalendarRange,
  ArrowUpDown,
  PlusCircle
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { PaymentChart } from './payment/PaymentChart';
import { PaymentDetails } from './payment/PaymentDetails';
import { SubscriptionAlerts } from './payment/SubscriptionAlerts';
import { PaymentGateways } from './payment/PaymentGateways';
import { ExportPaymentData } from './payment/ExportPaymentData';
import { AutomatedInvoicing } from './payment/AutomatedInvoicing';

export const PaymentManagement: React.FC = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const payments = [
    { id: 1, owner: 'John Smith', plan: 'Premium', amount: 50.00, date: '2023-05-15', status: 'completed', centerName: 'Tech Training Hub', paymentMethod: 'Credit Card', lastFour: '4242' },
    { id: 2, owner: 'Sarah Johnson', plan: 'Basic', amount: 30.00, date: '2023-05-14', status: 'completed', centerName: 'Digital Skills Academy', paymentMethod: 'PayPal', lastFour: '1234' },
    { id: 3, owner: 'Michael Brown', plan: 'Premium', amount: 50.00, date: '2023-05-10', status: 'failed', centerName: 'Code Masters Institute', paymentMethod: 'Credit Card', lastFour: '5678' },
    { id: 4, owner: 'Emily Davis', plan: 'Advanced', amount: 80.00, date: '2023-05-08', status: 'completed', centerName: 'Data Science School', paymentMethod: 'Credit Card', lastFour: '9012' },
    { id: 5, owner: 'Robert Wilson', plan: 'Basic', amount: 30.00, date: '2023-05-05', status: 'pending', centerName: 'Language Learning Center', paymentMethod: 'Bank Transfer', lastFour: '3456' },
    { id: 6, owner: 'Jennifer Lee', plan: 'Premium', amount: 50.00, date: '2023-05-03', status: 'completed', centerName: 'Creative Arts Studio', paymentMethod: 'Credit Card', lastFour: '7890' },
    { id: 7, owner: 'David Martinez', plan: 'Advanced', amount: 80.00, date: '2023-05-01', status: 'refunded', centerName: 'Business Training Institute', paymentMethod: 'Credit Card', lastFour: '2345' },
  ];

  const filteredPayments = payments
    .filter(payment => statusFilter === 'all' || payment.status === statusFilter)
    .filter(payment => 
      payment.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.centerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.plan.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your payment data is being exported as CSV.",
    });
  };

  const openPaymentDetails = (payment: any) => {
    setSelectedPayment(payment);
    setIsDetailsOpen(true);
  };

  const handleSendInvoice = () => {
    toast({
      title: "Invoice Generated",
      description: "Invoice has been generated and sent automatically.",
    });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'default';
      case 'pending': return 'warning';
      case 'failed': return 'destructive';
      case 'refunded': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Payment Management</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="flex items-center" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="default" size="sm" className="flex items-center" onClick={handleSendInvoice}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Auto-Generate Invoice
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="payments" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="invoicing">Invoicing</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscription Alerts</TabsTrigger>
          <TabsTrigger value="settings">Payment Gateways</TabsTrigger>
        </TabsList>
        
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by owner, center name or plan..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Owner</TableHead>
                      <TableHead>Training Center</TableHead>
                      <TableHead>Subscription Plan</TableHead>
                      <TableHead>
                        <div className="flex items-center">
                          Amount
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center">
                          Date
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No payments found matching your criteria
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPayments.map((payment) => (
                        <TableRow key={payment.id} className="cursor-pointer" onClick={() => openPaymentDetails(payment)}>
                          <TableCell className="font-medium">{payment.owner}</TableCell>
                          <TableCell>{payment.centerName}</TableCell>
                          <TableCell>{payment.plan}</TableCell>
                          <TableCell>${payment.amount.toFixed(2)}</TableCell>
                          <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                          <TableCell>{payment.paymentMethod}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(payment.status) as any}>
                              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={(e) => {
                              e.stopPropagation();
                              openPaymentDetails(payment);
                            }}>
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          <ExportPaymentData />
        </TabsContent>
        
        <TabsContent value="invoicing">
          <AutomatedInvoicing />
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Payment Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="flex flex-col items-center pt-6">
                    <DollarSign className="h-8 w-8 text-primary mb-2" />
                    <p className="text-lg font-medium">Total Revenue</p>
                    <h3 className="text-3xl font-bold">$12,450</h3>
                    <p className="text-xs text-muted-foreground">Last 30 days</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex flex-col items-center pt-6">
                    <CreditCard className="h-8 w-8 text-primary mb-2" />
                    <p className="text-lg font-medium">Active Subscriptions</p>
                    <h3 className="text-3xl font-bold">87</h3>
                    <p className="text-xs text-muted-foreground">Current billing period</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex flex-col items-center pt-6">
                    <CalendarRange className="h-8 w-8 text-primary mb-2" />
                    <p className="text-lg font-medium">Renewal Rate</p>
                    <h3 className="text-3xl font-bold">92%</h3>
                    <p className="text-xs text-muted-foreground">Previous month</p>
                  </CardContent>
                </Card>
              </div>
              
              <PaymentChart />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="subscriptions">
          <SubscriptionAlerts />
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Payment Gateway Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentGateways />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <PaymentDetails 
        payment={selectedPayment} 
        isOpen={isDetailsOpen} 
        onClose={() => setIsDetailsOpen(false)} 
      />
    </div>
  );
};

export default PaymentManagement;
