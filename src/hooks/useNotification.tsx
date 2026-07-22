// import { useCallback, useEffect, useState } from "react";
// import * as _CONSULT_SERVICE from "../services/ConsultServce";
// import { Entypo, Fontisto } from "../common/Vector";

// export interface NotificationItem {
//     id: string;

//     title: string;

//     description: string;

//     time: string;

//     createdAt: string;

//     icon: React.ReactNode;

//     iconBg: string;

//     type: string;

//     section: string;

//     is_read: boolean;

//     rawData: any;
// }

// const getTimeAgo = (date: string) => {
//     const now = new Date();
//     const created = new Date(date);

//     const diff = Math.floor((now.getTime() - created.getTime()) / 1000);

//     if (diff < 60) return "Just now";
//     if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
//     if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;

//     return `${Math.floor(diff / 86400)}d ago`;
// };

// const getSection = (date: string) => {
//     const created = new Date(date);
//     const today = new Date();

//     if (created.toDateString() === today.toDateString()) return "today";

//     const yesterday = new Date();
//     yesterday.setDate(today.getDate() - 1);

//     if (created.toDateString() === yesterday.toDateString()) {
//         return "yesterday";
//     }

//     return "older";
// };

// export const useNotifications = () => {
//     const [notifications, setNotifications] = useState<NotificationItem[]>([]);
//     const [loading, setLoading] = useState(false);
//     const [loadingMore, setLoadingMore] = useState(false);

//     const [page, setPage] = useState(1);
//     const [hasMore, setHasMore] = useState(true);

//     const [filter, setFilter] =
//         useState<"all" | "read" | "unread">("all");

//     const [typeFilter, setTypeFilter] =
//         useState<string>("all");


//     const fetchNotifications = useCallback(
//         async (pageNo = 1, isLoadMore = false) => {
//             try {
//                 if (isLoadMore) {
//                     setLoadingMore(true);
//                 } else {
//                     setLoading(true);
//                 }

//                 const res = await _CONSULT_SERVICE.getNotification({
//                     page: pageNo,
//                     // page_size: 10,
//                     view: "list",
//                     is_read: false,
//                     notification_type: "appointment",
//                 });

//                 if (res?.success) {
//                     const data: NotificationItem[] =
//                         (res?.data?.results || []).map((item: any) => ({

//                             id: item.id,

//                             title: item.title,

//                             description: item.message,

//                             createdAt: item.created_at,

//                             time: getTimeAgo(item.created_at),

//                             is_read: item.is_read,

//                             type: item.notification_type,

//                             section: getSection(item.created_at),

//                             icon:
//                                 item.notification_type === "appointment"
//                                     ?
//                                     <Entypo
//                                         name="calendar"
//                                         size={18}
//                                         color="#fff"
//                                     />
//                                     :
//                                     <Fontisto
//                                         name="bell"
//                                         size={16}
//                                         color="#fff"
//                                     />,

//                             iconBg:
//                                 item.notification_type === "appointment"
//                                     ?
//                                     "#0D614E"
//                                     :
//                                     "#64748B",

//                             rawData: item

//                         }));

//                     if (isLoadMore) {
//                         setNotifications(prev => [...prev, ...data]);
//                     } else {
//                         setNotifications(data);
//                     }

//                     setPage(pageNo);
//                     setHasMore(!!res?.data?.next);
//                 }
//             } catch (error) {
//                 console.log("Notification Error:", error);
//             } finally {
//                 setLoading(false);
//                 setLoadingMore(false);
//             }
//         },
//         []
//     );
//     const unreadCount = notifications.filter(
//         x => !x.is_read
//     ).length;

//     const filteredNotifications = notifications.filter(item => {

//         const readPass =

//             filter === "all"

//             ||

//             (filter === "read" && item.is_read)

//             ||

//             (filter === "unread" && !item.is_read);

//         const typePass =

//             typeFilter === "all"

//             ||

//             item.type === typeFilter;

//         return readPass && typePass;

//     });

//     const markAsRead = async (id: string) => {

//         try {

//             // await API

//             setNotifications(prev =>

//                 prev.map(item =>

//                     item.id === id

//                         ?

//                         {
//                             ...item,

//                             is_read: true
//                         }

//                         :

//                         item

//                 )

//             );

//         }

//         catch (e) { }

//     }

//     const markAllRead = () => {

//         setNotifications(prev =>

//             prev.map(item =>

//             ({
//                 ...item,

//                 is_read: true
//             })

//             )

//         );

//     }

//     const clearNotifications = () => {

//         setNotifications([]);

//     }

//     const loadMore = useCallback(() => {
//         if (loadingMore || !hasMore) return;

//         fetchNotifications(page + 1, true);
//     }, [page, hasMore, loadingMore, fetchNotifications]);

//     const refreshNotifications = useCallback(async () => {
//         setPage(1);
//         setHasMore(true);
//         await fetchNotifications(1, false);
//     }, [fetchNotifications]);

//     useEffect(() => {
//         fetchNotifications(1);
//     }, [fetchNotifications]);

//     return {
//         notifications: filteredNotifications,

//         loading,

//         loadingMore,

//         unreadCount,

//         filter,

//         typeFilter,

//         setFilter,

//         setTypeFilter,

//         loadMore,

//         refreshNotifications,

//         markAsRead,

//         markAllRead,

//         clearNotifications
//     };
// };

import { useCallback, useEffect, useState } from "react";
import * as _CONSULT_SERVICE from "../services/ConsultServce";
import { Entypo, Fontisto } from "../common/Vector";

export interface NotificationItem {
    id: string;
    title: string;
    description: string;
    time: string;
    createdAt: string;
    icon: React.ReactNode;
    iconBg: string;
    type: string;
    section: string;
    isRead: boolean;
    isNew?: boolean;
    notificationType?: string;
    eventType?: string;
    appointmentStatus?: string;
    patientName?: string;
    doctorName?: string;
    reason?: string;
    appointmentId?: string;
    rawData: any;
}

const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isLikelyId = (value?: string | null): boolean => {
    if (!value || typeof value !== "string") return false;
    const trimmed = value.trim();
    return UUID_REGEX.test(trimmed) || /^\d+$/.test(trimmed);
};

const formatLabel = (value?: string): string | undefined => {
    if (!value || isLikelyId(value)) return undefined;
    return value
        .split(/[._-]/)
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};

const resolveNotificationContent = (item: any) => {
    const data = item?.data ?? {};
    let title = String(item.title ?? "").trim();
    let description = String(item.message ?? item.body ?? "").trim();

    if (isLikelyId(title)) title = "";
    if (isLikelyId(description)) description = "";

    const notificationType = formatLabel(item.notification_type) ?? item.notification_type;

    if (!title) {
        if (data.doctor_name) {
            title = `Appointment with ${data.doctor_name}`;
        } else if (notificationType) {
            title = notificationType;
        } else {
            title = "Notification";
        }
    }

    if (!description || description === title) {
        const parts: string[] = [];
        if (data.patient_name) parts.push(`Patient: ${data.patient_name}`);
        if (data.doctor_name && !title.includes(data.doctor_name)) {
            parts.push(`Doctor: ${data.doctor_name}`);
        }
        if (data.reason) parts.push(String(data.reason));
        if (data.appointment_date || data.date) {
            parts.push(`Date: ${data.appointment_date ?? data.date}`);
        }
        if (parts.length > 0) {
            description = parts.join(" · ");
        } else if (!description) {
            description = title;
        }
    }

    return {
        title,
        description,
        notificationType,
        eventType: formatLabel(item.event_type),
        patientName: data.patient_name,
        doctorName: data.doctor_name,
        reason: data.reason,
        appointmentStatus: data.appointment_status,
        appointmentId: data.appointment_id ?? data.id,
    };
};

const getTimeAgo = (date: string) => {
    if (!date) return "";
    const now = new Date();
    const created = new Date(date);
    if (Number.isNaN(created.getTime())) return "";
    const diff = Math.floor((now.getTime() - created.getTime()) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

const getSection = (date: string) => {
    const created = new Date(date);
    const today = new Date();

    if (created.toDateString() === today.toDateString()) return "today";

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (created.toDateString() === yesterday.toDateString()) return "yesterday";

    return "older";
};

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const [filter, setFilter] = useState<"all" | "read" | "unread">("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");

    // Build API params from the currently selected filter/typeFilter instead of
    // hardcoding is_read:false — otherwise switching tabs never re-queries the server.
    const buildParams = useCallback(
        (pageNo: number) => {
            const params: Record<string, any> = {
                page: pageNo,
                view: "list",
            };

            if (filter === "read") params.is_read = true;
            if (filter === "unread") params.is_read = false;
            // filter === "all" -> omit is_read so the API returns everything

            if (typeFilter !== "all") params.notification_type = typeFilter;

            return params;
        },
        [filter, typeFilter]
    );

    const mapNotification = (item: any): NotificationItem => {
        const content = resolveNotificationContent(item);
        const isRead = !!item.is_read;

        return {
            id: String(item.id),
            title: content.title,
            description: content.description,
            createdAt: item.created_at,
            time: getTimeAgo(item.created_at),
            isRead,
            isNew: !isRead,
            type: item.notification_type,
            notificationType: content.notificationType,
            eventType: content.eventType,
            patientName: content.patientName,
            doctorName: content.doctorName,
            reason: content.reason,
            appointmentStatus: content.appointmentStatus,
            appointmentId: content.appointmentId,
            section: getSection(item.created_at),
            icon:
                item.notification_type === "appointment" ? (
                    <Entypo name="calendar" size={18} color="#fff" />
                ) : (
                    <Fontisto name="bell" size={16} color="#fff" />
                ),
            iconBg: item.notification_type === "appointment" ? "#0D614E" : "#64748B",
            rawData: item,
        };
    };

    const fetchUnreadCount = useCallback(async () => {
        try {
            const res = await _CONSULT_SERVICE.getNotification({ view: "unread_count" });
            if (res?.success) {
                const count =
                    res?.data?.unread_count ??
                    res?.unread_count ??
                    res?.data?.count ??
                    0;
                setUnreadCount(Number(count) || 0);
            }
        } catch (error) {
            console.log("Unread count error:", error);
        }
    }, []);

    const fetchNotifications = useCallback(
        async (
            pageNo = 1,
            options: { isLoadMore?: boolean; isRefresh?: boolean } = {},
        ) => {
            const { isLoadMore = false, isRefresh = false } = options;

            try {
                if (isLoadMore) {
                    setLoadingMore(true);
                } else if (!isRefresh) {
                    setLoading(true);
                }

                const res = await _CONSULT_SERVICE.getNotification(buildParams(pageNo));

                if (res?.success) {
                    const results = res?.data?.results ?? res?.results ?? [];
                    const data: NotificationItem[] = results
                        .map(mapNotification)
                        .filter(
                            (item: NotificationItem) =>
                                item.id && item.title && item.description && !isLikelyId(item.title),
                        );

                    setNotifications(prev => (isLoadMore ? [...prev, ...data] : data));
                    setPage(pageNo);
                    setHasMore(!!(res?.data?.next ?? res?.next));
                }
            } catch (error) {
                console.log("Notification Error:", error);
            } finally {
                if (isLoadMore) {
                    setLoadingMore(false);
                } else if (!isRefresh) {
                    setLoading(false);
                }
            }
        },
        [buildParams],
    );

    // Server already applies filter/typeFilter via buildParams, so `notifications`
    // is returned as-is. Kept as `filteredNotifications` name for drop-in compatibility.
    const filteredNotifications = notifications;

    const markAsRead = useCallback(
        async (id: string) => {
            let snapshot: NotificationItem[] = [];
            let wasUnread = false;

            setNotifications(prev => {
                snapshot = prev;
                const target = prev.find(item => item.id === id);
                wasUnread = !!target && !target.isRead;

                if (filter === "unread") {
                    return prev.filter(item => item.id !== id);
                }

                return prev.map(item =>
                    item.id === id
                        ? {
                              ...item,
                              isRead: true,
                              isNew: false,
                              rawData: { ...item.rawData, is_read: true },
                          }
                        : item,
                );
            });

            if (wasUnread) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }

            try {
                const res = await _CONSULT_SERVICE.manageNotification({
                    action: "read",
                    notification_id: id,
                });
                if (!res?.success) {
                    throw new Error(res?.message || "Mark as read failed");
                }
                await fetchUnreadCount();
            } catch (e) {
                console.log("Mark as read failed:", e);
                setNotifications(snapshot);
                await fetchUnreadCount();
            }
        },
        [filter, fetchUnreadCount],
    );

    const markAllRead = async () => {
        if (unreadCount === 0) return;

        const previous = notifications;
        setNotifications(prev =>
            filter === "unread"
                ? []
                : prev.map(item => ({
                      ...item,
                      isRead: true,
                      isNew: false,
                      rawData: { ...item.rawData, is_read: true },
                  }))
        );
        setUnreadCount(0);

        try {
            const res = await _CONSULT_SERVICE.manageNotification({
                action: "read",
                all: true,
            });
            if (!res?.success) {
                throw new Error(res?.message || "Mark all as read failed");
            }
            await fetchUnreadCount();
            if (filter === "unread") {
                setNotifications([]);
            }
        } catch (e) {
            console.log("Mark all as read failed:", e);
            setNotifications(previous);
            await refreshNotifications();
            await fetchUnreadCount();
        }
    };

    const clearNotifications = async () => {
        try {
            const res = await _CONSULT_SERVICE.manageNotification({
                action: "clear",
                all: true,
            });
            if (!res?.success) {
                throw new Error(res?.message || "Clear notifications failed");
            }
            setNotifications([]);
            setUnreadCount(0);
        } catch (e) {
            console.log("Clear notifications failed:", e);
        }
    };

    const loadMore = useCallback(() => {
        if (loadingMore || !hasMore) return;
        fetchNotifications(page + 1, { isLoadMore: true });
    }, [page, hasMore, loadingMore, fetchNotifications]);

    const refreshNotifications = useCallback(async () => {
        setPage(1);
        setHasMore(true);
        setRefreshing(true);
        try {
            await fetchNotifications(1, { isRefresh: true });
        } finally {
            setRefreshing(false);
        }
    }, [fetchNotifications]);

    useEffect(() => {
        fetchNotifications(1);
    }, [filter, typeFilter]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        fetchUnreadCount();
    }, [fetchUnreadCount]);

    return {
        notifications: filteredNotifications,
        loading,
        loadingMore,
        refreshing,
        unreadCount,
        filter,
        typeFilter,
        setFilter,
        setTypeFilter,
        loadMore,
        refreshNotifications,
        markAsRead,
        markAllRead,
        clearNotifications,
    };
};