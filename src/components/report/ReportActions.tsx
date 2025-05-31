"use client";

import { Button } from "@/components/ui/button";
import { Download, Mail, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportActionsProps {
  reportText: string;
}

export function ReportActions({ reportText }: ReportActionsProps) {
  const { toast } = useToast();

  const handleDownloadPdf = () => {
    // Basic text file download as PDF generation is complex
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "incident_report.txt"; // Pretend it's a PDF for now
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: "Report Downloaded",
      description: "The report has been downloaded as a text file.",
    });
  };

  const handleSendEmail = () => {
    // Placeholder for email functionality
    const subject = encodeURIComponent("Incident Report from Reportify AI");
    const body = encodeURIComponent(`Please find the incident report below:\n\n${reportText}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    toast({
      title: "Email Client Opened",
      description: "Your default email client has been opened with the report.",
    });
  };

  return (
    <div className="mt-6 flex flex-col sm:flex-row gap-3">
      <Button onClick={handleDownloadPdf} variant="outline">
        <Download className="mr-2 h-4 w-4" />
        Download Report
      </Button>
      <Button onClick={handleSendEmail} variant="outline">
        <Mail className="mr-2 h-4 w-4" />
        Email Report
      </Button>
    </div>
  );
}
