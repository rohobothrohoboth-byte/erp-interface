import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, User } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';

interface VacancyHeaderProps {
  backTo?: string;
  backLabel?: string;
}

export default function VacancyHeader({ 
  backTo = '/modules', 
  backLabel = 'Back to Modules' 
}: VacancyHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Back Button and Logo */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(backTo)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{backLabel}</span>
            </Button>
            <div className="h-8 w-px bg-gray-300" />
            <div className="flex items-center gap-2">
              <div>
                <h1 className="text-lg font-bold text-gray-900">Career Portal</h1>
                <p className="text-xs text-gray-500">Internal Opportunities</p>
              </div>
            </div>
          </div>

          {/* Right: User Menu */}
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="w-9 h-9">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>
                    <User className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/login')}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
