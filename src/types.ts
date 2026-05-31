/**
 * Types and static options for Web App:
 * Optimalisasi Reproduksi Ternak Berau
 * Dinas Tanaman Pangan, Hortikultura dan Peternakan Kabupaten Berau
 */

export interface RegisteredUser {
  id: string;
  username: string;
  password?: string;
  namaPetugas: string;
  nikPetugas: string;
  nomorTelponPetugas: string;
  role: "adminkab" | "petugas";
  createdAt: string;
}

export interface PenandaanTernak {
  id: string;
  namaPetugas: string;
  nikPetugas: string;
  nomorTelponPetugas: string;
  tanggalPenandaan: string;
  idEartagInduk: string;
  fotoEartagInduk: string; // Base64 encoding of image
  tanggalLahirInduk: string;
  namaPeternak: string;
  nikPeternak: string;
  tujuanPemeliharaan: "Pembibitan" | "Pengemukan" | "Pembiakan";
  nomorTelponPeternak: string;
  propinsi: string; // Default: Kalimantan Timur
  kabupaten: string; // Default: Berau
  kecamatan: string;
  desa: string;
  rumpunTernak: string; // LIMOUSIN, SIMMENTAL, etc. or Custom
  jenisKelamin: "Jantan" | "Betina";
  keterangan: string;
  createdAt: string;
}

export interface InseminasiBuatan {
  id: string;
  namaPetugas: string;
  nikPetugas: string;
  tanggalIb: string;
  idEartagInduk: string;
  rumpunInduk: string;
  ibKe: string;
  kodeProduksi: string;
  kodeJantan: string;
  rumpunPenjantan: string;
  produk: string;
  namaPeternak: string;
  nikPeternak: string;
  nomorTelponPeternak: string;
  propinsi: string;
  kabupaten: string;
  kecamatan: string;
  desa: string;
  statusTernak: "sudah Terdaftar di identik PKH" | "Belum Terdaftar di identik PKH";
  keterangan: string;
  createdAt: string;
}

export interface PemeriksaanKebuntingan {
  id: string;
  namaPetugas: string;
  nikPetugas: string;
  tanggalPkb: string;
  idEartagInduk: string;
  rumpunInduk: string;
  umurTernak: string; // e.g. "3 tahun"
  kategoriTernak: string; // Sapi Potong, dsb
  jenisPerkawinan: "Inseminasi Buatan" | "Alami";
  umurKebuntingan: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
  namaPeternak: string;
  nikPeternak: string;
  propinsi: string;
  kabupaten: string;
  kecamatan: string;
  desa: string;
  statusTernak: "sudah Terdaftar di identik PKH" | "Belum Terdaftar di identik PKH";
  keterangan: string;
  createdAt: string;
}

export interface KelahiranTernak {
  id: string;
  namaPetugas: string;
  nikPetugas: string;
  tanggalLahirAnak: string;
  idEartagInduk: string;
  rumpunInduk: string;
  kategoriTernak: string;
  programTernak: string; // e.g. Pembiakan, Pengemukan
  umurInduk: string;
  namaPeternak: string;
  nikPeternak: string;
  nomorTelponPeternak: string;
  propinsi: string;
  kabupaten: string;
  kecamatan: string;
  desa: string;
  jenisPerkawinan: "Inseminasi" | "Alami" | "Transfer Embrio";
  nomorEartagAnak: string;
  jenisKelaminAnak: "Jantan" | "Betina";
  jenisRumpunTernakAnak: string;
  statusTernak: "sudah Terdaftar di identik PKH" | "Belum Terdaftar di identik PKH";
  keterangan: string;
  createdAt: string;
}

// Static lists from prompt
export const RUMPUN_TERNAK_PRESETS = [
  "LIMOUSIN",
  "SIMMENTAL",
  "PERANAKAN ONGGOLE (PO)",
  "BALI",
  "BARHMAN",
  "ANGUS",
  "BRANGUS",
  "BRAHMAN CROS",
  "MADURA",
  "ACEH"
];

export const KECAMATAN_BERAU: Record<string, string[]> = {
  "Batu Putih": ["Ampen Medang", "Balikukup", "Batu Putih", "Kayu Indah", "Lobang Kelatak", "Sumber Agung", "Tembudan"],
  "Biatan": ["Biatan Bapinang", "Biatan Baru", "Biatan Ilir", "Biatan Lempake", "Biatan Ulu", "Bukit Makmur Jaya", "Karangan", "Manunggal Jaya"],
  "Biduk-Biduk": ["Biduk-Biduk", "Giring-Giring", "Pantai Harapan", "Tanjung Perepat", "Teluk Sulaiman", "Teluk Sumbang"],
  "Gunung Tabur": ["Batu-Batu", "Birang", "Maluang", "Melati Jaya", "Merancang Ilir", "Merancang Ulu", "Pulau Besing", "Sambakungan", "Samburakat", "Tasuk"],
  "Kelay": ["Lesan Dayak", "Long Beliu", "Long Duhung", "Long Keluh", "Long Lamcin", "Long Pelay", "Long Sului", "Mapulu", "Merabu", "Merapun", "Merasa", "Muara Lesan", "Panaan", "Sido Bangen"],
  "Maratua": ["Payung-Payung", "Teluk Alulu", "Teluk Harapan"],
  "Pulau Derawan": ["Kasai", "Pegat Betumbuk", "Pulau Derawan", "Tanjung Batu", "Teluk Semanting"],
  "Sambaliung": ["Sei Bebanir Bangun", "Bena Baru", "Gurimbang", "Inaran", "Long Lanuk", "Pegat Bukur", "Pesayan", "Pilanjau", "Rantau Panjang", "Suaran", "Sukan Tengah", "Tanjung Perangat", "Tumbit Dayak", "Sambaliung"],
  "Segah": ["Batu Rajang", "Bukit Makmur", "Gunung Sari", "Harapan Jaya", "Long Ayan", "Long Ayap", "Long Laai", "Pandan Sari", "Punan Mahakam", "Punan Malinau", "Punan Segah", "Siduung Indah", "Tepian Buah"],
  "Tabalar": ["Buyung Buyung", "Harapan Maju", "Semurut", "Tabalar Muara", "Tabalar Ulu", "Tubaan"],
  "Talisayan": ["Bumi Jaya", "Campur Sari", "Capuak", "Dumaring", "Eka Sapta", "Purnasari Jaya", "Suka Murya", "Sumber Mulya", "Talisayan", "Tunggal Bumi"],
  "Tanjung Redeb": ["Bugis", "Gayam", "Gunung Panjang", "Karang Ambun", "Sungai Bedungun", "Tanjung Redeb"],
  "Teluk Bayur": ["Labanan Jaya", "Labanan Makarti", "Labanan Makmur", "Tumbit Melayu", "Rinding", "Teluk Bayur"]
};
