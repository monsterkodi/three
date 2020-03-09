// koffee 1.12.0

/*
 0000000   0000000   00     00  00000000  00000000    0000000 
000       000   000  000   000  000       000   000  000   000
000       000000000  000000000  0000000   0000000    000000000
000       000   000  000 0 000  000       000   000  000   000
 0000000  000   000  000   000  00000000  000   000  000   000
 */
var Camera, PerspectiveCamera, Quaternion, Vector2, Vector3, abs, clamp, deg2rad, empty, gamepad, kpos, max, min, prefs, reduce, ref, ref1,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), clamp = ref.clamp, deg2rad = ref.deg2rad, empty = ref.empty, gamepad = ref.gamepad, kpos = ref.kpos, prefs = ref.prefs, reduce = ref.reduce;

ref1 = require('three'), Camera = ref1.Camera, PerspectiveCamera = ref1.PerspectiveCamera, Quaternion = ref1.Quaternion, Vector2 = ref1.Vector2, Vector3 = ref1.Vector3;

abs = Math.abs, max = Math.max, min = Math.min;

Camera = (function(superClass) {
    extend(Camera, superClass);

    function Camera(arg) {
        var height, ref2, view, width;
        view = (ref2 = arg.view) != null ? ref2 : null;
        this.setDistFactor = bind(this.setDistFactor, this);
        this.inertZoom = bind(this.inertZoom, this);
        this.onMouseWheel = bind(this.onMouseWheel, this);
        this.moveCenter = bind(this.moveCenter, this);
        this.fadeCenter = bind(this.fadeCenter, this);
        this.pivotCenter = bind(this.pivotCenter, this);
        this.onPadAxis = bind(this.onPadAxis, this);
        this.onPadButton = bind(this.onPadButton, this);
        this.animationStep = bind(this.animationStep, this);
        this.onMouseDrag = bind(this.onMouseDrag, this);
        this.onDblClick = bind(this.onDblClick, this);
        this.onMouseUp = bind(this.onMouseUp, this);
        this.onMouseDown = bind(this.onMouseDown, this);
        this.del = bind(this.del, this);
        this.elem = view;
        width = view.clientWidth;
        height = view.clientHeight;
        Camera.__super__.constructor.call(this, 70, width / height, 0.01, 300);
        this.size = new Vector2(width, height);
        this.pivot = new Vector2;
        this.move = new Vector3;
        this.moveSpeed = 4;
        this.maxDist = this.far / 4;
        this.minDist = 1;
        this.center = new Vector3;
        this.center.x = prefs.get('camera▸x', 0);
        this.center.y = prefs.get('camera▸y', 0);
        this.center.z = prefs.get('camera▸z', 0);
        this.dist = prefs.get('camera▸dist', 10);
        this.degree = prefs.get('camera▸degree', 0);
        this.rotate = prefs.get('camera▸rotate', 0);
        this.wheelInert = 0;
        this.animations = [];
        this.elem.addEventListener('mousewheel', this.onMouseWheel);
        this.elem.addEventListener('mousedown', this.onMouseDown);
        this.elem.addEventListener('keypress', this.onKeyPress);
        this.elem.addEventListener('keyrelease', this.onKeyRelease);
        this.elem.addEventListener('dblclick', this.onDblClick);
        this.gamepad = new gamepad;
        this.gamepad.on('button', this.onPadButton);
        this.gamepad.on('axis', this.onPadAxis);
        this.update();
        requestAnimationFrame(this.animationStep);
    }

    Camera.prototype.reset = function() {
        this.center = new Vector3;
        this.dist = 10;
        this.rotate = 0;
        this.degree = 0;
        this.moveSpeed = 4;
        this.stopPivot();
        this.stopMoving();
        return this.update();
    };

    Camera.prototype.incrementMoveSpeed = function() {
        this.moveSpeed *= 1.5;
        return this.moveSpeed = min(20, this.moveSpeed);
    };

    Camera.prototype.decrementMoveSpeed = function() {
        this.moveSpeed /= 1.5;
        return this.moveSpeed = max(1, this.moveSpeed);
    };

    Camera.prototype.getPosition = function() {
        return this.position;
    };

    Camera.prototype.getDir = function() {
        return new Vector3(0, 0, -1).applyQuaternion(this.quaternion);
    };

    Camera.prototype.getUp = function() {
        return new Vector3(0, 1, 0).applyQuaternion(this.quaternion);
    };

    Camera.prototype.getRight = function() {
        return new Vector3(1, 0, 0).applyQuaternion(this.quaternion);
    };

    Camera.prototype.del = function() {
        this.elem.removeEventListener('keypress', this.onKeyPress);
        this.elem.removeEventListener('keyrelease', this.onKeyRelease);
        this.elem.removeEventListener('mousewheel', this.onMouseWheel);
        this.elem.removeEventListener('mousedown', this.onMouseDown);
        this.elem.removeEventListener('dblclick', this.onDblClick);
        window.removeEventListener('mouseup', this.onMouseUp);
        return window.removeEventListener('mousemove', this.onMouseDrag);
    };

    Camera.prototype.onMouseDown = function(event) {
        this.downButtons = event.buttons;
        this.mouseMoved = false;
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;
        this.downPos = kpos(this.mouseX, this.mouseY);
        window.addEventListener('mousemove', this.onMouseDrag);
        return window.addEventListener('mouseup', this.onMouseUp);
    };

    Camera.prototype.onMouseUp = function(event) {
        window.removeEventListener('mousemove', this.onMouseDrag);
        return window.removeEventListener('mouseup', this.onMouseUp);
    };

    Camera.prototype.onDblClick = function(event) {};

    Camera.prototype.onMouseDrag = function(event) {
        var s, x, y;
        x = event.clientX - this.mouseX;
        y = event.clientY - this.mouseY;
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;
        if (this.downPos.dist(kpos(this.mouseX, this.mouseY)) > 60) {
            this.mouseMoved = true;
        }
        if (event.buttons & 4) {
            s = this.dist <= this.minDist && 10 || this.dist;
            this.pan(x * 2 * s / this.size.x, y * s / this.size.y);
        }
        if (event.buttons & 2) {
            return this.setPivot(new Vector2(360 * x / this.size.x, 180 * y / this.size.y));
        }
    };

    Camera.prototype.animate = function(func) {
        return this.animations.push(func);
    };

    Camera.prototype.animationStep = function() {
        var animation, delta, i, len, now, oldAnimations;
        now = window.performance.now();
        delta = (now - this.lastAnimationTime) * 0.001;
        this.lastAnimationTime = now;
        oldAnimations = this.animations.clone();
        this.animations = [];
        for (i = 0, len = oldAnimations.length; i < len; i++) {
            animation = oldAnimations[i];
            animation(delta);
        }
        return requestAnimationFrame(this.animationStep);
    };

    Camera.prototype.onPadButton = function(button, value) {
        if (value) {
            switch (button) {
                case 'A':
                    return this.reset();
                case 'LB':
                    return this.startMoveDown();
                case 'RB':
                    return this.startMoveUp();
                case 'X':
                    return this.decrementMoveSpeed();
                case 'Y':
                    return this.incrementMoveSpeed();
            }
        } else {
            switch (button) {
                case 'LB':
                    return this.stopMoveDown();
                case 'RB':
                    return this.stopMoveUp();
            }
        }
    };

    Camera.prototype.onPadAxis = function(state) {
        var update;
        if (state.left.x || state.left.y) {
            this.move.z = -state.left.y * 4.0;
            this.move.x = state.left.x * 4.0;
            this.startMove();
            update = true;
        } else if (empty(state.buttons)) {
            this.stopMoving();
        }
        if (state.right.x || state.right.y) {
            this.pivot.x = state.right.x;
            this.pivot.y = -state.right.y;
            this.startPivot();
            update = true;
        } else if (empty(state.buttons)) {
            this.stopPivot();
        }
        if (update) {
            return this.update();
        }
    };

    Camera.prototype.setPivot = function(p) {
        this.rotate += -p.x;
        this.degree += -p.y;
        return this.update();
    };

    Camera.prototype.startPivotLeft = function() {
        this.pivot.x = -1;
        return this.startPivot();
    };

    Camera.prototype.startPivotRight = function() {
        this.pivot.x = 1;
        return this.startPivot();
    };

    Camera.prototype.startPivotUp = function() {
        this.pivot.y = -1;
        return this.startPivot();
    };

    Camera.prototype.startPivotDown = function() {
        this.pivot.y = 1;
        return this.startPivot();
    };

    Camera.prototype.stopPivotLeft = function() {
        return this.pivot.x = max(0, this.pivot.x);
    };

    Camera.prototype.stopPivotRight = function() {
        return this.pivot.x = min(0, this.pivot.x);
    };

    Camera.prototype.stopPivotUp = function() {
        return this.pivot.y = max(0, this.pivot.y);
    };

    Camera.prototype.stopPivotDown = function() {
        return this.pivot.y = min(0, this.pivot.y);
    };

    Camera.prototype.stopPivot = function() {
        this.pivoting = false;
        return this.pivot.set(0, 0);
    };

    Camera.prototype.startPivot = function() {
        if (!this.pivoting) {
            this.animate(this.pivotCenter);
            return this.pivoting = true;
        }
    };

    Camera.prototype.pivotCenter = function(deltaSeconds) {
        if (!this.pivoting) {
            return;
        }
        this.setPivot(this.pivot);
        if (this.pivot.length() > 0.001) {
            return this.animate(this.pivotCenter);
        } else {
            return this.stopPivot();
        }
    };

    Camera.prototype.pan = function(x, y) {
        var ref2, right, up;
        right = new Vector3(-x, 0, 0);
        right.applyQuaternion(this.quaternion);
        up = new Vector3(0, y, 0);
        up.applyQuaternion(this.quaternion);
        this.center.add(right.add(up));
        if ((ref2 = this.centerTarget) != null) {
            ref2.copy(this.center);
        }
        return this.update();
    };

    Camera.prototype.focusOnPos = function(v) {
        this.centerTarget = new Vector3(v);
        this.center = new Vector3(v);
        return this.update();
    };

    Camera.prototype.fadeToPos = function(v) {
        this.centerTarget = v.clone();
        return this.startFadeCenter();
    };

    Camera.prototype.startFadeCenter = function() {
        if (!this.fading) {
            this.animate(this.fadeCenter);
            return this.fading = true;
        }
    };

    Camera.prototype.fadeCenter = function(deltaSeconds) {
        if (!this.fading) {
            return;
        }
        this.center.lerp(this.centerTarget, deltaSeconds);
        this.update();
        if (this.center.distanceTo(this.centerTarget) > 0.001) {
            return this.animate(this.fadeCenter);
        } else {
            return delete this.fading;
        }
    };

    Camera.prototype.setPivotCenter = function(pos) {
        var dist;
        dist = this.position.distanceTo(pos);
        this.dist = clamp(this.minDist, this.maxDist, dist);
        this.center.copy(this.position);
        this.center.add(this.getDir().multiplyScalar(this.dist));
        return this.fadeToPos(pos);
    };

    Camera.prototype.resetDist = function() {
        if (this.dist > this.minDist) {
            this.dist = this.minDist;
            this.center.copy(this.position);
            return this.center.add(this.getDir().multiplyScalar(this.dist));
        }
    };

    Camera.prototype.moveFactor = function() {
        return 1.0;
    };

    Camera.prototype.startMoveRight = function() {
        this.move.x = this.moveFactor();
        return this.startMove();
    };

    Camera.prototype.startMoveLeft = function() {
        this.move.x = -this.moveFactor();
        return this.startMove();
    };

    Camera.prototype.startMoveUp = function() {
        this.move.y = this.moveFactor();
        return this.startMove();
    };

    Camera.prototype.startMoveDown = function() {
        this.move.y = -this.moveFactor();
        return this.startMove();
    };

    Camera.prototype.startMoveBackward = function() {
        this.move.z = this.moveFactor();
        return this.startMove();
    };

    Camera.prototype.startMoveForward = function() {
        this.move.z = -this.moveFactor();
        return this.startMove();
    };

    Camera.prototype.stopMoveRight = function() {
        return this.move.x = min(0, this.move.x);
    };

    Camera.prototype.stopMoveLeft = function() {
        return this.move.x = max(0, this.move.x);
    };

    Camera.prototype.stopMoveUp = function() {
        return this.move.y = min(0, this.move.y);
    };

    Camera.prototype.stopMoveDown = function() {
        return this.move.y = max(0, this.move.y);
    };

    Camera.prototype.stopMoveBackward = function() {
        return this.move.z = min(0, this.move.z);
    };

    Camera.prototype.stopMoveForward = function() {
        return this.move.z = max(0, this.move.z);
    };

    Camera.prototype.startMove = function() {
        if (this.move.x || this.move.y) {
            this.resetDist();
        }
        this.fading = false;
        if (!this.moving) {
            this.animate(this.moveCenter);
            return this.moving = true;
        }
    };

    Camera.prototype.stopMoving = function() {
        this.moving = false;
        return this.move.set(0, 0, 0);
    };

    Camera.prototype.moveCenter = function(deltaSeconds) {
        var dir;
        if (!this.moving) {
            return;
        }
        dir = this.move.clone();
        dir.multiplyScalar(deltaSeconds * this.moveSpeed);
        dir.applyQuaternion(this.quaternion);
        if (this.move.z && (!this.move.y) && (!this.move.x) && this.dist > this.minDist) {
            this.dist += this.move.z / 16.0;
        } else {
            this.center.add(dir);
        }
        this.update();
        if (this.move.length() > 0.001) {
            return this.animate(this.moveCenter);
        } else {
            return this.stopMoving();
        }
    };

    Camera.prototype.onMouseWheel = function(event) {
        if (this.wheelInert > 0 && event.wheelDelta < 0) {
            this.wheelInert = 0;
            return;
        }
        if (this.wheelInert < 0 && event.wheelDelta > 0) {
            this.wheelInert = 0;
            return;
        }
        this.wheelInert += event.wheelDelta * (1 + (this.dist / this.maxDist) * 3) * 0.0001;
        return this.startZoom();
    };

    Camera.prototype.startZoomIn = function() {
        this.wheelInert = (1 + (this.dist / this.maxDist) * 3) * 10;
        return this.startZoom();
    };

    Camera.prototype.startZoomOut = function() {
        this.wheelInert = -(1 + (this.dist / this.maxDist) * 3) * 10;
        return this.startZoom();
    };

    Camera.prototype.startZoom = function() {
        if (!this.zooming) {
            this.animate(this.inertZoom);
            return this.zooming = true;
        }
    };

    Camera.prototype.stopZoom = function() {
        this.wheelInert = 0;
        return this.zooming = false;
    };

    Camera.prototype.inertZoom = function(deltaSeconds) {
        this.setDistFactor(1 - clamp(-0.02, 0.02, this.wheelInert));
        this.wheelInert = reduce(this.wheelInert, deltaSeconds * 0.3);
        if (abs(this.wheelInert) > 0.00001) {
            return this.animate(this.inertZoom);
        } else {
            delete this.zooming;
            return this.wheelInert = 0;
        }
    };

    Camera.prototype.setDistFactor = function(factor) {
        this.dist = clamp(this.minDist, this.maxDist, this.dist * factor);
        return this.update();
    };

    Camera.prototype.setFov = function(fov) {
        return this.fov = max(2.0, min(fov, 175.0));
    };

    Camera.prototype.update = function() {
        var pitchRot;
        this.degree = clamp(-90, 90, this.degree);
        this.quaternion.setFromAxisAngle(new Vector3(0, 1, 0), deg2rad(this.rotate));
        pitchRot = new Quaternion;
        pitchRot.setFromAxisAngle(new Vector3(1, 0, 0), deg2rad(this.degree));
        this.quaternion.multiply(pitchRot);
        this.position.copy(this.center);
        this.position.add(new Vector3(0, 0, this.dist).applyQuaternion(this.quaternion));
        prefs.set('camera▸dist', this.dist);
        prefs.set('camera▸degree', this.degree);
        prefs.set('camera▸rotate', this.rotate);
        prefs.set('camera▸x', this.center.x);
        prefs.set('camera▸y', this.center.y);
        return prefs.set('camera▸z', this.center.z);
    };

    return Camera;

})(PerspectiveCamera);

module.exports = Camera;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FtZXJhLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsiY2FtZXJhLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSxzSUFBQTtJQUFBOzs7O0FBUUEsTUFBMEQsT0FBQSxDQUFRLEtBQVIsQ0FBMUQsRUFBRSxpQkFBRixFQUFTLHFCQUFULEVBQWtCLGlCQUFsQixFQUF5QixxQkFBekIsRUFBa0MsZUFBbEMsRUFBd0MsaUJBQXhDLEVBQStDOztBQUMvQyxPQUE4RCxPQUFBLENBQVEsT0FBUixDQUE5RCxFQUFFLG9CQUFGLEVBQVUsMENBQVYsRUFBNkIsNEJBQTdCLEVBQXlDLHNCQUF6QyxFQUFrRDs7QUFDaEQsY0FBRixFQUFPLGNBQVAsRUFBWTs7QUFFTjs7O0lBRUMsZ0JBQUMsR0FBRDtBQUVDLFlBQUE7UUFGQSwwQ0FBRzs7Ozs7Ozs7Ozs7Ozs7O1FBRUgsSUFBQyxDQUFBLElBQUQsR0FBUztRQUNULEtBQUEsR0FBUyxJQUFJLENBQUM7UUFDZCxNQUFBLEdBQVMsSUFBSSxDQUFDO1FBRWQsd0NBQU0sRUFBTixFQUFVLEtBQUEsR0FBTSxNQUFoQixFQUF3QixJQUF4QixFQUE4QixHQUE5QjtRQUVBLElBQUMsQ0FBQSxJQUFELEdBQWMsSUFBSSxPQUFKLENBQVksS0FBWixFQUFtQixNQUFuQjtRQUNkLElBQUMsQ0FBQSxLQUFELEdBQWMsSUFBSTtRQUNsQixJQUFDLENBQUEsSUFBRCxHQUFjLElBQUk7UUFDbEIsSUFBQyxDQUFBLFNBQUQsR0FBYztRQUNkLElBQUMsQ0FBQSxPQUFELEdBQWMsSUFBQyxDQUFBLEdBQUQsR0FBSztRQUNuQixJQUFDLENBQUEsT0FBRCxHQUFjO1FBQ2QsSUFBQyxDQUFBLE1BQUQsR0FBYyxJQUFJO1FBQ2xCLElBQUMsQ0FBQSxNQUFNLENBQUMsQ0FBUixHQUFjLEtBQUssQ0FBQyxHQUFOLENBQVUsVUFBVixFQUFxQixDQUFyQjtRQUNkLElBQUMsQ0FBQSxN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QUFRLENBQUMsSUFBVixDQUFlLElBQUMsQ0FBQSxNQUFoQjtRQUNBLElBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLElBQUksT0FBSixDQUFZLENBQVosRUFBYyxDQUFkLEVBQWdCLElBQUMsQ0FBQSxJQUFqQixDQUFzQixDQUFDLGVBQXZCLENBQXVDLElBQUMsQ0FBQSxVQUF4QyxDQUFkO1FBRUEsS0FBSyxDQUFDLEdBQU4sQ0FBVSxhQUFWLEVBQTBCLElBQUMsQ0FBQSxJQUEzQjtRQUNBLEtBQUssQ0FBQyxHQUFOLENBQVUsZUFBVixFQUEwQixJQUFDLENBQUEsTUFBM0I7UUFDQSxLQUFLLENBQUMsR0FBTixDQUFVLGVBQVYsRUFBMEIsSUFBQyxDQUFBLE1BQTNCO1FBQ0EsS0FBSyxDQUFDLEdBQU4sQ0FBVSxVQUFWLEVBQXFCLElBQUMsQ0FBQSxNQUFNLENBQUMsQ0FBN0I7UUFDQSxLQUFLLENBQUMsR0FBTixDQUFVLFVBQVYsRUFBcUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxDQUE3QjtlQUNBLEtBQUssQ0FBQyxHQUFOLENBQVUsVUFBVixFQUFxQixJQUFDLENBQUEsTUFBTSxDQUFDLENBQTdCO0lBbkJJOzs7O0dBdGFTOztBQTJickIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMDBcbjAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbnsgY2xhbXAsIGRlZzJyYWQsIGVtcHR5LCBnYW1lcGFkLCBrcG9zLCBwcmVmcywgcmVkdWNlIH0gPSByZXF1aXJlICdreGsnXG57IENhbWVyYSwgUGVyc3BlY3RpdmVDYW1lcmEsIFF1YXRlcm5pb24sIFZlY3RvcjIsIFZlY3RvcjMgfSA9IHJlcXVpcmUgJ3RocmVlJ1xueyBhYnMsIG1heCwgbWluIH0gPSBNYXRoXG5cbmNsYXNzIENhbWVyYSBleHRlbmRzIFBlcnNwZWN0aXZlQ2FtZXJhXG5cbiAgICBAOiAodmlldzopIC0+XG4gICAgICAgIFxuICAgICAgICBAZWxlbSAgPSB2aWV3XG4gICAgICAgIHdpZHRoICA9IHZpZXcuY2xpZW50V2lkdGhcbiAgICAgICAgaGVpZ2h0ID0gdmlldy5jbGllbnRIZWlnaHRcbiAgICAgICAgXG4gICAgICAgIHN1cGVyIDcwLCB3aWR0aC9oZWlnaHQsIDAuMDEsIDMwMCAjIGZvdiwgYXNwZWN0LCBuZWFyLCBmYXJcbiAgICAgICAgXG4gICAgICAgIEBzaXplICAgICAgID0gbmV3IFZlY3RvcjIgd2lkdGgsIGhlaWdodCBcbiAgICAgICAgQHBpdm90ICAgICAgPSBuZXcgVmVjdG9yMlxuICAgICAgICBAbW92ZSAgICAgICA9IG5ldyBWZWN0b3IzXG4gICAgICAgIEBtb3ZlU3BlZWQgID0gNFxuICAgICAgICBAbWF4RGlzdCAgICA9IEBmYXIvNFxuICAgICAgICBAbWluRGlzdCAgICA9IDFcbiAgICAgICAgQGNlbnRlciAgICAgPSBuZXcgVmVjdG9yMyBcbiAgICAgICAgQGNlbnRlci54ICAgPSBwcmVmcy5nZXQgJ2NhbWVyYeKWuHgnIDAgXG4gICAgICAgIEBjZW50ZXIueSAgID0gcHJlZnMuZ2V0ICdjYW1lcmHilrh5JyAwIFxuICAgICAgICBAY2VudGVyLnogICA9IHByZWZzLmdldCAnY2FtZXJh4pa4eicgMFxuICAgICAgICBAZGlzdCAgICAgICA9IHByZWZzLmdldCAnY2FtZXJh4pa4ZGlzdCcgIDEwXG4gICAgICAgIEBkZWdyZWUgICAgID0gcHJlZnMuZ2V0ICdjYW1lcmHilrhkZWdyZWUnIDBcbiAgICAgICAgQHJvdGF0ZSAgICAgPSBwcmVmcy5nZXQgJ2NhbWVyYeKWuHJvdGF0ZScgMFxuICAgICAgICBAd2hlZWxJbmVydCA9IDBcbiAgICAgICAgQGFuaW1hdGlvbnMgPSBbXVxuXG4gICAgICAgIEBlbGVtLmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNld2hlZWwnIEBvbk1vdXNlV2hlZWxcbiAgICAgICAgQGVsZW0uYWRkRXZlbnRMaXN0ZW5lciAnbW91c2Vkb3duJyAgQG9uTW91c2VEb3duXG4gICAgICAgIEBlbGVtLmFkZEV2ZW50TGlzdGVuZXIgJ2tleXByZXNzJyAgIEBvbktleVByZXNzXG4gICAgICAgIEBlbGVtLmFkZEV2ZW50TGlzdGVuZXIgJ2tleXJlbGVhc2UnIEBvbktleVJlbGVhc2VcbiAgICAgICAgQGVsZW0uYWRkRXZlbnRMaXN0ZW5lciAnZGJsY2xpY2snICAgQG9uRGJsQ2xpY2tcbiAgICAgICAgXG4gICAgICAgIEBnYW1lcGFkID0gbmV3IGdhbWVwYWRcbiAgICAgICAgQGdhbWVwYWQub24gJ2J1dHRvbicgQG9uUGFkQnV0dG9uXG4gICAgICAgIEBnYW1lcGFkLm9uICdheGlzJyAgIEBvblBhZEF4aXNcbiAgICAgICAgXG4gICAgICAgIEB1cGRhdGUoKVxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgQGFuaW1hdGlvblN0ZXBcbiAgICBcbiAgICByZXNldDogLT5cbiAgICAgICAgXG4gICAgICAgIEBjZW50ZXIgICAgPSBuZXcgVmVjdG9yMyBcbiAgICAgICAgQGRpc3QgICAgICA9IDEwXG4gICAgICAgIEByb3RhdGUgICAgPSAwXG4gICAgICAgIEBkZWdyZWUgICAgPSAwXG4gICAgICAgIEBtb3ZlU3BlZWQgPSA0XG4gICAgICAgIFxuICAgICAgICBAc3RvcFBpdm90KClcbiAgICAgICAgQHN0b3BNb3ZpbmcoKVxuICAgICAgICBAdXBkYXRlKClcbiAgICAgICAgXG4gICAgaW5jcmVtZW50TW92ZVNwZWVkOiAtPiBAbW92ZVNwZWVkICo9IDEuNTsgQG1vdmVTcGVlZCA9IG1pbiAyMCBAbW92ZVNwZWVkOyAja2xvZyAnbW92ZVNwZWVkJyBAbW92ZVNwZWVkXG4gICAgZGVjcmVtZW50TW92ZVNwZWVkOiAtPiBAbW92ZVNwZWVkIC89IDEuNTsgQG1vdmVTcGVlZCA9IG1heCAxICBAbW92ZVNwZWVkOyAja2xvZyAnbW92ZVNwZWVkJyBAbW92ZVNwZWVkXG4gICAgXG4gICAgZ2V0UG9zaXRpb246IC0+IEBwb3NpdGlvblxuICAgIGdldERpcjogICAgICAtPiBuZXcgVmVjdG9yMygwIDAgLTEpLmFwcGx5UXVhdGVybmlvbiBAcXVhdGVybmlvbiBcbiAgICBnZXRVcDogICAgICAgLT4gbmV3IFZlY3RvcjMoMCAxICAwKS5hcHBseVF1YXRlcm5pb24gQHF1YXRlcm5pb24gIFxuICAgIGdldFJpZ2h0OiAgICAtPiBuZXcgVmVjdG9yMygxIDAgIDApLmFwcGx5UXVhdGVybmlvbiBAcXVhdGVybmlvbiAgXG5cbiAgICBkZWw6ID0+XG4gICAgICAgIFxuICAgICAgICBAZWxlbS5yZW1vdmVFdmVudExpc3RlbmVyICAna2V5cHJlc3MnICAgQG9uS2V5UHJlc3NcbiAgICAgICAgQGVsZW0ucmVtb3ZlRXZlbnRMaXN0ZW5lciAgJ2tleXJlbGVhc2UnIEBvbktleVJlbGVhc2VcbiAgICAgICAgQGVsZW0ucmVtb3ZlRXZlbnRMaXN0ZW5lciAgJ21vdXNld2hlZWwnIEBvbk1vdXNlV2hlZWxcbiAgICAgICAgQGVsZW0ucmVtb3ZlRXZlbnRMaXN0ZW5lciAgJ21vdXNlZG93bicgIEBvbk1vdXNlRG93blxuICAgICAgICBAZWxlbS5yZW1vdmVFdmVudExpc3RlbmVyICAnZGJsY2xpY2snICAgQG9uRGJsQ2xpY2tcbiAgICAgICAgXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyICdtb3VzZXVwJyAgICBAb25Nb3VzZVVwXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyICdtb3VzZW1vdmUnICBAb25Nb3VzZURyYWcgXG4gICAgICAgIFxuICAgICMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgb25Nb3VzZURvd246IChldmVudCkgPT4gXG4gICAgICAgIFxuICAgICAgICBAZG93bkJ1dHRvbnMgPSBldmVudC5idXR0b25zXG4gICAgICAgIEBtb3VzZU1vdmVkICA9IGZhbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgQG1vdXNlWCA9IGV2ZW50LmNsaWVudFhcbiAgICAgICAgQG1vdXNlWSA9IGV2ZW50LmNsaWVudFlcbiAgICAgICAgXG4gICAgICAgIEBkb3duUG9zID0ga3BvcyBAbW91c2VYLCBAbW91c2VZXG4gICAgICAgIFxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2Vtb3ZlJyBAb25Nb3VzZURyYWdcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNldXAnICAgQG9uTW91c2VVcFxuICAgICAgICBcbiAgICBvbk1vdXNlVXA6IChldmVudCkgPT4gXG5cbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIgJ21vdXNlbW92ZScgQG9uTW91c2VEcmFnXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyICdtb3VzZXVwJyAgIEBvbk1vdXNlVXBcbiAgICAgICAgXG4gICAgb25EYmxDbGljazogKGV2ZW50KSA9PlxuICAgICAgICBcbiAgICBvbk1vdXNlRHJhZzogKGV2ZW50KSA9PlxuXG4gICAgICAgIHggPSBldmVudC5jbGllbnRYLUBtb3VzZVhcbiAgICAgICAgeSA9IGV2ZW50LmNsaWVudFktQG1vdXNlWVxuICAgICAgICBcbiAgICAgICAgQG1vdXNlWCA9IGV2ZW50LmNsaWVudFhcbiAgICAgICAgQG1vdXNlWSA9IGV2ZW50LmNsaWVudFlcbiAgICAgICAgXG4gICAgICAgIGlmIEBkb3duUG9zLmRpc3Qoa3BvcyBAbW91c2VYLCBAbW91c2VZKSA+IDYwXG4gICAgICAgICAgICBAbW91c2VNb3ZlZCA9IHRydWVcbiAgICAgICAgXG4gICAgICAgIGlmIGV2ZW50LmJ1dHRvbnMgJiA0XG4gICAgICAgICAgICBzID0gQGRpc3QgPD0gQG1pbkRpc3QgYW5kIDEwIG9yIEBkaXN0XG4gICAgICAgICAgICBAcGFuIHgqMipzL0BzaXplLngsIHkqcy9Ac2l6ZS55XG4gICAgICAgICAgICBcbiAgICAgICAgaWYgZXZlbnQuYnV0dG9ucyAmIDJcbiAgICAgICAgICAgIEBzZXRQaXZvdCBuZXcgVmVjdG9yMiAzNjAqeC9Ac2l6ZS54LCAxODAqeS9Ac2l6ZS55XG4gICAgICBcbiAgICBhbmltYXRlOiAoZnVuYykgLT5cbiAgICAgICAgXG4gICAgICAgIEBhbmltYXRpb25zLnB1c2ggZnVuY1xuICAgICAgICBcbiAgICBhbmltYXRpb25TdGVwOiA9PlxuICAgICAgICBcbiAgICAgICAgIyBpZiBzdGF0ZSA9IEBnYW1lcGFkLmdldFN0YXRlKClcbiAgICAgICAgICAgICMgQG9uUGFkQXhpcyBzdGF0ZVxuICAgICAgICBcbiAgICAgICAgbm93ID0gd2luZG93LnBlcmZvcm1hbmNlLm5vdygpXG4gICAgICAgIGRlbHRhID0gKG5vdyAtIEBsYXN0QW5pbWF0aW9uVGltZSkgKiAwLjAwMVxuICAgICAgICBcbiAgICAgICAgQGxhc3RBbmltYXRpb25UaW1lID0gbm93XG4gICAgICAgIFxuICAgICAgICBvbGRBbmltYXRpb25zID0gQGFuaW1hdGlvbnMuY2xvbmUoKVxuICAgICAgICBAYW5pbWF0aW9ucyA9IFtdXG4gICAgICAgIGZvciBhbmltYXRpb24gaW4gb2xkQW5pbWF0aW9uc1xuICAgICAgICAgICAgYW5pbWF0aW9uIGRlbHRhXG4gICAgICAgIFxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgQGFuaW1hdGlvblN0ZXBcbiAgICBcbiAgICAjIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgICBcbiAgICBvblBhZEJ1dHRvbjogKGJ1dHRvbiwgdmFsdWUpID0+XG4gICAgICAgIFxuICAgICAgICAjIGtsb2cgJ2J1dHRvbicgYnV0dG9uXG4gICAgICAgIGlmIHZhbHVlXG4gICAgICAgICAgICBzd2l0Y2ggYnV0dG9uXG4gICAgICAgICAgICAgICAgd2hlbiAnQScgIHRoZW4gQHJlc2V0KClcbiAgICAgICAgICAgICAgICB3aGVuICdMQicgdGhlbiBAc3RhcnRNb3ZlRG93bigpXG4gICAgICAgICAgICAgICAgd2hlbiAnUkInIHRoZW4gQHN0YXJ0TW92ZVVwKClcbiAgICAgICAgICAgICAgICB3aGVuICdYJyAgdGhlbiBAZGVjcmVtZW50TW92ZVNwZWVkKClcbiAgICAgICAgICAgICAgICB3aGVuICdZJyAgdGhlbiBAaW5jcmVtZW50TW92ZVNwZWVkKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgc3dpdGNoIGJ1dHRvblxuICAgICAgICAgICAgICAgIHdoZW4gJ0xCJyB0aGVuIEBzdG9wTW92ZURvd24oKVxuICAgICAgICAgICAgICAgIHdoZW4gJ1JCJyB0aGVuIEBzdG9wTW92ZVVwKClcbiAgICBcbiAgICBvblBhZEF4aXM6IChzdGF0ZSkgPT4gXG4gICAgXG4gICAgICAgIGlmIHN0YXRlLmxlZnQueCBvciBzdGF0ZS5sZWZ0LnlcbiAgICAgICAgICAgIEBtb3ZlLnogPSAtc3RhdGUubGVmdC55ICogNC4wXG4gICAgICAgICAgICBAbW92ZS54ID0gIHN0YXRlLmxlZnQueCAqIDQuMFxuICAgICAgICAgICAgQHN0YXJ0TW92ZSgpXG4gICAgICAgICAgICB1cGRhdGUgPSB0cnVlXG4gICAgICAgIGVsc2UgaWYgZW1wdHkgc3RhdGUuYnV0dG9uc1xuICAgICAgICAgICAgQHN0b3BNb3ZpbmcoKVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIHN0YXRlLnJpZ2h0Lnggb3Igc3RhdGUucmlnaHQueVxuICAgICAgICAgICAgQHBpdm90LnggPSAgc3RhdGUucmlnaHQueFxuICAgICAgICAgICAgQHBpdm90LnkgPSAtc3RhdGUucmlnaHQueVxuICAgICAgICAgICAgQHN0YXJ0UGl2b3QoKVxuICAgICAgICAgICAgdXBkYXRlID0gdHJ1ZVxuICAgICAgICBlbHNlIGlmIGVtcHR5IHN0YXRlLmJ1dHRvbnNcbiAgICAgICAgICAgIEBzdG9wUGl2b3QoKVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIHVwZGF0ZVxuICAgICAgICAgICAgQHVwZGF0ZSgpXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAgICAwMDAgMDAwICAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAgICAwICAgICAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuICAgIFxuICAgIHNldFBpdm90OiAocCkgLT5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQHJvdGF0ZSArPSAtcC54XG4gICAgICAgIEBkZWdyZWUgKz0gLXAueVxuICAgICAgICBcbiAgICAgICAgQHVwZGF0ZSgpXG4gICAgICAgICAgIFxuICAgIHN0YXJ0UGl2b3RMZWZ0OiAgLT4gQHBpdm90LnggPSAtMTsgQHN0YXJ0UGl2b3QoKVxuICAgIHN0YXJ0UGl2b3RSaWdodDogLT4gQHBpdm90LnggPSAgMTsgQHN0YXJ0UGl2b3QoKVxuXG4gICAgc3RhcnRQaXZvdFVwOiAgICAtPiBAcGl2b3QueSA9IC0xOyBAc3RhcnRQaXZvdCgpXG4gICAgc3RhcnRQaXZvdERvd246ICAtPiBAcGl2b3QueSA9ICAxOyBAc3RhcnRQaXZvdCgpXG5cbiAgICBzdG9wUGl2b3RMZWZ0OiAgIC0+IEBwaXZvdC54ID0gbWF4IDAgQHBpdm90LnhcbiAgICBzdG9wUGl2b3RSaWdodDogIC0+IEBwaXZvdC54ID0gbWluIDAgQHBpdm90LnhcblxuICAgIHN0b3BQaXZvdFVwOiAgICAgLT4gQHBpdm90LnkgPSBtYXggMCBAcGl2b3QueVxuICAgIHN0b3BQaXZvdERvd246ICAgLT4gQHBpdm90LnkgPSBtaW4gMCBAcGl2b3QueVxuICAgIFxuICAgIHN0b3BQaXZvdDogLT5cbiAgICAgICAgXG4gICAgICAgIEBwaXZvdGluZyA9IGZhbHNlXG4gICAgICAgIEBwaXZvdC5zZXQgMCAwXG4gICAgICAgXG4gICAgc3RhcnRQaXZvdDogLT4gXG4gICAgICAgIFxuICAgICAgICBpZiBub3QgQHBpdm90aW5nXG4gICAgICAgICAgICBAYW5pbWF0ZSBAcGl2b3RDZW50ZXJcbiAgICAgICAgICAgIEBwaXZvdGluZyA9IHRydWVcbiAgICAgICAgICAgIFxuICAgIHBpdm90Q2VudGVyOiAoZGVsdGFTZWNvbmRzKSA9PlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBAcGl2b3RpbmdcblxuICAgICAgICBAc2V0UGl2b3QgQHBpdm90XG4gICAgICAgIFxuICAgICAgICBpZiBAcGl2b3QubGVuZ3RoKCkgPiAwLjAwMVxuICAgICAgICAgICAgQGFuaW1hdGUgQHBpdm90Q2VudGVyXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBzdG9wUGl2b3QoKVxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgcGFuOiAoeCx5KSAtPlxuICAgICAgICBcbiAgICAgICAgcmlnaHQgPSBuZXcgVmVjdG9yMyAteCwgMCwgMCBcbiAgICAgICAgcmlnaHQuYXBwbHlRdWF0ZXJuaW9uIEBxdWF0ZXJuaW9uXG5cbiAgICAgICAgdXAgPSBuZXcgVmVjdG9yMyAwLCB5LCAwIFxuICAgICAgICB1cC5hcHBseVF1YXRlcm5pb24gQHF1YXRlcm5pb25cbiAgICAgICAgXG4gICAgICAgIEBjZW50ZXIuYWRkIHJpZ2h0LmFkZCB1cFxuICAgICAgICBAY2VudGVyVGFyZ2V0Py5jb3B5IEBjZW50ZXJcbiAgICAgICAgQHVwZGF0ZSgpXG4gICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAgICAgICAgICAgICAgICAgIFxuICAgIGZvY3VzT25Qb3M6ICh2KSAtPlxuICAgICAgICBcbiAgICAgICAgQGNlbnRlclRhcmdldCA9IG5ldyBWZWN0b3IzIHZcbiAgICAgICAgQGNlbnRlciA9IG5ldyBWZWN0b3IzIHZcbiAgICAgICAgQHVwZGF0ZSgpXG4gICAgICAgICBcbiAgICBmYWRlVG9Qb3M6ICh2KSAtPiBcbiAgICAgICAgQGNlbnRlclRhcmdldCA9IHYuY2xvbmUoKVxuICAgICAgICBAc3RhcnRGYWRlQ2VudGVyKClcblxuICAgIHN0YXJ0RmFkZUNlbnRlcjogLT4gXG4gICAgICAgIFxuICAgICAgICBpZiBub3QgQGZhZGluZ1xuICAgICAgICAgICAgQGFuaW1hdGUgQGZhZGVDZW50ZXJcbiAgICAgICAgICAgIEBmYWRpbmcgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgIFxuICAgIGZhZGVDZW50ZXI6IChkZWx0YVNlY29uZHMpID0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IEBmYWRpbmdcbiAgICAgICAgXG4gICAgICAgIEBjZW50ZXIubGVycCBAY2VudGVyVGFyZ2V0LCBkZWx0YVNlY29uZHNcbiAgICAgICAgQHVwZGF0ZSgpXG4gICAgICAgIFxuICAgICAgICBpZiBAY2VudGVyLmRpc3RhbmNlVG8oQGNlbnRlclRhcmdldCkgPiAwLjAwMVxuICAgICAgICAgICAgQGFuaW1hdGUgQGZhZGVDZW50ZXJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZGVsZXRlIEBmYWRpbmdcblxuICAgIHNldFBpdm90Q2VudGVyOiAocG9zKSAtPlxuICAgICAgICBkaXN0ID0gQHBvc2l0aW9uLmRpc3RhbmNlVG8gcG9zXG4gICAgICAgIEBkaXN0ID0gY2xhbXAgQG1pbkRpc3QsIEBtYXhEaXN0LCBkaXN0XG4gICAgICAgIEBjZW50ZXIuY29weSBAcG9zaXRpb25cbiAgICAgICAgQGNlbnRlci5hZGQgQGdldERpcigpLm11bHRpcGx5U2NhbGFyIEBkaXN0XG4gICAgICAgIEBmYWRlVG9Qb3MgcG9zXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgIHJlc2V0RGlzdDogLT5cbiAgICAgICAgXG4gICAgICAgIGlmIEBkaXN0ID4gQG1pbkRpc3RcbiAgICAgICAgICAgIEBkaXN0ID0gQG1pbkRpc3RcbiAgICAgICAgICAgIEBjZW50ZXIuY29weSBAcG9zaXRpb25cbiAgICAgICAgICAgIEBjZW50ZXIuYWRkIEBnZXREaXIoKS5tdWx0aXBseVNjYWxhciBAZGlzdFxuICAgICAgICAgICAgXG4gICAgIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMCAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgICAgIDAgICAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgbW92ZUZhY3RvcjogLT4gMS4wICNAZGlzdC8yXG4gICAgXG4gICAgc3RhcnRNb3ZlUmlnaHQ6ICAgIC0+IEBtb3ZlLnggPSAgQG1vdmVGYWN0b3IoKTsgQHN0YXJ0TW92ZSgpXG4gICAgc3RhcnRNb3ZlTGVmdDogICAgIC0+IEBtb3ZlLnggPSAtQG1vdmVGYWN0b3IoKTsgQHN0YXJ0TW92ZSgpXG5cbiAgICBzdGFydE1vdmVVcDogICAgICAgLT4gQG1vdmUueSA9ICBAbW92ZUZhY3RvcigpOyBAc3RhcnRNb3ZlKClcbiAgICBzdGFydE1vdmVEb3duOiAgICAgLT4gQG1vdmUueSA9IC1AbW92ZUZhY3RvcigpOyBAc3RhcnRNb3ZlKClcblxuICAgIHN0YXJ0TW92ZUJhY2t3YXJkOiAtPiBAbW92ZS56ID0gIEBtb3ZlRmFjdG9yKCk7IEBzdGFydE1vdmUoKVxuICAgIHN0YXJ0TW92ZUZvcndhcmQ6ICAtPiBAbW92ZS56ID0gLUBtb3ZlRmFjdG9yKCk7IEBzdGFydE1vdmUoKVxuXG4gICAgc3RvcE1vdmVSaWdodDogICAgIC0+IEBtb3ZlLnggPSBtaW4gMCBAbW92ZS54XG4gICAgc3RvcE1vdmVMZWZ0OiAgICAgIC0+IEBtb3ZlLnggPSBtYXggMCBAbW92ZS54XG5cbiAgICBzdG9wTW92ZVVwOiAgICAgICAgLT4gQG1vdmUueSA9IG1pbiAwIEBtb3ZlLnlcbiAgICBzdG9wTW92ZURvd246ICAgICAgLT4gQG1vdmUueSA9IG1heCAwIEBtb3ZlLnlcblxuICAgIHN0b3BNb3ZlQmFja3dhcmQ6ICAtPiBAbW92ZS56ID0gbWluIDAgQG1vdmUuelxuICAgIHN0b3BNb3ZlRm9yd2FyZDogICAtPiBAbW92ZS56ID0gbWF4IDAgQG1vdmUuelxuICAgIFxuICAgIHN0YXJ0TW92ZTogLT4gXG4gICAgICAgIFxuICAgICAgICBpZiBAbW92ZS54IG9yIEBtb3ZlLnlcbiAgICAgICAgICAgIEByZXNldERpc3QoKVxuICAgICAgICAgICAgXG4gICAgICAgIEBmYWRpbmcgPSBmYWxzZVxuICAgICAgICBpZiBub3QgQG1vdmluZ1xuICAgICAgICAgICAgQGFuaW1hdGUgQG1vdmVDZW50ZXJcbiAgICAgICAgICAgIEBtb3ZpbmcgPSB0cnVlXG4gICAgICAgICAgICBcbiAgICBzdG9wTW92aW5nOiAtPlxuICAgICAgICBcbiAgICAgICAgQG1vdmluZyA9IGZhbHNlXG4gICAgICAgIEBtb3ZlLnNldCAwIDAgMFxuICAgICAgICBcbiAgICBtb3ZlQ2VudGVyOiAoZGVsdGFTZWNvbmRzKSA9PlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBAbW92aW5nXG4gICAgICAgIFxuICAgICAgICBkaXIgPSBAbW92ZS5jbG9uZSgpXG4gICAgICAgIGRpci5tdWx0aXBseVNjYWxhciBkZWx0YVNlY29uZHMqQG1vdmVTcGVlZFxuICAgICAgICBkaXIuYXBwbHlRdWF0ZXJuaW9uIEBxdWF0ZXJuaW9uXG4gICAgICAgIFxuICAgICAgICBpZiBAbW92ZS56IGFuZCAobm90IEBtb3ZlLnkpIGFuZCAobm90IEBtb3ZlLngpIGFuZCBAZGlzdCA+IEBtaW5EaXN0XG4gICAgICAgICAgICBAZGlzdCArPSBAbW92ZS56LzE2LjBcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGNlbnRlci5hZGQgZGlyXG4gICAgICAgICAgICBcbiAgICAgICAgQHVwZGF0ZSgpXG4gICAgICAgIFxuICAgICAgICBpZiBAbW92ZS5sZW5ndGgoKSA+IDAuMDAxXG4gICAgICAgICAgICBAYW5pbWF0ZSBAbW92ZUNlbnRlclxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc3RvcE1vdmluZygpXG4gICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICBcbiAgICBcbiAgICBvbk1vdXNlV2hlZWw6IChldmVudCkgPT4gXG4gICAgXG4gICAgICAgIGlmIEB3aGVlbEluZXJ0ID4gMCBhbmQgZXZlbnQud2hlZWxEZWx0YSA8IDBcbiAgICAgICAgICAgIEB3aGVlbEluZXJ0ID0gMFxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgQHdoZWVsSW5lcnQgPCAwIGFuZCBldmVudC53aGVlbERlbHRhID4gMFxuICAgICAgICAgICAgQHdoZWVsSW5lcnQgPSAwXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIFxuICAgICAgICBAd2hlZWxJbmVydCArPSBldmVudC53aGVlbERlbHRhICogKDErKEBkaXN0L0BtYXhEaXN0KSozKSAqIDAuMDAwMVxuICAgICAgICBcbiAgICAgICAgQHN0YXJ0Wm9vbSgpXG5cbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMCAgICAgMDAgIFxuICAgICMgICAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAgIDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG5cbiAgICBzdGFydFpvb21JbjogLT5cbiAgICAgICAgXG4gICAgICAgIEB3aGVlbEluZXJ0ID0gKDErKEBkaXN0L0BtYXhEaXN0KSozKSoxMFxuICAgICAgICBAc3RhcnRab29tKClcbiAgICAgICAgXG4gICAgc3RhcnRab29tT3V0OiAtPlxuICAgICAgICBcbiAgICAgICAgQHdoZWVsSW5lcnQgPSAtKDErKEBkaXN0L0BtYXhEaXN0KSozKSoxMFxuICAgICAgICBAc3RhcnRab29tKClcbiAgICBcbiAgICBzdGFydFpvb206IC0+IFxuICAgICAgICBcbiAgICAgICAgaWYgbm90IEB6b29taW5nXG4gICAgICAgICAgICBAYW5pbWF0ZSBAaW5lcnRab29tXG4gICAgICAgICAgICBAem9vbWluZyA9IHRydWVcbiAgICAgICAgICAgIFxuICAgIHN0b3Bab29tOiAtPiBcbiAgICAgICAgXG4gICAgICAgIEB3aGVlbEluZXJ0ID0gMFxuICAgICAgICBAem9vbWluZyA9IGZhbHNlXG4gICAgXG4gICAgaW5lcnRab29tOiAoZGVsdGFTZWNvbmRzKSA9PlxuXG4gICAgICAgIEBzZXREaXN0RmFjdG9yIDEgLSBjbGFtcCAtMC4wMiwgMC4wMiwgQHdoZWVsSW5lcnRcbiAgICAgICAgQHdoZWVsSW5lcnQgPSByZWR1Y2UgQHdoZWVsSW5lcnQsIGRlbHRhU2Vjb25kcyowLjNcbiAgICAgICAgXG4gICAgICAgIGlmIGFicyhAd2hlZWxJbmVydCkgPiAwLjAwMDAxXG4gICAgICAgICAgICBAYW5pbWF0ZSBAaW5lcnRab29tXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGRlbGV0ZSBAem9vbWluZ1xuICAgICAgICAgICAgQHdoZWVsSW5lcnQgPSAwXG4gICAgXG4gICAgc2V0RGlzdEZhY3RvcjogKGZhY3RvcikgPT5cbiAgICAgICAgXG4gICAgICAgIEBkaXN0ID0gY2xhbXAgQG1pbkRpc3QsIEBtYXhEaXN0LCBAZGlzdCpmYWN0b3JcbiAgICAgICAgQHVwZGF0ZSgpXG4gICAgICAgIFxuICAgIHNldEZvdjogKGZvdikgLT4gQGZvdiA9IG1heCgyLjAsIG1pbiBmb3YsIDE3NS4wKVxuICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwICAgICAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgdXBkYXRlOiAtPiBcbiAgICAgICAgXG4gICAgICAgIEBkZWdyZWUgPSBjbGFtcCAtOTAgOTAgQGRlZ3JlZVxuICAgICAgICBcbiAgICAgICAgQHF1YXRlcm5pb24uc2V0RnJvbUF4aXNBbmdsZSBuZXcgVmVjdG9yMygwIDEgMCksIGRlZzJyYWQgQHJvdGF0ZVxuXG4gICAgICAgIHBpdGNoUm90ID0gbmV3IFF1YXRlcm5pb25cbiAgICAgICAgcGl0Y2hSb3Quc2V0RnJvbUF4aXNBbmdsZSBuZXcgVmVjdG9yMygxIDAgMCksIGRlZzJyYWQgQGRlZ3JlZVxuICAgICAgICBcbiAgICAgICAgQHF1YXRlcm5pb24ubXVsdGlwbHkgcGl0Y2hSb3RcbiAgICAgICAgXG4gICAgICAgIEBwb3NpdGlvbi5jb3B5IEBjZW50ZXJcbiAgICAgICAgQHBvc2l0aW9uLmFkZCBuZXcgVmVjdG9yMygwIDAgQGRpc3QpLmFwcGx5UXVhdGVybmlvbiBAcXVhdGVybmlvblxuICAgICAgICBcbiAgICAgICAgcHJlZnMuc2V0ICdjYW1lcmHilrhkaXN0JyAgIEBkaXN0XG4gICAgICAgIHByZWZzLnNldCAnY2FtZXJh4pa4ZGVncmVlJyBAZGVncmVlXG4gICAgICAgIHByZWZzLnNldCAnY2FtZXJh4pa4cm90YXRlJyBAcm90YXRlXG4gICAgICAgIHByZWZzLnNldCAnY2FtZXJh4pa4eCcgQGNlbnRlci54IFxuICAgICAgICBwcmVmcy5zZXQgJ2NhbWVyYeKWuHknIEBjZW50ZXIueSAgXG4gICAgICAgIHByZWZzLnNldCAnY2FtZXJh4pa4eicgQGNlbnRlci56XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FtZXJhXG4iXX0=
//# sourceURL=../coffee/camera.coffee