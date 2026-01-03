// components/layout/UserPanel.jsx
import { UserButton } from '@clerk/clerk-react';
import { Mic, Headphones, Settings } from 'lucide-react';

export const UserPanel = ({ user }) => {
    return (
        <div className="bg-[#292b2f] h-[52px] flex items-center px-2 space-x-2 shrink-0 w-full mt-auto">
            <div className="hover:bg-white/10 p-1 rounded cursor-pointer pl-0">
                <UserButton />
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-white text-xs font-bold truncate">
                    {user?.firstName || user?.username}
                </div>
                <div className="text-gray-400 text-[10px] truncate">
                    #{user?.id?.slice(-4)}
                </div>
            </div>
            <div className="flex items-center">
                <div className="p-1.5 hover:bg-white/10 rounded cursor-pointer"><Mic className="w-4 h-4 text-white" /></div>
                <div className="p-1.5 hover:bg-white/10 rounded cursor-pointer"><Headphones className="w-4 h-4 text-white" /></div>
                <div className="p-1.5 hover:bg-white/10 rounded cursor-pointer"><Settings className="w-4 h-4 text-white" /></div>
            </div>
        </div>
    );
};