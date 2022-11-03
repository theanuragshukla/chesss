"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.sequelize = void 0;

var _sequelize = require("sequelize");

var _game = _interopRequireDefault(require("./game"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var sequelize = new _sequelize.Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  ssl: true,
  protocol: "postgres",
  logging: true,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});
exports.sequelize = sequelize;

var testDatabaseConnection = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* () {
    try {
      yield sequelize.authenticate();
      console.log("Connection has been established successfully.");
    } catch (error) {
      console.error("Unable to connect to the database:", error);
    }
  });

  return function testDatabaseConnection() {
    return _ref.apply(this, arguments);
  };
}();

testDatabaseConnection();
var models = {
  Game: (0, _game.default)(sequelize, _sequelize.DataTypes)
};
var _default = models;
exports.default = _default;