/* 
    @encoding       utf-8
    @name           kellyShowRate
    @namespace      Kelly
    @description    Show rating of posts and comments for authored users for joyreactor.cc
    @author         Rubchuk Vladimir <torrenttvi@gmail.com>
    @license        GPLv3
    
    /\_/\ 
    ='_'=   /  
    |><  \ /      
    |..___/    FOR DEVELOPMENT PURPOSES USE SOURCE CODE FROM https://github.com/NC22/KellyCJRShowRating 
    
    Notice :    
    
    - Рейтинг коментов не будет загружен если пост не доступен для просмотра неавторизованным пользователем (коменты скрыты)
*/

function KellyShowRate(cfg) {

    var posts = false, location = window.location;   
    var jobPool = [], cache = [], postsData = [];
    
    var handler = this;
        handler.cfg = false;
        handler.tweaks = [];
        handler.callbacks = {onInit : [], onOptionsInit : []};
        
    var baseClass = KellyShowRateTpl.baseClass;
    var hostClass = location.host.split('.').join('-');
    
    var commentsBlockTimer = {}, updateAllTimer = false;    
    var request = false, requestTick = false;
    
    // joy dom related functions - start
        
    function isAuth() {        
        return document.getElementById('settings') ? true : false;        
    }   
    
    function isPostCensored(el) {
        return (el.innerHTML.indexOf('/images/censorship') != -1 || el.innerHTML.indexOf('censored-preview') != -1 || el.innerHTML.indexOf('/images/unsafe_ru') != -1) ? true : false;
    }
        
    function getPostId(post) {             
        var postId = post ? post.id.match(/[0-9]+/g) : [];
        return postId.length <= 0 ? false : postId[0];
    }
    
    function getPosts(container) {      
        return container.getElementsByClassName('postContainer');
    }
    
    // return false if container not found and array of elements if all ok
    
    function getPostComments(post) {
        
        var commentsContainer = post.getElementsByClassName('comment_list_post');
        if (commentsContainer.length <= 0) {
            return false;
        }
        
        return commentsContainer[0].getElementsByClassName('comment');
    }
    
    function getPostByChild(el) {
        return KellyTools.getParentByClass(el, 'postContainer');
    } 
            
    function getRatingNode(rating) {
        
        if (rating) {
            var node, walk = document.createTreeWalker(rating, NodeFilter.SHOW_TEXT, null, false);
            while(node = walk.nextNode()) {  // "Рейтинг : 44.4" или "[+] 44.4 [-]" или [+] -- [-] и т.п.
                if (node && node.nodeType == Node.TEXT_NODE && (node.nodeValue.indexOf('.') != -1 || node.nodeValue.indexOf('--') != -1 || node.nodeValue.indexOf('≈0') != -1) ) {
                    return node;
                }
            }
        }
        
        handler.log('Bad rating node', true); handler.log(rating);
        return false;
    }
    
    function getPostRatingNode(el, unauth) {        
        if (!el) return false;
        
        var rating = el.querySelector('.ufoot .post_rating');
        if (!rating) return false;        
        if (!rating.firstChild) KellyTools.setHTMLData(rating, '<span>--</span>'); // sometimes posts has empty rating elem in some sections
        
        return getRatingNode(rating);
    }
    
    function getCommentRatingNode(el, unauth) {      
        return getRatingNode(el.querySelector('.comment_rating'));
    }
    
    function getValidRatingNodeValue(el) { // currently remove addition information like "Рейтинг : " if exists
        var rating = el ? el.nodeValue.match(/[+-]?\d+(\.\d+)?/g) : false;
        return rating ? rating[0] : false;
    }
    
    // joy dom related functions - end
    
    function hideSource(source) {
        
        if (source.innerHTML.indexOf('comment_show') != -1 ||
            source.querySelector('.' + baseClass + '-show-hidden')) return;
        
        var unhideButton = document.createElement('div');
            unhideButton.className = baseClass + '-show-hidden';
            unhideButton.onclick = function() { 
                this.parentElement.classList.remove(baseClass + '-source-content-hidden'); 
                this.parentElement.removeChild(this);
            };
        
        source.classList.add(baseClass + '-source-content-hidden');            
        source.appendChild(unhideButton);
    }
    
    function updateCommentsRating(post) {

        var comments = getPostComments(post);
        if (comments === false) return false;
        
        handler.log('format comments block for ' + post.id, true);
        
        var cacheDoc = getPostCache(post);
        if (!cacheDoc || comments.length <= 0) return true;

        var unauthComments = getPostComments(cacheDoc.unauthDoc);
        if (unauthComments == false || unauthComments.length <= 0) cacheDoc.empty = true; // comments hidden for unauth [pornreactor]
        
        post.dispatchEvent(new CustomEvent(baseClass + '-before-update-comments', {bubbles: true, detail : {unauthDoc : cacheDoc.unauthDoc}}));
                
        for (var i = 0; i < comments.length; i++) {
            
            var unauthComment = cacheDoc.empty ? comments[i] : cacheDoc.unauthDoc.querySelector('#' + comments[i].id); 
            if (!unauthComment) continue;
            
            var loader = initRatingBlock(comments[i], 'comment');
            if (!loader) continue;
               
            var unauthCommentRating = cacheDoc.empty ? loader.innerHTML : getValidRatingNodeValue(getCommentRatingNode(unauthComment, true));
            if (unauthCommentRating) {
                
                if (handler.cfg.hideCommentByRatingEnabled && KellyTools.val(unauthCommentRating, 'float') <= handler.cfg.hideCommentByRating) {
                    hideSource(comments[i]);
                }
                
                loader.innerText = unauthCommentRating;                
                post.dispatchEvent(new CustomEvent(baseClass + '-update-comment-rating', {bubbles: true, detail : {comment: comments[i], rating : unauthCommentRating,}}));
                
            } else {
                if (cacheDoc.empty) loader.innerText = "≈0"; else handler.log('fail to detect comment rating ' + comments[i].id);
            }
        }
        
        return true;
    }
    
    function updatePostCache(cacheItem) {
        
        var existCache = getPostCache(cacheItem.post);
        var index = existCache ? cache.indexOf(existCache) : -1;
        
        if (index != -1) {
            cache[index] = cacheItem;
        } else {
            cache.push(cacheItem);
        }
    } 
    
    function getPostCache(post) {
        
        for (var i = 0; i < cache.length; i++) if (cache[i].post == post) return cache[i];        
        return false;
    } 
    
    function initRatingBlock(el, type) {
        
        if (!type) type = 'post';
        
        var loader = el.getElementsByClassName(baseClass + '-' + type + '-rating');
        if (loader.length > 0) return loader[0];
        
        var ratingNode = type == 'comment' ? getCommentRatingNode(el) : getPostRatingNode(el);
        if (!ratingNode || !ratingNode.parentElement) return false;
        
        loader = document.createElement('span');
        loader.className = baseClass + '-rating ' + baseClass + '-' + type + '-rating ' + hostClass + '-rating';

        var value = getValidRatingNodeValue(ratingNode);
        if (value) loader.innerText = value;
        
        ratingNode.parentElement.insertBefore(loader, ratingNode);
        ratingNode.parentElement.removeChild(ratingNode);
        
        return loader;
    }
    
    function getUnauthData(src, onLoad) {
               
        KellyTools.getBrowser().runtime.sendMessage({
          
            method: "getPostPage", 
            src : src,
            timeout : handler.cfg.timeout,
            
        }, function(response) {
              
              if (response.html) {
                  
                    var loadDoc = document.createElement('DIV');
                        loadDoc.appendChild(KellyTools.val(response.html, 'html'));
                    
                    KellyTools.stopMediaLoad(loadDoc);
                    KellyTools.removeByTag(loadDoc, 'iframe');                    
                    KellyTools.removeByTag(loadDoc, 'script');
                    
                    onLoad(loadDoc);
                    
              } else onLoad(false, 'getPostPage error : ' + response.error);
                            
        });
    }
    
    function startJob() {
        
        if (request || requestTick) return;
        
        var job = jobPool.pop();
        if (!job) return;
                   
        requestTick = setTimeout(function() {
            
            requestTick = false;
            startJob();
            
        }, handler.cfg.delay * 1000);
        
        var url = handler.cfg.postLink.replace('__PROTOCOL__', location.protocol).replace('__POST_ID__', getPostId(job.post));

        getUnauthData(url, function(unauthDoc, error) {
              
            job.onLoad(unauthDoc, error);
            startJob();
        });
    }
    
    function addJob(post, onLoad) {
        
        for (var i = 0; i < jobPool.length; i++) if (jobPool[i].post == post) return;        
        jobPool.push({post : post, onLoad : onLoad});
    } 
    
    function formatComments(e) {
        
        var post = getPostByChild(e.target);        
        if (!post) return;
        
        if (commentsBlockTimer[post.id]) return false;
        
        commentsBlockTimer[post.id] = setInterval(function() {
              if (updateCommentsRating(post)) {
                  clearInterval(commentsBlockTimer[post.id]);
                  commentsBlockTimer[post.id] = false;
              }
        }, 100);
    }
    
    function removeUpdateEventIfAllEnd() { 
        var ready = 0, required = 0;
        
        for (var i = 0; i < handler.posts.length; i++) {
            if (isPostCensored(handler.posts[i])) continue;
            if (getPostCache(handler.posts[i])) ready++;
            required++;
        }
        
        if (ready == required) {
            handler.log('All posts ' + handler.posts.length + ' rating loaders initialized', true);
            window.removeEventListener('scroll', updateAllRatingState);
        }
    }
    
    function updateRatingState(post, scrollCheckOff) {
        
        if (isPostCensored(post)) return;

        if (!getPostId(post)) {
            handler.log('cant detect post id', true);
            handler.log(post);
            return;
        }
        
        var loader = initRatingBlock(post, 'post');        
        if (!loader) return;

        if (!scrollCheckOff) {
            var scrollTop =  KellyTools.getScrollTop();    
            
            if (loader.classList.contains(baseClass + '-rating-checked') || 
                handler.cfg.scrollOffset == -1 || 
                post.getBoundingClientRect().top + scrollTop > scrollTop + KellyTools.getViewport().screenHeight + handler.cfg.scrollOffset) { // under bottom of screen + 100px
                // handler.log('skip ' + post.id, true);
                return;
            }            
        }
        
        var toogleCommentsButton = post.querySelector('.toggleComments');
        if (toogleCommentsButton) {           
            toogleCommentsButton.removeEventListener('click', formatComments);               
            toogleCommentsButton.addEventListener('click', formatComments);   
        }
        
        handler.log('update  ' + post.id, true);        
        var classPrefix = loader.innerHTML ? 'setted-' : '';     
        
        loader.classList.add(baseClass + '-rating-' + classPrefix + 'loading');
        loader.classList.add(baseClass + '-rating-checked');

        addJob(post, function(unauthDoc, error) {
            
                loader.innerText = loader.classList.contains(baseClass + '-rating-setted-loading') ? loader.innerHTML + ' ??' : '??';                        
                loader.classList.remove(baseClass + '-rating-' + classPrefix + 'loading');
                
                var createRetry = function(message, notice) {  
                    handler.log('POST ID [' + post.id + '] : ' + message, notice);
                    loader.classList.add(baseClass + '-rating-retry');
                    loader.onclick = function() {
                        loader.innerText = '';
                        updateRatingState(post, true);
                        return false;
                    };
                };
                
                if (error) return createRetry('ON_LOAD_REQUEST - Error : ' + error);
                    
                var unauthedPost = unauthDoc.querySelector('#' + post.id);
                if (!unauthedPost) return createRetry('not found in unauth doc');
                
                var unauthedRating = getValidRatingNodeValue(getPostRatingNode(unauthDoc, true));                           
                if (!unauthedRating) return createRetry('not found rating container');
                
                if (handler.cfg.hidePostByRatingEnabled && KellyTools.val(unauthedRating, 'float') <= handler.cfg.hidePostByRating) {
                    hideSource(post);
                }
                                
                loader.innerText = unauthedRating;
                                
                updatePostCache({post : post, unauthDoc : unauthDoc});                
                updateCommentsRating(post);                
                removeUpdateEventIfAllEnd();
                return createRetry('updated successfull', true);
        });
        
        startJob();
    }

    function updateAllRatingState(e, noDelay) {
        
        if (updateAllTimer !== false) return;
        
        updateAllTimer = setTimeout(function() { 
        
            updateAllTimer = false;
            
            for (var i = 0; i < handler.posts.length; i++) {
                if (handler.posts[i]) updateRatingState(handler.posts[i]);                    
            }
        }, noDelay ? 0 : handler.cfg.scrollDelay * 1000);
    }
    
    this.initTweaks = function(context) {
        for (var i = 0; i < this.tweaks.length; i++) this.tweaks[i].enableTweak(context);        
    };

    this.callback = function(key, data) {
        for (var i = 0; i < this.callbacks[key].length; i++) this.callbacks[key][i](handler, data);
    };
    
    this.log = function(err, notice) {        
        KellyTools.log(err, 'kellyShowRate', notice ? KellyTools.E_NOTICE : KellyTools.E_ERROR);
    }
    
    this.init = function() {
        
        if (window.location !== window.parent.location ) return;  // iframe mode
        
        handler.initTweaks('content');        
        KellyStorage.load(function(cfg) {
                
            handler.cfg = cfg;  
                    
            if (handler.cfg.offIfUnauthEnabled && !isAuth()) return;
        
            KellyTools.DEBUG = handler.cfg.debugEnabled ? true : false;
            handler.posts = getPosts(document);
            handler.log('Posts [' + handler.posts.length + ']' + (KellyTools.DEBUG ? ' [DEBUG is enabled]' : ''), true);
            handler.callback('onInit');
            
            if (handler.posts.length <= 0) return;
            
            updateAllRatingState(false, true);
            window.addEventListener('scroll', updateAllRatingState);
            
            if (!document.getElementById(baseClass + '-mainCss')) {
            
                var head = document.head || document.getElementsByTagName('head')[0];
                var style = document.createElement('style');
                    style.type = 'text/css';
                    style.id = baseClass + '-mainCss';       
                    head.appendChild(style);
                
                if (style.styleSheet){
                    style.styleSheet.cssText = KellyShowRateTpl.getCss();
                } else {
                    style.appendChild(document.createTextNode(KellyShowRateTpl.getCss()));
                }
            }
        });       
    }    
};

KellyShowRate.getInstance = function() {
    if (typeof KellyShowRate.instance == 'undefined') KellyShowRate.instance = new KellyShowRate();
    return KellyShowRate.instance;
}