// koffee 1.12.0

/*
000000000  00000000  000000000  00000000    0000000    0000000
   000     000          000     000   000  000   000  000     
   000     0000000      000     0000000    000000000  0000000 
   000     000          000     000   000  000   000       000
   000     00000000     000     000   000  000   000  0000000
 */
var BufferGeometry, CUBE, Float32BufferAttribute, LineSegments, Mesh, MeshStandardMaterial, Points, PointsMaterial, TETRA, Tetras, WireframeGeometry, _, ref;

_ = require('kxk')._;

ref = require('three'), BufferGeometry = ref.BufferGeometry, Float32BufferAttribute = ref.Float32BufferAttribute, LineSegments = ref.LineSegments, Mesh = ref.Mesh, MeshStandardMaterial = ref.MeshStandardMaterial, Points = ref.Points, PointsMaterial = ref.PointsMaterial, WireframeGeometry = ref.WireframeGeometry;

TETRA = [[[0, 5, 4], [0, 14, 15], [4, 14, 15, 4, 15, 5], [5, 15, 16], [4, 15, 16, 4, 0, 15], [5, 14, 16, 5, 0, 14], [4, 14, 16]], [[0, 4, 8], [0, 18, 14], [8, 18, 14, 8, 14, 4], [8, 17, 18], [0, 17, 18, 0, 4, 17], [8, 17, 14, 8, 14, 0], [4, 17, 14]], [[4, 13, 8], [2, 13, 7], [7, 2, 8, 7, 8, 4], [2, 17, 8], [17, 13, 2, 17, 4, 13], [7, 17, 8, 7, 8, 13], [4, 7, 17]], [[4, 5, 10], [1, 6, 10], [6, 4, 5, 6, 5, 1], [1, 5, 16], [1, 10, 4, 1, 4, 16], [6, 10, 5, 6, 5, 16], [6, 4, 16]], [[4, 10, 9], [6, 11, 10], [4, 6, 11, 4, 11, 9], [3, 9, 11], [4, 10, 11, 4, 11, 3], [6, 3, 9, 6, 9, 10], [3, 4, 6]], [[4, 9, 13], [7, 13, 12], [4, 9, 12, 4, 12, 7], [3, 12, 9], [4, 3, 12, 4, 12, 13], [9, 3, 7, 9, 7, 13], [3, 7, 4]]];

CUBE = [[4, 3, 1, 0, 2, 0, 32, 3], [4, 3, 1, 0, 16, 3, 32, 3], [4, 3, 64, 6, 16, 3, 32, 3], [4, 3, 8, 3, 2, 0, 32, 3], [4, 3, 8, 3, 128, 6, 32, 3], [4, 3, 64, 6, 128, 6, 32, 3]];

Tetras = (function() {
    function Tetras() {}

    Tetras.vertices = [];

    Tetras.indices = [];

    Tetras.points = [];

    Tetras.renderScene = function(scene) {
        var geometry, i, j, k, l, material, mesh;
        material = new MeshStandardMaterial({
            metalness: 0.5,
            roughness: 0.5,
            flatShading: true
        });
        this.vertices = [];
        this.indices = [];
        this.points = [];
        if (false) {
            this.debugGrid(scene);
        }
        for (i = k = 0; k <= 15; i = ++k) {
            for (j = l = 0; l <= 15; j = ++l) {
                this.addCube(i + j * 16, i * 2, 0, j * 2);
            }
        }
        geometry = new BufferGeometry();
        geometry.setIndex(this.indices);
        geometry.setAttribute('position', new Float32BufferAttribute(this.vertices, 3));
        mesh = new Mesh(geometry, material);
        return scene.add(mesh);
    };

    Tetras.addCube = function(cubeIndex, x, y, z) {
        this.indices = this.indices.concat(this.cube(cubeIndex).map((function(_this) {
            return function(idx) {
                return idx + _this.vertices.length / 3;
            };
        })(this)));
        return this.vertices = this.vertices.concat(this.cubeVertices(x, y, z));
    };

    Tetras.cubeVertices = function(x0, y0, z0) {
        var j, k, len, ref1, v, x1, xh, y1, yh, z1, zh;
        v = [];
        xh = x0 + 0.5;
        x1 = x0 + 1.0;
        yh = y0 + 0.5;
        y1 = y0 + 1.0;
        zh = z0 + 0.5;
        z1 = z0 + 1.0;
        v.push(x0, yh, z0, x1, yh, z0, x0, yh, z1, x1, yh, z1);
        ref1 = [0.5, 1.0, 0.0];
        for (k = 0, len = ref1.length; k < len; k++) {
            j = ref1[k];
            v.push(xh, y0 + j, zh, xh, y0 + j, z0, x1, y0 + j, zh, xh, y0 + j, z1, x0, y0 + j, zh);
        }
        return v;
    };

    Tetras.cube = function(index) {
        var i, indices, k, l, r, t, ti;
        indices = [];
        for (ti = k = 0; k <= 5; ti = ++k) {
            t = CUBE[ti];
            r = 0;
            for (i = l = 0; l <= 6; i = l += 2) {
                r |= ((index & t[i]) << 1) >> t[i + 1];
            }
            if (r && r !== 0xf) {
                indices = indices.concat(this.tetra(ti, r));
            }
        }
        return indices;
    };

    Tetras.tetra = function(tetra, io) {
        var a, ref1, ref2;
        if (io <= 7) {
            return TETRA[tetra][io - 1];
        } else {
            a = _.clone(TETRA[tetra][14 - io]);
            ref1 = [a[2], a[1]], a[1] = ref1[0], a[2] = ref1[1];
            if (a.length > 3) {
                ref2 = [a[5], a[4]], a[4] = ref2[0], a[5] = ref2[1];
            }
            return a;
        }
    };

    Tetras.debugGrid = function(scene) {
        var cubevert, frame, geometry, i, j, k, l, line, pmat, tetraind;
        cubevert = [0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1];
        tetraind = [0, 1, 5, 1, 0, 2, 5, 2, 0, 2, 5, 1, 4, 0, 5, 0, 4, 2, 2, 5, 0, 5, 2, 4, 4, 6, 2, 6, 4, 5, 5, 2, 6, 2, 5, 4, 1, 3, 5, 3, 1, 2, 2, 5, 3, 5, 2, 1, 3, 7, 5, 7, 3, 2, 5, 2, 3, 2, 5, 7, 6, 7, 2, 7, 6, 5, 2, 5, 6, 5, 2, 7];
        frame = function(x, y, z) {
            return [x, y, z, x + 1, y, z, x, y + 1, z, x + 1, y + 1, z, x, y, z + 1, x + 1, y, z + 1, x, y + 1, z + 1, x + 1, y + 1, z + 1];
        };
        for (i = k = 0; k <= 15; i = ++k) {
            for (j = l = 0; l <= 15; j = ++l) {
                this.indices = this.indices.concat(tetraind.map((function(_this) {
                    return function(idx) {
                        return idx + _this.vertices.length / 3;
                    };
                })(this)));
                this.vertices = this.vertices.concat(frame(i * 2, 0, j * 2));
                if ((i + j * 16) & 1) {
                    this.points.push(i * 2, 0, j * 2);
                }
                if ((i + j * 16) & 2) {
                    this.points.push(i * 2 + 1, 0, j * 2);
                }
                if ((i + j * 16) & 4) {
                    this.points.push(i * 2, 1, j * 2);
                }
                if ((i + j * 16) & 8) {
                    this.points.push(i * 2 + 1, 1, j * 2);
                }
                if ((i + j * 16) & 16) {
                    this.points.push(i * 2, 0, j * 2 + 1);
                }
                if ((i + j * 16) & 32) {
                    this.points.push(i * 2 + 1, 0, j * 2 + 1);
                }
                if ((i + j * 16) & 64) {
                    this.points.push(i * 2, 1, j * 2 + 1);
                }
                if ((i + j * 16) & 128) {
                    this.points.push(i * 2 + 1, 1, j * 2 + 1);
                }
            }
        }
        geometry = new BufferGeometry();
        geometry.setIndex(this.indices);
        geometry.setAttribute('position', new Float32BufferAttribute(this.vertices, 3));
        geometry.setAttribute('color', new Float32BufferAttribute(this.vertices, 3));
        line = new LineSegments(new WireframeGeometry(geometry));
        line.material.depthTest = false;
        line.material.opacity = 0.05;
        line.material.transparent = true;
        scene.add(line);
        geometry = new BufferGeometry();
        geometry.setAttribute('position', new Float32BufferAttribute(this.points, 3));
        pmat = new PointsMaterial({
            color: 0xffff88
        });
        pmat.size = 0.1;
        pmat.depthTest = false;
        pmat.opacity = 0.5;
        pmat.transparent = true;
        scene.add(new Points(geometry, pmat));
        this.vertices = [];
        return this.indices = [];
    };

    return Tetras;

})();

module.exports = Tetras;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV0cmFzLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsidGV0cmFzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRRSxJQUFNLE9BQUEsQ0FBUSxLQUFSOztBQUNSLE1BQWtJLE9BQUEsQ0FBUSxPQUFSLENBQWxJLEVBQUUsbUNBQUYsRUFBa0IsbURBQWxCLEVBQTBDLCtCQUExQyxFQUF3RCxlQUF4RCxFQUE4RCwrQ0FBOUQsRUFBb0YsbUJBQXBGLEVBQTRGLG1DQUE1RixFQUE0Rzs7QUFFNUcsS0FBQSxHQUFRLENBQ0osQ0FBRSxDQUFDLENBQUQsRUFBRyxDQUFILEVBQUssQ0FBTCxDQUFGLEVBQVUsQ0FBQyxDQUFELEVBQUcsRUFBSCxFQUFNLEVBQU4sQ0FBVixFQUFvQixDQUFDLENBQUQsRUFBRyxFQUFILEVBQU0sRUFBTixFQUFTLENBQVQsRUFBVyxFQUFYLEVBQWMsQ0FBZCxDQUFwQixFQUFxQyxDQUFDLENBQUQsRUFBRyxFQUFILEVBQU0sRUFBTixDQUFyQyxFQUErQyxDQUFDLENBQUQsRUFBRyxFQUFILEVBQU0sRUFBTixFQUFTLENBQVQsRUFBVyxDQUFYLEVBQWEsRUFBYixDQUEvQyxFQUFnRSxDQUFDLENBQUQsRUFBRyxFQUFILEVBQU0sRUFBTixFQUFTLENBQVQsRUFBVyxDQUFYLEVBQWEsRUFBYixDQUFoRSxFQUFpRixDQUFDLENBQUQsRUFBRyxFQUFILEVBQU0sRUFBTixDQUFqRixDQURJLEVBRUosQ0FBRSxDQUFDLENBQUQsRUFBRyxDQUFILEVBQUssQ0FBTCxDQUFGLEVBQVUsQ0FBQyxDQUFELEVBQUcsRUFBSCxFQUFNLEVBQU4sQ0FBVixFQUFvQixDQUFDLENBQUQsRUFBRyxFQUFILEVBQU0sRUFBTixFQUFTLENBQVQsRUFBVyxFQUFYLEVBQWMsQ0FBZCxDQUFwQixFQUFxQyxDQUFDLENBQUQsRUFBRyxFQUFILEVBQU0sRUFBTixDQUFyQyxFQUErQyxDQUFDLENBQUQsRUFBRyxFQUFILEVBQU0sRUFBTixFQUFTLENBQVQsRUFBVyxDQUFYLEVBQWEsRUFBYixDQUEvQyxFQUFnRSxDQUFDLENBQUQsRUFBRyxFQUFILEVBQU0sRUFBTixFQUFTLENBQVQsRUFBVyxFQUFYLEVBQWMsQ0FBZCxDQUFoRSxFQUFpRixDQUFDLENBQUQsRUFBRyxFQUFILEVBQU0sRUFBTixDQUFqRixDQUZJLEVBR0osQ0FBRSxDQUFDLENBQUQsRUFBRyxFQUFILEVBQU0sQ0FBTixDQUFGLEVBQVcsQ0FBQyxDQUFELEVBQUcsRUFBSCxFQUFNLENBQU4sQ0FBWCxFQUFvQixDQUFDLENBQUQsRUFBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsRUFBUyxDQUFULEVBQVcsQ0FBWCxDQUFwQixFQUFrQyxDQUFDLENBQUQsRUFBRyxFQUFILEVBQU0sQ0FBTixDQUFsQyxFQUEyQyxDQUFDLEVBQUQsRUFBSSxFQUFKLEVBQU8sQ0FBUCxFQUFTLEVBQVQsRUFBWSxDQUFaLEVBQWMsRUFBZCxDQUEzQyxFQUE2RCxDQUFDLENBQUQsRUFBRyxFQUFILEVBQU0sQ0FBTixFQUFRLENBQVIsRUFBVSxDQUFWLEVBQVksRUFBWixDQUE3RCxFQUE2RSxDQUFDLENBQUQsRUFBRyxDQUFILEVBQUssRUFBTCxDQUE3RSxDQUhJLEVBSUosQ0FBRSxDQUFDLENBQUQsRUFBRyxDQUFILEVBQUssRUFBTCxDQUFGLEVBQVcsQ0FBQyxDQUFELEVBQUcsQ0FBSCxFQUFLLEVBQUwsQ0FBWCxFQUFvQixDQUFDLENBQUQsRUFBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsRUFBUyxDQUFULEVBQVcsQ0FBWCxDQUFwQixFQUFrQyxDQUFDLENBQUQsRUFBRyxDQUFILEVBQUssRUFBTCxDQUFsQyxFQUEyQyxDQUFDLENBQUQsRUFBRyxFQUFILEVBQU0sQ0FBTixFQUFRLENBQVIsRUFBVSxDQUFWLEVBQVksRUFBWixDQUEzQyxFQUEyRCxDQUFDLENBQUQsRUFBRyxFQUFILEVBQU0sQ0FBTixFQUFRLENBQVIsRUFBVSxDQUFWLEVBQVksRUFBWixDQUEzRCxFQUEyRSxDQUFDLENBQUQsRUFBRyxDQUFILEVBQUssRUFBTCxDQUEzRSxDQUpJLEVBS0osQ0FBRSxDQUFDLENBQUQsRUFBRyxFQUFILEVBQU0sQ0FBTixDQUFGLEVBQVcsQ0FBQyxDQUFELEVBQUcsRUFBSCxFQUFNLEVBQU4sQ0FBWCxFQUFxQixDQUFDLENBQUQsRUFBRyxDQUFILEVBQUssRUFBTCxFQUFRLENBQVIsRUFBVSxFQUFWLEVBQWEsQ0FBYixDQUFyQixFQUFxQyxDQUFDLENBQUQsRUFBRyxDQUFILEVBQUssRUFBTCxDQUFyQyxFQUE4QyxDQUFDLENBQUQsRUFBRyxFQUFILEVBQU0sRUFBTixFQUFTLENBQVQsRUFBVyxFQUFYLEVBQWMsQ0FBZCxDQUE5QyxFQUErRCxDQUFDLENBQUQsRUFBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsRUFBUyxDQUFULEVBQVcsRUFBWCxDQUEvRCxFQUE4RSxDQUFDLENBQUQsRUFBRyxDQUFILEVBQUssQ0FBTCxDQUE5RSxDQUxJLEVBTUosQ0FBRSxDQUFDLENBQUQsRUFBRyxDQUFILEVBQUssRUFBTCxDQUFGLEVBQVcsQ0FBQyxDQUFELEVBQUcsRUFBSCxFQUFNLEVBQU4sQ0FBWCxFQUFxQixDQUFDLENBQUQsRUFBRyxDQUFILEVBQUssRUFBTCxFQUFRLENBQVIsRUFBVSxFQUFWLEVBQWEsQ0FBYixDQUFyQixFQUFxQyxDQUFDLENBQUQsRUFBRyxFQUFILEVBQU0sQ0FBTixDQUFyQyxFQUE4QyxDQUFDLENBQUQsRUFBRyxDQUFILEVBQUssRUFBTCxFQUFRLENBQVIsRUFBVSxFQUFWLEVBQWEsRUFBYixDQUE5QyxFQUErRCxDQUFDLENBQUQsRUFBRyxDQUFILEVBQUssQ0FBTCxFQUFPLENBQVAsRUFBUyxDQUFULEVBQVcsRUFBWCxDQUEvRCxFQUE4RSxDQUFDLENBQUQsRUFBRyxDQUFILEVBQUssQ0FBTCxDQUE5RSxDQU5JOztBQVNSLElBQUEsR0FBTyxDQUNILENBQUMsQ0FBRCxFQUFHLENBQUgsRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFlLENBQWYsRUFBaUIsQ0FBakIsRUFBb0IsRUFBcEIsRUFBdUIsQ0FBdkIsQ0FERyxFQUN1QixDQUFDLENBQUQsRUFBRyxDQUFILEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYyxFQUFkLEVBQWlCLENBQWpCLEVBQW9CLEVBQXBCLEVBQXVCLENBQXZCLENBRHZCLEVBQ2lELENBQUMsQ0FBRCxFQUFHLENBQUgsRUFBTSxFQUFOLEVBQVUsQ0FBVixFQUFjLEVBQWQsRUFBaUIsQ0FBakIsRUFBb0IsRUFBcEIsRUFBdUIsQ0FBdkIsQ0FEakQsRUFFSCxDQUFDLENBQUQsRUFBRyxDQUFILEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBZSxDQUFmLEVBQWlCLENBQWpCLEVBQW9CLEVBQXBCLEVBQXVCLENBQXZCLENBRkcsRUFFdUIsQ0FBQyxDQUFELEVBQUcsQ0FBSCxFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsR0FBYixFQUFpQixDQUFqQixFQUFvQixFQUFwQixFQUF1QixDQUF2QixDQUZ2QixFQUVpRCxDQUFDLENBQUQsRUFBRyxDQUFILEVBQU0sRUFBTixFQUFVLENBQVYsRUFBYSxHQUFiLEVBQWlCLENBQWpCLEVBQW9CLEVBQXBCLEVBQXVCLENBQXZCLENBRmpEOztBQUtEOzs7SUFFRixNQUFDLENBQUEsUUFBRCxHQUFZOztJQUNaLE1BQUMsQ0FBQSxPQUFELEdBQVk7O0lBQ1osTUFBQyxDQUFBLE1BQUQsR0FBWTs7SUFRWixNQUFDLENBQUEsV0FBRCxHQUFjLFNBQUMsS0FBRDtBQUVWLFlBQUE7UUFBQSxRQUFBLEdBQVcsSUFBSSxvQkFBSixDQUNQO1lBQUEsU0FBQSxFQUFjLEdBQWQ7WUFDQSxTQUFBLEVBQWMsR0FEZDtZQUVBLFdBQUEsRUFBYyxJQUZkO1NBRE87UUFNWCxJQUFDLENBQUEsUUFBRCxHQUFZO1FBQ1osSUFBQyxDQUFBLE9BQUQsR0FBWTtRQUNaLElBQUMsQ0FBQSxNQUFELEdBQVk7UUFFWixJQUFHLEtBQUg7WUFBYyxJQUFDLENBQUEsU0FBRCxDQUFXLEtBQVgsRUFBZDs7QUFFQSxhQUFTLDJCQUFUO0FBQ0ksaUJBQVMsMkJBQVQ7Z0JBQ0ksSUFBQyxDQUFBLE9BQUQsQ0FBUyxDQUFBLEdBQUUsQ0FBQSxHQUFFLEVBQWIsRUFBaUIsQ0FBQSxHQUFFLENBQW5CLEVBQXNCLENBQXRCLEVBQXlCLENBQUEsR0FBRSxDQUEzQjtBQURKO0FBREo7UUFJQSxRQUFBLEdBQVcsSUFBSSxjQUFKLENBQUE7UUFDWCxRQUFRLENBQUMsUUFBVCxDQUFrQixJQUFDLENBQUEsT0FBbkI7UUFDQSxRQUFRLENBQUMsWUFBVCxDQUFzQixVQUF0QixFQUFpQyxJQUFJLHNCQUFKLENBQTJCLElBQUMsQ0FBQSxRQUE1QixFQUFzQyxDQUF0QyxDQUFqQztRQUVBLElBQUEsR0FBTyxJQUFJLElBQUosQ0FBUyxRQUFULEVBQW1CLFFBQW5CO2VBRVAsS0FBSyxDQUFDLEdBQU4sQ0FBVSxJQUFWO0lBeEJVOztJQWdDZCxNQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsU0FBRCxFQUFZLENBQVosRUFBZSxDQUFmLEVBQWtCLENBQWxCO1FBRU4sSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsQ0FBZ0IsSUFBQyxDQUFBLElBQUQsQ0FBTSxTQUFOLENBQWdCLENBQUMsR0FBakIsQ0FBcUIsQ0FBQSxTQUFBLEtBQUE7bUJBQUEsU0FBQyxHQUFEO3VCQUFTLEdBQUEsR0FBSSxLQUFDLENBQUEsUUFBUSxDQUFDLE1BQVYsR0FBaUI7WUFBOUI7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXJCLENBQWhCO2VBQ1gsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVYsQ0FBaUIsSUFBQyxDQUFBLFlBQUQsQ0FBYyxDQUFkLEVBQWdCLENBQWhCLEVBQWtCLENBQWxCLENBQWpCO0lBSE47O0lBS1YsTUFBQyxDQUFBLFlBQUQsR0FBZSxTQUFDLEVBQUQsRUFBSyxFQUFMLEVBQVMsRUFBVDtBQUNYLFlBQUE7UUFBQSxDQUFBLEdBQUk7UUFDSixFQUFBLEdBQUssRUFBQSxHQUFHO1FBQUssRUFBQSxHQUFLLEVBQUEsR0FBRztRQUNyQixFQUFBLEdBQUssRUFBQSxHQUFHO1FBQUssRUFBQSxHQUFLLEVBQUEsR0FBRztRQUNyQixFQUFBLEdBQUssRUFBQSxHQUFHO1FBQUssRUFBQSxHQUFLLEVBQUEsR0FBRztRQUNyQixDQUFDLENBQUMsSUFBRixDQUFPLEVBQVAsRUFBVSxFQUFWLEVBQWEsRUFBYixFQUFrQixFQUFsQixFQUFxQixFQUFyQixFQUF3QixFQUF4QixFQUE2QixFQUE3QixFQUFnQyxFQUFoQyxFQUFtQyxFQUFuQyxFQUF3QyxFQUF4QyxFQUEyQyxFQUEzQyxFQUE4QyxFQUE5QztBQUNBO0FBQUEsYUFBQSxzQ0FBQTs7WUFDSSxDQUFDLENBQUMsSUFBRixDQUFPLEVBQVAsRUFBVSxFQUFBLEdBQUcsQ0FBYixFQUFlLEVBQWYsRUFBbUIsRUFBbkIsRUFBc0IsRUFBQSxHQUFHLENBQXpCLEVBQTJCLEVBQTNCLEVBQStCLEVBQS9CLEVBQWtDLEVBQUEsR0FBRyxDQUFyQyxFQUF1QyxFQUF2QyxFQUEyQyxFQUEzQyxFQUE4QyxFQUFBLEdBQUcsQ0FBakQsRUFBbUQsRUFBbkQsRUFBdUQsRUFBdkQsRUFBMEQsRUFBQSxHQUFHLENBQTdELEVBQStELEVBQS9EO0FBREo7ZUFFQTtJQVJXOztJQVVmLE1BQUMsQ0FBQSxJQUFELEdBQU8sU0FBQyxLQUFEO0FBRUgsWUFBQTtRQUFBLE9BQUEsR0FBVTtBQUNWLGFBQVUsNEJBQVY7WUFDSSxDQUFBLEdBQUksSUFBSyxDQUFBLEVBQUE7WUFDVCxDQUFBLEdBQUk7QUFDSixpQkFBUyw2QkFBVDtnQkFDSSxDQUFBLElBQUssQ0FBQyxDQUFDLEtBQUEsR0FBUSxDQUFFLENBQUEsQ0FBQSxDQUFYLENBQUEsSUFBa0IsQ0FBbkIsQ0FBQSxJQUF5QixDQUFFLENBQUEsQ0FBQSxHQUFFLENBQUY7QUFEcEM7WUFFQSxJQUFHLENBQUEsSUFBTSxDQUFBLEtBQUssR0FBZDtnQkFDSSxPQUFBLEdBQVUsT0FBTyxDQUFDLE1BQVIsQ0FBZSxJQUFDLENBQUEsS0FBRCxDQUFPLEVBQVAsRUFBVyxDQUFYLENBQWYsRUFEZDs7QUFMSjtlQVFBO0lBWEc7O0lBbUJQLE1BQUMsQ0FBQSxLQUFELEdBQVEsU0FBQyxLQUFELEVBQVEsRUFBUjtBQUNKLFlBQUE7UUFBQSxJQUFHLEVBQUEsSUFBTSxDQUFUO21CQUNJLEtBQU0sQ0FBQSxLQUFBLENBQU8sQ0FBQSxFQUFBLEdBQUcsQ0FBSCxFQURqQjtTQUFBLE1BQUE7WUFHSSxDQUFBLEdBQUksQ0FBQyxDQUFDLEtBQUYsQ0FBUSxLQUFNLENBQUEsS0FBQSxDQUFPLENBQUEsRUFBQSxHQUFHLEVBQUgsQ0FBckI7WUFDSixPQUFjLENBQUMsQ0FBRSxDQUFBLENBQUEsQ0FBSCxFQUFNLENBQUUsQ0FBQSxDQUFBLENBQVIsQ0FBZCxFQUFDLENBQUUsQ0FBQSxDQUFBLFdBQUgsRUFBTSxDQUFFLENBQUEsQ0FBQTtZQUNSLElBQUcsQ0FBQyxDQUFDLE1BQUYsR0FBVyxDQUFkO2dCQUFxQixPQUFjLENBQUMsQ0FBRSxDQUFBLENBQUEsQ0FBSCxFQUFNLENBQUUsQ0FBQSxDQUFBLENBQVIsQ0FBZCxFQUFDLENBQUUsQ0FBQSxDQUFBLFdBQUgsRUFBTSxDQUFFLENBQUEsQ0FBQSxZQUE3Qjs7bUJBQ0EsRUFOSjs7SUFESTs7SUFlUixNQUFDLENBQUEsU0FBRCxHQUFZLFNBQUMsS0FBRDtBQUVSLFlBQUE7UUFBQSxRQUFBLEdBQVcsQ0FFUCxDQUZPLEVBRUwsQ0FGSyxFQUVILENBRkcsRUFFQSxDQUZBLEVBRUUsQ0FGRixFQUVJLENBRkosRUFFTyxDQUZQLEVBRVMsQ0FGVCxFQUVXLENBRlgsRUFFYyxDQUZkLEVBRWdCLENBRmhCLEVBRWtCLENBRmxCLEVBRXFCLENBRnJCLEVBRXVCLENBRnZCLEVBRXlCLENBRnpCLEVBRTRCLENBRjVCLEVBRThCLENBRjlCLEVBRWdDLENBRmhDLEVBRW1DLENBRm5DLEVBRXFDLENBRnJDLEVBRXVDLENBRnZDLEVBRTBDLENBRjFDLEVBRTRDLENBRjVDLEVBRThDLENBRjlDO1FBS1gsUUFBQSxHQUFXLENBQ1AsQ0FETyxFQUNMLENBREssRUFDSCxDQURHLEVBQ0EsQ0FEQSxFQUNFLENBREYsRUFDSSxDQURKLEVBQ08sQ0FEUCxFQUNTLENBRFQsRUFDVyxDQURYLEVBQ2MsQ0FEZCxFQUNnQixDQURoQixFQUNrQixDQURsQixFQUVQLENBRk8sRUFFTCxDQUZLLEVBRUgsQ0FGRyxFQUVBLENBRkEsRUFFRSxDQUZGLEVBRUksQ0FGSixFQUVPLENBRlAsRUFFUyxDQUZULEVBRVcsQ0FGWCxFQUVjLENBRmQsRUFFZ0IsQ0FGaEIsRUFFa0IsQ0FGbEIsRUFHUCxDQUhPLEVBR0wsQ0FISyxFQUdILENBSEcsRUFHQSxDQUhBLEVBR0UsQ0FIRixFQUdJLENBSEosRUFHTyxDQUhQLEVBR1MsQ0FIVCxFQUdXLENBSFgsRUFHYyxDQUhkLEVBR2dCLENBSGhCLEVBR2tCLENBSGxCLEVBS1AsQ0FMTyxFQUtMLENBTEssRUFLSCxDQUxHLEVBS0EsQ0FMQSxFQUtFLENBTEYsRUFLSSxDQUxKLEVBS08sQ0FMUCxFQUtTLENBTFQsRUFLVyxDQUxYLEVBS2MsQ0FMZCxFQUtnQixDQUxoQixFQUtrQixDQUxsQixFQU1QLENBTk8sRUFNTCxDQU5LLEVBTUgsQ0FORyxFQU1BLENBTkEsRUFNRSxDQU5GLEVBTUksQ0FOSixFQU1PLENBTlAsRUFNUyxDQU5ULEVBTVcsQ0FOWCxFQU1jLENBTmQsRUFNZ0IsQ0FOaEIsRUFNa0IsQ0FObEIsRUFPUCxDQVBPLEVBT0wsQ0FQSyxFQU9ILENBUEcsRUFPQSxDQVBBLEVBT0UsQ0FQRixFQU9JLENBUEosRUFPTyxDQVBQLEVBT1MsQ0FQVCxFQU9XLENBUFgsRUFPYyxDQVBkLEVBT2dCLENBUGhCLEVBT2tCLENBUGxCO1FBVVgsS0FBQSxHQUFRLFNBQUMsQ0FBRCxFQUFHLENBQUgsRUFBSyxDQUFMO21CQUFXLENBQUMsQ0FBRCxFQUFHLENBQUgsRUFBSyxDQUFMLEVBQVEsQ0FBQSxHQUFFLENBQVYsRUFBWSxDQUFaLEVBQWMsQ0FBZCxFQUFpQixDQUFqQixFQUFtQixDQUFBLEdBQUUsQ0FBckIsRUFBdUIsQ0FBdkIsRUFBMEIsQ0FBQSxHQUFFLENBQTVCLEVBQThCLENBQUEsR0FBRSxDQUFoQyxFQUFrQyxDQUFsQyxFQUFxQyxDQUFyQyxFQUF1QyxDQUF2QyxFQUF5QyxDQUFBLEdBQUUsQ0FBM0MsRUFBOEMsQ0FBQSxHQUFFLENBQWhELEVBQWtELENBQWxELEVBQW9ELENBQUEsR0FBRSxDQUF0RCxFQUF5RCxDQUF6RCxFQUEyRCxDQUFBLEdBQUUsQ0FBN0QsRUFBK0QsQ0FBQSxHQUFFLENBQWpFLEVBQW9FLENBQUEsR0FBRSxDQUF0RSxFQUF3RSxDQUFBLEdBQUUsQ0FBMUUsRUFBNEUsQ0FBQSxHQUFFLENBQTlFO1FBQVg7QUFFUixhQUFTLDJCQUFUO0FBQ0ksaUJBQVMsMkJBQVQ7Z0JBQ0ksSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsQ0FBZ0IsUUFBUSxDQUFDLEdBQVQsQ0FBYSxDQUFBLFNBQUEsS0FBQTsyQkFBQSxTQUFDLEdBQUQ7K0JBQVMsR0FBQSxHQUFJLEtBQUMsQ0FBQSxRQUFRLENBQUMsTUFBVixHQUFpQjtvQkFBOUI7Z0JBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFiLENBQWhCO2dCQUNYLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLENBQWlCLEtBQUEsQ0FBTSxDQUFBLEdBQUUsQ0FBUixFQUFZLENBQVosRUFBYyxDQUFBLEdBQUUsQ0FBaEIsQ0FBakI7Z0JBQ1osSUFBRyxDQUFDLENBQUEsR0FBRSxDQUFBLEdBQUUsRUFBTCxDQUFBLEdBQVMsQ0FBWjtvQkFBcUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLENBQWEsQ0FBQSxHQUFFLENBQWYsRUFBbUIsQ0FBbkIsRUFBcUIsQ0FBQSxHQUFFLENBQXZCLEVBQXJCOztnQkFDQSxJQUFHLENBQUMsQ0FBQSxHQUFFLENBQUEsR0FBRSxFQUFMLENBQUEsR0FBUyxDQUFaO29CQUFxQixJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBYSxDQUFBLEdBQUUsQ0FBRixHQUFJLENBQWpCLEVBQW1CLENBQW5CLEVBQXFCLENBQUEsR0FBRSxDQUF2QixFQUFyQjs7Z0JBQ0EsSUFBRyxDQUFDLENBQUEsR0FBRSxDQUFBLEdBQUUsRUFBTCxDQUFBLEdBQVMsQ0FBWjtvQkFBcUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLENBQWEsQ0FBQSxHQUFFLENBQWYsRUFBbUIsQ0FBbkIsRUFBcUIsQ0FBQSxHQUFFLENBQXZCLEVBQXJCOztnQkFDQSxJQUFHLENBQUMsQ0FBQSxHQUFFLENBQUEsR0FBRSxFQUFMLENBQUEsR0FBUyxDQUFaO29CQUFxQixJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBYSxDQUFBLEdBQUUsQ0FBRixHQUFJLENBQWpCLEVBQW1CLENBQW5CLEVBQXFCLENBQUEsR0FBRSxDQUF2QixFQUFyQjs7Z0JBQ0EsSUFBRyxDQUFDLENBQUEsR0FBRSxDQUFBLEdBQUUsRUFBTCxDQUFBLEdBQVMsRUFBWjtvQkFBcUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLENBQWEsQ0FBQSxHQUFFLENBQWYsRUFBbUIsQ0FBbkIsRUFBcUIsQ0FBQSxHQUFFLENBQUYsR0FBSSxDQUF6QixFQUFyQjs7Z0JBQ0EsSUFBRyxDQUFDLENBQUEsR0FBRSxDQUFBLEdBQUUsRUFBTCxDQUFBLEdBQVMsRUFBWjtvQkFBcUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLENBQWEsQ0FBQSxHQUFFLENBQUYsR0FBSSxDQUFqQixFQUFtQixDQUFuQixFQUFxQixDQUFBLEdBQUUsQ0FBRixHQUFJLENBQXpCLEVBQXJCOztnQkFDQSxJQUFHLENBQUMsQ0FBQSxHQUFFLENBQUEsR0FBRSxFQUFMLENBQUEsR0FBUyxFQUFaO29CQUFxQixJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBYSxDQUFBLEdBQUUsQ0FBZixFQUFtQixDQUFuQixFQUFxQixDQUFBLEdBQUUsQ0FBRixHQUFJLENBQXpCLEVBQXJCOztnQkFDQSxJQUFHLENBQUMsQ0FBQSxHQUFFLENBQUEsR0FBRSxFQUFMLENBQUEsR0FBUyxHQUFaO29CQUFxQixJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBYSxDQUFBLEdBQUUsQ0FBRixHQUFJLENBQWpCLEVBQW1CLENBQW5CLEVBQXFCLENBQUEsR0FBRSxDQUFGLEdBQUksQ0FBekIsRUFBckI7O0FBVko7QUFESjtRQWFBLFFBQUEsR0FBVyxJQUFJLGNBQUosQ0FBQTtRQUNYLFFBQVEsQ0FBQyxRQUFULENBQWtCLElBQUMsQ0FBQSxPQUFuQjtRQUNBLFFBQVEsQ0FBQyxZQUFULENBQXNCLFVBQXRCLEVBQWlDLElBQUksc0JBQUosQ0FBMkIsSUFBQyxDQUFBLFFBQTVCLEVBQXNDLENBQXRDLENBQWpDO1FBQ0EsUUFBUSxDQUFDLFlBQVQsQ0FBc0IsT0FBdEIsRUFBaUMsSUFBSSxzQkFBSixDQUEyQixJQUFDLENBQUEsUUFBNUIsRUFBc0MsQ0FBdEMsQ0FBakM7UUFFQSxJQUFBLEdBQU8sSUFBSSxZQUFKLENBQWlCLElBQUksaUJBQUosQ0FBc0IsUUFBdEIsQ0FBakI7UUFDUCxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQWQsR0FBNEI7UUFDNUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFkLEdBQTRCO1FBQzVCLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBZCxHQUE0QjtRQUM1QixLQUFLLENBQUMsR0FBTixDQUFVLElBQVY7UUFFQSxRQUFBLEdBQVcsSUFBSSxjQUFKLENBQUE7UUFDWCxRQUFRLENBQUMsWUFBVCxDQUFzQixVQUF0QixFQUFpQyxJQUFJLHNCQUFKLENBQTJCLElBQUMsQ0FBQSxNQUE1QixFQUFvQyxDQUFwQyxDQUFqQztRQUNBLElBQUEsR0FBTyxJQUFJLGNBQUosQ0FBbUI7WUFBQSxLQUFBLEVBQU0sUUFBTjtTQUFuQjtRQUNQLElBQUksQ0FBQyxJQUFMLEdBQW1CO1FBQ25CLElBQUksQ0FBQyxTQUFMLEdBQW1CO1FBQ25CLElBQUksQ0FBQyxPQUFMLEdBQW1CO1FBQ25CLElBQUksQ0FBQyxXQUFMLEdBQW1CO1FBQ25CLEtBQUssQ0FBQyxHQUFOLENBQVUsSUFBSSxNQUFKLENBQVcsUUFBWCxFQUFxQixJQUFyQixDQUFWO1FBRUEsSUFBQyxDQUFBLFFBQUQsR0FBWTtlQUNaLElBQUMsQ0FBQSxPQUFELEdBQVk7SUFyREo7Ozs7OztBQXVEaEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwXG4gICAwMDAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIFxuICAgMDAwICAgICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwMDAwMCBcbiAgIDAwMCAgICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwXG4gICAwMDAgICAgIDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwIFxuIyMjXG5cbnsgXyB9ID0gcmVxdWlyZSAna3hrJ1xueyBCdWZmZXJHZW9tZXRyeSwgRmxvYXQzMkJ1ZmZlckF0dHJpYnV0ZSwgTGluZVNlZ21lbnRzLCBNZXNoLCBNZXNoU3RhbmRhcmRNYXRlcmlhbCwgUG9pbnRzLCBQb2ludHNNYXRlcmlhbCwgV2lyZWZyYW1lR2VvbWV0cnkgfSA9IHJlcXVpcmUgJ3RocmVlJ1xuXG5URVRSQSA9IFtcbiAgICBbIFswIDUgNF0gWzAgMTQgMTVdIFs0IDE0IDE1IDQgMTUgNV0gWzUgMTUgMTZdIFs0IDE1IDE2IDQgMCAxNV0gWzUgMTQgMTYgNSAwIDE0XSBbNCAxNCAxNl0gXVxuICAgIFsgWzAgNCA4XSBbMCAxOCAxNF0gWzggMTggMTQgOCAxNCA0XSBbOCAxNyAxOF0gWzAgMTcgMTggMCA0IDE3XSBbOCAxNyAxNCA4IDE0IDBdIFs0IDE3IDE0XSBdXG4gICAgWyBbNCAxMyA4XSBbMiAxMyA3XSBbNyAyIDggNyA4IDRdIFsyIDE3IDhdIFsxNyAxMyAyIDE3IDQgMTNdIFs3IDE3IDggNyA4IDEzXSBbNCA3IDE3XSBdXG4gICAgWyBbNCA1IDEwXSBbMSA2IDEwXSBbNiA0IDUgNiA1IDFdIFsxIDUgMTZdIFsxIDEwIDQgMSA0IDE2XSBbNiAxMCA1IDYgNSAxNl0gWzYgNCAxNl0gXVxuICAgIFsgWzQgMTAgOV0gWzYgMTEgMTBdIFs0IDYgMTEgNCAxMSA5XSBbMyA5IDExXSBbNCAxMCAxMSA0IDExIDNdIFs2IDMgOSA2IDkgMTBdIFszIDQgNl0gXVxuICAgIFsgWzQgOSAxM10gWzcgMTMgMTJdIFs0IDkgMTIgNCAxMiA3XSBbMyAxMiA5XSBbNCAzIDEyIDQgMTIgMTNdIFs5IDMgNyA5IDcgMTNdIFszIDcgNF0gXVxuXVxuICAgICAgICBcbkNVQkUgPSBbXG4gICAgWzQgMyAgIDEgIDAgICAgMiAwICAzMiAzXSBbNCAzICAgMSAgMCAgIDE2IDMgIDMyIDNdIFs0IDMgIDY0ICA2ICAgMTYgMyAgMzIgM11cbiAgICBbNCAzICAgOCAgMyAgICAyIDAgIDMyIDNdIFs0IDMgICA4ICAzICAxMjggNiAgMzIgM10gWzQgMyAgNjQgIDYgIDEyOCA2ICAzMiAzXSBcbl1cbiAgICAgICAgICAgIFxuY2xhc3MgVGV0cmFzXG4gICAgXG4gICAgQHZlcnRpY2VzID0gW11cbiAgICBAaW5kaWNlcyAgPSBbXSBcbiAgICBAcG9pbnRzICAgPSBbXVxuICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIEByZW5kZXJTY2VuZTogKHNjZW5lKSAtPlxuICAgICAgICBcbiAgICAgICAgbWF0ZXJpYWwgPSBuZXcgTWVzaFN0YW5kYXJkTWF0ZXJpYWwgXG4gICAgICAgICAgICBtZXRhbG5lc3M6ICAgIDAuNVxuICAgICAgICAgICAgcm91Z2huZXNzOiAgICAwLjVcbiAgICAgICAgICAgIGZsYXRTaGFkaW5nOiAgdHJ1ZVxuICAgICAgICAgICAgIyB2ZXJ0ZXhDb2xvcnM6IHRydWVcbiAgICAgICAgICAgIFxuICAgICAgICBAdmVydGljZXMgPSBbXVxuICAgICAgICBAaW5kaWNlcyAgPSBbXSBcbiAgICAgICAgQHBvaW50cyAgID0gW11cbiAgICAgICAgXG4gICAgICAgIGlmIGZhbHNlIHRoZW4gQGRlYnVnR3JpZCBzY2VuZVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGZvciBpIGluIFswLi4xNV1cbiAgICAgICAgICAgIGZvciBqIGluIFswLi4xNV1cbiAgICAgICAgICAgICAgICBAYWRkQ3ViZSBpK2oqMTYsIGkqMiwgMCwgaioyXG4gICAgICAgIFxuICAgICAgICBnZW9tZXRyeSA9IG5ldyBCdWZmZXJHZW9tZXRyeSgpXG4gICAgICAgIGdlb21ldHJ5LnNldEluZGV4IEBpbmRpY2VzXG4gICAgICAgIGdlb21ldHJ5LnNldEF0dHJpYnV0ZSAncG9zaXRpb24nIG5ldyBGbG9hdDMyQnVmZmVyQXR0cmlidXRlIEB2ZXJ0aWNlcywgM1xuICAgICAgICAjIGdlb21ldHJ5LnNldEF0dHJpYnV0ZSAnY29sb3InICAgIG5ldyBGbG9hdDMyQnVmZmVyQXR0cmlidXRlIEB2ZXJ0aWNlcywgM1xuICAgICAgICBtZXNoID0gbmV3IE1lc2ggZ2VvbWV0cnksIG1hdGVyaWFsXG4gICAgICAgIFxuICAgICAgICBzY2VuZS5hZGQgbWVzaFxuICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIFxuICAgIFxuICAgIEBhZGRDdWJlOiAoY3ViZUluZGV4LCB4LCB5LCB6KSAtPlxuICAgICAgICBcbiAgICAgICAgQGluZGljZXMgPSBAaW5kaWNlcy5jb25jYXQgQGN1YmUoY3ViZUluZGV4KS5tYXAgKGlkeCkgPT4gaWR4K0B2ZXJ0aWNlcy5sZW5ndGgvM1xuICAgICAgICBAdmVydGljZXMgPSBAdmVydGljZXMuY29uY2F0IEBjdWJlVmVydGljZXMgeCx5LHpcbiAgICAgICAgICAgICAgICBcbiAgICBAY3ViZVZlcnRpY2VzOiAoeDAsIHkwLCB6MCkgLT5cbiAgICAgICAgdiA9IFtdXG4gICAgICAgIHhoID0geDArMC41OyB4MSA9IHgwKzEuMFxuICAgICAgICB5aCA9IHkwKzAuNTsgeTEgPSB5MCsxLjBcbiAgICAgICAgemggPSB6MCswLjU7IHoxID0gejArMS4wXG4gICAgICAgIHYucHVzaCB4MCx5aCx6MCwgIHgxLHloLHowLCAgeDAseWgsejEsICB4MSx5aCx6MVxuICAgICAgICBmb3IgaiBpbiBbMC41IDEuMCAwLjBdXG4gICAgICAgICAgICB2LnB1c2ggeGgseTAraix6aCwgeGgseTAraix6MCwgeDEseTAraix6aCwgeGgseTAraix6MSwgeDAseTAraix6aFxuICAgICAgICB2XG4gICAgXG4gICAgQGN1YmU6IChpbmRleCkgLT5cbiAgICAgICAgXG4gICAgICAgIGluZGljZXMgPSBbXVxuICAgICAgICBmb3IgdGkgaW4gWzAuLjVdXG4gICAgICAgICAgICB0ID0gQ1VCRVt0aV1cbiAgICAgICAgICAgIHIgPSAwXG4gICAgICAgICAgICBmb3IgaSBpbiBbMC4uNl0gYnkgMlxuICAgICAgICAgICAgICAgIHIgfD0gKChpbmRleCAmIHRbaV0pIDw8IDEpID4+IHRbaSsxXVxuICAgICAgICAgICAgaWYgciBhbmQgciAhPSAwYjExMTFcbiAgICAgICAgICAgICAgICBpbmRpY2VzID0gaW5kaWNlcy5jb25jYXQgQHRldHJhIHRpLCByXG4gICAgICAgIFxuICAgICAgICBpbmRpY2VzXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBAdGV0cmE6ICh0ZXRyYSwgaW8pIC0+XG4gICAgICAgIGlmIGlvIDw9IDdcbiAgICAgICAgICAgIFRFVFJBW3RldHJhXVtpby0xXVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBhID0gXy5jbG9uZSBURVRSQVt0ZXRyYV1bMTQtaW9dXG4gICAgICAgICAgICBbYVsxXSxhWzJdXSA9IFthWzJdLGFbMV1dXG4gICAgICAgICAgICBpZiBhLmxlbmd0aCA+IDMgdGhlbiBbYVs0XSxhWzVdXSA9IFthWzVdLGFbNF1dXG4gICAgICAgICAgICBhXG4gICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIEBkZWJ1Z0dyaWQ6IChzY2VuZSkgLT5cbiAgICAgICAgICAgIFxuICAgICAgICBjdWJldmVydCA9IFtcbiAgICAgICAgICAgICMgICAwICAgICAgMSAgICAgIDIgICAgICAzICAgICAgNCAgICAgIDUgICAgICA2ICAgICAgN1xuICAgICAgICAgICAgMCAwIDAgIDEgMCAwICAwIDEgMCAgMSAxIDAgIDAgMCAxICAxIDAgMSAgMCAxIDEgIDEgMSAxXG4gICAgICAgIF1cbiAgICAgICAgXG4gICAgICAgIHRldHJhaW5kID0gW1xuICAgICAgICAgICAgMCAxIDUgIDEgMCAyICA1IDIgMCAgMiA1IDFcbiAgICAgICAgICAgIDQgMCA1ICAwIDQgMiAgMiA1IDAgIDUgMiA0XG4gICAgICAgICAgICA0IDYgMiAgNiA0IDUgIDUgMiA2ICAyIDUgNCBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgMSAzIDUgIDMgMSAyICAyIDUgMyAgNSAyIDEgIFxuICAgICAgICAgICAgMyA3IDUgIDcgMyAyICA1IDIgMyAgMiA1IDcgIFxuICAgICAgICAgICAgNiA3IDIgIDcgNiA1ICAyIDUgNiAgNSAyIDcgICBcbiAgICAgICAgXVxuICAgICAgICAgIFxuICAgICAgICBmcmFtZSA9ICh4LHkseikgLT4gW3gseSx6LCB4KzEseSx6LCB4LHkrMSx6LCB4KzEseSsxLHosIHgseSx6KzEsIHgrMSx5LHorMSwgeCx5KzEseisxLCB4KzEseSsxLHorMV1cbiAgICAgICAgICAgIFxuICAgICAgICBmb3IgaSBpbiBbMC4uMTVdXG4gICAgICAgICAgICBmb3IgaiBpbiBbMC4uMTVdXG4gICAgICAgICAgICAgICAgQGluZGljZXMgPSBAaW5kaWNlcy5jb25jYXQgdGV0cmFpbmQubWFwIChpZHgpID0+IGlkeCtAdmVydGljZXMubGVuZ3RoLzNcbiAgICAgICAgICAgICAgICBAdmVydGljZXMgPSBAdmVydGljZXMuY29uY2F0IGZyYW1lIGkqMiwgIDAsaioyXG4gICAgICAgICAgICAgICAgaWYgKGkraioxNikmMSAgIHRoZW4gQHBvaW50cy5wdXNoIGkqMiwgIDAsaioyXG4gICAgICAgICAgICAgICAgaWYgKGkraioxNikmMiAgIHRoZW4gQHBvaW50cy5wdXNoIGkqMisxLDAsaioyXG4gICAgICAgICAgICAgICAgaWYgKGkraioxNikmNCAgIHRoZW4gQHBvaW50cy5wdXNoIGkqMiwgIDEsaioyXG4gICAgICAgICAgICAgICAgaWYgKGkraioxNikmOCAgIHRoZW4gQHBvaW50cy5wdXNoIGkqMisxLDEsaioyXG4gICAgICAgICAgICAgICAgaWYgKGkraioxNikmMTYgIHRoZW4gQHBvaW50cy5wdXNoIGkqMiwgIDAsaioyKzFcbiAgICAgICAgICAgICAgICBpZiAoaStqKjE2KSYzMiAgdGhlbiBAcG9pbnRzLnB1c2ggaSoyKzEsMCxqKjIrMVxuICAgICAgICAgICAgICAgIGlmIChpK2oqMTYpJjY0ICB0aGVuIEBwb2ludHMucHVzaCBpKjIsICAxLGoqMisxXG4gICAgICAgICAgICAgICAgaWYgKGkraioxNikmMTI4IHRoZW4gQHBvaW50cy5wdXNoIGkqMisxLDEsaioyKzFcbiAgICBcbiAgICAgICAgZ2VvbWV0cnkgPSBuZXcgQnVmZmVyR2VvbWV0cnkoKVxuICAgICAgICBnZW9tZXRyeS5zZXRJbmRleCBAaW5kaWNlc1xuICAgICAgICBnZW9tZXRyeS5zZXRBdHRyaWJ1dGUgJ3Bvc2l0aW9uJyBuZXcgRmxvYXQzMkJ1ZmZlckF0dHJpYnV0ZSBAdmVydGljZXMsIDNcbiAgICAgICAgZ2VvbWV0cnkuc2V0QXR0cmlidXRlICdjb2xvcicgICAgbmV3IEZsb2F0MzJCdWZmZXJBdHRyaWJ1dGUgQHZlcnRpY2VzLCAzXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGxpbmUgPSBuZXcgTGluZVNlZ21lbnRzIG5ldyBXaXJlZnJhbWVHZW9tZXRyeSBnZW9tZXRyeVxuICAgICAgICBsaW5lLm1hdGVyaWFsLmRlcHRoVGVzdCAgID0gZmFsc2VcbiAgICAgICAgbGluZS5tYXRlcmlhbC5vcGFjaXR5ICAgICA9IDAuMDVcbiAgICAgICAgbGluZS5tYXRlcmlhbC50cmFuc3BhcmVudCA9IHRydWVcbiAgICAgICAgc2NlbmUuYWRkIGxpbmVcbiAgICBcbiAgICAgICAgZ2VvbWV0cnkgPSBuZXcgQnVmZmVyR2VvbWV0cnkoKVxuICAgICAgICBnZW9tZXRyeS5zZXRBdHRyaWJ1dGUgJ3Bvc2l0aW9uJyBuZXcgRmxvYXQzMkJ1ZmZlckF0dHJpYnV0ZSBAcG9pbnRzLCAzXG4gICAgICAgIHBtYXQgPSBuZXcgUG9pbnRzTWF0ZXJpYWwgY29sb3I6MHhmZmZmODhcbiAgICAgICAgcG1hdC5zaXplICAgICAgICA9IDAuMVxuICAgICAgICBwbWF0LmRlcHRoVGVzdCAgID0gZmFsc2VcbiAgICAgICAgcG1hdC5vcGFjaXR5ICAgICA9IDAuNVxuICAgICAgICBwbWF0LnRyYW5zcGFyZW50ID0gdHJ1ZVxuICAgICAgICBzY2VuZS5hZGQgbmV3IFBvaW50cyBnZW9tZXRyeSwgcG1hdFxuICAgIFxuICAgICAgICBAdmVydGljZXMgPSBbXVxuICAgICAgICBAaW5kaWNlcyAgPSBbXSBcbiAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBUZXRyYXNcbiJdfQ==
//# sourceURL=../coffee/tetras.coffee