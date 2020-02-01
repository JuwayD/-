var mvs = require("Matchvs");
//var gameData = require('ExamplesData');
class MatchvsEngine {
    constructor() {
    }
    /**
     * 初始化
     * @param channel 渠道 例如Matchvs
     * @param platform 平台 例如'alpha ,release'
     * @param gameID 游戏ID
     * @param {string} appKey
     */
    init(channel, platform, gameID, appKey) {
        var result = mvs.engine.init(mvs.response, channel, platform, gameID, appKey, 1);
        console.log("初始化result" + result);
        return result;
    }
    /**
     * 独立部署使用的初始化接口
     * @param {string} endPoint
     * @param {number} gameID
     * @param {string} appKey
     */
    premiseInit(endPoint, gameID, appKey) {
        let result = mvs.engine.premiseInit(mvs.response, endPoint, gameID, appKey);
        console.log("独立部署初始化result" + result);
        return result;
    }
    /**
     * 注册
     * @returns {number|*}
     */
    registerUser() {
        var result = mvs.engine.registerUser();
        console.log("注册result" + result);
        return result;
    }
    /**
     * 注册
     * @param userID
     * @param token
     * @returns {DataView|*|number|void}
     */
    login(userID, token) {
        var DeviceID = 'matchvs';
        var result = mvs.engine.login(userID, token, DeviceID);
        console.log("登录result" + result);
        return result;
    }
    /**
     * 随机匹配
     * @param mxaNumer 房间最大人数
     * @returns {number}
     */
    joinRandomRoom(mxaNumer, profile) {
        var result = mvs.engine.joinRandomRoom(mxaNumer, profile);
        console.log("随机匹配result" + result);
        return result;
    }
    joinRoom(roomID, profile) {
        var result = mvs.engine.joinRoom(roomID, profile);
        console.log("加入房间result" + result);
    }
    createRoom(profile) {
        var roominfo = new MsCreateRoomInfo();
        roominfo.roomName = "my room";
        roominfo.maxPlayer = 4;
        roominfo.mode = 0;
        roominfo.canWatch = 2;
        roominfo.visibility = 1;
        roominfo.Property = "Welcome to my room";
        var result = mvs.engine.createRoom(roominfo, profile);
        console.log("随机匹配result" + result);
        return result;
    }
    /**
     * 关闭房间
     * @returns {number}
     */
    joinOver() {
        var result = mvs.engine.joinOver("关闭房间");
        console.log("joinOver result" + result);
        return result;
    }
    /**
     * 发送消息
     * @param msg
     * @returns {*}
     */
    sendEvent(msg) {
        var data = mvs.engine.sendEvent(msg);
        // console.log("发送信息 result"+ data.result);
        return data.result;
    }
    sendEventEx(msgT,msg,destT,dest){
        var data = mvs.engine.sendEventEx(msgT,msg,destT,dest);
        return data.rersult;
    }
    /**
     * 离开房间
     * @returns {*|void|number}
     */
    leaveRoom(profile) {
        // var obj = {name:Glb.name,profile:'主动离开了房间'};
        var result = mvs.engine.leaveRoom(profile);
        // console.log(Glb.name+"主动离开房间result"+result);
        return result;
    }
    logout() {
        var result = mvs.engine.logout('注销');
        return result;
    }
    /**
     * 离开房间
     * @returns {*|void|number}
     */
    unInit() {
        // var obj = {name:Glb.name,profile:'主动离开了房间'};
        var result = mvs.engine.uninit();
        // console.log(Glb.name+"主动离开房间result"+result);
        return result;
    }
}

module.exports = MatchvsEngine;