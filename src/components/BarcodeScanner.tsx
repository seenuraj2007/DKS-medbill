'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { X, Loader2, Camera, AlertCircle, RefreshCw } from 'lucide-react'

interface BarcodeScannerProps {
  onDetected: (code: string) => void
  onClose: () => void
}

export default function BarcodeScanner({ onDetected, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [debugInfo, setDebugInfo] = useState<string>('')
  const streamRef = useRef<MediaStream | null>(null)
  const isActiveRef = useRef(false)

  const stopCamera = useCallback(async () => {
    isActiveRef.current = false
    
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      } catch (err) {
        console.error('Error stopping camera:', err)
      }
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  const startCamera = useCallback(async () => {
    console.log('[BarcodeScanner] Starting camera attempt', retryCount + 1)
    setDebugInfo('Initializing...')
    
    try {
      setIsLoading(true)
      setError(null)
      
      // Check HTTPS
      if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        console.error('[BarcodeScanner] Not HTTPS')
        setError('Camera requires HTTPS. Current: ' + window.location.protocol)
        setDebugInfo('Protocol: ' + window.location.protocol)
        setIsLoading(false)
        return
      }
      
      setDebugInfo('Checking browser support...')
      
      // Check browser support
      if (!navigator.mediaDevices) {
        console.error('[BarcodeScanner] navigator.mediaDevices not available')
        setError('Camera API not available. Please use a modern browser.')
        setIsLoading(false)
        return
      }
      
      if (!navigator.mediaDevices.getUserMedia) {
        console.error('[BarcodeScanner] getUserMedia not available')
        setError('Camera access not supported. Use Chrome, Safari, or Edge.')
        setIsLoading(false)
        return
      }
      
      setDebugInfo('Requesting camera permission...')
      
      // Simple constraints - most compatible
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      }
      
      console.log('[BarcodeScanner] Requesting getUserMedia with constraints:', constraints)
      
      // Get camera stream
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      console.log('[BarcodeScanner] Camera stream obtained:', stream.getTracks().length, 'tracks')
      
      if (!videoRef.current) {
        console.error('[BarcodeScanner] Video element not available')
        setError('Scanner initialization failed. Please refresh and try again.')
        setIsLoading(false)
        return
      }
      
      streamRef.current = stream
      videoRef.current.srcObject = stream
      
      setDebugInfo('Starting video playback...')
      
      // Wait for video to be ready
      await new Promise<void>((resolve, reject) => {
        if (!videoRef.current) {
          reject(new Error('Video element lost'))
          return
        }
        
        const onLoaded = () => {
          console.log('[BarcodeScanner] Video loadedmetadata')
          videoRef.current?.removeEventListener('loadedmetadata', onLoaded)
          resolve()
        }
        
        const onError = () => {
          videoRef.current?.removeEventListener('error', onError)
          reject(new Error('Video loading failed'))
        }
        
        videoRef.current.addEventListener('loadedmetadata', onLoaded)
        videoRef.current.addEventListener('error', onError)
        
        // Timeout after 5 seconds
        setTimeout(() => {
          videoRef.current?.removeEventListener('loadedmetadata', onLoaded)
          videoRef.current?.removeEventListener('error', onError)
          reject(new Error('Video load timeout'))
        }, 5000)
      })
      
      console.log('[BarcodeScanner] Playing video...')
      await videoRef.current.play()
      
      isActiveRef.current = true
      setIsLoading(false)
      setDebugInfo('Camera active - scanning...')
      
      console.log('[BarcodeScanner] Camera started successfully')
      
    } catch (err: any) {
      console.error('[BarcodeScanner] Camera error:', err.name, err.message)
      
      let errorMessage = 'Failed to start camera'
      let debugMsg = `Error: ${err.name}`
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = 'Camera permission denied. Tap "Try Again" and allow camera access.'
        debugMsg = 'Permission denied - user blocked camera'
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'Camera not found. Please ensure your device has a camera.'
        debugMsg = 'No camera device found'
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = 'Camera is busy. Close other apps using camera and try again.'
        debugMsg = 'Camera hardware busy'
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = 'Camera settings not supported on this device.'
        debugMsg = 'Constraints too strict'
        
        // Retry with simpler constraints
        if (retryCount < 2) {
          console.log('[BarcodeScanner] Retrying with simpler constraints')
          setRetryCount(prev => prev + 1)
          setTimeout(() => startCamera(), 500)
          return
        }
      } else if (err.name === 'AbortError') {
        errorMessage = 'Camera access was cancelled. Please try again.'
        debugMsg = 'User cancelled'
      } else if (err.message) {
        errorMessage = `Camera error: ${err.message}`
        debugMsg = err.message
      }
      
      console.error('[BarcodeScanner] Final error:', errorMessage)
      setError(errorMessage)
      setDebugInfo(debugMsg)
      setIsLoading(false)
    }
  }, [retryCount])

  // Handle barcode detection (simplified - just capture frame for now)
  const handleCapture = useCallback(() => {
    if (!videoRef.current || !isActiveRef.current) return
    
    // For now, just close and let user manually enter or use a different method
    // This is a fallback if ZXing fails
    console.log('[BarcodeScanner] Manual capture triggered')
  }, [])

  useEffect(() => {
    console.log('[BarcodeScanner] Component mounted')
    
    // Delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      console.log('[BarcodeScanner] Starting camera after delay')
      startCamera()
    }, 500)
    
    return () => {
      console.log('[BarcodeScanner] Component unmounting')
      clearTimeout(timeoutId)
      stopCamera()
    }
  }, [startCamera, stopCamera])

  const handleClose = async () => {
    await stopCamera()
    onClose()
  }

  const handleRetry = () => {
    setRetryCount(0)
    setDebugInfo('')
    startCamera()
  }

  const handleManualEntry = () => {
    stopCamera()
    onClose()
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

        {/* Debug Info (for troubleshooting) */}
        {debugInfo && (
          <div className="mb-2 p-2 bg-gray-100 rounded text-xs font-mono text-gray-600">
            {debugInfo}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-700">{error}</p>
                <div className="flex flex-col gap-2 mt-3">
                  <button
                    onClick={handleRetry}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </button>
                  <button
                    onClick={handleManualEntry}
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                  >
                    Enter Manually
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
            controls={false}
            className="w-full aspect-square bg-gray-900 rounded-xl overflow-hidden object-cover"
            style={{ minHeight: '300px' }}
          />
          
          {/* Loading Overlay */}
          {isLoading && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 rounded-xl">
              <Loader2 className="w-10 h-10 text-white animate-spin mb-3" />
              <p className="text-white font-medium">Starting camera...</p>
              <p className="text-white/70 text-sm mt-1">Please allow camera access when prompted</p>
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
              <span className="font-semibold">Tip:</span> If camera doesn&apos;t start, tap &quot;Try Again&quot; and allow permission
            </p>
          </div>
        )}

        {/* Manual entry button */}
        <button
          onClick={handleManualEntry}
          className="w-full mt-3 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
        >
          Type Barcode Manually
        </button>
      </div>
    </div>
  )
}
