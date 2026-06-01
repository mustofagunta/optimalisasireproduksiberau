import React, { useState } from "react";
import { Plus, Table, Trash, Camera, Upload, Search, Download, HelpCircle, Save, CheckCircle, Tag } from "lucide-react";
import { KECAMATAN_BERAU, RUMPUN_TERNAK_PRESETS, PenandaanTernak } from "../types";
import { localDB } from "../firebase";

interface PenandaanModuleProps {
  currentUser: any;
  records: PenandaanTernak[];
  onAddRecord: (newRecord: PenandaanTernak) => void;
  onDeleteRecord: (id: string) => void;
}

export default function PenandaanModule({ currentUser, records, onAddRecord, onDeleteRecord }: PenandaanModuleProps) {
  const [activeTab, setActiveTab] = useState<"form" | "data">("form");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [tanggalPenandaan, setTanggalPenandaan] = useState(new Date().toISOString().split("T")[0]);
  const [idEartagInduk, setIdEartagInduk] = useState("");
  const [fotoEartagInduk, setFotoEartagInduk] = useState("");
  const [tanggalLahirInduk, setTanggalLahirInduk] = useState("");
  const [namaPeternak, setNamaPeternak] = useState("");
  const [nikPeternak, setNikPeternak] = useState("");
  const [tujuanPemeliharaan, setTujuanPemeliharaan] = useState<"Pembibitan" | "Pengemukan" | "Pembiakan">("Pembiakan");
  const [nomorTelponPeternak, setNomorTelponPeternak] = useState("");
  const [kecamatan, setKecamatan] = useState(Object.keys(KECAMATAN_BERAU)[0]);
  const [desa, setDesa] = useState(KECAMATAN_BERAU[Object.keys(KECAMATAN_BERAU)[0]][0]);
  const [rumpunTernakSelected, setRumpunTernakSelected] = useState(RUMPUN_TERNAK_PRESETS[0]);
  const [rumpunKustom, setRumpunKustom] = useState("");
  const [jenisKelamin, setJenisKelamin] = useState<"Jantan" | "Betina">("Betina");
  const [keterangan, setKeterangan] = useState("");

  const [notif, setNotif] = useState("");

  // Handle Photo input / compressed base64 conversion
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        // Compress using Canvas to stay safe in Firestore document limits (Max 80KB)
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const maxW = 400;
        const maxH = 300;
        let w = img.width;
        let h = img.height;

        if (w > maxW || h > maxH) {
          const ratio = Math.min(maxW / w, maxH / h);
          w = w * ratio;
          h = h * ratio;
        }

        canvas.width = w;
        canvas.height = h;
        ctx?.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.75); // 75% quality jpeg
        setFotoEartagInduk(dataUrl);
      };
    };
    reader.readAsDataURL(file);
  };

  const handleKecamatanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newKec = e.target.value;
    setKecamatan(newKec);
    setDesa(KECAMATAN_BERAU[newKec][0]);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idEartagInduk) {
      alert("ID Eartag Induk wajib diisi!");
      return;
    }

    const finalRumpun = rumpunTernakSelected === "LAIN_LAIN" ? (rumpunKustom || "Rumpun Kustom") : rumpunTernakSelected;

    const newRecord: PenandaanTernak = {
      id: `tag_${Date.now()}`,
      namaPetugas: currentUser.namaPetugas || "Nama Petugas",
      nikPetugas: currentUser.nikPetugas || "NIK Petugas",
      nomorTelponPetugas: currentUser.nomorTelponPetugas || "Telepon Petugas",
      tanggalPenandaan,
      idEartagInduk: idEartagInduk.trim().toUpperCase(),
      fotoEartagInduk,
      tanggalLahirInduk,
      namaPeternak: namaPeternak.trim(),
      nikPeternak: nikPeternak.trim(),
      tujuanPemeliharaan,
      nomorTelponPeternak: nomorTelponPeternak.trim(),
      propinsi: "Kalimantan Timur",
      kabupaten: "Berau",
      kecamatan,
      desa,
      rumpunTernak: finalRumpun.toUpperCase(),
      jenisKelamin,
      keterangan: keterangan.trim(),
      createdAt: new Date().toISOString()
    };

    onAddRecord(newRecord);
    setNotif("Penandaan eartag ternak sukses disimpan ke database!");
    setTimeout(() => setNotif(""), 4000);

    // Reset simple values
    setIdEartagInduk("");
    setFotoEartagInduk("");
    setTanggalLahirInduk("");
    setNamaPeternak("");
    setNikPeternak("");
    setNomorTelponPeternak("");
    setKeterangan("");
    setActiveTab("data"); // switch to log to let users verify the registration
  };

  const filteredRecords = records.filter((rec) => {
    const q = searchQuery.toLowerCase();
    return (
      rec.idEartagInduk.toLowerCase().includes(q) ||
      rec.namaPeternak.toLowerCase().includes(q) ||
      rec.rumpunTernak.toLowerCase().includes(q) ||
      rec.kecamatan.toLowerCase().includes(q) ||
      rec.desa.toLowerCase().includes(q) ||
      rec.namaPetugas.toLowerCase().includes(q)
    );
  });

  return (
    <div id="penandaan_panel" className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Module Title / Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-800 px-6 py-5 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Tag className="w-6 h-6 text-amber-300" />
            <h2 className="text-xl font-bold tracking-tight">Penandaan & Registrasi Eartag Ternak</h2>
          </div>
          <p className="text-xs text-slate-200 mt-1">
            Pemasangan Eartag, Identitas Ternak, Kepemilikan, dan Lokasi Geografis Kabupaten Berau
          </p>
        </div>
        <div className="flex bg-emerald-900/40 p-1 rounded-xl border border-emerald-700/60 self-stretch md:self-auto">
          <button
            id="penandaan_tab_form"
            onClick={() => setActiveTab("form")}
            className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "form" ? "bg-white text-emerald-950 shadow-sm" : "hover:text-emerald-100"
            }`}
          >
            <Plus className="w-3.5 h-3.5 inline mr-1 align-text-bottom" />
            Isi Formulir
          </button>
          <button
            id="penandaan_tab_data"
            onClick={() => setActiveTab("data")}
            className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "data" ? "bg-white text-emerald-950 shadow-sm" : "hover:text-emerald-100"
            }`}
          >
            <Table className="w-3.5 h-3.5 inline mr-1 align-text-bottom" />
            Daftar Log ({records.length})
          </button>
        </div>
      </div>

      {notif && (
        <div className="mx-6 mt-4 p-3.5 bg-emerald-50 border-l-4 border-emerald-600 rounded text-sm text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{notif}</span>
        </div>
      )}

      {activeTab === "form" ? (
        <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
          {/* Section 1: Data Petugas */}
          <div>
            <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-widest border-b pb-2 mb-4">
              I. DATA PETUGAS PELAKSANA (PREFILLED)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase">Nama Petugas</p>
                <p className="text-sm font-bold text-slate-800 mt-1">{currentUser.namaPetugas}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase">NIK Petugas</p>
                <p className="text-sm font-semibold text-slate-800 mt-1">{currentUser.nikPetugas || "-"}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase">Nomor Telepon</p>
                <p className="text-sm font-semibold text-slate-800 mt-1">{currentUser.nomorTelponPetugas || "-"}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Data Ternak */}
          <div>
            <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-widest border-b pb-2 mb-4">
              II. FORMULIR IDENTITAS & RUMPUN TERNAK
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Tanggal Penandaan *
                </label>
                <input
                  id="form_tgl_penandaan"
                  type="date"
                  required
                  value={tanggalPenandaan}
                  onChange={(e) => setTanggalPenandaan(e.target.value)}
                  className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Tanggal Lahir Induk
                </label>
                <input
                  id="form_tgl_lahir_induk"
                  type="date"
                  value={tanggalLahirInduk}
                  onChange={(e) => setTanggalLahirInduk(e.target.value)}
                  className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  ID Eartag Induk (Nomor Eartag Betina) *
                </label>
                <input
                  id="form_id_eartag"
                  type="text"
                  required
                  placeholder="Contoh: E-00124"
                  value={idEartagInduk}
                  onChange={(e) => setIdEartagInduk(e.target.value)}
                  className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Jenis Kelamin Ternak
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center text-sm gap-2 bg-slate-50 py-2 px-4 rounded-xl border border-slate-200 cursor-pointer flex-1 justify-center">
                    <input
                      id="form_kelamin_betina"
                      type="radio"
                      name="jenis_kelamin"
                      checked={jenisKelamin === "Betina"}
                      onChange={() => setJenisKelamin("Betina")}
                      className="text-emerald-700 accent-emerald-700"
                    />
                    <span>Betina (Induk)</span>
                  </label>
                  <label className="flex items-center text-sm gap-2 bg-slate-50 py-2 px-4 rounded-xl border border-slate-200 cursor-pointer flex-1 justify-center">
                    <input
                      id="form_kelamin_jantan"
                      type="radio"
                      name="jenis_kelamin"
                      checked={jenisKelamin === "Jantan"}
                      onChange={() => setJenisKelamin("Jantan")}
                      className="text-emerald-700 accent-emerald-700"
                    />
                    <span>Jantan</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Rumpun Ternak Induk
                </label>
                <select
                  id="form_rumpun_ternak"
                  value={rumpunTernakSelected}
                  onChange={(e) => setRumpunTernakSelected(e.target.value)}
                  className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {RUMPUN_TERNAK_PRESETS.map((preset) => (
                    <option key={preset} value={preset}>{preset}</option>
                  ))}
                  <option value="LAIN_LAIN">Tulis Rumpun Lain Lain...</option>
                </select>
              </div>

              {rumpunTernakSelected === "LAIN_LAIN" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Tulis Nama Rumpun Baru *
                  </label>
                  <input
                    id="form_rumpun_kustom"
                    type="text"
                    required
                    placeholder="Masukkan rumpun baru"
                    value={rumpunKustom}
                    onChange={(e) => setRumpunKustom(e.target.value)}
                    className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Foto Eartag Induk (Foto Eartag Betina)
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100/50 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                          <Upload className="w-6 h-6 text-slate-400 mb-2" />
                          <p className="text-xs text-slate-500 font-medium">Unggah Berkas/Foto</p>
                          <p className="text-[10px] text-slate-400 mt-1">PNG, JPG (Diminimalkan Otomatis)</p>
                        </div>
                        <input
                          id="form_upload_photo"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePhotoUpload}
                        />
                      </label>
                    </div>
                  </div>
                  {fotoEartagInduk && (
                    <div className="shrink-0 border rounded-2xl p-2 bg-slate-50 select-none">
                      <img
                        id="form_preview_photo"
                        src={fotoEartagInduk}
                        alt="Eartag preview"
                        className="w-24 h-24 object-cover rounded-xl"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={() => setFotoEartagInduk("")}
                        className="text-[10px] text-red-500 hover:underline block text-center mt-1"
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Data Peternak & Lokasi */}
          <div>
            <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-widest border-b pb-2 mb-4">
              III. DATA PETERNAK, TUJUAN PEMELIHARAAN & GEOGRAFIS (BERAU)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Nama Pemilik Ternak (Peternak) *
                </label>
                <input
                  id="form_peternak_name"
                  type="text"
                  required
                  placeholder="Masukkan nama lengkap peternak"
                  value={namaPeternak}
                  onChange={(e) => setNamaPeternak(e.target.value)}
                  className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  NIK Peternak
                </label>
                <input
                  id="form_peternak_nik"
                  type="text"
                  maxLength={16}
                  placeholder="Masukkan 16 digit NIK"
                  value={nikPeternak}
                  onChange={(e) => setNikPeternak(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Nomor HP Peternak
                </label>
                <input
                  id="form_peternak_phone"
                  type="tel"
                  placeholder="Contoh: 081234567"
                  value={nomorTelponPeternak}
                  onChange={(e) => setNomorTelponPeternak(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Tujuan Pemeliharaan Ternak
                </label>
                <select
                  id="form_tujuan"
                  value={tujuanPemeliharaan}
                  onChange={(e) => setTujuanPemeliharaan(e.target.value as any)}
                  className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Pembibitan">Pembibitan (Semen Penjantan/Keturunan)</option>
                  <option value="Pengemukan">Penggemukan (Daging)</option>
                  <option value="Pembiakan">Pembiakan (Produktivitas Reproduksi)</option>
                </select>
              </div>

              {/* Geografis default */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Propinsi (Locked)
                </label>
                <input
                  type="text"
                  disabled
                  value="Kalimantan Timur"
                  className="w-full text-sm py-2 px-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Kabupaten (Locked)
                </label>
                <input
                  type="text"
                  disabled
                  value="Berau"
                  className="w-full text-sm py-2 px-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Kecamatan di Berau *
                </label>
                <select
                  id="form_kecamatan"
                  value={kecamatan}
                  onChange={handleKecamatanChange}
                  className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {Object.keys(KECAMATAN_BERAU).map((kec) => (
                    <option key={kec} value={kec}>{kec}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Desa/Kampung di Berau *
                </label>
                <select
                  id="form_desa"
                  value={desa}
                  onChange={(e) => setDesa(e.target.value)}
                  className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {(KECAMATAN_BERAU[kecamatan] || []).map((village) => (
                    <option key={village} value={village}>{village}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Keterangan Tambahan
            </label>
            <textarea
              id="form_keterangan"
              rows={3}
              placeholder="Berikan keterangan tambahan jika ada..."
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-4 border-t flex justify-end">
            <button
              id="btn_save_penandaan"
              type="submit"
              className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-2 shadow-sm shadow-emerald-700/20 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Simpan Registrasi Eartag
            </button>
          </div>
        </form>
      ) : (
        <div className="p-6">
          {/* Search bar */}
          <div className="mb-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </div>
            <input
              id="search_penandaan"
              type="text"
              placeholder="Cari ID Eartag, Peternak, Rumpun, atau Desa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm py-2 pl-9 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          <div className="overflow-x-auto border rounded-2xl border-slate-100">
            <table className="min-w-full divide-y divide-slate-100 text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">No Eartag Induk</th>
                  <th className="px-4 py-3.5">Foto</th>
                  <th className="px-4 py-3.5">Tanggal Pasang</th>
                  <th className="px-4 py-3.5">Rumpun</th>
                  <th className="px-4 py-3.5">Peternak / Pemilik</th>
                  <th className="px-4 py-3.5">Wilayah (Kec / Desa)</th>
                  <th className="px-4 py-3.5">Petugas Pelaksana</th>
                  <th className="px-4 py-3.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-400 italic">
                      Tidak ada rekaman data Penandaan Ternak.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{rec.idEartagInduk}</td>
                      <td className="px-4 py-3">
                        {rec.fotoEartagInduk ? (
                          <img
                            src={rec.fotoEartagInduk}
                            alt="Eartag"
                            className="w-10 h-10 object-cover rounded-lg border shadow-sm"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 select-none">
                            -
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">{rec.tanggalPenandaan}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-medium">
                          {rec.rumpunTernak}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-700">{rec.namaPeternak}</p>
                        <p className="text-[10px] text-slate-400">NIK: {rec.nikPeternak || "-"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-700">{rec.kecamatan}</p>
                        <p className="text-[10px] text-slate-500">{rec.desa}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        <p className="font-medium">{rec.namaPetugas}</p>
                        <p className="text-[10px]">{rec.nikPetugas}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {deleteConfirmId === rec.id ? (
                          <div className="flex items-center justify-center gap-1.5 min-w-[100px]">
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteRecord(rec.id);
                                setDeleteConfirmId(null);
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold py-1 px-2.5 rounded-lg shadow-sm transition-all cursor-pointer"
                            >
                              Yakin
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(null)}
                              className="bg-slate-200 hover:bg-slate-300 text-slate-600 text-[10px] font-semibold py-1 px-2 rounded-lg transition-all cursor-pointer"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(rec.id)}
                            className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition-colors cursor-pointer"
                            title="Hapus"
                          >
                            <Trash className="w-4 h-4 mx-auto" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
