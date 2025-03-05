import { BrowserMultiFormatReader } from 'https://cdn.jsdelivr.net/npm/@zxing/library@0.18.6/esm/index.js';

const video = document.getElementById("video");
const resultText = document.getElementById("result");

async function startScanning() {
    const constraints = {
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30 } }
    };

    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;

        const codeReader = new BrowserMultiFormatReader();
        codeReader.decodeFromVideoDevice(undefined, video, (result, err) => {
            if (result) {
                resultText.textContent = "結果: " + result.text;
                console.log("QRコード読み取り成功:", result.text);
            }
        });
    } catch (error) {
        console.error("カメラの起動に失敗しました:", error);
    }
}
