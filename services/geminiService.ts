import { GoogleGenAI } from "@google/genai";
import { Item, Transaction } from "../types";

const apiKey = process.env.API_KEY || '';

// Safely initialize client only if key exists, otherwise we'll handle it in the function
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const analyzeInventory = async (items: Item[], recentTransactions: Transaction[]): Promise<string> => {
  if (!ai) {
    return "API Key tidak ditemukan. Mohon konfigurasi API_KEY untuk menggunakan fitur AI.";
  }

  const inventorySummary = items.map(i => 
    `- ${i.name} (SKU: ${i.sku}): Stok ${i.stock} ${i.unit} (Min: ${i.minStock})`
  ).join('\n');

  const transactionSummary = recentTransactions.slice(0, 10).map(t => 
    `- ${t.date.split('T')[0]}: ${t.type} ${t.quantity} ${t.itemName}`
  ).join('\n');

  const prompt = `
    Anda adalah asisten ahli manajemen gudang. Analisis data inventaris berikut ini dan berikan ringkasan singkat dalam Bahasa Indonesia.
    
    Data Stok Saat Ini:
    ${inventorySummary}

    Transaksi Terakhir:
    ${transactionSummary}

    Tolong berikan:
    1. Identifikasi barang yang stoknya kritis (di bawah minimum).
    2. Analisis singkat tren pergerakan barang.
    3. Rekomendasi tindakan (misal: restock segera, atau kurangi stok mati).
    
    Gunakan format markdown bullet points. Jaga agar tetap ringkas.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Tidak ada respon dari AI.";
  } catch (error) {
    console.error("Error analyzing inventory:", error);
    return "Maaf, terjadi kesalahan saat menganalisis data inventaris.";
  }
};
