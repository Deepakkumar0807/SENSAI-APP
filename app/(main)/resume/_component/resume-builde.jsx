"use client";

import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Download, Save } from "lucide-react";
import { useState } from "react";

const ResumeBuilder = ({ initialContent }) => {
  const [activeTab, setActiveTab] = useState("edit");

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-2 ">
        <h1 className="text-5xl md:text-6xl font-bold gradient-title mt-8 p-5">
          Resume Builder
        </h1>
        <div className="space-x-2 mt-8">
          <Button variant="destructive">
            <Save className="h-4 w-4" />
            Save
          </Button>
          <Button>
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="edit">Form</TabsTrigger>
          <TabsTrigger value="preview">Markdown</TabsTrigger>
        </TabsList>

        <TabsContent value="edit">
          make changes to your account
        </TabsContent>
        <TabsContent value="preview">
          change your password here
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResumeBuilder;
