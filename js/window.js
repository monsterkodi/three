// koffee 1.12.0

/*
000   000  000  000   000  0000000     0000000   000   000
000 0 000  000  0000  000  000   000  000   000  000 0 000
000000000  000  000 0 000  000   000  000   000  000000000
000   000  000  000  0000  000   000  000   000  000   000
00     00  000  000   000  0000000     0000000   00     00
 */
var $, AmbientLight, AxesHelper, BoxGeometry, Camera, Color, FPS, Fog, GridHelper, MainWin, Mesh, MeshStandardMaterial, PCFSoftShadowMap, PlaneGeometry, PointLight, PointLightHelper, Raycaster, Scene, SphereGeometry, Tetras, Vector2, WebGLRenderer, deg2rad, keyinfo, kpos, prefs, ref, ref1, win,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), $ = ref.$, deg2rad = ref.deg2rad, keyinfo = ref.keyinfo, kpos = ref.kpos, prefs = ref.prefs, win = ref.win;

ref1 = require('three'), AmbientLight = ref1.AmbientLight, AxesHelper = ref1.AxesHelper, BoxGeometry = ref1.BoxGeometry, Camera = ref1.Camera, Color = ref1.Color, Fog = ref1.Fog, GridHelper = ref1.GridHelper, Mesh = ref1.Mesh, MeshStandardMaterial = ref1.MeshStandardMaterial, PCFSoftShadowMap = ref1.PCFSoftShadowMap, PlaneGeometry = ref1.PlaneGeometry, PointLight = ref1.PointLight, PointLightHelper = ref1.PointLightHelper, Raycaster = ref1.Raycaster, Scene = ref1.Scene, SphereGeometry = ref1.SphereGeometry, Vector2 = ref1.Vector2, WebGLRenderer = ref1.WebGLRenderer;

Camera = require('./camera');

FPS = require('./fps');

Tetras = require('./tetras');

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
        Tetras.renderScene(this.scene);
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
        if (false) {
            geometry = new BoxGeometry(1, 1, 1);
            box = new Mesh(geometry, material.clone());
            box.position.set(0, 1, -2);
            box.castShadow = true;
            box.receiveShadow = true;
            box.name = 'box';
            this.scene.add(box);
            material.color = new Color(0xff0000);
            material.flatShading = true;
            material.metalness = 0.9;
            geometry = new SphereGeometry(1, 10, 10);
            sphere = new Mesh(geometry, material);
            sphere.position.set(0, 3, -2);
            sphere.castShadow = true;
            sphere.receiveShadow = true;
            sphere.name = 'sphere';
            this.scene.add(sphere);
        }
        material = new MeshStandardMaterial({
            metalness: 0.0,
            color: new Color('hsl(180,0%,4%)'),
            roughness: 1.0,
            flatShading: true
        });
        geometry = new PlaneGeometry(1000, 1000, 10);
        this.plane = new Mesh(geometry, material);
        this.plane.castShadow = false;
        this.plane.receiveShadow = true;
        this.plane.name = 'plane';
        this.plane.position.y = -0.1;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93LmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsid2luZG93LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSxrU0FBQTtJQUFBOzs7O0FBUUEsTUFBNEMsT0FBQSxDQUFRLEtBQVIsQ0FBNUMsRUFBRSxTQUFGLEVBQUsscUJBQUwsRUFBYyxxQkFBZCxFQUF1QixlQUF2QixFQUE2QixpQkFBN0IsRUFBb0M7O0FBRXBDLE9BQWlPLE9BQUEsQ0FBUSxPQUFSLENBQWpPLEVBQUUsZ0NBQUYsRUFBZ0IsNEJBQWhCLEVBQTRCLDhCQUE1QixFQUF5QyxvQkFBekMsRUFBaUQsa0JBQWpELEVBQXdELGNBQXhELEVBQTZELDRCQUE3RCxFQUF5RSxnQkFBekUsRUFBK0UsZ0RBQS9FLEVBQXFHLHdDQUFyRyxFQUF1SCxrQ0FBdkgsRUFBc0ksNEJBQXRJLEVBQWtKLHdDQUFsSixFQUFvSywwQkFBcEssRUFBK0ssa0JBQS9LLEVBQXNMLG9DQUF0TCxFQUFzTSxzQkFBdE0sRUFBK007O0FBRS9NLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7QUFDVCxHQUFBLEdBQVMsT0FBQSxDQUFRLE9BQVI7O0FBQ1QsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztBQUVIOzs7SUFFQyxpQkFBQTs7Ozs7Ozs7OztRQUVDLHlDQUNJO1lBQUEsR0FBQSxFQUFRLFNBQVI7WUFDQSxHQUFBLEVBQVEsT0FBQSxDQUFRLGlCQUFSLENBRFI7WUFFQSxJQUFBLEVBQVEscUJBRlI7WUFHQSxJQUFBLEVBQVEsaUJBSFI7WUFJQSxjQUFBLEVBQWdCLEdBSmhCO1lBS0EsT0FBQSxFQUFTLEtBTFQ7WUFNQSxNQUFBLEVBQVEsSUFBQyxDQUFBLE1BTlQ7U0FESjtRQVNBLElBQUMsQ0FBQSxLQUFELEdBQVMsSUFBSTtRQUViLElBQUMsQ0FBQSxXQUFELENBQUE7UUFFQSxnQkFBQSxDQUFpQixhQUFqQixFQUErQixJQUFDLENBQUEs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QVMsQ0FBQyxNQUFNLENBQUMsSUFBakIsS0FBeUIsT0FBNUI7b0JBQ0ksSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUFSLENBQXVCLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBeEM7QUFDQSwyQkFGSjtpQkFESjs7QUFESjtJQUpROztzQkFnQlosWUFBQSxHQUFjLFNBQUMsTUFBRCxFQUFTLElBQVQ7ZUFJViwyQ0FBQSxTQUFBO0lBSlU7Ozs7R0E5VEk7O0FBb1V0QixJQUFJIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4wMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwXG4wMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4wMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAgICAgIDAwXG4jIyNcblxueyAkLCBkZWcycmFkLCBrZXlpbmZvLCBrcG9zLCBwcmVmcywgd2luIH0gPSByZXF1aXJlICdreGsnXG5cbnsgQW1iaWVudExpZ2h0LCBBeGVzSGVscGVyLCBCb3hHZW9tZXRyeSwgQ2FtZXJhLCBDb2xvciwgRm9nLCBHcmlkSGVscGVyLCBNZXNoLCBNZXNoU3RhbmRhcmRNYXRlcmlhbCwgUENGU29mdFNoYWRvd01hcCwgUGxhbmVHZW9tZXRyeSwgUG9pbnRMaWdodCwgUG9pbnRMaWdodEhlbHBlciwgUmF5Y2FzdGVyLCBTY2VuZSwgU3BoZXJlR2VvbWV0cnksIFZlY3RvcjIsIFdlYkdMUmVuZGVyZXIgfSA9IHJlcXVpcmUgJ3RocmVlJ1xuXG5DYW1lcmEgPSByZXF1aXJlICcuL2NhbWVyYSdcbkZQUyAgICA9IHJlcXVpcmUgJy4vZnBzJ1xuVGV0cmFzID0gcmVxdWlyZSAnLi90ZXRyYXMnXG5cbmNsYXNzIE1haW5XaW4gZXh0ZW5kcyB3aW5cbiAgICBcbiAgICBAOiAtPlxuICAgICAgICBcbiAgICAgICAgc3VwZXJcbiAgICAgICAgICAgIGRpcjogICAgX19kaXJuYW1lXG4gICAgICAgICAgICBwa2c6ICAgIHJlcXVpcmUgJy4uL3BhY2thZ2UuanNvbidcbiAgICAgICAgICAgIG1lbnU6ICAgJy4uL2NvZmZlZS9tZW51Lm5vb24nXG4gICAgICAgICAgICBpY29uOiAgICcuLi9pbWcvbWluaS5wbmcnXG4gICAgICAgICAgICBwcmVmc1NlcGVyYXRvcjogJ+KWuCdcbiAgICAgICAgICAgIGNvbnRleHQ6IGZhbHNlXG4gICAgICAgICAgICBvbkxvYWQ6IEBvbkxvYWRcbiAgICAgICAgICBcbiAgICAgICAgQG1vdXNlID0gbmV3IFZlY3RvcjJcbiAgICAgICAgXG4gICAgICAgIEBpbml0T3B0aW9ucygpXG4gICAgICAgICAgICBcbiAgICAgICAgYWRkRXZlbnRMaXN0ZW5lciAncG9pbnRlcmRvd24nIEBvbk1vdXNlRG93blxuICAgICAgICBhZGRFdmVudExpc3RlbmVyICdwb2ludGVybW92ZScgQG9uTW91c2VNb3ZlXG4gICAgICAgIGFkZEV2ZW50TGlzdGVuZXIgJ3BvaW50ZXJ1cCcgICBAb25Nb3VzZVVwXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICBvbkxvYWQ6ID0+XG5cbiAgICAgICAgd2luZG93Lm9ucmVzaXplID0gQG9uUmVzaXplXG4gICAgICAgIFxuICAgICAgICBAaW5pdFNjZW5lICQgXCIjbWFpblwiXG4gICAgICAgIFxuICAgICAgICBUZXRyYXMucmVuZGVyU2NlbmUgQHNjZW5lXG4gICAgICAgIFxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgQHJlbmRlclNjZW5lXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBpbml0U2NlbmU6IChAdmlldykgLT5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQHJlbmRlcmVyID0gbmV3IFdlYkdMUmVuZGVyZXIgYW50aWFsaWFzOnRydWUgcHJlY2lzaW9uOidoaWdocCdcbiAgICAgICAgICAgIFxuICAgICAgICBAcmVuZGVyZXIuc2V0U2l6ZSBAdmlldy5vZmZzZXRXaWR0aCwgQHZpZXcub2Zmc2V0SGVpZ2h0XG4gICAgICAgIEByZW5kZXJlci5hdXRvQ2xlYXIgICAgICAgICA9IGZhbHNlXG4gICAgICAgIEByZW5kZXJlci5zb3J0T2JqZWN0cyAgICAgICA9IHRydWVcbiAgICAgICAgQHJlbmRlcmVyLnNoYWRvd01hcC50eXBlICAgID0gUENGU29mdFNoYWRvd01hcFxuICAgICAgICBAcmVuZGVyZXIuc2hhZG93TWFwLmVuYWJsZWQgPSB0cnVlXG4gICAgICAgIEByZW5kZXJlci5zZXRQaXhlbFJhdGlvIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIFxuICAgICAgICBAdmlldy5hcHBlbmRDaGlsZCBAcmVuZGVyZXIuZG9tRWxlbWVudFxuICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgQGZvZ0NvbG9yID0gbmV3IENvbG9yICdoc2woMTgwLCAwJSwgNCUpJ1xuICAgICAgICBcbiAgICAgICAgQG9uUmVzaXplKClcbiAgICAgICAgXG4gICAgICAgIGJyID0gQHJlbmRlcmVyLmRvbUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgQHZpZXdPZmZzZXQgPSBuZXcgVmVjdG9yMiBici5sZWZ0LCBici50b3BcbiAgICAgICAgXG4gICAgICAgIEBzY2VuZSA9IG5ldyBTY2VuZSgpXG4gICAgICAgIEBzY2VuZS5iYWNrZ3JvdW5kID0gQGZvZ0NvbG9yXG4gICAgICAgIEBjYW1lcmEgPSBuZXcgQ2FtZXJhIHZpZXc6QHZpZXdcblxuICAgICAgICBAc3VuID0gbmV3IFBvaW50TGlnaHQgMHhmZmZmZmYsIDIsIDIwMFxuICAgICAgICBAc3VuLnBvc2l0aW9uLnNldCAwIDEwIDBcclxuICAgICAgICBAc3VuLmNhc3RTaGFkb3cgPSB0cnVlXG4gICAgICAgIEBzdW4uc2hhZG93Lm1hcFNpemUgPSBuZXcgVmVjdG9yMiAyKjIwNDgsIDIqMjA0OFxuICAgICAgICBAc2NlbmUuYWRkIEBzdW5cbiAgICAgICAgXG4gICAgICAgIEBzY2VuZS5hZGQgbmV3IFBvaW50TGlnaHRIZWxwZXIgQHN1biwgMVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBAYW1iaWVudCA9IG5ldyBBbWJpZW50TGlnaHQgMHgxODE4MThcbiAgICAgICAgQHNjZW5lLmFkZCBAYW1iaWVudFxuICAgICAgICBcbiAgICAgICAgbWF0ZXJpYWwgPSBuZXcgTWVzaFN0YW5kYXJkTWF0ZXJpYWwge1xuICAgICAgICAgICAgbWV0YWxuZXNzOiAwLjZcbiAgICAgICAgICAgIHJvdWdobmVzczogMC4zXHJcbiAgICAgICAgICAgIGNvbG9yOjB4NTU1NWZmXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmIGZhbHNlXG4gICAgICAgICAgICBnZW9tZXRyeSA9IG5ldyBCb3hHZW9tZXRyeSAxIDEgMVxuICAgICAgICAgICAgYm94ID0gbmV3IE1lc2ggZ2VvbWV0cnksIG1hdGVyaWFsLmNsb25lKClcbiAgICAgICAgICAgIGJveC5wb3NpdGlvbi5zZXQgMCAxIC0yXG4gICAgICAgICAgICBib3guY2FzdFNoYWRvdyA9IHRydWVcbiAgICAgICAgICAgIGJveC5yZWNlaXZlU2hhZG93ID0gdHJ1ZVxuICAgICAgICAgICAgYm94Lm5hbWUgPSAnYm94J1xuICAgICAgICAgICAgQHNjZW5lLmFkZCBib3hcbiAgICBcbiAgICAgICAgICAgIG1hdGVyaWFsLmNvbG9yID0gbmV3IENvbG9yIDB4ZmYwMDAwXG4gICAgICAgICAgICBtYXRlcmlhbC5mbGF0U2hhZGluZyA9IHRydWVcbiAgICAgICAgICAgIG1hdGVyaWFsLm1ldGFsbmVzcyA9IDAuOVxuICAgICAgICAgICAgZ2VvbWV0cnkgPSBuZXcgU3BoZXJlR2VvbWV0cnkgMSAxMCAxMFxuICAgICAgICAgICAgc3BoZXJlID0gbmV3IE1lc2ggZ2VvbWV0cnksIG1hdGVyaWFsXG4gICAgICAgICAgICBzcGhlcmUucG9zaXRpb24uc2V0IDAgMyAtMlxuICAgICAgICAgICAgc3BoZXJlLmNhc3RTaGFkb3cgPSB0cnVlXG4gICAgICAgICAgICBzcGhlcmUucmVjZWl2ZVNoYWRvdyA9IHRydWVcbiAgICAgICAgICAgIHNwaGVyZS5uYW1lID0gJ3NwaGVyZSdcbiAgICAgICAgICAgIEBzY2VuZS5hZGQgc3BoZXJlXG4gICAgICBcbiAgICAgICAgbWF0ZXJpYWwgPSBuZXcgTWVzaFN0YW5kYXJkTWF0ZXJpYWwge1xuICAgICAgICAgICAgbWV0YWxuZXNzOiAwLjBcbiAgICAgICAgICAgIGNvbG9yOiBuZXcgQ29sb3IgJ2hzbCgxODAsMCUsNCUpJ1xuICAgICAgICAgICAgcm91Z2huZXNzOiAxLjBcclxuICAgICAgICAgICAgZmxhdFNoYWRpbmc6IHRydWVcbiAgICAgICAgfVxuICAgICAgICAgICAgICBcbiAgICAgICAgZ2VvbWV0cnkgPSBuZXcgUGxhbmVHZW9tZXRyeSAxMDAwIDEwMDAgMTBcbiAgICAgICAgQHBsYW5lID0gbmV3IE1lc2ggZ2VvbWV0cnksIG1hdGVyaWFsXG4gICAgICAgIEBwbGFuZS5jYXN0U2hhZG93ID0gZmFsc2VcbiAgICAgICAgQHBsYW5lLnJlY2VpdmVTaGFkb3cgPSB0cnVlXG4gICAgICAgIEBwbGFuZS5uYW1lID0gJ3BsYW5lJ1xuICAgICAgICBAcGxhbmUucG9zaXRpb24ueSA9IC0wLjFcbiAgICAgICAgQHBsYW5lLnJvdGF0aW9uLnNldCBkZWcycmFkKC05MCksIDAgMFxuICAgICAgICBAc2NlbmUuYWRkIEBwbGFuZVxuXG4gICAgICAgICMga2xvZyBPYmplY3Qua2V5cyByZXF1aXJlICd0aHJlZSdcbiAgICAgICAgQHNjZW5lLmZvZyA9IG5ldyBGb2cgQGZvZ0NvbG9yLCAxMCAxMDBcblxuICAgICAgICBmb3Igb3B0IGluIE9iamVjdC5rZXlzIEBvcHRpb25zXG4gICAgICAgICAgICBAc2V0T3B0aW9uIG9wdCwgQG9wdGlvbnNbb3B0XVxuICAgICAgICBcbiAgICAgICAgQHJheWNhc3RlciA9IG5ldyBSYXljYXN0ZXJcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgcmVuZGVyU2NlbmU6ID0+XG4gICAgICAgIFxuICAgICAgICBAZnBzPy5kcmF3KClcbiAgICAgICAgQHN1bi5wb3NpdGlvbi5jb3B5IEBjYW1lcmEuZ2V0UG9zaXRpb24oKVxuICAgICAgICBAc3VuLnBvc2l0aW9uLmFkZCAgQGNhbWVyYS5nZXRVcCgpLm11bHRpcGx5U2NhbGFyIDMuMFxuICAgICAgICBAc3VuLnBvc2l0aW9uLmFkZCAgQGNhbWVyYS5nZXRSaWdodCgpLm11bHRpcGx5U2NhbGFyIC0zLjBcblxuICAgICAgICBAcmVuZGVyZXIucmVuZGVyIEBzY2VuZSwgQGNhbWVyYSAgICAgICAgXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSBAcmVuZGVyU2NlbmVcbiAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgMDAwICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAgICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBvblJlc2l6ZTogPT4gXG4gICAgICAgIFxuICAgICAgICB3ID0gQHZpZXcuY2xpZW50V2lkdGggXG4gICAgICAgIGggPSBAdmlldy5jbGllbnRIZWlnaHRcbiAgICAgICAgXG4gICAgICAgIEBhc3BlY3QgPSB3L2hcbiAgICAgICAgQHZpZXdTaXplID0ga3BvcyB3LGhcbiAgXG4gICAgICAgIGlmIEBjYW1lcmE/XG4gICAgICAgICAgICBAY2FtZXJhLmFzcGVjdCA9IEBhc3BlY3RcbiAgICAgICAgICAgIEBjYW1lcmEuc2l6ZSAgID0gQHZpZXdTaXplXG4gICAgICAgICAgICBAY2FtZXJhLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKVxuICAgICAgICBcbiAgICAgICAgQHJlbmRlcmVyPy5zZXRTaXplIHcsaFxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgICAgICAgMDAwICBcbiAgICAjICAwMDAwMDAwICAgMDAwICAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBpbml0T3B0aW9uczogLT5cbiAgICAgICAgXG4gICAgICAgIEBvcHRpb25zID0ge31cbiAgICAgICAgZm9yIG9wdCBpbiBbJ2ZwcycgJ3BsYW5lJyAnZ3JpZCcgJ2F4ZXMnICdkaXRoZXInICdzaGFkb3cnICdmb2cnXVxuICAgICAgICAgICAgQG9wdGlvbnNbb3B0XSA9ICBwcmVmcy5nZXQgXCJvcHRpb27ilrgje29wdH1cIiB0cnVlXG4gICAgXG4gICAgdG9nZ2xlOiAob3B0KSAtPiBAc2V0T3B0aW9uIG9wdCwgbm90IEBvcHRpb25zW29wdF1cblxuICAgIHNldE9wdGlvbjogKG9wdCwgdmFsKSAtPiBcbiAgICAgICAgXG4gICAgICAgIEBvcHRpb25zW29wdF0gPSB2YWxcbiAgICAgICAgcHJlZnMuc2V0IFwib3B0aW9u4pa4I3tvcHR9XCIgdmFsXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggb3B0XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHdoZW4gJ2ZwcydcbiAgICAgICAgICAgICAgICBpZiB2YWxcbiAgICAgICAgICAgICAgICAgICAgQGZwcyA9IG5ldyBGUFNcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEBmcHM/LnJlbW92ZSgpXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBAZnBzXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHdoZW4gJ3NoYWRvdydcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAcmVuZGVyZXIuc2hhZG93TWFwLmVuYWJsZWQgPSB2YWxcbiAgICAgICAgICAgICAgICBAc3VuLmNhc3RTaGFkb3cgPSB2YWxcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHdoZW4gJ3BsYW5lJ1xuICAgICAgICAgICAgICAgIGlmIHZhbFxuICAgICAgICAgICAgICAgICAgICBAc2NlbmUuYWRkIEBwbGFuZVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQHNjZW5lLnJlbW92ZSBAcGxhbmVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgd2hlbiAnZGl0aGVyJ1xuICAgICAgICAgICAgICAgIEBzY2VuZS50cmF2ZXJzZSAobm9kZSkgLT5cclxuICAgICAgICAgICAgICAgICAgICBpZiBub2RlIGluc3RhbmNlb2YgTWVzaFxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5tYXRlcmlhbC5kaXRoZXJpbmcgPSB2YWxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUubWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHdoZW4gJ2ZvZydcbiAgICAgICAgICAgICAgICBpZiB2YWxcbiAgICAgICAgICAgICAgICAgICAgQHNjZW5lLmZvZy5uZWFyID0gMTBcbiAgICAgICAgICAgICAgICAgICAgQHNjZW5lLmZvZy5mYXIgID0gNTBcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEBzY2VuZS5mb2cubmVhciA9IDk5OTk5XG4gICAgICAgICAgICAgICAgICAgIEBzY2VuZS5mb2cuZmFyICA9IDk5OTk5KzFcbiAgICAgICAgXG4gICAgICAgICAgICB3aGVuICdncmlkJ1xuICAgICAgICAgICAgICAgIGlmIHZhbFxuICAgICAgICAgICAgICAgICAgICBAZ3JpZCA9IG5ldyBHcmlkSGVscGVyIDEwMCAxMDAgMHgzMzMzMzMsIDB4MFxuICAgICAgICAgICAgICAgICAgICBAZ3JpZC5wb3NpdGlvbi55ID0gMC4wNVxuICAgICAgICAgICAgICAgICAgICBAc2NlbmUuYWRkIEBncmlkXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAc2NlbmUucmVtb3ZlIEBncmlkXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBAZ3JpZFxuICAgICAgICAgICAgXG4gICAgICAgICAgICB3aGVuICdheGVzJ1xuICAgICAgICAgICAgICAgIGlmIHZhbFxuICAgICAgICAgICAgICAgICAgICBAYXhlcyA9IG5ldyBBeGVzSGVscGVyIDEwMFxuICAgICAgICAgICAgICAgICAgICBAYXhlcy5wb3NpdGlvbi55ID0gMC4wNlxuICAgICAgICAgICAgICAgICAgICBAc2NlbmUuYWRkIEBheGVzXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAc2NlbmUucmVtb3ZlIEBheGVzXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBAYXhlc1xuICAgICAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgMDAwICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAgIDAwMDAwICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgb25LZXlEb3duOiAoZXZlbnQpID0+XG5cbiAgICAgICAgeyBtb2QsIGtleSwgY29tYm8sIGNoYXIgfSA9IGtleWluZm8uZm9yRXZlbnQgZXZlbnRcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBldmVudC5yZXBlYXRcbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCBrZXlcbiAgICAgICAgICAgIHdoZW4gJ3cnICAgICB0aGVuIEBjYW1lcmEuc3RhcnRNb3ZlRm9yd2FyZCgpXG4gICAgICAgICAgICB3aGVuICdzJyAgICAgdGhlbiBAY2FtZXJhLnN0YXJ0TW92ZUJhY2t3YXJkKClcbiAgICAgICAgICAgIHdoZW4gJ2EnICAgICB0aGVuIEBjYW1lcmEuc3RhcnRNb3ZlTGVmdCgpXG4gICAgICAgICAgICB3aGVuICdkJyAgICAgdGhlbiBAY2FtZXJhLnN0YXJ0TW92ZVJpZ2h0KClcbiAgICAgICAgICAgIHdoZW4gJ3EnICAgICB0aGVuIEBjYW1lcmEuc3RhcnRNb3ZlRG93bigpXG4gICAgICAgICAgICB3aGVuICdlJyAgICAgdGhlbiBAY2FtZXJhLnN0YXJ0TW92ZVVwKClcbiAgICAgICAgICAgIHdoZW4gJ2xlZnQnICB0aGVuIEBjYW1lcmEuc3RhcnRQaXZvdExlZnQoKVxuICAgICAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4gQGNhbWVyYS5zdGFydFBpdm90UmlnaHQoKVxuICAgICAgICAgICAgd2hlbiAndXAnICAgIHRoZW4gQGNhbWVyYS5zdGFydFBpdm90VXAoKVxuICAgICAgICAgICAgd2hlbiAnZG93bicgIHRoZW4gQGNhbWVyYS5zdGFydFBpdm90RG93bigpXG4gICAgICAgICAgICB3aGVuICdyJyAgICAgdGhlbiBAY2FtZXJhLnJlc2V0KClcbiAgICAgICAgICAgIHdoZW4gJzEnICAgICB0aGVuIEBjYW1lcmEuZGVjcmVtZW50TW92ZVNwZWVkKClcbiAgICAgICAgICAgIHdoZW4gJzInICAgICB0aGVuIEBjYW1lcmEuaW5jcmVtZW50TW92ZVNwZWVkKClcbiAgICAgICAgICAgIHdoZW4gJ2cnICAgICB0aGVuIEB0b2dnbGUgJ2dyaWQnXG4gICAgICAgICAgICB3aGVuICdwJyAgICAgdGhlbiBAdG9nZ2xlICdwbGFuZSdcbiAgICAgICAgICAgIHdoZW4gJ2gnICAgICB0aGVuIEB0b2dnbGUgJ3NoYWRvdydcbiAgICAgICAgICAgIHdoZW4gJ3knICAgICB0aGVuIEB0b2dnbGUgJ2F4ZXMnXG4gICAgICAgICAgICB3aGVuICdmJyAgICAgdGhlbiBAdG9nZ2xlICdmb2cnXG4gICAgICAgICAgICB3aGVuICdvJyAgICAgdGhlbiBAdG9nZ2xlICdmcHMnXG4gICAgICAgICAgICB3aGVuICd0JyAgICAgdGhlbiBAdG9nZ2xlICdkaXRoZXInXG4gICAgICAgICAgICAjIGVsc2VcbiAgICAgICAgICAgICAgICAjIGtsb2cgJ2tleURvd24nIG1vZCwga2V5LCBjb21ibywgY2hhciwgZXZlbnQud2hpY2hcbiAgICAgICAgXG4gICAgICAgIHN1cGVyXG4gICAgICAgIFxuICAgIG9uS2V5VXA6IChldmVudCkgPT5cbiAgICAgICAgXG4gICAgICAgIHsgbW9kLCBrZXksIGNvbWJvLCBjaGFyIH0gPSBrZXlpbmZvLmZvckV2ZW50IGV2ZW50XG4gICAgICAgICMga2xvZyAna2V5VXAnIG1vZCwga2V5LCBjb21ibywgY2hhciwgZXZlbnQud2hpY2hcbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCBrZXlcbiAgICAgICAgICAgIHdoZW4gJ3cnICAgICB0aGVuIEBjYW1lcmEuc3RvcE1vdmVGb3J3YXJkKClcbiAgICAgICAgICAgIHdoZW4gJ3MnICAgICB0aGVuIEBjYW1lcmEuc3RvcE1vdmVCYWNrd2FyZCgpXG4gICAgICAgICAgICB3aGVuICdhJyAgICAgdGhlbiBAY2FtZXJhLnN0b3BNb3ZlTGVmdCgpXG4gICAgICAgICAgICB3aGVuICdkJyAgICAgdGhlbiBAY2FtZXJhLnN0b3BNb3ZlUmlnaHQoKVxuICAgICAgICAgICAgd2hlbiAncScgICAgIHRoZW4gQGNhbWVyYS5zdG9wTW92ZURvd24oKVxuICAgICAgICAgICAgd2hlbiAnZScgICAgIHRoZW4gQGNhbWVyYS5zdG9wTW92ZVVwKClcbiAgICAgICAgICAgIHdoZW4gJ2xlZnQnICB0aGVuIEBjYW1lcmEuc3RvcFBpdm90TGVmdCgpXG4gICAgICAgICAgICB3aGVuICdyaWdodCcgdGhlbiBAY2FtZXJhLnN0b3BQaXZvdFJpZ2h0KClcbiAgICAgICAgICAgIHdoZW4gJ3VwJyAgICB0aGVuIEBjYW1lcmEuc3RvcFBpdm90VXAoKVxuICAgICAgICAgICAgd2hlbiAnZG93bicgIHRoZW4gQGNhbWVyYS5zdG9wUGl2b3REb3duKClcbiAgICAgICAgXG4gICAgICAgIHN1cGVyXG4gICAgICAgIFxuICAgICMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgXG5cbiAgICBtb3VzZUV2ZW50OiAoZXZlbnQpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBAdmlld09mZnNldFxuICAgICAgICAgICAgQG1vdXNlLnggPSAgICggKGV2ZW50LmNsaWVudFggLSBAdmlld09mZnNldC54KSAvIEB2aWV3LmNsaWVudFdpZHRoICkgKiAyIC0gMTtcclxuICAgICAgICAgICAgQG1vdXNlLnkgPSAtICggKGV2ZW50LmNsaWVudFkgLSBAdmlld09mZnNldC55KSAvIEB2aWV3LmNsaWVudEhlaWdodCApICogMiArIDE7XG4gICAgXG4gICAgb25Nb3VzZU1vdmU6IChldmVudCkgPT4gQG1vdXNlRXZlbnQgZXZlbnRcbiAgICBvbk1vdXNlVXA6ICAgKGV2ZW50KSA9PiBAbW91c2VFdmVudCBldmVudFxuICAgIG9uTW91c2VEb3duOiAoZXZlbnQpID0+IEBtb3VzZUV2ZW50IGV2ZW50OyBAcGlja09iamVjdCBldmVudFxuICAgICAgICBcbiAgICBwaWNrT2JqZWN0OiAoZXZlbnQpIC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgZXZlbnQuYnV0dG9ucyAhPSAxXG4gICAgICAgIEByYXljYXN0ZXIuc2V0RnJvbUNhbWVyYSBAbW91c2UsIEBjYW1lcmFcbiAgICAgICAgZm9yIGludGVyc2VjdCBpbiBAcmF5Y2FzdGVyLmludGVyc2VjdE9iamVjdHMgQHNjZW5lLmNoaWxkcmVuXG4gICAgICAgICAgICBpZiBpbnRlcnNlY3Q/Lm9iamVjdD8udHlwZSA9PSAnTWVzaCdcbiAgICAgICAgICAgICAgICBpZiBpbnRlcnNlY3Qub2JqZWN0Lm5hbWUgIT0gJ3BsYW5lJ1xuICAgICAgICAgICAgICAgICAgICBAY2FtZXJhLnNldFBpdm90Q2VudGVyIGludGVyc2VjdC5vYmplY3QucG9zaXRpb25cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG4gICAgXG4gICAgb25NZW51QWN0aW9uOiAoYWN0aW9uLCBhcmdzKSA9PlxuICAgICAgICBcbiAgICAgICAgIyBrbG9nIFwibWVudUFjdGlvbiAje2FjdGlvbn1cIiBhcmdzXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBzdXBlclxuICAgICAgICAgICAgICAgICAgICAgICAgXG5uZXcgTWFpbldpbiAgICAgICAgICAgIFxuIl19
//# sourceURL=../coffee/window.coffee