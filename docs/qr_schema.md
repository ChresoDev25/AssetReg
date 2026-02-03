# QR Code Data Schema - Version 1

## Overview
This document defines the standardized JSON schema used for QR code payloads in the Asset Registration System. This format replaces the legacy text-based "Label: Value" format.

## Schema Versioning
- **Current Version**: 1
- **Key**: `v` (Integer)

## JSON Contract
The payload is a minified JSON object containing the following keys.

```json
{
  "v": 1,
  "computerType": "Desktop",
  "institutionName": "Chreso University",
  "computerNumber": "Chreso01",
  "cpuSid": "CPU-123",
  "monitorSid": "MON-456",
  "mouseSid": "MOU-789",
  "officePackage": "Microsoft 365",
  "location": "Room 101",
  "osModel": "Windows 11 Pro",
  "assetStatus": "Functional"
}
```

## Field Definitions

| JSON Key | Type | Required | Description |
|----------|------|----------|-------------|
| `v` | Integer | **Yes** | Schema version identifier. Must be `1`. |
| `computerType` | String | **Yes** | Device type (e.g., "Laptop", "Server"). |
| `institutionName` | String | **Yes** | Max 100 chars. |
| `computerNumber` | String | **Yes** | Asset Tag / Inventory ID. |
| `cpuSid` | String | **Yes** | Computer Serial Number. |
| `monitorSid` | String | No | Monitor Serial Number. Omit if empty. |
| `mouseSid` | String | No | Mouse Serial Number. Omit if empty. |
| `officePackage` | String | No | Installed Office Suite. Omit if empty. |
| `location` | String | No | Physical location. Omit if empty. |
| `osModel` | String | **Yes** | Operating System (e.g., "Windows 11 Pro"). |
| `assetStatus` | String | **Yes** | Functional status (e.g., "Functional", "Faulty"). |

## Validation Rules
1. **No Nulls**: Optional fields with no value should be **omitted** from the JSON object entirely, not set to `null` or `undefined`.
2. **Encoding**: UTF-8.
3. **Minification**: The JSON string should be minified (no whitespace) to maximize QR error correction capacity.
