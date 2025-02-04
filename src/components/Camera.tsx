"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import Navigation from "./Navigation";

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const localStream = useRef<MediaStream | null>(null);
  const [cameraFacingIsUser, setCameraFacingIsUser] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [canSwitchCamera, setCanSwitchCamera] = useState(false);

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
          setIsCameraReady(true);
        }
      })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .catch((error) => {
        if (!isUser) {
          console.warn("外カメラが利用できないため、カメラをuserモードに切替");
          getStream(true);
        }
      });
  }, []);

  useEffect(() => {
    const checkCameras = async () => {
      try {
        // まず権限をリクエスト
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        for (const track of stream.getTracks()) {
          track.stop();
        }

        // その後デバイス一覧を取得
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(device => device.kind === "videoinput" && !device.label.includes("OBS"));
        setCanSwitchCamera(videoInputs.length > 1);
      } catch (error) {
        console.error("カメラの取得に失敗しました", error);
      }
    };

    checkCameras();
    getStream(cameraFacingIsUser);

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
    if (canSwitchCamera) {
      setCameraFacingIsUser(prev => !prev);
    }
  };

  return (
    <>
      <div
        className="relative w-full mx-auto overflow-y-hidden aspect-video"
        style={{ height: "calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))" }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 object-cover"
          style={{
            height: "calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))",
            aspectRatio: "9 / 16",
          }}
        />

      </div>
      {isCameraReady && videoRef.current && (
        <Navigation
          videoRef={videoRef as React.RefObject<HTMLVideoElement>}
          toggleCamera={toggleCamera}
          canSwitchCamera={canSwitchCamera}
        />
      )}
    </>
  );
}