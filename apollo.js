// Copyright 2012 Adam Tuttle, CounterMarch Systems
// MIT License
// Apollo is a simple, dynamic, Read-through-cache; depends on jQuery for AJAX.

var Apollo = {};

Apollo.version = "0.1";
Apollo.props = {};
Apollo.cache = {};

Apollo.init = function(api_base_url, default_duration){
	this.props.api_base_url = api_base_url;
	this.props.default_duration = default_duration;
	return this;
};

Apollo.nukeCache = function(){
	this.cache = {};
}

Apollo.post = function(uri, opts, success, err){
	if (typeof(err) === 'undefined'){
		err = function(){
			console.log('shitshitshit');
		};
	}
	if (typeof(success) === 'undefined' || success === null){
		success = function(){};
	}
	jQuery.ajax({
		type: "POST",
		url: this.props.api_base_url + uri,
		data: opts,
		dataType: "json",
		error: err,
		success: success
	});
};

Apollo.get = function(key, uri, opts, duration, callback){
	//defaults
	if (typeof(duration) === "undefined"){
		duration = this.props.default_duration;
	}
	if (typeof(opts) === "undefined"){
		opts = {};
	}

	if (!this.cache.hasOwnProperty(key)){
		//cache doesn't exist, make request
		var _cache = this.cache;
		this.makeRequest(uri, opts, function(data, textStatus, jqXHR){
			//success: save data to cache then call callback
			_cache[key] = { timestamp: new Date().getTime(), data: data };
			callback(data);
		}, function(jqXHR, textStatus, errorThrown){
			//fail: return error
			callback(false);
		});
		//stop the function here
		return;
	}

	var now = new Date().getTime();
	var lastUpdated = this.cache[key].timestamp;
	if (now - lastUpdated <= duration){
		//cache !expired
		callback(this.cache[key].data);
	}else{
		//cache expired
		var _cache = this.cache;
		this.makeRequest(uri, opts, function(data, textStatus, jqXHR){
			//success: save data to cache then call callback
			_cache[key].timestamp = new Date().getTime();
			_cache[key].data = data;
			callback(data);
		}, function(jqXHR, textStatus, errorThrown){
			//fail: return error
			callback(false);
		});
	}
};

Apollo.makeRequest = function(uri, opts, success, failure){
	jQuery.ajax({
		url: this.props.api_base_url + uri,
		cache: false,
		data: opts,
		dataType: "json",
		error: failure,
		success: success
	});
};
