// Generated by CoffeeScript 2.0.0-alpha1
(function() {
  'use strict';
  var Set, Sets, fs, sqlite, sqliteSync;

  sqlite = require('sqlite3');

  sqliteSync = require('better-sqlite3');

  fs = require('fs');

  Set = class Set {
    constructor(number, name, parent) {
      this.number = number;
      this.name = name;
      this.parent = parent;
      this.ids = null;
    }

    includes(card) {
      var id, ref;
      id = (ref = Number.isInteger(card)) != null ? ref : {
        card: card.id
      };
      if (!this.ids) {
        this.ids = this.parent.searchSetByNumber(this.number);
      }
      return this.ids.includes(id);
    }

    includesAsync(card, callback) {
      var id, ref, set;
      id = (ref = Number.isInteger(card)) != null ? ref : {
        card: card.id
      };
      if (this.ids) {
        callback(this.ids.includes(id));
      }
      set = this;
      this.parent.searchSetByNumberAsync(this.number, function(ids) {
        set.ids = ids;
        return callback(set.ids.includes(id));
      });
      return 0;
    }

  };

  Sets = (function() {
    class Sets {
      constructor(locale) {
        var db, strings;
        db = Sets.localePath + locale + "/cards.cdb";
        strings = Sets.localePath + locale + "/strings.conf";
        this.db = new sqlite.Database(db);
        this.dbSync = new sqliteSync(db);
        this.sets = [];
        this.loadStringsFile(strings);
        Sets[locale] = this;
      }

      loadStringsFile(filePath) {
        return this.loadStrings(fs.readFileSync(filePath).toString());
      }

      loadStrings(stringFile) {
        var i, len, line, lines, name, number, ref;
        lines = stringFile.split("\n");
        for (i = 0, len = lines.length; i < len; i++) {
          line = lines[i];
          if (!line.startsWith('!setname ')) {
            continue;
          }
          ref = this.loadStringLines(line), number = ref[0], name = ref[1];
          if (number > 0) {
            this.sets.push(new Set(number, name, this));
          }
        }
        return 0;
      }

      loadStringLines(line) {
        var answer, reg;
        reg = /!setname 0x([0-9a-fA-F]+) (.+)/;
        answer = line.match(reg);
        if (answer === null) {
          return [0, '', ''];
        }
        return [parseInt(answer[1], 16), answer[2]];
      }

      static sqlForNum(number) {
        if (number > 255) {
          return Sets.SqlQuerySubset;
        } else {
          return Sets.SqlQuerySet;
        }
      }

      searchSetByNumber(number) {
        var i, ids, len, row, rows, stmt;
        stmt = this.dbSync.prepare(Sets.sqlForNum(number));
        console.log(number);
        rows = stmt.all(number, number, number, number);
        if (rows) {
          ids = [];
          console.log(rows);
          for (i = 0, len = rows.length; i < len; i++) {
            row = rows[i];
            ids.push(row.id);
          }
          return ids;
        } else {
          console.log(`no card with set number [${number}]`);
          return [];
        }
      }

      searchSetByNumberAsync(number, callback) {
        var stmt;
        stmt = this.db.prepare(Sets.sqlForNum(number));
        stmt.run(number, number, number, number);
        return stmt.all(this.onSqlRead.bind({
          callback: callback,
          stmt: stmt,
          number: number
        }));
      }

      onSqlRead(err, rows) {
        var i, ids, len, row;
        if (err) {
          console.log(`sql query failed: ${err}`);
          this.callback(null);
        } else if (rows.length === 0) {
          console.log(`no card with set number [${this.number}]`);
          this.callback([]);
        } else {
          ids = [];
          for (i = 0, len = rows.length; i < len; i++) {
            row = rows[i];
            ids.push(row.id);
          }
          this.callback(ids);
        }
        return this.stmt.finalize();
      }

    };

    Sets.SqlQuerySet = 'select id from datas where (setcode & 0x0000000000000FFF == (?) or setcode & 0x000000000FFF0000 == (?) or setcode & 0x00000FFF00000000 == (?) or setcode & 0x0FFF000000000000 == (?))';

    Sets.SqlQuerySubset = 'select id from datas where (setcode & 0x000000000000FFFF == (?) or setcode & 0x00000000FFFF0000 == (?) or setcode & 0x0000FFFF00000000 == (?) or setcode & 0xFFFF000000000000 == (?))';

    Sets.localePath = "./ygopro-database/locales/";

    return Sets;

  })();

  module.exports = Sets;

}).call(this);

//# sourceMappingURL=Set.js.map
