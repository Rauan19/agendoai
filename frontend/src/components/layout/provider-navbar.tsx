
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { 
  Home, 
  Calendar, 
  CalendarDays, 
  Scissors, 
  User, 
  ClipboardList, 
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown
} from "lucide-react";
import Navbar, { NavItemType } from "./navbar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/use-notifications";
import { NotificationsMenu } from "@/components/ui/notifications-menu";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ProviderNavbar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);

  const navItems: NavItemType[] = [
    {
      icon: <Home className="h-5 w-5" />,
      label: "Início",
      href: "/provider/dashboard",
      isActive: (path) => path.startsWith("/provider/dashboard") || path === "/provider"
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      label: "Agenda",
      href: "/provider/schedule",
      isActive: (path) => path.includes("schedule")
    },
    {
      icon: <ClipboardList className="h-5 w-5" />,
      label: "Agendamentos",
      href: "/provider/appointments",
      isActive: (path) => path.includes("appointments")
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "Clientes",
      href: "/provider/clients",
      isActive: (path) => path.includes("clients")
    },
    {
      icon: <Scissors className="h-5 w-5" />,
      label: "Serviços",
      href: "/provider/services",
      isActive: (path) => path.includes("services")
    }
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getUserInitials = () => {
    if (!user?.name) return "P";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <motion.header 
          className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b shadow-sm"
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Abrir menu</span>
                </Button>
              </SheetTrigger>
            
              {/* Logo */}
              <Link href="/provider/dashboard">
                <motion.div 
                  className="flex items-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                    <Scissors className="h-4 w-4 text-white" />
                  </div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                    AgendoAI Pro
                  </h1>
                </motion.div>
              </Link>
            
              {/* Desktop navigation */}
              <nav className="ml-8 hidden lg:flex lg:items-center lg:space-x-1">
                {navItems.map((item, index) => (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          asChild
                          variant={item.isActive?.(location) ? "default" : "ghost"}
                          className={`relative px-4 py-2 transition-all duration-200 ${
                            item.isActive?.(location) 
                              ? "bg-primary text-white shadow-md" 
                              : "hover:bg-primary/10 hover:text-primary"
                          }`}
                        >
                          <Link href={item.href}>
                            <span className="flex items-center space-x-2">
                              {item.icon}
                              <span className="font-medium">{item.label}</span>
                            </span>
                            {item.isActive?.(location) && (
                              <motion.div
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                                layoutId="activeTab"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2 }}
                              />
                            )}
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{item.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </nav>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative hover:bg-primary/10"
                    >
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
                        >
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Notificações</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 px-3 py-2 hover:bg-primary/10">
                    <Avatar className="h-8 w-8 border-2 border-primary/20">
                      <AvatarImage src={user?.profileImage || ""} />
                      <AvatarFallback className="bg-primary text-white text-sm font-semibold">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium">{user?.name?.split(' ')[0] || "Prestador"}</p>
                      <p className="text-xs text-gray-500">Ver perfil</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/provider/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Perfil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/provider/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Configurações</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </motion.header>

        {/* Mobile Navigation Menu */}
        <SheetContent side="left" className="flex flex-col w-80">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                <Scissors className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-lg font-semibold">Menu do Prestador</h2>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <div className="space-y-2">
              {navItems.map((item, index) => (
                <Button
                  key={index}
                  asChild
                  variant={item.isActive?.(location) ? "default" : "ghost"}
                  className="w-full justify-start h-12"
                  onClick={() => setOpen(false)}
                >
                  <Link href={item.href}>
                    <span className="flex items-center space-x-3">
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </span>
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sair
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Bottom Navigation for Mobile */}
      <div className="lg:hidden">
        <Navbar 
          items={navItems} 
          className="bg-white/95 backdrop-blur-sm border-t shadow-lg" 
          layoutId="provider-navbar" 
          showActiveIndicator={true}
        />
      </div>
    </>
  );
}
