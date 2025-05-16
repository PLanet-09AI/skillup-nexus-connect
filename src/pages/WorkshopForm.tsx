
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { createWorkshop, getWorkshopById, updateWorkshop } from "@/services/workshopService";

// Define form schema with Zod
const workshopSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date().optional(),
  isOpen: z.boolean().default(true),
  skills: z.string().optional(),
});

type FormValues = z.infer<typeof workshopSchema>;

const WorkshopForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [skills, setSkills] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);

  const form = useForm<FormValues>({
    resolver: zodResolver(workshopSchema),
    defaultValues: {
      title: "",
      description: "",
      difficulty: "beginner",
      startDate: new Date(),
      isOpen: true,
      skills: "",
    },
  });

  useEffect(() => {
    const fetchWorkshop = async () => {
      if (!isEditMode) return;

      try {
        setIsFetching(true);
        const workshopData = await getWorkshopById(id);

        // Convert Firestore timestamp to Date if necessary
        const startDate = workshopData.schedule.startDate instanceof Date 
          ? workshopData.schedule.startDate 
          : new Date(workshopData.schedule.startDate?.seconds * 1000);

        const endDate = workshopData.schedule.endDate
          ? workshopData.schedule.endDate instanceof Date 
              ? workshopData.schedule.endDate 
              : new Date(workshopData.schedule.endDate?.seconds * 1000)
          : undefined;

        form.reset({
          title: workshopData.title,
          description: workshopData.description,
          difficulty: workshopData.difficulty,
          startDate,
          endDate,
          isOpen: workshopData.schedule.isOpen,
        });

        setSkills(workshopData.skillsAddressed || []);
      } catch (error) {
        console.error("Error fetching workshop:", error);
        toast({
          title: "Error",
          description: "Failed to load workshop data. Please try again.",
          variant: "destructive",
        });
        navigate("/workshop-manager");
      } finally {
        setIsFetching(false);
      }
    };

    fetchWorkshop();
  }, [id, isEditMode, form, navigate, toast]);

  const addSkill = () => {
    const skillInput = form.getValues("skills");
    if (skillInput && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      form.setValue("skills", "");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const onSubmit = async (data: FormValues) => {
    if (!user) return;

    try {
      setIsLoading(true);

      const workshopData = {
        title: data.title,
        description: data.description,
        difficulty: data.difficulty,
        skillsAddressed: skills,
        schedule: {
          startDate: data.startDate,
          endDate: data.endDate,
          isOpen: data.isOpen,
        },
        creatorId: user.uid,
      };

      if (isEditMode) {
        await updateWorkshop(id, workshopData);
        toast({
          title: "Workshop updated",
          description: "Your workshop has been successfully updated.",
        });
      } else {
        await createWorkshop(workshopData);
        toast({
          title: "Workshop created",
          description: "Your new workshop has been created successfully.",
        });
      }

      navigate("/workshop-manager");
    } catch (error) {
      console.error("Error saving workshop:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} workshop. Please try again.`,
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
          {isEditMode ? "Edit Workshop" : "Create Workshop"}
        </h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workshop Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., React Fundamentals" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what learners will gain from this workshop..." 
                      className="min-h-[120px]"
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
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty Level</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isOpen"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Open for Enrollment
                      </FormLabel>
                      <p className="text-sm text-gray-500">
                        Allow learners to join this workshop
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

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          initialFocus
                          disabled={(date) => 
                            date < form.getValues("startDate") || 
                            date < new Date()
                          }
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormLabel>Skills Addressed</FormLabel>
              <div className="flex flex-wrap gap-2 mb-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <FormField
                  control={form.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem className="flex-grow">
                      <FormControl>
                        <Input
                          placeholder="e.g., React, JavaScript, UX Design"
                          {...field}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addSkill();
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="button" variant="outline" onClick={addSkill}>
                  Add Skill
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/workshop-manager")}
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
                  <>{isEditMode ? "Update Workshop" : "Create Workshop"}</>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
};

export default WorkshopForm;
