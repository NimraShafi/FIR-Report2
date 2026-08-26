"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Download,
  Mail,
  FileText,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportActionsProps {
  reportText: string;
}

export function ReportActions({ reportText }: ReportActionsProps) {
  const { toast } = useToast();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");

  const handleDownload = () => {
    const blob = new Blob([reportText], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "incident-report.txt";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    toast({
      title: "Report Downloaded",
      description: "Your incident report has been downloaded.",
    });
  };

  // -----------------------------
  // EMAIL FORM
  // -----------------------------
  const handleOpenEmail = () => {
    setShowEmailForm(true);
  };

  // -----------------------------
  // SEND EMAIL
  // -----------------------------
  const handleSendEmail = () => {
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter an email address.",
        variant: "destructive",
      });
      return;
    }

    const subject = encodeURIComponent(
      "Incident Report - Reportify AI"
    );

    const body = encodeURIComponent(
      `Please find the incident report below:\n\n${reportText}`
    );

    window.location.href =
      `mailto:${email}?subject=${subject}&body=${body}`;

    toast({
      title: "Email Ready",
      description:
        "Your email application has been opened with the report.",
    });

    setShowEmailForm(false);
  };

  return (
    <div className="mt-6 space-y-4">


      <div className="flex flex-col sm:flex-row gap-3">

        <Button
          onClick={handleDownload}
          variant="outline"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Report
        </Button>

        <Button
          onClick={handleOpenEmail}
          variant="outline"
        >
          <Mail className="mr-2 h-4 w-4" />
          Email Report
        </Button>

      </div>

      {/* EMAIL FORM */}

      {showEmailForm && (
        <div className="border rounded-lg p-4 bg-muted/20 space-y-4">

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">
                Email Incident Report
              </h3>

              <p className="text-sm text-muted-foreground">
                Enter the recipient's email address.
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowEmailForm(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <Input
            type="email"
            placeholder="recipient@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button
            onClick={handleSendEmail}
            className="w-full"
          >
            <Mail className="mr-2 h-4 w-4" />
            Send Email
          </Button>

        </div>
      )}

    </div>
  );
}
