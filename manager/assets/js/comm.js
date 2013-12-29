window.Comm = function( onStatus ) {
	var _this = this;

	this.onStatus = onStatus;
	this.socket = io.connect('http://mvegeto-pc:4444/');

  	this.socket.on('status', function (data) {
		console.log(data);
  	});
}

window.Comm.prototype.requestStatus = function( machineName ) {
	console.log( "requesting status" );

	//_this.socket.emit('my other event', { my: 'data' });
}