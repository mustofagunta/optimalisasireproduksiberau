import React, { useState } from "react";
import { Plus, Table, Trash, Search, Save, CheckCircle, Baby } from "lucide-react";
import { KECAMATAN_BERAU, RUMPUN_TERNAK_PRESETS, KelahiranTernak } from "../types";

interface KelahiranModuleProps {
  currentUser: any;
  records: KelahiranTernak[];
  onAddRecord: (newRecord: KelahiranTernak) => void;
  onDeleteRecord: (id: string) => void;
}

export default function KelahiranModule({ currentUser, records, onAddRecord, onDeleteRecord }: KelahiranModuleProps) {
  const [activeTab, setActiveTab] = useState<"form" | "data">("form");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [tanggalLahirAnak, setTanggalLahirAnak] = useState(new Date().toISOString().split("T")[0]);
  const [idEartagInduk, setIdEartagInduk] = useState("");
  const [rumpunInduk, setRumpunInduk] = useState(RUMPUN_TERNAK_PRESETS[0]);
  const [rumpunIndukKustom, setRumpunIndukKustom] = useState("");
  const [kategoriTernak, setKategoriTernak] = useState("Sapi Potong");
  const [programTernak, setProgramTernak] = useState("Pembiakan");
  const [umurInduk, setUmurInduk] = useState("4 Tahun");
  const [namaPeternak, setNamaPeternak] = useState("");
  const [nikPeternak, setNikPeternak] = useState("");
  const [nomorTelponPeternak, setNomorTelponPeternak] = useState("");
  const [kecamatan, setKecamatan] = useState(Object.keys(KECAMATAN_BERAU)[0]);
  const [desa, setDesa] = useState(KECAMATAN_BERAU[Object.keys(KECAMATAN_BERAU)[0]][0]);
  const [jenisPerkawinan, setJenisPerkawinan] = useState<"Inseminasi" | "Alami" | "Transfer Embrio">("Inseminasi");
  const [nomorEartagAnak, setNomorEartagAnak] = useState("");
  const [jenisKelaminAnak, setJenisKelaminAnak] = useState<"Jantan" | "Betina">("Jantan");
  const [jenisRumpunAnak, setJenisRumpunAnak] = useState(RUMPUN_TERNAK_PRESETS[0]);
  const [jenisRumpunAnakKustom, setJenisRumpunAnakKustom] = useState("");
  const [statusTernak, setStatusTernak] = useState<"sudah Terdaftar di identik PKH" | "Belum Terdaftar di identik PKH">("Belum Terdaftar di identik PKH");
  const [keterangan, setKeterangan] = useState("");

  const [notif, setNotif] = useState("");

  const handleKecamatanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newKec = e.target.value;
    setKecamatan(newKec);
    setDesa(KECAMATAN_BERAU[newKec][0]);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idEartagInduk || !nomorEartagAnak || !namaPeternak) {
      alert("ID Eartag Induk, Eartag Anak, dan Nama Peternak wajib diisi!");
      return;
    }

    const finalRumpunInduk = rumpunInduk === "LAIN_LAIN" ? (rumpunIndukKustom || "Rumpun Kustom") : rumpunInduk;
    const finalRumpunAnak = jenisRumpunAnak === "LAIN_LAIN" ? (jenisRumpunAnakKustom || "Rumpun Kustom") : jenisRumpunAnak;

    const newRecord: KelahiranTernak = {
      id: `birth_${Date.now()}`,
      namaPetugas: currentUser.namaPetugas || "Nama Petugas",
      nikPetugas: currentUser.nikPetugas || "NIK Petugas",
      tanggalLahirAnak,
      idEartagInduk: idEartagInduk.trim().toUpperCase(),
      rumpunInduk: finalRumpunInduk.toUpperCase(),
      kategoriTernak,
      programTernak,
      umurInduk,
      namaPeternak: namaPeternak.trim(),
      nikPeternak: nikPeternak.trim(),
      nomorTelponPeternak: nomorTelponPeternak.trim(),
      propinsi: "Kalimantan Timur",
      kabupaten: "Berau",
      kecamatan,
      desa,
      jenisPerkawinan,
      nomorEartagAnak: nomorEartagAnak.trim().toUpperCase(),
      jenisKelaminAnak,
      jenisRumpunTernakAnak: finalRumpunAnak.toUpperCase(),
      statusTernak,
      keterangan: keterangan.trim(),
      createdAt: new Date().toISOString()
    };

    onAddRecord(newRecord);
    setNotif("Log Pencatatan Kelahiran Anak Ternak (Pedet) berhasil saved!");
    setTimeout(() => setNotif(""), 4000);

    // Reset simple values
    setIdEartagInduk("");
    setNomorEartagAnak("");
    setNamaPeternak("");
    setNikPeternak("");
    setNomorTelponPeternak("");
    setKeterangan("");
    setActiveTab("data");
  };

  const filteredRecords = records.filter((rec) => {
    const q = searchQuery.toLowerCase();
    return (
      rec.nomorEartagAnak.toLowerCase().includes(q) ||
      rec.idEartagInduk.toLowerCase().includes(q) ||
      rec.namaPeternak.toLowerCase().includes(q) ||
      rec.jenisRumpunTernakAnak.toLowerCase().includes(q) ||
      rec.kecamatan.toLowerCase().includes(q) ||
      rec.desa.toLowerCase().includes(q)
    );
  });

  return (
    <div id="kelahiran_panel" className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-800 px-6 py-5 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Baby className="w-6 h-6 text-amber-300" />
            <h2 className="text-xl font-bold tracking-tight">Kelahiran Anak Ternak (Pedet/Cempe)</h2>
          </div>
          <p className="text-xs text-slate-200 mt-1">
            Log kelahiran anak ternak baru, penandaan eartag anak, jenis perkawinan asal, dan produktivitas peternakan Berau
          </p>
        </div>
        <div className="flex bg-emerald-900/40 p-1 rounded-xl border border-emerald-700/60 self-stretch md:self-auto">
          <button
            id="birth_tab_form"
            onClick={() => setActiveTab("form")}
            className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "form" ? "bg-white text-emerald-950 shadow-sm" : "hover:text-emerald-100"
            }`}
          >
            <Plus className="w-3.5 h-3.5 inline mr-1 align-text-bottom" />
            Isi Log Kelahiran
          </button>
          <button
            id="birth_tab_data"
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
              I. DATA PETUGAS PELAPOR (PREFILLED)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase">Nama Petugas</p>
                <p className="text-sm font-bold text-slate-800 mt-1">{currentUser.namaPetugas}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase">NIK Petugas</p>
                <p className="text-sm font-semibold text-slate-800 mt-1">{currentUser.nikPetugas || "-"}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Log Kelahiran Anak */}
          <div>
            <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-widest border-b pb-2 mb-4">
              II. DATA KELAHIRAN & DATA FISIK ANAK TERNAK (PEDET)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Tanggal Lahir Anak *
                </label>
                <input
                  id="form_birth_tgl"
                  type="date"
                  required
                  value={tanggalLahirAnak}
                  onChange={(e) => setTanggalLahirAnak(e.target.value)}
                  className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Nomor Eartag Anak (Pedet Baru) *
                </label>
                <input
                  id="form_birth_child_eartag"
                  type="text"
                  required
                  placeholder="Contoh: E-ANC-008"
                  value={nomorEartagAnak}
                  onChange={(e) => setNomorEartagAnak(e.target.value)}
                  className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Jenis Kelamin Anak
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center text-sm gap-2 bg-slate-50 py-2 px-4 rounded-xl border border-slate-200 cursor-pointer flex-1 justify-center">
                    <input
                      id="form_birth_gender_jantan"
                      type="radio"
                      name="child_gender"
                      checked={jenisKelaminAnak === "Jantan"}
                      onChange={() => setJenisKelaminAnak("Jantan")}
                      className="text-emerald-700 accent-emerald-700"
                    />
                    <span>Jantan</span>
                  </label>
                  <label className="flex items-center text-sm gap-2 bg-slate-50 py-2 px-4 rounded-xl border border-slate-200 cursor-pointer flex-1 justify-center">
                    <input
                      id="form_birth_gender_betina"
                      type="radio"
                      name="child_gender"
                      checked={jenisKelaminAnak === "Betina"}
                      onChange={() => setJenisKelaminAnak("Betina")}
                      className="text-emerald-700 accent-emerald-700"
                    />
                    <span>Betina</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Rumpun Ternak Anak
                </label>
                <select
                  id="form_birth_rumpun_anak"
                  value={jenisRumpunAnak}
                  onChange={(e) => setJenisRumpunAnak(e.target.value)}
                  className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {RUMPUN_TERNAK_PRESETS.map((preset) => (
                    <option key={preset} value={preset}>{preset}</option>
                  ))}
                  <option value="LAIN_LAIN">Tulis Rumpun Lain Lain...</option>
                </select>
              </div>

              {jenisRumpunAnak === "LAIN_LAIN" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Tulis Rumpun Anak Baru *
                  </label>
                  <input
                    id="form_birth_rumpun_anak_kustom"
                    type="text"
                    required
                    placeholder="Masukkan rumpun anak baru"
                    value={jenisRumpunAnakKustom}
                    onChange={(e) => setJenisRumpunAnakKustom(e.target.value)}
                    className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  ID Eartag Induk (Nomor Eartag Betina) *
                </label>
                <input
                  id="form_birth_induk_eartag"
                  type="text"
                  required
                  placeholder="Eartag Induk Betina"
                  value={idEartagInduk}
                  onChange={(e) => setIdEartagInduk(e.target.value)}
                  className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Rumpun Induk
                </label>
                <select
                  id="form_birth_rumpun_induk"
                  value={rumpunInduk}
                  onChange={(e) => setRumpunInduk(e.target.value)}
                  className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {RUMPUN_TERNAK_PRESETS.map((preset) => (
                    <option key={preset} value={preset}>{preset}</option>
                  ))}
                  <option value="LAIN_LAIN">Tulis Rumpun Lain Lain...</option>
                </select>
              </div>

              {rumpunInduk === "LAIN_LAIN" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Tulis Rumpun Induk Baru *
                  </label>
                  <input
                    id="form_birth_rumpun_induk_kustom"
                    type="text"
                    required
                    placeholder="Masukkan rumpun induk baru"
                    value={rumpunIndukKustom}
                    onChange={(e) => setRumpunIndukKustom(e.target.value)}
                    className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Umur Induk Betina
                </label>
                <input
                  id="form_birth_induk_umur"
                  type="text"
                  placeholder="Contoh: 4 Tahun"
                  value={umurInduk}
                  onChange={(e) => setUmurInduk(e.target.value)}
                  className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Kategori Ternak
                </label>
                <input
                  id="form_birth_kategori"
                  type="text"
                  value={kategoriTernak}
                  onChange={(e) => setKategoriTernak(e.target.value)}
                  className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Program Ternak
                </label>
                <input
                  id="form_birth_program"
                  type="text"
                  value={programTernak}
                  onChange={(e) => setProgramTernak(e.target.value)}
                  className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Asal Jenis Perkawinan
                </label>
                <select
                  id="form_birth_asal_kawin"
                  value={jenisPerkawinan}
                  onChange={(e) => setJenisPerkawinan(e.target.value as any)}
                  className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Inseminasi">Inseminasi (IB / Semen Beku)</option>
                  <option value="Alami">Kawin Alami</option>
                  <option value="Transfer Embrio">Transfer Embrio (TE / Bayi Tabung)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Status Terdaftar PKH
                </label>
                <select
                  id="form_birth_status_pkh"
                  value={statusTernak}
                  onChange={(e) => setStatusTernak(e.target.value as any)}
                  className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="sudah Terdaftar di identik PKH">Sudah Terdaftar di Identik PKH</option>
                  <option value="Belum Terdaftar di identik PKH">Belum Terdaftar di Identik PKH</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Peternak */}
          <div>
            <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-widest border-b pb-2 mb-4">
              III. DATA PETERNAK (MILIK) & GEOGRAFIS (BERAU)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Nama Peternak Pemegang *
                </label>
                <input
                  id="form_birth_peternak_name"
                  type="text"
                  required
                  placeholder="Nama pemilik peternak"
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
                  id="form_birth_peternak_nik"
                  type="text"
                  maxLength={16}
                  placeholder="NIK 16 digit"
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
                  id="form_birth_peternak_phone"
                  type="tel"
                  placeholder="Nomor Telepon Peternak"
                  value={nomorTelponPeternak}
                  onChange={(e) => setNomorTelponPeternak(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Kecamatan di Berau *
                </label>
                <select
                  id="form_birth_kecamatan"
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
                  id="form_birth_desa"
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
              Keterangan Kondisi Lahir / Perkembangan Anak Ternak
            </label>
            <textarea
              id="form_birth_keterangan"
              rows={3}
              placeholder="Misal: Lahir sehat, berat lahir normal, berdiri stabil..."
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-4 border-t flex justify-end">
            <button
              id="btn_save_birth"
              type="submit"
              className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-2 shadow-sm shadow-emerald-700/20 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Simpan Kelahiran Anak
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
              id="search_birth"
              type="text"
              placeholder="Cari ID Anak, ID Induk, Peternak, Kecamatan/Desa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm py-2 pl-9 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          <div className="overflow-x-auto border rounded-2xl border-slate-100">
            <table className="min-w-full divide-y divide-slate-100 text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Eartag Anak (Pedet)</th>
                  <th className="px-4 py-3.5">Jenis Kelamin</th>
                  <th className="px-5 py-3.5">Tanggal Lahir</th>
                  <th className="px-4 py-3.5">Eartag Induk Betina</th>
                  <th className="px-4 py-3.5">Rumpun Anak</th>
                  <th className="px-4 py-3.5">Asal Perkawinan</th>
                  <th className="px-4 py-3.5">Peternak / Pemilik</th>
                  <th className="px-4 py-3.5">Geografis (Kec / Desa)</th>
                  <th className="px-4 py-3.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-slate-400 italic">
                      Tidak ada rekaman log Kelahiran Anak Ternak.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-emerald-900">{rec.nomorEartagAnak}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rec.jenisKelaminAnak === "Jantan"
                            ? "bg-blue-50 text-blue-800"
                            : "bg-pink-50 text-pink-850"
                        }`}>
                          {rec.jenisKelaminAnak.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-semibold text-slate-700">{rec.tanggalLahirAnak}</td>
                      <td className="px-4 py-3 font-mono text-slate-600">{rec.idEartagInduk}</td>
                      <td className="px-4 py-3 font-medium text-slate-600">{rec.jenisRumpunTernakAnak}</td>
                      <td className="px-4 py-3 text-slate-500 font-medium">{rec.jenisPerkawinan}</td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-700">{rec.namaPeternak}</p>
                        <p className="text-[10px] text-slate-400">Tel: {rec.nomorTelponPeternak || "-"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-700">{rec.kecamatan}</p>
                        <p className="text-[10px] text-slate-400">{rec.desa}</p>
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
