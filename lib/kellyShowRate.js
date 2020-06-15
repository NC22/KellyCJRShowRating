/* 
    @encoding utf-8
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

    var location = window.location;
    
    var posts = false;    
    var postsData = [];
    
    var jobPool = [];
    var cache = [];
    
    var handler = this;
    
    handler.cfg = false;
    
    var baseClass = KellyShowRateTpl.baseClass;
    var hostClass = location.host.split('.').join('-');
    
    var commentsBlockTimer = {};
    var updateAllTimer = false;
    
    var css = KellyShowRateTpl.getCss();
    
    // only one thread allowed
    
    var request = false;
    var requestTick = false;

    // joy dom related functions - start
        
    function isAuth() {        
        return document.getElementById('settings') ? true : false;        
    }   
    
    function isPostCensored(postBlock) {
        return (postBlock.innerHTML.indexOf('/images/censorship') != -1 || 
                postBlock.innerHTML.indexOf('censored-preview') != -1 || 
                postBlock.innerHTML.indexOf('/images/unsafe_ru') != -1) ? true : false;
    }
        
    function getPostLink(post) {
                
        var selector = location.host != 'old.reactor.cc' ? '.ufoot_first .link_wr a' : '.ufoot [title="ссылка на пост"]';
        var src = post.querySelector(selector);
        
        return src ? src : false;
    }
    
    function getPosts(container) {
        if (!container) container = document;        
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
    
    function getPostRatingNode(el) {        
        if (!el) return false;
        
        var rating = el.querySelector('.ufoot .post_rating');
        if (!rating || !rating.firstChild) {
            return false;
        }
              
        // "Рейтинг : 44.4" или "[+] 44.4 [-]" или [+] -- [-] и т.п.
        
        for (var i = 0; i < rating.firstChild.childNodes.length; i++) {
            var node = rating.firstChild.childNodes[i];
            if (node && node.nodeType == Node.TEXT_NODE && (node.nodeValue.indexOf('.') != -1 || node.nodeValue.indexOf('--') != -1) ) {
                return node;
            }             
        }
        
        return false;
    }
    
    function getCommentRatingNode(el) {        
        if (!el) return false;
        
        var rating = el.querySelector('.txt .comment_rating span');
        if (!rating) return false;
        
        return getValidTextNode(rating.childNodes[0], true);
    }
    
    function getUnauthPostRating(el) {
                
        var unauthRatingContainer = el.querySelector('.post_rating span');                
        if (!unauthRatingContainer || unauthRatingContainer.childNodes.length < 3) {
            return false;
        } 
        
        return getValidTextNode(unauthRatingContainer.childNodes[2]);   
    }
  
    function getUnauthCommentRating(comment) {
                
        var unauthRatingContainer = comment.querySelector('.txt .comment_rating span');                
        if (!unauthRatingContainer || unauthRatingContainer.childNodes.length < 1) {            
            return false;
        } 
        
        return getValidTextNode(unauthRatingContainer.childNodes[0]);   
    }
    
    // joy dom related functions - end
    
    function hideSource(source) {
        
        if (source.innerHTML.indexOf('comment_show') != -1 ||
            source.querySelector('.' + baseClass + '-show-hidden')) return;
        
        source.classList.add(baseClass + '-source-content-hidden');
        
        var unhideButton = document.createElement('div');
            unhideButton.className = baseClass + '-show-hidden';
            unhideButton.onclick = function() { 
                this.parentElement.classList.remove(baseClass + '-source-content-hidden'); 
                this.parentElement.removeChild(this);
            };
            
        source.appendChild(unhideButton);
    }
    
    function updateCommentsRating(post) {

        var comments = getPostComments(post);
        if (comments === false) {
            return false;
        }
        handler.log('format comments block for ' + post.id, true);
        
        var cacheDoc = getPostCache(post);
        if (!cacheDoc) return true;
        
        for (var i = 0; i < comments.length; i++) {
            
            var unauthComment = cacheDoc.unauthDoc.querySelector('#' + comments[i].id); 
            if (!unauthComment) continue;
            
            var loader = initRatingBlock(comments[i], 'comment');
            if (!loader) continue;
               
            var unauthCommentRating = getUnauthCommentRating(unauthComment);
            if (unauthCommentRating) {
                
                if (handler.cfg.hideCommentByRatingEnabled && KellyTools.val(unauthCommentRating, 'float') <= handler.cfg.hideCommentByRating) {
                    hideSource(comments[i]);
                }
            
                loader.innerText = unauthCommentRating;
                
            } else {
                handler.log('fail to detect comment rating ' + comments[i].id);
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
        
        return false;
    } 
    
    function getPostCache(post) {
        
        for (var i = 0; i < cache.length; i++) {
            if (cache[i].post == post) {
                return cache[i];
                break;
            } 
        }
        
        return false;
    } 
    
    function getValidTextNode(node, returnNode) {
        
        if (node && node.nodeType == Node.TEXT_NODE) {
            
            return returnNode ? node : node.nodeValue.trim();
            
        } else {
            
            handler.log('Bad node type', true);
            handler.log(node);
            
            return false;
        }
    }
    
    function initRatingBlock(el, type) {
        
        if (!type) type = 'post';
        
        var loader = el.getElementsByClassName(baseClass + '-' + type + '-rating');
        if (loader.length > 0) return loader[0];
        
        var ratingNode = type == 'comment' ? getCommentRatingNode(el) : getPostRatingNode(el);
        if (!ratingNode || !ratingNode.parentElement) {            
            return false;
        }
        
        var loader = document.createElement('span');
            loader.className = baseClass + '-rating ' + baseClass + '-' + type + '-rating ' + hostClass + '-rating';
        
        // make mark for post that already has rating - load anyway to get comments info
        
        if (type != 'comment') {
            var value = getValidTextNode(ratingNode);
            if (value && value.indexOf('.') != -1) {
                loader.innerText = value;
                loader.setAttribute('data-setted', 1);
            }
        }
        
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
                        loadDoc.innerHTML = '';
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
        
        var src = getPostLink(job.post);
        if (!src) {
            job.onLoad(false, 'cant find post link');
            startJob();
            return;
        }
        
        var srcLink = src.href.match(/\/post\/[0-9]+/g);
        if (!srcLink) {
            job.onLoad(false, 'cant detect post id');
            startJob();
            return;
        }
        
        var postId = srcLink[0].match(/[0-9]+/g)[0];
        
        requestTick = setTimeout(function() {
            
            requestTick = false;
            startJob();
            
        }, handler.cfg.delay * 1000);
        
        var url = handler.cfg.postLink.replace('__PROTOCOL__', location.protocol);
            url = url.replace('__POST_ID__', postId);
            
        getUnauthData(url, function(unauthDoc, error) {
              
            job.onLoad(unauthDoc, error);
            startJob();
        });
    }
    
    function addJob(post, onLoad) {
        
        for (var i = 0; i < jobPool.length; i++) {            
            if (jobPool[i].post == post) return;
        }
                
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
        var ready = 0;
        var required = 0;
        
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
        
        var loader = initRatingBlock(post, 'post');        
        if (!loader) {            
            return;
        }
        
        if (!scrollCheckOff) {
            var scrollTop =  KellyTools.getScrollTop();      
            
             // handler.log(scrollTop + KellyTools.getViewport().screenHeight + handler.cfg.scrollOffset, true);
             // handler.log(post.getBoundingClientRect().top + scrollTop, true);
             
            if (loader.classList.contains(baseClass + '-rating-checked') || 
                handler.cfg.scrollOffset == -1 || 
                post.getBoundingClientRect().top + scrollTop > scrollTop + KellyTools.getViewport().screenHeight + handler.cfg.scrollOffset) { // under bottom of screen + 100px
                // handler.log('skip ' + post.id, true);
                return;
            }            
        }
        
        handler.log('update  ' + post.id, true);
        
        var classPrefix = '';
        
        if (loader.getAttribute('data-setted')) {
            
            loader.removeAttribute('data-setted');
            classPrefix = 'setted-';
            
        } else loader.innerText = '';
        
        loader.classList.add(baseClass + '-rating-' + classPrefix+ 'loading');
        loader.classList.add(baseClass + '-rating-checked');

        var toogleCommentsButton = post.querySelector('.toggleComments');
        if (toogleCommentsButton) {           
            toogleCommentsButton.removeEventListener('click', formatComments);               
            toogleCommentsButton.addEventListener('click', formatComments);   
        }
        
        addJob(post, function(unauthDoc, error) {
                                       
                loader.classList.remove(baseClass + '-rating-' + classPrefix + 'loading');
                loader.innerText = '??'; 
                
                var addRetry = function() {                    
                    
                    loader.classList.add(baseClass + '-rating-retry');
                    loader.onclick = function() {
                        updateRatingState(post, true);
                        return false;
                    };
                };
                
                if (error) {        
                
                    addRetry();
                    
                    handler.log('ON_LOAD_REQUEST - Error : ' + error);
                    return;
                }
                    
                var unauthedPost = unauthDoc.querySelector('#' + post.id);
                if (!unauthedPost) {
                    
                    addRetry();
                    handler.log('post with id ' + post.id + ' not found in unauth doc');
                    return;
                }
                
                var unauthedRating = getUnauthPostRating(unauthDoc);                           
                if (!unauthedRating) {
                    addRetry();
                    handler.log('post with id ' + post.id + ' not found rating container');
                    return;
                }
                
                if (handler.cfg.hidePostByRatingEnabled && KellyTools.val(unauthedRating, 'float') <= handler.cfg.hidePostByRating) {
                    hideSource(post);
                }
                
                updatePostCache({post : post, unauthDoc : unauthDoc});
                
                loader.innerText = unauthedRating;
                updateCommentsRating(post);
                
                addRetry();
                removeUpdateEventIfAllEnd();
        });
        
        startJob();
    }

    function updateAllRatingState(e, noDelay) {
        
        if (!noDelay && updateAllTimer !== false) {
            return;
        }
        
        var update = function() {            
            if (!noDelay) updateAllTimer = false;
            
            for (var i = 0; i < handler.posts.length; i++) {
                if (handler.posts[i]) updateRatingState(handler.posts[i]);                    
            }
        }
        
        if (noDelay) update(); 
        else updateAllTimer = setTimeout(update, handler.cfg.scrollDelay * 1000);
    }
      
    this.log = function(err, notice) {        
        KellyTools.log(err, 'kellyShowRate', notice ? KellyTools.E_NOTICE : KellyTools.E_ERROR);
    }
    
    this.init = function() {
        
        if (window.location !== window.parent.location ) {  // iframe mode                    
            return;
        }
        
        if (!isAuth()) return;
        
        kellyStorage.load(function(cfg) {
                
            handler.cfg = cfg;  
            
            KellyTools.DEBUG = handler.cfg.debug > 0 ? true : false;;
            if (KellyTools.DEBUG) handler.log('debug is enabled', true);
            
            handler.posts = getPosts();
            handler.log('posts ' + handler.posts.length, true);
            
            if (handler.posts.length <= 0) return;
            
            updateAllRatingState(false, true);
            window.addEventListener('scroll', updateAllRatingState);   
        });
             
        var style = document.getElementById(baseClass + '-mainCss');
        if (style) return;
                    
        var head = document.head || document.getElementsByTagName('head')[0];
        var style = document.createElement('style');
            style.type = 'text/css';
            style.id = baseClass + '-mainCss';       
            head.appendChild(style);
        
        if (style.styleSheet){
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
          
    }    
}