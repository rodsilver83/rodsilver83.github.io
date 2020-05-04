import { Component, AfterViewInit, HostListener } from '@angular/core';
import { timer } from 'rxjs';

export enum SECTIONS {
  NONE,
  HOME,
  ABOUT,
  SKILLS,
  PORTFOLIO,
  CONTACT
}

export enum PORTFOLIO {
  BPG,
  INTERNEWS,
  AMAZEN,
  V147
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements AfterViewInit {
  public canvas: any;
  public context: any;
  public particles = [];
  public dots: number;
  public CONST_VX = -0.0;
  public T = 0;
  public MAX_VEL = 0.5;
  public MIN_VEL = 0.21;
  public MAX_DISTANCE = 250;//px
  public WINDOW_OFFSET = 50;//px
  public CONST_VY = -0.4;
  public MAX_CONST_VX = -0.0;
  public DOT_COLOR = "#c2dcda";
  public START_GRADIENT = "#1669b2";
  public END_GRADIENT = "#121e39";
  public INIT_SIZE_DOT = 0;
  public DOT_GROW_SIZE = 0.04;
  public DOT_MAX_SIZE = 100;
  public FILL_DOT = false;
  public SECTIONS = SECTIONS;
  public PORTFOLIO = PORTFOLIO;
  public visibleSection: SECTIONS = SECTIONS.NONE;
  public visiblePortfolio: PORTFOLIO = PORTFOLIO.AMAZEN;

  private interval: any;
  private intervalCount = -200;


  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeCanvas();
  }

  ngAfterViewInit() {
    this.canvas = document.getElementById("canvas-element");
    this.resizeCanvas();
    this.context = this.canvas.getContext("2d");

    this.particles = [];
    this.dots = Math.floor(window.innerWidth / 40);

    // if(window.innerWidth >= 992){
    this.initCanvas();
    // }

    timer(2500).subscribe(() => this.setSection(SECTIONS.HOME));
  }

  setSection(section: SECTIONS) {
    // TODO: Change background color for every section.
    this.visibleSection = section;
  }

  apply() {
    window.clearInterval(this.interval);
    this.particles = [];
    this.dots = Math.floor(window.innerWidth / 20);
    this.initCanvas();
  }

  speedParticlesX() {
    this.T += 20;
    var ease = this.easeInOutQuad(this.T, 0, 1, 2000);
    if (ease < 0) {
      // this.clearInterval(goAboutInterval);
      this.CONST_VX = 0;
    } else {
      this.CONST_VX = ease * this.MAX_CONST_VX;
    }
  }
  /**
   *
   * @param t current Time
   * @param b start Value
   * @param c change in value
   * @param d duration
   * @returns {*}
   */
  easeInOutQuad(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  }

  easeInQuad(t, b, c, d) {
    t /= d;
    return c * t * t + b;
  }

  initCanvas() {
    for (var i = 0; i < this.dots; i++) {
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: this.randomVelX(i),
        vy: this.randomVelY(i),
        size: this.INIT_SIZE_DOT,
        color: this.DOT_COLOR,
        alpha: 0,
        visible: false,
        id: 0
      });
    }

    this.interval = setInterval(() => {
      if (this.context) {
        this.context.clearRect(0, 0, window.innerWidth, window.innerHeight);
        this.fillCanvasGradient();
        for (let i = 0; i < this.particles.length; i++) {
          if (this.particles[i].size > this.DOT_MAX_SIZE) {
            this.particles[i].size = this.INIT_SIZE_DOT;
          }
          this.particles[i].id = i;
          if (Math.floor(this.intervalCount / 300) === i && !this.particles[i].visible) {
            this.particles[i].visible = true;
            this.particles[i].size = this.INIT_SIZE_DOT;
          }
          this.calculateLines(i);
          this.moveParticles(i);
          if (this.particles[i].visible) {
            this.drawDot(this.particles[i]);
          }
        }
      }
      if (this.intervalCount < this.particles.length * 300) {
        this.intervalCount += 10;
      }
    }, 20);
  }

  randomVelX(i) {
    if (i % 4 == 0) {
      return -Math.random() * this.MAX_VEL - this.MIN_VEL;
    }
    if (i % 4 == 1) {
      return Math.random() * this.MAX_VEL + this.MIN_VEL;
    }
    return 0.0;
  }

  randomVelY(i) {
    if (i % 4 == 2) {
      return -Math.random() * this.MAX_VEL - this.MIN_VEL;
    }
    if (i % 4 == 3) {
      return Math.random() * this.MAX_VEL + this.MIN_VEL;
    }
    return 0.0;
  }

  fillCanvasGradient() {
    // Create gradient
    let grd = this.context.createLinearGradient(0, 0, 0, window.innerHeight);
    grd.addColorStop(0, this.START_GRADIENT);
    grd.addColorStop(1, this.END_GRADIENT);

    // Fill with gradient
    this.context.fillStyle = grd;
    this.context.fillRect(0, 0, window.innerWidth, window.innerHeight);
  }

  calculateLines(i) {
    for (let j = i + 1; j < this.particles.length; j++) {
      var distance = this.distanceBetweenDots(this.particles[i], this.particles[j]);
      if (distance < this.MAX_DISTANCE) {
        this.particles[i].size += this.DOT_GROW_SIZE;
        this.particles[j].size += this.DOT_GROW_SIZE;
        this.particles[i].alpha = this.calculateAlpha(distance);
        this.drawLine(this.particles[i], this.particles[j]);
      }
    }
  }

  hexToRGBA(hex, opacity) {
    return 'rgba(' + (hex = hex.replace('#', '')).match(new RegExp('(.{' + hex.length / 3 + '})', 'g')).map(function (l) { return parseInt(hex.length % 2 ? l + l : l, 16) }).concat(opacity || 1).join(',') + ')';
  }

  calculateAlpha(distance) {
    let alpha = 1.1 - (distance / this.MAX_DISTANCE);
    return alpha;
  }

  drawLine(p1, p2) {
    // this.context.strokeStyle = this.DOT_COLOR;

    this.context.beginPath();
    this.context.moveTo(p1.x, p1.y);
    this.context.strokeStyle = this.hexToRGBA(this.DOT_COLOR, p1.alpha);
    this.context.lineTo(p2.x, p2.y);
    this.context.stroke();
    this.context.closePath();

    //Test Alpha
    //testLineAlpha(p1,p2,alpha);
  }

  testLineAlpha(p1, p2, alpha) {
    this.context.font = "15px Arial";
    this.context.fillStyle = "rgba(42, 79, 110, " + alpha + ")";
    this.context.fillText(alpha, p1.x + ((p2.x - p1.x) / 2), p1.y + ((p2.y - p1.y) / 2));
  }

  distanceBetweenDots(p1, p2) {
    var dx = 0;
    if (p1.x > p2.x) {
      dx = p1.x - p2.x;
    } else {
      dx = p2.x - p1.x;
    }
    var dy = 0;
    if (p1.y > p2.y) {
      dy = p1.y - p2.y;
    } else {
      dy = p2.y - p1.y;
    }
    return Math.sqrt(dx * dx + dy * dy);
  }

  moveParticles(i) {
    this.particles[i].y += this.particles[i].vy + this.CONST_VY;
    this.particles[i].x += this.particles[i].vx + this.CONST_VX;

    if (this.particles[i].x > window.innerWidth + this.WINDOW_OFFSET) {
      this.particles[i].x = - this.WINDOW_OFFSET;
    }

    if (this.particles[i].x < -this.WINDOW_OFFSET) {
      this.particles[i].x = window.innerWidth + this.WINDOW_OFFSET;
    }

    if (this.particles[i].y > window.innerHeight + this.WINDOW_OFFSET) {
      this.particles[i].y = - this.WINDOW_OFFSET;
    }

    if (this.particles[i].y < - this.WINDOW_OFFSET) {
      this.particles[i].y = window.innerHeight + this.WINDOW_OFFSET;
    }
  }

  drawDot(dot) {
    let alpha = 1 - ((dot.size) / this.DOT_MAX_SIZE);
    this.context.strokeStyle = this.hexToRGBA(this.DOT_COLOR, alpha);
    this.context.beginPath();
    this.context.arc(dot.x, dot.y, dot.size, 0, 2 * Math.PI);
    this.context.stroke();
    this.context.closePath();

    this.context.fillStyle = this.DOT_COLOR;
    this.context.beginPath();
    this.context.arc(dot.x, dot.y, 2, 0, 2 * Math.PI);
    this.context.closePath();
    this.context.fill();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

}

