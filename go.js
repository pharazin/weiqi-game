var CONFIG = {  nick:   '#',
                id:     null};
var DOMBoard = function(size){
    this.size = size;
    var ROWS = COLUMNS = this.size;
    var LM = 40; //LEFT_MARGIN
    var TM = 20; //TEXT_MARGIN
    var LS = 30; //LINE_SEPARATION
    var BS = LS*(this.size-1) + LM*2; //BOARD_SIZE
    this.DOMPositions = [];

    this.divContainer = document.createElement("div");
    this.divContainer.setAttribute('class','board');
    this.$ = $(this.divContainer);
    
    var paper = Raphael(this.divContainer,BS,BS);
    var svgNS = 'http://www.w3.org/2000/svg';
    var xlinkNS = 'http://www.w3.org/1999/xlink';
    var woodPattern = document.createElementNS(svgNS, 'pattern');
    woodPattern.setAttributeNS(null, 'id', 'wood');
    woodPattern.setAttributeNS(null, 'patternUnits', 'userSpaceOnUse');
    woodPattern.setAttributeNS(null, 'patternContentUnits', 'userSpaceOnUse');
    woodPattern.setAttributeNS(null, 'x', '0');
    woodPattern.setAttributeNS(null, 'y', '0');
    woodPattern.setAttributeNS(null, 'width', '256');
    woodPattern.setAttributeNS(null, 'height', '256');
    var woodImage = document.createElementNS(svgNS, 'image');
    woodImage.setAttributeNS(xlinkNS, 'href', 'kaya.png');
    woodImage.setAttributeNS(null, 'x', '0');
    woodImage.setAttributeNS(null, 'y', '0');
    woodImage.setAttributeNS(null, 'width', '256');
    woodImage.setAttributeNS(null, 'height', '256');
    woodPattern.appendChild(woodImage);
    paper.defs.appendChild(woodPattern);
    var rectBoard = paper.rect(0, 0, BS, BS, 5);
    rectBoard.node.setAttributeNS(null, 'fill','url(#wood)');

    for(var i = 0; i < COLUMNS; i++){
        var vPath = "M"+(LM+i*LS)+" "+LM+"L"+(LM+i*LS)+" "+(BS-LM)
        var vLine = paper.path(vPath);
        vLine.node.setAttribute("pointer-events", "none");
    }
    for(var i = 0; i < ROWS; i++){
        var hPath = "M"+LM+" "+(LM+i*LS)+"L"+(BS-LM)+" "+(LM+i*LS);
        var hLine = paper.path(hPath);
        hLine.node.setAttribute("pointer-events", "none");
    }
    //Create row labels along y axis
    for(var i = 0; i < ROWS; i++){
        var vLabel = paper.text(TM, (i*LS)+LM, 19-i);
        vLabel.rotate(-90);
    }
    //Create column labels along x axis
    var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    for(var i = 0; i < COLUMNS; i++){
        paper.text((i*LS)+LM, BS - TM, alphabet[i]);
    }
    for(var i = 0; i < 3; i++){
        for(var j = 0; j < 3; j++){
        var dum = paper.circle(LM+4*LS+5*LS*i,LM+4*LS+5*LS*j, 4);
        dum.node.setAttribute("class","marker");
        dum.node.setAttribute("pointer-events", "none");
        }
    }
    for(var i = 0; i < ROWS; i++){
        for(var j = 0; j < COLUMNS; j++) {
            var node = paper.circle(LM+j*LS,LM+i*LS,12).node;
            node.setAttribute("pointer-events", "all");
            node.indexDOM = (i*ROWS)+j;
            this.DOMPositions.push(node);
        }
    }
    var convertToMove = 
        function(color){
            return function(clickEvent){
                        var index = clickEvent.toElement.indexDOM;
                        return new GoMove(color, index);
                    };
        };
    var validityFilter =
        function(evnt){
            var nodeClass = evnt.currentTarget.className.baseVal;
            if (nodeClass.indexOf('blackStone') !== -1){
                return false;
            }
            else if(nodeClass.indexOf('whiteStone') !== -1){
                return false;
            }
            else if(nodeClass.indexOf('ko') !== -1){
                return false;
            }
            else{
                return true;
            }
        };
    var blackMoves = 
            this.$ 
                .ToDelegateObservable('div.isBlack.blackTurn circle',
                                      'click')
                .Where(validityFilter)
                .Select(convertToMove(0));
    var whiteMoves = 
            this.$ 
                .ToDelegateObservable('div.isWhite.whiteTurn circle',
                                      'click')
                .Where(validityFilter)
                .Select(convertToMove(1));

    this.moves = blackMoves.Merge(whiteMoves);
};

DOMBoard.prototype = {
    isPlayBlack:
        function(isBlack){
            if(isBlack){
                this.$.addClass("isBlack");
            }
            else{
                this.$.removeClass("isBlack");
            }
        },
    isPlayWhite:
        function(isWhite){
            if(isWhite){
                this.$.addClass("isWhite");
            }
            else{
                this.$.removeClass("isWhite");
            }
        },
    makeBlackCanMove:
        function(){
            this.$.removeClass("whiteTurn");
            this.$.addClass("blackTurn");
        },
    makeWhiteCanMove:
        function(){
            this.$.removeClass("blackTurn");
            this.$.addClass("whiteTurn");
        },
    placeBlack:
        function(index){
            var p = this.DOMPositions[index];
            this.addClass("blackStone",p);
        },
    placeWhite:
        function(index){
            var p = this.DOMPositions[index];
            this.addClass("whiteStone", p);
        },
    markKo: 
        function(index){
            var p = this.DOMPositions[index];
            this.addClass('ko', p);
        },
    clearKos:
        function(){
            var _this = this;
            this.$
                .find('.ko')
                .each(function(index,pos){ 
                            _this.removeClass('ko', pos);
                        }
                     );
        },
    removeStone:
        function(index){
            var p = this.DOMPositions[index];
            this.removeClass("whiteStone", p);
            this.removeClass("blackStone", p);
        },
    addClass:
        function(classToAdd,elementDOM){
            var pattern = new RegExp(classToAdd, 'g');
            var classes = elementDOM.getAttribute('class');
            if(!pattern.test(classes)){
                classes = classToAdd + ' ' + classes;
            }
            elementDOM.setAttribute('class', classes);
        },
    removeClass:
        function(classToRemove,elementDOM){
            var pattern = new RegExp('[\w]*' + classToRemove + '[\w]*', 'g');
            var classes = elementDOM.getAttribute('class');
            classes = classes.replace(pattern, '');
            elementDOM.setAttribute('class', classes);
        }
    };

var GoHeaders = function(){
    //Setting up DOM
    this.headerNode = document.createElement("div");
    this.headerNode.setAttribute('class', 'boardHeaders');
    this.name = document.createElement('p');
    this.name.innerHTML = 'No Game';
    this.name.setAttribute('class','gameNameHeader');
    this.blackPlayer = document.createElement('p');
    this.blackPlayer.innerHTML = 'Black Player: None';
    this.blackPlayer.setAttribute('class','blackPlayerHeader');
    this.whitePlayer = document.createElement('p');
    this.whitePlayer.innerHTML = 'White Player: None';
    this.whitePlayer.setAttribute('class','whitePlayerHeader');
    this.headerNode.appendChild(this.name);
    this.headerNode.appendChild(this.blackPlayer);
    this.headerNode.appendChild(this.whitePlayer);
    this.whiteDeadCount = document.createElement('p');
    this.whiteDeadCount.innerHTML = 'White Dead: 0';
    this.whiteDeadCount.setAttribute('class','whiteDeadCount');
    this.blackDeadCount = document.createElement('p');
    this.blackDeadCount.innerHTML = 'Black Dead: 0';
    this.blackDeadCount.setAttribute('class','blackDeadCount');
    this.headerNode.appendChild(this.blackDeadCount);
    this.headerNode.appendChild(this.whiteDeadCount);

    var passButton = document.createElement('p');
    passButton.innerHTML = 'Pass';
    passButton.setAttribute('class', 'passButton');
    this.headerNode.appendChild(passButton);
    //End setting up DOM

    this.nameDisplayer = new Rx.Subject();
    this.blackCountDisplayer = new Rx.Subject();
    this.whiteCountDisplayer = new Rx.Subject();
    var cb = this.blackCountDisplayer
                .DistinctUntilChanged()
                .Subscribe(this.updateBlackDeadCount.bind(this));
    var cw = this.whiteCountDisplayer
                .DistinctUntilChanged()
                .Subscribe(this.updateWhiteDeadCount.bind(this));
    
    var a = this.nameDisplayer
                .Subscribe(this.updateName.bind(this));

    this.pass = 
            $(this.headerNode)
                .ToDelegateObservable('p.passButton',
                                      'click')
                .Select(function(){return 'P';});
    
    var dblClick = 
            $(this.headerNode) 
                .ToDelegateObservable('p.gameNameHeader',
                                      'dblclick')
                .Subscribe(console.log.bind(console));
};
GoHeaders.prototype = {
    updateName: 
        function(name){
            this.name.innerHTML = name;
        },
    updateBlackDeadCount:
        function(count){ 
            this.blackDeadCount.innerHTML = 'Black Dead: ' + count; 
        },

    updateWhiteDeadCount:
        function(count){
            this.whiteDeadCount.innerHTML = 'White Dead: ' + count; 
        }
};

//Facade for the DOMBoard
var GoBoard = function(size){
    var container = document.createElement("div");
    this.board = new DOMBoard(size);
    container.setAttribute('class', 'boardContainer');
    this.headers = new GoHeaders();
    container.appendChild(this.headers.headerNode);
    container.appendChild(this.board.divContainer);
    document.body.appendChild(container);

    this.moves = 
            this.board.moves
                .Merge(this.headers.pass);

    this.stateDisplayer = new Rx.Subject();
    this.controlSetter = new Rx.Subject();
    this.nameDisplayer = new Rx.Subject();
    var setNameAction = this.nameDisplayer
                .Subscribe(this.headers.nameDisplayer.OnNext);
    var showBlackDead = 
            this.stateDisplayer
                .Select(function(d){
                            return d.deadCount[0];
                        })
                .Subscribe(this.headers.blackCountDisplayer.OnNext);
    var showWhiteDead = 
            this.stateDisplayer
                .Select(function(d){
                            return d.deadCount[1];
                        })
                .Subscribe(this.headers.whiteCountDisplayer.OnNext);
    var stateActions = 
            this.stateDisplayer
                .Select(this.handleStatic.bind(this))
                .Merge(Rx.Observable
                      .Return(0)
                      .Concat(this.stateDisplayer)
                      .Zip(this.stateDisplayer,
                           this.handleDynamic.bind(this)));
    var setControlAction = 
            this.controlSetter
                .Select(this.setControl);

    var boardStuff = stateActions
                         .Merge(setControlAction)
                         .MergeObservable()
                         .Subscribe(this.doAction.bind(this));
};
GoBoard.prototype = {
    doAction:   
        function(action){
            switch(action.key){
                case 'CB':
                    this.board.isPlayBlack(action.value);
                    break;    
                case 'CW':
                    this.board.isPlayWhite(action.value);
                    break;
                case "W":
                    this.board.placeWhite(action.value);
                    break;
                case "B":
                    this.board.placeBlack(action.value);
                    break;
                case "R":
                    this.board.removeStone(action.value);
                    break;
                case "T":
                    this.board.clearKos();
                    if(action.value === "B") {
                        this.board.makeBlackCanMove();
                    } else if(action.value === "W") {
                        this.board.makeWhiteCanMove();
                    } else {
                        console.log('invalid color!');
                    }
                    break;
                case 'K':
                    this.board.markKo(action.value);
                    break;
            }
        },
    handleStatic:
        function(state){
            var turnAction = this.turnAction(state.turn);
            var koActions = this.getKos(state.kos);
    
            return turnAction
                        .Concat(koActions);
        
        },
    handleDynamic:
        function(oldState,newState){
            return this.getChanges(oldState.stones, newState.stones);
       },
    setControl:
        function(colorControl){
            var setColorActions = [];
            setColorActions.push({key: 'CB', value: colorControl.black});
            setColorActions.push({key: 'CW', value: colorControl.white});
            return Rx.Observable.FromArray(setColorActions);
        },
    turnAction:
        function(turn){
            var turnActions = [];
            return Rx.Observable.Return({key: 'T',
                    value: turn === 1 ? 'W' : 'B'});
        },
    getChanges:
        function(oldState,newState){
            var pos = 0;
            var changes = [];
            if(!oldState){
                for(var i = 0; i < newState[0].length; i++){
                    if(newState[0][i]) changes.push({key: 'B', value: i});
                    if(newState[1][i]) changes.push({key: 'W', value: i});
                }
            }
            else{
                for(var i = 0; i < oldState[0].length; i++){
                    var oldB = oldState[0][i];
                    var newB = newState[0][i];
                    var oldW = oldState[1][i];
                    var newW = newState[1][i];
                    if(newB - oldB === 1){
                       changes.push({key: 'B',
                                     value: i});
                    }
                    else if(newW - oldW === 1) {
                       changes.push({key: 'W',
                                     value: i});

                    }
                    else if ((newB - oldB === -1) | (newW - oldW === -1)){
                       changes.push({key: 'R',
                                     value: i});
                    }
                }
            }
            
            return Rx.Observable.FromArray(changes);
        },
    getKos:
        function(kos){
            var koActions = [];
            for(var i = 0; i < kos.length; i++){
                koActions.push({key: 'K', value: kos[i]});
            }
            return Rx.Observable.FromArray(koActions);
        }
};



var BoardGameController = function(board){
    this.board = board;
    this.control = new Rx.Subject();
    var gameStates = 
                    this.control
                        .Select(function(d){
                                    return d.gameData.game.stateProvider;
                                })
                        .Switch()
                        .Subscribe(board.stateDisplayer);  

    var boardControl =
                    this.control
                        .Select(function(d){
                                    return d.color;
                                })
                        .Subscribe(board.controlSetter);
    var nameSub =   this.control
                        .Select(function(d){
                                    return d.gameData.name;
                                })
                        .Switch()
                        .Subscribe(board.nameDisplayer);

    this.gameSub = Rx.Observable.Never()
                                .Subscribe(function(){console.log('no game')});
    this.currentAct = new Rx.Subject();
};
BoardGameController.prototype = {
    attachGame:
        function(gameData,isBlackController,isWhiteController){
            var movesDOM = this.board.moves;
            var movesGame = gameData.game.moves;
            this.currentAct.OnNext(0);
            this.currentAct = gameData.isActive;
            this.currentAct.OnNext(1);
            this.gameSub.Dispose();
            this.gameSub = movesDOM.Subscribe(gameData.game.moves.OnNext);
            this.control.OnNext({gameData: gameData,
                                 color: {black: isBlackController,
                                         white: isWhiteController}});
       },

};

var ServerGameController = function(gameData, ws){
    var sendToServer = 
        gameData.game.moves
                .Subscribe(function(move){
                            GoRelay.makeMove(gameData.id,
                                             move);
                            });
    this.movesFromServer = new Rx.Subject();
    var sendToGame = this.movesFromServer
                        .Subscribe(gameData.game.moves.OnNext);
    GoRelay.registerControl(this, gameData.id);
};

var GoRelay = {
        gameIDToController: [],
        registerControl:function(controller, gameID){
                            this.gameIDToController[gameID] = controller;    
                            this.publishGame(gameID);
                        },
        makeMove:
            function(gameID, move){
                ws.send(JSON.stringify( {method:    'POST',
                                         route:     ["Games", gameID, "Moves"],
                                         body:      move 
                                        }));
            },
        publishGame:
            function(gameID){
                ws.send(JSON.stringify( {method:    'POST',
                                         route:     ["Games"],
                                         body:      gameID
                                         }));
            }
    };

var GoGame = function(size){
    var startState = this.create(size);
    this.moves = new Rx.Subject();
    this.stateProvider = new Rx.ReplaySubject(1);
    this.stateProvider.OnNext(startState);
    this.stateProvider.Subscribe(function(item){
                                    return;
                                });
    var stSubsc = this.moves
                    .Scan(startState,
                            this.foldMove.bind(this))
                    .Subscribe(this.stateProvider.OnNext);
};
GoGame.prototype = {
    create: function(size){
                return {moves:  [],
                        stones: [this.getNew(size),this.getNew(size)],
                        turn:   0,
                        dirties:[[],[]],
                        history:{},
                        kos:[],
                        deadCount:[0,0]
                        };
            },
    recordHistory:
                function(state){
                   this.history[state.toString()] = 1; 
                },
    checkHash:  function(state){
                    if (this.history[this.getMD5(state)] === 1){
                        return true;    
                    }
                    else{
                        return false;
                    }
                },
    getMD5: function(state){
                return state.toString();
            },
    getNew: function(size){
                var j = size*size;
                var state = [];
                while(j--){
                    state.push(0);
                }
                return state;
            },
    getNeighbors:
                function(n){
                    var N = 19;
                    var indices = [];
                    //indexAbove
                    if(n > N - 1){
                        indices.push(n - N);
                    }
                    //indexLeft
                    if(n % N !== 0){
                        indices.push(n - 1);
                    }
                    //indexRight
                    if((n + 1) % N !== 0){
                        indices.push(n + 1);
                    }
                    //indexBelow
                    if(n < N*(N - 1)){
                        indices.push(n + N);
                    }
                    return indices;
                },
    getGroup:   
        function(state, index){
            var groupColor = state[0][index] ? 0 : (state[1][index] ? 1 : -1);
            //Should never be -1
            var same = state[groupColor];
            var opp = state[groupColor ^ 1];
            var neighbors = this.getNeighbors[index];
            var group = [index];
            var c = this;
            var gLiberties = [];
            var grab = function(index){
                var neighbors = c.getNeighbors(index);
                while(neighbors.length > 0){
                    var nextNeigh = neighbors.pop();
                    if(same[nextNeigh]){
                        if (group.indexOf(nextNeigh) === -1){
                            group.push(nextNeigh);
                            grab(nextNeigh);
                        } 
                    } else if (!opp[nextNeigh]){ 
                        if(gLiberties.indexOf(nextNeigh) === -1){
                            gLiberties.push(nextNeigh);
                        }
                    }
                }
            };
            grab(index);
            return {stones:     group,
                    color:      groupColor,
                    liberties:  gLiberties};
        },
    foldStones:   function(previousState, deads, move){
                    var state = [previousState[0].slice(0),
                                 previousState[1].slice(0)];
                    state[move.color][move.index] = 1;
                    for(var i = 0; i < deads[0].length; i++){
                        state[0][deads[0][i]] = 0;
                    }
                    for(var i = 0; i < deads[1].length; i++){
                        state[1][deads[1][i]] = 0;
                    }
                    return state;
                },
    foldMove:  function(state, move){
                    var nextMoves = state.moves.concat([move]);
                    var nextStones, nextHistory, nextDirties, nextDeadCount;
                    if(move === 'P'){
                        nextStones = [state.stones[0].slice(0),
                                      state.stones[1].slice(0)];
                        nextHistory = state.history;
                        nextDirties = [state.dirties[0].slice(0),
                                        state.dirties[1].slice(0)];
                        nextDeadCount = [state.deadCount[0],
                                         state.deadCount[1]];
                    }
                    else{

                        var deads = this.getDeads(state.stones, move);
                        nextStones = this.foldStones(state.stones,
                                                     deads,
                                                     move);
                        nextHistory = this.foldHistory(state.history,
                                                       nextStones);
                        nextDirties = this.foldDirty(state.dirties,
                                                     move);
                        nextDeadCount = [state.deadCount[0] + deads[0].length,
                                         state.deadCount[1] + deads[1].length];

                    }
                    var nextTurn = state.turn ? 0 : 1;
                    
                    var nextKos = this.getKos({ moves: nextMoves,
                                                stones:nextStones,
                                                turn:nextTurn,
                                                history:nextHistory,
                                                dirties:nextDirties});
                    var nextTerritories = this.getTerritories(nextStones);
                    return {moves:  nextMoves,
                            stones: nextStones,
                            turn:   nextTurn,
                            history:nextHistory,
                            dirties:nextDirties,
                            kos:    nextKos,
                            deadCount: nextDeadCount
                            };
                },
    foldHistory:function(history,state){
                    history[this.getMD5(state)] = 1;
                    return history; 
                },
    getTerritories:
        function(stones){
            var blacks = stones[0].slice(0);
            var whites = stones[1].slice(0);
            var empties = [];
            for(var i = 0; i < stones[0].length; i++){
                empties.push(!(blacks[i] || whites[i]) ? 1 : 0);
            }


            var sets = [blacks, whites, empties];
            var groups = [];
            var placeToGroup = [];
            var groupCount = 1;
            var pieceCount = sets[0].length; 
            for(var i = 0; i < pieceCount; i++){
                var current = sets[0][i] ? sets[0] :
                              sets[1][i] ? sets[1] :
                                           sets[2];
                var upGroup = (current[i-19]) ? placeToGroup[i - 19 ] : 
                                                     null;
                var leftGroup = (i%19 && current[i-1])
                                    ?  placeToGroup[i - 1]  
                                    :   null;

                if(upGroup && leftGroup){
                    if(upGroup !== leftGroup){
                        //merge the two
                        var upG = groups[upGroup - 1];
                        var leftG = groups[leftGroup - 1];
                        var combG = {indices: upG.indices.concat(leftG.indices),
                                     has: [false, false, false]};
                        groups[leftGroup - 1] = null;
                        for(var j = 0; j< sets.length; j++){
                            if(leftG.has[j] || upG.has[j]) combG.has[j] = true;
                        }
                        groups[upGroup - 1] = combG; 

                        for(var j = 0; j < i; j++){
                            if(placeToGroup[j] === leftGroup){
                                placeToGroup[j] = upGroup;
                            }
                        }
                    }
                    groups[upGroup - 1].indices.push(i);
                    placeToGroup.push(upGroup);
                }
                else if(upGroup){
                    groups[upGroup - 1].indices.push(i);
                    placeToGroup.push(upGroup);
                }
                else if(leftGroup){
                    groups[leftGroup - 1].indices.push(i);
                    placeToGroup.push(leftGroup);
                }
                else{
                    groups.push({indices: [i],
                                 has: [false,false,false]});
                    placeToGroup.push(groupCount);
                    var aGroup = i-19 >= 0 ? groups[placeToGroup[i-19]-1]:null;
                    var lGroup = i % 19 > 0 ? groups[placeToGroup[i-1]-1]:null;
                    var cGroup = groups[placeToGroup[i] - 1];
                    for(var j = 0; j < sets.length; j++){
                        if(aGroup){
                            if(sets[j][i]) aGroup.has[j] = true;
                            if(sets[j][i-19]) cGroup.has[j] = true;
                        }
                        if(lGroup){
                            if(sets[j][i]) lGroup.has[j] = true;
                            if(sets[j][i-1]) cGroup.has[j] = true;
                        }
                    }
                    groupCount++;
                }
            }
            var blackTerr = [];
            var whiteTerr = [];
            for(var i = 0; i < groups.length; i++){
                var g = groups[i];
                if(g && g.has[0] && !g.has[1] && !g.has[2]){
                    blackTerr = blackTerr.concat(g.indices);
                }
                if(g && !g.has[0] && g.has[1] && !g.has[2]){
                    whiteTerr = whiteTerr.concat(g.indices);
                }
            }
            //console.log({black: blackTerr, white: whiteTerr});
    },
    foldDirty:  function(dirties, move){
                    var color = move.color;
                    var index = move.index;
                    var next = [dirties[0].slice(0),
                                dirties[1].slice(0)];
                    if(dirties[color].indexOf(index) === -1){
                        next[color] = dirties[color].concat([index]);
                    }
                    return next;
                },
    getKos:     
        function(state){
            var kos = [];
            var stones = state.stones;
            var getOccupied = 
                function(index, stones){
                    if(stones[0][index] || stones[1][index])
                        return true;
                    else {
                        return false;
                    }
                }

            var checkIndices = [];
            var dirties = state.dirties[state.turn];
            for(var i = 0; i < stones[0].length; i++){
                var isUnoccupied = !getOccupied(i, stones);
                if(isUnoccupied){
                    var isDirty = (dirties.indexOf(i) !== -1);
                    if(isDirty){
                        //Want to check places that used to have stone
                        checkIndices.push(i);
                    }   
                    else{
                        var envir = this.getLocalEnviron(i, stones);
                        if(envir.localEmpty.length === 0){
                            //Want to check for clean but suicidal spaces
                            checkIndices.push(i);
                        };    
                    }    
                }
            }
            //After trimming the universe of possible moves, we test these
            for(var i = 0; i < checkIndices.length; i++){
                var testIndex = checkIndices[i];
                var testMove = new GoMove(state.turn, testIndex);
                var possibleDeads = this.getDeads(state.stones, testMove);
                var possibleState =
                    this.foldStones(state.stones,
                                    possibleDeads,
                                    testMove);
                if(state.history[this.getMD5(possibleState)]){
                    //Would return to previous state, so marking as ko
                    kos.push(testIndex);
                }
            }
            return kos;
    },
    getLocalEnviron:
        function(index, stones){
            var neighbors = this.getNeighbors(index);
            var blackNeighs = [];
            var whiteNeighs = [];
            var emptyNeighs = [];
            for(var i = 0; i < neighbors.length; i++){
                if(stones[0][neighbors[i]]){
                    blackNeighs.push(neighbors[i]);
                }
                else if(stones[1][neighbors[i]]){
                    whiteNeighs.push(neighbors[i]);
                }
                else{
                    emptyNeighs.push(neighbors[i]);
                }
            }
            return {localStones:[blackNeighs, whiteNeighs],
                    localEmpty: emptyNeighs};
        },
    getDeads:   
        function(previousState, move){
            var index = move.index;
            var deads = [[],[]];
            var oppColor = previousState[move.color ^ 1];
            var environ = this.getLocalEnviron(index, previousState);
            var neighbors = this.getNeighbors(index);
            var oppNeighs = environ.localStones[move.color ^ 1];
            var sameNeighs = environ.localStones[move.color];
            for(var i = 0; i < oppNeighs.length; i++){
                var oppNeigh = oppNeighs[i];
                var deadOpp = deads[move.color ^ 1];
                var isAlive = (deadOpp.indexOf(oppNeigh) === -1);
                if(isAlive){
                    var group = this.getGroup(previousState, oppNeigh);
                    if(group.liberties.length === 1){
                        var stones = group.stones;
                        deads[move.color ^ 1] = deadOpp.concat(stones);
                    }
                }
            }

            var shouldCheckSui = (environ.localEmpty.length === 0)
            if(shouldCheckSui && deads[move.color ^ 1].length === 0){
                var suicides = [];
                var hasEscape = false;
                for(var i = 0; i < sameNeighs.length; i++){
                    var sameNeigh = sameNeighs[i];
                    var group = this.getGroup(previousState, sameNeigh);
                    var libN = group.liberties.length;
                    if(libN > 1){
                        hasEscape = true;
                    }
                    else{
                        suicides = suicides.concat(group.stones);
                    }
                }
                if(!hasEscape){
                    deads[move.color] = suicides.concat([move.index]);
                }
            }
            return deads;
        },
    isValid:    function(move){
                    return true;
                }
};


var DOMGameList = function(){
    this.listContainer = document.createElement("div");
    var test = document.createElement('p');
    test.innerHTML = 'New Game';
    test.setAttribute('class','button');
    this.listContainer.setAttribute('class','listContainer');
    this.listContainer.appendChild(test);
    this.$ = $(this.listContainer);
    document.body.appendChild(this.listContainer);


    this.createRequests = this.$ 
                              .ToDelegateObservable('.button',
                                                    'click');
    this.switchRequests = this.$
                              .ToDelegateObservable('.gameListItem',
                                                    'click')
                              .Select(function(d){
                                        var src = d.srcElement;
                                        var id = src.attributes['gameID'].value;
                                        return parseInt(id);
                                        });
    this.games = new Rx.Subject();
    var show = this.games
                    .MergeObservable()
                    .Subscribe(this.interpret.bind(this));
};
DOMGameList.prototype = {
    interpret:  function(gameData){
                    var gameItem = $("[gameID='" + gameData.id + "']");
                    if(!gameItem[0]){
                        this.displayGame(gameData);
                    }
                    else{
                        var isNodeActive = gameItem.hasClass('activeListItem');
                        if(gameData.isActive && !isNodeActive){
                            gameItem.addClass('activeListItem');
                        }
                        else if(!gameData.isActive && isNodeActive){
                            gameItem.removeClass('activeListItem');
                        }
                    }
                },
    displayGame:function(gamedata){
                    var test = document.createElement('p');
                    test.innerHTML = gamedata.name;
                    test.setAttribute('class','gameListItem');
                    test.setAttribute('gameID',gamedata.id);
                    this.listContainer.appendChild(test);
                }
};

var GameListController = 
    function(DOMList, gameList){
        var createReq = DOMList.createRequests;
        var createActions = createReq
                                .Subscribe(gameList.creates.OnNext)


        var display = gameList.newGames
                              .Select(function(d){return d.gameInfo;})
                              .Subscribe(DOMList.games.OnNext);

        this.gameSwitch = DOMList.switchRequests
                                 .Select(function(gameID){
                                            var game = gameList.getById(gameID);
                                            return {gameData: game,
                                                    control: {isBlack: true,
                                                              isWhite: true}};
                                         });
    };

var GameList = function(){
    this.games = [];
    var games = this.games;
    this.creates = new Rx.Subject();
    this.newGames = this.creates
                        .Select(function(){
                                    return new GameData();
                                })
                        .Do(function(g){games.push(g);})
                        .Publish();
    this.newGames.Connect();
    var sCC = this.newGames //creating the server controller
                .Subscribe(function(game){
                                new ServerGameController(game, ws);
                            });
                        
};
GameList.prototype = {
    getById:    function(id){
                    var games = this.games;
                    for(var i = 0; i < games.length; i++){
                        if(games[i].id === id){
                            return games[i];
                        }
                    }
                    console.log('game not found');
                }
};


var GameData = function(){
    this.id = Math.floor(Math.random() * 100000);
    this.game = new GoGame(19);
    var gameInfo = new Rx.ReplaySubject(1);
    gameInfo.OnNext({id: this.id});
    this.name = new Rx.ReplaySubject(1);
    this.name.OnNext('Game ' + this.id);
    this.isActive = new Rx.ReplaySubject(1);
    this.isActive.OnNext(0);
    this.gameInfo = new Rx.ReplaySubject(1);
    var counter = 0;
    var sub = gameInfo
                    .CombineLatest(this.name,
                                function(o, name){
                                    o.name = name;
                                    return o;
                                })
                    .CombineLatest(this.isActive,
                                    function(o,isActive){
                                        o.isActive = isActive;
                                        return o;
                                    })
                    .Subscribe(this.gameInfo.OnNext);
};

var GameData2 = function(){
    this.localID = Math.floor(Math.random() * 100000);
    this.game = new GoGame(19);
    this.name = new Rx.ReplaySubject(1);
    this.name.OnNext('Game ' + this.localID);
};

var ListBoardController = function(){
    var gameList = new GameList();
    var listDOM = new DOMGameList();
    var listController = new GameListController(listDOM, gameList);
    var boardDOM = new GoBoard(19);
    var boardController = new BoardGameController(boardDOM);
    var switchFunction = boardController.attachGame.bind(boardController);
    var gameSwitcher = listController.gameSwitch
                                     .Subscribe(
                                        function(g){
                                            switchFunction(g.gameData,
                                                           g.control.isBlack,
                                                           g.control.isWhite);
                                        });
};

var GoMove = function(color, index){
    this.color = parseInt(color);
    this.index = parseInt(index);
};

$(document).ready(function(){
    new ListBoardController();
});

var initializeMid = function(){
    ws.send(JSON.stringify( {method:    'POST',
                             route:     ["Games", "Subscriptions"],
                             body:      CONFIG.id 
                                        }));
};

