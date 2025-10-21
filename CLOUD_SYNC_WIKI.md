# Cloud Sync with Google Drive

## Overview

The Satisfactory Production Tracker includes cloud sync functionality that allows you to automatically backup your factories to Google Drive and seamlessly sync them across multiple devices.

## Key Features

- **Automatic Backups**: Changes to your factories are automatically saved to Google Drive
- **Multi-Device Sync**: Work on your factories from any device with conflict detection
- **Namespace Organization**: Group factories by game, save, or playthrough
- **Per-Factory Control**: Choose which factories to backup
- **Visual Status Indicators**: Always know the sync status of your factories
- **Manual Backup/Restore**: Full control over your cloud backups

## Getting Started

### 1. Connect to Google Drive

1. Click the **Google Drive icon** in the top navigation bar
2. Click **"Sign in with Google"** in the Cloud Sync tab
3. Authorize the app to access your Google Drive
4. Your factories will be stored in a folder called `SatisProdTrak`

> **Note**: The app only has access to files it creates, not your entire Google Drive.

### 2. Choose a Namespace

Namespaces help you organize your factories. Think of them like folders:

- **Main Game** - Your primary playthrough
- **Experimental** - Testing builds and designs
- **Multiplayer Server** - Shared factory setups
- **Update 1.1 Testing** - Trying new game features

You can create as many namespaces as you need and switch between them at any time (until you run out of storage space).

## Auto-Sync

Auto-sync automatically backs up selected factories whenever you make changes (on a 10-second delay).

### Enabling Auto-Sync

1. Open the **Import/Export modal** (click the export icon in the nav bar)
2. Go to the **Cloud Sync** tab
3. Select or create a **namespace**
4. Check the factories you want to auto-backup
5. Toggle **"Enable Auto-Sync"**

### How Auto-Sync Works

- Changes are saved **10 seconds** after you stop editing
- Only **selected factories** are backed up
- Each factory is saved as a separate `.sptrak` file under the current namespace
- The **cloud icon** in the header shows your sync status

### Sync Status Indicators

#### Header Icon (Top Navigation)
- **Google icon** (gray): Not connected to Drive
- **Cloud + green check**: All changes synced ✓
- **Cloud + spinning**: Syncing in progress ⟳
- **Cloud + yellow exclamation**: Conflict detected ⚠️
- **Cloud + red X**: Sync error ✗

#### Factory List (Left Drawer)
Each factory shows a small badge indicating its sync status:
- **Expanded Drawer**: Full icon (check, spinner, alert, etc.)
- **Collapsed Drawer**: Colored dot (green, blue, yellow, red)

**Badge Colors**:
- 🟢 **Green**: Synced successfully
- 🔵 **Blue**: Changes pending or syncing
- 🟡 **Yellow**: Conflict needs resolution
- 🔴 **Red**: Sync error

### Adding New Factories to Auto-Sync

When you create or import a new factory while auto-sync is enabled:
1. A prompt will ask if you want to include it in auto-sync
2. Choose **"Add to Auto-Sync"** to backup immediately
3. Or **"Skip"** to exclude it from automatic backups

## Manual Backup & Restore

### Manual Backup

1. Go to **Cloud Sync** tab
2. Scroll to **"Manual Backup"** section
3. Select factories to backup
4. Choose your namespace
5. Click **"Backup Selected Factories"**

### Restoring Factories

1. Go to **Cloud Sync** tab
2. Select a namespace from the **"Browse Namespace"** dropdown
3. View available backups in the list
4. Click **"Restore"** on the factory you want
5. If a factory with that name exists, you'll be prompted to rename it
6. Click **"Restore"** to complete

### Managing Backups

- **Refresh**: Click the refresh button to reload the backup list
- **Delete**: Click the trash icon to permanently delete a backup from Drive
- **Download**: (Future feature) Download a backup file directly

## Namespace Management

### Switching Namespaces

When you switch namespaces:
1. If you have **unsaved changes**, you'll be warned
2. Auto-sync is temporarily disabled
3. You can optionally **load factories from the new namespace**
4. Re-enable auto-sync if desired

> **Warning**: Switching namespaces with unsaved changes may result in data loss. Always ensure your work is backed up first!

### Creating Namespaces

Namespaces are created automatically when you:
- Type a new name in the namespace selector
- Click the **"+"** button next to the namespace field

**Namespace Rules**:
- Cannot contain forward slashes (`/`)
- Cannot be `.` or `..`
- Cannot be only spaces
- Maximum 255 characters

## Multi-Device Usage

### Setting Up a Second Device

1. Open the app on your second device
2. Sign in to Google Drive with the same account
3. The app will detect existing backups
4. Choose **"Load Factories"** to restore your work
5. Enable auto-sync if desired

### Conflict Detection

Conflicts occur when the same factory is modified on multiple devices. The app detects conflicts using:
- **Instance ID**: Each device has a unique identifier
- **Timestamps**: Track when changes were made

**When a Conflict is Detected**:
1. Auto-sync is automatically disabled
2. A **Conflicts** section appears in the Cloud Sync tab
3. You must manually resolve each conflict

### Resolving Conflicts

For each conflicted factory, choose:
- **Use Cloud**: Discard local changes, load the cloud version
- **Use Local**: Overwrite cloud with your local version

> **Tip**: Check the timestamps to see which version is newer.

After resolving all conflicts, you can re-enable auto-sync.

## Troubleshooting

### Auto-Sync Not Working

1. Check the **header cloud icon** for error status
2. Ensure you have an **active internet connection**
3. Verify you're **signed in to Google Drive**
4. Check that the factory is **selected for auto-sync**
5. Look for a **conflict** that needs resolution

### "Sync Error" Status

If a red error indicator appears:
1. Auto-sync has been disabled
2. Check the error message in the modal
3. Common causes:
   - Lost internet connection
   - Google Drive API quota exceeded
   - Authentication expired
4. Fix the issue and re-enable auto-sync

### Factory Not Appearing in Backup List

- Ensure you're viewing the **correct namespace**
- Click the **refresh button** to reload the list
- Check that the factory was actually backed up (look at sync status)

### Authentication Issues

If you're repeatedly asked to sign in:
1. Check your browser's **cookie settings**
2. Ensure **localStorage** is enabled
3. Try signing out completely and signing back in
4. Check that the app domain is allowed in Google account settings

## Privacy & Security

### What Data is Stored

- **Factory configurations**: Recipe chains, floors, links, and external inputs
- **Metadata**: Timestamps, instance IDs, factory names
- **No game progress**: The app does not access or store your Satisfactory save files

### Data Location

- Backups are stored in **your personal Google Drive**
- The app folder is `SatisProdTrak/`
- You can access, download, or delete these files directly in Google Drive

### Permissions

The app requests the `drive.file` scope, which means:
- ✅ Can read/write files it creates
- ❌ Cannot access other files in your Drive
- ❌ Cannot see your Drive structure
- ❌ Cannot access files from other apps

### Sharing Backups

To share a factory with a friend:
1. Use the clipboard or file export directly.
2. To share the google drive file:
  - Go to your **Google Drive**
  - Navigate to `SatisProdTrak/[namespace]/`
  - Right-click the `.sptrak` file
  - Choose **"Share"** and send them the link
  - They can download and restore it using the Import feature

## File Format

Factory backups use the `.sptrak` format (JSON-based):

```json
{
  "metadata": {
    "version": "1.0",
    "instanceId": "550e8400-e29b-41d4-a9f6-446655440000",
    "lastModified": "2025-10-20T14:30:22.123Z",
    "factoryName": "Main Base",
    "namespace": "Main Game"
  },
  "factory": {
    // Factory data (recipes, floors, links, etc.)
  }
}
```

These files can be:
- Opened in any text editor
- Manually edited (advanced users)
- Shared with other users
- Imported using the Import feature

## Tips & Best Practices

### 1. Use Descriptive Namespace Names
Instead of "Test" or "New", use meaningful names like "Update 8 Playthrough" or "Ficsmas 2024 Build".

### 2. Enable Auto-Sync for Important Factories
Keep your main factories protected with automatic backups.

### 3. Manual Backups Before Major Changes
Before reorganizing floors or making large changes, create a manual backup as a safety net.

### 4. Regularly Check Sync Status
Glance at the factory badges in the drawer to ensure everything is synced.

### 5. Resolve Conflicts Promptly
Don't let conflicts accumulate. Resolve them as soon as they appear.

### 6. Use Separate Namespaces for Different Playthroughs
Keep each game save organized in its own namespace.

### 7. Clean Up Old Backups
Periodically delete old or unused backups to keep your Drive organized.

## FAQ

**Q: Does auto-sync work offline?**
A: No. Auto-sync requires an internet connection. Changes will queue and sync when you reconnect.

**Q: How much Google Drive storage do backups use?**
A: Very little. Each factory is typically 10-50 KB. Even hundreds of factories use minimal space.

**Q: Can I use multiple Google accounts?**
A: Yes, but you'll need to sign out and sign back in to switch accounts. Each account has separate backups.

**Q: What happens if I delete a factory locally?**
A: The cloud backup remains. You can restore it anytime from the Cloud Sync tab.

**Q: Can I backup everything at once?**
A: Yes! In manual backup, click "Select All" and then backup. For auto-sync, select all factories when configuring.

**Q: Are backups versioned?**
A: Not currently - each backup is overwritten when synced. Use distinct namespaces or keep manual backups for different versions.

**Q: Can I use Dropbox or OneDrive instead?**
A: Not yet. Google Drive is the only supported provider in the current version.

**Q: Does the app work without cloud sync?**
A: Absolutely! Cloud sync is entirely optional. The app works perfectly fine with just local storage.

## Support

If you encounter issues with cloud sync:
1. Check this documentation first
2. Review the error message carefully
3. Try signing out and back in
4. Report persistent issues on GitHub
