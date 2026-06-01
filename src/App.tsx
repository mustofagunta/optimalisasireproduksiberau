import React, { useState, useEffect } from "react";
import { 
  Disc, 
  Tag, 
  HeartPulse, 
  Baby, 
  FileSpreadsheet, 
  Users, 
  LogOut, 
  ShieldCheck, 
  Cloud, 
  Database, 
  MapPin, 
  BarChart3,
  Calendar,
  Layers,
  PlusCircle,
  CheckSquare,
  TrendingUp,
  BookOpen,
  Settings,
  Menu,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Types and storage helpers
import { 
  PenandaanTernak, 
  InseminasiBuatan, 
  PemeriksaanKebuntingan, 
  KelahiranTernak
} from "./types";
import { isFirebaseActive, db, handleFirestoreError, OperationType, localDB } from "./firebase";

// Module Components
import Login from "./components/Login";
import PenandaanModule from "./components/PenandaanModule";
import InseminasiModule from "./components/InseminasiModule";
import KebuntinganModule from "./components/KebuntinganModule";
import KelahiranModule from "./components/KelahiranModule";
import UnduhUnggahLaporan from "./components/UnduhUnggahLaporan";
import PengaturanPengguna from "./components/PengaturanPengguna";
import GoogleSheetsSyncWidget from "./components/GoogleSheetsSyncWidget";

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeMenu, setActiveMenu] = useState<string>("dashboard");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  // Google Sheets states
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [syncSpreadsheetId, setSyncSpreadsheetId] = useState<string | null>(null);

  // Main collections states (prefilled from local cache instantly)
  const [penandaanList, setPenandaanList] = useState<PenandaanTernak[]>([]);
  const [inseminasiList, setInseminasiList] = useState<InseminasiBuatan[]>([]);
  const [kebuntinganList, setKebuntinganList] = useState<PemeriksaanKebuntingan[]>([]);
  const [kelahiranList, setKelahiranList] = useState<KelahiranTernak[]>([]);

  // Load from localStorage immediately on boot
  useEffect(() => {
    // Check if user session exists in local storage
    const cachedUser = localStorage.getItem("active_officer");
    if (cachedUser) {
      try {
        setCurrentUser(JSON.parse(cachedUser));
      } catch {
        // ignore cached parsing error
      }
    }

    setPenandaanList(localDB.get<PenandaanTernak>("penandaan", []));
    setInseminasiList(localDB.get<InseminasiBuatan>("inseminasi", []));
    setKebuntinganList(localDB.get<PemeriksaanKebuntingan>("kebuntingan", []));
    setKelahiranList(localDB.get<KelahiranTernak>("kelahiran", []));
  }, []);

  // Sync state with cloud when Firebase is available (mock real-time hook)
  useEffect(() => {
    if (isFirebaseActive && db) {
      console.info("Sinkronisasi real-time Firebase aktif pada latar belakang...");
      // In production scenario, we'd hook onSnapshot handlers here, 
      // but to preserve high-robustness we mirror Firestore write operations directly
    }
  }, []);

  // Handlers for Penandaan Ternak
  const handleAddPenandaan = (newRecord: PenandaanTernak) => {
    const updated = localDB.insertOne<PenandaanTernak>("penandaan", newRecord);
    setPenandaanList(updated);
  };
  const handleDeletePenandaan = (id: string) => {
    const current = localDB.get<PenandaanTernak>("penandaan", []);
    const updated = current.filter(rec => rec.id !== id);
    localDB.set("penandaan", updated);
    setPenandaanList(updated);
  };

  // Handlers for IB
  const handleAddInseminasi = (newRecord: InseminasiBuatan) => {
    const updated = localDB.insertOne<InseminasiBuatan>("inseminasi", newRecord);
    setInseminasiList(updated);
  };
  const handleDeleteInseminasi = (id: string) => {
    const current = localDB.get<InseminasiBuatan>("inseminasi", []);
    const updated = current.filter(rec => rec.id !== id);
    localDB.set("inseminasi", updated);
    setInseminasiList(updated);
  };

  // Handlers for PKB
  const handleAddKebuntingan = (newRecord: PemeriksaanKebuntingan) => {
    const updated = localDB.insertOne<PemeriksaanKebuntingan>("kebuntingan", newRecord);
    setKebuntinganList(updated);
  };
  const handleDeleteKebuntingan = (id: string) => {
    const current = localDB.get<PemeriksaanKebuntingan>("kebuntingan", []);
    const updated = current.filter(rec => rec.id !== id);
    localDB.set("kebuntingan", updated);
    setKebuntinganList(updated);
  };

  // Handlers for Calving
  const handleAddKelahiran = (newRecord: KelahiranTernak) => {
    const updated = localDB.insertOne<KelahiranTernak>("kelahiran", newRecord);
    setKelahiranList(updated);
  };
  const handleDeleteKelahiran = (id: string) => {
    const current = localDB.get<KelahiranTernak>("kelahiran", []);
    const updated = current.filter(rec => rec.id !== id);
    localDB.set("kelahiran", updated);
    setKelahiranList(updated);
  };

  // Bulk uploads
  const handleBulkInsertPenandaan = (items: PenandaanTernak[]) => {
    const current = localDB.get<PenandaanTernak>("penandaan", []);
    const updated = [...items, ...current];
    localDB.set("penandaan", updated);
    setPenandaanList(updated);
  };
  const handleBulkInsertInseminasi = (items: InseminasiBuatan[]) => {
    const current = localDB.get<InseminasiBuatan>("inseminasi", []);
    const updated = [...items, ...current];
    localDB.set("inseminasi", updated);
    setInseminasiList(updated);
  };
  const handleBulkInsertKebuntingan = (items: PemeriksaanKebuntingan[]) => {
    const current = localDB.get<PemeriksaanKebuntingan>("kebuntingan", []);
    const updated = [...items, ...current];
    localDB.set("kebuntingan", updated);
    setKebuntinganList(updated);
  };
  const handleBulkInsertKelahiran = (items: KelahiranTernak[]) => {
    const current = localDB.get<KelahiranTernak>("kelahiran", []);
    const updated = [...items, ...current];
    localDB.set("kelahiran", updated);
    setKelahiranList(updated);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const handleLoginSuccess = (userObj: any) => {
    localStorage.setItem("active_officer", JSON.stringify(userObj));
    setCurrentUser(userObj);
  };

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-row font-sans text-slate-800">
      
      {/* Left Sidebar (Always Visible on all screen sizes) */}
      <aside className="flex w-52 sm:w-64 xl:w-72 bg-[#0c1222] text-slate-300 flex-shrink-0 flex-col justify-between border-r border-[#1e293b]/50 sticky top-0 h-screen shadow-lg">
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand header */}
          <div className="p-4 sm:p-6 border-b border-slate-800/60 flex items-center gap-2.5 sm:gap-3 bg-[#0a0f1d]">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-emerald-950 flex items-center justify-center text-white border border-emerald-700/40 shrink-0 shadow-sm">
              <Disc className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 animate-spin-slow text-[#10b981]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-[10px] sm:text-xs font-black tracking-tight text-white uppercase leading-tight truncate">
                Reproduksi Berau
              </h1>
              <p className="text-[8px] sm:text-[10px] text-[#10b981] font-extrabold tracking-wide mt-0.5 truncate">
                SI-REPRO-BERAU PORTAL
              </p>
            </div>
          </div>

          {/* Section Category Header */}
          <div className="px-4 sm:px-5 pt-5 sm:pt-6 pb-2">
            <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">MENU UTAMA</span>
          </div>

          {/* Sidebar Nav buttons */}
          <nav className="flex-1 px-2 sm:px-3 py-1 space-y-1">
            {[
              { id: "dashboard", label: "Dashboard Beranda", icon: <Layers className="w-4 h-4 shrink-0" /> },
              { id: "inseminasi", label: "Inseminasi Buatan (IB)", icon: <PlusCircle className="w-4 h-4 shrink-0" /> },
              { id: "kebuntingan", label: "Pemeriksaan PKB", icon: <CheckSquare className="w-4 h-4 shrink-0" /> },
              { id: "kelahiran", label: "Kelahiran Ternak", icon: <TrendingUp className="w-4 h-4 shrink-0" /> },
              { id: "penandaan", label: "Penandaan Ternak", icon: <CheckSquare className="w-4 h-4 shrink-0" /> },
              { id: "laporan", label: "Unduh & Unggah Laporan", icon: <FileSpreadsheet className="w-4 h-4 shrink-0" /> },
            ].map((item) => (
              <button
                key={item.id}
                id={`tab_menu_${item.id}`}
                onClick={() => {
                  setActiveMenu(item.id);
                  setMobileSidebarOpen(false);
                }}
                className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-150 flex items-center gap-2.5 sm:gap-3 relative cursor-pointer border-l-4 ${
                  activeMenu === item.id 
                    ? "bg-emerald-950/40 text-emerald-400 border-emerald-500" 
                    : "bg-transparent text-slate-400 border-transparent hover:bg-slate-800/40 hover:text-white"
                }`}
              >
                {item.icon}
                <span className="truncate">{item.label}</span>
              </button>
            ))}

            {/* Conditionally render Pengaturan Pengguna */}
            {currentUser.role === "adminkab" && (
              <button
                id="tab_menu_users"
                onClick={() => {
                  setActiveMenu("users");
                  setMobileSidebarOpen(false);
                }}
                className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-150 flex items-center gap-2.5 sm:gap-3 relative cursor-pointer border-l-4 ${
                  activeMenu === "users" 
                    ? "bg-emerald-950/40 text-emerald-400 border-emerald-500" 
                    : "bg-transparent text-slate-400 border-transparent hover:bg-slate-800/40 hover:text-white"
                }`}
              >
                <Settings className="w-4 h-4 shrink-0" />
                <span className="truncate">Pengaturan Pengguna</span>
              </button>
            )}
          </nav>
        </div>

        {/* User profile card at sidebar footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800/60 bg-[#070b14] space-y-2.5 sm:space-y-3 font-sans shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 p-1">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-emerald-900/60 border border-emerald-700 flex items-center justify-center text-emerald-200 text-[10px] sm:text-xs font-extrabold shrink-0">
              {(currentUser.namaPetugas || "P").substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] sm:text-xs font-bold text-white truncate">{currentUser.namaPetugas}</p>
              <p className="text-[9px] sm:text-[10px] text-slate-500 truncate capitalize">Role: {currentUser.role?.toUpperCase() || "Petugas"}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between gap-1 text-[8px] sm:text-[9px] text-slate-400 bg-slate-900/50 p-1.5 sm:p-2 rounded-lg border border-slate-800">
            <div className="flex items-center gap-1 sm:gap-1.5 truncate">
              <span className="h-1 sm:h-1.5 w-1 sm:w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="truncate">Penyimpanan Lokal</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-rose-400 transition-colors p-1 cursor-pointer"
              title="Keluar"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main workspace container (Scrollable list area right of desktop sidebar) */}
      <main className="flex-1 min-w-0 flex flex-col min-h-screen">
        <div className="flex-1 w-full p-4 sm:p-6 lg:p-8 space-y-8">
          <AnimatePresence mode="wait">
            {activeMenu === "dashboard" && (() => {
              // Real-time analytics aggregation pre-computations
              const totalPenandaan = penandaanList.length;
              const totalInseminasi = inseminasiList.length;
              const totalKebuntingan = kebuntinganList.length;
              const totalKelahiran = kelahiranList.length;

              // 1. Breed / Rumpun distribution counting
              const breedCounts: Record<string, number> = {};
              penandaanList.forEach(r => {
                const b = (r.rumpunTernak || "LAINNYA").trim().toUpperCase();
                if (b) breedCounts[b] = (breedCounts[b] || 0) + 1;
              });
              inseminasiList.forEach(r => {
                const b = (r.rumpunInduk || "LAINNYA").trim().toUpperCase();
                if (b) breedCounts[b] = (breedCounts[b] || 0) + 1;
              });
              kebuntinganList.forEach(r => {
                const b = (r.rumpunInduk || "LAINNYA").trim().toUpperCase();
                if (b) breedCounts[b] = (breedCounts[b] || 0) + 1;
              });
              kelahiranList.forEach(r => {
                const b = (r.rumpunInduk || "LAINNYA").trim().toUpperCase();
                if (b) breedCounts[b] = (breedCounts[b] || 0) + 1;
              });

              const sortedBreeds = Object.entries(breedCounts)
                .map(([name, count]) => ({ name, count }))
                .filter(item => item.count > 0)
                .sort((a, b) => b.count - a.count)
                .slice(0, 5); // top 5 breeds

              const maxBreedCount = Math.max(...sortedBreeds.map(b => b.count), 1);

              // 2. Kecamatan geographical activity statistics counting
              const kecamatanCounts: Record<string, number> = {};
              penandaanList.forEach(r => {
                if (r.kecamatan) {
                  const k = r.kecamatan.trim();
                  kecamatanCounts[k] = (kecamatanCounts[k] || 0) + 1;
                }
              });
              inseminasiList.forEach(r => {
                if (r.kecamatan) {
                  const k = r.kecamatan.trim();
                  kecamatanCounts[k] = (kecamatanCounts[k] || 0) + 1;
                }
              });
              kebuntinganList.forEach(r => {
                if (r.kecamatan) {
                  const k = r.kecamatan.trim();
                  kecamatanCounts[k] = (kecamatanCounts[k] || 0) + 1;
                }
              });
              kelahiranList.forEach(r => {
                if (r.kecamatan) {
                  const k = r.kecamatan.trim();
                  kecamatanCounts[k] = (kecamatanCounts[k] || 0) + 1;
                }
              });

              const sortedKecamatans = Object.entries(kecamatanCounts)
                .map(([name, count]) => ({ name, count }))
                .filter(item => item.count > 0)
                .sort((a, b) => b.count - a.count)
                .slice(0, 5); // top 5 active kecamatans

              const maxKecCount = Math.max(...sortedKecamatans.map(k => k.count), 1);

              // 3. Child gender ratio stats
              const maleCalves = kelahiranList.filter(k => k.jenisKelaminAnak === "Jantan").length;
              const femaleCalves = kelahiranList.filter(k => k.jenisKelaminAnak === "Betina").length;
              const totalCalvesGiven = maleCalves + femaleCalves;
              const malePercentage = totalCalvesGiven > 0 ? Math.round((maleCalves / totalCalvesGiven) * 100) : 0;
              const femalePercentage = totalCalvesGiven > 0 ? Math.round((femaleCalves / totalCalvesGiven) * 100) : 0;

              return (
                <motion.div
                  key="dashboard_view"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  {/* Modern dark Slate Hero welcome banner */}
                  <div className="bg-[#0b1329] rounded-2xl border border-slate-850 p-8 shadow-md text-white">
                    <div className="flex">
                      <span className="px-3.5 py-1 bg-emerald-950/60 text-emerald-400 font-extrabold text-[10px] uppercase rounded-full border border-emerald-800/40 tracking-wider flex items-center gap-1.5 shadow-inner">
                        <span className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse"></span>
                        REPRODUKSI TERNAK BERAU
                      </span>
                    </div>
                    <h2 className="text-2xl lg:text-3.5xl font-black tracking-tight mt-5 leading-tight">
                      Selamat Bekerja, <span className="text-[#10b981]">{(currentUser.namaPetugas || "HABIBULBARRAU").toUpperCase()}</span>
                    </h2>
                    <p className="text-slate-400 text-xs lg:text-[13px] leading-relaxed mt-3.5 max-w-4xl">
                      Dinas Tanaman Pangan, Hortikultura dan Peternakan Kabupaten Berau. Memonitor target akselerasi penandaan, peningkatan populasi sapi potong, keberhasilan pemeriksaan kebuntingan, dan monitoring kelahiran anak ternak (pedet) secara real-time.
                    </p>
                  </div>

                  {/* A 4-column card grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Card 1: Penandaan Ternak */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-200">
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                            <Tag className="w-5 h-5 text-purple-600" />
                          </div>
                          <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-[9px] font-black rounded-full uppercase tracking-wider">
                            TAGGING
                          </span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-5">
                          PENANDAAN TERNAK
                        </p>
                        <p className="text-3xl font-black text-slate-900 mt-1">
                          {totalPenandaan}
                        </p>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-6 text-xs">
                        <span className="text-slate-400 font-medium">Laporan Eartag</span>
                        <button
                          onClick={() => setActiveMenu("penandaan")}
                          className="text-purple-600 hover:text-purple-800 font-extrabold cursor-pointer hover:underline flex items-center gap-0.5"
                        >
                          Tambah ↗
                        </button>
                      </div>
                    </div>

                    {/* Card 2: Inseminasi Buatan */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200">
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <PlusCircle className="w-5 h-5 text-blue-600" />
                          </div>
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[9px] font-black rounded-full uppercase tracking-wider">
                            IB / SEMEN
                          </span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-5">
                          INSEMINASI BUATAN
                        </p>
                        <p className="text-3xl font-black text-slate-900 mt-1">
                          {totalInseminasi}
                        </p>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-6 text-xs">
                        <span className="text-slate-400 font-medium">Pelayanan IB</span>
                        <button
                          onClick={() => setActiveMenu("inseminasi")}
                          className="text-blue-600 hover:text-blue-800 font-extrabold cursor-pointer hover:underline flex items-center gap-0.5"
                        >
                          Tambah ↗
                        </button>
                      </div>
                    </div>

                    {/* Card 3: Pemeriksaan Hamil */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-amber-300 transition-all duration-200">
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-amber-600" />
                          </div>
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-[9px] font-black rounded-full uppercase tracking-wider">
                            PKB SAPI
                          </span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-5">
                          PEMERIKSAAN HAMIL
                        </p>
                        <p className="text-3xl font-black text-slate-900 mt-1">
                          {totalKebuntingan}
                        </p>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-6 text-xs">
                        <span className="text-slate-400 font-medium">Hasil PKB</span>
                        <button
                          onClick={() => setActiveMenu("kebuntingan")}
                          className="text-amber-600 hover:text-amber-800 font-extrabold cursor-pointer hover:underline flex items-center gap-0.5"
                        >
                          Tambah ↗
                        </button>
                      </div>
                    </div>

                    {/* Card 4: Kelahiran Ternak */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-200">
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Baby className="w-5 h-5 text-emerald-600" />
                          </div>
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[9px] font-black rounded-full uppercase tracking-wider">
                            PEDET BARU
                          </span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-5">
                          KELAHIRAN TERNAK
                        </p>
                        <p className="text-3xl font-black text-slate-900 mt-1">
                          {totalKelahiran}
                        </p>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-6 text-xs">
                        <span className="text-slate-400 font-medium">Log Kelahiran</span>
                        <button
                          onClick={() => setActiveMenu("kelahiran")}
                          className="text-emerald-600 hover:text-emerald-800 font-extrabold cursor-pointer hover:underline flex items-center gap-0.5"
                        >
                          Tambah ↗
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Demographics, charts and list logs bento widgets */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left sections: Charts & Logs (takes 2/3 width) */}
                    <div className="lg:col-span-2 space-y-6">
                      
                      {/* Graphics row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Chart 1: Realisasi target per kecamatan */}
                        <div className="bg-white rounded-2xl border border-slate-150 p-5 shadow-sm">
                          <div className="border-b pb-3 mb-4">
                            <h3 className="text-xs font-black text-slate-800 tracking-wider uppercase">GRAFIK TARGET REALISASI REPRODUKSI</h3>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Top 5 wilayah dengan entri rekaman tertinggi</p>
                          </div>
                          
                          {sortedKecamatans.length === 0 ? (
                            <div className="py-12 text-center text-xs italic text-slate-400">
                              Belum ada data kecamatan terdaftar.
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {sortedKecamatans.map((kec, index) => {
                                const pct = Math.round((kec.count / maxKecCount) * 100);
                                return (
                                  <div key={kec.name} className="space-y-1.5">
                                    <div className="flex justify-between items-center text-xs font-bold">
                                      <span className="text-slate-700 truncate">{index + 1}. {kec.name}</span>
                                      <span className="text-slate-950 font-mono">{kec.count} Kegiatan</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-emerald-600 rounded-full transition-all duration-500" 
                                        style={{ width: `${pct}%` }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Chart 2: Persentase Distribusi Rumpun */}
                        <div className="bg-white rounded-2xl border border-slate-150 p-5 shadow-sm">
                          <div className="border-b pb-3 mb-4">
                            <h3 className="text-xs font-black text-slate-800 tracking-wider uppercase">PERSENTASE RUMPUN TERNAK</h3>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Berdasarkan data penandaan & induk kawin</p>
                          </div>

                          {sortedBreeds.length === 0 ? (
                            <div className="py-12 text-center text-xs italic text-slate-400">
                              Belum ada data rumpun ternak terdaftar.
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {sortedBreeds.map((brd) => {
                                const pct = Math.round((brd.count / maxBreedCount) * 100);
                                return (
                                  <div key={brd.name} className="space-y-1.5">
                                    <div className="flex justify-between items-center text-xs font-bold">
                                      <span className="text-slate-700 truncate">{brd.name}</span>
                                      <span className="text-slate-950 font-mono">{brd.count} Ekor</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                                        style={{ width: `${pct}%` }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Recent Logs Table */}
                      <div className="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-sm">
                        <div className="bg-slate-50 px-6 py-4 border-b flex justify-between items-center">
                          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Log Registrasi Eartag Ternak Terbaru (5 Rekaman Terakhir)
                          </h3>
                          <button
                            onClick={() => setActiveMenu("penandaan")}
                            className="text-xs text-emerald-800 hover:underline font-bold transition-all cursor-pointer"
                          >
                            Selengkapnya &rarr;
                          </button>
                        </div>
                        <div className="p-4">
                          <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-xs text-slate-600">
                              <thead>
                                <tr className="text-slate-400 font-semibold border-b">
                                  <th className="py-2 px-3">Eartag Induk</th>
                                  <th className="py-2 px-3">Tanggal</th>
                                  <th className="py-2 px-3">Rumpun</th>
                                  <th className="py-2 px-3">Peternak</th>
                                  <th className="py-2 px-3">Geografis (Kecamatan/Desa)</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y text-slate-500">
                                {penandaanList.length === 0 ? (
                                  <tr>
                                    <td colSpan={5} className="py-6 text-center italic text-slate-400">
                                      Belum ada eartag baru yang pasang terdaftar.
                                    </td>
                                  </tr>
                                ) : (
                                  penandaanList.slice(0, 5).map((rec) => (
                                    <tr key={rec.id} className="hover:bg-slate-50">
                                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{rec.idEartagInduk}</td>
                                      <td className="py-2.5 px-3">{rec.tanggalPenandaan}</td>
                                      <td className="py-2.5 px-3 font-medium text-emerald-850">{rec.rumpunTernak}</td>
                                      <td className="py-2.5 px-3">{rec.namaPeternak}</td>
                                      <td className="py-2.5 px-3 text-slate-400">{rec.kecamatan} • {rec.desa}</td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right sections: Laporan Statistik, Sheets, and Access Widgets (takes 1/3 width) */}
                    <div className="space-y-6">
                      
                      {/* Rasio Kelahiran Pedet */}
                      <div className="bg-white rounded-2xl border border-slate-150 p-5 shadow-sm">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-b pb-2 mb-4">
                          Rasio Kelahiran Pedet (Anak Sapi)
                        </h4>
                        
                        <div className="space-y-4">
                          <div className="p-3.5 bg-rose-50/40 border border-rose-100 rounded-xl text-center">
                            <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">Total Anak Lahir</span>
                            <span className="text-2xl font-black text-slate-900 mt-1 block">{totalKelahiran} Ekor</span>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-600">
                              <span>PEDET JANTAN ({maleCalves} Ekor)</span>
                              <span className="font-mono text-blue-700 font-bold">{malePercentage}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${malePercentage}%` }} />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-600">
                              <span>PEDET BETINA ({femaleCalves} Ekor)</span>
                              <span className="font-mono text-pink-700 font-bold">{femalePercentage}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-pink-500 rounded-full" style={{ width: `${femalePercentage}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Google Sheets Sync Widget */}
                      <GoogleSheetsSyncWidget
                        penandaan={penandaanList}
                        inseminasi={inseminasiList}
                        kebuntingan={kebuntinganList}
                        kelahiran={kelahiranList}
                        onTokenChanged={(token, sId) => {
                          setGoogleToken(token);
                          setSyncSpreadsheetId(sId);
                        }}
                        initialToken={googleToken}
                        initialSpreadsheetId={syncSpreadsheetId}
                      />

                      {/* Navigasi Akses Cepat */}
                      <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm">
                        <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-widest border-b pb-2.5 mb-4">
                          Navigasi Akses Cepat
                        </h3>
                        <div className="space-y-2.5">
                          <button
                            onClick={() => setActiveMenu("penandaan")}
                            className="w-full text-left py-2 px-3 border border-slate-150 rounded-xl hover:bg-[#0c1222] hover:text-white text-xs font-bold text-slate-700 flex items-center justify-between transition-all cursor-pointer"
                          >
                            <span>Input Pasang Eartag</span>
                            <Tag className="w-4 h-4 text-slate-400 shrink-0" />
                          </button>
                          <button
                            onClick={() => setActiveMenu("inseminasi")}
                            className="w-full text-left py-2 px-3 border border-slate-150 rounded-xl hover:bg-[#0c1222] hover:text-white text-xs font-bold text-slate-700 flex items-center justify-between transition-all cursor-pointer"
                          >
                            <span>Input Inseminasi Buatan (IB)</span>
                            <PlusCircle className="w-4 h-4 text-slate-400 shrink-0" />
                          </button>
                          <button
                            onClick={() => setActiveMenu("kebuntingan")}
                            className="w-full text-left py-2 px-3 border border-slate-150 rounded-xl hover:bg-[#0c1222] hover:text-white text-xs font-bold text-slate-700 flex items-center justify-between transition-all cursor-pointer"
                          >
                            <span>Input Kontrol Kebuntingan (PKB)</span>
                            <CheckSquare className="w-4 h-4 text-slate-400 shrink-0" />
                          </button>
                          <button
                            onClick={() => setActiveMenu("kelahiran")}
                            className="w-full text-left py-2 px-3 border border-slate-150 rounded-xl hover:bg-[#0c1222] hover:text-white text-xs font-bold text-slate-700 flex items-center justify-between transition-all cursor-pointer"
                          >
                            <span>Input Kelahiran Pedet Anak</span>
                            <Baby className="w-4 h-4 text-slate-400 shrink-0" />
                          </button>
                        </div>
                      </div>

                    </div>

                  </div>
                </motion.div>
              );
            })()}

            {activeMenu === "penandaan" && (
              <motion.div
                key="penandaan_view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <PenandaanModule 
                  currentUser={currentUser}
                  records={penandaanList}
                  onAddRecord={handleAddPenandaan}
                  onDeleteRecord={handleDeletePenandaan}
                />
              </motion.div>
            )}

            {activeMenu === "inseminasi" && (
              <motion.div
                key="inseminasi_view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <InseminasiModule 
                  currentUser={currentUser}
                  records={inseminasiList}
                  onAddRecord={handleAddInseminasi}
                  onDeleteRecord={handleDeleteInseminasi}
                />
              </motion.div>
            )}

            {activeMenu === "kebuntingan" && (
              <motion.div
                key="kebuntingan_view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <KebuntinganModule 
                  currentUser={currentUser}
                  records={kebuntinganList}
                  onAddRecord={handleAddKebuntingan}
                  onDeleteRecord={handleDeleteKebuntingan}
                />
              </motion.div>
            )}

            {activeMenu === "kelahiran" && (
              <motion.div
                key="kelahiran_view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <KelahiranModule 
                  currentUser={currentUser}
                  records={kelahiranList}
                  onAddRecord={handleAddKelahiran}
                  onDeleteRecord={handleDeleteKelahiran}
                />
              </motion.div>
            )}

            {activeMenu === "laporan" && (
              <motion.div
                key="laporan_view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <UnduhUnggahLaporan 
                  currentUser={currentUser}
                  onBulkInsertPenandaan={handleBulkInsertPenandaan}
                  onBulkInsertInseminasi={handleBulkInsertInseminasi}
                  onBulkInsertKebuntingan={handleBulkInsertKebuntingan}
                  onBulkInsertKelahiran={handleBulkInsertKelahiran}
                  penandaanRecords={penandaanList}
                  inseminasiRecords={inseminasiList}
                  kebuntinganRecords={kebuntinganList}
                  kelahiranRecords={kelahiranList}
                />
              </motion.div>
            )}

            {/* Pengaturan Pengguna: accessible to Admin Kabupaten only */}
            {activeMenu === "users" && currentUser.role === "adminkab" && (
              <motion.div
                key="users_view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <PengaturanPengguna currentUser={currentUser} onCurrentUserUpdate={setCurrentUser} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-center text-xs shrink-0 mt-auto">
          <p className="font-sans font-medium text-slate-300">
            Optimalisasi Reproduksi Ternak Berau © 2026
          </p>
          <p className="mt-1.5 text-[11px] text-slate-500">
            Dinas Tanaman Pangan, Hortikultura dan Peternakan • Kabupaten Berau, Kalimantan Timur
          </p>
        </footer>
      </main>

      {/* Custom Logout Modal Overlay */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutModal(false)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
            />
            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="relative bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full border border-slate-100 text-center font-sans"
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-4 border border-rose-100">
                <LogOut className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Konfirmasi Keluar</h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                Apakah Anda ingin keluar dari aplikasi SI-REPRO-BERAU dan mengakhiri sesi aktif?
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-2 px-4 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem("active_officer");
                    setCurrentUser(null);
                    setActiveMenu("dashboard");
                    setShowLogoutModal(false);
                  }}
                  className="flex-1 py-1.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold shadow-sm transition-colors text-xs cursor-pointer"
                >
                  Selesai
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
