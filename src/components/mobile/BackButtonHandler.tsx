"use client";

import { useEffect, useRef } from "react";
import { App } from "@capacitor/app";
import { useRouter, usePathname } from "next/navigation";

export function BackButtonHandler() {
    const router = useRouter();
    const pathname = usePathname();
    const pathnameRef = useRef(pathname);

    // Keep ref updated with latest pathname without triggering re-subscription
    useEffect(() => {
        pathnameRef.current = pathname;
    }, [pathname]);

    useEffect(() => {
        let listenerHandle: any;

        const setupListener = async () => {
            try {
                listenerHandle = await App.addListener("backButton", (data) => {
                    const currentPath = pathnameRef.current;

                    if (currentPath === "/") {
                        // On Home screen, exit the app
                        App.exitApp();
                    } else {
                        // On other screens, go back
                        // data.canGoBack is often unreliable in SPAs, so we rely on path
                        router.back();
                    }
                });
            } catch (err) {
                console.warn("BackButtonHandler: Failed to add listener (probably web env)", err);
            }
        };

        setupListener();

        return () => {
            if (listenerHandle) {
                listenerHandle.remove();
            }
        };
    }, [router]);

    return null;
}
