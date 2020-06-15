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
        var copyright = ' &copy; <a href="http:' + '//joy' + 'reactor.cc/tag/not' + 'aRo' + 'bot" target="_blank">nrad' + 'iowave</a> |\
                                 <a href="http://' + 'kelly' + '.catface.' + 'ru">' + this.getLoc('support_link') + '</a>';
        
        document.title = title;
        
        KellyTools.setHTMLData(this.header, title + copyright); 
        KellyTools.setHTMLData(this.chickAdvice, this.getLoc('chik_advice'));
        
        kellyStorage.load(function(cfg) {
            
            var handler = kellyCOptions;
            var html = '';
            
            for (var key in kellyStorage.fields) {

                 var title = handler.getLoc('option_' + key);
                 if (!title) title = key;
                 
                 if (key == 'delay') {
                     html += '<div class="' + handler.baseClass + '-additions-show">[' + handler.getLoc('show_additions') + ']</div>\
                              <div class="' + handler.baseClass + '-additions">';
                 }
                 
                 var optional = '';
                 if (kellyStorage.fields[key].optional) {                     
                     optional += '<input type="checkbox" id="option-' + key + '-enabled" ' + (cfg[key + 'Enabled'] ? 'checked' : '') +'> ';
                 }
                 
                 html += '<div class="' + handler.baseClass + '-row' + '">\
                                <div class="' + handler.baseClass + '-row-title"><label>' + optional + title + '</label></div>\
                                <div class="' + handler.baseClass + '-row-input">\
                                    <input id="option-' + key + '" placeholder="' + title + '" value="' + kellyStorage.validateCfgVal(key, cfg[key]) + '">\
                                </div>\
                          </div>';  
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
                    
                    var data = {};
                    for (var key in kellyStorage.fields) {
                        
                        var field = document.getElementById('option-' + key);                        
                        data[key] = field ? kellyStorage.validateCfgVal(key, field.value) : kellyStorage.fields[key].default;
                        
                        if (kellyStorage.fields[key].optional) {
                            field = document.getElementById('option-' + key + '-enabled');                        
                            data[key + 'Enabled'] = field ? field.checked : kellyStorage.fields[key].defaultOptional;                        
                        }
                    }
                    
                    kellyStorage.save(data, function(error) {                        
                        KellyTools.getElementByClass(handler.page, handler.baseClass + '-result').innerText = handler.getLoc('save_' + (error ? 'error' : 'ok'));
                    });
                };
        });                
    }
    
    kellyCOptions.init();