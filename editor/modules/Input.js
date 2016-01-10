/*
	Translates the MouseCaster's events into more relevant data that the editor uses.
*/
define('Input', function() {
	var tower = require('tower');
	var nexus = require('nexus');
	var keyboard = require('keyboard');

	var Input = function(scene, mouse) {
		this.mouse = mouse;
		this.mouse.signal.add(this.onMouse, this);

		this.mouseDelta = new THREE.Vector3();
		this.mousePanMinDistance = 0.1;
		this.heightStep = 5;
		this.gridPixelPos = new THREE.Vector3(); // current grid position of mouse

		this.overCell = null;

		this._travel = 0;

		keyboard.signal.add(function(type, code) {
			if (type === keyboard.eventType.DOWN) {
				if (code === keyboard.code.SHIFT) nexus.scene.controls.enabled = false;
			}
			else {
				if (code === keyboard.code.SHIFT) nexus.scene.controls.enabled = true;
			}
		}, this);
	};

	Input.prototype = {
		update: function() {
			var hit = this.mouse.allHits[0];
			if (hit) {
				// flip things around a little to fit to our rotated grid
				this.gridPixelPos.x = hit.point.x;
				this.gridPixelPos.y = -hit.point.z;
				this.gridPixelPos.z = hit.point.y;
			}
			var dx = this.mouseDelta.x - this.mouse.screenPosition.x;
			var dy = this.mouseDelta.y - this.mouse.screenPosition.y;
			this._travel += Math.sqrt(dx * dx + dy * dy);
		},

		onMouse: function(type, obj) {
			var hit, cell;
			if (this.mouse.allHits && this.mouse.allHits[0]) {
				hit = this.mouse.allHits[0];
			}
			switch (type) {
				case vg.MouseCaster.WHEEL:
					tower.userAction.dispatch(vg.MouseCaster.WHEEL, this.overCell, obj);
					break;

				case vg.MouseCaster.OVER:
					if (obj) {
						this.overCell = obj.select();
					}
					tower.userAction.dispatch(vg.MouseCaster.OVER, this.overCell, hit);
					break;

				case vg.MouseCaster.OUT:
					if (obj) {
						obj.deselect();
						this.overCell = null;
					}
					tower.userAction.dispatch(vg.MouseCaster.OUT, this.overCell, hit);
					break;

				case vg.MouseCaster.DOWN:
					this.mouseDelta.copy(this.mouse.screenPosition);
					tower.userAction.dispatch(vg.MouseCaster.DOWN, this.overCell, hit);
					this._travel = 0;
					break;

				case vg.MouseCaster.UP:
					if (this._travel > this.mousePanMinDistance) {
						break;
					}
					tower.userAction.dispatch(vg.MouseCaster.UP, this.overCell, hit);
					break;

				case vg.MouseCaster.CLICK:
					tower.userAction.dispatch(vg.MouseCaster.CLICK, this.overCell, hit);
					break;
			}
		}
	};

	return Input;
});
