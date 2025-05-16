
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const LearnerProfiles = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Learner Profiles</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Job Seeker Profiles</CardTitle>
            <CardDescription>
              View profiles of job seekers who registered for your workshops
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This feature is coming soon. Here you'll be able to view detailed profiles
              of job seekers, their progress, and their submissions.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default LearnerProfiles;
