
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Edit, Trash, GripVertical, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Lesson, Workshop } from "@/lib/types";
import { getLessonsByWorkshop, deleteLesson, updateLesson, getWorkshopById } from "@/services/workshopService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const LessonManager = () => {
  const { workshopId } = useParams<{ workshopId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!workshopId) return;
      
      try {
        setIsLoading(true);
        // Fetch workshop details
        const workshopData = await getWorkshopById(workshopId);
        setWorkshop(workshopData);
        
        // Fetch lessons for this workshop
        const lessonData = await getLessonsByWorkshop(workshopId);
        setLessons(lessonData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load lessons. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [workshopId, toast]);

  const handleCreateLesson = () => {
    navigate(`/workshops/${workshopId}/create-lesson`);
  };

  const handleEditLesson = (lessonId: string) => {
    navigate(`/workshops/${workshopId}/lessons/${lessonId}/edit`);
  };

  const confirmDelete = (lessonId: string) => {
    setLessonToDelete(lessonId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteLesson = async () => {
    if (!lessonToDelete) return;
    
    try {
      await deleteLesson(lessonToDelete);
      setLessons(lessons.filter(lesson => lesson.id !== lessonToDelete));
      
      // Reorder remaining lessons if needed
      const remainingLessons = lessons.filter(lesson => lesson.id !== lessonToDelete);
      const updatePromises = remainingLessons.map((lesson, index) => {
        if (lesson.order !== index + 1) {
          return updateLesson(lesson.id as string, { order: index + 1 });
        }
        return Promise.resolve();
      });
      
      await Promise.all(updatePromises);
      
      toast({
        title: "Lesson deleted",
        description: "The lesson has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting lesson:", error);
      toast({
        title: "Error",
        description: "Failed to delete lesson. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setLessonToDelete(null);
    }
  };

  // Function to handle lesson reordering (simplified - would use drag and drop in a real app)
  const moveLesson = async (lessonId: string, direction: 'up' | 'down') => {
    const lessonIndex = lessons.findIndex(l => l.id === lessonId);
    if (
      (direction === 'up' && lessonIndex === 0) || 
      (direction === 'down' && lessonIndex === lessons.length - 1)
    ) {
      return;
    }
    
    const newLessons = [...lessons];
    const swapIndex = direction === 'up' ? lessonIndex - 1 : lessonIndex + 1;
    
    // Swap positions
    [newLessons[lessonIndex], newLessons[swapIndex]] = [newLessons[swapIndex], newLessons[lessonIndex]];
    
    // Update order property
    newLessons[lessonIndex].order = lessonIndex + 1;
    newLessons[swapIndex].order = swapIndex + 1;
    
    setLessons(newLessons);
    
    // Update in database
    try {
      await updateLesson(newLessons[lessonIndex].id as string, { order: newLessons[lessonIndex].order });
      await updateLesson(newLessons[swapIndex].id as string, { order: newLessons[swapIndex].order });
    } catch (error) {
      console.error("Error reordering lessons:", error);
      toast({
        title: "Error",
        description: "Failed to reorder lessons. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/workshop-manager")}
              className="flex items-center gap-1 mb-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Workshops
            </Button>
            <h1 className="text-2xl font-bold">{workshop?.title || 'Workshop'} Lessons</h1>
          </div>
          <Button 
            onClick={handleCreateLesson}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Add Lesson
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-major-blue"></div>
          </div>
        ) : lessons.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center mb-4">
                <h3 className="text-lg font-medium">No lessons added yet</h3>
                <p className="text-sm text-gray-500">
                  Create your first lesson to start building content for this workshop.
                </p>
              </div>
              <Button onClick={handleCreateLesson} className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Create Your First Lesson
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {lessons
              .sort((a, b) => a.order - b.order)
              .map((lesson, index) => (
                <Card key={lesson.id} className="overflow-hidden">
                  <div className="flex items-center">
                    <div className="p-4 flex items-center justify-center border-r">
                      <div className="flex flex-col items-center space-y-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => moveLesson(lesson.id as string, 'up')}
                          disabled={index === 0}
                          className="h-6 w-6 p-0"
                        >
                          ▲
                        </Button>
                        <span className="text-sm font-medium">{index + 1}</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => moveLesson(lesson.id as string, 'down')}
                          disabled={index === lessons.length - 1}
                          className="h-6 w-6 p-0"
                        >
                          ▼
                        </Button>
                      </div>
                    </div>
                    <div className="flex-grow p-4">
                      <h3 className="text-lg font-medium">{lesson.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-500">
                          Duration: {lesson.estimatedDuration} minutes
                        </span>
                        {lesson.requiresReflection && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            Reflection Required
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-4 flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditLesson(lesson.id as string)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => confirmDelete(lesson.id as string)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this lesson.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLesson} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default LessonManager;
