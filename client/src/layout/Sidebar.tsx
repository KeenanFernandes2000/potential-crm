import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  DollarSign, 
  ClipboardList, 
  FileText, 
  Calendar, 
  Mail, 
  Zap,
  BarChart3, 
  Settings,
  FileSpreadsheet,
  UserCheck,
  Handshake,
  Receipt,
  Mailbox
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

const Sidebar = ({ isOpen, closeSidebar }: SidebarProps) => {
  const [location] = useLocation();
  const { user } = useAuth();

  const baseSidebarItems = [
    { 
      path: "/", 
      name: "Dashboard", 
      icon: <LayoutDashboard className="h-5 w-5 mr-3" />
    },
    { 
      path: "/contacts", 
      name: "Contacts",
      icon: <Users className="h-5 w-5 mr-3" />
    },
    { 
      path: "/companies", 
      name: "Companies",
      icon: <Building2 className="h-5 w-5 mr-3" />
    },
    { 
      path: "/partners", 
      name: "Partners",
      icon: <Handshake className="h-5 w-5 mr-3" />
    },
    { 
      path: "/deals", 
      name: "Deals",
      icon: <DollarSign className="h-5 w-5 mr-3" />
    },
    { 
      path: "/quotations", 
      name: "Quotations",
      icon: <FileSpreadsheet className="h-5 w-5 mr-3" />
    },
    { 
      path: "/invoiced", 
      name: "Invoiced",
      icon: <Receipt className="h-5 w-5 mr-3" />
    },
    { 
      path: "/lists", 
      name: "Lists",
      icon: <ClipboardList className="h-5 w-5 mr-3" />
    },
    { 
      path: "/forms", 
      name: "Forms",
      icon: <FileText className="h-5 w-5 mr-3" />
    },
    { 
      path: "/calendar", 
      name: "Calendar",
      icon: <Calendar className="h-5 w-5 mr-3" />
    },
    { 
      path: "/email", 
      name: "Email",
      icon: <Mail className="h-5 w-5 mr-3" />
    },
    { 
      path: "/outlook", 
      name: "Outlook",
      icon: <Mailbox className="h-5 w-5 mr-3" />
    },
    { 
      path: "/social", 
      name: "Social Media",
      icon: <Zap className="h-5 w-5 mr-3" />
    },
    { 
      path: "/reports", 
      name: "Reports",
      icon: <BarChart3 className="h-5 w-5 mr-3" />
    },
  ];

  // Add admin-only items
  const adminItems = [
    { 
      path: "/users", 
      name: "User Management",
      icon: <UserCheck className="h-5 w-5 mr-3" />
    },
  ];

  const settingsItem = { 
    path: "/settings", 
    name: "Settings",
    icon: <Settings className="h-5 w-5 mr-3" />
  };

  // Combine items based on user role
  const sidebarItems = [
    ...baseSidebarItems,
    ...(user?.role === 'admin' ? adminItems : []),
    settingsItem
  ];

  return (
    <aside 
      className={cn(
        "sidebar fixed left-0 top-12 bottom-0 w-64 bg-gray-800 text-white overflow-y-auto z-30 transition-transform shadow-lg",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      <div className="py-4">
        <nav>
          <ul>
            {sidebarItems.map((item) => (
              <li key={item.path} className="mb-1">
                <Link href={item.path}>
                  <span 
                    className={cn(
                      "sidebar-item flex items-center px-4 py-3 text-white hover:bg-gray-700 rounded-md mx-2 cursor-pointer",
                      location === item.path && "active bg-secondary font-medium"
                    )}
                    onClick={() => closeSidebar()}
                  >
                    {item.icon}
                    <span className="font-medium">{item.name}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
