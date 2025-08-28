import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Menu, Home, BookOpen, Sparkles } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();

  const navigationItems = [
    {
      title: 'SPECTRA Home',
      href: '/',
      icon: Home,
      description: 'Main chat interface'
    },
    {
      title: 'Tutorial',
      href: '/tutorial',
      icon: BookOpen,
      description: 'Learn how to use SPECTRA'
    }
  ];

  return (
    <div className="fixed top-4 left-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="icon"
            className="bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary/10 hover:border-primary/40 transition-all duration-200"
          >
            <Menu className="h-4 w-4" />
            <span className="sr-only">Open navigation menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="start" 
          className="w-56 bg-background/95 backdrop-blur-sm border-primary/20"
        >
          <div className="px-2 py-1.5 text-sm font-semibold text-primary flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            SPECTRA Navigation
          </div>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <DropdownMenuItem key={item.href} asChild>
                <Link 
                  to={item.href}
                  className={`flex items-center gap-3 px-2 py-2 cursor-pointer transition-colors duration-200 ${
                    isActive 
                      ? 'bg-primary/20 text-primary' 
                      : 'hover:bg-primary/10'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span className="font-medium">{item.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  </div>
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Navigation;