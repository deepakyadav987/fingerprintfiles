async function getDeviceFingerprint() {
    const fonts = await detectFonts();
    

    const deviceData = {
        platform: navigator.platform,
        cpuCores: navigator.hardwareConcurrency || 'Unknown', 
        colorDepth: screen.colorDepth || 'Unknown',
        language: normalizeLanguage(navigator.language) || 'Unknown',
        timezone: getNormalizedTimezone()|| 'Unknown',
        fonts: fonts, // detectFonts function
        canvas:getCanvasFingerprint()
        
        // deviceMemory: navigator.deviceMemory || 'Unknown',
        //screenResolution: `${screen.availWidth}x${screen.availHeight}`,
        //audioString: audioString,
        };
    const deviceDataString = JSON.stringify(deviceData);

    // Hashing the combined data to generate a fingerprint
    const hashedFingerprint = await generateSha256Hash(deviceDataString);

    console.log("Device Data:", deviceData);
    console.log("Hashed Device Fingerprint:", hashedFingerprint);
}

async function generateSha256Hash(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}
function normalizeLanguage(language) {
    return language.split('-')[0];
}
function getNormalizedTimezone() {
    const offsetMinutes = new Date().getTimezoneOffset();
    const offsetHours = Math.abs(offsetMinutes / 60);
    const sign = offsetMinutes <= 0 ? '+' : '-';
    return `GMT${sign}${offsetHours}`;
}
async function detectFonts() {
    const baseFonts = ['monospace', 'sans-serif', 'serif'];
    const testString = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const testSize = "72px";
    
    const body = document.getElementsByTagName("body")[0];
    const testElement = document.createElement("span");
    testElement.style.fontSize = testSize;
    testElement.innerHTML = testString;
    testElement.style.visibility = "hidden";
    body.appendChild(testElement);
    
    const defaultDimensions = {};
    baseFonts.forEach((font) => {
        testElement.style.fontFamily = font;
        defaultDimensions[font] = {
            width: testElement.offsetWidth,
            height: testElement.offsetHeight,
        };
    });

    const fontList = [
        "Arial", "Verdana", "Times New Roman", "Courier New", 
        "Georgia", "Comic Sans MS", "Impact", "Tahoma", "Trebuchet MS",
        "Calibri", "Helvetica", "Comic Sans", "Futura", "Lucida Sans"
    ];
    const availableFonts = [];
    fontList.forEach((font) => {
        let isFontAvailable = false;
        baseFonts.forEach((baseFont) => {
            testElement.style.fontFamily = `${font}, ${baseFont}`;
            const newWidth = testElement.offsetWidth;
            const newHeight = testElement.offsetHeight;

            if (newWidth !== defaultDimensions[baseFont].width || newHeight !== defaultDimensions[baseFont].height) {
                isFontAvailable = true;
            }
        });

        if (isFontAvailable) {
            availableFonts.push(font);
        }
    });

    body.removeChild(testElement);
    return availableFonts;
}

function getCanvasFingerprint() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 200;
    canvas.height = 50;
    ctx.textBaseline = "top";
    ctx.font = "16px Arial";
    ctx.fillStyle = "#f60";
    ctx.fillRect(0, 0, 200, 50);
    ctx.fillStyle = "#069";
    ctx.fillText("Canvas Fingerprint Test", 10, 10);
    ctx.strokeStyle = "blue";
    ctx.strokeRect(5, 5, 190, 40);

    const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    const canvasData = Array.from(pixelData).slice(0, 500) .join(',');
    return canvasData;
}
getDeviceFingerprint();