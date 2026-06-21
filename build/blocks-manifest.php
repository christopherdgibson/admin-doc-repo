<?php
// This file is generated. Do not modify it manually.
return array(
	'admin-doc-repo' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'create-block/admin-doc-repo',
		'version' => '0.1.0',
		'title' => 'Admin Doc Repo',
		'category' => 'widgets',
		'icon' => 'media-document',
		'description' => 'Block for password-protected page document sharing.',
		'example' => array(
			
		),
		'attributes' => array(
			'align' => array(
				'type' => 'string',
				'default' => 'wide'
			),
			'categories' => array(
				'type' => 'array',
				'default' => array(
					'Candles',
					'Coffee',
					'Milk/Sugar',
					'Kitchen Roll',
					'Tea'
				)
			),
			'submissions' => array(
				'type' => 'array',
				'default' => array(
					'Employee',
					'Supplier'
				)
			)
		),
		'supports' => array(
			'align' => array(
				'wide',
				'full'
			),
			'html' => false
		),
		'render' => 'file:./render.php',
		'textdomain' => 'admin-doc-repo',
		'editorScript' => 'file:./index.js',
		'editorStyle' => 'file:./index.css',
		'style' => 'file:./style-index.css',
		'viewScript' => 'file:./view.js'
	)
);
