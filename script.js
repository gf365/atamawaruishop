import { BrowserMultiFormatReader } from 'https://cdn.jsdelivr.net/npm/@zxing/library@0.18.6/esm/index.js';

const video = document.getElementById("video");
const resultText = document.getElementById("result");
const debugLog = document.getElementById("debug-log");

function logMessage(message) {
    console.log(message);
    if (debugLog) {
        debugLog.textContent = message; // 最新のメッセージのみ表示
    }
}

async function startScanning() {
    logMessage("🔹 スキャン開始...");

    const constraints = {
        video: { 
            facingMode: "environment", // 背面カメラを強制
            width: { ideal: 1280 }, 
            height: { ideal: 720 },
            frameRate: { ideal: 30 }
        }
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
                logMessage("⚠️ QRコード未検出...");
            }
        });
    } catch (error) {
        logMessage("❌ カメラの起動に失敗: " + error.message);
    }
}
