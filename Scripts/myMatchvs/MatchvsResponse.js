let mvs = require("Matchvs");
let engine = require("MatchvsEngine");
let userData = require("userData");

class MatchvsResponse {
    constructor() {
    }
    /* MatchvsResponse.prototype.setContext = function (Context) {
        this.context = Context;
    } */
    binder() {
        mvs.response.initResponse = this.initResponse.bind(this);
        mvs.response.registerUserResponse = this.registerUserResponse.bind(this);
        mvs.response.loginResponse = this.loginResponse.bind(this);
        mvs.response.joinRoomNotify = this.joinRoomNotify.bind();
        mvs.response.joinRoomResponse = this.joinRoomResponse.bind(this);
        mvs.response.leaveRoomResponse = this.leaveRoomResponse.bind(this);
        mvs.response.leaveRoomNotify = this.leaveRoomNotify.bind(this);
        mvs.response.createRoomResponse = this.createRoomResponse.bind(this);
        mvs.response.sendEventNotify = this.sendEventNotify.bind(this);
        mvs.response.sendEventResponse = this.sendEventResponse.bind(this);
        mvs.response.gameServerNotify = this.gameServerNotify.bind(this);
    }
    initResponse(status) {
        cc.log("init result = " + status);
        engine.prototype.registerUser();
    }
    registerUserResponse(userinfo) {
        cc.log("register result = " + userinfo.status);
        userData.name = userinfo.name;
        userData.id = userinfo.userID;
        engine.prototype.login(userinfo.userID, userinfo.token, "");
    }
    loginResponse(logininfo) {
        cc.log("login result = " + logininfo.status);
        cc.director.loadScene("start");
    }
    joinRoomResponse(status, roomUserInfoList, roomInfo) {
        if(status === 200){
            userData.roomID = roomInfo.roomID;
            userData.roomOwner = roomInfo.owner;
        }
        else if(status === 400){
            cc.log('房间不存在');
        }
        else if(status === 405){
            cc.log('房间已满');
        }
        else if(status === 406){
            cc.log('该房间不允许加入');
        }
    }
    joinRoomNotify(joinuserinfo) {
        let event = new cc.Event.EventCustom("playerjoin", true);
        event.setUserData(joinuserinfo);
        context.dispatchEvent(event);
        cc.log("有新玩家加入 其信息：" + joinuserinfo);
    }
    leaveRoomResponse(rsp) {
        cc.director.loadScene("start");
        cc.log("成功退出房间 " + rsp.roomID);
    }
    leaveRoomNotify(rsp) {
        userData.roomOwner = rsp.owner;
        if(userData.id === userData.roomOwner){
            engine.prototype.sendEventEx(1,'newowner',0,[]);
        }
        cc.log("玩家：" + rsp.userID + "退出房间");
    }
    createRoomResponse(rsp) {
        //cc.director.loadScene("50KRoom");
        cc.log("创建房间成功 房间号：" + rsp.roomID);
        userData.roomID = rsp.roomID;
        userData.roomOwner = rsp.owner;
    }
    sendEventResponse(rsp) {
        cc.log(rsp.sequence + "消息已发送");
    }
    sendEventNotify(eventinfo) {
        cc.log(eventinfo.cpProto);
    }
    gameServerNotify(eventinfo) {
        cc.log("成功触发gameServerNotify");
        cc.log(eventinfo.cpProto);
        if(eventinfo.cpProto.slice(0, 3) === 'pok'){//提取信息修饰符，如果是扑克信息
            ownerPokers.push(JSON.parse(eventinfo.cpProto.slice(3)));
            myPokersNumber++;
            if(myPokersNumber === 13){//当牌积累到十三张时开始生成牌
                ownerPokers.sort((a,b) => {
                    if(a.number > b.number){
                        return 1;
                    }
                    else if(a.number === b.number){
                        if(a.type > b.type){
                            return 1;
                        }
                    }
                    else{
                        return -1;
                    }
                });
                context.dispatchEvent(new cc.Event.EventCustom("getPokers", true));
                if(userData.roomOwner === userData.id){
                    cc.find("Canvas/startGameButton").active = false;//隐藏开始游戏按钮
                }
                else{
                    cc.find("Canvas/prepareButton").active = false;//隐藏准备按钮
                }
            }
        }
        else if(eventinfo.cpProto.slice(0,3) === 'ppo'){//pop poker one 从服务端发送的单张其他人出的扑克
            otherPopPoker.push(JSON.parse(eventinfo.cpProto.slice(3)));
            cc.log('从服务端发送的单张其他人出的扑克');
        }
        else if(eventinfo.cpProto.slice(0,3) === 'lpt'){//loop timer 循环伦次
            let event = new cc.Event.EventCustom('lpt');
            event.setUserData(JSON.parse(eventinfo.cpProto.slice(3)));
            context.dispatchEvent(event);
            cc.log('循环伦次');
        }
        else if(eventinfo.cpProto.slice(0,3) === 'lmp'){//last main poker 上家出的主牌
            let event = new cc.Event.EventCustom('lmp');
            event.setUserData(JSON.parse(eventinfo.cpProto.slice(3)));
            context.dispatchEvent(event);
            cc.log('其他玩家出牌的牌型');
        }
        else if(eventinfo.cpProto.slice(0,3) === 'opt'){//other poker type 其他玩家出牌的牌型
            let event = new cc.Event.EventCustom('opt');
            event.setUserData(eventinfo.cpProto.slice(3));
            context.dispatchEvent(event);
            cc.log('其他玩家出牌的牌型');
        }
        else if(eventinfo.cpProto.slice(0,3) === 'pps'){//pop poker start 服务端开始发送其他玩家出的牌
            otherPopPoker.splice(0,otherPopPoker.length);
            cc.log('服务端开始发送其他玩家出的牌');
        }
        else if(eventinfo.cpProto.slice(0,3) === 'ppe'){//pop poker end 出的牌已经全部收到
            let event = new cc.Event.EventCustom('opp');
            context.dispatchEvent(event);
            cc.log('循环伦次');
        }
        else if(eventinfo.cpProto.slice(0, 3) === 'slt'){//stop last timer UI终止上一轮次的ui
            if(userData.userID !== userData.roomOwner){
                cc.find('Canvas/timerLabel').destroy();
            }
        }
        else if(eventinfo.cpProto.slice(0, 3) === 'opp'){//other pop pokers其他玩家出的牌
            otherPopPoker = JSON.parse(eventinfo.cpProto.slice(3));
            let event = new cc.Event.EventCustom('opp');
            context.dispatchEvent(event);
            cc.log('其他玩家已经出牌');
        }
        else if(eventinfo.cpProto.slice(0,3) === 'ntr'){//new timer新的出牌轮次
            let event = new cc.Event.EventCustom('ntr');
            event.setUserData(JSON.parse(eventinfo.cpProto.slice(3)));
            context.dispatchEvent(event);
            cc.log('新的出牌轮次');
        }
        else if(eventinfo.cpProto.slice(0,3) === 'gts'){
            let event = new cc.Event.EventCustom('gts');
            event.setUserData(eventinfo.cpProto.slice(3));
            context.dispatchEvent(event);
            cc.log('获得倍数');
        }
        else if(eventinfo.cpProto.slice(0,3) === 'ppn'){
            userData.prepareNumber = JSON.parse(eventinfo.cpProto.slice(3)).prepareNumber;
            let event = new cc.Event.EventCustom('ppn');
            event.setUserData(JSON.parse(eventinfo.cpProto.slice(3)));
            context.dispatchEvent(event);
            cc.log('有玩家准备/取消准备');
        }
        else if(eventinfo.cpProto.slice(0,3) === 'dgt'){
            let event = new cc.Event.EventCustom('dgt');
            context.dispatchEvent(event);
            cc.log('开始加倍轮次');
        }
        else if(eventinfo.cpProto.slice(0,3) === 'nsg'){
            let event = new cc.Event.EventCustom('nsg');
            context.dispatchEvent(event);
            cc.log('有人没准备');
        }
        else if(eventinfo.cpProto.slice(0, 3) === 'mjn'){//提取信息修饰符，如果是自己加入房间的信息
            cc.director.loadScene('50KRoom', () => {
                let event = new cc.Event.EventCustom('mjn');
                event.setUserData(new Map(JSON.parse(eventinfo.cpProto.slice(3))));
                context.dispatchEvent(event);
                cc.log('获得所有玩家位置');
            });
        }
        else if(eventinfo.cpProto.slice(0, 3) === 'ojn'){//提取信息修饰符，如果是别人加入房间的信息
            let event = new cc.Event.EventCustom('ojn');
            event.setUserData(JSON.parse(eventinfo.cpProto.slice(3)));
            context.dispatchEvent(event);
            cc.log('获得加入房间玩家位置');
        }
        else if(eventinfo.cpProto.slice(0, 3) === 'oln'){//提取信息修饰符，如果是别人离开房间的信息
            let event = new cc.Event.EventCustom('oln');
            event.setUserData(JSON.parse(eventinfo.cpProto.slice(3)));
            context.dispatchEvent(event);
            cc.log('获得退出玩家位置信息');
        }
        else if(eventinfo.cpProto.slice(0, 3) === 'gpg'){//接收分组后的位置信息
            let event = new cc.Event.EventCustom('mjn');
            event.setUserData(new Map(JSON.parse(eventinfo.cpProto.slice(3))));
            userData.playerMap = event.getUserData();
            context.dispatchEvent(event);
            cc.log('根据分组改变位置');
        }
        else if(eventinfo.cpProto.slice(0, 3) === 'bie'){//接收分组后的位置信息
            let event = new cc.Event.EventCustom('bie');
            context.dispatchEvent(event);
            cc.log('查看末游是否瘪三');
        }
        else if(eventinfo.cpProto.slice(0, 3) === 'gor'){//游戏结束
            let event = new cc.Event.EventCustom('gor');
            event.setUserData(JSON.parse(eventinfo.cpProto.slice(3)));
            context.dispatchEvent(event);
            cc.log('游戏结束，生成计分板，显示准备/开始游戏按钮');
        }
    }
}

module.exports = MatchvsResponse;