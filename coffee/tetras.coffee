###
000000000  00000000  000000000  00000000    0000000    0000000
   000     000          000     000   000  000   000  000     
   000     0000000      000     0000000    000000000  0000000 
   000     000          000     000   000  000   000       000
   000     00000000     000     000   000  000   000  0000000 
###

{ klog } = require 'kxk'
{ BufferGeometry, Float32BufferAttribute, LineSegments, Mesh, MeshStandardMaterial, WireframeGeometry } = require 'three'

class Tetras
    
    @renderScene: (scene) ->
        
        material = new MeshStandardMaterial 
            metalness: 0.5
            roughness: 0.5
            flatShading: true
            vertexColors: true
                        
        cubevert = [
            #   0      1      2      3      4      5      6      7
            0 0 0  1 0 0  0 1 0  1 1 0  0 0 1  1 0 1  0 1 1  1 1 1
        ]
        
        tetraind = [
            0 1 5  1 0 2  5 2 0  2 5 1
            4 0 5  0 4 2  2 5 0  5 2 4
            4 6 2  6 4 5  5 2 6  2 5 4 
            
            1 3 5  3 1 2  2 5 3  5 2 1  
            3 7 5  7 3 2  5 2 3  2 5 7  
            6 7 2  7 6 5  2 5 6  5 2 7   
        ]
          
        frame = (x,y,z) -> [x,y,z, x+1,y,z, x,y+1,z, x+1,y+1,z, x,y,z+1, x+1,y,z+1, x,y+1,z+1, x+1,y+1,z+1]
        
        vertices = []
        indices  = [] 
        
        for i in [0..15]
            for j in [0..15]
                indices = indices.concat tetraind.map (idx) -> idx+vertices.length/3
                vertices = vertices.concat frame i*2,0,j*2
                # vertices = vertices.concat cubevert
        
        geometry = new BufferGeometry()
        geometry.setIndex indices
        geometry.setAttribute 'position' new Float32BufferAttribute vertices, 3
        geometry.setAttribute 'color'    new Float32BufferAttribute vertices, 3
        
        # scene.add new Mesh geometry, material
        
        line = new LineSegments new WireframeGeometry geometry
        line.material.depthTest   = false
        line.material.opacity     = 0.5
        line.material.transparent = true
        scene.add line
        
        verts = (x0, y0, z0) ->
            v = []
            xh = x0+0.5; x1 = x0+1.0
            yh = y0+0.5; y1 = y0+1.0
            zh = z0+0.5; z1 = z0+1.0
            v.push x0,yh,z0,  x1,yh,z0,  x0,yh,z1,  x1,yh,z1
            for j in [0.5 1.0 0.0]
                v.push xh, y0+j, zh
                v.push xh, y0+j, z0
                v.push x1, y0+j, zh
                v.push xh, y0+j, z1
                v.push x0, y0+j, zh
            v
            
        vertices = []
        indices  = [] 
        for i in [0..15]
            for j in [0..15]
                cubindx = @cube(i+j*16).map (idx) -> idx+vertices.length/3
                indices = indices.concat cubindx
                vertices = vertices.concat verts i*2,0,j*2
                # vertices = vertices.concat verts 0,0,0
        
        geometry = new BufferGeometry()
        geometry.setIndex indices
        geometry.setAttribute 'position' new Float32BufferAttribute vertices, 3
        geometry.setAttribute 'color'    new Float32BufferAttribute vertices, 3
        mesh = new Mesh geometry, material
        
        scene.add mesh
        
    @cube: (index) ->
        
        tetras = []
        inouts = []
        
        tetra1 = ((index & 4) >> 2) | ((index & 1  ) << 1) | ((index &  2) << 1) | ((index & 32) >> 2)
        tetra2 = ((index & 4) >> 2) | ((index & 1  ) << 1) | ((index & 16) >> 2) | ((index & 32) >> 2)
        tetra3 = ((index & 4) >> 2) | ((index & 128) >> 6) | ((index & 16) >> 2) | ((index & 32) >> 2)
        
        if tetra1 and tetra1 != 0b1111
            tetras.push 0
            inouts.push tetra1

        if tetra2 and tetra2 != 0b1111
            tetras.push 1
            inouts.push tetra2

        if tetra3 and tetra3 != 0b1111
            tetras.push 2
            inouts.push tetra3
            
        indices = []
        for i in [0...tetras.length]
            indices = indices.concat @tetra tetras[i], inouts[i]
            
        indices
            
    @tetra: (tetra, io) ->
        
        
        i = if io > 7 then 14-io else io-1
        a = if true and tetra == 0
            [
                [0   5  4]          
                [0  14 15]          
                [4  14 15  4 15  5] 
                [5  15 16]          
                [4  15 16  4  0 15] 
                [5  14 16  5  0 14] 
                [4  14 16]          
            ][i]
        else if true and tetra == 1
            [
                [0   4  8]          
                [0  18 14]          
                [8  18 14  8 14  4] 
                [8  17 18]          
                [0  17 18  0  4 17] 
                [8  17 14  8 14  0] 
                [4  17 14]          
            ][i]
        else if tetra == 2
            [
                [4  13  8]          
                [2  13  7]          
                [7   2  8   7  8  4] 
                [2  17  8]          
                [17 13  2  17  4 13] 
                [7  17  8   7  8 13] 
                [4  7   17]          
            ][i]
        else
            []
            
        if io > 7
            if a.length > 0 then [a[1], a[2]] = [a[2], a[1]]
            if a.length > 3 then [a[4], a[5]] = [a[5], a[4]]
        a
        
        
module.exports = Tetras
