// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
let engine = require("myMatchvs/MatchvsEngine");
let response = require("myMatchvs/MatchvsResponse");
let userData = require("userData");

cc.Class({
    extends: cc.Component,

    properties: {
        editbox: cc.EditBox,
        userNameLabel: cc.Label,
        setUserNameEditbox: cc.EditBox,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    load50K () {
        engine.prototype.createRoom(userData.name);
    },

    match () {
        engine.prototype.joinRandomRoom(4,userData.name);
    },

    joinRoom () {
        roomID = this.editbox.string;
        engine.prototype.joinRoom(roomID,userData.name);
    },

    start () {
        context = this.node;
        this.userNameLabel.string = '欢迎' + userData.name;
    },

    setUserName () {
        userData.name = this.setUserNameEditbox.string;
        this.userNameLabel.string = '欢迎' + userData.name;
        this.setUserNameEditbox.string = '';
    }
    // update (dt) {},
});
