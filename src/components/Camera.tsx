"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import Navigation from "./Navigation";

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const localStream = useRef<MediaStream | null>(null);
  const [cameraFacingIsUser, setCameraFacingIsUser] = useState(false);

  const getStream = useCallback((isUser: boolean) => {
    const constraints = {
      video: {
        width: 1920,
        height: 1080,
        facingMode: isUser ? "user" : { exact: "environment" },
      },
      audio: false,
    };

    // 既存のストリームを停止
    if (localStream.current) {
      for (const track of localStream.current.getVideoTracks()) {
        track.stop();
      }
    }

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        localStream.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  // マウント時と切り替え時にストリーム取得
  useEffect(() => {
    getStream(cameraFacingIsUser);
    // コンポーネントアンマウント時にストリーム停止
    return () => {
      if (localStream.current) {
        for (const track of localStream.current.getTracks()) {
          track.stop();
        }
      }
    };
  }, [cameraFacingIsUser, getStream]);

  // 切替ボタン押下時処理
  const toggleCamera = () => {
    setCameraFacingIsUser((prev) => !prev);
  };

  return (
    <div
      className="relative w-full max-w-md mx-auto overflow-hidden aspect-video"
      style={{ height: "calc(100vh - env(safe-area-inset-top))" }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 object-cover overflow-hidden max-h-screen"
          style={{
            aspectRatio: "9 / 16",
          }}
        />
      </div>
      {videoRef.current && <Navigation videoRef={videoRef as React.RefObject<HTMLVideoElement>} toggleCamera={toggleCamera}/>}
    </div>
  );
}
