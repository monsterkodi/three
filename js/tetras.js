// koffee 1.12.0

/*
000000000  00000000  000000000  00000000    0000000    0000000
   000     000          000     000   000  000   000  000     
   000     0000000      000     0000000    000000000  0000000 
   000     000          000     000   000  000   000       000
   000     00000000     000     000   000  000   000  0000000
 */
var BufferAttribute, BufferGeometry, LineSegments, Mesh, MeshStandardMaterial, Tetras, WireframeGeometry, colors, ref;

colors = require('kxk').colors;

ref = require('three'), BufferAttribute = ref.BufferAttribute, BufferGeometry = ref.BufferGeometry, LineSegments = ref.LineSegments, Mesh = ref.Mesh, MeshStandardMaterial = ref.MeshStandardMaterial, WireframeGeometry = ref.WireframeGeometry;

Tetras = (function() {
    function Tetras() {}

    Tetras.renderScene = function(scene) {
        var geometry, indices, line, material, mesh, vertices, wireframe;
        material = new MeshStandardMaterial({
            metalness: 0.5,
            roughness: 0.5,
            flatShading: true,
            vertexColors: true
        });
        geometry = new BufferGeometry();
        vertices = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1]);
        indices = [0, 1, 5, 1, 0, 2, 5, 2, 0, 2, 5, 1, 3, 0, 5, 0, 3, 2, 2, 5, 0, 5, 2, 3, 3, 6, 2, 6, 3, 5, 5, 2, 6, 2, 5, 3, 4, 5, 1, 1, 2, 4, 5, 4, 2, 2, 1, 5, 7, 5, 4, 4, 2, 7, 2, 4, 5, 5, 7, 2, 7, 2, 6, 6, 5, 7, 5, 6, 2, 2, 7, 5];
        geometry.setIndex(indices);
        geometry.setAttribute('position', new BufferAttribute(vertices, 3));
        geometry.setAttribute('color', new BufferAttribute(vertices, 3));
        mesh = new Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = 'triangles';
        scene.add(mesh);
        wireframe = new WireframeGeometry(geometry);
        line = new LineSegments(wireframe);
        line.material.depthTest = false;
        line.material.opacity = 0.5;
        line.material.transparent = true;
        return scene.add(line);
    };

    return Tetras;

})();

module.exports = Tetras;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV0cmFzLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsidGV0cmFzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRRSxTQUFXLE9BQUEsQ0FBUSxLQUFSOztBQUNiLE1BQW1HLE9BQUEsQ0FBUSxPQUFSLENBQW5HLEVBQUUscUNBQUYsRUFBbUIsbUNBQW5CLEVBQW1DLCtCQUFuQyxFQUFpRCxlQUFqRCxFQUF1RCwrQ0FBdkQsRUFBNkU7O0FBRXZFOzs7SUFFRixNQUFDLENBQUEsV0FBRCxHQUFjLFNBQUMsS0FBRDtBQUVWLFlBQUE7UUFBQSxRQUFBLEdBQVcsSUFBSSxvQkFBSixDQUF5QjtZQUNoQyxTQUFBLEVBQVcsR0FEcUI7WUFFaEMsU0FBQSxFQUFXLEdBRnFCO1lBR2hDLFdBQUEsRUFBYSxJQUhtQjtZQUloQyxZQUFBLEVBQWMsSUFKa0I7U0FBekI7UUFPWCxRQUFBLEdBQVcsSUFBSSxjQUFKLENBQUE7UUFDWCxRQUFBLEdBQVcsSUFBSSxZQUFKLENBQWlCLENBRXhCLENBRndCLEVBRXRCLENBRnNCLEVBRXBCLENBRm9CLEVBRWpCLENBRmlCLEVBRWYsQ0FGZSxFQUViLENBRmEsRUFFVixDQUZVLEVBRVIsQ0FGUSxFQUVOLENBRk0sRUFFSCxDQUZHLEVBRUQsQ0FGQyxFQUVDLENBRkQsRUFFSSxDQUZKLEVBRU0sQ0FGTixFQUVRLENBRlIsRUFFVyxDQUZYLEVBRWEsQ0FGYixFQUVlLENBRmYsRUFFa0IsQ0FGbEIsRUFFb0IsQ0FGcEIsRUFFc0IsQ0FGdEIsRUFFeUIsQ0FGekIsRUFFMkIsQ0FGM0IsRUFFNkIsQ0FGN0IsQ0FBakI7UUFLWCxPQUFBLEdBQVUsQ0FDTixDQURNLEVBQ0osQ0FESSxFQUNGLENBREUsRUFDQyxDQURELEVBQ0csQ0FESCxFQUNLLENBREwsRUFDUSxDQURSLEVBQ1UsQ0FEVixFQUNZLENBRFosRUFDZSxDQURmLEVBQ2lCLENBRGpCLEVBQ21CLENBRG5CLEVBRU4sQ0FGTSxFQUVKLENBRkksRUFFRixDQUZFLEVBRUMsQ0FGRCxFQUVHLENBRkgsRUFFSyxDQUZMLEVBRVEsQ0FGUixFQUVVLENBRlYsRUFFWSxDQUZaLEVBRWUsQ0FGZixFQUVpQixDQUZqQixFQUVtQixDQUZuQixFQUdOLENBSE0sRUFHSixDQUhJLEVBR0YsQ0FIRSxFQUdDLENBSEQsRUFHRyxDQUhILEVBR0ssQ0FITCxFQUdRLENBSFIsRUFHVSxDQUhWLEVBR1ksQ0FIWixFQUdlLENBSGYsRUFHaUIsQ0FIakIsRUFHbUIsQ0FIbkIsRUFLTixDQUxNLEVBS0osQ0FMSSxFQUtGLENBTEUsRUFLQyxDQUxELEVBS0csQ0FMSCxFQUtLLENBTEwsRUFLUSxDQUxSLEVBS1UsQ0FMVixFQUtZLENBTFosRUFLZSxDQUxmLEVBS2lCLENBTGpCLEVBS21CLENBTG5CLEVBTU4sQ0FOTSxFQU1KLENBTkksRUFNRixDQU5FLEVBTUMsQ0FORCxFQU1HLENBTkgsRUFNSyxDQU5MLEVBTVEsQ0FOUixFQU1VLENBTlYsRUFNWSxDQU5aLEVBTWUsQ0FOZixFQU1pQixDQU5qQixFQU1tQixDQU5uQixFQU9OLENBUE0sRUFPSixDQVBJLEVBT0YsQ0FQRSxFQU9DLENBUEQsRUFPRyxDQVBILEVBT0ssQ0FQTCxFQU9RLENBUFIsRUFPVSxDQVBWLEVBT1ksQ0FQWixFQU9lLENBUGYsRUFPaUIsQ0FQakIsRUFPbUIsQ0FQbkI7UUFVVixRQUFRLENBQUMsUUFBVCxDQUFrQixPQUFsQjtRQUNBLFFBQVEsQ0FBQyxZQUFULENBQXNCLFVBQXRCLEVBQWlDLElBQUksZUFBSixDQUFvQixRQUFwQixFQUE4QixDQUE5QixDQUFqQztRQUNBLFFBQVEsQ0FBQyxZQUFULENBQXNCLE9BQXRCLEVBQWlDLElBQUksZUFBSixDQUFvQixRQUFwQixFQUE4QixDQUE5QixDQUFqQztRQUNBLElBQUEsR0FBTyxJQUFJLElBQUosQ0FBUyxRQUFULEVBQW1CLFFBQW5CO1FBRVAsSUFBSSxDQUFDLFVBQUwsR0FBcUI7UUFDckIsSUFBSSxDQUFDLGFBQUwsR0FBcUI7UUFDckIsSUFBSSxDQUFDLElBQUwsR0FBWTtRQUNaLEtBQUssQ0FBQyxHQUFOLENBQVUsSUFBVjtRQUVBLFNBQUEsR0FBWSxJQUFJLGlCQUFKLENBQXNCLFFBQXRCO1FBQ1osSUFBQSxHQUFPLElBQUksWUFBSixDQUFpQixTQUFqQjtRQUNQLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBZCxHQUEwQjtRQUMxQixJQUFJLENBQUMsUUFBUSxDQUFDLE9BQWQsR0FBd0I7UUFDeEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFkLEdBQTRCO2VBQzVCLEtBQUssQ0FBQyxHQUFOLENBQVUsSUFBVjtJQXhDVTs7Ozs7O0FBMENsQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDBcbiAgIDAwMCAgICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgXG4gICAwMDAgICAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAwMDAwIFxuICAgMDAwICAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDBcbiAgIDAwMCAgICAgMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgXG4jIyNcblxueyBjb2xvcnMgfSA9IHJlcXVpcmUgJ2t4aydcbnsgQnVmZmVyQXR0cmlidXRlLCBCdWZmZXJHZW9tZXRyeSwgTGluZVNlZ21lbnRzLCBNZXNoLCBNZXNoU3RhbmRhcmRNYXRlcmlhbCwgV2lyZWZyYW1lR2VvbWV0cnkgfSA9IHJlcXVpcmUgJ3RocmVlJ1xuXG5jbGFzcyBUZXRyYXNcblxuICAgIEByZW5kZXJTY2VuZTogKHNjZW5lKSAtPlxuICAgICAgICBcbiAgICAgICAgbWF0ZXJpYWwgPSBuZXcgTWVzaFN0YW5kYXJkTWF0ZXJpYWwge1xuICAgICAgICAgICAgbWV0YWxuZXNzOiAwLjVcbiAgICAgICAgICAgIHJvdWdobmVzczogMC41XG4gICAgICAgICAgICBmbGF0U2hhZGluZzogdHJ1ZVxuICAgICAgICAgICAgdmVydGV4Q29sb3JzOiB0cnVlXG4gICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBnZW9tZXRyeSA9IG5ldyBCdWZmZXJHZW9tZXRyeSgpXG4gICAgICAgIHZlcnRpY2VzID0gbmV3IEZsb2F0MzJBcnJheSBbXHJcbiAgICAgICAgICAgICMgICAwICAgICAgMSAgICAgIDIgICAgICAzICAgICAgNCAgICAgIDUgICAgICA2ICAgICAgN1xuICAgICAgICAgICAgMCAwIDAgIDEgMCAwICAwIDEgMCAgMCAwIDEgIDEgMSAwICAxIDAgMSAgMCAxIDEgIDEgMSAxXG4gICAgICAgIF1cbiAgICAgICAgXG4gICAgICAgIGluZGljZXMgPSBbXG4gICAgICAgICAgICAwIDEgNSAgMSAwIDIgIDUgMiAwICAyIDUgMVxuICAgICAgICAgICAgMyAwIDUgIDAgMyAyICAyIDUgMCAgNSAyIDNcbiAgICAgICAgICAgIDMgNiAyICA2IDMgNSAgNSAyIDYgIDIgNSAzIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICA0IDUgMSAgMSAyIDQgIDUgNCAyICAyIDEgNSBcbiAgICAgICAgICAgIDcgNSA0ICA0IDIgNyAgMiA0IDUgIDUgNyAyIFxuICAgICAgICAgICAgNyAyIDYgIDYgNSA3ICA1IDYgMiAgMiA3IDUgIFxuICAgICAgICBdXG4gICAgICAgIFxuICAgICAgICBnZW9tZXRyeS5zZXRJbmRleCBpbmRpY2VzXG4gICAgICAgIGdlb21ldHJ5LnNldEF0dHJpYnV0ZSAncG9zaXRpb24nIG5ldyBCdWZmZXJBdHRyaWJ1dGUgdmVydGljZXMsIDNcbiAgICAgICAgZ2VvbWV0cnkuc2V0QXR0cmlidXRlICdjb2xvcicgICAgbmV3IEJ1ZmZlckF0dHJpYnV0ZSB2ZXJ0aWNlcywgM1xuICAgICAgICBtZXNoID0gbmV3IE1lc2ggZ2VvbWV0cnksIG1hdGVyaWFsXG4gICAgICAgIFxuICAgICAgICBtZXNoLmNhc3RTaGFkb3cgICAgPSB0cnVlXG4gICAgICAgIG1lc2gucmVjZWl2ZVNoYWRvdyA9IHRydWVcbiAgICAgICAgbWVzaC5uYW1lID0gJ3RyaWFuZ2xlcycgIFxuICAgICAgICBzY2VuZS5hZGQgbWVzaFxuICAgICAgICBcbiAgICAgICAgd2lyZWZyYW1lID0gbmV3IFdpcmVmcmFtZUdlb21ldHJ5IGdlb21ldHJ5XG4gICAgICAgIGxpbmUgPSBuZXcgTGluZVNlZ21lbnRzIHdpcmVmcmFtZVxuICAgICAgICBsaW5lLm1hdGVyaWFsLmRlcHRoVGVzdCA9IGZhbHNlXG4gICAgICAgIGxpbmUubWF0ZXJpYWwub3BhY2l0eSA9IDAuNVxuICAgICAgICBsaW5lLm1hdGVyaWFsLnRyYW5zcGFyZW50ID0gdHJ1ZVxuICAgICAgICBzY2VuZS5hZGQgbGluZVxuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gVGV0cmFzXG4iXX0=
//# sourceURL=../coffee/tetras.coffee