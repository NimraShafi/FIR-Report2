"use client";

import { useState, type FormEvent } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LanguageSelector } from "@/components/chat/LanguageSelector";
import { ReportActions } from "@/components/report/ReportActions";
import { generateFir } from "@/ai/flows/generate-fir";
import { analyzeIncident } from "@/ai/flows/analyze-incident";
import { useToast } from "@/hooks/use-toast";
import {
  Send,
  Loader2,
  MessageSquare,
  FileText,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "system";
}

export default function HomePage() {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");

  const [generatedFir, setGeneratedFir] = useState<string | null>(null);
  const [incidentSummary, setIncidentSummary] = useState<string | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const [isReportReady, setIsReportReady] = useState(false);

  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const { toast } = useToast();


  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();

    if (!currentMessage.trim() || isAnalyzing || isGeneratingReport) {
      return;
    }

    const userMessage = currentMessage.trim();

    const newUserMessage: ChatMessage = {
      id: uuidv4(),
      text: userMessage,
      sender: "user",
    };

    const updatedMessages = [...chatMessages, newUserMessage];

    setChatMessages(updatedMessages);
    setCurrentMessage("");

    setIsReportReady(false);
    setIncidentSummary(null);

    setIsAnalyzing(true);

    try {
      const chatHistory = updatedMessages
        .map(
          (message) =>
            `${message.sender === "user" ? "User" : "AI"}: ${message.text}`
        )
        .join("\n");

      const result = await analyzeIncident({
        chatHistory,
        language: selectedLanguage,
      });

      if (result.assistantMessage) {
        setChatMessages((prev) => [
          ...prev,
          {
            id: uuidv4(),
            text: result.assistantMessage,
            sender: "system",
          },
        ]);
      }

      setIsReportReady(result.readyForReport);

      if (result.readyForReport) {
        setIncidentSummary(result.incidentSummary || null);

        toast({
          title: "Information Complete",
          description:
            "The AI has enough information to prepare your report.",
        });
      }
    } catch (error) {
      console.error("AI analysis error:", error);

      toast({
        title: "Error",
        description:
          "Unable to process your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };


  const handleGenerateReport = async () => {
    if (!isReportReady || isGeneratingReport || isAnalyzing) {
      return;
    }

    setIsGeneratingReport(true);
    setGeneratedFir(null);

    try {
      const chatHistory = chatMessages
        .map(
          (message) =>
            `${message.sender === "user" ? "User" : "AI"}: ${message.text}`
        )
        .join("\n");

      toast({
        title: "Generating Report",
        description:
          "AI is creating your formal incident report...",
      });

      const result = await generateFir({
        chatHistory,
        language: selectedLanguage,
      });

      setGeneratedFir(result.firReport);

      toast({
        title: "Report Generated",
        description:
          "Your formal report is ready for review.",
      });
    } catch (error) {
      console.error("Report generation error:", error);

      toast({
        title: "Error",
        description:
          "Failed to generate the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };


  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);

    setIsReportReady(false);
    setIncidentSummary(null);
    setGeneratedFir(null);
  };

  const isBusy = isAnalyzing || isGeneratingReport;


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">

          <Card className="shadow-lg rounded-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">
                Describe Your Incident
              </CardTitle>

              <CardDescription>
                Chat with our AI assistant to create your report.
                Provide details in your selected language.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">


              <LanguageSelector
                value={selectedLanguage}
                onChange={handleLanguageChange}
                disabled={isBusy}
              />

              <ScrollArea className="h-[350px] border rounded-md p-4 bg-muted/20">

                {chatMessages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center">
                    <MessageSquare className="w-12 h-12 mb-2" />

                    <p>
                      Describe what happened to start the conversation.
                    </p>

                    <p className="text-xs mt-1">
                      The AI will ask follow-up questions when needed.
                    </p>
                  </div>
                )}

                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`mb-3 p-3 rounded-lg max-w-[80%] ${
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground ml-auto"
                        : "bg-muted text-muted-foreground mr-auto"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {msg.text}
                    </p>
                  </div>
                ))}

                {isAnalyzing && (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mt-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>AI is thinking...</span>
                  </div>
                )}

              </ScrollArea>

              <form
                onSubmit={handleSendMessage}
                className="flex gap-2 items-center"
              >
                <Input
                  value={currentMessage}
                  onChange={(e) =>
                    setCurrentMessage(e.target.value)
                  }
                  placeholder="Type your message..."
                  disabled={isBusy}
                  aria-label="Chat message input"
                />

                <Button
                  type="submit"
                  disabled={
                    isBusy || !currentMessage.trim()
                  }
                  size="icon"
                  aria-label="Send message"
                >
                  {isAnalyzing ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </form>

              {incidentSummary && isReportReady && (
                <div className="border rounded-lg p-4 bg-muted/20">
                  <h3 className="font-semibold mb-2">
                    Incident Summary
                  </h3>

                  <p className="text-sm whitespace-pre-wrap">
                    {incidentSummary}
                  </p>
                </div>
              )}


              {isReportReady && (
                <Button
                  onClick={handleGenerateReport}
                  disabled={isBusy}
                  className="w-full"
                  size="lg"
                >
                  {isGeneratingReport && (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  )}

                  {isGeneratingReport
                    ? "Generating Report..."
                    : "Generate Formal Report"}
                </Button>
              )}

            </CardContent>
          </Card>


          <Card className="shadow-lg rounded-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">
                Formal Incident Report
              </CardTitle>

              <CardDescription>
                Review your AI-generated report below.
                You can then download or email it.
              </CardDescription>
            </CardHeader>

            <CardContent>

              {isGeneratingReport && !generatedFir && (
                <div className="flex flex-col items-center justify-center h-[450px] text-muted-foreground border rounded-md p-4 bg-muted/20">
                  <Loader2 className="w-12 h-12 animate-spin mb-4 text-primary" />

                  <p className="text-lg font-medium">
                    Generating your report...
                  </p>

                  <p className="text-sm">
                    This may take a few moments.
                  </p>
                </div>
              )}

              {generatedFir && !isGeneratingReport && (
                <>
                  <ScrollArea className="h-[450px] border rounded-md p-4 bg-muted/20">
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                      {generatedFir}
                    </pre>
                  </ScrollArea>

                  <ReportActions reportText={generatedFir} />
                </>
              )}

              {!generatedFir && !isGeneratingReport && (
                <div className="flex flex-col items-center justify-center h-[450px] text-muted-foreground border rounded-md p-4 bg-muted/20">
                  <FileText className="w-16 h-16 mb-4 opacity-50" />

                  <p className="text-lg font-medium">
                    Your report will appear here.
                  </p>

                  <p className="text-sm text-center mt-1">
                    Complete the AI conversation first,
                    then generate your formal report.
                  </p>
                </div>
              )}

            </CardContent>
          </Card>

        </div>
      </main>

      <footer className="text-center py-4 border-t text-sm text-muted-foreground">
        Reportify AI &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
