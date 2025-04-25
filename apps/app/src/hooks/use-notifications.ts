import { HeadlessService } from "@novu/headless";
import { createClient } from "@proxed/supabase/client";
import { getUserQuery } from "@proxed/supabase/queries";
import { useCallback, useEffect, useRef, useState } from "react";

export function useNotifications() {
	const supabase = createClient();
	const [isLoading, setLoading] = useState(true);
	const [notifications, setNotifications] = useState([]);
	const [subscriberId, setSubscriberId] = useState();
	const headlessServiceRef = useRef<HeadlessService>(undefined);

	const markAllMessagesAsRead = () => {
		const headlessService = headlessServiceRef.current;

		if (headlessService) {
			setNotifications((prevNotifications) =>
				prevNotifications.map((notification) => {
					return {
						...notification,
						read: true,
					};
				}),
			);

			headlessService.markAllMessagesAsRead({
				listener: () => {},
				onError: () => {},
			});
		}
	};

	const markMessageAsRead = (messageId: string) => {
		const headlessService = headlessServiceRef.current;

		if (headlessService) {
			setNotifications((prevNotifications) =>
				prevNotifications.map((notification) => {
					if (notification.id === messageId) {
						return {
							...notification,
							read: true,
						};
					}

					return notification;
				}),
			);

			headlessService.markNotificationsAsRead({
				messageId: [messageId],
				listener: (result) => {},
				onError: (error) => {},
			});
		}
	};

	const fetchNotifications = useCallback(() => {
		const headlessService = headlessServiceRef.current;

		if (headlessService) {
			headlessService.fetchNotifications({
				// biome-ignore lint/correctness/noEmptyPattern:
				listener: ({}) => {},
				onSuccess: (response) => {
					setLoading(false);
					setNotifications(response.data);
				},
			});
		}
	}, []);

	const markAllMessagesAsSeen = () => {
		const headlessService = headlessServiceRef.current;

		if (headlessService) {
			setNotifications((prevNotifications) =>
				prevNotifications.map((notification) => ({
					...notification,
					seen: true,
				})),
			);
			headlessService.markAllMessagesAsSeen({
				listener: () => {},
				onError: () => {},
			});
		}
	};

	useEffect(() => {
		async function fetchUser() {
			const {
				data: { session },
			} = await supabase.auth.getSession();

			const { data: userData } = await getUserQuery(
				supabase,
				session?.user?.id as string,
			);

			if (userData) {
				// @ts-expect-error
				setSubscriberId(`${userData.team_id}_${userData.id}`);
			}
		}

		fetchUser();
	}, [supabase]);

	useEffect(() => {
		const headlessService = headlessServiceRef.current;

		if (headlessService) {
			headlessService.listenNotificationReceive({
				listener: () => {
					fetchNotifications();
				},
			});
		}
	}, [headlessServiceRef.current]);

	useEffect(() => {
		if (subscriberId && !headlessServiceRef.current) {
			const headlessService = new HeadlessService({
				applicationIdentifier: process.env
					.NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER as string,
				subscriberId,
			});

			headlessService.initializeSession({
				listener: () => {},
				onSuccess: () => {
					headlessServiceRef.current = headlessService;
					fetchNotifications();
				},
				onError: () => {},
			});
		}
	}, [fetchNotifications, subscriberId]);

	return {
		isLoading,
		markAllMessagesAsRead,
		markMessageAsRead,
		markAllMessagesAsSeen,
		hasUnseenNotifications: notifications.some(
			(notification) => !notification.seen,
		),
		notifications,
	};
}
