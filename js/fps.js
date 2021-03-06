// koffee 1.12.0

/*
  00000000  00000000    0000000
  000       000   000  000     
  000000    00000000   0000000 
  000       000             000
  000       000        0000000
 */
var $, FPS, clamp, elem, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

ref = require('kxk'), $ = ref.$, clamp = ref.clamp, elem = ref.elem;

FPS = (function() {
    function FPS() {
        this.draw = bind(this.draw, this);
        var green, i, j, k, red, ref1, x, y;
        this.width = 180;
        this.height = 60;
        this.canvas = elem('canvas', {
            "class": 'fps',
            height: 2 * this.height,
            width: 2 * this.width
        });
        y = parseInt(-this.height / 2);
        x = parseInt(this.width / 2);
        this.canvas.style.transform = "translate3d(" + x + "px, " + y + "px, 0px) scale3d(0.5, 0.5, 1)";
        this.colors = [];
        for (i = j = 0; j <= 32; i = ++j) {
            red = parseInt(32 + (255 - 32) * clamp(0, 1, (i - 16) / 16));
            green = parseInt(32 + (255 - 32) * clamp(0, 1, (i - 32) / 32));
            this.colors.push("rgb(" + red + ", " + green + ", 32)");
        }
        this.history = [];
        for (i = k = 0, ref1 = 2 * this.width; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
            this.history[i] = 0;
        }
        this.index = 0;
        this.last = window.performance.now();
        $("#main").appendChild(this.canvas);
    }

    FPS.prototype.remove = function() {
        return this.canvas.remove();
    };

    FPS.prototype.draw = function() {
        var ctx, h, i, j, ms, ref1, time;
        time = window.performance.now();
        this.index += 1;
        if (this.index > 2 * this.width) {
            this.index = 0;
        }
        this.history[this.index] = time - this.last;
        this.canvas.height = this.canvas.height;
        ctx = this.canvas.getContext('2d');
        for (i = j = 0, ref1 = this.history.length; 0 <= ref1 ? j < ref1 : j > ref1; i = 0 <= ref1 ? ++j : --j) {
            ms = Math.max(0, this.history[i] - 17);
            ctx.fillStyle = this.colors[clamp(0, 32, parseInt(ms))];
            h = Math.min(ms, 60);
            ctx.fillRect((2 * this.width - this.index + i) % (2 * this.width), 0, 2, h);
        }
        return this.last = time;
    };

    return FPS;

})();

module.exports = FPS;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnBzLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsiZnBzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSx3QkFBQTtJQUFBOztBQVFBLE1BQXFCLE9BQUEsQ0FBUSxLQUFSLENBQXJCLEVBQUUsU0FBRixFQUFLLGlCQUFMLEVBQVk7O0FBRU47SUFFQyxhQUFBOztBQUVDLFlBQUE7UUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTO1FBQ1QsSUFBQyxDQUFBLE1BQUQsR0FBVTtRQUVWLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQSxDQUFLLFFBQUwsRUFDTjtZQUFBLENBQUEsS0FBQSxDQUFBLEVBQVEsS0FBUjtZQUNBLE1BQUEsRUFBUSxDQUFBLEdBQUUsSUFBQyxDQUFBLE1BRFg7WUFFQSxLQUFBLEVBQVEsQ0FBQSxHQUFFLElBQUMsQ0FBQSxLQUZYO1NBRE07UUFLVixDQUFBLEdBQUksUUFBQSxDQUFTLENBQUMsSUFBQyxDQUFBLE1BQUYsR0FBUyxDQUFsQjtRQUNKLENBQUEsR0FBSSxRQUFBLENBQVUsSUFBQyxDQUFBLEtBQUQsR0FBTyxDQUFqQjtRQUNKLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQWQsR0FBMEIsY0FBQSxHQUFlLENBQWYsR0FBaUIsTUFBakIsR0FBdUIsQ0FBdkIsR0FBeUI7UUFFbkQsSUFBQyxDQUFBLE1BQUQsR0FBVTtBQUNWLGFBQVMsMkJBQVQ7WUFDSSxHQUFBLEdBQVEsUUFBQSxDQUFTLEVBQUEsR0FBSyxDQUFDLEdBQUEsR0FBSSxFQUFMLENBQUEsR0FBUyxLQUFBLENBQU0sQ0FBTixFQUFRLENBQVIsRUFBVyxDQUFDLENBQUEsR0FBRSxFQUFILENBQUEsR0FBTyxFQUFsQixDQUF2QjtZQUNSLEtBQUEsR0FBUSxRQUFBLENBQVMsRUFBQSxHQUFLLENBQUMsR0FBQSxHQUFJLEVBQUwsQ0FBQSxHQUFTLEtBQUEsQ0FBTSxDQUFOLEVBQVEsQ0FBUixFQUFXLENBQUMsQ0FBQSxHQUFFLEVBQUgsQ0FBQSxHQUFPLEVBQWxCLENBQXZCO1lBQ1IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLENBQWEsTUFBQSxHQUFPLEdBQVAsR0FBVyxJQUFYLEdBQWUsS0FBZixHQUFxQixPQUFsQztBQUhKO1FBS0EsSUFBQyxDQUFBLE9BQUQsR0FBVztBQUNYLGFBQVMsNEZBQVQ7WUFDSSxJQUFDLENBQUEsT0FBUSxDQUFBLENBQUEsQ0FBVCxHQUFjO0FBRGxCO1FBRUEsSUFBQyxDQUFBLEtBQUQsR0FBUztRQUVULElBQUMsQ0FBQSxJQUFELEdBQVEsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFuQixDQUFBO1FBRVIsQ0FBQSxDQUFFLE9BQUYsQ0FBVSxDQUFDLFdBQVgsQ0FBdUIsSUFBQyxDQUFBLE1BQXhCO0lBM0JEOztrQkE2QkgsTUFBQSxHQUFRLFNBQUE7ZUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQVIsQ0FBQTtJQUFIOztrQkFRUixJQUFBLEdBQU0sU0FBQTtBQUVGLFlBQUE7UUFBQSxJQUFBLEdBQU8sTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFuQixDQUFBO1FBQ1AsSUFBQyxDQUFBLEtBQUQsSUFBVTtRQUNWLElBQUcsSUFBQyxDQUFBLEtBQUQsR0FBUyxDQUFBLEdBQUUsSUFBQyxDQUFBLEtBQWY7WUFDSSxJQUFDLENBQUEsS0FBRCxHQUFTLEVBRGI7O1FBRUEsSUFBQyxDQUFBLE9BQVEsQ0FBQSxJQUFDLENBQUEsS0FBRCxDQUFULEdBQW1CLElBQUEsR0FBSyxJQUFDLENBQUE7UUFDekIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLEdBQWlCLElBQUMsQ0FBQSxNQUFNLENBQUM7UUFDekIsR0FBQSxHQUFNLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixDQUFtQixJQUFuQjtBQUNOLGFBQVMsaUdBQVQ7WUFDSSxFQUFBLEdBQUssSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFULEVBQVksSUFBQyxDQUFBLE9BQVEsQ0FBQSxDQUFBLENBQVQsR0FBWSxFQUF4QjtZQUNMLEdBQUcsQ0FBQyxTQUFKLEdBQWdCLElBQUMsQ0FBQSxNQUFRLENBQUEsS0FBQSxDQUFNLENBQU4sRUFBUyxFQUFULEVBQWEsUUFBQSxDQUFTLEVBQVQsQ0FBYixDQUFBO1lBQ3pCLENBQUEsR0FBSSxJQUFJLENBQUMsR0FBTCxDQUFTLEVBQVQsRUFBYSxFQUFiO1lBQ0osR0FBRyxDQUFDLFFBQUosQ0FBYSxDQUFDLENBQUEsR0FBRSxJQUFDLENBQUEsS0FBSCxHQUFTLElBQUMsQ0FBQSxLQUFWLEdBQWdCLENBQWpCLENBQUEsR0FBb0IsQ0FBQyxDQUFBLEdBQUUsSUFBQyxDQUFBLEtBQUosQ0FBakMsRUFBNkMsQ0FBN0MsRUFBZ0QsQ0FBaEQsRUFBbUQsQ0FBbkQ7QUFKSjtlQUtBLElBQUMsQ0FBQSxJQUFELEdBQVE7SUFkTjs7Ozs7O0FBZ0JWLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gIDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwXG4gIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgXG4gIDAwMDAwMCAgICAwMDAwMDAwMCAgIDAwMDAwMDAgXG4gIDAwMCAgICAgICAwMDAgICAgICAgICAgICAgMDAwXG4gIDAwMCAgICAgICAwMDAgICAgICAgIDAwMDAwMDAgXG4jIyNcblxueyAkLCBjbGFtcCwgZWxlbSB9ID0gcmVxdWlyZSAna3hrJ1xuXG5jbGFzcyBGUFNcblxuICAgIEA6IC0+XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBAd2lkdGggPSAxODBcbiAgICAgICAgQGhlaWdodCA9IDYwXG4gICAgICAgIFxuICAgICAgICBAY2FudmFzID0gZWxlbSAnY2FudmFzJywgXG4gICAgICAgICAgICBjbGFzczogICdmcHMnXG4gICAgICAgICAgICBoZWlnaHQ6IDIqQGhlaWdodFxuICAgICAgICAgICAgd2lkdGg6ICAyKkB3aWR0aFxuXG4gICAgICAgIHkgPSBwYXJzZUludCAtQGhlaWdodC8yXG4gICAgICAgIHggPSBwYXJzZUludCAgQHdpZHRoLzJcbiAgICAgICAgQGNhbnZhcy5zdHlsZS50cmFuc2Zvcm0gPSBcInRyYW5zbGF0ZTNkKCN7eH1weCwgI3t5fXB4LCAwcHgpIHNjYWxlM2QoMC41LCAwLjUsIDEpXCJcbiAgICAgICAgXG4gICAgICAgIEBjb2xvcnMgPSBbXVxuICAgICAgICBmb3IgaSBpbiBbMC4uMzJdXG4gICAgICAgICAgICByZWQgICA9IHBhcnNlSW50IDMyICsgKDI1NS0zMikqY2xhbXAgMCwxLCAoaS0xNikvMTZcbiAgICAgICAgICAgIGdyZWVuID0gcGFyc2VJbnQgMzIgKyAoMjU1LTMyKSpjbGFtcCAwLDEsIChpLTMyKS8zMlxuICAgICAgICAgICAgQGNvbG9ycy5wdXNoIFwicmdiKCN7cmVkfSwgI3tncmVlbn0sIDMyKVwiXG4gICAgICAgIFxuICAgICAgICBAaGlzdG9yeSA9IFtdXG4gICAgICAgIGZvciBpIGluIFswLi4uMipAd2lkdGhdXG4gICAgICAgICAgICBAaGlzdG9yeVtpXSA9IDBcbiAgICAgICAgQGluZGV4ID0gMFxuICAgICAgICBcbiAgICAgICAgQGxhc3QgPSB3aW5kb3cucGVyZm9ybWFuY2Uubm93KClcbiAgICAgICAgICAgIFxuICAgICAgICAkKFwiI21haW5cIikuYXBwZW5kQ2hpbGQgQGNhbnZhc1xuICAgICAgICAgXG4gICAgcmVtb3ZlOiAtPiBAY2FudmFzLnJlbW92ZSgpXG4gICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMCAgICAgMDBcbiAgICAgICAgICAgICAgICBcbiAgICBkcmF3OiA9PlxuICAgICAgICBcbiAgICAgICAgdGltZSA9IHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKVxuICAgICAgICBAaW5kZXggKz0gMVxuICAgICAgICBpZiBAaW5kZXggPiAyKkB3aWR0aFxuICAgICAgICAgICAgQGluZGV4ID0gMFxuICAgICAgICBAaGlzdG9yeVtAaW5kZXhdID0gdGltZS1AbGFzdFxuICAgICAgICBAY2FudmFzLmhlaWdodCA9IEBjYW52YXMuaGVpZ2h0XG4gICAgICAgIGN0eCA9IEBjYW52YXMuZ2V0Q29udGV4dCAnMmQnICAgICAgICBcbiAgICAgICAgZm9yIGkgaW4gWzAuLi5AaGlzdG9yeS5sZW5ndGhdICBcbiAgICAgICAgICAgIG1zID0gTWF0aC5tYXggMCwgQGhpc3RvcnlbaV0tMTdcbiAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSBAY29sb3JzWyBjbGFtcCAwLCAzMiwgcGFyc2VJbnQgbXMgXVxuICAgICAgICAgICAgaCA9IE1hdGgubWluIG1zLCA2MFxuICAgICAgICAgICAgY3R4LmZpbGxSZWN0ICgyKkB3aWR0aC1AaW5kZXgraSklKDIqQHdpZHRoKSwgMCwgMiwgaFxuICAgICAgICBAbGFzdCA9IHRpbWVcblxubW9kdWxlLmV4cG9ydHMgPSBGUFNcblxuIl19
//# sourceURL=../coffee/fps.coffee