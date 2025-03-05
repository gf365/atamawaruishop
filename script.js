import { BrowserMultiFormatReader } from 'https://cdn.jsdelivr.net/npm/@zxing/library@0.18.6/esm/index.js';

const video = document.getElementById("video");
const resultText = document.getElementById("result");
const debugLog = document.getElementById("debug-log");

function logMessage(message) {
    console.log(message);
    debugLog.innerHTML += message + "<br>";
}

async function startScanning() {
    logMessage("🔹 スキャン開始...");
    
    const constraints = {
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30 } }
    };

    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        logMessage("✅ カメラが起動しました");

        const codeReader = new BrowserMultiFormatReader();
        codeReader.decodeFromVideoDevice(undefined, video, (result, err) => {
            if (result) {
                resultText.textContent = "結果: " + result.text;
                logMessage("🎉 QRコード読み取り成功: " + result.text);
            } else if (err) {
                logMessage("⚠️ QRコード未検出");
            }
        });
    } catch (error) {
        logMessage("❌ カメラの起動に失敗しました: " + error.message);
    }
}
