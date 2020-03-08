###
000   000  000  000   000  0000000     0000000   000   000
000 0 000  000  0000  000  000   000  000   000  000 0 000
000000000  000  000 0 000  000   000  000   000  000000000
000   000  000  000  0000  000   000  000   000  000   000
00     00  000  000   000  0000000     0000000   00     00
###

{ $, args, keyinfo, klog, kpos, win } = require 'kxk'

THREE = require 'three'

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
        
        @onResize()
        
        @renderer = new THREE.WebGLRenderer antialias:true precision:'highp'

        @renderer.setSize @view.offsetWidth, @view.offsetHeight
        @renderer.autoClear = false
        @renderer.sortObjects = true
        @renderer.shadowMap.type = THREE.PCFSoftShadowMap
        @renderer.shadowMap.enabled = true
        @renderer.setPixelRatio window.devicePixelRatio 
        @view.appendChild @renderer.domElement
                        
        @scene = new THREE.Scene()
        
        @camera = new Camera view:@view

        @sun = new THREE.PointLight 0xffffff
        @sun.position.set 0 10 0
        @scene.add @sun
        
        @scene.add new THREE.PointLightHelper @sun, 1
        
        gridHelper = new THREE.GridHelper 400 40 0x0000ff, 0x808080
        gridHelper.position.set 0 0 0
        @scene.add gridHelper
        
        # @ambient = new THREE.AmbientLight 0x111111
        # @scene.add @ambient
        
        geometry = new THREE.BoxGeometry 1 1 1
        material = new THREE.MeshBasicMaterial color:0xaaaaaa
        @scene.add new THREE.Mesh geometry, material
        
    renderScene: =>
        # @sun.position.copy @camera.getPosition()
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
            @camera.size = @viewSize
            @camera.updateProjectionMatrix()
        
        log 'oneResize' @viewSize
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

    onMouseDown: (event) => klog 'onMouseDown' kpos event
    onMouseMove: (event) => #klog 'onMouseMove' kpos event
    onMouseUp:   (event) => klog 'onMouseUp'   kpos event
        
    # 00     00  00000000  000   000  000   000  
    # 000   000  000       0000  000  000   000  
    # 000000000  0000000   000 0 000  000   000  
    # 000 0 000  000       000  0000  000   000  
    # 000   000  00000000  000   000   0000000   
    
    onMenuAction: (action, args) =>
        
        klog "menuAction #{action}" args
                    
        super
                        
new MainWin            
