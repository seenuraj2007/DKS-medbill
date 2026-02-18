'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { X, Loader2, Camera, AlertCircle } from 'lucide-react'
import './BarcodeScanner.css'

interface BarcodeScannerProps {
  onDetected: (code: string) => void
  onClose: () => void
}

export default function BarcodeScanner({ onDetected, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerId = 'barcode-scanner-container'
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState(false)
  const isScanningRef = useRef(false)

  const stopScanner = useCallback(async () => {
    if (scannerRef.current && isScanningRef.current) {
      try {
        isScanningRef.current = false
        await scannerRef.current.stop()
        scannerRef.current = null
      } catch (err) {
        console.error('Error stopping scanner:', err)
      }
    }
  }, [])

  const handleDetected = useCallback(async (decodedText: string) => {
    if (!isScanningRef.current) return
    
    // Stop scanner immediately before anything else
    isScanningRef.current = false
    await stopScanner()
    
    // Small delay to ensure cleanup is complete
    setTimeout(() => {
      onDetected(decodedText)
    }, 100)
  }, [onDetected, stopScanner])

  useEffect(() => {
    let isMounted = true

    const startScanner = async () => {
      try {
        // Check if camera is available
        const devices = await Html5Qrcode.getCameras()
        
        if (!isMounted) return
        
        if (devices && devices.length === 0) {
          setError('No camera found on this device')
          setIsLoading(false)
          return
        }

        // Check camera permission
        try {
          await navigator.mediaDevices.getUserMedia({ video: true })
          if (!isMounted) return
          setHasPermission(true)
        } catch (permErr) {
          if (!isMounted) return
          setError('Camera permission denied. Please allow camera access and try again.')
          setIsLoading(false)
          return
        }

        // Create scanner instance
        if (!isMounted) return
        
        scannerRef.current = new Html5Qrcode(containerId)
        isScanningRef.current = true
        
        // Find back camera for mobile
        let cameraId: string | { facingMode: string } = { facingMode: 'environment' }
        if (devices && devices.length > 0) {
          const backCamera = devices.find(d => 
            d.label.toLowerCase().includes('back') || 
            d.label.toLowerCase().includes('rear') ||
            d.label.toLowerCase().includes('environment')
          )
          if (backCamera) {
            cameraId = backCamera.id
          }
        }

        // Mobile-optimized config
        const config = {
          fps: 5, // Lower FPS for mobile performance
          qrbox: { width: 200, height: 200 }, // Smaller scan area
          aspectRatio: 1.0,
          disableFlip: false
        }

        await scannerRef.current.start(
          cameraId as any,
          config,
          (decodedText) => {
            if (isMounted && isScanningRef.current) {
              handleDetected(decodedText)
            }
          },
          () => {
            // QR code scan error - ignore continuous scanning errors
          }
        )

        if (isMounted) {
          setIsLoading(false)
        }
      } catch (err: any) {
        console.error('Scanner error:', err)
        if (isMounted) {
          setError(err.message || 'Failed to start camera scanner')
          setIsLoading(false)
        }
      }
    }

    // Small delay to let modal render first
    const timeoutId = setTimeout(startScanner, 300)

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
      stopScanner()
    }
  }, [handleDetected, stopScanner])

  const handleClose = async () => {
    await stopScanner()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100]">
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
              <div>
                <p className="text-sm font-semibold text-red-700">{error}</p>
                <button
                  onClick={handleClose}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Close and Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scanner Container */}
        <div className="relative">
          <div 
            id={containerId} 
            className="w-full aspect-square bg-gray-900 rounded-xl overflow-hidden"
            style={{ minHeight: '300px' }}
          />
          
          {/* Loading Overlay */}
          {isLoading && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/50 rounded-xl">
              <Loader2 className="w-10 h-10 text-white animate-spin mb-3" />
              <p className="text-white font-medium">Starting camera...</p>
              <p className="text-white/70 text-sm mt-1">Please allow camera access</p>
            </div>
          )}

          {/* Scan Frame Overlay */}
          {!isLoading && !error && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-white/50 rounded-lg">
                  {/* Corner markers */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-indigo-500 -mt-1 -ml-1" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-indigo-500 -mt-1 -mr-1" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-indigo-500 -mb-1 -ml-1" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-indigo-500 -mb-1 -mr-1" />
                </div>
              </div>
              <p className="absolute bottom-4 left-0 right-0 text-center text-white/80 text-sm font-medium">
                Align barcode within frame
              </p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-4 p-3 bg-blue-50 rounded-xl">
          <p className="text-sm text-blue-700 text-center">
            <span className="font-semibold">Tip:</span> Hold steady and ensure good lighting
          </p>
        </div>
      </div>
    </div>
  )
}
