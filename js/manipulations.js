//Modulo para corrigir as posições dos elementos do canvas, os organizando 

var dictBlocosPorNivel = {};
var dictNodesPorNivel = {};
var listBlocks = [];
var countBlocks = 1;
var maxLevel = 0;

function adjustTreeYs(){
    var dist = 0;
    
    //monta os blocos por nivel
    createBlocks();
    listNodesByLevel();

    //Busca o numero maximo de niveis - nao fazer ainda - já definiu o maxLevel

    //Varrer o dicionario
    for(var lvl in dictNodesPorNivel) {
        if(parseInt(lvl) > 0){
            var nodes = dictNodesPorNivel[lvl];

            var listOfIndexes = retTestList(nodes);

            for(var i=0; i< listOfIndexes.length; i++){ ///criar lista de nodes por nivel e usar no for!
                var ind = listOfIndexes[i];
                //Testa os nodes dois a dois
                var nod1 = nodes[ind[0]];
                var nod2 = nodes[ind[1]];
                var upperNode = null; var lowerNode = null;
                if(nod1.y < nod2.y){
                    upperNode = nod1;
                    lowerNode = nod2;
                }else{
                    upperNode = nod2;
                    lowerNode = nod1;
                }
                dist = returnAdjustForBlocks(upperNode, lowerNode);
                
                //sempre que dist for maior que zero, mover o upperNode e todos os nodes seguintes em dist/2 pra cima 
                // os nodes de cima do upperNode devem subir dist/2 e os nodes de baixo devem descer dist/2;
                // Fazer o mesmo para os upperBlocks e os lowerBlocks neste mesmo nivel (lvl) e fazer isso pros blocos 
                // dos niveis seguintes, ligados nos uppernodes de mesmo bloco ou dos blocos diferentes do mesmo nivel
                // e os ligados nos lowernodes de mesmo bloco ou dos blocos diferentes do mesmo nivel
                if(dist > 0){
                    dist = dist + baseDistance;
                    var dictParentsToBeMoved = {};  //chave = id do node pai; value = [objeto Node, distancia a ser adicionada]
                    //Varre os nodes nos blocos
                    var levelNodes = dictNodesPorNivel[lvl];
                    for(var j = 0; j < levelNodes.length; j++){
                        var otherNod = levelNodes[j];
                        if(otherNod.id != upperNode.id && otherNod.id != lowerNode.id){
                            //otherNod eh outro node que nao o upper e lower selecionados
                            if(otherNod.y < upperNode.y){
                                otherNod.y = otherNod.y - parseInt(dist/2);
                                otherNod.recreateGeometry();
                                //Move todos os nodes filhos
                                adjustChildNodesPositions(otherNod, -parseInt(dist/2));
                                //Grava os pais que devem ser movidos
                                if(!(otherNod.parentNode.id in dictParentsToBeMoved)){
                                    dictParentsToBeMoved[otherNod.parentNode.id] = [otherNod.parentNode, -parseInt(dist/2)];
                                }
                            }
                            if(otherNod.y > lowerNode.y){
                                otherNod.y = otherNod.y + parseInt(dist/2);
                                otherNod.recreateGeometry();
                                //Move todos os nodes filhos
                                adjustChildNodesPositions(otherNod, parseInt(dist/2));
                                //Grava os pais que devem ser movidos
                                if(!(otherNod.parentNode.id in dictParentsToBeMoved)){
                                    dictParentsToBeMoved[otherNod.parentNode.id] = [otherNod.parentNode, parseInt(dist/2)];
                                }
                            }
                        }
                    }

                    //movimenta os nodes selecionados
                    upperNode.y = upperNode.y - parseInt(dist/2);
                    upperNode.recreateGeometry();
                    //Move todos os nodes filhos
                    adjustChildNodesPositions(upperNode, -parseInt(dist/2));
                    //Grava os pais que devem ser movidos
                    if(!(upperNode.parentNode.id in dictParentsToBeMoved)){
                        dictParentsToBeMoved[upperNode.parentNode.id] = [upperNode.parentNode, -parseInt(dist/2)];
                    }

                    lowerNode.y = lowerNode.y + parseInt(dist/2);
                    lowerNode.recreateGeometry();
                    //Move todos os nodes filhos
                    adjustChildNodesPositions(lowerNode, parseInt(dist/2));
                    //Grava os pais que devem ser movidos
                    if(!(lowerNode.parentNode.id in dictParentsToBeMoved)){
                        dictParentsToBeMoved[lowerNode.parentNode.id] = [lowerNode.parentNode, parseInt(dist/2)];
                    }

                    adjustParentNodesPositions(dictParentsToBeMoved);
                }
            }
        }
    }
}

//retorna a diferença de ajuste por par de nodes seguidos analisando o bloco 
// do nivel seguinte de cada um dos dois Nodes 
function returnAdjustForBlocks(nod1, nod2){
    if(nod1.childNodes.length == 0 || nod2.childNodes.length == 0)
        return 0;
    else{
        var block1 = new LevelBlock(nod1);
        var block2 = new LevelBlock(nod2);

        var upperBlock = null; var lowerBlock = null;
        //define o bloco de cima e o de baixo
        if(block1.midY < block2.midY){
            upperBlock = block1;
            lowerBlock = block2;
        }else{
            upperBlock = block2;
            lowerBlock = block1;
        }

        //retorna a diferenca
        var diff = 0;
        if(upperBlock.maxY > lowerBlock.minY){
            diff = Math.abs(upperBlock.maxY - lowerBlock.minY);
        }
        
        return diff;
    }
}


function createBlocks(){
    dictBlocosPorNivel = {};
    listBlocks = [];
    countBlocks = 1;
    maxLevel = 0;
    //percorre todos os nodes
    for(var i=0; i < nodeList.length; i++){
        var nod = nodeList[i];
        if(nod.childNodes.length > 0){
            var block = new LevelBlock(nod);
            block.id = countBlocks;
            countBlocks++;
            if(!(block.level in dictBlocosPorNivel)){
                dictBlocosPorNivel[block.level] = [];
                dictBlocosPorNivel[block.level].push(block);
            }
            else{
                dictBlocosPorNivel[block.level].push(block);
            }
            listBlocks.push(block);

            if(block.level > maxLevel)
                maxLevel = block.level;
        }
    }
}

function listNodesByLevel(){
    //percorre todos os nodes
    dictNodesPorNivel = {};
    for(i=0; i < nodeList.length; i++){
        var nod = nodeList[i];
        if(!(nod.level in dictNodesPorNivel)){
            dictNodesPorNivel[nod.level] = [];
            dictNodesPorNivel[nod.level].push(nod);
            console.log(dictNodesPorNivel)   
        }
        else{
            dictNodesPorNivel[nod.level].push(nod);
            console.log(dictNodesPorNivel)
        }
    }
}


function adjustChildNodesPositions(nod, delta){
    console.log(nod.childNodes.length);
    if(nod.childNodes.length > 0){
        //Move os nodes filhos
        for(var i=0; i < nod.childNodes.length; i++){
            //Move os filhos
            var otherNod = nod.childNodes[i];
            otherNod.y = otherNod.y + delta;
            otherNod.recreateGeometry();
            adjustChildNodesPositions(otherNod, delta);
        }
    }
}

//Metodo para mover os Nodes pais. Move também os nodes vizinhos no mesmo level
function adjustParentNodesPositions(dictListNodes){
    //Verifica se tem um node pai pra mover. Se nao tiver, não fazer nada
    if(Object.keys(dictListNodes).length > 0){
        if(Object.keys(dictListNodes).length == 1){
            //Move apenas 1 Node
            //for(var key in dictListNodes){
            //    lvl = dictListNodes[key][0].level;
            //    newList.push(dictListNodes[key]);
            //}
            //var parentNode = newList[0][0];
            //var parentDist = newList[0][1];
            //if(parentNode.id != 0){

            //}
        }else{
            var dictParentsToBeMoved = {};  //chave = id do node pai; value = [objeto Node, distancia a ser adicionada]
            var lvl = 0;
            var newList = []
            for(var key in dictListNodes){
                //devem haver 2 nodes. Mover eles por upper e lowernode. Mover os outros nodes cnforme a funcao inicial
                lvl = dictListNodes[key][0].level;
                newList.push(dictListNodes[key]);
            }

            var upperNode = newList[0][0];
            var upperDist = newList[0][1];
            var lowerNode = newList[1][0];
            var lowerDist = newList[1][1];

            //Varre os nodes nos blocos
            var levelNodes = dictNodesPorNivel[lvl];
            for(var j = 0; j < levelNodes.length; j++){
                var otherNod = levelNodes[j];
                if(otherNod.id != upperNode.id && otherNod.id != lowerNode.id){
                    //otherNod eh outro node que nao o upper e lower selecionados
                    if(otherNod.y < upperNode.y){
                        otherNod.y = otherNod.y + upperDist;
                        otherNod.recreateGeometry();
                        //Grava os pais que devem ser movidos
                        if(!(otherNod.parentNode.id in dictParentsToBeMoved)){
                            dictParentsToBeMoved[otherNod.parentNode.id] = [otherNod.parentNode, upperDist];
                        }
                    }
                    if(otherNod.y > lowerNode.y){
                        otherNod.y = otherNod.y + lowerDist;
                        otherNod.recreateGeometry();
                        //Grava os pais que devem ser movidos
                        if(!(otherNod.parentNode.id in dictParentsToBeMoved)){
                            dictParentsToBeMoved[otherNod.parentNode.id] = [otherNod.parentNode, lowerDist];
                        }
                    }
                }
            }

            //movimenta os nodes selecionados
            upperNode.y = upperNode.y + upperDist;
            upperNode.recreateGeometry();
            //Grava os pais que devem ser movidos
            if(!(upperNode.parentNode.id in dictParentsToBeMoved)){
                dictParentsToBeMoved[upperNode.parentNode.id] = [upperNode.parentNode, upperDist];
            }

            lowerNode.y = lowerNode.y + lowerDist;
            lowerNode.recreateGeometry();
            //Grava os pais que devem ser movidos
            if(!(lowerNode.parentNode.id in dictParentsToBeMoved)){
                dictParentsToBeMoved[lowerNode.parentNode.id] = [lowerNode.parentNode, lowerDist];
            }

            adjustParentNodesPositions(dictParentsToBeMoved);
        }
    }
}

function retTestList(levelNodeList){
    var indexes = [];
    var n = levelNodeList.length;
    for(var i=0; i < n; i++){
        for(var j=i; j < n; j++){
            if(i != j){
                var item = [];
                indexes.push([i,j]);
            }
        }
    }

    return indexes;
}

//=====================================================================
//funcao cvhamada na hora de importar uma arvore
function carregaArvore(){
    var json = {
        "id" : 0,
        "description" : "ROB de Inovações e Operações",
        "kpiValue" : 11.23,
        "kpiUnitOfMeasure" : "%",
        "parentCalculus" : "sum",
        "calculusFactor" : 1,
        "x" : 200,
        "y" : 200,
        "height" : 90,
        "width" : 300,
        "childNodes" : [
            {
                "id" : 1,
                "description" : "Node de ID 1",
                "kpiValue" : 2.5,
                "kpiUnitOfMeasure" : "%",
                "parentCalculus" : "sum",
                "calculusFactor" : 1,
                "x" : 200,
                "y" : 200,
                "height" : 90,
                "width" : 300,
                "childNodes" : [] 
            },
            {
                "id" : 2,
                "description" : "Node de ID 2",
                "kpiValue" : 50.3,
                "kpiUnitOfMeasure" : "%",
                "parentCalculus" : "division",
                "calculusFactor" : 1,
                "x" : 200,
                "y" : 200,
                "height" : 90,
                "width" : 300,
                "childNodes" : [
                    {
                        "id" : 11,
                        "description" : "Node mais interno - ID 11",
                        "kpiValue" : 3333.33,
                        "kpiUnitOfMeasure" : "%",
                        "parentCalculus" : "sum",
                        "calculusFactor" : -2,
                        "x" : 200,
                        "y" : 200,
                        "height" : 90,
                        "width" : 300,
                        "childNodes" : [] 
                    }
                ] 
            },
            {
                "id" : 3,
                "description" : "Node de ID 3",
                "kpiValue" : 589092.9,
                "kpiUnitOfMeasure" : "%",
                "parentCalculus" : "sum",
                "calculusFactor" : 1,
                "x" : 200,
                "y" : 200,
                "height" : 90,
                "width" : 300,
                "childNodes" : [] 
            }
        ] 
    }
    
    //Reseta todos os agrupamentos
    dictNodes = {};
    nodeList = [];
    connectionList = [];
	connectionIdCounter = 0;
	dictConnections = {};
    
    nodeIdCounter = json["id"];
	var node = new NodeField(json["id"]);
	node.createGeometry(json["x"], json["y"], json["width"], json["height"], 0);
    node.description = json["description"];
    node.level = 0;
    console.log(node.description);
	nodeList.push(node);
    dictNodes[node.id] = node;
    node.kpiValue = json["kpiValue"];
    node.kpiUnitOfMeasure = json["kpiUnitOfMeasure"];
    node.parentCalculus = json["parentCalculus"];
    node.calculusFactor = json["calculusFactor"];
    node.x = json["x"];
    node.y = json["y"];
    node.width = json["width"];
    node.height = json["height"];
    selectedNodeIndex = node.id;

    //Reestrutura as node structs
    PrincipalNodesTree = {};  
    PrincipalNodesTree["id"] = node.id;
    PrincipalNodesTree["description"] = node.description;
    PrincipalNodesTree["kpiValue"] = node.kpiValue; 
    PrincipalNodesTree["kpiUnitOfMeasure"] = node.kpiUnitOfMeasure;
    PrincipalNodesTree["parentCalculus"] = node.parentCalculus;
    PrincipalNodesTree["calculusFactor"] = node.calculusFactor;
    PrincipalNodesTree["x"] = node.x;
    PrincipalNodesTree["y"] = node.y;
    PrincipalNodesTree["height"] = node.height;
    PrincipalNodesTree["width"] = node.width;
    PrincipalNodesTree["isChildrenVisible"] = true;
    PrincipalNodesTree["childNodes"] = [];
    
    var children = json["childNodes"];
    criaNodeFilhos(children, node);

    //Seta o node selecionado como o node inicial
    selectedNodeIndex = PrincipalNodesTree["id"];
    SelectedStruct = PrincipalNodesTree;
}

function criaNodeFilhos(childList, parentNod){
    for(var i=0; i < childList.length; i++){
        var otherNodStruct = childList[i];
        addNewChildImportacao(parentNod, otherNodStruct, false);
        var nod = dictNodes[otherNodStruct["id"]];
        //console.log(otherNodStruct["description"]);
        selectedNodeIndex = nod.id;
        criaNodeFilhos(otherNodStruct["childNodes"], nod);
    }
}

function addNewChildImportacao(parentNode, nodeStruct, isAditionFromCollapse){
	//Cria o novo nodefield
	var nod = new NodeField(nodeStruct["id"]);
    if(nodeIdCounter <= nodeStruct["id"])
        nodeIdCounter = nodeStruct["id"] + 1;
	nod.parentNode = parentNode;
	nod.parentNodeID = parentNode.id;
    nod.description = nodeStruct["description"];
    nod.kpiValue = nodeStruct["kpiValue"];
    nod.kpiUnitOfMeasure = nodeStruct["kpiUnitOfMeasure"];
    nod.parentCalculus = nodeStruct["parentCalculus"];
    nod.calculusFactor = nodeStruct["calculusFactor"];
	nod.level = parentNode.level + 1;
	nod.createGeometry(parentNode.x + parentNode.width + baseDistance, parentNode.y, baseWidth, baseHeight, 0);
    nodeList.push(nod);
    
    //Salva na estrutura
    if(isAditionFromCollapse == false){
        var nodeStructNew = {};  
        nodeStructNew["id"] = nod.id;
        nodeStructNew["description"] = nod.description;
        nodeStructNew["kpiValue"] = nod.kpiValue; 
        nodeStructNew["kpiUnitOfMeasure"] = nod.kpiUnitOfMeasure;
        nodeStructNew["parentCalculus"] = nod.parentCalculus;
        nodeStructNew["calculusFactor"] = nod.calculusFactor;
        nodeStructNew["x"] = nod.x;
        nodeStructNew["y"] = nod.y;
        nodeStructNew["height"] = nod.height;
        nodeStructNew["width"] = nod.width;
        nodeStructNew["isChildrenVisible"] = true;
        nodeStructNew["childNodes"] = [];
        addNodeStructToTree(parentNode.id, nodeStructNew);
    }
	//

	//adiciona o id do filho no node pai
	parentNode.childNodes.push(nod);
	dictNodes[nod.id] = nod;

	//Cria a linha
	var line1 = new ConnectionLine(connectionIdCounter, parentNode.id, nod.id);
	line1.updateGeometry(parentNode, nod);
	connectionList.push(line1);
	connectionIdCounter++;
	dictConnections[line1.id] = line1;

	//Organiza os filhos nodes 
	updatePositionsOfNodeFields();

	//organiza os blocos de nodes no mesmo nivel
	adjustTreeYs();
}


//#region .:: Adicao de novos nodes aa StructuredTree global
function addNodeStructToTree(parentID, nodeStruct){
    //busca na arvore de estruturas
    if(PrincipalNodesTree["id"] == parentID){
        //Adiciona a struct do node
        PrincipalNodesTree["childNodes"].push(nodeStruct);
        return true; 
    }else{
        //Busca nos nodes abaixo
        var structList = PrincipalNodesTree["childNodes"];
        for(var i=0; i < structList.length; i++){
            var otherNodStruct = structList[i];
            var resp = addNodeStructToTreeRecursive(parentID, nodeStruct, otherNodStruct);
            if(resp == true)
                return true;
        }
        
        return false;
    }
}

function addNodeStructToTreeRecursive(parentID, nodeStruct, initialStruct){
    //busca na arvore de estruturas
    if(initialStruct["id"] == parentID){
        //Adiciona a struct do node
        initialStruct["childNodes"].push(nodeStruct);
        return true; 
    }else{
        //Busca nos nodes abaixo
        var foundStruct = false
        var structList = initialStruct["childNodes"];
        for(var i=0; i < structList.length && foundStruct == false; i++){
            var otherNodStruct = structList[i];
            var resp = addNodeStructToTreeRecursive(parentID, nodeStruct, otherNodStruct)
            if(resp == true)
                return true;
        }

        return false;
    }
}

//#endregion


//#region .:: Colapsement methods ::.
function updateColapsement(selectedNodeID){
    //Verifica se é apenas para redesenhar ou se é para colapsar mesmo 
    if(selectedNodeID > -1){
        //==find the node with the selectedNodeID and change the isChildrenVisible to the oposite value
        if(PrincipalNodesTree["id"] == selectedNodeID)
            PrincipalNodesTree["isChildrenVisible"] = !PrincipalNodesTree["isChildrenVisible"];
        else{
            changeNodeVisibility(selectedNodeID, PrincipalNodesTree["childNodes"]);
        }
    }
    //Guarda o que havia selecionado
    var selectedNodeIndexPrevious = selectedNodeID;
    var selectedStructPrevious = SelectedStruct;

    //===Repaint the tree now checking the visibility
    //Reseta todos os agrupamentos
    dictNodes = {};
    nodeList = [];
    connectionList = [];
	connectionIdCounter = 0;
    dictConnections = {};
    
    nodeIdCounter = PrincipalNodesTree["id"];
	var node = new NodeField(PrincipalNodesTree["id"]);
	node.createGeometry(PrincipalNodesTree["x"], PrincipalNodesTree["y"], PrincipalNodesTree["width"], PrincipalNodesTree["height"], 0);
    node.description = PrincipalNodesTree["description"];
    node.level = 0;
    console.log(node.description);
	nodeList.push(node);
    dictNodes[node.id] = node;
    node.kpiValue = PrincipalNodesTree["kpiValue"];
    node.kpiUnitOfMeasure = PrincipalNodesTree["kpiUnitOfMeasure"];
    node.parentCalculus = PrincipalNodesTree["parentCalculus"];
    node.calculusFactor = PrincipalNodesTree["calculusFactor"];
    node.isChildrenVisible = PrincipalNodesTree["isChildrenVisible"];
    selectedNodeIndex = node.id;
    selectedStruct = PrincipalNodesTree;
    
    if(node.isChildrenVisible){
        var children = PrincipalNodesTree["childNodes"]; 
        criaNodeFilhosWithVisibility(children, node);
    }
    
    //verifica o maior ID
    defineThreeMaxIDNumber(PrincipalNodesTree);
    nodeIdCounter++;

    selectedNodeIndex = selectedNodeIndexPrevious;
    SelectedStruct = selectedStructPrevious;
}

function criaNodeFilhosWithVisibility(childList, parentNod){
    for(var i=0; i < childList.length; i++){
        var otherNodStruct = childList[i];
        addNewChildImportacao(parentNod, otherNodStruct, true);
        var nod = dictNodes[otherNodStruct["id"]];
        selectedNodeIndex = nod.id;
        SelectedStruct = otherNodStruct;
        if(SelectedStruct["isChildrenVisible"] == true){
            var children = otherNodStruct["childNodes"];
            criaNodeFilhosWithVisibility(children, nod);
        } else{
            nod.isChildrenVisible = false;
        }
    }
}

function changeNodeVisibility(selectedID, childList){
    for(var i=0; i < childList.length; i++){
        var otherNodStruct = childList[i];
        if(otherNodStruct["id"] == selectedID){
            otherNodStruct["isChildrenVisible"] = !otherNodStruct["isChildrenVisible"];
            return true; 
        }
        else{
            if(otherNodStruct["isChildrenVisible"] == true){
                var children = otherNodStruct["childNodes"];
                var result = changeNodeVisibility(selectedID, children);
                if(result == true)
                    return true;
            }
        }
    }
    return false;
}


function getNodeStruct(nodeID)
{
    if(PrincipalNodesTree["id"] == nodeID)
    {
        return PrincipalNodesTree;
    }
    else{
        var children = PrincipalNodesTree["childNodes"];
        var respStruct = getNodeStructRecursive(nodeID, children);
        return respStruct;
    }    
}


function getNodeStructRecursive(nodID, childrenStruct){

    for(var i=0; i < childrenStruct.length; i++){
        var otherNodeStruct = childrenStruct[i];
        console.log("verifica Node " + otherNodeStruct["id"]);
        if(otherNodeStruct["id"] == nodID)
        {
            return otherNodeStruct;
        }
        else{
            var childrenStr = otherNodeStruct["childNodes"];
            var respStruct = getNodeStructRecursive(nodID, childrenStr);
            if(respStruct !== undefined)
                return respStruct;
        }
    }

    return undefined;
}

function defineThreeMaxIDNumber(originStruct){
    if(nodeIdCounter < originStruct["id"]){
        nodeIdCounter = originStruct["id"];
    }
    var children = originStruct["childNodes"];
    for(var i=0; i < children.length; i++){
        var no = children[i];
        defineThreeMaxIDNumber(no);
    }
}

//#endregion



function doRemoveNode(nodIDToRemove, childrenStruct){
    //Busca nos nodes filhos se tem o Id igual
	for(var i=0; i < childrenStruct.length; i++){
        var otherNodeStruct = childrenStruct[i];
        console.log("verifica Node " + otherNodeStruct["id"]);
        if(otherNodeStruct["id"] == nodIDToRemove){
            childrenStruct.splice(i, 1);
            return true; 
        }
    }

    //Busca nos filhos dos nodes filhos se tem id igual
    for(var i=0; i < childrenStruct.length; i++){
        var otherNodeStruct = childrenStruct[i];
        var result = doRemoveNode(nodIDToRemove, otherNodeStruct["childNodes"]);
        if(result == true)
            return true; 
    }
    return false;
}