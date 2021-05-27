(function () {
    self.Board = function (width, height) {
        this.width = width;
        this.height = height;
        this.playing = false;
        this.game_over = false;
        this.bars = [];
        this.ball = null;
    }


    self.Board.prototype = {
        get elements() {
            var elements = this.bars.map(function(bar){ return bar;});
            elements.push(this.ball);
            return elements;
        }
    }
})();

(function () {
    self.Ball = function (x, y, radius, board) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed_y = 0;
        this.speed_x = 2;
        this.board = board;
        this.direction = 1;
        this.bounceAngle = 0;
        this.maxBounceAngle = Math.PI / 12;
        this.speed = 3;

        board.ball = this;
        this.kind = "circle";
    }
    self.Ball.prototype = {
        move: function () {
            this.x += (this.speed_x * this.direction);
            this.y += (this.speed_y);
        },
        get width() {
            return this.radius * 2;
        },
        get height() {
            return this.radius * 2;
        },
        collision: function (bar) {
            //reacciona a colisiones
            var relativeIntersectY = (bar.y + (bar.height / 2)) - this.y;
            var normalizedIntersectY = relativeIntersectY / (bar.height / 2);
            this.bounceAngle = normalizedIntersectY * this.maxBounceAngle;

            this.speed_y = this.speed * -Math.sin(this.bounceAngle);
            this.speed_x = this.speed * Math.cos(this.bounceAngle);

            if (this.x > (this.board.width / 2)) {
                this.direction = -1;
            } else {
                this.direction = 1;
            }

        }
    }
})();

(function () {
    self.Bar = function (x, y, width, height, board) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.board = board;
        this.board.bars.push(this);
        this.kind = "rectangle";
        this.speed = 20;
    }

    self.Bar.prototype = {
        down: function () {
            this.y += this.speed;
        },
        up: function () {
            this.y -= this.speed;
        },
        toString: function () {
            return "x: " + this.x + " y: " + this.y;
        }
    }
})();


(function () {
    self.BoardView = function (canvas, board) {
        this.canvas = canvas;
        this.canvas.width = board.width;
        this.canvas.height = board.height;
        this.board = board;
        this.ctx = canvas.getContext("2d");
    }

    self.BoardView.prototype = {
        clean: function () {
            this.ctx.clearRect(0, 0, this.board.width, this.board.height)
        },
        draw : function() {
            for (var i = this.board.elements.length - 1; i>= 0; i--) {
                var el = this.board.elements[i];

                draw(this.ctx,el);
            };
        },

        checkCollisions: function () {
            for (var i = this.board.bars.length - 1; i >= 0; i--) {
                if (hit(this.board.bars[i], this.board.ball)) {
                    this.board.ball.collision(bar);
                }
            };
            if(this.board.ball.y <= 0){
                this.board.ball.speed_y = this.board.ball.speed_y * -1;
            }
            if(this.board.ball.y >= 500){
                this.board.ball.speed_y = this.board.ball.speed_y * -1;
            }
        },

        play: function () {
            if (this.board.playing) {
                this.clean();
                this.draw();
                this.checkCollisions();
                this.board.ball.move();
            }
            
        }
    }

    function hit(a, b) {
        var hit = false;
        if (b.x + b.width >= a.x && b.x < a.x + a.width) {

            if (b.y + b.height >= a.y && b.y < a.y + a.height)
                hit = true;
        }
        if (b.x <= a.x && b.x + b.width >= a.x + a.width) {
            if (b.y <= + a.y && b.y + b.height >= a.y + a.height)
                hit = true;
        }
        if (a.x <= b.x && a.x + a.width >= b.x + b.width) {
            if (a.y <= b.y && a.y + a.height >= b.y + b.height)
                hit = true;
        }
        return hit;
    }

    function draw(ctx,element) {
      
            switch(element.kind) {
  
                case "rectangle":
                   ctx.fillRect(element.x,element.y,element.width,element.height);
                   break;

                   case "circle":
                    ctx.beginPath();
                    ctx.arc(element.x, element.y, element.radius, 0, 7);
                    ctx.fill();
                    ctx.closePath();
                    break;
            }
        }
    
})();

var board = new Board(800, 400);
var bar = new Bar(20, 100, 40, 100, board);
var bar2 = new Bar(735, 100, 40, 100, board);
var canvas = document.getElementById('canvas');
var board_view = new BoardView(canvas, board);
var ball = new Ball(350, 100, 10, board);

document.addEventListener("keydown", function (ev) {

    if (ev.keyCode == 38) {
        ev.preventDefault();       
        bar2.up();
        
    } else if (ev.keyCode == 40) {
        ev.preventDefault();
        bar2.down();
    } else if (ev.keyCode == 87) {
        ev.preventDefault();
        bar.up();
    } else if (ev.keyCode == 83) {
        ev.preventDefault();
        bar.down();
    } else if (ev.keyCode === 32) {
        ev.preventDefault();
        board.playing = !board.playing;
    }
});

board_view.draw();
window.requestAnimationFrame(controller);


function controller() {
    board_view.play();
    window.requestAnimationFrame(controller);
}
