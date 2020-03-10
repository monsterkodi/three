###
000000000  00000000  000000000  00000000    0000000    0000000
   000     000          000     000   000  000   000  000     
   000     0000000      000     0000000    000000000  0000000 
   000     000          000     000   000  000   000       000
   000     00000000     000     000   000  000   000  0000000 
###

{ colors } = require 'kxk'
{ BufferAttribute, BufferGeometry, LineSegments, Mesh, MeshStandardMaterial, WireframeGeometry } = require 'three'

class Tetras

    @renderScene: (scene) ->
        
        material = new MeshStandardMaterial 
            metalness: 0.5
            roughness: 0.5
            flatShading: true
            vertexColors: true
                        
        geometry = new BufferGeometry()
        vertices = new Float32Array [
            #   0      1      2      3      4      5      6      7
            0 0 0  1 0 0  0 1 0  1 1 0  0 0 1  1 0 1  0 1 1  1 1 1
        ]
        
        indices = [
            0 1 5  1 0 2  5 2 0  2 5 1
            4 0 5  0 4 2  2 5 0  5 2 4
            4 6 2  6 4 5  5 2 6  2 5 4 
            
            1 3 5  3 1 2  2 5 3  5 2 1  
            3 7 5  7 3 2  5 2 3  2 5 7  
            6 7 2  7 6 5  2 5 6  5 2 7   
        ]
        
        geometry.setIndex indices
        geometry.setAttribute 'position' new BufferAttribute vertices, 3
        geometry.setAttribute 'color'    new BufferAttribute vertices, 3
        mesh = new Mesh geometry, material
        
        mesh.castShadow    = true
        mesh.receiveShadow = true
        mesh.name = 'triangles'  
        scene.add mesh
        
        wireframe = new WireframeGeometry geometry
        line = new LineSegments wireframe
        line.material.depthTest = false
        line.material.opacity = 0.5
        line.material.transparent = true
        scene.add line
        
module.exports = Tetras
