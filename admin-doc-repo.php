<?php
/**
 * Plugin Name:       Admin Doc Repo
 * Plugin URI: https://christopherdgibson.github.io/wordpress-plugins
 * Description:       Block for password-protected page document sharing.
 * Version:           0.1.0
 * Requires at least: 6.8
 * Requires PHP:      7.4
 * Author: Christopher D Gibson
 * Author URI: https://christopherdgibson.github.io
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       admin-doc-repo
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

    register_rest_route($ns, '/delete', [
        'methods'             => 'POST',
        'callback'            => 'sfm_api_delete',
        'permission_callback' => 'sfm_api_check_auth',
    ]);

    register_rest_route($ns, '/rename', [
        'methods'             => 'POST',
        'callback'            => 'sfm_api_rename',
        'permission_callback' => 'sfm_api_check_auth',
    ]);

    register_rest_route($ns, '/meta', [
        'methods'             => 'POST',
        'callback'            => 'sfm_api_save_meta',
        'permission_callback' => 'sfm_api_check_auth',
    ]);
});

function sfm_api_check_auth() {
    if (!session_id()) session_start();
    return !empty($_SESSION['sfm_authed']);
}

function sfm_get_password_hash() {
    return get_option('sfm_password_hash', '');
}

function sfm_api_login(WP_REST_Request $request) {
    if (!session_id()) session_start();

    $hash = sfm_get_password_hash();
    if (empty($hash)) {
        return new WP_Error('not_configured', 'No password has been set by the administrator.', ['status' => 503]);
    }

    $password = $request->get_param('password');
    if (password_verify($password, $hash)) {
        $_SESSION['sfm_authed'] = true;
        return rest_ensure_response(['success' => true]);
    }
    return new WP_Error('unauthorized', 'Incorrect password', ['status' => 401]);
}

function sfm_api_logout() {
    if (!session_id()) session_start();
    $_SESSION['sfm_authed'] = false;
    return rest_ensure_response(['success' => true]);
}

function sfm_api_list_files() {
    $files = glob(SFM_UPLOAD_DIR . '*') ?: [];
    $result = [];
    foreach ($files as $filepath) {
        $basename = basename($filepath);
        if ($basename === '.htaccess' || $basename === 'meta.json') continue;
        $meta = sfm_get_meta($basename);
        $result[] = [
            'filename' => $basename,
            'size'     => filesize($filepath),
            'uploaded' => filemtime($filepath),
            'url'      => SFM_UPLOAD_URL . $basename,
            'category' => $meta['category'] ?? '',
            'submittedBy' => $meta['submittedBy'] ?? '',
            'date'     => $meta['date'] ?? '',
			'amount'   => $meta['amount'] ?? '',
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
    $filename = sanitize_file_name($request->get_param('filename'));
    $filepath = SFM_UPLOAD_DIR . $filename;

    if (!file_exists($filepath) || strpos(realpath($filepath), realpath(SFM_UPLOAD_DIR)) !== 0) {
        return new WP_Error('not_found', 'File not found', ['status' => 404]);
    }

    unlink($filepath);
    sfm_delete_meta($filename);
    return rest_ensure_response(['success' => true]);
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
    $filename = sanitize_file_name($request->get_param('filename'));
    $category = sanitize_text_field($request->get_param('category') ?? '');
    $submittedBy = sanitize_text_field($request->get_param('submittedBy') ?? '');
    $date     = sanitize_text_field($request->get_param('date') ?? '');
	$amount   = sanitize_text_field($request->get_param('amount') ?? '');

    if (!file_exists(SFM_UPLOAD_DIR . $filename)) {
        return new WP_Error('not_found', 'File not found', ['status' => 404]);
    }

    sfm_save_meta($filename, ['category' => $category, 'submittedBy' => $submittedBy, 'date' => $date, 'amount' => $amount]);
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

    if (isset($_POST['sfm_new_password']) && check_admin_referer('sfm_settings_save')) {
        $new_password = $_POST['sfm_new_password'];
        if (!empty($new_password)) {
            update_option('sfm_password_hash', password_hash($new_password, PASSWORD_DEFAULT));
            $message = 'Password updated.';
        }
    }

    $is_configured = (bool) get_option('sfm_password_hash');
    ?>
    <div class="wrap">
        <h1>Admin Doc Repo Settings</h1>

        <?php if ($message): ?>
            <div class="notice notice-success"><p><?= esc_html($message) ?></p></div>
        <?php endif; ?>

        <?php if (!$is_configured): ?>
            <div class="notice notice-warning">
                <p>No password is set. The document repository will not allow access until you set one.</p>
            </div>
        <?php endif; ?>

        <form method="post">
            <?php wp_nonce_field('sfm_settings_save'); ?>
            <table class="form-table">
                <tr>
                    <th><label for="sfm_new_password">
                        <?= $is_configured ? 'Change Password' : 'Set Password' ?>
                    </label></th>
                    <td>
                        <input type="password" id="sfm_new_password" name="sfm_new_password" class="regular-text" autocomplete="new-password">
                        <p class="description">Visitors will need this password to access the document repository.</p>
                    </td>
                </tr>
            </table>
            <?php submit_button($is_configured ? 'Update Password' : 'Set Password'); ?>
        </form>
    </div>
    <?php
}