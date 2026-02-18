'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { X, Loader2, Camera, AlertCircle, RefreshCw } from 'lucide-react'
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from '@zxing/browser'

interface BarcodeScannerProps {
  onDetected: (code: string) => void
  onClose: () => void
}

export default function BarcodeScanner({ onDetected, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const isScanningRef = useRef(false)

  const stopScanner = useCallback(async () => {
    if (isScanningRef.current) {
      isScanningRef.current = false
      
      try {
        if (readerRef.current) {
          await readerRef.current.reset()
          readerRef.current = null
        }
      } catch (err) {
        console.error('Error stopping scanner:', err)
      }
      
      // Stop all video tracks
      try {
        const stream = videoRef.current?.srcObject as MediaStream
        if (stream) {
          stream.getTracks().forEach(track => track.stop())
        }
      } catch (err) {
        console.error('Error stopping video:', err)
      }
    }
  }, [])

  const startScanner = useCallback(async () => {
    if (!videoRef.current) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      // Check if running on HTTPS (required for camera)
      if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        setError('Camera requires HTTPS. Please use a secure connection.')
        setIsLoading(false)
        return
      }
      
      // Check browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera not supported on this browser. Please use Chrome, Safari, or Edge.')
        setIsLoading(false)
        return
      }
      
      // Configure hints for better mobile performance
      const hints = new Map()
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.CODE_128,
        BarcodeFormat.CODE_39,
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
        BarcodeFormat.QR_CODE,
        BarcodeFormat.DATA_MATRIX
      ])
      
      // Create reader
      readerRef.current = new BrowserMultiFormatReader(hints)
      
      // Get available video devices
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      
      if (videoDevices.length === 0) {
        setError('No camera found on this device.')
        setIsLoading(false)
        return
      }
      
      // Try to find back camera
      let selectedDevice = videoDevices[0]
      const backCamera = videoDevices.find(d => 
        d.label.toLowerCase().includes('back') || 
        d.label.toLowerCase().includes('rear') ||
        d.label.toLowerCase().includes('environment')
      )
      
      if (backCamera) {
        selectedDevice = backCamera
      }
      
      // Constraints for mobile
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: selectedDevice.deviceId ? { exact: selectedDevice.deviceId } : undefined,
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      }
      
      // Get media stream directly first (for better error handling)
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      
      isScanningRef.current = true
      setIsLoading(false)
      
      // Start continuous scanning
      const scanLoop = async () => {
        if (!isScanningRef.current || !videoRef.current || !readerRef.current) return
        
        try {
          const result = await readerRef.current.decodeFromVideoElement(videoRef.current)
          
          if (result && result.getText()) {
            // Stop scanning
            isScanningRef.current = false
            await stopScanner()
            
            // Call callback
            onDetected(result.getText())
            return
          }
        } catch (err) {
          // No barcode found yet, continue scanning
        }
        
        // Continue scanning
        if (isScanningRef.current) {
          requestAnimationFrame(scanLoop)
        }
      }
      
      // Start scan loop with small delay
      setTimeout(scanLoop, 500)
      
    } catch (err: any) {
      console.error('Camera error:', err)
      
      let errorMessage = 'Failed to start camera'
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = 'Camera permission denied. Please allow camera access in your browser settings and try again.'
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'Camera not found. Please ensure your device has a camera.'
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = 'Camera is in use by another app. Please close other apps and try again.'
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = 'Camera constraints not supported. Trying fallback...'
        // Retry with simpler constraints
        if (retryCount < 2) {
          setRetryCount(prev => prev + 1)
          setTimeout(startScanner, 500)
          return
        }
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      setIsLoading(false)
    }
  }, [onDetected, stopScanner, retryCount])

  useEffect(() => {
    // Small delay to let modal render
    const timeoutId = setTimeout(startScanner, 300)
    
    return () => {
      clearTimeout(timeoutId)
      stopScanner()
    }
  }, [startScanner, stopScanner])

  const handleClose = async () => {
    await stopScanner()
    onClose()
  }

  const handleRetry = () => {
    setRetryCount(0)
    startScanner()
  }

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-lg w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Camera className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Scan Barcode</h3>
              <p className="text-xs text-gray-500">Point camera at code</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            aria-label="Close scanner"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-700">{error}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleRetry}
                    className="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </button>
                  <button
                    onClick={handleClose}
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scanner Container */}
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full aspect-square bg-gray-900 rounded-xl overflow-hidden object-cover"
            style={{ minHeight: '300px' }}
          />
          
          {/* Loading Overlay */}
          {isLoading && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 rounded-xl">
              <Loader2 className="w-10 h-10 text-white animate-spin mb-3" />
              <p className="text-white font-medium">Starting camera...</p>
              <p className="text-white/70 text-sm mt-1">Please allow camera access</p>
            </div>
          )}

          {/* Scan Frame Overlay */}
          {!isLoading && !error && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-56 h-56 border-2 border-white/50 rounded-lg relative">
                  {/* Corner markers */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500 -mt-1 -ml-1" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500 -mt-1 -mr-1" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500 -mb-1 -ml-1" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500 -mb-1 -mr-1" />
                  
                  {/* Scanning line animation */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-indigo-500/50 animate-pulse" 
                       style={{ animation: 'scan 2s linear infinite' }} />
                </div>
              </div>
              <p className="absolute bottom-4 left-0 right-0 text-center text-white/80 text-sm font-medium">
                Align barcode within frame
              </p>
            </div>
          )}
        </div>

        {/* Instructions */}
        {!error && (
          <div className="mt-4 p-3 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-700 text-center">
              <span className="font-semibold">Tip:</span> Hold steady and ensure good lighting
            </p>
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
      `}</style>
    </div>
  )
}
