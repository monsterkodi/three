###
 0000000   0000000   00     00  00000000  00000000    0000000 
000       000   000  000   000  000       000   000  000   000
000       000000000  000000000  0000000   0000000    000000000
000       000   000  000 0 000  000       000   000  000   000
 0000000  000   000  000   000  00000000  000   000  000   000
###

{ clamp, deg2rad, kpos, prefs, reduce } = require 'kxk'
{ Camera, PerspectiveCamera, Quaternion, Vector2, Vector3 } = require 'three'
{ abs, max, min } = Math

class Camera extends PerspectiveCamera

    @: (view:) ->
        
        @elem = view
        width  = @elem.clientWidth
        height = @elem.clientHeight
        
        # klog "width #{width} height #{height}"
        
        super 70, width/height, 0.01, 300 # fov, aspect, near, far
        
        @center     = new Vector3 0 0 0
        @size       = new Vector2 width, height 
        @pivot      = new Vector2
        @move       = new Vector3
        @maxDist    = @far/4
        @minDist    = 0.9
        @dist       = prefs.get 'camera▸dist'  10
        @degree     = prefs.get 'camera▸degree' 0
        @rotate     = prefs.get 'camera▸rotate' 0
        @wheelInert = 0
        @animations = []

        @elem.addEventListener 'mousewheel' @onMouseWheel
        @elem.addEventListener 'mousedown'  @onMouseDown
        @elem.addEventListener 'keypress'   @onKeyPress
        @elem.addEventListener 'keyrelease' @onKeyRelease
        @elem.addEventListener 'dblclick'   @onDblClick
        
        @update()
        requestAnimationFrame @animationStep

    getPosition: -> @position
    getDir:      -> new Vector3(0 0 -1).applyQuaternion @quaternion 
    getUp:       -> new Vector3(0 1  0).applyQuaternion @quaternion  
    getRight:    -> new Vector3(1 0  0).applyQuaternion @quaternion  

    del: =>
        
        @elem.removeEventListener  'keypress'   @onKeyPress
        @elem.removeEventListener  'keyrelease' @onKeyRelease
        @elem.removeEventListener  'mousewheel' @onMouseWheel
        @elem.removeEventListener  'mousedown'  @onMouseDown
        @elem.removeEventListener  'dblclick'   @onDblClick
        
        window.removeEventListener 'mouseup'    @onMouseUp
        window.removeEventListener 'mousemove'  @onMouseDrag 
        
    # 00     00   0000000   000   000   0000000  00000000  
    # 000   000  000   000  000   000  000       000       
    # 000000000  000   000  000   000  0000000   0000000   
    # 000 0 000  000   000  000   000       000  000       
    # 000   000   0000000    0000000   0000000   00000000  
    
    onMouseDown: (event) => 
        
        @downButtons = event.buttons
        @mouseMoved  = false
            
        @mouseX = event.clientX
        @mouseY = event.clientY
        
        @downPos = kpos @mouseX, @mouseY
        
        window.addEventListener 'mousemove' @onMouseDrag
        window.addEventListener 'mouseup'   @onMouseUp
        
    onMouseUp: (event) => 

        window.removeEventListener 'mousemove' @onMouseDrag
        window.removeEventListener 'mouseup'   @onMouseUp
        
    onDblClick: (event) =>
        
    onMouseDrag: (event) =>

        x = event.clientX-@mouseX
        y = event.clientY-@mouseY
        
        @mouseX = event.clientX
        @mouseY = event.clientY
        
        if @downPos.dist(kpos @mouseX, @mouseY) > 60
            @mouseMoved = true
        
        if event.buttons & 4
            s = @dist
            @pan x*2*s/@size.x, y*s/@size.y
            
        if event.buttons & 2
            @setPivot new Vector2 360*x/@size.x, 180*y/@size.y
      
    animate: (func) ->
        
        @animations.push func
        
    animationStep: =>
        
        
        now = window.performance.now()
        delta = (now - @lastAnimationTime) * 0.001
        
        @lastAnimationTime = now
        
        oldAnimations = @animations.clone()
        @animations = []
        for animation in oldAnimations
            animation delta
        
        requestAnimationFrame @animationStep
        
    # 00000000   000  000   000   0000000   000000000  
    # 000   000  000  000   000  000   000     000     
    # 00000000   000   000 000   000   000     000     
    # 000        000     000     000   000     000     
    # 000        000      0       0000000      000     
    
    setPivot: (p) ->
                
        @rotate += -p.x
        @degree += -p.y
        
        @update()
           
    startPivotLeft: ->
        
        @pivot.x = -1
        @startPivot()
        
    startPivotRight: ->
        
        @pivot.x = 1
        @startPivot()

    startPivotUp: ->
        
        @pivot.y = -1
        @startPivot()
        
    startPivotDown: ->
        
        @pivot.y = 1
        @startPivot()
        
    stopPivot: ->
        
        @pivoting = false
        @pivot.set 0 0
       
    startPivot: -> 
        
        if not @pivoting
            @animate @pivotCenter
            @pivoting = true
            
    pivotCenter: (deltaSeconds) =>
        
        return if not @pivoting

        @setPivot @pivot
        
        @pivot.multiplyScalar 0.96
        
        if @pivot.length() > 0.001
            @animate @pivotCenter
        else
            @stopPivot()
        
    # 00000000    0000000   000   000  
    # 000   000  000   000  0000  000  
    # 00000000   000000000  000 0 000  
    # 000        000   000  000  0000  
    # 000        000   000  000   000  
    
    pan: (x,y) ->
        
        right = new Vector3 -x, 0, 0 
        right.applyQuaternion @quaternion

        up = new Vector3 0, y, 0 
        up.applyQuaternion @quaternion
        
        @center.add right.add up
        @centerTarget?.copy @center
        @update()
            
    # 00000000   0000000    0000000  000   000   0000000  
    # 000       000   000  000       000   000  000       
    # 000000    000   000  000       000   000  0000000   
    # 000       000   000  000       000   000       000  
    # 000        0000000    0000000   0000000   0000000   
                     
    focusOnPos: (v) ->
        
        @centerTarget = new Vector3 v
        @center = new Vector3 v
        @update()
         
    fadeToPos: (v) -> 
        @centerTarget = v.clone()
        @startFadeCenter()

    startFadeCenter: -> 
        
        if not @fading
            @animate @fadeCenter
            @fading = true
                       
    fadeCenter: (deltaSeconds) =>
        
        return if not @fading
        
        @center.lerp @centerTarget, deltaSeconds
        @update()
        
        if @center.distanceTo(@centerTarget) > 0.001
            @animate @fadeCenter
        else
            delete @fading

    # 00     00   0000000   000   000  00000000  
    # 000   000  000   000  000   000  000       
    # 000000000  000   000   000 000   0000000   
    # 000 0 000  000   000     000     000       
    # 000   000   0000000       0      00000000  
    
    moveFactor: -> @dist/2
    
    startMoveLeft: ->
        
        @move.x = -@moveFactor()
        @startMove()
        
    startMoveRight: ->
        
        @move.x = @moveFactor()
        @startMove()

    startMoveUp: ->
        
        @move.y = @moveFactor()
        @startMove()
        
    startMoveDown: ->
        
        @move.y = -@moveFactor()
        @startMove()

    startMoveForward: ->
        
        @move.z = -@moveFactor()
        @startMove()
        
    startMoveBackward: ->
        
        @move.z =  @moveFactor()
        @startMove()
        
    stopMoving: ->
        
        @moving = false
        @move.set 0 0 0
       
    startMove: -> 
        
        @fading = false
        if not @moving
            @animate @moveCenter
            @moving = true
            
    moveCenter: (deltaSeconds) =>
        
        return if not @moving
        
        dir = new Vector3
        dir.add @move

        dir.multiplyScalar deltaSeconds
        dir.applyQuaternion @quaternion
        
        @center.add dir
        @update()
        
        @move.multiplyScalar 0.96
        if @move.length() > 0.001
            @animate @moveCenter
        else
            @stopMoving()
        
    # 000   000  000   000  00000000  00000000  000      
    # 000 0 000  000   000  000       000       000      
    # 000000000  000000000  0000000   0000000   000      
    # 000   000  000   000  000       000       000      
    # 00     00  000   000  00000000  00000000  0000000  
    
    onMouseWheel: (event) => 
    
        if @wheelInert > 0 and event.wheelDelta < 0
            @wheelInert = 0
            return
            
        if @wheelInert < 0 and event.wheelDelta > 0
            @wheelInert = 0
            return
            
        @wheelInert += event.wheelDelta * (1+(@dist/@maxDist)*3) * 0.0001
        
        @startZoom()

    # 0000000   0000000    0000000   00     00  
    #    000   000   000  000   000  000   000  
    #   000    000   000  000   000  000000000  
    #  000     000   000  000   000  000 0 000  
    # 0000000   0000000    0000000   000   000  

    startZoomIn: ->
        
        @wheelInert = (1+(@dist/@maxDist)*3)*10
        @startZoom()
        
    startZoomOut: ->
        
        @wheelInert = -(1+(@dist/@maxDist)*3)*10
        @startZoom()
    
    startZoom: -> 
        
        if not @zooming
            @animate @inertZoom
            @zooming = true
            
    stopZoom: -> 
        
        @wheelInert = 0
        @zooming = false
    
    inertZoom: (deltaSeconds) =>

        @setDistFactor 1 - clamp -0.02, 0.02, @wheelInert
        @wheelInert = reduce @wheelInert, deltaSeconds*0.3
        
        if abs(@wheelInert) > 0.00001
            @animate @inertZoom
        else
            delete @zooming
            @wheelInert = 0
    
    setDistFactor: (factor) =>
        
        @dist = clamp @minDist, @maxDist, @dist*factor
        @update()
        
    setFov: (fov) -> @fov = max(2.0, min fov, 175.0)
    
    # 000   000  00000000   0000000     0000000   000000000  00000000  
    # 000   000  000   000  000   000  000   000     000     000       
    # 000   000  00000000   000   000  000000000     000     0000000   
    # 000   000  000        000   000  000   000     000     000       
    #  0000000   000        0000000    000   000     000     00000000  
    
    update: -> 
        
        @degree = clamp -90 90 @degree
        
        @quaternion.setFromAxisAngle new Vector3(0 1 0), deg2rad @rotate

        pitchRot = new Quaternion
        pitchRot.setFromAxisAngle new Vector3(1 0 0), deg2rad @degree
        
        @quaternion.multiply pitchRot
        
        @position.copy @center
        @position.add new Vector3(0 0 @dist).applyQuaternion @quaternion
        
        prefs.set 'camera▸dist'   @dist
        prefs.set 'camera▸degree' @degree
        prefs.set 'camera▸rotate' @rotate
        
        # log "camera:", @dist, @rotate, @degree

module.exports = Camera
