###
000000000  00000000  000000000  00000000    0000000    0000000
   000     000          000     000   000  000   000  000     
   000     0000000      000     0000000    000000000  0000000 
   000     000          000     000   000  000   000       000
   000     00000000     000     000   000  000   000  0000000 
###

{ klog } = require 'kxk'
{ BufferGeometry, Float32BufferAttribute, LineSegments, Mesh, MeshStandardMaterial, Points, PointsMaterial, WireframeGeometry } = require 'three'

TETRA = [
                [
                    [0 5 4]          
                    [0 14 15]          
                    [4 14 15 4 15 5] 
                    [5 15 16]          
                    [4 15 16 4 0 15] 
                    [5 14 16 5 0 14] 
                    [4 14 16]          
                ],[
                    [0 4 8]          
                    [0 18 14]          
                    [8 18 14 8 14 4] 
                    [8 17 18]          
                    [0 17 18 0 4 17] 
                    [8 17 14 8 14 0] 
                    [4 17 14]          
                ],[
                    [4 13 8]          
                    [2 13 7]          
                    [7 2 8 7 8 4] 
                    [2 17 8]          
                    [17 13 2 17 4 13] 
                    [7 17 8 7 8 13] 
                    [4 7 17]          
                ],[
                    [4 5 10]          
                    [1 6 10]          
                    [6 4 5 6 5 1] 
                    [1 5 16]          
                    [1 10 4 1 4 16] 
                    [6 10 5 6 5 16] 
                    [6 4 16]          
                ],[
                    [4 10 9]          
                    [6 11 10]          
                    [4 6 11 4 11 9] 
                    [3 9 11]          
                    [4 10 11 4 11 3] 
                    [6 3 9 6 9 10] 
                    [3 4 6]          
                ],[
                    [4 9 13]          
                    [7 13 12]          
                    [4 9 12 4 12 7] 
                    [3 12 9]          
                    [4 3 12 4 12 13] 
                    [9 3 7 9 7 13] 
                    [3 7 4]          
                ]
            ]

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
        points   = []
        
        for i in [0..15]
            for j in [0..15]
                indices = indices.concat tetraind.map (idx) -> idx+vertices.length/3
                vertices = vertices.concat frame i*2,  0,j*2
                if (i+j*16)&1   then points.push i*2,  0,j*2
                if (i+j*16)&2   then points.push i*2+1,0,j*2
                if (i+j*16)&4   then points.push i*2,  1,j*2
                if (i+j*16)&8   then points.push i*2+1,1,j*2
                if (i+j*16)&16  then points.push i*2,  0,j*2+1
                if (i+j*16)&32  then points.push i*2+1,0,j*2+1
                if (i+j*16)&64  then points.push i*2,  1,j*2+1
                if (i+j*16)&128 then points.push i*2+1,1,j*2+1
        
        geometry = new BufferGeometry()
        geometry.setIndex indices
        geometry.setAttribute 'position' new Float32BufferAttribute vertices, 3
        geometry.setAttribute 'color'    new Float32BufferAttribute vertices, 3
                
        line = new LineSegments new WireframeGeometry geometry
        line.material.depthTest   = false
        line.material.opacity     = 0.05
        line.material.transparent = true
        scene.add line
        
        geometry = new BufferGeometry()
        geometry.setAttribute 'position' new Float32BufferAttribute points, 3
        pmat = new PointsMaterial color:0xffff88
        pmat.size        = 0.1
        pmat.depthTest   = false
        pmat.opacity     = 0.5
        pmat.transparent = true
        scene.add new Points geometry, pmat
        
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
        
        geometry = new BufferGeometry()
        geometry.setIndex indices
        geometry.setAttribute 'position' new Float32BufferAttribute vertices, 3
        geometry.setAttribute 'color'    new Float32BufferAttribute vertices, 3
        mesh = new Mesh geometry, material
        
        scene.add mesh
        
    @cube: (index) ->
        
        tt = [
            [4, 3,   1,  0,    2, 0,  32, 3]
            [4, 3,   1,  0,   16, 3,  32, 3]
            [4, 3,  64,  6,   16, 3,  32, 3]
            [4, 3,   8,  3,    2, 0,  32, 3]
            [4, 3,   8,  3,  128, 6,  32, 3]
            [4, 3,  64,  6,  128, 6,  32, 3]
        ]
        
        indices = []
        for ti in [0..5]
            t = tt[ti]
            r = 0
            for i in [0..6] by 2
                r |= ((index & t[i]) << 1) >> t[i+1]
            if r and r != 0b1111
                indices = indices.concat @tetra ti, r
        
        indices
        
    @tetra: (tetra, io) ->
        
        i = if io > 7 then 14-io else io-1
        a = TETRA[tetra][i]
        if io > 7
            [a[1], a[2]] = [a[2], a[1]]
            if a.length > 3 then [a[4], a[5]] = [a[5], a[4]]
        a
        
module.exports = Tetras
