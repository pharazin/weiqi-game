//g is something like Object.Clone(obj)
var g = function(j){var k = {}; for (var l in j) k[l] = j[l]; return k;};
Rx.Observable.FromJQueryDelegate = 
    function(jQueryObject, selector, eventType){
        return Rx.Observable.Create(
                    function(observer){
                        var handler = function(eventObject){
                                        observer.OnNext(g(eventObject));
                                      };
                        jQueryObject.delegate(selector, eventType, handler);
                        return  function(){
                                    jQueryObject.undelegate(selector,
                                                            eventType,
                                                            handler);
                                }
                    }
                );
    };
jQuery.fn.ToDelegateObservable =
    function(selector, eventType){
        return Rx.Observable.FromJQueryDelegate(this,
                                                selector,
                                                eventType);
    };
