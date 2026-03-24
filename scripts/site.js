/*
	Site scripts - vanilla JS replacements for MooTools Accordion + Slimbox Lightbox
*/

document.addEventListener('DOMContentLoaded', function() {
	Accordion.init();
	Lightbox.init();
});

/* Accordion - toggles comment lists under each todo item */
var Accordion = {
	init: function() {
		var toggles = document.querySelectorAll('.toggle');
		toggles.forEach(function(toggle) {
			var li = toggle.closest('li');
			if (!li) return;
			var commentList = li.querySelector('ol');
			if (!commentList) return;
			commentList.style.overflow = 'hidden';
			toggle.addEventListener('click', function() {
				if (commentList.style.display === 'none') {
					commentList.style.display = '';
				} else {
					commentList.style.display = 'none';
				}
			});
		});
	}
};

/* Lightbox - image gallery overlay, replaces Slimbox */
var Lightbox = {
	images: [],
	activeImage: -1,

	init: function() {
		this.buildDOM();
		this.anchors = document.querySelectorAll('a[rel^="lightbox"]');
		var self = this;
		this.anchors.forEach(function(el) {
			el.addEventListener('click', function(e) {
				e.preventDefault();
				self.click(el);
			});
		});
		document.addEventListener('keydown', function(e) {
			if (self.overlay.style.display === 'none') return;
			switch (e.keyCode) {
				case 27: case 88: case 67: self.close(); break;
				case 37: case 80: self.previous(); break;
				case 39: case 78: self.next(); break;
			}
		});
	},

	buildDOM: function() {
		this.overlay = document.createElement('div');
		this.overlay.id = 'lbOverlay';
		this.overlay.style.display = 'none';
		this.overlay.addEventListener('click', this.close.bind(this));
		document.body.appendChild(this.overlay);

		this.center = document.createElement('div');
		this.center.id = 'lbCenter';
		this.center.style.display = 'none';
		document.body.appendChild(this.center);

		this.image = document.createElement('div');
		this.image.id = 'lbImage';
		this.center.appendChild(this.image);

		this.prevLink = document.createElement('a');
		this.prevLink.id = 'lbPrevLink';
		this.prevLink.href = '#';
		this.prevLink.style.display = 'none';
		this.prevLink.addEventListener('click', function(e) { e.preventDefault(); this.previous(); }.bind(this));
		this.image.appendChild(this.prevLink);

		this.nextLink = document.createElement('a');
		this.nextLink.id = 'lbNextLink';
		this.nextLink.href = '#';
		this.nextLink.style.display = 'none';
		this.nextLink.addEventListener('click', function(e) { e.preventDefault(); this.next(); }.bind(this));
		this.image.appendChild(this.nextLink);

		this.bottomContainer = document.createElement('div');
		this.bottomContainer.id = 'lbBottomContainer';
		this.bottomContainer.style.display = 'none';
		document.body.appendChild(this.bottomContainer);

		this.bottom = document.createElement('div');
		this.bottom.id = 'lbBottom';
		this.bottomContainer.appendChild(this.bottom);

		var closeLink = document.createElement('a');
		closeLink.id = 'lbCloseLink';
		closeLink.href = '#';
		closeLink.addEventListener('click', function(e) { e.preventDefault(); this.close(); }.bind(this));
		this.bottom.appendChild(closeLink);

		this.caption = document.createElement('div');
		this.caption.id = 'lbCaption';
		this.bottom.appendChild(this.caption);

		this.number = document.createElement('div');
		this.number.id = 'lbNumber';
		this.bottom.appendChild(this.number);

		var clear = document.createElement('div');
		clear.style.clear = 'both';
		this.bottom.appendChild(clear);
	},

	click: function(link) {
		var rel = link.getAttribute('rel');
		var images = [];
		var imageNum = 0;
		this.anchors.forEach(function(el) {
			if (el.getAttribute('rel') === rel) {
				var href = el.href;
				var exists = false;
				for (var j = 0; j < images.length; j++) {
					if (images[j][0] === href) { exists = true; break; }
				}
				if (!exists) {
					if (href === link.href) imageNum = images.length;
					images.push([href, el.title || '']);
				}
			}
		});
		this.open(images, imageNum);
	},

	open: function(images, imageNum) {
		this.images = images;
		this.position();
		this.overlay.style.display = '';
		this.overlay.style.opacity = '0.8';
		var top = window.scrollY + (window.innerHeight / 15);
		this.center.style.top = top + 'px';
		this.center.style.display = '';
		this.center.style.width = '250px';
		this.center.style.height = '250px';
		this.center.style.marginLeft = '-125px';
		this.changeImage(imageNum);
	},

	position: function() {
		this.overlay.style.top = window.scrollY + 'px';
		this.overlay.style.height = window.innerHeight + 'px';
	},

	previous: function() {
		if (this.activeImage > 0) this.changeImage(this.activeImage - 1);
	},

	next: function() {
		if (this.activeImage < this.images.length - 1) this.changeImage(this.activeImage + 1);
	},

	changeImage: function(imageNum) {
		if (imageNum < 0 || imageNum >= this.images.length) return;
		this.activeImage = imageNum;
		this.prevLink.style.display = 'none';
		this.nextLink.style.display = 'none';
		this.bottomContainer.style.display = 'none';
		this.image.style.opacity = '0';
		this.center.className = 'lbLoading';

		var self = this;
		var preload = new Image();
		preload.onload = function() {
			self.center.className = '';
			self.image.style.backgroundImage = 'url(' + self.images[imageNum][0] + ')';
			self.image.style.width = preload.width + 'px';
			self.image.style.height = preload.height + 'px';
			self.prevLink.style.height = preload.height + 'px';
			self.nextLink.style.height = preload.height + 'px';
			self.bottom.style.width = preload.width + 'px';

			self.center.style.width = preload.width + 20 + 'px';
			self.center.style.height = preload.height + 20 + 'px';
			self.center.style.marginLeft = -(preload.width + 20) / 2 + 'px';

			self.caption.innerHTML = self.images[imageNum][1] || '';
			if (self.images.length > 1) {
				self.number.innerHTML = 'Image ' + (imageNum + 1) + ' of ' + self.images.length;
			} else {
				self.number.innerHTML = '';
			}

			self.image.style.opacity = '1';

			var top = window.scrollY + (window.innerHeight / 15);
			self.bottomContainer.style.top = (top + self.center.clientHeight) + 'px';
			self.bottomContainer.style.marginLeft = self.center.style.marginLeft;
			self.bottomContainer.style.display = '';

			if (imageNum > 0) self.prevLink.style.display = '';
			if (imageNum < self.images.length - 1) self.nextLink.style.display = '';
		};
		preload.src = this.images[imageNum][0];
	},

	close: function() {
		this.overlay.style.display = 'none';
		this.center.style.display = 'none';
		this.bottomContainer.style.display = 'none';
		this.activeImage = -1;
	}
};
