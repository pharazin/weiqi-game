var Resource = function(resource){
    var oRes = {}; 
    for(var prop in resource){
        if(resource.hasOwnProperty(prop)){
            var oProp = new Rx.ReplaySubject(1);
            var oValue = resource[prop];
            oProp.OnNext(oValue);
            oRes[prop] = oProp;
            this.assign(oRes, prop, oProp);
        }
    }
    return oRes;
};

Resource.prototype = {
    assign: function(obj, propName, prop){
                obj.__defineSetter__(propName, 
                                     function(v){prop.OnNext(v);});
                obj.__defineGetter__(propName, 
                                     function(){
                                        
                                        return prop;
                                     });
            }
};

var Binder = function(subscriber){
    this.subscriber = subscriber;
};

Binder.prototype = {
    bind:   function(bindee){
                this.subscriber(function(value){
                                    bindee = value;
                                });
            }
};
