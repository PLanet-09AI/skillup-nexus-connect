
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-major-blue"></div>
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
            {workshops.map((workshop) => (
              <Card key={workshop.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle>{workshop.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {workshop.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`px-2 py-1 text-xs rounded ${
                      workshop.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                      workshop.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {workshop.difficulty.charAt(0).toUpperCase() + workshop.difficulty.slice(1)}
                    </div>
                    <div className={`px-2 py-1 text-xs rounded ${
                      workshop.schedule.isOpen ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {workshop.schedule.isOpen ? 'Open' : 'Closed'}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    <p>Skills: {workshop.skillsAddressed.join(", ")}</p>
                    <p className="mt-1">
                      Created: {workshop.createdAt instanceof Date 
                        ? workshop.createdAt.toLocaleDateString() 
                        : new Date(workshop.createdAt?.seconds * 1000).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2 border-t">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewLessons(workshop.id as string)}
                    className="flex items-center gap-1"
                  >
                    <BookOpen className="h-3 w-3" />
                    Lessons
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
                </CardFooter>
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
