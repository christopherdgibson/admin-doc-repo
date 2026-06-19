<?php
wp_localize_script(
    'create-block-admin-doc-repo-view-script',
    'SFM',
    [
        'apiBase'    => rest_url('sfm/v1'),
        'nonce'      => wp_create_nonce('wp_rest'),
        'categories' => $attributes['categories'] ?? ['Reports', 'Invoices', 'Contracts', 'Other'],
    ]
);
?>
<div <?php echo get_block_wrapper_attributes(['id' => 'sfm-app']); ?>></div>