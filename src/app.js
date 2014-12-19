
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , partials = require('express-partials')
  , http = require('http')
  , path = require('path')
  , ejs = require('ejs')
  , fs = require('fs')
  , socketio = require('socket.io');

var app = express();

//flash支持
var flash = require('connect-flash');


app.configure(function (){ 
  app.set('views', __dirname + '/views'); 
  app.set('view engine', 'ejs'); 
  app.use(express.bodyParser()); 
  app.use(express.methodOverride()); 
  app.use(flash());
  app.use(partials());
  app.use(express.cookieParser()); //cookie解析的中间件
  app.use(express.session({ //提供会话支持
    secret: "h78878787",//这个是session加密需要的，随便写的。
	cookie : {
			maxAge : 60000 * 20	//20 minutes
		}
  }));

  app.use(express. static (__dirname + '/public'));

});
//app.dynamicHelpers
app.use(function(req, res, next){
  var error = req.flash('error');
  var success = req.flash('success');
  res.locals.user = req.session.user;
  res.locals.error = error.length ? error : null;
  res.locals.success = success ? success : null;
  next();
});

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);  
app.use(express.static(path.join(__dirname, 'public')));
//app.engine('.html', ejs.__express);
// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
};

routes(app);//路由配置


//在线用户
var onlineUsers = {};
//当前在线人数
var onlineCount = 0;


var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

//socketio.listen(server).on('connection', function (socket) {
//    console.log('client connection: ', socket);
//
//    socket.on('message', function (msg) {
//        console.log('Message Received: ', msg);
//        socket.broadcast.emit('message', msg);
//    });
//});


socketio.listen(server).on('connection', function (socket) {
    console.log('a user connected');

    //监听新用户加入
    socket.on('login', function(obj){
        //将新加入用户的唯一标识当作socket的名称，后面退出的时候会用到
        socket.name = obj.userid;

        //检查在线列表，如果不在里面就加入
        if(!onlineUsers.hasOwnProperty(obj.userid)) {
            onlineUsers[obj.userid] = obj.username;
            //在线人数+1
            onlineCount++;
        }

        //向所有客户端广播用户加入
        socket.emit('login', {onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj});
        console.log(obj.username+'加入了聊天室');
    });

    //监听用户退出
    socket.on('disconnect', function(){
        //将退出的用户从在线列表中删除
        if(onlineUsers.hasOwnProperty(socket.name)) {
            //退出用户的信息
            var obj = {userid:socket.name, username:onlineUsers[socket.name]};

            //删除
            delete onlineUsers[socket.name];
            //在线人数-1
            onlineCount--;

            //向所有客户端广播用户退出
            socket.emit('logout', {onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj});
            console.log(obj.username+'退出了聊天室');
        }
    });

    //监听用户发布聊天内容
    socket.on('message', function(msg){
        //向所有客户端广播发布的消息
        console.log('Message Received: ', msg);
//        socket.broadcast.emit('message', msg);
        socket.emit('message', msg);
        console.log(msg.username+'说：'+msg.content);
    });

});
