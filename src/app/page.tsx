"use client";

import { useState, type FormEvent } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LanguageSelector } from "@/components/chat/LanguageSelector";
import { ReportActions } from "@/components/report/ReportActions";
import { generateFir, type GenerateFirInput } from "@/ai/flows/generate-fir";
import { translateIncidentReport, type TranslateIncidentReportInput } from "@/ai/flows/translate-incident-report";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2, MessageSquare, FileText } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';


interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "system";
}

export default function HomePage() {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [generatedFir, setGeneratedFir] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  const { toast } = useToast();

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim()) return;
    setChatMessages((prevMessages) => [
      ...prevMessages,
      { id: uuidv4(), text: currentMessage, sender: "user" },
    ]);
    setCurrentMessage("");
  };

  const handleGenerateReport = async () => {
    if (chatMessages.filter(msg => msg.sender === 'user').length === 0) {
      toast({
        title: "No Input",
        description: "Please describe the incident before generating a report.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setGeneratedFir(null);

    try {
      const incidentDescription = chatMessages
        .filter((msg) => msg.sender === "user")
        .map((msg) => msg.text)
        .join("\n");

      let descriptionForFir = incidentDescription;

      if (selectedLanguage !== "en") {
        toast({ title: "Translating Input", description: `Translating from ${selectedLanguage} to English...` });
        const translateInput: TranslateIncidentReportInput = {
          incidentReport: incidentDescription,
          sourceLanguage: selectedLanguage,
        };
        const translationResult = await translateIncidentReport(translateInput);
        descriptionForFir = translationResult.translatedReport;
        toast({ title: "Translation Complete", description: "Input translated to English." });
      }
      
      toast({ title: "Generating Report", description: "AI is crafting your formal incident report..." });
      const firInput: GenerateFirInput = { chatHistory: descriptionForFir };
      const firOutput = await generateFir(firInput);
      setGeneratedFir(firOutput.firReport);
      toast({ title: "Report Generated", description: "Your FIR is ready for review." });

    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
      setGeneratedFir("An error occurred while generating the report. Please check the console for details and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="shadow-lg rounded-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Describe Your Incident</CardTitle>
              <CardDescription>
                Chat with our AI assistant to create your report. Provide details in
                English or select your language.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <LanguageSelector
                value={selectedLanguage}
                onChange={setSelectedLanguage}
                disabled={isLoading}
              />
              <ScrollArea className="h-[300px] border rounded-md p-4 bg-muted/20">
                {chatMessages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mb-2" />
                    <p>Your incident description will appear here.</p>
                    <p className="text-xs">Type your message below and press Send.</p>
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
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  </div>
                ))}
              </ScrollArea>
              <form onSubmit={handleSendMessage} className="space-y-2">
                <div className="flex gap-2 items-center">
                  <Input
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    aria-label="Chat message input"
                  />
                  <Button type="submit" disabled={isLoading || !currentMessage.trim()} size="icon" aria-label="Send message">
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </form>
              <Button
                onClick={handleGenerateReport}
                disabled={isLoading || chatMessages.filter(msg => msg.sender === 'user').length === 0}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : null}
                {isLoading && selectedLanguage !== 'en' && !generatedFir ? 'Translating & Generating...' : isLoading ? 'Generating Report...' : 'Generate Formal Report'}
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Formal Incident Report</CardTitle>
              <CardDescription>
                Review your AI-generated report below. You can then download or email it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && !generatedFir && (
                 <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                    <Loader2 className="w-12 h-12 animate-spin mb-4 text-primary" />
                    <p className="text-lg font-medium">Generating your report...</p>
                    <p>This may take a few moments.</p>
                  </div>
              )}
              {generatedFir ? (
                <>
                  <ScrollArea className="h-[400px] border rounded-md p-4 bg-muted/20">
                    <pre className="whitespace-pre-wrap text-sm font-code leading-relaxed">
                      {generatedFir}
                    </pre>
                  </ScrollArea>
                  <ReportActions reportText={generatedFir} />
                </>
              ) : !isLoading && (
                <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground border rounded-md p-4 bg-muted/20">
                  <FileText className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-lg font-medium">Your report will appear here.</p>
                  <p className="text-sm">Describe the incident and click "Generate Formal Report".</p>
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
