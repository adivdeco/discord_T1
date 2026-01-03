import { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';

// Components
import { NavigationRail } from './components/layout/NavigationRail';
import { DMSidebar } from './components/layout/DMSidebar';
import { ServerSidebar } from './components/layout/ServerSidebar'; // *You can extract the Server Channel list similarly*
import { UserPanel } from './components/layout/UserPanel';
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
    
    // State
    const [servers, setServers] = useState([]);
    const [selectedServer, setSelectedServer] = useState(null);
    const [channels, setChannels] = useState([]);
    const [selectedChannel, setSelectedChannel] = useState(null);
    
    // DM State
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);

    // Modal States
    const [modals, setModals] = useState({
        server: false,
        channel: false,
        join: false,
        invite: false,
        settings: false,
        dm: false
    });

    // --- DATA FETCHING (Keep your existing useEffects here) ---
    // 1. Fetch Servers
    useEffect(() => {
        if (!user) return;
        axios.get(`${API_URL}/api/users/${user.id}/servers`)
            .then(res => {
                setServers(res.data);
                if (res.data.length > 0) setSelectedServer(res.data[0]);
            })
            .catch(err => console.error(err));
    }, [user]);

    // 2. Fetch Channels (Server change)
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
            .catch(err => console.error(err));
    }, [selectedServer]);

    // 3. Fetch Conversations (Home view)
    useEffect(() => {
        if (selectedServer || !user) return;
        axios.get(`${API_URL}/api/users/${user.id}/conversations`)
            .then(res => setConversations(res.data))
            .catch(err => console.error(err));
    }, [selectedServer, user]);


    // --- HANDLERS ---
    const toggleModal = (name, value) => setModals(prev => ({ ...prev, [name]: value }));

    const handleStartDM = async (targetUserId) => {
        try {
            const res = await axios.post(`${API_URL}/api/conversations`, { user1Id: user.id, user2Id: targetUserId });
            setConversations(prev => {
                if(!prev.find(c => c._id === res.data._id)) return [res.data, ...prev];
                return prev;
            });
            setSelectedServer(null);
            setSelectedConversation(res.data);
        } catch (err) { console.error(err); }
    };

    return (
        <div className="flex h-screen w-screen overflow-hidden text-sm font-sans">
            
            {/* 1. Navigation Rail (Servers) */}
            <NavigationRail 
                servers={servers}
                selectedServer={selectedServer}
                onSelectServer={setSelectedServer}
                onOpenCreateModal={() => toggleModal('server', true)}
                onOpenJoinModal={() => toggleModal('join', true)}
            />

            {/* 2. Sidebar (Dynamic) */}
            <div className="flex flex-col bg-[#2f3136]">
                {selectedServer ? (
                    // Logic for Server Channel List would go here (or in its own component)
                    // You can keep the existing code or wrap it in <ServerSidebar />
                     <div className="w-60 flex flex-col h-full">
                        {/* ... Your Existing Server Header & Channel Mapping Code ... */}
                        {/* Reuse UserPanel at the bottom */}
                        <div className="flex-1 overflow-y-auto">
                             {/* ... map channels ... */}
                        </div>
                        <UserPanel user={user} />
                     </div>
                ) : (
                    // DM Sidebar
                    <div className="flex flex-col h-full">
                        <DMSidebar 
                            conversations={conversations}
                            selectedConversation={selectedConversation}
                            onSelect={setSelectedConversation}
                            onOpenDMModal={() => toggleModal('dm', true)}
                            currentUser={user}
                        />
                        <UserPanel user={user} />
                    </div>
                )}
            </div>

            {/* 3. Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#36393f]">
                {selectedServer && selectedChannel ? (
                    <ChatArea 
                        channelId={selectedChannel._id} 
                        channelName={selectedChannel.name} 
                        onStartDM={handleStartDM}
                    />
                ) : !selectedServer && selectedConversation ? (
                     <ChatArea 
                        conversationId={selectedConversation._id} 
                        channelName={selectedConversation.participants.find(p => p._id !== user.id)?.username || 'DM'}
                        onStartDM={handleStartDM}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                        <p>Select a location to start chatting.</p>
                    </div>
                )}
            </div>

            {/* Modals rendered conditionally here... */}
            {modals.server && <CreateServerModal onClose={() => toggleModal('server', false)} onServerCreated={/*...*/ null} />}
            {/* ... other modals ... */}
        </div>
    );
};