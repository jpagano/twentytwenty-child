<?php
/**
 * Twenty Twenty Child functions and definitions
 *
 * @link https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * @package Twenty_Twenty_Child
 */

/**
 * Register and Enqueue Styles.
 */
function twentytwentychild_register_styles() {

    $theme_version = wp_get_theme()->get( 'Version' );

	wp_enqueue_style( 'twentytwenty-parent-style', get_template_directory_uri() . '/style.css' );
	wp_enqueue_style( 'twentytwenty-child-style', get_stylesheet_directory_uri() . '/dist/css/child-style.css', array('twentytwenty-parent-style'), $theme_version );

}

add_action( 'wp_enqueue_scripts', 'twentytwentychild_register_styles' );

/**
 * Register and Enqueue Scripts.
 */
function twentytwentychild_register_scripts() {

	$theme_version = wp_get_theme()->get( 'Version' );

	wp_enqueue_script( 'twentytwenty-child-scripts', get_stylesheet_directory_uri() . '/dist/js/scripts.js', array('jquery'), $theme_version, true );
	wp_script_add_data( 'twentytwenty-child-scripts', 'async', false );

}

add_action( 'wp_enqueue_scripts', 'twentytwentychild_register_scripts' );
