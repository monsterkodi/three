###
000   000  000  000   000  0000000     0000000   000   000
000 0 000  000  0000  000  000   000  000   000  000 0 000
000000000  000  000 0 000  000   000  000   000  000000000
000   000  000  000  0000  000   000  000   000  000   000
00     00  000  000   000  0000000     0000000   00     00
###

{ $, deg2rad, keyinfo, kpos, prefs, win } = require 'kxk'

{ AmbientLight, AxesHelper, Camera, Color, Fog, GridHelper, Mesh, MeshStandardMaterial, PCFSoftShadowMap, PlaneGeometry, PointLight, Raycaster, Scene, Vector2, WebGLRenderer } = require 'three'

Camera = require './camera'
FPS    = require './fps'
Tetras = require './tetras'

class MainWin extends win
    
    @: ->
        
        super
            dir:    __dirname
            pkg:    require '../package.json'
            menu:   '../coffee/menu.noon'
            icon:   '../img/mini.png'
            prefsSeperator: '▸'
            context: false
            onLoad: @onLoad
          
        @mouse = new Vector2
        
        @initOptions()
            
        addEventListener 'pointerdown' @onMouseDown
        addEventListener 'pointermove' @onMouseMove
        addEventListener 'pointerup'   @onMouseUp
                        
    onLoad: =>

        window.onresize = @onResize
        
        @initScene $ "#main"
        
        Tetras.renderScene @scene
        
        requestAnimationFrame @renderScene
        
    #  0000000   0000000  00000000  000   000  00000000  
    # 000       000       000       0000  000  000       
    # 0000000   000       0000000   000 0 000  0000000   
    #      000  000       000       000  0000  000       
    # 0000000    0000000  00000000  000   000  00000000  
    
    initScene: (@view) ->
                
        @renderer = new WebGLRenderer antialias:true precision:'highp'
            
        @renderer.setSize @view.offsetWidth, @view.offsetHeight
        @renderer.autoClear         = false
        @renderer.sortObjects       = true
        @renderer.shadowMap.type    = PCFSoftShadowMap
        @renderer.shadowMap.enabled = true
        @renderer.setPixelRatio window.devicePixelRatio 
        @view.appendChild @renderer.domElement
                       
        @fogColor = new Color 'hsl(180, 0%, 4%)'
        
        @onResize()
        
        br = @renderer.domElement.getBoundingClientRect()
        @viewOffset = new Vector2 br.left, br.top
        
        @scene = new Scene()
        @scene.background = @fogColor
        @camera = new Camera view:@view

        @sun = new PointLight 0xffffff, 2, 200
        @sun.position.set 0 10 0
        @sun.castShadow = true
        @sun.shadow.mapSize = new Vector2 2*2048, 2*2048
        @scene.add @sun
        
        # @scene.add new PointLightHelper @sun, 1
                
        @ambient = new AmbientLight 0x181818
        @scene.add @ambient
        
        material = new MeshStandardMaterial {
            metalness: 0.6
            roughness: 0.3
            color:0x5555ff
        }
        
        material = new MeshStandardMaterial
            metalness: 0.0
            color: new Color 'hsl(180,0%,4%)'
            roughness: 1.0
            flatShading: true
              
        geometry = new PlaneGeometry 1000 1000 10
        @plane = new Mesh geometry, material
        @plane.castShadow = false
        @plane.receiveShadow = true
        @plane.name = 'plane'
        @plane.position.y = -0.1
        @plane.rotation.set deg2rad(-90), 0 0
        @scene.add @plane

        # klog Object.keys require 'three'
        @scene.fog = new Fog @fogColor, 10 100

        for opt in Object.keys @options
            @setOption opt, @options[opt]
        
        @raycaster = new Raycaster
        
    # 00000000   00000000  000   000  0000000    00000000  00000000   
    # 000   000  000       0000  000  000   000  000       000   000  
    # 0000000    0000000   000 0 000  000   000  0000000   0000000    
    # 000   000  000       000  0000  000   000  000       000   000  
    # 000   000  00000000  000   000  0000000    00000000  000   000  
    
    renderScene: =>
        
        @fps?.draw()
        @sun.position.copy @camera.getPosition()
        # @sun.position.add  @camera.getUp().multiplyScalar 3.0
        # @sun.position.add  @camera.getRight().multiplyScalar -3.0

        @renderer.render @scene, @camera        
        requestAnimationFrame @renderScene
       
    # 00000000   00000000   0000000  000  0000000  00000000  
    # 000   000  000       000       000     000   000       
    # 0000000    0000000   0000000   000    000    0000000   
    # 000   000  000            000  000   000     000       
    # 000   000  00000000  0000000   000  0000000  00000000  
    
    onResize: => 
        
        w = @view.clientWidth 
        h = @view.clientHeight
        
        @aspect = w/h
        @viewSize = kpos w,h
  
        if @camera?
            @camera.aspect = @aspect
            @camera.size   = @viewSize
            @camera.updateProjectionMatrix()
        
        @renderer?.setSize w,h
        
    #  0000000   00000000   000000000  000   0000000   000   000   0000000  
    # 000   000  000   000     000     000  000   000  0000  000  000       
    # 000   000  00000000      000     000  000   000  000 0 000  0000000   
    # 000   000  000           000     000  000   000  000  0000       000  
    #  0000000   000           000     000   0000000   000   000  0000000   
    
    initOptions: ->
        
        @options = {}
        for opt in ['fps' 'plane' 'grid' 'axes' 'dither' 'shadow' 'fog']
            @options[opt] =  prefs.get "option▸#{opt}" true
    
    toggle: (opt) -> @setOption opt, not @options[opt]

    setOption: (opt, val) -> 
        
        @options[opt] = val
        prefs.set "option▸#{opt}" val
        
        switch opt
            
            when 'fps'
                if val
                    @fps = new FPS
                else
                    @fps?.remove()
                    delete @fps
            
            when 'shadow'
                
                @renderer.shadowMap.enabled = val
                @sun.castShadow = val
                
            when 'plane'
                if val
                    @scene.add @plane
                else
                    @scene.remove @plane
            
            when 'dither'
                @scene.traverse (node) ->
                    if node instanceof Mesh
                        node.material.dithering = val
                        node.material.needsUpdate = true
                        
            when 'fog'
                if val
                    @scene.fog.near = 10
                    @scene.fog.far  = 50
                else
                    @scene.fog.near = 99999
                    @scene.fog.far  = 99999+1
        
            when 'grid'
                if val
                    @grid = new GridHelper 100 100 0x333333, 0x0
                    @grid.position.y = 0.05
                    @scene.add @grid
                else
                    @scene.remove @grid
                    delete @grid
            
            when 'axes'
                if val
                    @axes = new AxesHelper 100
                    @axes.position.y = 0.06
                    @scene.add @axes
                else
                    @scene.remove @axes
                    delete @axes
                
    # 000   000  00000000  000   000  
    # 000  000   000        000 000   
    # 0000000    0000000     00000    
    # 000  000   000          000     
    # 000   000  00000000     000     
    
    onKeyDown: (event) =>

        { mod, key, combo, char } = keyinfo.forEvent event
        
        return if event.repeat
        
        switch key
            when 'w'     then @camera.startMoveForward()
            when 's'     then @camera.startMoveBackward()
            when 'a'     then @camera.startMoveLeft()
            when 'd'     then @camera.startMoveRight()
            when 'q'     then @camera.startMoveDown()
            when 'e'     then @camera.startMoveUp()
            when 'left'  then @camera.startPivotLeft()
            when 'right' then @camera.startPivotRight()
            when 'up'    then @camera.startPivotUp()
            when 'down'  then @camera.startPivotDown()
            when 'r'     then @camera.reset()
            when '1'     then @camera.decrementMoveSpeed()
            when '2'     then @camera.incrementMoveSpeed()
            when 'g'     then @toggle 'grid'
            when 'p'     then @toggle 'plane'
            when 'h'     then @toggle 'shadow'
            when 'y'     then @toggle 'axes'
            when 'f'     then @toggle 'fog'
            when 'o'     then @toggle 'fps'
            when 't'     then @toggle 'dither'
            # else
                # klog 'keyDown' mod, key, combo, char, event.which
        
        super
        
    onKeyUp: (event) =>
        
        { mod, key, combo, char } = keyinfo.forEvent event
        # klog 'keyUp' mod, key, combo, char, event.which
        
        switch key
            when 'w'     then @camera.stopMoveForward()
            when 's'     then @camera.stopMoveBackward()
            when 'a'     then @camera.stopMoveLeft()
            when 'd'     then @camera.stopMoveRight()
            when 'q'     then @camera.stopMoveDown()
            when 'e'     then @camera.stopMoveUp()
            when 'left'  then @camera.stopPivotLeft()
            when 'right' then @camera.stopPivotRight()
            when 'up'    then @camera.stopPivotUp()
            when 'down'  then @camera.stopPivotDown()
        
        super
        
    # 00     00   0000000   000   000   0000000  00000000  
    # 000   000  000   000  000   000  000       000       
    # 000000000  000   000  000   000  0000000   0000000   
    # 000 0 000  000   000  000   000       000  000       
    # 000   000   0000000    0000000   0000000   00000000  

    mouseEvent: (event) ->
        
        if @viewOffset
            @mouse.x =   ( (event.clientX - @viewOffset.x) / @view.clientWidth ) * 2 - 1;
            @mouse.y = - ( (event.clientY - @viewOffset.y) / @view.clientHeight ) * 2 + 1;
    
    onMouseMove: (event) => @mouseEvent event
    onMouseUp:   (event) => @mouseEvent event
    onMouseDown: (event) => @mouseEvent event; @pickObject event
        
    pickObject: (event) ->
        
        return if event.buttons != 1
        @raycaster.setFromCamera @mouse, @camera
        for intersect in @raycaster.intersectObjects @scene.children
            if intersect?.object?.type == 'Mesh'
                if intersect.object.name != 'plane'
                    intersect.object.geometry.computeBoundingSphere()
                    @camera.setPivotCenter intersect.object.geometry.boundingSphere.center
                    return
    
    # 00     00  00000000  000   000  000   000  
    # 000   000  000       0000  000  000   000  
    # 000000000  0000000   000 0 000  000   000  
    # 000 0 000  000       000  0000  000   000  
    # 000   000  00000000  000   000   0000000   
    
    onMenuAction: (action, args) =>
        
        # klog "menuAction #{action}" args
                    
        super
                        
new MainWin            
