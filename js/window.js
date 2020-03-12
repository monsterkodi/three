// koffee 1.12.0

/*
000   000  000  000   000  0000000     0000000   000   000
000 0 000  000  0000  000  000   000  000   000  000 0 000
000000000  000  000 0 000  000   000  000   000  000000000
000   000  000  000  0000  000   000  000   000  000   000
00     00  000  000   000  0000000     0000000   00     00
 */
var $, AmbientLight, AxesHelper, Camera, Color, FPS, Fog, GridHelper, MainWin, Mesh, MeshStandardMaterial, PCFSoftShadowMap, PlaneGeometry, PointLight, Raycaster, Scene, Tetras, Vector2, WebGLRenderer, deg2rad, keyinfo, kpos, prefs, ref, ref1, win,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), $ = ref.$, deg2rad = ref.deg2rad, keyinfo = ref.keyinfo, kpos = ref.kpos, prefs = ref.prefs, win = ref.win;

ref1 = require('three'), AmbientLight = ref1.AmbientLight, AxesHelper = ref1.AxesHelper, Camera = ref1.Camera, Color = ref1.Color, Fog = ref1.Fog, GridHelper = ref1.GridHelper, Mesh = ref1.Mesh, MeshStandardMaterial = ref1.MeshStandardMaterial, PCFSoftShadowMap = ref1.PCFSoftShadowMap, PlaneGeometry = ref1.PlaneGeometry, PointLight = ref1.PointLight, Raycaster = ref1.Raycaster, Scene = ref1.Scene, Vector2 = ref1.Vector2, WebGLRenderer = ref1.WebGLRenderer;

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
        var br, geometry, i, len, material, opt, ref2;
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
        this.ambient = new AmbientLight(0x181818);
        this.scene.add(this.ambient);
        material = new MeshStandardMaterial({
            metalness: 0.6,
            roughness: 0.3,
            color: 0x5555ff
        });
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
                    intersect.object.geometry.computeBoundingSphere();
                    this.camera.setPivotCenter(intersect.object.geometry.boundingSphere.center);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93LmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsid2luZG93LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSxtUEFBQTtJQUFBOzs7O0FBUUEsTUFBNEMsT0FBQSxDQUFRLEtBQVIsQ0FBNUMsRUFBRSxTQUFGLEVBQUsscUJBQUwsRUFBYyxxQkFBZCxFQUF1QixlQUF2QixFQUE2QixpQkFBN0IsRUFBb0M7O0FBRXBDLE9BQWtMLE9BQUEsQ0FBUSxPQUFSLENBQWxMLEVBQUUsZ0NBQUYsRUFBZ0IsNEJBQWhCLEVBQTRCLG9CQUE1QixFQUFvQyxrQkFBcEMsRUFBMkMsY0FBM0MsRUFBZ0QsNEJBQWhELEVBQTRELGdCQUE1RCxFQUFrRSxnREFBbEUsRUFBd0Ysd0NBQXhGLEVBQTBHLGtDQUExRyxFQUF5SCw0QkFBekgsRUFBcUksMEJBQXJJLEVBQWdKLGtCQUFoSixFQUF1SixzQkFBdkosRUFBZ0s7O0FBRWhLLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7QUFDVCxHQUFBLEdBQVMsT0FBQSxDQUFRLE9BQVI7O0FBQ1QsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztBQUVIOzs7SUFFQyxpQkFBQTs7Ozs7Ozs7OztRQUVDLHlDQUNJO1lBQUEsR0FBQSxFQUFRLFNBQVI7WUFDQSxHQUFBLEVBQVEsT0FBQSxDQUFRLGlCQUFSLENBRFI7WUFFQSxJQUFBLEVBQVEscUJBRlI7WUFHQSxJQUFBLEVBQVEsaUJBSFI7WUFJQSxjQUFBLEVBQWdCLEdBSmhCO1lBS0EsT0FBQSxFQUFTLEtBTFQ7WUFNQSxNQUFBLEVBQVEsSUFBQyxDQUFBLE1BTlQ7U0FESjtRQVNBLElBQUMsQ0FBQSxLQUFELEdBQVMsSUFBSTtRQUViLElBQUMsQ0FBQSxXQUFELENBQUE7UUFFQSxnQkFBQSxDQUFpQixhQUFqQixFQUErQixJQUFDLENBQUEsV0FBaEM7UUFDQSxnQkFBQSxDQUFpQixhQUFqQixFQUErQixJQUFD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WixZQUFBLEdBQWMsU0FBQyxNQUFELEVBQVMsSUFBVDtlQUlWLDJDQUFBLFNBQUE7SUFKVTs7OztHQTFTSTs7QUFnVHRCLElBQUkiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDBcbjAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDBcbjAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDBcbjAwICAgICAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMCAgICAgMDBcbiMjI1xuXG57ICQsIGRlZzJyYWQsIGtleWluZm8sIGtwb3MsIHByZWZzLCB3aW4gfSA9IHJlcXVpcmUgJ2t4aydcblxueyBBbWJpZW50TGlnaHQsIEF4ZXNIZWxwZXIsIENhbWVyYSwgQ29sb3IsIEZvZywgR3JpZEhlbHBlciwgTWVzaCwgTWVzaFN0YW5kYXJkTWF0ZXJpYWwsIFBDRlNvZnRTaGFkb3dNYXAsIFBsYW5lR2VvbWV0cnksIFBvaW50TGlnaHQsIFJheWNhc3RlciwgU2NlbmUsIFZlY3RvcjIsIFdlYkdMUmVuZGVyZXIgfSA9IHJlcXVpcmUgJ3RocmVlJ1xuXG5DYW1lcmEgPSByZXF1aXJlICcuL2NhbWVyYSdcbkZQUyAgICA9IHJlcXVpcmUgJy4vZnBzJ1xuVGV0cmFzID0gcmVxdWlyZSAnLi90ZXRyYXMnXG5cbmNsYXNzIE1haW5XaW4gZXh0ZW5kcyB3aW5cbiAgICBcbiAgICBAOiAtPlxuICAgICAgICBcbiAgICAgICAgc3VwZXJcbiAgICAgICAgICAgIGRpcjogICAgX19kaXJuYW1lXG4gICAgICAgICAgICBwa2c6ICAgIHJlcXVpcmUgJy4uL3BhY2thZ2UuanNvbidcbiAgICAgICAgICAgIG1lbnU6ICAgJy4uL2NvZmZlZS9tZW51Lm5vb24nXG4gICAgICAgICAgICBpY29uOiAgICcuLi9pbWcvbWluaS5wbmcnXG4gICAgICAgICAgICBwcmVmc1NlcGVyYXRvcjogJ+KWuCdcbiAgICAgICAgICAgIGNvbnRleHQ6IGZhbHNlXG4gICAgICAgICAgICBvbkxvYWQ6IEBvbkxvYWRcbiAgICAgICAgICBcbiAgICAgICAgQG1vdXNlID0gbmV3IFZlY3RvcjJcbiAgICAgICAgXG4gICAgICAgIEBpbml0T3B0aW9ucygpXG4gICAgICAgICAgICBcbiAgICAgICAgYWRkRXZlbnRMaXN0ZW5lciAncG9pbnRlcmRvd24nIEBvbk1vdXNlRG93blxuICAgICAgICBhZGRFdmVudExpc3RlbmVyICdwb2ludGVybW92ZScgQG9uTW91c2VNb3ZlXG4gICAgICAgIGFkZEV2ZW50TGlzdGVuZXIgJ3BvaW50ZXJ1cCcgICBAb25Nb3VzZVVwXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICBvbkxvYWQ6ID0+XG5cbiAgICAgICAgd2luZG93Lm9ucmVzaXplID0gQG9uUmVzaXplXG4gICAgICAgIFxuICAgICAgICBAaW5pdFNjZW5lICQgXCIjbWFpblwiXG4gICAgICAgIFxuICAgICAgICBUZXRyYXMucmVuZGVyU2NlbmUgQHNjZW5lXG4gICAgICAgIFxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgQHJlbmRlclNjZW5lXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBpbml0U2NlbmU6IChAdmlldykgLT5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQHJlbmRlcmVyID0gbmV3IFdlYkdMUmVuZGVyZXIgYW50aWFsaWFzOnRydWUgcHJlY2lzaW9uOidoaWdocCdcbiAgICAgICAgICAgIFxuICAgICAgICBAcmVuZGVyZXIuc2V0U2l6ZSBAdmlldy5vZmZzZXRXaWR0aCwgQHZpZXcub2Zmc2V0SGVpZ2h0XG4gICAgICAgIEByZW5kZXJlci5hdXRvQ2xlYXIgICAgICAgICA9IGZhbHNlXG4gICAgICAgIEByZW5kZXJlci5zb3J0T2JqZWN0cyAgICAgICA9IHRydWVcbiAgICAgICAgQHJlbmRlcmVyLnNoYWRvd01hcC50eXBlICAgID0gUENGU29mdFNoYWRvd01hcFxuICAgICAgICBAcmVuZGVyZXIuc2hhZG93TWFwLmVuYWJsZWQgPSB0cnVlXG4gICAgICAgIEByZW5kZXJlci5zZXRQaXhlbFJhdGlvIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIFxuICAgICAgICBAdmlldy5hcHBlbmRDaGlsZCBAcmVuZGVyZXIuZG9tRWxlbWVudFxuICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgQGZvZ0NvbG9yID0gbmV3IENvbG9yICdoc2woMTgwLCAwJSwgNCUpJ1xuICAgICAgICBcbiAgICAgICAgQG9uUmVzaXplKClcbiAgICAgICAgXG4gICAgICAgIGJyID0gQHJlbmRlcmVyLmRvbUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgQHZpZXdPZmZzZXQgPSBuZXcgVmVjdG9yMiBici5sZWZ0LCBici50b3BcbiAgICAgICAgXG4gICAgICAgIEBzY2VuZSA9IG5ldyBTY2VuZSgpXG4gICAgICAgIEBzY2VuZS5iYWNrZ3JvdW5kID0gQGZvZ0NvbG9yXG4gICAgICAgIEBjYW1lcmEgPSBuZXcgQ2FtZXJhIHZpZXc6QHZpZXdcblxuICAgICAgICBAc3VuID0gbmV3IFBvaW50TGlnaHQgMHhmZmZmZmYsIDIsIDIwMFxuICAgICAgICBAc3VuLnBvc2l0aW9uLnNldCAwIDEwIDBcbiAgICAgICAgQHN1bi5jYXN0U2hhZG93ID0gdHJ1ZVxuICAgICAgICBAc3VuLnNoYWRvdy5tYXBTaXplID0gbmV3IFZlY3RvcjIgMioyMDQ4LCAyKjIwNDhcbiAgICAgICAgQHNjZW5lLmFkZCBAc3VuXG4gICAgICAgIFxuICAgICAgICAjIEBzY2VuZS5hZGQgbmV3IFBvaW50TGlnaHRIZWxwZXIgQHN1biwgMVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBAYW1iaWVudCA9IG5ldyBBbWJpZW50TGlnaHQgMHgxODE4MThcbiAgICAgICAgQHNjZW5lLmFkZCBAYW1iaWVudFxuICAgICAgICBcbiAgICAgICAgbWF0ZXJpYWwgPSBuZXcgTWVzaFN0YW5kYXJkTWF0ZXJpYWwge1xuICAgICAgICAgICAgbWV0YWxuZXNzOiAwLjZcbiAgICAgICAgICAgIHJvdWdobmVzczogMC4zXG4gICAgICAgICAgICBjb2xvcjoweDU1NTVmZlxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBtYXRlcmlhbCA9IG5ldyBNZXNoU3RhbmRhcmRNYXRlcmlhbFxuICAgICAgICAgICAgbWV0YWxuZXNzOiAwLjBcbiAgICAgICAgICAgIGNvbG9yOiBuZXcgQ29sb3IgJ2hzbCgxODAsMCUsNCUpJ1xuICAgICAgICAgICAgcm91Z2huZXNzOiAxLjBcbiAgICAgICAgICAgIGZsYXRTaGFkaW5nOiB0cnVlXG4gICAgICAgICAgICAgIFxuICAgICAgICBnZW9tZXRyeSA9IG5ldyBQbGFuZUdlb21ldHJ5IDEwMDAgMTAwMCAxMFxuICAgICAgICBAcGxhbmUgPSBuZXcgTWVzaCBnZW9tZXRyeSwgbWF0ZXJpYWxcbiAgICAgICAgQHBsYW5lLmNhc3RTaGFkb3cgPSBmYWxzZVxuICAgICAgICBAcGxhbmUucmVjZWl2ZVNoYWRvdyA9IHRydWVcbiAgICAgICAgQHBsYW5lLm5hbWUgPSAncGxhbmUnXG4gICAgICAgIEBwbGFuZS5wb3NpdGlvbi55ID0gLTAuMVxuICAgICAgICBAcGxhbmUucm90YXRpb24uc2V0IGRlZzJyYWQoLTkwKSwgMCAwXG4gICAgICAgIEBzY2VuZS5hZGQgQHBsYW5lXG5cbiAgICAgICAgIyBrbG9nIE9iamVjdC5rZXlzIHJlcXVpcmUgJ3RocmVlJ1xuICAgICAgICBAc2NlbmUuZm9nID0gbmV3IEZvZyBAZm9nQ29sb3IsIDEwIDEwMFxuXG4gICAgICAgIGZvciBvcHQgaW4gT2JqZWN0LmtleXMgQG9wdGlvbnNcbiAgICAgICAgICAgIEBzZXRPcHRpb24gb3B0LCBAb3B0aW9uc1tvcHRdXG4gICAgICAgIFxuICAgICAgICBAcmF5Y2FzdGVyID0gbmV3IFJheWNhc3RlclxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICByZW5kZXJTY2VuZTogPT5cbiAgICAgICAgXG4gICAgICAgIEBmcHM/LmRyYXcoKVxuICAgICAgICBAc3VuLnBvc2l0aW9uLmNvcHkgQGNhbWVyYS5nZXRQb3NpdGlvbigpXG4gICAgICAgICMgQHN1bi5wb3NpdGlvbi5hZGQgIEBjYW1lcmEuZ2V0VXAoKS5tdWx0aXBseVNjYWxhciAzLjBcbiAgICAgICAgIyBAc3VuLnBvc2l0aW9uLmFkZCAgQGNhbWVyYS5nZXRSaWdodCgpLm11bHRpcGx5U2NhbGFyIC0zLjBcblxuICAgICAgICBAcmVuZGVyZXIucmVuZGVyIEBzY2VuZSwgQGNhbWVyYSAgICAgICAgXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSBAcmVuZGVyU2NlbmVcbiAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgMDAwICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAgICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBvblJlc2l6ZTogPT4gXG4gICAgICAgIFxuICAgICAgICB3ID0gQHZpZXcuY2xpZW50V2lkdGggXG4gICAgICAgIGggPSBAdmlldy5jbGllbnRIZWlnaHRcbiAgICAgICAgXG4gICAgICAgIEBhc3BlY3QgPSB3L2hcbiAgICAgICAgQHZpZXdTaXplID0ga3BvcyB3LGhcbiAgXG4gICAgICAgIGlmIEBjYW1lcmE/XG4gICAgICAgICAgICBAY2FtZXJhLmFzcGVjdCA9IEBhc3BlY3RcbiAgICAgICAgICAgIEBjYW1lcmEuc2l6ZSAgID0gQHZpZXdTaXplXG4gICAgICAgICAgICBAY2FtZXJhLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKVxuICAgICAgICBcbiAgICAgICAgQHJlbmRlcmVyPy5zZXRTaXplIHcsaFxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgICAgICAgMDAwICBcbiAgICAjICAwMDAwMDAwICAgMDAwICAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBpbml0T3B0aW9uczogLT5cbiAgICAgICAgXG4gICAgICAgIEBvcHRpb25zID0ge31cbiAgICAgICAgZm9yIG9wdCBpbiBbJ2ZwcycgJ3BsYW5lJyAnZ3JpZCcgJ2F4ZXMnICdkaXRoZXInICdzaGFkb3cnICdmb2cnXVxuICAgICAgICAgICAgQG9wdGlvbnNbb3B0XSA9ICBwcmVmcy5nZXQgXCJvcHRpb27ilrgje29wdH1cIiB0cnVlXG4gICAgXG4gICAgdG9nZ2xlOiAob3B0KSAtPiBAc2V0T3B0aW9uIG9wdCwgbm90IEBvcHRpb25zW29wdF1cblxuICAgIHNldE9wdGlvbjogKG9wdCwgdmFsKSAtPiBcbiAgICAgICAgXG4gICAgICAgIEBvcHRpb25zW29wdF0gPSB2YWxcbiAgICAgICAgcHJlZnMuc2V0IFwib3B0aW9u4pa4I3tvcHR9XCIgdmFsXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggb3B0XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHdoZW4gJ2ZwcydcbiAgICAgICAgICAgICAgICBpZiB2YWxcbiAgICAgICAgICAgICAgICAgICAgQGZwcyA9IG5ldyBGUFNcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEBmcHM/LnJlbW92ZSgpXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBAZnBzXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHdoZW4gJ3NoYWRvdydcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAcmVuZGVyZXIuc2hhZG93TWFwLmVuYWJsZWQgPSB2YWxcbiAgICAgICAgICAgICAgICBAc3VuLmNhc3RTaGFkb3cgPSB2YWxcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHdoZW4gJ3BsYW5lJ1xuICAgICAgICAgICAgICAgIGlmIHZhbFxuICAgICAgICAgICAgICAgICAgICBAc2NlbmUuYWRkIEBwbGFuZVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQHNjZW5lLnJlbW92ZSBAcGxhbmVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgd2hlbiAnZGl0aGVyJ1xuICAgICAgICAgICAgICAgIEBzY2VuZS50cmF2ZXJzZSAobm9kZSkgLT5cbiAgICAgICAgICAgICAgICAgICAgaWYgbm9kZSBpbnN0YW5jZW9mIE1lc2hcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUubWF0ZXJpYWwuZGl0aGVyaW5nID0gdmFsXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLm1hdGVyaWFsLm5lZWRzVXBkYXRlID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB3aGVuICdmb2cnXG4gICAgICAgICAgICAgICAgaWYgdmFsXG4gICAgICAgICAgICAgICAgICAgIEBzY2VuZS5mb2cubmVhciA9IDEwXG4gICAgICAgICAgICAgICAgICAgIEBzY2VuZS5mb2cuZmFyICA9IDUwXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAc2NlbmUuZm9nLm5lYXIgPSA5OTk5OVxuICAgICAgICAgICAgICAgICAgICBAc2NlbmUuZm9nLmZhciAgPSA5OTk5OSsxXG4gICAgICAgIFxuICAgICAgICAgICAgd2hlbiAnZ3JpZCdcbiAgICAgICAgICAgICAgICBpZiB2YWxcbiAgICAgICAgICAgICAgICAgICAgQGdyaWQgPSBuZXcgR3JpZEhlbHBlciAxMDAgMTAwIDB4MzMzMzMzLCAweDBcbiAgICAgICAgICAgICAgICAgICAgQGdyaWQucG9zaXRpb24ueSA9IDAuMDVcbiAgICAgICAgICAgICAgICAgICAgQHNjZW5lLmFkZCBAZ3JpZFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQHNjZW5lLnJlbW92ZSBAZ3JpZFxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgQGdyaWRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgd2hlbiAnYXhlcydcbiAgICAgICAgICAgICAgICBpZiB2YWxcbiAgICAgICAgICAgICAgICAgICAgQGF4ZXMgPSBuZXcgQXhlc0hlbHBlciAxMDBcbiAgICAgICAgICAgICAgICAgICAgQGF4ZXMucG9zaXRpb24ueSA9IDAuMDZcbiAgICAgICAgICAgICAgICAgICAgQHNjZW5lLmFkZCBAYXhlc1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQHNjZW5lLnJlbW92ZSBAYXhlc1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgQGF4ZXNcbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMCAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMCAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIG9uS2V5RG93bjogKGV2ZW50KSA9PlxuXG4gICAgICAgIHsgbW9kLCBrZXksIGNvbWJvLCBjaGFyIH0gPSBrZXlpbmZvLmZvckV2ZW50IGV2ZW50XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgZXZlbnQucmVwZWF0XG4gICAgICAgIFxuICAgICAgICBzd2l0Y2gga2V5XG4gICAgICAgICAgICB3aGVuICd3JyAgICAgdGhlbiBAY2FtZXJhLnN0YXJ0TW92ZUZvcndhcmQoKVxuICAgICAgICAgICAgd2hlbiAncycgICAgIHRoZW4gQGNhbWVyYS5zdGFydE1vdmVCYWNrd2FyZCgpXG4gICAgICAgICAgICB3aGVuICdhJyAgICAgdGhlbiBAY2FtZXJhLnN0YXJ0TW92ZUxlZnQoKVxuICAgICAgICAgICAgd2hlbiAnZCcgICAgIHRoZW4gQGNhbWVyYS5zdGFydE1vdmVSaWdodCgpXG4gICAgICAgICAgICB3aGVuICdxJyAgICAgdGhlbiBAY2FtZXJhLnN0YXJ0TW92ZURvd24oKVxuICAgICAgICAgICAgd2hlbiAnZScgICAgIHRoZW4gQGNhbWVyYS5zdGFydE1vdmVVcCgpXG4gICAgICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiBAY2FtZXJhLnN0YXJ0UGl2b3RMZWZ0KClcbiAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyB0aGVuIEBjYW1lcmEuc3RhcnRQaXZvdFJpZ2h0KClcbiAgICAgICAgICAgIHdoZW4gJ3VwJyAgICB0aGVuIEBjYW1lcmEuc3RhcnRQaXZvdFVwKClcbiAgICAgICAgICAgIHdoZW4gJ2Rvd24nICB0aGVuIEBjYW1lcmEuc3RhcnRQaXZvdERvd24oKVxuICAgICAgICAgICAgd2hlbiAncicgICAgIHRoZW4gQGNhbWVyYS5yZXNldCgpXG4gICAgICAgICAgICB3aGVuICcxJyAgICAgdGhlbiBAY2FtZXJhLmRlY3JlbWVudE1vdmVTcGVlZCgpXG4gICAgICAgICAgICB3aGVuICcyJyAgICAgdGhlbiBAY2FtZXJhLmluY3JlbWVudE1vdmVTcGVlZCgpXG4gICAgICAgICAgICB3aGVuICdnJyAgICAgdGhlbiBAdG9nZ2xlICdncmlkJ1xuICAgICAgICAgICAgd2hlbiAncCcgICAgIHRoZW4gQHRvZ2dsZSAncGxhbmUnXG4gICAgICAgICAgICB3aGVuICdoJyAgICAgdGhlbiBAdG9nZ2xlICdzaGFkb3cnXG4gICAgICAgICAgICB3aGVuICd5JyAgICAgdGhlbiBAdG9nZ2xlICdheGVzJ1xuICAgICAgICAgICAgd2hlbiAnZicgICAgIHRoZW4gQHRvZ2dsZSAnZm9nJ1xuICAgICAgICAgICAgd2hlbiAnbycgICAgIHRoZW4gQHRvZ2dsZSAnZnBzJ1xuICAgICAgICAgICAgd2hlbiAndCcgICAgIHRoZW4gQHRvZ2dsZSAnZGl0aGVyJ1xuICAgICAgICAgICAgIyBlbHNlXG4gICAgICAgICAgICAgICAgIyBrbG9nICdrZXlEb3duJyBtb2QsIGtleSwgY29tYm8sIGNoYXIsIGV2ZW50LndoaWNoXG4gICAgICAgIFxuICAgICAgICBzdXBlclxuICAgICAgICBcbiAgICBvbktleVVwOiAoZXZlbnQpID0+XG4gICAgICAgIFxuICAgICAgICB7IG1vZCwga2V5LCBjb21ibywgY2hhciB9ID0ga2V5aW5mby5mb3JFdmVudCBldmVudFxuICAgICAgICAjIGtsb2cgJ2tleVVwJyBtb2QsIGtleSwgY29tYm8sIGNoYXIsIGV2ZW50LndoaWNoXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2gga2V5XG4gICAgICAgICAgICB3aGVuICd3JyAgICAgdGhlbiBAY2FtZXJhLnN0b3BNb3ZlRm9yd2FyZCgpXG4gICAgICAgICAgICB3aGVuICdzJyAgICAgdGhlbiBAY2FtZXJhLnN0b3BNb3ZlQmFja3dhcmQoKVxuICAgICAgICAgICAgd2hlbiAnYScgICAgIHRoZW4gQGNhbWVyYS5zdG9wTW92ZUxlZnQoKVxuICAgICAgICAgICAgd2hlbiAnZCcgICAgIHRoZW4gQGNhbWVyYS5zdG9wTW92ZVJpZ2h0KClcbiAgICAgICAgICAgIHdoZW4gJ3EnICAgICB0aGVuIEBjYW1lcmEuc3RvcE1vdmVEb3duKClcbiAgICAgICAgICAgIHdoZW4gJ2UnICAgICB0aGVuIEBjYW1lcmEuc3RvcE1vdmVVcCgpXG4gICAgICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiBAY2FtZXJhLnN0b3BQaXZvdExlZnQoKVxuICAgICAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4gQGNhbWVyYS5zdG9wUGl2b3RSaWdodCgpXG4gICAgICAgICAgICB3aGVuICd1cCcgICAgdGhlbiBAY2FtZXJhLnN0b3BQaXZvdFVwKClcbiAgICAgICAgICAgIHdoZW4gJ2Rvd24nICB0aGVuIEBjYW1lcmEuc3RvcFBpdm90RG93bigpXG4gICAgICAgIFxuICAgICAgICBzdXBlclxuICAgICAgICBcbiAgICAjIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIFxuXG4gICAgbW91c2VFdmVudDogKGV2ZW50KSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgQHZpZXdPZmZzZXRcbiAgICAgICAgICAgIEBtb3VzZS54ID0gICAoIChldmVudC5jbGllbnRYIC0gQHZpZXdPZmZzZXQueCkgLyBAdmlldy5jbGllbnRXaWR0aCApICogMiAtIDE7XG4gICAgICAgICAgICBAbW91c2UueSA9IC0gKCAoZXZlbnQuY2xpZW50WSAtIEB2aWV3T2Zmc2V0LnkpIC8gQHZpZXcuY2xpZW50SGVpZ2h0ICkgKiAyICsgMTtcbiAgICBcbiAgICBvbk1vdXNlTW92ZTogKGV2ZW50KSA9PiBAbW91c2VFdmVudCBldmVudFxuICAgIG9uTW91c2VVcDogICAoZXZlbnQpID0+IEBtb3VzZUV2ZW50IGV2ZW50XG4gICAgb25Nb3VzZURvd246IChldmVudCkgPT4gQG1vdXNlRXZlbnQgZXZlbnQ7IEBwaWNrT2JqZWN0IGV2ZW50XG4gICAgICAgIFxuICAgIHBpY2tPYmplY3Q6IChldmVudCkgLT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBldmVudC5idXR0b25zICE9IDFcbiAgICAgICAgQHJheWNhc3Rlci5zZXRGcm9tQ2FtZXJhIEBtb3VzZSwgQGNhbWVyYVxuICAgICAgICBmb3IgaW50ZXJzZWN0IGluIEByYXljYXN0ZXIuaW50ZXJzZWN0T2JqZWN0cyBAc2NlbmUuY2hpbGRyZW5cbiAgICAgICAgICAgIGlmIGludGVyc2VjdD8ub2JqZWN0Py50eXBlID09ICdNZXNoJ1xuICAgICAgICAgICAgICAgIGlmIGludGVyc2VjdC5vYmplY3QubmFtZSAhPSAncGxhbmUnXG4gICAgICAgICAgICAgICAgICAgIGludGVyc2VjdC5vYmplY3QuZ2VvbWV0cnkuY29tcHV0ZUJvdW5kaW5nU3BoZXJlKClcbiAgICAgICAgICAgICAgICAgICAgQGNhbWVyYS5zZXRQaXZvdENlbnRlciBpbnRlcnNlY3Qub2JqZWN0Lmdlb21ldHJ5LmJvdW5kaW5nU3BoZXJlLmNlbnRlclxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBvbk1lbnVBY3Rpb246IChhY3Rpb24sIGFyZ3MpID0+XG4gICAgICAgIFxuICAgICAgICAjIGtsb2cgXCJtZW51QWN0aW9uICN7YWN0aW9ufVwiIGFyZ3NcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIHN1cGVyXG4gICAgICAgICAgICAgICAgICAgICAgICBcbm5ldyBNYWluV2luICAgICAgICAgICAgXG4iXX0=
//# sourceURL=../coffee/window.coffee