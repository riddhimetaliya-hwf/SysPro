
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { FileText, FileSpreadsheet, FileDown, Image, Mail } from 'lucide-react';
import { toast } from 'sonner';

export const ExportOptions = () => {
  const handleExport = (format: string) => {
    toast.success(`Report exported as ${format} successfully`);
  };
  
  const handleEmailReport = () => {
    toast.success("Report has been emailed successfully");
  };
  
  return (
    <Card className="shadow-sm border-muted">
      <CardHeader className="bg-muted/30 pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileDown className="h-5 w-5 text-primary" />
          Export Options
        </CardTitle>
        <CardDescription>Download or email your reports in various formats</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <Button 
            variant="outline" 
            className="flex flex-col items-center h-auto py-3 hover:bg-primary/5 transition-all border-muted"
            onClick={() => handleExport('PDF')}
          >
            <FileText className="h-5 w-5 mb-1 text-primary" />
            PDF
          </Button>
          <Button 
            variant="outline" 
            className="flex flex-col items-center h-auto py-3 hover:bg-primary/5 transition-all border-muted"
            onClick={() => handleExport('Excel')}
          >
            <FileSpreadsheet className="h-5 w-5 mb-1 text-primary" />
            Excel
          </Button>
          <Button 
            variant="outline" 
            className="flex flex-col items-center h-auto py-3 hover:bg-primary/5 transition-all border-muted"
            onClick={() => handleExport('CSV')}
          >
            <FileDown className="h-5 w-5 mb-1 text-primary" />
            CSV
          </Button>
          <Button 
            variant="outline" 
            className="flex flex-col items-center h-auto py-3 hover:bg-primary/5 transition-all border-muted"
            onClick={() => handleExport('PNG')}
          >
            <Image className="h-5 w-5 mb-1 text-primary" />
            PNG
          </Button>
        </div>
        
        <Button 
          variant="default" 
          className="w-full gap-2"
          onClick={handleEmailReport}
        >
          <Mail className="h-4 w-4" />
          Email Report
        </Button>
      </CardContent>
    </Card>
  );
};
