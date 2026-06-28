=== Admin Doc Repo ===
Contributors: Christopher D Gibson
Tags: documents, file manager, password protected, block, expenses
Requires at least: 6.7
Tested up to: 6.9
Requires PHP: 8.0
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A password-protected document repository with expense tracking, delivered as a Gutenberg block.

== Description ==

Admin Doc Repo provides a secure, password-protected file repository embedded directly in any WordPress page via a Gutenberg block. Uploaded documents can be annotated with expense metadata — category, submitter, date, and amount — supporting multiple expense rows per document for cases where a single file contains multiple receipts.

**Features**

* Password-protected frontend access with two configurable access levels — full (upload, rename, delete, edit) and restricted (upload and add expenses only)
* Gutenberg block for embedding the repository on any page
* File upload with optional expense metadata captured at upload time
* Sortable, filterable document table
* Per-document expense tracking with multiple rows per file
* Inline rename and metadata editing
* Configurable categories and submitters via the block editor sidebar
* Customisable colours via the block editor
* WordPress admin dashboard file manager for administrators
* Settings page for configuring access passwords
* Deletion history with trash panel — deleted files are moved to trash rather than permanently removed, and can be restored by full access users

**Access Levels**

* **WordPress administrators** — full access via the dashboard File Manager, no password required beyond WordPress login
* **Full access users** — can upload, download, rename, delete files and edit all expense metadata
* **Restricted access users** — can upload files and add expense rows, but cannot rename or delete

== Installation ==

1. Upload the `admin-doc-repo` folder to `/wp-content/plugins/`
2. Activate the plugin through the **Plugins** menu in WordPress
3. Go to **Settings → Doc Repo** and set a full access password
4. Optionally set a restricted access password for users who should only be able to upload
5. Edit any page and add the **Admin Doc Repo** block from the block inserter
6. In the block sidebar, configure your categories and submitters
7. Publish the page and share the URL with your users

== Configuration ==

**Passwords**
Managed under **Settings → Doc Repo** in the WordPress admin. The full access password enables all operations. The restricted access password enables upload and expense entry only. Leaving the restricted password blank disables restricted access entirely.

**Categories and Submitters**
Configured in the block editor sidebar when the Admin Doc Repo block is selected. Changes are saved with the page and do not require plugin updates.

**Colours**
Configurable via the block editor sidebar. Primary colour, header text colour, border colour, and button colour can all be customised to match your theme.

== File Storage ==

**Uploads**
Uploaded files are stored in `wp-content/sfm-files/`, outside the plugin directory. This means files persist across plugin updates, deactivations, and reactivations. If you delete the plugin, files in `wp-content/sfm-files/` are not automatically removed and must be deleted manually if no longer needed.

**Trash**
Deleted files are not permanently removed. Full access users can view and restore deleted files via the trash panel, which displays the original filename, deletion date, and all associated expense records at the time of deletion. Trash entries are automatically pruned if the underlying file is no longer present.

== Frequently Asked Questions ==

= Where are uploaded files stored? =
In `wp-content/sfm-files/` on your server. This directory is created automatically on plugin activation and is protected from direct directory browsing.

= What file types are allowed? =
PDF, DOC, DOCX, XLS, XLSX, TXT, ZIP, PNG, and JPG.

= What happens if I forget the repository password? =
Administrators can set a new password at any time via **Settings → Doc Repo** without needing to know the old one. If a non-admin user forgets the password, they should contact the site administrator.

= Can I have multiple repositories on the same site? =
Not currently. All instances of the block share the same file storage and passwords.

= Is the repository publicly accessible? =
The repository page URL is not added to any navigation menu automatically. Files themselves are served via a direct URL once authenticated, but direct directory browsing is disabled. For sensitive documents, consider also enabling WordPress page-level password protection as an additional layer.

= What is the minimum PHP version? =
PHP 8.0 or higher is required for named arguments and match expressions used in the plugin.

== Screenshots ==

1. The document repository as seen by a full access user
2. Expense rows expanded for a single document
3. The block editor sidebar showing category and colour configuration
4. The Settings → Doc Repo password configuration page
5. The WordPress admin dashboard File Manager

== Changelog ==

= 1.0.0 =
* Initial release
* Password-protected frontend block with full and restricted access levels
* File upload, rename, delete, and download
* Per-document expense tracking with multiple rows
* Sortable and filterable document table
* Configurable categories, submitters, and colours via block editor
* WordPress admin dashboard file manager
* Settings page for password management
* Deletion history — files moved to trash on delete, restorable by full access users
* Automatic pruning of orphaned trash entries on trash panel load

== Upgrade Notice ==

= 1.0.0 =
Initial release.
