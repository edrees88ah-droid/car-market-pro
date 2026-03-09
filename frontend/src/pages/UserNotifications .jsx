// pages/UserNotifications.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserNotifications = ({ userId }) => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        axios.get(`http://localhost:5000/api/notifications/my-notifications/${userId}`)
            .then(res => setNotifications(res.data));
    }, [userId]);

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">الإشعارات 🔔</h2>
            <div className="space-y-3">
                {notifications.map(notif => (
                    <div key={notif.id} className={`p-4 rounded-lg shadow border-l-4 ${notif.is_read ? 'bg-gray-50 border-gray-400' : 'bg-blue-50 border-blue-600'}`}>
                        <h4 className="font-bold text-lg">{notif.title}</h4>
                        <p className="text-gray-700">{notif.message}</p>
                        <span className="text-xs text-gray-500 italic">
                            {new Date(notif.created_at).toLocaleString('ar-EG')}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserNotifications;