<div class="row">
    <div class="col-lg-9">
        <div class="panel panel-default">
            <div class="panel-heading"><i class="fa fa-qq"></i>QQ Social Authentication</div>
            <div class="panel-body">
                <p>
                       Register a new <strong>QQ Application</strong> via <a href="http://www.qq.com/">qq.com</a> and then paste
                       your application details here. Your callback URL is yourdomain.com/auth/qq/callback
                </p>
                <br />
                <form class="sso-qq">
                    <div class="form-group">
                        <label for="id">Client ID</label>
                        <input type="text" name="id" title="Client ID" class="form-control" placeholder="Client ID"><br />
                    </div>
                    <div class="form-group">
                        <label for="secret">Client Secret</label>
                        <input type="text" name="secret" title="Client Secret" class="form-control" placeholder="Client Secret">
                    </div>
                </form>
            </div>
        </div>
    </div>
    <div class="col-lg-3">
        <div class="panel panel-default">
            <div class="panel-heading">QQ Control Panel</div>
            <div class="panel-body">
                <button class="btn btn-primary" id="save">Save Settings</button>
            </div>
        </div>
    </div>
</div>

<script>
require(['settings'], function(Settings) {
    Settings.load('sso-qq', $('.sso-qq'));

    $('#save').on('click', function() {
        Settings.save('sso-qq', $('.sso-qq'), function() {
            app.alert({
                type: 'success',
                alert_id: 'qq-saved',
                title: 'Settings Saved',
                message: 'Please reload your NodeBB to apply these settings',
                clickfn: function() {
                    socket.emit('admin.reload');
                }
            });
        });
    });
});
</script>
