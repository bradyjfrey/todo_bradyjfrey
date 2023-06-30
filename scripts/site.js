var Site = {
	start: function() {
		Site.demo();

	},

	demo: function() {
		//demo Accordion
		var demoBox = $$('.toggle');
		var demoBoxOpen = $$('.toggler');
		var demoAccordion = new Accordion(
				demoBox, demoBoxOpen, {
					start: 'all-close',
					duration: 500,
					opacity: false,
					alwaysHide: true
			}
		);

	}
}

window.addEvent('domready', Site.start);