import { useState } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';
import { X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const CreateServerModal = ({ onClose, onServerCreated }) => {
    const { user } = useUser();
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        try {
            const res = await axios.post(`${API_URL}/api/servers`, {
                name,
                ownerId: user.id || 'guest',
                ownerName: user.firstName || 'Guest'
            });
            onServerCreated(res.data);
            onClose();
        } catch (err) {
            console.error('Failed to create server', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white text-gray-900 rounded-lg w-96 p-6 relative shadow-xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                    <X className="w-6 h-6" />
                </button>

                <h2 className="text-2xl font-bold text-center mb-2">Create Your Server</h2>
                <p className="text-gray-500 text-center mb-6">Give your new server a personality with a name and an icon.</p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Server Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-gray-200 border-none rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="My awesome server"
                            autoFocus
                        />
                    </div>

                    <div className="flex justify-between items-center mt-8 bg-gray-100 -m-6 p-4 rounded-b-lg">
                        <button type="button" onClick={onClose} className="text-gray-600 hover:underline">Back</button>
                        <button
                            type="submit"
                            disabled={isLoading || !name.trim()}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded shadow transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
