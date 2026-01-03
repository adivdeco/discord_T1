import { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';
import { X, Copy, Check } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const InviteModal = ({ server, onClose }) => {
    const { user } = useUser();
    const [inviteCode, setInviteCode] = useState('');
    const [copied, setCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchInvite = async () => {
            try {
                // If server already has one in memory, use it? No, verify with backend always
                const res = await axios.post(`${API_URL}/api/servers/${server._id}/invite`, {
                    userId: user.id
                });
                setInviteCode(res.data.inviteCode);
            } catch (err) {
                console.error('Failed to generate invite', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchInvite();
    }, [server, user]);

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#36393f] text-white rounded-lg w-[440px] p-6 relative shadow-xl border border-[#202225]">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-200">
                    <X className="w-6 h-6" />
                </button>

                <h2 className="text-base font-bold mb-1 uppercase text-[#b9bbbe]">Invite friends to {server.name}</h2>
                <div className="h-4"></div>

                <label className="block text-xs font-bold text-[#b9bbbe] uppercase mb-2">Or, send a server invite link to a friend</label>
                <div className="bg-[#202225] p-2 rounded flex items-center border border-[#202225] focus-within:border-blue-500">
                    {isLoading ? (
                        <span className="text-gray-500 text-sm">Generating code...</span>
                    ) : (
                        <input
                            type="text"
                            readOnly
                            value={inviteCode}
                            className="bg-transparent border-none text-white w-full focus:outline-none text-sm"
                        />
                    )}
                    <button
                        onClick={handleCopy}
                        className={`ml-2 px-4 py-1.5 rounded text-sm font-medium transition-colors ${copied ? 'bg-green-500 text-white' : 'bg-[#5865F2] hover:bg-[#4752c4] text-white'}`}
                    >
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                </div>
                <p className="text-xs text-[#b9bbbe] mt-2">Your invite link expires in 7 days.</p>
            </div>
        </div>
    );
};
