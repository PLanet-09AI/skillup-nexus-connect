
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Book, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getWorkshopById, getLessonsByWorkshop, getRegistrationsByLearner } from "@/services/workshopService";
import { Workshop, Lesson } from "@/lib/types";

const WorkshopView = () => {
  const { workshopId } = useParams<{ workshopId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!workshopId || !user) return;
      
      try {
        setIsLoading(true);
        const [workshopData, lessonData, registrations] = await Promise.all([
          getWorkshopById(workshopId),
          getLessonsByWorkshop(workshopId),
          getRegistrationsByLearner(user.uid)
        ]);
        
        setWorkshop(workshopData);
        setLessons(lessonData);
        setIsRegistered(registrations.some(r => r.workshopId === workshopId));
        
        // If not registered and user is job seeker, redirect
        if (!registrations.some(r => r.workshopId === workshopId) && user.role === "job_seeker") {
          navigate("/workshops");
          toast({
            title: "Not Registered",
            description: "You must register for this workshop before viewing its content.",
          });
        }
      } catch (error) {
        console.error("Error fetching workshop:", error);
        toast({
          title: "Error",
          description: "Failed to load workshop. Please try again.",
          variant: "destructive",
        });
        navigate("/workshops");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [workshopId, user, navigate, toast]);

  const handleViewLesson = (lessonId: string) => {
    navigate(`/workshops/${workshopId}/lessons/${lessonId}`);
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

  if (!workshop) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">Workshop not found</h2>
          <Button 
            onClick={() => navigate("/workshops")} 
            variant="link" 
            className="mt-4"
          >
            Return to Workshops
          </Button>
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
          onClick={() => navigate("/workshops")}
          className="flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Workshops
        </Button>

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">{workshop.title}</h1>
            <p className="text-gray-500 mt-1">{workshop.description}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Workshop Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Difficulty</h3>
                  <p className="mt-1">
                    <span className={`px-2 py-1 text-xs rounded ${
                      workshop.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                      workshop.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {workshop.difficulty.charAt(0).toUpperCase() + workshop.difficulty.slice(1)}
                    </span>
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Skills Addressed</h3>
                  <p className="mt-1">{workshop.skillsAddressed.join(", ")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Lessons</h2>
            
            {lessons.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-lg text-gray-500">No lessons available yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {lessons
                  .sort((a, b) => a.order - b.order)
                  .map((lesson, index) => (
                    <Card key={lesson.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <div>
                            <CardTitle>
                              {index + 1}. {lesson.title}
                            </CardTitle>
                            <CardDescription>
                              Duration: {lesson.estimatedDuration} minutes
                              {lesson.requiresReflection && " • Requires reflection"}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardFooter className="pt-2">
                        <Button
                          onClick={() => handleViewLesson(lesson.id as string)}
                          className="ml-auto"
                        >
                          <Book className="mr-2 h-4 w-4" />
                          View Lesson
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WorkshopView;
