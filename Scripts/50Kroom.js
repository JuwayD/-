 let engine = require("myMatchvs/MatchvsEngine");
 let response = require("myMatchvs/MatchvsResponse");
 let userData = require("userData");//用户数据
 let popPokerRule = require("popPokerRule");//牌规

var Poker = cc.Class({
    name: 'Poker',
    extends: cc.Node,
    __ctor__(pokername, type, number, owner, isSelect){
        cc.Node.call(this,pokername);
        this.type = type;
        this.number = number;
        this.owner = owner;
        this.isSelect = isSelect;
    },
});

cc.Class({
    extends: cc.Component,

    properties: {
        playerHead: cc.SpriteFrame,
        playerHeadVoid: cc.SpriteFrame,
        playerHeadL: cc.Sprite,//玩家头像
        playerHeadR: cc.Sprite,
        playerHeadT: cc.Sprite,
        playerLLayout: cc.Layout,//用来存放玩家扑克的容器
        playerRLayout: cc.Layout,
        playerTLayout: cc.Layout,
        playerLNameLabel: cc.Label,//显示玩家昵称
        playerRNameLabel: cc.Label,
        playerTNameLabel: cc.Label,
        playerTIsPrepareLabel: cc.Label,//玩家是否准备标签
        playerLIsPrepareLabel: cc.Label,
        playerRIsPrepareLabel: cc.Label,
        playerTGradeLabel: cc.Label,//玩家积分标签
        playerLGradeLabel: cc.Label,
        playerRGradeLabel: cc.Label,
        playerTGroupLabel: cc.Label,//玩家分组标签
        playerLGroupLabel: cc.Label,
        playerRGroupLabel: cc.Label,
        myGroupLabel: cc.Label,
        myGradeLabel: cc.Label,
        startGameButton: cc.Prefab,
        prepareButton: cc.Prefab,
        message: cc.Prefab,//无法开始游戏的弹出label
        myLayout: cc.Layout,//存放自己扑克的容器
        lastPokerLayout: cc.Layout,//存放上一次出的牌的容器
        pokerBack: cc.Prefab,//扑克背面
        myNameLabel: cc.Label,//用户自己的Laebl
        roomIDLabel: cc.Label,//显示所在房间房间号的label
        declareButton: cc.Prefab,//叫牌按钮
        showButton: cc.Prefab,//明牌按钮
        timerLabel: cc.Prefab,//计时器label
        undeclareButton: cc.Prefab,//不加倍
        popPokerButton: cc.Prefab,//出牌按钮
        hintButton: cc.Prefab,//提示按钮
        nextButton: cc.Prefab,//不要按钮
        timesLabel: cc.Label,//倍数label
        scoringBoard: cc.Prefab,//计分板
        
        popPokers: {//用于保存要出的牌（需要上传到云端）
            default: [],
            visible: false,
        },
        lastMain: {//存储上一家主牌，用于比较牌大小
            default: [],
            visible: false,
        },
        myPopPokersAndType: {//用于表示出牌的牌型及出的牌
            default: [],//保存各个点数的牌,及其数量{number:0,quantity:0}
            isSeries: true,//主牌是否连续，初始值为连续，出现不连续即为false
            isSameType: true,//是否同花
            allLength: 0,//表示此次出牌总数
            isBoon: -1,//是否是炸弹
            hasRed5: false,//是否带红桃五
            has3: 0,//带几张3
            visible: false,
        },
        main: {//用于区分连带牌型中的主牌(如三个三带两个四，点数三即为主牌)
            default: [],
            quantity: 0,
        },
        assistant: {//副牌
            default: [],
            quantity: 0,
        },
        otherPokerType:{
            default: '',
            visible: false,
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        context = this.node;
        let self = this;
        this.pokerType = {};//记录本次出牌牌型
        this.isMoved = false;//记录是否触发过touchmove，在触发touchend后回到false
        this.lastEventPoker = null;//记录复选取时上次触发事件的扑克，游戏重新开始后归null
        if(userData.roomOwner === userData.id){//如果该玩家是房主则显示开始游戏按钮
            this.createStartGameButton();
        }
        else{
            this.createPrepareButton();
        }
        response.prototype.binder();
        let scoringBoard = cc.instantiate(this.scoringBoard);
        scoringBoard.parent = this.node;
        scoringBoard.active = false;
        this.myLayout.node.on('touchmove',(event) => {
            this.isMoved = true;
            let pokers = event.getCurrentTarget().children;
            //let pos = event.getCurrentTarget().convertToNodeSpaceAR(event.getLocation());
            for (let i = 0;i<pokers.length;i++) {
                if(i<pokers.length-1){
                    let a = pokers[i].getBoundingBoxToWorld();
                    let b = pokers[i+1].getBoundingBoxToWorld();
                    if(a.contains(event.getLocation()) && !b.contains(event.getLocation()) && this.lastEventPoker !== pokers[i]){
                        this.lastEventPoker = pokers[i];
                        if(pokers[i].isSelect){
                            this.popPokers.splice(this.popPokersGetIndex({type:pokers[i].type, number:pokers[i].number},this.popPokers),1);//找出点击元素的索引并删除
                            pokers[i].y -=20;
                            pokers[i].isSelect = false;
                        }
                        else{
                            this.popPokers.push({type:pokers[i].type, number:pokers[i].number});//将选取的元素添加到数组中，只添加花色与点数方便传输
                            pokers[i].y +=20;
                            pokers[i].isSelect = true;
                        }
                        return;
                    }
                }
                else{
                    let a = pokers[i].getBoundingBoxToWorld();
                    if(a.contains(event.getLocation()) && this.lastEventPoker !== pokers[i]){
                        this.lastEventPoker = pokers[i];
                        if(pokers[i].isSelect){
                            this.popPokers.splice(this.popPokersGetIndex({type:pokers[i].type, number:pokers[i].number},this.popPokers),1);//找出点击元素的索引并删除
                            pokers[i].y -=20;
                            pokers[i].isSelect = false;
                        }
                        else{
                            this.popPokers.push({type:pokers[i].type, number:pokers[i].number});//将选取的元素添加到数组中，只添加花色与点数方便传输
                            pokers[i].y +=20;
                            pokers[i].isSelect = true;
                        }
                        return;
                    }
                }
            }
        },this);
        this.node.on('bie',(event) => {
            if(this.myLayout.node.children.length !== 0){
                let bie3number = 0;
                for (const e of this.myLayout.node.children) {
                    if(e.number === 1){
                        bie3number++;
                    }
                }
                engine.prototype.sendEventEx(1,'bie3' + bie3number,0,[]);
            }
        });
        this.node.on('ppn', (event) => {
            let data = event.getUserData();
            let posD = userData.position - data.pos;
            if(data.p_np){
                if(posD === -2 || posD === 2){//对家玩家
                    this.playerTIsPrepareLabel.string = '已准备';
                }
                else if(posD === 1 || posD === -3){//左边玩家
                    this.playerLIsPrepareLabel.string = '已准备';
                }
                else if(posD === 3 || posD === -1){//右边玩家
                    this.playerRIsPrepareLabel.string = '已准备';
                }
            }
            else{
                if(posD === -2 || posD === 2){//对家玩家
                    this.playerTIsPrepareLabel.string = '未准备';
                }
                else if(posD === 1 || posD === -3){//左边玩家
                    this.playerLIsPrepareLabel.string = '未准备';
                }
                else if(posD === 3 || posD === -1){//右边玩家
                    this.playerRIsPrepareLabel.string = '未准备';
                }
            }
        });
        this.node.on('gor', (event) => {
            let scoringBoardData = event.getUserData();
            //生成计分板，显示开始游戏/准备按钮，清空场上的牌，玩家剩余手牌，重置各个计数器
            //重置手牌
            this.myLayout.node.children.splice(0,this.myLayout.node.children.length);
            this.playerLLayout.node.children.splice(0,this.playerLLayout.node.children.length);
            this.playerRLayout.node.children.splice(0,this.playerRLayout.node.children.length);
            this.playerTLayout.node.children.splice(0,this.playerTLayout.node.children.length);
            //重置倍数,准备状态
            this.timesLabel.string = '当前倍数为:1';
            this.playerTIsPrepareLabel.string = '未准备';
            this.playerRIsPrepareLabel.string = '未准备';
            this.playerLIsPrepareLabel.string = '未准备';
            this.playerTGroupLabel.string = 'TA的分组:-';
            this.playerRGroupLabel.string = 'TA的分组:-';
            this.playerLGroupLabel.string = 'TA的分组:-';
            this.myGroupLabel.string = '我的分组:-';
            //重置出牌相关计数器
            this.lastPokerLayout.node.children.splice(0,this.lastPokerLayout.node.children.length);
            this.popPokers.splice(0,this.popPokers.length);
            this.lastMain.splice(0,this.lastMain.length);
            this.otherPokerType = '';
            this.initPopPoker();
            //显示计分板，各个按钮
            let scoringBoard = this.node.getChildByName('scoringBoard');
            scoringBoard.getChildByName('关闭').on('click',(button) => {
                scoringBoard.active = false;
            },this);
            //重置上局玩家数据
            userData.isPrepare = false;
            userData.group = 1;
            userData.prepareNumber = 0;
            userData.times = 1;
            //本地扑克清空
            myPokersNumber = 0;
            ownerPokers.splice(0,ownerPokers.length);
            //重置复选取的lastEventPoker
            this.lastEventPoker = null;
            for(let i = 1;i<=4;i++){
                scoringBoard.getChildByName('计分表').getChildByName('玩家' + i).getChildByName('昵称').getComponent(cc.Label).string = scoringBoardData[i-1].name;
                scoringBoard.getChildByName('计分表').getChildByName('玩家' + i).getChildByName('昵称').getChildByName('叫_明').getComponent(cc.Label).string = scoringBoardData[i-1].d_s;
                scoringBoard.getChildByName('计分表').getChildByName('玩家' + i).getChildByName('昵称').getChildByName('几游').getComponent(cc.Label).string = scoringBoardData[i-1].finsh;
                scoringBoard.getChildByName('计分表').getChildByName('玩家' + i).getChildByName('原始分').getComponent(cc.Label).string = scoringBoardData[i-1].originalGrade;
                scoringBoard.getChildByName('计分表').getChildByName('玩家' + i).getChildByName('倍数分').getComponent(cc.Label).string = scoringBoardData[i-1].timesGrade;
                scoringBoard.getChildByName('计分表').getChildByName('玩家' + i).getChildByName('头末游').getComponent(cc.Label).string = scoringBoardData[i-1].first_end;
                scoringBoard.getChildByName('计分表').getChildByName('玩家' + i).getChildByName('红桃5').getComponent(cc.Label).string = scoringBoardData[i-1].red5Grade;
                scoringBoard.getChildByName('计分表').getChildByName('玩家' + i).getChildByName('双逮').getComponent(cc.Label).string = scoringBoardData[i-1].laminateGrade;
                scoringBoard.getChildByName('计分表').getChildByName('玩家' + i).getChildByName('拖瘪').getComponent(cc.Label).string = scoringBoardData[i-1].tuo_bie;
                scoringBoard.getChildByName('计分表').getChildByName('玩家' + i).getChildByName('结算后').getComponent(cc.Label).string = scoringBoardData[i-1].surplus;
                let posD = userData.position - scoringBoardData[i-1].pos;
                if(posD === -2 || posD === 2){//对家玩家
                    this.playerTGradeLabel.string = scoringBoardData[i-1].surplus;
                }
                else if(posD === 1 || posD === -3){//左边玩家
                    this.playerLGradeLabel.string = scoringBoardData[i-1].surplus;
                }
                else if(posD === 3 || posD === -1){//右边玩家
                    this.playerRGradeLabel.string = scoringBoardData[i-1].surplus;
                }
                else if(posD === 0){
                    this.myGradeLabel.string = scoringBoardData[i-1].surplus;
                }
            }
            scoringBoard.active = true;
            if(userData.id === userData.roomOwner){
                this.createStartGameButton();
            }
            else{
                this.createPrepareButton();
            }
        },this);
        this.node.on('gts', (event) => {//get times
            userData.times = event.getUserData();
            this.timesLabel.string = '当前倍数:' + userData.times;
        },this);
        this.node.on('dgt', (event) => {//加倍轮次：所有玩家同时选择是否加倍：服务器统计是否所有玩家都完成操作，完成则进入循环伦次
            this.createDGTUI();
            this.createMyTimerLabel();
        });
        this.node.on('lpt', (event) => {//loop turn:循环伦次，下一个玩家
            if(event.getUserData() === userData.id){
                this.createLPTUI();
            }
            else{
                this.createOtherTimerLaber(event);
            }
        });
        this.node.on('ntr', (event) => {//new timer:新伦次
            this.otherPokerType = '';
            this.lastPokerLayout.node.children.splice(0,this.lastPokerLayout.node.children.length);
            this.lastMain.splice(0,this.lastMain.length);
            if(event.getUserData() === userData.id){
                this.createPopPokerButton();
                this.createMyTimerLabel();
            }
            else{
                this.createOtherTimerLaber(event);
            }
        });
        this.node.on('opt',(event) => {
            this.otherPokerType = event.getUserData();
        });
        this.node.on('lmp',(event) => {
            this.lastMain = event.getUserData();
            cc.log('成功获取上一家主牌');
        });
        this.node.on('opp',(event) => {
            this.lastPokerLayout.node.children.splice(0,this.lastPokerLayout.node.children.length);//加载其他人出牌时先清空上次的牌
            let posD =  userData.position - userData.playerMap.get(otherPopPoker[0].owner).position;
            let i = 0;
            let nextload = (err ,pokerSpriteFrame) => {
                cc.log(otherPopPoker[i].type + ' ' + otherPopPoker[i].number);
                let popPoker = new Poker('' + otherPopPoker[i].type + '' + otherPopPoker[i].number, 
                otherPopPoker[i].type, otherPopPoker[i].number, otherPopPoker[i].owner, false);
                let pokerSprite = popPoker.addComponent(cc.Sprite);
                pokerSprite.spriteFrame = pokerSpriteFrame;
                popPoker.parent = self.lastPokerLayout.node;
                popPoker.scale = 0.6;
                if(posD === -2 || posD === 2){//对家玩家出的牌,将对家手牌弹出一张，下面同理
                    this.playerTLayout.node.children.pop();
                }
                else if(posD === 1 || posD === -3){//左边玩家出的牌
                    this.playerLLayout.node.children.pop();
                }
                else if(posD === 3 || posD === -1){//右边玩家出的牌
                    this.playerRLayout.node.children.pop();
                }
                if(i < otherPopPoker.length - 1){
                    i++;
                    cc.loader.loadRes("Image/Poker/" + (otherPopPoker[i].type + (otherPopPoker[i].number - 1) * 4), cc.SpriteFrame,nextload);0
                }
            };
            cc.loader.loadRes("Image/Poker/" + (otherPopPoker[i].type + (otherPopPoker[i].number - 1) * 4), cc.SpriteFrame,nextload);
        },this);
        this.node.on('mjn', (event) => {//处理获得的位置 在本地生成ui
            this.roomIDLabel.string = userData.roomID;
            this.myNameLabel.string = userData.name;
            let playerDataMap = event.getUserData();
            this.myGroupLabel.string = '我的分组' + playerDataMap.get(userData.id).group;
            userData.playerNumber = playerDataMap.size;
            userData.position = playerDataMap.get(userData.id).position;
            let iterator = playerDataMap.entries();
            for(let i = 0;i < playerDataMap.size;i++){
                let value = iterator.next().value;
                if(value[0] !== userData.id){//如果不是玩家自己，则生成相应ui(头像及昵称)
                    if(userData.position - value[1].position === 1 || userData.position - value[1].position === -3) {
                        this.playerHeadL.spriteFrame = this.playerHead;
                        this.playerLNameLabel.string = value[1].name;
                        this.playerLIsPrepareLabel.string = value[1].isPrepare?'已准备':'未准备';
                        this.playerLGroupLabel.string = 'TA的分组:' + value[1].group;
                    }
                    else if(userData.position - value[1].position === 2 || userData.position - value[1].position === -2){
                        this.playerHeadT.spriteFrame = this.playerHead;
                        this.playerTNameLabel.string = value[1].name;
                        this.playerTIsPrepareLabel.string = value[1].isPrepare?'已准备':'未准备';
                        this.playerTGroupLabel.string = 'TA的分组:' + value[1].group;
                    }
                    else if(userData.position - value[1].position === -1 || userData.position - value[1].position === 3){
                        this.playerHeadR.spriteFrame = this.playerHead;
                        this.playerRNameLabel.string = value[1].name;
                        this.playerRIsPrepareLabel.string = value[1].isPrepare?'已准备':'未准备';
                        this.playerRGroupLabel.string = 'TA的分组:' + value[1].group;
                    }
                    else if(userData.position - value[1].position === 0){
                        userData.group = value[1].group;
                        this.myGroupLabel.string = '我的分组:' + value[1].group;
                    }
                }
            }
            if(ownerPokers.length === 13){
                engine.prototype.sendEventEx(1,'group',0,[]);//发送已经分组完成的消息
            }
        });
        this.node.on('ojn', (event) => {//处理新加入玩家位置信息，生成对应ui
            userData.playerNumber++;
            let newPlayerData = event.getUserData();
            if(userData.position - newPlayerData.position === 1 || userData.position - newPlayerData.position === -3) {
                this.playerHeadL.spriteFrame = this.playerHead;
                this.playerLNameLabel.string = newPlayerData.name;
            }
            else if(userData.position - newPlayerData.position === 2 || userData.position - newPlayerData.position === -2){
                this.playerHeadT.spriteFrame = this.playerHead;
                this.playerTNameLabel.string = newPlayerData.name;
            }
            else if(userData.position - newPlayerData.position === -1 || userData.position - newPlayerData.position === 3){
                this.playerHeadR.spriteFrame = this.playerHead;
                this.playerRNameLabel.string = newPlayerData.name;
            }
        });
        this.node.on('oln', (event) => {//处理退出玩家的位置信息，改变对应ui
            userData.playerNumber--;
            let newPlayerData = event.getUserData();
            if(userData.position - newPlayerData.position === 1 || userData.position - newPlayerData.position === -3) {
                this.playerHeadL.spriteFrame = this.playerHeadVoid;
                this.playerLNameLabel.string = '';
            }
            else if(userData.position - newPlayerData.position === 2 || userData.position - newPlayerData.position === -2){
                this.playerHeadT.spriteFrame = this.playerHeadVoid;
                this.playerTNameLabel.string = '';
            }
            else if(userData.position - newPlayerData.position === -1 || userData.position - newPlayerData.position === 3){
                this.playerHeadR.spriteFrame = this.playerHeadVoid;
                this.playerRNameLabel.string = '';
            }
        });
        this.node.on('nsg', (event) => {
            let message = cc.instantiate(this.message);
            message.getComponent(cc.Label).string = '有人未准备';
            message.parent = context;
            message.position = cc.v2(0,50);
        },this);
        this.node.on("getPokers", (event) => {//服务端发牌
            if(userData.roomOwner !== userData.id){
                cc.find('Canvas/prepareButton').getChildByName('Background').getChildByName('Label').getComponent(cc.Label).string = '准备';
            }
            this.lastPokerLayout.node.children.splice(0,this.lastPokerLayout.node.children.length);
            let i = 0;
            let loadMyPokers = cc.callFunc(target => {
                cc.log('i = ' + i);
                cc.log("Image/Poker/" + (ownerPokers[i].type + (ownerPokers[i].number - 1) * 4));
                cc.loader.loadRes("Image/Poker/" + (ownerPokers[i].type + (ownerPokers[i].number - 1) * 4), cc.SpriteFrame,(err ,pokerSpriteFrame) => {
                    cc.log(ownerPokers[i].type + ' ' + ownerPokers[i].number);
                    cc.log('i = ' + i);
                    let poker = new Poker('' + ownerPokers[i].type + ' ' + ownerPokers[i].number, ownerPokers[i].type
                    , ownerPokers[i].number, ownerPokers[i].owner, false);
                    let pokerSprite = poker.addComponent(cc.Sprite);
                    pokerSprite.spriteFrame = pokerSpriteFrame;
                    poker.parent = self.myLayout.node;
                    poker.on('touchend', this.poker_touchend,self);
                    poker.on('touchstart',(event)=>{this.isMoved = false;},this);//清除移动方便
                    if(i === 12){
                        engine.prototype.sendEventEx(1,'grouping',0,[]);
                    }
                    if(i++ < 12) {//如果执行次数小于13（扑克没有发完）,递归下一次加载
                        self.node.runAction(seq);
                    }
                });
                let pokerL = cc.instantiate(self.pokerBack);
                pokerL.parent = self.playerLLayout.node;
                let pokerR = cc.instantiate(self.pokerBack);
                pokerR.parent = self.playerRLayout.node;
                let pokerT = cc.instantiate(self.pokerBack);

                pokerT.parent = self.playerTLayout.node;
                cc.log('i = ' + i);
            }, this);
            let seq = cc.sequence(cc.delayTime(0.4),loadMyPokers);//延时保证小明牌时的可读性，更加模拟真实摸牌情况
            self.node.runAction(seq);
        });
    },

    start () {
    },

    onDestroy() {
        myPokersNumber = 0;
        ownerPokers.splice(0,ownerPokers.length);
        engine.prototype.leaveRoom("一群小菜鸡,我玩个球");
    },

    startGame () {
        //engine.prototype.sendEvent("老子发送你麻痹的消息");
        if(userData.playerNumber !== 4) {//人数不够则跳出label提示
            let message = cc.instantiate(this.message);
            message.getComponent(cc.Label).string = '房间人数不够四人';
            message.parent = context;
            message.position = cc.v2(0,50);
        }
        else if(userData.prepareNumber !== 4){
            let message = cc.instantiate(this.message);
            message.getComponent(cc.Label).string = '有人未准备';
            message.parent = context;
            message.position = cc.v2(0,50);
        }
        else{
            engine.prototype.sendEventEx(1,'startgame',0,[]);//向服务端发送信息开始游戏
        }
    },

    quitRoom () {
        engine.prototype.leaveRoom("我去买几个橘子，你们呆在这不要动。");
        userData.playerNumber = 0;
        myPokersNumber = 0;
        ownerPokers.splice(0,ownerPokers.length);
    },

    poker_touchend (event) {
        let poker =event.getCurrentTarget();
        if(this.isMoved === true){
            this.isMoved = false;
            return;
        }
        if(poker.getBoundingBoxToWorld().contains(event.getLocation())){
            if(poker.isSelect){
                this.popPokers.splice(this.popPokersGetIndex({type:poker.type, number:poker.number},this.popPokers),1);//找出点击元素的索引并删除
                poker.y -=20;
                poker.isSelect = false;
            }
            else{
                this.popPokers.push({type:poker.type, number:poker.number});//将选取的元素添加到数组中，只添加花色与点数方便传输
                poker.y +=20;
                poker.isSelect = true;
            }
        }
        cc.log('点击扑克的名称:' + poker.name);
    },

    popPokersGetIndex(e,arr) {
        let i = 0;
        for (const element of arr) {
            if(e.type === element.type && e.number === element.number){
                return i;
            }
            i++;
        }
        return -1;
    },

    createDGTUI () {
        let existDB = cc.find('Canvas/declareButton');
        if(existDB === null || existDB === undefined){
            let declareButton = cc.instantiate(this.declareButton);
            declareButton.parent = context;
            declareButton.x = -120;
            declareButton.y = -140;
            declareButton.on('click',(button) => {//叫牌,翻倍
                engine.prototype.sendEventEx(1,'declare',0,[]);
                cc.find('Canvas/declareButton').active = false;
                cc.find('Canvas/showButton').active = false;
                cc.find('Canvas/undeclareButton').active = false;
            });
        }
        else{
            if(existDB.isValid && existDB.active === false){
                existDB.active = true;
            }
        }
        let existSB = cc.find('Canvas/showButton');
        if(existSB === null || existSB === undefined){
            let showButton = cc.instantiate(this.showButton);
            showButton.parent = context;
            showButton.x = 0;
            showButton.y = -140;
            showButton.on('click',(button) => {
                engine.prototype.sendEventEx(1,'show',0,[]);
                cc.find('Canvas/declareButton').active = false;
                cc.find('Canvas/showButton').active = false;
                cc.find('Canvas/undeclareButton').active = false;
            });
        }
        else{
            if(existSB.isValid && existSB.active === false){
                existSB.active = true;
            }
        }
        let existUB = cc.find('Canvas/undeclareButton');
        if(existUB === null || existSB === undefined){
            let undeclareButton = cc.instantiate(this.undeclareButton);
            undeclareButton.parent = context;
            undeclareButton.x = 120;
            undeclareButton.y = -140;
            undeclareButton.on('click',(button) => {
                engine.prototype.sendEventEx(1,'undeclare',0,[]);
                cc.find('Canvas/declareButton').active = false;
                cc.find('Canvas/showButton').active = false;
                cc.find('Canvas/undeclareButton').active = false;
            });
        }
        else{
            if(existUB.isValid && existUB.active === false){
                existUB.active = true;
            }
        }
    },
    
    createStartGameButton () {
        let existSGB = cc.find('Canvas/startGameButton');
        if(existSGB === null || existSGB === undefined){
            let startGameButton = cc.instantiate(this.startGameButton);
            startGameButton.name = "startGameButton";
            startGameButton.parent = this.node;
            startGameButton.x = 0;
            startGameButton.y = 0;
            startGameButton.on("click",this.startGame,this);
        }
        else{
            if(existSGB.isValid && existSGB.active === false){
                existSGB.active = true;
            }
        }
    },
    
    createPrepareButton () {
        let existPB = cc.find('Canvas/prepareButton');
        if(existPB === null || existPB === undefined){
            let prepareButton = cc.instantiate(this.prepareButton);
            prepareButton.name = 'prepareButton';
            prepareButton.parent = this.node;
            prepareButton.x = 0;
            prepareButton.y = 0;
            prepareButton.on('click', () => {
                if(prepareButton.getChildByName('Background').getChildByName('Label').getComponent(cc.Label).string === '准备'){
                    prepareButton.getChildByName('Background').getChildByName('Label').getComponent(cc.Label).string = '取消准备';
                    userData.isPrepare = true;
                    engine.prototype.sendEventEx(1,'prepare',0,[]);
                }
                else{
                    prepareButton.getChildByName('Background').getChildByName('Label').getComponent(cc.Label).string = '准备';
                    userData.isPrepare = false;
                    engine.prototype.sendEventEx(1,'noprepare',0,[]);
                }
            });
        }
        else{
            if(existPB.isValid && existPB.active === false){
                existPB.active = true;
            }
        }
    },

    createLPTUI () {
        this.createHintButton();
        this.createMyTimerLabel();
        this.createNextButton();
        this.createPopPokerButton();
    },

    initPopPoker () {//出牌前初始化
        this.myPopPokersAndType.hasRed5 = false;
        this.myPopPokersAndType.has3 = 0;
        this.myPopPokersAndType.isSeries = true;
        this.myPopPokersAndType.isBoon = -1;
        this.myPopPokersAndType.allLength = 0;
        this.myPopPokersAndType.isSameType = true;
        this.main.quantity = 0;
        this.assistant.quantity = 0;
        this.main.splice(0,this.main.length);
        this.myPopPokersAndType.splice(0,this.myPopPokersAndType.length);
        this.assistant.splice(0,this.assistant.length);
        this.pokerType.mainQuantity = 0;//主牌数量
        this.pokerType.mainKind = 0;//主牌种类
        this.pokerType.assistantQuantity = 0;//副牌数量
        this.pokerType.assistantKind = 0;//副牌种类
        this.pokerType.kindNumber = 0;//牌种类
        this.pokerType.isSeries = true;//主牌是否连续，初始值为连续，出现不连续即为false
        this.pokerType.isSameType = true;//是否同花
        this.pokerType.allLength = 0;//表示此次出牌总数
        this.pokerType.isBoon = -1;//是否是炸弹
        this.pokerType.is50K = false;//是否是50K
    },

    createPopPokerButton () {
        let existDB = cc.find('Canvas/popPokerButton');
        if(existDB === null || existDB === undefined){
            let popPokerButton = cc.instantiate(this.popPokerButton);
            popPokerButton.parent = context;
            popPokerButton.x = -120;
            popPokerButton.y = -140;
            popPokerButton.on('click',(button) => {//出牌
                this.popPokers.sort((a,b) => {//排序
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
                let lastPokers = this.lastPokerLayout.node.children;
                let lastElement = null;//记录遍历时的上个元素
                this.initPopPoker();
                let token5 = false;//记录有5
                let token10 = false;//记录有10
                let tokenK = false;//极路由K
                for(let element of this.popPokers) {
                    if(element.number === 3 && element.type === 1){//出的牌带红桃5，设置标记量，准备发送
                        this.myPopPokersAndType.hasRed5 = true;
                    }
                    if(element.number === 3){
                        token5 = true;
                    }
                    else if(element.number === 8){
                        token10 = true;
                    }
                    else if(element.number === 11){
                        tokenK = true;
                    }
                    if(token5 && token10 && tokenK && this.popPokers.length === 3){
                        this.pokerType.is50K = true;
                    }
                    if(element.number === 1 && this.lastMain.length === 0 && this.popPokers.length === this.myLayout.node.children.length){//出牌带3统计准备发送
                        this.myPopPokersAndType.has3++;
                    }
                    if(lastElement === null){//lastElement 为null则表示是第一个元素，初始化this.myPopPokersAndType
                        lastElement = element;
                        this.myPopPokersAndType.push({number:element.number,quantity:1});
                        this.myPopPokersAndType.allLength = this.popPokers.length;
                        this.pokerType.allLength = this.popPokers.length;
                    }
                    else{
                        if(lastElement.number !== element.number){
                            if(lastElement.type !== element.type){
                                this.myPopPokersAndType.isSameType = false;
                                this.pokerType.isSameType = false;
                            }
                            this.myPopPokersAndType.push({number:element.number,quantity:1});
                            lastElement = element;
                        }
                        else{
                            this.myPopPokersAndType[this.myPopPokersAndType.length-1].quantity++;
                            this.myPopPokersAndType.isSameType = false;
                            this.pokerType.isSameType = false;
                            lastElement = element;
                        }
                    }
                }
                this.myPopPokersAndType.sort((a,b) => {//对存储牌型的数组按照每个牌的数量进行排序方便检测牌型
                    if(a.quantity < b.quantity){
                        return 1;
                    }
                    else if(a.quantity === b.quantity){
                        if(a.number > b.number){
                            return 1;
                        }
                    }
                    else{
                        return -1;
                    }
                });
                this.pokerType.kindNumber = this.myPopPokersAndType.length;
                for(let element of this.myPopPokersAndType){//给main,assistant赋值
                    if(this.main.length === 0){
                        this.main.push(element.number);
                        this.main.quantity = element.quantity;
                        this.pokerType.mainQuantity = element.quantity;
                        lastElement = element;
                    }
                    else{
                        if(lastElement.quantity === element.quantity){
                            if(element.number - lastElement.number !== 1 || element.number === 13){
                                this.myPopPokersAndType.isSeries = false;
                                this.pokerType.isSeries = false;
                                //主牌不连续无法出牌。50K除外。
                            }
                            this.main.push(element.number);
                            lastElement = element;
                        }
                        else{
                            this.assistant.push(element.number);
                            this.assistant.quantity = element.quantity;
                            this.pokerType.assistantQuantity = element.quantity;
                            lastElement = element;
                        }
                    }
                }
                this.pokerType.mainKind = this.main.length;
                this.pokerType.assistantKind = this.assistant.length;
                let count = 0;
                for(let value in popPokerRule){
                    if(true || this.isObjectValueEqual(popPokerRule[value],this.pokerType,value)){//符合出牌规则发送牌信息给服务端
                        cc.log('牌型符合出牌规则');
                        if(this.pokerType.isBoon > -1 || this.otherPokerType === '' ||
                        (this.otherPokerType === value && this.lastMain.length === this.pokerType.mainKind)){//判断与上家牌型是否一致,除了看牌型字符串还要看主牌数量，因为龙的主牌数量不是固定的
                            if((this.otherPokerType === ''? false : this.boonCompare(
                            popPokerRule[this.otherPokerType], this.pokerType, this.main, this.lastMain)) 
                            || this.arrayCompare(this.main,this.lastMain)){//比较出的牌与上家牌的大小，如果是炸弹则比较炸弹大小
                                engine.prototype.sendEventEx(1,'main' + JSON.stringify(this.main),0,[]);//发送主牌
                                engine.prototype.sendEventEx(1,'pokerType' + value,0,[]);//发送牌型
                                engine.prototype.sendEventEx(1,'hasRed5',0,[]);//是否带红桃五
                                engine.prototype.sendEventEx(1,'tuo3'+this.myPopPokersAndType.has3,0,[]);//拖几张三
                                lastPokers.splice(0,lastPokers.length);//加载自己出的牌的时候先清空上次出的牌0
                                cc.log('您出的牌性是:' + value + ',上一家牌型是:' + this.otherPokerType);
                                for(let element of this.popPokers) {//本地客户端ui
                                    let pop_poker = this.myLayout.node.getChildByName('' + element.type + ' ' + element.number);
                                    cc.log(pop_poker.name);
                                    pop_poker.scale = 0.6;
                                    pop_poker.setParent(this.lastPokerLayout.node);
                                }
                                if(context.getChildByName('me').getChildByName('myLayout').children.length === 0){//本地扑克出完发送牌出完的信息
                                    engine.prototype.sendEventEx(1,'popPokerF' + JSON.stringify(this.popPokers),0,[]);//发送出的牌
                                }
                                else{
                                    engine.prototype.sendEventEx(1,'popPoker ' + JSON.stringify(this.popPokers),0,[]);//发送出的牌
                                }
                                this.popPokers.splice(0,this.popPokers.length);
                                cc.find('Canvas/popPokerButton').active = false;
                                let hb = cc.find('Canvas/hintButton');
                                if(hb !== null && hb !== undefined){
                                    hb.active = false;
                                }
                                let nb = cc.find('Canvas/nextButton');
                                if(nb !== null && nb !== undefined){
                                    nb.active = false;
                                }
                            }
                            else{
                                let message = cc.instantiate(this.message);
                                message.getComponent(cc.Label).string = '您要大过上家';
                                message.parent = context;
                                message.position = cc.v2(0,50);
                            }
                        }
                        else{
                            let message = cc.instantiate(this.message);
                            message.getComponent(cc.Label).string = '您与上家牌型不一致';
                            message.parent = context;
                            message.position = cc.v2(0,50);
                        }
                        break;
                    }
                    else{
                        count++;
                    }
                }
                if(count===22){
                    count = 0;
                    let message = cc.instantiate(this.message);
                    message.getComponent(cc.Label).string = '您出的牌不符合规则';
                    message.parent = context;
                    message.position = cc.v2(0,50);
                }
            });
        }
        else{
            if(existDB.isValid && existDB.active === false){
                existDB.active = true;
            }
        }
    },

    createNextButton () {
        let existUB = cc.find('Canvas/nextButton');
        if(existUB === null || existUB === undefined){
            let nextButton = cc.instantiate(this.nextButton);
            nextButton.parent = context;
            nextButton.x = 120;
            nextButton.y = -140;
            nextButton.on('click',(button) => {
                engine.prototype.sendEventEx(1,'next',0,[]);
                cc.find('Canvas/popPokerButton').active = false;
                cc.find('Canvas/hintButton').active = false;
                cc.find('Canvas/nextButton').active = false;
            });
        }
        else{
            if(existUB.isValid && existUB.active === false){
                existUB.active = true;
            }
        }
    },

    createHintButton () {
        let existSB = cc.find('Canvas/hintButton');
        if(existSB === null || existSB === undefined){
            let hintButton = cc.instantiate(this.hintButton);
            hintButton.parent = context;
            hintButton.x = 0;
            hintButton.y = -140;
            hintButton.on('click',(button) => {
                engine.prototype.sendEventEx(1,'hint',0,[]);
                cc.find('Canvas/popPokerButton').active = false;
                cc.find('Canvas/hintButton').active = false;
                cc.find('Canvas/nextButton').active = false;
            });
        }
        else{
            if(existSB.isValid && existSB.active === false){
                existSB.active = true;
            }
        }
    },
    
    createMyTimerLabel () {
        let timerLabel = cc.instantiate(this.timerLabel);
        timerLabel.name = 'timerLabel';
        timerLabel.parent = context;
        timerLabel.x = 0;
        timerLabel.y = -95;
        this.count = 20;
        timerLabel.getComponent(cc.Label).string = 20;
        this.timerLabelCallback = () => {
            if(this.count === 0){
                timerLabel.getComponent(cc.Label).unschedule(this.timerLabelCallback);
                timerLabel.getComponent(cc.Label).string = this.count;
                let pb = cc.find('Canvas/popPokerButton');
                if(pb !== null && pb !== undefined){
                    pb.active = false;
                    engine.prototype.sendEventEx(1,'next',0,[]);
                }
                let hb = cc.find('Canvas/hintButton');
                if(hb !== null && hb !== undefined){
                    hb.active = false;
                }
                let nb = cc.find('Canvas/nextButton');
                if(nb !== null && nb !== undefined){
                    nb.active = false;
                }
                let db = cc.find('Canvas/declareButton');
                if(db !== null && db !== undefined){
                    db.active = false;
                    engine.prototype.sendEventEx(1,'undeclare',0,[]);
                }
                let sb = cc.find('Canvas/showButton');
                if(sb !== null && sb !== undefined){
                    sb.active = false;
                }
                let ub = cc.find('Canvas/undeclareButton');
                if(ub !== null && ub !== undefined){
                    ub.active = false;
                }
            }
            else{
                timerLabel.getComponent(cc.Label).string = this.count;
                this.count--;
            }
        };
        timerLabel.getComponent(cc.Label).schedule(this.timerLabelCallback,1);
    },

    createOtherTimerLaber (event) {
        let posD = userData.position - userData.playerMap.get(event.getUserData()).position;//当前轮次玩家位置与本地位置差
        if(posD === -2 || posD === 2){//对家玩家轮次
            let timerLabel = cc.instantiate(this.timerLabel);
            timerLabel.parent = context;
            timerLabel.x = 0;
            timerLabel.y = 60;
            this.count = 20;
            timerLabel.getComponent(cc.Label).string = 20;
            this.timerLabelCallback = () => {
                if(this.count === 0){
                    timerLabel.getComponent(cc.Label).unschedule(this.timerLabelCallback);
                    timerLabel.getComponent(cc.Label).string = this.count;
                }
                else{
                    timerLabel.getComponent(cc.Label).string = this.count;
                    this.count--;
                }
            };
            timerLabel.getComponent(cc.Label).schedule(this.timerLabelCallback,1);
        }
        else if(posD === 1 || posD === -3){//左边玩家轮次
            let timerLabel = cc.instantiate(this.timerLabel);
            timerLabel.parent = context;
            timerLabel.x = -254;
            timerLabel.y = -60;
            this.count = 20;
            timerLabel.getComponent(cc.Label).string = 20;
            this.timerLabelCallback = () => {
                if(this.count === 0){
                    timerLabel.getComponent(cc.Label).unschedule(this.timerLabelCallback);
                    timerLabel.getComponent(cc.Label).string = this.count;
                }
                else{
                    timerLabel.getComponent(cc.Label).string = this.count;
                    this.count--;
                }
            };
            timerLabel.getComponent(cc.Label).schedule(this.timerLabelCallback,1);                    
        }
        else if(posD === 3 || posD === -1){//右边玩家轮次
            let timerLabel = cc.instantiate(this.timerLabel);
            timerLabel.parent = context;
            timerLabel.x = 254;
            timerLabel.y = -60;
            this.count = 20;
            timerLabel.getComponent(cc.Label).string = 20;
            this.timerLabelCallback = () => {
                if(this.count === 0){
                    timerLabel.getComponent(cc.Label).unschedule(this.timerLabelCallback);
                    timerLabel.getComponent(cc.Label).string = this.count;
                }
                else{
                    timerLabel.getComponent(cc.Label).string = this.count;
                    this.count--;
                }
            };
            timerLabel.getComponent(cc.Label).schedule(this.timerLabelCallback,1);
        }
    },

    arrayCompare(arr1,arr2) {//比较main数组arr1为本地即将打出牌的main arr2为其他玩家打出
        if(arr2.length === 0){
            return true;
        }
        for(let i = 0;i < arr1.length;i++){
            if(arr1[i] <= arr2[i]){
                return false;
            }
        }
        return true;
    },

    boonCompare(a,b,myMain,lastMain) {//比较炸弹大小,b大于a返回真
        if(b.isBoon === -1){
            return false;
        }
        if(a.isBoon < b.isBoon){//先比较炸弹系数，系数为-1时不是炸弹返回false
            return true;
        }
        else if(a.isBoon === b.isBoon){
            if(lastMain.length < b.mainKind){//比较炸弹主牌数量
                return true;
            }
            else if(lastMain.length === b.mainKind){
                return this.arrayCompare(lastMain, myMain);//比较主牌大小
            }
            return false;
        }
        return false;
    },

    isObjectValueEqual(a, b, s) {//a为popPokerRule,b为比较的对象，s为popPokerRule的属性用于判断特别的几个属性
        // Of course, we can do it use for in 
        // Create arrays of property names
        var aProps = Object.getOwnPropertyNames(a);
        var bProps = Object.getOwnPropertyNames(b);
     
        // If number of properties is different,
        // objects are not equivalent
        if (aProps.length != bProps.length) {
            return false;
        }
        let mk = 0;
        if(s === 'LONG' || s === 'CHUN_LONG' || s === 'DUO_DUI'){
            for (var i = 0; i < aProps.length; i++) {
                var propName = aProps[i];
                if(propName === 'isBoon'){//如果不是isBoon属性就看他一样不一样，是则跳过
                    // If values of same property are not equal,
                    // objects are not equivalent
                    b[propName] = a[propName];
                }
                else if(propName === 'mainKind'){//当牌型为龙，纯龙，多连对时主牌种类只要比规定牌型大于等于即可
                    mk = b[propName];
                    if (a[propName] > b[propName]) {
                        return false;
                    }
                }
                else if(propName === 'allLength'){
                    if (mk !== b[propName] && (s === 'LONG' && s === 'CHUN_LONG')){
                        return false;
                    }
                    else if(2*mk !== b[propName] && (s === 'DUO_DUI')){
                        return false;
                    }
                }
                else if(propName === 'kindNumber'){
                    if(mk !== b[propName]){
                        return false;
                    }
                }
                else{
                    if (a[propName] !== b[propName]) {
                        return false;
                    }
                }
            }
        }
        else{
            for (var i = 0; i < aProps.length; i++) {
                var propName = aProps[i];
                if(propName === 'isBoon'){//如果不是isBoon属性就看他一样不一样，是则跳过
                    // If values of same property are not equal,
                    // objects are not equivalent
                    b[propName] = a[propName];
                }
                else if(propName === 'is50K' && b[propName]){
                    return true;
                }
                else{
                    if (a[propName] !== b[propName]) {
                        return false;
                    }
                }
            }
        }
     
        // If we made it this far, objects
        // are considered equivalent
        return true;
    }
    // update (dt) {},
});
