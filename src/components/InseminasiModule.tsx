import React, { useState } from "react";
import { Plus, Table, Trash, Search, Save, CheckCircle, Disc } from "lucide-react";
import { KECAMATAN_BERAU, RUMPUN_TERNAK_PRESETS, InseminasiBuatan } from "../types";

interface InseminasiModuleProps {
  currentUser: any;
  records: InseminasiBuatan[];
  onAddRecord: (newRecord: InseminasiBuatan) => void;
  onDeleteRecord: (id: string) => void;
}

export default function InseminasiModule({ currentUser, records, onAddRecord, onDeleteRecord }: InseminasiModuleProps) {
  const [activeTab, setActiveTab] = useState<"form" | "data">("form");
  const [searchQuery, setSearchQuery] = useState("");

  // Form states
  const [tanggalIb, setTanggalIb] = useState(new Date().toISOString().split("T")[0]);
  const [idEartagInduk, setIdEartagInduk] = useState("");
  const [rumpunInduk, setRumpunInduk] = useState(RUMPUN_TERNAK_PRESETS[0]);
  const [rumpunIndukKustom, setRumpunIndukKustom] = useState("");
  const [ibKe, setIbKe] = useState("1");
  const [kodeProduksi, setKodeProduksi] = useState("");
  const [kodeJantan, setKodeJantan] = useState("");
  const [rumpunPenjantan, setRumpunPenjantan] = useState(RUMPUN_TERNAK_PRESETS[0]);
  const [rumpunPenjantanKustom, setRumpunPenjantanKustom] = useState("");
  const [produk, setProduk] = useState("");
  const [namaPeternak, setNamaPeternak] = useState("");
  const [nikPeternak, setNikPeternak] = useState("");
  const [nomorTelponPeternak, setNomorTelponPeternak] = useState("");
  const [kecamatan, setKecamatan] = useState(Object.keys(KECAMATAN_BERAU)[0]);
  const [desa, setDesa] = useState(KECAMATAN_BERAU[Object.keys(KECAMATAN_BERAU)[0]][0]);
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
    if (!idEartagInduk || !namaPeternak) {
      alert("ID Eartag Induk dan Nama Peternak wajib diisi!");
      return;
    }

    const finalRumpunInduk = rumpunInduk === "LAIN_LAIN" ? (rumpunIndukKustom || "Rumpun Kustom") : rumpunInduk;
    const finalRumpunPenjantan = rumpunPenjantan === "LAIN_LAIN" ? (rumpunPenjantanKustom || "Rumpun Kustom") : rumpunPenjantan;

    const newRecord: InseminasiBuatan = {
      id: `ib_${Date.now()}`,
      namaPetugas: currentUser.namaPetugas || "Nama Petugas",
      nikPetugas: currentUser.nikPetugas || "NIK Petugas",
      tanggalIb,
      idEartagInduk: idEartagInduk.trim().toUpperCase(),
      rumpunInduk: finalRumpunInduk.toUpperCase(),
      ibKe,
      kodeProduksi: kodeProduksi.trim().toUpperCase(),
      kodeJantan: kodeJantan.trim().toUpperCase(),
      rumpunPenjantan: finalRumpunPenjantan.toUpperCase(),
      produk: produk.trim(),
      namaPeternak: namaPeternak.trim(),
      nikPeternak: nikPeternak.trim(),
      nomorTelponPeternak: nomorTelponPeternak.trim(),
      propinsi: "Kalimantan Timur",
      kabupaten: "Berau",
      kecamatan,
      desa,
      statusTernak,
      keterangan: keterangan.trim(),
      createdAt: new Date().toISOString()
    };

    onAddRecord(newRecord);
    setNotif("Tindakan Inseminasi Buatan (IB) berhasil disimpan!");
    setTimeout(() => setNotif(""), 4000);

    // Reset simple values
    setIdEartagInduk("");
    setIbKe("1");
    setKodeProduksi("");
    setKodeJantan("");
    setProduk("");
    setNamaPeternak("");
    setNikPeternak("");
    setNomorTelponPeternak("");
    setKeterangan("");
    setActiveTab("data");
  };

  const filteredRecords = records.filter((rec) => {
    const q = searchQuery.toLowerCase();
    return (
      rec.idEartagInduk.toLowerCase().includes(q) ||
      rec.namaPeternak.toLowerCase().includes(q) ||
      rec.rumpunInduk.toLowerCase().includes(q) ||
      rec.kecamatan.toLowerCase().includes(q) ||
      rec.desa.toLowerCase().includes(q) ||
      rec.kodeJantan.toLowerCase().includes(q)
    );
  });

  return (
    <div id="inseminasi_panel" className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-800 px-6 py-5 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Disc className="w-6 h-6 text-amber-300" />
            <h2 className="text-xl font-bold tracking-tight">Tindakan Pelayanan Inseminasi Buatan (IB)</h2>
          </div>
          <p className="text-xs text-slate-200 mt-1">
            Pencatatan Perkawinan Buatan (IB), Straw Penjantan unggul, dan Identifikasi Induk Betina di Berau
          </p>
        </div>
        <div className="flex bg-emerald-900/40 p-1 rounded-xl border border-emerald-700/60 self-stretch md:self-auto">
          <button
            id="ib_tab_form"
            onClick={() => setActiveTab("form")}
            className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "form" ? "bg-white text-emerald-950 shadow-sm" : "hover:text-emerald-100"
            }`}
          >
            <Plus className="w-3.5 h-3.5 inline mr-1 align-text-bottom" />
            Isi DATA IB
          </button>
          <button
            id="ib_tab_data"
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
              I. DATA INSEMINATOR LAPANGAN (PREFILLED)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase">Nama Inseminator</p>
                <p className="text-sm font-bold text-slate-800 mt-1">{currentUser.namaPetugas}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase">NIK Inseminator</p>
                <p className="text-sm font-semibold text-slate-800 mt-1">{currentUser.nikPetugas || "-"}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Data Perkawinan */}
          <div>
            <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-widest border-b pb-2 mb-4">
              II. TINDAKAN INSEMINASI BUATAN (STAW & INDUK)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Tanggal Kegiatan IB *
                </label>
                <input
                  id="form_ib_tgl"
                  type="date"
                  required
                  value={tanggalIb}
                  onChange={(e) => setTanggalIb(e.target.value)}
                  className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  ID Eartag Induk (Nomor Eartag Betina) *
                </label>
                <input
                  id="form_ib_eartag"
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
                  Rumpun Induk Betina
                </label>
                <select
                  id="form_ib_rumpun_induk"
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
                    id="form_ib_rumpun_induk_kustom"
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
                  Inseminasi Buatan Ke- (IB Ke)
                </label>
                <input
                  id="form_ib_ke"
                  type="number"
                  min={1}
                  required
                  value={ibKe}
                  onChange={(e) => setIbKe(e.target.value)}
                  className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Kode Produksi Straw
                </label>
                <input
                  id="form_ib_kode_produksi"
                  type="text"
                  placeholder="Contoh: PROD9981"
                  value={kodeProduksi}
                  onChange={(e) => setKodeProduksi(e.target.value)}
                  className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Kode Penjantan Straw *
                </label>
                <input
                  id="form_ib_kode_jantan"
                  type="text"
                  required
                  placeholder="Contoh: SIM-1244"
                  value={kodeJantan}
                  onChange={(e) => setKodeJantan(e.target.value)}
                  className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Rumpun Penjantan Straw
                </label>
                <select
                  id="form_ib_rumpun_penjantan"
                  value={rumpunPenjantan}
                  onChange={(e) => setRumpunPenjantan(e.target.value)}
                  className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {RUMPUN_TERNAK_PRESETS.map((preset) => (
                    <option key={preset} value={preset}>{preset}</option>
                  ))}
                  <option value="LAIN_LAIN">Tulis Rumpun Lain Lain...</option>
                </select>
              </div>

              {rumpunPenjantan === "LAIN_LAIN" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Tulis Rumpun Penjantan Baru *
                  </label>
                  <input
                    id="form_ib_rumpun_penjantan_kustom"
                    type="text"
                    required
                    placeholder="Masukkan rumpun penjantan baru"
                    value={rumpunPenjantanKustom}
                    onChange={(e) => setRumpunPenjantanKustom(e.target.value)}
                    className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Produk Semen / Instansi Penyedia
                </label>
                <input
                  id="form_ib_produk"
                  type="text"
                  placeholder="Contoh: BIB Lembang / BIB Singosari"
                  value={produk}
                  onChange={(e) => setProduk(e.target.value)}
                  className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Status Terkait Identik PKH
                </label>
                <select
                  id="form_ib_status_pkh"
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

          {/* Section 3: Data Peternak & Lokasi */}
          <div>
            <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-widest border-b pb-2 mb-4">
              III. DATA PETERNAK & ALAMAT
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Nama Peternak *
                </label>
                <input
                  id="form_ib_peternak_name"
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
                  id="form_ib_peternak_nik"
                  type="text"
                  maxLength={16}
                  placeholder="16-digit NIK peternak"
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
                  id="form_ib_peternak_phone"
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
                  id="form_ib_kecamatan"
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
                  id="form_ib_desa"
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
              id="form_ib_keterangan"
              rows={3}
              placeholder="Berikan keterangan tambahan jika ada..."
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-4 border-t flex justify-end">
            <button
              id="btn_save_ib"
              type="submit"
              className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-2 shadow-sm shadow-emerald-700/20 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Simpan Tindakan IB
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
              id="search_ib"
              type="text"
              placeholder="Cari ID Induk, Peternak, Kode Jantan, atau Desa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm py-2 pl-9 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          <div className="overflow-x-auto border rounded-2xl border-slate-100">
            <table className="min-w-full divide-y divide-slate-100 text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider font-sans">
                <tr>
                  <th className="px-4 py-3.5">Eartag Induk</th>
                  <th className="px-4 py-3.5">Tanggal IB (Ke)</th>
                  <th className="px-4 py-3.5">Rumpun Induk</th>
                  <th className="px-4 py-3.5">Identitas Straw (Kode)</th>
                  <th className="px-4 py-3.5">Rumpun Penjantan</th>
                  <th className="px-4 py-3.5">Peternak / Pemilik</th>
                  <th className="px-4 py-3.5">Kecamatan / Desa</th>
                  <th className="px-4 py-3.5">Status PKH</th>
                  <th className="px-4 py-3.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-slate-400 italic">
                      Tidak ada rekaman data Inseminasi Buatan (IB).
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{rec.idEartagInduk}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-700">{rec.tanggalIb}</p>
                        <p className="text-[10px] text-emerald-700">IB Ke-{rec.ibKe}</p>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-600">{rec.rumpunInduk}</td>
                      <td className="px-4 py-3">
                        <p className="font-mono font-bold text-teal-800">C: {rec.kodeJantan}</p>
                        <p className="text-[10px] text-slate-400">P: {rec.kodeProduksi || "-"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-medium">{rec.rumpunPenjantan}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-700">{rec.namaPeternak}</p>
                        <p className="text-[10px] text-slate-400">HP: {rec.nomorTelponPeternak || "-"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-700">{rec.kecamatan}</p>
                        <p className="text-[10px] text-slate-400">{rec.desa}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rec.statusTernak.includes("Belum") 
                            ? "bg-amber-50 text-amber-800 border border-amber-200" 
                            : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        }`}>
                          {rec.statusTernak.includes("Belum") ? "BELUM PKH" : "TERDAFTAR PKH"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm("Hapus data tindakan IB ini?")) {
                              onDeleteRecord(rec.id);
                            }
                          }}
                          className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash className="w-4 h-4 mx-auto" />
                        </button>
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
