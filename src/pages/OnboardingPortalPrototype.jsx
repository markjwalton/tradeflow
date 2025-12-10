import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, Upload, MessageSquare, CheckSquare, FileSignature, 
  Send, Sparkles, Download, Star, CheckCircle, Clock, AlertCircle
} from "lucide-react";

export default function OnboardingPortalPrototype() {
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Welcome to your onboarding portal! How can I help you today?" }
  ]);
  const [progress] = useState(60);

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    setMessages([...messages, 
      { role: "user", content: chatInput },
      { role: "assistant", content: "This is a prototype response. In production, this would use AI to provide helpful answers." }
    ]);
    setChatInput("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Header */}
      <div className="border-b bg-card shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-display text-primary">Onboarding Portal Prototype</h1>
              <p className="text-sm text-muted-foreground">Testing & Development Environment</p>
            </div>
            <Badge variant="secondary">PROPOSAL</Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Overall Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="overview">
              <FileText className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="documents">
              <Upload className="h-4 w-4 mr-2" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="technical">
              <FileText className="h-4 w-4 mr-2" />
              Tech Docs
            </TabsTrigger>
            <TabsTrigger value="chat">
              <MessageSquare className="h-4 w-4 mr-2" />
              AI Assistant
            </TabsTrigger>
            <TabsTrigger value="tasks">
              <CheckSquare className="h-4 w-4 mr-2" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="contracts">
              <FileSignature className="h-4 w-4 mr-2" />
              Contracts
            </TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-4">
            <Card className="rounded-xl border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
              <CardHeader>
                <CardTitle className="text-2xl">Your Onboarding Journey</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Welcome to your personalized onboarding portal prototype. This is a testing environment to validate UX and functionality.
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["Discovery", "Analysis", "Proposal", "Review", "Approved"].map((milestone, idx) => (
                <Card key={milestone} className="rounded-xl">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      {idx < 3 ? <CheckCircle className="h-5 w-5 text-success" /> : 
                       idx === 3 ? <Clock className="h-5 w-5 text-primary animate-pulse" /> :
                       <AlertCircle className="h-5 w-5 text-muted-foreground" />}
                      <CardTitle className="text-base">{milestone}</CardTitle>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Documents */}
          <TabsContent value="documents" className="space-y-4">
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle>Upload Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input type="file" />
                <Textarea placeholder="Add notes about this document..." rows={3} />
                <Button className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle>Sample Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {["Brand Guidelines.pdf", "Technical Requirements.docx", "Logo Assets.zip"].map(doc => (
                  <div key={doc} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="font-semibold">{doc}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge>pending_review</Badge>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Technical Docs */}
          <TabsContent value="technical" className="space-y-4">
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle>Solution Architecture</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Core Entities</h3>
                    <div className="flex flex-wrap gap-2">
                      {["Customer", "Project", "Task", "Invoice", "Team"].map(e => (
                        <Badge key={e} variant="outline">{e}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Primary Pages</h3>
                    <div className="flex flex-wrap gap-2">
                      {["Dashboard", "Projects", "Customers", "Reports"].map(p => (
                        <Badge key={p} variant="outline" className="bg-primary/10">{p}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Chat */}
          <TabsContent value="chat" className="space-y-4">
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Knowledge Assistant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-[400px] overflow-y-auto space-y-3 p-4 bg-muted/30 rounded-lg">
                    {messages.map((msg, idx) => (
                      <div key={idx} className={`p-3 rounded-lg ${
                        msg.role === "user" ? "bg-primary/10 ml-12" : "bg-card border mr-12"
                      }`}>
                        <div className="text-xs text-muted-foreground mb-1 capitalize flex items-center justify-between">
                          <span>{msg.role === "user" ? "You" : "AI Assistant"}</span>
                          {msg.role === "assistant" && (
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <Star className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Ask a question..."
                    />
                    <Button onClick={sendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks */}
          <TabsContent value="tasks" className="grid grid-cols-2 gap-4">
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle>My Tasks (2)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {["Review technical spec", "Upload brand assets"].map(task => (
                  <div key={task} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <div className="font-semibold">{task}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Start</Button>
                      <Button size="sm" className="bg-success">Complete</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle>All Tasks (5)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {["Initial consultation", "Requirements gathering", "Architecture design", "Contract review", "Deployment"].map(task => (
                  <div key={task} className="p-3 border rounded-lg">
                    <div className="font-semibold text-sm">{task}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contracts */}
          <TabsContent value="contracts" className="space-y-4">
            <Card className="rounded-xl border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle>Contract Approval</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Review and approve agreements to proceed with deployment.
                </p>
              </CardContent>
            </Card>

            {["Master Service Agreement", "SLA", "Privacy Policy"].map(contract => (
              <Card key={contract} className="rounded-xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    {contract}
                    <Badge variant="outline">Required</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground">
                    [Contract content preview...]
                  </div>
                  <Input placeholder="Type your full name to sign" />
                  <Button className="w-full">
                    <FileSignature className="h-4 w-4 mr-2" />
                    Sign & Approve
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}