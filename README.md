# Admin Doc Repo

A WordPress plugin providing a password-protected document repository with expense tracking, delivered as a Gutenberg block.

## Features

- **Gutenberg block** — embed the repository on any WordPress page
- **Two access levels** — full access (upload, rename, delete, edit) and restricted access (upload and add expenses only)
- **Expense tracking** — multiple expense rows per document for files containing multiple receipts
- **Sortable, filterable table** — sort by filename, category, date, amount, size, or upload date; filter by category
- **Inline editing** — rename files and edit expense metadata without leaving the page
- **Block editor configuration** — categories, submitters, and colours configurable via the sidebar
- **WordPress admin file manager** — dashboard-level access for administrators
- **Settings page** — configure full and restricted access passwords via Settings → Doc Repo

## Requirements

- WordPress 6.7 or higher
- PHP 8.0 or higher
- Node.js 18+ and npm (for building from source)

## Installation

### From a zip file

1. Download the latest release from the [Releases](../../releases) page
2. In WordPress admin, go to **Plugins → Add New → Upload Plugin**
3. Upload the zip file and activate

### From source

```bash
git clone https://github.com/christopherdgibson/admin-doc-repo.git
cd admin-doc-repo
npm install
npm run build
```

Then copy or symlink the plugin folder to `wp-content/plugins/admin-doc-repo/` on your WordPress install.

## Setup

1. Activate the plugin
2. Go to **Settings → Doc Repo** and set a full access password
3. Optionally set a restricted access password
4. Edit a page and add the **Admin Doc Repo** block
5. Configure categories and submitters in the block sidebar
6. Publish the page and share the URL with your users

## Access Levels

| Capability | WP Admin | Full Access | Restricted Access |
|---|---|---|---|
| View files | ✓ | ✓ | ✓ |
| Download files | ✓ | ✓ | ✓ |
| Upload files | ✓ | ✓ | ✓ |
| Add expense rows | ✓ | ✓ | ✓ |
| Edit expense rows | ✓ | ✓ | — |
| Rename files | ✓ | ✓ | — |
| Delete files | ✓ | ✓ | — |
| Configure passwords | ✓ | — | — |
| Configure categories | ✓ | — | — |
| Restore deleted files | ✓ | ✓ | — |

WordPress administrators access the repository via the dashboard File Manager and bypass the frontend password entirely.

## File Storage

Files are stored in `wp-content/sfm-files/`, outside the plugin directory. This means:

- Files persist across plugin updates and reactivations
- Deleting the plugin does **not** delete uploaded files
- Manual cleanup of `wp-content/sfm-files/` is required if you want to fully remove all data

Metadata (categories, submitters, dates, amounts) is stored in `wp-content/sfm-files/meta.json` alongside the uploaded files.

## Deletion History

Deleted files are not permanently removed. Instead they are moved to `wp-content/sfm-files/trash/` and recorded in `wp-content/sfm-files/trash.json` with their original filename, deletion timestamp, and full expense metadata at the time of deletion.

Full access users can view the trash panel via the **Show Trash** button in the repository toolbar. Each entry shows the original filename, expense summary, deletion date, and a Restore button. Restoring a file moves it back to the main repository with its original metadata intact.

Orphaned trash entries (where the underlying file has been manually removed) are automatically pruned when the trash panel is loaded.

Trash is not automatically purged on a schedule — manual cleanup via the trash panel or direct editing of `trash.json` is required if storage is a concern. A configurable auto-prune by age (`sfm_prune_trash()`) is available in the plugin code but not currently active by default.

## Development

```bash
npm install       # install dependencies
npm run start     # watch mode for development
npm run build     # production build
```

### Directory Structure

```
admin-doc-repo/
├── admin-doc-repo.php    # Main plugin file — REST API, auth, metadata, admin page
├── package.json
├── tsconfig.json
├── webpack.config.js
├── src/
│   ├── block.json        # Block registration
│   ├── constants.json    # Colour panel constants
│   ├── render.php        # Frontend block output — passes PHP config to JS
│   ├── edit.tsx          # Edit component for configuration
│   ├── index.tsx         # Block editor registration
│   ├── view.tsx          # Frontend React app entry point
│   ├── style.scss        # Plugin style sheet
│   ├── types.ts          # Shared TypeScript interfaces
│   ├── globals.d.ts      # Global type declarations (window.SFM)
│   ├── declarations.d.ts # Module declarations (.scss, .css)
│   └── utils/api.ts      # REST API client
│   └── components/
│       ├── FileManager.tsx
│       ├── FileRow.tsx
│       ├── ExpenseButton.tsx
│       ├── ExpenseRow.tsx
│       ├── LoginForm.tsx
│       ├── TrashPanel.tsx
│       ├── SortIcon.tsx
│       └── ui-panels
│           ├── OptionsPanel
│           ├── ColorPanelDashboard
│           ├── CustomColorsPanel
│           ├── PresetColorsPanel
│           ├── RestoreToDefaults
│           └── TabButton
└── build/                # Compiled output (generated, do not edit)
```

### REST API Endpoints

All endpoints are under the `sfm/v1` namespace.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/login` | Public | Authenticate and establish session |
| POST | `/logout` | Public | Clear session |
| GET | `/session` | Public | Check current session access level |
| GET | `/files` | Any | List all files with metadata |
| POST | `/upload` | Any | Upload a file |
| POST | `/rename` | Full | Rename a file |
| POST | `/delete` | Full | Delete a file |
| GET | `/trash` | Full | List trashed files with metadata |
| POST | `/restore` | Full | Restore a trashed file |
| POST | `/meta` | Any | Save expense metadata for a file |

## Security Notes

- The frontend repository password is the only gate for non-WordPress users — choose a strong password
- Uploaded files are served via direct URL once authenticated; direct directory browsing is disabled via `.htaccess`
- File type uploads are restricted to: PDF, DOC, DOCX, XLS, XLSX, TXT, ZIP, PNG, JPG
- Passwords are stored as bcrypt hashes via PHP's `password_hash()` with `PASSWORD_DEFAULT`
- All file operations validate paths against the upload directory to prevent path traversal

## License

GPLv2 or later — see [LICENSE](LICENSE) for details.

## Author

Christopher D Gibson
