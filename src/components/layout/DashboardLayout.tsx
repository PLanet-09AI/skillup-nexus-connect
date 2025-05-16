
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Menu } from "lucide-react";

interface SidebarLinkProps {
  to: string;
  label: string;
  active: boolean;
}

const SidebarLink = ({ to, label, active }: SidebarLinkProps) => (
  <Link
    to={to}
    className={`flex items-center px-4 py-2 rounded-md transition-colors ${
      active
        ? "bg-major-blue text-white"
        : "hover:bg-major-blue/10"
    }`}
  >
    {label}
  </Link>
);

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const jobSeekerLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/workshops", label: "Browse Workshops" },
    { to: "/profile", label: "My Profile" },
    { to: "/leaderboard", label: "Leaderboard" },
  ];

  const recruiterLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/workshop-manager", label: "Workshop Manager" },
    { to: "/learner-profiles", label: "Learner Profiles" },
  ];

  const links = user?.role === "recruiter" ? recruiterLinks : jobSeekerLinks;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={toggleSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-major-blue-dark">SkillUp</span>
            <span className="text-xl font-bold text-black">Connect</span>
          </Link>
          <div className="w-8"> {/* Empty div for flex alignment */}
          </div>
        </div>
      </div>

      {/* Sidebar - mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 w-64 bg-white border-r z-50 transition-all duration-300 lg:translate-x-0 lg:static ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-major-blue-dark">SkillUp</span>
            <span className="text-xl font-bold text-black">Connect</span>
          </Link>
        </div>
        
        <div className="py-4">
          <div className="px-4 mb-4">
            <p className="text-sm text-gray-500 mb-1">Logged in as</p>
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
          
          <div className="space-y-1 px-2">
            {links.map((link) => (
              <SidebarLink
                key={link.to}
                to={link.to}
                label={link.label}
                active={isActive(link.to)}
              />
            ))}
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <Button 
            variant="outline" 
            className="w-full text-gray-700" 
            onClick={handleSignOut}
          >
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-20 hidden lg:block">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">
              {/* Extract page title from current path */}
              {location.pathname === "/dashboard" ? "Dashboard" : 
               location.pathname === "/workshops" ? "Browse Workshops" : 
               location.pathname === "/profile" ? "My Profile" : 
               location.pathname === "/leaderboard" ? "Leaderboard" :
               location.pathname === "/workshop-manager" ? "Workshop Manager" :
               location.pathname === "/learner-profiles" ? "Learner Profiles" : 
               "SkillUp Connect"}
            </h1>

            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-major-blue text-white flex items-center justify-center text-sm">
                      {user?.name?.substring(0, 1) || "U"}
                    </div>
                    <span className="hidden sm:inline">{user?.name}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">My Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 pt-16 lg:pt-6">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
