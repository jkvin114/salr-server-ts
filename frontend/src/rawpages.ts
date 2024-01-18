export const PAGES={
    home:{
        html:"home.html",
        scripts:[
            "lib/jquery-3.6.0.min.js",
            "lib/axios.js",
            "src/skillparser.js",
            "src/localeManager.js",
            "lib/socket.io.min.js",
            "src/homepage.js",
            "src/init.js"
        ]
    },
    test:{
        html:"home.html",
        scripts:[
            "lib/jquery-3.6.0.min.js"
        ],
        modules:[
            "src/init.js"
        ]
    },
    spectate:{
        html:"spectatepage.html",
        scripts:[
            "lib/jquery-3.6.0.min.js",
            "lib/axios.js",
            "src/spectate.js",
            "src/init.js"
        ]
    },
    stat:{
        html:"statpage.html",
        scripts:[
            "lib/jquery-3.6.0.min.js",
            "lib/axios.js",
            "src/localeManager.js",
            "src/stat/stat.js",
            "src/stat/statChartConfig.js",
            "src/stat/analysis.js",
            "src/stat/character.js",
            "src/stat/gamedetail.js",
            "src/stat/util.js",
            "src/skillparser.js",
            "src/init.js"
        ]
    }
    ,find_room:{
        html:"find_room_page.html",
        scripts:[
            "lib/socket.io.min.js",
            "lib/jquery-3.6.0.min.js",
            "lib/axios.js",
            "src/findroom.js",
            "src/init.js"
        ]
    }
    ,board:{
        html:"",
        scripts:[
            "/lib/jquery-3.6.0.min.js",
            "/lib/axios.js",
            "/src/localeManager.js",
            "/src/init.js"
        ]
    },matching:{
        html:"matching.html",
        scripts:[
            "/lib/jquery-3.6.0.min.js",
            "/lib/axios.js",
            "/lib/socket.io.min.js",
            "/src/localeManager.js",
            "/src/client.js",
            "/src/matching.js",
            "/src/gamesetting.js",
            "/src/init.js"
        ]
    },
    admin:{
        html:"admin.html",
        scripts:[
            "/lib/jquery-3.6.0.min.js",
            "/lib/axios.js",
            "/src/admin.js",
            "/src/init.js"
        ]
    },
    rpggame:{
        html:"gamepage.html",
        scripts:[
            "/lib/jquery-3.6.0.min.js",
            "/lib/fabric.min.js",
            "/lib/howler.min.js",
            "/lib/socket.io.min.js",
            "/lib/axios.js",
            "/src/init.js"
        ],
        modules:[
            "src/game/GameMain.js"  
        ]
    },
    marblegame:{
        html:"gamepage_marble.html",
        scripts:[
            "/lib/jquery-3.6.0.min.js",
            "/lib/fabric.min.js",
            "/lib/howler.min.js",
            "/lib/socket.io.min.js",
            "/lib/axios.js",
            "/src/init.js",
        ],
        modules:[
            "/src/marble/marble.js"
        ]
    },
}