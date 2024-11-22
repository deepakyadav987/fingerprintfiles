async function getDeviceFingerprint() {
    const fonts = await detectFonts();

    const deviceData = {
        platform: navigator.platform,
        cpuCores: navigator.hardwareConcurrency || 'Unknown', 
        fonts: fonts, // Detected fonts
        screenResolution: `${screen.availWidth}x${screen.availHeight}`,
        
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

async function detectFonts() {
    const baseFonts = ['monospace', 'sans-serif', 'serif'];
    const testString = "abcdefghijklmnopqrstuvwxyz0123456789";
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
    ];

    const availableFonts = [];
    fontList.forEach((font) => {
        let isFontAvailable = false;

        baseFonts.forEach((baseFont) => {
            testElement.style.fontFamily = `${font}, ${baseFont}`;
            const newWidth = testElement.offsetWidth;
            const newHeight = testElement.offsetHeight;

            if (
                newWidth !== defaultDimensions[baseFont].width ||
                newHeight !== defaultDimensions[baseFont].height
            ) {
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


getDeviceFingerprint();
