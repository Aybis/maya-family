import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Auth Page
      "welcome_back": "Welcome back",
      "sign_in_subtitle": "Sign in to your account to continue",
      "email_address": "Email Address",
      "password": "Password",
      "enter_email": "Enter your email",
      "enter_password": "Enter your password",
      "remember_me": "Remember me",
      "forgot_password": "Forgot password?",
      "sign_in": "Sign In",
      "or_continue_with": "Or continue with",
      "continue_with": "Continue with",
      "no_account": "Don't have an account?",
      "sign_up": "Sign up",
      "terms_privacy": "By signing in, you agree to our",
      "terms_of_service": "Terms of Service",
      "and": "and",
      "privacy_policy": "Privacy Policy",
      
      // Navigation
      "home": "Home",
      "transactions": "Transactions",
      "warehouse": "Warehouse",
      "report": "Report",
      "settings": "Settings",
      
      // Dashboard
      "dashboard": "Dashboard",
      "welcome_overview": "Welcome back! Here's your financial overview.",
      "quick_add": "Quick Add",
      "total_income": "Total Income",
      "total_expenses": "Total Expenses",
      "total_savings": "Total Savings",
      "monthly_budget": "Monthly Budget",
      "income_vs_expenses": "Income vs Expenses",
      "expense_categories": "Expense Categories",
      "recent_transactions": "Recent Transactions",
      "view_all": "View All",
      
      // Stock Warning
      "low_stock_alert": "Low Stock Alert",
      "items_running_low": "item(s) running low",
      
      // Settings
      "manage_preferences": "Manage your account and application preferences",
      "save_changes": "Save Changes",
      "profile_information": "Profile Information",
      "change_photo": "Change Photo",
      "full_name": "Full Name",
      "phone_number": "Phone Number",
      "ai_assistant": "AI Assistant",
      "choose_ai_assistant": "Choose your preferred AI assistant for financial insights",
      "selected": "Selected",
      "notifications": "Notifications",
      "email_notifications": "Email Notifications",
      "receive_email_updates": "Receive updates via email",
      "whatsapp_notifications": "WhatsApp Notifications",
      "get_whatsapp_alerts": "Get alerts on WhatsApp",
      "push_notifications": "Push Notifications",
      "browser_notifications": "Browser notifications",
      "low_stock_alerts": "Low Stock Alerts",
      "when_items_low": "When items are running low",
      "budget_alerts": "Budget Alerts",
      "approaching_budget": "When approaching budget limits",
      "monthly_reports": "Monthly Reports",
      "automated_summaries": "Automated monthly summaries",
      "preferences": "Preferences",
      "currency": "Currency",
      "language": "Language",
      "theme": "Theme",
      "light": "Light",
      "dark": "Dark",
      "auto": "Auto",
      "privacy_security": "Privacy & Security",
      "data_sharing": "Data Sharing",
      "share_anonymized_data": "Share anonymized data for research",
      "analytics": "Analytics",
      "help_improve_app": "Help improve the app with usage analytics",
      "marketing_communications": "Marketing Communications",
      "receive_product_updates": "Receive product updates and offers",
      "change_password": "Change Password",
      "update_account_password": "Update your account password",
      "export_data": "Export Data",
      "download_financial_data": "Download your financial data",
      "delete_account": "Delete Account",
      "permanently_delete": "Permanently delete your account and data",
      
      // Common
      "add": "Add",
      "edit": "Edit",
      "delete": "Delete",
      "cancel": "Cancel",
      "save": "Save",
      "update": "Update",
      "confirm": "Confirm",
      "close": "Close"
    }
  },
  id: {
    translation: {
      // Auth Page
      "welcome_back": "Selamat datang kembali",
      "sign_in_subtitle": "Masuk ke akun Anda untuk melanjutkan",
      "email_address": "Alamat Email",
      "password": "Kata Sandi",
      "enter_email": "Masukkan email Anda",
      "enter_password": "Masukkan kata sandi Anda",
      "remember_me": "Ingat saya",
      "forgot_password": "Lupa kata sandi?",
      "sign_in": "Masuk",
      "or_continue_with": "Atau lanjutkan dengan",
      "continue_with": "Lanjutkan dengan",
      "no_account": "Belum punya akun?",
      "sign_up": "Daftar",
      "terms_privacy": "Dengan masuk, Anda menyetujui",
      "terms_of_service": "Syarat Layanan",
      "and": "dan",
      "privacy_policy": "Kebijakan Privasi",
      
      // Navigation
      "home": "Beranda",
      "transactions": "Transaksi",
      "warehouse": "Gudang",
      "report": "Laporan",
      "settings": "Pengaturan",
      
      // Dashboard
      "dashboard": "Dasbor",
      "welcome_overview": "Selamat datang kembali! Berikut ringkasan keuangan Anda.",
      "quick_add": "Tambah Cepat",
      "total_income": "Total Pendapatan",
      "total_expenses": "Total Pengeluaran",
      "total_savings": "Total Tabungan",
      "monthly_budget": "Anggaran Bulanan",
      "income_vs_expenses": "Pendapatan vs Pengeluaran",
      "expense_categories": "Kategori Pengeluaran",
      "recent_transactions": "Transaksi Terbaru",
      "view_all": "Lihat Semua",
      
      // Stock Warning
      "low_stock_alert": "Peringatan Stok Rendah",
      "items_running_low": "barang hampir habis",
      
      // Settings
      "manage_preferences": "Kelola akun dan preferensi aplikasi Anda",
      "save_changes": "Simpan Perubahan",
      "profile_information": "Informasi Profil",
      "change_photo": "Ubah Foto",
      "full_name": "Nama Lengkap",
      "phone_number": "Nomor Telepon",
      "ai_assistant": "Asisten AI",
      "choose_ai_assistant": "Pilih asisten AI pilihan Anda untuk wawasan keuangan",
      "selected": "Dipilih",
      "notifications": "Notifikasi",
      "email_notifications": "Notifikasi Email",
      "receive_email_updates": "Terima pembaruan melalui email",
      "whatsapp_notifications": "Notifikasi WhatsApp",
      "get_whatsapp_alerts": "Dapatkan peringatan di WhatsApp",
      "push_notifications": "Notifikasi Push",
      "browser_notifications": "Notifikasi browser",
      "low_stock_alerts": "Peringatan Stok Rendah",
      "when_items_low": "Ketika barang hampir habis",
      "budget_alerts": "Peringatan Anggaran",
      "approaching_budget": "Ketika mendekati batas anggaran",
      "monthly_reports": "Laporan Bulanan",
      "automated_summaries": "Ringkasan bulanan otomatis",
      "preferences": "Preferensi",
      "currency": "Mata Uang",
      "language": "Bahasa",
      "theme": "Tema",
      "light": "Terang",
      "dark": "Gelap",
      "auto": "Otomatis",
      "privacy_security": "Privasi & Keamanan",
      "data_sharing": "Berbagi Data",
      "share_anonymized_data": "Bagikan data anonim untuk penelitian",
      "analytics": "Analitik",
      "help_improve_app": "Bantu tingkatkan aplikasi dengan analitik penggunaan",
      "marketing_communications": "Komunikasi Pemasaran",
      "receive_product_updates": "Terima pembaruan produk dan penawaran",
      "change_password": "Ubah Kata Sandi",
      "update_account_password": "Perbarui kata sandi akun Anda",
      "export_data": "Ekspor Data",
      "download_financial_data": "Unduh data keuangan Anda",
      "delete_account": "Hapus Akun",
      "permanently_delete": "Hapus permanen akun dan data Anda",
      
      // Common
      "add": "Tambah",
      "edit": "Edit",
      "delete": "Hapus",
      "cancel": "Batal",
      "save": "Simpan",
      "update": "Perbarui",
      "confirm": "Konfirmasi",
      "close": "Tutup"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;