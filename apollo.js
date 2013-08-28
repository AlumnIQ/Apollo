// Copyright 2012 Adam Tuttle, CounterMarch Systems
// MIT License
// Apollo is a simple, dynamic, Read-through-cache with localStorage for persistance; depends on jQuery for AJAX.

var Apollo = {};

Apollo.version = "0.2";
Apollo.props = {};
Apollo.cache = {};
Apollo.keys = [];

Apollo.init = function(api_base_url, default_duration){
	var that = this;
	this.props.api_base_url = api_base_url;
	this.props.default_duration = default_duration;

	console.log('[apollo] loading cache index from disk...');
	var tmp = localStorage.getItem('__APOLLO__INDEX__');
	if (tmp !== null){
		this.keys = JSON.parse(tmp);
		this.keys.map(function(el, ix, arr){
			console.log('[apollo] loading cached item: ' + el);
			that.cache[el] = JSON.parse(localStorage.getItem('__APOLLO_' + el));
		});
		console.log('[apollo] memory prime complete');
	}

	return this;
};

Apollo.nukeCache = function(){
	//clear the in-mem item cache
	this.cache = {};
	//delete each on-disk item
	this.keys.map(function(el, ix, arr){
		localStorage.removeItem('__APOLLO_' + el);
	});
	//remove in-mem and on-disk index
	this.keys = [];
	localStorage.removeItem('__APOLLO__INDEX__');
};

Apollo.get = function(key, uri, opts, duration, forceGet, successCB, errorCB){
	var that = this;

	//defaults
	duration = (duration === null || duration === undefined) ? this.props.default_duration : duration;
	opts = (!opts) ? {} : opts;
	forceGet = forceGet || false;

	if (forceGet || !this.cache.hasOwnProperty(key)){
		//cache doesn't exist, make request
		this.makeRequest(uri, opts, function(data, textStatus, jqXHR){
			//success: save data to cache then call successCB
			that.set(key, { timestamp: new Date().getTime(), data: data });
			successCB(data);
		}, function(jqXHR, textStatus, errorThrown){
			//fail: return error
			if (errorCB) errorCB(jqXHR, textStatus, errorThrown);
		});
		//stop the function here
		return;
	}

	var now = new Date().getTime();
	var lastUpdated = that.cache[key].timestamp;
	if (now - lastUpdated <= duration){
		//cache !expired
		successCB(that.cache[key].data);
	}else{
		//cache expired
		that.makeRequest(uri, opts, function(data, textStatus, jqXHR){
			//success: save data to cache then call successCB
			that.set(key, { timestamp: new Date().getTime(), data: data });
			successCB(data);
		}, function(jqXHR, textStatus, errorThrown){
			//fail: return error
			if (errorCB) errorCB(jqXHR, textStatus, errorThrown);
		});
	}
};

Apollo.set = function(key, value){
	if (!this.cache.hasOwnProperty(key)){
		this.keys.push(key);
		localStorage.setItem('__APOLLO__INDEX__', JSON.stringify(this.keys));
	}
	this.cache[key] = value;
	localStorage.setItem('__APOLLO_' + key, JSON.stringify(value));
};

Apollo.makeRequest = function(uri, opts, success, failure){
	jQuery.ajax({
		url: this.props.api_base_url + uri
		,data: opts
		,dataType: "json"
	}).done(success).fail(failure);
};
