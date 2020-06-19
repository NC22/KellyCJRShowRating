KellyTHComments = new Object();   
KellyTHComments.presets = [
    {  // highlight whole comment element
        additionCss : '.' + KellyShowRateTpl.baseClass + '-highlight-comment .comment_rating { color : #000!important; margin-right : 6px!important; font-weight : bold!important; }',
        elStyle : 'background : linear-gradient(to right, hsla(__HSL__,0) 0%,hsla(__HSL__,0) 2%,hsla(__HSL__,1) 82%,hsla(__HSL__,1) 100%); border-radius : 4px;',
        elSelector : '.txt',
    },
    {  // highlight rating value only 
        additionCss : '.' + KellyShowRateTpl.baseClass + '-highlight-comment .comment_rating > span > span { color : #000!important; font-weight : bold!important; padding: 4px; border-radius: 4px; }',
        elStyle : 'background: hsl(__HSL__);',
        elSelector : '.' + KellyShowRateTpl.baseClass + '-rating',
    },    
];

KellyTHComments.highlightComment = function(source, r) {
    try { 
        var l = 100 - Math.abs(KellyTools.val(r, 'float')) * (50 / 6);
        var hsl = (r < 0 ? 0 : 120) + ', 100%, ' + (l < 50 ? 50 : l) + '%';
        
        source.querySelector(this.preset.elSelector).setAttribute('style', KellyTools.replaceAll(this.preset.elStyle, '__HSL__', hsl));
        source.classList.add(KellyShowRateTpl.baseClass + '-highlight-comment');
    } catch(err) {
        KellyTools.log(err, 'KellyTHComments', KellyTools.E_ERROR);
    }
}
    
KellyTHComments.enableTweak = function(context) {
    
    KellyStorage.addField('__additions__', 'highlightComments', {optional : true, defaultOptional : false});    
    KellyStorage.addField('_/additions/_', 'highlightPreset', {type : 'int', default : 1});  
  
    KellyShowRate.getInstance().callbacks.onInit.push(function(content) {        
        if (!content.cfg.highlightCommentsEnabled) return;
        
        KellyTHComments.preset = KellyTHComments.presets[typeof KellyTHComments.presets[content.cfg.highlightPreset - 1] == 'undefined' ? 0 : content.cfg.highlightPreset - 1];
        KellyShowRateTpl.additionCss += KellyTHComments.preset.additionCss;
        
        for (var i = 0; i < content.posts.length; i++) {
            if (content.posts[i]) {
                content.posts[i].addEventListener(KellyShowRateTpl.baseClass + '-update-comment-rating', function(e){
                    KellyTHComments.highlightComment(e.detail.comment, e.detail.rating);
                });
            }        
        }
    });
}

KellyShowRate.getInstance().tweaks.push(KellyTHComments);