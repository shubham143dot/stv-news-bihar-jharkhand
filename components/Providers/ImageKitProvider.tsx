"use client";

import React from "react";
import { ImageKitProvider as IKProvider } from "@imagekit/next";

const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
// publicKey is used directly in ImageKitUploader's FormData, not here

export default function ImageKitProvider({ children }: { children: React.ReactNode }) {
  return (
    <IKProvider
      urlEndpoint={urlEndpoint}
    >
      {children}
    </IKProvider>
  );
}
