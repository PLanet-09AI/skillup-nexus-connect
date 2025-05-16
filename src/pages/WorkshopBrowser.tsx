
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, Check } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAllWorkshops, registerForWorkshop, getRegistrationsByLearner } from "@/services/workshopService";
import { Workshop, Registration } from "@/lib/types";

// Helper function to safely convert Firestore timestamp to Date
const convertTimestampToDate = (timestamp: any): Date => {
  if (timestamp instanceof Date) return timestamp;
  if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
    return new Date(timestamp.seconds * 1000);
  }
  return new Date();
};

const WorkshopBrowser = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const [workshopData, registrationData] = await Promise.all([
          getAllWorkshops(),
          getRegistrationsByLearner(user.uid)
        ]);
        
        console.log("Fetched workshops:", workshopData);
        console.log("Fetched registrations:", registrationData);
        
        // Only show open workshops
        const openWorkshops = workshopData.filter(w => w.schedule.isOpen);
        setWorkshops(openWorkshops);
        setRegistrations(registrationData);
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

    fetchData();
  }, [user, toast]);

  const isRegistered = (workshopId: string) => {
    return registrations.some(r => r.workshopId === workshopId);
  };

  const handleRegister = async (workshopId: string) => {
    if (!user) return;
    
    try {
      setProcessingIds(prev => [...prev, workshopId]);
      
      const result = await registerForWorkshop(workshopId, user.uid, user.name);
      
      if (!result.alreadyRegistered) {
        setRegistrations(prev => [...prev, { 
          id: result.id, 
          workshopId, 
          learnerId: user.uid,
          registeredAt: new Date() 
        } as Registration]);
        
        toast({
          title: "Registration Successful",
          description: "You have been registered for the workshop.",
        });
      } else {
        toast({
          title: "Already Registered",
          description: "You are already registered for this workshop.",
        });
      }
    } catch (error) {
      console.error("Error registering for workshop:", error);
      toast({
        title: "Error",
        description: "Failed to register for workshop. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== workshopId));
    }
  };

  const handleViewWorkshop = (workshopId: string) => {
    navigate(`/workshops/${workshopId}`);
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
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Available Workshops</h1>
        
        {workshops.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-lg text-gray-500">No workshops are currently available.</p>
              <p className="text-sm text-gray-400 mt-2">Check back later for upcoming workshops.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {workshops.map((workshop) => (
              <Card key={workshop.id} className="overflow-hidden h-full flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle>{workshop.title}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {workshop.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`px-2 py-1 text-xs rounded ${
                      workshop.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                      workshop.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {workshop.difficulty.charAt(0).toUpperCase() + workshop.difficulty.slice(1)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    <p className="mb-1"><span className="font-semibold">Skills:</span> {workshop.skillsAddressed.map(skill => skill.length > 50 ? skill.substring(0, 50) + '...' : skill).join(", ")}</p>
                    <p className="mb-1">
                      <span className="font-semibold">Start Date:</span> {convertTimestampToDate(workshop.schedule.startDate).toLocaleDateString()}
                    </p>
                    {workshop.schedule.endDate && (
                      <p className="mb-1">
                        <span className="font-semibold">End Date:</span> {convertTimestampToDate(workshop.schedule.endDate).toLocaleDateString()}
                      </p>
                    )}
                    {workshop.creatorName && (
                      <p className="mb-1"><span className="font-semibold">Creator:</span> {workshop.creatorName}</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  {isRegistered(workshop.id as string) ? (
                    <Button 
                      onClick={() => handleViewWorkshop(workshop.id as string)}
                      className="w-full"
                    >
                      <Book className="mr-2 h-4 w-4" />
                      View Workshop
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleRegister(workshop.id as string)}
                      className="w-full"
                      disabled={processingIds.includes(workshop.id as string)}
                    >
                      {processingIds.includes(workshop.id as string) ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          Registering...
                        </div>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Register
                        </>
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default WorkshopBrowser;
