# Apollo.js

Apollo.js is a simple read-through-cache REST api wrapper. You use it like this:

    var minutes = 1000 * 60; //a minute in milliseconds, for readable time measurements

    var myApi = Apollo.init(
		"http://example.com/api",
		30 * minutes
	);

	myApi.get(
		'cache_key',
		'/some/resource',
		{requestParam: "value"},
		3 * minutes,
		function(result){
			//result = false on error; your api/cache result on success
			console.log(result);
		}
	);

You can clear the cache thusly:

	myApi.nukeCache();

## Dependencies

Depends on jQuery for AJAX!

## RequireJS compatible

	require(['apollo'], function(apollo){

		var myCache = apollo.init('http://example.com/api', 5 * minutes);

	});

## To-do:

* Implement DELETE and PUT methods so that you can have a consistent api interface even though you don't want caching with these methods. (POST already implemented.)
* Switch to separate success & error callbacks.

## MIT LICENSED

>Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
>The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

### What's with the name?!

I'm not _incredibly_ superstitious, but suffice it to say that I'm not ready to divulge this just yet. Maybe after a certain other project ships. ;)