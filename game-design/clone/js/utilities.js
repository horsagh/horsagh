	// http://paulbourke.net/miscellaneous/interpolation/
	
	// we use this to interpolate the ship towards the mouse position
	function lerp(start, end, amt){
  		return start * (1-amt) + amt * end;
	}
	
	// we didn't use this one
	function cosineInterpolate(y1, y2, amt){
  		let amt2 = (1 - Math.cos(amt * Math.PI)) / 2;
  		return (y1 * (1 - amt2)) + (y2 * amt2);
	}
	
	// we use this to keep the ship on the screen
	function clamp(val, min, max){
        return val < min ? min : (val > max ? max : val);
    }
    
    // bounding box collision detection - it compares PIXI.Rectangles
	function rectsIntersect(a,b){
		var ab = a.getBounds();
		var bb = b.getBounds();
		return ab.x + ab.width > bb.x && ab.x < bb.x + bb.width && ab.y + ab.height > bb.y && ab.y < bb.y + bb.height;
	}
	
	// these 2 helpers are used by classes.js
	function getRandomUnitVector(){
		let x = getRandom(-1,1);
		let y = getRandom(-1,1);
		let length = Math.sqrt(x*x + y*y);
		if(length == 0){ // very unlikely
			x=1; // point right
			y=0;
			length = 1;
		} else{
			x /= length;
			y /= length;
		}
	
		return {x:x, y:y};
	}

	function getRandom(min, max) {
		return Math.random() * (max - min) + min;
	}

	// returns the point of intersection between lines 1-2 and 3-4. returns an empty array if they don't intersect.
	function linesCross(x1, y1, x2, y2, x3, y3, x4, y4) { //source: https://web.archive.org/web/20060911055655/http://local.wasp.uwa.edu.au/~pbourke/geometry/lineline2d/
		let denominator = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));

		if(denominator == 0) { //lines are parallel or coincident
			return []; //coincident lines could be considered intersecting, but they dont have a single point of intersection, and for what I'm using this function for it doesn't matter.
		}

		ua = (((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3)))/denominator;
		ub = (((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3)))/denominator;

		if(ua <= 1 && ua >= 0 && ub <= 1 && ub >= 0) {
			return [x1 + (ua * (x2 - x1)), y1 + (ua * (y2 - y1))];
		}
		else {
			return []; //lines intersect but not within segments
		}
	}
	
	
	function objLineCollision (wall, x1, y1, x2, y2)
	{
		let intersections = [];

		intersections.push(linesCross(x1, y1, x2, y2, wall.x, wall.y, wall.x + wall.width, wall.y)); //top wall
		intersections.push(linesCross(x1, y1, x2, y2, wall.x + wall.width, wall.y, wall.x + wall.width, wall.y + wall.height)); //right wall
		intersections.push(linesCross(x1, y1, x2, y2, wall.x + wall.width, wall.y + wall.height, wall.x, wall.y + wall.height)); //bottom wall
		intersections.push(linesCross(x1, y1, x2, y2, wall.x, wall.y + wall.height, wall.x, wall.y)); //left wall

		intersections = intersections.filter(e => e.length > 1); //filter out misses

		if(intersections.length == 0) {
			return []; // no hits - return empty
		}

		//otherwise, we find the closest hit to x1y1.
		let shortestdist = 999999;
		let shortestindex = 0;
		for(let i = 0; i < intersections.length; i++) { 
			dist = distanceSquared(x1, y1, intersections[i][0], intersections[i][1]);
			if(dist < shortestdist) {
				shortestdist = dist;
				shortestindex = i;
			}
		}
		return intersections[shortestindex];
	}

	function distanceSquared (x1, y1, x2, y2) {//finds the distance between two points, without square rooting at the end for efficiency
		let x = y2 - y1;
		let y = x2 - x1;
		return (x * x) + (y * y);
	}