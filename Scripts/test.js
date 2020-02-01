// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

var ChildSprite = cc.Class({
    name: 'ChildSprite',
    extends:cc.Node,
    __ctor__(name,p){
        cc.Node.call(this,name),
        this.p = p;
    }
});

cc.Class({
    extends: cc.Component,

    properties: {
        sprite: cc.Sprite,
        layout: cc.Layout,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.layout.node.on('touchmove',(event)=>{
            cc.log(event.getLocation());
            for (const e of this.layout.node.children) {
                cc.log(e.getBoundingBoxToWorld());
                if(e.getComponent(cc.Sprite).spriteFrame.getRect().contains(event.getLocation())){
                    cc.log(e.getComponent(cc.Sprite).spriteFrame.getRect());
                }
            }
        },this);
        cc.log(this.sprite.spriteFrame.getRect());
        cc.log(this.sprite.spriteFrame.getBoundingBoxToWorld());
    },

    cs_touchend (event) {
        event.currentTarget.position = cc.v2(20,20);
    },

    start () {

    },

    // update (dt) {},
});
