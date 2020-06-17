kellyStorage.fields.highlightComments = {type : 'longtext', default : '', optional : true, defaultOptional : false};
kellyStorage.fields.highlightComments.default = 'background : linear-gradient(to right, hsla(__CALC__,0) 0%,hsla(__CALC__,0) 1%,hsla(__CALC__,1) 80%,hsla(__CALC__,1) 100%);';
kellyStorage.fields.highlightComments.default += 'border-radius : 5px;';

KellyShowRate.onLoadCallbacks.push(function(showRateController) {
    
    if (!showRateController.cfg.highlightCommentsEnabled) return;

    function highlightComment(source, r) {        
        var l = 100 - Math.abs(KellyTools.val(r, 'float')) * (50 / 6);
        var hsl = (r < 0 ? 0 : 120) + ', 100%, ' + (l < 50 ? 50 : l) + '%';
        
        try {
            source.querySelector('.txt').setAttribute('style', showRateController.cfg.highlightComments.replace(new RegExp('__CALC__', 'g'), hsl));
            source.querySelector('.comment_rating').setAttribute('style', 'color : #000; margin-right : 6px; font-weight : bold;');
        } catch(err) {
            KellyTools.log(err, 'kellyTHComments', KellyTools.E_ERROR);
        }
    }
    
    for (var i = 0; i < showRateController.posts.length; i++) {
        if (showRateController.posts[i]) {
            showRateController.posts[i].addEventListener(KellyShowRateTpl.baseClass + '-update-comment-rating', function(e){

                highlightComment(e.detail.comment, e.detail.rating);
            });
        }        
    }
});



