import { useState } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';
import { X, Save, Trash2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const ServerSettingsModal = ({ server, onClose, onServerUpdated }) => {
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState('Overview');

    // Overview State
    const [name, setName] = useState(server.name);
    const [icon, setIcon] = useState(server.icon || '');

    // Category State
    const [newCategory, setNewCategory] = useState('');
    const [categories, setCategories] = useState(server.categories || []);

    const handleUpdateServer = async () => {
        try {
            const res = await axios.put(`${API_URL}/api/servers/${server._id}`, {
                userId: user.id,
                name,
                icon
            });
            onServerUpdated(res.data);
            alert('Server updated!');
        } catch (err) {
            console.error(err);
            alert('Failed to update');
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_URL}/api/servers/${server._id}/categories`, {
                userId: user.id,
                name: newCategory
            });
            setCategories(res.data.categories);
            setNewCategory('');
            onServerUpdated(res.data); // propagate changes up
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Failed to add category');
        }
    };

    const handleDeleteCategory = async (categoryName) => {
        if (!confirm(`Delete category "${categoryName}"? Channels will be moved to General.`)) return;
        try {
            // Encode category name to handle spaces
            const encodedName = encodeURIComponent(categoryName);
            const res = await axios.delete(`${API_URL}/api/servers/${server._id}/categories/${encodedName}`, {
                data: { userId: user.id }
            });
            setCategories(res.data.categories);
            onServerUpdated(res.data);
        } catch (err) {
            console.error(err);
            alert('Failed to delete category');
        }
    };

    return (
        <div className="fixed inset-0 bg-[#2f3136] z-50 flex text-white font-sans">
            {/* Sidebar */}
            <div className="w-[30%] bg-[#2f3136] flex justify-end p-6 pt-16">
                <div className="w-48 space-y-1">
                    <h2 className="px-2 text-xs font-bold text-gray-400 uppercase mb-2">{server.name}</h2>
                    <div
                        onClick={() => setActiveTab('Overview')}
                        className={`px-2 py-1.5 rounded cursor-pointer ${activeTab === 'Overview' ? 'bg-[#40444b] text-white' : 'text-gray-400 hover:bg-[#36393f] hover:text-gray-200'}`}
                    >
                        Overview
                    </div>
                    <div
                        onClick={() => setActiveTab('Categories')}
                        className={`px-2 py-1.5 rounded cursor-pointer ${activeTab === 'Categories' ? 'bg-[#40444b] text-white' : 'text-gray-400 hover:bg-[#36393f] hover:text-gray-200'}`}
                    >
                        Categories
                    </div>
                    {/* Add Roles tab later */}
                    <div className="h-[1px] bg-[#40444b] my-2"></div>
                    <div onClick={onClose} className="px-2 py-1.5 rounded cursor-pointer text-gray-400 hover:bg-[#36393f] hover:text-gray-200 flex justify-between items-center group">
                        <span>Exit</span>
                        <X className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 bg-[#36393f] p-16 pt-16">
                <div className="max-w-[600px]">
                    <h2 className="text-xl font-bold mb-6">{activeTab}</h2>

                    {activeTab === 'Overview' && (
                        <div className="space-y-6">
                            <div className="flex space-x-8">
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Server Name</label>
                                        <input
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-[#202225] border border-black/30 rounded p-2.5 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Icon URL</label>
                                        <input
                                            value={icon}
                                            onChange={(e) => setIcon(e.target.value)}
                                            className="w-full bg-[#202225] border border-black/30 rounded p-2.5 focus:outline-none focus:border-blue-500"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col items-center justify-center">
                                    <div className="w-24 h-24 rounded-full bg-[#202225] flex items-center justify-center overflow-hidden mb-2">
                                        {icon ? <img src={icon} className="w-full h-full object-cover" /> : <span className="text-2xl">{name.substring(0, 2)}</span>}
                                    </div>
                                    <span className="text-xs text-gray-400">Preview</span>
                                </div>
                            </div>

                            <div className="bg-[#2f3136] p-4 rounded flex justify-end">
                                <button
                                    onClick={handleUpdateServer}
                                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-medium transition-colors"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Categories' && (
                        <div className="space-y-6">
                            <div className="flex space-x-2">
                                <input
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    placeholder="New Category Name"
                                    className="flex-1 bg-[#202225] p-2.5 rounded focus:outline-none"
                                />
                                <button
                                    onClick={handleAddCategory}
                                    className="bg-blue-500 text-white px-4 rounded font-medium disabled:opacity-50"
                                    disabled={!newCategory.trim()}
                                >
                                    Add
                                </button>
                            </div>

                            <div className="space-y-2 mt-4">
                                {categories.map((cat, i) => (
                                    <div key={i} className="flex items-center justify-between bg-[#2f3136] p-3 rounded group">
                                        <span className="font-bold text-gray-300 uppercase text-xs">{cat}</span>
                                        <Trash2
                                            onClick={() => handleDeleteCategory(cat)}
                                            className="w-4 h-4 text-gray-500 hover:text-red-400 cursor-pointer"
                                        />
                                    </div>
                                ))}
                                {categories.length === 0 && <div className="text-gray-500 text-sm">No categories yet.</div>}
                            </div>
                        </div>
                    )}
                </div>

                <div onClick={onClose} className="absolute top-16 right-16 cursor-pointer">
                    <div className="border-2 border-gray-400 rounded-full p-2 flex flex-col items-center justify-center group hover:bg-gray-500/20">
                        <X className="w-6 h-6 text-gray-400 group-hover:text-white" />
                        <span className="text-[10px] font-bold text-gray-400 mt-1 group-hover:text-white">ESC</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
