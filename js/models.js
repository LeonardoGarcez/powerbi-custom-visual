

class NodeField {
	constructor(num) {
		this.id = num;
		this.description = "";
		this.kpiValue = 11.23;
		this.kpiUnitOfMeasure = "%";
		this.parentCalculus = "sum";
		this.calculusFactor = 1;
		this.level = -1;
		this.isSelected = false;
		this.isHovered = false;
		this.isCollapsed = false;
		this.backgroundPath;
		this.x = 200;
		this.y = 200;
		this.height = 30;
		this.width = 100;
		this.radius = 0;
		this.isChildrenVisible = true;
		this.parentNode = null;
		this.parentNodeID = -1;
		this.childNodes = [];
		
	}
	
	createGeometry = function(x, y, width, height, radius){
		this.x = x; //x do ponto left-top 
		this.y = y; //y do ponto left-top 
		this.height = height;
		this.width = width;
		this.radius = radius;
		var path = new Path2D();
		path.moveTo(x, y + radius);
		path.lineTo(x, y + height - radius);
		path.arcTo(x, y + height, x + radius, y + height, radius);
		path.lineTo(x + width - radius, y + height);
		path.arcTo(x + width, y + height, x + width, y + height-radius, radius);
		path.lineTo(x + width, y + radius);
		path.arcTo(x + width, y, x + width - radius, y, radius);
		path.lineTo(x + radius, y);
		path.arcTo(x, y, x, y + radius, radius);
		this.backgroundPath = path;
		
	  }

	  recreateGeometry = function(){
		var path = new Path2D();
		path.moveTo(this.x, this.y + this.radius);
		path.lineTo(this.x, this.y + this.height - this.radius);
		path.arcTo(this.x, this.y + this.height, this.x + this.radius, this.y + this.height, this.radius);
		path.lineTo(this.x + this.width - this.radius, this.y + this.height);
		path.arcTo(this.x + this.width, this.y + this.height, this.x + this.width, this.y + this.height-this.radius, this.radius);
		path.lineTo(this.x + this.width, this.y + this.radius);
		path.arcTo(this.x + this.width, this.y, this.x + this.width - this.radius, this.y, this.radius);
		path.lineTo(this.x + this.radius, this.y);
		path.arcTo(this.x, this.y, this.x, this.y + this.radius, this.radius);
		this.backgroundPath = path;
		
	  }

	  getButtonBackgroundPath = function(){
		var circX = this.x + this.width + 30;
		var circY = this.y + this.height/2 - 20;
		var path = new Path2D();
		path.arc(circX,circY,10,0*Math.PI,2*Math.PI);
		
		return path;
	  }

	  getButtonNotCollapsedPath = function(){
		var circX = this.x + this.width + 30;
		var circY = this.y + this.height/2 - 20;
		var path = new Path2D();
		path.moveTo(circX - 8,circY);
		path.lineTo(circX + 8,circY);

		return path;
	  }

	  getButtonCollapsedPath = function(){
		var circX = this.x + this.width + 30;
		var circY = this.y + this.height/2 - 20;
		var path = new Path2D();
		path.moveTo(circX - 8,circY);
		path.lineTo(circX + 8,circY);
		path.moveTo(circX,circY - 8);
		path.lineTo(circX,circY + 8);

		return path;
	  }

	  //Path do simbolo que indica os nodes filhos colapsados
	  getCollapsedChildrenSymbolPath = function(){
		var path = new Path2D();
		path.moveTo(this.x + this.width, this.y);
		//path.lineTo(this.x + parseInt(this.width*0.85), this.y + parseInt(this.height/2));
		path.lineTo(this.x + parseInt(this.width*0.85), this.y + parseInt(this.height/2));
		path.lineTo(this.x + parseInt(this.width*0.85), this.y + parseInt(this.height));
		path.lineTo(this.x + this.width, this.y + this.height);
		path.moveTo(this.x + this.width, this.y);

		return path;
	  }
	
}



class ConnectionLine{
	constructor(num, idNod1, idNod2){
		this.id = num;
		this.description = "";
		this.isHovered = false;
		this.isSelected = false;
		this.isCollapsed = false;
		this.linePath;
		this.Nod1_id = idNod1;
		this.Nod2_id = idNod2;
		this.Points = [];
	}

	updateGeometry = function(nod1, nod2){
		var X1 = 0;
		var Xm = 0;
		var X2 = 0;
		var Y1 = 0;
		var Ym = 0;
		var Y2 = 0;
		var path;
		if(nod1.x < nod2.x){
			X1 = nod1.x + nod1.width;
			X2 = nod2.x;
			Xm = (X1 + X2)/2;
			//Set the points in the path 
			path = new Path2D();
			path.moveTo(X1, nod1.y + nod1.height/2);
			path.lineTo(Xm, nod1.y + nod1.height/2);
			path.lineTo(Xm, nod2.y + nod2.height/2);
			path.lineTo(X2, nod2.y + nod2.height/2);
			this.linePath = path;
		}else{
			X1 = nod2.x + nod2.width/2;
			X2 = nod1.x;
			Xm = (X1 + X2)/2;
			//Set the points in the path 
			path = new Path2D();
			path.moveTo(X1, nod1.y + nod1.height/2);
			path.lineTo(Xm, nod1.y + nod1.height/2);
			path.lineTo(Xm, nod2.y + nod2.height/2);
			path.lineTo(X2, nod2.y + nod2.height/2);
			this.linePath = path;
		}
	}
}

class LevelBlock{
	constructor(parentNod){
		this.parentNode = parentNod;
		this.level = parentNod.level + 1;
		this.minY = parentNod.childNodes[0].y;
		this.maxY = parentNod.childNodes[0].y + parentNod.childNodes[0].height;
		this.midY = 0;
		this.internalNodes = parentNod.childNodes;

		this.createBlock();

	}

	//funcao que define as propriedades do bloco
	createBlock = function(){
		for(i=0;i<this.internalNodes.length;i++){
			var no = this.internalNodes[i];
			if(no.y < this.minY){
				this.minY = no.y;
			}

			if(no.y + no.height > this.maxY){
				this.maxY = no.y + no.height;
			}
		}

		this.midY = (this.maxY + this.minY)/2;
	}
}



class Point{
	constructor(x, y){
		this.X = x;
		this.Y = y;
	}
}