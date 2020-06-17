KellyTHComments = new Object();   
KellyTHComments.tpl = 'background : linear-gradient(to right, hsla(__COLOR__,0) 0%,hsla(__COLOR__,0) 2%,hsla(__COLOR__,1) 82%,hsla(__COLOR__,1) 100%);';
KellyTHComments.tpl += 'border-radius : 4px;';

KellyTHComments.highlightComment = function(source, r, cfg) {
    var l = 100 - Math.abs(KellyTools.val(r, 'float')) * (50 / 6);
    var hsl = (r < 0 ? 0 : 120) + ', 100%, ' + (l < 50 ? 50 : l) + '%';
    
    try {
        source.querySelector('.txt').setAttribute('style', KellyTools.replaceAll(this.tpl, '__COLOR__', hsl));
        source.querySelector('.comment_rating').setAttribute('style', 'color : #000; margin-right : 6px; font-weight : bold;');
    } catch(err) {
        KellyTools.log(err, 'KellyTHComments', KellyTools.E_ERROR);
    }
}
    
KellyTHComments.enableTweak = function(context) {
    
    KellyStorage.fields.highlightComments = {optional : true, defaultOptional : false};
    KellyStorage.fieldsOrder.splice(KellyStorage.fieldsOrder.indexOf('__additions__'), 0, "highlightComments");
    
    if (context == 'options') return;
    
    KellyShowRate.getInstance().callbacks.onInit.push(function(showRateController) {        
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

KellyShowRate.getInstance().tweaks.push(KellyTHComments);