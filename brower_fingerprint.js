async function getDeviceFingerprint() {
    const deviceData = {
        platform : navigator.platform,
        navigator:navigator.hardwareConcurrency,
        cpuCores: navigator.hardwareConcurrency || 'Unknown', // Number of logical CPU cores (device-specific)
        // more data will be added here
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

getDeviceFingerprint();