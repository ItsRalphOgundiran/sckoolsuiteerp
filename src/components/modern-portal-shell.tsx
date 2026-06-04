"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Settings,
  Bell,
  Search,
  Menu,
  LogOut,
  X,
  Megaphone,
  MessageSquare,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  School,
  BookMarked,
  UsersRound,
  ArrowRightLeft,
  FileText,
  ClipboardList,
  Palette,
  Database,
  Award,
  CreditCard,
  Receipt,
  Headset,
  UserCog,
  Phone,
  Mail,
  HelpCircle,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signOut } from "next-auth/react";

type Notification = {
  id: string;
  type: "announcement" | "message" | "complaint" | "contest";
  title: string;
  description: string;
  audience: string;
  createdAt: string;
};

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { label: string; href: string; icon: React.ComponentType<{ className?: string }> }[];
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  {
    label: "Reception",
    href: "/admin/reception",
    icon: Headset,
    children: [
      { label: "Overview", href: "/admin/reception/dashboard", icon: Activity },
      { label: "Enquiry", href: "/admin/reception/enquiry", icon: FileText },
      { label: "Visitor Log", href: "/admin/reception", icon: Users },
      { label: "Gate Pass", href: "/admin/reception/gate-pass", icon: ClipboardList },
      { label: "Complaint", href: "/admin/reception/complaint", icon: AlertTriangle },
      { label: "Call Log", href: "/admin/reception/call-log", icon: Phone },
      { label: "Correspondence", href: "/admin/reception/correspondence", icon: Mail },
      { label: "Query", href: "/admin/reception/query", icon: HelpCircle },
    ],
  },
  {
    label: "Academics",
    href: "/admin/classes",
    icon: School,
    children: [
      { label: "Classes", href: "/admin/classes", icon: School },
      { label: "Arms", href: "/admin/arms", icon: UsersRound },
      { label: "Subjects", href: "/admin/subjects", icon: BookMarked },
      { label: "Attendance", href: "/admin/attendance", icon: ClipboardList },
      { label: "Results", href: "/admin/results", icon: FileText },
    ],
  },
  {
    label: "Students",
    href: "/admin/students",
    icon: GraduationCap,
    children: [
      { label: "All Students", href: "/admin/students", icon: GraduationCap },
      { label: "Admissions", href: "/admin/students/admissions", icon: FileText },
      { label: "Transfers", href: "/admin/students/transfers", icon: ArrowRightLeft },
      { label: "Student Settings", href: "/admin/settings/students", icon: Settings },
    ],
  },
  {
    label: "Finance",
    href: "/admin/fees",
    icon: CreditCard,
    children: [
      { label: "Fee Groups", href: "/admin/fees", icon: FileText },
      { label: "Bills", href: "/admin/bills", icon: Receipt },
    ],
  },
  { label: "Employees", href: "/admin/teachers", icon: Users },
  { label: "Parents", href: "/admin/parents", icon: Users },
  { label: "LMS", href: "/admin/lms", icon: BookOpen },
  { label: "Announcements", href: "/admin/announcements", icon: Bell },
  { label: "Transport", href: "/admin/transport", icon: Calendar },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
    children: [
      { label: "Branding", href: "/admin/settings", icon: Palette },
      { label: "Master Data", href: "/admin/settings/master-data", icon: Database },
      { label: "Student Settings", href: "/admin/settings/students", icon: GraduationCap },
      { label: "Reception Settings", href: "/admin/settings/reception", icon: Headset },
      { label: "Grading & Assessment", href: "/admin/settings/grading", icon: Award },
      { label: "Configuration Engine", href: "/admin/settings/config-engine", icon: Settings },
      { label: "Academic Calendar", href: "/admin/settings/academic-calendar", icon: Calendar },
      { label: "Users & Roles", href: "/admin/settings/users", icon: UserCog },
    ],
  },
];

export function ModernPortalShell({
  role,
  schoolName,
  schoolLogoUrl,
  userName,
  pathname,
  children,
}: {
  role: string;
  schoolName?: string;
  schoolLogoUrl?: string;
  userName: string;
  pathname: string;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["/admin/classes"]);
  const displaySchoolName = schoolName?.trim() || "School";
  
  const schoolInitials = displaySchoolName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications/latest", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
        }
      } catch {
        // Silently fail
      }
    };
    
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const hasUnread = notifications.length > 0;

  const toggleMenu = (href: string) => {
    setExpandedMenus((prev) =>
      prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href]
    );
  };

  const isExpanded = (href: string) => expandedMenus.includes(href);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Notifications Overlay */}
      {notificationsOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20"
          onClick={() => setNotificationsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-50 h-screen w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo Section */}
        <div className="flex h-16 flex-shrink-0 items-center gap-3 border-b border-slate-200 px-4">
          {schoolLogoUrl ? (
            <Image
              src={schoolLogoUrl}
              alt={`${displaySchoolName} logo`}
              width={40}
              height={40}
              className="h-10 w-10 rounded-lg object-contain"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white font-semibold">
              {schoolInitials || "SS"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{displaySchoolName}</p>
            <p className="text-xs text-slate-500">Admin Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const hasChildren = item.children && item.children.length > 0;
            const expanded = isExpanded(item.href);

            return (
              <div key={item.href} className="space-y-1">
                {hasChildren ? (
                  <>
                    <button
                      onClick={() => toggleMenu(item.href)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={cn("h-5 w-5", isActive ? "text-indigo-600" : "text-slate-400")} />
                        {item.label}
                      </div>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          expanded ? "rotate-180" : "",
                          isActive ? "text-indigo-600" : "text-slate-400"
                        )}
                      />
                    </button>
                    {expanded && item.children && (
                      <div className="ml-2 mt-1 space-y-0.5">
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          const isChildActive = pathname === child.href;
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setSidebarOpen(false)}
                              className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                                isChildActive
                                  ? "bg-indigo-50 text-indigo-700 font-medium"
                                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                              )}
                            >
                              <ChildIcon className={cn("h-4 w-4", isChildActive ? "text-indigo-600" : "text-slate-400")} />
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <Icon className={cn("h-5 w-5", isActive ? "text-indigo-600" : "text-slate-400")} />
                    {item.label}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div className="flex-shrink-0 border-t border-slate-200 p-3">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <LogOut className="h-5 w-5 text-slate-400" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Mobile Menu & Search */}
            <div className="flex items-center gap-3 flex-1">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden px-2"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <div className="relative max-w-md flex-1 hidden sm:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input 
                  placeholder="Search..."
                  className="pl-9 bg-slate-50 border-slate-200"
                />
              </div>
            </div>

            {/* Right: Notifications & User Profile */}
            <div className="flex items-center gap-3">
              {/* Notification Bell with Dropdown */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="relative px-2"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                >
                  <Bell className="h-5 w-5 text-slate-600" />
                  {hasUnread && (
                    <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                  )}
                </Button>
                
                {/* Notification Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                      <h3 className="font-semibold text-slate-900">Notifications</h3>
                      {hasUnread && (
                        <span className="text-xs font-medium text-indigo-600">
                          {notifications.length} new
                        </span>
                      )}
                      <button 
                        onClick={() => setNotificationsOpen(false)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                          <div className="mx-auto mb-3 rounded-full bg-slate-100 p-3 w-fit">
                            <Bell className="h-6 w-6 text-slate-400" />
                          </div>
                          <p className="text-sm text-slate-500">No notifications</p>
                        </div>
                      ) : (
                        notifications.map((notif) => {
                          const Icon = notif.type === "announcement" ? Megaphone : 
                                       notif.type === "message" ? MessageSquare : AlertTriangle;
                          const iconColor = notif.type === "announcement" ? "bg-blue-100 text-blue-600" :
                                           notif.type === "message" ? "bg-emerald-100 text-emerald-600" :
                                           "bg-rose-100 text-rose-600";
                          return (
                            <div 
                              key={notif.id}
                              className="flex items-start gap-3 px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors"
                            >
                              <div className={cn("rounded-lg p-2 shrink-0", iconColor)}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 line-clamp-1">{notif.title}</p>
                                <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{notif.description}</p>
                                <p className="text-xs text-slate-400 mt-1">
                                  {new Date(notif.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                    
                    {notifications.length > 0 && (
                      <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
                        <Link 
                          href="/admin/announcements" 
                          className="flex items-center justify-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                          onClick={() => setNotificationsOpen(false)}
                        >
                          View all announcements
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-slate-900">{userName}</p>
                  <p className="text-xs text-slate-500 capitalize">{role.toLowerCase().replace(/_/g, ' ')}</p>
                </div>
                <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">
                  {userName.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
