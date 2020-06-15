KellyShowRateTpl = new Object();
KellyShowRateTpl.baseClass = 'kelly-show-rate';
KellyShowRateTpl.getCss = function() {
    
    return '\
        \
        @keyframes ' + this.baseClass + '-LoaderSpin {\
             0% {\
                 transform: rotate(0deg);\
            }\
             100% {\
                 transform: rotate(360deg);\
            }\
        }\
        .comment.' + this.baseClass + '-source-content-hidden,\
        .postContainer.' + this.baseClass + '-source-content-hidden {\
           position : relative;\
        }\
        .' + this.baseClass + '-source-content-hidden .uhead_share {display : none;}\
        .comment.' + this.baseClass + '-source-content-hidden .txt>span:first-child,\
        .comment.' + this.baseClass + '-source-content-hidden .txt>div:first-child,\
        .comment.' + this.baseClass + '-source-content-hidden .image,\
        .postContainer.' + this.baseClass + '-source-content-hidden .post_content_expand,\
        .postContainer.' + this.baseClass + '-source-content-hidden .post_comment_list,\
        .postContainer.' + this.baseClass + '-source-content-hidden .post_content {\
            display : none!important;\
        }\
        .' + this.baseClass + '-rating {\
            margin-left: 4px;\
            margin-right: 4px;\
        }\
        .' + this.baseClass + '-rating:first-child {\
            margin-left: 0px;\
            margin-right: 0px;\
        }\
        .' + this.baseClass + '-rating.' + this.baseClass + '-rating-setted-loading {\
            color: #c2c2c2;\
        }\
        .' + this.baseClass + '-rating.' + this.baseClass + '-rating-loading {\
            animation: ' + this.baseClass + '-LoaderSpin 2s linear infinite;\
            background-image: none!important;\
            border-radius: 50%;\
            border: 4px solid rgba(98, 98, 98, 0.1803);\
            border-left: 4px solid #ff9b20;\
            display: inline-block;\
            width: 25px;\
            height: 25px;\
        }\
        .' + this.baseClass + '-rating.old-reactor-cc-rating {\
            width: 6px!important;\
            height: 6px!important;\
        }\
        \
        .' + this.baseClass + '-rating.' + this.baseClass + '-rating-retry {\
            cursor : pointer;\
        }\
        .' + this.baseClass + '-show-hidden {\
            width: 13px;\
            height: 13px;\
            border: solid 2px #ff8d00;\
            border-radius: 98% 40%;\
            position: relative;\
            transform: rotate(45deg);\
            overflow: hidden;\
            position: absolute;\
            right: 14px;\
            top : 4px;\
            cursor : pointer;\
            box-sizing: content-box;\
        }\
        .' + this.baseClass + '-show-hidden:before {\
            content: " ";\
            display: block;\
            position: absolute;\
            width: 5px;\
            height: 5px;\
            border: solid 1px #ff8d00;\
            border-radius: 50%;\
            left: 3px;\
            top: 3px;\
            background: #ff8d00;\
            box-sizing: content-box;\
        }\
        ';
};