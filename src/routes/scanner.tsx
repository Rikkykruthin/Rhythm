import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import { Shield, ScanLine, CheckCircle2, XCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { apiPost } from "@/lib/api";

export const Route = createFileRoute("/scanner")({
  component: ScannerPage,
});

function ScannerPage() {
  const [pin, setPin] = useState("");
  const [auth, setAuth] = useState(false);
  
  // Scanner state
  const [scanResult, setScanResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Authenticate
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "230526") { // Quick static check to avoid unnecessary API roundtrips
      setAuth(true);
    } else {
      alert("Invalid Admin PIN");
    }
  };

  // Initialize Scanner when authenticated
  useEffect(() => {
    if (!auth) return;

    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      },
      false
    );

    scannerRef.current.render(onScanSuccess, onScanFailure);

    return () => {
      scannerRef.current?.clear().catch(console.error);
    };
  }, [auth]);

  const onScanSuccess = async (decodedText: string, decodedResult: any) => {
    // Prevent multiple requests
    if (isProcessing || scanResult) return;
    
    setIsProcessing(true);
    try {
      const res = await apiPost<any>("/scan-ticket", {
        ticket_id: decodedText,
        pin: "230526"
      });
      
      setScanResult({
        success: res.found && !res.error && res.previous_status === "paid",
        data: res,
        scannedCode: decodedText
      });
      
      // Auto reset after 3 seconds
      setTimeout(() => {
        setScanResult(null);
        setIsProcessing(false);
      }, 3000);
      
    } catch (err) {
      console.error(err);
      setScanResult({
        success: false,
        data: { error: "Network Error" }
      });
      
      setTimeout(() => {
        setScanResult(null);
        setIsProcessing(false);
      }, 3000);
    }
  };

  const onScanFailure = (error: any) => {
    // html5-qrcode verbosely logs failures when it doesn't see a QR code continuously
    // We can safely ignore these.
  };

  if (!auth) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6 text-neutral-50 selection:bg-purple-500/30">
        <div className="absolute top-6 left-6">
          <Link to="/admin" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" /> Back
          </Link>
        </div>
        <div className="w-full max-w-sm p-8 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-2xl relative text-center">
          <div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-6">
            <ScanLine className="w-8 h-8 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Scanner Access</h2>
          <p className="text-neutral-400 mb-8 text-sm">Enter the admin PIN to open the camera scanner.</p>
          
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
              <input
                type="password"
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                autoFocus
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-center tracking-widest font-mono text-lg placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                placeholder="••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50"
            >
              Start Scanner
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Scanner UI
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 flex flex-col font-sans">
      <header className="p-4 border-b border-white/10 bg-black/50 backdrop-blur-md flex items-center justify-between z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <ScanLine className="w-4 h-4 text-blue-400" />
          </div>
          <span className="font-bold tracking-tight">QR Scanner</span>
        </div>
        <Link to="/admin" className="px-3 py-1.5 rounded-lg border border-white/10 text-xs font-semibold hover:bg-white/5 transition-colors">
          Exit
        </Link>
      </header>

      <main className="flex-1 relative flex flex-col items-center justify-center overflow-hidden">
        
        {/* Full screen status overlay */}
        {scanResult && (
          <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center text-center p-6 animate-in fade-in zoom-in duration-200 ${
            scanResult.success 
              ? 'bg-green-600' 
              : scanResult.data.found 
                ? 'bg-yellow-600' 
                : 'bg-red-600'
          }`}>
            {scanResult.success ? (
              <CheckCircle2 className="w-32 h-32 text-white mb-6 animate-bounce" />
            ) : scanResult.data.found ? (
              <AlertCircle className="w-32 h-32 text-white mb-6 shadow-xl rounded-full" />
            ) : (
              <XCircle className="w-32 h-32 text-white mb-6" />
            )}
            
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
              {scanResult.success 
                ? "VALID TICKET!" 
                : scanResult.data.found 
                  ? "ALREADY SCANNED" 
                  : "INVALID TICKET"}
            </h1>
            
            {scanResult.data.found && (
              <div className="bg-black/20 p-6 rounded-2xl backdrop-blur-md w-full max-w-sm mt-4 border border-white/20">
                <p className="text-white/80 text-sm font-bold uppercase tracking-wider mb-1">Ticket Holder</p>
                <p className="text-2xl font-bold text-white mb-4">{scanResult.data.name}</p>
                
                <p className="text-white/80 text-sm font-bold uppercase tracking-wider mb-1">Admit</p>
                <p className="text-2xl font-bold text-white mb-4">{scanResult.data.qty} Person(s)</p>
                
                <p className="text-white/60 text-xs font-mono">{scanResult.scannedCode}</p>
              </div>
            )}
          </div>
        )}

        <div className="w-full max-w-lg p-4">
          <div className="glass-panel border-2 border-white/10 rounded-3xl overflow-hidden bg-black/40">
            <div id="qr-reader" className="w-full"></div>
          </div>
          
          <div className="mt-6 text-center text-neutral-400 text-sm">
            Point camera at the QR code on the ticket. <br/>
            Scanning happens automatically.
          </div>
        </div>
      </main>

      {/* Basic overrides to make html5-qrcode look less ugly */}
      <style>{`
        #qr-reader { border: none !important; }
        #qr-reader__scan_region { background: transparent !important; }
        #qr-reader__dashboard { background: rgba(0,0,0,0.5); color: white; padding: 10px !important; border-top: 1px solid rgba(255,255,255,0.1) !important; }
        #qr-reader button { background: #3b82f6 !important; border: none !important; padding: 8px 16px !important; color: white !important; font-weight: bold !important; border-radius: 8px !important; cursor: pointer; }
        #qr-reader button:hover { background: #2563eb !important; }
        #qr-reader select { background: #1f2937 !important; border: 1px solid rgba(255,255,255,0.1) !important; color: white !important; padding: 6px !important; border-radius: 6px !important; }
        #qr-reader__status_span { color: #a1a1aa !important; }
      `}</style>
    </div>
  );
}
