var http = require("http");
var URL = require('url');
var iconv = require('iconv-lite');

function  HttpUtils() {

}
module.exports = HttpUtils;


HttpUtils.download = function download(requrl, callback) {

    //分解 url
        console.log(requrl);
   var host= URL.parse(requrl).host;
   var pathname= URL.parse(requrl).pathname;

    var options = {
        host: host,
        port: 80,
        path:pathname,
        method: 'GET',
        headers:{
            'Accept':'text/html',
            'Content-Type':'application/x-www-form-urlencoded',
            'X-Requested-With':'xmlhttprequest',
            'Connection':'keep-alive',
            'Referer':'http://cn.china.cn',
            'User-Agent':'Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)'
        }
    };

    http.get(options,function(res){
        res.setEncoding('binary');
//        console.log("statusCode: ", res.statusCode);
//        console.log("headers: ", res.headers);

        var data = "";
        res.on('data',function(chunk) {
            data+= chunk;
        });
        res.on("end",function(){
            var buf = new Buffer(data,'binary');
            var html = iconv.decode(buf,'gbk');
            callback(html);
        });

    }).on("error",function(){
        console.log("err read");
        callback(null);

    });
}
