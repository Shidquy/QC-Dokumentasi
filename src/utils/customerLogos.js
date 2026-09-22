// src/utils/customerLogos.js
// Import semua logo dari folder assets/logos/
// Sesuaikan ekstensi file (.png, .svg, .jpg) sesuai dengan file yang kamu miliki

import toyotaLogo from '../assets/logos/toyota.svg'; // atau toyota.png / .jpg
import hinoLogo from '../assets/logos/hino.svg';   // atau hino-ja.png / .svg
import isuzuLogo from '../assets/logos/isuzu.svg';
import hondaLogo from '../assets/logos/honda.svg'; // atau Honda_POD_Logo_2024_1.png
import mitsubishiLogo from '../assets/logos/KTB.svg';
import suzukiLogo from '../assets/logos/suzuki.svg';
import daihatsuLogo from '../assets/logos/daihatsu.svg';
import KTBlogo from '../assets/logos/fuso.svg';  // Logo KTB, jika ada
import ahmlogo from '../assets/logos/ahm.svg'; // Logo AHM, jika ada

// Mapping antara nama customer (harus sama persis dengan di CUSTOMERS) dengan logo
export const customerLogos = {
  'TMMIN': toyotaLogo,          // Toyota
  'HINO': hinoLogo,
  'ISUZU': isuzuLogo,
  'ADM': daihatsuLogo,                  // fallback ke ikon default
  'AHM': ahmlogo,             // Honda
  'SIM': suzukiLogo,            // Suzuki? Atau bisa pakai Mitsubishi?
  'KTB': KTBlogo,        // Mitsubishi
  'HPM': hondaLogo,                  // fallback
  'MMIKI': mitsubishiLogo,                // fallback
};

// Optional: logo untuk fallback jika tidak ada
export const defaultLogo = null; // atau bisa pakai ikon dari react-icons