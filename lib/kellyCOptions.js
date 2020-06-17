// part of kellyShowRate extension, see kellyShowRate.js for copyrights and description

var KellyCOptions = new Object(); 
    KellyCOptions.baseClass = 'kelly-options';
    
    KellyCOptions.getLoc = function(key) {
        return typeof chrome !== 'undefined' ? chrome.i18n.getMessage(key) : browser.i18n.getMessage(key);
    }
    
    KellyCOptions.init = function() {
        
        KellyShowRate.getInstance().initTweaks('options');
        
        this.page = document.getElementById('page');
        this.header = document.getElementById('header');
        this.chickAdvice = document.getElementById('chick-advice');
        
        var title = this.getLoc('ext_name') + ' v' + (KellyTools.getBrowser().runtime.getManifest ? KellyTools.getBrowser().runtime.getManifest().version : '');
        var copyright = ' &copy; <a href="http:' + '//joy' + 'reactor.cc/tag/not' + 'aRo' + 'bot" target="_blank">nrad' + 'iowave</a> |\
                                 <a href="http://' + 'kelly' + '.catface.' + 'ru">' + this.getLoc('support_link') + '</a>';
        
        document.title = title;
        
        KellyTools.setHTMLData(this.header, title + copyright); 
        KellyTools.setHTMLData(this.chickAdvice, this.getLoc('chik_advice'));

        KellyStorage.load(function(cfg) {
            
            var handler = KellyCOptions;
            var html = '';

            for (var i = 0; i < KellyStorage.fieldsOrder.length; i++) {
                 
                 if (KellyStorage.fieldsOrder[i] == '__ADDITIONS__') {
                     html += '<button class="' + handler.baseClass + '-additions-show">' + handler.getLoc('show_additions') + '</button>\
                              <div class="' + handler.baseClass + '-additions">';
                     continue;
                 }
                 
                 var key = KellyStorage.fieldsOrder[i];
                 var title = handler.getLoc('option_' + key);
                 if (!title) title = key;
                 
                 var optional = '';
                 if (KellyStorage.fields[key].optional) {                     
                     optional += '<input type="checkbox" id="option-' + key + '-enabled" ' + (cfg[key + 'Enabled'] ? 'checked' : '') +'> ';
                 }
                 
                 html += '<div class="' + handler.baseClass + '-row' + '">\
                                <div class="' + handler.baseClass + '-row-title"><label>' + optional + title + '</label></div>';
                                
                 if (KellyStorage.fields[key].type) {
                        html += '<div class="' + handler.baseClass + '-row-input">\
                                    <input id="option-' + key + '" placeholder="' + title + '" value="' + KellyStorage.validateCfgVal(key, cfg[key]) + '">\
                                </div>';
                 }   
                 
                  html += '</div>';  
            }
            
            html += '</div>\
                     <div class="' + handler.baseClass + '-save"><button class="' + handler.baseClass + '-save-btn">' + handler.getLoc('save') + '</button></div>\
                     <div class="' + handler.baseClass + '-result"></div>';
               
            KellyTools.setHTMLData(handler.page, html);    
            KellyTools.getElementByClass(handler.page, handler.baseClass + '-additions-show').onclick = function() {
                    var additions = KellyTools.getElementByClass(handler.page, handler.baseClass + '-additions');
                    additions.classList.contains('show') ? additions.classList.remove('show') : additions.classList.add('show');
            };
            
            KellyTools.getElementByClass(handler.page, handler.baseClass + '-save-btn').onclick = function() {
                    
                    var data = {}, field;
                    for (var key in KellyStorage.fields) {                        
                        if (KellyStorage.fields[key].type) {
                            field = document.getElementById('option-' + key);                        
                            data[key] = field ? KellyStorage.validateCfgVal(key, field.value) : KellyStorage.fields[key].default;
                        }
                        
                        if (KellyStorage.fields[key].optional) {
                            field = document.getElementById('option-' + key + '-enabled');                        
                            data[key + 'Enabled'] = field ? field.checked : KellyStorage.fields[key].defaultOptional;                        
                        }
                    }
                    
                    KellyStorage.save(data, function(error) {  
                        var result = KellyTools.getElementByClass(handler.page, handler.baseClass + '-result');
                            result.innerText = handler.getLoc('save_' + (error ? 'error' : 'ok'));
                            result.classList.add('show');
                    });
                };
        });                
    }
    