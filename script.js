const video = document.getElementById("video");
const resultText = document.getElementById("result");

async function startScanning() {
    const constraints = {
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
    };

    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        scanFrame();
    } catch (error) {
        console.error("カメラの起動に失敗しました:", error);
    }
}

async function scanFrame() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    setInterval(async () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // ここで QR コードのデコードを行う（後で実装）
    }, 500);
}
