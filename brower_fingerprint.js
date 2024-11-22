async function getDeviceFingerprint() {
    const fonts = await detectFonts();

    const deviceData = {
        platform: navigator.platform,
        cpuCores: navigator.hardwareConcurrency || 'Unknown', // Number of logical CPU cores
        fonts: fonts, // Detected fonts
        screenResolution: `${screen.availWidth}x${screen.availHeight}`,
        audioFingerprint: audioFingerprint,
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
async function generateAudioFingerprint() {
    // Create an audio context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Create an oscillator node (a simple tone generator)
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine'; // A sine wave tone
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // Frequency of A4 (440 Hz)

    // Create a gain node to control the volume
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime); // Lower the volume

    // Connect the oscillator to the gain node, and then to the audio context's destination (i.e., speakers)
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Start the oscillator
    oscillator.start();

    // Stop the oscillator after a short time
    setTimeout(() => {
        oscillator.stop();
        audioContext.close(); // Close the context
    }, 1000); // Stop after 1 second

    // Wait for the audio context to be fully loaded and the audio to be played
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Use the analyser node to analyze the audio signal
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Connect the gain node to the analyser
    gainNode.connect(analyser);

    // Get the frequency data
    analyser.getByteFrequencyData(dataArray);

    // Create a hash of the frequency data using SHA-256
    const audioFingerprint = await generateSha256Hash(dataArray.join(","));
    
    return audioFingerprint;
}


getDeviceFingerprint();
