import type { NextConfig } from "next";
import withPWA from "next-pwa";

const isMobile = process.env.APP_BUILD_TARGET === "mobile";

const config: NextConfig = {
  output: isMobile ? "export" : undefined, // Required for Capacitor
  images: {
    unoptimized: isMobile, // Required for Static Export
  },
};

const makePwa = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

export default makePwa(config);

