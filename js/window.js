// koffee 1.12.0

/*
000   000  000  000   000  0000000     0000000   000   000
000 0 000  000  0000  000  000   000  000   000  000 0 000
000000000  000  000 0 000  000   000  000   000  000000000
000   000  000  000  0000  000   000  000   000  000   000
00     00  000  000   000  0000000     0000000   00     00
 */
var $, AmbientLight, AxesHelper, BackSide, BoxBufferGeometry, BoxGeometry, Camera, Color, FPS, Fog, FogExp2, GridHelper, MainWin, Mesh, MeshLambertMaterial, MeshPhysicalMaterial, MeshStandardMaterial, PCFSoftShadowMap, PMREMGenerator, PlaneGeometry, PointLight, PointLightHelper, Quaternion, Raycaster, Scene, SphereGeometry, Vector2, WebGLRenderer, deg2rad, keyinfo, kpos, prefs, ref, ref1, win,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), $ = ref.$, deg2rad = ref.deg2rad, keyinfo = ref.keyinfo, kpos = ref.kpos, prefs = ref.prefs, win = ref.win;

ref1 = require('three'), AxesHelper = ref1.AxesHelper, Fog = ref1.Fog, FogExp2 = ref1.FogExp2, AmbientLight = ref1.AmbientLight, BackSide = ref1.BackSide, BoxBufferGeometry = ref1.BoxBufferGeometry, BoxGeometry = ref1.BoxGeometry, Camera = ref1.Camera, Color = ref1.Color, GridHelper = ref1.GridHelper, Mesh = ref1.Mesh, MeshLambertMaterial = ref1.MeshLambertMaterial, MeshPhysicalMaterial = ref1.MeshPhysicalMaterial, MeshStandardMaterial = ref1.MeshStandardMaterial, PCFSoftShadowMap = ref1.PCFSoftShadowMap, PMREMGenerator = ref1.PMREMGenerator, PlaneGeometry = ref1.PlaneGeometry, PointLight = ref1.PointLight, PointLightHelper = ref1.PointLightHelper, Quaternion = ref1.Quaternion, Raycaster = ref1.Raycaster, Scene = ref1.Scene, SphereGeometry = ref1.SphereGeometry, Vector2 = ref1.Vector2, WebGLRenderer = ref1.WebGLRenderer;

Camera = require('./camera');

FPS = require('./fps');

MainWin = (function(superClass) {
    extend(MainWin, superClass);

    function MainWin() {
        this.onMenuAction = bind(this.onMenuAction, this);
        this.onMouseDown = bind(this.onMouseDown, this);
        this.onMouseUp = bind(this.onMouseUp, this);
        this.onMouseMove = bind(this.onMouseMove, this);
        this.onKeyUp = bind(this.onKeyUp, this);
        this.onKeyDown = bind(this.onKeyDown, this);
        this.onResize = bind(this.onResize, this);
        this.renderScene = bind(this.renderScene, this);
        this.onLoad = bind(this.onLoad, this);
        MainWin.__super__.constructor.call(this, {
            dir: __dirname,
            pkg: require('../package.json'),
            menu: '../coffee/menu.noon',
            icon: '../img/mini.png',
            prefsSeperator: '▸',
            context: false,
            onLoad: this.onLoad
        });
        this.mouse = new Vector2;
        this.initOptions();
        addEventListener('pointerdown', this.onMouseDown);
        addEventListener('pointermove', this.onMouseMove);
        addEventListener('pointerup', this.onMouseUp);
    }

    MainWin.prototype.onLoad = function() {
        window.onresize = this.onResize;
        this.initScene($("#main"));
        return requestAnimationFrame(this.renderScene);
    };

    MainWin.prototype.initScene = function(view) {
        var box, br, geometry, i, len, material, opt, ref2, sphere;
        this.view = view;
        this.renderer = new WebGLRenderer({
            antialias: true,
            precision: 'highp'
        });
        this.renderer.setSize(this.view.offsetWidth, this.view.offsetHeight);
        this.renderer.autoClear = false;
        this.renderer.sortObjects = true;
        this.renderer.shadowMap.type = PCFSoftShadowMap;
        this.renderer.shadowMap.enabled = true;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.view.appendChild(this.renderer.domElement);
        this.fogColor = new Color('hsl(180, 0%, 4%)');
        this.onResize();
        br = this.renderer.domElement.getBoundingClientRect();
        this.viewOffset = new Vector2(br.left, br.top);
        this.scene = new Scene();
        this.scene.background = this.fogColor;
        this.camera = new Camera({
            view: this.view
        });
        this.sun = new PointLight(0xffffff, 2, 200);
        this.sun.position.set(0, 10, 0);
        this.sun.castShadow = true;
        this.sun.shadow.mapSize = new Vector2(2 * 2048, 2 * 2048);
        this.scene.add(this.sun);
        this.scene.add(new PointLightHelper(this.sun, 1));
        this.ambient = new AmbientLight(0x181818);
        this.scene.add(this.ambient);
        material = new MeshStandardMaterial({
            metalness: 0.6,
            roughness: 0.3,
            color: 0x5555ff
        });
        geometry = new BoxGeometry(1, 1, 1);
        box = new Mesh(geometry, material.clone());
        box.position.set(0, 1, 0);
        box.castShadow = true;
        box.receiveShadow = true;
        box.name = 'box';
        this.scene.add(box);
        material.color = new Color(0xff0000);
        material.flatShading = true;
        material.metalness = 0.9;
        geometry = new SphereGeometry(1, 10, 10);
        sphere = new Mesh(geometry, material);
        sphere.position.set(2, 1, 1);
        sphere.castShadow = true;
        sphere.receiveShadow = true;
        sphere.name = 'sphere';
        this.scene.add(sphere);
        material = new MeshStandardMaterial({
            metalness: 0.0,
            color: new Color('hsl(180,0%,4%)'),
            roughness: 1.0,
            flatShading: true
        });
        geometry = new PlaneGeometry(1000, 1000, 10);
        geometry.quaternion = new Quaternion;
        this.plane = new Mesh(geometry, material);
        this.plane.castShadow = false;
        this.plane.receiveShadow = true;
        this.plane.name = 'plane';
        this.plane.rotation.set(deg2rad(-90), 0, 0);
        this.scene.add(this.plane);
        this.scene.fog = new Fog(this.fogColor, 10, 100);
        ref2 = Object.keys(this.options);
        for (i = 0, len = ref2.length; i < len; i++) {
            opt = ref2[i];
            this.setOption(opt, this.options[opt]);
        }
        return this.raycaster = new Raycaster;
    };

    MainWin.prototype.renderScene = function() {
        var ref2;
        if ((ref2 = this.fps) != null) {
            ref2.draw();
        }
        this.sun.position.copy(this.camera.getPosition());
        this.sun.position.add(this.camera.getUp().multiplyScalar(3.0));
        this.sun.position.add(this.camera.getRight().multiplyScalar(-3.0));
        this.renderer.render(this.scene, this.camera);
        return requestAnimationFrame(this.renderScene);
    };

    MainWin.prototype.onResize = function() {
        var h, ref2, w;
        w = this.view.clientWidth;
        h = this.view.clientHeight;
        this.aspect = w / h;
        this.viewSize = kpos(w, h);
        if (this.camera != null) {
            this.camera.aspect = this.aspect;
            this.camera.size = this.viewSize;
            this.camera.updateProjectionMatrix();
        }
        return (ref2 = this.renderer) != null ? ref2.setSize(w, h) : void 0;
    };

    MainWin.prototype.initOptions = function() {
        var i, len, opt, ref2, results;
        this.options = {};
        ref2 = ['fps', 'plane', 'grid', 'axes', 'dither', 'shadow', 'fog'];
        results = [];
        for (i = 0, len = ref2.length; i < len; i++) {
            opt = ref2[i];
            results.push(this.options[opt] = prefs.get("option▸" + opt, true));
        }
        return results;
    };

    MainWin.prototype.toggle = function(opt) {
        return this.setOption(opt, !this.options[opt]);
    };

    MainWin.prototype.setOption = function(opt, val) {
        var ref2;
        this.options[opt] = val;
        prefs.set("option▸" + opt, val);
        switch (opt) {
            case 'fps':
                if (val) {
                    return this.fps = new FPS;
                } else {
                    if ((ref2 = this.fps) != null) {
                        ref2.remove();
                    }
                    return delete this.fps;
                }
                break;
            case 'shadow':
                this.renderer.shadowMap.enabled = val;
                return this.sun.castShadow = val;
            case 'plane':
                if (val) {
                    return this.scene.add(this.plane);
                } else {
                    return this.scene.remove(this.plane);
                }
                break;
            case 'dither':
                return this.scene.traverse(function(node) {
                    if (node instanceof Mesh) {
                        node.material.dithering = val;
                        return node.material.needsUpdate = true;
                    }
                });
            case 'fog':
                if (val) {
                    this.scene.fog.near = 10;
                    return this.scene.fog.far = 50;
                } else {
                    this.scene.fog.near = 99999;
                    return this.scene.fog.far = 99999 + 1;
                }
                break;
            case 'grid':
                if (val) {
                    this.grid = new GridHelper(100, 100, 0x333333, 0x0);
                    this.grid.position.y = 0.05;
                    return this.scene.add(this.grid);
                } else {
                    this.scene.remove(this.grid);
                    return delete this.grid;
                }
                break;
            case 'axes':
                if (val) {
                    this.axes = new AxesHelper(100);
                    this.axes.position.y = 0.06;
                    return this.scene.add(this.axes);
                } else {
                    this.scene.remove(this.axes);
                    return delete this.axes;
                }
        }
    };

    MainWin.prototype.onKeyDown = function(event) {
        var char, combo, key, mod, ref2;
        ref2 = keyinfo.forEvent(event), mod = ref2.mod, key = ref2.key, combo = ref2.combo, char = ref2.char;
        if (event.repeat) {
            return;
        }
        switch (key) {
            case 'w':
                this.camera.startMoveForward();
                break;
            case 's':
                this.camera.startMoveBackward();
                break;
            case 'a':
                this.camera.startMoveLeft();
                break;
            case 'd':
                this.camera.startMoveRight();
                break;
            case 'q':
                this.camera.startMoveDown();
                break;
            case 'e':
                this.camera.startMoveUp();
                break;
            case 'left':
                this.camera.startPivotLeft();
                break;
            case 'right':
                this.camera.startPivotRight();
                break;
            case 'up':
                this.camera.startPivotUp();
                break;
            case 'down':
                this.camera.startPivotDown();
                break;
            case 'r':
                this.camera.reset();
                break;
            case '1':
                this.camera.decrementMoveSpeed();
                break;
            case '2':
                this.camera.incrementMoveSpeed();
                break;
            case 'g':
                this.toggle('grid');
                break;
            case 'p':
                this.toggle('plane');
                break;
            case 'h':
                this.toggle('shadow');
                break;
            case 'y':
                this.toggle('axes');
                break;
            case 'f':
                this.toggle('fog');
                break;
            case 'o':
                this.toggle('fps');
                break;
            case 't':
                this.toggle('dither');
        }
        return MainWin.__super__.onKeyDown.apply(this, arguments);
    };

    MainWin.prototype.onKeyUp = function(event) {
        var char, combo, key, mod, ref2;
        ref2 = keyinfo.forEvent(event), mod = ref2.mod, key = ref2.key, combo = ref2.combo, char = ref2.char;
        switch (key) {
            case 'w':
                this.camera.stopMoveForward();
                break;
            case 's':
                this.camera.stopMoveBackward();
                break;
            case 'a':
                this.camera.stopMoveLeft();
                break;
            case 'd':
                this.camera.stopMoveRight();
                break;
            case 'q':
                this.camera.stopMoveDown();
                break;
            case 'e':
                this.camera.stopMoveUp();
                break;
            case 'left':
                this.camera.stopPivotLeft();
                break;
            case 'right':
                this.camera.stopPivotRight();
                break;
            case 'up':
                this.camera.stopPivotUp();
                break;
            case 'down':
                this.camera.stopPivotDown();
        }
        return MainWin.__super__.onKeyUp.apply(this, arguments);
    };

    MainWin.prototype.mouseEvent = function(event) {
        if (this.viewOffset) {
            this.mouse.x = ((event.clientX - this.viewOffset.x) / this.view.clientWidth) * 2 - 1;
            return this.mouse.y = -((event.clientY - this.viewOffset.y) / this.view.clientHeight) * 2 + 1;
        }
    };

    MainWin.prototype.onMouseMove = function(event) {
        return this.mouseEvent(event);
    };

    MainWin.prototype.onMouseUp = function(event) {
        return this.mouseEvent(event);
    };

    MainWin.prototype.onMouseDown = function(event) {
        this.mouseEvent(event);
        return this.pickObject(event);
    };

    MainWin.prototype.pickObject = function(event) {
        var i, intersect, len, ref2, ref3;
        if (event.buttons !== 1) {
            return;
        }
        this.raycaster.setFromCamera(this.mouse, this.camera);
        ref2 = this.raycaster.intersectObjects(this.scene.children);
        for (i = 0, len = ref2.length; i < len; i++) {
            intersect = ref2[i];
            if ((intersect != null ? (ref3 = intersect.object) != null ? ref3.type : void 0 : void 0) === 'Mesh') {
                if (intersect.object.name !== 'plane') {
                    this.camera.setPivotCenter(intersect.object.position);
                    return;
                }
            }
        }
    };

    MainWin.prototype.onMenuAction = function(action, args) {
        return MainWin.__super__.onMenuAction.apply(this, arguments);
    };

    return MainWin;

})(win);

new MainWin;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93LmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsid2luZG93LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSx1WUFBQTtJQUFBOzs7O0FBUUEsTUFBNEMsT0FBQSxDQUFRLEtBQVIsQ0FBNUMsRUFBRSxTQUFGLEVBQUsscUJBQUwsRUFBYyxxQkFBZCxFQUF1QixlQUF2QixFQUE2QixpQkFBN0IsRUFBb0M7O0FBRXBDLE9BQThVLE9BQUEsQ0FBUSxPQUFSLENBQTlVLEVBQUUsNEJBQUYsRUFBYyxjQUFkLEVBQW1CLHNCQUFuQixFQUE0QixnQ0FBNUIsRUFBMEMsd0JBQTFDLEVBQW9ELDBDQUFwRCxFQUF1RSw4QkFBdkUsRUFBb0Ysb0JBQXBGLEVBQTRGLGtCQUE1RixFQUFtRyw0QkFBbkcsRUFBK0csZ0JBQS9HLEVBQXFILDhDQUFySCxFQUEwSSxnREFBMUksRUFBZ0ssZ0RBQWhLLEVBQXNMLHdDQUF0TCxFQUF3TSxvQ0FBeE0sRUFBd04sa0NBQXhOLEVBQXVPLDRCQUF2TyxFQUFtUCx3Q0FBblAsRUFBcVEsNEJBQXJRLEVBQWlSLDBCQUFqUixFQUE0UixrQkFBNVIsRUFBbVMsb0NBQW5TLEVBQW1ULHNCQUFuVCxFQUE0VDs7QUFFNVQsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztBQUNULEdBQUEsR0FBUyxPQUFBLENBQVEsT0FBUjs7QUFFSDs7O0lBRUMsaUJBQUE7Ozs7Ozs7Ozs7UUFFQyx5Q0FDSTtZQUFBLEdBQUEsRUFBUSxTQUFSO1lBQ0EsR0FBQSxFQUFRLE9BQUEsQ0FBUSxpQkFBUixDQURSO1lBRUEsSUFBQSxFQUFRLHFCQUZSO1lBR0EsSUFBQSxFQUFRLGlCQUhSO1lBSUEsY0FBQSxFQUFnQixHQUpoQjtZQUtBLE9BQUEsRUFBUyxLQUxUO1lBTUEsTUFBQSxFQUFRLElBQUMsQ0FBQSxNQU5UO1NBREo7UUFTQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUk7UUFFYixJ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Q0ksSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUFSLENBQXVCLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBeEM7QUFDQSwyQkFGSjtpQkFESjs7QUFESjtJQUpROztzQkFnQlosWUFBQSxHQUFjLFNBQUMsTUFBRCxFQUFTLElBQVQ7ZUFJViwyQ0FBQSxTQUFBO0lBSlU7Ozs7R0EzVEk7O0FBaVV0QixJQUFJIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4wMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwXG4wMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4wMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAgICAgIDAwXG4jIyNcblxueyAkLCBkZWcycmFkLCBrZXlpbmZvLCBrcG9zLCBwcmVmcywgd2luIH0gPSByZXF1aXJlICdreGsnXG5cbnsgQXhlc0hlbHBlciwgRm9nLCBGb2dFeHAyLCBBbWJpZW50TGlnaHQsIEJhY2tTaWRlLCBCb3hCdWZmZXJHZW9tZXRyeSwgQm94R2VvbWV0cnksIENhbWVyYSwgQ29sb3IsIEdyaWRIZWxwZXIsIE1lc2gsIE1lc2hMYW1iZXJ0TWF0ZXJpYWwsIE1lc2hQaHlzaWNhbE1hdGVyaWFsLCBNZXNoU3RhbmRhcmRNYXRlcmlhbCwgUENGU29mdFNoYWRvd01hcCwgUE1SRU1HZW5lcmF0b3IsIFBsYW5lR2VvbWV0cnksIFBvaW50TGlnaHQsIFBvaW50TGlnaHRIZWxwZXIsIFF1YXRlcm5pb24sIFJheWNhc3RlciwgU2NlbmUsIFNwaGVyZUdlb21ldHJ5LCBWZWN0b3IyLCBXZWJHTFJlbmRlcmVyIH0gPSByZXF1aXJlICd0aHJlZSdcblxuQ2FtZXJhID0gcmVxdWlyZSAnLi9jYW1lcmEnXG5GUFMgICAgPSByZXF1aXJlICcuL2ZwcydcblxuY2xhc3MgTWFpbldpbiBleHRlbmRzIHdpblxuICAgIFxuICAgIEA6IC0+XG4gICAgICAgIFxuICAgICAgICBzdXBlclxuICAgICAgICAgICAgZGlyOiAgICBfX2Rpcm5hbWVcbiAgICAgICAgICAgIHBrZzogICAgcmVxdWlyZSAnLi4vcGFja2FnZS5qc29uJ1xuICAgICAgICAgICAgbWVudTogICAnLi4vY29mZmVlL21lbnUubm9vbidcbiAgICAgICAgICAgIGljb246ICAgJy4uL2ltZy9taW5pLnBuZydcbiAgICAgICAgICAgIHByZWZzU2VwZXJhdG9yOiAn4pa4J1xuICAgICAgICAgICAgY29udGV4dDogZmFsc2VcbiAgICAgICAgICAgIG9uTG9hZDogQG9uTG9hZFxuICAgICAgICAgIFxuICAgICAgICBAbW91c2UgPSBuZXcgVmVjdG9yMlxuICAgICAgICBcbiAgICAgICAgQGluaXRPcHRpb25zKClcbiAgICAgICAgICAgIFxuICAgICAgICBhZGRFdmVudExpc3RlbmVyICdwb2ludGVyZG93bicgQG9uTW91c2VEb3duXG4gICAgICAgIGFkZEV2ZW50TGlzdGVuZXIgJ3BvaW50ZXJtb3ZlJyBAb25Nb3VzZU1vdmVcbiAgICAgICAgYWRkRXZlbnRMaXN0ZW5lciAncG9pbnRlcnVwJyAgIEBvbk1vdXNlVXBcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgIG9uTG9hZDogPT5cblxuICAgICAgICB3aW5kb3cub25yZXNpemUgPSBAb25SZXNpemVcbiAgICAgICAgXG4gICAgICAgIEBpbml0U2NlbmUgJCBcIiNtYWluXCJcbiAgICAgICAgXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSBAcmVuZGVyU2NlbmVcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgIDAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIGluaXRTY2VuZTogKEB2aWV3KSAtPlxuICAgICAgICAgICAgICAgIFxuICAgICAgICBAcmVuZGVyZXIgPSBuZXcgV2ViR0xSZW5kZXJlciBhbnRpYWxpYXM6dHJ1ZSBwcmVjaXNpb246J2hpZ2hwJ1xuICAgICAgICAgICAgXG4gICAgICAgIEByZW5kZXJlci5zZXRTaXplIEB2aWV3Lm9mZnNldFdpZHRoLCBAdmlldy5vZmZzZXRIZWlnaHRcbiAgICAgICAgQHJlbmRlcmVyLmF1dG9DbGVhciAgICAgICAgID0gZmFsc2VcbiAgICAgICAgQHJlbmRlcmVyLnNvcnRPYmplY3RzICAgICAgID0gdHJ1ZVxuICAgICAgICBAcmVuZGVyZXIuc2hhZG93TWFwLnR5cGUgICAgPSBQQ0ZTb2Z0U2hhZG93TWFwXG4gICAgICAgIEByZW5kZXJlci5zaGFkb3dNYXAuZW5hYmxlZCA9IHRydWVcbiAgICAgICAgQHJlbmRlcmVyLnNldFBpeGVsUmF0aW8gd2luZG93LmRldmljZVBpeGVsUmF0aW8gXG4gICAgICAgIEB2aWV3LmFwcGVuZENoaWxkIEByZW5kZXJlci5kb21FbGVtZW50XG4gICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBAZm9nQ29sb3IgPSBuZXcgQ29sb3IgJ2hzbCgxODAsIDAlLCA0JSknXG4gICAgICAgIFxuICAgICAgICBAb25SZXNpemUoKVxuICAgICAgICBcbiAgICAgICAgYnIgPSBAcmVuZGVyZXIuZG9tRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICBAdmlld09mZnNldCA9IG5ldyBWZWN0b3IyIGJyLmxlZnQsIGJyLnRvcFxuICAgICAgICBcbiAgICAgICAgQHNjZW5lID0gbmV3IFNjZW5lKClcbiAgICAgICAgQHNjZW5lLmJhY2tncm91bmQgPSBAZm9nQ29sb3JcbiAgICAgICAgQGNhbWVyYSA9IG5ldyBDYW1lcmEgdmlldzpAdmlld1xuXG4gICAgICAgIEBzdW4gPSBuZXcgUG9pbnRMaWdodCAweGZmZmZmZiwgMiwgMjAwXG4gICAgICAgIEBzdW4ucG9zaXRpb24uc2V0IDAgMTAgMFxyXG4gICAgICAgIEBzdW4uY2FzdFNoYWRvdyA9IHRydWVcbiAgICAgICAgQHN1bi5zaGFkb3cubWFwU2l6ZSA9IG5ldyBWZWN0b3IyIDIqMjA0OCwgMioyMDQ4XG4gICAgICAgIEBzY2VuZS5hZGQgQHN1blxuICAgICAgICBcbiAgICAgICAgQHNjZW5lLmFkZCBuZXcgUG9pbnRMaWdodEhlbHBlciBAc3VuLCAxXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEBhbWJpZW50ID0gbmV3IEFtYmllbnRMaWdodCAweDE4MTgxOFxuICAgICAgICBAc2NlbmUuYWRkIEBhbWJpZW50XG4gICAgICAgIFxuICAgICAgICBtYXRlcmlhbCA9IG5ldyBNZXNoU3RhbmRhcmRNYXRlcmlhbCB7XG4gICAgICAgICAgICBtZXRhbG5lc3M6IDAuNlxuICAgICAgICAgICAgcm91Z2huZXNzOiAwLjNcclxuICAgICAgICAgICAgY29sb3I6MHg1NTU1ZmZcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZ2VvbWV0cnkgPSBuZXcgQm94R2VvbWV0cnkgMSAxIDFcbiAgICAgICAgYm94ID0gbmV3IE1lc2ggZ2VvbWV0cnksIG1hdGVyaWFsLmNsb25lKClcbiAgICAgICAgYm94LnBvc2l0aW9uLnNldCAwIDEgMFxuICAgICAgICBib3guY2FzdFNoYWRvdyA9IHRydWVcbiAgICAgICAgYm94LnJlY2VpdmVTaGFkb3cgPSB0cnVlXG4gICAgICAgIGJveC5uYW1lID0gJ2JveCdcbiAgICAgICAgQHNjZW5lLmFkZCBib3hcblxuICAgICAgICBtYXRlcmlhbC5jb2xvciA9IG5ldyBDb2xvciAweGZmMDAwMFxuICAgICAgICBtYXRlcmlhbC5mbGF0U2hhZGluZyA9IHRydWVcbiAgICAgICAgbWF0ZXJpYWwubWV0YWxuZXNzID0gMC45XG4gICAgICAgIGdlb21ldHJ5ID0gbmV3IFNwaGVyZUdlb21ldHJ5IDEgMTAgMTBcbiAgICAgICAgc3BoZXJlID0gbmV3IE1lc2ggZ2VvbWV0cnksIG1hdGVyaWFsXG4gICAgICAgIHNwaGVyZS5wb3NpdGlvbi5zZXQgMiAxIDFcbiAgICAgICAgc3BoZXJlLmNhc3RTaGFkb3cgPSB0cnVlXG4gICAgICAgIHNwaGVyZS5yZWNlaXZlU2hhZG93ID0gdHJ1ZVxuICAgICAgICBzcGhlcmUubmFtZSA9ICdzcGhlcmUnXG4gICAgICAgIEBzY2VuZS5hZGQgc3BoZXJlXG4gICAgICBcbiAgICAgICAgbWF0ZXJpYWwgPSBuZXcgTWVzaFN0YW5kYXJkTWF0ZXJpYWwge1xuICAgICAgICAgICAgbWV0YWxuZXNzOiAwLjBcbiAgICAgICAgICAgIGNvbG9yOiBuZXcgQ29sb3IgJ2hzbCgxODAsMCUsNCUpJ1xuICAgICAgICAgICAgcm91Z2huZXNzOiAxLjBcclxuICAgICAgICAgICAgZmxhdFNoYWRpbmc6IHRydWVcbiAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBnZW9tZXRyeSA9IG5ldyBQbGFuZUdlb21ldHJ5IDEwMDAgMTAwMCAxMFxuICAgICAgICBnZW9tZXRyeS5xdWF0ZXJuaW9uID0gbmV3IFF1YXRlcm5pb25cbiAgICAgICAgQHBsYW5lID0gbmV3IE1lc2ggZ2VvbWV0cnksIG1hdGVyaWFsXG4gICAgICAgIEBwbGFuZS5jYXN0U2hhZG93ID0gZmFsc2VcbiAgICAgICAgQHBsYW5lLnJlY2VpdmVTaGFkb3cgPSB0cnVlXG4gICAgICAgIEBwbGFuZS5uYW1lID0gJ3BsYW5lJ1xuICAgICAgICBAcGxhbmUucm90YXRpb24uc2V0IGRlZzJyYWQoLTkwKSwgMCAwXG4gICAgICAgIEBzY2VuZS5hZGQgQHBsYW5lXG5cbiAgICAgICAgIyBrbG9nIE9iamVjdC5rZXlzIHJlcXVpcmUgJ3RocmVlJ1xuICAgICAgICBAc2NlbmUuZm9nID0gbmV3IEZvZyBAZm9nQ29sb3IsIDEwIDEwMFxuXG4gICAgICAgIGZvciBvcHQgaW4gT2JqZWN0LmtleXMgQG9wdGlvbnNcbiAgICAgICAgICAgIEBzZXRPcHRpb24gb3B0LCBAb3B0aW9uc1tvcHRdXG4gICAgICAgIFxuICAgICAgICBAcmF5Y2FzdGVyID0gbmV3IFJheWNhc3RlclxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICByZW5kZXJTY2VuZTogPT5cbiAgICAgICAgXG4gICAgICAgIEBmcHM/LmRyYXcoKVxuICAgICAgICBAc3VuLnBvc2l0aW9uLmNvcHkgQGNhbWVyYS5nZXRQb3NpdGlvbigpXG4gICAgICAgIEBzdW4ucG9zaXRpb24uYWRkICBAY2FtZXJhLmdldFVwKCkubXVsdGlwbHlTY2FsYXIgMy4wXG4gICAgICAgIEBzdW4ucG9zaXRpb24uYWRkICBAY2FtZXJhLmdldFJpZ2h0KCkubXVsdGlwbHlTY2FsYXIgLTMuMFxuXG4gICAgICAgIEByZW5kZXJlci5yZW5kZXIgQHNjZW5lLCBAY2FtZXJhICAgICAgICBcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lIEByZW5kZXJTY2VuZVxuICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAwMDAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIG9uUmVzaXplOiA9PiBcbiAgICAgICAgXG4gICAgICAgIHcgPSBAdmlldy5jbGllbnRXaWR0aCBcbiAgICAgICAgaCA9IEB2aWV3LmNsaWVudEhlaWdodFxuICAgICAgICBcbiAgICAgICAgQGFzcGVjdCA9IHcvaFxuICAgICAgICBAdmlld1NpemUgPSBrcG9zIHcsaFxuICBcbiAgICAgICAgaWYgQGNhbWVyYT9cbiAgICAgICAgICAgIEBjYW1lcmEuYXNwZWN0ID0gQGFzcGVjdFxuICAgICAgICAgICAgQGNhbWVyYS5zaXplICAgPSBAdmlld1NpemVcbiAgICAgICAgICAgIEBjYW1lcmEudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpXG4gICAgICAgIFxuICAgICAgICBAcmVuZGVyZXI/LnNldFNpemUgdyxoXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgICAgICAwMDAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGluaXRPcHRpb25zOiAtPlxuICAgICAgICBcbiAgICAgICAgQG9wdGlvbnMgPSB7fVxuICAgICAgICBmb3Igb3B0IGluIFsnZnBzJyAncGxhbmUnICdncmlkJyAnYXhlcycgJ2RpdGhlcicgJ3NoYWRvdycgJ2ZvZyddXG4gICAgICAgICAgICBAb3B0aW9uc1tvcHRdID0gIHByZWZzLmdldCBcIm9wdGlvbuKWuCN7b3B0fVwiIHRydWVcbiAgICBcbiAgICB0b2dnbGU6IChvcHQpIC0+IEBzZXRPcHRpb24gb3B0LCBub3QgQG9wdGlvbnNbb3B0XVxuXG4gICAgc2V0T3B0aW9uOiAob3B0LCB2YWwpIC0+IFxuICAgICAgICBcbiAgICAgICAgQG9wdGlvbnNbb3B0XSA9IHZhbFxuICAgICAgICBwcmVmcy5zZXQgXCJvcHRpb27ilrgje29wdH1cIiB2YWxcbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCBvcHRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgd2hlbiAnZnBzJ1xuICAgICAgICAgICAgICAgIGlmIHZhbFxuICAgICAgICAgICAgICAgICAgICBAZnBzID0gbmV3IEZQU1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQGZwcz8ucmVtb3ZlKClcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIEBmcHNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgd2hlbiAnc2hhZG93J1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEByZW5kZXJlci5zaGFkb3dNYXAuZW5hYmxlZCA9IHZhbFxuICAgICAgICAgICAgICAgIEBzdW4uY2FzdFNoYWRvdyA9IHZhbFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgd2hlbiAncGxhbmUnXG4gICAgICAgICAgICAgICAgaWYgdmFsXG4gICAgICAgICAgICAgICAgICAgIEBzY2VuZS5hZGQgQHBsYW5lXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAc2NlbmUucmVtb3ZlIEBwbGFuZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB3aGVuICdkaXRoZXInXG4gICAgICAgICAgICAgICAgQHNjZW5lLnRyYXZlcnNlIChub2RlKSAtPlxyXG4gICAgICAgICAgICAgICAgICAgIGlmIG5vZGUgaW5zdGFuY2VvZiBNZXNoXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLm1hdGVyaWFsLmRpdGhlcmluZyA9IHZhbFxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5tYXRlcmlhbC5uZWVkc1VwZGF0ZSA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgd2hlbiAnZm9nJ1xuICAgICAgICAgICAgICAgIGlmIHZhbFxuICAgICAgICAgICAgICAgICAgICBAc2NlbmUuZm9nLm5lYXIgPSAxMFxuICAgICAgICAgICAgICAgICAgICBAc2NlbmUuZm9nLmZhciAgPSA1MFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQHNjZW5lLmZvZy5uZWFyID0gOTk5OTlcbiAgICAgICAgICAgICAgICAgICAgQHNjZW5lLmZvZy5mYXIgID0gOTk5OTkrMVxuICAgICAgICBcbiAgICAgICAgICAgIHdoZW4gJ2dyaWQnXG4gICAgICAgICAgICAgICAgaWYgdmFsXG4gICAgICAgICAgICAgICAgICAgIEBncmlkID0gbmV3IEdyaWRIZWxwZXIgMTAwIDEwMCAweDMzMzMzMywgMHgwXG4gICAgICAgICAgICAgICAgICAgIEBncmlkLnBvc2l0aW9uLnkgPSAwLjA1XG4gICAgICAgICAgICAgICAgICAgIEBzY2VuZS5hZGQgQGdyaWRcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEBzY2VuZS5yZW1vdmUgQGdyaWRcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIEBncmlkXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHdoZW4gJ2F4ZXMnXG4gICAgICAgICAgICAgICAgaWYgdmFsXG4gICAgICAgICAgICAgICAgICAgIEBheGVzID0gbmV3IEF4ZXNIZWxwZXIgMTAwXG4gICAgICAgICAgICAgICAgICAgIEBheGVzLnBvc2l0aW9uLnkgPSAwLjA2XG4gICAgICAgICAgICAgICAgICAgIEBzY2VuZS5hZGQgQGF4ZXNcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEBzY2VuZS5yZW1vdmUgQGF4ZXNcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIEBheGVzXG4gICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAwMDAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBvbktleURvd246IChldmVudCkgPT5cblxuICAgICAgICB7IG1vZCwga2V5LCBjb21ibywgY2hhciB9ID0ga2V5aW5mby5mb3JFdmVudCBldmVudFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIGV2ZW50LnJlcGVhdFxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIGtleVxuICAgICAgICAgICAgd2hlbiAndycgICAgIHRoZW4gQGNhbWVyYS5zdGFydE1vdmVGb3J3YXJkKClcbiAgICAgICAgICAgIHdoZW4gJ3MnICAgICB0aGVuIEBjYW1lcmEuc3RhcnRNb3ZlQmFja3dhcmQoKVxuICAgICAgICAgICAgd2hlbiAnYScgICAgIHRoZW4gQGNhbWVyYS5zdGFydE1vdmVMZWZ0KClcbiAgICAgICAgICAgIHdoZW4gJ2QnICAgICB0aGVuIEBjYW1lcmEuc3RhcnRNb3ZlUmlnaHQoKVxuICAgICAgICAgICAgd2hlbiAncScgICAgIHRoZW4gQGNhbWVyYS5zdGFydE1vdmVEb3duKClcbiAgICAgICAgICAgIHdoZW4gJ2UnICAgICB0aGVuIEBjYW1lcmEuc3RhcnRNb3ZlVXAoKVxuICAgICAgICAgICAgd2hlbiAnbGVmdCcgIHRoZW4gQGNhbWVyYS5zdGFydFBpdm90TGVmdCgpXG4gICAgICAgICAgICB3aGVuICdyaWdodCcgdGhlbiBAY2FtZXJhLnN0YXJ0UGl2b3RSaWdodCgpXG4gICAgICAgICAgICB3aGVuICd1cCcgICAgdGhlbiBAY2FtZXJhLnN0YXJ0UGl2b3RVcCgpXG4gICAgICAgICAgICB3aGVuICdkb3duJyAgdGhlbiBAY2FtZXJhLnN0YXJ0UGl2b3REb3duKClcbiAgICAgICAgICAgIHdoZW4gJ3InICAgICB0aGVuIEBjYW1lcmEucmVzZXQoKVxuICAgICAgICAgICAgd2hlbiAnMScgICAgIHRoZW4gQGNhbWVyYS5kZWNyZW1lbnRNb3ZlU3BlZWQoKVxuICAgICAgICAgICAgd2hlbiAnMicgICAgIHRoZW4gQGNhbWVyYS5pbmNyZW1lbnRNb3ZlU3BlZWQoKVxuICAgICAgICAgICAgd2hlbiAnZycgICAgIHRoZW4gQHRvZ2dsZSAnZ3JpZCdcbiAgICAgICAgICAgIHdoZW4gJ3AnICAgICB0aGVuIEB0b2dnbGUgJ3BsYW5lJ1xuICAgICAgICAgICAgd2hlbiAnaCcgICAgIHRoZW4gQHRvZ2dsZSAnc2hhZG93J1xuICAgICAgICAgICAgd2hlbiAneScgICAgIHRoZW4gQHRvZ2dsZSAnYXhlcydcbiAgICAgICAgICAgIHdoZW4gJ2YnICAgICB0aGVuIEB0b2dnbGUgJ2ZvZydcbiAgICAgICAgICAgIHdoZW4gJ28nICAgICB0aGVuIEB0b2dnbGUgJ2ZwcydcbiAgICAgICAgICAgIHdoZW4gJ3QnICAgICB0aGVuIEB0b2dnbGUgJ2RpdGhlcidcbiAgICAgICAgICAgICMgZWxzZVxuICAgICAgICAgICAgICAgICMga2xvZyAna2V5RG93bicgbW9kLCBrZXksIGNvbWJvLCBjaGFyLCBldmVudC53aGljaFxuICAgICAgICBcbiAgICAgICAgc3VwZXJcbiAgICAgICAgXG4gICAgb25LZXlVcDogKGV2ZW50KSA9PlxuICAgICAgICBcbiAgICAgICAgeyBtb2QsIGtleSwgY29tYm8sIGNoYXIgfSA9IGtleWluZm8uZm9yRXZlbnQgZXZlbnRcbiAgICAgICAgIyBrbG9nICdrZXlVcCcgbW9kLCBrZXksIGNvbWJvLCBjaGFyLCBldmVudC53aGljaFxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIGtleVxuICAgICAgICAgICAgd2hlbiAndycgICAgIHRoZW4gQGNhbWVyYS5zdG9wTW92ZUZvcndhcmQoKVxuICAgICAgICAgICAgd2hlbiAncycgICAgIHRoZW4gQGNhbWVyYS5zdG9wTW92ZUJhY2t3YXJkKClcbiAgICAgICAgICAgIHdoZW4gJ2EnICAgICB0aGVuIEBjYW1lcmEuc3RvcE1vdmVMZWZ0KClcbiAgICAgICAgICAgIHdoZW4gJ2QnICAgICB0aGVuIEBjYW1lcmEuc3RvcE1vdmVSaWdodCgpXG4gICAgICAgICAgICB3aGVuICdxJyAgICAgdGhlbiBAY2FtZXJhLnN0b3BNb3ZlRG93bigpXG4gICAgICAgICAgICB3aGVuICdlJyAgICAgdGhlbiBAY2FtZXJhLnN0b3BNb3ZlVXAoKVxuICAgICAgICAgICAgd2hlbiAnbGVmdCcgIHRoZW4gQGNhbWVyYS5zdG9wUGl2b3RMZWZ0KClcbiAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyB0aGVuIEBjYW1lcmEuc3RvcFBpdm90UmlnaHQoKVxuICAgICAgICAgICAgd2hlbiAndXAnICAgIHRoZW4gQGNhbWVyYS5zdG9wUGl2b3RVcCgpXG4gICAgICAgICAgICB3aGVuICdkb3duJyAgdGhlbiBAY2FtZXJhLnN0b3BQaXZvdERvd24oKVxuICAgICAgICBcbiAgICAgICAgc3VwZXJcbiAgICAgICAgXG4gICAgIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICBcblxuICAgIG1vdXNlRXZlbnQ6IChldmVudCkgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIEB2aWV3T2Zmc2V0XG4gICAgICAgICAgICBAbW91c2UueCA9ICAgKCAoZXZlbnQuY2xpZW50WCAtIEB2aWV3T2Zmc2V0LngpIC8gQHZpZXcuY2xpZW50V2lkdGggKSAqIDIgLSAxO1xyXG4gICAgICAgICAgICBAbW91c2UueSA9IC0gKCAoZXZlbnQuY2xpZW50WSAtIEB2aWV3T2Zmc2V0LnkpIC8gQHZpZXcuY2xpZW50SGVpZ2h0ICkgKiAyICsgMTtcbiAgICBcbiAgICBvbk1vdXNlTW92ZTogKGV2ZW50KSA9PiBAbW91c2VFdmVudCBldmVudFxuICAgIG9uTW91c2VVcDogICAoZXZlbnQpID0+IEBtb3VzZUV2ZW50IGV2ZW50XG4gICAgb25Nb3VzZURvd246IChldmVudCkgPT4gQG1vdXNlRXZlbnQgZXZlbnQ7IEBwaWNrT2JqZWN0IGV2ZW50XG4gICAgICAgIFxuICAgIHBpY2tPYmplY3Q6IChldmVudCkgLT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBldmVudC5idXR0b25zICE9IDFcbiAgICAgICAgQHJheWNhc3Rlci5zZXRGcm9tQ2FtZXJhIEBtb3VzZSwgQGNhbWVyYVxuICAgICAgICBmb3IgaW50ZXJzZWN0IGluIEByYXljYXN0ZXIuaW50ZXJzZWN0T2JqZWN0cyBAc2NlbmUuY2hpbGRyZW5cbiAgICAgICAgICAgIGlmIGludGVyc2VjdD8ub2JqZWN0Py50eXBlID09ICdNZXNoJ1xuICAgICAgICAgICAgICAgIGlmIGludGVyc2VjdC5vYmplY3QubmFtZSAhPSAncGxhbmUnXG4gICAgICAgICAgICAgICAgICAgIEBjYW1lcmEuc2V0UGl2b3RDZW50ZXIgaW50ZXJzZWN0Lm9iamVjdC5wb3NpdGlvblxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBvbk1lbnVBY3Rpb246IChhY3Rpb24sIGFyZ3MpID0+XG4gICAgICAgIFxuICAgICAgICAjIGtsb2cgXCJtZW51QWN0aW9uICN7YWN0aW9ufVwiIGFyZ3NcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIHN1cGVyXG4gICAgICAgICAgICAgICAgICAgICAgICBcbm5ldyBNYWluV2luICAgICAgICAgICAgXG4iXX0=
//# sourceURL=../coffee/window.coffee