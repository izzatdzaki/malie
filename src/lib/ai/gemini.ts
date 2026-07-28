import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'date' | 'number';
    required: boolean;
    placeholder?: string;
  }>;
}

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'kontrak-kerja',
    name: 'Kontrak Kerja',
    description: 'Perjanjian kerja antara perusahaan dan karyawan',
    fields: [
      { name: 'namaPerusahaan', label: 'Nama Perusahaan', type: 'text', required: true },
      { name: 'alamatPerusahaan', label: 'Alamat Perusahaan', type: 'textarea', required: true },
      { name: 'namaKaryawan', label: 'Nama Karyawan', type: 'text', required: true },
      { name: 'nikKaryawan', label: 'NIK', type: 'text', required: true },
      { name: 'alamatKaryawan', label: 'Alamat Karyawan', type: 'textarea', required: true },
      { name: 'jabatan', label: 'Jabatan', type: 'text', required: true },
      { name: 'gaji', label: 'Gaji Bulanan', type: 'number', required: true },
      { name: 'tanggalMulai', label: 'Tanggal Mulai Kerja', type: 'date', required: true },
      { name: 'periodeKontrak', label: 'Periode Kontrak (bulan)', type: 'number', required: true },
    ],
  },
  {
    id: 'perjanjian-sewa',
    name: 'Perjanjian Sewa',
    description: 'Perjanjian sewa antara penyewa dan pemilik',
    fields: [
      { name: 'namaPenyewa', label: 'Nama Penyewa', type: 'text', required: true },
      { name: 'alamatPenyewa', label: 'Alamat Penyewa', type: 'textarea', required: true },
      { name: 'namaPemilik', label: 'Nama Pemilik', type: 'text', required: true },
      { name: 'alamatPemilik', label: 'Alamat Pemilik', type: 'textarea', required: true },
      { name: 'lokasiSewa', label: 'Lokasi yang Disewa', type: 'textarea', required: true },
      { name: 'hargaSewa', label: 'Harga Sewa per Bulan', type: 'number', required: true },
      { name: 'tanggalMulai', label: 'Tanggal Mulai Sewa', type: 'date', required: true },
      { name: 'durasiSewa', label: 'Durasi Sewa (bulan)', type: 'number', required: true },
    ],
  },
  {
    id: 'mou',
    name: 'Mou / PKS',
    description: 'Nota Kesepahaman atau Perjanjian Kerjasama',
    fields: [
      { name: 'namaPihak1', label: 'Nama Pihak Pertama', type: 'text', required: true },
      { name: 'alamatPihak1', label: 'Alamat Pihak Pertama', type: 'textarea', required: true },
      { name: 'namaPihak2', label: 'Nama Pihak Kedua', type: 'text', required: true },
      { name: 'alamatPihak2', label: 'Alamat Pihak Kedua', type: 'textarea', required: true },
      { name: 'mataUang', label: 'Nilai Kerjasama (Rp)', type: 'number', required: true },
      { name: 'tanggalMulai', label: 'Tanggal Berlaku', type: 'date', required: true },
      { name: 'tanggalBerakhir', label: 'Tanggal Berakhir', type: 'date', required: true },
    ],
  },
  {
    id: 'surat-somasi',
    name: 'Surat Somasi',
    description: 'Surat peringatan terkait wanprestasi',
    fields: [
      { name: 'namaPengirim', label: 'Nama Pengirim', type: 'text', required: true },
      { name: 'alamatPengirim', label: 'Alamat Pengirim', type: 'textarea', required: true },
      { name: 'namaPenerima', label: 'Nama Penerima', type: 'text', required: true },
      { name: 'alamatPenerima', label: 'Alamat Penerima', type: 'textarea', required: true },
      { name: 'hubungan', label: 'Hubungan dengan Penerima', type: 'text', required: true },
      { name: 'detailSomasi', label: 'Detail Somasi', type: 'textarea', required: true },
      { name: 'tenggatWaktu', label: 'Tenggat Waktu (hari)', type: 'number', required: true },
    ],
  },
  {
    id: 'surat-kuasa',
    name: 'Surat Kuasa',
    description: 'Surat kuasa untuk mewakili kepentingan',
    fields: [
      { name: 'namaPemberiKuasa', label: 'Nama Pemberi Kuasa', type: 'text', required: true },
      { name: 'alamatPemberiKuasa', label: 'Alamat Pemberi Kuasa', type: 'textarea', required: true },
      { name: 'nikPemberiKuasa', label: 'NIK Pemberi Kuasa', type: 'text', required: true },
      { name: 'namaPenerimaKuasa', label: 'Nama Penerima Kuasa', type: 'text', required: true },
      { name: 'alamatPenerimaKuasa', label: 'Alamat Penerima Kuasa', type: 'textarea', required: true },
      { name: 'nikPenerimaKuasa', label: 'NIK Penerima Kuasa', type: 'text', required: true },
      { name: 'keperluan', label: 'Keperluan Kuasa', type: 'textarea', required: true },
    ],
  },
];

export async function generateDocument(
  templateId: string,
  fields: Record<string, string>
): Promise<string> {
  const template = DOCUMENT_TEMPLATES.find((t) => t.id === templateId);
  if (!template) {
    throw new Error(`Template ${templateId} not found`);
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const fieldDescriptions = Object.entries(fields)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  const prompt = `Buatkan dokumen hukum "${template.name}" dengan detail berikut:

${fieldDescriptions}

Gunakan format dokumen hukum Indonesia yang formal dan lengkap. Sertakan:
- Judul dokumen
- Nomor dokumen (kosongkan untuk sementara)
- Bagian-bagian yang relevan
- Bahasa hukum formal Indonesia
- Tanda tangan di bagian akhir

Hanya berikan isi dokumen tanpa komentar tambahan.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}
