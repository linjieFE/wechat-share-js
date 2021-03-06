'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by SamMFFL on 2018/2/2.
 */

var wechatShareTitle = void 0,
    wechatShareDesc = void 0,
    wechatShareLink = void 0,
    wechatShareImgurl = void 0,
    debug = void 0;

function ajax(params) {

    params = params || {};
    params.data = params.data || {};
    // 判断是ajax请求还是jsonp请求
    var json = params.jsonp ? jsonp(params) : json(params);
    // ajax请求
    function json(params) {
        //  请求方式，默认是GET
        params.type = (params.type || 'GET').toUpperCase();
        // 避免有特殊字符，必须格式化传输数据
        params.data = formatParams(params.data);
        var xhr = null;
        // 实例化XMLHttpRequest对象
        if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        } else {
            // IE6及其以下版本
            xhr = new ActiveXObjcet('Microsoft.XMLHTTP');
        }
        // 监听事件，只要 readyState 的值变化，就会调用 readystatechange 事件
        xhr.onreadystatechange = function () {
            //  readyState属性表示请求/响应过程的当前活动阶段，4为完成，已经接收到全部响应数据
            if (xhr.readyState == 4) {
                var status = xhr.status;
                //  status：响应的HTTP状态码，以2开头的都是成功
                if (status >= 200 && status < 300) {
                    var response = '';
                    // 判断接受数据的内容类型
                    var type = xhr.getResponseHeader('Content-type');
                    if (type.indexOf('xml') !== -1 && xhr.responseXML) {
                        response = xhr.responseXML; //Document对象响应
                    } else if (type === 'application/json') {
                        response = JSON.parse(xhr.responseText); //JSON响应
                    } else {
                        response = xhr.responseText; //字符串响应
                    }
                    // 成功回调函数
                    params.success && params.success(response);
                } else {
                    params.error && params.error(status);
                }
            }
        };
        // 连接和传输数据
        if (params.type == 'GET') {
            // 三个参数：请求方式、请求地址(get方式时，传输数据是加在地址后的)、是否异步请求(同步请求的情况极少)；
            xhr.open(params.type, params.url + '?' + params.data, true);
            xhr.send(null);
        } else {
            xhr.open(params.type, params.url, true);
            //必须，设置提交时的内容类型
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
            // 传输数据
            xhr.send(params.data);
        }
    }

    function jsonp(params) {
        //创建script标签并加入到页面中
        var callbackName = params.jsonp + random();
        var head = document.getElementsByTagName('head')[0];
        // 设置传递给后台的回调参数名
        params.data['callback'] = callbackName;
        var data = formatParams(params.data);
        var script = document.createElement('script');
        head.appendChild(script);
        //创建jsonp回调函数
        window[callbackName] = function (json) {
            head.removeChild(script);
            clearTimeout(script.timer);
            window[callbackName] = null;
            params.success && params.success(json);
        };
        //发送请求
        script.src = params.url + '?' + data;
        //为了得知此次请求是否成功，设置超时处理
        if (params.time) {
            script.timer = setTimeout(function () {
                window[callbackName] = null;
                head.removeChild(script);
                params.error && params.error({
                    message: '超时'
                });
            }, time);
        }
    }

    //格式化参数
    function formatParams(data) {
        var arr = [];
        for (var name in data) {
            //   encodeURIComponent() ：用于对 URI 中的某一部分进行编码
            arr.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]));
        }
        // 添加一个随机数参数，防止缓存
        arr.push('v=' + random());
        return arr.join('&');
    }

    // 获取随机数
    function random() {
        return Math.floor(Math.random() * 10000 + 500);
    }
}

var WechatShare = function () {
    function WechatShare(props) {
        var isDebug = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        _classCallCheck(this, WechatShare);

        debug = isDebug;
        var self = this;
        var script = document.createElement('script');
        script.src = '//res.wx.qq.com/open/js/jweixin-1.0.0.js';
        script.onload = function () {
            self._init(props);
        }.bind(this);
        document.body.appendChild(script);
    }

    _createClass(WechatShare, [{
        key: '_init',
        value: function _init(props) {
            var title = props.title,
                desc = props.desc,
                link = props.link,
                imgUrl = props.imgUrl;


            wechatShareTitle = title;
            wechatShareDesc = desc;
            wechatShareLink = link;
            wechatShareImgurl = imgUrl;

            this.signature();
        }
    }, {
        key: 'signature',
        value: function signature() {
            var self = this;
            ajax({
                type: 'GET',
                url: location.origin + '/api/wechat/jsapi/signature',
                data: {
                    url: window.location.href
                },
                jsonp: 'wechatShareCallback',
                success: function success(data) {
                    // console.log(data);
                    switch (data.status) {
                        case 'SUCCESS':
                            var configAppId = data.attributes.config.appid;
                            var configTimestamp = data.attributes.config.timestamp;
                            var configNoncestr = data.attributes.config.noncestr;
                            var configSignature = data.attributes.config.signature;
                            self.wechatShare({
                                configAppId: configAppId,
                                configTimestamp: configTimestamp,
                                configNoncestr: configNoncestr,
                                configSignature: configSignature
                            });
                            break;
                        default:
                    }
                },
                error: function error(xhr, errorType, _error) {
                    console.log(xhr, errorType, _error);
                }
            });
        }
    }, {
        key: 'wechatShare',
        value: function wechatShare(params) {
            var configAppId = params.configAppId,
                configTimestamp = params.configTimestamp,
                configNoncestr = params.configNoncestr,
                configSignature = params.configSignature;


            wx.config({
                debug: debug, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                appId: configAppId, // 必填，公众号的唯一标识
                timestamp: configTimestamp, // 必填，生成签名的时间戳
                nonceStr: configNoncestr, // 必填，生成签名的随机串
                signature: configSignature, // 必填，签名，见附录1
                jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareQZone'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
            });
            wx.ready(function () {
                wx.onMenuShareTimeline({
                    title: wechatShareTitle, // 分享标题
                    link: wechatShareLink, // 分享链接
                    imgUrl: wechatShareImgurl, // 分享图标
                    success: function success() {
                        // 用户确认分享后执行的回调函数
                        window.location.href = wechatShareLink;
                    },
                    cancel: function cancel() {
                        // 用户取消分享后执行的回调函数
                        window.location.href = wechatShareLink;
                    }
                });
                wx.onMenuShareAppMessage({
                    title: wechatShareTitle, //分享标题
                    desc: wechatShareDesc, //分享描述
                    link: wechatShareLink, //分享链接
                    imgUrl: wechatShareImgurl, //分享图标
                    type: 'link', //分享类型，music,video或link,不填默认为link
                    dataUrl: '', //如果type是music或video，则要提供数据链接，默认为空
                    success: function success() {
                        //用户确认分享后执行的回调函数
                        window.location.href = wechatShareLink;
                    },
                    cancel: function cancel() {
                        //用户取消分享后执行的回调函数
                        window.location.href = wechatShareLink;
                    }

                });
                wx.onMenuShareQQ({
                    title: wechatShareTitle, //分享标题
                    desc: wechatShareDesc, //分享描述
                    link: wechatShareLink, //分享链接
                    imgUrl: wechatShareImgurl, //分享图标
                    type: 'link', //分享类型，music,video或link,不填默认为link
                    dataUrl: '', //如果type是music或video，则要提供数据链接，默认为空
                    success: function success() {
                        //用户确认分享后执行的回调函数
                        window.location.href = wechatShareLink;
                    },
                    cancel: function cancel() {
                        //用户取消分享后执行的回调函数
                        window.location.href = wechatShareLink;
                    }

                });
                wx.onMenuShareQZone({
                    title: wechatShareTitle, //分享标题
                    desc: wechatShareDesc, //分享描述
                    link: wechatShareLink, //分享链接
                    imgUrl: wechatShareImgurl, //分享图标
                    dataUrl: '', //如果type是music或video，则要提供数据链接，默认为空
                    success: function success() {
                        //用户确认分享后执行的回调函数
                        window.location.href = wechatShareLink;
                    },
                    cancel: function cancel() {
                        //用户取消分享后执行的回调函数
                        window.location.href = wechatShareLink;
                    }

                });
            });
        }
    }]);

    return WechatShare;
}();

exports.default = WechatShare;
