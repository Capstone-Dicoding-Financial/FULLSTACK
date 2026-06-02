import axios from 'axios';

export const getCashflowPrediction = async (req, res) => {
  try {
    // DATA BACKUP/FALLBACK (Gunakan data riil DB jika query sudah siap)
    // Sembari pengujian, kita sediakan data dummy yang strukturnya pas dengan kebutuhan model GRU
    let cashflowHistory = [120000, 150000, 180000, 210000, -50000, 250000, 280000, 300000, -20000, 350000];
    
    // Potong 7 hari terakhir untuk kebutuhan input window GRU
    let cashflowLast7Days = cashflowHistory.slice(-7);

    const payload = {
      cashflow: cashflowLast7Days,         
      cashflow_history: cashflowHistory,    
      period: 30,                           
      current_balance: 1500000,             
      total_income: 2340000,                
      total_expense: 840000                
    };

    // 3. Ubah URL endpoint dari /predict menjadi /forecast
    const apiResponse = await axios.post('http://localhost:8000/forecast', payload);

    const aiResult = apiResponse.data;

    // 4. Gunakan properti camelCase (chartActual & chartPred)
    const chartActual = aiResult.chartActual.map(item => ({ x: item[0], y: item[1] }));
    const chartPred = aiResult.chartPred.map(item => ({ x: item[0], y: item[1] }));

    // 5. Kembalikan respon matang ke Front-End React
    return res.json({
      success: true,
      historis: chartActual,
      prediksi: chartPred,
      insights: [
        {
          id: 1,
          type: aiResult.saldoChange >= 0 ? "positive" : "warning",
          badge: aiResult.saldoChange >= 0 ? "↗ Proyeksi Kas Naik" : "⚠ Proyeksi Kas Menurun",
          text: `Akurasi model GRU: ${aiResult.accuracy}%. Saldo akhir diprediksi bergerak ke angka ${aiResult.saldoAkhir} (${aiResult.saldoChange}% perubahan).`
        },
        {
          id: 2,
          type: "positive",
          badge: "💡 Rekomendasi Skenario",
          text: `Skenario Normal: ${aiResult.skenario.normal.val}. Skenario Optimis: ${aiResult.skenario.optimis.val}. Skenario Pesimis: ${aiResult.skenario.pesimis.val}.`
        }
      ]
    });

  } catch (error) {
    console.error("Gagal menyambung ke server AI Python:", error.message);
    if (error.response) {
      console.error("Detail Error dari FastAPI:", error.response.data);
    }
    return res.status(500).json({ 
      success: false, 
      message: "Server AI (FastAPI) gagal merespon atau terjadi kesalahan validasi data." 
    });
  }
};