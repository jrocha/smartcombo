/*globals YUI*/
YUI().use('widget', 'node', 'event-key', 'anim', function(Y) {
	var Lang = Y.Lang,
		Widget = Y.Widget,
		Node = Y.Node;

	function SmartCombo(config) {
		SmartCombo.superclass.constructor.apply(this, arguments);

		this.currentFilter = '';
		this.data = config.data;
	
		this.searchBox = config.value.preInput;
		this.resultBox =  config.value.preResult;

		this.resultBoxVisible = true;
	}

	SmartCombo.NAME = "smartcombo";
	SmartCombo.INPUT_CLASS = Y.ClassNameManager.getClassName(SmartCombo.NAME, "searchBox");
	SmartCombo.RESULT_CONTAINER_CLASS = Y.ClassNameManager.getClassName(SmartCombo.NAME, "resultBox");
	SmartCombo.INPUT_TEMPLATE = '<input type="text" class="' + SmartCombo.INPUT_CLASS + '">';
	SmartCombo.RESULT_CONTAINER_TEMPLATE = '<div class="' + SmartCombo.RESULT_CONTAINER_CLASS + '"><ol><li>default</li></ol></div>';


    /* 
     * The HTML_PARSER static constant is used by the Widget base class to populate 
     * the configuration for the spinner instance from markup already on the page.
     *
     * The Spinner class attempts to set the value of the spinner widget if it
     * finds the appropriate input element on the page.
     */
    SmartCombo.HTML_PARSER = {
        value: function (contentBox) {
            var nodeInput = contentBox.one("." + SmartCombo.INPUT_CLASS);
            var nodeResult = contentBox.one("." + SmartCombo.RESULT_CONTAINER_CLASS);
	    
	    var preExisting = {
		   preInput: nodeInput,
	           preResultBox: nodeResult

	    };

	    return preExisting;
        }
    };

	Y.extend(SmartCombo, Widget, {
		/*
         * initializer is part of the lifecycle introduced by 
         * the Widget class. It is invoked during construction,
         * and can be used to setup instance specific state.
         * 
         */
		initializer: function() {},
		/*
         * destructor is part of the lifecycle introduced by
         * the Widget class. It is invoked during destruction,
         * and can be used to cleanup instance specific state.
         * 
         */
		destructor: function() {},
		/*
         * renderUI is part of the lifecycle introduced by the
         * Widget class. Widget's renderer method invokes:
         *
         *     renderUI()
         *     bindUI()
         *     syncUI()
         *
         * renderUI is intended to be used by the Widget subclass
         * to create or insert new elements into the DOM. 
         *
         */
		renderUI: function() {
			var contentBox = this.get('contentBox');

			if (!this.searchBox) {
				this.searchBox = Node.create(SmartCombo.INPUT_TEMPLATE);
				contentBox.appendChild(this.searchBox);
			}

			if (!this.resultBox) {
				this.resultBox = Node.create(SmartCombo.RESULT_CONTAINER_TEMPLATE);
				contentBox.appendChild(this.resultBox);
			}


			this._animHide = new Y.Anim({
				node: this.resultBox,
				to: { height: 0 },
				easing: Y.Easing.backIn
			});
		},
		bindUI: function() {
			Y.on('click', this._handleClick, this.resultBox, this);
			Y.on('keyup', this._handleTyping, this.searchBox, '', this);
		},
		syncUI: function() {
			this._renderItens();
		},
		_getHtml: function() {
			var buffer = [];
			buffer[buffer.length] = '<ol>';
			for (var i = 0, k = this.data.length; i < k; i += 1) { //TODO: if should be before the iteration for performance  
				if (this.data[i].label.indexOf(this.currentFilter) > -1 || '' == this.currentFilter) {
					buffer[buffer.length] = '<li id="i' + i + '">';
					if (this.data[i].checked) {
						buffer[buffer.length] = '> ';
					} else {
						buffer[buffer.length] = '_ ';
					}
					buffer[buffer.length] = this.data[i].label;
					buffer[buffer.length] = '</li>';
				}
			}
			buffer[buffer.length] = '</ol>';
			return buffer.join('');
		},
		_handleClick: function(o) {
			var item = this._findItem(o);
			item.checked = !item.checked;
			this._renderItens();
		},
		_renderItens: function() {
			Y.one(this.resultBox).set('innerHTML', this._getHtml());
		},
		_findItem: function(o) {
			var i; //TODO: plese check this. I think there is a better way to bind JSON and DOM
			i = o.target.get('id');
			return this.data[i.slice(1)]; // remove the 'i' from the id
		},
		_handleTyping: function(o) { //TODO: WTF 'this' is comming wrong????
			arguments[1].currentFilter = o.target.get('value');

			arguments[1]._renderItens();

			if (arguments[1].currentFilter.length > 0 && !arguments[1].resultBoxVisible) { 
				this.resultBoxVisible = true;
			}

			if (0 == arguments[1].currentFilter.length && arguments[1].resultBoxVisible) {
				arguments[1].resultBoxVisible = false;
				console.log('hiding');
				arguments[1]._animHide.run();
			}

		}
			       
	});
	var myData = [{
		label: 'item 1',
		checked: 1,
		value: 1
	},
	{
		label: 'xxx 1',
		checked: 1,
		value: 2
	}];
	// we should use a config obj only for extra settings
	// the HTML el in which the combo will be deplyed is
	// mandatory therefore it shouldn't be inside the obj
	var mySmartCombo = new SmartCombo({
		contentBox: '#core-control',
		data: myData
	});
	mySmartCombo.render();
});
