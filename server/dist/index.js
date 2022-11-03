"use strict";

require("dotenv/config");

var _express = _interopRequireDefault(require("express"));

var _cors = _interopRequireDefault(require("cors"));

var _socket = _interopRequireDefault(require("socket.io"));

var _models = _interopRequireWildcard(require("./models"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var app = (0, _express.default)();
app.use((0, _cors.default)());

_models.sequelize.sync({
  force: false
}).then(() => {
  var server = app.listen(process.env.PORT, () => console.log("\uD83D\uDC42 Chess server listening on port ".concat(process.env.PORT)));

  var io = _socket.default.listen(server);

  io.on("connection", socket => {
    console.log("\u2705 Player ".concat(socket.id, " connected"));
    socket.on("move", /*#__PURE__*/function () {
      var _ref = _asyncToGenerator(function* (msg) {
        console.log("move to game ".concat(msg.gameInfo.id));
        var {
          board,
          move
        } = msg;
        var gameId = msg.gameInfo.id;
        socket.to(gameId).emit("move", move);
        yield _models.default.Game.update({
          board
        }, {
          where: {
            id: gameId
          }
        });
      });

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }());
    socket.on("createGame", /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator(function* (msg) {
        var {
          gameId,
          userId
        } = msg;
        socket.join(gameId);
        var game = {
          id: gameId,
          board: "start",
          players: {}
        };
        game.players[userId] = "white";
        game.players = JSON.stringify(game.players);
        yield _models.default.Game.create(game);
      });

      return function (_x2) {
        return _ref2.apply(this, arguments);
      };
    }());

    var joinGame = /*#__PURE__*/function () {
      var _ref3 = _asyncToGenerator(function* (game, userId) {
        socket.join(game.id); //Check if this player has joined this game before

        if (!game.players.hasOwnProperty(userId)) {
          game.players[userId] = "black";
        }

        io.in(game.id).emit("startGame", game);
      });

      return function joinGame(_x3, _x4) {
        return _ref3.apply(this, arguments);
      };
    }();

    socket.on("joinGame", /*#__PURE__*/function () {
      var _ref4 = _asyncToGenerator(function* (msg) {
        var {
          gameId,
          userId
        } = msg;
        var game = yield _models.default.Game.findOne({
          where: {
            id: gameId
          }
        });

        if (game !== null) {
          game.players = JSON.parse(game.players);
          joinGame(game, userId);
        } else {
          io.to(socket.id).emit("joinError", "No such game exists or has already ended");
        }
      });

      return function (_x5) {
        return _ref4.apply(this, arguments);
      };
    }());
    socket.on("resignFromTheGame", /*#__PURE__*/function () {
      var _ref5 = _asyncToGenerator(function* (gameInfo) {
        var gameId = gameInfo.id;
        console.log("Ending game ".concat(gameId));
        io.in(gameId).emit("endGame");
        yield _models.default.Game.destroy({
          where: {
            id: gameId
          }
        });
      });

      return function (_x6) {
        return _ref5.apply(this, arguments);
      };
    }());
    socket.on("disconnect", () => {
      console.log("\uD83C\uDFAE \uD83D\uDEABPlayer disconnected");
    });
  });
});