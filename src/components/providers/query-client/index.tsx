"use client";

import {
	MutationCache,
	QueryCache,
	QueryClient,
	QueryClientProvider as ReactQueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AxiosError } from "axios";
import { type PropsWithChildren, useRef } from "react";
import { QueryClientHandleError } from "@/lib/errors";

function QueryClientProvider(props: PropsWithChildren) {
	const { children } = props;
	const queryClientRef = useRef(
		new QueryClient({
			defaultOptions: {
				queries: {
					staleTime: 1000 * 60 * 5,
					refetchOnWindowFocus: false,
					refetchOnMount: false,
					gcTime: 1000 * 60 * 6,
					retry(failureCount, error) {
						if (error instanceof AxiosError) {
							if (error.response?.status === 401) {
								return false;
							}
						}
						if (failureCount > 3) return false;
						return true;
					},
				},
			},
			queryCache: new QueryCache({
				onSuccess(data) {
					if (
						data &&
						typeof data === "object" &&
						"success" in data &&
						!data.success
					) {
						QueryClientHandleError(data);
					}
					return data;
				},
				onError: async (err) => {
					if (err instanceof AxiosError) {
						if (err.response?.status === 401) {
							// TODO: add logout action
							console.log("Logout here");
						}
					}
				},
			}),
			mutationCache: new MutationCache({
				onSuccess(data) {
					if (
						data &&
						typeof data === "object" &&
						"success" in data &&
						!data.success
					) {
						QueryClientHandleError(data);
					}
					return data;
				},
				onError: (err) => {
					if (err instanceof AxiosError) {
						if (err.response?.status === 401) {
							// TODO: add logout action
							console.log("Logout here");
						}
					}
				},
			}),
		}),
	);
	return (
		<ReactQueryClientProvider client={queryClientRef.current}>
			{children}
			<ReactQueryDevtools initialIsOpen={false} />
		</ReactQueryClientProvider>
	);
}
export default QueryClientProvider;
