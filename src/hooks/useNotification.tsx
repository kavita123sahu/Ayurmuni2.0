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
    isRead: boolean;      // <-- renamed from is_read to match what the UI (card/modal) reads
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

    const fetchNotifications = useCallback(
        async (pageNo = 1, isLoadMore = false) => {
            try {
                isLoadMore ? setLoadingMore(true) : setLoading(true);

                const res = await _CONSULT_SERVICE.getNotification(buildParams(pageNo));

                if (res?.success) {
                    const data: NotificationItem[] = (res?.data?.results || []).map(
                        (item: any) => ({
                            id: item.id,
                            title: item.title,
                            description: item.message,
                            createdAt: item.created_at,
                            time: getTimeAgo(item.created_at),
                            isRead: !!item.is_read,
                            type: item.notification_type,
                            section: getSection(item.created_at),
                            icon:
                                item.notification_type === "appointment" ? (
                                    <Entypo name="calendar" size={18} color="#fff" />
                                ) : (
                                    <Fontisto name="bell" size={16} color="#fff" />
                                ),
                            iconBg:
                                item.notification_type === "appointment" ? "#0D614E" : "#64748B",
                            rawData: item,
                        })
                    );

                    setNotifications(prev => (isLoadMore ? [...prev, ...data] : data));
                    setPage(pageNo);
                    setHasMore(!!res?.data?.next);
                }
            } catch (error) {
                console.log("Notification Error:", error);
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        [buildParams]
    );

    const unreadCount = notifications.filter(x => !x.isRead).length;

    // Server already applies filter/typeFilter via buildParams, so `notifications`
    // is returned as-is. Kept as `filteredNotifications` name for drop-in compatibility.
    const filteredNotifications = notifications;

    const markAsRead = async (id: string) => {
        // Optimistic UI update first
        setNotifications(prev =>
            prev.map(item =>
                item.id === id
                    ? { ...item, isRead: true, rawData: { ...item.rawData, is_read: true } }
                    : item
            )
        );

        try {
            // NOTE: assumes _CONSULT_SERVICE.getNotification performs a GET against
            // the `notifications/` endpoint using the passed object as query params,
            // matching: notifications/?action=read&notification_id={id}
            // If ConsultServce exposes a dedicated method instead, swap this call for it.
            await _CONSULT_SERVICE.getNotification({
                action: "read",
                notification_id: id,
            });
        } catch (e) {
            console.log("Mark as read failed:", e);
            // Roll back on failure
            setNotifications(prev =>
                prev.map(item =>
                    item.id === id
                        ? { ...item, isRead: false, rawData: { ...item.rawData, is_read: false } }
                        : item
                )
            );
        }
    };

    const markAllRead = async () => {
        const unreadIds = notifications.filter(item => !item.isRead).map(item => item.id);
        if (unreadIds.length === 0) return;

        setNotifications(prev =>
            prev.map(item => ({
                ...item,
                isRead: true,
                rawData: { ...item.rawData, is_read: true },
            }))
        );

        try {
            await Promise.all(
                unreadIds.map(id =>
                    _CONSULT_SERVICE.getNotification({ action: "read", notification_id: id })
                )
            );
        } catch (e) {
            console.log("Mark all as read failed:", e);
            // Not rolling back individually here — refresh from server to resync truth.
            refreshNotifications();
        }
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    const loadMore = useCallback(() => {
        if (loadingMore || !hasMore) return;
        fetchNotifications(page + 1, true);
    }, [page, hasMore, loadingMore, fetchNotifications]);

    const refreshNotifications = useCallback(async () => {
        setPage(1);
        setHasMore(true);
        await fetchNotifications(1, false);
    }, [fetchNotifications]);

    // Refetch from the API whenever the filter or type filter changes,
    // instead of only re-filtering a stale, unread-only cached list.
    useEffect(() => {
        refreshNotifications();
    }, [filter, typeFilter]); // eslint-disable-line react-hooks/exhaustive-deps

    return {
        notifications: filteredNotifications,
        loading,
        loadingMore,
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