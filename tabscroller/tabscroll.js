(function () {

    /**
    * The tabview module provides a widget for managing content bound to tabs.
    * @module tabview
    * @requires yahoo, dom, event, element
    *
    */
    var Y = YAHOO.util,
        Dom = Y.Dom,
        Event = Y.Event,
        document = window.document,
        buttonsHtml = "<ol class='yui-nav prev'><li><button class='prev'>&lt;</button></li></ol><ol class='yui-nav menu'><li><button class='menu'>&#x25BC;</button></li></ol><ol class='yui-nav next'><li><button class='prev'>&gt;</button></li></ol>",

    ScrollableTabView = function (el, attr) {
	debugger;
        ScrollableTabView.superclass.constructor.call(this, el, attr);
        this._scrollContainer = scrollContainer = document.createElement("div");
        scrollContainer.className = "scrollcontainer";
        this._tabHeadersContainer = tabHeadersContainer = document.createElement("div");
        tabHeadersContainer.className = "tabheaderscontainer";
        scrollContainer = this._contentParent.parentNode.insertBefore(scrollContainer, this._contentParent);
        scrollContainer.innerHTML = buttonsHtml;
        this._prevButton = scrollContainer.firstChild.getElementsByTagName("button")[0];
        this._nextButton = scrollContainer.lastChild.getElementsByTagName("button")[0];
        scrollContainer.appendChild(tabHeadersContainer);
        tabHeadersContainer.appendChild(this._tabParent);
        this._orientation = this.get("orientation");
        this._isHorizontal = (this._orientation == "top" || this._orientation == "bottom");
        this._left = 0;
        this._initEvents();
    };

    YAHOO.extend(ScrollableTabView, YAHOO.widget.TabView, {
        addTab: function (tab, index) {
            ScrollableTabView.superclass.addTab.call(this, tab, index);
            this._onTabAdd(index);
        },
        _initEvents: function () {
            Event.addListener(this._nextButton, 'mousedown', this._scrollNext, null, this);
            Event.addListener(this._prevButton, 'mousedown', this._scrollPrevious, null, this);

            Event.addListener(this._nextButton, 'mouseup', this._stopScroll, null, this);
            Event.addListener(this._prevButton, 'mouseup', this._stopScroll, null, this);
            this.on("activeTabChange", this._focusActiveTab);
            var that = this;
            Event.addListener(window, 'resize', function(){that._setLastOffset();this._resizeScrollContainer();}, null, this);
Event.addListener(this._tabHeadersContainer, 'scroll', this._onDOMScroll, null, this);

        },
        _onDOMScroll: function(evt) {
           var target = evt.target ? evt.target : evt.srcElement;
           var scrollLeft = target.scrollLeft;
           var scrollContainerWidth = this._tabHeadersContainer.offsetWidth;
           var maxScroll = (this._lastItemOffset - scrollContainerWidth);
           if (scrollLeft > maxScroll ) target.scrollLeft = maxScroll; 
           if (this._isHorizontal) {
                this._left = (scrollLeft);
            }
            this._showHideScrollers();
        },
        _focusActiveTab: function (evt) {
            var newEl = this._tabParent.childNodes[this.get("activeIndex")];
            this._scrollToElement(newEl);
        },
        _scrollPrevious: function () {
            this._scrollToPosition("prev");
        },
        _scrollNext: function () {
            this._scrollToPosition("next");
        },
        _onTabAdd: function (index) {
            var tabStripNodes = this._tabParent.childNodes;
            var newEl = index > tabStripNodes.length ? tabStripNodes[tabStripNodes.length - 1] : tabStripNodes[index];
            this._lastItemOffset = (this._tabParent.lastChild.offsetLeft + this._tabParent.lastChild.offsetWidth);
            this._setLastOffset();
            this._scrollToElement(newEl);
            this._showHideScrollers();
        },
        _setLastOffset: function () {
            var childEl = this._tabParent.lastChild;
            while (childEl) {
                if (childEl.style.display == "none") {
                    childEl = childEl.previousSibling;
                } else {
                    break;
                }
            }
            if (childEl) {
                this._lastItemOffset = (childEl.offsetLeft + childEl.offsetWidth) + 10;
            }
            
            this._showHideScrollers();
        },
        _scrollToPosition: function (direction) {
            var tabStrip = this._tabParent;
            if (this._isHorizontal) {
                if (direction == "next") {
                    //if ((this._lastItemOffset + this._left) <= this._tabContainerWidth) {
                    if ((this._tabContainerWidth + this._left) >= this._lastItemOffset) {                        
                        this._stopScroll();
                        this._reachedEnd = true;
                        this._showHideScrollers();
                        return;
                    }
                    this._reachedEnd = false;
                    this._left += 2;
                    //tabStrip.style.left = this._left + "px";
                    tabStrip.parentNode.scrollLeft = this._left;
                    var tabView = this;
                    this._runId = setTimeout(function () { tabView._scrollToPosition("next"); }, 10)
                } else {
                    if (this._left <= 0) {
                        this._stopScroll();
                        this._reachedStart = true;
                        this._showHideScrollers();
                        return;
                    }
                    this._reachedStart = false;
                    this._left -= 2;
                    //tabStrip.style.left = this._left + "px";
                    tabStrip.parentNode.scrollLeft = this._left;
                    var tabView = this;
                    this._runId = setTimeout(function () { tabView._scrollToPosition("prev"); }, 10)
                }
            }
            this._showHideScrollers();
        },
        _stopScroll: function () {
            if (this._runId) {
                clearTimeout(this._runId)
            }
            this._runId = null
        },
        _showHideScrollers: function () {
            this._tabContainerWidth = this._tabHeadersContainer.offsetWidth;
            this._reachedEnd = ((this._tabContainerWidth + this._left) >= this._lastItemOffset) ? true : false;
            this._reachedStart = (this._left <= 0) ? true : false;
            if (this._reachedStart) {
                this._prevButton.setAttribute("disabled", "true");
            } else {
                this._prevButton.removeAttribute("disabled");
            }
            if (this._reachedEnd) {
                this._nextButton.setAttribute("disabled", "true");
            } else {
                this._nextButton.removeAttribute("disabled");
            }
            if (this._reachedStart && this._reachedEnd) {
                this._prevButton.style.display = "none";
                this._nextButton.style.display = "none";
            } else {
                this._prevButton.style.display = "inline";
                this._nextButton.style.display = "inline";
            }
        },
        _scrollToElement: function (idOrEl) {
            var scrollEl;
            if (typeof (idOrEl) == "string") {
                scrollEl = document.getElementById(idOrEl);
            } else {
                scrollEl = idOrEl;
            }
            if (scrollEl && scrollEl.nodeType) {
                if (this._isHorizontal) {
                    var scrollContainerWidth = this._tabHeadersContainer.offsetWidth;
                    var itemLeft = scrollEl.offsetLeft, itemWidth = scrollEl.offsetWidth;
                    var scrollLeft = Math.abs(this._left);
                    var leftOffset = scrollLeft + scrollContainerWidth;
                    var itemOffset = itemLeft + itemWidth;
                    if (itemLeft > scrollLeft && itemOffset < leftOffset) {
                        this._showHideScrollers();
                        return; // Already in visible area.
                    }
                    if (itemOffset >= leftOffset) {
                        itemLeft = scrollLeft + (itemOffset - leftOffset);
                    }
                    if (itemLeft < 0) {
                        itemLeft = 0;
                    }
                    this._left = itemLeft;
                    this._tabParent.parentNode.scrollLeft = this._left;
                }
            }
            this._showHideScrollers();
        },
        _resizeScrollContainer: function() {
                if (this._isHorizontal) {
                    var scrollContainerWidth = this._tabHeadersContainer.offsetWidth;
                    var scrollLeft = Math.abs(this._left);
                    var itemLeft = 0;
                    var lastItemOffset = this._lastItemOffset;
                    var leftOffset = lastItemOffset - scrollLeft;
                    if (scrollLeft > 0 && leftOffset <= scrollContainerWidth ) {
                        itemLeft = scrollContainerWidth - leftOffset;
                    }
                    itemLeft =  this._left + itemLeft;
                    if (itemLeft >= 0) {
                        itemLeft = 0;
                    }
                    this._left = itemLeft;
                    //this._tabParent.style.left = this._left + "px";
                    this._tabParent.parentNode.scrollLeft = this._left;
                    this._focusActiveTab();
                }  
        }
    });

    YAHOO.widget.ScrollableTabView = ScrollableTabView;
})();

YAHOO.register("scrollabletabview", YAHOO.widget.ScrollableTabView, { version: "2.9.0", build: "2800" });
    
    
(function () {
    var tabView = new YAHOO.widget.ScrollableTabView();
    tabView.appendTo('container');
    var i;
    for (i = 0; i < 15; i++) {
        tabView.addTab(new YAHOO.widget.Tab({
            label: 'Tab '+i,
            content: '<form action="#"><fieldset><legend>Lorem Ipsum</legend><label for="foo"> <input id="foo" name="foo"></label><input type="submit" value="submit"></fieldset></form>'

        }));
    }
    YAHOO.log("The example has finished loading; as you interact with it, you'll see log messages appearing here.", "info", "example");
    YAHOO.util.Event.addListener("addButton", "click", addNewTab);
    function addNewTab() {
        tabView.addTab(new YAHOO.widget.Tab({
            label: 'Tab '+(i++),
            content: '<p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat.</p>',
            active: true
        }), document.getElementById("indexInput").value);
    }

})();