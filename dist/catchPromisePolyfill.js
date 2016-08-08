(function(){
   var _p = Promise;
   Promise = function(p){
     return new _p(p).catch(console.log.bind(console));
   };
   for(let method of [
     'all',
     'race',
     'resolve'
   ])
    Promise[method] = _p[method];
})();
