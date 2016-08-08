'use strict';
module.exports = (response, cookieArray) => {

	let cookies = response.headers['set-cookie'];
	let dict = {};

	for(let cookie of cookieArray)
		dict[cookie.split('=')[0]] = cookie.split('=')[1].replace('; ','');

	if(cookies && cookies.length)
		for(let cookie of cookies) {
			cookie = cookie.split(';')[0] + '; ';
			dict[cookie.split('=')[0]] = cookie.split('=')[1].replace('; ','');
		}

	while(cookieArray.shift());

	for(let cookie in dict)
		cookieArray.push(cookie+'='+dict[cookie]+'; ');

}
