/**
 * Spider
 * Author Alan.Shen
 * @constructor
 */
var cheerio = require("cheerio");
var  client = require('../database');
var  logger = require('./logger');
var httpUtils = require("../utils/httpHelper");


mysql = client.getDbCon();

function  AtoboCraw() {

}
module.exports = AtoboCraw;
AtoboCraw.crawCompany = function crawCompany() {
    paserHDUrl(function (hdurl,totalPage) {
        logger.log(hdurl+totalPage);
//        for(var i=22;i<totalPage;i++){

//            logger.log(cjurl);

            paserCompanyList(hdurl,1,totalPage);
//        }
    });
}

/**
 * 找到华东区地址
 * @param page_url
 * @param data
 * @param callback
 */
function paserHDUrl(callback) {
    var url = "http://www.atobo.com.cn/Companys/";
    var xpath="a[title='上海市企业名录']";
    httpUtils.download(url, function (data) {
        if (data) {
            var $ = cheerio.load(data);
            var hdurl="http://www.atobo.com.cn"+$(xpath).attr("href");
            paserHDTotalPage(hdurl,function(totalPage){
                return callback(hdurl,totalPage);
            });
        }
    });
}

/**
 * 解析总页数
 * @param callback
 */
function paserHDTotalPage(url,callback) {
    var xpath="span[class='total']";
    httpUtils.download(url, function (data) {
        if (data) {
            var $ = cheerio.load(data);
            var totalPage=$(xpath).text().replace("共","").replace("页","");
            return callback(totalPage);
        }
    });
}

function paserCompanyList(url,index,totalPage) {
//    var page_url=url.replace(".html","-y"+(index+2)+".html");

    var page_url=url.substr(0,url.length-1)+"-y"+(index+2)+"/";
    logger.log("paserCompanyList"+page_url);
    httpUtils.download(page_url, function (data) {
        if (data) {
            var $ = cheerio.load(data);
            var i = 0;
            $(".product_box").each(function (i, e) {
                var company = $(e).find(".CompanyName").text();
                var contact = $(e).find(".c_name").text().replace('联 系 人：', '').replace('在线咨询：', '');
                var urlStr = $(e).find(".CompanyName").attr("href");
                var busi_scope = $(e).find(".pp_product").text();
                var region = $(e).find(".renzheng").text();

                var txt = company + " " + contact + " " + urlStr + " " + busi_scope + " " + page_url;
                logger.log(i++ + " " + txt);

                var sql = "replace into craw_atobo_company_list (name,contact,atobo_company_url,page_url,busi_scope,region,crt_date) values(?,?,?,?,?,?,now())";
                mysql.query(sql, [company, contact, urlStr, page_url, busi_scope, region], function (err, results, fields) {
                    if (err) {
                        throw err;
                    } else {
                        // return callback(err, fields);
                        //logger.log("success");
                    }
                });

            });
            index++;
            if (index < totalPage) {
              paserCompanyList(url, index, totalPage);
           }
        }
    });


}



