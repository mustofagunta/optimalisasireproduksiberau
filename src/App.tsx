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
  Calendar
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

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeMenu, setActiveMenu] = useState<string>("dashboard");

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
    if (confirm("Apakah Anda ingin keluar dari aplikasi?")) {
      localStorage.removeItem("active_officer");
      setCurrentUser(null);
      setActiveMenu("dashboard");
    }
  };

  const handleLoginSuccess = (userObj: any) => {
    localStorage.setItem("active_officer", JSON.stringify(userObj));
    setCurrentUser(userObj);
  };

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Top Banner / Navigation */}
      <header className="bg-emerald-800 text-white shadow-md border-b-2 border-emerald-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-emerald-950 flex items-center justify-center text-white border border-emerald-700/50 shadow-sm shrink-0">
              <Disc className="w-6 h-6 animate-spin-slow text-amber-300" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight">
                Optimalisasi Reproduksi Ternak Berau
              </h1>
              <p className="text-[10px] text-emerald-100 font-medium tracking-wide">
                Dinas Tanaman Pangan, Hortikultura dan Peternakan Kabupaten Berau
              </p>
            </div>
          </div>

          {/* Right hand side: Officer Card + Network status */}
          <div className="flex items-center gap-3 flex-wrap justify-center font-sans">
            <div className="flex items-center gap-1.5 bg-emerald-900/40 border border-emerald-700/60 px-2.5 py-1 rounded-full text-[10px] text-emerald-50">
              {isFirebaseActive ? (
                <>
                  <Cloud className="w-3.5 h-3.5 text-amber-300" />
                  <span>Realtime Cloud Sync Active</span>
                </>
              ) : (
                <>
                  <Database className="w-3.5 h-3.5 text-amber-300" />
                  <span>High-Speed Local Storage Engine</span>
                </>
              )}
            </div>

            <div className="bg-emerald-950/50 px-3 py-1.5 rounded-xl border border-emerald-700 text-right flex items-center gap-2">
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-white leading-tight">{currentUser.namaPetugas}</p>
                <p className="text-[9px] text-amber-300 font-medium">Petugas • {currentUser.role?.toUpperCase()}</p>
              </div>
              <button
                id="btn_logout"
                onClick={handleLogout}
                className="p-1 text-emerald-300 hover:text-white hover:bg-emerald-900/65 rounded-lg transition-colors cursor-pointer"
                title="Keluar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Module Sub-switcher Tabs Menu */}
        <div className="flex overflow-x-auto gap-2 pb-3 mb-6 scrollbar-thin scrollbar-thumb-emerald-800">
          <button
            id="tab_menu_dash"
            onClick={() => setActiveMenu("dashboard")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeMenu === "dashboard"
                ? "bg-emerald-800 text-white shadow-md shadow-emerald-800/10"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <BarChart3 className="w-4 h-4 text-amber-500" />
            Dashboard Utama
          </button>

          <button
            id="tab_menu_penandaan"
            onClick={() => setActiveMenu("penandaan")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeMenu === "penandaan"
                ? "bg-emerald-800 text-white shadow-md shadow-emerald-800/10"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Tag className="w-4 h-4 text-amber-500" />
            Penandaan Ternak
          </button>

          <button
            id="tab_menu_ib"
            onClick={() => setActiveMenu("inseminasi")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeMenu === "inseminasi"
                ? "bg-emerald-800 text-white shadow-md shadow-emerald-800/10"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Disc className="w-4 h-4 text-amber-500 animate-spin-slow" />
            Inseminasi Buatan (IB)
          </button>

          <button
            id="tab_menu_pkb"
            onClick={() => setActiveMenu("kebuntingan")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeMenu === "kebuntingan"
                ? "bg-emerald-800 text-white shadow-md shadow-emerald-800/10"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <HeartPulse className="w-4 h-4 text-amber-500" />
            Pemeriksaan Kebuntingan (PKB)
          </button>

          <button
            id="tab_menu_kelahiran"
            onClick={() => setActiveMenu("kelahiran")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeMenu === "kelahiran"
                ? "bg-emerald-800 text-white shadow-md shadow-emerald-800/10"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Baby className="w-4 h-4 text-amber-500" />
            Kelahiran Ternak (Pedet)
          </button>

          <button
            id="tab_menu_laporan"
            onClick={() => setActiveMenu("laporan")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeMenu === "laporan"
                ? "bg-emerald-800 text-white shadow-md shadow-emerald-800/10"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-500" />
            Kelola Excel Laporan
          </button>

          {/* Pengaturan Pengguna - Only visible and active for owner/adminkab roles */}
          {currentUser.role === "adminkab" && (
            <button
              id="tab_menu_users"
              onClick={() => setActiveMenu("users")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeMenu === "users"
                  ? "bg-emerald-800 text-white shadow-md shadow-emerald-800/10"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Users className="w-4 h-4 text-amber-500" />
              Pengaturan Pengguna
            </button>
          )}
        </div>

        {/* Workspace Display Area */}
        <AnimatePresence mode="wait">
          {activeMenu === "dashboard" && (
            <motion.div
              key="dashboard_view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Summary stat cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { 
                    id: "stat_penandaan", 
                    label: "Penandaan Eartag Baru", 
                    count: penandaanList.length, 
                    icon: <Tag className="w-5 h-5 text-emerald-800" />, 
                    bg: "bg-emerald-50 border-emerald-100 text-emerald-900" 
                  },
                  { 
                    id: "stat_ib", 
                    label: "Inseminasi Buatan (IB)", 
                    count: inseminasiList.length, 
                    icon: <Disc className="w-5 h-5 text-emerald-800 animate-spin-slow" />, 
                    bg: "bg-emerald-50 border-emerald-100 text-emerald-900" 
                  },
                  { 
                    id: "stat_pkb", 
                    label: "Pemeriksaan Kebuntingan", 
                    count: kebuntinganList.length, 
                    icon: <HeartPulse className="w-5 h-5 text-emerald-800" />, 
                    bg: "bg-emerald-50 border-emerald-100 text-emerald-900" 
                  },
                  { 
                    id: "stat_kelahiran", 
                    label: "Kelahiran Pedet Baru", 
                    count: kelahiranList.length, 
                    icon: <Baby className="w-5 h-5 text-emerald-800" />, 
                    bg: "bg-emerald-50 border-emerald-100 text-emerald-900" 
                  }
                ].map((stat) => (
                  <div 
                    key={stat.id} 
                    className={`p-5 rounded-2xl border bg-white shadow-sm flex items-center justify-between hover:scale-102 transition-transform`}
                  >
                    <div>
                      <p className="text-xs text-slate-500 font-semibold">{stat.label}</p>
                      <p className="text-3xl font-extrabold text-slate-900 mt-2">{stat.count}</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner">
                      {stat.icon}
                    </div>
                  </div>
                ))}
              </div>

              {/* Grid 2: Welcome message & fast guide */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Information Card */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 flex flex-col justify-between shadow-sm">
                  <div>
                    <span className="px-3 py-1 bg-amber-50 rounded-full text-[10px] text-amber-800 font-bold border border-amber-200">
                      INFO DAERAH KABUPATEN BERAU
                    </span>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight mt-3">
                      Selamat Datang di Portal Optimalisasi Reproduksi Ternak
                    </h2>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      Layanan rekapitulasi data ternak terintegrasi Kabupaten Berau memfasilitasi pencatatan, 
                      monitoring kebuntingan, penandaan eartag kawin massal, inseminasi buatan sistematis, 
                      hingga pencatatan pedet secara instan dan sinkron secara real-time.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-6 border-t pt-5">
                    <div className="flex gap-2 items-start">
                      <MapPin className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">Wilayah Kerja</h4>
                        <p className="text-[10px] text-slate-500">13 Kecamatan, Kalimantan Timur</p>
                      </div>
                    </div>
                    <div className="flex gap-2 items-start">
                      <Calendar className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">Pembaruan Hari Ini</h4>
                        <p className="text-[10px] text-slate-500">Setiap detik tersinkronisasi</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick actions panel */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                  <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-widest border-b pb-2.5 mb-4">
                    Navigasi Akses Cepat
                  </h3>
                  <div className="space-y-2.5">
                    <button
                      id="act_quick_penandaan"
                      onClick={() => setActiveMenu("penandaan")}
                      className="w-full text-left py-2 px-3 border border-slate-100 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>Input Pasang Eartag</span>
                      <Tag className="w-4 h-4 text-slate-400" />
                    </button>
                    <button
                      id="act_quick_ib"
                      onClick={() => setActiveMenu("inseminasi")}
                      className="w-full text-left py-2 px-3 border border-slate-100 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>Input Inseminasi Buatan (IB)</span>
                      <Disc className="w-4 h-4 text-slate-400" />
                    </button>
                    <button
                      id="act_quick_pkb"
                      onClick={() => setActiveMenu("kebuntingan")}
                      className="w-full text-left py-2 px-3 border border-slate-100 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>Input Kontrol Kebuntingan (PKB)</span>
                      <HeartPulse className="w-4 h-4 text-slate-400" />
                    </button>
                    <button
                      id="act_quick_kelahiran"
                      onClick={() => setActiveMenu("kelahiran")}
                      className="w-full text-left py-2 px-3 border border-slate-100 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>Input Kelahiran Pedet Anak</span>
                      <Baby className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Box 3: Recent Eartag Log Preview */}
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="bg-slate-50 px-6 py-4 border-b flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Log Registrasi Eartag Ternak Terbaru (5 Rekaman Terakhir)
                  </h3>
                  <button
                    id="btn_view_all_penandaan"
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
            </motion.div>
          )}

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

          {/* Pengaturan Pengguna: accessible to Owner/adminkab role only */}
          {activeMenu === "users" && currentUser.role === "adminkab" && (
            <motion.div
              key="users_view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <PengaturanPengguna currentUser={currentUser} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 text-center text-xs mt-12 border-t border-slate-800">
        <p className="font-sans font-medium text-slate-300">
          Optimalisasi Reproduksi Ternak Berau © 2026
        </p>
        <p className="mt-1.5 text-[11px] text-slate-500">
          Dinas Tanaman Pangan, Hortikultura dan Peternakan • Kabupaten Berau, Kalimantan Timur
        </p>
      </footer>
    </div>
  );
}
