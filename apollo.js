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

	var props = {}
		,cache = {}
		,keys  = [];

	var makeRequest = function(method, uri, reqData, success, failure){
		jQuery.ajax({
			type: method
			,url: props.api_base_url + uri
			,data: reqData
		}).done(success).fail(failure);
	}

	return {

		version: '0.3.0'

		,init: function(api_base_url, default_duration){
			var that = this;
			props.api_base_url = api_base_url;
			props.default_duration = default_duration;
			var tmp = localStorage.getItem('__APOLLO__INDEX__');
			if (tmp !== null){
				keys = JSON.parse(tmp);
				keys.map(function(el, ix, arr){
					cache[el] = JSON.parse(localStorage.getItem('__APOLLO_' + el));
				});
			}
			return this;
		}

		,nukeCache: function(){
			//clear the in-mem item cache
			cache = {};
			//delete each on-disk item
			keys.map(function(el, ix, arr){
				localStorage.removeItem('__APOLLO_' + el);
			});
			//remove in-mem and on-disk index
			keys = [];
			localStorage.removeItem('__APOLLO__INDEX__');
		}
		//alias nukeCache as nuke
		,nuke: function(){
			this.nukeCache();
		}

		,set: function(key, value){
			if (!cache.hasOwnProperty(key)){
				keys.push(key);
				localStorage.setItem('__APOLLO__INDEX__', JSON.stringify(keys));
			}
			cache[key] = value;
			localStorage.setItem('__APOLLO_' + key, JSON.stringify(value));
		}

		,get: function(key, uri, reqData, duration, forceGet, successCB, errorCB){
			var that = this;

			//defaults
			duration = (duration === null || duration === undefined) ? props.default_duration : duration;
			reqData = (!reqData) ? {} : reqData;
			forceGet = forceGet || false;

			if (forceGet || !cache.hasOwnProperty(key)){
				//cache doesn't exist, make request
				makeRequest('GET', uri, reqData, function(data, textStatus, jqXHR){
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
			var lastUpdated = cache[key].timestamp;
			if (now - lastUpdated <= duration){
				//cache !expired
				successCB(cache[key].data);
			}else{
				//cache expired
				makeRequest('GET', uri, reqData, function(data, textStatus, jqXHR){
					//success: save data to cache then call successCB
					that.set(key, { timestamp: new Date().getTime(), data: data });
					successCB(data);
				}, function(jqXHR, textStatus, errorThrown){
					//fail: return error
					if (errorCB) errorCB(jqXHR, textStatus, errorThrown);
				});
			}
		}

		,post: function(uri, reqData, successCB, errorCB){
			makeRequest('POST', uri, reqData, successCB, errorCB);
		}

		,put: function(uri, reqData, successCB, errorCB){
			makeRequest('PUT', uri, reqData, successCB, errorCB);
		}

		,del: function(uri, reqData, successCB, errorCB){
			makeRequest('DELETE', uri, reqData, successCB, errorCB);
		}

	};

}));
