
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getLessonById, createLesson, updateLesson } from "@/services/workshopService";

// Define form schema with Zod
const lessonSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(20, "Content must be at least 20 characters").optional(),
  contentURI: z.string().optional(),
  estimatedDuration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
  requiresReflection: z.boolean().default(false),
});

type FormValues = z.infer<typeof lessonSchema>;

const LessonForm = () => {
  const { workshopId, lessonId } = useParams<{ workshopId: string; lessonId: string }>();
  const isEditMode = !!lessonId;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);

  const form = useForm<FormValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: "",
      content: "",
      contentURI: "",
      estimatedDuration: 15,
      requiresReflection: false,
    },
  });

  useEffect(() => {
    const fetchLesson = async () => {
      if (!isEditMode || !lessonId) return;

      try {
        setIsFetching(true);
        const lessonData = await getLessonById(lessonId);

        form.reset({
          title: lessonData.title,
          content: lessonData.content || "",
          contentURI: lessonData.contentURI || "",
          estimatedDuration: lessonData.estimatedDuration,
          requiresReflection: lessonData.requiresReflection,
        });
      } catch (error) {
        console.error("Error fetching lesson:", error);
        toast({
          title: "Error",
          description: "Failed to load lesson data. Please try again.",
          variant: "destructive",
        });
        navigate(`/workshops/${workshopId}/lessons`);
      } finally {
        setIsFetching(false);
      }
    };

    fetchLesson();
  }, [lessonId, isEditMode, form, navigate, toast, workshopId]);

  const onSubmit = async (data: FormValues) => {
    if (!user || !workshopId) return;

    try {
      setIsLoading(true);

      // Get the current order of lessons if creating a new lesson
      let order = 1;
      
      const lessonData = {
        title: data.title,
        content: data.content || "",
        contentURI: data.contentURI || "",
        estimatedDuration: data.estimatedDuration,
        requiresReflection: data.requiresReflection,
        workshopId: workshopId,
        order: order,
      };

      if (isEditMode && lessonId) {
        await updateLesson(lessonId, lessonData);
        toast({
          title: "Lesson updated",
          description: "Your lesson has been successfully updated.",
        });
      } else {
        await createLesson(lessonData);
        toast({
          title: "Lesson created",
          description: "Your new lesson has been created successfully.",
        });
      }

      navigate(`/workshops/${workshopId}/lessons`);
    } catch (error) {
      console.error("Error saving lesson:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} lesson. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-major-blue"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          {isEditMode ? "Edit Lesson" : "Create Lesson"}
        </h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lesson Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Introduction to React Hooks" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lesson Content</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter the text content for this lesson..." 
                      className="min-h-[300px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contentURI"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>External Content URL (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., https://example.com/video" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="estimatedDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requiresReflection"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Requires Reflection
                      </FormLabel>
                      <p className="text-sm text-gray-500">
                        Learners must submit a reflection for this lesson
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/workshops/${workshopId}/lessons`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>{isEditMode ? "Update Lesson" : "Create Lesson"}</>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
};

export default LessonForm;
