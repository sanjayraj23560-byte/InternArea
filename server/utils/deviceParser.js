import { UAParser } from "ua-parser-js";
export function parseDeviceInfo(userAgent = "") {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    const browser = result.browser.name || "Unknown";
    const os = result.os.name
        ? `${result.os.name}${result.os.version ? " " + result.os.version : ""}`
        : "Unknown";

    let deviceType = "Desktop";
    if (result.device.type === "mobile") deviceType = "Mobile";
    else if (result.device.type === "tablet") deviceType = "Tablet";

    return { browser, os, deviceType };
}