// Copyright 2012 Adam Tuttle, CounterMarch Systems
// MIT License
// Apollo is a simple, dynamic, Read-through-cache with localStorage for persistance; depends on jQuery (global scope for now) for AJAX.
;(function(_apollo){
	if (typeof define === 'function' && define.amd){
		//requirejs, define as a module
		define(_apollo);
	}else{
		window.Apollo = _apollo();
	}
//above this line: define as RequireJS module if RequireJS found; otherwise set into window
//below this line: actual Apollo code.
}(function(){

	//constructor
	var Apollo = function(api_base_url, default_duration, cache_name, debug){
		this.version = '0.3.1';
		this.api_base_url = api_base_url;
		this.default_duration = default_duration;
		this.cache = {};
		this.keys = [];
		this.cache_name = cache_name;
		this.indexName = 'APOLLO~INDEX:' + cache_name;
		this.cacheElementPrefix = 'APOLLO:' + cache_name + ':';
		this.debug = debug || false;


		var that = this;
		var tmp = localStorage.getItem( this.indexName );
		if (tmp !== null){
			this.keys = JSON.parse(tmp);
			this.keys.map(function(el, ix, arr){
				if (that.debug) console.log('Apollo[%s] cache prime: %s', that.cache_name, el);
				that.cache[el] = JSON.parse(localStorage.getItem(that.cacheElementPrefix + el));
			});
		}
	};

	Apollo.prototype.makeRequest = function(method, uri, reqData, success, failure){
		jQuery.ajax({
			type: method
			,url: this.api_base_url + uri
			,data: reqData
		}).done(success).fail(failure);
	};

	Apollo.prototype.nukeCache = function(){
		var that = this;
		//delete each on-disk item
		this.keys.map(function(el, ix, arr){
			if (that.debug) console.log('Apollo[%s] nuke: %s', that.cache_name, el);
			localStorage.removeItem( that.cacheElementPrefix + el );
		});
		//clear the in-mem item cache
		this.cache = {};
		if (this.debug) console.log('Apollo[%s] nuke: memory-cache cleared', this.cache_name);
		//remove in-mem and on-disk index
		this.keys = [];
		localStorage.removeItem( this.indexName );
		if (this.debug) console.log('Apollo[%s] nuke: index cleared', this.cache_name);
	}
	//alias nukeCache as nuke
	Apollo.prototype.nuke = function(){
		this.nukeCache();
	}

	Apollo.prototype.set = function(key, value){
		if (!this.cache.hasOwnProperty(key)){
			this.keys.push(key);
			localStorage.setItem(this.indexName, JSON.stringify(this.keys));
		}
		this.cache[key] = value;
		localStorage.setItem(this.cacheElementPrefix + key, JSON.stringify(value));
		if (this.debug) console.log('Apollo[%s] SET: value updated for %s', this.cache_name, key);
	}

	Apollo.prototype.get = function(key, uri, reqData, duration, forceGet, successCB, errorCB){
		var that = this;

		//defaults
		duration = (duration === null || duration === undefined) ? this.default_duration : duration;
		reqData = (!reqData) ? {} : reqData;
		forceGet = forceGet || false;

		if (forceGet || !this.cache.hasOwnProperty(key)){
			//cache doesn't exist, make request
			if (this.debug) console.log('Apollo[%s] cache miss (or forced): %s', this.cache_name, key);
			this.makeRequest('GET', uri, reqData, function(data, textStatus, jqXHR){
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
		var lastUpdated = this.cache[key].timestamp;
		if (now - lastUpdated <= duration){
			//cache !expired
			if (this.debug) console.log('Apollo[%s] cache hit: %s', this.cache_name, key);
			successCB(this.cache[key].data);
		}else{
			//cache expired
			if (this.debug) console.log('Apollo[%s] cache expired: %s', this.cache_name, key);
			this.makeRequest('GET', uri, reqData, function(data, textStatus, jqXHR){
				//success: save data to cache then call successCB
				that.set(key, { timestamp: new Date().getTime(), data: data });
				successCB(data);
			}, function(jqXHR, textStatus, errorThrown){
				//fail: return error
				if (errorCB) errorCB(jqXHR, textStatus, errorThrown);
			});
		}
	}

	Apollo.prototype.post = function(uri, reqData, successCB, errorCB){
		this.makeRequest('POST', uri, reqData, successCB, errorCB);
	}

	Apollo.prototype.put = function(uri, reqData, successCB, errorCB){
		this.makeRequest('PUT', uri, reqData, successCB, errorCB);
	}

	Apollo.prototype.del = function(uri, reqData, successCB, errorCB){
		this.makeRequest('DELETE', uri, reqData, successCB, errorCB);
	}

	return Apollo;

}));
