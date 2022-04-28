// part of kellyShowRate extension, see kellyShowRate.js for copyrights and description

var KellyEDispetcher = new Object();
    KellyEDispetcher.init = function() {

        KellyTools.getBrowser().runtime.onMessage.addListener(this.onMessage);
        return true;
    }
        
    KellyEDispetcher.validateResponse = function(response) {

        if (response.indexOf('<body>') != -1) {
            
            response = response.replace(/(\r\n\t|\n|\r\t)/gm,"");        
            response = response.match(/<body>([\s\S]*?)<\/body>/g); // (.*?)
            
            if (response && response.length >= 1) {
                
                response = response[0].replace(/<\/?body>/g,'');
                
            } else return 0;
            
        } else return 0;
        
        return response;
    }   
        
    KellyEDispetcher.onMessage = function(request, sender, callback) {

            var response = {
                
                senderId : 'dispetcher',
                error : '',
                method : request.method,
                
            }
                   
            if (request.method == "getLocalStorageItem") {
                
                if (request.dbName) {
                    
                    KellyTools.getBrowser().storage.local.get(request.dbName, function(item) {
         
                        response.item = item[request.dbName];
                        
                        if (callback) callback(response);
                    });	
                    
                    return true; // async mode
                    
                } else response.item = false;
                
            
            } else if (request.method == "setLocalStorageItem") {
                                
                if (request.dbName && typeof request.data != 'undefined') {
                    
                    var save = {};
                        save[request.dbName] = request.data;
                        
                    KellyTools.getBrowser().storage.local.set(save, function() {
                    
                        if (KellyTools.getBrowser().runtime.lastError) {                            
                            response.error = KellyTools.getBrowser().runtime.lastError.message;                            
                        } else {                            
                            response.error = false;                            
                        }
                        
                        if (callback) callback(response);
                    });
                    
                    return true; // async mode
                }
                
            } else if (request.method == 'getPostPage') {
                
                var cancelTimer = false;
                var frequest = new AbortController();
                var onRequestEnd = function() {
                    
                    if (frequest) {
                        frequest.abort();
                        frequest = false;
                    }
                       
                    if (cancelTimer) {                    
                        clearTimeout(cancelTimer);
                        cancelTimer = false;
                    }
                    
                }
                
                fetch(request.src, {
                    signal: frequest.signal, 
                    method: 'GET',
                    cache: 'no-cache',
                    credentials : 'omit',
                    mode: 'cors',
                    referrer: '',
                    redirect: 'follow',
                    referrerPolicy : 'no-referrer',
                    
                }).then(function(r) {
                    
                    return r.text().then(function(text) {
                                            
                        response.html = KellyEDispetcher.validateResponse(text);
                        
                        onRequestEnd();
                        
                        if (callback) callback(response); 
                    });

                }).then(function(text) {
                    
                })
                .catch(function(error) { 
                
                    response.html = false;
                    response.error = error.message;
                    
                    onRequestEnd();
                    
                    if (callback) callback(response); 
                });
                
                if (request.timeout > 0) {
                    cancelTimer = setTimeout(onRequestEnd, request.timeout * 1000);
                }
                
                return true; // async mode
            }
            
            if (callback) callback(response); 
    }

    KellyEDispetcher.init();