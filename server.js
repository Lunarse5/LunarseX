const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// السماح بالاتصال بين الواجهة الأمامية والخلفية (CORS)
app.use(cors());
app.use(express.json());

// مسار لجلب بيانات الكواكب والمهمة
app.get('/api/telemetry', (req, res) => {
    res.json({
        mission: "LUNARSE X",
        progress: "20%",
        status: "Active Grid",
        corridors: {
            moon: [
                { id: 1, name: "Altai Region", rank: 1, lat: "47.5° N", lon: "90.0° E" },
                { id: 2, name: "Bering Strait Region", rank: 2, lat: "64.5° N", lon: "173.5° W" },
                { id: 3, name: "Eastern South Korea", rank: 3, lat: "37.0° N", lon: "129.0° E" }
            ],
            mars: [
                { id: 1, name: "Atacama Desert Basalt Flats", rank: 1, lat: "23.9° S", lon: "69.1° W" }
            ]
        }
    });
});

// تشغيل الخادم المحلي
app.listen(PORT, () => {
    console.log(`LUNARSE X Backend running successfully at http://localhost:${PORT}`);
});