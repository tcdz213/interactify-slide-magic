
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Mail, Settings, Check } from 'lucide-react';

export const AutomatedInvoicing: React.FC = () => {
  const { toast } = useToast();
  const [autoSend, setAutoSend] = useState(true);
  const [invoiceFormat, setInvoiceFormat] = useState('pdf');
  const [includeLogoOnInvoice, setIncludeLogoOnInvoice] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  
  // Mock invoice template data
  const [template, setTemplate] = useState({
    companyName: 'Training Platform Ltd.',
    address: '123 Education Street, Knowledge City',
    email: 'billing@trainingplatform.com',
    phone: '+1 (555) 123-4567',
    footer: 'Thank you for your business!',
    terms: 'Payment due within 30 days of invoice date.'
  });

  const handleSaveSettings = () => {
    setSaving(true);
    
    // Simulate saving settings
    setTimeout(() => {
      setSaving(false);
      toast({
        title: "Settings Saved",
        description: "Your invoice automation settings have been updated.",
      });
    }, 1500);
  };

  const handleGenerateTestInvoice = () => {
    toast({
      title: "Test Invoice Generated",
      description: "A test invoice has been generated and is ready for review.",
    });
  };

  const handleSendTestInvoice = () => {
    toast({
      title: "Test Invoice Sent",
      description: "A test invoice has been sent to your email address.",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl">Automated Invoicing</CardTitle>
          <CardDescription>Configure automatic invoice generation after successful payments</CardDescription>
        </div>
        <Button variant="outline" onClick={handleSaveSettings} disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Automatic Invoice Generation</Label>
                <p className="text-sm text-muted-foreground">
                  Generate invoices automatically after successful payments
                </p>
              </div>
              <Switch 
                checked={autoSend} 
                onCheckedChange={setAutoSend}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Invoice Format</h3>
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant={invoiceFormat === 'pdf' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setInvoiceFormat('pdf')}
                  className="justify-start"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button 
                  variant={invoiceFormat === 'web' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setInvoiceFormat('web')}
                  className="justify-start"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Web View
                </Button>
                <Button 
                  variant={invoiceFormat === 'both' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setInvoiceFormat('both')}
                  className="justify-start"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Both
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Email Settings</h3>
              <div className="space-y-2">
                <Label htmlFor="sender">Sender Name</Label>
                <Input 
                  id="sender" 
                  placeholder="Training Platform" 
                  defaultValue="Training Platform Billing" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="replyTo">Reply-To Email</Label>
                <Input 
                  id="replyTo" 
                  type="email" 
                  placeholder="billing@example.com"
                  defaultValue="billing@trainingplatform.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject Template</Label>
                <Input 
                  id="subject" 
                  placeholder="Your invoice {invoice_number} for {center_name}"
                  defaultValue="Your invoice {invoice_number} for {center_name}"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailBody">Email Body Template</Label>
                <Textarea 
                  id="emailBody" 
                  placeholder="Thank you for your payment. Please find your invoice attached."
                  defaultValue="Dear {owner_name},\n\nThank you for your payment. Please find your invoice #{invoice_number} attached for your {plan_name} subscription for {center_name}.\n\nIf you have any questions, please contact our support team.\n\nBest regards,\nTraining Platform Team"
                  rows={4}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Send Copy to Platform Admin</Label>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-base">Include Logo on Invoice</Label>
                <Switch 
                  checked={includeLogoOnInvoice} 
                  onCheckedChange={setIncludeLogoOnInvoice}
                />
              </div>
            </div>

            <div className="pt-4 flex gap-2">
              <Button variant="outline" onClick={handleGenerateTestInvoice} className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Generate Test Invoice
              </Button>
              <Button variant="outline" onClick={handleSendTestInvoice} className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                Send Test Email
              </Button>
            </div>
          </div>

          <div className="border rounded-md p-4 bg-muted/50">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-medium">Invoice Template Preview</h3>
              <div className="flex items-center space-x-2">
                <Button 
                  variant={previewMode === 'desktop' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setPreviewMode('desktop')}
                >
                  Desktop
                </Button>
                <Button 
                  variant={previewMode === 'mobile' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setPreviewMode('mobile')}
                >
                  Mobile
                </Button>
              </div>
            </div>
            
            <div className={`bg-white rounded-md border p-4 ${previewMode === 'mobile' ? 'max-w-[320px] mx-auto' : 'w-full'}`}>
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold">{template.companyName}</h2>
                  <p className="text-sm text-muted-foreground">{template.address}</p>
                  <p className="text-sm text-muted-foreground">{template.email}</p>
                  <p className="text-sm text-muted-foreground">{template.phone}</p>
                </div>
                {includeLogoOnInvoice && (
                  <div className="h-12 w-12 bg-primary/10 rounded flex items-center justify-center text-primary font-bold">
                    Logo
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <h3 className="text-lg font-semibold">INVOICE</h3>
                <div className="flex justify-between text-sm mt-1">
                  <div>
                    <p>Invoice Number: <span className="font-medium">INV-2023-001</span></p>
                    <p>Date: <span className="font-medium">{new Date().toLocaleDateString()}</span></p>
                  </div>
                  <div>
                    <p>Due Date: <span className="font-medium">{new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}</span></p>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2">Bill To:</h4>
                <p className="text-sm">John Smith</p>
                <p className="text-sm">Tech Training Hub</p>
                <p className="text-sm">john@example.com</p>
              </div>
              
              <div className="mb-4 border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-2">Description</th>
                      <th className="text-right p-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="p-2">Premium Subscription (Monthly)</td>
                      <td className="text-right p-2">$50.00</td>
                    </tr>
                    <tr className="border-t bg-muted">
                      <td className="p-2 font-medium">Total</td>
                      <td className="text-right p-2 font-medium">$50.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="text-sm mt-6">
                <p className="font-medium">Terms:</p>
                <p className="text-muted-foreground">{template.terms}</p>
              </div>
              
              <div className="mt-4 pt-4 border-t text-center text-sm text-muted-foreground">
                {template.footer}
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Customize Template</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="companyName" className="text-xs">Company Name</Label>
                    <Input 
                      id="companyName" 
                      value={template.companyName}
                      onChange={(e) => setTemplate({...template, companyName: e.target.value})}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="footer" className="text-xs">Footer Text</Label>
                    <Input 
                      id="footer" 
                      value={template.footer}
                      onChange={(e) => setTemplate({...template, footer: e.target.value})}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="terms" className="text-xs">Terms & Conditions</Label>
                  <Input 
                    id="terms" 
                    value={template.terms}
                    onChange={(e) => setTemplate({...template, terms: e.target.value})}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AutomatedInvoicing;
