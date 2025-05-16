
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ArrowLeft, Check, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getReflectionsByLesson, reviewReflection, getLessonById } from "@/services/workshopService";
import { Reflection, Lesson } from "@/lib/types";

// Helper function to convert Firebase timestamp to date
const formatDate = (timestamp: any) => {
  if (timestamp instanceof Date) return timestamp.toLocaleString();
  if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
    return new Date(timestamp.seconds * 1000).toLocaleString();
  }
  return 'Unknown date';
};

const ReflectionReview = () => {
  const { workshopId, lessonId } = useParams<{ workshopId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!lessonId) return;
      
      try {
        setIsLoading(true);
        const [reflectionData, lessonData] = await Promise.all([
          getReflectionsByLesson(lessonId),
          getLessonById(lessonId)
        ]);
        
        setReflections(reflectionData);
        setLesson(lessonData);
      } catch (error) {
        console.error("Error fetching reflections:", error);
        toast({
          title: "Error",
          description: "Failed to load reflections. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [lessonId, toast]);

  const handleReviewReflection = async (reflectionId: string, status: "approved" | "rejected") => {
    if (!user) return;
    
    try {
      setProcessingIds(prev => [...prev, reflectionId]);
      
      await reviewReflection(reflectionId, status, user.uid);
      
      // Update the local state
      setReflections(reflections.map(r => 
        r.id === reflectionId ? { ...r, reviewed: true } : r
      ));
      
      toast({
        title: status === "approved" ? "Reflection Approved" : "Reflection Rejected",
        description: status === "approved" 
          ? "The learner has been awarded 50 points." 
          : "The learner has been deducted 30 points.",
      });
    } catch (error) {
      console.error("Error reviewing reflection:", error);
      toast({
        title: "Error",
        description: "Failed to review reflection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== reflectionId));
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate(`/workshops/${workshopId}/lessons`)}
          className="flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Lessons
        </Button>

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Reflection Reviews</h1>
            <p className="text-gray-500">Lesson: {lesson?.title || 'Unknown'}</p>
          </div>

          {reflections.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-lg text-gray-500">No reflections submitted yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {reflections.map((reflection) => (
                <Card key={reflection.id} className={reflection.reviewed ? "bg-gray-50" : ""}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{reflection.learnerName || 'Anonymous Learner'}</CardTitle>
                        <CardDescription>
                          Submitted: {formatDate(reflection.submittedAt)}
                        </CardDescription>
                      </div>
                      {reflection.reviewed ? (
                        <span className="px-3 py-1 text-sm rounded bg-gray-200 text-gray-700">
                          Reviewed
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-sm rounded bg-yellow-100 text-yellow-800">
                          Pending Review
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      {reflection.content.split('\n').map((paragraph, index) => (
                        <p key={index} className="mb-2">{paragraph}</p>
                      ))}
                    </div>
                  </CardContent>
                  {!reflection.reviewed && (
                    <CardFooter className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        className="border-red-500 text-red-500 hover:bg-red-50"
                        onClick={() => handleReviewReflection(reflection.id as string, "rejected")}
                        disabled={processingIds.includes(reflection.id as string)}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Reject (-30 pts)
                      </Button>
                      <Button 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleReviewReflection(reflection.id as string, "approved")}
                        disabled={processingIds.includes(reflection.id as string)}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Approve (+50 pts)
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReflectionReview;
