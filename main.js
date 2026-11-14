// إعداد مفتاح Cesium ion (ضع التوكن الخاص بك هنا إذا كنت تستخدم خرائط Cesium ion)
Cesium.Ion.defaultAccessToken = 'YOUR_CESIUM_ION_ACCESS_TOKEN_HERE';

// 1. إنشاء عارض المريخ (مع مجسم هندسي مخصص للمريخ)
const marsEllipsoid = new Cesium.Ellipsoid(3396190.0, 3396190.0, 3376200.0);
const marsViewer = new Cesium.Viewer('marsContainer', {
    globe: new Cesium.Globe(marsEllipsoid),
    sceneModePicker: false,
    baseLayerPicker: false,
    geocoder: false,
    homeButton: false,
    infoBox: false,
    navigationHelpButton: false,
    animation: false,
    timeline: false
});

// 2. إنشاء عارض الأرض
const earthViewer = new Cesium.Viewer('earthContainer', {
    sceneModePicker: false,
    baseLayerPicker: true,
    geocoder: false,
    homeButton: false,
    infoBox: false,
    navigationHelpButton: false,
    animation: false,
    timeline: false
});

// بيانات المواقع التناظرية على المريخ (A, B, C)
const marsAnalogs = {
    'A': {
        destination: new Cesium.Cartesian3(3500000.0, -300000.0, -1200000.0),
        orientation: { heading: Cesium.Math.toRadians(0.0), pitch: Cesium.Math.toRadians(-45.0), roll: 0.0 }
    },
    'B': {
        destination: new Cesium.Cartesian3(-2500000.0, -2800000.0, 2000000.0),
        orientation: { heading: Cesium.Math.toRadians(15.0), pitch: Cesium.Math.toRadians(-40.0), roll: 0.0 }
    },
    'C': {
        destination: new Cesium.Cartesian3(-1500000.0, -3200000.0, 2500000.0),
        orientation: { heading: Cesium.Math.toRadians(45.0), pitch: Cesium.Math.toRadians(-50.0), roll: 0.0 }
    }
};

// بيانات المواقع التناظرية المقابلة على الأرض (A, B, C)
const earthAnalogs = {
    'A': {
        destination: Cesium.Cartesian3.fromDegrees(30.8025, 26.8206, 1500000.0), // الصحراء الشرقية / مصر
        orientation: { heading: 0.0, pitch: Cesium.Math.toRadians(-45.0), roll: 0.0 }
    },
    'B': {
        destination: Cesium.Cartesian3.fromDegrees(-155.4600, 19.8200, 1000000.0), // مونا كيا (هاواي)
        orientation: { heading: 0.0, pitch: Cesium.Math.toRadians(-45.0), roll: 0.0 }
    },
    'C': {
        destination: Cesium.Cartesian3.fromDegrees(-69.1300, -23.8600, 1500000.0), // صحراء أتاكاما
        orientation: { heading: 0.0, pitch: Cesium.Math.toRadians(-45.0), roll: 0.0 }
    }
};

// دالة التنقل بين التبويبات وتحديث حجم العارض
function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    if (tabName === 'mars') {
        document.querySelector('.tab-btn:nth-child(1)').classList.add('active');
        document.getElementById('mars-tab').classList.add('active');
        marsViewer.resize();
    } else {
        document.querySelector('.tab-btn:nth-child(2)').classList.add('active');
        document.getElementById('earth-tab').classList.add('active');
        earthViewer.resize();
    }
}

// دوال الطيران والانتقال للمواقع التناظرية
function flyToMarsAnalog(key) {
    const analog = marsAnalogs[key];
    if (analog) {
        marsViewer.camera.flyTo({
            destination: analog.destination,
            orientation: analog.orientation,
            duration: 3.0
        });
    }
}

function flyToEarthAnalog(key) {
    const analog = earthAnalogs[key];
    if (analog) {
        earthViewer.camera.flyTo({
            destination: analog.destination,
            orientation: analog.orientation,
            duration: 3.0
        });
    }
}

// توجيه الكاميرا للموقع الافتراضي عند تشغيل الصفحة
window.addEventListener('load', () => {
    flyToMarsAnalog('A');
});