import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function dataURLtoFile(dataurl: string, filename: string): File {
  const arr = dataurl.split(",")
  const mime = arr[0].match(/:(.*?);/)?.[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }

  return new File([u8arr], filename, { type: mime })
}

export async function getWebcamStream(): Promise<MediaStream> {
  try {
    // First, check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Camera access is not supported in this browser")
    }

    // Request camera permissions with specific constraints
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 },
        facingMode: "user",
        frameRate: { ideal: 30 },
      },
      audio: false,
    })

    return stream
  } catch (error: any) {
    console.error("Error accessing webcam:", error)

    // Provide more specific error messages
    if (error.name === "NotAllowedError") {
      throw new Error("Camera access denied. Please allow camera permissions and try again.")
    } else if (error.name === "NotFoundError") {
      throw new Error("No camera found. Please connect a camera and try again.")
    } else if (error.name === "NotReadableError") {
      throw new Error("Camera is already in use by another application.")
    } else {
      throw new Error("Failed to access camera. Please check your camera settings.")
    }
  }
}

export function captureImageFromVideo(videoElement: HTMLVideoElement): string {
  const canvas = document.createElement("canvas")
  canvas.width = videoElement.videoWidth || 640
  canvas.height = videoElement.videoHeight || 480
  const ctx = canvas.getContext("2d")

  if (ctx && videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL("image/jpeg", 0.8)
  }

  throw new Error("Failed to capture image from video")
}

export function stopMediaStream(stream: MediaStream | null) {
  if (stream) {
    stream.getTracks().forEach((track) => {
      track.stop()
    })
  }
}
