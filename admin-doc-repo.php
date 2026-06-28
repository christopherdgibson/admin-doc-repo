<?php
/**
 * Plugin Name:         Admin Doc Repo
 * Plugin URI:          https://christopherdgibson.github.io/wordpress-plugins
 * Description:         Block for password-protected page document sharing.
 * Version:             0.1.0
 * Requires at least:   6.8
 * Requires PHP:        7.4
 * Author:              Christopher D Gibson
 * Author URI:          https://christopherdgibson.github.io
 * License:             GPL-2.0-or-later
 * License URI:         https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:         admin-doc-repo
 *
 * @package CreateBlock
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// ── Constants ────────────────────────────────────────────────

define('SFM_UPLOAD_DIR', WP_CONTENT_DIR . '/sfm-files/');
define('SFM_UPLOAD_URL', WP_CONTENT_URL . '/sfm-files/');

// ── Block Registration ───────────────────────────────────────

function create_block_admin_doc_repo_block_init() {
    wp_register_block_types_from_metadata_collection( __DIR__ . '/build', __DIR__ . '/build/blocks-manifest.php' );
}
add_action( 'init', 'create_block_admin_doc_repo_block_init' );

// ── Setup ────────────────────────────────────────────────────

function sfm_setup() {
    if (!file_exists(SFM_UPLOAD_DIR)) {
        wp_mkdir_p(SFM_UPLOAD_DIR);
        file_put_contents(SFM_UPLOAD_DIR . '.htaccess', 'Options -Indexes');
    }
}
register_activation_hook(__FILE__, 'sfm_setup');

// ── Admin Menu ───────────────────────────────────────────────

function sfm_admin_menu() {
    add_menu_page('File Manager', 'File Manager', 'read', 'sfm-files', 'sfm_render_page', 'dashicons-portfolio');
}
add_action('admin_menu', 'sfm_admin_menu');

// ── Metadata ─────────────────────────────────────────────────

function sfm_get_all_meta() {
    $path = SFM_UPLOAD_DIR . 'meta.json';
    if (!file_exists($path)) return [];
    return json_decode(file_get_contents($path), true) ?? [];
}

function sfm_get_meta($filename) {
    return sfm_get_all_meta()[$filename] ?? [];
}

function sfm_save_meta($filename, $meta) {
    $all = sfm_get_all_meta();
    $all[$filename] = $meta;
    file_put_contents(SFM_UPLOAD_DIR . 'meta.json', json_encode($all, JSON_PRETTY_PRINT));
}

function sfm_delete_meta($filename) {
    $all = sfm_get_all_meta();
    unset($all[$filename]);
    file_put_contents(SFM_UPLOAD_DIR . 'meta.json', json_encode($all, JSON_PRETTY_PRINT));
}

// ── REST API ─────────────────────────────────────────────────

add_action('rest_api_init', function() {
    $ns = 'sfm/v1';

    register_rest_route($ns, '/login', [
        'methods'             => 'POST',
        'callback'            => 'sfm_api_login',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route($ns, '/logout', [
        'methods'             => 'POST',
        'callback'            => 'sfm_api_logout',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route($ns, '/session', [
        'methods'             => 'GET',
        'callback'            => 'sfm_api_session',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route($ns, '/files', [
        'methods'             => 'GET',
        'callback'            => 'sfm_api_list_files',
        'permission_callback' => 'sfm_api_check_auth',
    ]);

    register_rest_route($ns, '/upload', [
        'methods'             => 'POST',
        'callback'            => 'sfm_api_upload',
        'permission_callback' => 'sfm_api_check_auth',
    ]);

    register_rest_route($ns, '/rename', [
        'methods'             => 'POST',
        'callback'            => 'sfm_api_rename',
        'permission_callback' => 'sfm_api_check_auth',
    ]);

    register_rest_route($ns, '/delete', [
        'methods'             => 'POST',
        'callback'            => 'sfm_api_delete',
        'permission_callback' => 'sfm_api_check_auth',
    ]);

    register_rest_route($ns, '/purge', [
        'methods'             => 'POST',
        'callback'            => 'sfm_api_purge',
        'permission_callback' => 'sfm_api_check_auth',
    ]);

    register_rest_route($ns, '/trash', [
        'methods'             => 'GET',
        'callback'            => 'sfm_api_list_trash',
        'permission_callback' => 'sfm_api_check_full_access',
    ]);

    register_rest_route($ns, '/restore', [
        'methods'             => 'POST',
        'callback'            => 'sfm_api_restore',
        'permission_callback' => 'sfm_api_check_full_access',
    ]);

    register_rest_route($ns, '/meta', [
        'methods'             => 'POST',
        'callback'            => 'sfm_api_save_meta',
        'permission_callback' => 'sfm_api_check_auth',
    ]);
});

function sfm_api_check_auth() {
    if (!session_id()) session_start();
    return !empty($_SESSION['sfm_access']);
}

function sfm_api_check_full_access() {
    if (!session_id()) session_start();
    return ($_SESSION['sfm_access'] ?? '') === 'full';
}

function sfm_get_password_hash() {
    return get_option('sfm_password_hash_full', '');
}

function sfm_api_login(WP_REST_Request $request) {
    if (!session_id()) session_start();

    $full_hash       = get_option('sfm_password_hash_full', '');
    $restricted_hash = get_option('sfm_password_hash_restricted', '');

    if (empty($full_hash)) {
        return new WP_Error('not_configured', 'No password has been set by the administrator.', ['status' => 503]);
    }

    $password = $request->get_param('password');

    if (!empty($full_hash) && password_verify($password, $full_hash)) {
        $_SESSION['sfm_access'] = 'full';
        return rest_ensure_response(['success' => true, 'access' => 'full']);
    }
    if (!empty($restricted_hash) && password_verify($password, $restricted_hash)) {
        $_SESSION['sfm_access'] = 'restricted';
        return rest_ensure_response(['success' => true, 'access' => 'restricted']);
    }

    return new WP_Error('unauthorized', 'Incorrect password', ['status' => 401]);
}

function sfm_api_logout() {
    if (!session_id()) session_start();
    $_SESSION['sfm_access'] = null;
    unset($_SESSION['sfm_access']);
    return rest_ensure_response(['success' => true]);
}

function sfm_api_session() {
    if (!session_id()) session_start();
    $access = $_SESSION['sfm_access'] ?? null;
    return rest_ensure_response(['access' => $access]);
}

function sfm_api_list_files() {
    $files = glob(SFM_UPLOAD_DIR . '*') ?: [];
    $result = [];
    foreach ($files as $filepath) {
        $basename = basename($filepath);
        //if (!is_file($filepath)) continue; // consider for future robustness
        if (in_array($basename, ['.htaccess', 'meta.json', 'trash.json', 'trash'])) continue;
        $meta = sfm_get_meta($basename);
        $result[] = [
            'filename' => $basename,
            'size'     => filesize($filepath),
            'uploaded' => filemtime($filepath),
            'url'      => SFM_UPLOAD_URL . $basename,
            'meta'     => $meta ?: [],  // empty array for initial upload
        ];
    }
    return rest_ensure_response($result);
}

function sfm_api_upload(WP_REST_Request $request) {
    $file    = $request->get_file_params()['sfm_file'] ?? null;
    $allowed = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'zip', 'png', 'jpg'];

    if (!$file) {
        return new WP_Error('no_file', 'No file provided', ['status' => 400]);
    }

    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, $allowed)) {
        return new WP_Error('invalid_type', 'File type not allowed', ['status' => 400]);
    }

    $filename = sanitize_file_name($file['name']);

    if (file_exists(SFM_UPLOAD_DIR . $filename)) {
        return new WP_Error('name_taken', 'A file with that name already exists. Rename or delete it first.', ['status' => 409]);
    }

    if (move_uploaded_file($file['tmp_name'], SFM_UPLOAD_DIR . $filename)) {
        return rest_ensure_response(['success' => true, 'filename' => $filename]);
    }

    return new WP_Error('upload_failed', 'Upload failed', ['status' => 500]);
}

function sfm_api_delete(WP_REST_Request $request) {
    // Permanently delete files older than 30 days
    sfm_prune_trash(30);

    $filename = sanitize_file_name($request->get_param('filename'));
    $filepath = SFM_UPLOAD_DIR . $filename;

    if (!file_exists($filepath) || strpos(realpath($filepath), realpath(SFM_UPLOAD_DIR)) !== 0) {
        return new WP_Error('not_found', 'File not found', ['status' => 404]);
    }

    // Move to trash instead of deleting
    $trash_dir = SFM_UPLOAD_DIR . 'trash/';
    if (!file_exists($trash_dir)) {
        wp_mkdir_p($trash_dir);
        file_put_contents($trash_dir . '.htaccess', 'Options -Indexes');
    }

    $timestamp    = time();
    $trash_name   = $timestamp . '_' . $filename;
    $trash_path   = $trash_dir . $trash_name;

    rename($filepath, $trash_path);

    // Record in trash.json
    $meta = sfm_get_meta($filename);
    sfm_delete_meta($filename);
    sfm_record_trash($filename, $trash_name, $meta, $timestamp);

    return rest_ensure_response(['success' => true]);
}

function sfm_api_purge(WP_REST_Request $request) {
    $trash_filename = sanitize_file_name($request->get_param('trash_filename'));
    $trash_path     = SFM_UPLOAD_DIR . 'trash/' . $trash_filename;

    if (!file_exists($trash_path) || strpos(realpath($trash_path), realpath(SFM_UPLOAD_DIR . 'trash/')) !== 0) {
        return new WP_Error('not_found', 'Trashed file not found', ['status' => 404]);
    }

    unlink($trash_path);

    // Remove entry from trash.json
    $path    = SFM_UPLOAD_DIR . 'trash.json';
    $history = file_exists($path) ? json_decode(file_get_contents($path), true) : [];
    $history = array_filter($history, fn($e) => $e['trash_filename'] !== $trash_filename);
    file_put_contents($path, json_encode(array_values($history), JSON_PRETTY_PRINT));

    return rest_ensure_response(['success' => true]);
}

function sfm_record_trash(string $filename, string $trash_name, array $meta, int $timestamp) {
    $path    = SFM_UPLOAD_DIR . 'trash.json';
    $history = file_exists($path) ? json_decode(file_get_contents($path), true) : [];

    $history[] = [
        'original_filename' => $filename,
        'trash_filename'    => $trash_name,
        'deleted_at'        => $timestamp,
        'meta'              => $meta,
    ];

    file_put_contents($path, json_encode($history, JSON_PRETTY_PRINT));
}

function sfm_api_list_trash() {
    $path    = SFM_UPLOAD_DIR . 'trash.json';
    $history = file_exists($path) ? json_decode(file_get_contents($path), true) : [];

    $valid = array_filter($history, function($entry) {
        return file_exists(SFM_UPLOAD_DIR . 'trash/' . $entry['trash_filename']);
    });

    // If any orphaned entries were found, prune and save
    if (count($valid) !== count($history)) {
        file_put_contents($path, json_encode(array_values($valid), JSON_PRETTY_PRINT));
    }

    return rest_ensure_response(array_values($valid));
}

function sfm_api_restore(WP_REST_Request $request) {
    $trash_filename = sanitize_file_name($request->get_param('trash_filename'));
    $trash_path     = SFM_UPLOAD_DIR . 'trash/' . $trash_filename;

    if (!file_exists($trash_path)) {
        return new WP_Error('not_found', 'Trashed file not found', ['status' => 404]);
    }

    // Read trash record to get original filename and meta
    $path    = SFM_UPLOAD_DIR . 'trash.json';
    $history = json_decode(file_get_contents($path), true);
    $entry   = array_filter($history, fn($e) => $e['trash_filename'] === $trash_filename);
    $entry   = array_values($entry)[0] ?? null;

    if (!$entry) {
        return new WP_Error('not_found', 'Trash record not found', ['status' => 404]);
    }

    $original = SFM_UPLOAD_DIR . $entry['original_filename'];

    // Don't overwrite if a file with the same name now exists
    if (file_exists($original)) {
        return new WP_Error('name_taken', 'A file with that name already exists', ['status' => 409]);
    }

    rename($trash_path, $original);
    sfm_save_meta($entry['original_filename'], $entry['meta']);

    // Remove from trash.json
    $history = array_filter($history, fn($e) => $e['trash_filename'] !== $trash_filename);
    file_put_contents($path, json_encode(array_values($history), JSON_PRETTY_PRINT));

    return rest_ensure_response(['success' => true, 'filename' => $entry['original_filename']]);
}

function sfm_prune_trash(int $days = 30) {
    $path    = SFM_UPLOAD_DIR . 'trash.json';
    $history = file_exists($path) ? json_decode(file_get_contents($path), true) : [];
    $cutoff  = time() - ($days * 86400);

    $history = array_filter($history, function($entry) use ($cutoff) {
        if ($entry['deleted_at'] < $cutoff) {
            // Also remove the file from trash/
            $trash_path = SFM_UPLOAD_DIR . 'trash/' . $entry['trash_filename'];
            if (file_exists($trash_path)) unlink($trash_path);
            return false;
        }
        return true;
    });

    file_put_contents($path, json_encode(array_values($history), JSON_PRETTY_PRINT));
}

function sfm_api_rename(WP_REST_Request $request) {
    $old_filename = sanitize_file_name($request->get_param('old_filename'));
    $new_filename = sanitize_file_name($request->get_param('new_filename'));
    $old_path     = SFM_UPLOAD_DIR . $old_filename;
    $new_path     = SFM_UPLOAD_DIR . $new_filename;

    if (empty($new_filename)) {
        return new WP_Error('invalid_name', 'Filename cannot be empty', ['status' => 400]);
    }
    if (file_exists($new_path)) {
        return new WP_Error('name_taken', 'A file with that name already exists', ['status' => 409]);
    }
    if (!file_exists($old_path) || strpos(realpath($old_path), realpath(SFM_UPLOAD_DIR)) !== 0) {
        return new WP_Error('not_found', 'File not found', ['status' => 404]);
    }

    rename($old_path, $new_path);
    $meta = sfm_get_meta($old_filename);
    sfm_delete_meta($old_filename);
    sfm_save_meta($new_filename, $meta);

    return rest_ensure_response(['success' => true]);
}

function sfm_api_save_meta(WP_REST_Request $request) {
    $filename   = sanitize_file_name($request->get_param('filename'));
    $rows_input = $request->get_param('rows') ?? [];

    $rows = array_map(function($row) {
        return [
            'category'    => sanitize_text_field($row['category'] ?? ''),
            'submittedBy' => sanitize_text_field($row['submittedBy'] ?? ''),
            'date'        => sanitize_text_field($row['date'] ?? ''),
            'amount'      => sanitize_text_field($row['amount'] ?? ''),
        ];
    }, $rows_input);

    if (!file_exists(SFM_UPLOAD_DIR . $filename)) {
        return new WP_Error('not_found', 'File not found', ['status' => 404]);
    }

    sfm_save_meta($filename, $rows);
    return rest_ensure_response(['success' => true]);
}

// ── Admin Page (pure PHP) ────────────────────────────────────

function sfm_handle_actions() {
    if (!session_id()) session_start();

	$result = ['error' => '', 'message' => '', 'renaming' => ''];

    $hash = sfm_get_password_hash();
    if (empty($hash)) {
        $result['error'] = 'No password has been set by the administrator. Go to Settings → Doc Repo to set one.';
        return $result;
    }

    if (isset($_POST['sfm_password'])) {
        if (password_verify($_POST['sfm_password'], $hash)) {
            $_SESSION['sfm_authed'] = true;
        } else {
            $result['error'] = 'Incorrect password.';
        }
    }

    if (!empty($_SESSION['sfm_authed']) && isset($_FILES['sfm_file'])) {
        $file    = $_FILES['sfm_file'];
        $allowed = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'zip', 'png', 'jpg'];
        $ext     = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (in_array($ext, $allowed)) {
            $filename = sanitize_file_name($file['name']);
            if (move_uploaded_file($file['tmp_name'], SFM_UPLOAD_DIR . $filename)) {
                $result['message'] = "Uploaded: $filename";
            }
        } else {
            $result['error'] = 'File type not allowed.';
        }
    }

    if (isset($_POST['sfm_cancel_rename'])) {
        return $result;
    }

    if (!empty($_SESSION['sfm_authed']) && isset($_POST['sfm_rename_old'], $_POST['sfm_rename_new'])) {
        $old_filename = sanitize_file_name($_POST['sfm_rename_old']);
        $new_filename = sanitize_file_name($_POST['sfm_rename_new']);
        $old_path     = SFM_UPLOAD_DIR . $old_filename;
        $new_path     = SFM_UPLOAD_DIR . $new_filename;

        if (empty($new_filename)) {
            $result['error']    = 'Filename cannot be empty.';
            $result['renaming'] = $old_filename;
        } elseif (file_exists($new_path)) {
            $result['error']    = 'A file with that name already exists.';
            $result['renaming'] = $old_filename;
        } elseif (file_exists($old_path) && strpos(realpath($old_path), realpath(SFM_UPLOAD_DIR)) === 0) {
            rename($old_path, $new_path);
            $result['message'] = "Renamed to: $new_filename";
        }
    }

    if (!empty($_SESSION['sfm_authed']) && isset($_POST['sfm_delete'])) {
        $filename = sanitize_file_name($_POST['sfm_delete']);
        $filepath = SFM_UPLOAD_DIR . $filename;
        if (file_exists($filepath) && strpos(realpath($filepath), realpath(SFM_UPLOAD_DIR)) === 0) {
            unlink($filepath);
            $result['message'] = "Deleted: $filename";
        }
    }

    if (isset($_POST['sfm_renaming'])) {
        $result['renaming'] = sanitize_file_name($_POST['sfm_renaming']);
    }

    return $result;
}

function sfm_render_login_form($error) {
    ob_start(); ?>
    <?php if ($error): ?><p style="color:red"><?= esc_html($error) ?></p><?php endif; ?>
    <form method="post">
        <?php wp_nonce_field('sfm_login'); ?>
        <label>Password</label>
        <input type="password" name="sfm_password">
        <button type="submit">Enter</button>
    </form>
    <?php return ob_get_clean();
}

function sfm_render_file_manager($message, $error, $renaming, $logout_url) {
    $files = glob(SFM_UPLOAD_DIR . '*') ?: [];
    ob_start(); ?>
    <?php if ($message): ?><p style="color:green"><?= esc_html($message) ?></p><?php endif; ?>
    <?php if ($error): ?><p style="color:red"><?= esc_html($error) ?></p><?php endif; ?>

    <h3>Upload a File</h3>
    <form method="post" enctype="multipart/form-data">
        <?php wp_nonce_field('sfm_upload'); ?>
        <input type="file" name="sfm_file">
        <button type="submit">Upload</button>
    </form>

    <h3>Files</h3>
    <?php if (empty($files)): ?>
        <p>No files uploaded yet.</p>
    <?php else: ?>
        <ul>
        <?php foreach ($files as $filepath):
            $basename = basename($filepath);
            if ($basename === '.htaccess' || $basename === 'meta.json') continue;
            $is_renaming = ($renaming === $basename);
        ?>
            <li>
                <?php if ($is_renaming): ?>
                    <form method="post" style="display:inline">
                        <?php wp_nonce_field('sfm_rename'); ?>
                        <input type="hidden" name="sfm_rename_old" value="<?= esc_attr($basename) ?>">
                        <input type="text" name="sfm_rename_new" value="<?= esc_attr($basename) ?>">
                        <button type="submit">Save</button>
                    </form>
                    <form method="post" style="display:inline">
                        <?php wp_nonce_field('sfm_cancel_rename_nonce'); ?>
                        <input type="hidden" name="sfm_cancel_rename" value="1">
                        <button type="submit">Cancel</button>
                    </form>
                <?php else: ?>
                    <?= esc_html($basename) ?>
                    <a href="<?= esc_url(SFM_UPLOAD_URL . $basename) ?>" download>Download</a>
                    <form method="post" style="display:inline">
                        <?php wp_nonce_field('sfm_rename_toggle'); ?>
                        <input type="hidden" name="sfm_renaming" value="<?= esc_attr($basename) ?>">
                        <button type="submit" style="background:none;border:none;cursor:pointer;padding:0">Rename</button>
                    </form>
                    <form method="post" style="display:inline"
                          onsubmit="return confirm('Delete this file?')">
                        <?php wp_nonce_field('sfm_delete'); ?>
                        <input type="hidden" name="sfm_delete" value="<?= esc_attr($basename) ?>">
                        <button type="submit" style="color:red;background:none;border:none;cursor:pointer;padding:0">Delete</button>
                    </form>
                <?php endif; ?>
            </li>
        <?php endforeach; ?>
        </ul>
    <?php endif; ?>

    <p><a href="<?= esc_url($logout_url) ?>">Log out</a></p>
    <?php return ob_get_clean();
}

function sfm_render_page() {
    if (!session_id()) session_start();

    if (isset($_GET['sfm_logout'])) {
        $_SESSION['sfm_authed'] = false;
        wp_redirect(admin_url('admin.php?page=sfm-files'));
        exit;
    }

    $result     = sfm_handle_actions();
    $logout_url = admin_url('admin.php?page=sfm-files&sfm_logout=1');
    $is_configured = (bool) sfm_get_password_hash();
    $settings_url  = admin_url('options-general.php?page=sfm-settings');

    echo '<div class="wrap"><h1>File Manager</h1>';

    if ($is_configured) {
        echo '<p style="color:#2271b1;">✓ Password is configured. <a href="' . esc_url($settings_url) . '">Change it</a></p>';
    } else {
        echo '<p style="color:#c0392b;">✗ No password set. <a href="' . esc_url($settings_url) . '">Set one now</a></p>';
    }

    if (empty($_SESSION['sfm_authed'])) {
        echo sfm_render_login_form($result['error']);
    } else {
        echo sfm_render_file_manager($result['message'], $result['error'], $result['renaming'], $logout_url);
    }
    echo '</div>';
}

// ── Settings Page ────────────────────────────────────────────

function sfm_settings_menu() {
    add_options_page(
        'Admin Doc Repo Settings',
        'Doc Repo',
        'manage_options',
        'sfm-settings',
        'sfm_render_settings_page'
    );
}
add_action('admin_menu', 'sfm_settings_menu');

function sfm_render_settings_page() {
    if (!current_user_can('manage_options')) return;

    $message = '';

    if (isset($_POST['sfm_save_settings']) && check_admin_referer('sfm_settings_save')) {
        if (!empty($_POST['sfm_password_full'])) {
            update_option('sfm_password_hash_full', password_hash($_POST['sfm_password_full'], PASSWORD_DEFAULT));
            $message = 'Full access password updated.';
        }
        if (!empty($_POST['sfm_password_restricted'])) {
            update_option('sfm_password_hash_restricted', password_hash($_POST['sfm_password_restricted'], PASSWORD_DEFAULT));
            $message .= ' Restricted access password updated.';
        }
    }

    $full_configured       = (bool) get_option('sfm_password_hash_full');
    $restricted_configured = (bool) get_option('sfm_password_hash_restricted');

    ?>
    <div class="wrap">
        <h1>Admin Doc Repo Settings</h1>

        <?php if ($message): ?>
            <div class="notice notice-success"><p><?= esc_html(trim($message)) ?></p></div>
        <?php endif; ?>

        <?php if (!$full_configured): ?>
            <div class="notice notice-warning">
                <p>No full access password set. The repository will not allow any access until one is configured.</p>
            </div>
        <?php endif; ?>

        <form method="post">
            <?php wp_nonce_field('sfm_settings_save'); ?>
            <table class="form-table">
                <tr>
                    <th><label for="sfm_password_full">
                        <?= $full_configured ? 'Change Full Access Password' : 'Set Full Access Password' ?>
                    </label></th>
                    <td>
                        <input type="password" id="sfm_password_full" name="sfm_password_full"
                               class="regular-text" autocomplete="new-password">
                        <p class="description">Full access — upload, rename, delete, edit expenses.</p>
                    </td>
                </tr>
                <tr>
                    <th><label for="sfm_password_restricted">
                        <?= $restricted_configured ? 'Change Restricted Access Password' : 'Set Restricted Access Password (optional)' ?>
                    </label></th>
                    <td>
                        <input type="password" id="sfm_password_restricted" name="sfm_password_restricted"
                               class="regular-text" autocomplete="new-password">
                        <p class="description">Restricted access — upload and add expenses only. Leave blank to keep unchanged.</p>
                    </td>
                </tr>
            </table>
            <?php submit_button('Save Passwords', 'primary', 'sfm_save_settings'); ?>
        </form>
    </div>
    <?php
}