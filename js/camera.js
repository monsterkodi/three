// koffee 1.12.0

/*
 0000000   0000000   00     00  00000000  00000000    0000000 
000       000   000  000   000  000       000   000  000   000
000       000000000  000000000  0000000   0000000    000000000
000       000   000  000 0 000  000       000   000  000   000
 0000000  000   000  000   000  00000000  000   000  000   000
 */
var Camera, PerspectiveCamera, Quaternion, Vector2, Vector3, abs, clamp, deg2rad, gamepad, kpos, max, min, prefs, reduce, ref, ref1,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), clamp = ref.clamp, deg2rad = ref.deg2rad, gamepad = ref.gamepad, kpos = ref.kpos, prefs = ref.prefs, reduce = ref.reduce;

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
        this.maxDist = this.far / 4;
        this.minDist = 0.9;
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
        this.gamepad = new gamepad(true);
        this.gamepad.on('button', this.onPadButton);
        this.update();
        requestAnimationFrame(this.animationStep);
    }

    Camera.prototype.reset = function() {
        this.stopPivot();
        this.stopMoving();
        this.center = new Vector3;
        this.dist = 10;
        this.rotate = 0;
        this.degree = 0;
        return this.update();
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
        var animation, delta, i, len, now, oldAnimations, state;
        if (state = this.gamepad.getState()) {
            this.onPadAxis(state);
        }
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
                case 'LT':
                    return this.fastSpeed = true;
            }
        } else {
            switch (button) {
                case 'LB':
                    return this.stopMoving();
                case 'RB':
                    return this.stopMoving();
                case 'LT':
                    return this.fastSpeed = false;
            }
        }
    };

    Camera.prototype.onPadAxis = function(state) {
        var update;
        this.rotate += state.right.x;
        this.degree -= state.right.y;
        if (state.left.x || state.left.y) {
            this.move.z = -state.left.y;
            this.move.x = state.left.x;
            this.startMove();
            update = true;
        }
        if (state.right.x || state.right.y) {
            update = true;
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

    Camera.prototype.moveFactor = function() {
        return this.dist / 2;
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
        dir = new Vector3;
        dir.add(this.move);
        dir.multiplyScalar(deltaSeconds);
        dir.applyQuaternion(this.quaternion);
        this.center.add(dir);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FtZXJhLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsiY2FtZXJhLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwrSEFBQTtJQUFBOzs7O0FBUUEsTUFBbUQsT0FBQSxDQUFRLEtBQVIsQ0FBbkQsRUFBRSxpQkFBRixFQUFTLHFCQUFULEVBQWtCLHFCQUFsQixFQUEyQixlQUEzQixFQUFpQyxpQkFBakMsRUFBd0M7O0FBQ3hDLE9BQThELE9BQUEsQ0FBUSxPQUFSLENBQTlELEVBQUUsb0JBQUYsRUFBVSwwQ0FBVixFQUE2Qiw0QkFBN0IsRUFBeUMsc0JBQXpDLEVBQWtEOztBQUNoRCxjQUFGLEVBQU8sY0FBUCxFQUFZOztBQUVOOzs7SUFFQyxnQkFBQyxHQUFEO0FBRUMsWUFBQTtRQUZBLDBDQUFHOzs7Ozs7Ozs7Ozs7Ozs7UUFFSCxJQUFDLENBQUEsSUFBRCxHQUFTO1FBQ1QsS0FBQSxHQUFTLElBQUksQ0FBQztRQUNkLE1BQUEsR0FBUyxJQUFJLENBQUM7UUFFZCx3Q0FBTSxFQUFOLEVBQVUsS0FBQSxHQUFNLE1BQWhCLEVBQXdCLElBQXhCLEVBQThCLEdBQTlCO1FBRUEsSUFBQyxDQUFBLElBQUQsR0FBYyxJQUFJLE9BQUosQ0FBWSxLQUFaLEVBQW1CLE1BQW5CO1FBQ2QsSUFBQyxDQUFBLEtBQUQsR0FBYyxJQUFJO1FBQ2xCLElBQUMsQ0FBQSxJQUFELEdBQWMsSUFBSTtRQUNsQixJQUFDLENBQUEsT0FBRCxHQUFjLElBQUMsQ0FBQSxHQUFELEdBQUs7UUFDbkIsSUFBQyxDQUFBLE9BQUQsR0FBYztRQUNkLElBQUMsQ0FBQSxNQUFELEdBQWMsSUFBSTtRQUNsQixJQUFDLENBQUEsTUFBTSxDQUFDLENBQVIsR0FBYyxLQUFLLENBQUMsR0FBTixDQUFVLFVBQVYsRUFBcUIsQ0FBckI7UUFDZCxJQUFDLENBQUEsTUFBTSxDQUFDLENBQVIsR0FBYyxLQUFLLENBQUMsR0FBTixDQUFV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I1xuIDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCBcbjAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4wMDAgICAgICAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwMFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDBcbiAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4jIyNcblxueyBjbGFtcCwgZGVnMnJhZCwgZ2FtZXBhZCwga3BvcywgcHJlZnMsIHJlZHVjZSB9ID0gcmVxdWlyZSAna3hrJ1xueyBDYW1lcmEsIFBlcnNwZWN0aXZlQ2FtZXJhLCBRdWF0ZXJuaW9uLCBWZWN0b3IyLCBWZWN0b3IzIH0gPSByZXF1aXJlICd0aHJlZSdcbnsgYWJzLCBtYXgsIG1pbiB9ID0gTWF0aFxuXG5jbGFzcyBDYW1lcmEgZXh0ZW5kcyBQZXJzcGVjdGl2ZUNhbWVyYVxuXG4gICAgQDogKHZpZXc6KSAtPlxuICAgICAgICBcbiAgICAgICAgQGVsZW0gID0gdmlld1xuICAgICAgICB3aWR0aCAgPSB2aWV3LmNsaWVudFdpZHRoXG4gICAgICAgIGhlaWdodCA9IHZpZXcuY2xpZW50SGVpZ2h0XG4gICAgICAgIFxuICAgICAgICBzdXBlciA3MCwgd2lkdGgvaGVpZ2h0LCAwLjAxLCAzMDAgIyBmb3YsIGFzcGVjdCwgbmVhciwgZmFyXG4gICAgICAgIFxuICAgICAgICBAc2l6ZSAgICAgICA9IG5ldyBWZWN0b3IyIHdpZHRoLCBoZWlnaHQgXG4gICAgICAgIEBwaXZvdCAgICAgID0gbmV3IFZlY3RvcjJcbiAgICAgICAgQG1vdmUgICAgICAgPSBuZXcgVmVjdG9yM1xuICAgICAgICBAbWF4RGlzdCAgICA9IEBmYXIvNFxuICAgICAgICBAbWluRGlzdCAgICA9IDAuOVxuICAgICAgICBAY2VudGVyICAgICA9IG5ldyBWZWN0b3IzIFxuICAgICAgICBAY2VudGVyLnggICA9IHByZWZzLmdldCAnY2FtZXJh4pa4eCcgMCBcbiAgICAgICAgQGNlbnRlci55ICAgPSBwcmVmcy5nZXQgJ2NhbWVyYeKWuHknIDAgXG4gICAgICAgIEBjZW50ZXIueiAgID0gcHJlZnMuZ2V0ICdjYW1lcmHilrh6JyAwXG4gICAgICAgIEBkaXN0ICAgICAgID0gcHJlZnMuZ2V0ICdjYW1lcmHilrhkaXN0JyAgMTBcbiAgICAgICAgQGRlZ3JlZSAgICAgPSBwcmVmcy5nZXQgJ2NhbWVyYeKWuGRlZ3JlZScgMFxuICAgICAgICBAcm90YXRlICAgICA9IHByZWZzLmdldCAnY2FtZXJh4pa4cm90YXRlJyAwXG4gICAgICAgIEB3aGVlbEluZXJ0ID0gMFxuICAgICAgICBAYW5pbWF0aW9ucyA9IFtdXG5cbiAgICAgICAgQGVsZW0uYWRkRXZlbnRMaXN0ZW5lciAnbW91c2V3aGVlbCcgQG9uTW91c2VXaGVlbFxuICAgICAgICBAZWxlbS5hZGRFdmVudExpc3RlbmVyICdtb3VzZWRvd24nICBAb25Nb3VzZURvd25cbiAgICAgICAgQGVsZW0uYWRkRXZlbnRMaXN0ZW5lciAna2V5cHJlc3MnICAgQG9uS2V5UHJlc3NcbiAgICAgICAgQGVsZW0uYWRkRXZlbnRMaXN0ZW5lciAna2V5cmVsZWFzZScgQG9uS2V5UmVsZWFzZVxuICAgICAgICBAZWxlbS5hZGRFdmVudExpc3RlbmVyICdkYmxjbGljaycgICBAb25EYmxDbGlja1xuICAgICAgICBcbiAgICAgICAgQGdhbWVwYWQgPSBuZXcgZ2FtZXBhZCB0cnVlXG4gICAgICAgIEBnYW1lcGFkLm9uICdidXR0b24nIEBvblBhZEJ1dHRvblxuICAgICAgICBcbiAgICAgICAgQHVwZGF0ZSgpXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSBAYW5pbWF0aW9uU3RlcFxuICAgIFxuICAgIHJlc2V0OiAtPlxuICAgICAgICBcbiAgICAgICAgQHN0b3BQaXZvdCgpXG4gICAgICAgIEBzdG9wTW92aW5nKClcbiAgICAgICAgQGNlbnRlciA9IG5ldyBWZWN0b3IzIFxuICAgICAgICBAZGlzdCAgID0gMTBcbiAgICAgICAgQHJvdGF0ZSA9IDBcbiAgICAgICAgQGRlZ3JlZSA9IDBcbiAgICAgICAgQHVwZGF0ZSgpXG4gICAgICAgIFxuICAgIGdldFBvc2l0aW9uOiAtPiBAcG9zaXRpb25cbiAgICBnZXREaXI6ICAgICAgLT4gbmV3IFZlY3RvcjMoMCAwIC0xKS5hcHBseVF1YXRlcm5pb24gQHF1YXRlcm5pb24gXG4gICAgZ2V0VXA6ICAgICAgIC0+IG5ldyBWZWN0b3IzKDAgMSAgMCkuYXBwbHlRdWF0ZXJuaW9uIEBxdWF0ZXJuaW9uICBcbiAgICBnZXRSaWdodDogICAgLT4gbmV3IFZlY3RvcjMoMSAwICAwKS5hcHBseVF1YXRlcm5pb24gQHF1YXRlcm5pb24gIFxuXG4gICAgZGVsOiA9PlxuICAgICAgICBcbiAgICAgICAgQGVsZW0ucmVtb3ZlRXZlbnRMaXN0ZW5lciAgJ2tleXByZXNzJyAgIEBvbktleVByZXNzXG4gICAgICAgIEBlbGVtLnJlbW92ZUV2ZW50TGlzdGVuZXIgICdrZXlyZWxlYXNlJyBAb25LZXlSZWxlYXNlXG4gICAgICAgIEBlbGVtLnJlbW92ZUV2ZW50TGlzdGVuZXIgICdtb3VzZXdoZWVsJyBAb25Nb3VzZVdoZWVsXG4gICAgICAgIEBlbGVtLnJlbW92ZUV2ZW50TGlzdGVuZXIgICdtb3VzZWRvd24nICBAb25Nb3VzZURvd25cbiAgICAgICAgQGVsZW0ucmVtb3ZlRXZlbnRMaXN0ZW5lciAgJ2RibGNsaWNrJyAgIEBvbkRibENsaWNrXG4gICAgICAgIFxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciAnbW91c2V1cCcgICAgQG9uTW91c2VVcFxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciAnbW91c2Vtb3ZlJyAgQG9uTW91c2VEcmFnIFxuICAgICAgICBcbiAgICAjIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIFxuICAgIFxuICAgIG9uTW91c2VEb3duOiAoZXZlbnQpID0+IFxuICAgICAgICBcbiAgICAgICAgQGRvd25CdXR0b25zID0gZXZlbnQuYnV0dG9uc1xuICAgICAgICBAbW91c2VNb3ZlZCAgPSBmYWxzZVxuICAgICAgICAgICAgXG4gICAgICAgIEBtb3VzZVggPSBldmVudC5jbGllbnRYXG4gICAgICAgIEBtb3VzZVkgPSBldmVudC5jbGllbnRZXG4gICAgICAgIFxuICAgICAgICBAZG93blBvcyA9IGtwb3MgQG1vdXNlWCwgQG1vdXNlWVxuICAgICAgICBcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNlbW92ZScgQG9uTW91c2VEcmFnXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICdtb3VzZXVwJyAgIEBvbk1vdXNlVXBcbiAgICAgICAgXG4gICAgb25Nb3VzZVVwOiAoZXZlbnQpID0+IFxuXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyICdtb3VzZW1vdmUnIEBvbk1vdXNlRHJhZ1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciAnbW91c2V1cCcgICBAb25Nb3VzZVVwXG4gICAgICAgIFxuICAgIG9uRGJsQ2xpY2s6IChldmVudCkgPT5cbiAgICAgICAgXG4gICAgb25Nb3VzZURyYWc6IChldmVudCkgPT5cblxuICAgICAgICB4ID0gZXZlbnQuY2xpZW50WC1AbW91c2VYXG4gICAgICAgIHkgPSBldmVudC5jbGllbnRZLUBtb3VzZVlcbiAgICAgICAgXG4gICAgICAgIEBtb3VzZVggPSBldmVudC5jbGllbnRYXG4gICAgICAgIEBtb3VzZVkgPSBldmVudC5jbGllbnRZXG4gICAgICAgIFxuICAgICAgICBpZiBAZG93blBvcy5kaXN0KGtwb3MgQG1vdXNlWCwgQG1vdXNlWSkgPiA2MFxuICAgICAgICAgICAgQG1vdXNlTW92ZWQgPSB0cnVlXG4gICAgICAgIFxuICAgICAgICBpZiBldmVudC5idXR0b25zICYgNFxuICAgICAgICAgICAgcyA9IEBkaXN0XG4gICAgICAgICAgICBAcGFuIHgqMipzL0BzaXplLngsIHkqcy9Ac2l6ZS55XG4gICAgICAgICAgICBcbiAgICAgICAgaWYgZXZlbnQuYnV0dG9ucyAmIDJcbiAgICAgICAgICAgIEBzZXRQaXZvdCBuZXcgVmVjdG9yMiAzNjAqeC9Ac2l6ZS54LCAxODAqeS9Ac2l6ZS55XG4gICAgICBcbiAgICBhbmltYXRlOiAoZnVuYykgLT5cbiAgICAgICAgXG4gICAgICAgIEBhbmltYXRpb25zLnB1c2ggZnVuY1xuICAgICAgICBcbiAgICBhbmltYXRpb25TdGVwOiA9PlxuICAgICAgICBcbiAgICAgICAgaWYgc3RhdGUgPSBAZ2FtZXBhZC5nZXRTdGF0ZSgpXG4gICAgICAgICAgICBAb25QYWRBeGlzIHN0YXRlXG4gICAgICAgIFxuICAgICAgICBub3cgPSB3aW5kb3cucGVyZm9ybWFuY2Uubm93KClcbiAgICAgICAgZGVsdGEgPSAobm93IC0gQGxhc3RBbmltYXRpb25UaW1lKSAqIDAuMDAxXG4gICAgICAgIFxuICAgICAgICBAbGFzdEFuaW1hdGlvblRpbWUgPSBub3dcbiAgICAgICAgXG4gICAgICAgIG9sZEFuaW1hdGlvbnMgPSBAYW5pbWF0aW9ucy5jbG9uZSgpXG4gICAgICAgIEBhbmltYXRpb25zID0gW11cbiAgICAgICAgZm9yIGFuaW1hdGlvbiBpbiBvbGRBbmltYXRpb25zXG4gICAgICAgICAgICBhbmltYXRpb24gZGVsdGFcbiAgICAgICAgXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSBAYW5pbWF0aW9uU3RlcFxuICAgIFxuICAgICMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICAgIFxuICAgIG9uUGFkQnV0dG9uOiAoYnV0dG9uLCB2YWx1ZSkgPT5cbiAgICAgICAgXG4gICAgICAgICMga2xvZyAnYnV0dG9uJyBidXR0b25cbiAgICAgICAgaWYgdmFsdWVcbiAgICAgICAgICAgIHN3aXRjaCBidXR0b25cbiAgICAgICAgICAgICAgICB3aGVuICdBJyAgdGhlbiBAcmVzZXQoKVxuICAgICAgICAgICAgICAgIHdoZW4gJ0xCJyB0aGVuIEBzdGFydE1vdmVEb3duKClcbiAgICAgICAgICAgICAgICB3aGVuICdSQicgdGhlbiBAc3RhcnRNb3ZlVXAoKVxuICAgICAgICAgICAgICAgIHdoZW4gJ0xUJyB0aGVuIEBmYXN0U3BlZWQgPSB0cnVlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHN3aXRjaCBidXR0b25cbiAgICAgICAgICAgICAgICB3aGVuICdMQicgdGhlbiBAc3RvcE1vdmluZygpXG4gICAgICAgICAgICAgICAgd2hlbiAnUkInIHRoZW4gQHN0b3BNb3ZpbmcoKVxuICAgICAgICAgICAgICAgIHdoZW4gJ0xUJyB0aGVuIEBmYXN0U3BlZWQgPSBmYWxzZVxuICAgIFxuICAgIG9uUGFkQXhpczogKHN0YXRlKSA9PiBcbiAgICBcbiAgICAgICAgQHJvdGF0ZSArPSBzdGF0ZS5yaWdodC54XG4gICAgICAgIEBkZWdyZWUgLT0gc3RhdGUucmlnaHQueVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgc3RhdGUubGVmdC54IG9yIHN0YXRlLmxlZnQueVxuICAgICAgICAgICAgQG1vdmUueiA9IC1zdGF0ZS5sZWZ0LnlcbiAgICAgICAgICAgIEBtb3ZlLnggPSAgc3RhdGUubGVmdC54XG4gICAgICAgICAgICBAc3RhcnRNb3ZlKClcbiAgICAgICAgICAgIHVwZGF0ZSA9IHRydWVcbiAgICAgICAgIyBlbHNlXG4gICAgICAgICAgICAjIEBzdG9wTW92aW5nKClcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBzdGF0ZS5yaWdodC54IG9yIHN0YXRlLnJpZ2h0LnlcbiAgICAgICAgICAgIHVwZGF0ZSA9IHRydWVcbiAgICAgICAgICAgIFxuICAgICAgICBpZiB1cGRhdGVcbiAgICAgICAgICAgIEB1cGRhdGUoKVxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgICAgMCAgICAgICAwMDAwMDAwICAgICAgMDAwICAgICBcbiAgICBcbiAgICBzZXRQaXZvdDogKHApIC0+XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEByb3RhdGUgKz0gLXAueFxuICAgICAgICBAZGVncmVlICs9IC1wLnlcbiAgICAgICAgXG4gICAgICAgIEB1cGRhdGUoKVxuICAgICAgICAgICBcbiAgICBzdGFydFBpdm90TGVmdDogIC0+IEBwaXZvdC54ID0gLTE7IEBzdGFydFBpdm90KClcbiAgICBzdGFydFBpdm90UmlnaHQ6IC0+IEBwaXZvdC54ID0gIDE7IEBzdGFydFBpdm90KClcblxuICAgIHN0YXJ0UGl2b3RVcDogICAgLT4gQHBpdm90LnkgPSAtMTsgQHN0YXJ0UGl2b3QoKVxuICAgIHN0YXJ0UGl2b3REb3duOiAgLT4gQHBpdm90LnkgPSAgMTsgQHN0YXJ0UGl2b3QoKVxuXG4gICAgc3RvcFBpdm90TGVmdDogICAtPiBAcGl2b3QueCA9IG1heCAwIEBwaXZvdC54XG4gICAgc3RvcFBpdm90UmlnaHQ6ICAtPiBAcGl2b3QueCA9IG1pbiAwIEBwaXZvdC54XG5cbiAgICBzdG9wUGl2b3RVcDogICAgIC0+IEBwaXZvdC55ID0gbWF4IDAgQHBpdm90LnlcbiAgICBzdG9wUGl2b3REb3duOiAgIC0+IEBwaXZvdC55ID0gbWluIDAgQHBpdm90LnlcbiAgICBcbiAgICBzdG9wUGl2b3Q6IC0+XG4gICAgICAgIFxuICAgICAgICBAcGl2b3RpbmcgPSBmYWxzZVxuICAgICAgICBAcGl2b3Quc2V0IDAgMFxuICAgICAgIFxuICAgIHN0YXJ0UGl2b3Q6IC0+IFxuICAgICAgICBcbiAgICAgICAgaWYgbm90IEBwaXZvdGluZ1xuICAgICAgICAgICAgQGFuaW1hdGUgQHBpdm90Q2VudGVyXG4gICAgICAgICAgICBAcGl2b3RpbmcgPSB0cnVlXG4gICAgICAgICAgICBcbiAgICBwaXZvdENlbnRlcjogKGRlbHRhU2Vjb25kcykgPT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgQHBpdm90aW5nXG5cbiAgICAgICAgQHNldFBpdm90IEBwaXZvdFxuICAgICAgICBcbiAgICAgICAgIyBAcGl2b3QubXVsdGlwbHlTY2FsYXIgMC45NlxuICAgICAgICBcbiAgICAgICAgaWYgQHBpdm90Lmxlbmd0aCgpID4gMC4wMDFcbiAgICAgICAgICAgIEBhbmltYXRlIEBwaXZvdENlbnRlclxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc3RvcFBpdm90KClcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIHBhbjogKHgseSkgLT5cbiAgICAgICAgXG4gICAgICAgIHJpZ2h0ID0gbmV3IFZlY3RvcjMgLXgsIDAsIDAgXG4gICAgICAgIHJpZ2h0LmFwcGx5UXVhdGVybmlvbiBAcXVhdGVybmlvblxuXG4gICAgICAgIHVwID0gbmV3IFZlY3RvcjMgMCwgeSwgMCBcbiAgICAgICAgdXAuYXBwbHlRdWF0ZXJuaW9uIEBxdWF0ZXJuaW9uXG4gICAgICAgIFxuICAgICAgICBAY2VudGVyLmFkZCByaWdodC5hZGQgdXBcbiAgICAgICAgQGNlbnRlclRhcmdldD8uY29weSBAY2VudGVyXG4gICAgICAgIEB1cGRhdGUoKVxuICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgICAgICAgICAgICAgICAgICBcbiAgICBmb2N1c09uUG9zOiAodikgLT5cbiAgICAgICAgXG4gICAgICAgIEBjZW50ZXJUYXJnZXQgPSBuZXcgVmVjdG9yMyB2XG4gICAgICAgIEBjZW50ZXIgPSBuZXcgVmVjdG9yMyB2XG4gICAgICAgIEB1cGRhdGUoKVxuICAgICAgICAgXG4gICAgZmFkZVRvUG9zOiAodikgLT4gXG4gICAgICAgIEBjZW50ZXJUYXJnZXQgPSB2LmNsb25lKClcbiAgICAgICAgQHN0YXJ0RmFkZUNlbnRlcigpXG5cbiAgICBzdGFydEZhZGVDZW50ZXI6IC0+IFxuICAgICAgICBcbiAgICAgICAgaWYgbm90IEBmYWRpbmdcbiAgICAgICAgICAgIEBhbmltYXRlIEBmYWRlQ2VudGVyXG4gICAgICAgICAgICBAZmFkaW5nID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICBcbiAgICBmYWRlQ2VudGVyOiAoZGVsdGFTZWNvbmRzKSA9PlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBAZmFkaW5nXG4gICAgICAgIFxuICAgICAgICBAY2VudGVyLmxlcnAgQGNlbnRlclRhcmdldCwgZGVsdGFTZWNvbmRzXG4gICAgICAgIEB1cGRhdGUoKVxuICAgICAgICBcbiAgICAgICAgaWYgQGNlbnRlci5kaXN0YW5jZVRvKEBjZW50ZXJUYXJnZXQpID4gMC4wMDFcbiAgICAgICAgICAgIEBhbmltYXRlIEBmYWRlQ2VudGVyXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGRlbGV0ZSBAZmFkaW5nXG5cbiAgICAjIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgICAgMCAgICAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBtb3ZlRmFjdG9yOiAtPiBAZGlzdC8yXG4gICAgXG4gICAgc3RhcnRNb3ZlUmlnaHQ6ICAgIC0+IEBtb3ZlLnggPSAgQG1vdmVGYWN0b3IoKTsgQHN0YXJ0TW92ZSgpXG4gICAgc3RhcnRNb3ZlTGVmdDogICAgIC0+IEBtb3ZlLnggPSAtQG1vdmVGYWN0b3IoKTsgQHN0YXJ0TW92ZSgpXG5cbiAgICBzdGFydE1vdmVVcDogICAgICAgLT4gQG1vdmUueSA9ICBAbW92ZUZhY3RvcigpOyBAc3RhcnRNb3ZlKClcbiAgICBzdGFydE1vdmVEb3duOiAgICAgLT4gQG1vdmUueSA9IC1AbW92ZUZhY3RvcigpOyBAc3RhcnRNb3ZlKClcblxuICAgIHN0YXJ0TW92ZUJhY2t3YXJkOiAtPiBAbW92ZS56ID0gIEBtb3ZlRmFjdG9yKCk7IEBzdGFydE1vdmUoKVxuICAgIHN0YXJ0TW92ZUZvcndhcmQ6ICAtPiBAbW92ZS56ID0gLUBtb3ZlRmFjdG9yKCk7IEBzdGFydE1vdmUoKVxuXG4gICAgc3RvcE1vdmVSaWdodDogICAgIC0+IEBtb3ZlLnggPSBtaW4gMCBAbW92ZS54XG4gICAgc3RvcE1vdmVMZWZ0OiAgICAgIC0+IEBtb3ZlLnggPSBtYXggMCBAbW92ZS54XG5cbiAgICBzdG9wTW92ZVVwOiAgICAgICAgLT4gQG1vdmUueSA9IG1pbiAwIEBtb3ZlLnlcbiAgICBzdG9wTW92ZURvd246ICAgICAgLT4gQG1vdmUueSA9IG1heCAwIEBtb3ZlLnlcblxuICAgIHN0b3BNb3ZlQmFja3dhcmQ6ICAtPiBAbW92ZS56ID0gbWluIDAgQG1vdmUuelxuICAgIHN0b3BNb3ZlRm9yd2FyZDogICAtPiBAbW92ZS56ID0gbWF4IDAgQG1vdmUuelxuICAgIFxuICAgIHN0YXJ0TW92ZTogLT4gXG4gICAgICAgIFxuICAgICAgICBAZmFkaW5nID0gZmFsc2VcbiAgICAgICAgaWYgbm90IEBtb3ZpbmdcbiAgICAgICAgICAgIEBhbmltYXRlIEBtb3ZlQ2VudGVyXG4gICAgICAgICAgICBAbW92aW5nID0gdHJ1ZVxuICAgICAgICAgICAgXG4gICAgc3RvcE1vdmluZzogLT5cbiAgICAgICAgXG4gICAgICAgIEBtb3ZpbmcgPSBmYWxzZVxuICAgICAgICBAbW92ZS5zZXQgMCAwIDBcbiAgICAgICAgXG4gICAgbW92ZUNlbnRlcjogKGRlbHRhU2Vjb25kcykgPT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgQG1vdmluZ1xuICAgICAgICBcbiAgICAgICAgZGlyID0gbmV3IFZlY3RvcjNcbiAgICAgICAgZGlyLmFkZCBAbW92ZVxuXG4gICAgICAgIGRpci5tdWx0aXBseVNjYWxhciBkZWx0YVNlY29uZHNcbiAgICAgICAgZGlyLmFwcGx5UXVhdGVybmlvbiBAcXVhdGVybmlvblxuICAgICAgICBcbiAgICAgICAgQGNlbnRlci5hZGQgZGlyXG4gICAgICAgIEB1cGRhdGUoKVxuICAgICAgICBcbiAgICAgICAgIyBAbW92ZS5tdWx0aXBseVNjYWxhciAwLjk2XG4gICAgICAgIFxuICAgICAgICBpZiBAbW92ZS5sZW5ndGgoKSA+IDAuMDAxXG4gICAgICAgICAgICBAYW5pbWF0ZSBAbW92ZUNlbnRlclxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc3RvcE1vdmluZygpXG4gICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICBcbiAgICBcbiAgICBvbk1vdXNlV2hlZWw6IChldmVudCkgPT4gXG4gICAgXG4gICAgICAgIGlmIEB3aGVlbEluZXJ0ID4gMCBhbmQgZXZlbnQud2hlZWxEZWx0YSA8IDBcbiAgICAgICAgICAgIEB3aGVlbEluZXJ0ID0gMFxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgQHdoZWVsSW5lcnQgPCAwIGFuZCBldmVudC53aGVlbERlbHRhID4gMFxuICAgICAgICAgICAgQHdoZWVsSW5lcnQgPSAwXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIFxuICAgICAgICBAd2hlZWxJbmVydCArPSBldmVudC53aGVlbERlbHRhICogKDErKEBkaXN0L0BtYXhEaXN0KSozKSAqIDAuMDAwMVxuICAgICAgICBcbiAgICAgICAgQHN0YXJ0Wm9vbSgpXG5cbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMCAgICAgMDAgIFxuICAgICMgICAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAgIDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG5cbiAgICBzdGFydFpvb21JbjogLT5cbiAgICAgICAgXG4gICAgICAgIEB3aGVlbEluZXJ0ID0gKDErKEBkaXN0L0BtYXhEaXN0KSozKSoxMFxuICAgICAgICBAc3RhcnRab29tKClcbiAgICAgICAgXG4gICAgc3RhcnRab29tT3V0OiAtPlxuICAgICAgICBcbiAgICAgICAgQHdoZWVsSW5lcnQgPSAtKDErKEBkaXN0L0BtYXhEaXN0KSozKSoxMFxuICAgICAgICBAc3RhcnRab29tKClcbiAgICBcbiAgICBzdGFydFpvb206IC0+IFxuICAgICAgICBcbiAgICAgICAgaWYgbm90IEB6b29taW5nXG4gICAgICAgICAgICBAYW5pbWF0ZSBAaW5lcnRab29tXG4gICAgICAgICAgICBAem9vbWluZyA9IHRydWVcbiAgICAgICAgICAgIFxuICAgIHN0b3Bab29tOiAtPiBcbiAgICAgICAgXG4gICAgICAgIEB3aGVlbEluZXJ0ID0gMFxuICAgICAgICBAem9vbWluZyA9IGZhbHNlXG4gICAgXG4gICAgaW5lcnRab29tOiAoZGVsdGFTZWNvbmRzKSA9PlxuXG4gICAgICAgIEBzZXREaXN0RmFjdG9yIDEgLSBjbGFtcCAtMC4wMiwgMC4wMiwgQHdoZWVsSW5lcnRcbiAgICAgICAgQHdoZWVsSW5lcnQgPSByZWR1Y2UgQHdoZWVsSW5lcnQsIGRlbHRhU2Vjb25kcyowLjNcbiAgICAgICAgXG4gICAgICAgIGlmIGFicyhAd2hlZWxJbmVydCkgPiAwLjAwMDAxXG4gICAgICAgICAgICBAYW5pbWF0ZSBAaW5lcnRab29tXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGRlbGV0ZSBAem9vbWluZ1xuICAgICAgICAgICAgQHdoZWVsSW5lcnQgPSAwXG4gICAgXG4gICAgc2V0RGlzdEZhY3RvcjogKGZhY3RvcikgPT5cbiAgICAgICAgXG4gICAgICAgIEBkaXN0ID0gY2xhbXAgQG1pbkRpc3QsIEBtYXhEaXN0LCBAZGlzdCpmYWN0b3JcbiAgICAgICAgQHVwZGF0ZSgpXG4gICAgICAgIFxuICAgIHNldEZvdjogKGZvdikgLT4gQGZvdiA9IG1heCgyLjAsIG1pbiBmb3YsIDE3NS4wKVxuICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwICAgICAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgdXBkYXRlOiAtPiBcbiAgICAgICAgXG4gICAgICAgIEBkZWdyZWUgPSBjbGFtcCAtOTAgOTAgQGRlZ3JlZVxuICAgICAgICBcbiAgICAgICAgQHF1YXRlcm5pb24uc2V0RnJvbUF4aXNBbmdsZSBuZXcgVmVjdG9yMygwIDEgMCksIGRlZzJyYWQgQHJvdGF0ZVxuXG4gICAgICAgIHBpdGNoUm90ID0gbmV3IFF1YXRlcm5pb25cbiAgICAgICAgcGl0Y2hSb3Quc2V0RnJvbUF4aXNBbmdsZSBuZXcgVmVjdG9yMygxIDAgMCksIGRlZzJyYWQgQGRlZ3JlZVxuICAgICAgICBcbiAgICAgICAgQHF1YXRlcm5pb24ubXVsdGlwbHkgcGl0Y2hSb3RcbiAgICAgICAgXG4gICAgICAgIEBwb3NpdGlvbi5jb3B5IEBjZW50ZXJcbiAgICAgICAgQHBvc2l0aW9uLmFkZCBuZXcgVmVjdG9yMygwIDAgQGRpc3QpLmFwcGx5UXVhdGVybmlvbiBAcXVhdGVybmlvblxuICAgICAgICBcbiAgICAgICAgcHJlZnMuc2V0ICdjYW1lcmHilrhkaXN0JyAgIEBkaXN0XG4gICAgICAgIHByZWZzLnNldCAnY2FtZXJh4pa4ZGVncmVlJyBAZGVncmVlXG4gICAgICAgIHByZWZzLnNldCAnY2FtZXJh4pa4cm90YXRlJyBAcm90YXRlXG4gICAgICAgIHByZWZzLnNldCAnY2FtZXJh4pa4eCcgQGNlbnRlci54IFxuICAgICAgICBwcmVmcy5zZXQgJ2NhbWVyYeKWuHknIEBjZW50ZXIueSAgXG4gICAgICAgIHByZWZzLnNldCAnY2FtZXJh4pa4eicgQGNlbnRlci56XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FtZXJhXG4iXX0=
//# sourceURL=../coffee/camera.coffee