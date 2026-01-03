// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useUser, UserButton } from '@clerk/clerk-react';
// import { ChatArea } from './ChatArea';
// import { CreateServerModal } from './CreateServerModal';
// import { CreateChannelModal } from './CreateChannelModal';
// import { JoinServerModal } from './JoinServerModal';
// import { InviteModal } from './InviteModal';
// import { ServerSettingsModal } from './ServerSettingsModal';
// import { CreateDMModal } from './CreateDMModal';
// import { Hash, Volume2, Mic, Headphones, Settings, Compass, Plus, UserPlus, ChevronDown, LogOut, Trash2, X } from 'lucide-react';
// import { FaDiscord } from 'react-icons/fa';

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// export const Layout = () => {
//     const { user } = useUser();
//     const [servers, setServers] = useState([]);
//     const [selectedServer, setSelectedServer] = useState(null);
//     const [channels, setChannels] = useState([]);
//     const [selectedChannel, setSelectedChannel] = useState(null);

//     const [showServerModal, setShowServerModal] = useState(false);
//     const [showChannelModal, setShowChannelModal] = useState(false);
//     const [showJoinModal, setShowJoinModal] = useState(false);
//     const [showInviteModal, setShowInviteModal] = useState(false);
//     const [showSettingsModal, setShowSettingsModal] = useState(false);
//     const [showDropdown, setShowDropdown] = useState(false);

//     // DM State
//     const [showDMModal, setShowDMModal] = useState(false);
//     const [conversations, setConversations] = useState([]);
//     const [selectedConversation, setSelectedConversation] = useState(null);

//     // Fetch Servers on mount
//     useEffect(() => {
//         if (!user) return;
//         const fetchServers = async () => {
//             try {
//                 const res = await axios.get(`${API_URL}/api/users/${user.id}/servers`);
//                 setServers(res.data);
//                 if (res.data.length > 0) setSelectedServer(res.data[0]);
//             } catch (err) {
//                 console.error("Failed to fetch servers", err);
//             }
//         };
//         fetchServers();
//     }, [user]);

//     // Fetch Channels when Server changes
//     useEffect(() => {
//         if (!selectedServer) {
//             setChannels([]);
//             setSelectedChannel(null);
//             return;
//         }
//         const fetchChannels = async () => {
//             try {
//                 const res = await axios.get(`${API_URL}/api/servers/${selectedServer._id}/channels`);
//                 setChannels(res.data);
//                 const defaultChannel = res.data.find(c => c.name === 'general') || res.data.find(c => c.type === 'text') || res.data[0];
//                 setSelectedChannel(defaultChannel);
//             } catch (err) {
//                 console.error("Failed to fetch channels", err);
//             }
//         };
//         fetchChannels();
//     }, [selectedServer]);

//     // Fetch Conversations when on Home (no server selected)
//     useEffect(() => {
//         if (selectedServer) return;
//         if (!user) return;
//         const fetchConversations = async () => {
//             try {
//                 const res = await axios.get(`${API_URL}/api/users/${user.id}/conversations`);
//                 setConversations(res.data);
//             } catch (err) {
//                 console.error("Failed to fetch conversations", err);
//             }
//         };
//         fetchConversations();
//     }, [selectedServer, user]);

//     const handleServerCreated = (newServer) => {
//         setServers([...servers, newServer]);
//         setSelectedServer(newServer);
//     };

//     const handleChannelCreated = (newChannel) => {
//         setChannels([...channels, newChannel]);
//         setSelectedChannel(newChannel);
//     };

//     const handleServerJoined = (server) => {
//         if (!servers.find(s => s._id === server._id)) {
//             setServers([...servers, server]);
//         }
//         setSelectedServer(server);
//     };

//     const isOwner = selectedServer && user && selectedServer.owner === user.id;

//     const handleLeaveServer = async () => {
//         if (!selectedServer || !user) return;
//         if (confirm(`Are you sure you want to leave ${selectedServer.name}?`)) {
//             try {
//                 await axios.post(`${API_URL}/api/servers/${selectedServer._id}/leave`, { userId: user.id });
//                 setServers(servers.filter(s => s._id !== selectedServer._id));
//                 setSelectedServer(null);
//                 setShowDropdown(false);
//             } catch (err) {
//                 console.error("Failed to leave server", err);
//                 alert(err.response?.data?.error || "Failed to leave server");
//             }
//         }
//     };

//     const handleDeleteServer = async () => {
//         if (!selectedServer || !user) return;
//         if (confirm(`Are you sure you want to DELETE ${selectedServer.name}? This cannot be undone.`)) {
//             try {
//                 await axios.delete(`${API_URL}/api/servers/${selectedServer._id}`, { data: { userId: user.id } });
//                 setServers(servers.filter(s => s._id !== selectedServer._id));
//                 setSelectedServer(null);
//                 setShowDropdown(false);
//             } catch (err) {
//                 console.error("Failed to delete server", err);
//                 alert(err.response?.data?.error || "Failed to delete server");
//             }
//         }
//     };

//     const handleDeleteChannel = async (channelId, channelName) => {
//         if (!confirm(`Are you sure you want to delete #${channelName}?`)) return;
//         try {
//             await axios.delete(`${API_URL}/api/channels/${channelId}`, { data: { userId: user.id } });
//             setChannels(channels.filter(c => c._id !== channelId));
//             if (selectedChannel?._id === channelId) setSelectedChannel(null);
//         } catch (err) {
//             console.error("Failed to delete channel", err);
//             alert(err.response?.data?.error || "Failed to delete channel");
//         }
//     };

//     const handleStartDM = async (targetUserId) => {
//         if (!user) return;
//         try {
//             const res = await axios.post(`${API_URL}/api/conversations`, {
//                 user1Id: user.id,
//                 user2Id: targetUserId
//             });
//             const newConv = res.data;

//             // Update local state if it's a new conversation
//             if (!conversations.find(c => c._id === newConv._id)) {
//                 setConversations([newConv, ...conversations]);
//             }

//             // Switch to DM view
//             setSelectedServer(null);
//             setSelectedConversation(newConv);
//         } catch (err) {
//             console.error("Failed to start DM", err);
//             alert("Failed to start conversation");
//         }
//     };

//     return (
//         <div className="flex h-screen w-screen overflow-hidden text-sm font-sans">
//             {/* 1. Server List (Far Left Rail) */}
//             <div className="w-[72px] bg-[#202225] flex flex-col items-center py-3 space-y-2 overflow-y-auto no-scrollbar scroll-smooth">
//                 {/* Home/DM button */}
//                 <div
//                     onClick={() => setSelectedServer(null)}
//                     className={`w-12 h-12 rounded-[24px] hover:rounded-[16px] transition-all flex items-center justify-center cursor-pointer mb-2 group 
//                     ${!selectedServer ? 'bg-[#5865F2] rounded-[16px]' : 'bg-[#36393f] hover:bg-[#5865F2]'}`}
//                 >
//                     <span>
//                         <FaDiscord className="w-7 h-7" />
//                     </span>
//                 </div>

//                 <div className="w-8 h-[2px] bg-[#36393f] rounded-lg mb-2"></div>

//                 {/* Server Items */}
//                 {servers.map((server) => (
//                     <div
//                         key={server._id}
//                         onClick={() => setSelectedServer(server)}
//                         className={`group relative w-12 h-12 rounded-[24px] hover:rounded-[16px] transition-all cursor-pointer flex items-center justify-center font-bold overflow-hidden text-gray-200
//                         ${selectedServer?._id === server._id ? 'bg-[#5865F2] rounded-[16px] text-white' : 'bg-[#36393f] hover:bg-[#5865F2] hover:text-white'}`}
//                     >
//                         <span className={`absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-lg transform transition-all my-auto h-2 
//                             ${selectedServer?._id === server._id ? 'h-10 translate-x-[-4px]' : '-translate-x-full group-hover:translate-x-[-4px] group-hover:h-5'}`
//                         }></span>
//                         {server.icon ? (
//                             <img src={server.icon} alt={server.name} className="w-full h-full object-cover" />
//                         ) : (
//                             <span>{server.name.substring(0, 2).toUpperCase()}</span>
//                         )}
//                     </div>
//                 ))}

//                 {/* Add/Join Buttons */}
//                 <div onClick={() => setShowServerModal(true)} className="w-12 h-12 bg-[#36393f] rounded-[24px] hover:rounded-[16px] hover:bg-green-600 transition-all text-green-600 hover:text-white flex items-center justify-center cursor-pointer group">
//                     <Plus className="w-6 h-6" />
//                 </div>
//                 <div onClick={() => setShowJoinModal(true)} className="w-12 h-12 bg-[#36393f] rounded-[24px] hover:rounded-[16px] hover:bg-green-600 transition-all text-green-600 hover:text-white flex items-center justify-center cursor-pointer">
//                     <Compass className="w-6 h-6" />
//                 </div>
//             </div>

//             {/* 2. Middle Sidebar (Conditional: Server Channels OR DM List) */}
//             {selectedServer ? (
//                 // --- SERVER CHANNEL LIST ---
//                 <div className="w-60 bg-[#2f3136] flex flex-col">
//                     <div
//                         className="h-12 border-b border-[#202225] flex items-center px-4 font-bold text-white hover:bg-[#34373c] cursor-pointer transition-colors shadow-sm justify-between relative"
//                         onClick={() => setShowDropdown(!showDropdown)}
//                     >
//                         <span className="truncate">{selectedServer.name}</span>
//                         {showDropdown ? <X className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}

//                         {showDropdown && (
//                             <div className="absolute top-12 left-0 w-full bg-[#18191c] rounded p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
//                                 <div className="flex items-center justify-between text-[#949cf7] hover:bg-[#4752c4] hover:text-white px-2 py-2 rounded pointer-events-auto cursor-pointer" onClick={(e) => { e.stopPropagation(); setShowInviteModal(true); setShowDropdown(false); }}>
//                                     <span>Invite People</span><UserPlus className="w-4 h-4" />
//                                 </div>
//                                 {isOwner ? (
//                                     <>
//                                         <div className="flex items-center justify-between text-gray-400 hover:bg-[#4752c4] hover:text-white px-2 py-2 rounded pointer-events-auto cursor-pointer" onClick={(e) => { e.stopPropagation(); setShowSettingsModal(true); setShowDropdown(false); }}>
//                                             <span>Server Settings</span><Settings className="w-4 h-4" />
//                                         </div>
//                                         <div className="flex items-center justify-between text-gray-400 hover:bg-[#4752c4] hover:text-white px-2 py-2 rounded pointer-events-auto cursor-pointer" onClick={(e) => { e.stopPropagation(); setShowChannelModal(true); setShowDropdown(false); }}>
//                                             <span>Create Channel</span><Plus className="w-4 h-4" />
//                                         </div>
//                                         <div className="h-[1px] bg-[#2f3136] my-1 mx-1"></div>
//                                         <div className="flex items-center justify-between text-red-500 hover:bg-red-500 hover:text-white px-2 py-2 rounded pointer-events-auto cursor-pointer" onClick={(e) => { e.stopPropagation(); handleDeleteServer(); }}>
//                                             <span>Delete Server</span><Trash2 className="w-4 h-4" />
//                                         </div>
//                                     </>
//                                 ) : (
//                                     <>
//                                         <div className="h-[1px] bg-[#2f3136] my-1 mx-1"></div>
//                                         <div className="flex items-center justify-between text-red-500 hover:bg-red-500 hover:text-white px-2 py-2 rounded pointer-events-auto cursor-pointer" onClick={(e) => { e.stopPropagation(); handleLeaveServer(); }}>
//                                             <span>Leave Server</span><LogOut className="w-4 h-4" />
//                                         </div>
//                                     </>
//                                 )}
//                             </div>
//                         )}
//                     </div>

//                     <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 custom-scrollbar">
//                         {/* Categories & Channels */}
//                         {(() => {
//                             const grouped = channels.reduce((acc, channel) => {
//                                 const cat = channel.category || 'General';
//                                 if (!acc[cat]) acc[cat] = [];
//                                 acc[cat].push(channel);
//                                 return acc;
//                             }, {});
//                             const definedCategories = selectedServer.categories || [];
//                             const otherCategories = Object.keys(grouped).filter(c => !definedCategories.includes(c));
//                             const sortedCategories = [...definedCategories, ...otherCategories];

//                             return sortedCategories.map(category => {
//                                 const categoryChannels = grouped[category];
//                                 if (!categoryChannels || categoryChannels.length === 0) return null;
//                                 return (
//                                     <div key={category} className="mb-4">
//                                         <div className="flex items-center justify-between text-xs font-bold text-gray-400 px-2 mb-1 hover:text-gray-300 cursor-pointer uppercase group">
//                                             <div className="flex items-center"><ChevronDown className="w-3 h-3 mr-0.5" /><span>{category}</span></div>
//                                             {isOwner && <Plus onClick={() => setShowChannelModal(true)} className="w-3 h-3 cursor-pointer hover:text-white" />}
//                                         </div>
//                                         <div className="space-y-[1px]">
//                                             {categoryChannels.map(channel => (
//                                                 <div key={channel._id} onClick={() => setSelectedChannel(channel)} className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer group ${selectedChannel?._id === channel._id ? 'bg-[#393c43] text-white' : 'text-gray-400 hover:bg-[#34373c] hover:text-gray-200'}`}>
//                                                     <div className="flex items-center overflow-hidden">
//                                                         {channel.type === 'voice' ? <Volume2 className="w-4 h-4 mr-1.5 shrink-0 text-gray-500 group-hover:text-gray-400" /> : <Hash className="w-4 h-4 mr-1.5 shrink-0 text-gray-500 group-hover:text-gray-400" />}
//                                                         <span className="font-medium truncate">{channel.name}</span>
//                                                     </div>
//                                                     {isOwner && <Trash2 onClick={(e) => { e.stopPropagation(); handleDeleteChannel(channel._id, channel.name); }} className="w-3 h-3 hidden group-hover:block text-gray-500 hover:text-red-400" />}
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     </div>
//                                 );
//                             });
//                         })()}
//                     </div>
//                     {/* User Control Panel */}
//                     <div className="bg-[#292b2f] h-[52px] flex items-center px-2 space-x-2 shrink-0">
//                         <div className="hover:bg-white/10 p-1 rounded cursor-pointer pl-0"><UserButton /></div>
//                         <div className="flex-1 min-w-0"><div className="text-white text-xs font-bold truncate">{user?.firstName || user?.username}</div><div className="text-gray-400 text-[10px] truncate">#{user?.id?.slice(-4)}</div></div>
//                         <div className="flex items-center">
//                             <div className="p-1.5 hover:bg-white/10 rounded cursor-pointer"><Mic className="w-4 h-4 text-white" /></div>
//                             <div className="p-1.5 hover:bg-white/10 rounded cursor-pointer"><Headphones className="w-4 h-4 text-white" /></div>
//                             <div className="p-1.5 hover:bg-white/10 rounded cursor-pointer"><Settings className="w-4 h-4 text-white" /></div>
//                         </div>
//                     </div>
//                 </div>
//             ) : (
//                 // --- DM SIDEBAR (Home View) ---
//                 <div className="w-60 bg-[#2f3136] flex flex-col">
//                     <div className="h-12 border-b border-[#202225] flex items-center px-4 shadow-sm">
//                         <input placeholder="Find or start a conversation" className="bg-[#202225] text-white text-xs w-full p-1.5 rounded focus:outline-none" />
//                     </div>
//                     <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
//                         <div className="flex items-center justify-between text-xs font-bold text-gray-400 px-2 mb-2 uppercase group">
//                             <span>Direct Messages</span>
//                             <Plus onClick={() => setShowDMModal(true)} className="w-3 h-3 cursor-pointer hover:text-white" />
//                         </div>
//                         {conversations.map(conv => {
//                             const otherUserId = conv.participants.find(p => p !== user?.id);
//                             return (
//                                 <div key={conv._id} onClick={() => setSelectedConversation(conv)} className={`flex items-center px-2 py-2 rounded cursor-pointer group ${selectedConversation?._id === conv._id ? 'bg-[#393c43] text-white' : 'text-gray-400 hover:bg-[#34373c] hover:text-gray-100'}`}>
//                                     <div className="relative mr-3">
//                                         <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">{otherUserId?.slice(-2) || 'DM'}</div>
//                                         <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-[2px] border-[#2f3136]"></div>
//                                     </div>
//                                     <div className="flex-1 truncate">
//                                         <div className="font-medium text-sm">{otherUserId ? `User ${otherUserId}` : 'Unknown'}</div>
//                                         </div>
//                                     <X className="w-4 h-4 ml-auto hidden group-hover:block hover:text-red-400 text-gray-500" />
//                                 </div>
//                             );
//                         })}
//                         {conversations.length === 0 && <div className="text-center text-gray-500 text-xs mt-4">No conversations yet.<br />Start one by adding friends!</div>}
//                     </div>
//                     {/* User Control Panel (Duplicate for DM view) */}
//                     <div className="bg-[#292b2f] h-[52px] flex items-center px-2 space-x-2 shrink-0">
//                         <div className="hover:bg-white/10 p-1 rounded cursor-pointer pl-0"><UserButton /></div>
//                         <div className="flex-1 min-w-0"><div className="text-white text-xs font-bold truncate">{user?.firstName || user?.username}</div><div className="text-gray-400 text-[10px] truncate">#{user?.id?.slice(-4)}</div></div>
//                         <div className="flex items-center">
//                             <div className="p-1.5 hover:bg-white/10 rounded cursor-pointer"><Mic className="w-4 h-4 text-white" /></div>
//                             <div className="p-1.5 hover:bg-white/10 rounded cursor-pointer"><Headphones className="w-4 h-4 text-white" /></div>
//                             <div className="p-1.5 hover:bg-white/10 rounded cursor-pointer"><Settings className="w-4 h-4 text-white" /></div>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* 3. Main Chat Area */}
//             <div className="flex-1 flex flex-col min-w-0 bg-[#36393f]">
//                 {selectedServer ? (
//                     selectedChannel ? (
//                         <ChatArea
//                             channelId={selectedChannel._id}
//                             channelName={selectedChannel.name}
//                             key={selectedChannel._id}
//                             onStartDM={handleStartDM}
//                         />
//                     ) : (
//                         <div className="flex-1 flex items-center justify-center text-gray-400">
//                             <div className="text-center"><h3 className="text-lg font-bold text-gray-300 mb-2">Welcome to {selectedServer.name}</h3><p>Select a channel to begin.</p></div>
//                         </div>
//                     )
//                 ) : (
//                     selectedConversation ? (
//                         <ChatArea
//                             conversationId={selectedConversation._id}
//                             channelName={(() => {
//                                 const other = selectedConversation.participants.find(p => p !== user?.id);
//                                 return other ? `User ${other.slice(-4)}` : 'DM';
//                             })()}
//                             key={selectedConversation._id}
//                             onStartDM={handleStartDM}
//                         />
//                     ) : (
//                         <div className="flex-1 flex items-center justify-center text-gray-400">
//                             <div className="text-center"><h3 className="text-lg font-bold text-gray-300 mb-2">Direct Messages</h3><p>Select a conversation to start chatting.</p></div>
//                         </div>
//                     )
//                 )}
//             </div>

//             {/* 4. Member List (Right) - Only show if in a server */}
//             {selectedServer && (
//                 <div className={`w-60 bg-[#2f3136] hidden lg:flex flex-col p-3 overflow-y-auto ${!selectedChannel && 'hidden'}`}>
//                     <div className="text-xs font-bold text-gray-400 uppercase mb-2">Online — 1</div>
//                     <div className="space-y-2">
//                         <div className="flex items-center space-x-3 opacity-90 hover:bg-[#34373c] p-1.5 rounded cursor-pointer">
//                             <div className="relative">
//                                 <img src={user?.imageUrl} className="w-8 h-8 rounded-full" />
//                                 <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-[2.5px] border-[#2f3136]"></div>
//                             </div>
//                             <div>
//                                 <div className="text-white font-medium text-sm">{user?.firstName || 'You'}</div>
//                                 <div className="text-xs text-gray-400">Online</div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Modals */}
//             {showServerModal && <CreateServerModal onClose={() => setShowServerModal(false)} onServerCreated={handleServerCreated} />}
//             {showChannelModal && selectedServer && <CreateChannelModal serverId={selectedServer._id} categories={selectedServer.categories || []} onClose={() => setShowChannelModal(false)} onChannelCreated={handleChannelCreated} />}
//             {showJoinModal && <JoinServerModal onClose={() => setShowJoinModal(false)} onServerJoined={handleServerJoined} />}
//             {showInviteModal && selectedServer && <InviteModal server={selectedServer} onClose={() => setShowInviteModal(false)} />}
//             {showSettingsModal && selectedServer && <ServerSettingsModal server={selectedServer} onClose={() => setShowSettingsModal(false)} onServerUpdated={(updatedServer) => { setServers(servers.map(s => s._id === updatedServer._id ? updatedServer : s)); setSelectedServer(updatedServer); }} />}
//             {showDMModal && (
//                 <CreateDMModal
//                     onClose={() => setShowDMModal(false)}
//                     onConversationCreated={(conv) => {
//                         if (!conversations.find(c => c._id === conv._id)) {
//                             setConversations([conv, ...conversations]);
//                         }
//                         setSelectedConversation(conv);
//                     }}
//                 />
//             )}
//         </div>
//     );
// };

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';

// New Components
import { NavigationRail } from '../components/layout/NavigationRail';
import { DMSidebar } from '../components/layout/DMSidebar';
import { ServerSidebar } from '../components/layout/ServerSidebar';
import { UserPanel } from '../components/layout/UserPanel';
import { ChatArea } from './ChatArea';

// Modals
import { CreateServerModal } from './CreateServerModal';
import { CreateChannelModal } from './CreateChannelModal';
import { JoinServerModal } from './JoinServerModal';
import { InviteModal } from './InviteModal';
import { ServerSettingsModal } from './ServerSettingsModal';
import { CreateDMModal } from './CreateDMModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const Layout = () => {
    const { user } = useUser();

    // Global State
    const [servers, setServers] = useState([]);
    const [selectedServer, setSelectedServer] = useState(null);

    // Channel State
    const [channels, setChannels] = useState([]);
    const [selectedChannel, setSelectedChannel] = useState(null);

    // DM State
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);

    // Modal Control State
    const [modals, setModals] = useState({
        server: false,
        join: false,
        channel: false,
        invite: false,
        settings: false,
        dm: false
    });

    // Helper to toggle modals
    const toggleModal = (key, value) => setModals(prev => ({ ...prev, [key]: value }));

    // --- DATA FETCHING ---

    // 1. Fetch Servers & Sync User
    useEffect(() => {
        if (!user) return;

        // Sync User to Backend
        axios.post(`${API_URL}/api/users/sync`, {
            clerkId: user.id,
            username: user.username || user.firstName,
            email: user.primaryEmailAddress?.emailAddress,
            avatar: user.imageUrl
        }).then(res =>
             console.log('User Synced:'
             ))
            .catch(err => console.error('Failed to sync user:', err));

        axios.get(`${API_URL}/api/users/${user.id}/servers`)
            .then(res => {
                setServers(res.data);
                if (res.data.length > 0) setSelectedServer(res.data[0]);
            })
            .catch(err => console.error("Failed to fetch servers", err));
    }, [user]);

    // 2. Fetch Channels (when server changes)
    useEffect(() => {
        if (!selectedServer) {
            setChannels([]);
            setSelectedChannel(null);
            return;
        }
        axios.get(`${API_URL}/api/servers/${selectedServer._id}/channels`)
            .then(res => {
                setChannels(res.data);
                const defaultChannel = res.data.find(c => c.name === 'general') || res.data[0];
                setSelectedChannel(defaultChannel);
            })
            .catch(err => console.error("Failed to fetch channels", err));
    }, [selectedServer]);

    // 3. Fetch Conversations (when on Home)
    useEffect(() => {
        if (selectedServer) return;
        if (!user) return;
        axios.get(`${API_URL}/api/users/${user.id}/conversations`)
            .then(res => setConversations(res.data))
            .catch(err => console.error("Failed to fetch conversations", err));
    }, [selectedServer, user]);


    // --- ACTION HANDLERS ---

    const handleServerCreated = (newServer) => {
        setServers([...servers, newServer]);
        setSelectedServer(newServer);
    };

    const handleServerJoined = (server) => {
        if (!servers.find(s => s._id === server._id)) setServers([...servers, server]);
        setSelectedServer(server);
    };

    const handleDeleteServer = async () => {
        if (!selectedServer || !confirm(`Delete ${selectedServer.name}?`)) return;
        try {
            await axios.delete(`${API_URL}/api/servers/${selectedServer._id}`, { data: { userId: user.id } });
            setServers(servers.filter(s => s._id !== selectedServer._id));
            setSelectedServer(null);
        } catch (err) { alert(err.response?.data?.error || "Error"); }
    };

    const handleLeaveServer = async () => {
        if (!selectedServer || !confirm(`Leave ${selectedServer.name}?`)) return;
        try {
            await axios.post(`${API_URL}/api/servers/${selectedServer._id}/leave`, { userId: user.id });
            setServers(servers.filter(s => s._id !== selectedServer._id));
            setSelectedServer(null);
        } catch (err) { alert(err.response?.data?.error || "Error"); }
    };

    const handleDeleteChannel = async (id, name) => {
        if (!confirm(`Delete #${name}?`)) return;
        try {
            await axios.delete(`${API_URL}/api/channels/${id}`, { data: { userId: user.id } });
            setChannels(channels.filter(c => c._id !== id));
            if (selectedChannel?._id === id) setSelectedChannel(null);
        } catch (err) { alert("Error deleting channel"); }
    };

    const handleStartDM = async (targetUserId) => {
        try {
            const res = await axios.post(`${API_URL}/api/conversations`, { user1Id: user.id, user2Id: targetUserId });
            setConversations(prev => {
                if (!prev.find(c => c._id === res.data._id)) return [res.data, ...prev];
                return prev;
            });
            setSelectedServer(null);
            setSelectedConversation(res.data);
        } catch (err) { console.error(err); }
    };

    const handleDeleteConversation = async (conversationId) => {
        if (!confirm("Are you sure you want to remove this conversation?")) return;
        try {
            // Optimistic update
            const prevConversations = [...conversations];
            setConversations(conversations.filter(c => c._id !== conversationId));
            if (selectedConversation?._id === conversationId) setSelectedConversation(null);

            await axios.delete(`${API_URL}/api/conversations/${conversationId}`, { data: { userId: user.id } });
        } catch (err) {
            console.error(err);
            alert("Failed to delete conversation");
            // Revert on failure (optional, but good practice)
            // setConversations(prevConversations); 
        }
    };

    const isOwner = selectedServer && user && selectedServer.owner === user.id;

    return (
        <div className="flex h-screen w-screen overflow-hidden text-sm font-sans">

            {/* 1. Navigation Rail (Left) */}
            <NavigationRail
                servers={servers}
                selectedServer={selectedServer}
                onSelectServer={setSelectedServer}
                onOpenCreateModal={() => toggleModal('server', true)}
                onOpenJoinModal={() => toggleModal('join', true)}
            />

            {/* 2. Sidebar (Middle) - Toggles between Server and DM */}
            <div className="flex flex-col bg-[#2f3136] h-full">
                {selectedServer ? (
                    <ServerSidebar
                        server={selectedServer}
                        channels={channels}
                        selectedChannel={selectedChannel}
                        onSelectChannel={setSelectedChannel}
                        user={user}
                        isOwner={isOwner}
                        onOpenInvite={() => toggleModal('invite', true)}
                        onOpenSettings={() => toggleModal('settings', true)}
                        onOpenCreateChannel={() => toggleModal('channel', true)}
                        onDeleteServer={handleDeleteServer}
                        onLeaveServer={handleLeaveServer}
                        onDeleteChannel={handleDeleteChannel}
                    />
                ) : (
                    <DMSidebar
                        conversations={conversations}
                        selectedConversation={selectedConversation}
                        onSelect={setSelectedConversation}
                        onOpenDMModal={() => toggleModal('dm', true)}
                        currentUser={user}
                        onDelete={handleDeleteConversation}
                    />
                )}

                {/* User Panel (Bottom) */}
                <UserPanel user={user} />
            </div>

            {/* 3. Main Chat Area (Right) */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#36393f]">
                {selectedServer ? (
                    selectedChannel ? (
                        <ChatArea
                            channelId={selectedChannel._id}
                            channelName={selectedChannel.name}
                            onStartDM={handleStartDM}
                        />
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-400">
                            <div>Welcome to {selectedServer.name}. Select a channel.</div>
                        </div>
                    )
                ) : (
                    selectedConversation ? (
                        <ChatArea
                            conversationId={selectedConversation._id}
                            channelName={(() => {
                                // Calculate name safely
                                const other = selectedConversation.participants?.find(p => p._id !== user.id || p !== user.id);
                                return typeof other === 'object' ? other?.username : 'DM';
                            })()}
                            onStartDM={handleStartDM}
                        />
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-400">
                            <div>Select a conversation to start chatting.</div>
                        </div>
                    )
                )}
            </div>

            {/* 4. Modals */}
            {modals.server && <CreateServerModal onClose={() => toggleModal('server', false)} onServerCreated={handleServerCreated} />}
            {modals.join && <JoinServerModal onClose={() => toggleModal('join', false)} onServerJoined={handleServerJoined} />}
            {modals.channel && selectedServer && <CreateChannelModal serverId={selectedServer._id} categories={selectedServer.categories || []} onClose={() => toggleModal('channel', false)} onChannelCreated={(c) => { setChannels([...channels, c]); setSelectedChannel(c); }} />}
            {modals.invite && selectedServer && <InviteModal server={selectedServer} onClose={() => toggleModal('invite', false)} />}
            {modals.settings && selectedServer && <ServerSettingsModal server={selectedServer} onClose={() => toggleModal('settings', false)} onServerUpdated={(u) => { setServers(servers.map(s => s._id === u._id ? u : s)); setSelectedServer(u); }} />}
            {modals.dm && <CreateDMModal onClose={() => toggleModal('dm', false)} onConversationCreated={(c) => { setConversations([c, ...conversations]); setSelectedConversation(c); setSelectedServer(null); }} />}

        </div>
    );
};