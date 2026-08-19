# Cloud Sync with Google Drive

## Overview

Automatically backup your factories to Google Drive and sync them across multiple devices.

**Features:** Automatic backups, multi-device sync, namespace organization, per-factory control, conflict detection, manual backup/restore.

## Getting Started

1. Click the **Google Drive icon** in the top nav bar
2. Click **"Sign in with Google"** in the Cloud Sync tab
3. Authorize the app (it only accesses files it creates, not your entire Drive)
4. Factories are stored in `SatisProdTrak/` folder

## Namespaces

Namespaces organize your factories like folders. Examples: "Main Game", "Experimental", "Multiplayer Server".

**Rules:** No forward slashes, not `.` or `..`, max 255 characters.

## Auto-Sync

### Setup

1. Open **Import/Export modal** > **Cloud Sync** tab
2. Select or create a namespace
3. Check factories to auto-backup
4. Toggle **"Enable Auto-Sync"**

Changes save automatically 10 seconds after you stop editing. Each factory becomes a separate `.sptrak` file.

### Status Indicators

**Header Icon:**
| Icon | Status |
|------|--------|
| Gray Google icon | Not connected |
| Cloud + green check | Synced |
| Cloud + spinning | Syncing |
| Cloud + yellow ! | Conflict |
| Cloud + red X | Error |

**Factory Badges:** Green (synced), Blue (pending), Yellow (conflict), Red (error)

## Manual Backup & Restore

**Backup:** Cloud Sync tab > Manual Backup section > Select factories > Choose namespace > "Backup Selected Factories"

**Restore:** Cloud Sync tab > Browse Namespace dropdown > Click "Restore" on desired factory

## Multi-Device Sync

### Setup on Second Device

1. Sign in with the same Google account
2. Choose "Load Factories" when prompted
3. Enable auto-sync if desired

### Conflict Resolution

Conflicts occur when the same factory is modified on multiple devices.

When detected:
- Auto-sync disables automatically
- A **Conflicts** section appears in Cloud Sync tab
- Choose **"Use Cloud"** or **"Use Local"** for each conflict

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Auto-sync not working | Check cloud icon, internet, Google sign-in, factory selection, conflicts |
| Sync error (red) | Check error message; common causes: lost connection, quota exceeded, auth expired |
| Factory not in backup list | Check correct namespace, click refresh |
| Repeated sign-in requests | Check cookies/localStorage, try signing out and back in |

## Privacy & Security

- **Stored:** Factory configs, metadata, timestamps
- **Not stored:** Game save files
- **Location:** Your personal Google Drive in `SatisProdTrak/`
- **Permissions:** App only accesses files it creates (drive.file scope)

## File Format

Backups use `.sptrak` (JSON-based):

```json
{
  "metadata": {
    "version": "1.0",
    "instanceId": "uuid",
    "lastModified": "ISO-date",
    "factoryName": "Name",
    "namespace": "Namespace"
  },
  "factory": { /* factory data */ }
}
```

## FAQ

**Does auto-sync work offline?** No, but changes queue until you reconnect.

**How much storage do backups use?** Each factory is 10-50 KB.

**Can I use multiple Google accounts?** Yes, sign out to switch. Each account has separate backups.

**What happens if I delete a factory locally?** The cloud backup remains and you can restore it anytime.

**Are backups versioned?** No, each sync overwrites the previous backup. Renaming a factory also renames its cloud backup. Use different namespaces for versioning, using the import/export clipboard feature to copy factory data.

**Are other cloud providers supported?** Currently Google Drive only.

**Is cloud sync required to use the app?** No, cloud sync is entirely optional.
