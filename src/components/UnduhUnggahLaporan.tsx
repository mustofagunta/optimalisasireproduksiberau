import React, { useState } from "react";
import { Download, Upload, AlertCircle, CheckCircle, FileSpreadsheet, Loader } from "lucide-react";
import * as XLSX from "xlsx";
import { 
  PenandaanTernak, 
  InseminasiBuatan, 
  PemeriksaanKebuntingan, 
  KelahiranTernak,
  KECAMATAN_BERAU,
  RUMPUN_TERNAK_PRESETS
} from "../types";

interface UnduhUnggahLaporanProps {
  currentUser: any;
  onBulkInsertPenandaan: (items: PenandaanTernak[]) => void;
  onBulkInsertInseminasi: (items: InseminasiBuatan[]) => void;
  onBulkInsertKebuntingan: (items: PemeriksaanKebuntingan[]) => void;
  onBulkInsertKelahiran: (items: KelahiranTernak[]) => void;
  
  // Current values to export
  penandaanRecords: PenandaanTernak[];
  inseminasiRecords: InseminasiBuatan[];
  kebuntinganRecords: PemeriksaanKebuntingan[];
  kelahiranRecords: KelahiranTernak[];
}

type ModuleKey = "penandaan" | "inseminasi" | "kebuntingan" | "kelahiran";

export default function UnduhUnggahLaporan({
  currentUser,
  onBulkInsertPenandaan,
  onBulkInsertInseminasi,
  onBulkInsertKebuntingan,
  onBulkInsertKelahiran,
  penandaanRecords,
  inseminasiRecords,
  kebuntinganRecords,
  kelahiranRecords
}: UnduhUnggahLaporanProps) {
  const [selectedModule, setSelectedModule] = useState<ModuleKey>("penandaan");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [stats, setStats] = useState("");
  const [errorLog, setErrorLog] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Template column schemas
  const columnsMap: Record<ModuleKey, string[]> = {
    penandaan: [
      "Tanggal Penandaan (YYYY-MM-DD)",
      "ID Eartag Induk",
      "Tanggal Lahir Induk (YYYY-MM-DD)",
      "Nama Peternak",
      "NIK Peternak",
      "Tujuan Pemeliharaan (Pembibitan/Pengemukan/Pembiakan)",
      "Nomor Telpon Peternak",
      "Kecamatan",
      "Desa",
      "Rumpun Ternak",
      "Jenis Kelamin (Jantan/Betina)",
      "Keterangan"
    ],
    inseminasi: [
      "Tanggal IB (YYYY-MM-DD)",
      "ID Eartag Induk",
      "Rumpun Induk",
      "IB Ke",
      "Kode Produksi",
      "Kode Jantan",
      "Rumpun Penjantan",
      "Produk",
      "Nama Peternak",
      "NIK Peternak",
      "Nomor Telpon Peternak",
      "Kecamatan",
      "Desa",
      "Status Ternak (sudah Terdaftar di identik PKH/Belum Terdaftar di identik PKH)",
      "Keterangan"
    ],
    kebuntingan: [
      "Tanggal PKB (YYYY-MM-DD)",
      "ID Eartag Induk",
      "Rumpun Induk",
      "Umur Ternak",
      "Kategori Ternak",
      "Jenis Perkawinan (Inseminasi Buatan/Alami)",
      "Umur Kebuntingan (1-9)",
      "Nama Peternak",
      "NIK Peternak",
      "Kecamatan",
      "Desa",
      "Status Ternak (sudah Terdaftar di identik PKH/Belum Terdaftar di identik PKH)",
      "Keterangan"
    ],
    kelahiran: [
      "Tanggal Lahir Anak (YYYY-MM-DD)",
      "ID Eartag Induk",
      "Rumpun Induk",
      "Kategori Ternak",
      "Program Ternak",
      "Umur Induk",
      "Nama Peternak",
      "NIK Peternak",
      "Nomor Telpon Peternak",
      "Kecamatan",
      "Desa",
      "Jenis Perkawinan (Inseminasi/Alami/Transfer Embrio)",
      "Nomor Eartag Anak",
      "Jenis Kelamin Anak (Jantan/Betina)",
      "Jenis Rumpun Anak",
      "Status Ternak (sudah Terdaftar di identik PKH/Belum Terdaftar di identik PKH)",
      "Keterangan"
    ]
  };

  const downloadXlsxTemplate = (key: ModuleKey) => {
    const fileName = `Template_Laporan_Kecamatan_${key}_Berau.xlsx`;
    const headers = columnsMap[key];
    
    // Add 1 row of descriptive instructions
    const sampleRow: Record<string, string> = {};
    headers.forEach((h, idx) => {
      if (h.includes("Tanggal")) {
        sampleRow[h] = "2026-05-31";
      } else if (h.includes("Eartag")) {
        sampleRow[h] = "E-00" + (idx + 1) * 123;
      } else if (h.includes("NIK")) {
        sampleRow[h] = "6403000000000" + idx;
      } else if (h.includes("Kecamatan")) {
        sampleRow[h] = "Batu Putih";
      } else if (h.includes("Desa")) {
        sampleRow[h] = "Batu Putih";
      } else if (h.includes("Rumpun")) {
        sampleRow[h] = "BALI";
      } else if (h.includes("Kelamin")) {
        sampleRow[h] = "Betina";
      } else if (h.includes("Status")) {
        sampleRow[h] = "Belum Terdaftar di identik PKH";
      } else {
        sampleRow[h] = "Isian Contoh " + (idx + 1);
      }
    });

    const worksheet = XLSX.utils.json_to_sheet([sampleRow], { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template Input");
    XLSX.writeFile(workbook, fileName);
  };

  const handleFileUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setErrorLog("");
      setStats("");
    }
  };

  const processBulkUpload = () => {
    if (!uploadedFile) {
      setErrorLog("Silakan unggah dokumen Excel (.xlsx / .xls) terlebih dahulu.");
      return;
    }

    setIsProcessing(true);
    setErrorLog("");
    setStats("");

    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error("Gagal membaca payload berkas.");

        const workbook = XLSX.read(data, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Parse raw rows as key-value JSON
        const rawRows = XLSX.utils.sheet_to_json<any>(worksheet);

        if (rawRows.length === 0) {
          throw new Error("Berkas Excel kosong atau tidak memiliki baris data yang valid.");
        }

        const headersInUpload = Object.keys(rawRows[0]);
        const requiredHeaders = columnsMap[selectedModule];

        // Soft validation on structural headers (check if at least 4 headers match)
        const commonHeadersCount = requiredHeaders.filter(h => headersInUpload.includes(h)).length;
        if (commonHeadersCount < 4) {
          throw new Error(`Format kolom dokumen tidak cocok untuk modul ${selectedModule.toUpperCase()}. Pastikan Anda menggunakan Template yang diunduh.`);
        }

        let addedCount = 0;

        if (selectedModule === "penandaan") {
          const validItems: PenandaanTernak[] = [];
          rawRows.forEach((row, i) => {
            const eartag = (row["ID Eartag Induk"] || "").toString().trim().toUpperCase();
            if (!eartag) return; // skip junk empty eartag rows

            // Auto lookup of kecamatan/desa
            const rawKec = (row["Kecamatan"] || "Batu Putih").toString().trim();
            const rawDesa = (row["Desa"] || "Batu Putih").toString().trim();

            validItems.push({
              id: `tag_excel_${Date.now()}_${i}`,
              namaPetugas: currentUser.namaPetugas,
              nikPetugas: currentUser.nikPetugas || "6403000000000000",
              nomorTelponPetugas: currentUser.nomorTelponPetugas || "08120000",
              tanggalPenandaan: (row["Tanggal Penandaan (YYYY-MM-DD)"] || new Date().toISOString().split("T")[0]).toString().trim(),
              idEartagInduk: eartag,
              fotoEartagInduk: "",
              tanggalLahirInduk: (row["Tanggal Lahir Induk (YYYY-MM-DD)"] || "").toString().trim(),
              namaPeternak: (row["Nama Peternak"] || "Peternak Bulk").toString().trim(),
              nikPeternak: (row["NIK Peternak"] || "").toString().trim(),
              tujuanPemeliharaan: (row["Tujuan Pemeliharaan (Pembibitan/Pengemukan/Pembiakan)"] || "Pembiakan") as any,
              nomorTelponPeternak: (row["Nomor Telpon Peternak"] || "").toString().trim(),
              propinsi: "Kalimantan Timur",
              kabupaten: "Berau",
              kecamatan: rawKec,
              desa: rawDesa,
              rumpunTernak: (row["Rumpun Ternak"] || "BALI").toString().trim().toUpperCase(),
              jenisKelamin: (row["Jenis Kelamin (Jantan/Betina)"] === "Jantan" ? "Jantan" : "Betina"),
              keterangan: (row["Keterangan"] || "Diimpor melalui Spreadsheet").toString().trim(),
              createdAt: new Date().toISOString()
            });
            addedCount++;
          });
          if (validItems.length > 0) onBulkInsertPenandaan(validItems);

        } else if (selectedModule === "inseminasi") {
          const validItems: InseminasiBuatan[] = [];
          rawRows.forEach((row, i) => {
            const eartag = (row["ID Eartag Induk"] || "").toString().trim().toUpperCase();
            if (!eartag) return;

            validItems.push({
              id: `ib_excel_${Date.now()}_${i}`,
              namaPetugas: currentUser.namaPetugas,
              nikPetugas: currentUser.nikPetugas || "6403000000000000",
              tanggalIb: (row["Tanggal IB (YYYY-MM-DD)"] || new Date().toISOString().split("T")[0]).toString().trim(),
              idEartagInduk: eartag,
              rumpunInduk: (row["Rumpun Induk"] || "BALI").toString().trim().toUpperCase(),
              ibKe: (row["IB Ke"] || "1").toString().trim(),
              kodeProduksi: (row["Kode Produksi"] || "K-PROD-01").toString().trim().toUpperCase(),
              kodeJantan: (row["Kode Jantan"] || "J-01").toString().trim().toUpperCase(),
              rumpunPenjantan: (row["Rumpun Penjantan"] || "SIMMENTAL").toString().trim().toUpperCase(),
              produk: (row["Produk"] || "Semen Beku").toString().trim(),
              namaPeternak: (row["Nama Peternak"] || "Peternak Bulk").toString().trim(),
              nikPeternak: (row["NIK Peternak"] || "").toString().trim(),
              nomorTelponPeternak: (row["Nomor Telpon Peternak"] || "").toString().trim(),
              propinsi: "Kalimantan Timur",
              kabupaten: "Berau",
              kecamatan: (row["Kecamatan"] || "Batu Putih").toString().trim(),
              desa: (row["Desa"] || "Batu Putih").toString().trim(),
              statusTernak: (row["Status Ternak (sudah Terdaftar di identik PKH/Belum Terdaftar di identik PKH)"] || "Belum Terdaftar di identik PKH") as any,
              keterangan: (row["Keterangan"] || "Diimpor melalui Spreadsheet").toString().trim(),
              createdAt: new Date().toISOString()
            });
            addedCount++;
          });
          if (validItems.length > 0) onBulkInsertInseminasi(validItems);

        } else if (selectedModule === "kebuntingan") {
          const validItems: PemeriksaanKebuntingan[] = [];
          rawRows.forEach((row, i) => {
            const eartag = (row["ID Eartag Induk"] || "").toString().trim().toUpperCase();
            if (!eartag) return;

            validItems.push({
              id: `pkb_excel_${Date.now()}_${i}`,
              namaPetugas: currentUser.namaPetugas,
              nikPetugas: currentUser.nikPetugas || "6403000000000000",
              tanggalPkb: (row["Tanggal PKB (YYYY-MM-DD)"] || new Date().toISOString().split("T")[0]).toString().trim(),
              idEartagInduk: eartag,
              rumpunInduk: (row["Rumpun Induk"] || "BALI").toString().trim().toUpperCase(),
              umurTernak: (row["Umur Ternak"] || "3 Tahun").toString().trim(),
              kategoriTernak: (row["Kategori Ternak"] || "Sapi Potong").toString().trim(),
              jenisPerkawinan: (row["Jenis Perkawinan (Inseminasi Buatan/Alami)"] || "Inseminasi Buatan") as any,
              umurKebuntingan: (row["Umur Kebuntingan (1-9)"] || "3").toString().trim() as any,
              namaPeternak: (row["Nama Peternak"] || "Peternak Bulk").toString().trim(),
              nikPeternak: (row["NIK Peternak"] || "").toString().trim(),
              propinsi: "Kalimantan Timur",
              kabupaten: "Berau",
              kecamatan: (row["Kecamatan"] || "Batu Putih").toString().trim(),
              desa: (row["Desa"] || "Batu Putih").toString().trim(),
              statusTernak: (row["Status Ternak (sudah Terdaftar di identik PKH/Belum Terdaftar di identik PKH)"] || "Belum Terdaftar di identik PKH") as any,
              keterangan: (row["Keterangan"] || "Diimpor melalui Spreadsheet").toString().trim(),
              createdAt: new Date().toISOString()
            });
            addedCount++;
          });
          if (validItems.length > 0) onBulkInsertKebuntingan(validItems);

        } else if (selectedModule === "kelahiran") {
          const validItems: KelahiranTernak[] = [];
          rawRows.forEach((row, i) => {
            const indEartag = (row["ID Eartag Induk"] || "").toString().trim().toUpperCase();
            const childEartag = (row["Nomor Eartag Anak"] || `CHILD-${Date.now()}`).toString().trim().toUpperCase();
            if (!indEartag) return;

            validItems.push({
              id: `birth_excel_${Date.now()}_${i}`,
              namaPetugas: currentUser.namaPetugas,
              nikPetugas: currentUser.nikPetugas || "6403000000000000",
              tanggalLahirAnak: (row["Tanggal Lahir Anak (YYYY-MM-DD)"] || new Date().toISOString().split("T")[0]).toString().trim(),
              idEartagInduk: indEartag,
              rumpunInduk: (row["Rumpun Induk"] || "BALI").toString().trim().toUpperCase(),
              kategoriTernak: (row["Kategori Ternak"] || "Sapi Potong").toString().trim(),
              programTernak: (row["Program Ternak"] || "Pembiakan").toString().trim(),
              umurInduk: (row["Umur Induk"] || "4 Tahun").toString().trim(),
              namaPeternak: (row["Nama Peternak"] || "Peternak Bulk").toString().trim(),
              nikPeternak: (row["NIK Peternak"] || "").toString().trim(),
              nomorTelponPeternak: (row["Nomor Telpon Peternak"] || "").toString().trim(),
              propinsi: "Kalimantan Timur",
              kabupaten: "Berau",
              kecamatan: (row["Kecamatan"] || "Batu Putih").toString().trim(),
              desa: (row["Desa"] || "Batu Putih").toString().trim(),
              jenisPerkawinan: (row["Jenis Perkawinan (Inseminasi/Alami/Transfer Embrio)"] || "Inseminasi") as any,
              nomorEartagAnak: childEartag,
              jenisKelaminAnak: (row["Jenis Kelamin Anak (Jantan/Betina)"] === "Betina" ? "Betina" : "Jantan"),
              jenisRumpunTernakAnak: (row["Jenis Rumpun Anak"] || "BALI").toString().trim().toUpperCase(),
              statusTernak: (row["Status Ternak (sudah Terdaftar di identik PKH/Belum Terdaftar di identik PKH)"] || "Belum Terdaftar di identik PKH") as any,
              keterangan: (row["Keterangan"] || "Diimpor melalui Spreadsheet").toString().trim(),
              createdAt: new Date().toISOString()
            });
            addedCount++;
          });
          if (validItems.length > 0) onBulkInsertKelahiran(validItems);
        }

        setStats(`Unggahan berhasil! Sukses menambahkan bulk ${addedCount} baris data ke modul ${selectedModule.toUpperCase()}`);
        setUploadedFile(null);
      } catch (err: any) {
        setErrorLog(err.message || "Gagal memproses berkas excel.");
      } finally {
        setIsProcessing(false);
      }
    };

    fileReader.readAsBinaryString(uploadedFile);
  };

  const exportCurrentRecords = (key: ModuleKey) => {
    let rawData: any[] = [];
    if (key === "penandaan") rawData = penandaanRecords;
    else if (key === "inseminasi") rawData = inseminasiRecords;
    else if (key === "kebuntingan") rawData = kebuntinganRecords;
    else if (key === "kelahiran") rawData = kelahiranRecords;

    if (rawData.length === 0) {
      alert(`Belum ada data penginputan pada modul ${key.toUpperCase()} untuk diunduh.`);
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(rawData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Log Laporan ${key}`);
    XLSX.writeFile(workbook, `LOG_LAPORAN_REPRODUKSI_${key.toUpperCase()}_BERAU.xlsx`);
  };

  return (
    <div id="unduh_unggah_panel" className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-800 to-teal-800 px-6 py-5 text-white">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-amber-300" />
          <h2 className="text-xl font-bold tracking-tight">Unduh & Unggah Template Laporan Bulanan (.xlsx)</h2>
        </div>
        <p className="text-xs text-slate-200 mt-1">
          Layanan ekspor log laporan dan import data massal (Bulk Upload) instan menggunakan berkas Spreadsheet Excel
        </p>
      </div>

      <div className="p-6">
        {/* Module Selector Panel */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-3">
            Pilihlah Modul Reproduksi Terkait
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: "penandaan", label: "Penandaan Eartag" },
              { id: "inseminasi", label: "Inseminasi Buatan (IB)" },
              { id: "kebuntingan", label: "Pemeriksaan Kebuntingan" },
              { id: "kelahiran", label: "Kelahiran Ternak (Pedet)" }
            ].map((mod) => (
              <button
                id={`rep_sel_${mod.id}`}
                key={mod.id}
                type="button"
                onClick={() => {
                  setSelectedModule(mod.id as ModuleKey);
                  setErrorLog("");
                  setStats("");
                }}
                className={`py-3 px-4 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                  selectedModule === mod.id
                    ? "bg-emerald-700 text-white border-emerald-700 shadow-sm shadow-emerald-700/20"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {mod.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Box 1: Downloader */}
          <div className="p-5 border border-slate-100 bg-slate-50/50 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-2">
                <Download className="w-5 h-5 text-emerald-600" />
                <span>Unduh / Download Layanan</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Unduh formulir template input kosong yang dikhususkan agar siap diserahkan dan diisi oleh petugas lapangan. 
                Anda juga dapat mengekspor seluruh basis data saat ini ke dalam Excel.
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                id="btn_download_template"
                type="button"
                onClick={() => downloadXlsxTemplate(selectedModule)}
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-amber-300" />
                Unduh Template Kosong ({selectedModule.toUpperCase()})
              </button>
              
              <button
                id="btn_export_data"
                type="button"
                onClick={() => exportCurrentRecords(selectedModule)}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors border border-slate-200"
              >
                <Download className="w-4 h-4 text-slate-500" />
                Unduh Semua Log Aktif Saat Ini
              </button>
            </div>
          </div>

          {/* Box 2: Uploader */}
          <div className="p-5 border border-slate-100 bg-slate-50/50 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-2">
                <Upload className="w-5 h-5 text-emerald-600" />
                <span>Unggah / Upload Hasil Lapangan</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Unggah kembali template laporan Kecamatan yang sudah diinput oleh kolega untuk disinkronisasikan ke dalam server database.
              </p>
            </div>

            <div>
              <div className="relative mb-3">
                <input
                  id="excel_file_chooser"
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileUploadChange}
                  className="block w-full text-xs text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-xl file:border-0
                    file:text-xs file:font-semibold
                    file:bg-emerald-50 file:text-emerald-700
                    hover:file:bg-emerald-100 cursor-pointer"
                />
              </div>

              {uploadedFile && (
                <p className="text-[11px] text-slate-500 mb-3 font-medium">
                  Berkas terpilih: <span className="font-bold text-emerald-700">{uploadedFile.name}</span>
                </p>
              )}

              {errorLog && (
                <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded text-xs text-red-700 flex gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorLog}</span>
                </div>
              )}

              {stats && (
                <div className="p-3 bg-emerald-50 border-l-4 border-emerald-500 rounded text-xs text-emerald-700 flex gap-2 mb-3 animate-pulse">
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{stats}</span>
                </div>
              )}

              <button
                id="btn_submit_upload"
                type="button"
                disabled={!uploadedFile || isProcessing}
                onClick={processBulkUpload}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  !uploadedFile || isProcessing
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                    : "bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm shadow-emerald-700/25"
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin text-white" />
                    Memproses Bulk Upload...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-amber-300" />
                    Proses Sinkronisasi Spreadsheet
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
