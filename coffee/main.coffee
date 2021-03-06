###
00     00   0000000   000  000   000
000   000  000   000  000  0000  000
000000000  000000000  000  000 0 000
000 0 000  000   000  000  000  0000
000   000  000   000  000  000   000
###

{ app, args } = require 'kxk'

class Main extends app

    @: ->
        
        super
            dir:            __dirname
            pkg:            require '../package.json'
            index:          'index.html'
            icon:           '../img/app.ico'
            about:          '../img/about.png'
            prefsSeperator: '▸'
            width:          1024
            height:         768
            minWidth:       300
            minHeight:      300
            
        args.watch    = true
        args.devtools = true
                                
new Main