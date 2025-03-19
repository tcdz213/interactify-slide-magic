
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Download, FileText, FileSpreadsheet, Calendar } from 'lucide-react';

export const ExportPaymentData: React.FC = () => {
  const { toast } = useToast();
  const [exportFormat, setExportFormat] = useState('csv');
  const [dateRange, setDateRange] = useState('thisMonth');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    
    // Simulate export generation
    setTimeout(() => {
      setIsExporting(false);
      toast({
        title: "Export Complete",
        description: `Your payment data has been exported as ${exportFormat.toUpperCase()}.`,
      });
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Export Payment Data</CardTitle>
        <CardDescription>Download payment reports for your records</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium mb-3">File Format</h3>
            <RadioGroup 
              defaultValue="csv" 
              value={exportFormat} 
              onValueChange={setExportFormat}
              className="flex flex-col space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="flex items-center cursor-pointer">
                  <FileText className="h-4 w-4 mr-2" />
                  CSV
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excel" id="excel" />
                <Label htmlFor="excel" className="flex items-center cursor-pointer">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Excel
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf" className="flex items-center cursor-pointer">
                  <FileText className="h-4 w-4 mr-2" />
                  PDF
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-3">Time Period</h3>
            <Select 
              defaultValue="thisMonth" 
              value={dateRange} 
              onValueChange={setDateRange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="lastMonth">Last Month</SelectItem>
                <SelectItem value="thisQuarter">This Quarter</SelectItem>
                <SelectItem value="lastQuarter">Last Quarter</SelectItem>
                <SelectItem value="thisYear">This Year</SelectItem>
                <SelectItem value="lastYear">Last Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
            
            {dateRange === 'custom' && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <div className="flex mt-1">
                    <Calendar className="h-4 w-4 mr-2 mt-3" />
                    <input
                      type="date"
                      id="startDate"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <div className="flex mt-1">
                    <Calendar className="h-4 w-4 mr-2 mt-3" />
                    <input
                      type="date"
                      id="endDate"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button 
            onClick={handleExport} 
            disabled={isExporting}
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Generating Export..." : "Export Payment Data"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
