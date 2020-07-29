KellyTHBannedComments = new Object();
KellyTHBannedComments.addBannedData = function(bannedItem, bannedId, bannedReply, post) {
           
        var comments = post.querySelectorAll('.comment_list_post .comment');        
        var initImages =  function(el) { 
            var loadImages = el.getElementsByTagName('img');
            for (var i = 0; i < loadImages.length; i++) loadImages[i].setAttribute('src', loadImages[i].getAttribute('data-src'));
        }
        
        var cloneBannedComment = function(parent, insertBeforeEl) {
            var cItem = bannedItem.cloneNode(true), cItemReply = bannedReply.cloneNode(true);  // todo inner .txt subdiv required 
                cItem.classList.add(KellyShowRateTpl.baseClass + '-banned'); cItemReply.classList.add(KellyShowRateTpl.baseClass + '-banned');   
                initImages(cItem); initImages(cItemReply);
                parent.insertBefore(cItem, insertBeforeEl);
                parent.insertBefore(cItemReply, insertBeforeEl);
        }
        
        var placeholder = bannedItem.previousSibling ? document.getElementById(bannedItem.previousSibling.id) : false;
        if (placeholder && placeholder.id && placeholder.className.indexOf('comment') != -1) return cloneBannedComment(placeholder.parentElement, placeholder.nextSibling);
        else {
             for (var i = 0; i < comments.length; i++) {             
                var commentId = comments[i].id.match(/[0-9]+/g)[0];
                if (commentId > bannedId) return cloneBannedComment(comments[i].parentElement, comments[i]);
            }
        }
}
                
KellyTHBannedComments.enableTweak = function(context) {
    
    KellyStorage.addField('__additions__', 'showBannedComments', {optional : true, defaultOptional : false});
    KellyShowRate.getInstance().callbacks.onInit.push(function(content) {        
        if (!content.cfg.showBannedCommentsEnabled) return;
        
        content.cfg.postLink = '__PROTOCOL__//m.reactor.cc/post/__POST_ID__';
        
        for (var i = 0; i < content.posts.length; i++) {
            if (content.posts[i]) {
                content.posts[i].addEventListener(KellyShowRateTpl.baseClass + '-before-update-comments', function(e){
                    
                    var comments = e.detail.unauthDoc.querySelectorAll('.comment')
                    for (var i = 0; i < comments.length; i++) {
                        if (!document.getElementById(comments[i].id)) {
                            var bannedId = comments[i].id.match(/[0-9]+/g)[0];
                            KellyTHBannedComments.addBannedData(comments[i], bannedId, e.detail.unauthDoc.querySelector('#comment_list_comment_' + bannedId), this);
                        }
                    }
                });
            }        
        }
    });
}

KellyShowRate.getInstance().tweaks.push(KellyTHBannedComments);