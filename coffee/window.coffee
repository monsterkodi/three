###
000   000  000  000   000  0000000     0000000   000   000
000 0 000  000  0000  000  000   000  000   000  000 0 000
000000000  000  000 0 000  000   000  000   000  000000000
000   000  000  000  0000  000   000  000   000  000   000
00     00  000  000   000  0000000     0000000   00     00
###

{ $, deg2rad, keyinfo, klog, kpos, win } = require 'kxk'

{ Fog, FogExp2, AmbientLight, BackSide, BoxBufferGeometry, BoxGeometry, Camera, Color, GridHelper, Mesh, MeshLambertMaterial, MeshPhysicalMaterial, MeshStandardMaterial, PCFSoftShadowMap, PMREMGenerator, PlaneGeometry, PointLight, PointLightHelper, Quaternion, Raycaster, Scene, SphereGeometry, Vector2, WebGLRenderer } = require 'three'

Camera = require './camera'

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
        
        @options =
            dither: true
            shadow: true
            fog:    true
            
        addEventListener 'pointerdown' @onMouseDown
        addEventListener 'pointermove' @onMouseMove
        addEventListener 'pointerup'   @onMouseUp
                        
    onLoad: =>

        window.onresize = @onResize
        
        @initScene $ "#main"
        
        requestAnimationFrame @renderScene
        
    #  0000000   0000000  00000000  000   000  00000000  
    # 000       000       000       0000  000  000       
    # 0000000   000       0000000   000 0 000  0000000   
    #      000  000       000       000  0000  000       
    # 0000000    0000000  00000000  000   000  00000000  
    
    initScene: (@view) ->
                
        @renderer = new WebGLRenderer antialias:true precision:'highp'
            
        @renderer.setSize @view.offsetWidth, @view.offsetHeight
        @renderer.autoClear = false
        @renderer.sortObjects = true
        @renderer.shadowMap.type = PCFSoftShadowMap
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
        
        @scene.add new PointLightHelper @sun, 1
                
        @ambient = new AmbientLight 0x181818
        @scene.add @ambient
        
        material = new MeshStandardMaterial {
            metalness: 0.6
            roughness: 0.3
            color:0x5555ff
        }
        
        geometry = new BoxGeometry 1 1 1
        box = new Mesh geometry, material.clone()
        box.position.set 0 1 0
        box.castShadow = true
        box.receiveShadow = true
        box.name = 'box'
        @scene.add box

        material.color = new Color 0xff0000
        material.flatShading = true
        material.metalness = 0.9
        geometry = new SphereGeometry 1 10 10
        sphere = new Mesh geometry, material
        sphere.position.set 2 1 1
        sphere.castShadow = true
        sphere.receiveShadow = true
        sphere.name = 'sphere'
        @scene.add sphere
      
        material = new MeshStandardMaterial {
            metalness: 0.0
            color: new Color 'hsl(180,0%,4%)'
            roughness: 1.0
            flatShading: true
        }
        
        geometry = new PlaneGeometry 1000 1000 10
        geometry.quaternion = new Quaternion
        @plane = new Mesh geometry, material
        @plane.castShadow = false
        @plane.receiveShadow = true
        @plane.name = 'plane'
        @plane.rotation.set deg2rad(-90), 0 0
        @scene.add @plane
        
        # klog Object.keys require 'three'
        @scene.fog = new Fog @fogColor, 10 100

        @setFog    @options.fog
        @setDither @options.dither 
        
        @raycaster = new Raycaster
        
    toggleDither: -> @setDither not @options.dither
    toggleFog: -> @setFog not @options.fog
        
    setDither: (d) -> 
        @options.dither = d
        @scene.traverse (node) ->
            if node instanceof Mesh
                node.material.dithering = d
                node.material.needsUpdate = true
        
    setFog: (f) ->
        @options.fog = f
        if f 
            @scene.fog.near = 50
            @scene.fog.far  = 100
        else
            @scene.fog.near = 99999
            @scene.fog.far  = 99999+1
        
    toggleGrid: ->
        
        if @grid
            @scene.remove @grid
            delete @grid
        else
            @grid = new GridHelper 100 100 0xffffff, 0x0
            @scene.add @grid
        
    renderScene: =>
        
        @sun.position.copy @camera.getPosition()
        @sun.position.add @camera.getUp().multiplyScalar 3.0
        @sun.position.add @camera.getRight().multiplyScalar -3.0
        # klog @mouse
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
        
        # log 'oneResize' @viewSize
        @renderer?.setSize w,h
        
    # 000   000  00000000  000   000  
    # 000  000   000        000 000   
    # 0000000    0000000     00000    
    # 000  000   000          000     
    # 000   000  00000000     000     
    
    onKeyDown: (event) =>

        { mod, key, combo, char } = keyinfo.forEvent event
        
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
            when 'g'     then @toggleGrid()
            when 'f'     then @toggleFog()
            when 't'     then @toggleDither()
            else
                klog 'keyDown' mod, key, combo, char, event.which
        
        super
        
    onKeyUp: (event) =>
        
        { mod, key, combo, char } = keyinfo.forEvent event
        # klog 'keyUp' mod, key, combo, char, event.which
        
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
    onMouseDown: (event) => @mouseEvent event; @pickObject()
        
    pickObject: ->
        
        @raycaster.setFromCamera @mouse, @camera
        for intersect in @raycaster.intersectObjects @scene.children
            if intersect?.object?.type == 'Mesh'
                if intersect.object.name != 'plane'
                    @camera.fadeToPos intersect.object.position
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
