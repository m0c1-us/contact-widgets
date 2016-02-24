=== Contact Widgets ===
Contributors:      jonathanbardo, fjarrett
Tags:              widget, contact, social, sharing, share button, share buttons, share links, social icons, social media, facebook, twitter, google plus, instagram
Requires at least: 4.4.2
Tested up to:      4.4.2
Stable tag:        trunk

Display contact information on your website beautifully with these simple widgets.

== Description ==

**Note: This plugin requires PHP 5.4 or higher to be activated.**

This plugin adds 2 new widgets to your WordPress site. One for displaying social media links and another one to display contact information (email, phone numbers, address). Both widgets are compatible with the customizer and will refresh when changes are made. 

**Languages Supported:**

 * English

**Improvement? Bugs?**

Please fill out an issue [here](https://github.com/jonathanbardo/WP-Contact-Widgets/issues). 

== Screenshots ==

1. Contact widget
2. Social widget


== Frequently Asked Questions ==

### How do I add additional fields to the contact widget?

Adding additional fields to the contact widget is as simple as adding a WordPress filter.

Here is an example:
<pre lang="php">
add_filter( 'wpcw_widget_contact_custom_fields', function( $fields, $instance ) {

  $fields['cellphone'] = [
    'order'       => 2,
    'label'       => __( 'Cellphone:', 'YOURTEXTDOMAIN' ),
    'type'        => 'text',
    'description' => __( 'A cellphone number that website vistors can call if they have questions.', 'YOURTEXTDOMAIN' ),
  ];

  return $fields;

}, 10, 2 );
</pre>

### How do I add additional fields to the social widget?

The social widget requires a different set of options but follows the same principle as above.

Here is an example:
<pre lang="php">
add_filter( 'wpcw_widget_social_custom_fields', function( $fields, $instance ) {

  $fields['scribd'] = [
    'icon'      => 'scribd', //See font-awesome icon slug
    'label'     => __( 'Scribd', 'YOURTEXTDOMAIN' ),
    'default'   => 'https://www.scribd.com/username',
    'select'    => 'username',
    'sanitizer' => 'esc_url_raw',
    'escaper'   => 'esc_url',
    'social'    => true,
    'target'    => '_blank',
  ];

  return $fields;

}, 10, 2 );
</pre>

== Changelog ==

= 1.0.1 - February 24, 2016 =
Added possibility to add custom fields to contact and social widget

= 1.0.0 - February 23, 2016 =
Initial release. Props [@jonathanbardo](https://github.com/jonathanbardo), [@fjarrett](https://github.com/fjarrett)
