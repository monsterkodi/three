// koffee 1.12.0

/*
00     00   0000000   000  000   000
000   000  000   000  000  0000  000
000000000  000000000  000  000 0 000
000 0 000  000   000  000  000  0000
000   000  000   000  000  000   000
 */
var Main, app, args, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), app = ref.app, args = ref.args;

Main = (function(superClass) {
    extend(Main, superClass);

    function Main() {
        Main.__super__.constructor.call(this, {
            dir: __dirname,
            pkg: require('../package.json'),
            index: 'index.html',
            icon: '../img/app.ico',
            about: '../img/about.png',
            prefsSeperator: '▸',
            width: 1024,
            height: 768,
            minWidth: 300,
            minHeight: 300
        });
        args.watch = true;
        args.devtools = true;
    }

    return Main;

})(app);

new Main;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbIm1haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLG9CQUFBO0lBQUE7OztBQVFBLE1BQWdCLE9BQUEsQ0FBUSxLQUFSLENBQWhCLEVBQUUsYUFBRixFQUFPOztBQUVEOzs7SUFFQyxjQUFBO1FBRUMsc0NBQ0k7WUFBQSxHQUFBLEVBQWdCLFNBQWhCO1lBQ0EsR0FBQSxFQUFnQixPQUFBLENBQVEsaUJBQVIsQ0FEaEI7WUFFQSxLQUFBLEVBQWdCLFlBRmhCO1lBR0EsSUFBQSxFQUFnQixnQkFIaEI7WUFJQSxLQUFBLEVBQWdCLGtCQUpoQjtZQUtBLGNBQUEsRUFBZ0IsR0FMaEI7WUFNQSxLQUFBLEVBQWdCLElBTmhCO1lBT0EsTUFBQSxFQUFnQixHQVBoQjtZQVFBLFFBQUEsRUFBZ0IsR0FSaEI7WUFTQSxTQUFBLEVBQWdCLEdBVGhCO1NBREo7UUFZQSxJQUFJLENBQUMsS0FBTCxHQUFnQjtRQUNoQixJQUFJLENBQUMsUUFBTCxHQUFnQjtJQWZqQjs7OztHQUZZOztBQW1CbkIsSUFBSSIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDBcbjAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMFxuMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDBcbiMjI1xuXG57IGFwcCwgYXJncyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5jbGFzcyBNYWluIGV4dGVuZHMgYXBwXG5cbiAgICBAOiAtPlxuICAgICAgICBcbiAgICAgICAgc3VwZXJcbiAgICAgICAgICAgIGRpcjogICAgICAgICAgICBfX2Rpcm5hbWVcbiAgICAgICAgICAgIHBrZzogICAgICAgICAgICByZXF1aXJlICcuLi9wYWNrYWdlLmpzb24nXG4gICAgICAgICAgICBpbmRleDogICAgICAgICAgJ2luZGV4Lmh0bWwnXG4gICAgICAgICAgICBpY29uOiAgICAgICAgICAgJy4uL2ltZy9hcHAuaWNvJ1xuICAgICAgICAgICAgYWJvdXQ6ICAgICAgICAgICcuLi9pbWcvYWJvdXQucG5nJ1xuICAgICAgICAgICAgcHJlZnNTZXBlcmF0b3I6ICfilrgnXG4gICAgICAgICAgICB3aWR0aDogICAgICAgICAgMTAyNFxuICAgICAgICAgICAgaGVpZ2h0OiAgICAgICAgIDc2OFxuICAgICAgICAgICAgbWluV2lkdGg6ICAgICAgIDMwMFxuICAgICAgICAgICAgbWluSGVpZ2h0OiAgICAgIDMwMFxuICAgICAgICAgICAgXG4gICAgICAgIGFyZ3Mud2F0Y2ggICAgPSB0cnVlXG4gICAgICAgIGFyZ3MuZGV2dG9vbHMgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxubmV3IE1haW4iXX0=
//# sourceURL=../coffee/main.coffee