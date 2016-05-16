import PouchDB from 'pouchdb'


class Main {

	_db = null;


	constructor() {
		this._db = new PouchDB('image_storage');
		var remoteCouch = false;

		this.checkForImage('/img/me.jpg');
	}


	checkForImage(filepath) {
		const self = this;
		// check for image
		this._db.getAttachment(filepath, 'image').then(function(blob) {
			self.handleImage(blob);
		}).then(function(response) {
			// handle response
		}).catch(function (err) {
			//console.log(err);
			self.saveImage(filepath, function(error, result) {
				if (error == undefined) {
					self.checkForImage(filepath);
				}
			});
		});
	}


	handleImage(blob) {
		var urlCreator = window.URL || window.webkitURL;
		var imageUrl = urlCreator.createObjectURL( blob );

		var img = document.createElement('IMG');
		img.src = imageUrl;
		document.body.appendChild(img);
	}


	saveImage(filepath, cb) {
		const img = new Image();
		img.src = filepath;
		const self = this;

		img.addEventListener('load', function() {
			const canvas = document.createElement("canvas");
    		canvas.width = this.width;
    		canvas.height = this.height;

    		const ctx = canvas.getContext("2d");
    		ctx.drawImage(this, 0, 0);

    		var dataURL = canvas.toDataURL("image/png");
    		dataURL = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");

    		var doc = {
				"_id": filepath,
				"title": filepath,
				"_attachments": {
					"image": {
					"content_type": "text/plain",
					"data": dataURL
					}
				}
			};

    		self._db.put(doc).then(function (result) {
			   // handle result
			   console.log("attachment saved");
			   console.dir(result);
			   cb(undefined, result);
			}).catch(function (err) {
			  // console.log(err);
			  // console.log("attachment error");
			  cb(err);
			});
		});
	}
}



new Main();
