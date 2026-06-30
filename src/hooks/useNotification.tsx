import { useCallback, useEffect, useState } from "react";
import *as _CONSULT_SERVICE from '../services/ConsultServce';
export interface NotificationItem {
    id: string;
    title: string;
    description: string;
    time: string;
    icon: any;
    iconBg: string;
    type: string;
    section: string;
    is_read: boolean;
    rawData: any;
}

const getTimeAgo = (date: string) => {
    const now = new Date();
    const created = new Date(date);

    const diff = Math.floor((now.getTime() - created.getTime()) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;

    return `${Math.floor(diff / 86400)}d ago`;
};

const getSection = (date: string) => {
    const created = new Date(date);
    const today = new Date();

    if (created.toDateString() === today.toDateString()) {
        return "today";
    }

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (created.toDateString() === yesterday.toDateString()) {
        return "yesterday";
    }

    return "older";
};

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);

            const res = await _CONSULT_SERVICE.getNotification(); // apna endpoint

            if (res?.success) {
                const data = res.data.results.map((item: any) => ({
                    id: item.id,
                    title: item.title,
                    description: item.message,
                    time: getTimeAgo(item.created_at),
                    icon:
                        item.notification_type === "appointment"
                            ? require("../assets/images/calendarNot.png")
                            : require("../assets/images/listNot.png"),
                    iconBg:
                        item.notification_type === "appointment"
                            ? "#0D614E"
                            : "#4A90E2",
                    type: item.notification_type,
                    section: getSection(item.created_at),
                    is_read: item.is_read,
                    rawData: item,
                }));

                setNotifications(data);
            }
        } catch (error) {
            console.log("Notification Error:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    return {
        notifications,
        loading,
        refreshNotifications: fetchNotifications,
    };
};