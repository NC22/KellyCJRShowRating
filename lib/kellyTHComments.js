KellyTHComments = new Object();   
KellyTHComments.tpl = 'background : linear-gradient(to right, hsla(__CALC__,0) 0%,hsla(__CALC__,0) 1%,hsla(__CALC__,1) 80%,hsla(__CALC__,1) 100%);';
KellyTHComments.tpl += 'border-radius : 4px;';

KellyTHComments.highlightComment = function(source, r, cfg) {        
        var l = 100 - Math.abs(KellyTools.val(r, 'float')) * (50 / 6);
        var hsl = (r < 0 ? 0 : 120) + ', 100%, ' + (l < 50 ? 50 : l) + '%';
        
        try {
            source.querySelector('.txt').setAttribute('style', this.tpl.replace(new RegExp('__CALC__', 'g'), hsl));
            source.querySelector('.comment_rating').setAttribute('style', 'color : #000; margin-right : 6px; font-weight : bold;');
        } catch(err) {
            KellyTools.log(err, 'KellyTHComments', KellyTools.E_ERROR);
        }
    }
    
KellyTHComments.activate = function() {
    
    KellyStorage.fields.highlightComments = {optional : true, defaultOptional : false};
    KellyStorage.fieldsOrder.splice(KellyStorage.fieldsOrder.indexOf('__ADDITIONS__'), 0, "highlightComments");
    
    if (typeof KellyShowRate == 'undefined') return;
    KellyShowRate.onLoadCallbacks.push(function(showRateController) {        
        if (!showRateController.cfg.highlightCommentsEnabled) return;
        
        for (var i = 0; i < showRateController.posts.length; i++) {
            if (showRateController.posts[i]) {
                showRateController.posts[i].addEventListener(KellyShowRateTpl.baseClass + '-update-comment-rating', function(e){
                    KellyTHComments.highlightComment(e.detail.comment, e.detail.rating, showRateController.cfg);
                });
            }        
        }
    });
    
}

KellyTHComments.activate();