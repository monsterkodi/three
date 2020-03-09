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
            s = this.dist;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FtZXJhLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsiY2FtZXJhLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSxzSUFBQTtJQUFBOzs7O0FBUUEsTUFBMEQsT0FBQSxDQUFRLEtBQVIsQ0FBMUQsRUFBRSxpQkFBRixFQUFTLHFCQUFULEVBQWtCLGlCQUFsQixFQUF5QixxQkFBekIsRUFBa0MsZUFBbEMsRUFBd0MsaUJBQXhDLEVBQStDOztBQUMvQyxPQUE4RCxPQUFBLENBQVEsT0FBUixDQUE5RCxFQUFFLG9CQUFGLEVBQVUsMENBQVYsRUFBNkIsNEJBQTdCLEVBQXlDLHNCQUF6QyxFQUFrRDs7QUFDaEQsY0FBRixFQUFPLGNBQVAsRUFBWTs7QUFFTjs7O0lBRUMsZ0JBQUMsR0FBRDtBQUVDLFlBQUE7UUFGQSwwQ0FBRzs7Ozs7Ozs7Ozs7Ozs7O1FBRUgsSUFBQyxDQUFBLElBQUQsR0FBUztRQUNULEtBQUEsR0FBUyxJQUFJLENBQUM7UUFDZCxNQUFBLEdBQVMsSUFBSSxDQUFDO1FBRWQsd0NBQU0sRUFBTixFQUFVLEtBQUEsR0FBTSxNQUFoQixFQUF3QixJQUF4QixFQUE4QixHQUE5QjtRQUVBLElBQUMsQ0FBQSxJQUFELEdBQWMsSUFBSSxPQUFKLENBQVksS0FBWixFQUFtQixNQUFuQjtRQUNkLElBQUMsQ0FBQSxLQUFELEdBQWMsSUFBSTtRQUNsQixJQUFDLENBQUEsSUFBRCxHQUFjLElBQUk7UUFDbEIsSUFBQyxDQUFBLFNBQUQsR0FBYztRQUNkLElBQUMsQ0FBQSxPQUFELEdBQWMsSUFBQyxDQUFBLEdBQUQsR0FBSztRQUNuQixJQUFDLENBQUEsT0FBRCxHQUFjO1FBQ2QsSUFBQyxDQUFBLE1BQUQsR0FBYyxJQUFJO1FBQ2xCLElBQUMsQ0FBQSxNQUFNLENBQUMsQ0FBUixHQUFjLEtBQUssQ0FBQyxHQUFOLENBQVUsVUFBVixFQUFxQixDQUFyQjtRQUNkLElBQUMsQ0FBQSxN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USxDQUFDLEdBQVYsQ0FBYyxJQUFJLE9BQUosQ0FBWSxDQUFaLEVBQWMsQ0FBZCxFQUFnQixJQUFDLENBQUEsSUFBakIsQ0FBc0IsQ0FBQyxlQUF2QixDQUF1QyxJQUFDLENBQUEsVUFBeEMsQ0FBZDtRQUVBLEtBQUssQ0FBQyxHQUFOLENBQVUsYUFBVixFQUEwQixJQUFDLENBQUEsSUFBM0I7UUFDQSxLQUFLLENBQUMsR0FBTixDQUFVLGVBQVYsRUFBMEIsSUFBQyxDQUFBLE1BQTNCO1FBQ0EsS0FBSyxDQUFDLEdBQU4sQ0FBVSxlQUFWLEVBQTBCLElBQUMsQ0FBQSxNQUEzQjtRQUNBLEtBQUssQ0FBQyxHQUFOLENBQVUsVUFBVixFQUFxQixJQUFDLENBQUEsTUFBTSxDQUFDLENBQTdCO1FBQ0EsS0FBSyxDQUFDLEdBQU4sQ0FBVSxVQUFWLEVBQXFCLElBQUMsQ0FBQSxNQUFNLENBQUMsQ0FBN0I7ZUFDQSxLQUFLLENBQUMsR0FBTixDQUFVLFVBQVYsRUFBcUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxDQUE3QjtJQW5CSTs7OztHQTFhUzs7QUErYnJCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwIFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDBcbjAwMCAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDAwXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDBcbiMjI1xuXG57IGNsYW1wLCBkZWcycmFkLCBlbXB0eSwgZ2FtZXBhZCwga3BvcywgcHJlZnMsIHJlZHVjZSB9ID0gcmVxdWlyZSAna3hrJ1xueyBDYW1lcmEsIFBlcnNwZWN0aXZlQ2FtZXJhLCBRdWF0ZXJuaW9uLCBWZWN0b3IyLCBWZWN0b3IzIH0gPSByZXF1aXJlICd0aHJlZSdcbnsgYWJzLCBtYXgsIG1pbiB9ID0gTWF0aFxuXG5jbGFzcyBDYW1lcmEgZXh0ZW5kcyBQZXJzcGVjdGl2ZUNhbWVyYVxuXG4gICAgQDogKHZpZXc6KSAtPlxuICAgICAgICBcbiAgICAgICAgQGVsZW0gID0gdmlld1xuICAgICAgICB3aWR0aCAgPSB2aWV3LmNsaWVudFdpZHRoXG4gICAgICAgIGhlaWdodCA9IHZpZXcuY2xpZW50SGVpZ2h0XG4gICAgICAgIFxuICAgICAgICBzdXBlciA3MCwgd2lkdGgvaGVpZ2h0LCAwLjAxLCAzMDAgIyBmb3YsIGFzcGVjdCwgbmVhciwgZmFyXG4gICAgICAgIFxuICAgICAgICBAc2l6ZSAgICAgICA9IG5ldyBWZWN0b3IyIHdpZHRoLCBoZWlnaHQgXG4gICAgICAgIEBwaXZvdCAgICAgID0gbmV3IFZlY3RvcjJcbiAgICAgICAgQG1vdmUgICAgICAgPSBuZXcgVmVjdG9yM1xuICAgICAgICBAbW92ZVNwZWVkICA9IDRcbiAgICAgICAgQG1heERpc3QgICAgPSBAZmFyLzRcbiAgICAgICAgQG1pbkRpc3QgICAgPSAxXG4gICAgICAgIEBjZW50ZXIgICAgID0gbmV3IFZlY3RvcjMgXG4gICAgICAgIEBjZW50ZXIueCAgID0gcHJlZnMuZ2V0ICdjYW1lcmHilrh4JyAwIFxuICAgICAgICBAY2VudGVyLnkgICA9IHByZWZzLmdldCAnY2FtZXJh4pa4eScgMCBcbiAgICAgICAgQGNlbnRlci56ICAgPSBwcmVmcy5nZXQgJ2NhbWVyYeKWuHonIDBcbiAgICAgICAgQGRpc3QgICAgICAgPSBwcmVmcy5nZXQgJ2NhbWVyYeKWuGRpc3QnICAxMFxuICAgICAgICBAZGVncmVlICAgICA9IHByZWZzLmdldCAnY2FtZXJh4pa4ZGVncmVlJyAwXG4gICAgICAgIEByb3RhdGUgICAgID0gcHJlZnMuZ2V0ICdjYW1lcmHilrhyb3RhdGUnIDBcbiAgICAgICAgQHdoZWVsSW5lcnQgPSAwXG4gICAgICAgIEBhbmltYXRpb25zID0gW11cblxuICAgICAgICBAZWxlbS5hZGRFdmVudExpc3RlbmVyICdtb3VzZXdoZWVsJyBAb25Nb3VzZVdoZWVsXG4gICAgICAgIEBlbGVtLmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNlZG93bicgIEBvbk1vdXNlRG93blxuICAgICAgICBAZWxlbS5hZGRFdmVudExpc3RlbmVyICdrZXlwcmVzcycgICBAb25LZXlQcmVzc1xuICAgICAgICBAZWxlbS5hZGRFdmVudExpc3RlbmVyICdrZXlyZWxlYXNlJyBAb25LZXlSZWxlYXNlXG4gICAgICAgIEBlbGVtLmFkZEV2ZW50TGlzdGVuZXIgJ2RibGNsaWNrJyAgIEBvbkRibENsaWNrXG4gICAgICAgIFxuICAgICAgICBAZ2FtZXBhZCA9IG5ldyBnYW1lcGFkXG4gICAgICAgIEBnYW1lcGFkLm9uICdidXR0b24nIEBvblBhZEJ1dHRvblxuICAgICAgICBAZ2FtZXBhZC5vbiAnYXhpcycgICBAb25QYWRBeGlzXG4gICAgICAgIFxuICAgICAgICBAdXBkYXRlKClcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lIEBhbmltYXRpb25TdGVwXG4gICAgXG4gICAgcmVzZXQ6IC0+XG4gICAgICAgIFxuICAgICAgICBAY2VudGVyICAgID0gbmV3IFZlY3RvcjMgXG4gICAgICAgIEBkaXN0ICAgICAgPSAxMFxuICAgICAgICBAcm90YXRlICAgID0gMFxuICAgICAgICBAZGVncmVlICAgID0gMFxuICAgICAgICBAbW92ZVNwZWVkID0gNFxuICAgICAgICBcbiAgICAgICAgQHN0b3BQaXZvdCgpXG4gICAgICAgIEBzdG9wTW92aW5nKClcbiAgICAgICAgQHVwZGF0ZSgpXG4gICAgICAgIFxuICAgIGluY3JlbWVudE1vdmVTcGVlZDogLT4gQG1vdmVTcGVlZCAqPSAxLjU7IEBtb3ZlU3BlZWQgPSBtaW4gMjAgQG1vdmVTcGVlZDsgI2tsb2cgJ21vdmVTcGVlZCcgQG1vdmVTcGVlZFxuICAgIGRlY3JlbWVudE1vdmVTcGVlZDogLT4gQG1vdmVTcGVlZCAvPSAxLjU7IEBtb3ZlU3BlZWQgPSBtYXggMSAgQG1vdmVTcGVlZDsgI2tsb2cgJ21vdmVTcGVlZCcgQG1vdmVTcGVlZFxuICAgIFxuICAgIGdldFBvc2l0aW9uOiAtPiBAcG9zaXRpb25cbiAgICBnZXREaXI6ICAgICAgLT4gbmV3IFZlY3RvcjMoMCAwIC0xKS5hcHBseVF1YXRlcm5pb24gQHF1YXRlcm5pb24gXG4gICAgZ2V0VXA6ICAgICAgIC0+IG5ldyBWZWN0b3IzKDAgMSAgMCkuYXBwbHlRdWF0ZXJuaW9uIEBxdWF0ZXJuaW9uICBcbiAgICBnZXRSaWdodDogICAgLT4gbmV3IFZlY3RvcjMoMSAwICAwKS5hcHBseVF1YXRlcm5pb24gQHF1YXRlcm5pb24gIFxuXG4gICAgZGVsOiA9PlxuICAgICAgICBcbiAgICAgICAgQGVsZW0ucmVtb3ZlRXZlbnRMaXN0ZW5lciAgJ2tleXByZXNzJyAgIEBvbktleVByZXNzXG4gICAgICAgIEBlbGVtLnJlbW92ZUV2ZW50TGlzdGVuZXIgICdrZXlyZWxlYXNlJyBAb25LZXlSZWxlYXNlXG4gICAgICAgIEBlbGVtLnJlbW92ZUV2ZW50TGlzdGVuZXIgICdtb3VzZXdoZWVsJyBAb25Nb3VzZVdoZWVsXG4gICAgICAgIEBlbGVtLnJlbW92ZUV2ZW50TGlzdGVuZXIgICdtb3VzZWRvd24nICBAb25Nb3VzZURvd25cbiAgICAgICAgQGVsZW0ucmVtb3ZlRXZlbnRMaXN0ZW5lciAgJ2RibGNsaWNrJyAgIEBvbkRibENsaWNrXG4gICAgICAgIFxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciAnbW91c2V1cCcgICAgQG9uTW91c2VVcFxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciAnbW91c2Vtb3ZlJyAgQG9uTW91c2VEcmFnIFxuICAgICAgICBcbiAgICAjIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIFxuICAgIFxuICAgIG9uTW91c2VEb3duOiAoZXZlbnQpID0+IFxuICAgICAgICBcbiAgICAgICAgQGRvd25CdXR0b25zID0gZXZlbnQuYnV0dG9uc1xuICAgICAgICBAbW91c2VNb3ZlZCAgPSBmYWxzZVxuICAgICAgICAgICAgXG4gICAgICAgIEBtb3VzZVggPSBldmVudC5jbGllbnRYXG4gICAgICAgIEBtb3VzZVkgPSBldmVudC5jbGllbnRZXG4gICAgICAgIFxuICAgICAgICBAZG93blBvcyA9IGtwb3MgQG1vdXNlWCwgQG1vdXNlWVxuICAgICAgICBcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNlbW92ZScgQG9uTW91c2VEcmFnXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICdtb3VzZXVwJyAgIEBvbk1vdXNlVXBcbiAgICAgICAgXG4gICAgb25Nb3VzZVVwOiAoZXZlbnQpID0+IFxuXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyICdtb3VzZW1vdmUnIEBvbk1vdXNlRHJhZ1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciAnbW91c2V1cCcgICBAb25Nb3VzZVVwXG4gICAgICAgIFxuICAgIG9uRGJsQ2xpY2s6IChldmVudCkgPT5cbiAgICAgICAgXG4gICAgb25Nb3VzZURyYWc6IChldmVudCkgPT5cblxuICAgICAgICB4ID0gZXZlbnQuY2xpZW50WC1AbW91c2VYXG4gICAgICAgIHkgPSBldmVudC5jbGllbnRZLUBtb3VzZVlcbiAgICAgICAgXG4gICAgICAgIEBtb3VzZVggPSBldmVudC5jbGllbnRYXG4gICAgICAgIEBtb3VzZVkgPSBldmVudC5jbGllbnRZXG4gICAgICAgIFxuICAgICAgICBpZiBAZG93blBvcy5kaXN0KGtwb3MgQG1vdXNlWCwgQG1vdXNlWSkgPiA2MFxuICAgICAgICAgICAgQG1vdXNlTW92ZWQgPSB0cnVlXG4gICAgICAgIFxuICAgICAgICBpZiBldmVudC5idXR0b25zICYgNFxuICAgICAgICAgICAgcyA9IEBkaXN0XG4gICAgICAgICAgICBAcGFuIHgqMipzL0BzaXplLngsIHkqcy9Ac2l6ZS55XG4gICAgICAgICAgICBcbiAgICAgICAgaWYgZXZlbnQuYnV0dG9ucyAmIDJcbiAgICAgICAgICAgIEBzZXRQaXZvdCBuZXcgVmVjdG9yMiAzNjAqeC9Ac2l6ZS54LCAxODAqeS9Ac2l6ZS55XG4gICAgICBcbiAgICBhbmltYXRlOiAoZnVuYykgLT5cbiAgICAgICAgXG4gICAgICAgIEBhbmltYXRpb25zLnB1c2ggZnVuY1xuICAgICAgICBcbiAgICBhbmltYXRpb25TdGVwOiA9PlxuICAgICAgICBcbiAgICAgICAgIyBpZiBzdGF0ZSA9IEBnYW1lcGFkLmdldFN0YXRlKClcbiAgICAgICAgICAgICMgQG9uUGFkQXhpcyBzdGF0ZVxuICAgICAgICBcbiAgICAgICAgbm93ID0gd2luZG93LnBlcmZvcm1hbmNlLm5vdygpXG4gICAgICAgIGRlbHRhID0gKG5vdyAtIEBsYXN0QW5pbWF0aW9uVGltZSkgKiAwLjAwMVxuICAgICAgICBcbiAgICAgICAgQGxhc3RBbmltYXRpb25UaW1lID0gbm93XG4gICAgICAgIFxuICAgICAgICBvbGRBbmltYXRpb25zID0gQGFuaW1hdGlvbnMuY2xvbmUoKVxuICAgICAgICBAYW5pbWF0aW9ucyA9IFtdXG4gICAgICAgIGZvciBhbmltYXRpb24gaW4gb2xkQW5pbWF0aW9uc1xuICAgICAgICAgICAgYW5pbWF0aW9uIGRlbHRhXG4gICAgICAgIFxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgQGFuaW1hdGlvblN0ZXBcbiAgICBcbiAgICAjIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgICBcbiAgICBvblBhZEJ1dHRvbjogKGJ1dHRvbiwgdmFsdWUpID0+XG4gICAgICAgIFxuICAgICAgICAjIGtsb2cgJ2J1dHRvbicgYnV0dG9uXG4gICAgICAgIGlmIHZhbHVlXG4gICAgICAgICAgICBzd2l0Y2ggYnV0dG9uXG4gICAgICAgICAgICAgICAgd2hlbiAnQScgIHRoZW4gQHJlc2V0KClcbiAgICAgICAgICAgICAgICB3aGVuICdMQicgdGhlbiBAc3RhcnRNb3ZlRG93bigpXG4gICAgICAgICAgICAgICAgd2hlbiAnUkInIHRoZW4gQHN0YXJ0TW92ZVVwKClcbiAgICAgICAgICAgICAgICB3aGVuICdYJyAgdGhlbiBAZGVjcmVtZW50TW92ZVNwZWVkKClcbiAgICAgICAgICAgICAgICB3aGVuICdZJyAgdGhlbiBAaW5jcmVtZW50TW92ZVNwZWVkKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgc3dpdGNoIGJ1dHRvblxuICAgICAgICAgICAgICAgIHdoZW4gJ0xCJyB0aGVuIEBzdG9wTW92ZURvd24oKVxuICAgICAgICAgICAgICAgIHdoZW4gJ1JCJyB0aGVuIEBzdG9wTW92ZVVwKClcbiAgICBcbiAgICBvblBhZEF4aXM6IChzdGF0ZSkgPT4gXG4gICAgXG4gICAgICAgIGlmIHN0YXRlLmxlZnQueCBvciBzdGF0ZS5sZWZ0LnlcbiAgICAgICAgICAgIEBtb3ZlLnogPSAtc3RhdGUubGVmdC55ICogNC4wXG4gICAgICAgICAgICBAbW92ZS54ID0gIHN0YXRlLmxlZnQueCAqIDQuMFxuICAgICAgICAgICAgQHN0YXJ0TW92ZSgpXG4gICAgICAgICAgICB1cGRhdGUgPSB0cnVlXG4gICAgICAgIGVsc2UgaWYgZW1wdHkgc3RhdGUuYnV0dG9uc1xuICAgICAgICAgICAgQHN0b3BNb3ZpbmcoKVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIHN0YXRlLnJpZ2h0Lnggb3Igc3RhdGUucmlnaHQueVxuICAgICAgICAgICAgQHBpdm90LnggPSAgc3RhdGUucmlnaHQueFxuICAgICAgICAgICAgQHBpdm90LnkgPSAtc3RhdGUucmlnaHQueVxuICAgICAgICAgICAgQHN0YXJ0UGl2b3QoKVxuICAgICAgICAgICAgdXBkYXRlID0gdHJ1ZVxuICAgICAgICBlbHNlIGlmIGVtcHR5IHN0YXRlLmJ1dHRvbnNcbiAgICAgICAgICAgIEBzdG9wUGl2b3QoKVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIHVwZGF0ZVxuICAgICAgICAgICAgQHVwZGF0ZSgpXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAgICAwMDAgMDAwICAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAgICAwICAgICAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuICAgIFxuICAgIHNldFBpdm90OiAocCkgLT5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQHJvdGF0ZSArPSAtcC54XG4gICAgICAgIEBkZWdyZWUgKz0gLXAueVxuICAgICAgICBcbiAgICAgICAgQHVwZGF0ZSgpXG4gICAgICAgICAgIFxuICAgIHN0YXJ0UGl2b3RMZWZ0OiAgLT4gQHBpdm90LnggPSAtMTsgQHN0YXJ0UGl2b3QoKVxuICAgIHN0YXJ0UGl2b3RSaWdodDogLT4gQHBpdm90LnggPSAgMTsgQHN0YXJ0UGl2b3QoKVxuXG4gICAgc3RhcnRQaXZvdFVwOiAgICAtPiBAcGl2b3QueSA9IC0xOyBAc3RhcnRQaXZvdCgpXG4gICAgc3RhcnRQaXZvdERvd246ICAtPiBAcGl2b3QueSA9ICAxOyBAc3RhcnRQaXZvdCgpXG5cbiAgICBzdG9wUGl2b3RMZWZ0OiAgIC0+IEBwaXZvdC54ID0gbWF4IDAgQHBpdm90LnhcbiAgICBzdG9wUGl2b3RSaWdodDogIC0+IEBwaXZvdC54ID0gbWluIDAgQHBpdm90LnhcblxuICAgIHN0b3BQaXZvdFVwOiAgICAgLT4gQHBpdm90LnkgPSBtYXggMCBAcGl2b3QueVxuICAgIHN0b3BQaXZvdERvd246ICAgLT4gQHBpdm90LnkgPSBtaW4gMCBAcGl2b3QueVxuICAgIFxuICAgIHN0b3BQaXZvdDogLT5cbiAgICAgICAgXG4gICAgICAgIEBwaXZvdGluZyA9IGZhbHNlXG4gICAgICAgIEBwaXZvdC5zZXQgMCAwXG4gICAgICAgXG4gICAgc3RhcnRQaXZvdDogLT4gXG4gICAgICAgIFxuICAgICAgICBpZiBub3QgQHBpdm90aW5nXG4gICAgICAgICAgICBAYW5pbWF0ZSBAcGl2b3RDZW50ZXJcbiAgICAgICAgICAgIEBwaXZvdGluZyA9IHRydWVcbiAgICAgICAgICAgIFxuICAgIHBpdm90Q2VudGVyOiAoZGVsdGFTZWNvbmRzKSA9PlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBAcGl2b3RpbmdcblxuICAgICAgICBAc2V0UGl2b3QgQHBpdm90XG4gICAgICAgIFxuICAgICAgICAjIEBwaXZvdC5tdWx0aXBseVNjYWxhciAwLjk2XG4gICAgICAgIFxuICAgICAgICBpZiBAcGl2b3QubGVuZ3RoKCkgPiAwLjAwMVxuICAgICAgICAgICAgQGFuaW1hdGUgQHBpdm90Q2VudGVyXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBzdG9wUGl2b3QoKVxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgcGFuOiAoeCx5KSAtPlxuICAgICAgICBcbiAgICAgICAgcmlnaHQgPSBuZXcgVmVjdG9yMyAteCwgMCwgMCBcbiAgICAgICAgcmlnaHQuYXBwbHlRdWF0ZXJuaW9uIEBxdWF0ZXJuaW9uXG5cbiAgICAgICAgdXAgPSBuZXcgVmVjdG9yMyAwLCB5LCAwIFxuICAgICAgICB1cC5hcHBseVF1YXRlcm5pb24gQHF1YXRlcm5pb25cbiAgICAgICAgXG4gICAgICAgIEBjZW50ZXIuYWRkIHJpZ2h0LmFkZCB1cFxuICAgICAgICBAY2VudGVyVGFyZ2V0Py5jb3B5IEBjZW50ZXJcbiAgICAgICAgQHVwZGF0ZSgpXG4gICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAgICAgICAgICAgICAgICAgIFxuICAgIGZvY3VzT25Qb3M6ICh2KSAtPlxuICAgICAgICBcbiAgICAgICAgQGNlbnRlclRhcmdldCA9IG5ldyBWZWN0b3IzIHZcbiAgICAgICAgQGNlbnRlciA9IG5ldyBWZWN0b3IzIHZcbiAgICAgICAgQHVwZGF0ZSgpXG4gICAgICAgICBcbiAgICBmYWRlVG9Qb3M6ICh2KSAtPiBcbiAgICAgICAgQGNlbnRlclRhcmdldCA9IHYuY2xvbmUoKVxuICAgICAgICBAc3RhcnRGYWRlQ2VudGVyKClcblxuICAgIHN0YXJ0RmFkZUNlbnRlcjogLT4gXG4gICAgICAgIFxuICAgICAgICBpZiBub3QgQGZhZGluZ1xuICAgICAgICAgICAgQGFuaW1hdGUgQGZhZGVDZW50ZXJcbiAgICAgICAgICAgIEBmYWRpbmcgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgIFxuICAgIGZhZGVDZW50ZXI6IChkZWx0YVNlY29uZHMpID0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IEBmYWRpbmdcbiAgICAgICAgXG4gICAgICAgIEBjZW50ZXIubGVycCBAY2VudGVyVGFyZ2V0LCBkZWx0YVNlY29uZHNcbiAgICAgICAgQHVwZGF0ZSgpXG4gICAgICAgIFxuICAgICAgICBpZiBAY2VudGVyLmRpc3RhbmNlVG8oQGNlbnRlclRhcmdldCkgPiAwLjAwMVxuICAgICAgICAgICAgQGFuaW1hdGUgQGZhZGVDZW50ZXJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZGVsZXRlIEBmYWRpbmdcblxuICAgIHNldFBpdm90Q2VudGVyOiAocG9zKSAtPlxuICAgICAgICBkaXN0ID0gQHBvc2l0aW9uLmRpc3RhbmNlVG8gcG9zXG4gICAgICAgIEBkaXN0ID0gY2xhbXAgQG1pbkRpc3QsIEBtYXhEaXN0LCBkaXN0XG4gICAgICAgIEBjZW50ZXIuY29weSBAcG9zaXRpb25cbiAgICAgICAgQGNlbnRlci5hZGQgQGdldERpcigpLm11bHRpcGx5U2NhbGFyIEBkaXN0XG4gICAgICAgIEBmYWRlVG9Qb3MgcG9zXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgIHJlc2V0RGlzdDogLT5cbiAgICAgICAgXG4gICAgICAgIGlmIEBkaXN0ID4gQG1pbkRpc3RcbiAgICAgICAgICAgIEBkaXN0ID0gQG1pbkRpc3RcbiAgICAgICAgICAgIEBjZW50ZXIuY29weSBAcG9zaXRpb25cbiAgICAgICAgICAgIEBjZW50ZXIuYWRkIEBnZXREaXIoKS5tdWx0aXBseVNjYWxhciBAZGlzdFxuICAgICAgICAgICAgXG4gICAgIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMCAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgICAgIDAgICAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgbW92ZUZhY3RvcjogLT4gMS4wICNAZGlzdC8yXG4gICAgXG4gICAgc3RhcnRNb3ZlUmlnaHQ6ICAgIC0+IEBtb3ZlLnggPSAgQG1vdmVGYWN0b3IoKTsgQHN0YXJ0TW92ZSgpXG4gICAgc3RhcnRNb3ZlTGVmdDogICAgIC0+IEBtb3ZlLnggPSAtQG1vdmVGYWN0b3IoKTsgQHN0YXJ0TW92ZSgpXG5cbiAgICBzdGFydE1vdmVVcDogICAgICAgLT4gQG1vdmUueSA9ICBAbW92ZUZhY3RvcigpOyBAc3RhcnRNb3ZlKClcbiAgICBzdGFydE1vdmVEb3duOiAgICAgLT4gQG1vdmUueSA9IC1AbW92ZUZhY3RvcigpOyBAc3RhcnRNb3ZlKClcblxuICAgIHN0YXJ0TW92ZUJhY2t3YXJkOiAtPiBAbW92ZS56ID0gIEBtb3ZlRmFjdG9yKCk7IEBzdGFydE1vdmUoKVxuICAgIHN0YXJ0TW92ZUZvcndhcmQ6ICAtPiBAbW92ZS56ID0gLUBtb3ZlRmFjdG9yKCk7IEBzdGFydE1vdmUoKVxuXG4gICAgc3RvcE1vdmVSaWdodDogICAgIC0+IEBtb3ZlLnggPSBtaW4gMCBAbW92ZS54XG4gICAgc3RvcE1vdmVMZWZ0OiAgICAgIC0+IEBtb3ZlLnggPSBtYXggMCBAbW92ZS54XG5cbiAgICBzdG9wTW92ZVVwOiAgICAgICAgLT4gQG1vdmUueSA9IG1pbiAwIEBtb3ZlLnlcbiAgICBzdG9wTW92ZURvd246ICAgICAgLT4gQG1vdmUueSA9IG1heCAwIEBtb3ZlLnlcblxuICAgIHN0b3BNb3ZlQmFja3dhcmQ6ICAtPiBAbW92ZS56ID0gbWluIDAgQG1vdmUuelxuICAgIHN0b3BNb3ZlRm9yd2FyZDogICAtPiBAbW92ZS56ID0gbWF4IDAgQG1vdmUuelxuICAgIFxuICAgIHN0YXJ0TW92ZTogLT4gXG4gICAgICAgIFxuICAgICAgICBpZiBAbW92ZS54IG9yIEBtb3ZlLnlcbiAgICAgICAgICAgIEByZXNldERpc3QoKVxuICAgICAgICAgICAgXG4gICAgICAgIEBmYWRpbmcgPSBmYWxzZVxuICAgICAgICBpZiBub3QgQG1vdmluZ1xuICAgICAgICAgICAgQGFuaW1hdGUgQG1vdmVDZW50ZXJcbiAgICAgICAgICAgIEBtb3ZpbmcgPSB0cnVlXG4gICAgICAgICAgICBcbiAgICBzdG9wTW92aW5nOiAtPlxuICAgICAgICBcbiAgICAgICAgQG1vdmluZyA9IGZhbHNlXG4gICAgICAgIEBtb3ZlLnNldCAwIDAgMFxuICAgICAgICBcbiAgICBtb3ZlQ2VudGVyOiAoZGVsdGFTZWNvbmRzKSA9PlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBAbW92aW5nXG4gICAgICAgIFxuICAgICAgICBkaXIgPSBAbW92ZS5jbG9uZSgpXG4gICAgICAgIGRpci5tdWx0aXBseVNjYWxhciBkZWx0YVNlY29uZHMqQG1vdmVTcGVlZFxuICAgICAgICBkaXIuYXBwbHlRdWF0ZXJuaW9uIEBxdWF0ZXJuaW9uXG4gICAgICAgIFxuICAgICAgICBpZiBAbW92ZS56IGFuZCAobm90IEBtb3ZlLnkpIGFuZCAobm90IEBtb3ZlLngpIGFuZCBAZGlzdCA+IEBtaW5EaXN0XG4gICAgICAgICAgICBAZGlzdCArPSBAbW92ZS56LzE2LjBcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGNlbnRlci5hZGQgZGlyXG4gICAgICAgICAgICBcbiAgICAgICAgQHVwZGF0ZSgpXG4gICAgICAgIFxuICAgICAgICAjIEBtb3ZlLm11bHRpcGx5U2NhbGFyIDAuOTZcbiAgICAgICAgXG4gICAgICAgIGlmIEBtb3ZlLmxlbmd0aCgpID4gMC4wMDFcbiAgICAgICAgICAgIEBhbmltYXRlIEBtb3ZlQ2VudGVyXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBzdG9wTW92aW5nKClcbiAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgIFxuICAgIFxuICAgIG9uTW91c2VXaGVlbDogKGV2ZW50KSA9PiBcbiAgICBcbiAgICAgICAgaWYgQHdoZWVsSW5lcnQgPiAwIGFuZCBldmVudC53aGVlbERlbHRhIDwgMFxuICAgICAgICAgICAgQHdoZWVsSW5lcnQgPSAwXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIFxuICAgICAgICBpZiBAd2hlZWxJbmVydCA8IDAgYW5kIGV2ZW50LndoZWVsRGVsdGEgPiAwXG4gICAgICAgICAgICBAd2hlZWxJbmVydCA9IDBcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgXG4gICAgICAgIEB3aGVlbEluZXJ0ICs9IGV2ZW50LndoZWVsRGVsdGEgKiAoMSsoQGRpc3QvQG1heERpc3QpKjMpICogMC4wMDAxXG4gICAgICAgIFxuICAgICAgICBAc3RhcnRab29tKClcblxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwICAgICAwMCAgXG4gICAgIyAgICAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjICAgMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcblxuICAgIHN0YXJ0Wm9vbUluOiAtPlxuICAgICAgICBcbiAgICAgICAgQHdoZWVsSW5lcnQgPSAoMSsoQGRpc3QvQG1heERpc3QpKjMpKjEwXG4gICAgICAgIEBzdGFydFpvb20oKVxuICAgICAgICBcbiAgICBzdGFydFpvb21PdXQ6IC0+XG4gICAgICAgIFxuICAgICAgICBAd2hlZWxJbmVydCA9IC0oMSsoQGRpc3QvQG1heERpc3QpKjMpKjEwXG4gICAgICAgIEBzdGFydFpvb20oKVxuICAgIFxuICAgIHN0YXJ0Wm9vbTogLT4gXG4gICAgICAgIFxuICAgICAgICBpZiBub3QgQHpvb21pbmdcbiAgICAgICAgICAgIEBhbmltYXRlIEBpbmVydFpvb21cbiAgICAgICAgICAgIEB6b29taW5nID0gdHJ1ZVxuICAgICAgICAgICAgXG4gICAgc3RvcFpvb206IC0+IFxuICAgICAgICBcbiAgICAgICAgQHdoZWVsSW5lcnQgPSAwXG4gICAgICAgIEB6b29taW5nID0gZmFsc2VcbiAgICBcbiAgICBpbmVydFpvb206IChkZWx0YVNlY29uZHMpID0+XG5cbiAgICAgICAgQHNldERpc3RGYWN0b3IgMSAtIGNsYW1wIC0wLjAyLCAwLjAyLCBAd2hlZWxJbmVydFxuICAgICAgICBAd2hlZWxJbmVydCA9IHJlZHVjZSBAd2hlZWxJbmVydCwgZGVsdGFTZWNvbmRzKjAuM1xuICAgICAgICBcbiAgICAgICAgaWYgYWJzKEB3aGVlbEluZXJ0KSA+IDAuMDAwMDFcbiAgICAgICAgICAgIEBhbmltYXRlIEBpbmVydFpvb21cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZGVsZXRlIEB6b29taW5nXG4gICAgICAgICAgICBAd2hlZWxJbmVydCA9IDBcbiAgICBcbiAgICBzZXREaXN0RmFjdG9yOiAoZmFjdG9yKSA9PlxuICAgICAgICBcbiAgICAgICAgQGRpc3QgPSBjbGFtcCBAbWluRGlzdCwgQG1heERpc3QsIEBkaXN0KmZhY3RvclxuICAgICAgICBAdXBkYXRlKClcbiAgICAgICAgXG4gICAgc2V0Rm92OiAoZm92KSAtPiBAZm92ID0gbWF4KDIuMCwgbWluIGZvdiwgMTc1LjApXG4gICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICBcbiAgICBcbiAgICB1cGRhdGU6IC0+IFxuICAgICAgICBcbiAgICAgICAgQGRlZ3JlZSA9IGNsYW1wIC05MCA5MCBAZGVncmVlXG4gICAgICAgIFxuICAgICAgICBAcXVhdGVybmlvbi5zZXRGcm9tQXhpc0FuZ2xlIG5ldyBWZWN0b3IzKDAgMSAwKSwgZGVnMnJhZCBAcm90YXRlXG5cbiAgICAgICAgcGl0Y2hSb3QgPSBuZXcgUXVhdGVybmlvblxuICAgICAgICBwaXRjaFJvdC5zZXRGcm9tQXhpc0FuZ2xlIG5ldyBWZWN0b3IzKDEgMCAwKSwgZGVnMnJhZCBAZGVncmVlXG4gICAgICAgIFxuICAgICAgICBAcXVhdGVybmlvbi5tdWx0aXBseSBwaXRjaFJvdFxuICAgICAgICBcbiAgICAgICAgQHBvc2l0aW9uLmNvcHkgQGNlbnRlclxuICAgICAgICBAcG9zaXRpb24uYWRkIG5ldyBWZWN0b3IzKDAgMCBAZGlzdCkuYXBwbHlRdWF0ZXJuaW9uIEBxdWF0ZXJuaW9uXG4gICAgICAgIFxuICAgICAgICBwcmVmcy5zZXQgJ2NhbWVyYeKWuGRpc3QnICAgQGRpc3RcbiAgICAgICAgcHJlZnMuc2V0ICdjYW1lcmHilrhkZWdyZWUnIEBkZWdyZWVcbiAgICAgICAgcHJlZnMuc2V0ICdjYW1lcmHilrhyb3RhdGUnIEByb3RhdGVcbiAgICAgICAgcHJlZnMuc2V0ICdjYW1lcmHilrh4JyBAY2VudGVyLnggXG4gICAgICAgIHByZWZzLnNldCAnY2FtZXJh4pa4eScgQGNlbnRlci55ICBcbiAgICAgICAgcHJlZnMuc2V0ICdjYW1lcmHilrh6JyBAY2VudGVyLnpcblxubW9kdWxlLmV4cG9ydHMgPSBDYW1lcmFcbiJdfQ==
//# sourceURL=../coffee/camera.coffee