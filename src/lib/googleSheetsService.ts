/**
 * Google Sheets & Drive Real-Time Sync Service
 * SI-REPRO-BERAU
 */

import { PenandaanTernak, InseminasiBuatan, PemeriksaanKebuntingan, KelahiranTernak } from "../types";

const SPREADSHEET_NAME = "SI-REPRO-BERAU - Sinkronisasi Real-Time";

/**
 * Search the user's Drive for the specific sync spreadsheet.
 * Returns the spreadsheetId if found, or null otherwise.
 */
export async function searchSpreadsheet(token: string): Promise<string | null> {
  const query = encodeURIComponent(`name = '${SPREADSHEET_NAME}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`);
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`;
  
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (!res.ok) {
      const errTxt = await res.text();
      console.error("Drive search failed:", errTxt);
      return null;
    }
    
    const data = await res.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
    return null;
  } catch (error) {
    console.error("Error searching spreadsheet:", error);
    return null;
  }
}

/**
 * Creates a brand new Spreadsheet in the user's Drive with the required 4 worksheets.
 */
export async function createSpreadsheet(token: string): Promise<string> {
  const url = "https://sheets.googleapis.com/v4/spreadsheets";
  
  const payload = {
    properties: {
      title: SPREADSHEET_NAME
    },
    sheets: [
      { properties: { title: "Penandaan Ternak" } },
      { properties: { title: "Inseminasi Buatan" } },
      { properties: { title: "Pemeriksaan Kebuntingan" } },
      { properties: { title: "Kelahiran Ternak" } }
    ]
  };
  
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  
  if (!res.ok) {
    const errTxt = await res.text();
    throw new Error(`Gagal membuat Spreadsheet Baru: ${errTxt}`);
  }
  
  const data = await res.json();
  return data.spreadsheetId;
}

/**
 * Checks existing worksheets in the spreadsheet and adds any that are missing.
 */
export async function ensureSheetsExist(token: string, spreadsheetId: string, requiredTitles: string[]): Promise<void> {
  const getUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title`;
  
  const res = await fetch(getUrl, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  if (!res.ok) {
    throw new Error(`Gagal memuat metadata spreadsheet: ${await res.text()}`);
  }
  
  const data = await res.json();
  const existingTitles: string[] = (data.sheets || []).map((s: any) => s.properties?.title || "");
  
  const missingTitles = requiredTitles.filter(title => !existingTitles.includes(title));
  
  if (missingTitles.length > 0) {
    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
    const requests = missingTitles.map(title => ({
      addSheet: {
        properties: { title }
      }
    }));
    
    const updateRes = await fetch(updateUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ requests })
    });
    
    if (!updateRes.ok) {
      console.warn("Failed to create missing sheets, attempting anyway:", await updateRes.text());
    }
  }
}

/**
 * Clears and rewrites a specific sheet with complete rows.
 */
export async function clearAndWriteSheet(
  token: string,
  spreadsheetId: string,
  sheetTitle: string,
  headers: string[],
  rows: any[][]
): Promise<void> {
  // 1. Clear target sheet values completely
  const clearUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetTitle)}!A1:Z10000:clear`;
  const clearRes = await fetch(clearUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  if (!clearRes.ok) {
    console.warn(`Clear sheet '${sheetTitle}' returned warning:`, await clearRes.text());
  }
  
  // 2. Write new rows (including header)
  const writeUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetTitle)}!A1?valueInputOption=USER_ENTERED`;
  const writePayload = {
    range: `${sheetTitle}!A1`,
    majorDimension: "ROWS",
    values: [headers, ...rows]
  };
  
  const writeRes = await fetch(writeUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(writePayload)
  });
  
  if (!writeRes.ok) {
    throw new Error(`Gagal menulis data ke Google Sheets [${sheetTitle}]: ${await writeRes.text()}`);
  }
}

/**
 * High-level syncing function for all four modules.
 */
export async function syncAllModules(
  token: string,
  spreadsheetId: string,
  collections: {
    penandaan: PenandaanTernak[];
    inseminasi: InseminasiBuatan[];
    kebuntingan: PemeriksaanKebuntingan[];
    kelahiran: KelahiranTernak[];
  }
): Promise<void> {
  const requiredSheets = ["Penandaan Ternak", "Inseminasi Buatan", "Pemeriksaan Kebuntingan", "Kelahiran Ternak"];
  
  // Ensure the sheets exist inside the Spreadsheet
  await ensureSheetsExist(token, spreadsheetId, requiredSheets);
  
  // Sync 1: Penandaan Ternak
  const penandaanHeaders = [
    "Tanggal Penandaan", "ID Eartag Induk", "Tanggal Lahir Induk", "Nama Peternak", "NIK Peternak",
    "Tujuan Pemeliharaan", "Nomor Telpon Peternak", "Kecamatan", "Desa", "Rumpun Ternak", "Jenis Kelamin", "Keterangan", "Petugas"
  ];
  const penandaanRows = collections.penandaan.map(rec => [
    rec.tanggalPenandaan || "",
    rec.idEartagInduk || "",
    rec.tanggalLahirInduk || "",
    rec.namaPeternak || "",
    rec.nikPeternak || "",
    rec.tujuanPemeliharaan || "",
    rec.nomorTelponPeternak || "",
    rec.kecamatan || "",
    rec.desa || "",
    rec.rumpunTernak || "",
    rec.jenisKelamin || "",
    rec.keterangan || "",
    rec.namaPetugas || ""
  ]);
  await clearAndWriteSheet(token, spreadsheetId, "Penandaan Ternak", penandaanHeaders, penandaanRows);

  // Sync 2: Inseminasi Buatan
  const inseminasiHeaders = [
    "Tanggal IB", "ID Eartag Induk", "Rumpun Induk", "IB Ke", "Kode Produksi", "Kode Jantan",
    "Rumpun Penjantan", "Produk", "Nama Peternak", "NIK Peternak", "Nomor Telpon Peternak", "Kecamatan", "Desa", "Status Ternak", "Keterangan", "Petugas"
  ];
  const inseminasiRows = collections.inseminasi.map(rec => [
    rec.tanggalIb || "",
    rec.idEartagInduk || "",
    rec.rumpunInduk || "",
    rec.ibKe || "",
    rec.kodeProduksi || "",
    rec.kodeJantan || "",
    rec.rumpunPenjantan || "",
    rec.produk || "",
    rec.namaPeternak || "",
    rec.nikPeternak || "",
    rec.nomorTelponPeternak || "",
    rec.kecamatan || "",
    rec.desa || "",
    rec.statusTernak || "",
    rec.keterangan || "",
    rec.namaPetugas || ""
  ]);
  await clearAndWriteSheet(token, spreadsheetId, "Inseminasi Buatan", inseminasiHeaders, inseminasiRows);

  // Sync 3: Pemeriksaan Kebuntingan
  const pkbHeaders = [
    "Tanggal PKB", "ID Eartag Induk", "Rumpun Induk", "Umur Ternak", "Kategori Ternak",
    "Jenis Perkawinan", "Umur Kebuntingan (Bulan)", "Nama Peternak", "NIK Peternak", "Kecamatan", "Desa", "Status Ternak", "Keterangan", "Petugas"
  ];
  const pkbRows = collections.kebuntingan.map(rec => [
    rec.tanggalPkb || "",
    rec.idEartagInduk || "",
    rec.rumpunInduk || "",
    rec.umurTernak || "",
    rec.kategoriTernak || "",
    rec.jenisPerkawinan || "",
    rec.umurKebuntingan || "",
    rec.namaPeternak || "",
    rec.nikPeternak || "",
    rec.kecamatan || "",
    rec.desa || "",
    rec.statusTernak || "",
    rec.keterangan || "",
    rec.namaPetugas || ""
  ]);
  await clearAndWriteSheet(token, spreadsheetId, "Pemeriksaan Kebuntingan", pkbHeaders, pkbRows);

  // Sync 4: Kelahiran Ternak
  const kelahiranHeaders = [
    "Tanggal Lahir Anak", "ID Eartag Induk", "Rumpun Induk", "Kategori Ternak", "Program Ternak",
    "Umur Induk", "Nama Peternak", "NIK Peternak", "Nomor Telpon Peternak", "Kecamatan", "Desa",
    "Jenis Perkawinan", "Nomor Eartag Anak", "Jenis Kelamin Anak", "Jenis Rumpun Anak", "Status Ternak", "Keterangan", "Petugas"
  ];
  const kelahiranRows = collections.kelahiran.map(rec => [
    rec.tanggalLahirAnak || "",
    rec.idEartagInduk || "",
    rec.rumpunInduk || "",
    rec.kategoriTernak || "",
    rec.programTernak || "",
    rec.umurInduk || "",
    rec.namaPeternak || "",
    rec.nikPeternak || "",
    rec.nomorTelponPeternak || "",
    rec.kecamatan || "",
    rec.desa || "",
    rec.jenisPerkawinan || "",
    rec.nomorEartagAnak || "",
    rec.jenisKelaminAnak || "",
    rec.jenisRumpunTernakAnak || "",
    rec.statusTernak || "",
    rec.keterangan || "",
    rec.namaPetugas || ""
  ]);
  await clearAndWriteSheet(token, spreadsheetId, "Kelahiran Ternak", kelahiranHeaders, kelahiranRows);
}
