import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Hash, Bell, Pin, Users, Inbox, HelpCircle } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { FaDiscord } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const ChatArea = ({ channelId, conversationId, channelName = 'general', onStartDM, socket }) => {
    const { user } = useUser();
    // Socket is now passed as a prop
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [activeProfile, setActiveProfile] = useState(null);
    const messagesEndRef = useRef(null);

    // Fetch initial messages
    useEffect(() => {
        if (!channelId && !conversationId) return;

        const fetchMessages = async () => {
            try {
                let url = '';
                if (channelId) {
                    url = `${API_URL}/api/channels/${channelId}/messages`;
                } else if (conversationId) {
                    url = `${API_URL}/api/conversations/${conversationId}/messages`;
                }
                const res = await axios.get(url);
                setMessages(res.data);
            } catch (err) {
                console.error("Failed to load messages", err);
            }
        };
        fetchMessages();
    }, [channelId, conversationId]);

    // Socket listener
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (msg) => {
            setMessages((prev) => [...prev, msg]);

            if (msg?.senderId !== user?.id) {
                try {
                    const audio = new Audio();
                    audio.play().catch(e => { });
                } catch (e) { }
            }
        };

        socket.on('new_message', handleNewMessage);
        return () => {
            socket.off('new_message', handleNewMessage);
        };
    }, [socket, user]);

    // Auto scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || !user) return;


        const messageData = {
            content: input,
            senderId: user.id || 'guest',
            senderName: user.firstName || user.username || 'Guest',
            senderAvatar: user?.imageUrl
        };

        if (channelId) messageData.channelId = channelId;
        if (conversationId) messageData.conversationId = conversationId;

        try {
            await axios.post(`${API_URL}/api/messages`, messageData);
            setInput('');
        } catch (err) {
            console.error("Failed to send message", err);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#36393f] flex-1">
            {/* Header */}
            <div className="h-12 border-b border-[#202225] flex items-center px-4 justify-between shadow-sm bg-[#36393f] z-10">
                <div className="flex items-center text-white font-bold">
                    <Hash className="w-5 h-5 text-gray-400 mr-2" />
                    {channelName}
                </div>

                <div className="flex items-center space-x-4 text-gray-400">
                    <Bell className="w-5 h-5 cursor-pointer hover:text-gray-200" />
                    <Pin className="w-5 h-5 cursor-pointer hover:text-gray-200" />
                    <Users className="w-5 h-5 cursor-pointer hover:text-gray-200" />
                    <div className="relative hidden md:block">
                        <input
                            type="text"
                            placeholder="Search"
                            className="bg-[#202225] text-sm px-2 py-1 rounded transition-all w-36 focus:w-60 text-white outline-none"
                        />
                    </div>
                    <Inbox className="w-5 h-5 cursor-pointer hover:text-gray-200" />
                    <HelpCircle className="w-5 h-5 cursor-pointer hover:text-gray-200" />
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                {messages.length === 0 && (
                    <div className="text-gray-500 text-center mt-10">
                        <Hash className="w-12 h-12 mx-auto mb-2 bg-[#2f3136] p-2 rounded-full" />
                        <p>Welcome to #{channelName}!</p>
                        <p className="text-sm">This is the start of the #{channelName} channel.</p>
                    </div>
                )}

                {messages.map((msg, i) => {
                    // Check if the message is sent by the current logged-in user
                    const isCurrentUser = msg.senderId === user?.id;

                    return (
                        <div
                            key={i}

                            className={`flex w-full ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`flex max-w-[80%] md:max-w-[70%] gap-3
                                     ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}
                                    `}
                            >
                                {/* Avatar */}
                                <img
                                    src={msg?.senderAvatar}
                                    alt="avatar"
                                    className="w-10 h-10 rounded-full hover:opacity-80 cursor-pointer flex-shrink-0 mt-1 shadow-sm"
                                    onClick={(e) => {
                                        const rect = e.target.getBoundingClientRect();
                                        // Adjust popover position based on side
                                        const xPos = isCurrentUser ? rect.left - 250 : rect.right + 10;
                                        setActiveProfile({ x: xPos, y: rect.top, user: msg });
                                    }}
                                />

                                {/* Message Content Wrapper */}
                                <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>

                                    {/* Name and Time */}
                                    <div className={`flex items-center space-x-2 mb-1 ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                                        <span
                                            className="text-white font-medium text-sm hover:underline cursor-pointer"
                                            onClick={(e) => {
                                                const rect = e.target.getBoundingClientRect();
                                                const xPos = isCurrentUser ? rect.left - 250 : rect.right + 10;
                                                setActiveProfile({ x: xPos, y: rect.top, user: msg });
                                            }}
                                        >
                                            {msg.senderName}
                                        </span>
                                        <span className="text-[10px] text-gray-400">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>

                                    {/* The Bubble */}
                                    <div
                                        className={`px-4 py-2.5 rounded-2xl text-sm md:text-[15px] leading-relaxed whitespace-pre-wrap shadow-md break-words max-w-full ${isCurrentUser
                                            ? 'bg-[#5865F2] text-white rounded-tr-none'  // Discord Blurple for Me
                                            : 'bg-[#2f3136] text-gray-100 rounded-tl-none' // Dark Gray for Others
                                            }`}
                                    >
                                        {msg.content}
                                    </div>

                                </div>

                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* User Profile Popover */}
            {activeProfile && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/50"
                        onClick={() => setActiveProfile(null)}
                    ></div>
                    <div
                        className="fixed z-50 bg-[#18191c] rounded-lg shadow-2xl w-72 overflow-hidden border border-[#202225] animate-in fade-in zoom-in-95 duration-100"
                        style={{ left: activeProfile.x, top: Math.min(activeProfile.y, window.innerHeight - 300) }}
                    >
                        <div className="h-20 bg-[#5865F2] relative">
                            <img
                                src={activeProfile.user.senderAvatar}
                                className="w-20 h-20 rounded-full border-[6px] border-[#18191c] absolute -bottom-10 left-4 bg-[#18191c]"
                            />
                        </div>
                        <div className="pt-12 p-4 bg-[#18191c]">
                            <div className="font-bold text-white text-xl">{activeProfile.user.senderName}</div>
                            <div className="text-gray-400 text-sm mb-4">#{activeProfile.user.senderId?.slice(-4)}</div>

                            <div className="border-t border-[#2f3136] my-3"></div>

                            <div className="uppercase text-xs font-bold text-gray-400 mb-2">Note</div>
                            <input
                                placeholder={`Message @${activeProfile.user.senderName}`}
                                className="w-full bg-[#202225] text-gray-200 text-sm p-2 rounded mb-2 border-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        onStartDM && onStartDM(activeProfile.user.senderId);
                                        setActiveProfile(null);
                                    }
                                }}
                            />
                        </div>
                    </div>
                </>
            )}

            {/* Input Area */}
            <div className="p-4 bg-[#36393f] flex-shrink-0">
                <form onSubmit={handleSendMessage} className="bg-[#40444b] rounded-lg p-2 flex items-center shadow-sm relative">
                    <button type="button" className="text-gray-400 hover:text-gray-200 mr-3 bg-gray-600 rounded-full p-1 h-6 w-6 flex items-center justify-center shrink-0">
                        <span className="font-bold text-xs pb-0.5">+</span>
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={`Message # ${channelName}`}
                        className="bg-transparent flex-1 text-white outline-none placeholder-gray-500 text-sm md:text-base py-1"
                    />
                    <div className="flex items-center space-x-3 ml-2 text-gray-400 shrink-0">
                        <Send className={`w-5 h-5 cursor-pointer transition-colors ${input.trim() ? 'text-[#5865F2]' : 'hover:text-white'}`} onClick={handleSendMessage} />
                    </div>
                </form>
            </div>
        </div>
    );
};