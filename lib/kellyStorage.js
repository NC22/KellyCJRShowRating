// part of kellyShowRate extension, see kellyShowRate.js for copyrights and description

var KellyStorage = {    
        fields : {                    
            hidePostByRating : {type : 'float', default : -2.5, optional : true, defaultOptional : false},
            hideCommentByRating : {type : 'float', default : -2.5, optional : true, defaultOptional : false},
            delay : {type : 'float', default : 0.8},
            postLinkR1 : {type : 'string', default : 'http://joy.reactor.cc/post/__POST_ID__'}, // query url for get unauth data for post (query currently hardcoded - method GET | API fetch)
            timeout : {type : 'float', default : 4},
            scrollOffset : {type : 'int', default : 400},
            scrollDelay : {type : 'float', default : 0.5},
            offIfUnauth : {optional : true, defaultOptional : true},
            debug : {optional : true, defaultOptional : false},
        },        
        
        fieldsOrder : ['hidePostByRating', 'hideCommentByRating', 'offIfUnauth', '__additions__', 
                                'debug', 'delay', 'postLinkR1', 'timeout', 'scrollOffset', 'scrollDelay', '_/additions/_'],   
                                
        cfg : false, lastValidateError : false,
    };
    
    KellyStorage.validateCfgVal = function(key, val) {
        
         if (typeof this.fields[key] == 'undefined') return '';
         if (typeof val == 'undefined') val = this.fields[key].default;
         
         return this.fields[key].val ? this.fields[key].val(val) : KellyTools.val(val, this.fields[key].type);
    }
    
    KellyStorage.validateCfg = function(cfg) {

        if (!cfg) cfg = {};
        
        // validate loaded array
        
        for (var key in this.fields) {
            
            if (typeof cfg[key] == 'undefined') {
                cfg[key] = this.fields[key].default;
            } 
            
            if (this.fields[key].optional && typeof cfg[key + 'Enabled'] == 'undefined') {
                 cfg[key + 'Enabled'] = this.fields[key].defaultOptional;
            }
        }
        
        return cfg;
    }
    
    KellyStorage.addField = function(before, key, data) {            
        if (data) this.fields[key] = data;
        before ? this.fieldsOrder.splice(this.fieldsOrder.indexOf(before), 0, key) : this.fieldsOrder.push(key);
    }
    
    KellyStorage.load = function(callback) {
        
      var handler = this;
      
      KellyTools.getBrowser().runtime.sendMessage({
            method: "getLocalStorageItem", 
            dbName : 'kelly-show-rating-cfg',
        }, function(response) {
            
            handler.cfg = false;                
            if (response.item) {
                handler.cfg = response.item;
                                    
                if (!handler.cfg) {
                    handler.log('db exist but structured data parsing fail ' + name);
                    handler.cfg = false;
                }
                
            } else handler.log('config not changed ' + name + ', use defaults', true);
            
            handler.cfg = handler.validateCfg(handler.cfg);
            
            if (callback) callback(handler.cfg);
        });
            
    }
    
    KellyStorage.save = function(data, callback) {
                 
        KellyTools.getBrowser().runtime.sendMessage({
            method: "setLocalStorageItem", 
            dbName : 'kelly-show-rating-cfg',
            data : data,
        }, function(response) {
        
            if (response.error) {
                handler.log(response.error);
            }
            
            if (callback) callback(response.error ? true : false);
        });
    }
    
    KellyStorage.log = function(err, notice) {        
        KellyTools.log(err, 'KellyStorage', notice ? KellyTools.E_NOTICE : KellyTools.E_ERROR);
    }