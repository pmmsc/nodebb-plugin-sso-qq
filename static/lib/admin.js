define('admin/plugins/sso-qq', ['settings'], function(Settings) {
	'use strict';
	/* globals $, app, socket, require */

	var ACP = {};

	ACP.init = function() {
		Settings.load('sso-qq', $('.sso-qq-settings'));

		$('#save').on('click', function() {
			Settings.save('sso-qq', $('.sso-qq-settings'), function() {
				app.alert({
					type: 'success',
					alert_id: 'sso-qq-saved',
					title: '配置已保存',
					message: '请重载NodeBB以便使插件生效。',
					clickfn: function() {
						socket.emit('admin.reload');
					}
				});
			});
		});
	};

	return ACP;
});