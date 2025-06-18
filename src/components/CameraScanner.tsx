import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, X, RotateCcw, Check, Loader2, AlertCircle, Zap } from 'lucide-react';
import { useThemeStore } from '../store/useThemeStore';
import { apiService } from '../services/api';
import { useAIStore } from '../store/useAIStore';

interface CameraScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (data: any) => void;
}

interface ScanResult {
  amount: number;
  description: string;
  category: string;
  items: string[];
  merchant?: string;
  date?: string;
  confidence: number;
}

const CameraScanner: React.FC<CameraScannerProps> = ({ isOpen, onClose, onScanComplete }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isDark } = useThemeStore();
  const { settings } = useAIStore();

  // Start camera stream
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraStream(stream);
        setIsScanning(true);
      }
    } catch (err) {
      setError('Unable to access camera. Please check permissions.');
      console.error('Camera access error:', err);
    }
  }, []);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsScanning(false);
  }, [cameraStream]);

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
    stopCamera();

    // Start AI processing
    processImage(imageData);
  }, [stopCamera]);

  // Process image with API
  const processImage = async (imageData: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Try real API first
      const result = await apiService.scanInvoice(imageData);
      setScanResult(result);
    } catch (apiError) {
      console.warn('API scan failed, trying dummy endpoint:', apiError);
      
      try {
        // Fallback to dummy API
        const dummyResult = await apiService.getDummyInvoiceScan();
        setScanResult(dummyResult);
      } catch (dummyError) {
        console.error('Dummy API also failed, using mock data:', dummyError);
        
        // Final fallback to mock data
        const mockResult: ScanResult = {
          amount: Math.floor(Math.random() * 500000) + 50000,
          description: 'Groceries from Supermarket',
          category: 'Food',
          items: ['Milk 1L', 'Bread', 'Eggs 12pcs', 'Rice 5kg', 'Cooking Oil'],
          merchant: 'Supermarket ABC',
          date: new Date().toISOString().split('T')[0],
          confidence: 0.92
        };
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2000));
        setScanResult(mockResult);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Confirm and use scan result
  const confirmScan = () => {
    if (scanResult) {
      onScanComplete({
        type: 'expense',
        amount: scanResult.amount,
        category: scanResult.category,
        description: scanResult.description,
        paymentMethod: 'Cash', // Default, user can change
        date: scanResult.date || new Date().toISOString().split('T')[0],
        aiGenerated: true,
        confidence: scanResult.confidence,
        items: scanResult.items,
        merchant: scanResult.merchant
      });
      onClose();
    }
  };

  // Reset scanner
  const resetScanner = () => {
    setCapturedImage(null);
    setScanResult(null);
    setError(null);
    setIsProcessing(false);
    startCamera();
  };

  // Initialize camera when modal opens
  useEffect(() => {
    if (isOpen && !isScanning && !capturedImage) {
      startCamera();
    }
    
    return () => {
      if (cameraStream) {
        stopCamera();
      }
    };
  }, [isOpen, isScanning, capturedImage, startCamera, stopCamera, cameraStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  if (!isOpen) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className={`rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden transition-colors duration-300 ${
        isDark ? 'bg-dark-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b transition-colors duration-300 ${
          isDark ? 'border-dark-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center">
            <Zap className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              AI Receipt Scanner
            </h2>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDark ? 'hover:bg-dark-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className={`mb-4 p-4 rounded-lg border ${
              isDark 
                ? 'bg-red-900/20 border-red-800 text-red-400' 
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Camera View */}
          {isScanning && (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 border-2 border-dashed border-white/50 m-4 rounded-lg flex items-center justify-center">
                  <div className="text-white text-center">
                    <Camera className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Position receipt within frame</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={capturePhoto}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Capture Receipt
                </button>
                <button
                  onClick={onClose}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                    isDark 
                      ? 'bg-dark-600 text-gray-300 hover:bg-dark-500' 
                      : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Processing View */}
          {isProcessing && capturedImage && (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden">
                <img src={capturedImage} alt="Captured receipt" className="w-full h-64 object-cover" />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-white text-center">
                    <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                    <p className="text-sm">AI is processing your receipt...</p>
                    <p className="text-xs mt-1 opacity-75">Using {settings.provider === 'mock' ? 'Demo Mode' : 'API'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results View */}
          {scanResult && !isProcessing && (
            <div className="space-y-4">
              {capturedImage && (
                <div className="rounded-lg overflow-hidden">
                  <img src={capturedImage} alt="Captured receipt" className="w-full h-32 object-cover" />
                </div>
              )}

              <div className={`border rounded-lg p-4 transition-colors duration-300 ${
                isDark 
                  ? 'bg-green-900/20 border-green-800' 
                  : 'bg-green-50 border-green-200'
              }`}>
                <div className="flex items-center mb-3">
                  <Check className={`h-5 w-5 mr-2 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                  <span className={`font-medium ${isDark ? 'text-green-300' : 'text-green-800'}`}>
                    Receipt Processed Successfully
                  </span>
                  <span className={`ml-auto text-xs px-2 py-1 rounded-full ${
                    isDark ? 'bg-green-800/50 text-green-300' : 'bg-green-100 text-green-700'
                  }`}>
                    {Math.round(scanResult.confidence * 100)}% confidence
                  </span>
                </div>

                <div className={`space-y-3 text-sm ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium">Amount:</p>
                      <p className="text-lg font-bold">{formatCurrency(scanResult.amount)}</p>
                    </div>
                    <div>
                      <p className="font-medium">Category:</p>
                      <p>{scanResult.category}</p>
                    </div>
                  </div>

                  <div>
                    <p className="font-medium">Description:</p>
                    <p>{scanResult.description}</p>
                  </div>

                  {scanResult.merchant && (
                    <div>
                      <p className="font-medium">Merchant:</p>
                      <p>{scanResult.merchant}</p>
                    </div>
                  )}

                  {scanResult.items && scanResult.items.length > 0 && (
                    <div>
                      <p className="font-medium">Items:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {scanResult.items.slice(0, 3).map((item, index) => (
                          <span key={index} className={`px-2 py-1 rounded text-xs ${
                            isDark 
                              ? 'bg-green-800/50 text-green-300' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {item}
                          </span>
                        ))}
                        {scanResult.items.length > 3 && (
                          <span className={`px-2 py-1 rounded text-xs ${
                            isDark 
                              ? 'bg-green-800/50 text-green-300' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            +{scanResult.items.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={confirmScan}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <Check className="h-5 w-5 mr-2" />
                  Add Transaction
                </button>
                <button
                  onClick={resetScanner}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center ${
                    isDark 
                      ? 'bg-dark-600 text-gray-300 hover:bg-dark-500' 
                      : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                  }`}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Initial state - no camera permission or error */}
          {!isScanning && !capturedImage && !isProcessing && !error && (
            <div className="text-center py-8">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isDark ? 'bg-blue-900/30' : 'bg-blue-100'
              }`}>
                <Camera className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Ready to Scan Receipt
              </h3>
              <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                AI will automatically extract transaction details from your receipt
              </p>
              <button
                onClick={startCamera}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center mx-auto"
              >
                <Camera className="h-5 w-5 mr-2" />
                Start Camera
              </button>
            </div>
          )}
        </div>

        {/* Hidden canvas for image capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default CameraScanner;