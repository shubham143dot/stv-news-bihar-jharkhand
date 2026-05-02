"use client";

import React from "react";
import { ImageKitProvider as IKProvider } from "@imagekit/next";

const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;

export default function ImageKitProvider({ children }: { children: React.ReactNode }) {
  return (
    <IKProvider
      urlEndpoint={urlEndpoint}
    >
      {children}
    </IKProvider>
  );
}
