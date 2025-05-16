
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Edit, Trash, BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Workshop } from "@/lib/types";
import { getWorkshopsByCreator, deleteWorkshop } from "@/services/workshopService";
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
import { Badge } from "@/components/ui/badge";

// Helper function to safely convert Firestore timestamp to Date
const convertTimestampToDate = (timestamp: any): Date => {
  if (timestamp instanceof Date) return timestamp;
  if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
    return new Date(timestamp.seconds * 1000);
  }
  return new Date();
};

// Format date helper
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric'
  });
};

const WorkshopManager = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [workshopToDelete, setWorkshopToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkshops = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const workshopData = await getWorkshopsByCreator(user.uid);
        console.log("Fetched workshops for creator:", workshopData);
        setWorkshops(workshopData);
      } catch (error) {
        console.error("Error fetching workshops:", error);
        toast({
          title: "Error",
          description: "Failed to load workshops. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkshops();
  }, [user, toast]);

  const handleCreateWorkshop = () => {
    navigate("/create-workshop");
  };

  const handleEditWorkshop = (workshopId: string) => {
    navigate(`/edit-workshop/${workshopId}`);
  };

  const handleViewLessons = (workshopId: string) => {
    navigate(`/workshops/${workshopId}/lessons`);
  };

  const handleAddLessons = (workshopId: string) => {
    navigate(`/workshops/${workshopId}/create-lesson`);
  };

  const confirmDelete = (workshopId: string) => {
    setWorkshopToDelete(workshopId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteWorkshop = async () => {
    if (!workshopToDelete) return;
    
    try {
      await deleteWorkshop(workshopToDelete);
      setWorkshops(workshops.filter(workshop => workshop.id !== workshopToDelete));
      toast({
        title: "Workshop deleted",
        description: "The workshop has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting workshop:", error);
      toast({
        title: "Error",
        description: "Failed to delete workshop. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setWorkshopToDelete(null);
    }
  };

  // Helper function to truncate long text
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Workshop Manager</h1>
          <Button 
            onClick={handleCreateWorkshop}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Create Workshop
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : workshops.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center mb-4">
                <h3 className="text-lg font-medium">No workshops created yet</h3>
                <p className="text-sm text-gray-500">
                  Create your first workshop to start building your talent pipeline.
                </p>
              </div>
              <Button onClick={handleCreateWorkshop} className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Create Your First Workshop
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {workshops.map((workshop) => {
              const startDate = convertTimestampToDate(workshop.schedule.startDate);
              const endDate = workshop.schedule.endDate ? 
                convertTimestampToDate(workshop.schedule.endDate) : null;
              
              return (
                <Card key={workshop.id} className="overflow-hidden flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={workshop.schedule.isOpen ? "default" : "outline"} className="mb-2">
                        {workshop.schedule.isOpen ? "Open" : "Closed"}
                      </Badge>
                      <Badge
                        className={`${
                          workshop.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                          workshop.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}
                      >
                        {workshop.difficulty.charAt(0).toUpperCase() + workshop.difficulty.slice(1)}
                      </Badge>
                    </div>
                    <CardTitle>{workshop.title}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-2">
                      {truncateText(workshop.description, 100)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Schedule</h4>
                        <p className="text-sm">
                          {formatDate(startDate)} 
                          {endDate ? ` - ${formatDate(endDate)}` : ""}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Skills Addressed</h4>
                        <p className="text-sm line-clamp-2">
                          {workshop.skillsAddressed.map(skill => 
                            skill.length > 60 ? skill.substring(0, 60) + "..." : skill
                          ).join(", ")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-3 pt-3 border-t">
                    <Button 
                      variant="default" 
                      className="w-full flex items-center justify-center gap-2"
                      onClick={() => handleAddLessons(workshop.id as string)}
                    >
                      <PlusCircle className="h-4 w-4" />
                      Add Lesson
                    </Button>
                    <div className="flex justify-between w-full">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewLessons(workshop.id as string)}
                        className="flex items-center gap-1"
                      >
                        <BookOpen className="h-4 w-4" />
                        Manage Lessons
                      </Button>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleEditWorkshop(workshop.id as string)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => confirmDelete(workshop.id as string)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the workshop and all associated lessons.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteWorkshop} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default WorkshopManager;
