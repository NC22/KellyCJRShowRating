// part of kellyShowRate extension, see kellyShowRate.js for copyrights and description

var kellyCOptions = new Object(); 
    kellyCOptions.baseClass = 'kelly-options';
    
    kellyCOptions.getLoc = function(key) {
        return typeof chrome !== 'undefined' ? chrome.i18n.getMessage(key) : browser.i18n.getMessage(key);
    }
    
    kellyCOptions.init = function() {

        this.page = document.getElementById('page');
        this.header = document.getElementById('header');
        this.chickAdvice = document.getElementById('chick-advice');
        
        var title = this.getLoc('ext_name') + ' v' + (KellyTools.getBrowser().runtime.getManifest ? KellyTools.getBrowser().runtime.getManifest().version : '');
        
        KellyTools.setHTMLData(this.header, title + ' &copy; <a href="http:' + '//joy' + 'reactor.cc/tag/not' + 'aRo' + 'bot" target="_blank">nrad' + 'iowave</a>');
        document.title = title;
        
        KellyTools.setHTMLData(this.chickAdvice, this.getLoc('chik_advice').replace('__SUPPORT_LINK__', 'http://' + 'kelly' + '.catface.' + 'ru'));
        
        kellyStorage.load(function(cfg) {
            
            var handler = kellyCOptions;
            var html = '';
            
            for (var key in kellyStorage.fields) {

                 var title = handler.getLoc('option_' + key);
                 if (!title) title = key;
                 
                 html += '<div class="' + handler.baseClass + '-row' + '">\
                                <div class="' + handler.baseClass + '-row-title">' + title + '</div>\
                                <div class="' + handler.baseClass + '-row-input">\
                                    <input id="option-' + key + '" placeholder="' + title + '" value="' + kellyStorage.validateCfgVal(key, cfg[key]) + '">\
                                </div>\
                          </div>';
            }
            
            html += '<div class="' + handler.baseClass + '-save"><button class="' + handler.baseClass + '-save-btn">' + handler.getLoc('save') + '</button></div>';
            html += '<div class="' + handler.baseClass + '-result"></div>';
               
            KellyTools.setHTMLData(handler.page, html);            
            KellyTools.getElementByClass(handler.page, handler.baseClass + '-save-btn').onclick = function() {
                    
                    var data = {};
                    for (var key in kellyStorage.fields) {
                        
                        var field = document.getElementById('option-' + key);                        
                        data[key] = field ? kellyStorage.validateCfgVal(key, field.value) : kellyStorage.fields[key].default;                        
                    }
                    
                    kellyStorage.save(data, function(error) {                        
                        KellyTools.getElementByClass(handler.page, handler.baseClass + '-result').innerText = handler.getLoc('save_' + (error ? 'error' : 'ok'));
                    });
                };
        });                
    }
    
    kellyCOptions.init();