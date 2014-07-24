// Particulate.js 0.0.1
// ====================

(function () {
  var lib = {VERSION : '0.0.1'};


lib.Math = {};
lib.Math.clamp = function (min, max, v) {
  return Math.min(Math.max(v, min), max);
};

lib.Math.distanceTo = function (b0, a, b) {
  var ax = a * 3, ay = ax + 1, az = ax + 2;
  var bx = b * 3, by = bx + 1, bz = bx + 2;
  var dx = b0[ax] - b0[bx];
  var dy = b0[ay] - b0[by];
  var dz = b0[az] - b0[bz];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};


lib.Force = Force;
function Force(x, y, z, opts) {
  opts = opts || {};
  this.vec = new Float32Array(3);
  this.type = opts.type || Force.ATTRACTOR;
  if (arguments.length) { this.set(x, y, z); }
}

Force.ATTRACTOR = 0;
Force.REPULSOR = 1;
Force.ATTRACTOR_REPULSOR = 2;

Force.prototype.set = function (x, y, z) {
  var vec = this.vec;
  vec[0] = x;
  vec[1] = y;
  vec[2] = z;
};


lib.DirectionalForce = DirectionalForce;
function DirectionalForce(x, y, z) {
  lib.Force.apply(this, arguments);
}

DirectionalForce.prototype = Object.create(lib.Force.prototype);

DirectionalForce.prototype.applyForce = function (i, f0) {
  var v0 = this.vec;
  f0[i]     += v0[0];
  f0[i + 1] += v0[1];
  f0[i + 2] += v0[2];
};


lib.PointForce = PointForce;
function PointForce(x, y, z, opts) {
  opts = opts || {};
  lib.Force.apply(this, arguments);
  this.intensity = opts.intensity || 0.05;
  this.setRadius(opts.radius || 0);
}

var pf_ATTRACTOR = lib.Force.ATTRACTOR;
var pf_REPULSOR = lib.Force.REPULSOR;
var pf_ATTRACTOR_REPULSOR = lib.Force.ATTRACTOR_REPULSOR;

PointForce.prototype = Object.create(lib.Force.prototype);

PointForce.prototype.setRadius = function (r) {
  this._radius2 = r * r;
};

PointForce.prototype.applyForce = function (ix, f0, p0) {
  var v0 = this.vec;
  var iy = ix + 1;
  var iz = ix + 2;

  var dx = p0[ix] - v0[0];
  var dy = p0[iy] - v0[1];
  var dz = p0[iz] - v0[2];

  var dist = dx * dx + dy * dy + dz * dz;
  var diff = dist - this._radius2;
  var isActive, scale;

  switch (this.type) {
  case pf_ATTRACTOR:
    isActive = dist > 0 && diff > 0;
    break;
  case pf_REPULSOR:
    isActive = dist > 0 && diff < 0;
    break;
  case pf_ATTRACTOR_REPULSOR:
    isActive = dx || dy || dz;
    break;
  }

  if (isActive) {
    scale = diff / dist * this.intensity;

    f0[ix] -= dx * scale;
    f0[iy] -= dy * scale;
    f0[iz] -= dz * scale;
  }
};


lib.Constraint = Constraint;
function Constraint() {}

Constraint.setIndices = function (itemSize) {
  return function () {
    var indices = this._indices;
    for (var i = 0; i < arguments.length; i ++) {
      for (var j = 0; j < itemSize; j ++) {
        indices[i * itemSize + j] = arguments[i] * itemSize + j;
      }
    }
  };
};


lib.BoxConstraint = BoxConstraint;
function BoxConstraint(opts) {
  this._isGlobal = true;
  this.bounds = new Float32Array(6);
  this.friction = 0.05;
  if (opts.min) { this.setMin.apply(this, opts.min); }
  if (opts.max) { this.setMax.apply(this, opts.max); }
}

BoxConstraint.prototype = Object.create(lib.Constraint.prototype);

BoxConstraint.prototype.setMin = function (x, y, z) {
  var b = this.bounds;

  b[0] = x;
  b[1] = y;
  b[2] = z;
};

BoxConstraint.prototype.setMax = function (x, y, z) {
  var b = this.bounds;

  b[3] = x;
  b[4] = y;
  b[5] = z;
};

BoxConstraint.prototype.applyConstraint = function (ix, p0, p1) {
  var friction = this.friction;
  var b = this.bounds;
  var iy = ix + 1;
  var iz = ix + 2;

  var px = lib.Math.clamp(b[0], b[3], p0[ix]);
  var py = lib.Math.clamp(b[1], b[4], p0[iy]);
  var pz = lib.Math.clamp(b[2], b[5], p0[iz]);

  var dx = p0[ix] - px;
  var dy = p0[iy] - py;
  var dz = p0[iz] - pz;

  p0[ix] = px;
  p0[iy] = py;
  p0[iz] = pz;

  if (dx || dy || dz) {
    p1[ix] -= (p1[ix] - px) * friction;
    p1[iy] -= (p1[iy] - py) * friction;
    p1[iz] -= (p1[iz] - pz) * friction;
  }
};


lib.DistanceConstraint = DistanceConstraint;
function DistanceConstraint(distance, a, b) {
  this._indices = new Uint16Array(2 * 3);
  this.setDistance(distance);
  this.setIndices(a, b);
}

DistanceConstraint.prototype = Object.create(lib.Constraint.prototype);
DistanceConstraint.prototype.setIndices = lib.Constraint.setIndices(3);

DistanceConstraint.prototype.setDistance = function (distance) {
  this._distance2 = distance * distance;
};

DistanceConstraint.prototype.applyConstraint = function (p0) {
  var ii = this._indices;
  var ax = ii[0], ay = ii[1], az = ii[2];
  var bx = ii[3], by = ii[4], bz = ii[5];

  var dx = p0[bx] - p0[ax];
  var dy = p0[by] - p0[ay];
  var dz = p0[bz] - p0[az];

  var dist2 = this._distance2;
  var len2 = dx * dx + dy * dy + dz * dz;
  var diff = dist2 / (len2 + dist2) - 0.5;

  dx *= diff;
  dy *= diff;
  dz *= diff;

  p0[ax] -= dx;
  p0[ay] -= dy;
  p0[az] -= dz;

  p0[bx] += dx;
  p0[by] += dy;
  p0[bz] += dz;
};


lib.ParticleSystem = ParticleSystem;
function ParticleSystem(particles, iterations) {
  var isCount = typeof particles === 'number';
  var length = isCount ? particles * 3 : particles.length;
  var positions = isCount ? length : particles;

  this.positions = new Float32Array(positions);
  this.positionsPrev = new Float32Array(positions);
  this.accumulatedForces = new Float32Array(length);
  this.constraintIterations = iterations || 1;

  this._count = length / 3;
  this._globalConstraints = [];
  this._localConstraints = [];
  this._forces = [];
}

ParticleSystem.prototype.setPosition = function (i, x, y, z) {
  var p0 = this.positions;
  var p1 = this.positionsPrev;
  var ix = i * 3;
  var iy = ix + 1;
  var iz = ix + 2;

  p0[ix] = p1[ix] = x;
  p0[iy] = p1[iy] = y;
  p0[iz] = p1[iz] = z;
};

ParticleSystem.prototype.getDistance = function (a, b) {
  return lib.Math.distanceTo(this.positions, a, b);
};

ParticleSystem.prototype.each = function (iterator) {
  for (var i = 0, il = this._count; i < il; i ++) {
    iterator.call(this, i);
  }
};

// Verlet integration
// ------------------

function ps_integrateParticle(i, p0, p1, f0, d2) {
  var pt = p0[i];
  p0[i] += pt - p1[i] + f0[i] * d2;
  p1[i] = pt;
}

ParticleSystem.prototype.integrate = function (delta) {
  var d2 = delta * delta;
  var p0 = this.positions;
  var p1 = this.positionsPrev;
  var f0 = this.accumulatedForces;

  for (var i = 0, il = this._count * 3; i < il; i += 3) {
    ps_integrateParticle(i,     p0, p1, f0, d2);
    ps_integrateParticle(i + 1, p0, p1, f0, d2);
    ps_integrateParticle(i + 2, p0, p1, f0, d2);
  }
};

// Constraints
// -----------

ParticleSystem.prototype.addConstraint = function (constraint) {
  if (constraint._isGlobal) {
    this._globalConstraints.push(constraint);
  } else {
    this._localConstraints.push(constraint);
  }
};

ParticleSystem.prototype.satisfyConstraints = function () {
  var iterations = this.constraintIterations;
  var global = this._globalConstraints;
  var local = this._localConstraints;
  var p0 = this.positions;
  var p1 = this.positionsPrev;
  var i, il, j, jl, k;

  for (k = 0; k < iterations; k ++) {
    // Global
    for (i = 0, il = this._count * 3; i < il; i += 3) {
      for (j = 0, jl = global.length; j < jl; j ++) {
        global[j].applyConstraint(i, p0, p1);
      }
    }

    // Local
    for (i = 0, il = local.length; i < il; i ++) {
      local[i].applyConstraint(p0, p1);
    }
  }
};

// Forces
// ------

ParticleSystem.prototype.addForce = function (force) {
  this._forces.push(force);
};

ParticleSystem.prototype.accumulateForces = function (delta) {
  var forces = this._forces;
  var f0 = this.accumulatedForces;
  var p0 = this.positions;
  var p1 = this.positionsPrev;

  for (var i = 0, il = this._count * 3; i < il; i += 3) {
    f0[i] = f0[i + 1] = f0[i + 2] = 0;

    for (var j = 0, jl = forces.length; j < jl; j ++) {
      forces[j].applyForce(i, f0, p0, p1);
    }
  }
};

ParticleSystem.prototype.tick = function (delta) {
  this.accumulateForces(delta);
  this.integrate(delta);
  this.satisfyConstraints();
};


  this.Particulate = lib;
}).call(this);
