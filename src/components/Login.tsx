import React, { useState } from "react";
import { Lock, User as UserIcon, UserPlus, LogIn, Disc, AlertCircle, Phone, CreditCard } from "lucide-react";
import { motion } from "motion/react";
import { RegisteredUser } from "../types";
import { localDB } from "../firebase";

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  // Registration spec fields
  const [fullName, setFullName] = useState("");
  const [nikPetugas, setNikPetugas] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"petugas" | "adminkab">("petugas");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Handler for fast-login
  const handleFastLogin = (chosenRole: "adminkab" | "petugas") => {
    // Check if these match preset credentials, otherwise pre-seed them
    const existingUsers = localDB.get<any>("users", []);
    
    let target = existingUsers.find((u: any) => u.username === (chosenRole === "adminkab" ? "admin" : "petugas"));
    
    if (!target) {
      target = {
        id: chosenRole === "adminkab" ? "admin_id" : "petugas_id",
        username: chosenRole === "adminkab" ? "admin" : "petugas",
        password: "password",
        namaPetugas: chosenRole === "adminkab" ? "Admin Dinas Berau" : "Petugas Lapangan Berau",
        nikPetugas: chosenRole === "adminkab" ? "6403010101990001" : "6403120202950002",
        nomorTelponPetugas: chosenRole === "adminkab" ? "08112233445" : "08524455667",
        role: chosenRole,
        createdAt: new Date().toISOString()
      };
      localDB.insertOne<any>("users", target);
    }
    
    onLoginSuccess(target);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!username || !password) {
      setErrorMessage("Silakan isi username dan kata sandi Anda.");
      return;
    }

    const existingUsers = localDB.get<any>("users", []);

    // Ensure we preseed of default admin & petugas if none exists so login works instantly
    if (existingUsers.length === 0) {
      const defaultAdmin = {
        id: "admin_id",
        username: "admin",
        password: "password",
        namaPetugas: "Admin Dinas Berau",
        nikPetugas: "6403010101990001",
        nomorTelponPetugas: "08112233445",
        role: "adminkab",
        createdAt: new Date().toISOString()
      };
      existingUsers.push(defaultAdmin);
      localDB.insertOne<any>("users", defaultAdmin);
    }

    if (isRegister) {
      if (!fullName || !nikPetugas || !phone) {
        setErrorMessage("Semua data pendaftaran wajib diisi!");
        return;
      }

      // Check duplications
      const userExists = existingUsers.some((u: any) => u.username.toLowerCase() === username.toLowerCase());
      if (userExists) {
        setErrorMessage("Username sudah terdaftar! Pilih username lain.");
        return;
      }

      const newUser: RegisteredUser = {
        id: `user_${Date.now()}`,
        username: username.trim(),
        password: password,
        namaPetugas: fullName.trim(),
        nikPetugas: nikPetugas.trim(),
        nomorTelponPetugas: phone.trim(),
        role: role,
        createdAt: new Date().toISOString()
      };

      localDB.insertOne<any>("users", newUser);
      setSuccessMessage("Pendaftaran petugas berhasil! Silakan masuk.");
      setIsRegister(false);
      setUsername("");
      setPassword("");
      setFullName("");
      setNikPetugas("");
      setPhone("");
    } else {
      // Find matches
      const matched = existingUsers.find(
        (u: any) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
      );

      if (matched) {
        onLoginSuccess(matched);
      } else {
        setErrorMessage("Username atau kata sandi Anda salah!");
      }
    }
  };

  return (
    <div id="login_container" className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo / Badge */}
        <div className="flex justify-center mb-4">
          <div className="h-20 w-20 rounded-2xl bg-emerald-700 flex items-center justify-center text-white shadow-xl shadow-emerald-700/20">
            <Disc className="w-10 h-10 animate-spin-slow text-amber-300" />
          </div>
        </div>
        
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
          Optimalisasi Reproduksi Ternak
        </h2>
        <p className="mt-2 text-center text-sm text-emerald-800 font-medium">
          Dinas Tanaman Pangan, Hortikultura dan Peternakan
          <br />
          <span className="text-slate-600 font-normal">Kabupaten Berau, Kalimantan Timur</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-slate-100">
          <div className="flex border-b border-slate-200 mb-6">
            <button
              id="tab_login"
              type="button"
              onClick={() => { setIsRegister(false); setErrorMessage(""); }}
              className={`pb-4 px-4 w-1/2 text-center text-sm font-semibold transition-colors border-b-2 ${
                !isRegister
                  ? "border-emerald-600 text-emerald-800"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <LogIn className="w-4 h-4 inline-block mr-1.5 align-text-bottom" />
              Masuk Petugas
            </button>
            <button
              id="tab_register"
              type="button"
              onClick={() => { setIsRegister(true); setErrorMessage(""); }}
              className={`pb-4 px-4 w-1/2 text-center text-sm font-semibold transition-colors border-b-2 ${
                isRegister
                  ? "border-emerald-600 text-emerald-800"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <UserPlus className="w-4 h-4 inline-block mr-1.5 align-text-bottom" />
              Daftar Baru
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-50 border-l-4 border-emerald-500 rounded text-xs text-emerald-700">
                {successMessage}
              </div>
            )}

            {isRegister && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Nama Lengkap Petugas
                  </label>
                  <div className="relative">
                    <input
                      id="register_name"
                      type="text"
                      required
                      placeholder="Masukkan nama lengkap Anda"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full text-sm py-2 pl-3 pr-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    NIK Petugas
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CreditCard className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      id="register_nik"
                      type="text"
                      maxLength={16}
                      required
                      placeholder="Masukkan 16 digit NIK"
                      value={nikPetugas}
                      onChange={(e) => setNikPetugas(e.target.value.replace(/\D/g, ""))}
                      className="w-full text-sm py-2 pl-9 pr-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Nomor WhatsApp / Telpon Petugas
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      id="register_phone"
                      type="tel"
                      required
                      placeholder="Contoh: 0812345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      className="w-full text-sm py-2 pl-9 pr-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Hak Akses/Role Petugas
                  </label>
                  <select
                    id="register_role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-white"
                  >
                    <option value="petugas">Petugas Lapangan (Petugas)</option>
                  </select>
                </div>
              </motion.div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Username Petugas
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="username_field"
                  type="text"
                  required
                  placeholder="Username Anda"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full text-sm py-2 pl-9 pr-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="password_field"
                  type="password"
                  required
                  placeholder="Kata Sandi Anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-sm py-2 pl-9 pr-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                id="submit_auth"
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all cursor-pointer"
              >
                {isRegister ? "Daftar Sekarang" : "Masuk Aplikasi"}
              </button>
            </div>
          </form>

          {/* Quick Login Section */}
          <div className="mt-6 border-t border-slate-100 pt-5">
            <p className="text-center text-xs text-slate-400 mb-3 font-medium uppercase tracking-wider">
              Uji Coba Cepat (Fast Login)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                id="quick_login_admin"
                type="button"
                onClick={() => handleFastLogin("adminkab")}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-orange-50 border border-orange-100 text-orange-950 hover:bg-orange-100 transition-colors cursor-pointer text-left"
              >
                <span className="text-[11px] font-bold">Admin Kab</span>
                <span className="text-[9px] text-orange-600 font-mono">admin / password</span>
              </button>
              <button
                id="quick_login_petugas"
                type="button"
                onClick={() => handleFastLogin("petugas")}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-950 hover:bg-emerald-100 transition-colors cursor-pointer text-left"
              >
                <span className="text-[11px] font-bold">Petugas</span>
                <span className="text-[9px] text-emerald-600 font-mono">petugas / password</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
