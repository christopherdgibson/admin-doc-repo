<?php
wp_localize_script(
    'create-block-admin-doc-repo-view-script',
    'SFM',
    [
        'apiBase'       => rest_url('sfm/v1'),
        'nonce'         => wp_create_nonce('wp_rest'),
        'categories'    => $attributes['categories'] ?? ['Reports', 'Invoices', 'Contracts', 'Other'],
        'submissions'   => $attributes['submissions'] ?? ['Employee', 'Admin'],
        'colors'        => [
            'baseColor'       => $attributes['baseColor'] ?? '',
            'headerTextColor' => $attributes['headerTextColor'] ?? '',
            'borderColor'     => $attributes['borderColor'] ?? '',
            'btnPrimaryColor' => $attributes['btnPrimaryColor'] ?? '',
        ],
        'permissions' => [
            'rename' => get_option('sfm_perm_rename', 'Show'),
            'delete'  => get_option('sfm_perm_delete', 'Show'),
            'trash'  => get_option('sfm_perm_trash', 'Show'),
            'restore'  => get_option('sfm_perm_restore', 'Show'),
            'purge' => get_option('sfm_perm_purge', 'Show'),

        ],
    ]
);
?>
<div <?php echo get_block_wrapper_attributes(['id' => 'sfm-app']); ?>></div>