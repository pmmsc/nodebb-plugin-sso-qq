<h1>QQ Social Authentication</h1>
<hr />

<form>
	<div class="alert alert-warning">
		<p>
			Register a new <strong>qq Application</strong> via
			<a href="http://www.qq.com/">qq.com</a> and then paste
			your application details here. Your callback URL is yourdomain.com/auth/qq/callback
		</p>
		<br />
		<input type="text" data-field="social:qq:id" title="App ID" class="form-control input-lg" placeholder="App ID"><br />
		<input type="text" data-field="social:qq:secret" title="App Key" class="form-control" placeholder="App Secret"><br />
	</div>
</form>

<button class="btn btn-lg btn-primary" id="save">Save</button>

<script>
	require(['forum/admin/settings'], function(Settings) {
		Settings.prepare();
	});
</script>