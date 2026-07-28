import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-700">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-primary font-bold text-xl">L</span>
            </div>
            <span className="text-white font-bold text-xl">LegalAI</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/login" className="text-white/80 hover:text-white transition">
              Masuk
            </Link>
            <Link
              href="/register"
              className="bg-white text-primary px-4 py-2 rounded-lg font-medium hover:bg-white/90 transition"
            >
              Daftar
            </Link>
          </nav>
        </header>

        {/* Hero */}
        <div className="text-center text-white max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Riset Hukum Lebih Cepat dengan AI
          </h1>
          <p className="text-xl text-white/80 mb-8">
            Asisten hukum berbasis AI untuk mahasiswa, masyarakat umum, dan
            advokat profesional. Tanya hukum, buat dokumen, dan review kontrak
            dalam hitungan detik.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-white/90 transition"
            >
              Mulai Gratis
            </Link>
            <Link
              href="/chat"
              className="border border-white/50 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
            >
              Coba Demo
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white/10 backdrop-blur rounded-xl p-6">
            <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Tanya Hukum</h3>
            <p className="text-white/70">
              Ajukan pertanyaan hukum dan dapatkan jawaban dengan referensi UU dan
              putusan yang relevan.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-xl p-6">
            <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Buat Dokumen</h3>
            <p className="text-white/70">
              Hasilkan dokumen hukum profesional seperti kontrak, MoU, dan somasi
              dalam hitungan menit.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-xl p-6">
            <div className="w-12 h-12 bg-warning/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Review Dokumen</h3>
            <p className="text-white/70">
              Upload dokumen dan dapatkan analisis risiko hukum beserta
              rekomendasi dari AI.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-white/60">
          <p>&copy; 2024 LegalAI. Semua hak dilindungi.</p>
        </footer>
      </div>
    </div>
  );
}
