# Apollo.js

Apollo.js is a simple read-through-cache REST api wrapper. Use it like this:

    var minutes = 1000 * 60; //a minute in milliseconds, for readable time measurements

    var myApi = new Apollo(
		"http://example.com/api"  //api base-url
		, 30 * minutes            //default cache valid duration
		, "first_api"             //name this cache (unique to avoid localStorage collisions)
	);

	myApi.get(
		'cache_key'
		, '/some/resource'
		, { requestParam: "value" }

		//cache is valid for...
		, 3 * minutes

		//force-refresh (ignore local cache)
		, false

		//success handler (jQuery AJAX success handler interface)
		, function(result){
			//result = false on error; your api/cache result on success
			console.log(result);
		}

		//fail handler (jQuery AJAX fail handler interface)
		, function (jqXHR, status, error){
			console.error(status, error);
		}

	);

Clear the cache thusly:

	myApi.nuke();

## Dependencies

Depends on jQuery for AJAX!

## Supports POST, PUT, and DELETE too

All REST verbs are supported as of version 0.3, but caching is only done for GET requests.

	myApi.post(
		'/nsa/track/everything'                 //path
		, { user: 42 }                          //data
		, function(data){                       //successCallback
			console.log(data);
		}
		, function(jqXHR, status, error){       //errorCallback
			console.error(status, error, jqXHR);
		}
	);

	myApi.put( path, data, successCallback, errorCallback );
	myApi.del( path, data, successCallback, errorCallback );

## RequireJS compatible

	require(['apollo'], function(apollo){

		var myApi = apollo.init('http://example.com/api', 5 * minutes);

	});

*\* Still expects jQuery in the global scope*

## Want some debug output in the console?

Pass `true` as an additional final argument to the constructor:

	var api = new Apollo('http://example.com/api', 30 * minutes, 'example', true);

## MIT LICENSED

>Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
>The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
