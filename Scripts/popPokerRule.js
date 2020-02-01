module.exports = {
    /*
    mainQuantity:主牌张数
    mainKind:主牌种类
    assistantQuantity:副牌
    assistantKind:副牌种类
    kindNumber:几种点数
    isBoon:是否是炸弹
    isSameType:是否同花
    allallLength:牌数
    isSeries:点数是否连续
    */
    DAN:{mainQuantity:1,mainKind:1,assistantQuantity:0,assistantKind:0,kindNumber:1,isBoon:-1,isSameType:true,is50K:false,allLength:1,isSeries:true},//单张
    DUI:{mainQuantity:2,mainKind:1,assistantQuantity:0,assistantKind:0,kindNumber:1,isBoon:-1,isSameType:false,is50K:false,allLength:2,isSeries:true},//对子
    ER_DUI:{mainQuantity:2,mainKind:2,assistantQuantity:0,assistantKind:0,kindNumber:2,isBoon:-1,isSameType:false,is50K:false,allLength:4,isSeries:true},//二连对
    SAN_DUI:{mainQuantity:2,mainKind:3,assistantQuantity:0,assistantKind:0,kindNumber:3,isBoon:-1,isSameType:false,is50K:false,allLength:6,isSeries:true},//三连对
    DUO_DUI:{mainQuantity:2,mainKind:4,assistantQuantity:0,assistantKind:0,kindNumber:-1,isBoon:3,isSameType:false,is50K:false,allLength:-1,isSeries:true},//多连对
    SAN:{mainQuantity:3,mainKind:1,assistantQuantity:0,assistantKind:0,kindNumber:1,isBoon:-1,isSameType:false,is50K:false,allLength:3,isSeries:true},//三张
    SAN_YI: {mainQuantity:3,mainKind:1,assistantQuantity:1,assistantKind:1,kindNumber:2,isBoon:-1,isSameType:false,is50K:false,allLength:4,isSeries:true},//三带一
    SAN_ER: {mainQuantity:3,mainKind:1,assistantQuantity:2,assistantKind:1,kindNumber:2,isBoon:-1,isSameType:false,is50K:false,allLength:5,isSeries:true},//三带二
    FEIJI: {mainQuantity:3,mainKind:2,assistantQuantity:0,assistantKind:0,kindNumber:2,isBoon:-1,isSameType:false,is50K:false,allLength:6,isSeries:true},//飞机
    FEIJI_DAN:{mainQuantity:3,mainKind:2,assistantQuantity:1,assistantKind:2,kindNumber:4,isBoon:-1,isSameType:false,is50K:false,allLength:8,isSeries:true},//飞机带单
    FEIJI_TONGDAN:{mainQuantity:3,mainKind:2,assistantQuantity:2,assistantKind:1,kindNumber:3,isBoon:-1,isSameType:false,is50K:false,allLength:8,isSeries:true},//飞机带同单
    FEIJI_DUI:{mainQuantity:3,mainKind:2,assistantQuantity:2,assistantKind:2,kindNumber:4,isBoon:-1,isSameType:false,is50K:false,allLength:10,isSeries:true},//飞机带对
    //FEIJI_TONGDUI:{mainQuantity:3,mainKind:2,assistantQuantity:3,kindNumber:3,isBoon:-1,isSameType:false},//飞机带同对
    LONG:{mainQuantity:1,mainKind:5,assistantQuantity:0,assistantKind:0,kindNumber:-1,isBoon:-1,isSameType:false,is50K:false,allLength:-1,isSeries:true},//龙
    CHUN_LONG:{mainQuantity:1,mainKind:5,assistantQuantity:0,assistantKind:0,kindNumber:-1,isBoon:4,isSameType:true,is50K:false,allLength:-1,isSeries:true},//纯龙
    TONGTIAN_LONG:{mainQuantity:1,mainKind:12,assistantQuantity:0,assistantKind:0,kindNumber:12,isBoon:5,isSameType:false,is50K:false,allLength:12,isSeries:true},//通天龙
    CHUNTONGTIAN_LONG:{mainQuantity:1,mainKind:12,assistantQuantity:0,assistantKind:0,kindNumber:12,isBoon:6,isSameType:true,is50K:false,allLength:12,isSeries:true},//纯通天龙
    _50K:{mainQuantity:1,mainKind:3,assistantQuantity:0,assistantKind:0,kindNumber:3,isBoon:0,isSameType:false,is50K:true,allLength:3,isSeries:true},//50K
    CHUN_50K:{mainQuantity:1,mainKind:3,assistantQuantity:0,assistantKind:0,kindNumber:3,isBoon:1,isSameType:true,is50K:true,allLength:3,isSeries:true},//纯50K
    SI:{mainQuantity:4,mainKind:1,assistantQuantity:0,assistantKind:0,kindNumber:1,isBoon:2,isSameType:false,is50K:false,allLength:4,isSeries:true},//炸弹
    SI_DAN:{mainQuantity:4,mainKind:1,assistantQuantity:1,assistantKind:2,kindNumber:3,isBoon:-1,isSameType:false,is50K:false,allLength:6,isSeries:true},//四带两单
    SI_TONGDAN:{mainQuantity:4,mainKind:1,assistantQuantity:2,assistantKind:1,kindNumber:2,isBoon:-1,isSameType:false,is50K:false,allLength:6,isSeries:true},//四带同单
    SI_DUI:{mainQuantity:4,mainKind:1,assistantQuantity:2,assistantKind:2,kindNumber:3,isBoon:-1,isSameType:false,is50K:false,allLength:8,isSeries:true},//四带两对
    //SI_TONGDUI:{mainQuantity:4,assistantQuantity:4,kindNumber:2,isBoon:-1,isSameType:false},//四带同对
};