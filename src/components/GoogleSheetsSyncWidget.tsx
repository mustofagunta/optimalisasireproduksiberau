import React, { useState, useEffect } from "react";
import { 
  CloudLightning, 
  RefreshCw, 
  ExternalLink, 
  FileCheck, 
  CheckCircle2, 
  Loader, 
  Sparkles,
  AlertCircle,
  LogOut,
  Radio
} from "lucide-react";
import { motion } from "motion/react";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, isFirebaseActive } from "../firebase";
import { 
  searchSpreadsheet, 
  createSpreadsheet, 
  syncAllModules 
} from "../lib/googleSheetsService";
import { PenandaanTernak, InseminasiBuatan, PemeriksaanKebuntingan, KelahiranTernak } from "../types";

interface GoogleSheetsSyncWidgetProps {
  penandaan: PenandaanTernak[];
  inseminasi: InseminasiBuatan[];
  kebuntingan: PemeriksaanKebuntingan[];
  kelahiran: KelahiranTernak[];
  // Called whenever we establish a token or clean it up
  onTokenChanged?: (token: string | null, spreadsheetId: string | null) => void;
  initialToken?: string | null;
  initialSpreadsheetId?: string | null;
}

export default function GoogleSheetsSyncWidget({
  penandaan,
  inseminasi,
  kebuntingan,
  kelahiran,
  onTokenChanged,
  initialToken = null,
  initialSpreadsheetId = null
}: GoogleSheetsSyncWidgetProps) {
  const [token, setToken] = useState<string | null>(initialToken);
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(initialSpreadsheetId);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  
  const [status, setStatus] = useState<"idle" | "authenticating" | "connecting" | "syncing" | "success" | "error">("idle");
  const [statusText, setStatusText] = useState("");
  const [errorDetails, setErrorDetails] = useState("");
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  // Auto-sync whenever local lists change if we are connected!
  useEffect(() => {
    if (token && spreadsheetId && status === "success") {
      performSync(token, spreadsheetId, true);
    }
  }, [penandaan.length, inseminasi.length, kebuntingan.length, kelahiran.length]);

  // Initial connection if token/sheet exists
  useEffect(() => {
    if (initialToken && initialSpreadsheetId) {
      setToken(initialToken);
      setSpreadsheetId(initialSpreadsheetId);
      setStatus("success");
      setLastSynced(new Date().toLocaleTimeString());
    }
  }, [initialToken, initialSpreadsheetId]);

  const handleSignInAndConnect = async () => {
    setStatus("authenticating");
    setStatusText("Menghubungkan Akun Google Anda...");
    setErrorDetails("");

    try {
      if (!isFirebaseActive) {
        throw new Error("Layanan Firebase belum diaktifkan secara komplit. Hubungi Admin.");
      }

      const provider = new GoogleAuthProvider();
      // Add required Workspace scopes
      provider.addScope("https://www.googleapis.com/auth/spreadsheets");
      provider.addScope("https://www.googleapis.com/auth/drive.file");

      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      
      const accessToken = credential?.accessToken;
      if (!accessToken) {
        throw new Error("Gagal memperoleh access token dari Google.");
      }

      setToken(accessToken);
      setStatus("connecting");
      setStatusText("Mencari Spreadsheet di Google Drive...");

      // Search for the spreadsheet or create a new one
      let sheetId = await searchSpreadsheet(accessToken);
      
      if (!sheetId) {
        setStatusText("Membuat Spreadsheet Baru di Google Drive...");
        sheetId = await createSpreadsheet(accessToken);
      }

      setSpreadsheetId(sheetId);
      
      if (onTokenChanged) {
        onTokenChanged(accessToken, sheetId);
      }

      // Perform the initial full sync
      await performSync(accessToken, sheetId, false);

    } catch (err: any) {
      console.error("Sync connect error:", err);
      setStatus("error");
      setStatusText("Koneksi Google Sheets Gagal");
      setErrorDetails(err.message || "Pastikan Anda memberikan izin akses Spreadsheet.");
    }
  };

  const performSync = async (accessToken: string, sheetId: string, isAuto = false) => {
    setStatus("syncing");
    setStatusText(isAuto ? "Mensinkronisasi Otomatis..." : "Mengunggah Data ke Google Sheets...");
    
    try {
      await syncAllModules(accessToken, sheetId, {
        penandaan,
        inseminasi,
        kebuntingan,
        kelahiran
      });
      
      setStatus("success");
      setStatusText("Sinkronisasi Real-Time Aktif");
      setLastSynced(new Date().toLocaleTimeString());
    } catch (err: any) {
      console.error("Sync operations error:", err);
      setStatus("error");
      setStatusText("Sinkronisasi Gagal");
      setErrorDetails(err.message || "Gagal memperbarui sheet.");
    }
  };

  const handleManualSync = () => {
    if (token && spreadsheetId) {
      performSync(token, spreadsheetId, false);
    }
  };

  const handleDisconnect = () => {
    setToken(null);
    setSpreadsheetId(null);
    setStatus("idle");
    setStatusText("");
    setErrorDetails("");
    setLastSynced(null);
    if (onTokenChanged) {
      onTokenChanged(null, null);
    }
  };

  const spreadsheetUrl = spreadsheetId 
    ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`
    : null;

  return (
    <div id="google_sheets_sync_card" className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm overflow-hidden relative">
      
      {/* Background glow when active */}
      {status === "success" && (
        <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-emerald-500/10 blur-xl pointer-events-none" />
      )}

      <div className="flex items-start justify-between border-b pb-3.5 mb-4">
        <div>
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
            <Radio className={`w-4 h-4 ${status === "success" ? "text-emerald-500 animate-pulse" : "text-slate-400"}`} />
            SINKRONISASI BERSAMA
          </h3>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">Real-Time Google Sheets (Excel)</p>
        </div>
        
        {token && (
          <div className="flex items-center gap-1.5 font-sans">
            {showDisconnectConfirm ? (
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-bold text-red-650">Putus?</span>
                <button
                  onClick={() => {
                    handleDisconnect();
                    setShowDisconnectConfirm(false);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white text-[9px] font-bold py-0.5 px-1.5 rounded transition-all cursor-pointer"
                >
                  Ya
                </button>
                <button
                  onClick={() => setShowDisconnectConfirm(false)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-600 text-[9px] font-semibold py-0.5 px-1.5 rounded transition-all cursor-pointer"
                >
                  Batal
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowDisconnectConfirm(true)}
                className="text-[10px] uppercase font-bold text-slate-400 hover:text-red-650 transition-colors flex items-center gap-1 cursor-pointer"
                title="Selesai / Putus Koneksi"
              >
                <LogOut className="w-3.5 h-3.5" />
                Putus
              </button>
            )}
          </div>
        )}
      </div>

      {status === "idle" && (
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Hubungkan aplikasi ini ke **Google Sheets** agar setiap pencatatan data Reproduksi (Penandaan, IB, PKB, Kelahiran) otomatis tersinkronisasi langsung secara real-time ke spreadsheet online Anda.
          </p>

          <button
            id="btn_google_sync_connect"
            onClick={handleSignInAndConnect}
            className="w-full py-2 px-3 border border-slate-200 hover:border-emerald-500 hover:bg-slate-50 flex items-center justify-center gap-2.5 rounded-xl text-xs font-bold text-slate-700 shadow-inner transition-all cursor-pointer"
          >
            {/* Custom Google Icon */}
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 shrink-0">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              <path fill="none" d="M0 0h48v48H0z"></path>
            </svg>
            <span>Hubungkan ke Google Sheets</span>
          </button>
        </div>
      )}

      {status !== "idle" && (
        <div className="space-y-4">
          
          {/* Status Badge & details */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center gap-2">
              {(status === "authenticating" || status === "connecting" || status === "syncing") ? (
                <Loader className="w-4 h-4 animate-spin text-emerald-700 shrink-0" />
              ) : status === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={3} />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              
              <span className={`text-xs font-bold ${
                status === "success" ? "text-emerald-800" : status === "error" ? "text-red-800" : "text-slate-700"
              }`}>
                {statusText}
              </span>
            </div>

            {status === "success" && lastSynced && (
              <p className="text-[10px] text-slate-500 font-mono">
                Sinkron terakhir: <span className="font-bold text-slate-700">{lastSynced}</span>
              </p>
            )}

            {status === "error" && errorDetails && (
              <p className="text-[10px] text-red-650 leading-relaxed font-semibold">
                {errorDetails}
              </p>
            )}
          </div>

          {/* Active features panel */}
          {status === "success" && spreadsheetUrl && (
            <div className="space-y-3 pt-1">
              
              <div className="flex gap-2">
                <a
                  id="btn_google_sheet_open"
                  href={spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-emerald-250"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Buka Spreadsheet
                </a>

                <button
                  id="btn_google_sheet_force_sync"
                  onClick={handleManualSync}
                  className="py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                  title="Sinkronisasi Paksa"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Paksa
                </button>
              </div>

              <div className="p-3 bg-emerald-50/40 border border-emerald-100 rounded-xl text-[10px] text-emerald-850 flex items-start gap-1.5">
                <Sparkles className="w-3.5 h-3.5 mt-0.5 text-amber-500 shrink-0" />
                <p className="leading-normal font-medium">
                  Setiap kali Anda menambah, merubah, atau menghapus data eartag, data IB, status kebuntingan, maupun kelahiran pedet anak, baris data akan **langsung terupdate** di spreadsheet Anda tanpa menimpa baris manual.
                </p>
              </div>
            </div>
          )}

          {status === "error" && (
            <button
              onClick={handleSignInAndConnect}
              className="w-full py-2 bg-slate-150 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Coba Hubungkan Kembali
            </button>
          )}

        </div>
      )}

    </div>
  );
}
