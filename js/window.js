// koffee 1.12.0

/*
000   000  000  000   000  0000000     0000000   000   000
000 0 000  000  0000  000  000   000  000   000  000 0 000
000000000  000  000 0 000  000   000  000   000  000000000
000   000  000  000  0000  000   000  000   000  000   000
00     00  000  000   000  0000000     0000000   00     00
 */
var $, AmbientLight, AxesHelper, Camera, Color, FPS, Fog, GridHelper, MainWin, Mesh, MeshStandardMaterial, PCFSoftShadowMap, PlaneGeometry, PointLight, PointLightHelper, Raycaster, Scene, Tetras, Vector2, WebGLRenderer, deg2rad, keyinfo, kpos, prefs, ref, ref1, win,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), $ = ref.$, deg2rad = ref.deg2rad, keyinfo = ref.keyinfo, kpos = ref.kpos, prefs = ref.prefs, win = ref.win;

ref1 = require('three'), AmbientLight = ref1.AmbientLight, AxesHelper = ref1.AxesHelper, Camera = ref1.Camera, Color = ref1.Color, Fog = ref1.Fog, GridHelper = ref1.GridHelper, Mesh = ref1.Mesh, MeshStandardMaterial = ref1.MeshStandardMaterial, PCFSoftShadowMap = ref1.PCFSoftShadowMap, PlaneGeometry = ref1.PlaneGeometry, PointLight = ref1.PointLight, PointLightHelper = ref1.PointLightHelper, Raycaster = ref1.Raycaster, Scene = ref1.Scene, Vector2 = ref1.Vector2, WebGLRenderer = ref1.WebGLRenderer;

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
        this.scene.add(new PointLightHelper(this.sun, 1));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93LmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsid2luZG93LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSxxUUFBQTtJQUFBOzs7O0FBUUEsTUFBNEMsT0FBQSxDQUFRLEtBQVIsQ0FBNUMsRUFBRSxTQUFGLEVBQUsscUJBQUwsRUFBYyxxQkFBZCxFQUF1QixlQUF2QixFQUE2QixpQkFBN0IsRUFBb0M7O0FBRXBDLE9BQW9NLE9BQUEsQ0FBUSxPQUFSLENBQXBNLEVBQUUsZ0NBQUYsRUFBZ0IsNEJBQWhCLEVBQTRCLG9CQUE1QixFQUFvQyxrQkFBcEMsRUFBMkMsY0FBM0MsRUFBZ0QsNEJBQWhELEVBQTRELGdCQUE1RCxFQUFrRSxnREFBbEUsRUFBd0Ysd0NBQXhGLEVBQTBHLGtDQUExRyxFQUF5SCw0QkFBekgsRUFBcUksd0NBQXJJLEVBQXVKLDBCQUF2SixFQUFrSyxrQkFBbEssRUFBeUssc0JBQXpLLEVBQWtMOztBQUVsTCxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0FBQ1QsR0FBQSxHQUFTLE9BQUEsQ0FBUSxPQUFSOztBQUNULE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7QUFFSDs7O0lBRUMsaUJBQUE7Ozs7Ozs7Ozs7UUFFQyx5Q0FDSTtZQUFBLEdBQUEsRUFBUSxTQUFSO1lBQ0EsR0FBQSxFQUFRLE9BQUEsQ0FBUSxpQkFBUixDQURSO1lBRUEsSUFBQSxFQUFRLHFCQUZSO1lBR0EsSUFBQSxFQUFRLGlCQUhSO1lBSUEsY0FBQSxFQUFnQixHQUpoQjtZQUtBLE9BQUEsRUFBUyxLQUxUO1lBTUEsTUFBQSxFQUFRLElBQUMsQ0FBQSxNQU5UO1NBREo7UUFTQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUk7UUFFYixJQUFDLENBQUEsV0FBRCxDQUFBO1FBRUEsZ0JBQUEsQ0FBaUIsYUFBakIsRUFBK0IsSUFBQyxDQUFBLFdBQWhDO1FBQ0EsZ0JBQUEsQ0FBaUIsYUFB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QUMsYUFBWCxDQUF5QixJQUFDLENBQUEsS0FBMUIsRUFBaUMsSUFBQyxDQUFBLE1BQWxDO0FBQ0E7QUFBQSxhQUFBLHNDQUFBOztZQUNJLGlFQUFvQixDQUFFLHVCQUFuQixLQUEyQixNQUE5QjtnQkFDSSxJQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBakIsS0FBeUIsT0FBNUI7b0JBQ0ksSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUFSLENBQXVCLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBeEM7QUFDQSwyQkFGSjtpQkFESjs7QUFESjtJQUpROztzQkFnQlosWUFBQSxHQUFjLFNBQUMsTUFBRCxFQUFTLElBQVQ7ZUFJViwyQ0FBQSxTQUFBO0lBSlU7Ozs7R0F6U0k7O0FBK1N0QixJQUFJIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4wMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwXG4wMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4wMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAgICAgIDAwXG4jIyNcblxueyAkLCBkZWcycmFkLCBrZXlpbmZvLCBrcG9zLCBwcmVmcywgd2luIH0gPSByZXF1aXJlICdreGsnXG5cbnsgQW1iaWVudExpZ2h0LCBBeGVzSGVscGVyLCBDYW1lcmEsIENvbG9yLCBGb2csIEdyaWRIZWxwZXIsIE1lc2gsIE1lc2hTdGFuZGFyZE1hdGVyaWFsLCBQQ0ZTb2Z0U2hhZG93TWFwLCBQbGFuZUdlb21ldHJ5LCBQb2ludExpZ2h0LCBQb2ludExpZ2h0SGVscGVyLCBSYXljYXN0ZXIsIFNjZW5lLCBWZWN0b3IyLCBXZWJHTFJlbmRlcmVyIH0gPSByZXF1aXJlICd0aHJlZSdcblxuQ2FtZXJhID0gcmVxdWlyZSAnLi9jYW1lcmEnXG5GUFMgICAgPSByZXF1aXJlICcuL2ZwcydcblRldHJhcyA9IHJlcXVpcmUgJy4vdGV0cmFzJ1xuXG5jbGFzcyBNYWluV2luIGV4dGVuZHMgd2luXG4gICAgXG4gICAgQDogLT5cbiAgICAgICAgXG4gICAgICAgIHN1cGVyXG4gICAgICAgICAgICBkaXI6ICAgIF9fZGlybmFtZVxuICAgICAgICAgICAgcGtnOiAgICByZXF1aXJlICcuLi9wYWNrYWdlLmpzb24nXG4gICAgICAgICAgICBtZW51OiAgICcuLi9jb2ZmZWUvbWVudS5ub29uJ1xuICAgICAgICAgICAgaWNvbjogICAnLi4vaW1nL21pbmkucG5nJ1xuICAgICAgICAgICAgcHJlZnNTZXBlcmF0b3I6ICfilrgnXG4gICAgICAgICAgICBjb250ZXh0OiBmYWxzZVxuICAgICAgICAgICAgb25Mb2FkOiBAb25Mb2FkXG4gICAgICAgICAgXG4gICAgICAgIEBtb3VzZSA9IG5ldyBWZWN0b3IyXG4gICAgICAgIFxuICAgICAgICBAaW5pdE9wdGlvbnMoKVxuICAgICAgICAgICAgXG4gICAgICAgIGFkZEV2ZW50TGlzdGVuZXIgJ3BvaW50ZXJkb3duJyBAb25Nb3VzZURvd25cbiAgICAgICAgYWRkRXZlbnRMaXN0ZW5lciAncG9pbnRlcm1vdmUnIEBvbk1vdXNlTW92ZVxuICAgICAgICBhZGRFdmVudExpc3RlbmVyICdwb2ludGVydXAnICAgQG9uTW91c2VVcFxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgb25Mb2FkOiA9PlxuXG4gICAgICAgIHdpbmRvdy5vbnJlc2l6ZSA9IEBvblJlc2l6ZVxuICAgICAgICBcbiAgICAgICAgQGluaXRTY2VuZSAkIFwiI21haW5cIlxuICAgICAgICBcbiAgICAgICAgVGV0cmFzLnJlbmRlclNjZW5lIEBzY2VuZVxuICAgICAgICBcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lIEByZW5kZXJTY2VuZVxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgaW5pdFNjZW5lOiAoQHZpZXcpIC0+XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEByZW5kZXJlciA9IG5ldyBXZWJHTFJlbmRlcmVyIGFudGlhbGlhczp0cnVlIHByZWNpc2lvbjonaGlnaHAnXG4gICAgICAgICAgICBcbiAgICAgICAgQHJlbmRlcmVyLnNldFNpemUgQHZpZXcub2Zmc2V0V2lkdGgsIEB2aWV3Lm9mZnNldEhlaWdodFxuICAgICAgICBAcmVuZGVyZXIuYXV0b0NsZWFyICAgICAgICAgPSBmYWxzZVxuICAgICAgICBAcmVuZGVyZXIuc29ydE9iamVjdHMgICAgICAgPSB0cnVlXG4gICAgICAgIEByZW5kZXJlci5zaGFkb3dNYXAudHlwZSAgICA9IFBDRlNvZnRTaGFkb3dNYXBcbiAgICAgICAgQHJlbmRlcmVyLnNoYWRvd01hcC5lbmFibGVkID0gdHJ1ZVxuICAgICAgICBAcmVuZGVyZXIuc2V0UGl4ZWxSYXRpbyB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyBcbiAgICAgICAgQHZpZXcuYXBwZW5kQ2hpbGQgQHJlbmRlcmVyLmRvbUVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIEBmb2dDb2xvciA9IG5ldyBDb2xvciAnaHNsKDE4MCwgMCUsIDQlKSdcbiAgICAgICAgXG4gICAgICAgIEBvblJlc2l6ZSgpXG4gICAgICAgIFxuICAgICAgICBiciA9IEByZW5kZXJlci5kb21FbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgIEB2aWV3T2Zmc2V0ID0gbmV3IFZlY3RvcjIgYnIubGVmdCwgYnIudG9wXG4gICAgICAgIFxuICAgICAgICBAc2NlbmUgPSBuZXcgU2NlbmUoKVxuICAgICAgICBAc2NlbmUuYmFja2dyb3VuZCA9IEBmb2dDb2xvclxuICAgICAgICBAY2FtZXJhID0gbmV3IENhbWVyYSB2aWV3OkB2aWV3XG5cbiAgICAgICAgQHN1biA9IG5ldyBQb2ludExpZ2h0IDB4ZmZmZmZmLCAyLCAyMDBcbiAgICAgICAgQHN1bi5wb3NpdGlvbi5zZXQgMCAxMCAwXHJcbiAgICAgICAgQHN1bi5jYXN0U2hhZG93ID0gdHJ1ZVxuICAgICAgICBAc3VuLnNoYWRvdy5tYXBTaXplID0gbmV3IFZlY3RvcjIgMioyMDQ4LCAyKjIwNDhcbiAgICAgICAgQHNjZW5lLmFkZCBAc3VuXG4gICAgICAgIFxuICAgICAgICBAc2NlbmUuYWRkIG5ldyBQb2ludExpZ2h0SGVscGVyIEBzdW4sIDFcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQGFtYmllbnQgPSBuZXcgQW1iaWVudExpZ2h0IDB4MTgxODE4XG4gICAgICAgIEBzY2VuZS5hZGQgQGFtYmllbnRcbiAgICAgICAgXG4gICAgICAgIG1hdGVyaWFsID0gbmV3IE1lc2hTdGFuZGFyZE1hdGVyaWFsIHtcbiAgICAgICAgICAgIG1ldGFsbmVzczogMC42XG4gICAgICAgICAgICByb3VnaG5lc3M6IDAuM1xyXG4gICAgICAgICAgICBjb2xvcjoweDU1NTVmZlxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBtYXRlcmlhbCA9IG5ldyBNZXNoU3RhbmRhcmRNYXRlcmlhbFxuICAgICAgICAgICAgbWV0YWxuZXNzOiAwLjBcbiAgICAgICAgICAgIGNvbG9yOiBuZXcgQ29sb3IgJ2hzbCgxODAsMCUsNCUpJ1xuICAgICAgICAgICAgcm91Z2huZXNzOiAxLjBcclxuICAgICAgICAgICAgZmxhdFNoYWRpbmc6IHRydWVcbiAgICAgICAgICAgICAgXG4gICAgICAgIGdlb21ldHJ5ID0gbmV3IFBsYW5lR2VvbWV0cnkgMTAwMCAxMDAwIDEwXG4gICAgICAgIEBwbGFuZSA9IG5ldyBNZXNoIGdlb21ldHJ5LCBtYXRlcmlhbFxuICAgICAgICBAcGxhbmUuY2FzdFNoYWRvdyA9IGZhbHNlXG4gICAgICAgIEBwbGFuZS5yZWNlaXZlU2hhZG93ID0gdHJ1ZVxuICAgICAgICBAcGxhbmUubmFtZSA9ICdwbGFuZSdcbiAgICAgICAgQHBsYW5lLnBvc2l0aW9uLnkgPSAtMC4xXG4gICAgICAgIEBwbGFuZS5yb3RhdGlvbi5zZXQgZGVnMnJhZCgtOTApLCAwIDBcbiAgICAgICAgQHNjZW5lLmFkZCBAcGxhbmVcblxuICAgICAgICAjIGtsb2cgT2JqZWN0LmtleXMgcmVxdWlyZSAndGhyZWUnXG4gICAgICAgIEBzY2VuZS5mb2cgPSBuZXcgRm9nIEBmb2dDb2xvciwgMTAgMTAwXG5cbiAgICAgICAgZm9yIG9wdCBpbiBPYmplY3Qua2V5cyBAb3B0aW9uc1xuICAgICAgICAgICAgQHNldE9wdGlvbiBvcHQsIEBvcHRpb25zW29wdF1cbiAgICAgICAgXG4gICAgICAgIEByYXljYXN0ZXIgPSBuZXcgUmF5Y2FzdGVyXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIHJlbmRlclNjZW5lOiA9PlxuICAgICAgICBcbiAgICAgICAgQGZwcz8uZHJhdygpXG4gICAgICAgIEBzdW4ucG9zaXRpb24uY29weSBAY2FtZXJhLmdldFBvc2l0aW9uKClcbiAgICAgICAgQHN1bi5wb3NpdGlvbi5hZGQgIEBjYW1lcmEuZ2V0VXAoKS5tdWx0aXBseVNjYWxhciAzLjBcbiAgICAgICAgQHN1bi5wb3NpdGlvbi5hZGQgIEBjYW1lcmEuZ2V0UmlnaHQoKS5tdWx0aXBseVNjYWxhciAtMy4wXG5cbiAgICAgICAgQHJlbmRlcmVyLnJlbmRlciBAc2NlbmUsIEBjYW1lcmEgICAgICAgIFxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgQHJlbmRlclNjZW5lXG4gICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAwMDAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgIDAwMCAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgb25SZXNpemU6ID0+IFxuICAgICAgICBcbiAgICAgICAgdyA9IEB2aWV3LmNsaWVudFdpZHRoIFxuICAgICAgICBoID0gQHZpZXcuY2xpZW50SGVpZ2h0XG4gICAgICAgIFxuICAgICAgICBAYXNwZWN0ID0gdy9oXG4gICAgICAgIEB2aWV3U2l6ZSA9IGtwb3MgdyxoXG4gIFxuICAgICAgICBpZiBAY2FtZXJhP1xuICAgICAgICAgICAgQGNhbWVyYS5hc3BlY3QgPSBAYXNwZWN0XG4gICAgICAgICAgICBAY2FtZXJhLnNpemUgICA9IEB2aWV3U2l6ZVxuICAgICAgICAgICAgQGNhbWVyYS51cGRhdGVQcm9qZWN0aW9uTWF0cml4KClcbiAgICAgICAgXG4gICAgICAgIEByZW5kZXJlcj8uc2V0U2l6ZSB3LGhcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAgICAgIDAwMCAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMCAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgaW5pdE9wdGlvbnM6IC0+XG4gICAgICAgIFxuICAgICAgICBAb3B0aW9ucyA9IHt9XG4gICAgICAgIGZvciBvcHQgaW4gWydmcHMnICdwbGFuZScgJ2dyaWQnICdheGVzJyAnZGl0aGVyJyAnc2hhZG93JyAnZm9nJ11cbiAgICAgICAgICAgIEBvcHRpb25zW29wdF0gPSAgcHJlZnMuZ2V0IFwib3B0aW9u4pa4I3tvcHR9XCIgdHJ1ZVxuICAgIFxuICAgIHRvZ2dsZTogKG9wdCkgLT4gQHNldE9wdGlvbiBvcHQsIG5vdCBAb3B0aW9uc1tvcHRdXG5cbiAgICBzZXRPcHRpb246IChvcHQsIHZhbCkgLT4gXG4gICAgICAgIFxuICAgICAgICBAb3B0aW9uc1tvcHRdID0gdmFsXG4gICAgICAgIHByZWZzLnNldCBcIm9wdGlvbuKWuCN7b3B0fVwiIHZhbFxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIG9wdFxuICAgICAgICAgICAgXG4gICAgICAgICAgICB3aGVuICdmcHMnXG4gICAgICAgICAgICAgICAgaWYgdmFsXG4gICAgICAgICAgICAgICAgICAgIEBmcHMgPSBuZXcgRlBTXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAZnBzPy5yZW1vdmUoKVxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgQGZwc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB3aGVuICdzaGFkb3cnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHJlbmRlcmVyLnNoYWRvd01hcC5lbmFibGVkID0gdmFsXG4gICAgICAgICAgICAgICAgQHN1bi5jYXN0U2hhZG93ID0gdmFsXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB3aGVuICdwbGFuZSdcbiAgICAgICAgICAgICAgICBpZiB2YWxcbiAgICAgICAgICAgICAgICAgICAgQHNjZW5lLmFkZCBAcGxhbmVcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEBzY2VuZS5yZW1vdmUgQHBsYW5lXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHdoZW4gJ2RpdGhlcidcbiAgICAgICAgICAgICAgICBAc2NlbmUudHJhdmVyc2UgKG5vZGUpIC0+XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgbm9kZSBpbnN0YW5jZW9mIE1lc2hcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUubWF0ZXJpYWwuZGl0aGVyaW5nID0gdmFsXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLm1hdGVyaWFsLm5lZWRzVXBkYXRlID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB3aGVuICdmb2cnXG4gICAgICAgICAgICAgICAgaWYgdmFsXG4gICAgICAgICAgICAgICAgICAgIEBzY2VuZS5mb2cubmVhciA9IDEwXG4gICAgICAgICAgICAgICAgICAgIEBzY2VuZS5mb2cuZmFyICA9IDUwXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAc2NlbmUuZm9nLm5lYXIgPSA5OTk5OVxuICAgICAgICAgICAgICAgICAgICBAc2NlbmUuZm9nLmZhciAgPSA5OTk5OSsxXG4gICAgICAgIFxuICAgICAgICAgICAgd2hlbiAnZ3JpZCdcbiAgICAgICAgICAgICAgICBpZiB2YWxcbiAgICAgICAgICAgICAgICAgICAgQGdyaWQgPSBuZXcgR3JpZEhlbHBlciAxMDAgMTAwIDB4MzMzMzMzLCAweDBcbiAgICAgICAgICAgICAgICAgICAgQGdyaWQucG9zaXRpb24ueSA9IDAuMDVcbiAgICAgICAgICAgICAgICAgICAgQHNjZW5lLmFkZCBAZ3JpZFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQHNjZW5lLnJlbW92ZSBAZ3JpZFxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgQGdyaWRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgd2hlbiAnYXhlcydcbiAgICAgICAgICAgICAgICBpZiB2YWxcbiAgICAgICAgICAgICAgICAgICAgQGF4ZXMgPSBuZXcgQXhlc0hlbHBlciAxMDBcbiAgICAgICAgICAgICAgICAgICAgQGF4ZXMucG9zaXRpb24ueSA9IDAuMDZcbiAgICAgICAgICAgICAgICAgICAgQHNjZW5lLmFkZCBAYXhlc1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgQHNjZW5lLnJlbW92ZSBAYXhlc1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgQGF4ZXNcbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMCAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMCAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIG9uS2V5RG93bjogKGV2ZW50KSA9PlxuXG4gICAgICAgIHsgbW9kLCBrZXksIGNvbWJvLCBjaGFyIH0gPSBrZXlpbmZvLmZvckV2ZW50IGV2ZW50XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgZXZlbnQucmVwZWF0XG4gICAgICAgIFxuICAgICAgICBzd2l0Y2gga2V5XG4gICAgICAgICAgICB3aGVuICd3JyAgICAgdGhlbiBAY2FtZXJhLnN0YXJ0TW92ZUZvcndhcmQoKVxuICAgICAgICAgICAgd2hlbiAncycgICAgIHRoZW4gQGNhbWVyYS5zdGFydE1vdmVCYWNrd2FyZCgpXG4gICAgICAgICAgICB3aGVuICdhJyAgICAgdGhlbiBAY2FtZXJhLnN0YXJ0TW92ZUxlZnQoKVxuICAgICAgICAgICAgd2hlbiAnZCcgICAgIHRoZW4gQGNhbWVyYS5zdGFydE1vdmVSaWdodCgpXG4gICAgICAgICAgICB3aGVuICdxJyAgICAgdGhlbiBAY2FtZXJhLnN0YXJ0TW92ZURvd24oKVxuICAgICAgICAgICAgd2hlbiAnZScgICAgIHRoZW4gQGNhbWVyYS5zdGFydE1vdmVVcCgpXG4gICAgICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiBAY2FtZXJhLnN0YXJ0UGl2b3RMZWZ0KClcbiAgICAgICAgICAgIHdoZW4gJ3JpZ2h0JyB0aGVuIEBjYW1lcmEuc3RhcnRQaXZvdFJpZ2h0KClcbiAgICAgICAgICAgIHdoZW4gJ3VwJyAgICB0aGVuIEBjYW1lcmEuc3RhcnRQaXZvdFVwKClcbiAgICAgICAgICAgIHdoZW4gJ2Rvd24nICB0aGVuIEBjYW1lcmEuc3RhcnRQaXZvdERvd24oKVxuICAgICAgICAgICAgd2hlbiAncicgICAgIHRoZW4gQGNhbWVyYS5yZXNldCgpXG4gICAgICAgICAgICB3aGVuICcxJyAgICAgdGhlbiBAY2FtZXJhLmRlY3JlbWVudE1vdmVTcGVlZCgpXG4gICAgICAgICAgICB3aGVuICcyJyAgICAgdGhlbiBAY2FtZXJhLmluY3JlbWVudE1vdmVTcGVlZCgpXG4gICAgICAgICAgICB3aGVuICdnJyAgICAgdGhlbiBAdG9nZ2xlICdncmlkJ1xuICAgICAgICAgICAgd2hlbiAncCcgICAgIHRoZW4gQHRvZ2dsZSAncGxhbmUnXG4gICAgICAgICAgICB3aGVuICdoJyAgICAgdGhlbiBAdG9nZ2xlICdzaGFkb3cnXG4gICAgICAgICAgICB3aGVuICd5JyAgICAgdGhlbiBAdG9nZ2xlICdheGVzJ1xuICAgICAgICAgICAgd2hlbiAnZicgICAgIHRoZW4gQHRvZ2dsZSAnZm9nJ1xuICAgICAgICAgICAgd2hlbiAnbycgICAgIHRoZW4gQHRvZ2dsZSAnZnBzJ1xuICAgICAgICAgICAgd2hlbiAndCcgICAgIHRoZW4gQHRvZ2dsZSAnZGl0aGVyJ1xuICAgICAgICAgICAgIyBlbHNlXG4gICAgICAgICAgICAgICAgIyBrbG9nICdrZXlEb3duJyBtb2QsIGtleSwgY29tYm8sIGNoYXIsIGV2ZW50LndoaWNoXG4gICAgICAgIFxuICAgICAgICBzdXBlclxuICAgICAgICBcbiAgICBvbktleVVwOiAoZXZlbnQpID0+XG4gICAgICAgIFxuICAgICAgICB7IG1vZCwga2V5LCBjb21ibywgY2hhciB9ID0ga2V5aW5mby5mb3JFdmVudCBldmVudFxuICAgICAgICAjIGtsb2cgJ2tleVVwJyBtb2QsIGtleSwgY29tYm8sIGNoYXIsIGV2ZW50LndoaWNoXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2gga2V5XG4gICAgICAgICAgICB3aGVuICd3JyAgICAgdGhlbiBAY2FtZXJhLnN0b3BNb3ZlRm9yd2FyZCgpXG4gICAgICAgICAgICB3aGVuICdzJyAgICAgdGhlbiBAY2FtZXJhLnN0b3BNb3ZlQmFja3dhcmQoKVxuICAgICAgICAgICAgd2hlbiAnYScgICAgIHRoZW4gQGNhbWVyYS5zdG9wTW92ZUxlZnQoKVxuICAgICAgICAgICAgd2hlbiAnZCcgICAgIHRoZW4gQGNhbWVyYS5zdG9wTW92ZVJpZ2h0KClcbiAgICAgICAgICAgIHdoZW4gJ3EnICAgICB0aGVuIEBjYW1lcmEuc3RvcE1vdmVEb3duKClcbiAgICAgICAgICAgIHdoZW4gJ2UnICAgICB0aGVuIEBjYW1lcmEuc3RvcE1vdmVVcCgpXG4gICAgICAgICAgICB3aGVuICdsZWZ0JyAgdGhlbiBAY2FtZXJhLnN0b3BQaXZvdExlZnQoKVxuICAgICAgICAgICAgd2hlbiAncmlnaHQnIHRoZW4gQGNhbWVyYS5zdG9wUGl2b3RSaWdodCgpXG4gICAgICAgICAgICB3aGVuICd1cCcgICAgdGhlbiBAY2FtZXJhLnN0b3BQaXZvdFVwKClcbiAgICAgICAgICAgIHdoZW4gJ2Rvd24nICB0aGVuIEBjYW1lcmEuc3RvcFBpdm90RG93bigpXG4gICAgICAgIFxuICAgICAgICBzdXBlclxuICAgICAgICBcbiAgICAjIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIFxuXG4gICAgbW91c2VFdmVudDogKGV2ZW50KSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgQHZpZXdPZmZzZXRcbiAgICAgICAgICAgIEBtb3VzZS54ID0gICAoIChldmVudC5jbGllbnRYIC0gQHZpZXdPZmZzZXQueCkgLyBAdmlldy5jbGllbnRXaWR0aCApICogMiAtIDE7XHJcbiAgICAgICAgICAgIEBtb3VzZS55ID0gLSAoIChldmVudC5jbGllbnRZIC0gQHZpZXdPZmZzZXQueSkgLyBAdmlldy5jbGllbnRIZWlnaHQgKSAqIDIgKyAxO1xuICAgIFxuICAgIG9uTW91c2VNb3ZlOiAoZXZlbnQpID0+IEBtb3VzZUV2ZW50IGV2ZW50XG4gICAgb25Nb3VzZVVwOiAgIChldmVudCkgPT4gQG1vdXNlRXZlbnQgZXZlbnRcbiAgICBvbk1vdXNlRG93bjogKGV2ZW50KSA9PiBAbW91c2VFdmVudCBldmVudDsgQHBpY2tPYmplY3QgZXZlbnRcbiAgICAgICAgXG4gICAgcGlja09iamVjdDogKGV2ZW50KSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIGV2ZW50LmJ1dHRvbnMgIT0gMVxuICAgICAgICBAcmF5Y2FzdGVyLnNldEZyb21DYW1lcmEgQG1vdXNlLCBAY2FtZXJhXG4gICAgICAgIGZvciBpbnRlcnNlY3QgaW4gQHJheWNhc3Rlci5pbnRlcnNlY3RPYmplY3RzIEBzY2VuZS5jaGlsZHJlblxuICAgICAgICAgICAgaWYgaW50ZXJzZWN0Py5vYmplY3Q/LnR5cGUgPT0gJ01lc2gnXG4gICAgICAgICAgICAgICAgaWYgaW50ZXJzZWN0Lm9iamVjdC5uYW1lICE9ICdwbGFuZSdcbiAgICAgICAgICAgICAgICAgICAgQGNhbWVyYS5zZXRQaXZvdENlbnRlciBpbnRlcnNlY3Qub2JqZWN0LnBvc2l0aW9uXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgIFxuICAgICMgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIG9uTWVudUFjdGlvbjogKGFjdGlvbiwgYXJncykgPT5cbiAgICAgICAgXG4gICAgICAgICMga2xvZyBcIm1lbnVBY3Rpb24gI3thY3Rpb259XCIgYXJnc1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgc3VwZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxubmV3IE1haW5XaW4gICAgICAgICAgICBcbiJdfQ==
//# sourceURL=../coffee/window.coffee