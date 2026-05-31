import React, { useState, useEffect } from "react";
import { UserPlus, Users, Trash, Shield, ShieldAlert, Key, Save, CheckCircle, Edit2, X } from "lucide-react";
import { RegisteredUser } from "../types";
import { localDB } from "../firebase";

interface PengaturanPenggunaProps {
  currentUser: any;
  onCurrentUserUpdate?: (user: any) => void;
}

export default function PengaturanPengguna({ currentUser, onCurrentUserUpdate }: PengaturanPenggunaProps) {
  const [usersList, setUsersList] = useState<RegisteredUser[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [namaPetugas, setNamaPetugas] = useState("");
  const [nikPetugas, setNikPetugas] = useState("");
  const [nomorTelponPetugas, setNomorTelponPetugas] = useState("");
  const [role, setRole] = useState<"petugas" | "adminkab">("petugas");
  
  // State for active edit operation
  const [editingUser, setEditingUser] = useState<RegisteredUser | null>(null);

  const [notif, setNotif] = useState("");
  const [errorText, setErrorText] = useState("");

  const loadUsersList = () => {
    const list = localDB.get<RegisteredUser>("users", []);
    setUsersList(list);
  };

  useEffect(() => {
    loadUsersList();
    if (currentUser && currentUser.role === "petugas") {
      setUsername(currentUser.username || "");
      setPassword(currentUser.password || "");
      setNamaPetugas(currentUser.namaPetugas || "");
      setNikPetugas(currentUser.nikPetugas === "-" ? "" : currentUser.nikPetugas || "");
      setNomorTelponPetugas(currentUser.nomorTelponPetugas === "-" ? "" : currentUser.nomorTelponPetugas || "");
      setRole("petugas");
    }
  }, [currentUser]);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText("");
    setNotif("");

    if (!username || !password || !namaPetugas) {
      setErrorText("Nama, username, dan kata sandi wajib diisi!");
      return;
    }

    if (currentUser.role !== "adminkab") {
      // Self edit flow for petugas Lapangan
      const duplicate = usersList.some((usr) => {
        return usr.id !== currentUser.id && usr.username.toLowerCase() === username.trim().toLowerCase();
      });

      if (duplicate) {
        setErrorText("Username '" + username + "' sudah digunakan oleh petugas lain!");
        return;
      }

      const updatedUser: RegisteredUser = {
        ...currentUser,
        username: username.trim(),
        password: password,
        namaPetugas: namaPetugas.trim(),
        nikPetugas: nikPetugas.trim() || "-",
        nomorTelponPetugas: nomorTelponPetugas.trim() || "-",
      };

      const updatedList = usersList.map((usr) => {
        if (usr.id === currentUser.id) return updatedUser;
        return usr;
      });

      localDB.set("users", updatedList);
      setNotif("Sukses memperbarui akun pribadi Anda!");
      
      if (onCurrentUserUpdate) {
        onCurrentUserUpdate(updatedUser);
      }
      loadUsersList();
      return;
    }

    // Verify duplication (For Admin Kabupaten flow)
    const duplicate = usersList.some((usr) => {
      if (editingUser && usr.id === editingUser.id) return false;
      return usr.username.toLowerCase() === username.trim().toLowerCase();
    });

    if (duplicate) {
      setErrorText("Username '" + username + "' sudah digunakan oleh petugas lain!");
      return;
    }

    if (editingUser) {
      // Update logic
      const updatedList = usersList.map((usr) => {
        if (usr.id === editingUser.id) {
          const updated = {
            ...usr,
            username: username.trim(),
            password: password,
            namaPetugas: namaPetugas.trim(),
            nikPetugas: nikPetugas.trim() || "-",
            nomorTelponPetugas: nomorTelponPetugas.trim() || "-",
            role,
          };
          if (usr.id === currentUser.id && onCurrentUserUpdate) {
            onCurrentUserUpdate(updated);
          }
          return updated;
        }
        return usr;
      });

      localDB.set("users", updatedList);
      setNotif(`Sukses memperbarui akun petugas "${namaPetugas}"!`);
      setEditingUser(null);
    } else {
      // Create logic
      const newUser: RegisteredUser = {
        id: `user_admin_${Date.now()}`,
        username: username.trim(),
        password: password,
        namaPetugas: namaPetugas.trim(),
        nikPetugas: nikPetugas.trim() || "-",
        nomorTelponPetugas: nomorTelponPetugas.trim() || "-",
        role,
        createdAt: new Date().toISOString()
      };

      localDB.insertOne<RegisteredUser>("users", newUser);
      setNotif(`Sukses mendaftarkan petugas baru "${namaPetugas}"!`);
    }

    loadUsersList();

    // Reset fields
    setUsername("");
    setPassword("");
    setNamaPetugas("");
    setNikPetugas("");
    setNomorTelponPetugas("");
    setRole("petugas");
  };

  const startEditUser = (user: RegisteredUser) => {
    if (currentUser.role !== "adminkab") {
      alert("Hanya Admin Kabupaten yang diizinkan mengedit akun!");
      return;
    }
    setEditingUser(user);
    setNamaPetugas(user.namaPetugas);
    setNikPetugas(user.nikPetugas === "-" ? "" : user.nikPetugas || "");
    setNomorTelponPetugas(user.nomorTelponPetugas === "-" ? "" : user.nomorTelponPetugas || "");
    setRole(user.role);
    setUsername(user.username);
    setPassword(user.password || "");
    setErrorText("");
    setNotif("");
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setNamaPetugas("");
    setNikPetugas("");
    setNomorTelponPetugas("");
    setRole("petugas");
    setUsername("");
    setPassword("");
    setErrorText("");
    setNotif("");
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (currentUser.role !== "adminkab") {
      alert("Hanya Admin Kabupaten yang diizinkan untuk menghapus data petugas!");
      return;
    }
    if (id === "admin_id" || name === "admin") {
      alert("Format login Admin Bawaan Kabupaten tidak diijinkan untuk dihapus guna menjaga kelangsungan penginstalan.");
      return;
    }
    if (id === currentUser.id) {
      alert("Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif!");
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus petugas "${name}" dari sistem?`)) {
      const updated = usersList.filter((usr) => usr.id !== id);
      localDB.set("users", updated);
      setNotif(`Sukses menghapus data petugas "${name}".`);
      loadUsersList();
      if (editingUser?.id === id) {
        handleCancelEdit();
      }
    }
  };

  return (
    <div id="pengaturan_pengguna_panel" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Col 1 & 2: Users List */}
      <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 px-6 py-5 text-white">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-300" />
            <h2 className="text-xl font-bold tracking-tight">Daftar Petugas & Pengaturan Akun</h2>
          </div>
          <p className="text-xs text-slate-200 mt-1">
            Monitor semua profil petugas lapangan, administrator kabupaten, dan otorisasi akses dinas Berau
          </p>
        </div>

        {notif && (
          <div className="mx-6 mt-4 p-3.5 bg-emerald-50 border-l-4 border-emerald-600 rounded text-sm text-emerald-800 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>{notif}</span>
          </div>
        )}

        <div className="p-6">
          <div className="overflow-x-auto border rounded-xl divide-y">
            <table className="min-w-full text-left text-xs text-slate-600 divide-y">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Nama Petugas</th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Kontak & NIK</th>
                  <th className="px-4 py-3">Otoritas (Role)</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y bg-white">
                {usersList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center italic text-slate-400">
                      Belum ada database pengguna yang terdaftar.
                    </td>
                  </tr>
                ) : (
                  usersList.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${user.role === "adminkab" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
                            <Shield className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{user.namaPetugas}</p>
                            <p className="text-[10px] text-slate-400">ID: {user.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-700 font-semibold">{user.username}</td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-slate-700">Tel: {user.nomorTelponPetugas || "-"}</p>
                        <p className="text-[10px] text-slate-400">NIK: {user.nikPetugas || "-"}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          user.role === "adminkab" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {user.role === "adminkab" ? "Admin Kabupaten/Owner/Adminkab" : "Petugas Lapangan (Petugas)"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {currentUser.role === "adminkab" ? (
                            <>
                              <button
                                id={`edit_user_${user.id}`}
                                type="button"
                                onClick={() => startEditUser(user)}
                                className="text-amber-600 hover:text-amber-800 p-1.5 rounded hover:bg-amber-50 transition-colors cursor-pointer"
                                title="Edit Akun"
                              >
                                <Edit2 className="w-4 h-4 mx-auto text-amber-600" />
                              </button>
                              <button
                                id={`del_user_${user.id}`}
                                type="button"
                                onClick={() => handleDeleteUser(user.id, user.username)}
                                className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-55 transition-colors cursor-pointer"
                                title="Hapus Akun"
                              >
                                <Trash className="w-4 h-4 mx-auto" />
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">No Action</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Col 3: Add/Edit User Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 self-start">
        {currentUser.role === "adminkab" ? (
          editingUser ? (
            <div className="flex items-center justify-between text-amber-800 font-bold border-b pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-600" />
                <span className="text-sm">Edit Akun Petugas (Edit Username & Password)</span>
              </div>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
                title="Batal Edit"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-emerald-800 font-bold border-b pb-3 mb-4">
              <UserPlus className="w-5 h-5 text-emerald-600" />
              <span className="text-sm">Tambah Petugas Baru</span>
            </div>
          )
        ) : (
          <div className="flex items-center gap-2 text-indigo-800 font-bold border-b pb-3 mb-4">
            <Edit2 className="w-5 h-5 text-indigo-600 animate-pulse" />
            <span className="text-sm">Edit Akun Pribadi (Edit Username & Password)</span>
          </div>
        )}

        {errorText && (
          <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded text-xs text-red-700 mb-4 flex gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorText}</span>
          </div>
        )}

        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
              Nama Lengkap Petugas *
            </label>
            <input
              id="admin_add_nama"
              type="text"
              required
              disabled={currentUser.role !== "adminkab"}
              placeholder="Sesuai KTP petugas"
              value={namaPetugas}
              onChange={(e) => setNamaPetugas(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white disabled:bg-slate-55 disabled:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
              NIK Petugas (KTP)
            </label>
            <input
              id="admin_add_nik"
              type="text"
              maxLength={16}
              disabled={currentUser.role !== "adminkab"}
              placeholder="16-digit nomor NIK"
              value={nikPetugas}
              onChange={(e) => setNikPetugas(e.target.value.replace(/\D/g, ""))}
              className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white disabled:bg-slate-55 disabled:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
              No HP / WhatsApp *
            </label>
            <input
              id="admin_add_phone"
              type="tel"
              required
              placeholder="Contoh: 081234567"
              value={nomorTelponPetugas}
              onChange={(e) => setNomorTelponPetugas(e.target.value.replace(/\D/g, ""))}
              className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
              Otoritas (Role)
            </label>
            <select
              id="admin_add_role"
              value={role}
              disabled={currentUser.role !== "adminkab"}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white disabled:bg-slate-55 disabled:text-slate-500"
            >
              <option value="petugas">Petugas Lapangan (Petugas)</option>
              {currentUser.role === "adminkab" && (
                <option value="adminkab">Admin Kabupaten/Owner/Adminkab</option>
              )}
            </select>
          </div>

          <div className="border-t pt-3 mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                {editingUser 
                  ? "Username Login (Edit Username) *" 
                  : currentUser.role === "petugas" 
                    ? "Username Login Saya (Edit Username) *" 
                    : "Username Login *"}
              </label>
              <input
                id="admin_add_username"
                type="text"
                required
                placeholder="Username login unik"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                {editingUser 
                  ? "Kata Sandi (Edit Password) *" 
                  : currentUser.role === "petugas" 
                    ? "Kata Sandi Baru Saya (Edit Password) *" 
                    : "Kata Sandi *"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <Key className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <input
                  id="admin_add_password"
                  type="password"
                  required
                  placeholder="Kata Sandi login"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs py-2 pl-8 pr-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
            </div>
          </div>

          {currentUser.role === "adminkab" ? (
            editingUser ? (
              <div className="flex gap-2">
                <button
                  id="btn_admin_save_user"
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Simpan Perubahan
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  Batal
                </button>
              </div>
            ) : (
              <button
                id="btn_admin_save_user"
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Simpan Akun Petugas
              </button>
            )
          ) : (
            <button
              id="btn_admin_save_user"
              type="submit"
              className="w-full py-2.5 px-4 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Simpan Perubahan Akun Saya
            </button>
          )}
        </form>
      </div>

    </div>
  );
}
