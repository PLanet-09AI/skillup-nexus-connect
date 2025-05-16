
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getLessonById, getWorkshopById, submitReflection } from "@/services/workshopService";
import { Lesson, Workshop } from "@/lib/types";

// Define form schema with Zod
const reflectionSchema = z.object({
  reflection: z.string().min(20, "Reflection must be at least 20 characters"),
});

type FormValues = z.infer<typeof reflectionSchema>;

const LessonView = () => {
  const { workshopId, lessonId } = useParams<{ workshopId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(reflectionSchema),
    defaultValues: {
      reflection: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!workshopId || !lessonId) return;

      try {
        setIsLoading(true);
        const [lessonData, workshopData] = await Promise.all([
          getLessonById(lessonId),
          getWorkshopById(workshopId),
        ]);

        setLesson(lessonData);
        setWorkshop(workshopData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load lesson. Please try again.",
          variant: "destructive",
        });
        navigate(`/workshops/${workshopId}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [lessonId, workshopId, navigate, toast]);

  const onSubmitReflection = async (data: FormValues) => {
    if (!user || !lesson || !lessonId) return;

    try {
      setIsSubmitting(true);
      await submitReflection(lessonId, user.uid, data.reflection, user.name);
      
      toast({
        title: "Reflection submitted",
        description: "Your reflection has been submitted successfully.",
      });
      
      form.reset();
      
    } catch (error) {
      console.error("Error submitting reflection:", error);
      toast({
        title: "Error",
        description: "Failed to submit reflection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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

  if (!lesson || !workshop) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">Lesson not found</h2>
          <Button 
            onClick={() => navigate(`/workshops/${workshopId}`)} 
            variant="link" 
            className="mt-4"
          >
            Return to Workshop
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
          onClick={() => navigate(`/workshops/${workshopId}`)}
          className="flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Workshop
        </Button>

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">{lesson.title}</h1>
            <p className="text-gray-500 mt-1">
              Workshop: {workshop.title} • Duration: {lesson.estimatedDuration} minutes
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              {lesson.content ? (
                <div className="prose prose-sm max-w-none">
                  {lesson.content.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No content available.</p>
              )}
              
              {lesson.contentURI && (
                <div className="mt-6">
                  <h3 className="font-medium mb-2">External Content</h3>
                  <a 
                    href={lesson.contentURI} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {lesson.contentURI}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {lesson.requiresReflection && user?.role === "job_seeker" && (
            <div className="mt-8">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-bold mb-4">Submit Your Reflection</h2>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitReflection)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="reflection"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea 
                                placeholder="Share your thoughts and insights about what you've learned..." 
                                className="min-h-[200px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end">
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <span className="animate-spin mr-2">⏳</span>
                              Submitting...
                            </>
                          ) : (
                            "Submit Reflection"
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LessonView;
