
var el = document.getElementById('scene');
el.width = getWidth();
el.height = getHeight();
var ctx = el.getContext('2d');
var rect = el.getBoundingClientRect();
var canvasX = rect.left;
var canvasY = rect.top;
//console.log("canvasX: "+ String(canvasX) + "| canvas Y: " + String(canvasY));

var baseHeight = 90;
var baseWidth = 300;
var baseDistance = 90;
var globalScale = 1;
var globalTranslateVector = [0, 0];

var dictNodes = {};
var dictConnections = {};

var isMouseDown = false; var isSelectingNode = false; var isTranslatingScreen = false; 
var nodeList = []; var connectionList = [];
var PrincipalNodesTree = {};  //dictionary with all the nodes as structures. Is like the importade json
var SelectedStruct = {};  //Struct salva conforme eh guardado o selectedNodeIndex
var geralPath; var geralBlock;

var generalRadius = 15;

var previousX; var previousX;
var vX; var vY;
var selectedNodeForTranslationIndex = -1;
var selectedNodeIndex = -1;
var hoveredNodeIndex = -1;

var nodeIdCounter = 0;
var connectionIdCounter = 0;

initialize();

window.setInterval(update, 50);

el.onmousedown = function(e) {
	previousX = e.clientX; previousY = e.clientY;
	el = document.getElementById('scene');
	rect = el.getBoundingClientRect();
	canvasX = rect.left;
	canvasY = rect.top;
	//previousX = previousX - canvasX;
	//previousY = previousY - canvasY;
	previousX = Math.round( (previousX  - canvasX)* (el.width / el.offsetWidth));
	previousY = Math.round( (previousY  - canvasY)* (el.height / el.offsetHeight));
  	
  	//console.log("canvasX: "+ String(canvasX) + "| canvas Y: " + String(canvasY));
  	//if(selectedNodeForTranslationIndex != -1){
		//vX = nodeList[selectedNodeForTranslationIndex].x - e.clientX;
		//vY = nodeList[selectedNodeForTranslationIndex].y - e.clientY;
  	//}
	isMouseDown = true;

	var ctxAux = el.getContext('2d')
	//selectedNodeIndex = -1;
	var hasMouseHover = false;
	for(i=0;i < nodeList.length; i++){
		var nod = nodeList[i];
		if(nod.isHovered){
			selectedNodeIndex = nod.id;
			SelectedStruct = getNodeStruct(nod.id);
			hasMouseHover = true;
		}
	}

	//if(!hasMouseHover)
	//	selectedNodeIndex = -1;

	//verifica se o click foi no circulo de colapso
    if(selectedNodeIndex > -1 && isTranslatingScreen == false){
		//var selectedNodeStruct = getNodeStruct(selectedNodeIndex); //Montar este metodo recursivo no arquivo manipulation
		var selectedNod = dictNodes[selectedNodeIndex];
		var colapBtn = selectedNod.getButtonBackgroundPath();
		if(ctx.isPointInPath(colapBtn, previousX, previousY)){
			updateColapsement(selectedNodeIndex); //comentado pra deixar pra depois essa funcionalidade
		}
	}
};

el.onmousemove = function(e) {
	var x = e.clientX; var y = e.clientY;
	var canvas = document.getElementById('scene');
	x = Math.round( (x  - canvasX)* (canvas.width / canvas.offsetWidth));
	y = Math.round( (y  - canvasY)* (canvas.height / canvas.offsetHeight));
	//x = x - 300;
	//y = y - 300;
	//x = x - canvasX;
	//y = y - canvasY + 5;
	//y = y + 5;
	//console.log("X: "+ String(x) + "| Y: " + String(y));
	if (canvas.getContext && selectedNodeForTranslationIndex == -1 && isTranslatingScreen == false) {
		var ctx = canvas.getContext('2d')
		hoveredNodeIndex = -1;
		for(i=0;i < nodeList.length; i++){
			var nod = nodeList[i];
			if(ctx.isPointInPath(nod.backgroundPath, x, y)){
				hoveredNodeIndex = nod.id;
				nod.isHovered = true;
				if(isMouseDown){
					//selectedNodeForTranslationIndex = i;
					selectedNodeIndex = nod.id;
					//SelectedStruct = getNodeStruct(nod.id);
					nod.isSelected = true;
				}
			}
			else{
				nod.isSelected = false;
				nod.isHovered = false
			}
		}
	}
  
	//Draging the block
	if(selectedNodeForTranslationIndex != -1)
	{ 
		//nodeList[selectedNodeForTranslationIndex].createGeometry(x/globalScale - nodeList[selectedNodeForTranslationIndex].width/2 - globalTranslateVector[0], y/globalScale - nodeList[selectedNodeForTranslationIndex].height/2 - globalTranslateVector[1], nodeList[selectedNodeForTranslationIndex].width, nodeList[selectedNodeForTranslationIndex].height, 5);
		//console.log("X: " + x + ";  Y: " + y + ";  nodeWidht: " + nodeList[selectedNodeForTranslationIndex].width + ";   nodeHeight: " + nodeList[selectedNodeForTranslationIndex].height);
	}

	//translacao
	if(hoveredNodeIndex == -1 && isMouseDown == true){
		isTranslatingScreen = true;
		executeTranslation(x, y);	
	}
};

el.onmouseup = function() {
	selectedNodeForTranslationIndex = -1;
	isMouseDown = false;
	isTranslatingScreen = false;

	//Habilita ou desabilita NodeFields
	var nodeFieldsInSideBar =  document.getElementById('nodeFields');
	if(selectedNodeIndex == -1){
		nodeFieldsInSideBar.style.visibility = "hidden";
		$("#nodeFields").collapse("hide");
	}else{
		nodeFieldsInSideBar.style.visibility = "visible";
		var nod = dictNodes[selectedNodeIndex];
		$("#nodeFields").collapse("show");
		var nodeDescr = document.getElementById('inputDescriptionField');
		nodeDescr.value = nod.description;
		var nodeKPIValue = document.getElementById('inputValueField');
		nodeKPIValue.value = nod.kpiValue;
		var nodeFactor = document.getElementById('inputFactorField');
		nodeFactor.value = nod.calculusFactor;
		var nodeOperat = document.getElementById('dropOperation');
		nodeOperat.value = nod.parentCalculus;

	}
};

function onWheelRolled(event){
	if(event.deltaY > 0)
		doZoom("btnZoomOut");
	else
		doZoom("btnZoomIn");
}

function initialize(){
	var node = new NodeField(nodeIdCounter);
	node.createGeometry(200, 200, baseWidth, baseHeight, 0);
	node.description = "Indicador ROB de Inovações";
	node.level = 0;
	nodeList.push(node);
	dictNodes[node.id] = node;
	nodeIdCounter++;

	//Adiciona a struct do node - desabilitado
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
	
}



function getWidth() {
  return Math.max(
    document.body.scrollWidth,
    document.documentElement.scrollWidth,
    document.body.offsetWidth,
    document.documentElement.offsetWidth,
    document.documentElement.clientWidth
  );
}

function getHeight() {
  return Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight,
    document.documentElement.clientHeight
  );
}

function update(){
	//Atualiza a tela
	var canvas = document.getElementById('scene');
	if (canvas.getContext) {
		
		var ctx = canvas.getContext('2d');

		//Limpa a tela
		ctx.clearRect(-99999/globalScale, -99999/globalScale, 2*99999/globalScale, 2*99999/globalScale);

		//Preenche background
		ctx.fillStyle = "#fafafa";
		ctx.fillRect(-9999/globalScale, -9999/globalScale, 2*9999/globalScale, 2*9999/globalScale);

		//indica no selecionado
		var selNod;
		if(selectedNodeIndex > -1){
			selNod = dictNodes[selectedNodeIndex];
			ctx.shadowBlur = 10*globalScale;
			ctx.shadowColor = "#33ccf5";
			ctx.fillStyle = '#f6f1de';
			ctx.fill(selNod.backgroundPath);
			ctx.fill(selNod.backgroundPath);
			ctx.fill(selNod.backgroundPath);
			ctx.shadowBlur = 0;
		}

		//desenha os nodes
		for(var i=0; i < nodeList.length; i++){
			var nod = nodeList[i];
			ctx.lineWidth = 1;
			ctx.lineJoin = ctx.lineCap = 'round';
			if(selectedNodeIndex != nod.id){
				ctx.shadowBlur = parseInt(8*globalScale);
				ctx.shadowColor = "#222222";
			}
			ctx.strokeStyle = 'black';
			ctx.stroke(nod.backgroundPath);
			ctx.shadowBlur = 0;
			ctx.fillStyle = '#f6f1de';
			ctx.fill(nod.backgroundPath);
			ctx.shadowBlur = 0;
			//simbolo de colapso dos nodes filhos
			if(nod.isChildrenVisible == false){
				ctx.fillStyle = '#d9d3bf';
				ctx.fill(nod.getCollapsedChildrenSymbolPath());
			}
			//Texto do Indicador
			ctx.font = "16px Helvetica";
			ctx.fillStyle = "black";
			ctx.textAlign = "left";
			var wordHeight = ctx.measureText("M").width;
			var listOfLines = wrapNodeText(nod.description, parseInt(nod.width*0.7), ctx);
			var listOfY = getLinesYPositions(listOfLines, ctx, nod);
			for(var j=0; j < listOfLines.length; j++){
				ctx.fillText(listOfLines[j], nod.x + parseInt(nod.width*0.02), listOfY[j]);
			}

			//Texto do valor
			ctx.font = "18px Helvetica";
			ctx.fillStyle = "black";
			ctx.textAlign = "left";
			var kpiValueTxt = nod.kpiValue.toString() + nod.kpiUnitOfMeasure; 
			var valueHeight = ctx.measureText("M").width;
			var valueWidth = ctx.measureText(kpiValueTxt).width;
			ctx.fillText(kpiValueTxt, nod.x + nod.width - valueWidth - parseInt(nod.width*0.02), nod.y + valueHeight + parseInt(nod.width*0.02));
			
			//Hover
			if(nod.isHovered){
				//colorir em alpha reduzido
				ctx.globalAlpha = 0.5;
			    ctx.fillStyle = 'rgba(255, 255, 255, 120)';
				ctx.fill(nod.backgroundPath);
				//retorna o alpha normal
				ctx.globalAlpha = 1;
			}

			
		}

		//draw the lines
		for(var i=0; i < connectionList.length; i++){
			var lin = connectionList[i];
			var nod1 = dictNodes[lin.Nod1_id];
			var nod2 = dictNodes[lin.Nod2_id];
			lin.updateGeometry(nod1, nod2);
			ctx.lineWidth = 1;
			//ctx.lineJoin = ctx.lineCap = 'round';
			ctx.shadowBlur = nod.shadowBlur;
			ctx.strokeStyle = '#33ccf5';
			ctx.stroke(lin.linePath);
		}

		//draw the collapsible button
		if(selectedNodeIndex > -1){
			if(SelectedStruct !== undefined){
				selNod = dictNodes[selectedNodeIndex];
				if(SelectedStruct["childNodes"].length > 0){
					ctx.fillStyle = '#d9f3f9';
					ctx.fill(selNod.getButtonBackgroundPath());
					ctx.lineWidth = 1;
					ctx.strokeStyle = '#0a9ec7';
					ctx.stroke(selNod.getButtonBackgroundPath());
					ctx.lineWidth = 2;
					if(SelectedStruct["isChildrenVisible"] == true)
						ctx.stroke(selNod.getButtonNotCollapsedPath());
					else
						ctx.stroke(selNod.getButtonCollapsedPath());
				}
			}
		}
	}
}

//
function wrapNodeText(txt, maxWidth, context){
	//obtem todas as palavras
	var words = txt.split(" ");
	var resultList = [];
	var line = words[0];
	//Testa todas as palavras e verifica quando tem que aumentar uma linha
	for(i=1; i < words.length; i++){
		var test = line + " " + words[i];
		if(ctx.measureText(test).width > maxWidth){  //maior do que a largura
			resultList.push(line);
			line = words[i];
		}
		else{
			line = test; //menor do que a largura e concatena o texto
			if(i == words.length - 1){
				resultList.push(line);
				line = "";
			}
		}
	}

	//Considera a palavra remanecente
	if(line != "")
		resultList.push(line);
	
	return resultList;
}

function getLinesYPositions(lines, context, no){
	var linesYs = [];
	var h = 1.2*context.measureText("M").width;
	var y0 = no.y + 1*no.height/2;
	//Numero par de linhas
	if(lines.length%2 == 0){
		var dist = 0;
		for(i=1; i<=lines.length/2; i++){
			if(i == 1)
				dist = h/2;
			else
				dist = dist + h;
			
			linesYs.push(y0 + dist);
			linesYs.push(y0 - dist);
		}
	}
	else{ //Numero impar de linhas
		var dist = 0;
		linesYs.push(y0);
		for(i=2; i<=lines.length; i++){
			if(i%2 == 1){
				dist = dist + h;
			
				linesYs.push(y0 + dist);
				linesYs.push(y0 - dist);
			}
		}
	}
	
	linesYs.sort(function(a, b){return a - b});
	return linesYs;
}


function addNewChild(parentNode){
	//Se estiverem colapsados os filhos deste parentNode, pedir para descolapsar.
	if(parentNode.isChildrenVisible == false){
		alert("É necessário descolapsar os Nodes filhos do Node '" + parentNode.description + "' antes de adicionar um novo. ")
		return;
	}
	//Cria o novo nodefield
	var nod = new NodeField(nodeIdCounter);
	nodeIdCounter++;
	nod.parentNode = parentNode;
	nod.parentNodeID = parentNode.id;
	nod.description = "NodeField " + String(nod.id);
	nod.level = parentNode.level + 1;
	nod.createGeometry(parentNode.x + parentNode.width + baseDistance, parentNode.y, baseWidth, baseHeight, 0);
	nodeList.push(nod);

	//Salva na estrutura
	var nodeStruct = {};
	nodeStruct["id"] = nod.id;
	nodeStruct["description"] = nod.description;
	nodeStruct["kpiValue"] = nod.kpiValue; 
	nodeStruct["kpiUnitOfMeasure"] = nod.kpiUnitOfMeasure;
	nodeStruct["parentCalculus"] = nod.parentCalculus;
	nodeStruct["calculusFactor"] = nod.calculusFactor;
	nodeStruct["x"] = nod.x;
	nodeStruct["y"] = nod.y;
	nodeStruct["height"] = nod.height;
	nodeStruct["width"] = nod.width;
	nodeStruct["isChildrenVisible"] = true;
	nodeStruct["childNodes"] = [];
	addNodeStructToTree(parentNode.id, nodeStruct);
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

//Teste de adicao de novo Node
function AddChildToSelectedNode(){
	if(selectedNodeIndex > -1)
		addNewChild(dictNodes[selectedNodeIndex]);
}

function updatePositionsOfNodeFields(){
	//Aqui serao atualizadas as posicoes x e y dos nodefields de acordo com a quantidade de filhos visiveis!!!!
	for(var i=0; i < nodeList.length; i++){
		var nod = nodeList[i];
		var baseY = nod.y + nod.height/2;
		var listYs = [];
		var qtd = 0;
		if(nod.childNodes.length%2 == 0){ //numero par de nodes filhos
			qtd = nod.childNodes.length/2;
			//Define as posicoes centrais
			for(var k=0; k < qtd; k++){
				listYs.push(baseY - (k+0.5)*(baseDistance + baseHeight));
				listYs.push(baseY + (k+0.5)*(baseDistance + baseHeight));
			}
			//Ordena os Ys em ordem crescente
			listYs.sort(function(a, b){return a - b});
			//posiciona os Nodes conforme os Ys
			for(var j=0; j < nod.childNodes.length; j++){
				var nchild = nod.childNodes[j];
				nchild.y = listYs[j] - nchild.height/2;
				nchild.recreateGeometry();
			}
		}
		else{  //numero impar de filhos
			qtd = (nod.childNodes.length - 1)/2;
			//Define as posicoes centrais
			listYs.push(baseY);
			for(var k=1; k <= qtd; k++){
				listYs.push(baseY + k*(baseDistance + baseHeight));
				listYs.push(baseY - k*(baseDistance + baseHeight));
			}
			//Ordena os Ys em ordem crescente
			listYs.sort(function(a, b){return a - b});
			//posiciona os Nodes conforme os Ys
			for(var j=0; j < nod.childNodes.length; j++){
				var nchild = nod.childNodes[j];
				nchild.y = listYs[j] - nchild.height/2;
				nchild.recreateGeometry();
			}
		}
	}

}








//=================================================
//Utilities functions
function doZoom(clickedID){
	var deltaScale = 1;
	var d = 0.2;
	if(clickedID == "btnZoomIn"){
		deltaScale = deltaScale + d;
		globalScale = globalScale*(1 + d);
	}else{
		deltaScale = deltaScale - d;
		globalScale = globalScale*(1 - d);
	}

	//aplica a escala
	ctx.scale(deltaScale, deltaScale);
	deltaScale = 1;
}

function removeNode(){
	if(selectedNodeIndex > 0){
		if (confirm('Deseja realmente remover o KPI selecionado e todos os KPIs abaixo dele na árvore?')) {
			// Remover tudo
			doRemoveNode(selectedNodeIndex, PrincipalNodesTree["childNodes"]);
			//Redesenha toda a árvore agora com nós removidos 
			updateColapsement(-1);
			//Movimenta o Foco para o node inicial
			SelectedStruct = PrincipalNodesTree;
			selectedNodeIndex = 0;
			return;
		} else {
			// Do nothing!
			return;
		}
	} else{
		alert("Não é possível remover o KPI principal.");
	}
}

function executeTranslation(mX, mY){
	var vX = 0; var vY = 0;
	vX = (mX - previousX)/globalScale;
	if(Math.abs(vX) <= 20){
		vX = 0;
	}else{
		previousX = mX;
		globalTranslateVector[0] = globalTranslateVector[0] + vX; 
	}

	vY = (mY - previousY)/globalScale;
	if(Math.abs(vY) <= 20){
		vY = 0;
	}else{
		previousY = mY;
		globalTranslateVector[1] = globalTranslateVector[1] + vY; 
	}

	ctx.translate(vX, vY);
}

function textEditedValueField(){
	if(selectedNodeIndex > -1){
		var nod = dictNodes[selectedNodeIndex];
		var nodeKPIValue = document.getElementById('inputValueField');
		nod.kpiValue = nodeKPIValue.value;
		SelectedStruct["kpiValue"] = nodeKPIValue.value;
	}
}

function textEditedDescriptionField(){
	if(selectedNodeIndex > -1){
		var nod = dictNodes[selectedNodeIndex];
		var nodeDescr = document.getElementById('inputDescriptionField');
		nod.description = nodeDescr.value;
		SelectedStruct["description"] = nodeDescr.value;
	}
}

function textEditedFactorField(){
	if(selectedNodeIndex > -1){
		var nod = dictNodes[selectedNodeIndex];
		var nodeFactor = document.getElementById('inputFactorField');
		nod.calculusFactor = nodeFactor.value;
		SelectedStruct["calculusFactor"] = nodeFactor.value;
	}
}

function textEditedOperationSymbolField(){
	if(selectedNodeIndex > -1){
		var nod = dictNodes[selectedNodeIndex];
		var nodeOperation = document.getElementById('dropOperation');
		nod.parentCalculus = nodeOperation.value;
		SelectedStruct["parentCalculus"] = nodeOperation.value;
	}
}

