import type { NextConfig } from "next";
import withPWA from "next-pwa";

const config: NextConfig = {
  output: "export", // Required for Capacitor
  images: {
    unoptimized: true, // Required for Static Export
  },
};

const makePwa = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

export default makePwa(config);

