###
000000000  00000000  000000000  00000000    0000000    0000000
   000     000          000     000   000  000   000  000     
   000     0000000      000     0000000    000000000  0000000 
   000     000          000     000   000  000   000       000
   000     00000000     000     000   000  000   000  0000000 
###

{ klog } = require 'kxk'
{ BufferAttribute, BufferGeometry, Float32BufferAttribute, LineSegments, Mesh, MeshStandardMaterial, Points, PointsMaterial, Uint32BufferAttribute, Vector3, WireframeGeometry } = require 'three'
{ sin } = Math

TETRA = [
    [ [0 5 4] [0 14 15] [4 14 15 4 15 5] [5 15 16] [4 15 16 4 0 15] [5 14 16 5 0 14] [4 14 16] ]
    [ [0 4 8] [0 18 14] [8 18 14 8 14 4] [8 17 18] [0 17 18 0 4 17] [8 17 14 8 14 0] [4 17 14] ]
    [ [4 13 8] [2 13 7] [7 2 8 7 8 4] [2 17 8] [17 13 2 17 4 13] [7 17 8 7 8 13] [4 7 17] ]
    [ [4 5 10] [1 6 10] [6 4 5 6 5 1] [1 5 16] [1 10 4 1 4 16] [6 10 5 6 5 16] [6 4 16] ]
    [ [4 10 9] [6 11 10] [4 6 11 4 11 9] [3 9 11] [4 10 11 4 11 3] [6 3 9 6 9 10] [3 4 6] ]
    [ [4 9 13] [7 13 12] [4 9 12 4 12 7] [3 12 9] [4 3 12 4 12 13] [9 3 7 9 7 13] [3 7 4] ]
]
        
CUBE = [
    [4 3   1  0    2 0  32 3] [4 3   1  0   16 3  32 3] [4 3  64  6   16 3  32 3]
    [4 3   8  3    2 0  32 3] [4 3   8  3  128 6  32 3] [4 3  64  6  128 6  32 3] 
]
     
OFFSET = [ 0 0 0  1 0 0  0 1 0  1 1 0  0 0 1  1 0 1  0 1 1  1 1 1 ]  

class Tetras
    
    @vertices = []
    @indices  = [] 
    @points   = []
    
    # 00000000   00000000  000   000  0000000    00000000  00000000   
    # 000   000  000       0000  000  000   000  000       000   000  
    # 0000000    0000000   000 0 000  000   000  0000000   0000000    
    # 000   000  000       000  0000  000   000  000       000   000  
    # 000   000  00000000  000   000  0000000    00000000  000   000  
    
    @renderScene: (scene) ->
                   
        if false then @debugGrid scene
            
        @cubeSize = 40
        
        @vertices = new Float32Array @cubeSize*@cubeSize*@cubeSize*3*19
        @indices  = new Uint32Array @cubeSize*@cubeSize*@cubeSize*3*6*2
        @vertex   = 0
        @index    = 0
                      
        # klog 'cubes' @vertices.length, @indices.length

        # ▸average 10
        if true
        # if false
            
            @vertex = 0
            @index  = 0
            
            for i in [0...@cubeSize]
                for j in [0...@cubeSize]
                    for k in [0...@cubeSize]
                        @addCube @cubeAt(i,j,k), i,j,k
        
            klog "vertex #{@vertex} index #{@index} tris #{(@index+1)/3} buffers" @vertices.length, @indices.length
            geometry = new BufferGeometry()
            geometry.setIndex new Uint32BufferAttribute @indices.slice(0 @index), 1
            geometry.setAttribute 'position' new BufferAttribute @vertices, 3
            # geometry.setAttribute 'color' new BufferAttribute @vertices, 3
            scene.add new Mesh geometry, new MeshStandardMaterial 
                metalness:    0.0
                roughness:    1.0
                color:        0x333333
                flatShading:  true
      
        if false
            points = []
            for i in [0...@cubeSize]
                for j in [0...@cubeSize]
                    for k in [0...@cubeSize]
                        if @cubeAt(i, j, k) & 1
                            points.push i, j, k
                
            geometry = new BufferGeometry()
            geometry.setAttribute 'position' new Float32BufferAttribute points, 3
            pmat = new PointsMaterial color:0xffff88
            pmat.size        = 0.1
            pmat.depthTest   = false
            pmat.opacity     = 0.5
            pmat.transparent = true
            scene.add new Points geometry, pmat
                
    @cubeAt: (i, j, k) ->
        
        c = 0
        for a in [0..7]
            x = i+OFFSET[a*3+0]
            y = j+OFFSET[a*3+1]
            z = k+OFFSET[a*3+2]
            v = new Vector3 x,y,z
            v.add new Vector3 0.5 0.5 0.5
            v.sub new Vector3 @cubeSize/2 @cubeSize/2 @cubeSize/2
            # c |= (((v.length() <= @cubeSize/3) and 1 or 0) << a)
            c |= (((sin(x+y)*4.0 <= z) and 1 or 0) << a)
            # c |= (((y <= 1) and 1 or 0) << a)
            # c |= (((x+z+y <= 5) and 1 or 0) << a)
        c
        
    #  0000000  000   000  0000000    00000000  
    # 000       000   000  000   000  000       
    # 000       000   000  0000000    0000000   
    # 000       000   000  000   000  000       
    #  0000000   0000000   0000000    00000000  
    
    @addCube: (index, x, y, z) ->
    
        for ti in [0..5]
            t = CUBE[ti]
            r = 0
            for i in [0..6] by 2
                r |= ((index & t[i]) << 1) >> t[i+1]
            if r and r != 0b1111
                @tetra ti, r
        
        xh = x+0.5; x1 = x+1
        yh = y+0.5; y1 = y+1
        zh = z+0.5; z1 = z+1

        @vertices[@vertex++] = x
        @vertices[@vertex++] = yh
        @vertices[@vertex++] = z
        
        @vertices[@vertex++] = x1
        @vertices[@vertex++] = yh
        @vertices[@vertex++] = z
        
        @vertices[@vertex++] = x
        @vertices[@vertex++] = yh
        @vertices[@vertex++] = z1
        
        @vertices[@vertex++] = x1
        @vertices[@vertex++] = yh
        @vertices[@vertex++] = z1
        
        for j in [0.5 1 0]

            @vertices[@vertex++] = xh
            @vertices[@vertex++] = y+j
            @vertices[@vertex++] = zh
            
            @vertices[@vertex++] = xh
            @vertices[@vertex++] = y+j
            @vertices[@vertex++] = z
            
            @vertices[@vertex++] = x1
            @vertices[@vertex++] = y+j
            @vertices[@vertex++] = zh
            
            @vertices[@vertex++] = xh
            @vertices[@vertex++] = y+j
            @vertices[@vertex++] = z1
            
            @vertices[@vertex++] = x
            @vertices[@vertex++] = y+j
            @vertices[@vertex++] = zh
            
    # 000000000  00000000  000000000  00000000    0000000   
    #    000     000          000     000   000  000   000  
    #    000     0000000      000     0000000    000000000  
    #    000     000          000     000   000  000   000  
    #    000     00000000     000     000   000  000   000  
    
    @tetra: (tetra, io) ->
        
        o = @vertex/3 
        if io <= 7
            a = TETRA[tetra][io-1]
            for i in [0...a.length]
                @indices[@index++] = a[i]+o
        else
            a = TETRA[tetra][14-io]
            for i in [0..a.length] by 3
                @indices[@index++] = a[i+0]+o
                @indices[@index++] = a[i+2]+o
                @indices[@index++] = a[i+1]+o
                
    # 0000000    00000000  0000000    000   000   0000000   
    # 000   000  000       000   000  000   000  000        
    # 000   000  0000000   0000000    000   000  000  0000  
    # 000   000  000       000   000  000   000  000   000  
    # 0000000    00000000  0000000     0000000    0000000   
    
    @debugGrid: (scene) ->
            
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
            
        indices = []
        vertices = []
        points = []
        
        for i in [0..15]
            for j in [0..15]
                indices = indices.concat tetraind.map (idx) -> idx+vertices.length/3
                vertices = vertices.concat frame  i*2,  0,j*2
                if (i+j*16)&1   then @points.push i*2,  0,j*2
                if (i+j*16)&2   then @points.push i*2+1,0,j*2
                if (i+j*16)&4   then @points.push i*2,  1,j*2
                if (i+j*16)&8   then @points.push i*2+1,1,j*2
                if (i+j*16)&16  then @points.push i*2,  0,j*2+1
                if (i+j*16)&32  then @points.push i*2+1,0,j*2+1
                if (i+j*16)&64  then @points.push i*2,  1,j*2+1
                if (i+j*16)&128 then @points.push i*2+1,1,j*2+1
    
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
           
        @vertices = new Float32Array 16*16*3*19
        @indices  = new Uint32Array 16*16*3*6*2
        @vertex   = 0
        @index    = 0
        
        for i in [0..15]
            for j in [0..15]
                @addCube i+j*16, i*2, 0, j*2
                
        # @addCube 255-51, 0 0 0
        # @addCube 51, 0 0 0
                
        geometry = new BufferGeometry()
        geometry.setIndex new Uint32BufferAttribute @indices.slice(0 @index), 1
        geometry.setAttribute 'position' new BufferAttribute @vertices, 3
        geometry.setAttribute 'color' new BufferAttribute @vertices, 3
        mesh = new Mesh geometry, new MeshStandardMaterial 
            metalness:    0.5
            roughness:    0.5
            flatShading:  true
            vertexColors: true
        
        scene.add mesh
        
module.exports = Tetras
