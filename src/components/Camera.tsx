/* eslint-disable @next/next/no-img-element */
"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import Navigation from "./Navigation";

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const localStream = useRef<MediaStream | null>(null);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);
  const [canSwitchCamera, setCanSwitchCamera] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);

  const [filterImageArray, setFilterImageArray] = useState<string[]>([]);
  const [filterImageIndex, setFilterImageIndex] = useState(0);

  const getStream = useCallback(() => {
    if (videoDevices.length === 0) return;
    // 選択中のデバイスを使用
    const selectedDevice = videoDevices[currentDeviceIndex];
    const constraints = {
      video: {
        deviceId: { exact: selectedDevice.deviceId },
        width: 1920,
        height: 1080,
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
        console.error("getUserMediaエラー:", error);
      });
  }, [videoDevices, currentDeviceIndex]);

  useEffect(() => {
    const updateHeight = () => {
      setViewportHeight(window.innerHeight);
    };

    window.addEventListener("resize", updateHeight);
    updateHeight(); // 初回実行

    const touchHandler = (event: TouchEvent) => {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    };
    document.addEventListener('touchstart', touchHandler, {
      passive: false
    });

    // localStorageに保存されたフィルター画像たちを取得
    if (localStorage.getItem("filter_images_v1")) {
      const data = JSON.parse(localStorage.getItem("filter_images_v1") as string);
      console.log(data, "was read from localStorage");
      setFilterImageArray(data);
    } else {
      // 初めてのときはinit
      localStorage.setItem("filter_images_v1", JSON.stringify([]));
    }

    const checkCameras = async () => {
      try {
        // まず権限リクエスト
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        for (const track of stream.getTracks()) {
          track.stop();
        }

        // デバイス一覧を取得し、OBSを含むものを除外
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(
          (device) =>
            device.kind === "videoinput"
            && device.label !== "背面デュアル広角カメラ"
          // && device.label !== "背面超広角カメラ"
          // && !device.label.includes("OBS")
        );
        setCanSwitchCamera(videoInputs.length > 1);
        setVideoDevices(videoInputs);
        if (videoInputs.length > 0) {
          // iPhone14: 前面カメラ, 背面デュアル広角カメラ, 背面超広角カメラ, 背面カメラ
          const userIndex = videoInputs.findIndex((device) =>
            /背面カメラ/i.test(device.label)
          );
          setCurrentDeviceIndex(userIndex !== -1 ? userIndex : 0);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          if (error.name === "NotAllowedError") {
            alert("カメラへのアクセスが拒否されました。使用するには許可をする必要があります。このページを再読み込みしてください。");
          } else {
            alert("カメラの取得に失敗しました。");
          }
        }
      }
    };

    checkCameras();

    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  useEffect(() => {
    getStream();
    return () => {
      if (localStream.current) {
        for (const track of localStream.current.getTracks()) {
          track.stop();
        }
      }
    };
  }, [getStream]);

  // 切替ボタン押下時処理（配列内で循環）
  const toggleCamera = () => {
    if (canSwitchCamera && videoDevices.length > 1) {
      setCurrentDeviceIndex((prev) => (prev + 1) % videoDevices.length);
    }
  };

  return (
    <div
      className="relative w-full max-w-md mx-auto overflow-hidden flex items-center justify-center"
      style={{
        maxHeight: `calc(${viewportHeight}px - env(safe-area-inset-top) - env(safe-area-inset-bottom))`,
        aspectRatio: "9/16",
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 object-cover object-center overflow-hidden z-0"
        style={{
          aspectRatio: "9/16",
          width: "100%",
          maxWidth: "100%",
        }}
      />
      {filterImageArray.length > 0 &&
        <img
          src={filterImageArray[filterImageIndex]}
          alt="sample"
          className="absolute inset-0 object-cover object-center z-10 pointer-events-none"
          style={{
            aspectRatio: "9/16",
            width: "100%",
            maxWidth: "100%",
          }}
        />}

      {videoRef.current && (
        <Navigation
          videoRef={videoRef as React.RefObject<HTMLVideoElement>}
          toggleCamera={toggleCamera}
          canSwitchCamera={canSwitchCamera}
          filterImageArray={filterImageArray}
          setFilterImageArray={setFilterImageArray}
          filterImageIndex={filterImageIndex}
          setFilterImageIndex={setFilterImageIndex}
        />
      )}
    </div>
  );
}